import Hellotext from '../hellotext'

class OTPBuilder {
  static build(submissionId, label) {
    const element = this.#template(submissionId, label)
    const container = document.createElement('div')

    container.innerHTML = element

    return container
  }

  static #template(submissionId, label) {
    return `
      <article 
        data-controller="hellotext--otp" 
        data-hellotext--otp-submission-id-value="${submissionId}"
        data-hellotext--form-target="otpContainer"
        data-form-otp
        >
        <header data-otp-header>
          <p>${label}</p>
          <input 
            type="text"
            name="otp"
            data-hellotext--otp-target="input"
            placeholder="${Hellotext.business.locale.otp.placeholder}"
            maxlength="6"
            />
        </header>
        
        <footer data-otp-footer>
          <button type="button" data-hellotext--otp-target="submitButton" data-action="hellotext--otp#submit">
            ${Hellotext.business.locale.otp.submit}
          </button>
          
          <button type="button" data-hellotext--otp-target="resendButton" data-action="hellotext--otp#resend">
            ${Hellotext.business.locale.otp.resend}
          </button>
        </footer>
      </article>
    `
  }
}

export { OTPBuilder }
