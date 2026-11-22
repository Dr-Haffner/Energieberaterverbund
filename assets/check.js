/*
 * Sanierungs-Check (Startseite) – Stand 22.11.2026
 * Erstellt aus den Angaben eine E-Mail im Mailprogramm des Besuchers (mailto).
 * Es werden keine Daten über die Website oder an Dritte übertragen.
 */
(function () {
  'use strict';
  var form = document.getElementById('checkForm');
  if (!form) return;
  var errorEl = document.getElementById('checkError');
  var fallback = document.getElementById('checkFallback');
  var textEl = document.getElementById('checkText');
  var TO = 'info@energieberaterverbund.de';

  function val(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var haus = val('haus');
    var baujahr = val('baujahr');
    var vorhaben = Array.prototype.map.call(
      form.querySelectorAll('input[name="vorhaben"]:checked'), function (c) { return c.value; });
    var plz = (form.plz.value || '').trim();
    var tel = (form.telefon.value || '').trim();
    var msg = (form.nachricht.value || '').trim();

    var missing = [];
    if (!haus) missing.push('Gebäudeart');
    if (!baujahr) missing.push('Baujahr');
    if (!vorhaben.length) missing.push('Vorhaben');
    if (!/^[0-9]{5}$/.test(plz)) missing.push('Postleitzahl (5 Ziffern)');
    form.plz.setAttribute('aria-invalid', /^[0-9]{5}$/.test(plz) ? 'false' : 'true');
    if (missing.length) {
      errorEl.textContent = 'Bitte noch ergänzen: ' + missing.join(', ') + '.';
      errorEl.hidden = false;
      // Fokus auf das erste fehlende Feld
      var first = !haus ? form.querySelector('input[name="haus"]') :
                  !baujahr ? form.querySelector('input[name="baujahr"]') :
                  !vorhaben.length ? form.querySelector('input[name="vorhaben"]') : form.plz;
      if (first) first.focus();
      return;
    }
    errorEl.hidden = true;

    var body =
      'Guten Tag,\n\nich interessiere mich für eine Energieberatung.\n\n' +
      'Gebäude: ' + haus + '\n' +
      'Baujahr: ' + baujahr + '\n' +
      'Vorhaben: ' + vorhaben.join(', ') + '\n' +
      'PLZ: ' + plz + '\n' +
      (tel ? 'Rückrufnummer: ' + tel + '\n' : '') +
      (msg ? '\nNachricht:\n' + msg + '\n' : '') +
      '\nBitte melden Sie sich bei mir.\n\nMit freundlichen Grüßen\n';
    var subject = 'Anfrage Sanierungs-Check – ' + haus + ', PLZ ' + plz;

    textEl.value = 'An: ' + TO + '\nBetreff: ' + subject + '\n\n' + body;
    fallback.hidden = false;
    window.location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
