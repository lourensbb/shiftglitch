(function () {
  var CONSENT_KEY = 'sg_consent';

  function updateConsent(granted) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  }

  var stored = localStorage.getItem(CONSENT_KEY);
  if (stored) {
    updateConsent(stored === 'granted');
    return;
  }

  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'sg-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Analytics consent');
    banner.setAttribute('aria-modal', 'false');
    banner.innerHTML = [
      '<style>',
      '#sg-consent-banner{position:fixed;bottom:0;left:0;right:0;z-index:99999;',
      'background:#0a0a0a;border-top:1px solid rgba(57,255,20,0.25);',
      'padding:0.85rem 1.5rem;display:flex;align-items:center;',
      'justify-content:space-between;gap:1rem;flex-wrap:wrap;',
      'font-family:"Share Tech Mono",monospace,sans-serif;font-size:0.75rem;',
      'color:rgba(255,255,255,0.6);box-sizing:border-box;}',
      '#sg-consent-banner p{margin:0;flex:1;min-width:200px;line-height:1.5;}',
      '#sg-consent-banner .sg-label{color:#39FF14;margin-right:0.4rem;}',
      '#sg-consent-banner a{color:rgba(57,255,20,0.6);text-decoration:none;}',
      '#sg-consent-banner a:hover{color:#39FF14;}',
      '.sg-consent-btns{display:flex;gap:0.6rem;flex-shrink:0;}',
      '.sg-consent-btn{background:transparent;border:1px solid rgba(57,255,20,0.4);',
      'color:#39FF14;font-family:"Share Tech Mono",monospace;font-size:0.72rem;',
      'padding:0.35rem 0.9rem;cursor:pointer;letter-spacing:0.05em;',
      'transition:background 0.15s;line-height:1;}',
      '.sg-consent-btn:hover{background:rgba(57,255,20,0.1);}',
      '.sg-consent-btn:focus-visible{outline:1px solid #39FF14;outline-offset:2px;}',
      '.sg-consent-btn.sg-decline{border-color:rgba(255,255,255,0.12);',
      'color:rgba(255,255,255,0.35);}',
      '.sg-consent-btn.sg-decline:hover{background:rgba(255,255,255,0.04);}',
      '</style>',
      '<p><span class="sg-label">// SYSTEM NOTICE:</span>',
      'This system uses analytics to monitor performance. No advertising or third-party tracking cookies are used.',
      ' <a href="/privacy">Privacy Policy</a></p>',
      '<div class="sg-consent-btns">',
      '<button class="sg-consent-btn sg-decline" id="sg-consent-decline" aria-label="Decline analytics">[ DECLINE ]</button>',
      '<button class="sg-consent-btn" id="sg-consent-accept" aria-label="Accept analytics">[ ACCEPT ]</button>',
      '</div>'
    ].join('');

    document.body.appendChild(banner);

    document.getElementById('sg-consent-accept').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'granted');
      updateConsent(true);
      banner.remove();
    });

    document.getElementById('sg-consent-decline').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'denied');
      updateConsent(false);
      banner.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
