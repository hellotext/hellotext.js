import { Controller } from '@hotwired/stimulus';
import Hellotext from '../hellotext';
import { Form } from '../models';
import FormsAPI from '../api/forms';
import { Configuration } from '../core';
export default class extends Controller {
  static values = {
    data: Object,
    step: {
      type: Number,
      default: 1
    }
  };
  static targets = ['inputContainer', 'input', 'button', 'otpContainer'];
  initialize() {
    this.form = new Form(this.dataValue, this.element);
    this.onInput = this.trackStart.bind(this);
  }
  connect() {
    super.connect();
    this.element.addEventListener('submit', this.submit.bind(this));
    this.element.addEventListener('input', this.onInput);
    if (document.activeElement.tagName !== 'INPUT') {
      this.inputTargets[0].focus();
    }
  }
  disconnect() {
    this.element.removeEventListener('input', this.onInput);
  }

  // Reports the first input once per session, form and day, which is how the
  // website form report counts the visitors who started filling it in. Focus
  // alone doesn't count: the form focuses its first input when it connects. A
  // failed report is sent again on the next input.
  async trackStart() {
    if (this.trackingStart) return;
    const key = `hellotext--form--${this.form.id}--tracked-start`;
    const marker = `${Hellotext.session}:${this.localDate}`;
    if (Hellotext.readStorage('localStorage', key) === marker) return;
    this.trackingStart = true;
    try {
      const response = await Hellotext.track('form.started', {
        form_id: this.form.id,
        tracked_at: new Date().toISOString()
      });
      if (response?.succeeded) Hellotext.writeStorage('localStorage', key, marker);
    } catch (_) {
      // Tracking must never break the form.
    } finally {
      this.trackingStart = false;
    }
  }
  get localDate() {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(part => String(part).padStart(2, '0')).join('-');
  }
  async submit(e) {
    e.preventDefault();
    if (this.invalid) {
      return this.showErrorMessages();
    }
    this.clearErrorMessages();
    this.formData = Object.fromEntries(new FormData(this.element));
    this.buttonTarget.disabled = true;
    const response = await FormsAPI.submit(this.form.id, this.formData);
    this.buttonTarget.disabled = false;
    const data = await response.json();
    if (response.failed) {
      data.errors.forEach(error => {
        const {
          type,
          parameter
        } = error;
        const input = this.inputTargets.find(input => input.name === parameter);
        input.setCustomValidity(Hellotext.business.locale.errors[type]);
        input.reportValidity();
        input.addEventListener('input', () => {
          input.setCustomValidity('');
          input.reportValidity();
        });
      });
      return this.showErrorMessages();
    }
    this.buttonTarget.style.display = 'none';
    this.element.querySelectorAll('input').forEach(input => input.disabled = true);
    this.completed();
  }
  completed() {
    this.form.markAsCompleted(this.formData);
    if (!Configuration.forms.shouldShowSuccessMessage) {
      return this.element.remove();
    }
    if (typeof Configuration.forms.successMessage === 'string') {
      this.element.innerHTML = Configuration.forms.successMessage;
    } else {
      this.element.innerHTML = Hellotext.business.locale.forms[this.form.localeAuthKey];
    }
  }

  // private

  showErrorMessages() {
    this.inputTargets.forEach(input => {
      const errorsContainer = input.closest('article').querySelector('[data-error-container]');
      if (input.validity.valid) {
        errorsContainer.innerText = '';
      } else {
        errorsContainer.innerText = input.validationMessage;
      }
    });
  }
  clearErrorMessages() {
    this.inputTargets.forEach(input => {
      input.setCustomValidity('');
      input.closest('article').querySelector('[data-error-container]').innerText = '';
    });
  }
  inputTargetConnected(target) {
    if (target.getAttribute('data-default-value')) {
      target.value = target.getAttribute('data-default-value');
    }
  }
  get requiredInputs() {
    return this.inputTargets.filter(input => input.required);
  }
  get invalid() {
    return !this.element.checkValidity();
  }
}