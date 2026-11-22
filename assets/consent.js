/*
 * Einwilligungs-Banner (Cookie-Consent) – energieberaterverbund.de
 * Stand: 22.11.2026
 *
 * Funktionsweise:
 *  - Google Analytics 4 (gtag.js, geladen über www.googletagmanager.com) wird
 *    ERST nach aktiver Einwilligung geladen (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO).
 *  - Der Besucherzähler (Abacus, abacus.jasoncameron.dev) wird ebenfalls ERST nach
 *    Einwilligung aufgerufen und eingeblendet.
 *  - "Ablehnen" und "Akzeptieren" sind gleichwertig gestaltet.
 *  - Die Entscheidung wird im Cookie "ebv_consent" (12 Monate) und im localStorage
 *    gespeichert (technisch erforderlich, § 25 Abs. 2 Nr. 2 TDDDG) und kann jederzeit über den Footer-Link
 *    "Cookie-Einstellungen" geändert bzw. widerrufen werden.
 */
(function () {
  'use strict';

  var GA_ID = 'G-K01R2SH24H';
  var STORAGE_KEY = 'ebv-consent-v1';
  var gaLoaded = false;

  var COOKIE_NAME = 'ebv_consent';
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 12 Monate

  function readCookie() {
    var m = document.cookie.match(/(?:^|;\s*)ebv_consent=([^;]*)/);
    if (!m) return null;
    if (m[1] === '1') return { analytics: true };
    if (m[1] === '0') return { analytics: false };
    return null;
  }

  function writeCookie(analytics) {
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = COOKIE_NAME + '=' + (analytics ? '1' : '0') +
      '; Max-Age=' + COOKIE_MAX_AGE + '; Path=/; SameSite=Lax' + secure;
  }

  // Die Entscheidung wird doppelt gespeichert (Cookie + localStorage), damit sie
  // auf allen Unterseiten erhalten bleibt – auch wenn ein Browser einen der beiden
  // Speicher einschränkt.
  function readConsent() {
    var fromCookie = readCookie();
    if (fromCookie) return fromCookie;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(analytics) {
    try { writeCookie(analytics); } catch (e) { /* Cookies blockiert */ }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        analytics: !!analytics,
        timestamp: new Date().toISOString()
      }));
    } catch (e) { /* localStorage blockiert */ }
  }

  function loadGoogleAnalytics() {
    if (gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  // Besucherzähler (nur auf Seiten mit #visitCounter, nur nach Einwilligung)
  var counterLoaded = false;
  function loadVisitorCounter() {
    if (counterLoaded) return;
    var box = document.getElementById('visitCounter');
    var countEl = document.getElementById('visitCount');
    if (!box || !countEl) return;
    counterLoaded = true;
    box.hidden = false;
    var namespace = 'energieberaterverbund.de';
    var key = 'homepage';
    fetch('https://abacus.jasoncameron.dev/hit/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(key))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var v = d && typeof d.value === 'number' ? d.value : 0;
        countEl.textContent = v.toLocaleString('de-DE');
      })
      .catch(function () { countEl.textContent = '—'; });
  }

  function loadConsentedServices() {
    loadGoogleAnalytics();
    loadVisitorCounter();
  }

  // Entfernt die Google-Analytics-Cookies nach einem Widerruf
  function deleteGaCookies() {
    var host = window.location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid' || name === '_gat') {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  function hideBanner() {
    var b = document.getElementById('cookie-banner');
    if (b) b.parentNode.removeChild(b);
  }

  function showBanner() {
    if (document.getElementById('cookie-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-labelledby', 'cookie-banner-title');
    banner.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<p class="cookie-banner__title" id="cookie-banner-title"><strong>Datenschutz-Einstellungen</strong></p>' +
        '<p class="cookie-banner__text">Wir möchten mit Ihrer Einwilligung <strong>Google Analytics</strong> ' +
        '(Google Ireland Limited; Skript wird über den Google Tag Manager-Server geladen) einsetzen, um die Nutzung ' +
        'unserer Website statistisch auszuwerten. Dabei werden Cookies auf Ihrem Endgerät gespeichert und Daten ' +
        'ggf. auch in die USA übermittelt. Ohne Ihre Einwilligung wird Google Analytics nicht geladen. ' +
        'Außerdem zeigen wir mit Ihrer Einwilligung einen Besucherzähler an (Dienst „Abacus“, abacus.jasoncameron.dev); ' +
        'dabei wird Ihre IP-Adresse an den Betreiber übermittelt. ' +
        'Sie können Ihre Entscheidung jederzeit über „Cookie-Einstellungen“ im Seitenfuß ändern. ' +
        'Details: <a href="datenschutzerklaerung.html">Datenschutzerklärung</a> · <a href="impressum.html">Impressum</a></p>' +
        '<div class="cookie-banner__actions">' +
          '<button type="button" class="cookie-btn" data-consent="deny">Ablehnen</button>' +
          '<button type="button" class="cookie-btn" data-consent="accept">Akzeptieren</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    banner.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var choice = t.getAttribute('data-consent');
      if (!choice) return;
      var previous = readConsent();
      if (choice === 'accept') {
        writeConsent(true);
        hideBanner();
        loadConsentedServices();
      } else {
        writeConsent(false);
        hideBanner();
        deleteGaCookies();
        // Wurde GA bereits geladen (früher erteilte Einwilligung), Seite neu laden,
        // damit das Skript nicht weiter aktiv ist.
        if (gaLoaded || counterLoaded || (previous && previous.analytics)) {
          window.location.reload();
        }
      }
    });
  }

  function bindSettingsLinks() {
    var links = document.querySelectorAll('.js-cookie-settings');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (ev) {
        ev.preventDefault();
        showBanner();
      });
    }
  }

  function init() {
    bindSettingsLinks();
    var consent = readConsent();
    if (consent && consent.analytics === true) {
      loadConsentedServices();
    } else if (!consent) {
      showBanner();
    } else {
      // Abgelehnt/widerrufen: evtl. noch vorhandene GA-Cookies entfernen
      deleteGaCookies();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
