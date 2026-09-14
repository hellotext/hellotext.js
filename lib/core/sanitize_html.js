import DOMPurify from 'dompurify';
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
  const fragment = DOMPurify.sanitize(html, options);
  fragment.querySelectorAll('a[target="_blank"]').forEach(link => {
    const rel = new Set(link.rel.split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.rel = Array.from(rel).join(' ');
  });
  return fragment;
}
export function sanitizedRichTextFragment(html) {
  return sanitizedFragment(html, RICH_TEXT_SANITIZER_OPTIONS);
}
export function sanitizedWebchatComponentFragment(html) {
  return sanitizedFragment(html, WEBCHAT_COMPONENT_SANITIZER_OPTIONS);
}
export function setSanitizedRichText(element, html) {
  element.replaceChildren(sanitizedRichTextFragment(html));
}