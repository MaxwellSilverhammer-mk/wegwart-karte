/*
 * Wegwart-Lagebild – Lagebild für den Kampf in der geteilten Welt „Hold der Seeprinzen“
 * Version 1.1 (Bewegung, Ziele, Reichweiten)
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Lagebild: Steg bei Rohrdorf, Runde 2</h2>
 *   <div id="lagebild">Lagebild lädt … Falls nicht, frag nach der Lage als Text.</div>
 *   <script>var LAGEBILD={titel:'Steg bei Rohrdorf', wesen:[…], gelaende:[…]}</script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/lagebild.js';document.head.appendChild(s);</script>
 *
 * Ein Feld ist 1,5 m (PHB: 5 Fuß); Felder heißen wie beim Schach, A1 liegt links oben. Das Lagebild zeigt nur,
 * was die Figur sieht: Gelände, Wesen mit ihrem Zustand in Worten, Bereiche, die Reihenfolge der Initiative.
 * Es schickt nichts von selbst (nur der Glossarknopf fragt nach einem Eintrag); die Spielleitung stellt es neu,
 * wenn sich die Lage ändert. Alle Felder stehen in der README.
 */
(function () {
  'use strict';

  var VERSION = '1.1';
  var S = 40;                          // Kartenpunkte je Feld
  var RL = 24, RO = 22, RR = 12, RU = 12; // Ränder: links (Zeilenzahlen), oben (Spaltenbuchstaben), rechts, unten
  var MIN = 3, MAX = 16;               // Felder je Seite
  var BUCHSTABEN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var F = { tinte: '#3b3028', rot: '#8e3b22', rahmen: '#8b6d45', pergament: '#efe2c3', hell: '#f7efdc', gold: '#c9a648',
    wasser: '#3f6c84', meer: '#c5d5cf', halm: '#5d6a3a', krone: '#8d9c63', baum: '#4d5b33', erde: '#6b573f', stein: '#4b4033' };

  var WESEN = {
    figur: { farbe: '#2f4f70', name: 'Du' },
    gefolge: { farbe: '#4b6b3c', name: 'Gefolge' },
    tier: { farbe: '#7b5a35', name: 'Tier' },
    npc: { farbe: '#6a6258', name: 'Leute' },
    feind: { farbe: '#8e3b22', name: 'Gegner' }
  };
  /* Zustand in Worten, wie die Erzählung ihn gibt: Ring um die Marke (Farbe, gestrichelt), liegend, tot */
  var ZUSTAND = {
    'unversehrt': {},
    'angeschlagen': { ring: '#c48a2a' },
    'schwer verletzt': { ring: '#a3261c', strich: '4 3' },
    'am Boden': { liegt: true },
    'bewusstlos': { liegt: true },
    'tot': { tot: true },
    'flieht': { ring: '#c48a2a', pfeil: true }
  };
  var GELAENDE = {
    mauer: ['Mauer', 'versperrt Weg und Sicht'],
    fels: ['Fels', 'versperrt den Weg, deckt dahinter'],
    kiste: ['Kisten, Fässer', 'halbe Deckung, drüberklettern kostet doppelt'],
    schutt: ['Schutt', 'schwieriges Gelände'],
    wasser: ['Wasser', 'waten oder schwimmen'],
    schlamm: ['Schlamm', 'schwieriges Gelände'],
    schilf: ['Schilf, hohes Gras', 'verdeckt, schwieriges Gelände'],
    baum: ['Baum', 'Stamm versperrt den Weg, Krone deckt'],
    busch: ['Gebüsch', 'deckt, schwieriges Gelände'],
    grube: ['Grube', 'nicht betretbar'],
    feuer: ['Feuer', 'brennt'],
    steg: ['Steg, Knüppeldamm', 'fester Boden'],
    pfahl: ['Pfahl, Pfosten', 'steht im Weg, halbe Deckung'],
    boot: ['Boot', 'schwankt'],
    tuer: ['Tür', 'geschlossen']
  };
  var BEREICH = {
    zauber: { fill: '#6b4a8f', op: 0.18, rand: '#6b4a8f', name: 'Zauber' },
    feuer: { fill: '#d9772a', op: 0.22, rand: '#8e3b22', name: 'Feuer' },
    nebel: { fill: '#c9c4b8', op: 0.45, rand: '#7d766c', name: 'Nebel, Rauch' },
    licht: { fill: '#f0d070', op: 0.28, rand: '#b58a1e', name: 'Licht' },
    dunkel: { fill: '#2b2622', op: 0.35, rand: '#2b2622', name: 'Dunkelheit' }
  };
  var NORDEN = { oben: 0, rechts: 90, unten: 180, links: 270 };
  /* Bewegung nach PHB 2014: versperrt (kein Durchkommen) und schwierig (jedes Feld kostet doppelt) */
  var SPERRT = { mauer: 1, fels: 1, grube: 1, baum: 1, pfahl: 1, tuer: 1 };
  var SCHWER = { schutt: 1, schlamm: 1, schilf: 1, busch: 1, wasser: 1, kiste: 1 };
  var EIGENE = { figur: 1, gefolge: 1, tier: 1 }; // nur sie dürfen TP, Bewegung und Reichweiten zeigen

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function istZahl(n) { return typeof n === 'number' && isFinite(n); }
  /* Feldname wie beim Schach: A1 links oben. Innen zählen x und y ab 0. */
  function spalte(x) { return x < 26 ? BUCHSTABEN[x] : BUCHSTABEN[Math.floor(x / 26) - 1] + BUCHSTABEN[x % 26]; }
  function feldName(x, y) { return spalte(x) + (y + 1); }
  function feldLesen(s) {
    var m = String(s || '').trim().toUpperCase().match(/^([A-Z]{1,2})(\d{1,2})$/);
    if (!m) return null;
    var x = m[1].length === 1 ? BUCHSTABEN.indexOf(m[1]) : (BUCHSTABEN.indexOf(m[1][0]) + 1) * 26 + BUCHSTABEN.indexOf(m[1][1]);
    return { x: x, y: parseInt(m[2], 10) - 1 };
  }
  /* Lage aus `feld` ('G5') oder aus `x`, `y` (ab 1, wie die Beschriftung) */
  function lage(o) {
    if (o.feld != null) return feldLesen(o.feld);
    if (istZahl(o.x) && istZahl(o.y)) return { x: Math.round(o.x) - 1, y: Math.round(o.y) - 1 };
    return null;
  }
  function meter(felder, D) {
    var m = felder * (D.feld || 1.5), t = (Math.round(m * 10) / 10).toString().replace('.', ',');
    return t + ' m';
  }
  /* Entfernung in Feldern nach PHB 2014: jedes Feld zählt eins, auch schräg. Große Wesen: vom nächsten Feld aus. */
  function entfernung(a, b) {
    var ga = a.groesse || 1, gb = b.groesse || 1, best = Infinity;
    for (var i = 0; i < ga; i++) for (var j = 0; j < ga; j++) for (var k = 0; k < gb; k++) for (var l = 0; l < gb; l++) {
      var d = Math.max(Math.abs((a._x + i) - (b._x + k)), Math.abs((a._y + j) - (b._y + l)));
      if (d < best) best = d;
    }
    return best;
  }
  function zeichenVon(w) {
    if (w.zeichen) return String(w.zeichen).slice(0, 3);
    var name = String(w.name || '?').trim(), m = name.match(/^(\S)\S*.*?(\d{1,2})$/);
    if (m) return (m[1] + m[2]).toUpperCase();
    return name.charAt(0).toUpperCase() + name.slice(1, 2).toLowerCase();
  }

  /* ---------- Daten vorbereiten ---------- */
  function vorbereiten(roh) {
    var D = JSON.parse(JSON.stringify(roh || {}));
    D.breite = istZahl(D.breite) ? Math.round(D.breite) : 10;
    D.hoehe = istZahl(D.hoehe) ? Math.round(D.hoehe) : 8;
    D.feld = istZahl(D.feld) && D.feld > 0 ? D.feld : 1.5;
    D.titel = D.titel || 'Lagebild';
    D.gelaende = Array.isArray(D.gelaende) ? D.gelaende : [];
    D.bereiche = Array.isArray(D.bereiche) ? D.bereiche : [];
    D.wesen = Array.isArray(D.wesen) ? D.wesen : [];
    D.initiative = Array.isArray(D.initiative) ? D.initiative : [];
    // Gelände: ein Feld oder ein Rechteck von `von`/`feld` bis `bis`
    var zellen = [];
    D.gelaende.forEach(function (g) {
      var a = g.feld != null || istZahl(g.x) ? lage(g) : feldLesen(g.von), b = g.bis != null ? (typeof g.bis === 'string' ? feldLesen(g.bis) : { x: g.bis[0] - 1, y: g.bis[1] - 1 }) : a;
      if (!a || !b) return;
      for (var y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) for (var x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++) {
        if (x < 0 || y < 0 || x >= D.breite || y >= D.hoehe) continue;
        zellen.push({ x: x, y: y, art: g.art, name: g.name || (GELAENDE[g.art] ? GELAENDE[g.art][0] : g.art) });
      }
    });
    D._zellen = zellen;
    // Bereiche: eine Liste von Feldern, oder ein Kreis mit r Feldern um die Mitte eines Felds; ein Feld liegt
    // im Kreis, wenn seine Mitte höchstens r Felder von der Mitte entfernt ist (so trifft die Kugel die Felder
    // an den Achsen und lässt die Ecken aus)
    D.bereiche.forEach(function (b) {
      var l = lage(b); b._x = l ? l.x : 0; b._y = l ? l.y : 0;
      b.r = istZahl(b.r) ? b.r : 0;
      if (Array.isArray(b.felder)) b._felder = b.felder.map(function (f) { return typeof f === 'string' ? feldLesen(f) : { x: f[0] - 1, y: f[1] - 1 }; }).filter(Boolean);
      else {
        b._felder = null; b._drin = [];
        for (var y = Math.max(0, Math.floor(b._y - b.r)); y <= Math.min(D.hoehe - 1, Math.ceil(b._y + b.r)); y++)
          for (var x = Math.max(0, Math.floor(b._x - b.r)); x <= Math.min(D.breite - 1, Math.ceil(b._x + b.r)); x++)
            if (Math.sqrt((x - b._x) * (x - b._x) + (y - b._y) * (y - b._y)) <= b.r + 1e-9) b._drin.push({ x: x, y: y });
      }
    });
    D.wesen.forEach(function (w, i) {
      var l = lage(w); w._x = l ? l.x : 0; w._y = l ? l.y : 0;
      w.id = w.id || ('w' + (i + 1));
      w.art = WESEN[w.art] ? w.art : 'npc';
      w.groesse = istZahl(w.groesse) ? Math.max(1, Math.min(3, Math.round(w.groesse))) : 1;
      w.zustand = ZUSTAND[w.zustand] ? w.zustand : 'unversehrt';
      w.zustaende = Array.isArray(w.zustaende) ? w.zustaende.filter(Boolean).map(String) : [];
      w._zeichen = zeichenVon(w);
      w._feld = feldName(w._x, w._y);
      w.bewegung = istZahl(w.bewegung) && w.bewegung >= 0 && EIGENE[w.art] ? w.bewegung : null;
      w.ziel = (Array.isArray(w.ziel) ? w.ziel : w.ziel != null ? [w.ziel] : []).map(String);
      w.reichweiten = Array.isArray(w.reichweiten) && EIGENE[w.art] ? w.reichweiten.filter(function (r) { return r && istZahl(r.m) && r.m > 0; }).map(function (r) { return { name: String(r.name || 'Reichweite'), m: r.m }; }) : [];
    });
    D._du = D.wesen.filter(function (w) { return w.art === 'figur'; })[0] || null;
    D._weg = null;
    var aktiv = D.wesen.filter(function (w) { return w.id === D.aktiv; })[0];
    if (aktiv && aktiv.bewegung != null) D._weg = { wer: aktiv, kosten: erreichbar(D, aktiv) };
    return D;
  }

  /* Welche Felder erreicht ein Wesen mit seiner restlichen Bewegung? Jedes Feld zählt eins, auch schräg; schwieriges
     Gelände und Felder anderer Wesen kosten doppelt (PHB 2014). Gegner versperren ihr Feld, außer sie sind tot;
     enden darf man nur auf einem Feld ohne anderes Wesen. Ergebnis: Kosten in Feldern je Feld „x,y“ (Lage links oben). */
  function erreichbar(D, w) {
    var g = w.groesse || 1, budget = Math.floor(w.bewegung / D.feld + 1e-9), art = {}, wer = {};
    D._zellen.forEach(function (z) { var k = z.x + ',' + z.y; if (SPERRT[z.art]) art[k] = 2; else if (SCHWER[z.art] && art[k] !== 2) art[k] = 1; });
    D.wesen.forEach(function (o) {
      if (o === w || o === w._ich || o.zustand === 'tot') return;
      var sperrt = (o.art === 'feind') !== (w.art === 'feind');
      for (var i = 0; i < o.groesse; i++) for (var j = 0; j < o.groesse; j++) { var k = (o._x + i) + ',' + (o._y + j); wer[k] = Math.max(wer[k] || 0, sperrt ? 2 : 1); }
    });
    function feld(x, y) { // null: nicht betretbar; sonst {kosten, enden}
      if (x < 0 || y < 0 || x + g > D.breite || y + g > D.hoehe) return null;
      var schwer = false, frei = true;
      for (var i = 0; i < g; i++) for (var j = 0; j < g; j++) {
        var k = (x + i) + ',' + (y + j);
        if (art[k] === 2 || wer[k] === 2) return null;
        if (art[k] === 1) schwer = true;
        if (wer[k] === 1) { schwer = true; frei = false; }
      }
      return { kosten: schwer ? 2 : 1, enden: frei };
    }
    var best = {}, offen = [{ x: w._x, y: w._y, k: 0 }], ziel = {};
    best[w._x + ',' + w._y] = 0;
    ziel[w._x + ',' + w._y] = true;
    while (offen.length) {
      offen.sort(function (a, b) { return a.k - b.k; });
      var n = offen.shift();
      if (n.k > best[n.x + ',' + n.y]) continue;
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        var x = n.x + dx, y = n.y + dy, f = feld(x, y), key = x + ',' + y;
        if (!f) continue;
        var k = n.k + f.kosten;
        if (k > budget || (best[key] != null && best[key] <= k)) continue;
        best[key] = k; offen.push({ x: x, y: y, k: k });
        if (f.enden) ziel[key] = true;
      }
    }
    var aus = {};
    Object.keys(best).forEach(function (key) { if (ziel[key]) aus[key] = best[key]; });
    return aus;
  }
  /* Kosten bis zu einem Feld ohne Grenze (für „zu weit“): dieselbe Suche mit großem Budget */
  function kostenBis(D, w, x, y) {
    var k = erreichbar(D, { _x: w._x, _y: w._y, groesse: w.groesse, art: w.art, id: w.id, bewegung: 999 * D.feld, zustand: w.zustand, _ich: w });
    return k[x + ',' + y] != null ? k[x + ',' + y] : null;
  }
  /* Fläche aus Feldern: leicht getönt, mit einer Linie um den Rand (statt jedes Feld einzeln zu rahmen) */
  function flaeche(zellen, fill, op, rand, strich) {
    var set = {}, s = '', d = '';
    zellen.forEach(function (c) { set[c.x + ',' + c.y] = true; });
    zellen.forEach(function (c) {
      var x = RL + c.x * S, y = RO + c.y * S;
      s += '<rect x="' + x + '" y="' + y + '" width="' + S + '" height="' + S + '"/>';
      if (!set[c.x + ',' + (c.y - 1)]) d += 'M' + x + ' ' + y + 'h' + S;
      if (!set[c.x + ',' + (c.y + 1)]) d += 'M' + x + ' ' + (y + S) + 'h' + S;
      if (!set[(c.x - 1) + ',' + c.y]) d += 'M' + x + ' ' + y + 'v' + S;
      if (!set[(c.x + 1) + ',' + c.y]) d += 'M' + (x + S) + ' ' + y + 'v' + S;
    });
    return '<g fill="' + fill + '" fill-opacity="' + op + '">' + s + '</g><path d="' + d + '" fill="none" stroke="' + rand + '" stroke-width="2.2" stroke-linecap="round"' + (strich ? ' stroke-dasharray="' + strich + '"' : '') + '/>';
  }
  /* Felder in einer Reichweite von n Feldern um ein Wesen (jedes Feld zählt eins, auch schräg) */
  function inReichweite(D, w, n) {
    var aus = [];
    for (var y = 0; y < D.hoehe; y++) for (var x = 0; x < D.breite; x++) {
      var e = entfernung(w, { _x: x, _y: y, groesse: 1 });
      if (e >= 1 && e <= n) aus.push({ x: x, y: y });
    }
    return aus;
  }

  /* ---------- Gelände zeichnen: ein Feld, Kartenpunkte px, py, Seite s ---------- */
  function glyph(art, px, py, s) {
    var k = s / 40, w = s - 4 * k, p = 2 * k, cx = px + s / 2, cy = py + s / 2;
    function R(fill, stroke, rx) { return '<rect x="' + r1(px + p) + '" y="' + r1(py + p) + '" width="' + r1(w) + '" height="' + r1(w) + '" rx="' + r1(rx || 2 * k) + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + r1(1.2 * k) + '"' : '') + '/>'; }
    function P(d, fill, stroke, sw) { return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + r1((sw || 1.2) * k) + '" stroke-linecap="round" stroke-linejoin="round"' : '') + '/>'; }
    function m(x, y) { return r1(px + x * k) + ' ' + r1(py + y * k); }
    switch (art) {
      case 'mauer': return R('#b9a98f', F.stein, 1.5 * k) + P('M' + m(3, 14) + 'H' + r1(px + 37 * k) + ' M' + m(3, 26) + 'H' + r1(px + 37 * k) + ' M' + m(14, 3) + 'V' + r1(py + 14 * k) + ' M' + m(26, 14) + 'V' + r1(py + 26 * k) + ' M' + m(12, 26) + 'V' + r1(py + 37 * k) + ' M' + m(28, 26) + 'V' + r1(py + 37 * k), null, '#6f6252', 1.2);
      case 'fels': return P('M' + m(6, 30) + 'C' + m(2, 18) + ' ' + m(10, 6) + ' ' + m(20, 7) + 'C' + m(30, 5) + ' ' + m(38, 14) + ' ' + m(35, 25) + 'C' + m(33, 34) + ' ' + m(22, 37) + ' ' + m(14, 35) + 'Z', '#a89c86', F.stein, 1.4) + P('M' + m(14, 12) + 'L' + m(20, 22) + 'L' + m(30, 16), null, '#6f6252', 1);
      case 'kiste': return R('#b27b43', '#5e3f22', 3 * k) + P('M' + m(6, 6) + 'L' + m(34, 34) + ' M' + m(34, 6) + 'L' + m(6, 34), null, '#754c2d', 2);
      case 'schutt': return P('M' + m(4, 24) + 'l' + r1(8 * k) + ' ' + r1(-14 * k) + 'l' + r1(7 * k) + ' ' + r1(8 * k) + 'l' + r1(8 * k) + ' ' + r1(-11 * k) + 'l' + r1(8 * k) + ' ' + r1(17 * k) + 'l' + r1(-11 * k) + ' ' + r1(7 * k) + 'l' + r1(-9 * k) + ' ' + r1(-4 * k) + 'Z', '#a7a092', '#71695b', 1.2) + P('M' + m(26, 31) + 'l' + r1(5 * k) + ' ' + r1(-3 * k) + 'l' + r1(5 * k) + ' ' + r1(6 * k) + 'Z', '#8f8778', '#71695b', 1);
      case 'wasser': return R(F.meer, null, 2 * k) + P('M' + m(5, 15) + 'q' + r1(5 * k) + ' ' + r1(-5 * k) + ' ' + r1(10 * k) + ' 0t' + r1(10 * k) + ' 0t' + r1(10 * k) + ' 0 M' + m(5, 27) + 'q' + r1(5 * k) + ' ' + r1(-5 * k) + ' ' + r1(10 * k) + ' 0t' + r1(10 * k) + ' 0t' + r1(10 * k) + ' 0', null, F.wasser, 1.4);
      case 'schlamm': return R('#a08a62', null, 2 * k).replace('fill="#a08a62"', 'fill="#a08a62" fill-opacity=".55"') + P('M' + m(9, 12) + 'h1 M' + m(22, 9) + 'h1 M' + m(31, 18) + 'h1 M' + m(12, 26) + 'h1 M' + m(25, 31) + 'h1 M' + m(19, 20) + 'h1', null, '#6b5a3a', 3);
      case 'schilf': return R('#cfd3a1', null, 2 * k).replace('fill="#cfd3a1"', 'fill="#cfd3a1" fill-opacity=".5"') + P('M' + m(8, 36) + 'V' + r1(py + 10 * k) + ' M' + m(15, 36) + 'V' + r1(py + 6 * k) + ' M' + m(22, 36) + 'V' + r1(py + 12 * k) + ' M' + m(29, 36) + 'V' + r1(py + 5 * k) + ' M' + m(35, 36) + 'V' + r1(py + 14 * k), null, F.halm, 1.6) + P('M' + m(15, 6) + 'l' + r1(3 * k) + ' ' + r1(6 * k) + ' M' + m(29, 5) + 'l' + r1(3 * k) + ' ' + r1(7 * k), null, F.halm, 2.4);
      case 'baum': return '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(17 * k) + '" fill="' + F.krone + '" stroke="' + F.baum + '" stroke-width="' + r1(1.4 * k) + '"/><circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(4 * k) + '" fill="' + F.erde + '"/>';
      case 'busch': return P('M' + m(8, 28) + 'C' + m(2, 20) + ' ' + m(8, 10) + ' ' + m(16, 13) + 'C' + m(20, 6) + ' ' + m(32, 8) + ' ' + m(32, 17) + 'C' + m(39, 22) + ' ' + m(34, 32) + ' ' + m(24, 32) + 'C' + m(18, 36) + ' ' + m(10, 34) + ' ' + m(8, 28) + 'Z', '#97a66c', F.baum, 1.3);
      case 'grube': return R('#2b2622', null, 3 * k).replace('fill="#2b2622"', 'fill="#2b2622" fill-opacity=".85"') + R('none', '#7a6a55', 3 * k);
      case 'feuer': return P('M' + m(20, 5) + 'C' + m(26, 13) + ' ' + m(34, 17) + ' ' + m(32, 27) + 'C' + m(31, 34) + ' ' + m(25, 37) + ' ' + m(20, 37) + 'C' + m(13, 37) + ' ' + m(8, 32) + ' ' + m(8, 25) + 'C' + m(8, 18) + ' ' + m(15, 15) + ' ' + m(14, 9) + 'C' + m(18, 13) + ' ' + m(21, 11) + ' ' + m(20, 5) + 'Z', '#d9772a', F.rot, 1.3) + P('M' + m(20, 20) + 'C' + m(26, 26) + ' ' + m(25, 33) + ' ' + m(20, 34) + 'C' + m(15, 33) + ' ' + m(14, 27) + ' ' + m(20, 20) + 'Z', '#f1c35c', null);
      case 'steg': return R('#c8a46a', F.erde, 1.5 * k) + P('M' + m(2, 11) + 'H' + r1(px + 38 * k) + ' M' + m(2, 20) + 'H' + r1(px + 38 * k) + ' M' + m(2, 29) + 'H' + r1(px + 38 * k), null, '#8a6b3c', 1.1);
      case 'pfahl': return '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(6 * k) + '" fill="#5b4a33" stroke="' + F.hell + '" stroke-width="' + r1(1.2 * k) + '"/>';
      case 'boot': return P('M' + m(5, 20) + 'C' + m(10, 8) + ' ' + m(30, 8) + ' ' + m(35, 20) + 'C' + m(30, 32) + ' ' + m(10, 32) + ' ' + m(5, 20) + 'Z', '#a67c4a', F.erde, 1.4) + P('M' + m(10, 20) + 'H' + r1(px + 30 * k), null, F.erde, 1.2);
      case 'tuer': return R(F.hell, F.erde, 1 * k) + P('M' + m(13, 36) + 'V' + r1(py + 6 * k) + 'H' + r1(px + 27 * k) + 'V' + r1(py + 36 * k), '#b9956a', F.erde, 1.4) + '<circle cx="' + r1(px + 24 * k) + '" cy="' + r1(py + 22 * k) + '" r="' + r1(1.6 * k) + '" fill="' + F.tinte + '"/>';
      default: return R('#d9ccae', F.rahmen, 2 * k);
    }
  }

  /* ---------- Zeichnen ---------- */
  function zeichne(roh) {
    var D = vorbereiten(roh);
    if (D.breite < MIN || D.breite > MAX || D.hoehe < MIN || D.hoehe > MAX) throw new Error('breite und hoehe müssen zwischen ' + MIN + ' und ' + MAX + ' liegen.');
    var kompass = NORDEN[D.norden] != null, rr = kompass ? 34 : RR;
    var W = RL + D.breite * S + rr, H = RO + D.hoehe * S + RU, liste = [];
    var s = '<svg class="lb" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc('Lagebild: ' + D.titel + '. Ein Feld ist ' + meter(1, D) + '.') + '" xmlns="http://www.w3.org/2000/svg">';
    s += '<style>' + SVG_CSS + '</style>';
    s += '<rect class="lP" x="0" y="0" width="' + W + '" height="' + H + '" rx="6"/>';
    // Raster
    var g = '';
    for (var x = 0; x <= D.breite; x++) g += 'M' + (RL + x * S) + ' ' + RO + 'V' + (RO + D.hoehe * S);
    for (var y = 0; y <= D.hoehe; y++) g += 'M' + RL + ' ' + (RO + y * S) + 'H' + (RL + D.breite * S);
    s += '<path d="' + g + '" fill="none" stroke="' + F.tinte + '" stroke-opacity=".2" stroke-width="1"/>';
    // Beschriftung: Buchstaben oben, Zahlen links
    for (x = 0; x < D.breite; x++) s += '<text class="lT lB" x="' + (RL + x * S + S / 2) + '" y="' + (RO - 7) + '" text-anchor="middle">' + spalte(x) + '</text>';
    for (y = 0; y < D.hoehe; y++) s += '<text class="lT lB" x="' + (RL - 6) + '" y="' + (RO + y * S + S / 2 + 4) + '" text-anchor="end">' + (y + 1) + '</text>';
    // Gelände
    D._zellen.forEach(function (z) {
      s += '<g class="lG" data-feld="' + feldName(z.x, z.y) + '">' + glyph(z.art, RL + z.x * S, RO + z.y * S, S) + '</g>';
      liste.push({ typ: 'gelaende', feld: feldName(z.x, z.y), art: z.art });
    });
    // Bereiche: Kreis um ein Feld (r in Feldern) oder eine Liste von Feldern
    D.bereiche.forEach(function (b) {
      var B = BEREICH[b.art] || BEREICH.zauber, cx = RL + b._x * S + S / 2, cy = RO + b._y * S + S / 2, felder = b._felder || b._drin;
      felder.forEach(function (f) { s += '<rect x="' + (RL + f.x * S + 1) + '" y="' + (RO + f.y * S + 1) + '" width="' + (S - 2) + '" height="' + (S - 2) + '" fill="' + B.fill + '" fill-opacity="' + B.op + '"/>'; });
      if (!b._felder && b.r > 0) s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r1(b.r * S) + '" fill="none" stroke="' + B.rand + '" stroke-opacity=".75" stroke-dasharray="5 3" stroke-width="1.4"/>';
      if (b.name && felder.length) {
        var oben = Math.min.apply(0, felder.map(function (f) { return f.y; })), tx = b._felder ? RL + (Math.min.apply(0, felder.map(function (f) { return f.x; })) + Math.max.apply(0, felder.map(function (f) { return f.x; })) + 1) * S / 2 : cx;
        s += '<text class="lT lN lH" x="' + r1(tx) + '" y="' + (RO + oben * S + 12) + '" text-anchor="middle" fill="' + B.rand + '">' + esc(b.name) + '</text>';
      }
      liste.push({ typ: 'bereich', feld: feldName(b._x, b._y), art: b.art, r: b.r, felder: felder.length });
    });
    // Rahmen über dem Gelände, Kompass
    s += '<rect x="' + RL + '" y="' + RO + '" width="' + (D.breite * S) + '" height="' + (D.hoehe * S) + '" fill="none" stroke="' + F.rahmen + '" stroke-width="1.6"/>';
    if (kompass) {
      var kx = W - rr / 2 - 1, ky = RO + 14;
      s += '<g transform="translate(' + kx + ' ' + ky + ') rotate(' + NORDEN[D.norden] + ')"><circle r="9" fill="none" stroke="' + F.rahmen + '" stroke-width="1"/><path d="M0 -9L3.2 3L0 0.5L-3.2 3Z" fill="' + F.rot + '"/></g>';
      s += '<text class="lT lB" x="' + kx + '" y="' + (ky + 22) + '" text-anchor="middle">N</text>';
    }
    // Wesen: Marke mit Zeichen, Ringe für Zustand, aktives Wesen, Auswahl
    if (D._weg) {
      var gw = D._weg.wer.groesse, belegt = {}, zellenW = [];
      Object.keys(D._weg.kosten).forEach(function (key) {
        var p = key.split(',');
        for (var i = 0; i < gw; i++) for (var j = 0; j < gw; j++) { var k2 = (+p[0] + i) + ',' + (+p[1] + j); if (!belegt[k2]) { belegt[k2] = true; zellenW.push({ x: +p[0] + i, y: +p[1] + j }); } }
      });
      s += '<g class="lW">' + flaeche(zellenW, '#4b6b3c', 0.1, '#4b6b3c', '') + '</g>';
      liste.push({ typ: 'bewegung', wer: D._weg.wer.id, felder: Object.keys(D._weg.kosten).length - 1 });
    }
    D.wesen.forEach(function (w, i) {
      w.reichweiten.forEach(function (r, j) {
        var n = Math.floor(r.m / D.feld + 1e-9);
        s += '<g class="lRw" data-rw="' + i + '-' + j + '" style="display:none">' + flaeche(inReichweite(D, w, n), '#c9a648', 0.24, '#9a7b25', '6 4') + '</g>';
      });
    });
    var pfeile = '';
    D.wesen.forEach(function (w) {
      w.ziel.forEach(function (id) {
        var o = D.wesen.filter(function (x) { return x.id === id; })[0];
        if (!o || o === w) return;
        var ax = RL + w._x * S + w.groesse * S / 2, ay = RO + w._y * S + w.groesse * S / 2, bx = RL + o._x * S + o.groesse * S / 2, by = RO + o._y * S + o.groesse * S / 2;
        var dx = bx - ax, dy = by - ay, l = Math.sqrt(dx * dx + dy * dy) || 1, ra = w.groesse * S / 2 - 2, rb = o.groesse * S / 2 - 1;
        if (l <= ra + rb + 4) return;
        pfeile += '<path d="M' + r1(ax + dx / l * ra) + ' ' + r1(ay + dy / l * ra) + 'L' + r1(bx - dx / l * rb) + ' ' + r1(by - dy / l * rb) + '" stroke="' + F.rot + '" stroke-width="2.4" stroke-linecap="round" marker-end="url(#lbPfeil)" opacity=".85"/>';
        liste.push({ typ: 'ziel', von: w.id, nach: o.id });
      });
    });
    if (pfeile) s += '<defs><marker id="lbPfeil" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="' + F.rot + '"/></marker></defs>' + pfeile;
    D.wesen.forEach(function (w, i) {
      var rad = w.groesse * S / 2 - 4.5, cx = RL + w._x * S + w.groesse * S / 2, cy = RO + w._y * S + w.groesse * S / 2;
      var z = ZUSTAND[w.zustand], farbe = z.tot ? '#8c8276' : WESEN[w.art].farbe;
      var lab = w.name + ', ' + w._feld + (w.zustand !== 'unversehrt' ? ', ' + w.zustand : '');
      s += '<g class="lO' + (w.id === D.aktiv ? ' lA' : '') + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(lab) + '">';
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r1(w.groesse * S / 2) + '" fill="transparent"/>'; // Tippfläche: das ganze Feld
      s += '<circle class="lR" cx="' + cx + '" cy="' + cy + '" r="' + r1(rad + 5) + '" fill="none" stroke="' + F.tinte + '" stroke-width="2.4"/>';
      if (w.id === D.aktiv) s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r1(rad + 3.5) + '" fill="none" stroke="' + F.gold + '" stroke-width="3"/>';
      if (w.zustaende.length) s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r1(rad + 1.5) + '" fill="none" stroke="' + F.tinte + '" stroke-width="1.2" stroke-dasharray="2 2"/>';
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r1(rad) + '" fill="' + farbe + '"' + (z.liegt ? ' fill-opacity=".55"' : '') + ' stroke="' + (z.ring || F.hell) + '" stroke-width="' + (z.ring ? 2.6 : 2) + '"' + (z.strich ? ' stroke-dasharray="' + z.strich + '"' : '') + '/>';
      if (z.tot) s += '<path d="M' + r1(cx - rad * 0.5) + ' ' + r1(cy - rad * 0.5) + 'l' + r1(rad) + ' ' + r1(rad) + 'm0 ' + r1(-rad) + 'l' + r1(-rad) + ' ' + r1(rad) + '" stroke="' + F.hell + '" stroke-width="2.2" stroke-linecap="round"/>';
      else {
        s += '<text class="lT lZ" x="' + cx + '" y="' + r1(cy + rad * 0.36) + '" text-anchor="middle" font-size="' + r1(rad * 0.95) + '">' + esc(w._zeichen) + '</text>';
        if (z.liegt) s += '<path d="M' + r1(cx - rad * 0.7) + ' ' + r1(cy + rad * 0.78) + 'h' + r1(rad * 1.4) + '" stroke="' + F.tinte + '" stroke-width="2" stroke-linecap="round"/>';
        if (z.pfeil) s += '<path d="M' + r1(cx + rad * 0.55) + ' ' + r1(cy - rad * 0.95) + 'l' + r1(rad * 0.45) + ' ' + r1(-rad * 0.45) + 'm0 ' + r1(rad * 0.28) + 'v' + r1(-rad * 0.28) + 'h' + r1(-rad * 0.28) + '" fill="none" stroke="' + F.tinte + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
      }
      s += '</g>';
      liste.push({ typ: 'wesen', id: w.id, feld: w._feld, art: w.art, zustand: w.zustand, zeichen: w._zeichen });
    });
    s += '</svg>';
    return { svg: s, breite: W, hoehe: H, daten: D, liste: liste, legende: legende(D) };
  }

  /* ---------- Legende (nur, was vorkommt) ---------- */
  function mini(inhalt, vb) { return '<svg width="18" height="18" viewBox="0 0 ' + (vb || 18) + ' ' + (vb || 18) + '" aria-hidden="true">' + inhalt + '</svg>'; }
  function legende(D) {
    var t = '', arten = {}, wesen = {}, zust = {}, bereiche = {};
    D.wesen.forEach(function (w) { wesen[w.art] = true; if (w.zustand !== 'unversehrt') zust[w.zustand] = true; if (w.zustaende.length) zust._z = true; });
    D._zellen.forEach(function (z) { arten[z.art] = true; });
    D.bereiche.forEach(function (b) { bereiche[b.art] = true; });
    Object.keys(WESEN).forEach(function (a) { if (wesen[a]) t += '<span>' + mini('<circle cx="9" cy="9" r="7" fill="' + WESEN[a].farbe + '" stroke="' + F.hell + '" stroke-width="1.5"/>') + esc(WESEN[a].name) + '</span>'; });
    if (D.aktiv) t += '<span>' + mini('<circle cx="9" cy="9" r="7.5" fill="none" stroke="' + F.gold + '" stroke-width="2.5"/>') + 'ist dran</span>';
    Object.keys(ZUSTAND).forEach(function (z) {
      if (!zust[z]) return;
      var Z = ZUSTAND[z], k = Z.tot ? '<circle cx="9" cy="9" r="7" fill="#8c8276"/><path d="M5.5 5.5l7 7m0-7l-7 7" stroke="' + F.hell + '" stroke-width="1.6"/>'
        : Z.liegt ? '<circle cx="9" cy="9" r="7" fill="' + F.tinte + '" fill-opacity=".45"/><path d="M4 15h10" stroke="' + F.tinte + '" stroke-width="1.6"/>'
        : '<circle cx="9" cy="9" r="7" fill="none" stroke="' + Z.ring + '" stroke-width="2.2"' + (Z.strich ? ' stroke-dasharray="3 2"' : '') + '/>';
      t += '<span>' + mini(k) + esc(z) + '</span>';
    });
    if (zust._z) t += '<span>' + mini('<circle cx="9" cy="9" r="7.5" fill="none" stroke="' + F.tinte + '" stroke-width="1.2" stroke-dasharray="2 2"/>') + 'mit Zustand (antippen)</span>';
    Object.keys(GELAENDE).forEach(function (a) { if (arten[a]) t += '<span>' + mini(glyph(a, 0, 0, 18)) + esc(GELAENDE[a][0]) + ' · ' + esc(GELAENDE[a][1]) + '</span>'; });
    Object.keys(BEREICH).forEach(function (a) { if (bereiche[a]) t += '<span>' + mini('<circle cx="9" cy="9" r="7" fill="' + BEREICH[a].fill + '" fill-opacity="' + Math.min(0.8, BEREICH[a].op * 2) + '" stroke="' + BEREICH[a].rand + '" stroke-dasharray="3 2"/>') + esc(BEREICH[a].name) + '</span>'; });
    if (D._weg) t += '<span>' + mini('<rect x="2" y="2" width="14" height="14" fill="#4b6b3c" fill-opacity=".15" stroke="#4b6b3c" stroke-width="1.6"/>') + 'erreichbar (' + esc(D._weg.wer.name) + ', ' + meter(D._weg.wer.bewegung / D.feld, D) + ')</span>';
    if (D.wesen.some(function (w) { return w.ziel.length; })) t += '<span>' + mini('<path d="M2 14L13 4" stroke="' + F.rot + '" stroke-width="2"/><path d="M15 2l-1 6-4-4z" fill="' + F.rot + '"/>') + 'greift an</span>';
    if (D.wesen.some(function (w) { return w.reichweiten.length; })) t += '<span>' + mini('<rect x="2" y="2" width="14" height="14" fill="#c9a648" fill-opacity=".35" stroke="#9a7b25" stroke-width="1.6" stroke-dasharray="4 2"/>') + 'Reichweite (Wesen antippen)</span>';
    t += '<span>' + mini('<rect x="1.5" y="1.5" width="15" height="15" fill="none" stroke="' + F.rahmen + '"/><path d="M1.5 9H16.5M9 1.5V16.5" stroke="' + F.tinte + '" stroke-opacity=".4"/>') + '1 Feld = ' + meter(1, D) + '</span>';
    return t;
  }

  /* ---------- Prüfung der Form: nur bekannte Felder, nur Zustände in Worten, keine Werte der Gegner ---------- */
  function pruefen(roh) {
    var fehler = [], hinweise = [];
    function melde(l, t) { if (l.indexOf(t) < 0) l.push(t); }
    if (!roh || typeof roh !== 'object' || Array.isArray(roh)) return { ok: false, fehler: ['LAGEBILD fehlt oder ist kein Objekt.'], hinweise: [] };
    var oben = ['titel', 'stand', 'breite', 'hoehe', 'feld', 'norden', 'gelaende', 'bereiche', 'wesen', 'initiative', 'aktiv', 'runde'];
    Object.keys(roh).forEach(function (k) { if (oben.indexOf(k) < 0) melde(fehler, 'Unbekanntes Feld „' + k + '“.'); });
    var D;
    try { D = vorbereiten(roh); } catch (e) { return { ok: false, fehler: ['Die Daten lassen sich nicht lesen: ' + e.message], hinweise: [] }; }
    if (D.breite < MIN || D.breite > MAX || D.hoehe < MIN || D.hoehe > MAX) melde(fehler, 'breite und hoehe müssen zwischen ' + MIN + ' und ' + MAX + ' liegen.');
    if (roh.norden != null && NORDEN[roh.norden] == null) melde(fehler, 'norden muss oben, rechts, unten oder links sein.');
    function innen(l) { return l && l.x >= 0 && l.y >= 0 && l.x < D.breite && l.y < D.hoehe; }
    function objekt(o, wo) { if (o && typeof o === 'object' && !Array.isArray(o)) return true; melde(fehler, wo + ' ist kein Objekt.'); return false; }
    (roh.gelaende || []).forEach(function (g, i) {
      var wo = 'gelaende[' + i + ']';
      if (!objekt(g, wo)) return;
      Object.keys(g).forEach(function (k) { if (['art', 'feld', 'von', 'bis', 'x', 'y', 'name'].indexOf(k) < 0) melde(fehler, wo + ': unbekanntes Feld „' + k + '“.'); });
      if (!GELAENDE[g.art]) melde(fehler, wo + ': unbekannte Art „' + g.art + '“.');
      var a = g.feld != null || istZahl(g.x) ? lage(g) : feldLesen(g.von);
      if (!innen(a)) melde(fehler, wo + ': Feld fehlt oder liegt außerhalb.');
      if (g.bis != null) { var b = typeof g.bis === 'string' ? feldLesen(g.bis) : (Array.isArray(g.bis) ? { x: g.bis[0] - 1, y: g.bis[1] - 1 } : null); if (!innen(b)) melde(fehler, wo + ': bis fehlt oder liegt außerhalb.'); }
    });
    (roh.bereiche || []).forEach(function (b, i) {
      var wo = 'bereiche[' + i + ']';
      if (!objekt(b, wo)) return;
      Object.keys(b).forEach(function (k) { if (['art', 'feld', 'x', 'y', 'r', 'felder', 'name'].indexOf(k) < 0) melde(fehler, wo + ': unbekanntes Feld „' + k + '“.'); });
      if (b.art != null && !BEREICH[b.art]) melde(fehler, wo + ': unbekannte Art „' + b.art + '“.');
      if (!Array.isArray(b.felder) && !innen(lage(b))) melde(fehler, wo + ': Feld fehlt oder liegt außerhalb.');
      if (!Array.isArray(b.felder) && !(istZahl(b.r) && b.r > 0)) melde(fehler, wo + ': r (Felder) fehlt.');
    });
    var ids = {}, belegt = {};
    (roh.wesen || []).forEach(function (w, i) {
      var wo = 'wesen[' + i + ']' + (w && w.name ? ' (' + w.name + ')' : '');
      if (!objekt(w, wo)) return;
      Object.keys(w).forEach(function (k) { if (['id', 'name', 'art', 'feld', 'x', 'y', 'zeichen', 'groesse', 'zustand', 'zustaende', 'tp', 'notiz', 'bewegung', 'ziel', 'reichweiten'].indexOf(k) < 0) melde(fehler, wo + ': unbekanntes Feld „' + k + '“.'); });
      if (!w.name) melde(fehler, wo + ': name fehlt.');
      if (!WESEN[w.art]) melde(fehler, wo + ': art muss figur, gefolge, tier, npc oder feind sein.');
      if (w.zustand != null && !ZUSTAND[w.zustand]) melde(fehler, wo + ': zustand muss eins sein von ' + Object.keys(ZUSTAND).join(', ') + '.');
      if (w.zustaende != null && !Array.isArray(w.zustaende)) melde(fehler, wo + ': zustaende ist eine Liste kurzer Wörter.');
      if (w.tp != null) {
        if (['figur', 'gefolge', 'tier'].indexOf(w.art) < 0) melde(fehler, wo + ': tp gibt es nur für figur, gefolge und tier; Gegner zeigen ihren Zustand in Worten.');
        if (!Array.isArray(w.tp) || w.tp.length !== 2 || !istZahl(w.tp[0]) || !istZahl(w.tp[1])) melde(fehler, wo + ': tp ist [jetzt, höchstens].');
      }
      if (w.bewegung != null) {
        if (!EIGENE[w.art]) melde(fehler, wo + ': bewegung gibt es nur für figur, gefolge und tier.');
        if (!istZahl(w.bewegung) || w.bewegung < 0) melde(fehler, wo + ': bewegung ist die restliche Bewegung in Metern.');
      }
      if (w.reichweiten != null) {
        if (!EIGENE[w.art]) melde(fehler, wo + ': reichweiten gibt es nur für figur, gefolge und tier.');
        if (!Array.isArray(w.reichweiten) || w.reichweiten.some(function (r) { return !r || typeof r !== 'object' || !r.name || !istZahl(r.m) || r.m <= 0 || Object.keys(r).some(function (k) { return k !== 'name' && k !== 'm'; }); })) melde(fehler, wo + ': reichweiten ist eine Liste aus {name, m}.');
      }
      if (w.zeichen != null && String(w.zeichen).length > 3) melde(fehler, wo + ': zeichen hat höchstens drei Zeichen.');
      if (w.groesse != null && (!istZahl(w.groesse) || w.groesse < 1 || w.groesse > 3)) melde(fehler, wo + ': groesse ist 1, 2 oder 3 (Felder je Seite).');
      var l = lage(w);
      if (!innen(l)) melde(fehler, wo + ': Feld fehlt oder liegt außerhalb.');
      else {
        var gr = istZahl(w.groesse) ? Math.round(w.groesse) : 1;
        if (l.x + gr > D.breite || l.y + gr > D.hoehe) melde(fehler, wo + ': ragt über den Rand.');
        var k = l.x + ',' + l.y;
        if (belegt[k]) melde(hinweise, wo + ' steht auf demselben Feld wie ' + belegt[k] + '.');
        belegt[k] = w.name || wo;
      }
      var id = D.wesen[i].id;
      if (ids[id]) melde(fehler, wo + ': id „' + id + '“ doppelt.');
      ids[id] = true;
    });
    (roh.wesen || []).forEach(function (w, i) {
      if (!w || typeof w !== 'object' || w.ziel == null) return;
      (Array.isArray(w.ziel) ? w.ziel : [w.ziel]).forEach(function (id) { if (!ids[id]) melde(fehler, 'wesen[' + i + ']: ziel nennt „' + id + '“, das es nicht gibt.'); });
    });
    if (roh.aktiv != null && (roh.wesen || []).some(function (w) { return w && w.id === roh.aktiv && w.bewegung == null && EIGENE[w.art]; })) melde(hinweise, 'Das aktive Wesen hat keine bewegung: Das Lagebild zeigt nicht, wohin es kommt.');
    (roh.initiative || []).forEach(function (id) { if (!ids[id]) melde(fehler, 'initiative nennt „' + id + '“, das es nicht gibt.'); });
    if (roh.aktiv != null && !ids[roh.aktiv]) melde(fehler, 'aktiv nennt „' + roh.aktiv + '“, das es nicht gibt.');
    if (roh.runde != null && !istZahl(roh.runde)) melde(fehler, 'runde ist eine Zahl.');
    if (!D._du) melde(hinweise, 'Kein Wesen der Art figur: Entfernungen entfallen.');
    if (D.breite > 10) melde(hinweise, 'Mehr als 10 Spalten: Auf dem Handy werden die Felder klein.');
    return { ok: fehler.length === 0, fehler: fehler, hinweise: hinweise, wesen: D.wesen.length, felder: D._zellen.length };
  }

  /* ---------- Stil ---------- */
  var SVG_CSS =
    '.lP{fill:#efe2c3}[data-mode="dark"] .lP{fill:#d8c9a3}' +
    '@media (prefers-color-scheme:dark){:root:not([data-mode]) .lP{fill:#d8c9a3}}' +
    '.lT{font-family:"EB Garamond",Garamond,Georgia,serif}.lB{font-size:11px;fill:#6b5a45}.lN{font-size:11px;font-style:italic}' +
    '.lH{paint-order:stroke;stroke:#efe2c3;stroke-width:4px;stroke-linejoin:round}' +
    '.lZ{font-weight:600;fill:#f7efdc;pointer-events:none}.lO{cursor:pointer}.lO:focus{outline:none}.lO .lR{opacity:0}.lO.lS .lR,.lO:focus-visible .lR{opacity:1}';
  var UI_CSS =
    '.lt{display:flex;flex-direction:column;gap:9px}' +
    '.lt .ltH{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px}' +
    '.lt .ltT{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:20px;line-height:1.2;color:var(--text-primary)}' +
    '.lt .ltS{font-size:13px;color:var(--text-secondary)}' +
    '.lt .ltK svg{display:block;width:100%;height:auto;touch-action:manipulation}' +
    '.lt .ltI{margin:0;font-size:14px;line-height:1.55;color:var(--text-secondary);min-height:44px}.lt .ltI b{font-weight:500;color:var(--text-primary)}' +
    '.lt .ltR{display:flex;flex-wrap:wrap;gap:6px}' +
    '.lt .ltC{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:4px 10px 4px 7px;border:1px solid #c5ad83;border-radius:17px;background:#f3e9d2;color:#3b3028;font-size:13px;line-height:1.2;cursor:pointer;user-select:none}' +
    '.lt .ltC i{width:12px;height:12px;border-radius:50%;flex-shrink:0;border:1.5px solid #f7efdc}' +
    '.lt .ltC small{color:#6b5a45;font-size:12px}.lt .ltC.ltA{border-color:#c9a648;box-shadow:inset 0 0 0 1.5px #c9a648;background:#f7ecc8}' +
    '.lt .ltC.ltS{box-shadow:inset 0 0 0 1.5px #3b3028}' +
    '[data-mode="dark"] .lt .ltC{background:#d8c9a3}@media (prefers-color-scheme:dark){:root:not([data-mode]) .lt .ltC{background:#d8c9a3}}' +
    '.lt .ltB{display:flex;flex-wrap:wrap;gap:8px}.lt .ltRw{display:contents}.lt .ltRw button[aria-pressed="true"]{box-shadow:inset 0 0 0 1.5px #9a7b25}' +
    '.lt .ltL{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 12px;font-size:12px;color:var(--text-secondary)}' +
    '.lt .ltL span{display:flex;align-items:center;gap:6px}.lt .ltL svg{flex-shrink:0}.lt [hidden]{display:none!important}';

  /* ---------- Einbau ins Widget ---------- */
  function schriftLaden() {
    try {
      if (document.getElementById('ktSchrift') || document.getElementById('lbSchrift')) return;
      var l = document.createElement('link');
      l.id = 'lbSchrift'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&family=IM+Fell+English:ital@0;1&display=swap';
      document.head.appendChild(l);
    } catch (e) { return; }
  }
  function artWort(w) { return w.art === 'figur' ? 'du' : WESEN[w.art].name; }
  function tpWort(w) { return w.tp && w.tp.length === 2 ? 'TP ' + w.tp[0] + '/' + w.tp[1] : ''; }
  function abstandWort(ziel, D) {
    if (!D._du || ziel === D._du) return '';
    var f = entfernung(D._du, ziel);
    return (f === 1 ? 'neben dir' : f + ' Felder (' + meter(f, D) + ') von dir');
  }

  function einbauen(el, roh) {
    schriftLaden();
    var e = zeichne(roh), D = e.daten, W = e.breite;
    el.classList.add('lt');
    var chips = D.initiative.length ? D.initiative : D.wesen.map(function (w) { return w.id; });
    var strip = chips.map(function (id) {
      var i = -1; D.wesen.forEach(function (w, j) { if (w.id === id) i = j; });
      if (i < 0) return '';
      var w = D.wesen[i], z = ZUSTAND[w.zustand];
      var klein = tpWort(w) || (w.zustand !== 'unversehrt' ? w.zustand : '');
      return '<span class="ltC' + (w.id === D.aktiv ? ' ltA' : '') + '" role="button" tabindex="0" data-i="' + i + '"><i style="background:' + (z.tot ? '#8c8276' : WESEN[w.art].farbe) + '"></i>' + esc(w.name) + (klein ? ' <small>' + esc(klein) + '</small>' : '') + '</span>';
    }).join('');
    el.innerHTML = '<style>' + UI_CSS + '</style>' +
      '<div class="ltH"><span class="ltT">' + esc(D.titel) + '</span>' + (D.stand ? '<span class="ltS">' + esc(D.stand) + '</span>' : '') + '</div>' +
      '<div class="ltK">' + e.svg + '</div>' +
      '<p class="ltI" aria-live="polite">Tippe auf ein Wesen oder ein Feld.</p>' +
      (strip ? '<div class="ltR" aria-label="Reihenfolge">' + strip + '</div>' : '') +
      '<div class="ltB"><button type="button" data-k="leg" aria-expanded="false">Legende</button><span class="ltRw"></span><button type="button" data-k="glossar" hidden></button></div>' +
      '<div class="ltL" hidden>' + e.legende + '</div>';
    var svg = el.querySelector('svg'), info = el.querySelector('.ltI'), leg = el.querySelector('.ltL');
    var bLeg = el.querySelector('[data-k="leg"]'), bGlossar = el.querySelector('[data-k="glossar"]'), gewaehlt = null;

    var rwKasten = el.querySelector('.ltRw');
    function ringe(w) {
      svg.querySelectorAll('.lRw').forEach(function (g) { g.style.display = 'none'; });
      rwKasten.innerHTML = '';
      if (!w) return;
      var i = D.wesen.indexOf(w);
      w.reichweiten.forEach(function (r, j) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('data-rw', i + '-' + j);
        b.textContent = r.name + ' · ' + meter(r.m / D.feld, D).replace(/,0 m$/, ' m');
        b.addEventListener('click', function () {
          var an = b.getAttribute('aria-pressed') !== 'true';
          svg.querySelectorAll('.lRw').forEach(function (g) { g.style.display = 'none'; });
          rwKasten.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          if (an) { svg.querySelector('.lRw[data-rw="' + i + '-' + j + '"]').style.display = ''; b.setAttribute('aria-pressed', 'true'); }
        });
        rwKasten.appendChild(b);
      });
    }
    function zeige(html, w) {
      info.innerHTML = html;
      if ((w || null) !== gewaehlt) ringe(w);
      gewaehlt = w || null;
      var alt = svg.querySelector('.lO.lS'); if (alt) alt.classList.remove('lS');
      var altC = el.querySelector('.ltC.ltS'); if (altC) altC.classList.remove('ltS');
      if (w) {
        var i = D.wesen.indexOf(w), g = svg.querySelector('.lO[data-i="' + i + '"]'), c = el.querySelector('.ltC[data-i="' + i + '"]');
        if (g) g.classList.add('lS');
        if (c) c.classList.add('ltS');
      }
      if (w && w.art !== 'figur' && typeof sendPrompt === 'function') { bGlossar.hidden = false; bGlossar.textContent = 'Glossar ' + w.name + ' ↗'; }
      else bGlossar.hidden = true;
    }
    function wesenZeigen(w) {
      var teile = ['<b>' + esc(w.name) + '</b>', esc(artWort(w)), w._feld + (w.groesse > 1 ? ' (' + w.groesse + ' × ' + w.groesse + ' Felder)' : '')];
      if (w.id === D.aktiv) teile.push('ist dran');
      if (tpWort(w)) teile.push(tpWort(w));
      if (w.zustand !== 'unversehrt' || !tpWort(w)) teile.push(esc(w.zustand));
      w.zustaende.forEach(function (z) { teile.push(esc(z)); });
      var ab = abstandWort(w, D); if (ab) teile.push(ab);
      if (w.bewegung != null) teile.push('noch ' + meter(w.bewegung / D.feld, D) + ' Bewegung');
      w.ziel.forEach(function (id) { var o = D.wesen.filter(function (x) { return x.id === id; })[0]; if (o) teile.push('greift ' + esc(o.name) + ' an'); });
      if (w.notiz) teile.push(esc(w.notiz));
      zeige(teile.join(' · '), w);
    }
    function feldZeigen(x, y) {
      var z = D._zellen.filter(function (c) { return c.x === x && c.y === y; }), wer = D.wesen.filter(function (w) { return x >= w._x && x < w._x + w.groesse && y >= w._y && y < w._y + w.groesse; });
      if (wer.length) return wesenZeigen(wer[0]);
      var teile = ['<b>' + feldName(x, y) + '</b>'];
      if (z.length) z.forEach(function (c) { teile.push(esc(c.name) + (GELAENDE[c.art] ? ' · ' + esc(GELAENDE[c.art][1]) : '')); });
      else teile.push('frei');
      D.bereiche.forEach(function (b) {
        if (b.name && (b._felder || b._drin).some(function (f) { return f.x === x && f.y === y; })) teile.push('in: ' + esc(b.name));
      });
      var ab = abstandWort({ _x: x, _y: y, groesse: 1 }, D);
      if (ab) teile.push(ab);
      if (D._weg) {
        var wer = D._weg.wer, k = D._weg.kosten[x + ',' + y], name = wer.art === 'figur' ? 'du' : esc(wer.name);
        if (k != null) teile.push((wer.art === 'figur' ? 'erreichst du' : name + ' erreicht es') + ' mit ' + meter(k, D));
        else { var weit = kostenBis(D, wer, x, y); teile.push(weit != null ? 'zu weit: ' + meter(weit, D) + ', ' + (wer.art === 'figur' ? 'du hast' : name + ' hat') + ' noch ' + meter(wer.bewegung / D.feld, D) : 'nicht erreichbar'); }
      }
      zeige(teile.join(' · '), null);
    }
    svg.addEventListener('click', function (ev) {
      var g = ev.target && ev.target.closest ? ev.target.closest('.lO') : null;
      if (g) { wesenZeigen(D.wesen[+g.getAttribute('data-i')]); return; }
      var r = svg.getBoundingClientRect(), f = W / (r.width || W);
      var x = Math.floor(((ev.clientX - r.left) * f - RL) / S), y = Math.floor(((ev.clientY - r.top) * f - RO) / S);
      if (x < 0 || y < 0 || x >= D.breite || y >= D.hoehe) return;
      feldZeigen(x, y);
    });
    svg.addEventListener('keydown', function (ev) {
      var g = ev.target && ev.target.closest ? ev.target.closest('.lO') : null;
      if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); wesenZeigen(D.wesen[+g.getAttribute('data-i')]); }
    });
    el.querySelectorAll('.ltC').forEach(function (c) {
      function wahl() { wesenZeigen(D.wesen[+c.getAttribute('data-i')]); }
      c.addEventListener('click', wahl);
      c.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); wahl(); } });
    });
    bLeg.addEventListener('click', function () {
      leg.hidden = !leg.hidden;
      bLeg.setAttribute('aria-expanded', String(!leg.hidden));
    });
    bGlossar.addEventListener('click', function () {
      if (gewaehlt && typeof sendPrompt === 'function') sendPrompt('Glossar ' + gewaehlt.name);
    });
  }

  function start() {
    var el = document.getElementById('lagebild'), D = window.LAGEBILD;
    if (!el || !D) return;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Das Lagebild ließ sich nicht zeichnen: ' + err.message; }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { zeichne: zeichne, pruefen: pruefen, vorbereiten: vorbereiten, entfernung: entfernung, erreichbar: erreichbar, kostenBis: kostenBis, inReichweite: inReichweite, feldName: feldName, feldLesen: feldLesen, version: VERSION };
  } else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
