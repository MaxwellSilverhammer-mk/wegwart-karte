/*
 * Wegwart-Logbuch – Questlog für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.0
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Questlog: Fürchtegotts Logbuch</h2>
 *   <div id="logbuch">Logbuch lädt …</div>
 *   <script>var QUESTLOG={titel:'Logbuch', stand:'Stand: Tag 8', heute:8, frist:28, welttag:8, auftraege:[…]}<\/script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/questlog.js';document.head.appendChild(s);<\/script>
 *
 * Pergament wie der Kartentisch: Fristleiste mit Mondphasen aus dem Weltkalender, bekannte
 * Termine, Aufträge mit Etappen, gegebenes Wort und Erfahrung. Wer einen Eintrag antippt,
 * sieht, was die Figur weiß und woher. Die Daten kommen aus dem Spielstand und werden vorher
 * mit pruefen.js geprüft (README).
 */
(function () {
  'use strict';

  var VERSION = '1.0';

  /* ---------- Weltkalender (Regelwerk 8.1) ---------- */
  var MONATE = [['Patchwall', 28], ["Ready'reat", 28], ['Sunsebb', 28], ['Needfest', 7], ['Fireseek', 28], ['Readying', 28], ['Coldeven', 28],
    ['Growfest', 7], ['Planting', 28], ['Flocktime', 28], ['Wealsun', 28], ['Richfest', 7], ['Reaping', 28], ['Goodmonth', 28], ['Harvester', 28], ['Brewfest', 7]];
  function datum(wt) {
    var n = Math.round(wt) - 1, z = Math.floor(n / 364), i;
    n -= z * 364;
    for (i = 0; i < MONATE.length; i++) { if (n < MONATE[i][1]) break; n -= MONATE[i][1]; }
    return { tag: n + 1, monat: MONATE[i][0], jahr: 576 + z + (i >= 3 ? 1 : 0) };
  }
  function datumText(wt) { var d = datum(wt); return d.tag + '. ' + d.monat + ' ' + d.jahr + ' CY'; }
  // Luna: Vollmond an Welttag 11, 39, 67 …, Dunkelmond an 25, 53, 81 … (28 Tage)
  function mondPhase(wt) { return (((Math.round(wt) - 11) % 28) + 28) % 28; }
  function mondName(p) {
    if (p === 0) return 'Vollmond';
    if (p === 14) return 'Dunkelmond';
    if (p === 7) return 'abnehmender Halbmond';
    if (p === 21) return 'zunehmender Halbmond';
    if (p < 7) return 'abnehmender Mond';
    if (p < 14) return 'abnehmende Sichel';
    if (p < 21) return 'zunehmende Sichel';
    return 'zunehmender Mond';
  }
  function mondSvg(p, gr) {
    var r = 10, c = 12, th = 2 * Math.PI * p / 28, k = Math.cos(th), rx = Math.abs(k) * r;
    var s = '<svg viewBox="0 0 24 24" width="' + gr + '" height="' + gr + '" aria-hidden="true" class="lbMond">';
    s += '<circle cx="12" cy="12" r="10" fill="var(--ink)" fill-opacity="0.72"/>';
    if (p === 0) s += '<circle cx="12" cy="12" r="10" fill="var(--hell)"/>';
    else if (p !== 14) {
      var zunehmend = p > 14, gibbous = k > 0;
      var a1 = zunehmend ? 1 : 0, a2 = zunehmend ? (gibbous ? 1 : 0) : (gibbous ? 0 : 1);
      s += '<path d="M' + c + ' ' + (c - r) + 'A' + r + ' ' + r + ' 0 0 ' + a1 + ' ' + c + ' ' + (c + r) + 'A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + a2 + ' ' + c + ' ' + (c - r) + 'Z" fill="var(--hell)"/>';
    }
    return s + '<circle cx="12" cy="12" r="10" fill="none" stroke="var(--ink)" stroke-width="1.3"/></svg>';
  }

  /* ---------- Schema für die Prüfung (pruefen.js) ---------- */
  var SCHEMA = {
    name: 'Questlog',
    wurzel: 'logbuch',
    felder: {
      logbuch: { titel: 'text', stand: 'text', heute: 'zahl', frist: 'zahl', fristText: 'text', welttag: 'zahl', ep: 'zahlen', termine: 'termin[]', auftraege: 'auftrag[]', wort: 'wort[]' },
      termin: { tag: 'zahl', text: 'text', quelle: 'text', mond: 'mond' },
      auftrag: { id: 'id', titel: 'text', art: 'auftragsart', status: 'status', von: 'text', frist: 'zahl', lohn: 'text', text: 'text', quelle: 'text', etappen: 'etappe[]', glossar: 'text[]' },
      etappe: { text: 'text', erledigt: 'ja', gescheitert: 'ja', notiz: 'text', quelle: 'text' },
      wort: { an: 'text', von: 'text', text: 'text', status: 'wortstatus' }
    },
    wahl: {
      auftragsart: ['haupt', 'neben', 'faden', 'gefahr'], status: ['offen', 'erledigt', 'gescheitert', 'ruht'],
      wortstatus: ['offen', 'gehalten', 'eingeloest', 'gebrochen'], mond: ['voll', 'dunkel', 'zunehmend', 'abnehmend']
    },
    pflicht: { logbuch: ['titel', 'stand', 'heute', 'auftraege'], termin: ['tag', 'text'], auftrag: ['id', 'titel', 'art', 'status'], etappe: ['text'], wort: ['text', 'status'] },
    namen: {},
    belege: {
      termin: { text: 0.7 }, auftrag: { text: 0.7, lohn: 0.7, von: 0.7 },
      etappe: { text: 0.7, notiz: 0.7 }, wort: { text: 0.7 }
    },
    quellen: { termin: ['quelle'], auftrag: ['quelle', 'glossar'], etappe: ['quelle'], wort: ['an', 'von'] },
    zahlen: { logbuch: ['heute', 'frist', 'welttag'], auftrag: ['frist'] }
  };

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function zahl(v, d) { v = +v; return isFinite(v) ? v : (d || 0); }
  function tausend(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function ikon(name, gr) {
    return '<i class="ti ti-' + name + '" aria-hidden="true"' + (gr ? ' style="font-size:' + gr + 'px"' : '') + '></i>';
  }

  /* ---------- Zeichnen ---------- */
  function fristleiste(D) {
    var heute = zahl(D.heute, 1), frist = D.frist ? zahl(D.frist) : 0, wt0 = D.welttag ? zahl(D.welttag) - heute : null;
    var von = 1, bis = Math.max(frist, heute + 7);
    if (bis - von > 55) { von = Math.max(1, heute - 13); bis = von + 55; }
    var termine = {};
    (D.termine || []).forEach(function (t) { if (t && isFinite(t.tag)) (termine[t.tag] = termine[t.tag] || []).push(t); });
    var h = '<div class="lbLeiste" role="group" aria-label="Fristleiste">';
    for (var t = von; t <= bis; t++) {
      var p = wt0 === null ? null : mondPhase(wt0 + t), kl = 'lbTag' + (t < heute ? ' vorbei' : '') + (t === heute ? ' heute' : '') + (t === frist ? ' frist' : '') + (termine[t] ? ' termin' : '');
      h += '<button type="button" class="' + kl + '" data-tag="' + t + '" aria-label="Tag ' + t + (t === heute ? ', heute' : '') + (t === frist ? ', Frist' : '') +
        (termine[t] ? ', ' + termine[t].length + ' Termin' : '') + '">' + (p === null ? '' : mondSvg(p, 11)) + '<span>' + t + '</span><i class="lbPunkt" aria-hidden="true"></i></button>';
    }
    return h + '</div>';
  }
  function tagInfo(D, t) {
    var heute = zahl(D.heute, 1), wt0 = D.welttag ? zahl(D.welttag) - heute : null, teile = [];
    var kopf = '<b>' + (t === heute ? 'Heute, ' : '') + 'Tag ' + t + '</b>' + (wt0 !== null ? ' · ' + esc(datumText(wt0 + t)) + ' · ' + mondName(mondPhase(wt0 + t)) : '');
    (D.termine || []).forEach(function (x) { if (x && x.tag === t) teile.push(esc(x.text) + (x.quelle ? ' <i>(' + esc(x.quelle) + ')</i>' : '')); });
    if (t === zahl(D.frist) && D.fristText && !teile.length) teile.push(esc(D.fristText));
    if (t === heute && wt0 !== null) {
      var p = mondPhase(wt0 + t), bisVoll = (28 - p) % 28, bisDunkel = (14 - p + 28) % 28;
      if (bisVoll && bisVoll < bisDunkel) teile.push('Vollmond in ' + bisVoll + (bisVoll === 1 ? ' Nacht' : ' Nächten'));
      else if (bisDunkel && bisDunkel < bisVoll) teile.push('Dunkelmond in ' + bisDunkel + (bisDunkel === 1 ? ' Nacht' : ' Nächten'));
    }
    if (t < heute) teile.push('vorbei');
    return kopf + (teile.length ? '<br>' + teile.join('<br>') : '');
  }
  function genitiv(n) { return /[sßxz]$/.test(n) ? n + '’' : n + 's'; }
  function auftragHtml(a, i, mitMarke) {
    var etappen = (a.etappen || []).filter(function (e) { return e && e.text; }), id = 'lbA' + i;
    var kurz = a.art === 'faden' || a.art === 'gefahr';
    var mehr = (!kurz && a.text) || a.quelle || (a.glossar && a.glossar.length);
    var h = '<article class="lbA ' + esc(a.art || 'neben') + (a.status !== 'offen' ? ' ' + esc(a.status) : '') + '">';
    var marke = a.art === 'haupt' ? 'Hauptauftrag' : a.art === 'faden' ? 'Faden' : a.art === 'gefahr' ? 'Gefahr' : 'Nebenauftrag';
    if (a.status === 'erledigt') marke += ' · erledigt'; else if (a.status === 'gescheitert') marke += ' · gescheitert'; else if (a.status === 'ruht') marke += ' · ruht';
    if (mitMarke) h += '<p class="lbMarke">' + marke + '</p>';
    h += '<button type="button" class="lbTitel"' + (mehr ? ' aria-expanded="false" aria-controls="' + id + '"' : ' disabled') + '>' + (a.art === 'gefahr' ? ikon('skull', 18) + ' ' : '') + esc(a.titel) + (mehr ? '<i class="lbPlus" aria-hidden="true">+</i>' : '') + '</button>';
    if (kurz && a.text) h += '<p class="lbKurz">' + esc(a.text) + '</p>';
    var meta = [];
    if (a.von) meta.push('von ' + esc(a.von));
    if (a.frist) meta.push('Frist Tag ' + zahl(a.frist));
    if (a.lohn) meta.push('Lohn: ' + esc(a.lohn));
    if (meta.length) h += '<p class="lbMeta">' + meta.join(' · ') + '</p>';
    if (mehr) {
      h += '<div class="lbMehr" id="' + id + '" hidden>';
      if (a.text && !kurz) h += '<p>' + esc(a.text) + '</p>';
      if (a.quelle) h += '<p class="lbKl">Woher: ' + esc(a.quelle) + '</p>';
      if (a.glossar && a.glossar.length) h += '<p class="lbGl">' + a.glossar.map(function (g) { return '<button type="button" class="lbK" data-glossar="' + esc(g) + '">Glossar ' + esc(g) + ' ↗</button>'; }).join('') + '</p>';
      h += '</div>';
    }
    if (etappen.length) {
      h += '<ul class="lbE">';
      etappen.forEach(function (e) {
        var st = e.gescheitert ? 'x' : e.erledigt ? 'ok' : 'offen';
        h += '<li class="' + st + '">' + ikon(st === 'ok' ? 'square-check' : st === 'x' ? 'square-x' : 'square', 17) + '<span>' + esc(e.text) +
          (e.notiz ? '<small>' + esc(e.notiz) + (e.quelle ? ' (' + esc(e.quelle) + ')' : '') + '</small>' : e.quelle ? '<small>(' + esc(e.quelle) + ')</small>' : '') + '</span>' +
          '<span class="sr-only">' + (st === 'ok' ? ', erledigt' : st === 'x' ? ', gescheitert' : ', offen') + '</span></li>';
      });
      h += '</ul>';
    }
    return h + '</article>';
  }
  var WORTSTATUS = { offen: ['offen', 'hourglass'], gehalten: ['bisher gehalten', 'anchor'], eingeloest: ['eingelöst', 'check'], gebrochen: ['gebrochen', 'x'] };
  function zeichne(D) {
    var h = '<div class="lbKopf"><p class="lbT">' + esc(D.titel || 'Logbuch') + '</p><p class="lbS">' + esc(D.stand || '') +
      (D.welttag ? ' · ' + esc(datumText(zahl(D.welttag))) : '') + '</p></div>';
    // Frist und Mond
    var heute = zahl(D.heute, 1);
    h += '<div class="lbBlock"><p class="lbH">' + ikon('calendar', 18) + (D.frist ? 'Tag ' + heute + ' von ' + zahl(D.frist) + (D.fristText ? ' · ' + esc(D.fristText) : '') : 'Tag ' + heute) + '</p>' +
      fristleiste(D) + '<p class="lbInfo" aria-live="polite">' + tagInfo(D, heute) + '</p></div>';
    // Erfahrung
    if (Array.isArray(D.ep) && D.ep.length >= 2) {
      var ep = zahl(D.ep[0]), ziel = zahl(D.ep[1]), stufe = D.ep[2], anteil = ziel ? Math.max(0, Math.min(100, ep / ziel * 100)) : 0;
      h += '<div class="lbBlock"><p class="lbH">' + ikon('stars', 18) + 'Erfahrung <span class="lbKl">' + tausend(ep) + ' von ' + tausend(ziel) + (stufe ? ' bis Stufe ' + esc(stufe) : '') + '</span></p>' +
        '<div class="lbEp" role="img" aria-label="' + Math.round(anteil) + ' Prozent"><span style="width:' + anteil.toFixed(1) + '%"></span></div></div>';
    }
    // Aufträge
    var auf = (D.auftraege || []).filter(function (a) { return a && a.titel; });
    var offen = auf.filter(function (a) { return a.status !== 'erledigt' && a.status !== 'gescheitert'; });
    var fertig = auf.filter(function (a) { return a.status === 'erledigt' || a.status === 'gescheitert'; });
    var reihen = [['haupt', 'Hauptauftrag', 'Hauptaufträge'], ['neben', 'Nebenauftrag', 'Nebenaufträge'], ['gefahr', 'Gefahr', 'Gefahren'], ['faden', 'Faden', 'Offene Fäden']];
    var nr = 0;
    reihen.forEach(function (r) {
      var as = offen.filter(function (a) { return (a.art || 'neben') === r[0]; });
      if (!as.length) return;
      h += '<section class="lbSek"><p class="lbG">' + (as.length === 1 ? r[1] : r[2]) + '</p>';
      as.forEach(function (a) { h += auftragHtml(a, nr++, false); });
      h += '</section>';
    });
    // Wort
    var wort = (D.wort || []).filter(function (w) { return w && w.text; });
    if (wort.length) {
      h += '<section class="lbSek"><p class="lbG">Gegebenes Wort</p><ul class="lbW">';
      wort.forEach(function (w) {
        var st = WORTSTATUS[w.status] || WORTSTATUS.offen, wer = w.von ? esc(genitiv(w.von)) + ' Wort an dich' : 'Dein Wort' + (w.an ? ' an ' + esc(w.an) : '');
        h += '<li class="' + esc(w.status) + '">' + ikon(st[1], 17) + '<span><small>' + wer + ' · ' + st[0] + '</small>' + esc(w.text) + '</span></li>';
      });
      h += '</ul></section>';
    }
    if (fertig.length) {
      h += '<section class="lbSek"><button type="button" class="lbK lbFertig" aria-expanded="false" aria-controls="lbFertig">Erledigt (' + fertig.length + ') zeigen</button><div id="lbFertig" class="lbFertigL" hidden>';
      fertig.forEach(function (a) { h += auftragHtml(a, nr++, true); });
      h += '</div></section>';
    }
    return h;
  }

  var CSS = [
    '.lb{--pg:#efe2c3;--hell:#f8f2df;--ink:#3b3028;--ink2:#5a4a3a;--rot:#8e3b22;--rahmen:#8b6d45;--linie:rgba(59,48,40,.28);',
    'background:var(--pg);color:var(--ink);border:3px solid var(--rahmen);border-radius:14px;padding:5px;font-family:"EB Garamond",Garamond,Georgia,serif;font-size:17px;line-height:1.45}',
    '[data-mode="dark"] .lb{--pg:#d8c9a3}',
    '@media (prefers-color-scheme:dark){:root:not([data-mode]) .lb{--pg:#d8c9a3}}',
    '.lb p{margin:0}.lb [hidden]{display:none!important}',
    '.lbIn{border:1px solid var(--rahmen);border-radius:9px;padding:14px 16px 12px;display:flex;flex-direction:column;gap:14px}',
    '.lbT{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:27px;line-height:1.1}',
    '.lbS,.lbKl,.lbMeta{font-style:italic;color:var(--ink2)}.lbS{font-size:17px}.lbKl,.lbMeta{font-size:15px}',
    '.lbBlock{display:flex;flex-direction:column;gap:8px}',
    '.lbH{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:19px}',
    '.lbH .lbKl{font-family:"EB Garamond",Garamond,Georgia,serif}',
    '.lbLeiste{display:grid;grid-template-columns:repeat(14,minmax(0,1fr));gap:2px}',
    '.lb button.lbTag{all:unset;box-sizing:border-box;position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;padding:3px 0 6px;border-radius:5px;cursor:pointer;color:var(--ink);font-size:14px;line-height:1.1;min-width:0}',
    '.lb button.lbTag:hover{background:rgba(59,48,40,.07)}',
    '.lb button.lbTag:focus-visible{outline:2px solid var(--rot)}',
    '.lb button.lbTag.gewaehlt{background:rgba(142,59,34,.12)}',
    '.lbTag span{position:relative;font-variant-numeric:lining-nums}',
    '.lbTag.vorbei span{color:var(--ink2)}',
    '.lbTag.vorbei span::after{content:"";position:absolute;left:-3px;right:-3px;top:50%;border-top:1.6px solid var(--ink);transform:rotate(-28deg);opacity:.75}',
    '.lbTag.heute span{color:var(--rot);font-weight:600}',
    '.lbTag.heute span::before{content:"";position:absolute;left:-5px;right:-5px;top:-3px;bottom:-3px;border:1.6px solid var(--rot);border-radius:50%}',
    '.lb button.lbTag.frist{box-shadow:inset 0 0 0 1.5px var(--rot)}',
    '.lbPunkt{display:block;width:5px;height:5px;border-radius:50%;background:transparent}',
    '.lbTag.termin .lbPunkt{background:var(--rot)}',
    '.lbMond{display:block}',
    '.lbInfo{font-size:16px;min-height:44px}.lbInfo b{font-weight:600}',
    '.lbEp{height:7px;border-radius:4px;background:rgba(59,48,40,.14);overflow:hidden}.lbEp span{display:block;height:100%;background:var(--ink);opacity:.78}',
    '.lbSek{border-top:1.5px solid var(--rahmen);padding-top:10px;display:flex;flex-direction:column;gap:12px}',
    '.lbG{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:20px}',
    '.lbA{display:flex;flex-direction:column;gap:4px}',
    '.lbMarke{font-style:italic;font-size:14px;color:var(--rot);display:flex;align-items:center;gap:2px}',
    '.lb button.lbTitel{all:unset;cursor:pointer;font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:21px;line-height:1.2;color:var(--ink);border-radius:4px}',
    '.lb button.lbTitel:disabled{cursor:default}',
    '.lb button.lbTitel:focus-visible,.lb .lbK:focus-visible{outline:2px solid var(--rot);outline-offset:2px}',
    '.lbA.neben .lbTitel,.lbA.faden .lbTitel,.lbA.gefahr .lbTitel{font-size:19px}',
    '.lbA.gefahr .lbTitel .ti{color:var(--rot);vertical-align:-2px}',
    '.lbKurz{font-size:16px}',
    '.lbPlus{font-style:normal;font-family:"EB Garamond",Georgia,serif;color:var(--rot);margin-left:6px;font-size:17px}',
    '.lbMehr{margin:2px 0 4px;padding:4px 0 4px 12px;border-left:2px solid var(--rot);display:flex;flex-direction:column;gap:6px;font-size:16px}',
    '.lbGl{display:flex;flex-wrap:wrap;gap:6px}',
    '.lbE,.lbW{list-style:none;margin:2px 0 0;padding:0;display:flex;flex-direction:column;gap:4px}',
    '.lbE li,.lbW li{display:flex;gap:8px;align-items:flex-start;font-size:16px;line-height:1.4}',
    '.lbE li .ti,.lbW li .ti{flex-shrink:0;margin-top:2px;color:var(--ink2)}',
    '.lbE li.ok span:first-of-type{color:var(--ink2)}',
    '.lbE li.ok .ti{color:var(--ink)}',
    '.lbE li.x .ti{color:var(--rot)}',
    '.lbE small,.lbW small{display:block;font-style:italic;font-size:14px;color:var(--ink2)}',
    '.lbW li.gebrochen .ti{color:var(--rot)}',
    '.lb .lbK{all:unset;cursor:pointer;align-self:flex-start;font-family:inherit;font-size:15px;color:var(--ink);border:1px solid var(--rahmen);border-radius:6px;padding:2px 10px}',
    '.lb .lbK:hover{background:rgba(59,48,40,.07)}',
    '.lbFertigL{display:flex;flex-direction:column;gap:12px;margin-top:6px}'
  ].join('');

  function schriftLaden() {
    try {
      if (document.getElementById('ktSchrift')) return;
      var l = document.createElement('link');
      l.id = 'ktSchrift'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=IM+Fell+English:ital@0;1&display=swap';
      document.head.appendChild(l);
    } catch (e) { return; }
  }

  function einbauen(el, D) {
    schriftLaden();
    el.className = 'lb';
    el.innerHTML = '<style>' + CSS + '</style><div class="lbIn">' + zeichne(D) + '</div>';
    var info = el.querySelector('.lbInfo');
    el.addEventListener('click', function (ev) {
      var t = ev.target, z;
      if (!t.closest) return;
      if ((z = t.closest('[data-glossar]'))) { if (typeof sendPrompt === 'function') sendPrompt('Glossar ' + z.getAttribute('data-glossar')); return; }
      if ((z = t.closest('button.lbTag'))) {
        var alt = el.querySelector('.lbTag.gewaehlt');
        if (alt) alt.classList.remove('gewaehlt');
        z.classList.add('gewaehlt');
        info.innerHTML = tagInfo(D, +z.getAttribute('data-tag'));
        return;
      }
      if ((z = t.closest('button.lbTitel, button.lbFertig'))) {
        if (z.disabled) return;
        var ziel = document.getElementById(z.getAttribute('aria-controls')), auf = z.getAttribute('aria-expanded') !== 'true';
        z.setAttribute('aria-expanded', String(auf));
        if (ziel) ziel.hidden = !auf;
        var plus = z.querySelector('.lbPlus');
        if (plus) plus.textContent = auf ? '−' : '+';
        if (z.classList.contains('lbFertig')) z.textContent = z.textContent.replace(auf ? 'zeigen' : 'verbergen', auf ? 'verbergen' : 'zeigen');
      }
    });
    if (typeof sendPrompt !== 'function') Array.prototype.forEach.call(el.querySelectorAll('[data-glossar]'), function (x) { x.remove(); });
  }

  function start() {
    var el = document.getElementById('logbuch'), D = window.QUESTLOG;
    if (!el || !D) return false;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Das Logbuch ließ sich nicht zeichnen: ' + err.message; }
    return true;
  }

  // Lore-Check für pruefen.js: Mond, Daten und Erfahrung gegen Weltkalender und Regelwerk
  var STUFEN = { 2: 300, 3: 900, 4: 2700, 5: 6500, 6: 14000, 7: 23000, 8: 34000, 9: 48000, 10: 64000, 11: 85000, 12: 100000, 13: 120000, 14: 140000 };
  var MONDWAHL = { voll: function (p) { return p === 0; }, dunkel: function (p) { return p === 14; }, abnehmend: function (p) { return p > 0 && p < 14; }, zunehmend: function (p) { return p > 14; } };
  function zusatz(D, h) {
    var fehler = [], hinweise = [], heute = D.heute, wt0 = typeof D.welttag === 'number' ? D.welttag - heute : null;
    (D.termine || []).forEach(function (t, i) {
      if (!t || typeof t.tag !== 'number') return;
      var wo = 'Termin „' + String(t.text || i + 1).slice(0, 40) + '“';
      if (D.frist && t.tag > D.frist) hinweise.push(wo + ': liegt nach der Frist (Tag ' + D.frist + ').');
      // Der Tag muss im Spielstand stehen, außer der Mond selbst legt ihn fest (Lore: Weltkalender)
      var mondTag = t.mond && wt0 !== null && MONDWAHL[t.mond] && (t.mond === 'voll' || t.mond === 'dunkel') && MONDWAHL[t.mond](mondPhase(wt0 + t.tag));
      if (!mondTag && !h.zahlBekannt(h.stand, h.nStand, t.tag)) fehler.push(wo + ' (tag): Tag ' + t.tag + ' steht nicht im Spielstand. Ein Termin, den der Mond festlegt, braucht „mond“.');
      if (t.mond) {
        if (wt0 === null) { fehler.push(wo + ': „mond“ braucht „welttag“, sonst lässt sich der Mond nicht prüfen.'); return; }
        var p = mondPhase(wt0 + t.tag);
        if (MONDWAHL[t.mond] && !MONDWAHL[t.mond](p)) fehler.push('Lore: ' + wo + ': An Tag ' + t.tag + ' (' + datumText(wt0 + t.tag) + ') ist ' + mondName(p) + ', nicht „' + t.mond + '“ (Weltkalender, Regelwerk 8.1).');
      }
      var n = h.norm(t.text || '');
      [['vollmond', 0], ['dunkelmond', 14], ['neumond', 14]].forEach(function (m) {
        if (n.indexOf(m[0]) < 0 || wt0 === null || new RegExp('\\b(vor|nach|bis|seit|ab)\\s+(dem\\s+|zum\\s+|vom\\s+)?' + m[0]).test(n)) return;
        var p2 = mondPhase(wt0 + t.tag);
        if (p2 !== m[1]) fehler.push('Lore: ' + wo + ' nennt den ' + (m[1] ? 'Dunkelmond' : 'Vollmond') + ', aber Tag ' + t.tag + ' ist ' + mondName(p2) + ' (Weltkalender).');
      });
    });
    if (typeof D.frist === 'number' && heute > D.frist) hinweise.push('Heute (Tag ' + heute + ') liegt nach der Frist (Tag ' + D.frist + ').');
    var st = /tag\s+(\d+)/i.exec(D.stand || '');
    if (st && +st[1] !== heute) fehler.push('Stand „' + D.stand + '“ passt nicht zu heute (Tag ' + heute + ').');
    if (Array.isArray(D.ep) && D.ep.length >= 2) {
      if (!h.zahlBekannt(h.stand, h.nStand, D.ep[0])) fehler.push('Erfahrung: ' + D.ep[0] + ' EP stehen nicht im Spielstand.');
      if (D.ep.length >= 3 && STUFEN[D.ep[2]] !== undefined && STUFEN[D.ep[2]] !== D.ep[1]) fehler.push('Lore: Stufe ' + D.ep[2] + ' beginnt laut Regelwerk 11.1 bei ' + STUFEN[D.ep[2]] + ' EP, nicht bei ' + D.ep[1] + '.');
      if (D.ep[0] >= D.ep[1]) hinweise.push('Erfahrung: ' + D.ep[0] + ' von ' + D.ep[1] + ' – der Aufstieg ist fällig.');
    }
    if (wt0 !== null) {
      var d = datum(D.welttag);
      if (h.nStand.indexOf(h.norm(d.monat)) < 0) hinweise.push('Datum: Heute ist laut Weltkalender ' + datumText(D.welttag) + '; der Spielstand nennt den ' + d.monat + ' nicht.');
    }
    return { fehler: fehler, hinweise: hinweise };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { zeichne: zeichne, SCHEMA: SCHEMA, zusatz: zusatz, datum: datum, datumText: datumText, mondPhase: mondPhase, mondName: mondName, version: VERSION };
  else (function warten(n) { if (!start() && n < 60) setTimeout(function () { warten(n + 1); }, 50); })(0);
})();
