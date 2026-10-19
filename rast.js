/*
 * Wegwart-Rast – Rastübersicht für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.0
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Rast: Fürchtegott in Hollos Hütte</h2>
 *   <div id="rast">Rastübersicht lädt …</div>
 *   <script>var RAST={nr:7,figur:'Fürchtegott',tp:[21,21],tw:[2,3,8],kon:1, …}<\/script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/rast.js';document.head.appendChild(s);<\/script>
 *
 * Zeigt den Zustand der Figur und plant kurze und lange Rast: Trefferwürfel einzeln würfeln,
 * Lied der Erholung, Essen, Versorgung, Klassenfähigkeiten, Zauber vor und nach der Rast,
 * Zaubervorbereitung. Gewürfelt wird mit crypto.getRandomValues (exakt gleichverteilt).
 * Das Ergebnis geht per sendPrompt als Nachricht „Rast #nr · …“ an die Spielleitung.
 * Alle Felder stehen in der README.
 */
(function () {
  'use strict';

  var VERSION = '1.0';
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var warte = function (ms) { return ruhig ? 0 : ms; };
  var pm = function (n) { return n ? ' ' + (n < 0 ? '−' : '+') + ' ' + Math.abs(n) : ''; };
  var vz = function (n) { return n ? (n < 0 ? '−' : '+') + Math.abs(n) : ''; };

  /* ---------- Hilfen ---------- */
  function wurf(w) {
    var a = new Uint32Array(1), l = Math.floor(4294967296 / w) * w, x;
    do { crypto.getRandomValues(a); x = a[0]; } while (x >= l);
    return x % w + 1;
  }
  function anim(el, k) { el.classList.remove(k); void el.getBoundingClientRect(); el.classList.add(k); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function neu(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function ikon(name, gr) {
    return '<i class="ti ti-' + name + '" aria-hidden="true"' + (gr ? ' style="font-size:' + gr + 'px"' : '') + '></i>';
  }
  function formel(ws, mod) {
    return ws.map(function (x) { return x[0] + 'W' + x[1]; }).join('+') + vz(mod || 0);
  }
  function liste(a) {
    if (a.length < 2) return a.join('');
    return a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1];
  }
  function grad(g) { return g ? 'Grad ' + g : 'Zaubertrick'; }
  function zahl(v, d) { v = +v; return isFinite(v) ? v : (d || 0); }
  var ERSCHOEPFUNG = ['', 'Nachteil auf Proben', 'dazu Bewegung halbiert', 'dazu Nachteil auf Angriffe und Rettungswürfe', 'dazu TP-Maximum halbiert', 'dazu Bewegung 0', 'Tod'];

  /* ---------- Stil ---------- */
  var CSS = [
    '.rk{background:var(--surface-2);border:0.5px solid var(--border);border-radius:12px;padding:1rem 1.25rem;display:flex;flex-direction:column;gap:14px}',
    '.rk p{margin:0}',
    '.rk [hidden]{display:none!important}',
    '.rkKopf{display:flex;align-items:center;gap:12px}',
    '.rkKopf>.ti{font-size:24px;color:var(--text-warning)}',
    '.rkT{font-size:16px;font-weight:500}',
    '.rkS{font-size:13px;color:var(--text-secondary)}',
    '.rkZ{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}',
    '.rkK{background:var(--surface-1);border-radius:var(--radius);padding:8px 12px;display:flex;flex-direction:column;gap:4px;min-width:0}',
    '.rkKl{font-size:12px;color:var(--text-secondary)}',
    '.rkKw{font-size:16px;font-weight:500;display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.rkKw small{font-size:12px;font-weight:400;color:var(--text-secondary)}',
    '.rkBar{height:6px;border-radius:3px;background:var(--border);overflow:hidden}',
    '.rkBar>span{display:block;height:100%;background:var(--text-success);border-radius:3px;transition:width .5s ease-out}',
    '.rkPips{display:inline-flex;gap:3px;align-items:center}',
    '.rkPip{width:10px;height:10px;border-radius:50%;border:1.5px solid currentColor;box-sizing:border-box}',
    '.rkPip.an{background:currentColor}',
    '.rkTw{display:inline-flex;gap:3px}',
    '.rkTw svg{display:block}',
    '.rkZeile{display:flex;align-items:center;gap:6px;font-size:13px}',
    '.rkWahl{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.rkWahl button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:8px 12px;text-align:left;height:auto;line-height:1.3}',
    '.rkWahl button .ti{font-size:18px}',
    '.rkWahl button span{font-size:12px;color:var(--text-secondary)}',
    '.rkWahl button[aria-pressed="true"]{background:var(--bg-accent);color:var(--text-accent);border-color:var(--border-accent)}',
    '.rkWahl button[aria-pressed="true"] span{color:var(--text-accent)}',
    '.rkP{display:flex;flex-direction:column;gap:0}',
    '.rkSek{display:flex;flex-direction:column;gap:8px;padding:12px 0;border-top:0.5px solid var(--border)}',
    '.rkSek:first-child{border-top:0;padding-top:0}',
    '.rkH{display:flex;align-items:center;flex-wrap:wrap;gap:2px 8px;font-size:14px;font-weight:500}',
    '.rkH>span{white-space:nowrap}',
    '.rkH .ti{font-size:18px;color:var(--text-secondary)}',
    '.rkH small{font-weight:400;font-size:12px;color:var(--text-secondary)}',
    '.rkInfo{font-size:13px;color:var(--text-secondary);line-height:1.5}',
    '.rkDice{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}',
    '.rkD{display:flex;flex-direction:column;align-items:center;gap:2px}',
    '.rkD svg{display:block;overflow:visible}',
    '.rkC{font-size:11px;line-height:14px;height:14px;white-space:nowrap;color:var(--text-secondary)}',
    '.rkKn{display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
    '.rkChips{display:flex;flex-wrap:wrap;gap:6px}',
    '.rkChip{font-size:13px;padding:5px 10px;height:auto;line-height:1.3;display:inline-flex;align-items:center;gap:6px}',
    '.rkChip[aria-checked="true"],.rkChip[aria-pressed="true"]{background:var(--bg-accent);color:var(--text-accent);border-color:var(--border-accent)}',
    '.rkChip small{font-size:11px;color:inherit;opacity:1}',
    '.rkZa{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-radius:var(--radius);background:var(--surface-1)}',
    '.rkZa .rkZk{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.rkZa b{font-weight:500;font-size:14px}',
    '.rkB{display:inline-flex;align-items:center;gap:4px;font-size:12px;padding:1px 8px;border-radius:var(--radius);background:var(--surface-2);color:var(--text-secondary)}',
    '.rkZa select{height:30px;font-size:13px;padding:0 6px}',
    '.rkL{display:flex;flex-direction:column;gap:4px;font-size:13px}',
    '.rkL div{display:flex;align-items:center;gap:8px}',
    '.rkL .ti{font-size:16px;color:var(--text-success)}',
    '.rkL .aus .ti{color:var(--text-muted)}',
    '.rkFehler{font-size:13px;color:var(--text-danger)}',
    '.rkSperre{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:var(--radius);background:var(--surface-1);font-size:13px;color:var(--text-secondary)}',
    '.rkSperre .ti{font-size:18px}',
    '.rkFuss{display:flex;flex-direction:column;gap:10px}',
    '.rkVor{font-size:13px;color:var(--text-secondary);line-height:1.5}',
    '.rkGo{background:var(--bg-accent);color:var(--text-accent);border-color:var(--border-accent);font-weight:500;padding:8px 18px;align-self:flex-start}',
    '.rkHm{background:var(--bg-warning);color:var(--text-warning);border-color:var(--border-warning)}',
    '.rkStrip{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:var(--radius);background:var(--bg-success);color:var(--text-success);animation:rkIn .35s ease-out}',
    '.rkStrip p{flex:1;min-width:0;font-size:15px;font-weight:500}',
    '.rkStrip span{font-size:13px;white-space:nowrap}',
    '.rkRoll{animation:rkRoll 1.1s cubic-bezier(.15,.6,.3,1)}',
    '.rkLand{animation:rkLand .35s ease-out}',
    '.rkRing{animation:rkRing .9s ease-out}',
    '.rkIn{animation:rkIn .35s ease-out}',
    '@keyframes rkRoll{0%{transform:rotate(0) scale(.85)}25%{transform:rotate(-220deg) scale(1.1)}55%{transform:rotate(-320deg) scale(.95)}80%{transform:rotate(-352deg) scale(1.02)}100%{transform:rotate(-360deg) scale(1)}}',
    '@keyframes rkLand{0%{transform:scale(1.2)}60%{transform:scale(.95)}100%{transform:scale(1)}}',
    '@keyframes rkRing{0%{opacity:1;transform:scale(.6)}100%{opacity:0;transform:scale(1.45)}}',
    '@keyframes rkIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '@media (prefers-reduced-motion:reduce){.rkRoll,.rkLand,.rkRing,.rkIn,.rkStrip{animation:none}.rkBar>span{transition:none}}'
  ].join('\n');
  function stil() {
    if (document.getElementById('rk-stil')) return;
    var s = document.createElement('style'); s.id = 'rk-stil'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* ---------- Würfel (wie im Würfelkasten) ---------- */
  var FORM = {
    4: ['<polygon points="50,5 96,91 4,91"/>', '', '', 66],
    6: ['<rect x="9" y="9" width="82" height="82" rx="14"/>', '', '', 52],
    8: ['<polygon points="50,3 96,50 50,97 4,50"/>', '', '', 52],
    10: ['<polygon points="50,3 94,44 50,97 6,44"/>', 'M6 44L50 64L94 44M50 64L50 97', '', 40],
    12: ['<polygon points="50,5 94.7,37.5 77.6,90 22.4,90 5.3,37.5"/>', 'M50 5L50 25M94.7 37.5L74.7 44M77.6 90L65.3 73M22.4 90L34.7 73M5.3 37.5L25.3 44', '<polygon points="50,25 74.7,44 65.3,73 34.7,73 25.3,44"/>', 52],
    20: ['<polygon points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5"/>', 'M50 17L9 26.5M50 17L50 3M50 17L91 26.5M79.5 68L91 26.5M79.5 68L91 73.5M79.5 68L50 97M20.5 68L50 97M20.5 68L9 73.5M20.5 68L9 26.5', '<polygon points="50,17 79.5,68 20.5,68"/>', 53]
  };
  function wuerfelEl(w, ziel, farbe, flaeche, gross) {
    var f = FORM[w] || FORM[6], d = document.createElement('div');
    d.className = 'rkD'; d.style.color = farbe; d.style.setProperty('--rkF', flaeche);
    d.innerHTML = '<svg viewBox="0 0 100 100" width="' + gross + '" height="' + gross + '" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="47" style="fill:none;stroke:var(--text-warning);stroke-width:4;opacity:0;transform-origin:center;transform-box:fill-box"/>' +
      '<g style="fill:var(--rkF);stroke:currentColor;stroke-width:3.2;stroke-linejoin:round">' + f[0] + '</g>' +
      (f[1] ? '<path d="' + f[1] + '" style="fill:none;stroke:currentColor;stroke-width:1.6;opacity:.4"/>' : '') +
      (f[2] ? '<g style="fill:var(--rkF);stroke:currentColor;stroke-width:2.3;stroke-linejoin:round">' + f[2] + '</g>' : '') +
      '<text x="50" y="' + f[3] + '" text-anchor="middle" dominant-baseline="central" style="font-size:34px;font-weight:500;fill:currentColor">?</text></svg>' +
      '<span class="rkC"></span>';
    ziel.appendChild(d);
    var s = d.querySelector('svg');
    return { w: w, el: d, s: s, t: s.querySelector('text'), r: s.querySelector('circle'), c: d.querySelector('.rkC') };
  }
  function wirbel(ds, werte, fertig) {
    if (ruhig) { ds.forEach(function (d, i) { d.t.textContent = werte[i]; }); return fertig(); }
    var offen = ds.length;
    ds.forEach(function (d, k) {
      setTimeout(function () { anim(d.s, 'rkRoll'); }, k * 110);
      var z = Array(k * 2).fill(55).concat([40, 40, 45, 50, 60, 70, 85, 105, 130, 160, 200]), n = 0;
      (function schritt() {
        d.t.textContent = wurf(d.w);
        if (n < z.length) setTimeout(schritt, z[n++]);
        else { d.t.textContent = werte[k]; d.s.classList.remove('rkRoll'); anim(d.s, 'rkLand'); if (d.w === werte[k]) anim(d.r, 'rkRing'); if (--offen === 0) fertig(); }
      })();
    });
  }
  function kleinerW(w, an) {
    var f = FORM[w] || FORM[6];
    return '<svg viewBox="0 0 100 100" width="15" height="15" aria-hidden="true"><g style="fill:' + (an ? 'currentColor' : 'none') +
      ';stroke:currentColor;stroke-width:9;stroke-linejoin:round">' + f[0] + '</g></svg>';
  }
  function pips(frei, max) {
    var s = '<span class="rkPips" aria-hidden="true">';
    for (var i = 0; i < max; i++) s += '<span class="rkPip' + (i < frei ? ' an' : '') + '"></span>';
    return s + '</span>';
  }

  /* ---------- Einstellungen lesen ---------- */
  function lesen(C) {
    var R = {};
    R.nr = C.nr; R.figur = C.figur || 'Figur'; R.ort = C.ort || '';
    var tp = Array.isArray(C.tp) ? C.tp : [C.tp, C.tpMax];
    R.tp = zahl(tp[0]); R.tpMax = zahl(tp[1], R.tp) || R.tp;
    var tw = C.tw ? (Array.isArray(C.tw[0]) ? C.tw : [C.tw]) : [];
    R.tw = tw.map(function (t) { return { frei: zahl(t[0]), max: zahl(t[1]), w: zahl(t[2], 8) || 8 }; });
    R.kon = zahl(C.kon);
    R.erschoepfung = zahl(C.erschoepfung);
    R.hunger = Array.isArray(C.hunger) ? [zahl(C.hunger[0]), zahl(C.hunger[1])] : null;
    R.plaetze = (C.plaetze || []).map(function (p) { return [zahl(p[0]), zahl(p[1])]; });
    R.pakt = C.pakt ? { frei: zahl(C.pakt[0]), max: zahl(C.pakt[1]), grad: zahl(C.pakt[2], 1) || 1 } : null;
    R.ressourcen = (C.ressourcen || []).map(function (r) { return { name: r.name, frei: zahl(r.frei), max: zahl(r.max), rast: r.rast === 'kurz' ? 'kurz' : r.rast === 'lang' ? 'lang' : '' }; });
    R.lied = C.lied ? { name: C.lied.name || 'Lied der Erholung', w: zahl(C.lied.w, 6) || 6 } : null;
    R.faehigkeiten = (C.faehigkeiten || []).filter(function (f) { return f && f.name; });
    R.zauber = (C.zauber || []).filter(function (z) { return z && z.name; });
    R.ziele = Array.isArray(C.ziele) && C.ziele.length ? C.ziele.slice() : [R.figur];
    if (R.ziele.indexOf(R.figur) < 0) R.ziele.unshift(R.figur);
    R.vorbereiten = C.vorbereiten && Array.isArray(C.vorbereiten.liste) ? C.vorbereiten : null;
    R.essen = C.essen || null;
    R.versorgung = (C.versorgung || []).filter(function (v) { return v && v.name; });
    R.kurz = C.kurz === undefined ? true : C.kurz;
    R.lang = C.lang === undefined ? true : C.lang;
    R.held = !!C.held;
    R.start = C.start === 'lang' ? 'lang' : 'kurz';
    return R;
  }

  /* ---------- Lange Rast: was zurückkommt ---------- */
  function langeRast(R, gegessen) {
    var aus = [], budget = 0, gesamt = 0;
    R.tw.forEach(function (t) { gesamt += t.max; });
    budget = gesamt ? Math.max(1, Math.floor(gesamt / 2)) : 0;
    var tw = R.tw.map(function (t) { return { w: t.w, frei: t.frei, max: t.max }; })
      .sort(function (a, b) { return b.w - a.w; });
    var tws = tw.map(function (t) {
      var plus = Math.min(budget, t.max - t.frei); budget -= plus;
      return { w: t.w, von: t.frei, nach: t.frei + plus, max: t.max };
    });
    aus.push({ an: R.tp < R.tpMax, text: R.tp < R.tpMax ? 'TP ' + R.tp + ' → ' + R.tpMax : 'TP bleiben voll (' + R.tpMax + ')' });
    tws.forEach(function (t) {
      aus.push({ an: t.nach > t.von, text: 'Trefferwürfel W' + t.w + ' ' + (t.nach > t.von ? t.von + ' → ' + t.nach : 'bleiben bei ' + t.von) + ' von ' + t.max });
    });
    var leer = R.plaetze.some(function (p) { return p[0] < p[1]; });
    if (R.plaetze.length) aus.push({ an: leer, text: 'Zauberplätze ' + (leer ? 'wieder voll' : 'bleiben voll') + ' (' + R.plaetze.map(function (p) { return p[1]; }).join(' · ') + ')' });
    if (R.pakt) aus.push({ an: R.pakt.frei < R.pakt.max, text: 'Paktmagie ' + R.pakt.max + ' von ' + R.pakt.max });
    R.ressourcen.forEach(function (r) {
      if (r.rast) aus.push({ an: r.frei < r.max, text: r.name + ' ' + r.max + ' von ' + r.max });
    });
    if (R.erschoepfung > 0) {
      aus.push(gegessen ? { an: true, text: 'Erschöpfung ' + R.erschoepfung + ' → ' + (R.erschoepfung - 1) }
        : { an: false, text: 'Erschöpfung bleibt bei ' + R.erschoepfung + ': Ohne Essen und Trinken sinkt sie nicht.' });
    }
    return { liste: aus, tw: tws };
  }

  /* ---------- Aufbau ---------- */
  function start(C, wurzel) {
    stil();
    var R = lesen(C);
    var S = {
      modus: R.start === 'lang' ? (R.lang === true || R.kurz !== true ? 'lang' : 'kurz') : (R.kurz === true || R.lang !== true ? 'kurz' : 'lang'),
      tp: R.tp, tpStart: R.tp,
      tw: R.tw.map(function (t) { return { frei: t.frei, max: t.max, w: t.w }; }),
      plaetze: R.plaetze.map(function (p) { return p.slice(); }),
      pakt: R.pakt ? { frei: R.pakt.frei, max: R.pakt.max, grad: R.pakt.grad } : null,
      wuerfe: [], selbst: [], held: R.held, hm: null, lied: null,
      kurzLog: [], essenK: null, essenL: null, versorgt: {}, langZauber: {}, vorbereitet: null, gesendet: false
    };
    R.versorgung.forEach(function (v) { S.versorgt[v.name] = v.standard !== false; });
    if (R.vorbereiten) S.vorbereitet = (R.vorbereiten.vorbereitet || []).slice();
    var essenStandard = (function () {
      var E = R.essen;
      if (!E) return null;
      if (E.heute) return 'nichts';
      if (E.mahlzeit) return 'mahlzeit';
      if (zahl(E.rationen) + zahl(E.gepaeck) > 0) return 'ration';
      return 'nichts';
    })();
    S.essenK = S.essenL = essenStandard;
    // Heilung addiert sich nur bis zum Maximum; bei lauter Zugewinnen gilt min(Max, Start + Summe)
    function summeHeilung() {
      var n = 0;
      S.wuerfe.forEach(function (e) { n += e.tp || 0; });
      S.selbst.forEach(function (x) { n += x; });
      if (S.lied !== null) n += S.lied;
      return n;
    }
    function tpNeu() { S.tp = Math.min(R.tpMax, S.tpStart + summeHeilung()); return S.tp; }
    function verfallen() { return Math.max(0, S.tpStart + summeHeilung() - R.tpMax); }

    wurzel.className = 'rk';
    wurzel.innerHTML = '';
    var kopf = neu('div', 'rkKopf', ikon('campfire') + '<div><p class="rkT">Rast</p><p class="rkS">' + esc(R.figur + (R.ort ? ' · ' + R.ort : '')) + '</p></div>');
    var zustand = neu('div', 'rkZ');
    var wahl = neu('div', 'rkWahl');
    wahl.setAttribute('role', 'group'); wahl.setAttribute('aria-label', 'Art der Rast');
    var pKurz = neu('div', 'rkP'), pLang = neu('div', 'rkP');
    var fuss = neu('div', 'rkFuss');
    [kopf, zustand, wahl, pKurz, pLang, fuss].forEach(function (x) { wurzel.appendChild(x); });

    /* Zustand */
    function zeigeZustand() {
      var s = '';
      var anteil = R.tpMax ? Math.round(100 * Math.min(S.tp, R.tpMax) / R.tpMax) : 0;
      s += '<div class="rkK"><span class="rkKl">Trefferpunkte</span><span class="rkKw">' + S.tp + ' / ' + R.tpMax + '</span>' +
        '<span class="rkBar" role="img" aria-label="' + anteil + ' Prozent"><span style="width:' + anteil + '%"></span></span></div>';
      if (S.tw.length) {
        var tws = '';
        S.tw.forEach(function (t) {
          tws += '<span class="rkTw">';
          for (var i = 0; i < t.max; i++) tws += kleinerW(t.w, i < t.frei);
          tws += '</span>';
        });
        s += '<div class="rkK"><span class="rkKl">Trefferwürfel</span><span class="rkKw">' + S.tw.map(function (t) { return t.frei + ' / ' + t.max; }).join(' · ') +
          ' <small>' + S.tw.map(function (t) { return 'W' + t.w; }).join(', ') + vz(R.kon) + '</small></span><span class="rkZeile" style="color:var(--text-success)">' + tws + '</span></div>';
      }
      if (S.plaetze.length || S.pakt) {
        var z = '';
        S.plaetze.forEach(function (p, i) { if (p[1]) z += '<span class="rkZeile">' + (i + 1) + '.' + pips(p[0], p[1]) + '</span>'; });
        if (S.pakt) z += '<span class="rkZeile">Pakt ' + S.pakt.grad + '.' + pips(S.pakt.frei, S.pakt.max) + '</span>';
        s += '<div class="rkK"><span class="rkKl">Zauberplätze</span><span class="rkKw" style="font-size:13px;font-weight:400;color:var(--text-accent);gap:12px">' + z + '</span>' +
          '<span class="sr-only">' + S.plaetze.map(function (p, i) { return (i + 1) + '. Grad ' + p[0] + ' von ' + p[1]; }).join(', ') + '</span></div>';
      }
      R.ressourcen.forEach(function (r) {
        s += '<div class="rkK"><span class="rkKl">' + esc(r.name) + '</span><span class="rkKw">' + r.frei + ' / ' + r.max +
          ' <span style="color:var(--text-accent)">' + pips(r.frei, r.max) + '</span></span></div>';
      });
      var ers = R.erschoepfung, hunger = R.hunger && R.hunger[0] > 0;
      s += '<div class="rkK"><span class="rkKl">Erschöpfung</span><span class="rkKw">' + ers +
        (ers > 0 ? ' <small>' + ERSCHOEPFUNG[Math.min(ers, 6)] + '</small>' : '') + '</span>' +
        (hunger ? '<span class="rkKl" style="color:var(--text-warning)">Hunger: ' + R.hunger[0] + ' von ' + R.hunger[1] + ' Tagen</span>' : '') + '</div>';
      zustand.innerHTML = s;
    }

    /* Auswahl kurz / lang */
    var bKurz = neu('button', '', ikon('hourglass') + 'Kurze Rast<span>eine Stunde</span>');
    var bLang = neu('button', '', ikon('moon') + 'Lange Rast<span>acht Stunden</span>');
    bKurz.type = bLang.type = 'button';
    wahl.appendChild(bKurz); wahl.appendChild(bLang);
    function modus(m) {
      if (S.gesendet) return;
      S.modus = m;
      bKurz.setAttribute('aria-pressed', String(m === 'kurz'));
      bLang.setAttribute('aria-pressed', String(m === 'lang'));
      pKurz.hidden = m !== 'kurz'; pLang.hidden = m !== 'lang';
      zeigeFuss();
    }
    bKurz.onclick = function () { modus('kurz'); };
    bLang.onclick = function () { modus('lang'); };

    function sektion(ziel, ic, titel, zusatz) {
      var s = neu('div', 'rkSek');
      s.appendChild(neu('p', 'rkH', ikon(ic) + '<span>' + esc(titel) + '</span>' + (zusatz ? '<small>' + esc(zusatz) + '</small>' : '')));
      ziel.appendChild(s);
      return s;
    }
    function knopf(ziel, html, f, cls) {
      var b = neu('button', cls || '', html); b.type = 'button'; b.onclick = f; ziel.appendChild(b); return b;
    }
    function gruppe(ziel, optionen, wert, setze, label) {
      var g = neu('div', 'rkChips'); g.setAttribute('role', 'radiogroup'); if (label) g.setAttribute('aria-label', label);
      optionen.forEach(function (o) {
        var b = neu('button', 'rkChip', esc(o.text) + (o.klein ? ' <small>' + esc(o.klein) + '</small>' : ''));
        b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(o.wert === wert));
        b.onclick = function () {
          if (S.gesendet) return;
          Array.prototype.forEach.call(g.children, function (x) { x.setAttribute('aria-checked', 'false'); });
          b.setAttribute('aria-checked', 'true'); setze(o.wert); zeigeFuss();
        };
        g.appendChild(b);
      });
      ziel.appendChild(g);
      return g;
    }

    /* ----- Essen und Versorgung ----- */
    function essenOptionen() {
      var E = R.essen, o = [], ra = zahl(E.rationen), ge = zahl(E.gepaeck);
      if (ra + ge > 0) o.push({ wert: 'ration', text: 'Eine Ration', klein: ra && ge ? ra + ' dabei, ' + ge + ' bei ' + (E.traeger || 'Gepäck') : ra ? ra + ' dabei' : ge + ' bei ' + (E.traeger || 'Gepäck') });
      if (E.mahlzeit) o.push({ wert: 'mahlzeit', text: E.mahlzeit, klein: E.preis || '' });
      o.push({ wert: 'nichts', text: E.heute ? 'Nichts mehr' : 'Nichts essen' });
      return o;
    }
    function essenText(w, vorher) {
      if (!R.essen || !w) return '';
      var isst = vorher ? 'isst vorher' : 'isst';
      if (w === 'ration') return isst + ' eine Ration' + (zahl(R.essen.rationen) > 0 ? '' : ' aus dem Gepäck bei ' + (R.essen.traeger || 'den Tieren'));
      if (w === 'mahlzeit') return (vorher ? 'vorher ' : '') + 'Mahlzeit: ' + R.essen.mahlzeit + (R.essen.preis ? ' (' + R.essen.preis + ')' : '');
      return R.essen.heute ? '' : vorher ? 'ohne Essen' : 'isst nichts';
    }
    function essenSektion(ziel, lang) {
      if (!R.essen) return;
      var E = R.essen, s = sektion(ziel, 'tools-kitchen-2', lang ? 'Vor dem Schlafen essen' : 'Essen',
        E.heute ? 'heute schon gegessen' : R.hunger && R.hunger[0] ? 'Hunger ' + R.hunger[0] + ' von ' + R.hunger[1] + ' Tagen' : 'heute noch nichts gegessen');
      gruppe(s, essenOptionen(), lang ? S.essenL : S.essenK, function (w) { if (lang) { S.essenL = w; zeigeLang(); } else S.essenK = w; }, 'Essen');
      if (lang && R.erschoepfung > 0) s.appendChild(neu('p', 'rkInfo', 'Die Erschöpfung sinkt nur mit Essen und Trinken um eine Stufe.'));
    }
    function versorgungSektion(ziel) {
      if (!R.versorgung.length) return;
      var s = sektion(ziel, 'horse', 'Versorgung'), g = neu('div', 'rkChips');
      R.versorgung.forEach(function (v) {
        var b = neu('button', 'rkChip', ikon(S.versorgt[v.name] ? 'check' : 'square', 15) + esc(v.name) + (v.text ? ' <small>' + esc(v.text) + '</small>' : ''));
        b.type = 'button'; b.setAttribute('aria-pressed', String(!!S.versorgt[v.name]));
        b.onclick = function () {
          if (S.gesendet) return;
          S.versorgt[v.name] = !S.versorgt[v.name];
          b.setAttribute('aria-pressed', String(S.versorgt[v.name]));
          b.querySelector('.ti').className = 'ti ti-' + (S.versorgt[v.name] ? 'check' : 'square');
          zeigeFuss();
        };
        g.appendChild(b);
      });
      s.appendChild(g);
    }
    function versorgungText() {
      return R.versorgung.map(function (v) { return v.name + (S.versorgt[v.name] ? ' versorgt' + (v.text ? ' (' + v.text + ')' : '') : ' nicht versorgt'); });
    }

    /* ----- Zauber ----- */
    function wuerfelVon(z, g) {
      var ws = (z.heilung || []).map(function (x) { return [x[0], x[1]]; });
      var extra = Math.max(0, g - (z.grad || 0));
      if (extra && z.hoeher) z.hoeher.forEach(function (x) {
        var t = ws.filter(function (y) { return y[1] === x[1]; })[0];
        if (t) t[0] += x[0] * extra; else ws.push([x[0] * extra, x[1]]);
      });
      return ws;
    }
    function freieGrade(z, voll) {
      if (!z.grad || z.ritual === 'nur') return [];
      var g = [];
      S.plaetze.forEach(function (p, i) { if (i + 1 >= z.grad && (voll ? p[1] : p[0]) > 0) g.push({ wert: String(i + 1), text: grad(i + 1) }); });
      if (S.pakt && S.pakt.grad >= z.grad && (voll ? S.pakt.max : S.pakt.frei) > 0) g.push({ wert: 'pakt', text: 'Pakt, ' + grad(S.pakt.grad) });
      return g;
    }
    function gradZahl(w) { return w === 'pakt' ? S.pakt.grad : +w; }
    function zielWahl(box, z, auswahl, aendern) {
      var n = Math.max(0, zahl(z.ziele, 1));
      if (!n) return;
      var g = neu('div', 'rkChips'), fehler = neu('p', 'rkFehler');
      fehler.hidden = true;
      R.ziele.forEach(function (name) {
        var b = neu('button', 'rkChip', esc(name)); b.type = 'button';
        b.setAttribute('aria-pressed', String(auswahl.indexOf(name) >= 0));
        b.onclick = function () {
          if (S.gesendet) return;
          var i = auswahl.indexOf(name);
          if (i >= 0) auswahl.splice(i, 1);
          else if (n === 1) { auswahl.length = 0; auswahl.push(name); }
          else if (auswahl.length >= n) { fehler.textContent = 'Höchstens ' + n + ' Ziele.'; fehler.hidden = false; return; }
          else auswahl.push(name);
          fehler.hidden = true;
          Array.prototype.forEach.call(g.children, function (x) { x.setAttribute('aria-pressed', String(auswahl.indexOf(x.textContent) >= 0)); });
          if (aendern) aendern();
          zeigeFuss();
        };
        g.appendChild(b);
      });
      var zeile = neu('div', 'rkZk');
      zeile.appendChild(neu('span', 'rkS', n > 1 ? 'Bis zu ' + n + ' Ziele:' : 'Ziel:'));
      box.appendChild(zeile); box.appendChild(g); box.appendChild(fehler);
    }
    function zauberKopf(box, z) {
      var k = neu('div', 'rkZk');
      k.innerHTML = '<b>' + esc(z.name) + '</b>';
      box.appendChild(k);
      if (z.wirkung) box.appendChild(neu('p', 'rkInfo', esc(z.wirkung)));
      return k;
    }
    function gradWahl(box, z, voll, wert, setze) {
      var g = freieGrade(z, voll);
      if (z.ritual) g.unshift({ wert: 'ritual', text: 'als Ritual, ohne Platz' });
      if (g.length < 2) {
        var einzig = g.length ? g[0] : z.grad ? null : { wert: '0', text: grad(0) };
        if (einzig) box.querySelector('.rkZk').appendChild(neu('span', 'rkB', esc(einzig.text)));
        return einzig ? einzig.wert : null;
      }
      var sel = neu('select'); sel.setAttribute('aria-label', 'Zauberplatz für ' + z.name);
      g.forEach(function (o) { var op = neu('option', '', esc(o.text)); op.value = o.wert; sel.appendChild(op); });
      sel.value = wert && g.some(function (o) { return o.wert === wert; }) ? wert : g[0].wert;
      sel.onchange = function () { setze(sel.value); zeigeFuss(); };
      box.querySelector('.rkZk').appendChild(sel);
      return sel.value;
    }
    function platzFrei(w) {
      if (w === 'pakt') return S.pakt.frei > 0;
      if (w && w !== 'ritual' && w !== '0') return S.plaetze[+w - 1][0] > 0;
      return true;
    }
    function platzVerbrauchen(w) {
      if (w === 'pakt') S.pakt.frei--;
      else if (w && w !== 'ritual' && w !== '0') S.plaetze[+w - 1][0]--;
    }
    function platzText(w) { return w === 'ritual' ? 'als Ritual' : w === 'pakt' ? 'Pakt, ' + grad(S.pakt.grad) : w === '0' || !w ? '' : grad(+w); }

    // Zauber während der kurzen Rast: sofort wirken, Heilung würfeln
    function kurzZauber(ziel, z) {
      var box = neu('div', 'rkZa'), auswahl = [R.figur], platz = null;
      zauberKopf(box, z);
      platz = gradWahl(box, z, false, null, function (w) { platz = w; });
      if (platz === null) { box.appendChild(neu('p', 'rkInfo', 'Kein passender Zauberplatz frei.')); ziel.appendChild(box); return; }
      var wahlTeil = neu('div', 'rkZa'); wahlTeil.style.padding = '0';
      zielWahl(wahlTeil, z, auswahl);
      box.appendChild(wahlTeil);
      var reihe = neu('div', 'rkKn'), dice = neu('div', 'rkDice'), info = neu('p', 'rkInfo');
      info.hidden = true;
      knopf(reihe, ikon('wand', 16) + 'Wirken', function () {
        if (S.gesendet) return;
        if (zahl(z.ziele, 1) && !auswahl.length) { info.hidden = false; info.style.color = 'var(--text-danger)'; info.textContent = 'Wähle zuerst ein Ziel.'; return; }
        if (!platzFrei(platz)) { info.hidden = false; info.style.color = 'var(--text-danger)'; info.textContent = 'Dieser Zauberplatz ist schon verbraucht.'; return; }
        var g = platz === 'ritual' || platz === '0' ? (z.grad || 0) : gradZahl(platz);
        platzVerbrauchen(platz); zeigeZustand();
        reihe.remove(); wahlTeil.remove();
        var auswahlSel = box.querySelector('select');
        if (auswahlSel) auswahlSel.replaceWith(neu('span', 'rkB', esc(platzText(platz) || grad(0))));
        var ws = wuerfelVon(z, g), seiten = [];
        ws.forEach(function (x) { for (var n = 0; n < x[0]; n++) seiten.push(x[1]); });
        var eintrag = { text: z.name + (platzText(platz) ? ' (' + platzText(platz) + ')' : '') + (auswahl.length ? ' auf ' + liste(auswahl) : '') };
        S.kurzLog.push(eintrag);
        if (!seiten.length) { info.hidden = false; info.style.color = ''; info.textContent = 'Gewirkt.'; zeigeFuss(); return; }
        var ds = seiten.map(function (w) { return wuerfelEl(w, dice, 'var(--text-success)', 'var(--bg-success)', 40); });
        var werte = seiten.map(wurf);
        wirbel(ds, werte, function () {
          var summe = werte.reduce(function (a, b) { return a + b; }, 0) + zahl(z.mod);
          info.hidden = false; info.style.color = ''; info.className = 'rkInfo rkIn';
          info.innerHTML = werte.join(' + ') + pm(zahl(z.mod)) + ' = <b style="font-weight:500;color:var(--text-primary)">' + summe + ' TP</b>' + (auswahl.length ? ' für ' + esc(liste(auswahl)) : '');
          eintrag.text += ': ' + formel(ws, zahl(z.mod)) + ' = ' + summe;
          if (auswahl.indexOf(R.figur) >= 0) { S.selbst.push(summe); tpNeu(); zeigeZustand(); }
          zeigeFuss();
        });
      });
      box.appendChild(reihe); box.appendChild(dice); box.appendChild(info);
      ziel.appendChild(box);
    }

    // Zauber vor oder nach der langen Rast: nur planen
    function langZauber(ziel, z) {
      var box = neu('div', 'rkZa'), plan = S.langZauber[z.name] = { an: false, ziele: [], platz: null };
      var k = zauberKopf(box, z);
      var schalter = neu('button', 'rkChip', ikon('square', 15) + (z.wann === 'vor' ? 'Vorher wirken' : 'Danach wirken'));
      schalter.type = 'button'; schalter.setAttribute('aria-pressed', 'false');
      k.appendChild(schalter);
      var mehr = neu('div', 'rkZa'); mehr.style.padding = '0'; mehr.hidden = true;
      plan.platz = gradWahl(box, z, z.wann === 'nach', null, function (w) { plan.platz = w; });
      if (plan.platz === null) { box.appendChild(neu('p', 'rkInfo', 'Kein passender Zauberplatz frei.')); schalter.remove(); ziel.appendChild(box); return; }
      if (zahl(z.ziele, 1)) { plan.ziele.push(R.figur); zielWahl(mehr, z, plan.ziele); }
      schalter.onclick = function () {
        if (S.gesendet) return;
        plan.an = !plan.an;
        schalter.setAttribute('aria-pressed', String(plan.an));
        schalter.querySelector('.ti').className = 'ti ti-' + (plan.an ? 'check' : 'square');
        mehr.hidden = !plan.an;
        zeigeFuss();
      };
      box.appendChild(mehr);
      ziel.appendChild(box);
    }
    function langZauberText(wann) {
      return R.zauber.filter(function (z) { return z.wann === wann && S.langZauber[z.name] && S.langZauber[z.name].an; }).map(function (z) {
        var p = S.langZauber[z.name];
        return z.name + (platzText(p.platz) ? ' (' + platzText(p.platz) + ')' : '') + (p.ziele.length ? ' auf ' + liste(p.ziele) : '');
      });
    }

    /* ----- Klassenfähigkeiten ----- */
    function faehigkeit(ziel, f) {
      var box = neu('div', 'rkZa'), k = neu('div', 'rkZk');
      k.innerHTML = '<b>' + esc(f.name) + '</b>' + (f.art === 'pool' ? '<span class="rkB">' + zahl(f.frei) + ' von ' + zahl(f.max) + ' übrig</span>' : '');
      box.appendChild(k);
      if (f.text) box.appendChild(neu('p', 'rkInfo', esc(f.text)));
      if (f.art === 'heilung' && f.wuerfel) {
        var dice = neu('div', 'rkDice'), info = neu('p', 'rkInfo'), reihe = neu('div', 'rkKn');
        knopf(reihe, ikon('dice-5', 16) + formel(f.wuerfel, zahl(f.mod)) + ' würfeln', function () {
          if (S.gesendet) return;
          reihe.remove();
          var seiten = []; f.wuerfel.forEach(function (x) { for (var n = 0; n < x[0]; n++) seiten.push(x[1]); });
          var ds = seiten.map(function (w) { return wuerfelEl(w, dice, 'var(--text-success)', 'var(--bg-success)', 40); }), werte = seiten.map(wurf);
          wirbel(ds, werte, function () {
            var summe = werte.reduce(function (a, b) { return a + b; }, 0) + zahl(f.mod);
            info.className = 'rkInfo rkIn';
            info.innerHTML = werte.join(' + ') + pm(zahl(f.mod)) + ' = <b style="font-weight:500;color:var(--text-primary)">' + summe + ' TP</b>';
            S.selbst.push(summe); tpNeu(); zeigeZustand();
            S.kurzLog.push({ text: f.name + ': ' + formel(f.wuerfel, zahl(f.mod)) + ' = ' + summe });
            zeigeFuss();
          });
        });
        box.appendChild(reihe); box.appendChild(dice); box.appendChild(info);
      } else if (f.art === 'plaetze') {
        var summe = zahl(f.summe, 1), bis = zahl(f.bisGrad, 5), wahlP = {}, zeilen = neu('div', 'rkKn'), rest = neu('p', 'rkInfo'), fertig = false;
        var offen = S.plaetze.map(function (p, i) { return { g: i + 1, leer: p[1] - p[0] }; }).filter(function (x) { return x.g <= bis && x.leer > 0; });
        if (!offen.length) box.appendChild(neu('p', 'rkInfo', 'Kein verbrauchter Zauberplatz, den du zurückholen könntest.'));
        else {
          var genutzt = function () { var s = 0; Object.keys(wahlP).forEach(function (g) { s += g * wahlP[g]; }); return s; };
          var zeichne = function () {
            zeilen.innerHTML = '';
            offen.forEach(function (x) {
              var n = wahlP[x.g] || 0, w = neu('span', 'rkZeile');
              var minus = neu('button', 'rkChip', '−'), plus = neu('button', 'rkChip', '+');
              minus.type = plus.type = 'button';
              minus.setAttribute('aria-label', 'Einen Platz ' + grad(x.g) + ' weniger'); plus.setAttribute('aria-label', 'Einen Platz ' + grad(x.g) + ' mehr');
              minus.onclick = function () { if (!fertig && n > 0) { wahlP[x.g] = n - 1; zeichne(); } };
              plus.onclick = function () { if (!fertig && n < x.leer && genutzt() + x.g <= summe) { wahlP[x.g] = n + 1; zeichne(); } };
              w.appendChild(neu('span', '', grad(x.g) + ':')); w.appendChild(minus); w.appendChild(neu('b', '', String(n))); w.appendChild(plus);
              zeilen.appendChild(w);
            });
            rest.textContent = 'Noch ' + (summe - genutzt()) + ' von ' + summe + ' Graden frei.';
          };
          zeichne();
          box.appendChild(zeilen); box.appendChild(rest);
          var reihe2 = neu('div', 'rkKn');
          knopf(reihe2, ikon('refresh', 16) + 'Zurückholen', function () {
            if (S.gesendet || !genutzt()) return;
            fertig = true; reihe2.remove();
            var teile = [];
            Object.keys(wahlP).forEach(function (g) { if (wahlP[g]) { S.plaetze[g - 1][0] += wahlP[g]; teile.push(wahlP[g] + ' × ' + grad(+g)); } });
            S.kurzLog.push({ text: f.name + ': ' + teile.join(', ') });
            rest.textContent = 'Zurückgeholt: ' + teile.join(', ') + '.';
            zeigeZustand(); zeigeFuss();
          });
          box.appendChild(reihe2);
        }
      } else if (f.art === 'pool') {
        var frei = zahl(f.frei), wahlZ = [R.figur], reihe3 = neu('div', 'rkKn'), eingabe = neu('input'), fehler = neu('p', 'rkFehler');
        fehler.hidden = true;
        eingabe.type = 'number'; eingabe.min = '1'; eingabe.max = String(frei); eingabe.step = '1'; eingabe.value = String(Math.min(frei, 5));
        eingabe.style.width = '80px'; eingabe.setAttribute('aria-label', (f.einheit || 'Punkte') + ' aus ' + f.name);
        eingabe.oninput = function () { fehler.hidden = true; };
        zielWahl(box, { ziele: 1 }, wahlZ);
        reihe3.appendChild(eingabe); reihe3.appendChild(neu('span', 'rkS', esc(f.einheit || 'TP')));
        knopf(reihe3, 'Anwenden', function () {
          if (S.gesendet) return;
          var n = Math.round(+eingabe.value);
          if (!(n >= 1 && n <= frei)) { fehler.textContent = 'Gib eine Zahl von 1 bis ' + frei + ' ein.'; fehler.hidden = false; return; }
          if (!wahlZ.length) { fehler.textContent = 'Wähle zuerst ein Ziel.'; fehler.hidden = false; return; }
          reihe3.remove();
          if (wahlZ[0] === R.figur && (f.einheit || 'TP') === 'TP') { S.selbst.push(n); tpNeu(); zeigeZustand(); }
          S.kurzLog.push({ text: f.name + ': ' + n + ' ' + (f.einheit || 'TP') + ' auf ' + wahlZ[0] + ' (übrig ' + (frei - n) + ' von ' + zahl(f.max) + ')' });
          box.appendChild(neu('p', 'rkInfo rkIn', n + ' ' + esc(f.einheit || 'TP') + ' für ' + esc(wahlZ[0]) + '.'));
          zeigeFuss();
        });
        box.appendChild(reihe3); box.appendChild(fehler);
      }
      ziel.appendChild(box);
    }

    /* ----- Kurze Rast ----- */
    var twDice, twInfo, twKnoepfe, liedBox;
    function twGesamt() { var n = 0; S.tw.forEach(function (t) { n += t.frei; }); return n; }
    function zeigeTwKnoepfe() {
      twKnoepfe.innerHTML = '';
      if (S.gesendet) return;
      if (!twGesamt()) { twKnoepfe.appendChild(neu('p', 'rkInfo', S.wuerfe.length ? 'Alle Trefferwürfel ausgegeben.' : 'Keine Trefferwürfel mehr frei. Die lange Rast bringt welche zurück.')); return; }
      if (S.tp >= R.tpMax) { twKnoepfe.appendChild(neu('p', 'rkInfo', S.wuerfe.length ? 'Wieder bei vollen Kräften.' : 'Du bist bei vollen Kräften.')); return; }
      S.tw.forEach(function (t, i) {
        if (!t.frei) return;
        knopf(twKnoepfe, ikon('dice-5', 16) + 'W' + t.w + vz(R.kon) + ' würfeln', function () { twWerfen(i); });
      });
    }
    function twStand(vorher, zusatz) {
      var v = verfallen();
      twInfo.className = 'rkInfo rkIn';
      twInfo.innerHTML = (zusatz ? zusatz + ' ' : '') + 'TP ' + vorher + ' → <b style="font-weight:500;color:var(--text-primary)">' + S.tp + '</b> von ' + R.tpMax +
        (v ? ' (' + v + ' verfallen)' : '');
    }
    function twWerfen(i) {
      if (S.gesendet) return;
      var t = S.tw[i]; if (!t || !t.frei) return;
      t.frei--; twKnoepfe.innerHTML = '';
      var d = wuerfelEl(t.w, twDice, 'var(--text-success)', 'var(--bg-success)', 52), w = wurf(t.w);
      var eintrag = { w: t.w, wurf: w, d: d, tp: 0 };
      S.wuerfe.push(eintrag);
      zeigeZustand();
      wirbel([d], [w], function () {
        eintrag.tp = Math.max(0, eintrag.wurf + R.kon);
        d.c.textContent = R.kon ? vz(R.kon) + ' = ' + eintrag.tp : '';
        var vorher = S.tp; tpNeu(); twStand(vorher);
        zeigeZustand();
        setTimeout(function () {
          zeigeTwKnoepfe();
          if (S.held && !S.hm) knopf(twKnoepfe, ikon('flame', 16) + 'Heldenmut: neu würfeln', function () { heldenmut(eintrag); }, 'rkHm');
          zeigeFuss();
        }, warte(250));
      });
    }
    function heldenmut(e) {
      if (S.gesendet || S.hm) return;
      twKnoepfe.innerHTML = '';
      var alt = e.wurf, w = wurf(e.w);
      S.hm = [alt, w]; S.held = false;
      e.d.el.style.color = 'var(--text-warning)';
      wirbel([e.d], [w], function () {
        e.wurf = w; e.tp = Math.max(0, w + R.kon);
        e.d.el.style.color = 'var(--text-success)';
        e.d.c.innerHTML = ikon('flame') + ' neu' + (R.kon ? ' ' + vz(R.kon) + ' = ' + e.tp : '');
        e.d.c.style.color = 'var(--text-warning)';
        var vorher = S.tp; tpNeu(); twStand(vorher, 'Heldenmut: ' + alt + ' → ' + w + '.');
        zeigeZustand(); zeigeTwKnoepfe(); zeigeFuss();
      });
    }
    function baueKurz() {
      pKurz.innerHTML = '';
      if (R.kurz !== true) {
        pKurz.appendChild(neu('div', 'rkSperre', ikon('lock') + '<span>' + esc(typeof R.kurz === 'string' ? R.kurz : 'Eine kurze Rast geht gerade nicht.') + '</span>'));
        return;
      }
      if (S.tw.length) {
        var s = sektion(pKurz, 'heart-plus', 'Trefferwürfel', 'einzeln würfeln, wie am Tisch');
        twDice = neu('div', 'rkDice'); twInfo = neu('p', 'rkInfo'); twKnoepfe = neu('div', 'rkKn');
        twInfo.setAttribute('aria-live', 'polite');
        s.appendChild(twDice); s.appendChild(twInfo); s.appendChild(twKnoepfe);
        if (R.lied) {
          liedBox = neu('div', 'rkDice');
          s.appendChild(neu('p', 'rkInfo', ikon('music', 15) + ' ' + esc(R.lied.name) + ': Gibst du mindestens einen Trefferwürfel aus, kommt am Ende ein W' + R.lied.w + ' dazu.'));
          s.appendChild(liedBox);
        }
        zeigeTwKnoepfe();
      }
      var zs = R.zauber.filter(function (z) { return z.wann === 'kurz' || z.wann === 'immer'; });
      if (zs.length) { var sz = sektion(pKurz, 'wand', 'Zauber während der Rast'); zs.forEach(function (z) { kurzZauber(sz, z); }); }
      var fs = R.faehigkeiten.filter(function (f) { return f.rast === 'kurz' || f.rast === 'beide' || !f.rast; });
      if (fs.length) { var sf = sektion(pKurz, 'sparkles', 'Fähigkeiten'); fs.forEach(function (f) { faehigkeit(sf, f); }); }
      essenSektion(pKurz, false);
      versorgungSektion(pKurz);
      var zurueck = R.ressourcen.filter(function (r) { return r.rast === 'kurz'; }).map(function (r) { return r.name; });
      if (S.pakt) zurueck.unshift('Paktmagie');
      if (zurueck.length) { var sr = sektion(pKurz, 'refresh', 'Kehrt zurück'); sr.appendChild(neu('p', 'rkInfo', esc(liste(zurueck)) + '.')); }
    }

    /* ----- Lange Rast ----- */
    var langListe;
    function zeigeLang() {
      if (!langListe) return;
      var gegessen = S.essenL === 'ration' || S.essenL === 'mahlzeit' || (R.essen && R.essen.heute) || !R.essen;
      var L = langeRast(R, gegessen);
      langListe.innerHTML = L.liste.map(function (x) {
        return '<div class="' + (x.an ? '' : 'aus') + '">' + ikon(x.an ? 'arrow-back-up' : 'minus') + '<span>' + esc(x.text) + '</span></div>';
      }).join('');
    }
    function baueLang() {
      pLang.innerHTML = '';
      if (R.lang !== true) {
        pLang.appendChild(neu('div', 'rkSperre', ikon('lock') + '<span>' + esc(typeof R.lang === 'string' ? R.lang : 'Eine lange Rast geht gerade nicht.') + '</span>'));
        return;
      }
      var s = sektion(pLang, 'sunrise', 'Am Morgen zurück', 'wenn die Nacht ruhig bleibt');
      langListe = neu('div', 'rkL'); s.appendChild(langListe);
      essenSektion(pLang, true);
      versorgungSektion(pLang);
      var vor = R.zauber.filter(function (z) { return z.wann === 'vor'; });
      if (vor.length) { var sv = sektion(pLang, 'moon-stars', 'Vor dem Schlafen wirken'); vor.forEach(function (z) { langZauber(sv, z); }); }
      var nach = R.zauber.filter(function (z) { return z.wann === 'nach'; });
      if (nach.length) { var sn = sektion(pLang, 'sun', 'Nach dem Aufwachen wirken', 'mit frischen Plätzen'); nach.forEach(function (z) { langZauber(sn, z); }); }
      var fl = R.faehigkeiten.filter(function (f) { return f.rast === 'lang'; });
      if (fl.length) { var sfl = sektion(pLang, 'sparkles', 'Fähigkeiten'); fl.forEach(function (f) { sfl.appendChild(neu('p', 'rkInfo', '<b style="font-weight:500;color:var(--text-primary)">' + esc(f.name) + '</b>' + (f.text ? ': ' + esc(f.text) : ''))); }); }
      if (R.vorbereiten) vorbereitung(pLang);
      zeigeLang();
    }
    function vorbereitung(ziel) {
      var V = R.vorbereiten, anzahl = zahl(V.anzahl), immer = V.immer || [];
      var s = sektion(ziel, 'book-2', 'Zauber vorbereiten'), zaehler = neu('p', 'rkInfo'), fehler = neu('p', 'rkFehler');
      fehler.hidden = true;
      s.appendChild(zaehler);
      var eintraege = V.liste.map(function (x) { return Array.isArray(x) ? { name: x[0], grad: zahl(x[1]) } : { name: x.name, grad: zahl(x.grad) }; });
      var grade = {};
      eintraege.forEach(function (e) { (grade[e.grad] = grade[e.grad] || []).push(e); });
      function zaehle() { zaehler.textContent = S.vorbereitet.filter(function (n) { return immer.indexOf(n) < 0; }).length + ' von ' + anzahl + ' vorbereitet' + (immer.length ? ', dazu immer: ' + liste(immer) : '') + '.'; }
      Object.keys(grade).sort(function (a, b) { return a - b; }).forEach(function (g) {
        var zeile = neu('div', 'rkZa'); zeile.appendChild(neu('span', 'rkS', esc(grad(+g))));
        var chips = neu('div', 'rkChips');
        grade[g].forEach(function (e) {
          var fest = immer.indexOf(e.name) >= 0, an = fest || S.vorbereitet.indexOf(e.name) >= 0;
          var b = neu('button', 'rkChip', ikon(an ? 'check' : 'square', 15) + esc(e.name) + (fest ? ' <small>immer</small>' : ''));
          b.type = 'button'; b.setAttribute('aria-pressed', String(an));
          b.onclick = function () {
            if (S.gesendet || fest) return;
            var i = S.vorbereitet.indexOf(e.name);
            if (i >= 0) S.vorbereitet.splice(i, 1);
            else {
              if (S.vorbereitet.filter(function (n) { return immer.indexOf(n) < 0; }).length >= anzahl) { fehler.textContent = 'Mehr als ' + anzahl + ' gehen nicht. Leg erst einen anderen ab.'; fehler.hidden = false; return; }
              S.vorbereitet.push(e.name);
            }
            fehler.hidden = true;
            var jetzt = S.vorbereitet.indexOf(e.name) >= 0;
            b.setAttribute('aria-pressed', String(jetzt)); b.querySelector('.ti').className = 'ti ti-' + (jetzt ? 'check' : 'square');
            zaehle(); zeigeFuss();
          };
          chips.appendChild(b);
        });
        zeile.appendChild(chips); s.appendChild(zeile);
      });
      s.appendChild(fehler);
      zaehle();
    }
    function vorbereitungText() {
      if (!R.vorbereiten) return '';
      var alt = R.vorbereiten.vorbereitet || [], immer = R.vorbereiten.immer || [];
      var neuA = S.vorbereitet.filter(function (n) { return alt.indexOf(n) < 0; }), weg = alt.filter(function (n) { return S.vorbereitet.indexOf(n) < 0; });
      if (!neuA.length && !weg.length) return 'Vorbereitung unverändert';
      return 'Vorbereitet: ' + S.vorbereitet.filter(function (n) { return immer.indexOf(n) < 0; }).join(', ') +
        ' (neu: ' + (neuA.join(', ') || 'nichts') + '; abgelegt: ' + (weg.join(', ') || 'nichts') + ')';
    }

    /* ----- Nachricht und Abschluss ----- */
    function nachricht() {
      var m = ['Rast #' + R.nr];
      if (S.modus === 'kurz') {
        m.push('Kurze Rast');
        if (S.wuerfe.length) {
          var arten = {};
          S.wuerfe.forEach(function (e) { (arten[e.w] = arten[e.w] || []).push(e); });
          Object.keys(arten).forEach(function (w) {
            var es = arten[w], sum = es.reduce(function (a, e) { return a + (e.tp || 0); }, 0);
            m.push('Trefferwürfel ' + es.length + ' × W' + w + vz(R.kon) + ': ' + es.map(function (e) { return e.wurf + vz(R.kon); }).join(', ') + ' = ' + sum);
          });
          if (S.hm) m.push('Heldenmut ' + S.hm[0] + ' → ' + S.hm[1]);
          if (S.lied) m.push(R.lied.name + ' W' + R.lied.w + ': ' + S.lied);
        } else if (S.tw.length) m.push('ohne Trefferwürfel');
        S.kurzLog.forEach(function (e) { m.push(e.text); });
        if (S.tp !== S.tpStart) m.push('TP ' + S.tpStart + ' → ' + S.tp + '/' + R.tpMax);
        var tw = S.tw.map(function (t) { return t.frei + '/' + t.max; }).join(', ');
        if (S.wuerfe.length) m.push('Trefferwürfel übrig ' + tw);
        var e = essenText(S.essenK); if (e) m.push(e);
      } else {
        m.push('Lange Rast');
        var e2 = essenText(S.essenL, true); if (e2) m.push(e2);
        langZauberText('vor').forEach(function (t) { m.push('vorher ' + t); });
        langZauberText('nach').forEach(function (t) { m.push('danach ' + t); });
        var v = vorbereitungText(); if (v) m.push(v);
      }
      versorgungText().forEach(function (t) { m.push(t); });
      return m.join(' · ');
    }
    var vorschau = neu('p', 'rkVor'), aktion = neu('div', 'rkKn'), ergebnis = neu('div', '');
    ergebnis.setAttribute('aria-live', 'polite');
    fuss.appendChild(vorschau); fuss.appendChild(aktion); fuss.appendChild(ergebnis);
    function zeigeFuss() {
      if (S.gesendet) return;
      var gesperrt = S.modus === 'kurz' ? R.kurz !== true : R.lang !== true;
      aktion.innerHTML = '';
      vorschau.hidden = gesperrt;
      if (gesperrt) return;
      if (S.modus === 'lang') zeigeLang();
      vorschau.textContent = nachricht().split(' · ').slice(2).join(' · ') || (S.modus === 'kurz' ? 'Eine Stunde Ruhe, sonst nichts.' : 'Acht Stunden Ruhe, sonst nichts.');
      knopf(aktion, ikon(S.modus === 'kurz' ? 'hourglass' : 'moon', 16) + (S.modus === 'kurz' ? 'Rast beenden ↗' : 'Lange Rast beginnen ↗'), abschliessen, 'rkGo');
    }
    function abschliessen() {
      if (S.gesendet) return;
      if (S.modus === 'kurz' && R.lied && S.wuerfe.length && S.lied === null && S.tp < R.tpMax) {
        aktion.innerHTML = '';
        var d = wuerfelEl(R.lied.w, liedBox, 'var(--text-accent)', 'var(--bg-accent)', 48), w = wurf(R.lied.w);
        wirbel([d], [w], function () {
          d.c.textContent = R.lied.name;
          var vorher = S.tp; S.lied = w; tpNeu(); twStand(vorher, esc(R.lied.name) + ':');
          zeigeZustand();
          setTimeout(senden, warte(500));
        });
        return;
      }
      senden();
    }
    function senden() {
      S.gesendet = true;
      var msg = nachricht();
      aktion.innerHTML = ''; vorschau.hidden = true;
      twKnoepfe && (twKnoepfe.innerHTML = '');
      ergebnis.innerHTML = '<div class="rkStrip">' + ikon(S.modus === 'kurz' ? 'hourglass' : 'moon', 22) + '<p>' +
        (S.modus === 'kurz' ? 'Kurze Rast' : 'Lange Rast geplant') + '</p><span>' + (S.modus === 'kurz' ? 'TP ' + S.tp + ' / ' + R.tpMax : 'Die Spielleitung erzählt die Nacht') + '</span></div>';
      setTimeout(function () {
        if (typeof sendPrompt === 'function') sendPrompt(msg);
        else ergebnis.appendChild(neu('p', 'rkInfo', 'Nicht gesendet. Schreib es ab: ' + esc(msg)));
      }, warte(900));
    }

    zeigeZustand();
    baueKurz();
    baueLang();
    modus(S.modus);
  }

  window.Rast = { start: start, version: VERSION, langeRast: function (C, gegessen) { return langeRast(lesen(C), gegessen); } };
  (function warten(n) {
    var wurzel = document.getElementById('rast');
    var C = typeof RAST !== 'undefined' ? RAST : window.RAST;
    if (C && wurzel) {
      try { start(C, wurzel); } catch (e) { wurzel.textContent = 'Die Rastübersicht hat einen Fehler (' + e.message + '). Schreib einfach, wie deine Figur rastet.'; }
      return;
    }
    if (n < 60) setTimeout(function () { warten(n + 1); }, 50);
  })(0);
})();
