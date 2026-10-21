/*
 * Wegwart-Gepäck – Inventar für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.0
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Inventar: Probefigurs Gepäck</h2>
 *   <div id="gepaeck">Gepäck lädt …</div>
 *   <script>var INVENTAR={titel:'Probefigurs Gepäck', stand:'Stand: Tag 8', geld:{ga:3,sm:5}, traeger:[…]}<\/script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/inventar.js';document.head.appendChild(s);<\/script>
 *
 * Pergament wie der Kartentisch: Geldbeutel, Rationen, Traglast je Träger und die Dinge,
 * die die Figur bei sich hat. Wer ein Ding antippt, sieht, was die Figur darüber weiß.
 * Die Daten kommen aus dem Spielstand und werden vorher mit pruefen.js geprüft (README).
 */
(function () {
  'use strict';

  var VERSION = '1.0';

  /* ---------- Arten und Gruppen ---------- */
  // Art → [Tabler-Icon, Gruppe]
  var DINGART = {
    waffe: ['sword', 'waffen'], ruestung: ['shield', 'waffen'], kleidung: ['shirt', 'kleidung'], kostuem: ['masks-theater', 'kleidung'],
    instrument: ['music', 'instrumente'],
    werkzeug: ['tool', 'ausruestung'], schreibzeug: ['pencil', 'ausruestung'], licht: ['flame', 'ausruestung'], seil: ['spiral', 'ausruestung'], behaelter: ['backpack', 'ausruestung'],
    schlafzeug: ['bed', 'ausruestung'], tierbedarf: ['horse', 'ausruestung'], boot: ['sailboat', 'ausruestung'],
    ration: ['baguette', 'proviant'], proviant: ['bottle', 'proviant'], trank: ['flask', 'proviant'],
    papier: ['file-text', 'papiere'], brief: ['mail', 'papiere'], karte: ['map', 'papiere'],
    zeichen: ['bookmark', 'zeichen'], andenken: ['flag', 'zeichen'], fund: ['search', 'zeichen'], wertsache: ['diamond', 'zeichen'],
    spiel: ['cards', 'sonstiges'], sonstiges: ['point', 'sonstiges']
  };
  var GRUPPEN = [['waffen', 'Waffen und Rüstung'], ['kleidung', 'Kleidung'], ['instrumente', 'Instrumente'], ['ausruestung', 'Ausrüstung'],
    ['proviant', 'Proviant'], ['papiere', 'Papiere'], ['zeichen', 'Zeichen und Fundstücke'], ['sonstiges', 'Sonstiges']];
  var TRAEGERART = { figur: 'user', gefolge: 'user', lasttier: 'horse', reittier: 'horse', lager: 'home' };
  var MUENZEN = [
    ['pm', 'Highlord', 'Highlords', '#9aa3ab', '#d9dee2'],
    ['ga', 'Goldadmiral', 'Goldadmirale', '#a67c1a', '#e8c766'],
    ['em', 'Bright Ship', 'Bright Ships', '#8f8450', '#d6cb8e'],
    ['sm', 'Silber', 'Silber', '#7d8085', '#cfd2d6'],
    ['km', 'Common', 'Common', '#8a4b2a', '#d49a6a']
  ];
  var WERT = { pm: 10, ga: 1, em: 0.5, sm: 0.1, km: 0.01 };

  /* ---------- Schema für die Prüfung (pruefen.js) ---------- */
  var SCHEMA = {
    name: 'Inventar',
    wurzel: 'inventar',
    felder: {
      inventar: { titel: 'text', stand: 'text', figur: 'text', geld: 'geld', esser: 'zahl', traeger: 'traeger[]' },
      geld: { pm: 'zahl', ga: 'zahl', em: 'zahl', sm: 'zahl', km: 'zahl' },
      traeger: { id: 'id', name: 'text', namen: 'text[]', art: 'traegerart', staerke: 'zahl', faktor: 'zahl', ort: 'text', dinge: 'ding[]' },
      ding: { name: 'text', namen: 'text[]', art: 'dingart', anzahl: 'zahl', kg: 'zahl', notiz: 'text', herkunft: 'text', quelle: 'text', wortlaut: 'text', glossar: 'text' }
    },
    wahl: { traegerart: Object.keys(TRAEGERART), dingart: Object.keys(DINGART) },
    pflicht: { inventar: ['titel', 'stand', 'traeger'], geld: [], traeger: ['id', 'name', 'art'], ding: ['name', 'art'] },
    // Namen, die wörtlich (oder in einer Schreibweise aus „namen“) im Spielstand stehen müssen
    namen: { traeger: 'name', ding: 'name' },
    // Texte, die eine Stelle im Spielstand belegen muss (Anteil der Inhaltswörter)
    belege: { ding: { notiz: 0.7, herkunft: 0.7, wortlaut: 0.9 } },
    // Felder, die eine Person oder Quelle nennen; sie muss im Spielstand vorkommen
    quellen: { ding: ['quelle', 'glossar'] }
  };

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function zahl(v, d) { v = +v; return isFinite(v) ? v : (d || 0); }
  function kg(n) {
    var r = Math.round(n * 10) / 10;
    return String(r).replace('.', ',') + ' kg';
  }
  function ikon(name, gr) {
    return '<i class="ti ti-' + name + '" aria-hidden="true"' + (gr ? ' style="font-size:' + gr + 'px"' : '') + '></i>';
  }
  function anzahlVon(d) { return d.anzahl == null ? 1 : Math.max(0, zahl(d.anzahl, 1)); }
  function gewicht(d) { return zahl(d.kg) * anzahlVon(d); }
  function grenzen(t) {
    if (!t.staerke) return null;
    var f = zahl(t.faktor, 1) || 1, s = zahl(t.staerke) * f;
    return [s * 2.5, s * 5, s * 7.5];
  }
  function lastStufe(w, g) {
    if (!g) return '';
    if (w > g[2]) return 'zu schwer';
    if (w > g[1]) return 'schwer belastet';
    if (w > g[0]) return 'belastet';
    return 'unbelastet';
  }

  /* ---------- Zeichnen ---------- */
  function muenzenSvg(art, n) {
    var m = MUENZEN.filter(function (x) { return x[0] === art; })[0], k = Math.max(1, Math.min(6, Math.ceil(Math.log(n + 1) / Math.log(2.2)))), s = '';
    for (var i = 0; i < k; i++) {
      var y = 30 - i * 4.2;
      s += '<ellipse cx="17" cy="' + y + '" rx="13" ry="5" fill="' + m[4] + '" stroke="' + m[3] + '" stroke-width="1.4"/>';
    }
    var top = 30 - (k - 1) * 4.2;
    s += '<ellipse cx="17" cy="' + top + '" rx="8" ry="2.6" fill="none" stroke="' + m[3] + '" stroke-width="1"/>';
    return '<svg viewBox="0 0 34 38" width="30" height="34" aria-hidden="true">' + s + '</svg>';
  }
  function lastSvg(w, g) {
    var B = 300, max = g[2], x = function (v) { return Math.max(0, Math.min(B, v / max * B)); };
    var s = '<svg viewBox="-6 0 ' + (B + 12) + ' 40" width="100%" preserveAspectRatio="none" aria-hidden="true" style="display:block;height:40px">';
    s += '<rect x="0" y="12" width="' + x(g[0]) + '" height="8" fill="var(--gpW1)"/>';
    s += '<rect x="' + x(g[0]) + '" y="12" width="' + (x(g[1]) - x(g[0])) + '" height="8" fill="var(--gpW2)"/>';
    s += '<rect x="' + x(g[1]) + '" y="12" width="' + (B - x(g[1])) + '" height="8" fill="var(--gpW3)"/>';
    s += '<rect x="0" y="12" width="' + x(w) + '" height="8" fill="var(--ink)" opacity="0.78"/>';
    s += '<path d="M0 12V20M' + B + ' 12V20M' + x(g[0]) + ' 9V23M' + x(g[1]) + ' 9V23" stroke="var(--ink)" stroke-width="1.4" fill="none"/>';
    s += '<path d="M' + x(w) + ' 10l-4.5 -7h9z" fill="var(--rot)"/>';
    s += '</svg>';
    return s;
  }
  function zeichne(D) {
    var traeger = (D.traeger || []).filter(function (t) { return t && t.name; });
    var h = '';
    h += '<div class="gpKopf"><p class="gpT">' + esc(D.titel || 'Gepäck') + '</p>' + (D.stand ? '<p class="gpS">' + esc(D.stand) + '</p>' : '') + '</div>';

    // Geldbeutel
    var G = D.geld || {}, muenzen = MUENZEN.filter(function (m) { return zahl(G[m[0]]) > 0; });
    if (muenzen.length || D.geld) {
      var wert = 0;
      MUENZEN.forEach(function (m) { wert += zahl(G[m[0]]) * WERT[m[0]]; });
      h += '<div class="gpBlock"><p class="gpH">' + ikon('coins', 18) + 'Geldbeutel</p><div class="gpMz">';
      if (!muenzen.length) h += '<p class="gpLeer">leer</p>';
      muenzen.forEach(function (m) {
        var n = zahl(G[m[0]]);
        h += '<div class="gpM">' + muenzenSvg(m[0], n) + '<span><b>' + n + '</b> ' + esc(n === 1 ? m[1] : m[2]) + '</span></div>';
      });
      h += '</div>';
      if (muenzen.length > 1) h += '<p class="gpKl">zusammen ' + String(Math.round(wert * 100) / 100).replace('.', ',') + ' Goldadmirale wert</p>';
      h += '</div>';
    }

    // Rationen
    var rat = [], summe = 0;
    traeger.forEach(function (t) {
      var n = 0;
      (t.dinge || []).forEach(function (d) { if (d && d.art === 'ration') n += anzahlVon(d); });
      if (n) rat.push({ t: t, n: n });
      if (t.art !== 'lager') summe += n;
    });
    if (rat.length) {
      var esser = Math.max(1, zahl(D.esser, 1));
      h += '<div class="gpBlock"><p class="gpH">' + ikon('baguette', 18) + 'Rationen</p><div class="gpRat">';
      rat.forEach(function (r) {
        var brote = '';
        for (var i = 0; i < Math.min(r.n, 8); i++) brote += ikon('baguette', 18);
        h += '<span class="gpRz"><span class="gpBrot">' + brote + (r.n > 8 ? '<small>+' + (r.n - 8) + '</small>' : '') + '</span>' +
          '<span>' + r.n + ' ' + (r.t.art === 'figur' ? 'dabei' : r.t.art === 'lager' ? esc(r.t.name.replace(/^In /, 'in ')) : 'bei ' + esc(r.t.name)) + '</span></span>';
      });
      h += '</div><p class="gpKl">' + (summe ? 'reicht ' + Math.floor(summe / esser) + (Math.floor(summe / esser) === 1 ? ' Tag' : ' Tage') + (esser > 1 ? ' für ' + esser + ' Esser' : '') : 'nichts zu essen im Gepäck') + '</p></div>';
    }

    // Träger
    var nr = 0;
    traeger.forEach(function (t, ti) {
      var dinge = (t.dinge || []).filter(function (d) { return d && d.name; });
      var g = t.art === 'lager' ? null : grenzen(t), w = 0;
      dinge.forEach(function (d) { w += gewicht(d); });
      var zu = t.art === 'lager', inhalt = 'gpInh' + ti;
      h += '<section class="gpTr" aria-label="' + esc(t.name) + '"><div class="gpTk">' + ikon(TRAEGERART[t.art] || 'user', 22) +
        '<div style="flex:1;min-width:0"><p class="gpTn">' + esc(t.name) + '</p><p class="gpKl">' +
        (zu ? 'nicht im Gepäck · ' + dinge.length + (dinge.length === 1 ? ' Ding' : ' Dinge') + (t.ort ? ' · ' + esc(t.ort) : '') : 'trägt ' + kg(w) + (g ? ' · ' + lastStufe(w, g) : '') + (t.ort ? ' · ' + esc(t.ort) : '')) +
        '</p></div>' + (zu ? '<button type="button" class="gpK gpAuf" aria-expanded="false" aria-controls="' + inhalt + '">zeigen</button>' : '') + '</div>' +
        '<div id="' + inhalt + '"' + (zu ? ' hidden' : '') + '>';
      if (g) {
        h += '<div class="gpLast">' + lastSvg(w, g) + '<div class="gpLz"><span>0</span><span style="left:' + (g[0] / g[2] * 100) + '%">' + Math.round(g[0]) + '</span>' +
          '<span style="left:' + (g[1] / g[2] * 100) + '%">' + Math.round(g[1]) + '</span><span style="left:100%">' + Math.round(g[2]) + ' kg</span></div></div>';
      }
      GRUPPEN.forEach(function (gr) {
        var ds = dinge.filter(function (d) { return (DINGART[d.art] || DINGART.sonstiges)[1] === gr[0]; });
        if (!ds.length) return;
        h += '<p class="gpG">' + gr[1] + '</p><ul class="gpL">';
        ds.forEach(function (d) {
          var n = anzahlVon(d), id = 'gp' + ti + '-' + (nr++), mehr = d.notiz || d.herkunft || d.wortlaut || d.glossar || d.quelle;
          h += '<li><button type="button" class="gpZ" data-i="' + id + '"' + (mehr ? ' aria-expanded="false" aria-controls="' + id + '"' : ' disabled') + '>' +
            ikon((DINGART[d.art] || DINGART.sonstiges)[0], 17) + '<span class="gpN">' + (n !== 1 ? '<b>' + n + '</b> ' : '') + esc(d.name) +
            (mehr ? '<i class="gpPlus" aria-hidden="true">+</i>' : '') + '</span><span class="gpF"></span><span class="gpW">' + (d.kg ? kg(gewicht(d)) : '–') + '</span></button>';
          if (mehr) {
            h += '<div class="gpD" id="' + id + '" hidden>';
            if (d.notiz) h += '<p>' + esc(d.notiz) + '</p>';
            if (d.wortlaut) h += '<blockquote>' + esc(d.wortlaut) + '</blockquote>';
            if (d.herkunft || d.quelle) h += '<p class="gpKl">' + esc(d.herkunft || '') + (d.quelle ? (d.herkunft ? ' ' : '') + '(' + esc(d.quelle) + ')' : '') + '</p>';
            if (d.glossar) h += '<button type="button" class="gpK" data-glossar="' + esc(d.glossar) + '">Glossar ' + esc(d.glossar) + ' ↗</button>';
            h += '</div>';
          }
          h += '</li>';
        });
        h += '</ul>';
      });
      if (!dinge.length) h += '<p class="gpLeer">nichts</p>';
      h += '</div></section>';
    });
    return h;
  }

  var CSS = [
    '.gp{--pg:#efe2c3;--ink:#3b3028;--ink2:#5a4a3a;--rot:#8e3b22;--rahmen:#8b6d45;--linie:rgba(59,48,40,.28);--gpW1:rgba(93,106,58,.22);--gpW2:rgba(147,121,58,.30);--gpW3:rgba(142,59,34,.24);',
    'background:var(--pg);color:var(--ink);border:3px solid var(--rahmen);border-radius:14px;padding:5px;font-family:"EB Garamond",Garamond,Georgia,serif;font-size:17px;line-height:1.45}',
    '[data-mode="dark"] .gp{--pg:#d8c9a3}',
    '@media (prefers-color-scheme:dark){:root:not([data-mode]) .gp{--pg:#d8c9a3}}',
    '.gp p{margin:0}.gp [hidden]{display:none!important}',
    '.gpIn{border:1px solid var(--rahmen);border-radius:9px;padding:14px 16px 10px;display:flex;flex-direction:column;gap:14px}',
    '.gpT{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:27px;line-height:1.1}',
    '.gpS,.gpKl{font-style:italic;color:var(--ink2)}',
    '.gpS{font-size:17px}.gpKl{font-size:15px}',
    '.gpBlock{display:flex;flex-direction:column;gap:6px}',
    '.gpH{display:flex;align-items:center;gap:7px;font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:19px}',
    '.gpMz{display:flex;flex-wrap:wrap;gap:6px 18px}',
    '.gpM{display:flex;align-items:flex-end;gap:6px}.gpM b{font-weight:600;font-size:19px}',
    '.gpRat{display:flex;flex-wrap:wrap;gap:6px 18px}',
    '.gpRz{display:inline-flex;align-items:center;gap:6px}',
    '.gpBrot{display:inline-flex;gap:1px;color:var(--ink)}.gpBrot small{font-size:13px;margin-left:3px}',
    '.gpTr{border-top:1.5px solid var(--rahmen);padding-top:12px;display:flex;flex-direction:column;gap:4px}',
    '.gpTk{display:flex;align-items:center;gap:10px}',
    '.gpTn{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:22px;line-height:1.15}',
    '.gpLast{position:relative;padding-bottom:16px;margin:2px 4px 4px}',
    '.gpLz{position:absolute;left:0;right:0;bottom:0;height:16px;font-size:13px;font-style:italic;color:var(--ink2)}',
    '.gpLz span{position:absolute;transform:translateX(-50%);white-space:nowrap}.gpLz span:first-child{transform:none}.gpLz span:last-child{transform:translateX(-100%)}',
    '.gpG{font-style:italic;font-size:15px;color:var(--rot);margin-top:6px!important}',
    '.gpL{list-style:none;margin:0;padding:0}',
    '.gp button.gpZ{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:baseline;gap:8px;padding:3px 4px;border-radius:5px;cursor:pointer;color:var(--ink);font-family:inherit;font-size:17px;line-height:1.4}',
    '.gp button.gpZ:disabled{cursor:default}',
    '.gp button.gpZ:not(:disabled):hover{background:rgba(59,48,40,.07)}',
    '.gp button.gpZ:focus-visible,.gp .gpK:focus-visible{outline:2px solid var(--rot);outline-offset:1px}',
    '.gp button.gpZ[aria-expanded="true"]{background:rgba(142,59,34,.09)}',
    '.gpZ .ti{flex-shrink:0;align-self:center;color:var(--ink2)}',
    '.gpN{min-width:0}.gpN b{font-weight:600}',
    '.gpPlus{font-style:normal;color:var(--rot);margin-left:5px;font-size:15px}',
    '.gpF{flex:1;min-width:14px;border-bottom:1.5px dotted var(--linie);transform:translateY(-4px)}',
    '.gpW{white-space:nowrap;font-style:italic;font-size:16px;color:var(--ink2)}',
    '.gpD{margin:2px 4px 8px 29px;padding:6px 0 4px 12px;border-left:2px solid var(--rot);display:flex;flex-direction:column;gap:6px;font-size:16px}',
    '.gpD blockquote{margin:0;padding:4px 0 4px 12px;border-left:1px solid var(--linie);font-style:italic}',
    '.gp .gpAuf{align-self:center;flex-shrink:0}',
    '.gp .gpK{all:unset;cursor:pointer;align-self:flex-start;font-family:inherit;font-size:15px;color:var(--ink);border:1px solid var(--rahmen);border-radius:6px;padding:2px 10px}',
    '.gp .gpK:hover{background:rgba(59,48,40,.07)}',
    '.gpLeer{font-style:italic;color:var(--ink2);font-size:15px}'
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
    el.className = 'gp';
    el.innerHTML = '<style>' + CSS + '</style><div class="gpIn">' + zeichne(D) + '</div>';
    el.addEventListener('click', function (ev) {
      var t = ev.target;
      var auf0 = t.closest ? t.closest('.gpAuf') : null;
      if (auf0) {
        var ziel = document.getElementById(auf0.getAttribute('aria-controls')), offen = auf0.getAttribute('aria-expanded') !== 'true';
        auf0.setAttribute('aria-expanded', String(offen)); auf0.textContent = offen ? 'verbergen' : 'zeigen';
        if (ziel) ziel.hidden = !offen;
        return;
      }
      var g = t.closest ? t.closest('[data-glossar]') : null;
      if (g) { if (typeof sendPrompt === 'function') sendPrompt('Glossar ' + g.getAttribute('data-glossar')); return; }
      var b = t.closest ? t.closest('button.gpZ') : null;
      if (!b || b.disabled) return;
      var d = document.getElementById(b.getAttribute('data-i'));
      if (!d) return;
      var auf = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(auf));
      d.hidden = !auf;
      var plus = b.querySelector('.gpPlus');
      if (plus) plus.textContent = auf ? '−' : '+';
    });
    if (typeof sendPrompt !== 'function') Array.prototype.forEach.call(el.querySelectorAll('[data-glossar]'), function (x) { x.remove(); });
  }

  function start() {
    var el = document.getElementById('gepaeck'), D = window.INVENTAR;
    if (!el || !D) return false;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Das Gepäck ließ sich nicht zeichnen: ' + err.message; }
    return true;
  }

  // Zusatzprüfung für pruefen.js: Geld und Traglast mit dem Spielstand abgleichen (nur Hinweise)
  function zusatz(D, h) {
    var hinweise = [], zeilen = h.stand.split('\n');
    var NAMEN = { pm: 'highlord|pm', ga: 'goldadmiral|ga', em: 'bright ship|em', sm: 'silber|sm', km: 'common|km' };
    Object.keys(D.geld || {}).forEach(function (k) {
      var n = D.geld[k];
      if (!n || !NAMEN[k]) return;
      var re = new RegExp('(^|[^0-9])' + n + ' ?(' + NAMEN[k] + ')', 'i');
      if (!zeilen.some(function (z) { return re.test(h.norm(z)); })) hinweise.push('Geld: ' + n + ' ' + k.toUpperCase() + ' steht so nicht im Spielstand. Stimmt der Betrag?');
    });
    (D.traeger || []).forEach(function (t) {
      if (!t || t.art === 'lager' || !Array.isArray(t.dinge)) return;
      var w = 0;
      t.dinge.forEach(function (d) { if (d) w += zahl(d.kg) * anzahlVon(d); });
      var re = /rund (\d+(?:,\d+)?) kg/i, treffer = zeilen.filter(function (z) { return z.indexOf(t.name) >= 0 && re.test(z); })[0];
      if (treffer) {
        var soll = parseFloat(treffer.match(re)[1].replace(',', '.'));
        if (Math.abs(soll - w) > 1) hinweise.push('Traglast ' + t.name + ': die Dinge wiegen ' + kg(w) + ', der Spielstand sagt rund ' + kg(soll) + '.');
      }
    });
    return { hinweise: hinweise };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { zeichne: zeichne, SCHEMA: SCHEMA, zusatz: zusatz, version: VERSION };
  else (function warten(n) { if (!start() && n < 60) setTimeout(function () { warten(n + 1); }, 50); })(0);
})();
