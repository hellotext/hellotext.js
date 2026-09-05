"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizedRichTextFragment = sanitizedRichTextFragment;
exports.sanitizedWebchatComponentFragment = sanitizedWebchatComponentFragment;
exports.setSanitizedRichText = setSanitizedRichText;
var _dompurify = _interopRequireDefault(require("dompurify"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const RICH_TEXT_SANITIZER_OPTIONS = {
  ADD_ATTR: ['target'],
  ALLOW_DATA_ATTR: false,
  RETURN_DOM_FRAGMENT: true,
  USE_PROFILES: {
    html: true
  }
};
const WEBCHAT_COMPONENT_SANITIZER_OPTIONS = {
  ADD_ATTR: ['target'],
  ADD_TAGS: ['hellotext-icon'],
  RETURN_DOM_FRAGMENT: true,
  USE_PROFILES: {
    html: true,
    svg: true
  }
};
function sanitizedFragment(html, options) {
  const fragment = _dompurify.default.sanitize(html, options);
  fragment.querySelectorAll('a[target="_blank"]').forEach(link => {
    const rel = new Set(link.rel.split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.rel = Array.from(rel).join(' ');
  });
  return fragment;
}
function sanitizedRichTextFragment(html) {
  return sanitizedFragment(html, RICH_TEXT_SANITIZER_OPTIONS);
}
function sanitizedWebchatComponentFragment(html) {
  return sanitizedFragment(html, WEBCHAT_COMPONENT_SANITIZER_OPTIONS);
}
function setSanitizedRichText(element, html) {
  element.replaceChildren(sanitizedRichTextFragment(html));
}