/* ============================================
   Kiwi Church - Static-side HTML sanitiser
   Mirrors the portal's KetePostPage DOMPurify config:
   allows YouTube/Vimeo iframes only, strips everything else.
   Exposes window.KCSanitize.{sanitizeHtml, escapeText, safeUrl}.
   Requires DOMPurify loaded before this file (CDN).
   ============================================ */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;
  if (!window.DOMPurify) {
    // Fail loud rather than silently render unsanitised HTML.
    console.error('[KCSanitize] DOMPurify is missing. Kete content will not render.');
  }

  var ALLOWED_IFRAME_HOSTS = [
    'https://www.youtube.com/embed/',
    'https://player.vimeo.com/video/',
  ];

  if (window.DOMPurify && !window.DOMPurify.__keteHookInstalled) {
    window.DOMPurify.__keteHookInstalled = true;
    window.DOMPurify.addHook('uponSanitizeElement', function (node, data) {
      if (data.tagName === 'iframe') {
        var src = node.getAttribute('src') || '';
        var ok = ALLOWED_IFRAME_HOSTS.some(function (prefix) {
          return src.indexOf(prefix) === 0;
        });
        if (!ok && node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    });
  }

  var SANITIZE_CONFIG = {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'src', 'width', 'height'],
  };

  // Sanitise rich HTML (post body content). Strips scripts, event handlers,
  // and any iframe that isn't from the YouTube/Vimeo allowlist.
  function sanitizeHtml(html) {
    if (html == null) return '';
    if (!window.DOMPurify) return '';
    return window.DOMPurify.sanitize(String(html), SANITIZE_CONFIG);
  }

  // Escape text fields (post.title, excerpt, authorName, attachment names).
  // For values that go into HTML body or attributes — anywhere a string
  // gets interpolated into a template literal.
  function escapeText(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Validate a URL is http(s) before interpolating it into href/src/url().
  // Returns '' if the URL is not a safe absolute URL — kills javascript:,
  // data:, vbscript: and CSS url() escape-out attempts via quotes/parens.
  function safeUrl(u) {
    if (u == null) return '';
    var s = String(u).trim();
    if (!s) return '';
    if (s.indexOf("'") !== -1 || s.indexOf('"') !== -1 || s.indexOf('(') !== -1 || s.indexOf(')') !== -1) return '';
    if (/^https?:\/\//i.test(s) || /^\//.test(s)) return s;
    return '';
  }

  window.KCSanitize = {
    sanitizeHtml: sanitizeHtml,
    escapeText: escapeText,
    safeUrl: safeUrl,
  };
})();
