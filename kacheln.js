// Kacheln der Kampfkarte, gebaut von kacheln-bauen.js aus der Seite des Weltenhüters (sha256 6cf65275dfbd34150c72868c0bf1e6a2b149773c34f0cca965663baadf6fadae). Nicht von Hand ändern.
(function () {
  'use strict';
  var KONST = { tinte: '#3b3028', schatten: '#2a2119', hoehenton: '#fff6dc', pergament: '#efe2c3', gold: '#b08d3a', rot: '#8e3b22', gruen: '#4d5b33', hell: '#efe2c3', schrift: '#f6efdd' };
  var D4 = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // N, O, S, W

  function stern(cx, cy, R, r, n, off) {
    var p = [];
    for (var i = 0; i < 2 * n; i++) { var a = off + i * Math.PI / n, d = i % 2 ? r : R; p.push(Math.round((cx + d * Math.cos(a)) * 10) / 10 + ',' + Math.round((cy + d * Math.sin(a)) * 10) / 10); }
    return p.join(' ');
  }
  var OBEN = -Math.PI / 2, TANNE = stern(18, 18, 14.5, 9.8, 9, OBEN);
  // Bäume sind größer als ihr Feld: f ist der Maßstab um die Feldmitte (1 für die Kachel für sich, 2,1 auf der Karte, Krone gut 3 m).
  // Mit dem Maßstab wachsen Formen und Zahl der Zweigspitzen, nicht die Strichstärken.
  function um(c, f) { return 18 + (c - 18) * f; }
  function tanneTeile(f) {
    var g = f > 1.5, n = g ? 13 : 9, aussen = stern(18, 18, 14.5 * f, 9.8 * f + (g ? 6 : 0), n, OBEN);
    return {
      schatten: '<polygon points="' + aussen + '"/>',
      form: '<polygon points="' + aussen + '" fill="#3f5a46" stroke="#3b3028" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<polygon points="' + stern(um(17, f), um(17, f), 10.6 * f, 7.2 * f + (g ? 4 : 0), g ? 11 : 9, OBEN) + '" fill="#e3ecef"/>' +
        '<polygon points="' + stern(um(17.6, f), um(17.6, f), 7.2 * f, 4.6 * f + (g ? 2.5 : 0), g ? 9 : 7, OBEN + 0.2) + '" fill="#4f6b55"/>' +
        '<polygon points="' + stern(um(17, f), um(17, f), 4 * f, 2.6 * f, 5, OBEN) + '" fill="#f3f7f9"/><circle cx="' + um(17.6, f) + '" cy="' + um(17.6, f) + '" r="' + (g ? 1.8 : 1.2) + '" fill="#6b573f"/>'
    };
  }
  // Feuer: Flammen in einer Gruppe, die leicht flackert (nicht bei reduzierter Bewegung)
  function flammen(cx, cy, s) {
    return '<g class="flamme" transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')"><path d="M0-9c3 4 6 6 5 10a5 5 0 0 1-10 0c-.5-3 2-5 2-8 1 2 2 3 3 3 0-2-.5-3 0-5z" fill="#e0892e"/><path d="M0-4c2 2.5 3.5 4 3 6.5a3 3 0 0 1-6 0c0-2 1.5-3 1.5-5 .8 1 1.2 1.5 1.5 1.5z" fill="#f2c94c"/></g>';
  }
  // Lagerfeuer: gemeinsam; der Ring um das Feuer (geschmolzener Schnee, Brandfleck) kommt aus dem Set
  var FEUER_RING = 'M18 2.5C27 2 34 9 33.5 18S27 34 18 33.5 2 27 2.5 18 9 3 18 2.5Z';
  function lagerfeuer(ring, kalt) {
    var steine = '';
    for (var i = 0; i < 9; i++) {
      var a = i * 2 * Math.PI / 9 + 0.3, x = Math.round((18 + 11.6 * Math.cos(a)) * 10) / 10, y = Math.round((18 + 11.6 * Math.sin(a)) * 10) / 10;
      steine += '<ellipse cx="' + x + '" cy="' + y + '" rx="3.2" ry="2.6" transform="rotate(' + Math.round(a * 180 / Math.PI) + ' ' + x + ' ' + y + ')" fill="#8f897d" stroke="#3b3028" stroke-width=".9"/><circle cx="' + (x - 0.9) + '" cy="' + (y - 0.8) + '" r=".9" fill="#b8b1a3"/>';
    }
    return (ring || '') + '<circle cx="18" cy="18" r="9" fill="#4a4038"/>' + steine +
      '<g transform="rotate(35 18 18)"><rect x="10" y="16.2" width="16" height="3.6" rx="1.8" fill="#6b4a2c" stroke="#3b3028" stroke-width=".8"/></g><g transform="rotate(-35 18 18)"><rect x="10" y="16.2" width="16" height="3.6" rx="1.8" fill="#7a5634" stroke="#3b3028" stroke-width=".8"/></g>' +
      (kalt ? '<circle cx="13" cy="21" r="1" fill="#6f695f"/><circle cx="23" cy="14" r=".9" fill="#6f695f"/><circle cx="22" cy="22" r=".8" fill="#6f695f"/>' : '<circle cx="13" cy="21" r="1" fill="#e0892e"/><circle cx="23" cy="14" r=".9" fill="#f2c94c"/><circle cx="22" cy="22" r=".8" fill="#e0892e"/>' + flammen(18, 19, 0.95));
  }

  // Der Weg als Kantensatz: tritt bei 10 und 26 senkrecht über den Rand, dazwischen geschwungen. Die Formen sind gemeinsam,
  // die Farben (Saum, Band, Kante, Spuren) kommen aus dem Set: set.weg = {wall, band, kante, spuren}
  function wegSvg(set, fl, se, sp) {
    var w = set.weg;
    return '<path d="' + se + '" fill="none" stroke="' + w.wall + '" stroke-width="3.6"/><path d="' + fl + '" fill="' + w.band + '"/><path d="' + se + '" fill="none" stroke="' + w.kante + '" stroke-width="1.2"/>' +
      sp.map(function (s) { return '<ellipse cx="' + s[0] + '" cy="' + s[1] + '" rx="1.5" ry="2.4" transform="rotate(' + s[2] + ' ' + s[0] + ' ' + s[1] + ')" fill="' + w.spuren + '"/>'; }).join('');
  }
  var WEG_PFADE = {
    gerade: ['M10 0C10 7 13 11 12.5 18C12 25 10 29 10 36H26C26 29 24 25 23.5 17C23 10 26 6 26 0Z',
      'M10 0C10 7 13 11 12.5 18C12 25 10 29 10 36M26 0C26 6 23 10 23.5 17C24 25 26 29 26 36', [[15.5, 5, -4], [20.5, 12, 4], [16, 20, -6], [20.5, 28, 3]]],
    ecke: ['M10 0C10 9 13 15 17 19C21 23 27 26 36 26V10C34 10 32 10.3 30 9.5C27 8 26 4 26 0Z',
      'M10 0C10 9 13 15 17 19C21 23 27 26 36 26M26 0C26 4 27 8 30 9.5C32 10.3 34 10 36 10', [[18, 6, 40], [24.5, 15, 50], [31, 19, 80]]],
    abzweig: ['M10 0C10 8 8 14 9 20C10 26 10 30 10 36H26C26 33 26.5 30 28 28.5C30 26.5 33 26 36 26V10C34 10 32 10.3 30 9.5C27 8 26 4 26 0Z',
      'M10 0C10 8 8 14 9 20C10 26 10 30 10 36M26 0C26 4 27 8 30 9.5C32 10.3 34 10 36 10M36 26C33 26 30 26.5 28 28.5C26.5 30 26 33 26 36', [[15, 6, 0], [19, 14, 5], [31, 18, 90], [15, 24, -5], [20, 31, 0]]],
    kreuz: ['M10 0H26C26 5 29 10 36 10V26C30 26 26 29 26 36H10C10 31 7 26 0 26V10C6 10 10 6.5 10 0Z',
      'M26 0C26 5 29 10 36 10M36 26C30 26 26 29 26 36M10 36C10 31 7 26 0 26M0 10C6 10 10 6.5 10 0', [[16, 5, 0], [20, 31, 0], [5, 20, 90], [31, 16, 90], [18, 18, 40]]],
    ende: ['M10 0C10 10 9 20 15 24C19 27 25 24 25.5 17C26 10 26 5 26 0Z', 'M10 0C10 10 9 20 15 24C19 27 25 24 25.5 17C26 10 26 5 26 0', [[15, 6, 0], [19, 15, 8]]],
    fleck: ['M18 9C24 8 28 13 27 18C27 24 22 28 17 27C11 27 8 22 9 17C9.5 12 13 9.5 18 9Z', 'M18 9C24 8 28 13 27 18C27 24 22 28 17 27C11 27 8 22 9 17C9.5 12 13 9.5 18 9Z', [[15.5, 16, 30], [20.5, 21, 30]]]
  };
  function wegFormen(set) {
    if (!set._weg) { set._weg = {}; Object.keys(WEG_PFADE).forEach(function (f) { var p = WEG_PFADE[f]; set._weg[f] = wegSvg(set, p[0], p[1], p[2]); }); }
    return set._weg;
  }
  var WEG_NAME = { gerade: 'gerade', ecke: 'Ecke', abzweig: 'Abzweig', kreuz: 'Kreuzung', ende: 'Ende', fleck: 'Fleck' };
  var WEG_MASKE = { gerade: 5, ecke: 3, abzweig: 7, kreuz: 15, ende: 1 }; // N = 1, O = 2, S = 4, W = 8
  function dreheMaske(m) { return ((m << 1) | (m >> 3)) & 15; }
  function wegForm(m) {
    if (!m) return { form: 'fleck', r: 0 };
    for (var r = 0; r < 4; r++) for (var f in WEG_MASKE) {
      var b = WEG_MASKE[f]; for (var i = 0; i < r; i++) b = dreheMaske(b);
      if (b === m) return { form: f, r: r * 90 };
    }
    return { form: 'fleck', r: 0 };
  }

  // Viertelstücke im Viertel oben links (0 bis 18): Rand oben, Rand links, Außenecke, Innenecke
  var UFER = {
    oben: { fl: 'M0 0H18V6C14 6 12 7.6 9 7.2C6 6.8 3 6 0 6Z', li: 'M18 6C14 6 12 7.6 9 7.2C6 6.8 3 6 0 6' },
    links: { fl: 'M0 0V18H6C6 14 7.6 12 7.2 9C6.8 6 6 3 6 0Z', li: 'M6 18C6 14 7.6 12 7.2 9C6.8 6 6 3 6 0' },
    aussen: { fl: 'M0 0H18V6C12 6 7.5 8 6.6 12C6 14.5 6 16 6 18H0Z', li: 'M18 6C12 6 7.5 8 6.6 12C6 14.5 6 16 6 18' },
    innen: { fl: 'M0 0H6C6 3.5 3.5 6 0 6Z', li: 'M6 0C6 3.5 3.5 6 0 6' }
  };
  // Ufer: die Kantenfarbe kommt von der Kachel (Wasser dunkel, Eis hell), Fläche und Saum vom Set: set.ufer = {flaeche, linie}
  function uferStueck(set, st, dunkel) { return uferStueckF(st, dunkel, set.ufer.flaeche, set.ufer.linie); }
  // Dasselbe Stück mit eigenen Farben (seit Set 6: Ufer in der Farbe des Nachbarn, Kante zwischen seichtem und tiefem Wasser)
  function uferStueckF(st, dunkel, flaeche, linie) {
    var u = UFER[st]; if (!u) return '';
    return '<path d="' + u.li + '" fill="none" stroke="' + dunkel + '" stroke-width="3.4"/><path d="' + u.fl + '" fill="' + flaeche + '"/><path d="' + u.li + '" fill="none" stroke="' + linie + '" stroke-width="1.4"/>';
  }
  var TEP = { feld: '#44506b', rand: '#6b5a3e', hell: '#e3d6b8' };
  function teppichStueck(st) {
    if (st === 'innen') return '<path d="M8 0H18V18H0V8H8Z" fill="' + TEP.feld + '"/><path d="M2 0H8V8H0V2H2Z" fill="' + TEP.rand + '"/><path d="M8 0V8H0" fill="none" stroke="' + TEP.hell + '" stroke-width=".8"/><path d="M5 2.8L7.2 5 5 7.2 2.8 5Z" fill="' + TEP.hell + '"/>';
    var n = st === 'oben' || st === 'aussen', w = st === 'links' || st === 'aussen', x0 = w ? 8 : 0, y0 = n ? 8 : 0, o = [];
    o.push('<rect x="' + x0 + '" y="' + y0 + '" width="' + (18 - x0) + '" height="' + (18 - y0) + '" fill="' + TEP.feld + '"/>');
    if (n) {
      o.push('<rect x="' + (w ? 2 : 0) + '" y="2" width="' + (w ? 16 : 18) + '" height="6" fill="' + TEP.rand + '"/><path d="M' + (w ? 8 : 0) + ' 8H18" stroke="' + TEP.hell + '" stroke-width=".8"/><circle cx="13" cy="5" r="1" fill="' + TEP.hell + '"/>');
      o.push('<path d="' + [4, 8, 12, 16].filter(function (x) { return !w || x > 3; }).map(function (x) { return 'M' + x + ' .4V2'; }).join('') + '" stroke="' + TEP.hell + '" stroke-width=".9"/>');
    }
    if (w) {
      o.push('<rect x="2" y="' + (n ? 2 : 0) + '" width="6" height="' + (n ? 16 : 18) + '" fill="' + TEP.rand + '"/><path d="M8 ' + (n ? 8 : 0) + 'V18" stroke="' + TEP.hell + '" stroke-width=".8"/><circle cx="5" cy="13" r="1" fill="' + TEP.hell + '"/>');
      o.push('<path d="' + [4, 8, 12, 16].filter(function (y) { return !n || y > 3; }).map(function (y) { return 'M.4 ' + y + 'H2'; }).join('') + '" stroke="' + TEP.hell + '" stroke-width=".9"/>');
    }
    if (n && w) o.push('<path d="M5 2.8L7.2 5 5 7.2 2.8 5Z" fill="' + TEP.hell + '"/>');
    return o.join('');
  }
  var TEP_MITTE = '<path d="M18 13L23 18 18 23 13 18Z" fill="none" stroke="#e3d6b8" stroke-width="1"/><circle cx="18" cy="18" r="1.3" fill="#c9a86a"/>';
  // Stroh: loses Gewachsenes, darum ein ausgefranster Rand um 4 Einheiten
  var STROH = {
    oben: { fl: 'M0 4C3 3 5 5.5 8 4.5C11 3.5 14 5 18 4V18H0Z', li: 'M0 4C3 3 5 5.5 8 4.5C11 3.5 14 5 18 4' },
    links: { fl: 'M4 0C3 3 5.5 5 4.5 8C3.5 11 5 14 4 18H18V0Z', li: 'M4 0C3 3 5.5 5 4.5 8C3.5 11 5 14 4 18' },
    aussen: { fl: 'M18 4C13 4 8 5 6 8C4.5 10.5 4 14 4 18H18Z', li: 'M18 4C13 4 8 5 6 8C4.5 10.5 4 14 4 18' },
    innen: { fl: 'M0 4C2.5 4 4 2.5 4 0H18V18H0Z', li: 'M0 4C2.5 4 4 2.5 4 0' },
    leer: { fl: 'M0 0H18V18H0Z', li: '' }
  };
  function strohStueck(st) {
    var s = STROH[st], n = st === 'oben' || st === 'aussen', w = st === 'links' || st === 'aussen';
    var h = [[7, 9, 20, 6], [11, 13, -30, 6], [12, 7, 50, 5], [8, 15, -70, 4], [13, 16, 10, 4]];
    if (!n) h.push([4, 2.5, 10, 4], [11, 2, -15, 5]);
    if (!w) h.push([2, 6, 75, 4], [2.5, 12, 100, 4]);
    return '<path d="' + s.fl + '" fill="#c4a65e"/>' + (s.li ? '<path d="' + s.li + '" fill="none" stroke="#8f7440" stroke-width=".9"/>' : '') +
      h.map(function (q, i) { var a = q[2] * Math.PI / 180; return '<path d="M' + q[0] + ' ' + q[1] + 'l' + Math.round(q[3] * Math.cos(a) * 10) / 10 + ' ' + Math.round(q[3] * Math.sin(a) * 10) / 10 + '" stroke="' + (i % 2 ? '#9c7f45' : '#e3cc8c') + '" stroke-width="1" stroke-linecap="round"/>'; }).join('');
  }
  // Die Wehe drinnen (2 am Loch, 1 ein Feld weiter) steht im Set: set.wehe = {2: ..., 1: ...}
  function ziegel() {
    var f = ['#ad7a5c', '#a37052', '#b5856a', '#a8765a'], o = [], i = 0;
    [[0, 0, 'h'], [18, 0, 'v'], [0, 18, 'v'], [18, 18, 'h']].forEach(function (q) {
      var r = q[2] === 'h' ? [[0.5, 0.5, 17, 8], [0.5, 9.5, 17, 8]] : [[0.5, 0.5, 8, 17], [9.5, 0.5, 8, 17]];
      r.forEach(function (b) { o.push('<rect x="' + (q[0] + b[0]) + '" y="' + (q[1] + b[1]) + '" width="' + b[2] + '" height="' + b[3] + '" rx=".8" fill="' + f[i++ % 4] + '"/>'); });
    });
    return o.join('') + '<path d="M3 3.5h10M21.5 3v10M3.5 21v10M21 21.5h11" stroke="#c99a7e" stroke-width=".8" opacity=".7"/>';
  }
  function fliesen() {
    var o = [];
    for (var y = 0; y < 3; y++) for (var x = 0; x < 3; x++) o.push('<rect x="' + (x * 12 + 0.5) + '" y="' + (y * 12 + 0.5) + '" width="11" height="11" rx=".6" fill="' + ((x + y) % 2 ? '#c9d3d8' : '#e4dece') + '"/>');
    return o.join('') + '<path d="' + [0, 1, 2].map(function (y) { return [0, 1, 2].map(function (x) { return 'M' + (x * 12 + 2) + ' ' + (y * 12 + 8) + 'V' + (y * 12 + 2) + 'H' + (x * 12 + 8); }).join(''); }).join('') + '" fill="none" stroke="#f8f5ec" stroke-width=".9"/>';
  }

  function mauer() {
    var b = [[0.6, 0.6, 14.8], [16.6, 0.6, 18.8], [0.6, 12.6, 7.8], [9.6, 12.6, 15.8], [26.6, 12.6, 8.8], [0.6, 24.6, 20.8], [22.6, 24.6, 12.8]], f = ['#6b655a', '#625c52', '#68625a', '#6e685d', '#605a50', '#6a6458', '#645e54'];
    return b.map(function (q, i) { return '<rect x="' + q[0] + '" y="' + q[1] + '" width="' + q[2] + '" height="10.8" rx="1.2" fill="' + f[i] + '"/>'; }).join('') +
      '<path d="' + b.map(function (q) { return 'M' + (q[0] + 0.8) + ' ' + (q[1] + 9.6) + 'V' + (q[1] + 1) + 'H' + (q[0] + q[2] - 1); }).join('') + '" fill="none" stroke="#8d8577" stroke-width=".9" opacity=".7"/>' +
      '<path d="M5 30l2-1.5M29 5l1.5 1M20 17l2 1" stroke="#4a443b" stroke-width=".9" stroke-linecap="round"/>';
  }

  // Herd: steht mit dem Rücken am Rand seines Feldes (0° = Rücken oben), davor eine schmale Herdplatte, dann freier Boden;
  // nur mit einem Kochtopf davor (karte.kochtopf) füllt er das Feld
  var HERD = {
    schatten: '<rect x="3" y="1" width="30" height="17" rx="2"/><rect x="6" y="16" width="24" height="6.5" rx="2"/>',
    form: '<rect x="6" y="16" width="24" height="6.5" rx="2" fill="#a8a194" stroke="#3b3028" stroke-width="1.2"/><path d="M14 18.4V22M22 18.4V22" stroke="#8a8478" stroke-width=".9"/><ellipse cx="18" cy="19.8" rx="6.2" ry="1.6" fill="#6f695f" opacity=".6"/>' +
      '<rect x="3" y="1" width="30" height="17" rx="2" fill="#7d776c" stroke="#3b3028" stroke-width="1.3"/><path d="M3.7 6.5H32.3M3.7 12H32.3M11 1.7V6.5M25 1.7V6.5M7 6.5V12M29 6.5V12" stroke="#5c574e" stroke-width=".9"/><path d="M4.3 16.6V2.3H31.7" fill="none" stroke="#a39d91" stroke-width=".9"/>' +
      '<path d="M10 18V10.6Q18 4.2 26 10.6V18Z" fill="#2f2620" stroke="#3b3028" stroke-width="1.1"/><rect x="12" y="14" width="12" height="3" rx="1.5" fill="#6b4a2c"/>'
  };
  // Herd mit Feuer (Standard) und erloschen (karte.erloschen): ohne Glut, ohne Flammen, ohne Licht
  var HERD_KALT = { schatten: HERD.schatten, form: HERD.form + '<circle cx="14" cy="17" r=".9" fill="#6f695f"/><circle cx="22" cy="16.8" r=".8" fill="#6f695f"/>' };
  HERD.form += '<circle cx="14" cy="17" r=".9" fill="#e0892e"/><circle cx="22" cy="16.8" r=".8" fill="#f2c94c"/>' + flammen(18, 14.6, 0.62);
  // Kochtopf vor dem Herd: ein eiserner Topf mit Rand und Eintopf
  var KOCHTOPF = '<circle cx="18" cy="28.4" r="5.4" fill="#3f3a35" stroke="#3b3028" stroke-width="1.2"/><circle cx="18" cy="28.4" r="3.9" fill="#6b4a2c"/><path d="M14.4 26.4a4.2 4.2 0 0 1 4.6-2.2" fill="none" stroke="#8f8a80" stroke-width=".9" stroke-linecap="round"/>' +
    '<circle cx="16.6" cy="28" r=".9" fill="#a0784a"/><circle cx="19.6" cy="29.6" r=".8" fill="#a0784a"/><rect x="11.2" y="27.4" width="2" height="2" rx=".6" fill="#3f3a35" stroke="#3b3028" stroke-width=".8"/><rect x="22.8" y="27.4" width="2" height="2" rx=".6" fill="#3f3a35" stroke="#3b3028" stroke-width=".8"/>';
  // Gemeinsam: in allen Sets gleich. Böden drinnen, Beläge, gebaute Wände, Standardtür, Fass, Kiste, Truhe, Möbel, Feuer.
  // Dinge stehen mit muster 'aussen' auf dem Standardgrund des Sets (set.standard) oder auf dem Boden ihrer Nachbarn.
  var GEMEINSAM = {
    id: 'gemeinsam', name: 'Gemeinsam',
    rollen: [
      ['Mauer', '#6b655a', 'Feldstein; Fugen #3f3a33'], ['Holzwand', '#5a4330', 'Balkenköpfe; Ringe #76593d, Grund #33261a'], ['Lehmwand', '#5c4734', 'Geflecht #4a3828'],
      ['Dielen', '#a07a4e', 'Fugen #6f5132'], ['Stein', '#a8a194', 'Platten drinnen; Fugen #6f695f'], ['Ziegel', '#ad7a5c', 'Fugen #7d5a45'], ['Fliesen', '#e4dece', 'im Wechsel mit #c9d3d8'], ['Erde', '#8a7458', 'Lehm, lose Erde'],
      ['Stroh', '#c4a65e', 'Halme #e3cc8c, #9c7f45'], ['Teppich', '#44506b', 'Rand #6b5a3e, Wolle #e3d6b8'], ['Fell', '#e9e2cf', 'Bärenfell, Felltür'],
      ['Holz', '#a88a5c', 'Fass, Kiste; Truhe #8a5f3a'], ['Möbel', '#c29a63', 'Platte; Flanke #7d5a36, Licht #e0c08a; Hocker #b88f5a'], ['Herd', '#7d776c', 'Platte #a8a194, Öffnung #2f2620; Kochtopf #3f3a35'], ['Lagerfeuer', '#8f897d', 'Steine; Asche #4a4038'],
      ['Messing', '#e8d08a', 'Griff, Schloss: benutzbar'], ['Flammen', '#e0892e', 'mit #f2c94c; sonst nirgends']
    ],
    muster: {
      mauer: { grund: '#3f3a33', bilder: [mauer()] },
      holzwand: { grund: '#33261a', bilder: [
        [[0.5, 0.5, '#5a4330'], [18.5, 0.5, '#614a35'], [0.5, 18.5, '#5e4632'], [18.5, 18.5, '#57412e']].map(function (b, i) {
          var cx = b[0] + 8.5, cy = b[1] + 8.5, r = [[1, 4], [-3, 2], [3, -2], [-2, -3]][i];
          return '<rect x="' + b[0] + '" y="' + b[1] + '" width="17" height="17" rx="2.5" fill="' + b[2] + '"/>' +
            '<path d="M' + (b[0] + 1.2) + ' ' + (b[1] + 14.5) + 'V' + (b[1] + 2.5) + 'Q' + (b[0] + 1.2) + ' ' + (b[1] + 1.2) + ' ' + (b[0] + 2.5) + ' ' + (b[1] + 1.2) + 'H' + (b[0] + 14.5) + '" fill="none" stroke="#80654a" stroke-width=".9"/>' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="5.2" fill="none" stroke="#76593d" stroke-width=".9"/><circle cx="' + cx + '" cy="' + cy + '" r="2.2" fill="none" stroke="#76593d" stroke-width=".9"/>' +
            '<path d="M' + cx + ' ' + cy + 'l' + r[0] * 1.6 + ' ' + r[1] * 1.6 + '" stroke="#2a1f15" stroke-width="1" stroke-linecap="round"/>';
        }).join('')
      ] },
      lehmwand: { grund: '#5c4734', bilder: [
        '<path d="M3 8q7-3 14 0t15 0M4 15q6-2.5 12 0M18 22q7-3 13 0M6 31q7-3 13 0" fill="none" stroke="#86694c" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>' +
        '<path d="M24 27l2 2.5-.5 2" fill="none" stroke="#45352a" stroke-width=".8" stroke-linecap="round"/>' +
        '<path d="M8 21l3 .8M12 25l2.5-1M27 11l3 1M5 10l2-.5M14 5l2.5.6M22 17l2.5.5" stroke="#b89a5c" stroke-width=".9" stroke-linecap="round"/>'
      ],
      // seltenes Detail: höchstens jedes siebte Feld, nie zwei nebeneinander
      selten: '<path d="M19 19C22 17 27 18 29.5 20S31 27 27.5 29.5 20 30 18.5 26.5Z" fill="#4a3828"/><path d="M19.5 21.5h9.5M19 24.5h11M19.5 27.5h9M22 18.5v11M25.5 18.3v11.4" stroke="#8a6d4a" stroke-width="1"/>' +
        '<path d="M19 19C22 17 27 18 29.5 20S31 27 27.5 29.5 20 30 18.5 26.5Z" fill="none" stroke="#86694c" stroke-width="1"/>' },
      holz: { grund: '#a07a4e', bilder: [
        '<path d="M0 0H36M0 9H36M0 18H36M0 27H36M0 36H36" stroke="#6f5132" stroke-width="1"/><path d="M14 0V9M6 9V18M30 9V18M20 18V27M10 27V36M28 27V36" stroke="#6f5132" stroke-width=".9"/><path d="M2 4.5q6 1 10-.5M17 13.5q6-1 11 .5M3 22q8 1 15-.5M14 31q5 1 12-.5" fill="none" stroke="#8d6a42" stroke-width=".8"/><circle cx="24" cy="4" r=".8" fill="#6f5132"/>'
      ] },
      stein: { grund: '#a8a194', bilder: [
        '<rect width="18" height="18" fill="#a39c8f"/><rect x="18" width="18" height="18" fill="#aea799"/><rect x="9" y="18" width="18" height="18" fill="#a29b8d"/><path d="M0 0H36M0 18H36M0 36H36M0 0V18M18 0V18M36 0V18M9 18V36M27 18V36" stroke="#6f695f" stroke-width="1.2"/><path d="M4 7q4-2 8 0M21 27q3-1.5 6 0M24 11l2 2" fill="none" stroke="#c4bdaf" stroke-width=".9" stroke-linecap="round"/>'
      ] },
      ziegel: { grund: '#7d5a45', bilder: [ziegel()] },
      fliesen: { grund: '#b9b1a0', bilder: [fliesen()] },
      erde: { grund: '#8a7458', bilder: [
        '<ellipse cx="11" cy="10" rx="6" ry="3.5" fill="#7a6549"/><ellipse cx="25" cy="25" rx="7" ry="4" fill="#7a6549" opacity=".8"/><circle cx="26" cy="9" r="1.5" fill="#a79070" stroke="#5f4d37" stroke-width=".5"/><circle cx="9" cy="26" r="1.3" fill="#a79070" stroke="#5f4d37" stroke-width=".5"/><circle cx="18" cy="18" r=".9" fill="#5f4d37"/><path d="M5 18l3-1M28 15l3 1M15 30l2 .5" stroke="#5f4d37" stroke-width=".8" stroke-linecap="round"/>'
      ] }
    },
    // Aufsätze: ein Text ohne Schatten oder {schatten: Silhouette, form: Körper}; das Wetter darauf kommt aus dem Set (set.wetter[id]), der Ring des Lagerfeuers auch
    aufsatz: {
      tuer: '<rect x="5" y="3" width="26" height="30" rx="1.5" fill="#8a6a42" stroke="#3b3028" stroke-width="1.2"/><path d="M11.5 4V32M18 4V32M24.5 4V32" stroke="#6b4f30" stroke-width=".9"/><path d="M6 4.3H30" stroke="#b08a5e" stroke-width=".9" opacity=".85"/><rect x="6" y="9" width="24" height="3.2" rx=".8" fill="#55504a"/><rect x="6" y="23.8" width="24" height="3.2" rx=".8" fill="#55504a"/><g fill="#2a2119"><circle cx="8.5" cy="10.6" r=".75"/><circle cx="27.5" cy="10.6" r=".75"/><circle cx="8.5" cy="25.4" r=".75"/><circle cx="27.5" cy="25.4" r=".75"/></g><circle cx="26" cy="18" r="1.6" fill="#e8d08a" stroke="#3b3028" stroke-width=".5"/>',
      fell: '<path d="M18 6c4 0 6 3 6 6 3-1 6 0 7 2-2 0-4 1-5 3 1 3 1 6 0 8 2 1 4 3 4 5-2 0-5-1-6-2-1 2-3 3-6 3s-5-1-6-3c-1 1-4 2-6 2 0-2 2-4 4-5-1-2-1-5 0-8-1-2-3-3-5-3 1-2 4-3 7-2 0-3 2-6 6-6z" fill="#e9e2cf" stroke="#8b7f68" stroke-width="1" stroke-linejoin="round"/>' +
        '<path d="M14 16q4 2 8 0M13 21q5 2 10 0M15 26q3 1 6 0" fill="none" stroke="#cfc4ab" stroke-width="1"/><circle cx="18" cy="9.5" r="2.6" fill="#ddd4bd"/><circle cx="16.8" cy="9" r=".6" fill="#3b3028"/><circle cx="19.2" cy="9" r=".6" fill="#3b3028"/>',
      stuhl: {
        schatten: '<rect x="9" y="11" width="18" height="17" rx="2"/><rect x="8" y="5.5" width="20" height="5" rx="1.5"/>',
        form: '<rect x="9" y="11" width="18" height="17" rx="2" fill="#c29a63" stroke="#3b3028" stroke-width="1.3"/><path d="M9.7 19.5H26.3" stroke="#8a6a40" stroke-width=".9"/><path d="M25.8 12V27M10 26.8H26" stroke="#7d5a36" stroke-width="2"/>' +
          '<rect x="8" y="5.5" width="20" height="5" rx="1.5" fill="#7d5a36" stroke="#3b3028" stroke-width="1.2"/><path d="M9.5 7h17" stroke="#a07a4e" stroke-width=".8"/>'
      },
      lagerfeuer: function (set) { return lagerfeuer(set.feuerring); },
      lagerfeuerKalt: function (set) { return lagerfeuer(set.feuerring, true); },
      feuerstelle: HERD,
      feuerstelleTopf: { schatten: HERD.schatten + '<circle cx="18" cy="28.4" r="5.4"/>', form: HERD.form + KOCHTOPF },
      feuerstelleKalt: HERD_KALT,
      feuerstelleTopfKalt: { schatten: HERD.schatten + '<circle cx="18" cy="28.4" r="5.4"/>', form: HERD_KALT.form + KOCHTOPF },
      hocker: {
        schatten: '<circle cx="18" cy="18" r="8"/>',
        form: '<circle cx="18" cy="18" r="8" fill="#b88f5a" stroke="#3b3028" stroke-width="1.3"/><path d="M23.7 12.3A8 8 0 0 1 12.3 23.7A9.5 9.5 0 0 0 23.7 12.3Z" fill="#7d5a36"/><circle cx="18" cy="18" r="4" fill="none" stroke="#8a6a40" stroke-width=".8"/><circle cx="18" cy="18" r="8" fill="none" stroke="#3b3028" stroke-width="1.3"/>'
      },
      fass: {
        schatten: '<circle cx="18" cy="18" r="12"/>',
        form: '<circle cx="18" cy="18" r="12" fill="#a88a5c" stroke="#3b3028" stroke-width="1.3"/><path d="M26.5 9.5A12 12 0 0 1 9.5 26.5A14 14 0 0 0 26.5 9.5Z" fill="#7d6443"/>' +
          '<path d="M13 10.5V25.5M18 9V27M23 10.5V25.5" stroke="#7d6443" stroke-width=".9"/><circle cx="18" cy="18" r="9" fill="none" stroke="#4a3520" stroke-width="1.5"/><circle cx="22.5" cy="21" r="1.3" fill="#4a3520"/>'
      },
      kiste: {
        schatten: '<rect x="7" y="7" width="22" height="22" rx="1"/>',
        form: '<rect x="7" y="7" width="22" height="22" rx="1" fill="#a88a5c" stroke="#3b3028" stroke-width="1.3"/><path d="M7.7 14.3H28.3M7.7 21.6H28.3" stroke="#7d6443" stroke-width=".9"/>' +
          '<rect x="9.5" y="9.5" width="17" height="17" fill="none" stroke="#6b5235" stroke-width="1.6"/><path d="M9.5 26.5L26.5 9.5" stroke="#6b5235" stroke-width="1.6"/><path d="M28 8.5V28H8.5" fill="none" stroke="#6b5235" stroke-width="1.4"/>'
      },
      truhe: {
        schatten: '<rect x="5" y="1.5" width="26" height="17" rx="3"/>',
        form: '<rect x="5" y="1.5" width="26" height="17" rx="3" fill="#8a5f3a" stroke="#3b3028" stroke-width="1.3"/><rect x="7" y="3.5" width="22" height="6" rx="2" fill="#a2744a"/>' +
          '<path d="M6 16H30" stroke="#5e3f24" stroke-width="1.6"/><path d="M11 2.2V17.8M25 2.2V17.8" stroke="#55504a" stroke-width="2.4"/>' +
          '<rect x="16" y="14" width="4" height="5" rx="1" fill="#e8d08a" stroke="#3b3028" stroke-width=".8"/>'
      }
    },
    kacheln: [
      { gruppe: 'Wände und Tür', code: '#', name: 'Steinmauer', art: 'Mauer, gebaut', muster: 'mauer', kosten: 'gesperrt, ganzes Feld', naht: ['.....', '.#+#.', '.#=#.', '.###.'], text: 'Eine Mauer aus Feldstein, die aufrecht steht: schmaler als das Feld, oben die Krone mit Steinen im Verband, davor die Südseite mit zwei Steinlagen, Umriss in Tinte und ein Schlagschatten nach rechts unten. Wo Mauer oder Tür anschließt, läuft die Krone durch; neben der Mauer liegt der Boden der Nachbarn. Das Feld bleibt ganz gesperrt.' },
      { code: 'W', name: 'Holzwand', art: 'Wand, gebaut (neues Zeichen)', muster: 'holzwand', kosten: 'gesperrt, ganzes Feld', naht: ['.....', '.WWW.', '.W=W.', '.W+W.'], text: 'Eine Blockwand, schlanker als die Mauer: zwei Stämme in Laufrichtung, an Enden und Ecken die Balkenköpfe mit Jahresring, davor die Südseite. Die Laufrichtung kommt aus den Nachbarn, darum passt sie in waagrechte und senkrechte Wände.' },
      { code: 'L', name: 'Lehmwand', art: 'Wand, gebaut (neues Zeichen)', muster: 'lehmwand', kosten: 'gesperrt, ganzes Feld', naht: ['.....', '.LLL.', '.LlL.', '.L+L.'], text: 'Flechtwerk mit Lehm verstrichen, aufrecht und ohne Fugen: Kellenstriche und Strohhalme auf der Krone, davor die Südseite. Nur selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, ist oben der Putz abgefallen und das Geflecht liegt frei. Dunkler als der Lehmboden, damit Wand und Boden sich trennen.' },
      { code: '+', name: 'Tür', art: 'Tür, Standard', muster: 'aussen', stellt: true, aufsatz: 'tuer', dreht: true, kosten: 'Durchgang, ersetzt ein Wandfeld', text: 'Vier Bohlen, zwei Eisenbänder mit Nägeln, Lichtkante oben und der Messinggriff bei (26, 18), wo ihn jede Tür hat. Ober- und Unterkante zeigen immer auf die freien Felder, die Längsseiten an die Wand; sie steht auf dem Boden ihrer Nachbarn. Ein Set darf sie ersetzen (Arktis: Felltür).', naht: ['.#.', '.+=', '.#.'] },
      { gruppe: 'Drinnen', code: '=', name: 'Dielen', art: 'Holzboden', muster: 'holz', kosten: 'kostet 1', text: 'Vier Dielen je Feld, versetzte Stöße, ein Ast, feine Maserung. Die Fugen an Ober- und Unterkante liegen halb in jedem Feld und ergeben zusammen eine.' },
      { code: 's', name: 'Steinplatten', art: 'Steinboden (neues Zeichen)', muster: 'stein', kosten: 'kostet 1', text: 'Platten im Halbverband, jede etwas anders getönt, mit Abrieb. Heller als die Mauer, damit Boden und Wand nicht verschwimmen.' },
      { code: 'z', name: 'Ziegelboden', art: 'harter Boden (neues Zeichen)', muster: 'ziegel', kosten: 'kostet 1', text: 'Ziegel im Korbgeflecht, je zwei längs und quer, gedämpft gebrannt und mit heller Kante. Bewusst kein reines Rot, denn Rot gehört den Gegnern.' },
      { code: 'c', name: 'Keramikfliesen', art: 'harter Boden (neues Zeichen)', muster: 'fliesen', kosten: 'kostet 1', text: 'Neun glasierte Fliesen je Feld, hell und graublau im Wechsel, jede mit einem Glanz oben links. Kleiner und glatter als die Steinplatten.' },
      { code: 'l', name: 'Lehm, lose Erde', art: 'weicher Boden (neues Zeichen)', muster: 'erde', kosten: 'kostet 1', text: 'Gestampfter Lehm mit dunklen Flecken, Kieseln und Krümeln, für Keller, Ställe und Hütten ohne Boden.' },
      { code: 'h', name: 'Stroh', art: 'auf Lehm und Erde (neues Zeichen)', muster: 'erde', unter: true, unterStd: 'erde', stroh: true, kosten: 'kostet 1', text: 'Eingestreutes Stroh, golden mit hellen und dunklen Halmen. Es ist lose, darum ist sein Rand ausgefranst; aus Vierteln, so groß, wie die Felder es sagen.' },
      { code: 'T', name: 'Teppich', art: 'auf hartem Boden (neues Zeichen)', muster: 'holz', unter: true, teppich: true, kosten: 'kostet 1', text: 'Wollteppich mit Fransen, Bordüre und einer Raute je Feld. Gerade Kanten, denn er ist gemacht; Rand und Ecken aus Vierteln, so wird er so groß, wie die Felder es sagen.' },
      { code: 'f', name: 'Bärenfell', art: 'auf hartem Boden (neues Zeichen)', muster: 'holz', unter: true, aufsatz: 'fell', dreht: true, kosten: 'kostet 1', text: 'Ein Eisbärfell mit Kopf und vier Läufen, flach, ohne Schatten. Es dreht, wohin ein Eintrag es legt.' },
      { gruppe: 'Möbel', code: 'p', name: 'Tisch', art: 'Möbel (neues Zeichen)', muster: 'holz', stellt: true, moebel: 'tisch', kosten: 'kostet 2 (drüber), halbe Deckung', text: 'Eine Platte aus drei Brettern, heller als die Dielen und mit Umriss, damit sie sich vom Boden abhebt. Sie ist zwei Drittel eines Feldes breit (1 m) und sitzt mittig darin. Ein kleiner Tisch nimmt ein Feld ein; zwei Tischfelder in einer Reihe ergeben einen gewöhnlichen Tisch von 2,5 m. Länger wird nur eine Tafel, und die gehört in einen Saal, größer als 6 × 9 m (4 × 6 Felder). Er wächst längs wie die Bank: Zum Nachbartisch reicht die Platte bis an die Kante, die Bretter laufen der Länge nach, Umriss, Licht und Flanke stehen nur außen. Selten stehen Teller und Becher darauf.', naht: ['======', '=pp=p=', '====p=', '=p===='] },
      { code: 'S', name: 'Stuhl', art: 'Möbel (neues Zeichen)', muster: 'holz', stellt: true, aufsatz: 'stuhl', dreht: true, kosten: 'kostet 2', text: 'Sitz aus zwei Brettern und eine Lehne. Steht ein Tisch daneben, dreht der Stuhl die Lehne von ihm weg und rückt an die Tischseite seines Feldes, wie man ihn an den Tisch zieht; sonst steht er mittig und dreht, wohin ein Eintrag je Feld es sagt.', naht: ['=S=', 'SpS', '=S='] },
      { code: 'H', name: 'Hocker', art: 'Möbel (neues Zeichen)', muster: 'holz', stellt: true, aufsatz: 'hocker', kosten: 'kostet 2', text: 'Ein runder Sitz mit Jahresring und dunkler Flanke, ohne Lehne. Rund, darum dreht er nicht.' },
      { code: 'b', name: 'Bank', art: 'Möbel (neues Zeichen)', muster: 'holz', stellt: true, moebel: 'bank', dreht: true, kosten: 'kostet 2', text: 'Ein Sitzbrett mit zwei Wangen an den Enden. Nebeneinander gesetzt wird daraus eine lange Bank, die längs zu ihren Nachbarn liegt; eine einzelne Bank liegt waagrecht oder dreht nach Eintrag.', naht: ['=====', '=bbb=', '====='] },
      { gruppe: 'Feuer', code: 'r', name: 'Feuerstelle', art: 'gemauerter Herd (neues Zeichen)', muster: 'holz', stellt: true, aufsatz: 'feuerstelle', dreht: true, licht: true, kosten: 'kostet 2, halbe Deckung; brennt es, Feuerschaden; Licht hell 6 m, dämmrig bis 12 m', naht: ['###', '=r=', '==='],
        text: 'Ein gemauerter Herd mit Rauchfang und gewölbter Feueröffnung, davor eine schmale Herdplatte mit Asche. Er steht mit dem Rücken am Rand seines Feldes und dreht ihn von selbst an die Wand (steht keine daneben, nach Eintrag); davor bleibt Boden frei, denn ein Herd ragt keine 1,5 m in den Raum. Steht ein Kochtopf vor dem Feuer (Eintrag kochtopf je Karte), füllt er das Feld. Er ist betretbar; wer in das brennende Feuer tritt, nimmt Feuerschaden, den die Spielleitung bestimmt. Ist er erloschen (Eintrag erloschen je Karte), fehlen Glut, Flammen und Licht. Die Flammen flackern leicht, das Licht füllt den Raum und hält an Wänden und geschlossenen Türen.' },
      { code: 'u', name: 'Lagerfeuer', art: 'offenes Feuer (neues Zeichen)', muster: 'aussen', aufsatz: 'lagerfeuer', licht: true, kosten: 'kostet 2; brennt es, Feuerschaden; Licht hell 6 m, dämmrig bis 12 m',
        text: 'Ein Kreis aus neun Steinen um ein Aschebett, zwei gekreuzte Scheite, Glut und Flammen. Flach, darum ohne Schatten. Betretbar; wer in das brennende Feuer tritt, nimmt Feuerschaden, den die Spielleitung bestimmt. Erloschen (Eintrag erloschen je Karte) bleiben Steine, Asche und Scheite, ohne Glut, Flammen und Licht. Der Ring um das Feuer gehört dem Set: in der Arktis geschmolzener Schnee, in den Bergen ein Brandfleck.' },
      { gruppe: 'Dinge', code: 'o', name: 'Fass', art: 'Fass', muster: 'aussen', stellt: true, aufsatz: 'fass', kosten: 'kostet 2, halbe Deckung', text: 'Von oben: Deckel mit drei Dauben, ein Reif, das Spundloch und die dunkle Flanke. Draußen mit dem Wetter des Sets auf dem Deckel, drinnen ohne.' },
      { code: 'k', name: 'Kiste', art: 'Kiste (neues Zeichen)', muster: 'aussen', stellt: true, aufsatz: 'kiste', kosten: 'kostet 2, halbe Deckung', text: 'Bretter, Rahmen und Querstrebe wie eine Frachtkiste. Kein Messing: Sie ist zu, und wer sie aufbricht, sagt es im Freitext.' },
      { code: 't', name: 'Truhe', art: 'Truhe (neues Zeichen), benutzbar', muster: 'aussen', stellt: true, aufsatz: 'truhe', dreht: true, kosten: 'kostet 2, halbe Deckung, lässt sich öffnen', text: 'Dunkleres Holz, gewölbter Deckel, zwei Eisenbänder und das Schloss in Messing an der Vorderseite. Sie steht mit dem Rücken am Rand ihres Feldes und dreht ihn wie der Herd an die erste Wand (Norden, Osten, Süden, Westen), damit das Schloss zum Raum zeigt und davor Platz bleibt; ein Eintrag überstimmt.' }
    ]
  };
  GEMEINSAM.nachCode = {};
  GEMEINSAM.kacheln.forEach(function (k) { GEMEINSAM.nachCode[k.code] = k; });

  // Set 1: Arktis
  // Tiefes Wasser zu viert (Max, 2.11.2026): Es füllt oft große Flächen, und ein einziges Bild stempelt dort sichtbar. Die tieferen Flecken liegen über 72 × 72, an den Rändern des Musters umgebrochen, und laufen über die Felder; die Kräusel bleiben im Feld. Die Viertel nach variante(x, y) zeigen den passenden Ausschnitt.
  var TIEFWASSER_FLECKEN = [[15, 17, 16, 8, -10, 0.4], [44, 8, 12, 6, 12, 1.7], [63, 33, 12, 6, -22, 2.9], [30, 38, 6.5, 3.5, 20, 4.1], [47, 58, 13, 6.5, -6, 5.3], [8, 56, 7, 4, 8, 0.9], [22, 67, 6, 3, -14, 3.3]];
  var TIEFWASSER_KRAEUSEL = [[[5, 8, 6], [21, 15, 6], [9, 27, 6], [24, 30, 5.2], [15, 21, 6]], [[13, 6, 6], [26, 12, 5], [5, 20, 6], [19, 26, 6], [28, 32, 4.4]], [[7, 11, 5], [19, 5, 6], [27, 20, 6], [11, 24, 5], [22, 32, 6]], [[4, 7, 6], [20, 12, 5], [10, 18, 6], [27, 25, 5], [6, 31, 6]]];
  var TIEFWASSER_GLANZ = [[27, 23], null, [29, 9], [22, 5]];
  var TIEFWASSER_STROM = 'M5 31C12 26 21 34 31 28M43 15C52 10 60 18 70 12M27 67C36 62 46 70 58 63';
  function tiefwasserFleck(b, dx, dy) {
    var pt = [], w = b[4] * Math.PI / 180, d = '';
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, r = 1 + 0.16 * Math.sin(2 * a + b[5]) + 0.1 * Math.sin(3 * a + 2 * b[5]), ex = b[2] * r * Math.cos(a), ey = b[3] * r * Math.sin(a); pt.push([b[0] + dx + ex * Math.cos(w) - ey * Math.sin(w), b[1] + dy + ex * Math.sin(w) + ey * Math.cos(w)]); }
    pt.forEach(function (p, i) { var q = pt[(i + 1) % 8], o = pt[(i + 7) % 8]; if (!i) d += 'M' + gr((o[0] + p[0]) / 2) + ' ' + gr((o[1] + p[1]) / 2); d += 'Q' + gr(p[0]) + ' ' + gr(p[1]) + ' ' + gr((p[0] + q[0]) / 2) + ' ' + gr((p[1] + q[1]) / 2); });
    return d + 'Z';
  }
  // st: fleck, deckung, farbe (Kräusel), breite, bogen, zahl (Kräusel je Feld); wahlweise glanz, strom {farbe, breite, deckung}
  function tiefwasser(st) {
    return [0, 1, 2, 3].map(function (v) {
      var ox = (v % 2) * 36, oy = Math.floor(v / 2) * 36, fl = '', kr = '', g = TIEFWASSER_GLANZ[v];
      TIEFWASSER_FLECKEN.forEach(function (b) { [-72, 0, 72].forEach(function (dx) { [-72, 0, 72].forEach(function (dy) {
        var x = b[0] + dx - ox, y = b[1] + dy - oy, r = b[2] * 1.3;
        if (x + r > 0 && x - r < 36 && y + r > 0 && y - r < 36) fl += tiefwasserFleck(b, dx - ox, dy - oy);
      }); }); });
      TIEFWASSER_KRAEUSEL[v].slice(0, st.zahl).forEach(function (q) { kr += 'M' + q[0] + ' ' + q[1] + 'q' + q[2] / 2 + ' ' + (-st.bogen) + ' ' + q[2] + ' 0'; });
      return '<svg width="36" height="36" overflow="hidden"><path d="' + fl + '" fill="' + st.fleck + '" opacity="' + st.deckung + '"/>' +
        (st.strom ? '<path d="' + TIEFWASSER_STROM + '" transform="translate(' + (-ox) + ' ' + (-oy) + ')" fill="none" stroke="' + st.strom.farbe + '" stroke-width="' + st.strom.breite + '" stroke-linecap="round" opacity="' + st.strom.deckung + '"/>' : '') + '</svg>' +
        '<path d="' + kr + '" fill="none" stroke="' + st.farbe + '" stroke-width="' + st.breite + '" stroke-linecap="round"/>' +
        (st.glanz && g ? '<path d="M' + g[0] + ' ' + g[1] + 'l2.8-.8" stroke="' + st.glanz + '" stroke-width="1" stroke-linecap="round"/>' : '');
    });
  }
  var ARKTIS = {
    id: 'arktis', nr: 1, name: 'Arktis', standard: 'schnee', status: 'fertig', weheName: 'Schneewehe',
    text: 'Ewiges Eis, Gletscher und Tiefschnee. Draußen ist der Grund Schnee, kühl und fast weiß; Wasser und Eis bekommen ein Schneeufer, der Gletscher ist der Fels des Sets. Die Tür ist aus Fell und Knochen, die Standardtür bleibt im Schrank. Draußen trägt alles Schnee auf der Seite zum Licht; durch Lücken weht Schnee herein.',
    rollen: [
      ['Grund', '#e6edf0', 'Schnee, Ufer'], ['Grund dunkel', '#d1dde4', 'Tiefschnee'], ['Zeichnung', '#b5c6d0', 'Schatten im Schnee'], ['Licht', '#f8fbfc', 'Firn, Wall, Schneekappen'],
      ['Fels', '#4d6372', 'Gletscher; Schichten #5f7888'], ['Wasser', '#6f97ae', 'Uferkante #3f6a85'], ['Eis', '#c9dee8', 'Risse #8fb4c7'], ['Grün', '#3f5a46', 'Tanne; Busch #66775c'],
      ['Weg', '#cbd6dd', 'Band; Kante #93aab8, Wall #f8fbfc, Spuren #aebfca'], ['Wetter', '#f3f7f9', 'Schneekappe links oben, zum Licht']
    ],
    ufer: { flaeche: '#e6edf0', linie: '#f3f7f9' },
    weg: { wall: '#f8fbfc', band: '#cbd6dd', kante: '#93aab8', spuren: '#aebfca' },
    // Schneewehe drinnen: 2 am Loch, 1 ein Feld weiter
    wehe: {
      2: '<path d="M2 30C6 24 12 22 18 24S30 30 34 26V34H2Z" fill="#e6edf0" opacity=".9"/><path d="M4 12C8 9 13 10 16 13C12 15 7 15 4 12Z" fill="#e6edf0" opacity=".85"/><path d="M20 8C24 6 29 7 31 10C27 12 23 11 20 8Z" fill="#f3f7f9" opacity=".8"/><circle cx="26" cy="18" r="1" fill="#f8fbfc"/><circle cx="10" cy="21" r=".9" fill="#f8fbfc"/>',
      1: '<path d="M6 26C10 23 15 24 17 27C13 29 9 29 6 26Z" fill="#e6edf0" opacity=".75"/><g fill="#f8fbfc" opacity=".9"><circle cx="12" cy="9" r="1"/><circle cx="25" cy="14" r=".9"/><circle cx="29" cy="27" r="1"/><circle cx="19" cy="19" r=".8"/></g>'
    },
    feuerring: '<path d="' + FEUER_RING + '" fill="#a39b8b" opacity=".55"/>',
    // Fels des Sets als Körper (Gletscherwand): Fuß m vom Rand, Krone um h versetzt
    fels: { m: 7, h: 6, krone: '#58717f', licht: '#a9c4d1', fuge: '#2f3e48', front: '#3d5262', frontFuge: '#2a3943', flanke: '#46606f' },
    // Wetter: die Schneekappe links oben, zum Licht; auf den gemeinsamen Dingen draußen (und drinnen unter einer Wehe)
    wetter: {
      fass: '<ellipse cx="14.5" cy="13.5" rx="5.4" ry="3.2" transform="rotate(-35 14.5 13.5)" fill="#f3f7f9"/><circle cx="18" cy="18" r="12" fill="none" stroke="#3b3028" stroke-width="1.3"/>',
      kiste: '<path d="M7.7 7.7H19q-1 2.6-5 3.2-3.4.6-6.3 4.6Z" fill="#f3f7f9"/>',
      truhe: '<path d="M6.5 3H17q-1.5 2.4-5 2.6-3 .2-5.5 2.4Z" fill="#f3f7f9"/>',
      stuhl: '<path d="M10 11.8H18q-1 2-4 2.4-2.4.3-4 1.8Z" fill="#f3f7f9"/>',
      hocker: '<ellipse cx="15.5" cy="14.5" rx="4" ry="2.5" transform="rotate(-35 15.5 14.5)" fill="#f3f7f9"/>',
      tisch: '<path d="M6.7 6.7H18q-1 2.6-5 3.2-3.4.6-6.3 4.6Z" fill="#f3f7f9"/>',
      bank: '<path d="M9 12.7H19q-1.5 2-5 2.4-3 .3-5 1.8Z" fill="#f3f7f9"/>'
    },
    muster: {
      schnee: { grund: '#e6edf0', bilder: [
        '<path d="M5 10q13-4 26 0q-13 3-26 0z" fill="#f8fbfc"/><path d="M8 23q10-3 20 0q-10 2.6-20 0z" fill="#b5c6d0" opacity=".55"/><path d="M18 30q7-2 14 0q-7 2-14 0z" fill="#f8fbfc" opacity=".9"/><circle cx="27" cy="16" r=".9" fill="#b5c6d0"/><circle cx="9" cy="31" r=".8" fill="#b5c6d0"/>',
        '<g transform="rotate(-7 18 18)"><path d="M7 14q11-3.5 22 0q-11 3-22 0z" fill="#b5c6d0" opacity=".5"/><path d="M6 26q12-4 24 0q-12 3-24 0z" fill="#f8fbfc"/></g><circle cx="13" cy="7" r=".9" fill="#b5c6d0"/><circle cx="30" cy="31" r=".8" fill="#b5c6d0"/>',
        '<path d="M14 8q9-3 18 0q-9 2.6-18 0z" fill="#f8fbfc"/><path d="M4 20q9-3 18 0q-9 2.5-18 0z" fill="#b5c6d0" opacity=".5"/><path d="M10 30q9-3 18 0q-9 2.5-18 0z" fill="#f8fbfc" opacity=".9"/><path d="M24 27l5-2" stroke="#8fb4c7" stroke-width="1" stroke-linecap="round"/>',
        '<g transform="rotate(6 18 18)"><path d="M7 9q11-3.5 22 0q-11 3-22 0z" fill="#f8fbfc"/><path d="M9 19q9-3 18 0q-9 2.6-18 0z" fill="#b5c6d0" opacity=".5"/><path d="M7 29q10-3.5 20 0q-10 3-20 0z" fill="#f8fbfc" opacity=".85"/></g><circle cx="31" cy="12" r=".8" fill="#b5c6d0"/>'
      ] },
      tiefschnee: { grund: '#d1dde4', bilder: [
        '<path d="M3 16Q10 6 17 16Z" fill="#f3f7f9"/><path d="M3 16q7 2.4 14 0q-7 3-14 0z" fill="#b5c6d0"/><path d="M18 25Q25.5 14 33 25Z" fill="#f3f7f9"/><path d="M18 25q7.5 2.6 15 0q-7.5 3.2-15 0z" fill="#b5c6d0"/><path d="M8 32Q14 25 20 32Z" fill="#f3f7f9" opacity=".95"/><path d="M8 32q6 2 12 0q-6 2.4-12 0z" fill="#b5c6d0"/><circle cx="29" cy="8" r="1" fill="#b5c6d0"/><circle cx="6" cy="24" r=".9" fill="#b5c6d0"/>'
      ] },
      wasser: { grund: '#6f97ae', bilder: tiefwasser({ fleck: '#5f88a1', deckung: .75, farbe: '#b9d3e0', breite: 1.2, bogen: 2, zahl: 4 }) },
      eis: { grund: '#c9dee8', bilder: [
        '<path d="M5 8l9 6 6-3 9 9M14 14l-2 10 7 6M20 11l2-6" fill="none" stroke="#8fb4c7" stroke-width=".9"/><path d="M7 28l6-6M24 31l6-6" stroke="#eef5f8" stroke-width="1.6" stroke-linecap="round"/>'
      ] },
      gletscher: { grund: '#4d6372', bilder: [
        '<path d="M0 8C8 10 14 11 22 9S32 7 36 8V15C30 14 24 13 16 15S5 16 0 15Z" fill="#5f7888"/><path d="M0 24C8 26 15 27 23 25S32 23 36 24V29C29 28 22 27 14 29S5 30 0 29Z" fill="#5f7888"/>' +
        '<path d="M0 8C8 10 14 11 22 9S32 7 36 8M0 24C8 26 15 27 23 25S32 23 36 24" fill="none" stroke="#9fbccb" stroke-width="1" opacity=".7"/><path d="M11 17l3 4-1 3M27 3l-2 3.5M29 30l2 3" fill="none" stroke="#2f3e48" stroke-width="1.1" stroke-linecap="round"/>'
      ] }
    },
    aufsatz: {
      eisstufen: '<rect x="4" y="4" width="28" height="7" fill="#e6eff3"/><rect x="4" y="11" width="28" height="7" fill="#d9e6ec"/><rect x="4" y="18" width="28" height="7" fill="#cbdce5"/><rect x="4" y="25" width="28" height="7" fill="#bcd1dc"/><rect x="4" y="4" width="28" height="28" fill="none" stroke="#5e8197" stroke-width="1"/><path d="M4 11H32M4 18H32M4 25H32" stroke="#5e8197" stroke-width="1.6"/><path d="M5 5.6h26M5 12.6h26M5 19.6h26M5 26.6h26" stroke="#f8fbfc" stroke-width="1" opacity=".9"/>',
      felltuer: '<rect x="5" y="3" width="26" height="30" rx="3" fill="#e9e2cf" stroke="#3b3028" stroke-width="1.2"/><rect x="8.5" y="6.5" width="19" height="23" rx="1.5" fill="#a1896a" stroke="#6b573f" stroke-width=".8"/><path d="M8.5 13.5h19M8.5 22.5h19" stroke="#6b573f" stroke-width="1.2"/><path d="M12 7v22" stroke="#8b7557" stroke-width=".7" opacity=".7"/><circle cx="26" cy="18" r="1.6" fill="#e8d08a" stroke="#3b3028" stroke-width=".5"/>',
      tanne: tanneTeile(1),
      tanneKrone: tanneTeile(2.1),
      busch: {
        schatten: '<circle cx="13" cy="15" r="7.9"/><circle cx="22" cy="13" r="7.9"/><circle cx="24" cy="22" r="8.4"/><circle cx="14" cy="23" r="7.9"/>',
        form: '<g fill="#3b3028"><circle cx="13" cy="15" r="7.9"/><circle cx="22" cy="13" r="7.9"/><circle cx="24" cy="22" r="8.4"/><circle cx="14" cy="23" r="7.9"/></g>' +
          '<g fill="#66775c"><circle cx="13" cy="15" r="7"/><circle cx="22" cy="13" r="7"/><circle cx="24" cy="22" r="7.5"/><circle cx="14" cy="23" r="7"/></g>' +
          '<g fill="#4f5e48"><circle cx="27" cy="25" r="4"/><circle cx="17" cy="26.5" r="3.4"/></g>' +
          '<path d="M18 18l-4-3M18 18l5-4M18 18l5 5M18 18l-3 5" stroke="#3f4b38" stroke-width="1" stroke-linecap="round"/>' +
          '<g fill="#f3f7f9"><ellipse cx="11.5" cy="12.5" rx="4.6" ry="3"/><ellipse cx="20.5" cy="10.5" rx="4.6" ry="3"/><ellipse cx="22.5" cy="19.5" rx="4.4" ry="2.8"/><ellipse cx="12.5" cy="20.5" rx="4.2" ry="2.7"/></g>'
      },
      eisblock: {
        schatten: '<path d="M8 24L6 13 14 5 25 4 31 12 30 25 21 32 11 31Z"/>',
        form: '<path d="M8 24L6 13 14 5 25 4 31 12 30 25 21 32 11 31Z" fill="#cfe0e8"/><path d="M14 5L25 4 22 14 12 14Z" fill="#f1f6f8"/><path d="M12 14L6 13 8 24 13 24Z" fill="#dde9ef"/><path d="M30 25L21 32 11 31 13 24 24 20Z" fill="#a3bfcc"/><path d="M22 14L31 12 30 25 24 20Z" fill="#bcd3de"/><path d="M12 14L19 19 24 20M19 19l-6 5" fill="none" stroke="#5e8197" stroke-width=".9"/><path d="M8 24L6 13 14 5 25 4 31 12 30 25 21 32 11 31Z" fill="none" stroke="#3b3028" stroke-width="1.3" stroke-linejoin="round"/>'
      }
    },
    kacheln: [
      { gruppe: 'Draußen', code: '.', name: 'Schnee', art: 'Standard', muster: 'schnee', kosten: 'kostet 1', text: 'Vier Varianten mit Windlinsen (Licht) und Schattenlinsen, nichts näher als zwei Einheiten am Rand. Zu viert in einem Muster von 72 Einheiten, damit kein Feld wie sein Nachbar aussieht.' },
      { code: ':', name: 'Tiefschnee', art: 'schwieriges Gelände', muster: 'tiefschnee', kosten: 'kostet 2', text: 'Der Grund eine Stufe dunkler, drei Wehen mit Lichtkamm und Schattensaum: derselbe Ton wie Schnee, mehr und dunklere Zeichnung.' },
      { code: 'e', name: 'Trampelpfad', art: 'Weg', muster: 'schnee', weg: true, kosten: 'kostet 1', text: 'Festgetretener Schnee zwischen zwei weichen Wällen, mal enger, mal breiter. Fünf Formen und ein Fleck; die Karte wählt Form und Drehung aus den Nachbarn, Tür und Treppe zählen als Anschluss.', naht: ['.e..', '.ee.', '..e.', '..ee'] },
      { code: 'i', name: 'Eis', art: 'schwieriges Gelände, glatt', muster: 'eis', rand: '#8fb4c7', kosten: 'kostet 2', text: 'Blankes Eis mit Rissen und zwei Glanzstreifen. Wo Schnee angrenzt, legt sich ein Schneeufer mit hellem Saum darüber, aus Vierteln zusammengesetzt.', naht: ['....', '.ii.', '.iii', '..i.'] },
      { code: '~', name: 'Wasser', art: 'tiefes Wasser, schwimmen', muster: 'wasser', rand: '#3f6a85', kosten: 'kostet 2', proben: [[['~~~~~~', '~~~~~~', '~~~~~~', '~~~~~~'], 'große Fläche: Die Flecken laufen über die Felder', 216]], text: 'Offenes Wasser mit tieferem Fleck und kurzen Wellen. Am Schnee ein Ufer mit dunkler Kante zum Wasser; zum Eis hin kein Ufer, das Wasser liegt im Eis wie ein Loch.', naht: ['....', '.~~.', '.~~~', '..~.'] },
      { gruppe: 'Höhe und Wände', code: '/', name: 'Eisstufen', art: 'Treppe, Rampe', muster: 'schnee', aufsatz: 'eisstufen', dreht: true, kosten: 'kostet 1, eine Stufe ohne Klettern', text: 'Vier Eisstufen, nach oben heller wie die Ebenen der Karte, mit Lichtkante und dunkler Stufenlinie. Hinauf liegt bei 0° oben; auf der Karte zeigt die Höhe der Nachbarn die Richtung. Zu viert in einem Muster von 72 Einheiten; die Flecken laufen über die Felder, damit eine große Wasserfläche nicht stempelt.' },
      { code: 'F', name: 'Gletscherwand', art: 'Fels, gewachsen (neues Zeichen)', muster: 'gletscher', kosten: 'gesperrt, ganzes Feld', text: 'Gewachsen, darum keine Mauer, sondern eine Abbruchkante von oben: Felstextur, die über die Felder durchläuft, an der höheren Seite die Lippe mit der angedeuteten oberen Ebene, an der tieferen der Fuß mit Boden und Geröll und ein Schlagschatten auf den tieferen Boden; an den Enden nur Textur, offene Enden und Außenecken gerundet. Welche Seite oben ist, sagen die Höhen der Karte. Nur tiefere Seiten, ein Feld dick: Plattform oder Rücken (Fläche und Schatten). Ab zwei Feldern Dicke überall Felstextur wie am Kartenrand. Nur höhere: ein Loch mit Lippen ringsum. Läuft über den Kartenrand weiter. Blau und kalt, damit sie sich von der Mauer abhebt.' },
      { code: '+', name: 'Felltür', art: 'Tür', muster: 'schnee', stellt: true, aufsatz: 'felltuer', dreht: true, kosten: 'Durchgang, ersetzt ein Wandfeld', text: 'Rahmen aus Knochen, Fell gespannt, zwei Riemen und ein Messinggriff. Ober- und Unterkante zeigen immer auf die freien Felder, die Längsseiten an die Wand; sie steht auf dem Boden ihrer Nachbarn.', naht: ['.#.', '.+=', '.#.'] },
      { gruppe: 'Umgebung', code: 'O', name: 'Verschneite Tanne', art: 'Baum', muster: 'schnee', aufsatz: 'tanne', krone: 'tanneKrone', kosten: 'nicht betretbar, Dreiviertel-Deckung', text: 'Von oben: Zweigspitzen im Kranz, darauf ein Kranz Schnee, darüber die jüngeren Zweige und die schneebedeckte Spitze. Der Schnee sitzt zum Licht hin. Die Krone ist gut 3 m breit und ragt halb über die Nachbarfelder; gesperrt ist nur das Stammfeld, die Krone gibt keine Deckung.' },
      { code: 'd', name: 'Verschneiter Busch', art: 'Busch, Dickicht', muster: 'schnee', aufsatz: 'busch', kosten: 'kostet 2, schwieriges Gelände', text: 'Vier runde Ballen mit gemeinsamem Umriss, Zweige aus der Mitte, auf jedem Ballen eine Schneekappe. Kleiner und heller als die Tanne, damit man ihn als betretbar liest.' },
      { code: 'x', name: 'Eisblock', art: 'Hindernis', muster: 'schnee', aufsatz: 'eisblock', kosten: 'nicht betretbar', text: 'Ein Körper aus Facetten, Licht von links oben, dunkle Flanke rechts unten, Umriss in Tinte und der Schatten als versetzte Silhouette.' }
    ]
  };
  ARKTIS.nachCode = {};
  ARKTIS.kacheln.forEach(function (k) { ARKTIS.nachCode[k.code] = k; });

  // Set 2: Berge. Über der Baumgrenze, unter dem ewigen Schnee: Almboden und Fels, Geröll, Firnflecken, ein Bergsee, Latschen und Bergkiefern.
  function grasbueschel(x, y, s, farbe) {
    s = s || 1;
    return '<path d="M' + x + ' ' + y + 'l' + (-2.3 * s) + ' ' + (-3.6 * s) + 'M' + x + ' ' + y + 'l0 ' + (-4.4 * s) + 'M' + x + ' ' + y + 'l' + (2.3 * s) + ' ' + (-3.6 * s) + '" fill="none" stroke="' + (farbe || '#6f8459') + '" stroke-width="1.2" stroke-linecap="round"/>';
  }
  function steinchen(x, y, rx, ry, rot, farbe) {
    var t = 'transform="rotate(' + rot + ' ' + x + ' ' + y + ')"';
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" ' + t + ' fill="' + (farbe || '#8f9180') + '"/>' +
      (rx >= 2.5 ? '<path d="M' + (x - rx * 0.8) + ' ' + (y + ry * 0.45) + 'q' + (rx * 0.8) + ' ' + (ry * 0.9) + ' ' + (rx * 1.6) + ' 0" fill="none" stroke="#6f7162" stroke-width=".9" ' + t + '/>' : '') +
      '<circle cx="' + (x - rx * 0.3) + '" cy="' + (y - ry * 0.35) + '" r="' + Math.max(0.6, rx * 0.2) + '" fill="#d8d9c8"/>';
  }
  // flache Felsplatte: helle Fläche, Schattenkante rechts unten
  function platte(d, kante) { return '<path d="' + d + '" fill="#dcddcb"/><path d="' + kante + '" fill="none" stroke="#a9ab96" stroke-width="1" stroke-linejoin="round"/>'; }
  var KIEFER = stern(18, 18, 14.5, 9.2, 7, OBEN + 0.25);
  function kieferTeile(f) {
    var g = f > 1.5, aussen = stern(18, 18, 14.5 * f, 9.2 * f + (g ? 6 : 0), g ? 10 : 7, OBEN + 0.25);
    function p(d) { return d.map(function (q) { return 'M' + um(q[0], f) + ' ' + um(q[1], f) + 'l' + q[2] * f + ' ' + q[3] * f; }).join(''); }
    return {
      schatten: '<polygon points="' + aussen + '"/>',
      form: '<polygon points="' + aussen + '" fill="#3d5a3c" stroke="#3b3028" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<polygon points="' + stern(um(18.6, f), um(18.6, f), 10.2 * f, 6.6 * f + (g ? 4 : 0), g ? 9 : 7, OBEN + 0.7) + '" fill="#4e6e4a"/>' +
        '<polygon points="' + stern(um(17.4, f), um(17.4, f), 5.6 * f, 3.6 * f, 5, OBEN) + '" fill="#2f4a30"/>' +
        '<path d="' + p([[18, 18, -6, -4], [18, 18, 7, -2], [18, 18, 2, 7], [18, 18, -5, 5]]) + '" stroke="#2f4a30" stroke-width="1" stroke-linecap="round"/>' +
        '<path d="' + (g ? p([[11, 9, 2, 2], [27, 10, -2, 2], [25, 27, -2, -1.5], [9, 18, 2, 0], [20, 7, 0, 2]]) : 'M11 9l2 2M27 10l-2 2M25 27l-2-1.5') + '" stroke="#8aa07c" stroke-width="1" stroke-linecap="round"/><circle cx="' + um(17.6, f) + '" cy="' + um(17.6, f) + '" r="' + (g ? 1.8 : 1.2) + '" fill="#6b573f"/>'
    };
  }
  var BROCKEN = 'M6 20L5 11 11 5 22 4 30 9 31 19 27 28 17 32 9 29Z';
  // Kiesel der Wehe: mit feinem Umriss, damit sie auf jedem Boden zu sehen sind
  function kiesel(x, y, rx, ry, rot) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')" fill="#8f9180" stroke="#5f6156" stroke-width=".5"/><circle cx="' + (x - rx * 0.3) + '" cy="' + (y - ry * 0.35) + '" r=".6" fill="#d8d9c8"/>'; }
  var BERGE = {
    id: 'berge', nr: 2, name: 'Berge', standard: 'alm', status: 'fertig', weheName: 'Windstaub',
    text: 'Steile Hänge, Klippen, Passstraßen, dünne Luft in großen Höhen. Draußen ist der Grund Almboden: kurzes Gras auf hellem Fels, dazwischen Steine und Platten. Geröll ist das schwierige Gelände, die Felswand der Fels des Sets; Firnflecken und der Bergsee bekommen ein Ufer aus Almboden. Der Saumpfad ist festgetretene Erde mit Trittsteinen, die Felsstufen sind in den Fels geschlagen. Oben wachsen nur noch Bergkiefern und Latschen. Das Wetter des Sets sind Flechten: Was draußen steht, setzt sie an; durch Lücken weht Staub mit Kieseln herein. Die Tür ist die Standardtür.',
    rollen: [
      ['Grund', '#c9cbb3', 'Almboden, Ufer'], ['Grund dunkel', '#afb19b', 'Geröll'], ['Zeichnung', '#8f9180', 'Steine, Kiesel'], ['Licht', '#e3e4d4', 'Platten, Stufenkanten, Ufersaum'],
      ['Fels', '#565a60', 'Felswand; Schichten #676c73, Spalten #2e3136'], ['Wasser', '#5b8694', 'Bergsee; Uferkante #345a66'], ['Eis', '#d8e1e6', 'Firn; Kruste #aebec7'], ['Grün', '#6f8459', 'Gras; Bergkiefer #3d5a3c, Latschen #5f7a55'],
      ['Weg', '#c7b996', 'Band; Kante #8c7f66, Saum #e3dcc6, Trittsteine #8f8b7e'], ['Wetter', '#9fa88e', 'Flechten, dazu #c3c9a9'], ['Stein', '#8f8d85', 'Felsbrocken; Flanke #6b6963, Licht #b7b5aa']
    ],
    ufer: { flaeche: '#c9cbb3', linie: '#e3e4d4' },
    weg: { wall: '#e3dcc6', band: '#c7b996', kante: '#8c7f66', spuren: '#8f8b7e' },
    // Windstaub drinnen: eine Staubfahne, die der Wind durch die Lücke drückt, und Kiesel
    wehe: {
      2: '<path d="M2 31C7 26 13 25 18 27S29 32 34 28V34H2Z" fill="#dcdccb" opacity=".75"/><path d="M4 11C9 9 14 10 17 12C13 13.5 8 13.5 4 11Z" fill="#dcdccb" opacity=".6"/>' + kiesel(25, 17, 2.2, 1.6, -20) + kiesel(9, 21, 1.9, 1.4, 15) + kiesel(29, 9, 1.6, 1.2, 30),
      1: '<path d="M6 27C10 24 15 25 17 28C13 30 9 30 6 27Z" fill="#dcdccb" opacity=".6"/>' + kiesel(25, 14, 1.8, 1.3, -10) + kiesel(12, 10, 1.1, 0.9, 0)
    },
    feuerring: '<path d="' + FEUER_RING + '" fill="#4a4440" opacity=".38"/>',
    fels: { m: 7, h: 6, krone: '#62676f', licht: '#959ba3', fuge: '#2e3136', front: '#45494f', frontFuge: '#2c2f34', flanke: '#50545b' },
    // Wetter: Flechten auf der Seite zum Licht, auf den gemeinsamen Dingen draußen (und drinnen unter einer Wehe)
    wetter: {
      fass: '<path d="M11 13c2-2 5-1.5 5.5 1-1.5 2-4 2.5-6 1.2z" fill="#9fa88e"/><circle cx="21" cy="11" r="1.7" fill="#c3c9a9"/><circle cx="12.5" cy="19.5" r="1.3" fill="#c3c9a9"/>',
      kiste: '<path d="M10 10c2.5-1.5 5 0 5 2-1.5 2-4 2.5-5.5 1z" fill="#9fa88e"/><circle cx="24" cy="12" r="1.5" fill="#c3c9a9"/><circle cx="12" cy="24" r="1.4" fill="#9fa88e"/>',
      truhe: '<path d="M9 4.5c2.5-1.3 5 0 5 1.8-1.5 1.8-4 2-5.5.8z" fill="#9fa88e"/><circle cx="21" cy="5.5" r="1.4" fill="#c3c9a9"/>',
      stuhl: '<path d="M11 14c2-1.2 4.5 0 4.5 1.6-1.4 1.6-3.6 1.8-5 .8z" fill="#9fa88e"/><circle cx="22" cy="16" r="1.3" fill="#c3c9a9"/>',
      hocker: '<path d="M13.5 15.5c1.6-1.2 3.6-.3 3.8 1.2-1.2 1.3-3 1.6-4.2.6z" fill="#9fa88e"/><circle cx="20.5" cy="14.5" r="1.1" fill="#c3c9a9"/>',
      tisch: '<path d="M8 9.5c3.5-2.6 8-.8 8 2.2-2.4 2.8-6.2 3.2-8.2 1.4z" fill="#9fa88e"/><circle cx="26" cy="11" r="2.1" fill="#c3c9a9"/><circle cx="11" cy="19" r="1.4" fill="#c3c9a9"/>',
      bank: '<path d="M10 14c2.5-1.3 5 0 5 1.8-1.5 1.8-4 2-5.5.8z" fill="#9fa88e"/><circle cx="24" cy="16" r="1.3" fill="#c3c9a9"/>'
    },
    muster: {
      alm: { grund: '#c9cbb3', bilder: [
        grasbueschel(9, 12) + grasbueschel(26, 9, 0.9) + platte('M13 24L17 20 25 21 27 25 23 28 15 28Z', 'M25 21L27 25 23 28') + steinchen(8, 27, 2.6, 1.9, 20),
        platte('M6 12L10 7 18 8 20 12 17 17 8 17Z', 'M18 8L20 12 17 17') + '<path d="M9 14l4-1.5 2 1" fill="none" stroke="#a9ab96" stroke-width=".8"/>' + grasbueschel(27, 28) + steinchen(25, 9, 2, 1.5, -15) + steinchen(30, 19, 1.6, 1.2, 25),
        grasbueschel(7, 10, 0.9) + grasbueschel(18, 21) + grasbueschel(29, 13, 0.85) + steinchen(12, 29, 2.8, 2, -20) + '<circle cx="27" cy="30" r="1.1" fill="#8f9180"/>',
        platte('M20 10L25 7 31 9 31 14 26 17 21 15Z', 'M31 9L31 14 26 17') + grasbueschel(9, 23) + grasbueschel(21, 31, 0.85) + '<path d="M5 9l4-1.5 3 .5" fill="none" stroke="#8f9180" stroke-width=".9" stroke-linecap="round"/>' + steinchen(30, 25, 1.8, 1.3, 30)
      ] },
      geroell: { grund: '#afb19b', bilder: [
        steinchen(8, 8, 4.5, 3.2, 20) + steinchen(20, 6, 3.5, 2.6, -15, '#848673') + steinchen(30, 11, 4, 3, 35, '#9a9c8a') + steinchen(12, 19, 5, 3.6, -25) + steinchen(25, 19, 3.6, 2.8, 10, '#848673') +
        steinchen(7, 29, 4, 3, 15, '#9a9c8a') + steinchen(19, 29, 4.6, 3.3, -20) + steinchen(30, 27, 3.4, 2.5, 40, '#848673') + '<path d="M16 12l2 2M4 22l2-1M27 31l2-1" stroke="#6f7162" stroke-width="1" stroke-linecap="round"/>'
      ] },
      bergsee: { grund: '#5b8694', bilder: tiefwasser({ fleck: '#4c7582', deckung: .8, farbe: '#a9c6cd', breite: 1.2, bogen: 2, zahl: 5, glanz: '#cfe0e4' }) },
      firn: { grund: '#d8e1e6', bilder: [
        '<path d="M4 9q8-2.5 14 0t14 0M4 23q8-2.5 14 0t14 0" fill="none" stroke="#aebec7" stroke-width="1"/><path d="M8 15q3 2 6 0M22 17q3 2 6 0M13 29q3 2 6 0" fill="none" stroke="#aebec7" stroke-width=".9"/><path d="M9 32l20-5" stroke="#b9bfc0" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><path d="M24 5l6-1" stroke="#eef2f4" stroke-width="1.4" stroke-linecap="round"/>'
      ] },
      felswand: { grund: '#565a60', bilder: [
        '<path d="M0 6C7 8 13 9 21 7S32 5 36 6V13C29 12 23 11 15 13S5 14 0 13Z" fill="#676c73"/><path d="M0 22C8 24 15 25 23 23S32 21 36 22V28C29 27 22 26 14 28S5 29 0 28Z" fill="#676c73"/>' +
        '<path d="M0 6C7 8 13 9 21 7S32 5 36 6M0 22C8 24 15 25 23 23S32 21 36 22" fill="none" stroke="#8a9098" stroke-width="1" opacity=".7"/><path d="M12 16l2 4-1 3M26 3l-2 3M28 30l3 3M6 32l2-3" fill="none" stroke="#2e3136" stroke-width="1.1" stroke-linecap="round"/><path d="M20 15l5-1 3 2" fill="none" stroke="#636870" stroke-width="1.6" stroke-linecap="round"/>'
      ] }
    },
    aufsatz: {
      felsstufen: '<rect x="4" y="4" width="28" height="7" fill="#cfcdbf"/><rect x="4" y="11" width="28" height="7" fill="#bfbdaf"/><rect x="4" y="18" width="28" height="7" fill="#aeac9e"/><rect x="4" y="25" width="28" height="7" fill="#9e9c8e"/><rect x="4" y="4" width="28" height="28" fill="none" stroke="#5e5d55" stroke-width="1"/><path d="M4 11H32M4 18H32M4 25H32" stroke="#5e5d55" stroke-width="1.6"/><path d="M5 5.6h26M5 12.6h26M5 19.6h26M5 26.6h26" stroke="#e3e4d4" stroke-width="1" opacity=".9"/>',
      bergkiefer: kieferTeile(1),
      bergkieferKrone: kieferTeile(2.1),
      latschen: {
        schatten: '<circle cx="13" cy="15" r="7.9"/><circle cx="22" cy="13" r="7.9"/><circle cx="24" cy="22" r="8.4"/><circle cx="14" cy="23" r="7.9"/>',
        form: '<g fill="#3b3028"><circle cx="13" cy="15" r="7.9"/><circle cx="22" cy="13" r="7.9"/><circle cx="24" cy="22" r="8.4"/><circle cx="14" cy="23" r="7.9"/></g>' +
          '<g fill="#5f7a55"><circle cx="13" cy="15" r="7"/><circle cx="22" cy="13" r="7"/><circle cx="24" cy="22" r="7.5"/><circle cx="14" cy="23" r="7"/></g>' +
          '<g fill="#4a6342"><circle cx="27" cy="25" r="4"/><circle cx="17" cy="26.5" r="3.4"/><circle cx="25" cy="15.5" r="3"/></g>' +
          '<path d="M18 18l-4-3M18 18l5-4M18 18l5 5M18 18l-3 5" stroke="#3f5a3a" stroke-width="1" stroke-linecap="round"/>' +
          '<path d="M9 12q2-2.5 5-2M18.5 9.5q2-2 5-1.5M9.5 21q1.5-2 4-2" fill="none" stroke="#8aa07c" stroke-width="1" stroke-linecap="round"/>'
      },
      felsbrocken: {
        schatten: '<path d="' + BROCKEN + '"/>',
        form: '<path d="' + BROCKEN + '" fill="#8f8d85"/><path d="M11 5L22 4 30 9 24 14 13 13Z" fill="#b7b5aa"/><path d="M5 11L11 5 13 13 10 22 6 20Z" fill="#9c9a90"/><path d="M30 9L31 19 27 28 24 20 24 14Z" fill="#6b6963"/><path d="M6 20L10 22 24 20 27 28 17 32 9 29Z" fill="#84827a"/>' +
          '<path d="M13 13L24 14 24 20M13 13L10 22 24 20" fill="none" stroke="#3b3028" stroke-width=".9" opacity=".6"/><ellipse cx="17" cy="9" rx="3" ry="1.8" fill="#9fa88e"/><path d="' + BROCKEN + '" fill="none" stroke="#3b3028" stroke-width="1.3" stroke-linejoin="round"/>'
      }
    },
    kacheln: [
      { gruppe: 'Draußen', code: '.', name: 'Almboden', art: 'Standard', muster: 'alm', kosten: 'kostet 1', text: 'Kurzes Gras auf hellem Fels: Grasbüschel, Steine mit Lichtpunkt und flache Platten, in vier Varianten, zwei eher Gras, zwei eher Fels. Zu viert in einem Muster von 72 Einheiten, damit kein Feld wie sein Nachbar aussieht.' },
      { code: ':', name: 'Geröll', art: 'schwieriges Gelände', muster: 'geroell', kosten: 'kostet 2', text: 'Der Grund eine Stufe dunkler, acht Steine in drei Grautönen mit Lichtpunkt und drei dunkle Lücken: derselbe Ton wie der Almboden, mehr und dunklere Zeichnung. Wer hier läuft, sucht jeden Tritt.' },
      { code: 'e', name: 'Saumpfad', art: 'Weg', muster: 'alm', weg: true, kosten: 'kostet 1', text: 'Festgetretene Erde zwischen abgetretenen Säumen, darin Trittsteine. Die Passstraße über den Sattel ist nichts anderes: breit genug für ein Maultier. Dieselben fünf Formen und der Fleck wie in jedem Set; nur die Farben gehören den Bergen.', naht: ['.e..', '.ee.', '..e.', '..ee'] },
      { code: 'i', name: 'Firn', art: 'schwieriges Gelände, glatt', muster: 'firn', rand: '#aebec7', kosten: 'kostet 2', text: 'Alter, verharschter Schnee, der den Sommer überdauert: Krustenlinien, Sonnenmulden, ein Schmutzstreifen. Zum Almboden hin ein Ufer mit hellem Saum, aus Vierteln; zum See hin kein Ufer.', naht: ['....', '.ii.', '.iii', '..i.'] },
      { code: '~', name: 'Bergsee', art: 'tiefes Wasser, schwimmen', muster: 'bergsee', rand: '#345a66', kosten: 'kostet 2', proben: [[['~~~~~~', '~~~~~~', '~~~~~~', '~~~~~~'], 'große Fläche: Die Flecken laufen über die Felder', 216]], text: 'Kaltes, blaugrünes Wasser mit tieferem Fleck, kurzen Wellen und einem Glanz. Am Almboden ein Ufer mit dunkler Kante zum Wasser; zum Firn hin kein Ufer.', naht: ['....', '.~~.', '.~~~', '..~.'] },
      { gruppe: 'Höhe und Wände', code: '/', name: 'Felsstufen', art: 'Treppe, Rampe', muster: 'alm', aufsatz: 'felsstufen', dreht: true, kosten: 'kostet 1, eine Stufe ohne Klettern', text: 'Vier in den Fels geschlagene Stufen, nach oben heller wie die Ebenen der Karte, mit Lichtkante und dunkler Stufenlinie. Hinauf liegt bei 0° oben; auf der Karte zeigt die Höhe der Nachbarn die Richtung. Zu viert in einem Muster von 72 Einheiten; die Flecken laufen über die Felder, damit eine große Wasserfläche nicht stempelt.' },
      { code: 'F', name: 'Felswand', art: 'Fels, gewachsen (neues Zeichen)', muster: 'felswand', kosten: 'gesperrt, ganzes Feld', text: 'Gewachsen, darum keine Mauer, sondern eine Abbruchkante von oben: Felstextur, die über die Felder durchläuft, an der höheren Seite die Lippe mit der angedeuteten oberen Ebene, an der tieferen der Fuß mit Boden und Geröll und ein Schlagschatten auf den tieferen Boden; an den Enden nur Textur, offene Enden und Außenecken gerundet. Welche Seite oben ist, sagen die Höhen der Karte. Nur tiefere Seiten, ein Feld dick: Plattform oder Rücken (Fläche und Schatten). Ab zwei Feldern Dicke überall Felstextur wie am Kartenrand. Nur höhere: ein Loch mit Lippen ringsum. Läuft über den Kartenrand weiter. Kühles Grau, damit sie sich von der warmen Feldsteinmauer abhebt.' },
      { gruppe: 'Umgebung', code: 'O', name: 'Bergkiefer', art: 'Baum', muster: 'alm', aufsatz: 'bergkiefer', krone: 'bergkieferKrone', kosten: 'nicht betretbar, Dreiviertel-Deckung', text: 'Von oben: Zweigspitzen im Kranz, die Krone vom Wind etwas aus der Mitte gedrückt, darunter dunklere alte Zweige und der Stamm. Keine Schneekappe; das Set ist unter der Schneegrenze. Die Krone ist gut 3 m breit und ragt halb über die Nachbarfelder; gesperrt ist nur das Stammfeld, die Krone gibt keine Deckung.' },
      { code: 'd', name: 'Latschen', art: 'Busch, Dickicht', muster: 'alm', aufsatz: 'latschen', kosten: 'kostet 2, schwieriges Gelände', text: 'Vier Ballen Krummholz mit gemeinsamem Umriss, Zweige aus der Mitte, helle Nadelspitzen zum Licht. Kleiner und heller als die Bergkiefer, damit man sie als betretbar liest.' },
      { code: 'x', name: 'Felsbrocken', art: 'Hindernis', muster: 'alm', aufsatz: 'felsbrocken', kosten: 'nicht betretbar', text: 'Ein Block mit vier Flächen: Licht von links oben, dunkle Flanke rechts unten, Umriss in Tinte, der Schatten als versetzte Silhouette und eine Flechte auf der Oberseite. Rund genug, um nicht zu drehen.' }
    ]
  };
  BERGE.nachCode = {};
  BERGE.kacheln.forEach(function (k) { BERGE.nachCode[k.code] = k; });

  // Set 3: Flussufer und Küste. Wo der Fluss ins Meer mündet: Sand und Kies, Schlick, Schilf, der Steg, das Steilufer, die Brandung.
  function muschel(x, y, s, rot) {
    var t = ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"';
    return '<path d="M' + (x - 4 * s) + ' ' + (y + 2 * s) + 'Q' + x + ' ' + (y - 5 * s) + ' ' + (x + 4 * s) + ' ' + (y + 2 * s) + 'L' + x + ' ' + (y + 3.5 * s) + 'Z" fill="#efe6cc" stroke="#a08c62" stroke-width=".8" stroke-linejoin="round"' + t + '/>' +
      '<path d="M' + x + ' ' + (y + 3 * s) + 'L' + (x - 2.2 * s) + ' ' + (y - 1 * s) + 'M' + x + ' ' + (y + 3 * s) + 'V' + (y - 2 * s) + 'M' + x + ' ' + (y + 3 * s) + 'L' + (x + 2.2 * s) + ' ' + (y - 1 * s) + '" fill="none" stroke="#b8a67a" stroke-width=".7"' + t + '/>';
  }
  function kies(x, y, rx, ry, rot) {
    var t = ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"';
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#9d957f"' + t + '/><path d="M' + (x - rx * 0.8) + ' ' + (y + ry * 0.45) + 'q' + (rx * 0.8) + ' ' + (ry * 0.9) + ' ' + (rx * 1.6) + ' 0" fill="none" stroke="#6f685a" stroke-width=".8"' + t + '/><circle cx="' + (x - rx * 0.3) + '" cy="' + (y - ry * 0.35) + '" r=".6" fill="#d6d1c2"/>';
  }
  // Rippeln im Sand: ein heller Kamm, darunter sein Schatten
  function rippel(x, y, w) { return '<path d="M' + x + ' ' + y + 'q' + (w / 4) + '-2.4 ' + (w / 2) + ' 0t' + (w / 2) + ' 0" fill="none" stroke="#efe6cc" stroke-width="1.2" stroke-linecap="round"/><path d="M' + x + ' ' + (y + 1.8) + 'q' + (w / 4) + '-2.4 ' + (w / 2) + ' 0t' + (w / 2) + ' 0" fill="none" stroke="#a08c62" stroke-width=".8" stroke-linecap="round" opacity=".55"/>'; }
  function vogelspur(x, y, r) { return '<g transform="rotate(' + r + ' ' + x + ' ' + y + ')"><path d="M' + x + ' ' + y + 'l-2.6-3.2M' + x + ' ' + y + 'v-4.2M' + x + ' ' + y + 'l2.6-3.2M' + x + ' ' + y + 'v1.6" fill="none" stroke="#8c7a57" stroke-width="1.1" stroke-linecap="round"/></g>'; }
  // Treibholz: ein gebleichter, krummer Stamm, der schräg liegt (von links oben nach rechts unten), mit Wurzelstumpf und Bruchende
  var TREIBHOLZ = 'M8 5C13 3.5 17 7 20 11C24 16 30 18 32.5 23C34 27 31 31.5 26.5 31C22 30.5 19.5 26 15.5 22C11.5 18 6 17.5 4.5 13C3.5 9.5 5 6 8 5Z';
  var TREIBHOLZ_WURZELN = 'M8 5L5 2.6M5.5 8.5L2.8 8.2M26.5 31L28.5 33.5';
  // Weide (Silberweide am Ufer): die Krone aus sechs ungleichen Lappen, von rechts unten (dunkel) nach links oben (hell) gezeichnet,
  // am Rand jedes Lappens schmale, lanzettliche Blätter. f ist der Maßstab um die Feldmitte: 1 für die Kachel für sich (Band, Legende),
  // 2,1 auf der Karte, denn eine echte Krone ist gut 3 m breit: Sie ragt halb über die Nachbarfelder, nur das Stammfeld ist gesperrt.
  var WEIDE_LOBEN = [[21.5, 26, 7, '#7e9472'], [25.5, 19.5, 7, '#86997a'], [12, 24.5, 7, '#8ea07a'], [18, 18, 7.2, '#9fb08a'], [23, 12, 7.5, '#a9b995'], [12.5, 13.5, 8, '#b5c39e']];
  function weideTeile(f) {
    function r(v) { return Math.round(v * 10) / 10; }
    var loben = WEIDE_LOBEN.map(function (l) { return [r(18 + (l[0] - 18) * f), r(18 + (l[1] - 18) * f), r(l[2] * f), l[3]]; });
    var dunkel = '', hell = '', offs = f > 1.5 ? [-0.95, -0.6, -0.25, 0.1, 0.45, 0.8] : [-0.75, -0.3, 0.15, 0.6], rx = f > 1.5 ? 2.8 : 2.1, ry = f > 1.5 ? 1 : 0.8;
    loben.forEach(function (l) {
      var cx = l[0], cy = l[1], R = l[2], aus = Math.atan2(cy - 18.5, cx - 18.2);
      offs.forEach(function (off, j) {
        var a = aus + off + (j % 2 ? 0.06 : -0.06), rr = R - (f > 1.5 ? 3.2 : 2.4) - (j % 2) * (f > 1.5 ? 1.8 : 0.9), x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a), licht = Math.cos(a - (-3 * Math.PI / 4)) > 0.35;
        var e = '<ellipse cx="' + r(x) + '" cy="' + r(y) + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + Math.round(a * 180 / Math.PI) + ' ' + r(x) + ' ' + r(y) + ')"/>';
        if (licht) hell += e; else dunkel += e;
      });
    });
    return {
      schatten: loben.map(function (l) { return '<circle cx="' + l[0] + '" cy="' + l[1] + '" r="' + l[2] + '"/>'; }).join(''),
      form: '<g fill="#3b3028">' + loben.map(function (l) { return '<circle cx="' + l[0] + '" cy="' + l[1] + '" r="' + (l[2] + 0.9) + '"/>'; }).join('') + '</g>' +
        loben.map(function (l) { return '<circle cx="' + l[0] + '" cy="' + l[1] + '" r="' + l[2] + '" fill="' + l[3] + '"/>'; }).join('') +
        '<g fill="#5a7450">' + dunkel + '</g><g fill="#e0e7cf">' + hell + '</g><circle cx="17.5" cy="18.5" r="' + (f > 1.5 ? 1.8 : 1.2) + '" fill="#6b573f"/>'
    };
  }
  // Der Steg: Bohlen auf Pfählen, eine gebaute Fläche aus Vierteln mit geraden Kanten (Viertel oben links, 0 bis 18)
  function pfahl(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#5c4a35" stroke="#3b3028" stroke-width=".9"/><path d="M' + (x - r * 0.55) + ' ' + (y - r * 0.5) + 'a' + (r * 0.75) + ' ' + (r * 0.75) + ' 0 0 1 ' + (r * 0.95) + ' -' + (r * 0.25) + '" fill="none" stroke="#a08a66" stroke-width=".8"/>'; }
  function stegStueck(st) {
    var n = st === 'oben' || st === 'aussen', w = st === 'links' || st === 'aussen', o = [];
    if (n) o.push('<rect width="18" height="3.2" fill="#8a7352"/><path d="M0 3.2H18" stroke="#5e4c36" stroke-width=".8"/><path d="M0 .6H18" stroke="#3b3028" stroke-width="1.2"/>');
    if (w) o.push('<rect width="3.2" height="18" fill="#8a7352"/><path d="M3.2 0V18" stroke="#5e4c36" stroke-width=".8"/><path d="M.6 0V18" stroke="#3b3028" stroke-width="1.2"/>');
    if (n && w) o.push(pfahl(4, 4, 3)); else if (n) o.push(pfahl(9, 3.2, 2.4)); else if (w) o.push(pfahl(3.2, 9, 2.4)); else if (st === 'innen') o.push(pfahl(3, 3, 2.4));
    return o.join('');
  }
  var KUESTE = {
    id: 'kueste', nr: 3, name: 'Flussufer und Küste', standard: 'sand', status: 'fertig', weheName: 'Sandwehe',
    text: 'Wo der Fluss ins Meer mündet. Draußen ist der Grund Sand mit Kies, Muscheln und Rippeln; Schlick bei Ebbe ist das schwierige Gelände. Wasser und Brandung bekommen ein Sandufer mit hellem Saum: Die Brandung ist das seichte, schäumende Wasser vor dem Strand und nimmt das Zeichen des Eises, denn sie ist schwierig und zieht an den Beinen; zum tiefen Wasser hin hat sie kein Ufer. Das Steilufer ist der Fels des Sets, ein Kliff aus Sand und Lehm. Der Weg des Sets ist der Steg: Bohlen auf Pfählen, über Wasser wie über Sand, mit geraden Kanten und auch zwei Felder breit; auf Sand selbst gibt es keinen Pfad. Uferstufen führen das Kliff hinab. Am Wasser stehen Weiden und Schilf, auf dem Strand liegt Treibholz. Das Wetter des Sets ist Flugsand, der auf allem liegt, was draußen steht; durch Lücken weht Sand mit Muscheln herein. Die Tür ist die Standardtür.',
    rollen: [
      ['Grund', '#d8c89e', 'Sand und Kies, Ufer'], ['Grund dunkel', '#b3a27c', 'Schlick'], ['Zeichnung', '#a08c62', 'Kiesel #9d957f, Muschelschatten, Vogelspuren #8c7a57'], ['Licht', '#efe6cc', 'Rippeln, Muscheln, Ufersaum'],
      ['Fels', '#7e6e55', 'Steilufer; Schichten #bfae8a, Risse #3f3428'], ['Wasser', '#4f7f8f', 'Fluss, Mündung, Meer; Uferkante #2f5563'], ['Eis', '#7ea4ab', 'Brandung; Schaum #e8ece4'], ['Grün', '#7f9a5a', 'Schilf; Weide #9fb08a bis #b5c39e, Kolben #6e4a2c'],
      ['Weg', '#b3a07c', 'Steg: Bohlen; Spalten #4e483d, Kantbalken #8a7352, Pfähle #5c4a35'], ['Wetter', '#e4d5aa', 'Flugsand auf allem, was draußen steht'], ['Treibholz', '#cdbfa3', 'bleich; Flanke #8c7d64, Risse #6b5e4a']
    ],
    ufer: { flaeche: '#d8c89e', linie: '#efe6cc' },
    weg: { wall: '#8a7352', band: '#b3a07c', kante: '#4e483d', spuren: '#5c4a35' },
    // Sandwehe drinnen: eine Zunge Flugsand, Muschelbruch und Körner
    wehe: {
      2: '<path d="M2 31C6 26 12 25 18 27S30 31 34 28V34H2Z" fill="#dcc89c" opacity=".92"/><path d="M4 11C8 9 13 10 16 12C12 14 7 14 4 11Z" fill="#dcc89c" opacity=".85"/>' + muschel(25, 17, 0.7, 25) + '<g fill="#efe6cc"><circle cx="10" cy="21" r=".9"/><circle cx="29" cy="9" r=".8"/><circle cx="20" cy="20" r=".7"/></g>',
      1: '<path d="M6 27C10 24 15 25 17 28C13 30 9 30 6 27Z" fill="#dcc89c" opacity=".8"/><g fill="#efe6cc"><circle cx="12" cy="10" r=".9"/><circle cx="25" cy="14" r=".8"/><circle cx="28" cy="27" r=".8"/></g>'
    },
    feuerring: '<path d="' + FEUER_RING + '" fill="#6b5d4a" opacity=".42"/>',
    fels: { m: 7, h: 6, krone: '#7e6e55', licht: '#bfae8a', fuge: '#3f3428', front: '#5b4c3b', frontFuge: '#352b21', flanke: '#6b5b47' },
    // Wetter: Flugsand in den Ritzen und auf den Flächen zum Licht, auf den gemeinsamen Dingen draußen (und drinnen unter einer Wehe)
    wetter: {
      fass: '<path d="M11 12q4-5 9-3-2.5 3.5-6.5 4.5z" fill="#e4d5aa"/><circle cx="22" cy="12" r=".9" fill="#e4d5aa"/><circle cx="12" cy="20" r=".8" fill="#e4d5aa"/>',
      kiste: '<path d="M8.5 8.5h9q-1 2.5-4.5 3.2-3 .5-4.5 3.8z" fill="#e4d5aa"/><circle cx="23" cy="11" r=".9" fill="#e4d5aa"/><circle cx="11" cy="24" r=".8" fill="#e4d5aa"/>',
      truhe: '<path d="M7 3.5h8q-1 2-4 2.4-2.5.3-4 2.1z" fill="#e4d5aa"/><circle cx="21" cy="5" r=".8" fill="#e4d5aa"/>',
      stuhl: '<path d="M10.5 12.5h6q-.8 1.8-3.5 2.1-2 .2-2.5 1.6z" fill="#e4d5aa"/><circle cx="21" cy="14" r=".8" fill="#e4d5aa"/>',
      hocker: '<path d="M12.5 15.5q2.5-3.5 6-2.5-1.5 2.5-4 3.2z" fill="#e4d5aa"/><circle cx="20" cy="14.5" r=".7" fill="#e4d5aa"/>',
      tisch: '<path d="M7.5 7.5h10q-1 2.8-5 3.4-3.5.6-5 4.2z" fill="#e4d5aa"/><circle cx="25" cy="10" r="1" fill="#e4d5aa"/><circle cx="10" cy="19" r=".8" fill="#e4d5aa"/>',
      bank: '<path d="M9.5 13.5h8q-1 2-4 2.3-2.5.3-4 1.8z" fill="#e4d5aa"/><circle cx="22" cy="15" r=".8" fill="#e4d5aa"/>'
    },
    muster: {
      sand: { grund: '#d8c89e', bilder: [
        rippel(4, 9, 28) + rippel(4, 17, 28) + rippel(4, 25, 28) + muschel(27, 30, 0.9, 15),
        kies(9, 9, 2.6, 1.9, 20) + kies(24, 12, 2, 1.5, -15) + kies(14, 27, 2.3, 1.7, 35) + rippel(6, 20, 24) + '<circle cx="29" cy="28" r=".9" fill="#a08c62"/><circle cx="5" cy="31" r=".8" fill="#a08c62"/>',
        muschel(11, 12, 1, -15) + '<circle cx="25" cy="24" r="3.4" fill="#e3d6b0" stroke="#a08c62" stroke-width=".8"/><path d="M25 24m-1.9 0a1.9 1.9 0 1 1 1.9 1.9" fill="none" stroke="#b8a67a" stroke-width=".8"/>' + rippel(5, 31, 18) + '<circle cx="30" cy="8" r=".9" fill="#a08c62"/><circle cx="7" cy="22" r=".8" fill="#a08c62"/>',
        '<g transform="rotate(-6 18 18)">' + rippel(5, 8, 26) + rippel(5, 15, 26) + '</g>' + kies(28, 27, 2.4, 1.8, 10) + '<ellipse cx="11" cy="27" rx="5" ry="2.8" fill="#c9b88c" opacity=".7"/><circle cx="31" cy="12" r=".8" fill="#a08c62"/>'
      ], selten: vogelspur(11, 25, 30) + vogelspur(17, 19, 30) + vogelspur(23, 13, 30) },
      schlick: { grund: '#b3a27c', bilder: [
        '<path d="M5 12q6-6 13-2t-3 8q-6 3-10-1t0-5z" fill="#7d9ea4"/><path d="M8 11.5q3-1.6 6 0" fill="none" stroke="#c6d6d6" stroke-width="1" stroke-linecap="round"/>' +
        '<path d="M20 22q6-4 11 1t-4 7q-6 1-8-3t1-5z" fill="#7d9ea4"/><path d="M23 23.5q3-1.6 6 0" fill="none" stroke="#c6d6d6" stroke-width="1" stroke-linecap="round"/>' +
        '<ellipse cx="27" cy="9" rx="4" ry="2.4" fill="#9a8a66"/><ellipse cx="9" cy="28" rx="4.5" ry="2.6" fill="#9a8a66"/><path d="M14 31.5q3-1.2 6 0" fill="none" stroke="#d4c6a0" stroke-width="1" stroke-linecap="round"/><circle cx="31" cy="30" r="1.2" fill="#8a7a58"/><circle cx="4" cy="21" r="1" fill="#8a7a58"/>'
      ] },
      steg: { grund: '#4e483d', bilder: [
        '<rect x="0" y="0.5" width="36" height="8" fill="#b3a07c"/><rect x="0" y="9.5" width="36" height="8" fill="#aa976f"/><rect x="0" y="18.5" width="36" height="8" fill="#b9a683"/><rect x="0" y="27.5" width="36" height="8" fill="#ad9a76"/>' +
        '<path d="M14 .5V8.5M26 9.5V17.5M8 18.5V26.5M20 27.5V35.5" stroke="#4e483d" stroke-width="1"/><path d="M3 4.5q6 1.2 9-.5M17 13.5q6-1.2 11 .4M11 22.5q7 1 13-.6M3 31.5q5 1.2 9-.5" fill="none" stroke="#c9b892" stroke-width=".8"/>' +
        '<g fill="#5e4c36"><circle cx="5" cy="4.5" r=".7"/><circle cx="31" cy="4.5" r=".7"/><circle cx="5" cy="22.5" r=".7"/><circle cx="31" cy="22.5" r=".7"/><circle cx="23" cy="13.5" r=".9"/></g>'
      ] },
      brandung: { grund: '#7ea4ab', bilder: [
        '<path d="M4 12q7-4 14 0t14 0" fill="none" stroke="#e8ece4" stroke-width="2.2" stroke-linecap="round"/><path d="M4 24q7 4 14 0t14 0" fill="none" stroke="#e8ece4" stroke-width="2.2" stroke-linecap="round"/>' +
        '<ellipse cx="20" cy="18" rx="7" ry="2.6" fill="#c9bb95" opacity=".38"/><g fill="#e8ece4"><circle cx="9" cy="17" r="1.1"/><circle cx="27" cy="7" r="1"/><circle cx="30" cy="30" r="1.1"/><circle cx="7" cy="31" r=".9"/></g>'
      ] },
      wasser: { grund: '#4f7f8f', bilder: tiefwasser({ fleck: '#3f6b7a', deckung: .8, farbe: '#9fbfc4', breite: 1.2, bogen: 2, zahl: 4, strom: { farbe: '#7fa6ad', breite: 1.4, deckung: .9 } }) },
      steilufer: { grund: '#7e6e55', bilder: [
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7V13C29 12 23 11 15 13S5 14 0 13Z" fill="#8c7b61"/><path d="M0 22C8 24 15 25 23 23S32 21 36 22V28C29 27 22 26 14 28S5 29 0 28Z" fill="#6e5f49"/>' +
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7M0 22C8 24 15 25 23 23S32 21 36 22" fill="none" stroke="#bfae8a" stroke-width="1" opacity=".7"/><path d="M12 16l2 4-1 3M26 3l-2 3M28 31l3 2M6 32l2-3" fill="none" stroke="#3f3428" stroke-width="1.1" stroke-linecap="round"/><circle cx="20" cy="17" r="1.3" fill="#a08c62"/><circle cx="9" cy="19" r="1" fill="#a08c62"/>'
      ] }
    },
    aufsatz: {
      uferstufen: '<rect x="4" y="4" width="28" height="7" fill="#d2bf93"/><rect x="4" y="11" width="28" height="7" fill="#c3af84"/><rect x="4" y="18" width="28" height="7" fill="#b39f76"/><rect x="4" y="25" width="28" height="7" fill="#a38f69"/><rect x="4" y="4" width="28" height="28" fill="none" stroke="#6b5a42" stroke-width="1"/><path d="M4 11H32M4 18H32M4 25H32" stroke="#6b5a42" stroke-width="1.6"/><path d="M5 5.6h26M5 12.6h26M5 19.6h26M5 26.6h26" stroke="#efe6cc" stroke-width="1" opacity=".9"/>' +
        '<g fill="#5c4a35" stroke="#3b3028" stroke-width=".7"><circle cx="7" cy="9.6" r="1.5"/><circle cx="29" cy="9.6" r="1.5"/><circle cx="7" cy="23.6" r="1.5"/><circle cx="29" cy="23.6" r="1.5"/></g>',
      weide: weideTeile(1),
      weideKrone: weideTeile(2.1),
      schilf: {
        schatten: '<circle cx="13" cy="15" r="7.9"/><circle cx="22" cy="13" r="7.9"/><circle cx="24" cy="22" r="8.4"/><circle cx="14" cy="23" r="7.9"/>',
        form: '<g fill="#3b3028"><circle cx="13" cy="15" r="7.9"/><circle cx="22" cy="13" r="7.9"/><circle cx="24" cy="22" r="8.4"/><circle cx="14" cy="23" r="7.9"/></g>' +
          '<g fill="#7f9a5a"><circle cx="13" cy="15" r="7"/><circle cx="22" cy="13" r="7"/><circle cx="24" cy="22" r="7.5"/><circle cx="14" cy="23" r="7"/></g>' +
          '<path d="M18 19l-9-7M18 19l-7 3M18 19l-2-10M18 19l4-11M18 19l10-5M18 19l10 4M18 19l6 9M18 19l-3 10M18 19l-9 8" fill="none" stroke="#5e7a44" stroke-width="1" stroke-linecap="round"/>' +
          '<path d="M9 12l-2-2M11 22l-2 1M16 9l-1-2M22 8l1-2M28 14l2-1M28 23l2 1M24 28l1 2M15 29l-1 2M9 27l-2 2" fill="none" stroke="#b7c98a" stroke-width="1" stroke-linecap="round"/>' +
          '<g fill="#6e4a2c" stroke="#3b3028" stroke-width=".5"><ellipse cx="9.5" cy="11" rx="1.4" ry="3" transform="rotate(40 9.5 11)"/><ellipse cx="22.5" cy="7.5" rx="1.4" ry="3" transform="rotate(-15 22.5 7.5)"/><ellipse cx="28.5" cy="13" rx="1.3" ry="2.8" transform="rotate(-65 28.5 13)"/><ellipse cx="25" cy="28.5" rx="1.3" ry="2.8" transform="rotate(-30 25 28.5)"/><ellipse cx="10" cy="27.5" rx="1.3" ry="2.8" transform="rotate(45 10 27.5)"/></g>'
      },
      treibholz: {
        schatten: '<path d="' + TREIBHOLZ + '"/><path d="' + TREIBHOLZ_WURZELN + '" fill="none" stroke="#2a2119" stroke-width="3.4" stroke-linecap="round"/>',
        form: '<path d="' + TREIBHOLZ_WURZELN + '" fill="none" stroke="#3b3028" stroke-width="4.8" stroke-linecap="round"/><path d="' + TREIBHOLZ_WURZELN + '" fill="none" stroke="#b0a284" stroke-width="2.6" stroke-linecap="round"/>' +
          '<path d="' + TREIBHOLZ + '" fill="#cdbfa3"/><path d="M26.5 31C22 30.5 19.5 26 15.5 22C11.5 18 6 17.5 4.5 13C7 16 12 16.5 16.5 20C21 24 23.5 28.5 29 29.5C28.5 30.5 27.5 31 26.5 31Z" fill="#8c7d64"/>' +
          '<path d="M8 5C13 3.5 17 7 20 11C24 16 30 18 32.5 23C30 20.5 26 19 22 15.5C18.5 12 15 7 8 5Z" fill="#eadfc6"/>' +
          '<path d="M9 9q4 1.5 7 5.5M14 9.5l3 3M22 19q4 2 7 6M24 26l3 1.5" fill="none" stroke="#6b5e4a" stroke-width="1" stroke-linecap="round"/><path d="M31 25l-3.5 2.5 2.5 2" fill="none" stroke="#3b3028" stroke-width=".9" stroke-linejoin="round"/>' +
          '<path d="' + TREIBHOLZ + '" fill="none" stroke="#3b3028" stroke-width="1.3" stroke-linejoin="round"/>'
      }
    },
    kacheln: [
      { gruppe: 'Draußen', code: '.', name: 'Sand und Kies', art: 'Standard', muster: 'sand', kosten: 'kostet 1', text: 'Heller Sand in vier Varianten: Rippeln mit Lichtkamm und Schattensaum, Kiesel mit Lichtpunkt, eine Fächermuschel, eine Schnecke, ein feuchter Fleck. Zu viert in einem Muster von 72 Einheiten, damit kein Feld wie sein Nachbar aussieht. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, läuft eine Vogelspur darüber.' },
      { code: ':', name: 'Schlick', art: 'schwieriges Gelände', muster: 'schlick', kosten: 'kostet 2', text: 'Der Grund eine Stufe dunkler, nasser Schlick bei Ebbe: zwei Pfützen mit Glanz, dunkle Schlammflecken, ein nasser Schimmer, Krümel. Derselbe Ton wie der Sand, mehr und dunklere Zeichnung; wer hier geht, bleibt mit jedem Schritt stecken.' },
      { code: 'e', name: 'Steg', art: 'Weg, gebaut', muster: 'steg', steg: true, wasser: true, kosten: 'kostet 1', naht: ['....', '.e..', '~e~~', '~ee~'], text: 'Bohlen auf Pfählen, in diesem Set der Weg: über Wasser als Steg, über Sand als Bohlensteg, denn auf Sand gibt es keinen Pfad. Gebaut, darum gerade: eine Fläche aus Vierteln wie der Teppich, mit Kantbalken, Umriss und Pfahlköpfen an jeder freien Kante und Ecke; nebeneinander wird daraus ein Steg, so breit und so lang, wie die Felder es sagen. Für das Ufer zählt er als Wasser, darum wächst kein Strand an ihm.' },
      { code: 'i', name: 'Brandung', art: 'schwieriges Gelände, glatt', muster: 'brandung', rand: '#e8ece4', kosten: 'kostet 2', naht: ['....', '.ii.', '.iii', '..i.'], text: 'Seichtes Wasser, in dem die Wellen auslaufen: Schaumlinien, Schaumflocken, der Sand schimmert durch. Es nimmt das Zeichen des Eises, denn es ist schwierig und zieht an den Beinen; nicht tief genug zum Schwimmen. Zum Sand hin ein Ufer mit Schaumkante und hellem Saum, aus Vierteln; zum tiefen Wasser hin kein Ufer.' },
      { code: '~', name: 'Tiefes Wasser', art: 'tiefes Wasser, schwimmen', muster: 'wasser', rand: '#2f5563', kosten: 'kostet 2', naht: ['....', '.~~.', '.~~~', '..~.'], proben: [[['~~~~~~', '~~~~~~', '~~~~~~', '~~~~~~'], 'große Fläche: Die Flecken laufen über die Felder', 216]], text: 'Fluss, Mündung und Meer: graugrünes Wasser mit tieferem Fleck, kurzen Wellen und einer Strömungslinie. Am Sand ein Ufer mit dunkler Kante zum Wasser; zur Brandung und zum Steg hin kein Ufer. Zu viert in einem Muster von 72 Einheiten; die Flecken laufen über die Felder, damit eine große Wasserfläche nicht stempelt.' },
      { gruppe: 'Höhe und Wände', code: '/', name: 'Uferstufen', art: 'Treppe, Rampe', muster: 'sand', aufsatz: 'uferstufen', dreht: true, kosten: 'kostet 1, eine Stufe ohne Klettern', text: 'Vier Bohlenstufen, mit Pflöcken in den Hang gesetzt, nach oben heller wie die Ebenen der Karte, mit Lichtkante und dunkler Stufenlinie. Hinauf liegt bei 0° oben; auf der Karte zeigt die Höhe der Nachbarn die Richtung.' },
      { code: 'F', name: 'Steilufer', art: 'Fels, gewachsen (neues Zeichen)', muster: 'steilufer', kosten: 'gesperrt, ganzes Feld', text: 'Gewachsen, darum keine Mauer, sondern eine Abbruchkante von oben: Felstextur, die über die Felder durchläuft, an der höheren Seite die Lippe mit der angedeuteten oberen Ebene, an der tieferen der Fuß mit Boden und Geröll und ein Schlagschatten auf den tieferen Boden; an den Enden nur Textur, offene Enden und Außenecken gerundet. Welche Seite oben ist, sagen die Höhen der Karte. Nur tiefere Seiten, ein Feld dick: Plattform oder Rücken (Fläche und Schatten). Ab zwei Feldern Dicke überall Felstextur wie am Kartenrand. Nur höhere: ein Loch mit Lippen ringsum. Läuft über den Kartenrand weiter. Ein Kliff aus Sand und Lehm, warmes Braun.' },
      { gruppe: 'Umgebung', code: 'O', name: 'Weide', art: 'Baum', muster: 'sand', aufsatz: 'weide', krone: 'weideKrone', kosten: 'nicht betretbar, Dreiviertel-Deckung', text: 'Eine Silberweide am Ufer, von oben: eine Krone aus sechs ungleichen Lappen, silbergrün und zum Licht hin heller, am Rand die schmalen, lanzettlichen Blätter. Die Krone ist gut 3 m breit wie bei einem echten Baum: Auf der Karte ragt sie halb über die acht Nachbarfelder, gesperrt ist nur das Feld mit dem Stamm, darunter geht man hindurch, und die Spielsteine liegen obenauf. Die Krone gibt keine Deckung. Für sich allein (Band, Legende) ist sie auf ein Feld verkleinert. Rund, darum dreht sie nicht.' },
      { code: 'd', name: 'Schilf', art: 'Busch, Dickicht', muster: 'sand', aufsatz: 'schilf', kosten: 'kostet 2, schwieriges Gelände', text: 'Vier Ballen Schilf mit gemeinsamem Umriss, die Halme aus der Mitte nach außen, helle Spitzen und fünf braune Kolben. Kleiner und heller als die Weide, damit man es als betretbar liest.' },
      { code: 'x', name: 'Treibholz', art: 'Hindernis', muster: 'sand', aufsatz: 'treibholz', dreht: true, kosten: 'nicht betretbar', text: 'Ein angeschwemmter Stamm, krumm, von Salz und Sonne gebleicht: Licht von links oben, dunkle Flanke rechts unten, Risse, am dicken Ende zwei Wurzelstümpfe, am dünnen das Bruchende, Umriss in Tinte und der Schatten als versetzte Silhouette. Er liegt schräg von links oben nach rechts unten; wie Truhe und Fell dreht er nur nach Eintrag.' }
    ]
  };
  KUESTE.nachCode = {};
  KUESTE.kacheln.forEach(function (k) { KUESTE.nachCode[k.code] = k; });

  // Set 4: Grasland. Das offene Land: Wiese, Feldweg mit Grasnarbe, Hecken aus Weißdorn und Schlehe, ein Weiher, große Eichen, Gehöfte.
  function gr(v) { return Math.round(v * 10) / 10; }
  // Halme: ein Büschel aus vier gebogenen Halmen, der Fuß bei (x, y)
  function halme(x, y, s, farbe) {
    s = s || 1;
    return '<path d="' + [[-1.2, -2.4, -2.9, -4.2], [-0.3, -2.9, -0.8, -5.4], [0.5, -2.8, 1.5, -5.1], [1.3, -1.9, 3.1, -3.6]].map(function (q) {
      return 'M' + x + ' ' + y + 'q' + gr(q[0] * s) + ' ' + gr(q[1] * s) + ' ' + gr(q[2] * s) + ' ' + gr(q[3] * s);
    }).join('') + '" fill="none" stroke="' + (farbe || '#7f8c4f') + '" stroke-width="1.1" stroke-linecap="round"/>';
  }
  // Hohes Gras: lange Halme, die der Wind nach Osten legt, dazu ein heller Halm mit Rispe
  function hochgras(x, y, s) {
    s = s || 1;
    function m(q) { return 'M' + x + ' ' + y + 'q' + gr(q[0] * s) + ' ' + gr(q[1] * s) + ' ' + gr(q[2] * s) + ' ' + gr(q[3] * s); }
    return '<path d="' + [[-0.6, -3.6, -1.6, -6.8], [0.4, -3.9, 1.6, -7.4], [1.4, -3.4, 3.8, -6.3], [2.2, -2.2, 5.2, -3.8]].map(m).join('') + '" fill="none" stroke="#6b7843" stroke-width="1.2" stroke-linecap="round"/>' +
      '<path d="' + m([0.9, -2.9, 2.6, -5.9]) + '" fill="none" stroke="#d6d9a8" stroke-width="1" stroke-linecap="round"/>';
  }
  // Gänseblümchen: fünf helle Blütenblätter um ein ockerfarbenes Herz (kein Gelb, das gehört den Flammen)
  function bluemchen(x, y, s) {
    s = s || 1; var o = '';
    for (var i = 0; i < 5; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / 5; o += '<circle cx="' + gr(x + 1.5 * s * Math.cos(a)) + '" cy="' + gr(y + 1.5 * s * Math.sin(a)) + '" r="' + gr(1.05 * s) + '"/>'; }
    return '<g fill="#f1ecdc">' + o + '</g><circle cx="' + x + '" cy="' + y + '" r="' + gr(0.85 * s) + '" fill="#c4a04a"/>';
  }
  // Kleeblatt: drei Blättchen
  function kleeblatt(x, y, s, rot) {
    var o = '';
    for (var i = 0; i < 3; i++) { var a = (rot || 0) * Math.PI / 180 - Math.PI / 2 + i * 2 * Math.PI / 3; o += '<circle cx="' + gr(x + 1.2 * s * Math.cos(a)) + '" cy="' + gr(y + 1.2 * s * Math.sin(a)) + '" r="' + gr(1.25 * s) + '"/>'; }
    return o;
  }
  // Ein Blatt (Laub als Wetter und Wehe): spitz an beiden Enden
  function blatt(x, y, l, rot, farbe) {
    var h = l / 2, w = l * 0.38;
    return '<path d="M' + gr(x - h) + ' ' + y + 'Q' + x + ' ' + gr(y - w) + ' ' + gr(x + h) + ' ' + y + 'Q' + x + ' ' + gr(y + w) + ' ' + gr(x - h) + ' ' + y + 'Z" fill="' + farbe + '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
  }
  var LAUB = ['#6b8a3d', '#b39d48'];
  // Klauentritt im nassen Lehm: zwei Hälften, Wasser darin
  function tritt(x, y, rot) {
    return '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')" fill="#7d958f" stroke="#5d4f38" stroke-width=".8" stroke-linejoin="round">' +
      '<path d="M' + gr(x - 0.5) + ' ' + gr(y - 2.6) + 'C' + gr(x - 2.9) + ' ' + gr(y - 2.4) + ' ' + gr(x - 3) + ' ' + gr(y + 2.3) + ' ' + gr(x - 0.5) + ' ' + gr(y + 2.6) + 'Z"/>' +
      '<path d="M' + gr(x + 0.5) + ' ' + gr(y - 2.6) + 'C' + gr(x + 2.9) + ' ' + gr(y - 2.4) + ' ' + gr(x + 3) + ' ' + gr(y + 2.3) + ' ' + gr(x + 0.5) + ' ' + gr(y + 2.6) + 'Z"/></g>';
  }
  // Seerosenblatt: ein Kreis mit Kerbe (a: Richtung der Kerbe in Grad)
  function seerose(cx, cy, r, a) {
    var a1 = (a - 16) * Math.PI / 180, a2 = (a + 16) * Math.PI / 180;
    return '<path d="M' + cx + ' ' + cy + 'L' + gr(cx + r * Math.cos(a1)) + ' ' + gr(cy + r * Math.sin(a1)) + 'A' + r + ' ' + r + ' 0 1 0 ' + gr(cx + r * Math.cos(a2)) + ' ' + gr(cy + r * Math.sin(a2)) + 'Z" fill="#7fa05a" stroke="#4d6b3e" stroke-width=".8" stroke-linejoin="round"/>' +
      '<path d="M' + gr(cx - r * 0.75) + ' ' + gr(cy - r * 0.15) + 'A' + gr(r * 0.78) + ' ' + gr(r * 0.78) + ' 0 0 1 ' + gr(cx - r * 0.1) + ' ' + gr(cy - r * 0.76) + '" fill="none" stroke="#a9c07f" stroke-width=".9" stroke-linecap="round"/>';
  }
  function seerosenbluete(x, y) {
    var o = '';
    for (var i = 0; i < 6; i++) { var a = i * 60; o += '<ellipse cx="' + gr(x + 1.6 * Math.cos(a * Math.PI / 180)) + '" cy="' + gr(y + 1.6 * Math.sin(a * Math.PI / 180)) + '" rx="1.6" ry=".95" transform="rotate(' + a + ' ' + gr(x + 1.6 * Math.cos(a * Math.PI / 180)) + ' ' + gr(y + 1.6 * Math.sin(a * Math.PI / 180)) + ')"/>'; }
    return '<g fill="#f1ecdc" stroke="#b9ae93" stroke-width=".5">' + o + '</g><circle cx="' + x + '" cy="' + y + '" r="1" fill="#c4a04a"/>';
  }
  // Eiche: ein Laubbaum von oben. Die Krone aus Laubbüscheln (Lappen), jeder mit Schatten rechts unten und Licht links oben,
  // die äußeren mit Blattbuckeln am Rand. f ist der Maßstab um die Feldmitte (1 für sich, 2,1 auf der Karte, Krone gut 3 m):
  // Mit ihm wächst die Zahl der Büschel und Blätter, nicht die Strichstärke. Gezeichnet von rechts unten nach links oben,
  // die Mitte zuletzt, denn sie ist am höchsten.
  var EICHE = { schatten: '#45603a', grund: '#5e7b45', licht: '#7f9c5a', glanz: '#a6bd78', blatt: '#c2d197' };
  function eicheTeile(f) {
    var g = f > 1.5, aussen = g ? 30.6 : 13.6, rb = g ? 7.4 : 5.5, n = g ? 13 : 7;
    var J = [0.07, -0.1, 0.09, -0.04, 0.12, -0.09, 0.03, -0.07, 0.1, -0.12, 0.05, -0.03, 0.08];
    var kl = [];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + 0.25 + i * 2 * Math.PI / n + J[i], rr = rb * (1 + J[(i + 4) % n]), d = aussen - rr;
      kl.push({ x: 18 + d * Math.cos(a), y: 18 + d * Math.sin(a), r: rr, a: a, aussen: true });
    }
    if (g) for (var j = 0; j < 7; j++) { var a2 = -Math.PI / 2 + 0.6 + j * 2 * Math.PI / 7; kl.push({ x: 18 + 14.5 * Math.cos(a2), y: 18 + 14.5 * Math.sin(a2), r: 7.8, a: a2 }); }
    var mitte = { x: g ? 17 : 17.4, y: g ? 17 : 17.4, r: g ? 8.6 : 6.4, a: 0 };
    kl.sort(function (p, q) { return (q.aussen ? 1 : 0) - (p.aussen ? 1 : 0) || (q.x + q.y) - (p.x + p.y); });
    kl.push(mitte);
    // Blattbuckel: kleine Lappen am äußeren Bogen der äußeren Büschel
    var nb = g ? [-1.05, -0.35, 0.35, 1.05] : [-0.7, 0, 0.7];
    kl.forEach(function (k) { k.buckel = k.aussen ? nb.map(function (o) { var b = k.a + o; return [k.x + (k.r - 0.7) * Math.cos(b), k.y + (k.r - 0.7) * Math.sin(b), g ? 2.1 : 1.8, b]; }) : []; });
    function c(x, y, r, fill) { return '<circle cx="' + gr(x) + '" cy="' + gr(y) + '" r="' + gr(r) + '"' + (fill ? ' fill="' + fill + '"' : '') + '/>'; }
    function lichtSeite(b) { return Math.cos(b + 3 * Math.PI / 4) > 0; }
    var silhouette = kl.map(function (k) { return c(k.x, k.y, k.r) + k.buckel.map(function (b) { return c(b[0], b[1], b[2]); }).join(''); }).join('');
    var umriss = '<g fill="#3b3028">' + kl.map(function (k) { return c(k.x, k.y, k.r + 0.9) + k.buckel.map(function (b) { return c(b[0], b[1], b[2] + 0.9); }).join(''); }).join('') + '</g>';
    var buesche = kl.map(function (k) {
      var o = k.buckel.map(function (b) { return c(b[0], b[1], b[2], lichtSeite(b[3]) ? EICHE.grund : EICHE.schatten); }).join('');
      o += c(k.x, k.y, k.r, EICHE.schatten) + c(k.x - 0.14 * k.r, k.y - 0.14 * k.r, 0.86 * k.r, EICHE.grund) + c(k.x - 0.3 * k.r, k.y - 0.3 * k.r, 0.5 * k.r, EICHE.licht);
      // Blätter: helle zum Licht, am Rand des Lichtflecks
      var bl = g ? [-2.6, -1.9, -1.2] : [-2.5, -1.5];
      o += bl.map(function (w) { var x = k.x + 0.62 * k.r * Math.cos(w), y = k.y + 0.62 * k.r * Math.sin(w); return '<ellipse cx="' + gr(x) + '" cy="' + gr(y) + '" rx="' + (g ? 1.7 : 1.4) + '" ry="' + (g ? 1.05 : 0.9) + '" transform="rotate(' + Math.round(w * 180 / Math.PI + 90) + ' ' + gr(x) + ' ' + gr(y) + ')" fill="' + EICHE.blatt + '"/>'; }).join('');
      return o;
    }).join('');
    return {
      schatten: silhouette,
      form: umriss + buesche + c(mitte.x + 0.3, mitte.y + 0.3, g ? 1.8 : 1.2, '#6b573f')
    };
  }
  // Heuhaufen: ein runder Haufen von oben wie ein Strohdach: die Halme laufen vom Schopf nach außen, Licht links oben, Flanke rechts unten
  function heuTeile() {
    function blob(sx, dx, dy) {
      var pt = [];
      for (var i = 0; i < 36; i++) { var a = i * Math.PI / 18, R = (12.6 + 0.6 * Math.sin(7 * a + 0.5) + 0.35 * Math.sin(3 * a + 1.7)) * sx; pt.push(gr(18 + dx + R * Math.cos(a)) + ' ' + gr(18 + dy + R * Math.sin(a))); }
      return 'M' + pt.join('L') + 'Z';
    }
    var aussen = blob(1, 0, 0), dunkel = '', hell = '';
    for (var i = 0; i < 14; i++) {
      var w = i * Math.PI / 7 + 0.12, r1 = 3.6 + (i % 3) * 0.6, r2 = 10.4 - (i % 2) * 1.6, l = Math.cos(w + 3 * Math.PI / 4) > 0.2;
      var wm = w + 0.22, rm = (r1 + r2) / 2, d = 'M' + gr(18 + r1 * Math.cos(w)) + ' ' + gr(18 + r1 * Math.sin(w)) + 'Q' + gr(18 + rm * Math.cos(wm)) + ' ' + gr(18 + rm * Math.sin(wm)) + ' ' + gr(18 + r2 * Math.cos(w + 0.5)) + ' ' + gr(18 + r2 * Math.sin(w + 0.5));
      if (l) hell += d; else dunkel += d;
    }
    return {
      schatten: '<path d="' + aussen + '"/>',
      form: '<path d="' + aussen + '" fill="#a08547"/><path d="' + blob(0.9, -1, -1) + '" fill="#cbb068"/><path d="' + blob(0.5, -3.2, -3.2) + '" fill="#d9c47e"/>' +
        '<path d="' + dunkel + '" fill="none" stroke="#8f7440" stroke-width="1" stroke-linecap="round"/><path d="' + hell + '" fill="none" stroke="#efe2b0" stroke-width=".9" stroke-linecap="round"/>' +
        '<path d="' + aussen + '" fill="none" stroke="#3b3028" stroke-width="1.3" stroke-linejoin="round"/>' +
        '<circle cx="18" cy="18" r="2.8" fill="#b39a58" stroke="#6b5434" stroke-width=".9"/><path d="M16.6 18.6q1.4-2 3-1" fill="none" stroke="#6b5434" stroke-width=".8" stroke-linecap="round"/>'
    };
  }
  var BUSCH_BALLEN = [[13, 15, 7], [22, 13, 7], [24, 22, 7.5], [14, 23, 7]];
  function stoppeln() {
    var d = '';
    for (var i = 0; i < 9; i++) { var a = i * 2 * Math.PI / 9 + 0.3 + Math.PI / 9, x1 = 18 + 13.4 * Math.cos(a), y1 = 18 + 13.4 * Math.sin(a), x2 = 18 + 15.2 * Math.cos(a + 0.07), y2 = 18 + 15.2 * Math.sin(a + 0.07); d += 'M' + gr(x1) + ' ' + gr(y1) + 'L' + gr(x2) + ' ' + gr(y2); }
    return '<path d="' + d + '" stroke="#3e3528" stroke-width=".9" stroke-linecap="round"/>';
  }
  var GRASLAND = {
    id: 'grasland', nr: 4, name: 'Grasland', standard: 'wiese', status: 'fertig', weheName: 'Spreu und Laub',
    text: 'Das offene Land: Wiesen und Weiden, Feldwege, Hecken, Weiher und große Eichen, dazwischen Gehöfte. Draußen ist der Grund kurzes Gras mit Blumen und Klee; hohes Gras ist das schwierige Gelände. Der Weg des Sets ist der Feldweg aus festgefahrener Erde. Weiher und nasser Lehm bekommen ein Ufer aus Wiese; der nasse Lehm an der Tränke nimmt das Zeichen des Eises, denn er ist schwierig und glatt. Die Hohlwegwand ist der Fels des Sets, Erde unter einer Grasnarbe, und Erdstufen führen hinauf. Der Baum ist eine Eiche, zum ersten Mal ein Laubbaum in voller Größe; die Hecke ist Weißdorn und Schlehe, das Hindernis ein Heuhaufen. Das Wetter des Sets ist Laub, das auf allem liegt, was draußen steht; durch Lücken wehen Spreu und Laub herein. Die Tür ist die Standardtür.',
    rollen: [
      ['Grund', '#c5c892', 'Wiese, Ufer'], ['Grund dunkel', '#abb27b', 'hohes Gras; Halme #6b7843'], ['Zeichnung', '#7f8c4f', 'Halme; Klee #93a35c, Kahlstelle #cec295'], ['Licht', '#e2e4b9', 'Ufersaum, Rispen, Stufenkanten'],
      ['Fels', '#78744d', 'Hohlwegwand: Grasnarbe; Erde #5f4b33'], ['Wasser', '#5e897f', 'Weiher; Uferkante #3a5c52, Seerosen #7fa05a'], ['Eis', '#a6956f', 'nasser Lehm; Tritte #7d958f, Kante #6f5d43'], ['Grün', '#5e7b45', 'Eiche #45603a bis #c2d197; Hecke #7f9654'],
      ['Weg', '#cdb88c', 'Feldweg; Kante #927c57, Saum #dcdaa9, Spuren #ae966a'], ['Wetter', '#6b8a3d', 'Laub, dazu #b39d48, auf allem, was draußen steht'], ['Heu', '#cbb068', 'Heuhaufen; Flanke #a08547, Licht #efe2b0'], ['Blüten', '#f1ecdc', 'Gänseblümchen, Weißdorn, Seerose; Herz #c4a04a']
    ],
    ufer: { flaeche: '#c5c892', linie: '#e2e4b9' },
    weg: { wall: '#dcdaa9', band: '#cdb88c', kante: '#927c57', spuren: '#ae966a' },
    // Spreu und Laub drinnen: eine helle Zunge Spreu, Blätter und Halme
    wehe: {
      2: '<path d="M2 31C6 26 12 25 18 27S30 31 34 28V34H2Z" fill="#ddd2a2" opacity=".88"/><path d="M4 11C8 9 13 10 16 12C12 14 7 14 4 11Z" fill="#ddd2a2" opacity=".8"/>' + blatt(24, 17, 5, -30, LAUB[0]) + blatt(10, 21, 4.4, 40, LAUB[1]) +
        '<path d="M27 9l2.4-.6M20 21.5l2.2.8M8.5 27l2.4-.4M25 29l2-1" stroke="#efe5bd" stroke-width=".9" stroke-linecap="round"/>',
      1: '<path d="M6 27C10 24 15 25 17 28C13 30 9 30 6 27Z" fill="#ddd2a2" opacity=".8"/>' + blatt(24, 14, 4.4, 20, LAUB[0]) + '<path d="M11 10l2.2-.5M27 26l2-.6" stroke="#efe5bd" stroke-width=".9" stroke-linecap="round"/>'
    },
    // abgebranntes Gras um das Lagerfeuer, mit verkohlten Stoppeln zwischen den Steinen
    feuerring: '<path d="' + FEUER_RING + '" fill="#5b4c37" opacity=".46"/>' + stoppeln(),
    fels: { m: 7, h: 6, krone: '#78744d', licht: '#aaa67c', fuge: '#4a452f', front: '#5f4b33', frontFuge: '#3f3122', flanke: '#67623f' },
    // Wetter: Laub auf der Seite zum Licht, auf den gemeinsamen Dingen draußen (und drinnen unter einer Wehe)
    wetter: {
      fass: blatt(13.2, 12.6, 5.8, -30, LAUB[0]) + blatt(19.8, 10.8, 4.8, 25, LAUB[1]),
      kiste: blatt(12, 11.6, 5.8, -20, LAUB[0]) + blatt(18, 9.9, 4.6, 35, LAUB[1]),
      truhe: blatt(10.5, 5.3, 5.2, -15, LAUB[0]) + blatt(16, 4.5, 4.4, 30, LAUB[1]),
      stuhl: blatt(13.5, 14.6, 5, -25, LAUB[0]),
      hocker: blatt(15.6, 15, 4.8, -30, LAUB[0]),
      tisch: blatt(11, 10.6, 5.8, -20, LAUB[0]) + blatt(17, 9.6, 4.6, 30, LAUB[1]),
      bank: blatt(9.5, 15.6, 5, -15, LAUB[0]) + blatt(15, 14.8, 4.2, 40, LAUB[1])
    },
    muster: {
      wiese: { grund: '#c5c892', bilder: [
        halme(9, 14) + halme(25, 10, 0.9) + halme(16, 27, 1.1) + halme(29, 27, 0.8),
        bluemchen(10, 11) + bluemchen(25, 17, 0.9) + bluemchen(13, 26) + halme(27, 30, 0.9) + halme(21, 8, 0.8),
        '<path d="M13 18C14.5 15.4 19 15 22.5 16C26 17 26.4 20.6 23.6 22.3C20.6 24 15.6 23.8 13.6 21.8C12.6 20.8 12.4 19.2 13 18Z" fill="#cec295"/>' +
          '<ellipse cx="20.5" cy="19.2" rx="1.9" ry="1.4" transform="rotate(20 20.5 19.2)" fill="#9d957f"/><circle cx="20" cy="18.7" r=".6" fill="#d6d1c2"/><circle cx="15.6" cy="19.6" r=".7" fill="#ab9d74"/><circle cx="24" cy="20" r=".6" fill="#ab9d74"/>' + halme(8, 12, 0.8) + halme(29, 31, 0.85) + halme(27, 11, 0.7),
        '<g fill="#93a35c">' + kleeblatt(10, 11, 1, 0) + kleeblatt(14, 13.5, 0.9, 40) + kleeblatt(9, 16, 0.85, 80) + kleeblatt(24, 23, 1, 20) + kleeblatt(28, 26.5, 0.9, 60) + kleeblatt(23, 28, 0.85, 100) + '</g>' +
          '<g fill="#b3c07c">' + kleeblatt(13, 9, 0.8, 10) + kleeblatt(27.5, 22, 0.8, 50) + '</g>' +
          '<circle cx="25.5" cy="25" r="1.9" fill="#b8949f"/><circle cx="25" cy="24.4" r=".7" fill="#d9c2c7"/>' + halme(26, 11, 0.85) + halme(9, 30, 0.8)
      ], selten: '<path d="M13.5 22C13.5 18.6 16 16.6 18.8 16.8C21.8 17 23.6 19.2 23.3 22C23 24.4 20.8 25.6 18.4 25.4C15.6 25.2 13.5 24.4 13.5 22Z" fill="#927b5a"/><path d="M15.6 20.2C16.6 18.8 18.2 18.2 19.8 18.6" fill="none" stroke="#b39a76" stroke-width="1.1" stroke-linecap="round"/>' +
        '<g fill="#7d684b"><circle cx="17.4" cy="23" r=".8"/><circle cx="20.8" cy="22.2" r=".7"/><circle cx="11.6" cy="23.4" r=".8"/><circle cx="25.4" cy="20.6" r=".7"/><circle cx="24.4" cy="25.6" r=".7"/></g>' },
      hochgras: { grund: '#abb27b', bilder: [
        hochgras(5, 12.5) + hochgras(15.5, 10.5, 0.9) + hochgras(25, 13.5) + hochgras(9.5, 23.5, 0.85) + hochgras(20, 24) + hochgras(28, 22.5, 0.75) + hochgras(5, 33.5, 0.9) + hochgras(16, 34, 0.75) + hochgras(26, 33.5, 0.95)
      ] },
      lehm: { grund: '#a6956f', bilder: [
        '<path d="M19 21q5-4.4 10.4-1.2t1 6.6q-5 2.6-9.4.6t-2-6z" fill="#937f5c"/><path d="M6.5 22.5q3-2.6 6.6-1t.8 4.2q-3 1.6-6 .4t-1.4-3.6z" fill="#7d958f" stroke="#6f5d43" stroke-width=".8"/><path d="M8.6 22.6q1.6-.9 3.2-.2" fill="none" stroke="#d6e0d9" stroke-width=".9" stroke-linecap="round"/>' +
        tritt(11, 11.5, 20) + tritt(25, 24, -15) + tritt(24.5, 10, -35) +
        '<path d="M14 30.5q3.2-1.2 6.4 0" fill="none" stroke="#d2c9a8" stroke-width="1" stroke-linecap="round"/>'
      ] },
      weiher: { grund: '#5e897f', bilder: tiefwasser({ fleck: '#527c72', deckung: .8, farbe: '#a6c1b5', breite: 1.1, bogen: 1.8, zahl: 4, glanz: '#d2e1d8' }), selten: seerose(14.5, 15, 4.2, 40) + seerose(22, 22.5, 3.4, 200) + seerose(13, 23.5, 2.8, 300) + seerosenbluete(21.5, 13.5) },
      hohlweg: { grund: '#78744d', bilder: [
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7V13C29 12 23 11 15 13S5 14 0 13Z" fill="#858157"/><path d="M0 22C8 24 15 25 23 23S32 21 36 22V28C29 27 22 26 14 28S5 29 0 28Z" fill="#5f4b33"/>' +
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7M0 22C8 24 15 25 23 23S32 21 36 22" fill="none" stroke="#aaa67c" stroke-width="1" opacity=".7"/><path d="M12 16l2 4-1 3M26 3l-2 3M28 31l3 2M6 32l2-3" fill="none" stroke="#4a452f" stroke-width="1.1" stroke-linecap="round"/>'
      ] }
    },
    aufsatz: {
      erdstufen: '<rect x="4" y="4" width="28" height="7" fill="#dccda5"/><rect x="4" y="11" width="28" height="7" fill="#cdbb90"/><rect x="4" y="18" width="28" height="7" fill="#bda97c"/><rect x="4" y="25" width="28" height="7" fill="#ac976b"/><rect x="4" y="4" width="28" height="28" fill="none" stroke="#6f5a3e" stroke-width="1"/>' +
        '<path d="M5 5.6h26M5 12.9h26M5 19.9h26M5 26.9h26" stroke="#efe6c8" stroke-width="1" opacity=".85"/>' +
        [11, 18, 25].map(function (y) { return '<rect x="4.5" y="' + (y - 1.1) + '" width="27" height="2.2" rx="1.1" fill="#8a6a45" stroke="#5c4430" stroke-width=".8"/><circle cx="5.8" cy="' + y + '" r=".8" fill="#c2a37a"/>'; }).join(''),
      eiche: eicheTeile(1),
      eicheKrone: eicheTeile(2.1),
      hecke: {
        schatten: BUSCH_BALLEN.map(function (b) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + (b[2] + 0.9) + '"/>'; }).join(''),
        form: '<g fill="#3b3028">' + BUSCH_BALLEN.map(function (b) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + (b[2] + 0.9) + '"/>'; }).join('') + '</g>' +
          '<g fill="#7f9654">' + BUSCH_BALLEN.map(function (b) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '"/>'; }).join('') + '</g>' +
          '<g fill="#63793f"><circle cx="27" cy="25" r="4"/><circle cx="17" cy="26.5" r="3.4"/><circle cx="25.5" cy="15.5" r="3"/></g>' +
          '<g fill="#566c39"><circle cx="15.5" cy="19.5" r="1.2"/><circle cx="20.5" cy="17" r="1.1"/><circle cx="18.5" cy="22.5" r="1"/><circle cx="29" cy="22" r="1.1"/></g>' +
          '<path d="M8.6 12.4q2-2.6 5-2.2M17.6 8.8q2.2-2 5.2-1.4M8.8 21.4q1.6-2 4.2-1.8" fill="none" stroke="#b3c48a" stroke-width="1" stroke-linecap="round"/>' +
          bluemchen(11, 16.5, 0.62) + bluemchen(21, 10.5, 0.62) + bluemchen(28, 19.5, 0.58) + bluemchen(21, 26, 0.6) + bluemchen(12, 25.5, 0.55)
      },
      heuhaufen: heuTeile()
    },
    kacheln: [
      { gruppe: 'Draußen', code: '.', name: 'Wiese', art: 'Standard', muster: 'wiese', kosten: 'kostet 1', text: 'Kurzes Gras in vier Varianten: Halmbüschel, Gänseblümchen, eine kahle Stelle mit einem Kiesel, Kleeflecken mit einer Kleeblüte. Zu viert in einem Muster von 72 Einheiten, damit kein Feld wie sein Nachbar aussieht. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, hat ein Maulwurf einen Hügel aufgeworfen.' },
      { code: ':', name: 'Hohes Gras', art: 'schwieriges Gelände', muster: 'hochgras', kosten: 'kostet 2', text: 'Der Grund eine Stufe dunkler, dichte Büschel mit langen Halmen, die der Wind nach Osten legt, dazwischen helle Halme mit Rispe: derselbe Ton wie die Wiese, mehr und dunklere Zeichnung. Kniehoch; wer hindurch will, watet.' },
      { code: 'e', name: 'Feldweg', art: 'Weg', muster: 'wiese', weg: true, kosten: 'kostet 1', naht: ['.e..', '.ee.', '..e.', '..ee'], text: 'Festgefahrene Erde zwischen zwei Säumen aus trockenem Gras, darin Huf- und Radspuren. Dieselben fünf Formen und der Fleck wie in jedem Set; nur die Farben gehören dem Grasland.' },
      { code: 'i', name: 'Nasser Lehm', art: 'schwieriges Gelände, glatt', muster: 'lehm', rand: '#6f5d43', kosten: 'kostet 2', naht: ['....', '.ii.', '.iii', '..i.'], text: 'Lehm, den Regen und Vieh zu Brei getreten haben, an der Tränke, im Tor, in der Senke: nasse Flecken, Klauentritte mit Wasser darin, ein Glanz. Er nimmt das Zeichen des Eises, denn nasser Lehm ist glatt und rutscht unter dem Fuß weg; anders als im Schlamm der Kampfkarte (m) sinkt man nicht ein. Zur Wiese hin ein Ufer mit hellem Saum, aus Vierteln; zum Weiher hin kein Ufer.' },
      { code: '~', name: 'Weiher', art: 'tiefes Wasser, schwimmen', muster: 'weiher', rand: '#3a5c52', kosten: 'kostet 2', naht: ['....', '.~~.', '.~~~', '..~.'], proben: [[['~~~~~~', '~~~~~~', '~~~~~~', '~~~~~~'], 'große Fläche: Die Flecken laufen über die Felder', 216]], text: 'Stilles, grünliches Wasser mit tieferem Fleck, kurzen Kräuseln und einem Glanz. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, treiben Seerosen mit einer Blüte. An der Wiese ein Ufer mit dunkler Kante zum Wasser; zum nassen Lehm hin kein Ufer. Zu viert in einem Muster von 72 Einheiten; die Flecken laufen über die Felder, damit eine große Wasserfläche nicht stempelt.' },
      { gruppe: 'Höhe und Wände', code: '/', name: 'Erdstufen', art: 'Treppe, Rampe', muster: 'wiese', aufsatz: 'erdstufen', dreht: true, kosten: 'kostet 1, eine Stufe ohne Klettern', text: 'Vier Stufen aus festgetretener Erde, jede vorn mit einem Rundholz gefasst, nach oben heller wie die Ebenen der Karte, mit Lichtkante und dem Hirnholz links. Hinauf liegt bei 0° oben; auf der Karte zeigt die Höhe der Nachbarn die Richtung.' },
      { code: 'F', name: 'Hohlwegwand', art: 'Fels, gewachsen (neues Zeichen)', muster: 'hohlweg', kosten: 'gesperrt, ganzes Feld', text: 'Gewachsen, darum keine Mauer, sondern eine Abbruchkante von oben: Felstextur, die über die Felder durchläuft, an der höheren Seite die Lippe mit der angedeuteten oberen Ebene, an der tieferen der Fuß mit Boden und Geröll und ein Schlagschatten auf den tieferen Boden; an den Enden nur Textur, offene Enden und Außenecken gerundet. Welche Seite oben ist, sagen die Höhen der Karte. Nur tiefere Seiten, ein Feld dick: Plattform oder Rücken (Fläche und Schatten). Ab zwei Feldern Dicke überall Felstextur wie am Kartenrand. Nur höhere: ein Loch mit Lippen ringsum. Läuft über den Kartenrand weiter. Erde unter trockener Grasnarbe, wie sie ein Hohlweg in die Hochfläche schneidet.' },
      { gruppe: 'Umgebung', code: 'O', name: 'Eiche', art: 'Baum', muster: 'wiese', aufsatz: 'eiche', krone: 'eicheKrone', kosten: 'nicht betretbar, Dreiviertel-Deckung', text: 'Ein Laubbaum von oben: eine Krone aus Laubbüscheln, jeder mit Licht links oben und Schatten rechts unten, am Rand kleine Blattlappen und auf dem Licht die Blätter. Für sich allein (Band, Legende) ist sie auf ein Feld verkleinert, mit sieben Büscheln; auf der Karte ist sie gut 3 m breit, mit zwei Kränzen, und ragt halb über die acht Nachbarfelder. Gesperrt ist nur das Feld mit dem Stamm, darunter geht man hindurch, und die Krone gibt keine Deckung. Rund, darum dreht sie nicht.' },
      { code: 'd', name: 'Hecke', art: 'Busch, Dickicht', muster: 'wiese', aufsatz: 'hecke', kosten: 'kostet 2, schwieriges Gelände', text: 'Weißdorn und Schlehe: vier Ballen mit gemeinsamem Umriss, dunkle Laubtupfen im Inneren, helles Laub zum Licht und weiße Blüten. Kleiner und heller als die Eiche, damit man sie als betretbar liest; in einer Reihe gesetzt, wird daraus die Hecke am Feldrand.' },
      { code: 'x', name: 'Heuhaufen', art: 'Hindernis', muster: 'wiese', aufsatz: 'heuhaufen', kosten: 'nicht betretbar', text: 'Ein Heuhaufen von oben: eine weiche, runde Kuppel, Licht links oben, dunkle Flanke rechts unten, das Heu im Kreis gelegt wie ein Strohdach und oben der Schopf; Umriss in Tinte und der Schatten als versetzte Silhouette. Rund, darum dreht er nicht. Er brennt gut.' }
    ]
  };
  GRASLAND.nachCode = {};
  GRASLAND.kacheln.forEach(function (k) { GRASLAND.nachCode[k.code] = k; });


  // Set 5: Höhlen und Unterreich. Unter der Erde: Höhlenboden, Schutt, Sinter, schwarze Seen, Tropfsteine, Pilze; Fels ist hier Masse, Licht ist knapp.
  // Stein auf dem Höhlenboden: mit feinem Umriss und einer Lichtkante links oben
  function hstein(x, y, rx, ry, rot, farbe) {
    var t = ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"';
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '"' + t + ' fill="' + (farbe || '#958c7d') + '" stroke="#6b6357" stroke-width=".7"/>' +
      '<path d="M' + gr(x - rx * 0.6) + ' ' + gr(y - ry * 0.1) + 'q' + gr(rx * 0.3) + ' ' + gr(-ry * 0.6) + ' ' + gr(rx * 0.75) + ' ' + gr(-ry * 0.6) + '" fill="none" stroke="#c6beae" stroke-width=".8" stroke-linecap="round"' + t + '/>';
  }
  // Bruchstein (Schutt nach einem Einsturz): kantig, Licht links oben, Flanke rechts unten
  function bruch(pt, farbe) {
    var d = 'M' + pt.map(function (p) { return p[0] + ' ' + p[1]; }).join('L') + 'Z';
    var n = pt.length, cx = pt.reduce(function (s, p) { return s + p[0]; }, 0) / n, cy = pt.reduce(function (s, p) { return s + p[1]; }, 0) / n, hell = '', dunkel = '';
    for (var i = 0; i < n; i++) { var p1 = pt[i], p2 = pt[(i + 1) % n], mx = (p1[0] + p2[0]) / 2 - cx, my = (p1[1] + p2[1]) / 2 - cy, s = 'M' + p1[0] + ' ' + p1[1] + 'L' + p2[0] + ' ' + p2[1]; if (mx + my < -0.5) hell += s; else if (mx + my > 0.5) dunkel += s; }
    return '<path d="' + d + '" fill="' + farbe + '" stroke="#5f584d" stroke-width=".8" stroke-linejoin="round"/>' + (hell ? '<path d="' + hell + '" stroke="#c9c1b0" stroke-width=".9" stroke-linecap="round"/>' : '') + (dunkel ? '<path d="' + dunkel + '" stroke="#4f483e" stroke-width="1.2" stroke-linecap="round"/>' : '');
  }
  // Tropfwasser (Wetter des Sets): ein nasser Fleck und zwei Tropfen auf der Seite zum Licht
  function tropfen(x, y, s) {
    s = s || 1;
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + gr(4.2 * s) + '" ry="' + gr(2.6 * s) + '" transform="rotate(-25 ' + x + ' ' + y + ')" fill="#3e4a50" opacity=".32"/>' +
      '<circle cx="' + gr(x - 1.6 * s) + '" cy="' + gr(y - 0.6 * s) + '" r="' + gr(1.15 * s) + '" fill="#a9c1c7" stroke="#5d6f75" stroke-width=".5"/><circle cx="' + gr(x - 1.95 * s) + '" cy="' + gr(y - 0.95 * s) + '" r=".4" fill="#eef5f6"/>' +
      '<circle cx="' + gr(x + 2.2 * s) + '" cy="' + gr(y + 0.8 * s) + '" r="' + gr(0.8 * s) + '" fill="#a9c1c7" stroke="#5d6f75" stroke-width=".5"/>';
  }
  // Füllung der Felsmasse (Max, 1.11.: dunkle Textur): dieselben Brocken wie die Höhlenwand, dunkel und ohne Kontrast. Das Muster masse
  // entsteht aus felsTextur, sobald diese steht (vor SETLISTE); die Brocken laufen von der Wand in die Masse weiter.
  var MASSE_STIL = { front: '#3d3a35', krone: '#4a4640', frontFuge: '#2f2c28', licht: '#5d5952' };
  // Gelappter Umriss: eine geschlossene Form mit n Wülsten (Tropfstein, Pilzhut)
  function lappen(cx, cy, r, n, amp, phase) {
    var pt = [];
    for (var i = 0; i < 48; i++) { var a = i * 2 * Math.PI / 48, rr = r * (1 + amp * Math.cos(n * a + phase)); pt.push(gr(cx + rr * Math.cos(a)) + ' ' + gr(cy + rr * Math.sin(a))); }
    return 'M' + pt.join('L') + 'Z';
  }
  // Riesenpilz: ein Hut von oben, wie eine Baumkrone (Regel 8). Gekerbter Rand, Licht links oben, dunkle Flanke rechts unten,
  // helle Schuppen auf zwei oder drei Ringen, am Rand feine Rillen. f ist der Maßstab um die Feldmitte (1 für sich, 2,1 auf der Karte):
  // Mit ihm wachsen die Zahl der Kerben, Rillen und Schuppen, nicht die Strichstärke.
  var PILZ = { hut: '#857784', schatten: '#5f535c', licht: '#a091a0', schuppe: '#d6cdd1', rand: '#4f444b', mitte: '#b9abb6' };
  function pilzTeile(f) {
    var g = f > 1.5, R = 13.8 * f, n = g ? 26 : 14, amp = g ? 0.022 : 0.034;
    var hut = lappen(18, 18, R, n, amp, 0.3), o = [];
    o.push('<path d="' + hut + '" fill="' + PILZ.schatten + '"/>');
    o.push('<path d="' + lappen(18 - R * 0.05, 18 - R * 0.05, R * 0.93, n, amp, 0.3) + '" fill="' + PILZ.hut + '"/>');
    o.push('<circle cx="' + gr(18 - R * 0.3) + '" cy="' + gr(18 - R * 0.3) + '" r="' + gr(R * 0.42) + '" fill="' + PILZ.licht + '" opacity=".7"/>');
    // Rillen am Rand, wo der Hut dünn wird
    var rillen = '';
    for (var i = 0; i < n; i++) { var a = (i + 0.5) * 2 * Math.PI / n - 0.3 / n; rillen += 'M' + gr(18 + R * 0.8 * Math.cos(a)) + ' ' + gr(18 + R * 0.8 * Math.sin(a)) + 'L' + gr(18 + R * 0.95 * Math.cos(a)) + ' ' + gr(18 + R * 0.95 * Math.sin(a)); }
    o.push('<path d="' + rillen + '" stroke="' + PILZ.rand + '" stroke-width=".8" stroke-linecap="round" opacity=".55"/>');
    o.push('<circle cx="18" cy="18" r="' + gr(R * 0.66) + '" fill="none" stroke="' + PILZ.rand + '" stroke-width=".8" opacity=".35"/>');
    var ringe = g ? [[0.24, 5, 0.3], [0.45, 9, 0.1], [0.64, 13, 0.5]] : [[0.32, 4, 0.4], [0.6, 7, 0.1]];
    ringe.forEach(function (rg) {
      for (var i = 0; i < rg[1]; i++) {
        var a = rg[2] + i * 2 * Math.PI / rg[1], x = 18 + R * rg[0] * Math.cos(a), y = 18 + R * rg[0] * Math.sin(a), s = g ? 1.45 : 1.1;
        o.push('<path d="M' + gr(x - 1.4 * s) + ' ' + gr(y + 0.4 * s) + 'L' + gr(x - 0.2 * s) + ' ' + gr(y - 1 * s) + 'L' + gr(x + 1.4 * s) + ' ' + gr(y - 0.3 * s) + 'L' + gr(x + 0.4 * s) + ' ' + gr(y + 1 * s) + 'Z" fill="' + PILZ.schuppe + '" stroke="' + PILZ.rand + '" stroke-width=".5" stroke-linejoin="round" transform="rotate(' + Math.round(a * 180 / Math.PI) + ' ' + gr(x) + ' ' + gr(y) + ')"/>');
      }
    });
    o.push('<circle cx="18" cy="18" r="' + (g ? 2.6 : 1.8) + '" fill="' + PILZ.mitte + '" stroke="' + PILZ.rand + '" stroke-width=".7"/>');
    o.push('<path d="' + hut + '" fill="none" stroke="#3b3028" stroke-width="1.3" stroke-linejoin="round"/>');
    return { schatten: '<path d="' + hut + '"/>', form: o.join('') };
  }
  // Leuchtpilze: ein Büschel kleiner Hüte, kalt leuchtend, um sie ein Schein in zwei Stufen (kein Verlauf). Jeder Hut mit dunklem Buckel
  // und einem Lichtbogen links oben; die großen hinten, die kleinen vorn.
  var LEUCHT = { hut: '#8cc6ba', licht: '#dcf3ee', rand: '#3c6a62', buckel: '#5e9e91', schein: '#bfe8df' };
  var LEUCHT_HUETE = [[21.5, 12, 3.8], [13, 13.5, 4.4], [24, 21, 4.8], [18.5, 18.5, 2.8], [13.5, 23, 3.6], [27.8, 14.8, 2.4], [8.8, 18.8, 2.3], [19, 27, 2.1]];
  function leuchtTeile() {
    return {
      schatten: LEUCHT_HUETE.map(function (h) { return '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="' + h[2] + '"/>'; }).join(''),
      form: '<circle cx="18" cy="18" r="15.6" fill="' + LEUCHT.schein + '" opacity=".14"/><circle cx="18" cy="18" r="11.6" fill="' + LEUCHT.schein + '" opacity=".2"/>' +
        LEUCHT_HUETE.map(function (h) {
          var r = h[2];
          return '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="' + r + '" fill="' + LEUCHT.hut + '" stroke="' + LEUCHT.rand + '" stroke-width=".9"/>' +
            '<path d="M' + gr(h[0] - r * 0.7) + ' ' + gr(h[1] - r * 0.05) + 'A' + gr(r * 0.72) + ' ' + gr(r * 0.72) + ' 0 0 1 ' + gr(h[0] - r * 0.05) + ' ' + gr(h[1] - r * 0.7) + '" fill="none" stroke="' + LEUCHT.licht + '" stroke-width="' + (r > 3 ? 1.1 : 0.9) + '" stroke-linecap="round"/>' +
            '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="' + gr(Math.max(0.6, r * 0.24)) + '" fill="' + LEUCHT.buckel + '"/>';
        }).join('')
    };
  }
  // Stalagmit: ein Tropfstein von oben: ein gelappter Fuß aus Tropfwülsten, Ringe nach oben heller, die Spitze leicht zum Licht verschoben,
  // Rippen, wo das Wasser herabläuft, dunkle Flanke rechts unten; daneben ein junger
  function stalagTeile() {
    var fuss = lappen(18.4, 17.8, 12.4, 7, 0.07, 0.4), klein = lappen(8.4, 28.8, 3.9, 5, 0.09, 0.2);
    function kegel(cx, cy, r, ringe) { return ringe.map(function (q, i) { return '<circle cx="' + gr(cx - (i + 1) * r * 0.06) + '" cy="' + gr(cy - (i + 1) * r * 0.06) + '" r="' + gr(r * q[0]) + '" fill="' + q[1] + '"/>'; }).join(''); }
    var rippen = '';
    for (var i = 0; i < 7; i++) { var w = 0.4 / 7 + i * 2 * Math.PI / 7 + Math.PI / 7; rippen += 'M' + gr(18.4 + 5.4 * Math.cos(w)) + ' ' + gr(17.8 + 5.4 * Math.sin(w)) + 'L' + gr(18.4 + 10.6 * Math.cos(w + 0.08)) + ' ' + gr(17.8 + 10.6 * Math.sin(w + 0.08)); }
    return {
      schatten: '<path d="' + fuss + '"/><path d="' + klein + '"/>',
      form: '<path d="' + fuss + '" fill="#7b705d"/><path d="' + lappen(17.6, 17, 11.6, 7, 0.07, 0.4) + '" fill="#9a8f7b"/>' +
        '<path d="' + rippen + '" stroke="#857a67" stroke-width="1" stroke-linecap="round"/>' +
        kegel(18.4, 17.8, 12.4, [[0.66, '#a99e89'], [0.46, '#b7ac97'], [0.28, '#c6bca8'], [0.12, '#d6cdbb']]) +
        '<path d="' + fuss + '" fill="none" stroke="#3b3028" stroke-width="1.3" stroke-linejoin="round"/>' +
        '<path d="' + klein + '" fill="#9a8f7b" stroke="#3b3028" stroke-width="1.1" stroke-linejoin="round"/>' + kegel(8.4, 28.8, 3.9, [[0.58, '#b2a792'], [0.26, '#d0c7b5']])
    };
  }
  // Ruß um das Lagerfeuer: ein dunkler Fleck und Rußfahnen zwischen den Steinen
  function russ() {
    var d = '';
    for (var i = 0; i < 9; i++) { var a = i * 2 * Math.PI / 9 + 0.3 + Math.PI / 9, x1 = 18 + 13.2 * Math.cos(a), y1 = 18 + 13.2 * Math.sin(a), x2 = 18 + 15.4 * Math.cos(a + 0.05), y2 = 18 + 15.4 * Math.sin(a + 0.05); d += 'M' + gr(x1) + ' ' + gr(y1) + 'L' + gr(x2) + ' ' + gr(y2); }
    return '<path d="' + d + '" stroke="#2b2622" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>';
  }
  var UNTERREICH = {
    id: 'unterreich', nr: 5, name: 'Höhlen und Unterreich', standard: 'hoehle', status: 'fertig', weheName: 'Gesteinsmehl und Fledermausdreck',
    text: 'Unter der Erde: Höhlen, Gänge und Hallen, schwarze Seen, Tropfsteine und die Pilzwälder des Unterreichs. Draußen heißt hier: auf dem Höhlenboden, Fels mit Staub, Kies, Pfützen und Flechten; Schutt nach einem Einsturz ist das schwierige Gelände. Fels ist in diesem Set nicht Kante, sondern Masse: Die Höhlenwand reicht bis zur Decke, die Abbruchkante liegt nur am Höhlenboden, das Innere ist dunkle Textur. Der Weg ist ein Trampelpfad, Sinter ist glatt, der See schwarz und still, die Stufen sind in den Fels gehauen. Der Baum des Sets ist ein Riesenpilz, das Dickicht ein Büschel Leuchtpilze mit kaltem Licht, das Hindernis ein Stalagmit. Das Wetter ist Tropfwasser; durch Lücken kommen Gesteinsmehl und Fledermausdreck. Unter der Erde ist es dunkel: Im Kampf sieht die Figur nur, was im Licht liegt oder in ihrer Dunkelsicht. Die Tür ist die Standardtür.',
    rollen: [
      ['Grund', '#aca393', 'Höhlenboden, Ufer'], ['Grund dunkel', '#968d7e', 'Schutt; Bruchstein #857c6d, #b1a998'], ['Zeichnung', '#7c7466', 'Risse; Steine #958c7d, Flechten #a6ae8c'], ['Licht', '#cbc3b2', 'Ufersaum, Stufenkanten'],
      ['Fels', '#6f6a60', 'Höhlenwand: Brocken; Grund #504b44, Fugen #37332e, Lippe #8e887c'], ['Masse', '#4a4640', 'das Innere: Brocken auf #3d3a35, Licht #5d5952'], ['Wasser', '#3a4a52', 'unterirdischer See; Uferkante #222f35'], ['Eis', '#cdc4ae', 'Sinter; Becken #ae9f82, Kante #9b8c6f'],
      ['Grün', '#857784', 'Riesenpilz; Flanke #5f535c, Schuppen #d6cdd1'], ['Leuchten', '#8cc6ba', 'Leuchtpilze; Schein #bfe8df; kaltes Licht #a9e2d6'], ['Weg', '#c5bdab', 'Trampelpfad; Kante #857d6e, Saum #bfb7a6, Spuren #a39a89'], ['Wetter', '#a9c1c7', 'Tropfwasser, nasser Fleck #3e4a50']
    ],
    ufer: { flaeche: '#aca393', linie: '#cbc3b2' },
    weg: { wall: '#bfb7a6', band: '#c5bdab', kante: '#857d6e', spuren: '#a39a89' },
    // Gesteinsmehl und Fledermausdreck drinnen: eine helle Zunge Staub, dunkle Krumen, ein paar Steinchen
    wehe: {
      2: '<path d="M2 31C6 26 12 25 18 27S30 31 34 28V34H2Z" fill="#cfc8b8" opacity=".85"/><path d="M4 11C8 9 13 10 16 12C12 14 7 14 4 11Z" fill="#cfc8b8" opacity=".75"/>' +
        '<g fill="#40382f"><circle cx="24" cy="17" r="1"/><circle cx="26.5" cy="19" r=".8"/><circle cx="22" cy="20" r=".7"/><circle cx="10" cy="22" r=".8"/></g>' + hstein(28, 9, 1.6, 1.2, 20) + hstein(9.5, 26, 1.4, 1, -10),
      1: '<path d="M6 27C10 24 15 25 17 28C13 30 9 30 6 27Z" fill="#cfc8b8" opacity=".75"/><g fill="#40382f"><circle cx="24" cy="14" r=".9"/><circle cx="26" cy="16" r=".7"/><circle cx="12" cy="10" r=".7"/></g>'
    },
    // Ruß um das Lagerfeuer
    feuerring: '<path d="' + FEUER_RING + '" fill="#2d2925" opacity=".42"/>' + russ(),
    // Höhlenwand; masse: Fels reicht bis zur Decke (Regel 19, Felsmasse), lippe: die Kante zur Masse
    fels: { m: 7, h: 6, krone: '#6f6a60', licht: '#9b9588', fuge: '#37332e', front: '#504b44', frontFuge: '#37332e', flanke: '#5b564e', masse: { lippe: '#8e887c' } },
    // Wetter: Tropfwasser auf der Seite zum Licht, auf den gemeinsamen Dingen im Höhlenraum (drinnen nur unter einer Wehe)
    wetter: {
      fass: tropfen(14, 13), kiste: tropfen(13, 12), truhe: tropfen(12, 6, 0.85), stuhl: tropfen(14, 15, 0.85),
      hocker: tropfen(16, 15.5, 0.8), tisch: tropfen(12, 11), bank: tropfen(11, 16, 0.85)
    },
    muster: {
      hoehle: { grund: '#aca393', bilder: [
        '<path d="M8 10L15 6.5 22 8 24 14 19 18 10 17Z" fill="#b8b0a1"/><path d="M22 8L24 14 19 18 10 17" fill="none" stroke="#867e70" stroke-width="1" stroke-linejoin="round"/><path d="M20 25l3-2.5 3 1.5 3.4-3" fill="none" stroke="#7c7466" stroke-width=".9" stroke-linecap="round"/>' + hstein(9.5, 27, 2.4, 1.7, 20) + '<circle cx="29" cy="11" r=".8" fill="#7c7466"/>',
        hstein(9, 10, 2, 1.5, 15) + hstein(14.5, 13.5, 1.4, 1.1, -20) + hstein(25, 9, 2.3, 1.6, 30) + hstein(21, 25, 2.6, 1.8, -10) + hstein(9.5, 26.5, 1.6, 1.2, 40) + '<g fill="#7c7466"><circle cx="17" cy="21" r=".7"/><circle cx="28" cy="18" r=".8"/></g>',
        '<path d="M13.5 19C14.6 15.6 20.6 15 24.4 17.1C27.6 18.9 26.6 22.6 22.6 23.4C18 24.3 13 22.6 13.5 19Z" fill="#8a9595" stroke="#646e6c" stroke-width=".8"/><path d="M16.6 18.2q2.4-1.3 4.9-.7" fill="none" stroke="#dfe7e6" stroke-width=".9" stroke-linecap="round"/>' + hstein(8.5, 10, 2.2, 1.6, -15) + '<path d="M26 6.5l2.5 2-1 3" fill="none" stroke="#7c7466" stroke-width=".9" stroke-linecap="round"/><circle cx="9" cy="28" r=".8" fill="#7c7466"/>',
        '<g fill="#a6ae8c" stroke="#7f8669" stroke-width=".6"><circle cx="11" cy="12" r="2.4"/><circle cx="13.6" cy="10.2" r="1.8"/><circle cx="9.3" cy="14.4" r="1.5"/><circle cx="24.5" cy="24" r="2.2"/><circle cx="26.8" cy="25.8" r="1.6"/></g><g fill="#c3c9ab"><circle cx="10.4" cy="11.4" r=".8"/><circle cx="24" cy="23.4" r=".7"/></g>' +
          '<path d="M21 8l3 1.5 1.5 3.2" fill="none" stroke="#7c7466" stroke-width=".9" stroke-linecap="round"/>' + hstein(12, 27, 1.8, 1.3, 25)
      ], selten: '<path d="M12.5 22C12.6 18.4 15.8 16.6 19 16.8C22.4 17 24.8 19.4 24.2 22.4C23.6 25 20.6 26.2 17.6 26C14.6 25.8 12.4 24.8 12.5 22Z" fill="#5c5248"/><path d="M14.8 20.4C15.8 19 17.4 18.4 19 18.6" fill="none" stroke="#7a6d5f" stroke-width="1" stroke-linecap="round"/>' +
        '<g fill="#3d352d"><circle cx="17" cy="22.6" r=".8"/><circle cx="21" cy="21.4" r=".7"/><circle cx="10.6" cy="23.4" r=".7"/><circle cx="26" cy="20.6" r=".7"/></g><g fill="#d4ccbb"><circle cx="19.4" cy="23.6" r=".55"/><circle cx="15.6" cy="21" r=".5"/></g>' },
      schutt: { grund: '#968d7e', bilder: [
        bruch([[4, 7], [10, 4.5], [13, 9], [9, 13], [4.5, 11.5]], '#857c6d') + bruch([[16, 5], [23, 4], [25, 9.5], [19.5, 12]], '#a69d8c') + bruch([[27, 11], [32.5, 9.5], [33.5, 16], [28, 17.5]], '#b1a998') +
        bruch([[8, 17], [15, 15.5], [17, 21], [12, 24.5], [6.5, 22]], '#a69d8c') + bruch([[19, 16], [25, 14.5], [27.5, 20], [22, 23.5]], '#857c6d') +
        bruch([[4, 27], [9, 25], [12, 30], [7, 33]], '#b1a998') + bruch([[15, 27], [21, 25.5], [23, 31.5], [16.5, 33]], '#857c6d') + bruch([[25.5, 25], [32, 23.5], [33.5, 29.5], [27, 32]], '#a69d8c') +
        '<path d="M14 13l1.5 1.6M24 13l1.5-.8M5 24l1.6-.4M25 33l1.4-.6" stroke="#5f584d" stroke-width="1" stroke-linecap="round"/>'
      ] },
      see: { grund: '#3a4a52', bilder: tiefwasser({ fleck: '#2f3e45', deckung: .85, farbe: '#5d7480', breite: 1, bogen: 1.6, zahl: 3, glanz: '#8ea4ac' }), selten: '<circle cx="18" cy="18" r="2" fill="none" stroke="#7d949d" stroke-width=".9"/><circle cx="18" cy="18" r="5" fill="none" stroke="#6a818a" stroke-width=".9"/><circle cx="18" cy="18" r="8.4" fill="none" stroke="#5a6f78" stroke-width=".8" opacity=".8"/>' },
      sinter: { grund: '#cdc4ae', bilder: [
        '<path d="M0 9C5 11.5 10 7 16 9.5S27 12.5 36 9" fill="none" stroke="#ae9f82" stroke-width="1.4"/><path d="M0 7.8C5 10.3 10 5.8 16 8.3S27 11.3 36 7.8" fill="none" stroke="#ece5d4" stroke-width=".9"/>' +
        '<path d="M0 22C6 24 11 20 18 22.5S29 25 36 22" fill="none" stroke="#ae9f82" stroke-width="1.4"/><path d="M0 20.8C6 22.8 11 18.8 18 21.3S29 23.8 36 20.8" fill="none" stroke="#ece5d4" stroke-width=".9"/>' +
        '<path d="M7 14C9 12.4 14 12.6 16 14.2C14 15.8 9 15.8 7 14Z" fill="#b5c2bc" stroke="#9c8f74" stroke-width=".7"/><path d="M21 28C23.5 26.2 28.5 26.4 30.5 28C28.5 29.8 23.5 29.8 21 28Z" fill="#b5c2bc" stroke="#9c8f74" stroke-width=".7"/><path d="M9 13.6l3-.6M23.5 27.6l3-.6" stroke="#eef3f0" stroke-width=".8" stroke-linecap="round"/>'
      ] },
      hoehlenwand: { grund: '#504b44', bilder: [
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7V13C29 12 23 11 15 13S5 14 0 13Z" fill="#6f6a60"/><path d="M0 22C8 24 15 25 23 23S32 21 36 22V28C29 27 22 26 14 28S5 29 0 28Z" fill="#6f6a60"/>' +
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7M0 22C8 24 15 25 23 23S32 21 36 22" fill="none" stroke="#9b9588" stroke-width="1" opacity=".7"/><path d="M12 16l2 4-1 3M26 3l-2 3M28 31l3 2M6 32l2-3" fill="none" stroke="#37332e" stroke-width="1.1" stroke-linecap="round"/>'
      ] }
    },
    aufsatz: {
      hoehlenstufen: '<rect x="4" y="4" width="28" height="7" fill="#cbc4b4"/><rect x="4" y="11" width="28" height="7" fill="#bab3a3"/><rect x="4" y="18" width="28" height="7" fill="#a9a292"/><rect x="4" y="25" width="28" height="7" fill="#999282"/><rect x="4" y="4" width="28" height="28" fill="none" stroke="#5c564c" stroke-width="1"/>' +
        '<path d="M4 11H32M4 18H32M4 25H32" stroke="#5c564c" stroke-width="1.6"/><path d="M5 5.6h26M5 12.6h26M5 19.6h26M5 26.6h26" stroke="#e0dacd" stroke-width="1" opacity=".9"/>' +
        '<path d="M9 7.5l2 1.6M20 8l2 1.4M14 14.6l2 1.4M25 15l2 1.6M10 21.6l2 1.4M22 21.8l2 1.5M16 28.6l2 1.4M27 28.4l2 1.5" stroke="#857e70" stroke-width=".9" stroke-linecap="round"/>',
      riesenpilz: pilzTeile(1),
      riesenpilzKrone: pilzTeile(2.1),
      leuchtpilze: leuchtTeile(),
      stalagmit: stalagTeile()
    },
    kacheln: [
      { gruppe: 'Draußen', code: '.', name: 'Höhlenboden', art: 'Standard', muster: 'hoehle', kosten: 'kostet 1', text: 'Fels mit Staub in vier Varianten: eine Platte mit Riss, Kies, eine Pfütze unter einer Tropfstelle, Flechten. Zu viert in einem Muster von 72 Einheiten, damit kein Feld wie sein Nachbar aussieht. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, liegt ein Haufen Fledermausdreck.' },
      { code: ':', name: 'Schutt', art: 'schwieriges Gelände', muster: 'schutt', kosten: 'kostet 2', text: 'Bruchstein nach einem Einsturz: kantige Brocken in drei Tönen, Lichtkante links oben, dunkle Flanke rechts unten, dazwischen Lücken. Derselbe Ton wie der Höhlenboden, eine Stufe dunkler, mehr Zeichnung. Wer hier läuft, sucht jeden Tritt.' },
      { code: 'e', name: 'Trampelpfad', art: 'Weg', muster: 'hoehle', weg: true, kosten: 'kostet 1', naht: ['.e..', '.ee.', '..e.', '..ee'], text: 'Ausgetretener Fels zwischen Säumen aus Staub, darin Trittspuren, wo seit Jahren dieselben Leute gehen. Dieselben fünf Formen und der Fleck wie in jedem Set; nur die Farben gehören der Höhle.' },
      { code: 'i', name: 'Sinter', art: 'schwieriges Gelände, glatt', muster: 'sinter', rand: '#9b8c6f', kosten: 'kostet 2', naht: ['....', '.ii.', '.iii', '..i.'], text: 'Nasser Sinter, wo Wasser über den Fels rinnt: helle Sinterbecken, deren Ränder als Lauf über die Felder gehen, darin kleine Becken voll Wasser. Er nimmt das Zeichen des Eises, denn er ist glatt. Zum Höhlenboden hin ein Ufer mit hellem Saum, aus Vierteln; zum See hin keins.' },
      { code: '~', name: 'Unterirdischer See', art: 'tiefes Wasser, schwimmen', muster: 'see', rand: '#222f35', kosten: 'kostet 2', naht: ['....', '.~~.', '.~~~', '..~.'], proben: [[['~~~~~~', '~~~~~~', '~~~~~~', '~~~~~~'], 'große Fläche: Die Flecken laufen über die Felder', 216]], text: 'Schwarzes, stilles Wasser mit tieferem Fleck und wenigen Kräuseln. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, zieht ein Tropfen von der Decke Ringe. Am Höhlenboden ein Ufer mit dunkler Kante zum Wasser; zum Sinter hin keins. Zu viert in einem Muster von 72 Einheiten; die Flecken laufen über die Felder, damit eine große Wasserfläche nicht stempelt.' },
      { gruppe: 'Höhe und Wände', code: '/', name: 'Felsstufen', art: 'Treppe, Rampe', muster: 'hoehle', aufsatz: 'hoehlenstufen', dreht: true, kosten: 'kostet 1, eine Stufe ohne Klettern', text: 'In den Fels gehauene Stufen mit Meißelspuren, nach oben heller wie die Ebenen der Karte, mit Lichtkante, dunkler Stufenlinie und dem Schattenkeil. Hinauf liegt bei 0° oben; auf der Karte zeigt die Höhe der Nachbarn die Richtung.' },
      { code: 'F', name: 'Höhlenwand', art: 'Fels, Masse bis zur Decke', muster: 'hoehlenwand', kosten: 'gesperrt, ganzes Feld', naht: ['FFFFFF', 'FFF..F', 'F....F', 'F.F..F', 'FFFFFF'], text: 'Fels, der bis zur Decke reicht. Am Höhlenboden die Abbruchkante wie in jedem Set: Felstextur, die über die Felder läuft, unten der Fuß mit Geröll und ein Schatten auf den Boden. Zum Inneren hin endet die Wand an einer Lippe; dahinter liegt die Masse, dieselben Brocken, dunkel und ohne Kontrast. Darum gibt es hier keine Plattform und keinen Rücken: Frei stehender Fels ist ein Pfeiler mit Fuß ringsum. Eine Galerie ist Boden mit Höhe und Steinrand, ein Schacht ein einzelnes Felsfeld, tiefer als seine vier Nachbarn.' },
      { gruppe: 'Umgebung', code: 'O', name: 'Riesenpilz', art: 'Baum', muster: 'hoehle', aufsatz: 'riesenpilz', krone: 'riesenpilzKrone', kosten: 'nicht betretbar, Dreiviertel-Deckung', text: 'Ein Pilz so hoch wie ein Baum, von oben: der Hut mit gekerbtem Rand, Licht links oben, dunkler Flanke, hellen Schuppen und feinen Rillen am Rand. Für sich allein ist er auf ein Feld verkleinert; auf der Karte ist der Hut gut 3 m breit und ragt halb über die Nachbarfelder wie eine Baumkrone. Gesperrt ist nur das Feld mit dem Stiel, unter dem Hut geht man hindurch, und er gibt keine Deckung. Er endet an Mauer, Tür und Fels, denn der Fels reicht bis zur Decke. Rund, darum dreht er nicht.' },
      { code: 'd', name: 'Leuchtpilze', art: 'Dickicht, leuchtet', muster: 'hoehle', aufsatz: 'leuchtpilze', leuchtet: { hell: 0, daemmer: 2 }, kosten: 'kostet 2, schwieriges Gelände; dämmriges Licht bis 3 m', text: 'Ein Büschel kleiner Pilze mit kalt leuchtenden Hüten, jeder mit dunklem Buckel und einem Lichtbogen, um sie ein Schein in zwei Stufen. Sie geben dämmriges Licht bis 3 m, kalt, nie Orange oder Gelb: Im Dunkeln sieht man, was bei ihnen steht. Kleiner und heller als der Riesenpilz, damit man sie als betretbar liest.' },
      { code: 'x', name: 'Stalagmit', art: 'Hindernis', muster: 'hoehle', aufsatz: 'stalagmit', kosten: 'nicht betretbar', text: 'Ein Tropfstein, von unten gewachsen, von oben ein Kegel: der Fuß gelappt aus Tropfwülsten, Ringe nach oben heller, Rippen, wo das Wasser herabläuft, dunkle Flanke rechts unten, daneben ein junger. Umriss in Tinte und der Schatten als versetzte Silhouette. Rund, darum dreht er nicht.' }
    ]
  };
  UNTERREICH.nachCode = {};
  UNTERREICH.kacheln.forEach(function (k) { UNTERREICH.nachCode[k.code] = k; });

  // Set 6: Sumpf. Zwischen Land und Wasser: Sumpfboden, Ried und Bulten, Morast, seichtes und tiefes Wasser, der Knüppeldamm,
  // Bulteninseln mit Torfkanten, Sumpfzypressen, Sumpfmyrte, umgestürzte Stämme; über allem oft Nebel.
  // Segge: ein kleiner Horst aus spitzen Blättern, der Fuß bei (x, y)
  function segge(x, y, s, farbe) {
    s = s || 1;
    return '<path d="' + [[-3.1, -3.1], [-1.5, -4.4], [0.2, -5], [1.8, -4.3], [3.2, -2.9]].map(function (b) { return 'M' + x + ' ' + y + 'l' + gr(b[0] * s) + ' ' + gr(b[1] * s); }).join('') + '" fill="none" stroke="' + (farbe || '#6c7642') + '" stroke-width="1" stroke-linecap="round"/>';
  }
  // Lache: Wasser in einer Mulde, dunkle Kante, ein Glanz links oben
  function lache(x, y, rx, ry, rot) {
    var t = ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"';
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '"' + t + ' fill="#7c8f86" stroke="#5a6a5e" stroke-width=".8"/>' +
      '<path d="M' + gr(x - rx * 0.55) + ' ' + gr(y - ry * 0.25) + 'q' + gr(rx * 0.3) + ' ' + gr(-ry * 0.5) + ' ' + gr(rx * 0.75) + ' ' + gr(-ry * 0.45) + '" fill="none" stroke="#d3dcd2" stroke-width=".9" stroke-linecap="round"' + t + '/>';
  }
  // Moos: ein Polster mit hellen Köpfchen
  function moos(x, y, r) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r + '" ry="' + gr(r * 0.72) + '" fill="#959f63"/><g fill="#c1c792"><circle cx="' + gr(x - r * 0.35) + '" cy="' + gr(y - r * 0.2) + '" r=".75"/><circle cx="' + gr(x + r * 0.3) + '" cy="' + gr(y - r * 0.1) + '" r=".7"/><circle cx="' + gr(x) + '" cy="' + gr(y + r * 0.3) + '" r=".65"/></g>';
  }
  // Stiefeltritt, in dem Wasser steht
  function stiefel(x, y, rot) {
    return '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')" fill="#7c8f86" stroke="#5c5a44" stroke-width=".7"><path d="M' + x + ' ' + gr(y - 3.4) + 'c1.6 0 2.1 1.4 1.9 2.8s-.6 1.8-1.9 1.8-2-.6-2-1.9.4-2.7 2-2.7z"/><ellipse cx="' + x + '" cy="' + gr(y + 2.7) + '" rx="1.3" ry="1.1"/></g>';
  }
  // Bulte: ein Seggenhorst, aus dem nassen Grund gewachsen: ein Polster mit gewelltem Rand, Schatten rechts unten,
  // am Rand die überhängenden Blätter, zum Licht hell
  function bulte(x, y, r) {
    var d = '', h = '';
    for (var i = 0; i < 10; i++) {
      var a = i * Math.PI / 5 + 0.3, r0 = r * 0.45, r1 = r * (i % 2 ? 1.1 : 1.2), w = i % 2 ? 0.3 : -0.3, b = a + w;
      var s = 'M' + gr(x + r0 * Math.cos(a)) + ' ' + gr(y + r0 * Math.sin(a)) + 'Q' + gr(x + r * 0.95 * Math.cos(b)) + ' ' + gr(y + r * 0.95 * Math.sin(b)) + ' ' + gr(x + r1 * Math.cos(a + w * 0.55)) + ' ' + gr(y + r1 * Math.sin(a + w * 0.55));
      if (Math.cos(a + 3 * Math.PI / 4) > -0.1) h += s; else d += s;
    }
    return '<path d="' + wolke(gr(x + 0.9), gr(y + 0.9), r, 9, 0.2) + '" fill="#5a6332"/><path d="' + wolke(x, y, gr(r * 0.92), 9, 0.5) + '" fill="#79844c"/>' +
      '<path d="' + d + '" fill="none" stroke="#4f5a2c" stroke-width="1" stroke-linecap="round"/><path d="' + h + '" fill="none" stroke="#c4c891" stroke-width="1" stroke-linecap="round"/>';
  }
  // Blase im Morast
  function blase(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#7d6f50" stroke="#b5a984" stroke-width=".8"/>'; }
  // Wollgras (seltenes Detail): drei weiße Schöpfe auf Halmen
  function wollgras(x, y) {
    var k = [[gr(x - 3.2), gr(y + 0.6)], [gr(x + 0.2), gr(y - 1.4)], [gr(x + 3.4), gr(y + 0.4)]];
    return '<path d="' + k.map(function (p) { return 'M' + x + ' ' + (y + 6) + 'L' + p[0] + ' ' + p[1]; }).join('') + 'M' + x + ' ' + (y + 6) + 'l-3-2.2M' + x + ' ' + (y + 6) + 'l2.8-1.6" fill="none" stroke="#7a8350" stroke-width=".9" stroke-linecap="round"/>' +
      k.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.9" fill="#f1ecdc" stroke="#b5b096" stroke-width=".6"/>'; }).join('');
  }
  // Entengrütze (seltenes Detail im tiefen Wasser): viele kleine Blättchen
  function entengruetze() {
    var p = [[12, 13], [14.4, 11.6], [16.6, 13.8], [13, 16.2], [15.4, 17.4], [18.4, 15.2], [17.4, 11.8], [20.4, 13], [19.4, 17.6], [21.6, 16], [23.4, 18.4], [22.4, 21.2], [20.2, 20.4], [17.8, 19.8], [16, 21.4], [24.4, 14.8], [11, 18.6], [14, 19.8], [25.2, 21.8], [12.4, 21.4]];
    return p.map(function (q, i) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (i % 3 ? 0.95 : 1.2) + '" fill="' + (i % 4 ? '#9fb35c' : '#7f9a48') + '"/>'; }).join('') + '<g fill="#cfdc9c"><circle cx="13.6" cy="12.6" r=".4"/><circle cx="19.6" cy="12.6" r=".4"/><circle cx="15" cy="16.8" r=".4"/><circle cx="22" cy="15.6" r=".4"/></g>';
  }
  // Knüppeldamm: quer gelegte Stämme (hier waagrecht), jeder mit Licht oben und dunkler Unterseite, Rinde, Ästen und Moos;
  // dazwischen dunkler Grund. Die Stämme laufen über den Rand weiter, die Lücke an der Naht ist so breit wie die anderen.
  function knueppel() {
    var f = ['#8b7553', '#7e6a4b', '#947d59', '#836e4e', '#8a7452'], o = '';
    for (var i = 0; i < 5; i++) {
      var y0 = gr(0.4 + i * 7.2);
      o += '<rect x="0" y="' + y0 + '" width="36" height="6.4" fill="' + f[i] + '"/><path d="M0 ' + gr(y0 + 1.1) + 'H36" stroke="#b39d75" stroke-width=".9" opacity=".85"/><path d="M0 ' + gr(y0 + 5.7) + 'H36" stroke="#5c4a35" stroke-width="1.3"/>';
    }
    return o + '<path d="M5 3.4h4M20 2.8h3M13 10.6h5M27 11.2h3M4 18h3M17 17.6h4M9 25.4h4M25 24.8h4M6 32.4h3M19 32h4M29 32.6h3" stroke="#6b573d" stroke-width=".9" stroke-linecap="round"/>' +
      '<g fill="#5f4c36"><ellipse cx="25" cy="3.8" rx="1.2" ry=".9"/><ellipse cx="8" cy="11" rx="1" ry=".8"/><ellipse cx="21" cy="25.4" rx="1.1" ry=".85"/><ellipse cx="13" cy="32.6" rx="1" ry=".8"/></g>' +
      '<ellipse cx="29" cy="17.6" rx="3.2" ry="1.9" fill="#7f9050"/><circle cx="28.2" cy="17" r=".6" fill="#b3bf80"/><ellipse cx="10" cy="24.8" rx="2.6" ry="1.6" fill="#7f9050"/><circle cx="9.4" cy="24.4" r=".55" fill="#b3bf80"/>';
  }
  // Pflock am Rand des Damms: Kopf von oben, Licht links oben
  function pflock(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#6b5538" stroke="#3b3028" stroke-width=".9"/><path d="M' + gr(x - r * 0.55) + ' ' + gr(y - r * 0.5) + 'a' + gr(r * 0.75) + ' ' + gr(r * 0.75) + ' 0 0 1 ' + gr(r * 0.95) + ' -' + gr(r * 0.25) + '" fill="none" stroke="#a8916a" stroke-width=".8"/>'; }
  // Viertelstück des Damms (oben links, 0 bis 18): an jeder freien Seite eine dunkle Kante, Pflöcke an Seiten und Ecken
  function dammStueck(st) {
    var n = st === 'oben' || st === 'aussen', w = st === 'links' || st === 'aussen', o = [];
    if (n) o.push('<path d="M0 .7H18" stroke="#3b3028" stroke-width="1.3"/>');
    if (w) o.push('<path d="M.7 0V18" stroke="#3b3028" stroke-width="1.3"/>');
    if (n && w) o.push(pflock(3.4, 3.4, 2.1)); else if (n) o.push(pflock(10, 2.8, 1.8)); else if (w) o.push(pflock(2.8, 10, 1.8)); else if (st === 'innen') o.push(pflock(2.6, 2.6, 1.6));
    return o.join('');
  }
  // Wetter des Sets: ein Moospolster auf der Seite zum Licht, unten Spritzer von Schlamm
  function schlammWetter(mx, my, r, sp) {
    return '<ellipse cx="' + mx + '" cy="' + my + '" rx="' + r + '" ry="' + gr(r * 0.68) + '" transform="rotate(-20 ' + mx + ' ' + my + ')" fill="#7f9050"/><ellipse cx="' + gr(mx + r * 0.7) + '" cy="' + gr(my + r * 0.25) + '" rx="' + gr(r * 0.55) + '" ry="' + gr(r * 0.4) + '" fill="#7f9050"/>' +
      '<circle cx="' + gr(mx - r * 0.3) + '" cy="' + gr(my - r * 0.2) + '" r=".55" fill="#b3bf80"/><circle cx="' + gr(mx + r * 0.25) + '" cy="' + gr(my - r * 0.05) + '" r=".5" fill="#b3bf80"/>' +
      sp.map(function (s) { return '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="' + s[2] + '" fill="#5f5038"/>'; }).join('');
  }
  // Ring um das Lagerfeuer: nasser, dunkler Boden, dazwischen verkohlte Binsen
  function binsen() {
    var d = '', h = '';
    for (var i = 0; i < 9; i++) { var a = i * 2 * Math.PI / 9 + 0.3 + Math.PI / 9, s = 'M' + gr(18 + 13 * Math.cos(a)) + ' ' + gr(18 + 13 * Math.sin(a)) + 'L' + gr(18 + 15.6 * Math.cos(a + 0.12)) + ' ' + gr(18 + 15.6 * Math.sin(a + 0.12)); if (i % 3) d += s; else h += s; }
    return '<path d="' + d + '" stroke="#2a2419" stroke-width="1.1" stroke-linecap="round"/><path d="' + h + '" stroke="#8d7c55" stroke-width="1" stroke-linecap="round"/>';
  }
  // Sumpfzypresse: eine Krone aus gefiederten Büscheln mit gewelltem Rand, jedes mit Licht links oben, Schatten rechts unten und
  // Nadelzeichnung, darüber helle Bartflechten. f ist der Maßstab um die Feldmitte (1 für sich, 2,1 auf der Karte): Mit ihm wächst
  // die Zahl der Büschel, nicht die Strichstärke. Für sich allein sieht man um den Stamm die Knie; auf der Karte deckt die Krone sie.
  var ZYPRESSE = { umriss: '#3b3028', schatten: '#3a4f40', grund: '#52694f', licht: '#6f8a68', nadel: '#b2c4a0', nadelDunkel: '#33443a', flechte: '#d8dccb', knie: '#7b6a4e' };
  // gewellter Kreis: n Bögen auf dem Radius r, nach außen gewölbt
  function wolke(cx, cy, r, n, ph) {
    var d = '', s = gr(2 * r * Math.sin(Math.PI / n) * 0.62);
    for (var i = 0; i <= n; i++) { var a = ph + i * 2 * Math.PI / n, x = gr(cx + r * Math.cos(a)), y = gr(cy + r * Math.sin(a)); d += i ? 'A' + s + ' ' + s + ' 0 0 1 ' + x + ' ' + y : 'M' + x + ' ' + y; }
    return d + 'Z';
  }
  function zypresseTeile(f) {
    var g = f > 1.5, bu = [], ringe = g ? [[13, 21.4, 7.6, 0.1], [7, 11.6, 6.8, 0.5], [1, 0, 6.4, 0]] : [[6, 8.6, 5.6, 0.35], [1, 0, 5.8, 0]];
    ringe.forEach(function (rg) { for (var i = 0; i < rg[0]; i++) { var a = -Math.PI / 2 + rg[3] + i * 2 * Math.PI / rg[0] + ((i * 5) % 3 - 1) * 0.07; bu.push({ a: a, x: 18 + rg[1] * Math.cos(a), y: 18 + rg[1] * Math.sin(a), r: rg[2] * (1 + ((i * 7) % 5 - 2) * 0.03), ph: i * 0.7 }); } });
    // von rechts unten nach links oben, die Mitte zuletzt
    bu.sort(function (p, q) { var pm = p.x === 18 && p.y === 18, qm = q.x === 18 && q.y === 18; if (pm !== qm) return pm ? 1 : -1; return (q.x + q.y) - (p.x + p.y); });
    function licht(b) { return b.x === 18 && b.y === 18 ? true : Math.cos(b.a + 3 * Math.PI / 4) > 0.2; }
    var silhouette = bu.map(function (b) { return '<path d="' + wolke(gr(b.x), gr(b.y), b.r + 0.9, 8, b.ph) + '"/>'; }).join('');
    var koerper = bu.map(function (b) {
      var hell = licht(b), ix = gr(b.x - b.r * 0.16), iy = gr(b.y - b.r * 0.16), n = '';
      // Nadeln: drei Fiedern, die nach außen zeigen (in der Mitte nach links oben)
      var a = b.x === 18 && b.y === 18 ? -3 * Math.PI / 4 : b.a;
      [[-0.35, 0], [0.15, -0.42], [0.15, 0.42]].forEach(function (o) {
        var px = b.x + b.r * (o[0] * Math.cos(a) - o[1] * Math.sin(a)), py = b.y + b.r * (o[0] * Math.sin(a) + o[1] * Math.cos(a));
        n += 'M' + gr(px - 2 * Math.cos(a - 0.6)) + ' ' + gr(py - 2 * Math.sin(a - 0.6)) + 'L' + gr(px) + ' ' + gr(py) + 'L' + gr(px - 2 * Math.cos(a + 0.6)) + ' ' + gr(py - 2 * Math.sin(a + 0.6));
      });
      return '<path d="' + wolke(gr(b.x), gr(b.y), b.r, 8, b.ph) + '" fill="' + ZYPRESSE.schatten + '"/><path d="' + wolke(ix, iy, gr(b.r * 0.8), 7, b.ph + 0.3) + '" fill="' + (hell ? ZYPRESSE.licht : ZYPRESSE.grund) + '"/>' +
        '<path d="' + n + '" fill="none" stroke="' + (hell ? ZYPRESSE.nadel : ZYPRESSE.nadelDunkel) + '" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>';
    }).join('');
    // Bartflechten: helle, krause Fäden über einigen Büscheln
    var fl = (g ? [[3.6, 7.2], [26.2, 0.4], [-2.4, 26], [24, 31.6], [34.4, 21], [14.4, 15]] : [[11.4, 10.4], [24.4, 16.6], [14.6, 24.2]]).map(function (p) { return 'M' + p[0] + ' ' + p[1] + 'q1.2 1.4 0 2.8t0 2.8'; }).join('');
    var KN = [[6, 30], [30.5, 6.5], [30.2, 30.2]];
    var knie = g ? '' : KN.map(function (k) { return '<circle cx="' + k[0] + '" cy="' + k[1] + '" r="1.8" fill="' + ZYPRESSE.knie + '" stroke="' + ZYPRESSE.umriss + '" stroke-width=".8"/><circle cx="' + gr(k[0] - 0.5) + '" cy="' + gr(k[1] - 0.5) + '" r=".6" fill="#b49f7a"/>'; }).join('');
    return {
      schatten: (g ? '' : KN.map(function (k) { return '<circle cx="' + k[0] + '" cy="' + k[1] + '" r="1.8"/>'; }).join('')) + silhouette,
      form: knie + '<g fill="' + ZYPRESSE.umriss + '">' + silhouette + '</g>' + koerper + '<path d="' + fl + '" fill="none" stroke="' + ZYPRESSE.flechte + '" stroke-width=".9" stroke-linecap="round"/>'
    };
  }
  // Sumpfmyrte (Gagel): fünf Ballen kleiner, graugrüner Blätter, rötliche Zweige am Rand, braune Kätzchen
  var MYRTE = [[12.5, 14, 6.4], [21.5, 11.5, 6.2], [25, 20.5, 6.6], [17, 23.5, 6.8], [10.5, 22, 5.4]];
  function myrteTeile() {
    var c = function (b, plus, fill) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + gr(b[2] + plus) + '"' + (fill ? ' fill="' + fill + '"' : '') + '/>'; };
    var blaetter = '';
    MYRTE.forEach(function (b, i) { [[-0.45, -0.35, 30], [0.05, -0.55, -20], [-0.55, 0.1, 70], [0.3, -0.15, 10]].forEach(function (q, j) { var x = gr(b[0] + q[0] * b[2]), y = gr(b[1] + q[1] * b[2]); blaetter += '<ellipse cx="' + x + '" cy="' + y + '" rx="1.6" ry=".85" transform="rotate(' + (q[2] + i * 17) + ' ' + x + ' ' + y + ')"/>'; }); });
    return {
      schatten: MYRTE.map(function (b) { return c(b, 0.9); }).join(''),
      form: '<path d="M5 12.6l-2.3-1.2M24.8 5.6l1.1-2.6M31.4 22.6l2.2.8M14 30.4l-1.2 2.6M7 24.6l-2.4 1" fill="none" stroke="#8b5a3c" stroke-width="1.1" stroke-linecap="round"/>' +
        '<g fill="#3b3028">' + MYRTE.map(function (b) { return c(b, 0.9); }).join('') + '</g><g fill="#8a9a74">' + MYRTE.map(function (b) { return c(b, 0); }).join('') + '</g>' +
        '<g fill="#6e7d5a">' + MYRTE.map(function (b) { return '<circle cx="' + gr(b[0] + b[2] * 0.3) + '" cy="' + gr(b[1] + b[2] * 0.3) + '" r="' + gr(b[2] * 0.55) + '"/>'; }).join('') + '</g>' +
        '<g fill="#c6d1ae">' + blaetter + '</g>' +
        '<g fill="#a8703f" stroke="#5c3d26" stroke-width=".5"><ellipse cx="19" cy="9" rx="1" ry="1.7" transform="rotate(30 19 9)"/><ellipse cx="28" cy="18" rx="1" ry="1.7" transform="rotate(-20 28 18)"/><ellipse cx="13" cy="26" rx="1" ry="1.7" transform="rotate(40 13 26)"/><ellipse cx="9" cy="16" rx="1" ry="1.6" transform="rotate(-30 9 16)"/></g>'
    };
  }
  // Umgestürzter Stamm: schräg von links unten nach rechts oben, am Fuß der aufgestellte Wurzelteller, am Kopf das Bruchende
  var STAMM = 'M8.3 22L26.8 5.5L28.4 6.6L28.6 8.2L30.6 8.4L32.2 11.5L13.7 28Z';
  function stammTeile() {
    return {
      schatten: '<path d="' + STAMM + '"/><ellipse cx="8.6" cy="27.2" rx="7" ry="3" transform="rotate(48 8.6 27.2)"/>',
      form: '<path d="' + STAMM + '" fill="#6a5539"/><path d="M13.7 28L32.2 11.5L30.6 8.4L11.6 25.2Z" fill="#4c3c29"/><path d="M8.3 22L26.8 5.5" stroke="#8f7a57" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M12 22.6L25 10.9M15 24.2L27.6 12.8M18 21.8L24.6 15.8" stroke="#4f3e2c" stroke-width=".9" stroke-linecap="round"/>' +
        '<path d="M16.8 16.2q1.6-2.6 4.6-2.8 1.4.6.4 1.8-2.2.6-3.4 2.6z" fill="#7f9050"/><path d="M23.4 10.6q1.2-1.6 3-1.6 .6.8-.2 1.4-1.6.4-2.2 1.2z" fill="#7f9050"/><circle cx="18.6" cy="15.6" r=".6" fill="#aeb97c"/><circle cx="24.6" cy="10.4" r=".5" fill="#aeb97c"/>' +
        '<path d="M19.6 13.4l-2.8-3.6" stroke="#3b3028" stroke-width="3" stroke-linecap="round"/><path d="M19.6 13.4l-2.8-3.6" stroke="#6b5638" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M28.4 6.6L28.6 8.2L30.6 8.4" fill="none" stroke="#b9a37b" stroke-width=".9" stroke-linejoin="round"/>' +
        '<path d="' + STAMM + '" fill="none" stroke="#3b3028" stroke-width="1.3" stroke-linejoin="round"/>' +
        '<path d="M3.4 22.4l-1.2-1.6M5.2 20.8l-.8-1.8M12.6 32.4l1 1.4M14.4 31.2l1.4 1.1M3 25.6l-1-.4" stroke="#7d6447" stroke-width="1.1" stroke-linecap="round"/>' +
        '<ellipse cx="8.6" cy="27.2" rx="7" ry="3" transform="rotate(48 8.6 27.2)" fill="#3f3326" stroke="#3b3028" stroke-width="1.2"/>' +
        '<path d="M5 23.6q2.2 1.6 4.2 3.8M7.4 22.6q1.2 2.6 1.6 5.6M10.6 30.8q-1.4-1.8-3.6-3.2" fill="none" stroke="#7d6447" stroke-width=".9" stroke-linecap="round"/><path d="M4.4 23.8q3.8 2.2 6.6 7" fill="none" stroke="#6b5a45" stroke-width="1" opacity=".9"/>'
    };
  }
  var SUMPF = {
    id: 'sumpf', nr: 6, name: 'Sumpf', standard: 'sumpfboden', status: 'fertig', weheName: 'Schlamm und nasses Laub',
    // Elf Zeichen draußen: dazu der Morast m, den die Kampfkarte als Schlamm schon kennt (Max, 1.11.)
    ordnung: '.:mei~/F#WL+=szclhTfpSHbruOdxokt',
    text: 'Zwischen Land und Wasser: Boden, der nachgibt, Ried und Bulten, Morast, seichtes und tiefes Wasser, Bulteninseln mit Torfkanten, Sumpfzypressen und Gestrüpp. Draußen ist der Grund nasses Gras mit Moos, Lachen und Trittspuren; Ried und Bulten sind das schwierige Gelände. Als erstes Set hat der Sumpf elf Zeichen draußen: dazu den Morast (<code>m</code>), in dem man einsinkt; die Kampfkarte kennt ihn als Schlamm. Das seichte Wasser nimmt das Zeichen des Eises, wie die Brandung in Set 3: Hier watet man, schwimmen muss man erst im tiefen Wasser, und wo beide sich treffen, liegt im tiefen Feld die Tiefenkante. Das Ufer nimmt die Farbe des Nachbarn, Sumpfboden, Ried oder Morast. Der Weg des Sets ist der Knüppeldamm aus quer gelegten Stämmen, eine gebaute Fläche wie der Steg. Die Torfkante ist der Fels des Sets, Torf unter Moos, und Torfstufen führen hinauf. Der Baum ist eine Sumpfzypresse, das Dickicht Sumpfmyrte, das Hindernis ein umgestürzter Stamm mit Wurzelteller. Das Wetter des Sets ist Moos und Schlamm auf allem, was draußen steht; durch Lücken kommen Schlamm und nasses Laub herein. Über dem Sumpf liegt oft Nebel: im Kampf ein heller Schleier, dichter Nebel nur in besonderen Fällen. Die Tür ist die Standardtür.',
    rollen: [
      ['Grund', '#b2b38c', 'Sumpfboden, Ufer; Moos #959f63, Lache #7c8f86'], ['Grund dunkel', '#9a9d70', 'Ried und Bulten; Bulte #79844c, Blätter #4f5a2c'], ['Morast', '#8a7c5b', 'nasse Flecken #72654a, Glanz #b0a37f, Ufersaum #a99c78'], ['Zeichnung', '#6c7642', 'Segge, Wollgras #f1ecdc, Spuren'],
      ['Licht', '#d3d5b0', 'Ufersaum, Stufenkanten'], ['Fels', '#5c4834', 'Torfkante: Soden; Grund #3d2f21, Fasern #9c8763, Moos #97a06a'], ['Wasser', '#4f5d4c', 'Sumpfwasser, tief; Kante #2e3a2d, Entengrütze #9fb35c'], ['Eis', '#8a9b8a', 'seichtes Wasser; Kraut #6c806d, Kante #56685a, Tiefenkante #a9b8a7'],
      ['Grün', '#52694f', 'Sumpfzypresse #3a4f40 bis #b2c4a0, Bartflechten #d8dccb; Sumpfmyrte #8a9a74, Kätzchen #a8703f'], ['Weg', '#8b7553', 'Knüppeldamm: Stämme #7e6a4b bis #947d59, Pflöcke #6b5538'], ['Wetter', '#7f9050', 'Moos und Schlammspritzer #5f5038 auf allem, was draußen steht'], ['Holz', '#6a5539', 'umgestürzter Stamm, Flanke #4c3c29; Wurzelteller #3f3326']
    ],
    ufer: { flaeche: '#b2b38c', linie: '#d3d5b0', nachbar: true },
    weg: { wall: '#6b5538', band: '#8b7553', kante: '#3b3028', spuren: '#5c4a35' },
    // Schlamm und nasses Laub drinnen: eine Zunge Schlamm mit einem Stiefeltritt, nasse Blätter
    wehe: {
      2: '<path d="M2 31C6 26 12 25 18 27S30 31 34 28V34H2Z" fill="#7a6b4c" opacity=".88"/><path d="M4 11C8 9 13 10 16 12C12 14 7 14 4 11Z" fill="#7a6b4c" opacity=".8"/>' + blatt(24, 17, 5, -30, '#5f6b3a') + blatt(10, 21, 4.4, 40, '#8a7a44') + stiefel(20, 30.4, 70) +
        '<g fill="#5a4c35"><circle cx="27" cy="9.5" r=".8"/><circle cx="29" cy="29" r=".8"/><circle cx="8" cy="29.5" r=".7"/></g>',
      1: '<path d="M6 27C10 24 15 25 17 28C13 30 9 30 6 27Z" fill="#7a6b4c" opacity=".8"/>' + blatt(24, 14, 4.4, 20, '#5f6b3a') + '<g fill="#5a4c35"><circle cx="11" cy="10" r=".8"/><circle cx="27" cy="26" r=".7"/></g>'
    },
    // nasser, dunkler Boden um das Lagerfeuer, dazwischen verkohlte Binsen
    feuerring: '<path d="' + FEUER_RING + '" fill="#3c372a" opacity=".5"/>' + binsen(),
    // Torfkante: Soden aus Torf mit hellen Wurzelfasern, die Lippe in Moos; fasern zeichnet felsTextur dazu (neu mit Set 6)
    fels: { m: 7, h: 6, krone: '#5c4834', licht: '#97a06a', fuge: '#2b2118', front: '#3d2f21', frontFuge: '#2a2016', flanke: '#4b3b2a', fasern: '#9c8763' },
    // Wetter: Moos auf der Seite zum Licht, Schlammspritzer unten, auf den gemeinsamen Dingen draußen (und drinnen unter einer Wehe)
    wetter: {
      fass: schlammWetter(13, 12.5, 3.2, [[21, 26, 1.1], [24.5, 23.5, 0.8], [18, 27.6, 0.7]]),
      kiste: schlammWetter(12, 11.5, 3.2, [[20, 26, 1], [24.5, 25, 0.8], [15.5, 27, 0.7]]),
      truhe: schlammWetter(10.5, 5.6, 2.6, [[20, 15.6, 0.9], [24, 14.8, 0.7], [15, 16.2, 0.6]]),
      stuhl: schlammWetter(13.5, 14.5, 2.4, [[21, 25, 0.9], [17, 26, 0.7]]),
      hocker: schlammWetter(15.5, 15, 2.4, [[20.5, 22.5, 0.8], [17, 24, 0.7]]),
      tisch: schlammWetter(11, 10.5, 3, [[20, 27, 0.9], [24, 26, 0.8], [14, 27.2, 0.7]]),
      bank: schlammWetter(9.5, 15.5, 2.4, [[20, 22, 0.8], [25, 21.5, 0.7], [14, 22.4, 0.6]])
    },
    muster: {
      sumpfboden: { grund: '#b2b38c', bilder: [
        segge(9, 13) + segge(26, 9, 0.9) + moos(24, 24, 4.2) + segge(13, 30, 1.05),
        lache(18, 18, 6, 3.6, -12) + segge(7, 9, 0.9) + segge(29, 30, 0.95) + '<circle cx="28" cy="8" r=".8" fill="#77804e"/>',
        stiefel(12, 12, 20) + stiefel(23, 22, 25) + segge(28, 10, 0.9) + segge(9, 30, 0.9),
        moos(11, 12, 4.4) + moos(15, 16, 3) + segge(26, 16, 1.05) + segge(21, 31, 0.9) + '<circle cx="7" cy="26" r=".8" fill="#77804e"/>'
      ], selten: wollgras(12, 13) + wollgras(23, 19) },
      ried: { grund: '#9a9d70', bilder: [
        '<ellipse cx="18" cy="18" rx="6" ry="3" fill="#7c8a77" opacity=".75"/><path d="M15.5 17.4q2-.9 4-.4" fill="none" stroke="#c9d3c6" stroke-width=".8" stroke-linecap="round"/>' +
        bulte(9.5, 9.5, 5) + bulte(26.5, 11, 5.4) + bulte(10.5, 26.5, 5.4) + bulte(26.5, 26.5, 4.8)
      ] },
      morast: { grund: '#8a7c5b', saum: '#a99c78', bilder: [
        '<path d="M5 12q5-6 12-3t2 8q-6 4-11 1t-3-6z" fill="#72654a"/><path d="M19 24q6-5 12-1t-1 8q-6 2-10-1t-1-6z" fill="#72654a"/>' +
        '<path d="M8 10.5q3-1.4 6-.4M22 23q3-1.4 6-.3" fill="none" stroke="#b0a37f" stroke-width=".9" stroke-linecap="round"/>' +
        blase(25, 9, 1.3) + blase(28, 12, 0.9) + blase(10, 26, 1.1) + stiefel(16, 20, -30)
      ] },
      seicht: { grund: '#8a9b8a', bilder: [
        '<path d="M8 23q2-5 0-9M10 24q4-3 5-8M27 12q-2 4 1 8M25 11q-4 2-4 6" fill="none" stroke="#6c806d" stroke-width="1.1" stroke-linecap="round"/>' +
        '<ellipse cx="22" cy="27" rx="3" ry="2" fill="#7a8a7a" stroke="#64735f" stroke-width=".7"/><path d="M20.6 26.3q1-.8 2.4-.6" fill="none" stroke="#b9c4b6" stroke-width=".7"/>' +
        '<path d="M4 8q3-1.6 6 0M16 15q3-1.6 6 0M26 32q3-1.6 6 0M5 31q2.6-1.4 5.2 0" fill="none" stroke="#cdd8cc" stroke-width="1" stroke-linecap="round"/>'
      ] },
      sumpfwasser: { grund: '#4f5d4c', bilder: tiefwasser({ fleck: '#435042', deckung: .9, farbe: '#7a8a74', breite: 1, bogen: 1.6, zahl: 4, glanz: '#a8b6a2' }), selten: entengruetze() },
      knueppel: { grund: '#3a3024', bilder: [knueppel()] },
      // derselbe Damm, wenn er von West nach Ost läuft: die Stämme senkrecht, Licht weiter links
      knueppelQuer: { grund: '#3a3024', bilder: ['<g transform="rotate(-90 18 18)">' + knueppel() + '</g>'] },
      torfkante: { grund: '#3d2f21', bilder: [
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7V13C29 12 23 11 15 13S5 14 0 13Z" fill="#5c4834"/><path d="M0 22C8 24 15 25 23 23S32 21 36 22V28C29 27 22 26 14 28S5 29 0 28Z" fill="#4b3b2a"/>' +
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7M0 22C8 24 15 25 23 23S32 21 36 22" fill="none" stroke="#97a06a" stroke-width="1" opacity=".7"/><path d="M12 16l2 4-1 3M26 3l-2 3M28 31l3 2M6 32l2-3" fill="none" stroke="#9c8763" stroke-width=".9" stroke-linecap="round"/>'
      ] }
    },
    aufsatz: {
      torfstufen: '<rect x="4" y="4" width="28" height="7" fill="#8f7a58"/><rect x="4" y="11" width="28" height="7" fill="#7d6a4c"/><rect x="4" y="18" width="28" height="7" fill="#6c5b41"/><rect x="4" y="25" width="28" height="7" fill="#5c4d37"/>' +
        '<path d="M4 11H32M4 18H32M4 25H32" stroke="#3f3223" stroke-width="1.6"/><path d="M5 5.4h26M5 12.4h26M5 19.4h26M5 26.4h26" stroke="#a3ab72" stroke-width="1.1" opacity=".9"/>' +
        '<path d="M9 8l1.6 1.4M20 7.6l-1.2 1.6M14 15l1.4 1.2M26 14.6l-1.4 1.4M10 22l1.6 1M23 21.8l-1.2 1.6M16 29l1.4 1.2M27 28.6l-1.2 1.4" stroke="#3a2e20" stroke-width=".9" stroke-linecap="round"/>' +
        '<g fill="#a99470"><circle cx="7" cy="8.2" r=".7"/><circle cx="29" cy="15" r=".7"/><circle cx="8" cy="22.4" r=".7"/><circle cx="28.5" cy="29.2" r=".7"/></g>',
      zypresse: zypresseTeile(1),
      zypresseKrone: zypresseTeile(2.1),
      myrte: myrteTeile(),
      stamm: stammTeile()
    },
    kacheln: [
      { gruppe: 'Draußen', code: '.', name: 'Sumpfboden', art: 'Standard', muster: 'sumpfboden', kosten: 'kostet 1', text: 'Nasses Gras auf Torf in vier Varianten: Seggenhorste und ein Moospolster, eine Lache mit Glanz, zwei Stiefeltritte, in denen Wasser steht, Moos mit Segge. Zu viert in einem Muster von 72 Einheiten, damit kein Feld wie sein Nachbar aussieht. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, blüht Wollgras.' },
      { code: ':', name: 'Ried und Bulten', art: 'schwieriges Gelände', muster: 'ried', kosten: 'kostet 2', text: 'Seggenhorste, die aus dem nassen Grund wachsen: jeder ein Bult mit Blättern aus der Mitte und hellen Spitzen zum Licht, dazwischen Wasser. Derselbe Ton wie der Sumpfboden, eine Stufe dunkler, mehr Zeichnung; wer hindurch will, springt von Bult zu Bult oder watet dazwischen.' },
      { code: 'm', name: 'Morast', art: 'schwieriges Gelände, man sinkt ein (neu im Set)', muster: 'morast', kosten: 'kostet 2', naht: ['....', '.mm.', '.mmm', '..m.'],
        proben: [[['mm..', 'miii', 'mi~~'], 'am Wasser: das Ufer in der Farbe des Morasts']],
        text: 'Weicher, nasser Schlamm, in dem man einsinkt: dunkle nasse Flecken mit Glanz, Blasen, ein Stiefeltritt, der vollläuft. Neu im Set, nicht in der Kampfkarte: Dort heißt das Zeichen <code>m</code> Schlamm, schwieriges Gelände; wo die Spielleitung ein Schlammloch hinlegt, hält es fest (Regelwerk 9.7). Ein Muster ohne eigenen Rand wie Ried und Schutt; wo er an Wasser grenzt, nimmt das Ufer seine Farbe.' },
      { code: 'e', name: 'Knüppeldamm', art: 'Weg, gebaut', muster: 'knueppel', quer: 'knueppelQuer', steg: true, stueck: dammStueck, wasser: true, kosten: 'kostet 1',
        naht: ['.::.', '.e..', 'mem.', 'meee'], gross: ['.:..', ':e::', 'mei~', 'meee'],
        proben: [[['::::', 'eeee', 'eeee', 'mmmm'], 'zwei Felder breit, quer: die Stämme stehen senkrecht'], [['.e..', 'iei.', 'ieee', 'iii.'], 'längs, um die Ecke, quer, durchs seichte Wasser']],
        text: 'Quer gelegte Stämme auf dem nassen Grund, an den Seiten mit Pflöcken gehalten: in diesem Set der Weg, über Morast, Ried und seichtes Wasser. Gebaut, darum gerade: eine Fläche aus Vierteln wie der Steg in Set 3, mit dunkler Kante und Pflöcken an jeder freien Seite und Ecke, so breit und so lang, wie die Felder es sagen. Die Stämme liegen quer zur Richtung des Damms: Läuft er von West nach Ost, stehen sie senkrecht. Für das Ufer zählt er als Wasser.' },
      { code: 'i', name: 'Seichtes Wasser', art: 'schwieriges Gelände, waten', muster: 'seicht', rand: '#56685a', kosten: 'kostet 2', naht: ['....', '.ii.', '.iii', '..i.'],
        proben: [[['..::mm', 'iiiiii', '~~~~~~'], 'Ufer in der Farbe des Nachbarn: Sumpfboden, Ried, Morast; zum Tiefen die Tiefenkante', 216]],
        text: 'Wasser bis ans Knie, braungrün, der Grund schimmert durch: Kraut unter Wasser, ein Stein, kurze Kräusel. Es nimmt das Zeichen des Eises wie die Brandung in Set 3, denn es ist schwierig: Man watet, aber man schwimmt nicht. Zum Land hin ein Ufer aus Vierteln, in der Farbe des Nachbarn; zum tiefen Wasser hin keins, dort zeichnet das tiefe Feld die Tiefenkante.' },
      { code: '~', name: 'Sumpfwasser', art: 'tiefes Wasser, schwimmen', muster: 'sumpfwasser', rand: '#2e3a2d', kante: { gegen: 'i', flaeche: '#8a9b8a', linie: '#a9b8a7' }, kosten: 'kostet 2', naht: ['....', '.~~.', '.~~~', '..~.'],
        proben: [[['~~~~~~', '~~~~~~', '~~~~~~', '~~~~~~'], 'große Fläche: Die Flecken laufen über die Felder', 216], [['iiiii', 'i~~~i', 'i~~~~', 'ii~~i'], 'seicht ringsum, tief in der Mitte', 180]],
        text: 'Tiefes, dunkles Moorwasser mit tieferem Fleck und wenigen Kräuseln; hier schwimmt man. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, treibt Entengrütze. Am Land ein Ufer in der Farbe des Nachbarn. Zum seichten Wasser die Tiefenkante: Der seichte Grund reicht 6 Einheiten herein, dahinter fällt eine dunkle Linie ab, und dort beginnt das Schwimmen. Zu viert in einem Muster von 72 Einheiten; die Flecken laufen über die Felder, damit eine große Wasserfläche nicht stempelt.' },
      { gruppe: 'Höhe und Wände', code: '/', name: 'Torfstufen', art: 'Treppe, Rampe', muster: 'sumpfboden', aufsatz: 'torfstufen', dreht: true, kosten: 'kostet 1, eine Stufe ohne Klettern', text: 'In die Torfkante gestochene Stufen, jede vorn mit Moos gefasst und von Wurzelfasern durchzogen, nach oben heller wie die Ebenen der Karte, mit dunkler Stufenlinie und dem Schattenkeil. Hinauf liegt bei 0° oben; auf der Karte zeigt die Höhe der Nachbarn die Richtung.' },
      { code: 'F', name: 'Torfkante', art: 'Fels, gewachsen', muster: 'torfkante', kosten: 'gesperrt, ganzes Feld', text: 'Gewachsen, darum keine Mauer, sondern eine Abbruchkante von oben, wie in jedem Set ohne Felsmasse: Torfsoden mit hellen Wurzelfasern, die über die Felder durchlaufen, an der höheren Seite die Lippe mit der angedeuteten oberen Ebene, an der tieferen der Fuß und ein Schlagschatten. Welche Seite oben ist, sagen die Höhen der Karte. Die Kante einer Bulteninsel; eine niedrige Böschung bleibt eine Kante von Ebenen mit dem Steinrand, der im Sumpf aus Torf ist.' },
      { gruppe: 'Umgebung', code: 'O', name: 'Sumpfzypresse', art: 'Baum', muster: 'sumpfboden', aufsatz: 'zypresse', krone: 'zypresseKrone', kosten: 'nicht betretbar, Dreiviertel-Deckung', text: 'Ein Nadelbaum, der im Wasser steht, von oben: eine Krone aus gefiederten Büscheln mit gewelltem Rand und Nadelzeichnung, jedes mit Licht links oben und Schatten rechts unten, darüber helle Bartflechten. Für sich allein ist sie auf ein Feld verkleinert, und um den Stamm ragen die Knie aus dem Grund; auf der Karte ist die Krone gut 3 m breit, ragt halb über die acht Nachbarfelder und deckt die Knie. Gesperrt ist nur das Feld mit dem Stamm, darunter geht man hindurch, und die Krone gibt keine Deckung. Rund, darum dreht sie nicht.' },
      { code: 'd', name: 'Sumpfmyrte', art: 'Busch, Dickicht', muster: 'sumpfboden', aufsatz: 'myrte', kosten: 'kostet 2, schwieriges Gelände', text: 'Gagelstrauch: fünf Ballen kleiner, graugrüner Blätter mit gemeinsamem Umriss, rötliche Zweige am Rand und braune Kätzchen. Kleiner und heller als die Zypresse, damit man ihn als betretbar liest.' },
      { code: 'x', name: 'Umgestürzter Stamm', art: 'Hindernis', muster: 'sumpfboden', aufsatz: 'stamm', dreht: true, kosten: 'nicht betretbar', text: 'Ein Baum, den der Sturm samt Wurzel aus dem weichen Grund gerissen hat: der Stamm schräg von links unten nach rechts oben, mit Moos auf der Seite zum Licht und einem Aststumpf, am Fuß der aufgestellte Wurzelteller mit Erde und Wurzeln, am Kopf das Bruchende. Umriss in Tinte und der Schatten als versetzte Silhouette. Wie Treibholz und Fell dreht er nur nach Eintrag.' }
    ]
  };
  SUMPF.nachCode = {};
  SUMPF.kacheln.forEach(function (k) { SUMPF.nachCode[k.code] = k; });

  // Set 7: Wald. Unter Bäumen: Laubstreu, Unterholz aus Farn, der Waldweg, ein Bach, der Waldteich, Wurzelstufen, bemooster Fels,
  // Buchen, deren Kronen sich zu einem Dach schließen, Brombeeren und Baumstümpfe.
  // Buchenblatt in der Laubstreu: oval, vorn spitz, mit Mittelrippe
  function buchenblatt(x, y, l, rot, farbe, rippe) {
    var h = l / 2, w = l * 0.34;
    return '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')"><path d="M' + gr(x - h) + ' ' + y + 'C' + gr(x - h) + ' ' + gr(y - w * 1.25) + ' ' + gr(x + h * 0.35) + ' ' + gr(y - w * 1.1) + ' ' + gr(x + h) + ' ' + y + 'C' + gr(x + h * 0.35) + ' ' + gr(y + w * 1.1) + ' ' + gr(x - h) + ' ' + gr(y + w * 1.25) + ' ' + gr(x - h) + ' ' + y + 'Z" fill="' + farbe + '"/>' +
      (rippe ? '<path d="M' + gr(x - h * 0.75) + ' ' + y + 'H' + gr(x + h * 0.7) + '" stroke="' + rippe + '" stroke-width=".7" stroke-linecap="round"/>' : '') + '</g>';
  }
  var STREU = ['#9a7848', '#b48d55', '#8b6b40', '#c4a066'];
  // Zweig: ein dünner Ast mit einer Gabel
  function zweig(x, y, l, rot) {
    var a = rot * Math.PI / 180, x2 = gr(x + l * Math.cos(a)), y2 = gr(y + l * Math.sin(a)), xm = gr(x + l * 0.55 * Math.cos(a)), ym = gr(y + l * 0.55 * Math.sin(a));
    return '<path d="M' + x + ' ' + y + 'L' + x2 + ' ' + y2 + 'M' + xm + ' ' + ym + 'l' + gr(3 * Math.cos(a - 0.7)) + ' ' + gr(3 * Math.sin(a - 0.7)) + '" fill="none" stroke="#6f5a3e" stroke-width="1.1" stroke-linecap="round"/>';
  }
  // Buchecker: die offene Hülle mit vier Klappen, darin die Nuss
  function buchecker(x, y, rot) {
    var o = '';
    for (var i = 0; i < 4; i++) { var a = (rot + 45 + i * 90) * Math.PI / 180, cx = gr(x + 1.4 * Math.cos(a)), cy = gr(y + 1.4 * Math.sin(a)); o += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="1.5" ry=".85" transform="rotate(' + (rot + 45 + i * 90) + ' ' + cx + ' ' + cy + ')"/>'; }
    return '<g fill="#6f4f2e">' + o + '</g><circle cx="' + x + '" cy="' + y + '" r=".95" fill="#a8804e"/>';
  }
  // Nadeln: ein paar Fichtennadeln, die der Wind von weiter her gebracht hat
  function nadeln(x, y, rot) {
    var d = '';
    [[-2.6, -0.4, 10], [-1.2, 1.4, 70], [0.6, -1.6, -30], [2, 0.8, 40], [-0.4, 0.2, 110]].forEach(function (q) { var a = (rot + q[2]) * Math.PI / 180, cx = x + q[0], cy = y + q[1]; d += 'M' + gr(cx - 1.3 * Math.cos(a)) + ' ' + gr(cy - 1.3 * Math.sin(a)) + 'l' + gr(2.6 * Math.cos(a)) + ' ' + gr(2.6 * Math.sin(a)); });
    return '<path d="' + d + '" stroke="#86683f" stroke-width=".8" stroke-linecap="round"/>';
  }
  // Wurzel, die über den Waldboden läuft: dunkle Flanke, heller Rücken
  function wurzel(d) { return '<path d="' + d + '" fill="none" stroke="#6b563b" stroke-width="2.8" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#a08664" stroke-width="1.3" stroke-linecap="round"/>'; }
  // Pilze (seltenes Detail): drei braune Hüte mit hellem Rand
  function pilzgruppe(x, y) {
    return [[x - 2.6, y + 1, 2.4], [x + 1.4, y - 1.2, 2.9], [x + 2.6, y + 2.6, 1.8]].map(function (p) { return '<circle cx="' + gr(p[0] + 0.5) + '" cy="' + gr(p[1] + 0.5) + '" r="' + p[2] + '" fill="#5f4a32" opacity=".35"/><circle cx="' + gr(p[0]) + '" cy="' + gr(p[1]) + '" r="' + p[2] + '" fill="#8a5e3c" stroke="#3b3028" stroke-width=".7"/><path d="M' + gr(p[0] - p[2] * 0.6) + ' ' + gr(p[1] - p[2] * 0.2) + 'a' + gr(p[2] * 0.7) + ' ' + gr(p[2] * 0.7) + ' 0 0 1 ' + gr(p[2] * 0.75) + ' -' + gr(p[2] * 0.5) + '" fill="none" stroke="#c9a77a" stroke-width=".8" stroke-linecap="round"/>'; }).join('');
  }
  // Farnwedel: eine geschwungene Spindel mit Fiederpaaren, die zur Spitze kürzer werden; Fuß bei (x, y), Richtung rot (Grad)
  function farn(x, y, l, rot, farbe, hell) {
    var a = rot * Math.PI / 180, b = a + 0.35, d = '', h = '';
    var px = function (t) { return x + l * t * Math.cos(a + 0.35 * t * t); }, py = function (t) { return y + l * t * Math.sin(a + 0.35 * t * t); };
    var sp = 'M' + gr(x) + ' ' + gr(y) + 'Q' + gr(x + l * 0.55 * Math.cos(a)) + ' ' + gr(y + l * 0.55 * Math.sin(a)) + ' ' + gr(px(1)) + ' ' + gr(py(1));
    for (var i = 1; i <= 5; i++) {
      var t = i / 6.2, cx = px(t), cy = py(t), r = a + 0.35 * t * t, f = (1 - t) * 3.4 + 1;
      [1, -1].forEach(function (s) { var w = r + s * 1.05; var seg = 'M' + gr(cx) + ' ' + gr(cy) + 'l' + gr(f * Math.cos(w)) + ' ' + gr(f * Math.sin(w)); if (Math.cos(w + 3 * Math.PI / 4) > 0.15 && hell) h += seg; else d += seg; });
    }
    return '<path d="' + sp + d + '" fill="none" stroke="' + farbe + '" stroke-width="1" stroke-linecap="round"/>' + (h ? '<path d="' + h + '" fill="none" stroke="' + hell + '" stroke-width="1" stroke-linecap="round"/>' : '');
  }
  function farnhorst(cx, cy, l, ph) {
    var o = '';
    for (var i = 0; i < 5; i++) { var w = ph + i * 72 + ((i * 7) % 3 - 1) * 9, hinten = Math.cos((w + 135) * Math.PI / 180) < 0; o += farn(cx, cy, l * (hinten ? 0.92 : 1), w, hinten ? '#556d35' : '#6c8743', hinten ? null : '#9bb267'); }
    return o + '<circle cx="' + cx + '" cy="' + cy + '" r="1.1" fill="#5a4a33"/>';
  }
  // Junger Trieb: ein Stämmchen mit zwei Blättern
  function trieb(x, y) { return '<path d="M' + x + ' ' + y + 'v-4.6" stroke="#6b563b" stroke-width=".9" stroke-linecap="round"/>' + buchenblatt(gr(x - 1.6), gr(y - 4.4), 3.4, -150, '#7f9a4c') + buchenblatt(gr(x + 1.7), gr(y - 3.2), 3.2, -20, '#94ad5c'); }

  // Der Bach als Kantensatz (seit Set 7, Max 2.11.): ein Band, das bei 12 und 24 senkrecht über den Rand tritt und dazwischen frei schwingt,
  // schmaler als der Weg; dieselben Formen wie der Weg, dazu die Quelle (Ende) und der Quelltopf (Fleck).
  // Je Form: [Fläche, beide Ränder, Rinne, Kräusel, Steine [x, y, rx, ry, Drehung]]
  var BACH = { wasser: '#6f938b', tief: '#628680', kraeusel: '#c9dad2', stein: '#8f8b7d', steinLicht: '#bcb7a7', kante: '#3d5853', saum: '#d2c39b' };
  var BACH_PFADE = {
    gerade: ['M12 0C12 6 15 9 15 14C15 20 11 23 11.5 28C12 31 12 33 12 36H24C24 33 22.5 31 22 27C21.5 22 25 19 25.5 13C26 8 24 5 24 0Z',
      'M12 0C12 6 15 9 15 14C15 20 11 23 11.5 28C12 31 12 33 12 36M24 0C24 5 26 8 25.5 13C25 19 21.5 22 22 27C22.5 31 24 33 24 36',
      'M18 0C18 5 20.4 9 20.3 14C20.2 20 16.3 22.5 16.8 28C17.1 31 18 33 18 36', 'M18.2 7.4q2 -1.1 4 .2M14.6 21.6q2 -1.1 4 .2M14.8 31.4q2 -1 3.8 .2', [[14.6, 17.6, 1.7, 1.1, 20], [23.4, 30.6, 1.4, 1, -15]]],
    ecke: ['M12 0C12 9 14 15 18 19C22 23 28 24 36 24V12C33 12 30.5 12 28 10C25.5 8 24 4 24 0Z',
      'M12 0C12 9 14 15 18 19C22 23 28 24 36 24M24 0C24 4 25.5 8 28 10C30.5 12 33 12 36 12',
      'M18 0C18 7 20 12 23 15C26 17.5 30 18 36 18', 'M16.6 9q1.4 -1.4 3.4 -1M22.4 19.4q1.6 -1.2 3.6 -.6M29.6 16.6q1.6 -1.2 3.6 -.4', [[13.4, 13, 1.6, 1.1, 60], [31, 22.8, 1.4, 1, 0]]],
    abzweig: ['M12 0C12 8 10.5 14 11 20C11.5 26 12 30 12 36H24C24 32 26 28.5 28 26.5C30 24.5 33 24 36 24V12C33 12 30.5 12 28 10C25.5 8 24 4 24 0Z',
      'M12 0C12 8 10.5 14 11 20C11.5 26 12 30 12 36M24 0C24 4 25.5 8 28 10C30.5 12 33 12 36 12M36 24C33 24 30 24.5 28 26.5C26 28.5 24 32 24 36',
      'M18 0C18 10 16.8 26 18 36M17.4 18C24 18 30 18 36 18', 'M14 8q2 -1 4 .2M13.6 26q2 -1 4 .2M27.6 16.4q1.6 -1.2 3.6 -.4', [[11.8, 16, 1.6, 1.1, 80]]],
    kreuz: ['M12 0H24C24 5 27 12 36 12V24C28 24 24 28 24 36H12C12 29 8 24 0 24V12C7 12 12 7 12 0Z',
      'M24 0C24 5 27 12 36 12M36 24C28 24 24 28 24 36M12 36C12 29 8 24 0 24M0 12C7 12 12 7 12 0',
      'M18 0V36M0 18H36', 'M19.6 7q2 -1 4 .2M12.6 28q2 -1 4 .2M5 16.4q1.6 -1.2 3.6 -.4M27.4 20.4q1.6 -1.2 3.6 -.4', []],
    ende: ['M12 0C12 7 9.5 14 11 19.5C12.5 25 17 27.5 21.5 26C26 24.5 27 19 25.5 13.5C24.5 9.5 24 5 24 0Z',
      'M12 0C12 7 9.5 14 11 19.5C12.5 25 17 27.5 21.5 26C26 24.5 27 19 25.5 13.5C24.5 9.5 24 5 24 0',
      'M18 0C18 6 17.6 11 18.4 16', 'M15.4 19.6a3.4 2.4 0 1 0 6.8 0a3.4 2.4 0 1 0 -6.8 0M17.4 19.6a1.4 1 0 1 0 2.8 0a1.4 1 0 1 0 -2.8 0', [[25.6, 26.4, 2.2, 1.5, 30], [10.4, 23.4, 1.6, 1.1, -30]]],
    fleck: ['M18 9C24.5 8.5 28 13 27.5 18.5C27 24.5 22.5 28 17 27.5C11 27 8.5 22.5 9 17C9.5 12 13 9.5 18 9Z',
      'M18 9C24.5 8.5 28 13 27.5 18.5C27 24.5 22.5 28 17 27.5C11 27 8.5 22.5 9 17C9.5 12 13 9.5 18 9Z',
      '', 'M14.6 18a3.6 2.6 0 1 0 7.2 0a3.6 2.6 0 1 0 -7.2 0M16.8 18a1.4 1 0 1 0 2.8 0a1.4 1 0 1 0 -2.8 0', [[26.4, 25.6, 2, 1.4, 30]]]
  };
  function bachStein(s) { return '<ellipse cx="' + s[0] + '" cy="' + s[1] + '" rx="' + s[2] + '" ry="' + s[3] + '" transform="rotate(' + s[4] + ' ' + s[0] + ' ' + s[1] + ')" fill="' + BACH.stein + '" stroke="#3b3028" stroke-width=".8"/><ellipse cx="' + gr(s[0] - s[2] * 0.25) + '" cy="' + gr(s[1] - s[3] * 0.3) + '" rx="' + gr(s[2] * 0.5) + '" ry="' + gr(s[3] * 0.4) + '" transform="rotate(' + s[4] + ' ' + s[0] + ' ' + s[1] + ')" fill="' + BACH.steinLicht + '"/>'; }
  function bachSvg(form) {
    var p = BACH_PFADE[form];
    return '<path d="' + p[1] + '" fill="none" stroke="' + BACH.saum + '" stroke-width="4.2"/><path d="' + p[0] + '" fill="' + BACH.wasser + '"/>' +
      (p[2] ? '<path d="' + p[2] + '" fill="none" stroke="' + BACH.tief + '" stroke-width="3"/>' : '') + '<path d="' + p[3] + '" fill="none" stroke="' + BACH.kraeusel + '" stroke-width=".9" stroke-linecap="round"/>' +
      '<path d="' + p[1] + '" fill="none" stroke="' + BACH.kante + '" stroke-width="1.2"/>' + p[4].map(bachStein).join('');
  }
  // Furt: Kies im Bett, drei Trittsteine in der Richtung des Wegs (Wegrichtung senkrecht gezeichnet, Bach waagrecht)
  var FURT_KIES = '<path d="M10 0H26V36H10Z" fill="#93aea2" opacity=".8"/>' + '<g fill="#a7a08c"><circle cx="13" cy="15" r=".8"/><circle cx="23" cy="21" r=".8"/><circle cx="21.6" cy="13.6" r=".7"/><circle cx="12.4" cy="22" r=".7"/></g>';
  var FURT_STEINE = [[16.2, 13.4, 3.4, 2.2, 8], [20, 18.4, 3.6, 2.3, -6], [16.4, 23.2, 3.3, 2.1, 12]].map(function (s) { return '<ellipse cx="' + gr(s[0] + 0.7) + '" cy="' + gr(s[1] + 0.7) + '" rx="' + s[2] + '" ry="' + s[3] + '" transform="rotate(' + s[4] + ' ' + s[0] + ' ' + s[1] + ')" fill="#2a2119" opacity=".2"/>' + bachStein(s); }).join('');
  // Steg über den Bach: fünf Bohlen quer zur Gehrichtung auf zwei Balken (gebaut, darum gerade)
  var BACHSTEG = '<g transform="translate(2.5 2.5)" opacity=".18"><rect x="10.5" y="9.6" width="15" height="16.8" fill="#2a2119"/></g>' +
    '<path d="M11.4 8.6V27.4M24.6 8.6V27.4" stroke="#5c4430" stroke-width="2"/>' +
    [9.6, 13, 16.4, 19.8, 23.2].map(function (y, i) { return '<rect x="10.5" y="' + y + '" width="15" height="3.1" fill="' + ['#a5835a', '#9a7a52', '#a88860', '#9d7d55', '#a3815a'][i] + '" stroke="#3b3028" stroke-width=".8"/><path d="M11.4 ' + gr(y + 0.8) + 'H24.6" stroke="#c4a77c" stroke-width=".7"/>'; }).join('') +
    '<circle cx="12.6" cy="11.1" r=".55" fill="#3b3028"/><circle cx="23.4" cy="11.1" r=".55" fill="#3b3028"/><circle cx="12.6" cy="24.7" r=".55" fill="#3b3028"/><circle cx="23.4" cy="24.7" r=".55" fill="#3b3028"/>';
  // Mündung: wo der Bach in den Teich fließt, trägt das Ufer des Teichs eine Lücke (Bach von oben)
  var MUENDUNG = '<path d="M12 0C12 3.2 11.2 5.4 8.6 6.9C11 9.3 14 9.9 18 9.9C22 9.9 25 9.3 27.4 6.9C24.8 5.4 24 3.2 24 0Z" fill="' + BACH.wasser + '"/>' +
    '<path d="M13.6 9.2q4.4 1.4 8.8 0" fill="none" stroke="' + BACH.kraeusel + '" stroke-width=".9" stroke-linecap="round"/>' +
    '<path d="M12 0C12 3.2 11.2 5.4 8.6 6.9M24 0C24 3.2 24.8 5.4 27.4 6.9" fill="none" stroke="' + BACH.kante + '" stroke-width="1.2"/>';

  // Buche: eine dichte, glatte Krone mit Laub in Lagen. Ein Kranz aus kleinen Bögen bildet den Umriss, darin liegen
  // die Lagen wie Dachschindeln, jede innere heller und zum Licht (links oben) verschoben; auf den Lagen die Kanten der Laubschichten.
  // f ist der Maßstab um die Feldmitte (1 für sich, 2,1 auf der Karte): Mit ihm wachsen Zahl der Bögen und Lagen, nicht die Strichstärke.
  var BUCHE = { umriss: '#3b3028', lagen: ['#4b6a33', '#5e8139', '#749846', '#8eb057', '#aac86f'], kante: '#3d5a2a', licht: '#c3d98c' };
  function bucheUmriss(f) { return wolke(18, 18, gr(13.8 * f), f > 1.5 ? 24 : 14, 0.1); }
  function bucheTeile(f) {
    var g = f > 1.5, R = 13.8 * f, n = g ? 5 : 4, o = '';
    // Lagen: Radius nimmt ab, Mitte wandert zum Licht
    for (var i = 0; i < n; i++) {
      var t = i / n, r = R * (1 - t * 0.78), cx = 18 - R * 0.16 * t, cy = 18 - R * 0.16 * t, bg = Math.max(7, Math.round((g ? 24 : 14) * (1 - t * 0.55)));
      o += '<path d="' + wolke(gr(cx), gr(cy), gr(r), bg, 0.1 + i * 0.37) + '" fill="' + BUCHE.lagen[Math.min(i, BUCHE.lagen.length - 1) + (g ? 0 : (i ? 1 : 0))] + '"/>';
      // Schichtkanten: kurze Bögen auf der Schattenseite der Lage, helle Bögen auf der Lichtseite
      if (i > 0) {
        var dk = '', hk = '';
        for (var j = 0; j < bg; j++) {
          var a = 0.1 + i * 0.37 + (j + 0.5) * 2 * Math.PI / bg, x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a);
          if (Math.cos(a + 3 * Math.PI / 4) < -0.25) dk += 'M' + gr(x1 - 1.6 * Math.sin(a)) + ' ' + gr(y1 + 1.6 * Math.cos(a)) + 'A2.6 2.6 0 0 0 ' + gr(x1 + 1.6 * Math.sin(a)) + ' ' + gr(y1 - 1.6 * Math.cos(a));
          else if (Math.cos(a + 3 * Math.PI / 4) > 0.55 && j % 2 === 0) hk += 'M' + gr(x1 - 1.4 * Math.sin(a) - 1.2 * Math.cos(a)) + ' ' + gr(y1 + 1.4 * Math.cos(a) - 1.2 * Math.sin(a)) + 'A2.4 2.4 0 0 1 ' + gr(x1 + 1.4 * Math.sin(a) - 1.2 * Math.cos(a)) + ' ' + gr(y1 - 1.4 * Math.cos(a) - 1.2 * Math.sin(a));
        }
        if (dk) o += '<path d="' + dk + '" fill="none" stroke="' + BUCHE.kante + '" stroke-width=".9" stroke-linecap="round"/>';
        if (hk) o += '<path d="' + hk + '" fill="none" stroke="' + BUCHE.licht + '" stroke-width=".8" stroke-linecap="round"/>';
      }
    }
    var u = bucheUmriss(f);
    return {
      schatten: '<path d="' + u + '"/>',
      form: '<path d="' + u + '" fill="' + BUCHE.umriss + '" stroke="' + BUCHE.umriss + '" stroke-width="1.8" stroke-linejoin="round"/>' + o
    };
  }
  // Buchenstamm (Kronendach, Max 2.11.): von oben die Rinde mit Licht links oben, ringsum der Wurzelanlauf; holzbraun, nicht grau wie
  // eine echte Buchenrinde, denn grau las er sich auf der Karte wie ein Stein (Max 2.11.)
  // Wurzelanlauf von oben: je Wurzel drei Kreise, nach außen kleiner; zusammen mit dem Stammkreis ein weicher Fuß.
  // Gezeichnet wie die Eiche: erst alles etwas größer in Tinte (der Umriss), dann dieselben Kreise in der Farbe.
  function wurzelKreise(wurzeln, r0) {
    var k = [[18, 18, r0]];
    wurzeln.forEach(function (q) { var a = q[0] * Math.PI / 180, l = q[1]; [[0.66, 0.48], [0.9, 0.3]].concat(l > 12 ? [[1.06, 0.2]] : []).forEach(function (t) { k.push([gr(18 + l * t[0] * Math.cos(a)), gr(18 + l * t[0] * Math.sin(a)), gr(r0 * t[1] + 0.6)]); }); });
    return k;
  }
  function kreise(k, plus, fill) { return k.map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + gr(c[2] + plus) + '"' + (fill ? ' fill="' + fill + '"' : '') + '/>'; }).join(''); }
  var BSTAMM_WURZELN = [[8, 12.6], [70, 10], [128, 11.2], [196, 13.2], [250, 9.6], [312, 10.6]];
  function buchenstammTeile() {
    var k = wurzelKreise(BSTAMM_WURZELN, 8);
    return {
      schatten: kreise(k, 0.6),
      form: '<g fill="#3b3028">' + kreise(k, 0.9) + '</g><g fill="#6e5238">' + kreise(k, 0) + '</g>' +
        '<g fill="#7f9050"><ellipse cx="9.4" cy="12.6" rx="2.2" ry="1.4" transform="rotate(30 9.4 12.6)"/><ellipse cx="14.4" cy="8.6" rx="1.8" ry="1.2"/><ellipse cx="7.6" cy="20.6" rx="1.6" ry="1.1"/></g>' +
        '<circle cx="18" cy="18" r="7.2" fill="#8c6c4a" stroke="#3b3028" stroke-width="1.1"/><path d="M12.4 15.6A6.2 6.2 0 0 1 19.6 11.6" fill="none" stroke="#b6956a" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M23.4 21.4A6.4 6.4 0 0 1 15.6 24.6" fill="none" stroke="#5c4430" stroke-width="1.6" stroke-linecap="round"/><path d="M16.2 16l1.6 .3M19.6 20.4l1.4 -.3M21 14.6l.9 1" stroke="#6f5439" stroke-width=".8" stroke-linecap="round"/>'
    };
  }
  // Brombeere: ein Hügel aus Ranken und Blättern, Bögen mit Dornen ragen heraus, dunkle Beeren, ein paar Blüten
  var DORN_BALLEN = [[13, 14, 6.2], [22.5, 12.5, 6], [24.5, 21.5, 6.4], [15.5, 23, 6.6], [19, 18, 5]];
  function dornTeile() {
    var c = function (b, plus, fill) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + gr(b[2] + plus) + '"' + (fill ? ' fill="' + fill + '"' : '') + '/>'; };
    var ranken = 'M8 18C5 13 7 7 12 6.4M26 7.6C30 8 32 12 31 16M29 25C30 29 26 32 22 31M9.4 26C6 27 4.6 24 5.4 21', dornen = '';
    [[6.2, 12.2, 200], [10, 6.6, 260], [29.4, 9.6, 330], [31.4, 13.6, 10], [28.8, 29, 80], [24.6, 31.4, 120], [6.2, 26.6, 150], [5, 23, 200]].forEach(function (p) { var a = p[2] * Math.PI / 180; dornen += 'M' + p[0] + ' ' + p[1] + 'l' + gr(1.5 * Math.cos(a)) + ' ' + gr(1.5 * Math.sin(a)); });
    var blaetter = '';
    DORN_BALLEN.forEach(function (b, i) { [[-0.45, -0.3, 20], [0.15, -0.5, -40], [-0.5, 0.2, 80], [0.35, 0.1, 140]].forEach(function (q, j) { var x = gr(b[0] + q[0] * b[2]), y = gr(b[1] + q[1] * b[2]); blaetter += '<ellipse cx="' + x + '" cy="' + y + '" rx="1.9" ry="1.1" transform="rotate(' + (q[2] + i * 23) + ' ' + x + ' ' + y + ')"/>'; }); });
    var beeren = [[17, 11], [27.4, 19], [12.4, 21.6]].map(function (p) { return '<g fill="#3f2b3a" stroke="#2a2119" stroke-width=".4"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.25"/><circle cx="' + gr(p[0] + 1.7) + '" cy="' + gr(p[1] + 0.9) + '" r="1.15"/><circle cx="' + gr(p[0] + 0.4) + '" cy="' + gr(p[1] + 1.9) + '" r="1.1"/></g><circle cx="' + gr(p[0] - 0.4) + '" cy="' + gr(p[1] - 0.4) + '" r=".4" fill="#b59ab0"/>'; }).join('');
    return {
      schatten: DORN_BALLEN.map(function (b) { return c(b, 0.9); }).join('') + '<path d="' + ranken + '" fill="none" stroke="#2a2119" stroke-width="1.6"/>',
      form: '<path d="' + ranken + '" fill="none" stroke="#3b3028" stroke-width="2.2" stroke-linecap="round"/><path d="' + ranken + '" fill="none" stroke="#7d4f4a" stroke-width="1.2" stroke-linecap="round"/><path d="' + dornen + '" stroke="#5a3a36" stroke-width=".9" stroke-linecap="round"/>' +
        '<g fill="#3b3028">' + DORN_BALLEN.map(function (b) { return c(b, 0.9); }).join('') + '</g><g fill="#56703a">' + DORN_BALLEN.map(function (b) { return c(b, 0); }).join('') + '</g>' +
        '<g fill="#455c2e">' + DORN_BALLEN.map(function (b) { return '<circle cx="' + gr(b[0] + b[2] * 0.32) + '" cy="' + gr(b[1] + b[2] * 0.32) + '" r="' + gr(b[2] * 0.5) + '"/>'; }).join('') + '</g>' +
        '<g fill="#8ea65c">' + blaetter + '</g>' + beeren + bluemchen(21.4, 24.6, 0.62) + bluemchen(10.6, 15.4, 0.58)
    };
  }
  // Baumstumpf: Wurzeln, Rinde, die helle Schnittfläche mit Jahresringen und einem Riss, Baumpilze an der Flanke, Moos
  var STUMPF_WURZELN = [[30, 13.4], [112, 11.8], [190, 13], [262, 12], [330, 12.6]];
  function stumpfTeile() {
    var k = wurzelKreise(STUMPF_WURZELN, 10.2);
    var pilze = [[27.6, 22.4, 3.6, 20], [25.2, 26.2, 2.8, 40]].map(function (p) { var a = p[3] * Math.PI / 180; return '<path d="M' + gr(p[0] - p[2] * Math.cos(a)) + ' ' + gr(p[1] - p[2] * Math.sin(a)) + 'A' + p[2] + ' ' + p[2] + ' 0 0 0 ' + gr(p[0] + p[2] * Math.cos(a)) + ' ' + gr(p[1] + p[2] * Math.sin(a)) + 'Z" fill="#b98c54" stroke="#3b3028" stroke-width=".9" stroke-linejoin="round"/><path d="M' + gr(p[0] - p[2] * 0.7 * Math.cos(a)) + ' ' + gr(p[1] - p[2] * 0.7 * Math.sin(a) + 0.9) + 'A' + gr(p[2] * 0.7) + ' ' + gr(p[2] * 0.7) + ' 0 0 0 ' + gr(p[0] + p[2] * 0.7 * Math.cos(a)) + ' ' + gr(p[1] + p[2] * 0.7 * Math.sin(a) + 0.9) + '" fill="none" stroke="#e2c38a" stroke-width=".8"/>'; }).join('');
    return {
      schatten: kreise(k, 0.6) + '<circle cx="27.6" cy="23.6" r="3.4"/>',
      form: '<g fill="#3b3028">' + kreise(k, 0.9) + '</g><g fill="#6f5a40">' + kreise(k, 0) + '</g>' +
        '<circle cx="18" cy="18" r="10" fill="#6b563c" stroke="#3b3028" stroke-width="1.3"/><path d="M9.6 14.6q2.4 -5.4 8 -6.2" fill="none" stroke="#7f9050" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="18" cy="18" r="7.6" fill="#c9ae7c"/><circle cx="18" cy="18" r="5.4" fill="none" stroke="#a98c5e" stroke-width=".8"/><circle cx="18" cy="18" r="3.2" fill="none" stroke="#a98c5e" stroke-width=".8"/><circle cx="18" cy="18" r=".9" fill="#7d6446"/>' +
        '<path d="M18.6 17.4l3.4 -4.6 1 -2.4" fill="none" stroke="#6f5a40" stroke-width=".9" stroke-linecap="round"/><path d="M12.4 13.4a7.6 7.6 0 0 1 5.6 -3" fill="none" stroke="#e3cc9c" stroke-width=".9" stroke-linecap="round"/>' + pilze
    };
  }
  // Wetter des Sets: eine Buchecker auf der Seite zum Licht, daneben drei Nadeln
  function waldWetter(bx, by, rot, nx, ny) { return buchecker(bx, by, rot) + '<path d="M' + nx + ' ' + ny + 'l2.6 .8M' + gr(nx + 1) + ' ' + gr(ny + 1.8) + 'l2.2 -1.4M' + gr(nx - 0.6) + ' ' + gr(ny + 2.6) + 'l2.6 .2" stroke="#86683f" stroke-width=".8" stroke-linecap="round"/>'; }
  // Ring um das Lagerfeuer: angesengte Laubstreu, dazwischen ein Kranz aus Asche und verkohlte Blätter
  function ascheKranz() {
    var d = '', b = '';
    for (var i = 0; i < 9; i++) { var a = i * 2 * Math.PI / 9 + 0.3 + Math.PI / 9; d += '<circle cx="' + gr(18 + 14.2 * Math.cos(a)) + '" cy="' + gr(18 + 14.2 * Math.sin(a)) + '" r="' + (i % 2 ? 1 : 1.3) + '"/>'; }
    [[5, 8.6, 30], [31, 27, -40], [7.6, 30, 70]].forEach(function (p) { b += buchenblatt(p[0], p[1], 3.6, p[2], '#3a3026'); });
    return '<g fill="#a29c90">' + d + '</g>' + b;
  }
  var WALD = {
    id: 'wald', nr: 7, name: 'Wald', standard: 'waldboden', status: 'fertig', weheName: 'Laub und Nadeln',
    // Kronendach (Max, 2.11.): auf der Karte Stämme, die Kronen als Schatten mit Lichtflecken, in jeder Ansicht
    kronendach: 'schatten',
    text: 'Unter Bäumen: Laubstreu, Unterholz aus Farn, Waldwege, Bäche, Teiche, bemooster Fels und Buchen, deren Kronen sich zu einem Dach schließen. Draußen ist der Grund Laubstreu mit Moos, Zweigen, Wurzeln und Bucheckern; Unterholz aus Farn und jungen Trieben ist das schwierige Gelände. Der Weg des Sets ist der Waldweg aus festgetretener Erde. Der Bach ist das erste Wasser, das schmaler ist als ein Feld: ein Kantensatz wie der Weg, auf dem Zeichen des Eises, denn man watet. Wo er einen Weg kreuzt, liegt eine Furt oder ein Steg, und in den Waldteich mündet er durch eine Lücke im Ufer. Der Waldfels ist der Fels des Sets, grauer Stein mit Moos und Farn, und Wurzelstufen führen hinauf. Der Baum ist eine Buche. Auf der Karte steht man unter ihr: Zu sehen sind die Stämme mit ihrem Wurzelanlauf, und die Kronen liegen als Schatten mit Lichtflecken über dem Boden, in jeder Ansicht; für sich ist die Buche eine Krone. Das Dickicht ist eine Brombeere, das Hindernis ein Baumstumpf mit Baumpilzen. Das Wetter des Sets sind Bucheckern und Nadeln auf allem, was draußen steht; durch Lücken kommen Laub und Nadeln herein. Die Tür ist die Standardtür.',
    rollen: [
      ['Grund', '#b5a37b', 'Waldboden, Ufer; Laub #9a7848 bis #c4a066, Moos #959f63'], ['Grund dunkel', '#9e8d65', 'Unterholz; Farn #6c8743, hell #9bb267, Schatten #556d35'], ['Zeichnung', '#6f5a3e', 'Zweige; Wurzeln #6b563b, Bucheckern #6f4f2e, Pilze #8a5e3c'], ['Licht', '#d6c9a0', 'Ufersaum, Stufenkanten'],
      ['Fels', '#7a7a6e', 'Waldfels: Brocken; Grund #55554c, Moos #7f9050, Farn #6c8743'], ['Wasser', '#4d655f', 'Waldteich; Uferkante #2f433f, Laub darauf #b08a4c'], ['Eis', '#6f938b', 'Bach (i): Band; Rinne #628680, Saum #d2c39b, Kante #3d5853, Steine #8f8b7d'], ['Grün', '#749846', 'Buche #4b6a33 bis #aac86f, Lagenkanten #3d5a2a; Brombeere #56703a'],
      ['Weg', '#c9b287', 'Waldweg; Kante #806a48, Saum #d5c69e, Spuren #a48c63'], ['Holz', '#8c6c4a', 'Buchenstamm; Wurzelanlauf #6e5238; Stumpf #6b563c, Schnitt #c9ae7c, Baumpilz #b98c54'], ['Wetter', '#6f4f2e', 'Bucheckern, dazu Nadeln #86683f, auf allem, was draußen steht'], ['Schatten', '#2a2119', 'Kronendach mit 22 %, mit Lichtflecken']
    ],
    ufer: { flaeche: '#b5a37b', linie: '#d6c9a0', nachbar: true },
    weg: { wall: '#d5c69e', band: '#c9b287', kante: '#806a48', spuren: '#a48c63' },
    // Laub und Nadeln drinnen: eine Zunge brauner Blätter, ein paar Nadeln
    wehe: {
      2: '<path d="M2 31C6 26 12 25 18 27S30 31 34 28V34H2Z" fill="#a8885a" opacity=".85"/><path d="M4 11C8 9 13 10 16 12C12 14 7 14 4 11Z" fill="#a8885a" opacity=".8"/>' + buchenblatt(24, 17, 5, -30, STREU[1], '#7a5c36') + buchenblatt(10, 21, 4.4, 40, STREU[3]) + buchenblatt(19, 29.6, 4.6, 70, STREU[2]) + nadeln(27, 10, 20),
      1: '<path d="M6 27C10 24 15 25 17 28C13 30 9 30 6 27Z" fill="#a8885a" opacity=".8"/>' + buchenblatt(24, 14, 4.4, 20, STREU[1]) + nadeln(12, 11, 60)
    },
    // angesengte Laubstreu um das Lagerfeuer, dazwischen ein Kranz aus Asche
    feuerring: '<path d="' + FEUER_RING + '" fill="#4a3d2c" opacity=".45"/>' + ascheKranz(),
    // Waldfels: grauer Stein, Moos auf der Seite zum Licht, Farn in den Fugen; moos und farn zeichnet felsTextur dazu (neu mit Set 7)
    fels: { m: 7, h: 6, krone: '#7a7a6e', licht: '#a7ac84', fuge: '#43433b', front: '#55554c', frontFuge: '#3a3a33', flanke: '#66665b', moos: '#7f9050', farn: '#6c8743' },
    // Wetter: Bucheckern und Nadeln auf der Seite zum Licht, auf den gemeinsamen Dingen draußen (und drinnen unter einer Wehe)
    wetter: {
      fass: waldWetter(13.2, 12.4, 10, 19, 9.6),
      kiste: waldWetter(12, 11.4, 20, 17.6, 9.4),
      truhe: waldWetter(10.6, 5.6, 0, 15.6, 4.2),
      stuhl: waldWetter(13.6, 14.4, 30, 18.4, 13),
      hocker: waldWetter(15.4, 15, 15, 19.4, 13.6),
      tisch: waldWetter(11, 10.6, 25, 16.4, 9.2),
      bank: waldWetter(9.6, 15.4, 10, 14.6, 14.2)
    },
    muster: {
      waldboden: { grund: '#b5a37b', bilder: [
        buchenblatt(9, 9, 5, 25, STREU[0], '#7a5c36') + buchenblatt(25, 8, 4.6, -50, STREU[1]) + buchenblatt(28, 20, 5, 70, STREU[2], '#6a5030') + buchenblatt(12, 22, 4.6, 120, STREU[3]) + buchenblatt(22, 29, 5, 10, STREU[1], '#8a6a40') + zweig(14, 14, 8, 30),
        moos(12, 12, 4.8) + moos(16.4, 16.4, 3) + wurzel('M19 30C22 26.6 26 27.4 30.6 23.4') + buchenblatt(27, 9, 4.6, 40, STREU[0], '#7a5c36') + buchenblatt(8, 27, 4.4, -20, STREU[3]),
        buchecker(10, 10, 10) + buchecker(25, 14, 40) + buchecker(15, 27, 70) + buchenblatt(20, 8, 4.8, -10, STREU[2], '#6a5030') + buchenblatt(28, 27, 4.6, 60, STREU[1]) + buchenblatt(8, 19, 4.4, 100, STREU[3]),
        nadeln(10, 11, 0) + nadeln(26, 26, 40) + '<ellipse cx="22" cy="12" rx="2.6" ry="1.9" transform="rotate(-20 22 12)" fill="#9d978a" stroke="#6f695f" stroke-width=".7"/><circle cx="21.4" cy="11.4" r=".7" fill="#c9c3b5"/>' + buchenblatt(13, 25, 4.8, 30, STREU[0], '#7a5c36') + buchenblatt(28, 15, 4.4, -70, STREU[1]) + buchenblatt(19, 31, 4.2, 150, STREU[3])
      ], selten: pilzgruppe(18, 17) },
      unterholz: { grund: '#9e8d65', bilder: [
        buchenblatt(28, 7, 4.2, 20, STREU[2]) + buchenblatt(7, 30, 4.2, -30, STREU[0]) + farnhorst(12, 13, 9, 15) + farnhorst(25, 24, 9.4, 50) + trieb(28.5, 16.6) + trieb(8.6, 25)
      ] },
      waldteich: { grund: '#4d655f', bilder: tiefwasser({ fleck: '#445b56', deckung: .9, farbe: '#7d958d', breite: 1, bogen: 1.6, zahl: 4, glanz: '#a9bcb4' }), selten: buchenblatt(14, 14, 5, 30, '#b08a4c', '#7a5c36') + buchenblatt(21, 18, 4.6, -40, '#c9a35f') + buchenblatt(15.6, 22.4, 4.4, 100, '#8f6a3c') + buchenblatt(23.4, 25, 4, 20, '#b08a4c') },
      waldfels: { grund: '#55554c', bilder: [
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7V13C29 12 23 11 15 13S5 14 0 13Z" fill="#7a7a6e"/><path d="M0 22C8 24 15 25 23 23S32 21 36 22V28C29 27 22 26 14 28S5 29 0 28Z" fill="#66665b"/>' +
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7M0 22C8 24 15 25 23 23S32 21 36 22" fill="none" stroke="#a7ac84" stroke-width="1" opacity=".7"/><path d="M12 16l2 4-1 3M26 3l-2 3M28 31l3 2M6 32l2-3" fill="none" stroke="#43433b" stroke-width="1.1" stroke-linecap="round"/>' +
        '<g fill="#7f9050"><ellipse cx="9" cy="8.6" rx="3.2" ry="1.6"/><ellipse cx="27" cy="23.4" rx="3" ry="1.5"/></g><g fill="#b3bf80"><circle cx="8" cy="8.2" r=".6"/><circle cx="26" cy="23" r=".6"/></g>'
      ] }
    },
    aufsatz: {
      wurzelstufen: '<rect x="4" y="4" width="28" height="7" fill="#cdb98f"/><rect x="4" y="11" width="28" height="7" fill="#bba67b"/><rect x="4" y="18" width="28" height="7" fill="#a8926a"/><rect x="4" y="25" width="28" height="7" fill="#957f5a"/>' +
        '<path d="M5 5.6h26M5 12.8h26M5 19.8h26M5 26.8h26" stroke="#e6d9b4" stroke-width="1" opacity=".8"/>' +
        [11, 18, 25].map(function (y) { var d = 'M4.6 ' + y + 'C9 ' + gr(y - 1.6) + ' 13 ' + gr(y + 1.4) + ' 18 ' + y + 'S27 ' + gr(y - 1.4) + ' 31.4 ' + gr(y + 0.6); return '<path d="' + d + '" fill="none" stroke="#4f3d2b" stroke-width="2.8" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#9a7f5c" stroke-width="1.2" stroke-linecap="round"/>'; }).join('') +
        '<g fill="#7f9050"><ellipse cx="9" cy="9.6" rx="2.4" ry="1.2"/><ellipse cx="25.6" cy="16.4" rx="2.2" ry="1.1"/><ellipse cx="12" cy="23.6" rx="2" ry="1"/></g>' + buchenblatt(24.6, 7.6, 3.6, 30, STREU[1]) + buchenblatt(19, 29, 3.4, -20, STREU[0]),
      buche: bucheTeile(1),
      bucheKrone: bucheTeile(2.1),
      buchenstamm: buchenstammTeile(),
      dorn: dornTeile(),
      stumpf: stumpfTeile()
    },
    kacheln: [
      { gruppe: 'Draußen', code: '.', name: 'Waldboden', art: 'Standard', muster: 'waldboden', kosten: 'kostet 1', text: 'Laubstreu in vier Varianten: braune Buchenblätter und ein Zweig, ein Moospolster mit einer Wurzel, die über den Boden läuft, die offenen Hüllen der Bucheckern, ein paar Nadeln und ein Stein. Zu viert in einem Muster von 72 Einheiten, damit kein Feld wie sein Nachbar aussieht. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, stehen Pilze.' },
      { code: ':', name: 'Unterholz', art: 'schwieriges Gelände', muster: 'unterholz', kosten: 'kostet 2', text: 'Farn und junge Buchen: zwei Farnhorste mit gefiederten Wedeln, hell zum Licht und dunkel auf der Schattenseite, dazwischen Triebe mit zwei Blättern. Derselbe Ton wie der Waldboden, eine Stufe dunkler, mehr Zeichnung; wer hindurch will, watet durch Farn. Die Karte zeigt alles, was darin steht; ob es die Sicht leicht verdeckt (PHB: mäßiges Laub), sagt die Spielleitung.' },
      { code: 'e', name: 'Waldweg', art: 'Weg', muster: 'waldboden', weg: true, kosten: 'kostet 1', naht: ['.e..', '.ee.', '..e.', '..ee'],
        proben: [[['.e.', 'iei', '.e.'], 'Steg: ein Wegfeld zwischen zwei Bachfeldern; man geht trocken', 108, true]],
        text: 'Festgetretene Erde zwischen zwei hellen Säumen aus zertretenem Laub, darin Huf- und Stiefelspuren. Dieselben fünf Formen und der Fleck wie in jedem Set; nur die Farben gehören dem Wald. Liegt ein Wegfeld zwischen zwei Bachfeldern (oder zwischen Bach und Teich), führt es als Steg über das Wasser: Bohlen auf zwei Balken, darunter fließt der Bach weiter. Es kostet wie der Weg.' },
      { code: 'i', name: 'Bach', art: 'seichtes Wasser, waten (Kantensatz)', muster: 'waldboden', bach: true, kosten: 'kostet 2', naht: ['.i..', '.ii.', '..i.', '..ii'], gross: ['.i..', '.ii.', '..i~', '..~~'],
        proben: [[['.i.', 'eie', '.i.'], 'Furt: ein Bachfeld zwischen zwei Wegfeldern, Kies und Trittsteine; man watet', 108, true], [['FFFF', '.i..', '.ii~', '..~~'], 'Quelle am Fels, Mündung in den Teich', 144, { hoehe: ['1111', '0000', '0000', '0000'] }]],
        text: 'Ein Waldbach, schmaler als ein Feld: ein Band klaren, grünlichen Wassers mit einer tieferen Rinne, Kräuseln und Steinen, gesäumt von hellem Ufer. Er ist das erste Wasser, das ein Kantensatz ist wie der Weg: Das Band tritt bei 12 und 24 senkrecht über den Rand und schwingt dazwischen frei; dieselben Formen wie der Weg, dazu die Quelle, wo er beginnt, und der Quelltopf, wenn er für sich liegt. Er schließt an Bach und Kartenrand an; wo er endet, fließt er in den Teich, einmal und durch eine Lücke in dessen Ufer. Das Feld kostet 2, denn man watet; schwimmen muss man erst im Teich. Liegt ein Bachfeld zwischen zwei Wegfeldern, ist es eine Furt mit Kies und Trittsteinen. Er nimmt das Zeichen des Eises wie das seichte Wasser im Sumpf. Unter ihm liegt kein seltenes Detail.' },
      { code: '~', name: 'Waldteich', art: 'tiefes Wasser, schwimmen', muster: 'waldteich', rand: '#2f433f', kosten: 'kostet 2', naht: ['....', '.~~.', '.~~~', '..~.'],
        proben: [[['~~~~~~', '~~~~~~', '~~~~~~', '~~~~~~'], 'große Fläche: Die Flecken laufen über die Felder', 216], [['.i.', '.i.', '~~~'], 'am Bach: die Mündung', 108, true]],
        text: 'Stilles, dunkles Wasser mit tieferem Fleck und wenigen Kräuseln; hier schwimmt man. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, treibt Laub darauf. Am Land ein Ufer in der Farbe des Nachbarn. Wo ein Bach endet und hereinfließt, hat das Ufer eine Lücke, die Mündung: Das Band läuft durch den Saum, weitet sich und geht ins Teichwasser über. Läuft ein Bach nur am Teich vorbei, zählt er für das Ufer als Land. Zu viert in einem Muster von 72 Einheiten; die Flecken laufen über die Felder, damit eine große Wasserfläche nicht stempelt.' },
      { gruppe: 'Höhe und Wände', code: '/', name: 'Wurzelstufen', art: 'Treppe, Rampe', muster: 'waldboden', aufsatz: 'wurzelstufen', dreht: true, kosten: 'kostet 1, eine Stufe ohne Klettern', text: 'Stufen aus Erde am Hang, jede vorn von einer Wurzel gefasst, die sich krumm von Seite zu Seite zieht, mit Moos und Laub; nach oben heller wie die Ebenen der Karte, mit Lichtkanten und dem Schattenkeil. Hinauf liegt bei 0° oben; auf der Karte zeigt die Höhe der Nachbarn die Richtung.' },
      { code: 'F', name: 'Waldfels', art: 'Fels, gewachsen', muster: 'waldfels', kosten: 'gesperrt, ganzes Feld',
        proben: [[['..O...', 'F/FFFF', '......', '..::..'], 'Felskante mit Wurzelstufen, oben eine Buche', 216, { hoehe: ['111111', '111111', '000000', '000000'] }], [['FFFF', '~~~~', '~~~~'], 'am Teich: der Fuß steht im Wasser', 144, { hoehe: ['1111', '0000', '0000'] }]],
        text: 'Gewachsen, darum keine Mauer, sondern eine Abbruchkante von oben, wie in jedem Set ohne Felsmasse: grauer Stein in Brocken, die über die Felder durchlaufen, mit Moospolstern auf der Seite zum Licht und Farn in den Fugen; an der höheren Seite die Lippe mit der angedeuteten oberen Ebene, an der tieferen der Fuß und ein Schlagschatten. Welche Seite oben ist, sagen die Höhen der Karte. Steht er am Teich, steht sein Fuß im Wasser. Eine niedrige Böschung bleibt eine Kante von Ebenen mit dem Steinrand, der im Wald aus bemoostem Stein ist.' },
      { gruppe: 'Umgebung', code: 'O', name: 'Buche', art: 'Baum', muster: 'waldboden', aufsatz: 'buche', krone: 'bucheKrone', stamm: 'buchenstamm', dach: [bucheUmriss(2.1), bucheUmriss(1)], kosten: 'nicht betretbar, Dreiviertel-Deckung',
        proben: [[['.O.O.', '.....', 'O.O.O', '.....', '.O.O.'], 'dichter Wald: die Schatten schließen sich zum Kronendach', 180]],
        text: 'Eine Rotbuche. Für sich (Band, Legende) zeigt sie ihre Krone von oben: dicht und glatt, das Laub in Lagen wie Dachschindeln, jede innere Lage heller und zum Licht verschoben. Auf der Karte steht man unter ihr, in jeder Ansicht: Zu sehen ist der Stamm mit Wurzelanlauf, holzbraun (die Rinde einer Buche ist grau, doch grau läse er sich auf der Karte wie ein Stein), und die Krone liegt nur als Schatten mit Lichtflecken auf dem Boden, gut 3 m breit, halb über den acht Nachbarfeldern. Wo sich die Kronen schließen, wird daraus das Kronendach, und alles darunter bleibt zu sehen. Gesperrt ist nur das Feld mit dem Stamm; der Schatten gibt keine Deckung und endet wie eine Krone an Haus, Tür und Kartenrand. In einer Nische steht ein junger Baum mit dünnem Stamm und kleinem Schatten. Rund, darum dreht sie nicht.' },
      { code: 'd', name: 'Brombeere', art: 'Busch, Dickicht', muster: 'waldboden', aufsatz: 'dorn', kosten: 'kostet 2, schwieriges Gelände', text: 'Ein Hügel aus Brombeerranken: dunkle Blätter unter gemeinsamem Umriss, rötliche Ranken mit Dornen, die im Bogen herausragen, dunkle Beeren und zwei weiße Blüten. Dunkler und spitzer im Umriss als die Hecke; wer hindurch will, bleibt hängen.' },
      { code: 'x', name: 'Baumstumpf', art: 'Hindernis', muster: 'waldboden', aufsatz: 'stumpf', kosten: 'nicht betretbar', text: 'Was von einer gefällten Buche bleibt: Wurzeln, Rinde mit Moos, die helle Schnittfläche mit Jahresringen und einem Riss, an der Flanke zwei Baumpilze. Umriss in Tinte und der Schatten als versetzte Silhouette. Rund, darum dreht er nicht.' }
    ]
  };
  WALD.nachCode = {};
  WALD.kacheln.forEach(function (k) { WALD.nachCode[k.code] = k; });

  // Set 8: Wüste. Unter freiem Himmel: Sand mit Windrippeln, Tiefsand mit Sicheldünen, Dünen als Höhe, über die man geht, Treibsand,
  // Salzkruste, eine Oase mit Dattelpalmen, Sandsteinfelsen, Dornbusch und das Gerippe eines großen Tiers; manchmal ein Sandsturm.
  var WSAND = { grund: '#dcbc86', tief: '#ccaa72', zeichnung: '#b08a55', licht: '#f0dcae', dunkel: '#8f6c45' };
  // Windrippel: ein heller Kamm, dicht darunter seine Schattenseite; der Wind kommt von links oben, darum liegen alle gleich
  function wrippel(x, y, w, b) {
    b = b === undefined ? 1.2 : b;
    var d = 'M' + x + ' ' + y + 'q' + gr(w / 4) + ' -' + b + ' ' + gr(w / 2) + ' 0t' + gr(w / 2) + ' 0';
    return '<path d="' + d + '" fill="none" stroke="' + WSAND.licht + '" stroke-width="1.1" stroke-linecap="round"/><path d="' + d + '" transform="translate(.5 1.3)" fill="none" stroke="' + WSAND.zeichnung + '" stroke-width=".8" stroke-linecap="round" opacity=".75"/>';
  }
  // Kiesel mit Wüstenlack: dunkel glänzend, eine Lichtkante links oben
  function wkiesel(x, y, rx, ry, rot) {
    var t = ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"';
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '"' + t + ' fill="#7d6248" stroke="#5a4532" stroke-width=".6"/><path d="M' + gr(x - rx * 0.55) + ' ' + gr(y - ry * 0.15) + 'q' + gr(rx * 0.3) + ' ' + gr(-ry * 0.55) + ' ' + gr(rx * 0.8) + ' ' + gr(-ry * 0.55) + '" fill="none" stroke="#c9ab84" stroke-width=".8" stroke-linecap="round"' + t + '/>';
  }
  // Käferspur: feine Tupfen links und rechts einer geschwungenen Linie
  function kaeferspur(pts) {
    var o = '';
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy), nx = -dy / l, ny = dx / l;
      for (var j = 0; j < 3; j++) { var t = j / 3, x = a[0] + dx * t, y = a[1] + dy * t, s = j % 2 ? -1 : 1; o += '<circle cx="' + gr(x + nx * 1.2 * s) + '" cy="' + gr(y + ny * 1.2 * s) + '" r=".55"/>'; }
    }
    return '<g fill="' + WSAND.dunkel + '" opacity=".75">' + o + '</g>';
  }
  // Senke: eine flache Mulde, die der Wind ausgeblasen hat: innen links oben Schatten, rechts unten Licht
  function senke(cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + WSAND.tief + '" opacity=".55"/>' +
      '<path d="M' + gr(cx - rx * 0.9) + ' ' + gr(cy + ry * 0.2) + 'A' + rx + ' ' + ry + ' 0 0 1 ' + gr(cx + rx * 0.35) + ' ' + gr(cy - ry * 0.95) + '" fill="none" stroke="' + WSAND.zeichnung + '" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M' + gr(cx + rx * 0.9) + ' ' + gr(cy - ry * 0.2) + 'A' + rx + ' ' + ry + ' 0 0 1 ' + gr(cx - rx * 0.35) + ' ' + gr(cy + ry * 0.95) + '" fill="none" stroke="' + WSAND.licht + '" stroke-width="1.1" stroke-linecap="round"/>';
  }
  // Eidechsenspur (seltenes Detail): die Schwanzspur als Schlinge, links und rechts die kleinen Tritte
  function eidechse() {
    var d = 'M7 29C11 25 9 21 13 18S19 15 21 11S27 6 30 7';
    var tritte = [[9.6, 25.2, 1], [11.6, 21.4, -1], [14.6, 17.8, 1], [18.6, 15.8, -1], [20.8, 12, 1], [24.6, 8.6, -1]].map(function (p) { return '<circle cx="' + gr(p[0] + p[2] * 2) + '" cy="' + gr(p[1] + p[2] * 1.2) + '" r=".75"/><circle cx="' + gr(p[0] + p[2] * 2.9) + '" cy="' + gr(p[1] + p[2] * 0.4) + '" r=".5"/>'; }).join('');
    return '<path d="' + d + '" fill="none" stroke="' + WSAND.dunkel + '" stroke-width=".8" stroke-linecap="round" opacity=".7"/><g fill="' + WSAND.dunkel + '" opacity=".8">' + tritte + '</g>';
  }
  // Sicheldüne (Tiefsand): von oben ein Halbmond, die Spitzen zeigen mit dem Wind nach rechts; der Rücken zum Licht hell,
  // hinter dem Kamm die steile Leeseite im Schatten
  function sichel(cx, cy, s) {
    function p(x, y) { return gr(cx + x * s) + ' ' + gr(cy + y * s); }
    var ruecken = 'M' + p(5, -5.6) + 'Q' + p(-7.5, -5.5) + ' ' + p(-6.2, 0) + 'Q' + p(-7.5, 5.5) + ' ' + p(5, 5.6) + 'Q' + p(-1, 2.4) + ' ' + p(-0.6, 0) + 'Q' + p(-1, -2.4) + ' ' + p(5, -5.6) + 'Z';
    var lee = 'M' + p(5, -5.6) + 'Q' + p(-1, -2.4) + ' ' + p(-0.6, 0) + 'Q' + p(-1, 2.4) + ' ' + p(5, 5.6) + 'Q' + p(2.6, 1.6) + ' ' + p(2.8, 0) + 'Q' + p(2.6, -1.6) + ' ' + p(5, -5.6) + 'Z';
    var kamm = 'M' + p(5, -5.6) + 'Q' + p(-1, -2.4) + ' ' + p(-0.6, 0) + 'Q' + p(-1, 2.4) + ' ' + p(5, 5.6);
    return '<path d="' + ruecken + '" fill="' + WSAND.grund + '"/><path d="' + lee + '" fill="' + WSAND.dunkel + '" opacity=".42"/>' +
      '<path d="M' + p(-6.2, 0) + 'Q' + p(-7.5, -5.5) + ' ' + p(5, -5.6) + '" fill="none" stroke="' + WSAND.licht + '" stroke-width="1" opacity=".9"/><path d="' + kamm + '" fill="none" stroke="' + WSAND.licht + '" stroke-width="1.3" stroke-linecap="round"/>';
  }
  // Treibsand: glatter, nasser Sand ohne Rippeln; um die Stelle, an der etwas versinkt, eine Mulde mit Ringen, ein Glanz, Blasen
  function treibsand() {
    return '<path d="M5 14C6 8 13 5 20 6S32 10 31.5 18 26 30 18 30.5 4.5 21 5 14Z" fill="#bd9f6e" opacity=".45"/>' +
      '<g fill="none" stroke-linecap="round"><path d="M12.4 23A9.6 7 0 0 1 29.4 14.8" stroke="#e3cda3" stroke-width=".9"/><path d="M14.6 21.4A6.8 4.9 0 0 1 26.8 15.6" stroke="#9c7f55" stroke-width=".9"/><path d="M17.4 20A3.6 2.6 0 0 1 24 16.8" stroke="#e3cda3" stroke-width=".9"/></g>' +
      '<ellipse cx="21.4" cy="19.4" rx="2.3" ry="1.6" fill="#a88b5f"/>' +
      '<path d="M8 11q3.6-3.2 9-3.6" fill="none" stroke="#f0dfbc" stroke-width="1.2" stroke-linecap="round" opacity=".85"/>' +
      '<g fill="#a88b5f" stroke="#e2cda2" stroke-width=".6"><circle cx="27.4" cy="26.4" r="1"/><circle cx="24.4" cy="28.6" r=".7"/><circle cx="29" cy="9.6" r=".7"/></g>';
  }
  // seltenes Detail: ein dürrer Ast, halb versunken, mit einem Ring im Sand um seinen Fuß
  function versunkenerAst() {
    return '<path d="M8.4 25.6l4.4-3.4M10.8 23.8l.2-2.6" fill="none" stroke="#3b3028" stroke-width="2.2" stroke-linecap="round"/><path d="M8.4 25.6l4.4-3.4M10.8 23.8l.2-2.6" fill="none" stroke="#8a7050" stroke-width="1.1" stroke-linecap="round"/><ellipse cx="8.4" cy="25.8" rx="2" ry="1.2" fill="none" stroke="#9c7f55" stroke-width=".7"/>';
  }
  // Salzkruste: weiße Polygone mit aufgeworfenen Rändern (Licht, Schatten rechts unten); die Ränder laufen an denselben Stellen über die Kanten
  var SALZ_NETZ = 'M9.8 -1.5L11 7M27.2 -1.5L26 9M-1.5 8.1L11 7L26 9L37.5 7.9M11 7L17 19L26 9M17 19L8 27L-1.5 23.4M17 19L28 26L37.5 23.6M8 27L10.3 37.5M28 26L26.9 37.5';
  function salzkruste() {
    return '<path d="M5 12l3.4 1.4 1 3.2-2.8 1.4z" fill="#ddd5c0"/><path d="M21 13l3 .8.6 3-2.6.6z" fill="#ddd5c0"/>' +
      '<svg width="36" height="36" overflow="hidden"><path d="' + SALZ_NETZ + '" transform="translate(.7 .8)" fill="none" stroke="#b9ad93" stroke-width="1.1" stroke-linejoin="round"/><path d="' + SALZ_NETZ + '" fill="none" stroke="#fbf8ef" stroke-width="1.3" stroke-linejoin="round"/></svg>' +
      '<path d="M18 12l-2 3M21 28l2.4 1.6M5 15l2.2 .6M30 16l-1.6 2M14 31l1.4-2" stroke="#c4b99f" stroke-width=".8" stroke-linecap="round"/>';
  }
  // Fische im klaren Wasser (seltenes Detail der Oase): ein kleiner Schwarm, alle in dieselbe Richtung
  function fische() {
    return [[12, 14, -24, 1], [17.4, 11.4, -18, 0.9], [15.4, 18.6, -28, 1.05], [21.6, 15.4, -14, 0.9], [24.4, 21, -30, 1]].map(function (p) {
      var x = p[0], y = p[1], s = p[3];
      return '<g transform="rotate(' + p[2] + ' ' + x + ' ' + y + ')"><path d="M' + gr(x - 2.6 * s) + ' ' + y + 'Q' + gr(x - 0.4 * s) + ' ' + gr(y - 1.5 * s) + ' ' + gr(x + 2 * s) + ' ' + y + 'Q' + gr(x - 0.4 * s) + ' ' + gr(y + 1.5 * s) + ' ' + gr(x - 2.6 * s) + ' ' + y + 'Z" fill="#2f5c56"/>' +
        '<path d="M' + gr(x - 2.4 * s) + ' ' + y + 'l' + gr(-1.6 * s) + ' ' + gr(-1.1 * s) + 'v' + gr(2.2 * s) + 'z" fill="#2f5c56"/><path d="M' + gr(x - 1.2 * s) + ' ' + gr(y - 0.5 * s) + 'h' + gr(2 * s) + '" stroke="#b8d8cf" stroke-width=".6" stroke-linecap="round"/></g>';
    }).join('');
  }
  // Schichten im Sandstein (fels.schichten): flache Bänder über 72 × 72, die am Rand des Musters an derselben Stelle weiterlaufen
  var SCHICHTEN = 'M0 10C12 8 24 12 36 10S60 8 72 10M0 22C14 24 26 20 38 22S62 24 72 22M0 34C10 32 22 36 34 34S58 32 72 34M0 46C12 48 26 44 40 46S60 48 72 46M0 58C14 56 24 60 36 58S62 56 72 58M0 70C10 72 24 68 36 70S60 72 72 70';
  // Wetter des Sets: feiner Staub auf der Seite zum Licht, darin ein Rippel
  function staubWetter(x, y, w, rot) {
    return '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')"><path d="M' + gr(x - w / 2) + ' ' + y + 'Q' + x + ' ' + gr(y - w * 0.42) + ' ' + gr(x + w / 2) + ' ' + y + 'Q' + x + ' ' + gr(y + w * 0.2) + ' ' + gr(x - w / 2) + ' ' + y + 'Z" fill="#d6a874"/>' +
      '<path d="M' + gr(x - w * 0.3) + ' ' + gr(y - w * 0.08) + 'q' + gr(w * 0.15) + ' -.8 ' + gr(w * 0.3) + ' 0t' + gr(w * 0.3) + ' 0" fill="none" stroke="#f0dcae" stroke-width=".8" stroke-linecap="round"/></g>';
  }
  // Ring um das Lagerfeuer: Asche, dazwischen getrocknete Dungfladen, das Brennholz der Wüste
  function dungFladen() {
    return [37, 157, 277].map(function (w) {
      var a = w * Math.PI / 180, x = gr(18 + 14.1 * Math.cos(a)), y = gr(18 + 14.1 * Math.sin(a));
      return '<circle cx="' + x + '" cy="' + y + '" r="1.9" fill="#7b5d3f" stroke="#a68660" stroke-width=".7"/><path d="M' + gr(x - 0.9) + ' ' + gr(y - 0.3) + 'l1.2 .5 .7 -.8" fill="none" stroke="#5c4430" stroke-width=".6" stroke-linecap="round"/>';
    }).join('');
  }
  // Dattelpalme: von oben ein Stern aus gefiederten Wedeln. Jeder Wedel ist eine Feder mit gezacktem Rand (die Fiedern), krumm zur Spitze;
  // die unteren, älteren Wedel dunkler, die oberen, jüngeren heller und kürzer; in der Mitte das Herz mit Dattelrispen.
  // f ist der Maßstab um die Feldmitte (1 für sich, 2,1 auf der Karte): Mit ihm wachsen Zahl der Wedel und Fiedern, nicht die Strichstärke.
  var PALME = { umriss: '#3b3028', unten: '#4a6331', grund: '#617d3b', licht: '#7f9b4b', jung: '#9ab25e', rippe: '#3d5228', dattel: '#9a5f2e', dattelLicht: '#c9894a', herz: '#7d6446' };
  function wedel(a, L, W, n, krumm) {
    function pt(t, s) { var phi = a + krumm * t * t, r = 1.6 + (L - 1.6) * t; return [18 + r * Math.cos(phi) - s * Math.sin(phi), 18 + r * Math.sin(phi) + s * Math.cos(phi)]; }
    function br(t) { return W * Math.pow(Math.sin(Math.PI * Math.min(t, 0.999)), 0.75); }
    var li = [], re = [];
    for (var k = 0; k < n; k++) { var t0 = (k + 0.15) / n, t1 = (k + 0.75) / n; li.push(pt(t0, br(t0) * 0.24), pt(t1, br(t1))); re.push(pt(t0, -br(t0) * 0.24), pt(t1, -br(t1))); }
    var p = [pt(0, 0)].concat(li, [pt(1, 0)], re.reverse());
    return { flaeche: 'M' + p.map(function (q) { return gr(q[0]) + ' ' + gr(q[1]); }).join('L') + 'Z', rippe: 'M' + gr(pt(0.08, 0)[0]) + ' ' + gr(pt(0.08, 0)[1]) + 'Q' + gr(pt(0.55, 0)[0]) + ' ' + gr(pt(0.55, 0)[1]) + ' ' + gr(pt(0.94, 0)[0]) + ' ' + gr(pt(0.94, 0)[1]) };
  }
  function palmeTeile(f) {
    var g = f > 1.5, unten = [], oben = [], nu = g ? 13 : 9, no = g ? 7 : 5, L = 14.6 * f, W = g ? 4.6 : 2.8, n = g ? 13 : 7;
    for (var i = 0; i < nu; i++) { var a = -Math.PI / 2 + 0.2 + i * 2 * Math.PI / nu + ((i * 7) % 3 - 1) * 0.05; unten.push({ a: a, w: wedel(a, L * (1 - ((i * 5) % 3) * 0.04), W, n, ((i % 2) ? 0.22 : -0.22)) }); }
    for (var j = 0; j < no; j++) { var b = -Math.PI / 2 + 0.55 + j * 2 * Math.PI / no; oben.push({ a: b, w: wedel(b, L * 0.62, W * 0.82, Math.max(4, n - 3), (j % 2) ? -0.18 : 0.18) }); }
    function licht(a) { return Math.cos(a + 3 * Math.PI / 4) > 0.3; }
    // von rechts unten nach links oben, damit die Wedel zum Licht obenauf liegen
    unten.sort(function (p, q) { return Math.cos(p.a + 3 * Math.PI / 4) - Math.cos(q.a + 3 * Math.PI / 4); });
    oben.sort(function (p, q) { return Math.cos(p.a + 3 * Math.PI / 4) - Math.cos(q.a + 3 * Math.PI / 4); });
    var alle = unten.concat(oben), sil = alle.map(function (e) { return '<path d="' + e.w.flaeche + '"/>'; }).join('');
    var koerper = unten.map(function (e) { return '<path d="' + e.w.flaeche + '" fill="' + (licht(e.a) ? PALME.grund : PALME.unten) + '"/><path d="' + e.w.rippe + '" fill="none" stroke="' + PALME.rippe + '" stroke-width=".8" stroke-linecap="round"/>'; }).join('') +
      oben.map(function (e) { return '<path d="' + e.w.flaeche + '" fill="' + (licht(e.a) ? PALME.jung : PALME.licht) + '" stroke="' + PALME.rippe + '" stroke-width=".5" stroke-linejoin="round"/><path d="' + e.w.rippe + '" fill="none" stroke="' + PALME.rippe + '" stroke-width=".7" stroke-linecap="round"/>'; }).join('');
    // Dattelrispen: kleine Trauben zwischen den Wedeln, nahe am Herz
    var rispen = [[0.6, 4.2], [2.6, 3.8], [4.4, 4.4]].map(function (r) { var x = 18 + r[1] * Math.cos(r[0]), y = 18 + r[1] * Math.sin(r[0]); return '<g fill="' + PALME.dattel + '" stroke="#3b3028" stroke-width=".4"><circle cx="' + gr(x) + '" cy="' + gr(y) + '" r="1.1"/><circle cx="' + gr(x + 1.2) + '" cy="' + gr(y + 0.7) + '" r="1"/><circle cx="' + gr(x + 0.2) + '" cy="' + gr(y + 1.4) + '" r="1"/></g><circle cx="' + gr(x - 0.3) + '" cy="' + gr(y - 0.3) + '" r=".4" fill="' + PALME.dattelLicht + '"/>'; }).join('');
    return {
      schatten: sil,
      form: '<g fill="' + PALME.umriss + '" stroke="' + PALME.umriss + '" stroke-width="1.3" stroke-linejoin="round">' + sil + '</g>' + koerper + rispen +
        '<circle cx="18" cy="18" r="' + (g ? 2.2 : 1.7) + '" fill="' + PALME.herz + '" stroke="#3b3028" stroke-width=".7"/>'
    };
  }
  // Dornbusch (Akazie): sparrige Zweige mit weißen Dornen, daran kleine, krause Büschel aus feinem, graugrünem Laub und ockerne Blütenkugeln;
  // zwischen den Büscheln sieht man den Sand
  var AKAZIE_ZWEIGE = 'M18 18C15 15 11 13 7.4 9.8M12.4 14.2C11.6 12 11 10.4 11.2 7.6M18 18C19 14 20.4 9.6 22.6 5.8M20.2 12.4C22.4 11.4 24.4 10.8 26.6 11M18 18C22 18.4 26.6 19.4 30.8 18.2M25 18.9C26.6 21 27.6 23.4 28 25.6M18 18C18.6 22 20 26 22.4 30.4M19.6 24.4C17.4 26 16 27.8 15 30.4M18 18C14.6 20.4 10.6 21.8 6.6 23.4M11.2 21.6C9.6 19.6 7.8 18.4 5.6 17.6';
  var AKAZIE_BUESCHEL = [[8.6, 10.4, 3], [11.6, 7.6, 2.5], [22.4, 6.8, 3], [26.4, 11.4, 2.5], [30, 18.4, 3], [27.8, 25.2, 2.7], [22, 29.4, 3], [15.2, 29.6, 2.5], [7.2, 22.8, 3], [6, 17.2, 2.5], [14.8, 14.4, 2.7], [22, 21.6, 2.9]];
  var AKAZIE_DORNEN = [[9.6, 11.2, 230], [8.2, 11.6, 120], [16, 15.6, 250], [21.6, 8.6, 300], [20.4, 10.4, 200], [27.4, 18.8, 290], [24.6, 19.6, 70], [19.6, 26.6, 0], [21.6, 27.8, 140], [9.6, 22.2, 80], [13.6, 20.6, 260], [24, 11.2, 260]];
  function akazieTeile() {
    // kleiner als die Palme, damit man ihn als betretbar liest: um die Feldmitte auf 86 %
    var KLEINER = '<g transform="translate(18 18) scale(.86) translate(-18 -18)">';
    var w = function (b, plus, ph) { return '<path d="' + wolke(b[0], b[1], gr(b[2] + plus), 7, ph) + '"/>'; };
    var d = AKAZIE_DORNEN.map(function (p) { var a = p[2] * Math.PI / 180; return 'M' + p[0] + ' ' + p[1] + 'l' + gr(1.7 * Math.cos(a)) + ' ' + gr(1.7 * Math.sin(a)); }).join('');
    var laub = '';
    AKAZIE_BUESCHEL.forEach(function (b, i) { [[-0.4, -0.35, 30], [0.25, -0.45, -40], [-0.45, 0.15, 80]].forEach(function (q) { var x = gr(b[0] + q[0] * b[2]), y = gr(b[1] + q[1] * b[2]), a = (q[2] + i * 31) * Math.PI / 180; laub += 'M' + gr(x - 0.8 * Math.cos(a)) + ' ' + gr(y - 0.8 * Math.sin(a)) + 'l' + gr(1.6 * Math.cos(a)) + ' ' + gr(1.6 * Math.sin(a)); }); });
    var bluete = [[13.6, 9.6], [25.4, 14.6], [25, 27.4], [9.4, 19.8]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.35" fill="#c9a34a" stroke="#8f7232" stroke-width=".5"/><circle cx="' + gr(p[0] - 0.4) + '" cy="' + gr(p[1] - 0.4) + '" r=".45" fill="#e8cf86"/>'; }).join('');
    return {
      schatten: KLEINER + AKAZIE_BUESCHEL.map(function (b, i) { return w(b, 0.7, i * 0.5); }).join('') + '<path d="' + AKAZIE_ZWEIGE + '" fill="none" stroke="#2a2119" stroke-width="1.6"/></g>',
      form: KLEINER + '<path d="' + AKAZIE_ZWEIGE + '" fill="none" stroke="#3b3028" stroke-width="2.4" stroke-linecap="round"/><path d="' + AKAZIE_ZWEIGE + '" fill="none" stroke="#7a6248" stroke-width="1.2" stroke-linecap="round"/>' +
        '<path d="' + d + '" stroke="#f2ead6" stroke-width=".9" stroke-linecap="round"/>' +
        '<g fill="#3b3028">' + AKAZIE_BUESCHEL.map(function (b, i) { return w(b, 0.7, i * 0.5); }).join('') + '</g><g fill="#878d5d">' + AKAZIE_BUESCHEL.map(function (b, i) { return w(b, 0, i * 0.5); }).join('') + '</g>' +
        '<g fill="#6b7147">' + AKAZIE_BUESCHEL.map(function (b) { return '<circle cx="' + gr(b[0] + b[2] * 0.32) + '" cy="' + gr(b[1] + b[2] * 0.32) + '" r="' + gr(b[2] * 0.52) + '"/>'; }).join('') + '</g>' +
        '<path d="' + laub + '" stroke="#bcc190" stroke-width=".8" stroke-linecap="round"/>' + bluete + '</g>'
    };
  }
  // Gerippe eines großen Tiers: die Wirbelsäule schräg von links unten nach rechts oben, die Rippen in Bögen zu beiden Seiten,
  // oben der lange Schädel, unten das Becken; eine Wehe Sand hat den Schwanz begraben. Dreht nur nach Eintrag.
  var KNOCHEN = { hell: '#ebe2ca', schatten: '#b9ab8c', umriss: '#3b3028', loch: '#4a3d30' };
  // geschlossene, weiche Form durch Punkte (Mitte zwischen zwei Punkten, dazwischen der Punkt als Stütze)
  function weich(pt) { var n = pt.length, m = function (i) { var a = pt[i % n], b = pt[(i + 1) % n]; return gr((a[0] + b[0]) / 2) + ' ' + gr((a[1] + b[1]) / 2); }, d = 'M' + m(0); for (var i = 1; i <= n; i++) d += 'Q' + gr(pt[i % n][0]) + ' ' + gr(pt[i % n][1]) + ' ' + m(i); return d + 'Z'; }
  function gerippeTeile() {
    var A = [6.6, 29.6], B = [25, 11.6], dx = B[0] - A[0], dy = B[1] - A[1], l = Math.sqrt(dx * dx + dy * dy), ux = dx / l, uy = dy / l, nx = -uy, ny = ux, w = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
    function pt(t, s) { return [A[0] + dx * t + nx * s, A[1] + dy * t + ny * s]; }
    var rippen = '', wirbel = '';
    [[0.36, 7.6], [0.5, 9], [0.64, 8.8], [0.78, 7.2]].forEach(function (r) {
      [1, -1].forEach(function (s) {
        var p0 = pt(r[0], s * 1.5), p1 = pt(r[0] + 0.03, s * r[1] * 0.85), p2 = pt(r[0] - 0.13, s * r[1]);
        rippen += 'M' + gr(p0[0]) + ' ' + gr(p0[1]) + 'Q' + gr(p1[0]) + ' ' + gr(p1[1]) + ' ' + gr(p2[0]) + ' ' + gr(p2[1]);
      });
    });
    for (var i = 0; i < 10; i++) { var p = pt(0.16 + i * 0.075, 0); wirbel += '<ellipse cx="' + gr(p[0]) + '" cy="' + gr(p[1]) + '" rx="1.6" ry="2.2" transform="rotate(' + w + ' ' + gr(p[0]) + ' ' + gr(p[1]) + ')"/>'; }
    // der Schädel: hinten breit (die Augenhöhlen links und rechts), vorn die Schnauze
    var kl = 10.4, sk = [[0, 2.4], [0.28, 3.6], [0.56, 2.4], [0.86, 1.5], [1, 0.6]];
    function sp(t, s) { return [B[0] + ux * kl * t + nx * s, B[1] + uy * kl * t + ny * s]; }
    var kopf = weich(sk.map(function (q) { return sp(q[0], q[1]); }).concat(sk.slice().reverse().map(function (q) { return sp(q[0], -q[1]); })));
    var augen = [1, -1].map(function (s) { var a = sp(0.3, s * 2.2); return '<ellipse cx="' + gr(a[0]) + '" cy="' + gr(a[1]) + '" rx="1.3" ry=".9" transform="rotate(' + w + ' ' + gr(a[0]) + ' ' + gr(a[1]) + ')" fill="' + KNOCHEN.loch + '"/>'; }).join('');
    var naht = sp(0.08, 0), nase = sp(0.7, 0), nuestern = [1, -1].map(function (s) { var a = sp(0.9, s * 0.55); return '<circle cx="' + gr(a[0]) + '" cy="' + gr(a[1]) + '" r=".45" fill="' + KNOCHEN.loch + '"/>'; }).join('');
    var becken = weich([pt(0.04, 0), pt(0.1, 3), pt(0.18, 2.6), pt(0.16, 0), pt(0.18, -2.6), pt(0.1, -3)]);
    var wehe = 'M2.6 31.6C4.2 27.6 8.4 26.2 12.4 27.6C15.6 28.6 17.4 31.4 16.4 33.4H3.4C2.6 33 2.4 32.4 2.6 31.6Z';
    return {
      schatten: '<path d="' + rippen + '" fill="none" stroke="#2a2119" stroke-width="2" stroke-linecap="round"/>' + wirbel + '<path d="' + kopf + '"/><path d="' + becken + '"/>',
      form: '<path d="' + rippen + '" fill="none" stroke="' + KNOCHEN.umriss + '" stroke-width="2.6" stroke-linecap="round"/><path d="' + rippen + '" fill="none" stroke="' + KNOCHEN.hell + '" stroke-width="1.3" stroke-linecap="round"/>' +
        '<path d="' + becken + '" fill="' + KNOCHEN.hell + '" stroke="' + KNOCHEN.umriss + '" stroke-width="1.1"/>' +
        '<g fill="' + KNOCHEN.hell + '" stroke="' + KNOCHEN.umriss + '" stroke-width=".8">' + wirbel + '</g>' +
        '<path d="' + kopf + '" fill="' + KNOCHEN.hell + '" stroke="' + KNOCHEN.umriss + '" stroke-width="1.2" stroke-linejoin="round"/>' + augen +
        '<path d="M' + gr(naht[0]) + ' ' + gr(naht[1]) + 'L' + gr(nase[0]) + ' ' + gr(nase[1]) + '" stroke="' + KNOCHEN.schatten + '" stroke-width=".8" stroke-linecap="round"/>' + nuestern +
        '<path d="' + wehe + '" fill="' + WSAND.grund + '"/>' + wrippel(5, 31.2, 8, 0.7) + '<path d="M2.6 31.6C4.2 27.6 8.4 26.2 12.4 27.6C15.6 28.6 17.4 31.4 16.4 33.4" fill="none" stroke="' + WSAND.licht + '" stroke-width="1"/>'
    };
  }
  var WUESTE = {
    id: 'wueste', nr: 8, name: 'Wüste', standard: 'wuestensand', status: 'fertig', weheName: 'Sand und Staub',
    // Elf Zeichen draußen: dazu der Treibsand m, den die Kampfkarte als Schlamm schon kennt (Max, 2.11., wie der Morast im Sumpf)
    ordnung: '.:mei~/F#WL+=szclhTfpSHbruOdxokt',
    // Dünen (Max, 2.11.): Jede Kante einer Ebene, deren höheres Feld Sand zeigt, ist von selbst ein Hang: nur Schatten, kein Steinrand
    hangAuf: ['wuestensand', 'tiefsand', 'treibsand'],
    // Sandsturm (Max, 2.11.): der Nebel des Sets (nebel: 'leicht' | n), in Sandfarbe mit Streifen
    nebelStil: {
      name: 'Sandsturm', schleier: '#e2c595', deckung: 0.42, wand: '#cfae7b', schwade: '#e6cb9a', schwaden: 'M3 6h10M18 3h9M8 14h12M2 22h8M15 25h12M22 17h5', streifen: 'M4 7h9M18 12h8M6 20h11M21 26h6M2 27h4', streifenFarbe: '#f6e7c4',
      text: 'Ein Sandsturm ist der Nebel dieses Sets, nach derselben Regel, nur in Sandfarbe: Leichter Sandsturm (<code>nebel: \'leicht\'</code>) legt im Kampf einen sandfarbenen Schleier mit hellen Streifen über alles, was die Figur sieht; zu sehen bleibt alles, denn die Sicht ist nur leicht verdeckt (Regelwerk 9.7, Wahrnehmung mit den Augen hat Nachteil). Dichter Sandsturm (<code>nebel: n</code>) kommt nur in besonderen Fällen: Dann sieht die Figur nur, was höchstens n Felder entfernt liegt, dahinter die Sandwand mit allen Wesen darin. Licht hilft im Sandsturm nicht. Die Vorführung bleibt klar.',
      leicht: 'leichter Sandsturm: alles zu sehen', dicht: 'dichter Sandsturm, <code>nebel: 3</code> (besondere Fälle)',
      probe: ['.:...:.', '...:...', '..d..mm', '.:...m.', '.....:.']
    },
    text: 'Unter freiem Himmel: Sand, Dünen, Stein, Hitze, wenig Wasser und eine Oase. Draußen ist der Grund Sand mit Windrippeln, Kieseln, Käferspuren und ausgeblasenen Mulden; Tiefsand mit kleinen Sicheldünen ist das schwierige Gelände. Dünen sind Höhe: Ihre Kanten tragen nur Schatten, denn über Sand geht man hinauf, ohne zu klettern; den Steinrand gibt es nur, wo das höhere Feld kein Sand ist. Wie der Sumpf hat die Wüste elf Zeichen draußen: dazu den Treibsand (<code>m</code>), in dem man einsinkt wie im Morast; die Kampfkarte kennt ihn als Schlamm. Die Salzkruste einer ausgetrockneten Pfanne nimmt das Zeichen des Eises. Der Weg des Sets ist der Karawanenpfad aus festgetretenem Sand. Das Oasenwasser ist klar und blaugrün, das Ufer nimmt die Farbe des Nachbarn, und am Sandsteinfels steht der Fuß im Wasser. Der Sandsteinfels ist der Fels des Sets, rotocker und in Schichten; in ihn gehauene Stufen führen hinauf. Der Baum ist eine Dattelpalme, das Dickicht ein Dornbusch, das Hindernis das Gerippe eines großen Tiers. Das Wetter des Sets ist feiner Staub auf allem, was draußen steht; durch Lücken kommen Sand und Staub herein. Ein Sandsturm ist der Nebel des Sets, in Sandfarbe. Hitze ist Regelwerk 9.7 und keine Zeichnung. Die Tür ist die Standardtür.',
    rollen: [
      ['Grund', '#dcbc86', 'Sand, Ufer; Rippeln #f0dcae und #b08a55'], ['Grund dunkel', '#ccaa72', 'Tiefsand; Sicheldünen, Leeseite #8f6c45'], ['Treibsand', '#c8ab79', 'Mulde #a88b5f, Wellen #9c7f55 und #e3cda3, Glanz #f0dfbc, Rand #8a6e4c'], ['Zeichnung', '#b08a55', 'Rippelschatten; Kiesel #7d6248, Spuren #8f6c45'],
      ['Licht', '#f0dcae', 'Rippelkämme, Ufersaum, Stufenkanten'], ['Fels', '#b8865c', 'Sandstein: Brocken; Grund #9b6a48, Schichten #e6be90 mit Schatten #6a442c'], ['Wasser', '#4f8f86', 'Oase; Uferkante #2c5a54, Fische #2f5c56'], ['Eis', '#e9e3d2', 'Salzkruste (i): Ränder #fbf8ef, Schatten #b9ad93, Kante #b3a688'],
      ['Grün', '#617d3b', 'Dattelpalme #4a6331 bis #9ab25e, Datteln #9a5f2e; Dornbusch #878d5d, Blüten #c9a34a'], ['Weg', '#c9a671', 'Karawanenpfad; Kante #97744a, Saum #ecd8aa, Spuren #ab8858'], ['Knochen', '#ebe2ca', 'Gerippe; Schatten #b9ab8c'], ['Wetter', '#d6a874', 'Staub mit Rippeln auf allem, was draußen steht'],
      ['Sandsturm', '#e2c595', 'Schleier mit 42 %, Streifen #f6e7c4; Sandwand #cfae7b']
    ],
    ufer: { flaeche: WSAND.grund, linie: WSAND.licht, nachbar: true },
    weg: { wall: '#ecd8aa', band: '#c9a671', kante: '#97744a', spuren: '#ab8858' },
    // Sand und Staub drinnen: eine Zunge Sand mit Rippeln, ein Kiesel
    wehe: {
      2: '<path d="M2 31C6 26 12 25 18 27S30 31 34 28V34H2Z" fill="#d9b984" opacity=".92"/><path d="M4 11C8 9 13 10 16 12C12 14 7 14 4 11Z" fill="#d9b984" opacity=".85"/>' + wrippel(8, 30.4, 10, 0.8) + wrippel(21, 30.6, 9, 0.8) + wkiesel(25, 17, 1.6, 1.2, 20),
      1: '<path d="M6 27C10 24 15 25 17 28C13 30 9 30 6 27Z" fill="#d9b984" opacity=".8"/>' + wrippel(8.4, 26.6, 7, 0.7)
    },
    // Asche um das Lagerfeuer, dazwischen getrocknete Dungfladen
    feuerring: '<path d="' + FEUER_RING + '" fill="#5a4a3c" opacity=".42"/>' + dungFladen(),
    // Sandstein: Brocken in Rotocker, darüber Schichten; schichten zeichnet felsTextur dazu (neu mit Set 8)
    fels: { m: 7, h: 6, krone: '#b8865c', licht: '#e2ba8e', fuge: '#6a442c', front: '#9b6a48', frontFuge: '#86593c', flanke: '#a8764f', schichten: '#e6be90' },
    // Wetter: feiner Staub auf der Seite zum Licht, auf den gemeinsamen Dingen draußen (und drinnen unter einer Wehe)
    wetter: {
      fass: staubWetter(13.4, 12.6, 9, -35), kiste: staubWetter(12.6, 11.2, 9, -20), truhe: staubWetter(11, 5.6, 8, -10),
      stuhl: staubWetter(13.6, 15, 7, -25), hocker: staubWetter(15.4, 15, 7, -35), tisch: staubWetter(11.4, 10.4, 9, -20), bank: staubWetter(10, 15.8, 7, -10)
    },
    muster: {
      wuestensand: { grund: WSAND.grund, bilder: [
        wrippel(4, 7, 26) + wrippel(7, 13, 24) + wrippel(4, 19, 27) + wrippel(8, 25, 22) + wrippel(5, 31, 25),
        wrippel(5, 8, 22) + wkiesel(25, 12, 2.4, 1.7, 15) + wkiesel(11, 23, 1.8, 1.3, -20) + wkiesel(15, 26.4, 1.3, 1, 30) + wrippel(17, 30, 15),
        kaeferspur([[6, 28], [12, 22], [18, 21], [23, 15], [29, 9]]) + wrippel(4, 9, 14) + wrippel(17, 30.6, 14),
        senke(17, 18, 10, 6.4) + wrippel(5, 6, 20) + wrippel(12, 31, 19)
      ], selten: eidechse() },
      tiefsand: { grund: WSAND.tief, bilder: [
        sichel(14, 13, 1.25) + sichel(25, 26, 0.95) + wrippel(23, 7, 9, 0.8) + wrippel(4, 29, 9, 0.8) +
        '<g fill="' + WSAND.dunkel + '" opacity=".55"><ellipse cx="9" cy="28" rx="1.4" ry="2" transform="rotate(-20 9 28)"/><ellipse cx="13" cy="31" rx="1.4" ry="2" transform="rotate(-20 13 31)"/></g>'
      ] },
      treibsand: { grund: '#c8ab79', bilder: [treibsand()], selten: versunkenerAst() },
      salzkruste: { grund: '#e9e3d2', bilder: [salzkruste()] },
      oase: { grund: '#4f8f86', bilder: tiefwasser({ fleck: '#457f78', deckung: .9, farbe: '#a6cfc5', breite: 1, bogen: 1.6, zahl: 4, glanz: '#d4e9e2' }), selten: fische() },
      sandstein: { grund: '#9b6a48', bilder: [
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7V13C29 12 23 11 15 13S5 14 0 13Z" fill="#b8865c"/><path d="M0 22C8 24 15 25 23 23S32 21 36 22V28C29 27 22 26 14 28S5 29 0 28Z" fill="#a8764f"/>' +
        '<path d="M0 7C7 9 13 10 21 8S32 6 36 7M0 22C8 24 15 25 23 23S32 21 36 22" fill="none" stroke="#e6be90" stroke-width="1.1" opacity=".85"/><path d="M12 16l2 4-1 3M26 3l-2 3M28 31l3 2M6 32l2-3" fill="none" stroke="#6a442c" stroke-width="1.1" stroke-linecap="round"/>'
      ] }
    },
    aufsatz: {
      sandsteinstufen: '<rect x="4" y="4" width="28" height="7" fill="#e6c49c"/><rect x="4" y="11" width="28" height="7" fill="#d6af86"/><rect x="4" y="18" width="28" height="7" fill="#c49b71"/><rect x="4" y="25" width="28" height="7" fill="#b2885f"/>' +
        '<path d="M4 11H32M4 18H32M4 25H32" stroke="#6b4a32" stroke-width="1.6"/><path d="M5 5.6h26M5 12.6h26M5 19.6h26M5 26.6h26" stroke="#f3dcbc" stroke-width="1" opacity=".9"/>' +
        '<path d="M9 7.5l2 1.6M21 8l2 1.4M14 14.6l2 1.4M25 15l2 1.6M10 21.6l2 1.4M22 21.8l2 1.5M16 28.6l2 1.4M27 28.4l2 1.5" stroke="#94683f" stroke-width=".9" stroke-linecap="round"/>' +
        '<path d="M5 31.4C5.4 29.2 7.6 28 10.4 28.6C12.4 29 13.6 30.2 13.8 31.4Z" fill="' + WSAND.grund + '"/><path d="M27 17.4C27.6 15.8 29.6 15.4 31 16.2V17.4Z" fill="' + WSAND.grund + '"/>',
      palme: palmeTeile(1),
      palmeKrone: palmeTeile(2.1),
      dornbusch: akazieTeile(),
      gerippe: gerippeTeile()
    },
    kacheln: [
      { gruppe: 'Draußen', code: '.', name: 'Sand', art: 'Standard', muster: 'wuestensand', kosten: 'kostet 1',
        proben: [[['.......', '..:....', '.......', '.....ss', '.....ss'], 'Düne: Kanten auf Sand sind ein Hang, nur Schatten; der Steinrand bleibt am gebauten Boden', 216, { hoehe: ['0111000', '1122100', '0112100', '0011011', '0000011'] }]],
        text: 'Warmer, ockerfarbener Sand in vier Varianten: Windrippeln, die alle gleich liegen, weil der Wind von links oben kommt, Kiesel mit dunklem Wüstenlack, die Spur eines Käfers, eine Mulde, die der Wind ausgeblasen hat. Zu viert in einem Muster von 72 Einheiten, damit kein Feld wie sein Nachbar aussieht. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, läuft die Spur einer Eidechse darüber. Dünen sind Sand in Ebenen: Ihre Kanten tragen nur Schatten, denn über Sand geht man hinauf, ohne zu klettern.' },
      { code: ':', name: 'Tiefsand', art: 'schwieriges Gelände', muster: 'tiefsand', kosten: 'kostet 2', text: 'Weicher, tiefer Sand, in den der Fuß einsinkt: zwei kleine Sicheldünen, deren Spitzen mit dem Wind nach rechts zeigen, der Rücken zum Licht hell, hinter dem Kamm die steile Leeseite im Schatten, dazu Rippeln und zwei tiefe Tritte. Derselbe Ton wie der Sand, eine Stufe dunkler, mehr Zeichnung; wer hindurch will, watet durch Sand.' },
      { code: 'm', name: 'Treibsand', art: 'schwieriges Gelände, man sinkt ein (neu im Set)', muster: 'treibsand', rand: '#8a6e4c', kosten: 'kostet 2', naht: ['....', '.mm.', '.mmm', '..m.'],
        proben: [[['iii..', 'imm.:', '.mmm.', '..m~~'], 'an der Salzkruste und an der Oase', 180]],
        text: 'Sand, der Wasser hält und nachgibt: glatt und dunkel, ohne Rippeln, eine Mulde mit Wellen ringsum, wo etwas versunken ist, ein nasser Glanz, Blasen. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, ragt ein dürrer Ast heraus. Neu im Set wie der Morast im Sumpf: In der Kampfkarte heißt das Zeichen <code>m</code> Schlamm, schwieriges Gelände; wer hineingerät, sinkt ein, und wo die Spielleitung es sagt, hält er fest (Regelwerk 9.7: Treibsand und Schlammloch). Eine Fläche mit Rand aus Vierteln: Zum Sand hin ein Saum in der Farbe des Nachbarn, zum Wasser und zur Salzkruste hin keiner.' },
      { code: 'e', name: 'Karawanenpfad', art: 'Weg', muster: 'wuestensand', weg: true, kosten: 'kostet 1', naht: ['.e..', '.ee.', '..e.', '..ee'], text: 'Festgetretener Sand zwischen zwei hellen Säumen aus losem Sand, darin die Tritte von Kamelen und Lasttieren. Dieselben fünf Formen und der Fleck wie in jedem Set; nur die Farben gehören der Wüste. Auf einer Düne ist er Sand wie alles andere: Seine Kanten sind ein Hang.' },
      { code: 'i', name: 'Salzkruste', art: 'schwieriges Gelände, glatt und brüchig', muster: 'salzkruste', rand: '#b3a688', kosten: 'kostet 2', naht: ['....', '.ii.', '.iii', '..i.'], text: 'Der Boden einer ausgetrockneten Salzpfanne: eine weiße Kruste in Polygonen, deren Ränder sich aufwerfen, mit Licht oben und Schatten rechts unten; die Ränder laufen über die Felder weiter. Sie nimmt das Zeichen des Eises, denn sie ist glatt und bricht unter dem Fuß, darunter liegt nasser Schlamm. Zum Sand hin ein Ufer aus Vierteln in der Farbe des Nachbarn.' },
      { code: '~', name: 'Oasenwasser', art: 'tiefes Wasser, schwimmen', muster: 'oase', rand: '#2c5a54', kosten: 'kostet 2', naht: ['....', '.~~.', '.~~~', '..~.'],
        proben: [[['~~~~~~', '~~~~~~', '~~~~~~', '~~~~~~'], 'große Fläche: Die Flecken laufen über die Felder', 216], [['.O.O.', '.~~~.', '~~~~O', '.~~..'], 'an der Oase: Palmen am Wasser', 180]],
        text: 'Klares, blaugrünes Wasser aus einer Quelle, tief genug zum Schwimmen: ein tieferer Fleck, Kräusel, ein Glanz. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, sieht man einen Schwarm kleiner Fische. Am Land ein Ufer in der Farbe des Nachbarn, an der Salzkruste und am Treibsand ebenso; am Sandsteinfels steht der Fuß im Wasser. Zu viert in einem Muster von 72 Einheiten; die Flecken laufen über die Felder, damit eine große Wasserfläche nicht stempelt.' },
      { gruppe: 'Höhe und Wände', code: '/', name: 'Sandsteinstufen', art: 'Treppe, Rampe', muster: 'wuestensand', aufsatz: 'sandsteinstufen', dreht: true, kosten: 'kostet 1, eine Stufe ohne Klettern', text: 'In den Sandstein gehauene Stufen mit Meißelspuren, nach oben heller wie die Ebenen der Karte, mit Lichtkante, dunkler Stufenlinie und dem Schattenkeil; in den Ecken hat sich Sand gesammelt. Hinauf liegt bei 0° oben; auf der Karte zeigt die Höhe der Nachbarn die Richtung.' },
      { code: 'F', name: 'Sandsteinfels', art: 'Fels, gewachsen', muster: 'sandstein', kosten: 'gesperrt, ganzes Feld',
        proben: [[['..O...', 'F/FFFF', '......', '..::..'], 'Felskante mit gehauenen Stufen, oben eine Palme', 216, { hoehe: ['111111', '111111', '000000', '000000'] }], [['FFFF', '~~~~', '~~~~'], 'an der Oase: der Fuß steht im Wasser', 144, { hoehe: ['1111', '0000', '0000'] }]],
        text: 'Gewachsen, darum keine Mauer, sondern eine Abbruchkante von oben, wie in jedem Set ohne Felsmasse: Sandstein in Rotocker, Brocken mit hellen Kanten zum Licht, darüber flache Schichten, die über die Felder durchlaufen; an der höheren Seite die Lippe mit der angedeuteten oberen Ebene, an der tieferen der Fuß und ein Schlagschatten. Welche Seite oben ist, sagen die Höhen der Karte. An der Oase steht sein Fuß im Wasser. Bewusst kein reines Rot, denn Rot gehört den Gegnern.' },
      { gruppe: 'Umgebung', code: 'O', name: 'Dattelpalme', art: 'Baum', muster: 'wuestensand', aufsatz: 'palme', krone: 'palmeKrone', kosten: 'nicht betretbar, Dreiviertel-Deckung', text: 'Eine Dattelpalme von oben: ein Stern aus gefiederten Wedeln, jeder eine lange Feder mit gezacktem Rand und dunkler Mittelrippe, die unteren älter und dunkler, die oberen jünger, heller und kürzer; im Herz der Krone hängen Datteln. Für sich allein ist sie auf ein Feld verkleinert; auf der Karte ist die Krone gut 3 m breit und ragt halb über die acht Nachbarfelder. Gesperrt ist nur das Feld mit dem Stamm, darunter geht man hindurch, und die Krone gibt keine Deckung. Rund, darum dreht sie nicht.' },
      { code: 'd', name: 'Dornbusch', art: 'Busch, Dickicht', muster: 'wuestensand', aufsatz: 'dornbusch', kosten: 'kostet 2, schwieriges Gelände', text: 'Eine Akazie, kniehoch: sparrige Zweige mit weißen Dornen, kleine Büschel aus feinem, graugrünem Laub und ockerne Blütenkugeln; zwischen den Büscheln sieht man den Sand. Kleiner und heller als die Palme, damit man ihn als betretbar liest; wer hindurch will, bleibt hängen.' },
      { code: 'x', name: 'Gerippe', art: 'Hindernis', muster: 'wuestensand', aufsatz: 'gerippe', dreht: true, kosten: 'nicht betretbar', text: 'Was von einem großen Tier geblieben ist: die Wirbelsäule schräg von links unten nach rechts oben, die Rippen in Bögen zu beiden Seiten, oben der lange Schädel, unten das Becken; eine Wehe Sand hat den Schwanz begraben. Gebleichte Knochen mit Umriss in Tinte und dem Schatten als versetzte Silhouette. Wie Treibholz und der umgestürzte Stamm dreht es nur nach Eintrag.' }
    ]
  };
  WUESTE.nachCode = {};
  WUESTE.kacheln.forEach(function (k) { WUESTE.nachCode[k.code] = k; });

  // Die Schiffsgrößen (Max, 2.11.): Länge × Breite in Feldern. Boote ohne Segel; dann ein Deck und ein Segel, zwei und zwei, drei und drei; vier Größen tragen dazu am Heck ein Kastell.
  var SCHIFFSKLASSEN = [
    { name: 'Offene Boote, ohne Segel', decks: 0, segel: 0, groessen: [[2, 1], [3, 1], [4, 2], [5, 2], [6, 2]] },
    { name: 'Ein Deck, ein Segel', decks: 1, segel: 1, groessen: [[6, 3], [7, 3], [9, 3], [8, 4], [10, 4], [12, 4]] },
    { name: 'Zwei Decks, zwei Segel', decks: 2, segel: 2, groessen: [[10, 5], [13, 5], [15, 5], [12, 6], [15, 6], [18, 6]] },
    { name: 'Drei Decks, drei Segel', decks: 3, segel: 3, groessen: [[14, 7], [18, 7], [21, 7], [19, 9], [30, 9]] }
  ];
  // Der Bauplan einer Größe: Bug nach Osten, Heck bei Spalte 1. oben: Zeilen des Oberdecks (~ außen), hoehe; masten, krieg (Felder der Ballisten), unten: je Unterdeck die Zeilen (# außen) und Luken; drehung (Bänke im Boot).
  function schiffBau(l, b) {
    var klasse = null; SCHIFFSKLASSEN.forEach(function (kl) { kl.groessen.forEach(function (g) { if (g[0] === l && g[1] === b) klasse = kl; }); });
    var decks = klasse.decks, kastell = decks === 3 && l >= 18;
    // Breite je Spalte: rund wie eine Kogge, am Bug etwas feiner als am Heck; immer dieselbe Parität wie die Schiffsbreite
    var breiten = [], minB = b % 2 ? (b >= 5 ? 3 : 1) : 2;
    for (var c = 1; c <= l; c++) {
      var t = (c - 0.5) / l, d = Math.abs(t - 0.5) / 0.5, p = t < 0.5 ? 2.6 : 2, f = Math.pow(1 - Math.pow(d, p), 0.6), w = b;
      while (w > minB && w - 2 >= b * f - 0.35) w -= 2;
      breiten.push(b <= 2 ? b : c === 1 || c === l ? minB : w);
    }
    function y0(cc) { return (b - breiten[cc - 1]) / 2 + 1; }
    function y1(cc) { return y0(cc) + breiten[cc - 1] - 1; }
    function drin(cc, y) { return cc >= 1 && cc <= l && y >= y0(cc) && y <= y1(cc); }
    function voll(cc) { return cc >= 2 && cc <= l - 1 && breiten[cc - 1] === b && breiten[cc - 2] === b && breiten[cc] === b; }
    var a2 = decks === 2 ? Math.max(2, Math.round(0.3 * l)) : decks === 3 ? Math.round(0.42 * l) : 0;
    var a3 = decks === 3 ? Math.round(0.26 * l) : 0, k4 = kastell ? Math.max(2, Math.round(0.13 * l)) : 0, ym = Math.ceil((b + 1) / 2);
    function ebene(cc) { return decks === 0 ? 0 : cc <= k4 ? 4 : cc <= a3 ? 3 : cc <= a2 ? 2 : 1; }
    var mastSp = decks === 1 ? [Math.round(0.55 * l)] : decks === 2 ? [Math.round(0.52 * l), Math.round(0.8 * l)] : decks === 3 ? [Math.round(0.34 * l), Math.round(0.58 * l), Math.round(0.82 * l)] : [];
    var masten = mastSp.map(function (cc) { return [cc, ym]; }), haupt = mastSp[decks === 3 ? 1 : 0], fock = mastSp[mastSp.length - 1];
    function neu(aussen) { var z = []; for (var y = 1; y <= b; y++) { var r = ''; for (var cc = 1; cc <= l; cc++) r += drin(cc, y) ? 'e' : aussen; z.push(r.split('')); } return z; }
    function setz(z, cc, y, s) { if (drin(cc, y)) z[y - 1][cc - 1] = s; }
    function frei(z, cc, y) { return drin(cc, y) && z[y - 1][cc - 1] === 'e'; }
    // Oberdeck
    var o = neu('~'), hoehe = [], drehung = {};
    for (var y = 1; y <= b; y++) { var hz = ''; for (c = 1; c <= l; c++) hz += drin(c, y) ? ebene(c) : '0'; hoehe.push(hz); }
    masten.forEach(function (m) { setz(o, m[0], m[1], 'O'); });
    if (decks === 0) {
      for (c = 2; c <= l - (l > 3 ? 1 : 0); c += 2) for (y = 1; y <= b; y++) { setz(o, c, y, 'b'); if (b === 1) drehung[c + ',' + y] = 90; }
    } else {
      var leiter = function (cc, y) { if (drin(cc, y)) setz(o, cc, y, '/'); };
      if (a2) { leiter(a2, y0(a2) + 1); leiter(a2, y1(a2) - 1); }
      if (a3) leiter(a3, y1(a3) - 1);
      if (k4) leiter(k4, y0(k4) + 1);
      // Fracht und Tauwerk an der Reling, nur wo der Rumpf voll breit ist
      var sp = []; for (c = a2 + 1; c <= l; c++) if (voll(c)) sp.push(c);
      if (sp.length) {
        var nord = sp[Math.floor(sp.length * 0.2)], sued = sp[Math.floor(sp.length * 0.4)], vorn = sp[Math.floor(sp.length * 0.75)];
        if (frei(o, nord, 1)) setz(o, nord, 1, 'o');
        if (frei(o, sued, b)) setz(o, sued, b, 'k');
        if (b >= 4 && frei(o, vorn, 1)) setz(o, vorn, 1, 'd');
        if (b >= 5 && frei(o, vorn, b)) setz(o, vorn, b, 'k');
      }
    }
    // Das Kriegsschiff: Ballisten. Vier Felder im Block sind eine große (DMG), bei drei Feldern Breite passt nur eine einfache
    var krieg = [];
    function block(cc, y) { [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (d) { krieg.push([cc + d[0], y + d[1]]); }); }
    if (decks >= 1) {
      var bugSp = l - 3; while (bugSp > 1 && (mastSp.indexOf(bugSp) >= 0 || mastSp.indexOf(bugSp + 1) >= 0 || !drin(bugSp + 1, ym - 1) || !drin(bugSp + 1, ym))) bugSp--;
      if (b === 3) krieg.push([l - 1, ym]); else block(bugSp, ym - 1);
      if (decks === 2 && a2 >= 3) block(a2 - 1, ym - 1);
      if (decks === 3) block(a3 - 1, ym - 1);
      if (b === 9) { var mitte = Math.round((haupt + fock) / 2) - 1; block(mitte, 2); block(mitte, b - 2); }
    }
    // Die Luken liegen auf der Mittellinie neben dem Hauptmast, nie unter einer Ballista; die obere nicht an der Kante zum Achterdeck, sonst wäre sie eine Leiter hinauf
    var lukeA = 0, lukeB = 0;
    if (decks >= 2) {
      [haupt + 1, haupt - 1, haupt + 2, haupt - 2, fock + 1, fock + 2].forEach(function (cc) {
        if (cc <= a2 || cc >= l || mastSp.indexOf(cc) >= 0) return;
        if (!lukeA) { if (cc > a2 + 1 && !krieg.some(function (q) { return q[0] === cc && q[1] === ym; })) lukeA = cc; }
      });
      [haupt + 1, haupt - 1, haupt + 2, haupt - 2].forEach(function (cc) { if (!lukeB && cc > a2 && cc !== lukeA && mastSp.indexOf(cc) < 0) lukeB = cc; });
      setz(o, lukeA, ym, '/');
    }
    // Unter Deck: derselbe Umriss, außen # (Rumpf von innen), Masten gehen durch, vorne der Laderaum, achtern hinter dem Schott die Kajüte. Oben Luke, unten Leiter.
    var unten = [];
    function unterdeck(titel, hinauf, hinab, wohnen) {
      var z = neu('#'), schott = a2; while (mastSp.indexOf(schott) >= 0) schott++;
      masten.forEach(function (m) { setz(z, m[0], m[1], 'O'); });
      for (var yy = y0(schott); yy <= y1(schott); yy++) setz(z, schott, yy, yy === ym ? '+' : 'W');
      if (hinauf) setz(z, hinauf, ym, '/');
      if (hinab) setz(z, hinab, ym, '/');
      // achtern
      if (wohnen) {
        var mc = Math.max(2, schott - 2); while (mc > 2 && (mastSp.indexOf(mc) >= 0 || mastSp.indexOf(mc - 1) >= 0)) mc--;
        if (frei(z, schott - 1, y0(schott - 1))) setz(z, schott - 1, y0(schott - 1), 't');
        if (schott >= 6) { setz(z, mc - 1, ym, 'p'); setz(z, mc, ym, 'p'); if (frei(z, mc, ym - 1)) setz(z, mc, ym - 1, 'H'); if (frei(z, mc - 1, ym + 1)) setz(z, mc - 1, ym + 1, 'H'); }
      } else {
        if (frei(z, schott - 1, y0(schott - 1))) setz(z, schott - 1, y0(schott - 1), 'k');
        if (frei(z, schott - 1, y1(schott - 1))) setz(z, schott - 1, y1(schott - 1), 'o');
      }
      // vorn: an beiden Seiten Fracht oder Bänke, die Mitte bleibt frei
      for (var cc = schott + 2; cc <= l - 1; cc += 2) {
        if (breiten[cc - 1] < 3) continue;
        var i = (cc - schott) / 2;
        [y0(cc), y1(cc)].forEach(function (yy, s) { if (!frei(z, cc, yy)) return; setz(z, cc, yy, wohnen ? (i % 3 === 0 ? 'o' : 'b') : ((i + s) % 2 ? 'k' : 'o')); });
      }
      unten.push({ titel: titel, boden: z.map(function (r) { return r.join(''); }), luken: hinab ? [[hinab, ym]] : [] });
    }
    if (decks === 2) unterdeck('Unterdeck', lukeA, 0, true);
    if (decks === 3) { unterdeck('Mitteldeck', lukeA, lukeB, true); unterdeck('Unterdeck', lukeB, 0, false); }
    return { l: l, b: b, decks: decks, segel: klasse.segel, kastell: kastell, klasse: klasse.name, a2: a2, a3: a3, k4: k4, masten: masten, krieg: krieg, drehung: drehung, unten: unten, hoehe: hoehe, boden: o.map(function (r) { return r.join(''); }) };
  }
  // Ein Plan als Karte: ans 'segel', 'gerefft', 'krieg' oder die Nummer eines Unterdecks; rand: Felder Wasser ringsum (x, y)
  function schiffKarte(pl, ans, rx, ry, reffen) {
    var unter = typeof ans === 'number' ? pl.unten[ans] : null, z = (unter ? unter.boden : pl.boden).map(function (r) { return r.split(''); }), aussen = unter ? '#' : '~';
    if (ans === 'krieg') pl.krieg.forEach(function (p) { z[p[1] - 1][p[0] - 1] = 'x'; });
    var leer = '', i; for (i = 0; i < pl.l + 2 * rx; i++) leer += aussen;
    var nullen = leer.replace(/./g, '0'), band = ''; for (i = 0; i < rx; i++) band += aussen;
    var boden = [], hoehe = [], dreh = {};
    for (i = 0; i < ry; i++) { boden.push(leer); hoehe.push(nullen); }
    z.forEach(function (r, y) { boden.push(band + r.join('') + band); hoehe.push(unter ? nullen : band.replace(/./g, '0') + pl.hoehe[y] + band.replace(/./g, '0')); });
    for (i = 0; i < ry; i++) { boden.push(leer); hoehe.push(nullen); }
    Object.keys(pl.drehung).forEach(function (k) { var q = k.split(',').map(Number); dreh[(q[0] + rx) + ',' + (q[1] + ry)] = pl.drehung[k]; });
    var S = { boden: boden, hoehe: hoehe, drehung: dreh };
    if (ans === 'gerefft' || reffen) S.gerefft = pl.masten.map(function (m) { return [m[0] + rx, m[1] + ry]; });
    if (unter) { S.unterDeck = true; S.luken = unter.luken.map(function (m) { return [m[0] + rx, m[1] + ry]; }); }
    return S;
  }
  // Eine Probe aus dem Bauplan: [Zeilen, Text, Breite, Einträge]
  function schiffProbe(l, b, ans, text, breite, rx, ry, reffen) {
    var S = schiffKarte(schiffBau(l, b), ans, rx, ry, reffen), o = { hoehe: S.hoehe };
    if (Object.keys(S.drehung).length) o.drehung = S.drehung;
    if (S.gerefft) o.gerefft = S.gerefft;
    if (S.unterDeck) { o.unterDeck = true; o.luken = S.luken; }
    return [S.boden, text, breite, o];
  }
  // ---------- Set 9: Gewässer ----------
  // Das offene Wasser: Wellen über 72 × 72 (die Karte besteht fast nur daraus, darum läuft die Dünung über die Felder), seichtes Wasser über Sand,
  // Kies einer kleinen Insel, Tang, das Schiff mit Deck und Reling, der Mast, das Riff mit Seepocken und Gischt, Mangrove, Treibgut, Wrack
  var GW = {
    tief: '#2f6474', mulde: '#285665', kamm: '#86b5ba', schaum: '#dbe9e6', rand: '#1c4552',
    seicht: '#7fb3aa', seichtRand: '#47796f', seichtSand: '#6fa498', glanz: '#bcdcd2',
    kies: '#c6bfab', kiesDunkel: '#938d6a', kiesFein: '#b5ae99', linie: '#e4e0d2', stein: '#8b8676', steinHell: '#a8a290', steinKante: '#625d50', steinLicht: '#e0dccf',
    planke: ['#b9a074', '#ad9468', '#c0a87c', '#b2986c'], fuge: '#4a3c2a', nagel: '#6b5a42', maser: '#d0bb90',
    reling: '#6f5236', relingLicht: '#a5855c', relingDunkel: '#3f2f20', rumpf: '#57432f', rumpfFuge: '#35281b'
  };
  // Dünung: je Kamm [x, y, Länge, Höhe] über 72 × 72, an den Rändern des Musters umgebrochen; die Viertel nach variante(x, y) zeigen den passenden Ausschnitt
  var G_WELLEN = [[3, 8, 19, 3], [27, 15, 16, 2.4], [49, 6, 19, 3], [10, 25, 15, 2.4], [33, 31, 19, 3], [57, 23, 16, 2.6], [1, 41, 19, 3], [24, 47, 15, 2.4], [46, 39, 18, 2.8], [9, 59, 17, 2.8], [35, 65, 16, 2.4], [57, 55, 17, 2.8]];
  var G_GISCHT = { 0: 1, 4: 1, 6: 1, 8: 1, 11: 1 };
  function gWellen(v) {
    var ox = (v % 2) * 36, oy = Math.floor(v / 2) * 36, mulden = '', kaemme = '', schaum = '';
    G_WELLEN.forEach(function (w, i) {
      [-72, 0, 72].forEach(function (dx) { [-72, 0, 72].forEach(function (dy) {
        var x = w[0] + dx - ox, y = w[1] + dy - oy, l = w[2], a = w[3];
        if (x > 37 || x + l < -1 || y < -4 || y > 41) return;
        mulden += 'M' + x + ' ' + y + 'c' + gr(l * 0.25) + ' ' + (-a) + ' ' + gr(l * 0.75) + ' ' + (-a) + ' ' + l + ' 0c' + gr(-l * 0.25) + ' ' + gr(a * 1.5) + ' ' + gr(-l * 0.75) + ' ' + gr(a * 1.5) + ' ' + (-l) + ' 0Z';
        kaemme += 'M' + x + ' ' + y + 'c' + gr(l * 0.25) + ' ' + (-a) + ' ' + gr(l * 0.75) + ' ' + (-a) + ' ' + l + ' 0';
        if (G_GISCHT[i]) schaum += 'M' + gr(x + l * 0.32) + ' ' + gr(y - a * 0.72) + 'q' + gr(l * 0.13) + ' ' + gr(-a * 0.12) + ' ' + gr(l * 0.28) + ' 0';
      }); });
    });
    return '<svg width="36" height="36" overflow="hidden"><path d="' + mulden + '" fill="' + GW.mulde + '"/><path d="' + kaemme + '" fill="none" stroke="' + GW.kamm + '" stroke-width="1.2" stroke-linecap="round"/><path d="' + schaum + '" fill="none" stroke="' + GW.schaum + '" stroke-width="1.5" stroke-linecap="round"/></svg>';
  }
  // Selten: eine Welle bricht, Schaum mit Spritzern
  function gBrecher() {
    return '<path d="M8 21C11 15 18 13 25 15C28 16 29 18 28 20C26 18 23 18 21 20C18 19 15 20 13 22C11 21 9 21 8 21Z" fill="' + GW.schaum + '" stroke="' + GW.kamm + '" stroke-width=".8" stroke-linejoin="round"/><path d="M12 24q5-2.4 10-.6M24 23.6q2-.7 3.6-.1" fill="none" stroke="' + GW.schaum + '" stroke-width="1.1" stroke-linecap="round"/><g fill="' + GW.schaum + '"><circle cx="9" cy="16" r=".8"/><circle cx="30" cy="13" r=".9"/><circle cx="19" cy="10.6" r=".7"/></g>';
  }
  // Seichtes Wasser über Sand: der Grund schimmert durch, Rippeln im Sand, kurze helle Kräusel, ein Stein
  function gSeicht() {
    return '<path d="M4 12q4-2.6 8 0t8 0M19 25q3.6-2.4 7.4 0t6.6 0M5 28q3.4-2.2 7 0" fill="none" stroke="' + GW.seichtSand + '" stroke-width="1.5" stroke-linecap="round"/>' +
      '<ellipse cx="25" cy="10" rx="2.8" ry="2" transform="rotate(-15 25 10)" fill="#94b4a2" stroke="#5f8a7f" stroke-width=".7"/><path d="M23.6 9.2q1.2-.8 2.5-.5" fill="none" stroke="#cfe4d8" stroke-width=".7" stroke-linecap="round"/>' +
      '<path d="M7 6q2.6-1.5 5.2 0M15 18q2.8-1.5 5.6 0M26 31q2.3-1.3 4.6 0M28 18q1.7-.9 3.4 0" fill="none" stroke="' + GW.glanz + '" stroke-width="1" stroke-linecap="round"/>';
  }
  // Kies: Kiesel mit Kante und kleinem Licht
  function gKiesel(x, y, rx, ry, rot, f) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')" fill="' + (f || GW.stein) + '" stroke="' + GW.steinKante + '" stroke-width=".7"/><circle cx="' + gr(x - rx * 0.3) + '" cy="' + gr(y - ry * 0.35) + '" r=".55" fill="' + GW.steinLicht + '"/>';
  }
  // Selten: ein Seestern, gedämpft (Orange gehört den Flammen, Rot der Bedienung)
  function gSeestern(cx, cy, r, rot) {
    var d = '', i, a, R;
    for (i = 0; i < 10; i++) { a = (rot - 90 + i * 36) * Math.PI / 180; R = i % 2 ? r * 0.36 : r; d += (i ? 'L' : 'M') + gr(cx + R * Math.cos(a)) + ' ' + gr(cy + R * Math.sin(a)); }
    return '<path d="' + d + 'Z" fill="#b5855f" stroke="#6f5038" stroke-width=".8" stroke-linejoin="round"/><circle cx="' + cx + '" cy="' + cy + '" r=".9" fill="#d8b48e"/>';
  }
  // Tang: ein Band mit dunklem Rand und hellerer Mitte; Blasen; Seegras als kurze Halme
  function gTang(d) { return '<path d="' + d + '" fill="none" stroke="#4a4d28" stroke-width="2.5" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#757a3c" stroke-width="1.1" stroke-linecap="round"/>'; }
  function gBlasen(liste) { return '<g fill="#a9a65f" stroke="#4a4d28" stroke-width=".55">' + liste.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.15"/>'; }).join('') + '</g>'; }
  function gSeegras(x, y) { return '<path d="M' + x + ' ' + y + 'q-1.4-3-3.2-4.2M' + x + ' ' + y + 'q-.2-3.4-.4-5.4M' + x + ' ' + y + 'q1.2-2.8 3-4" fill="none" stroke="#5c6431" stroke-width="1" stroke-linecap="round"/>'; }
  // Die Planken des Decks laufen hier von West nach Ost; vier Planken, die Fugen an Ober- und Unterkante liegen halb in jedem Feld
  function gPlanken() {
    var o = '<rect width="36" height="4.5" fill="' + GW.planke[3] + '"/><rect y="4.5" width="36" height="9" fill="' + GW.planke[0] + '"/><rect y="13.5" width="36" height="9" fill="' + GW.planke[1] + '"/><rect y="22.5" width="36" height="9" fill="' + GW.planke[2] + '"/><rect y="31.5" width="36" height="4.5" fill="' + GW.planke[3] + '"/>';
    o += '<path d="M3 8h9M17 11h11M6 17h7M22 19h10M2 26h12M19 28h9M8 2.4h10M24 33.4h8" stroke="' + GW.maser + '" stroke-width=".8" stroke-linecap="round" opacity=".8"/>';
    o += '<path d="M0 4.5H36M0 13.5H36M0 22.5H36M0 31.5H36" stroke="' + GW.fuge + '" stroke-width="1.1" opacity=".85"/><path d="M26 13.5V22.5M8 22.5V31.5" stroke="' + GW.fuge + '" stroke-width=".8" opacity=".8"/>';
    o += '<g fill="' + GW.nagel + '"><circle cx="24.4" cy="16" r=".55"/><circle cx="24.4" cy="20" r=".55"/><circle cx="27.6" cy="16" r=".55"/><circle cx="27.6" cy="20" r=".55"/><circle cx="6.4" cy="25" r=".55"/><circle cx="6.4" cy="29" r=".55"/><circle cx="9.6" cy="25" r=".55"/><circle cx="9.6" cy="29" r=".55"/></g>';
    return o;
  }
  // Viertelstück der Reling (oben links, 0 bis 18): die Laufplanke rundum, die Kanten zwischen den Ebenen (dort gerade). Außenecken im Bogen, in der Ecke liegt, was daneben ist.
  // bw: Diese Seite (oben) zeigt nach Süden: Man sieht wie bei einer gebauten Wand die Wand darunter, darüber die Reling. z: Zinnen (Kastell eines Kriegsschiffs).
  function deckStueck(st, wasser, bw, z) {
    var R = GW.reling, H = GW.relingLicht, D = GW.relingDunkel, T = '#3b3028', W = wasser || GW.tief, ecke = '<path d="M0 0H14A14 14 0 0 0 0 14Z" fill="' + W + '"/><path d="M0 0H14A14 14 0 0 0 0 14Z" fill="#2a2119" opacity=".24"/>';
    var zo = z ? '<path d="M0 ' + (bw ? 6.9 : 1.9) + 'H18" stroke="#c7ad82" stroke-width="3.2" stroke-dasharray="4 3.6"/>' : '', zl = z ? '<path d="M1.9 0V18" stroke="#c7ad82" stroke-width="3.2" stroke-dasharray="4 3.6"/>' : '';
    if (bw && st === 'oben') return '<rect width="18" height="5" fill="' + GW.rumpf + '"/><path d="M0 1.8H18M0 3.4H18" stroke="' + GW.rumpfFuge + '" stroke-width=".7"/><path d="M0 .4H18" stroke="' + T + '" stroke-width="1.1"/><rect y="5" width="18" height="3.8" fill="' + R + '"/><path d="M0 8.8H18" stroke="' + D + '" stroke-width="1"/><path d="M0 6.9H18" stroke="' + H + '" stroke-width=".9"/><path d="M0 5H18" stroke="' + T + '" stroke-width=".9"/><rect x="8" y="6.2" width="2.2" height="3.8" fill="' + D + '"/>' + zo;
    if (st === 'aussen') return ecke + '<path d="M18 0H14A14 14 0 0 0 0 14V18H3.8V14A10.2 10.2 0 0 1 14 3.8H18Z" fill="' + R + '"/><path d="M18 3.8H14A10.2 10.2 0 0 0 3.8 14V18" fill="none" stroke="' + D + '" stroke-width="1"/><path d="M18 1.9H14A12.1 12.1 0 0 0 1.9 14V18" fill="none" stroke="' + H + '" stroke-width=".9"/><path d="M18 .4H14A13.6 13.6 0 0 0 .4 14V18" fill="none" stroke="' + T + '" stroke-width="1.1"/>';
    if (st === 'oben') return '<rect width="18" height="3.8" fill="' + R + '"/><path d="M0 3.8H18" stroke="' + D + '" stroke-width="1"/><path d="M0 1.9H18" stroke="' + H + '" stroke-width=".9"/><path d="M0 .4H18" stroke="' + T + '" stroke-width="1.1"/><rect x="8" y="1.2" width="2.2" height="3.8" fill="' + D + '"/>' + zo;
    if (st === 'links') return '<rect width="3.8" height="18" fill="' + R + '"/><path d="M3.8 0V18" stroke="' + D + '" stroke-width="1"/><path d="M1.9 0V18" stroke="' + H + '" stroke-width=".9"/><path d="M.4 0V18" stroke="' + T + '" stroke-width="1.1"/><rect x="1.2" y="8" width="3.8" height="2.2" fill="' + D + '"/>' + zl;
    if (st === 'innen') return '<path d="M0 0H6A6 6 0 0 1 0 6Z" fill="' + R + '"/><path d="M6 0A6 6 0 0 1 0 6" fill="none" stroke="' + D + '" stroke-width="1"/>';
    return '';
  }
  // Riff: Seepocken auf dem Fels, kleine Ringe auf den Brocken (über die Ränder fortlaufend wie die Brocken)
  function felsPocken(st, ox, oy) {
    var o = '';
    FELS_BROCKEN.forEach(function (pt, i) {
      if (i % 2) return;
      var cx = pt.reduce(function (s, p) { return s + p[0]; }, 0) / pt.length, cy = pt.reduce(function (s, p) { return s + p[1]; }, 0) / pt.length;
      [-72, 0, 72].forEach(function (dx) { [-72, 0, 72].forEach(function (dy) {
        var x = cx + dx - ox, y = cy + dy - oy;
        if (x < -6 || x > 42 || y < -6 || y > 42) return;
        o += '<circle cx="' + gr(x + 1.6) + '" cy="' + gr(y + 1.8) + '" r=".95"/><circle cx="' + gr(x - 1) + '" cy="' + gr(y + 3) + '" r=".7"/><circle cx="' + gr(x + 3.4) + '" cy="' + gr(y - 0.4) + '" r=".6"/>';
      }); });
    });
    return '<g fill="' + st.pocken + '" stroke="#3b3028" stroke-width=".35">' + o + '</g>';
  }
  // Mast und Segel von oben, gezeichnet mit dem Bug nach Norden: die Rahe quer, davor das volle Segel als große Sichel aus Bahnen (gestreift wie auf den Siegeln), der Mastkopf mit dem Mars,
  // auf einem Kriegsschiff das Krähennest mit Zinnen; die Takelage zu Bug, Heck und Reling. breit: Schiffsbreite in Feldern am Mast; vor, hinter: Felder an Bord vor und hinter dem Mast.
  function segelTeile(breit, vor, hinter, krieg, gerefft, faktor, tiefeMax, nest) {
    var L = gr(breit * 18 * (faktor || 1.7)), D = gr(Math.min(L * 0.52, 112, tiefeMax === undefined ? 112 : tiefeMax)), y0 = 12, xa = gr(18 - L), xe = gr(18 + L), takel = '', hb = gr((breit / 2) * 36 - 5);
    takel += 'M18 ' + gr(18 - (vor + 0.5) * 36) + 'V' + gr(18 + (hinter + 0.5) * 36);
    [0.9, 1.6, 2.3].forEach(function (k) { var t = Math.min(k, hinter + 0.2), bx = gr(hb * (1 - 0.06 * k)); takel += 'M18 18L' + gr(18 - bx) + ' ' + gr(18 + t * 36) + 'M18 18L' + gr(18 + bx) + ' ' + gr(18 + t * 36); });
    takel += 'M' + xa + ' ' + y0 + 'L' + gr(18 - hb) + ' ' + gr(18 + (Math.min(hinter, 4) + 0.2) * 36) + 'M' + xe + ' ' + y0 + 'L' + gr(18 + hb) + ' ' + gr(18 + (Math.min(hinter, 4) + 0.2) * 36);
    var mars = nest ? '<circle cx="18" cy="18" r="11" fill="#6f5236" stroke="#3b3028" stroke-width="1.3"/><circle cx="18" cy="18" r="9.4" fill="none" stroke="#c7ad82" stroke-width="3.2" stroke-dasharray="4 3.4"/><circle cx="18" cy="18" r="6.4" fill="#57432f" stroke="#3b3028" stroke-width=".9"/><circle cx="18" cy="18" r="2.8" fill="#a5855c" stroke="#3b3028" stroke-width=".8"/>'
      : '<circle cx="18" cy="18" r="7" fill="#7d5f3f" stroke="#3b3028" stroke-width="1.2"/><circle cx="18" cy="18" r="3.4" fill="#a5855c" stroke="#3b3028" stroke-width=".8"/>';
    var rahe = '<rect x="' + xa + '" y="' + (y0 - 2) + '" width="' + gr(2 * L) + '" height="4" rx="1.6" fill="#6f5236" stroke="#3b3028" stroke-width="1"/><path d="M' + gr(xa + 2) + ' ' + (y0 - 0.8) + 'H' + gr(xe - 2) + '" stroke="#a5855c" stroke-width=".8"/>';
    if (gerefft) {
      var bu = 'M' + gr(xa + 8) + ' ' + (y0 - 5) + 'Q18 ' + (y0 - 8) + ' ' + gr(xe - 8) + ' ' + (y0 - 5) + 'V' + (y0 + 4) + 'Q18 ' + (y0 + 7) + ' ' + gr(xa + 8) + ' ' + (y0 + 4) + 'Z', zaun = '';
      for (var i = -Math.floor(L / 26); i <= Math.floor(L / 26); i++) zaun += 'M' + gr(18 + i * 26) + ' ' + (y0 - 6.4) + 'V' + (y0 + 5.4);
      return { schatten: '<path d="' + bu + '"/>', form: '<path d="' + takel + '" fill="none" stroke="#3b3028" stroke-width=".9"/>' + rahe + '<path d="' + bu + '" fill="#d9cfb0" stroke="#3b3028" stroke-width="1.2" stroke-linejoin="round"/><path d="' + zaun + '" stroke="#6f5236" stroke-width="1.1"/>' + mars };
    }
    var vorne = y0 - D * 1.3, hinten = y0 - D * 0.3;
    var segel = 'M' + xa + ' ' + y0 + 'C' + gr(18 - L * 0.62) + ' ' + gr(vorne) + ' ' + gr(18 + L * 0.62) + ' ' + gr(vorne) + ' ' + xe + ' ' + y0 + 'C' + gr(18 + L * 0.5) + ' ' + gr(hinten) + ' ' + gr(18 - L * 0.5) + ' ' + gr(hinten) + ' ' + xa + ' ' + y0 + 'Z';
    var bahnen = '', naehte = '', w = 24, n = Math.ceil(L / w);
    for (var j = -n; j <= n; j++) { var x = 18 + j * w - w / 2; if (((j % 4) + 4) % 4 === 2 || ((j % 4) + 4) % 4 === 3) bahnen += '<rect x="' + gr(x) + '" y="' + gr(y0 - D * 1.2) + '" width="' + w + '" height="' + gr(D * 1.3) + '" fill="' + (krieg ? '#8a7054' : '#c2a56c') + '"/>'; naehte += 'M' + gr(x) + ' ' + gr(y0 - D * 1.2) + 'V' + y0; }
    var bauch = 'M' + xa + ' ' + y0 + 'C' + gr(18 - L * 0.5) + ' ' + gr(hinten) + ' ' + gr(18 + L * 0.5) + ' ' + gr(hinten) + ' ' + xe + ' ' + y0 + 'C' + gr(18 + L * 0.52) + ' ' + gr(y0 - D * 0.62) + ' ' + gr(18 - L * 0.52) + ' ' + gr(y0 - D * 0.62) + ' ' + xa + ' ' + y0 + 'Z';
    var licht = 'M' + gr(18 - L * 0.74) + ' ' + gr(y0 - D * 0.5) + 'C' + gr(18 - L * 0.4) + ' ' + gr(y0 - D * 0.94) + ' ' + gr(18 + L * 0.1) + ' ' + gr(y0 - D * 0.98) + ' ' + gr(18 + L * 0.42) + ' ' + gr(y0 - D * 0.84);
    return {
      schatten: '<path d="' + segel + '"/><rect x="' + xa + '" y="' + (y0 - 2) + '" width="' + gr(2 * L) + '" height="4"/>',
      form: '<path d="' + takel + '" fill="none" stroke="#3b3028" stroke-width=".9"/><clipPath id="SEGELCLIP"><path d="' + segel + '"/></clipPath><path d="' + segel + '" fill="#e6dcc2"/><g clip-path="url(#SEGELCLIP)">' + bahnen + '<path d="' + bauch + '" fill="#2a2119" opacity=".16"/><path d="' + naehte + '" stroke="#ab9c7c" stroke-width="1"/></g><path d="' + licht + '" fill="none" stroke="#f7f1de" stroke-width="1.6" stroke-linecap="round" opacity=".9"/><path d="' + segel + '" fill="none" stroke="#3b3028" stroke-width="1.4" stroke-linejoin="round"/>' + rahe + mars
    };
  }
  // Der Mast eines gesunkenen Schiffs (unter Wasser): gebrochen, ohne Segel, mit Tang
  function mastStumpf() {
    var f = 'M12.6 19L14 13.4L16.6 15L18.4 11.6L20.6 15L23 13L24 18.4C24.6 22.6 22 25.6 18.2 25.6C14.8 25.6 12.2 22.8 12.6 19Z';
    return { schatten: '<path d="' + f + '"/>', form: '<path d="' + f + '" fill="#7d5f3f" stroke="#3b3028" stroke-width="1.2" stroke-linejoin="round"/><circle cx="18.2" cy="20" r="2.6" fill="#a5855c" stroke="#3b3028" stroke-width=".8"/>' + gTang('M13.4 24q-3 1.4-5.4.6') };
  }
  // Die Ballista von oben, Spitze nach Norden: die schwere Armbrust auf ihrem Drehkranz, Bogenarme, Sehne, der Bolzen in der Rinne, hinten die Winde
  function ballistaTeile() {
    var arme = 'M3.4 15C7.6 10 12.6 8.4 18 9.4C23.4 8.4 28.4 10 32.6 15';
    return {
      schatten: '<circle cx="18" cy="21" r="9.4"/><rect x="15.4" y="4" width="5.2" height="29"/><path d="' + arme + '" fill="none" stroke="#2a2119" stroke-width="3.4"/>',
      form: '<circle cx="18" cy="21" r="9.4" fill="#57432f" stroke="#3b3028" stroke-width="1.2"/><circle cx="18" cy="21" r="7" fill="none" stroke="#a5855c" stroke-width=".9"/>' +
        '<path d="' + arme + '" fill="none" stroke="#3b3028" stroke-width="3.8" stroke-linecap="round"/><path d="' + arme + '" fill="none" stroke="#8f6f4a" stroke-width="2.1" stroke-linecap="round"/><g fill="#7f868a" stroke="#3b3028" stroke-width=".7"><circle cx="3.4" cy="15" r="1.7"/><circle cx="32.6" cy="15" r="1.7"/></g>' +
        '<rect x="15.2" y="7" width="5.6" height="26" fill="#a5855c" stroke="#3b3028" stroke-width="1.1"/><path d="M3.6 15.4L18 25.6L32.4 15.4" fill="none" stroke="#efe6cc" stroke-width="1"/>' +
        '<path d="M18 26V6" stroke="#3b3028" stroke-width="1.6"/><path d="M15.6 7.4L18 1.6L20.4 7.4Z" fill="#7f868a" stroke="#3b3028" stroke-width=".8" stroke-linejoin="round"/>' +
        '<rect x="10.6" y="29.4" width="14.8" height="3.6" rx="1" fill="#6f5236" stroke="#3b3028" stroke-width="1"/><g fill="#7f868a" stroke="#3b3028" stroke-width=".7"><circle cx="10.6" cy="31.2" r="1.6"/><circle cx="25.4" cy="31.2" r="1.6"/></g>'
    };
  }
  // Tauwerk und Netze an Deck: zwei aufgeschossene Taue, ein Netz dazwischen; liegt, darum ohne Schatten
  function tauwerkTeile() {
    function tau(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#c9b68c" stroke="#3b3028" stroke-width="1"/><circle cx="' + x + '" cy="' + y + '" r="' + gr(r * 0.64) + '" fill="none" stroke="#8f7a55" stroke-width=".9"/><circle cx="' + x + '" cy="' + y + '" r="' + gr(r * 0.3) + '" fill="#8f7a55"/>'; }
    return '<path d="M6 8C13 5 22 6 30 10C33 17 31 26 25 30C17 32 9 30 6 24C4 18 4 12 6 8Z" fill="#a89a74" stroke="#3b3028" stroke-width="1" stroke-linejoin="round"/><path d="M8 12L24 29M13 8L30 22M6 19L17 30M21 7L31 14M26 10L9 27M19 6L6 18M31 17L14 31M31 24L24 30" fill="none" stroke="#6f6547" stroke-width=".9"/>' + tau(12, 13, 5.6) + tau(24, 24, 6.4);
  }
  // Mangrove: eine runde Krone aus ledrigen Büscheln, zusammenhängend wie ein Dach; für sich ragen die Stelzwurzeln unter der Krone hervor, auf der Karte deckt die Krone sie (wie die Knie der Zypresse)
  var MANGROVE = { umriss: '#3b3028', schatten: '#2f4f3c', grund: '#446a4c', licht: '#5f8a5c', blatt: '#a3c088', blattDunkel: '#2a4636', wurzel: '#7b6a50' };
  function mangroveTeile(f) {
    var R = gr(13.4 * f), gross = f > 1.5, umriss = wolke(18, 18, R, gross ? 26 : 14, 0.3), lagen = '', helle = '', dunkle = '', seed = 5;
    function zufall() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    function ring(n, abstand, r, ph, farbe, farbeLicht) {
      for (var i = 0; i < n; i++) {
        var a = ph + i * 2 * Math.PI / n, cx = gr(18 + abstand * Math.cos(a)), cy = gr(18 + abstand * Math.sin(a));
        lagen += '<path d="' + wolke(cx, cy, r, 8, a) + '" fill="' + (cx + cy < 30 ? farbeLicht : cx + cy < 42 ? '#527a54' : farbe) + '" stroke="' + MANGROVE.schatten + '" stroke-width=".9"/>';
      }
    }
    ring(gross ? 11 : 6, R * 0.6, R * (gross ? 0.3 : 0.42), 0.2, MANGROVE.grund, MANGROVE.licht);
    ring(gross ? 6 : 3, R * 0.28, R * (gross ? 0.3 : 0.38), 0.7, MANGROVE.grund, MANGROVE.licht);
    for (var i = 0, n = gross ? 44 : 14; i < n; i++) {
      var a = zufall() * 2 * Math.PI, d = (0.15 + 0.75 * Math.sqrt(zufall())) * R, x = gr(18 + d * Math.cos(a)), y = gr(18 + d * Math.sin(a)), rot = Math.round(zufall() * 180);
      var e = '<ellipse cx="' + x + '" cy="' + y + '" rx="1.4" ry=".7" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
      if (x + y < 36) helle += e; else dunkle += e;
    }
    var w = ['M27.5 8.5C30 6 31.4 4.4 31.8 2.2M29.6 6.4C31.4 6.6 33 6.4 34.2 5.4', 'M30.8 15C32.6 14 33.8 13.2 34.6 11.6M31.8 14.6C33 15.4 34 16 34.8 17.4'].join('');
    var wurzeln = gross ? '' : [0, 90, 180, 270].map(function (r) { return '<g transform="rotate(' + r + ' 18 18)"><path d="' + w + '" fill="none" stroke="#3b3028" stroke-width="1.9" stroke-linecap="round"/><path d="' + w + '" fill="none" stroke="' + MANGROVE.wurzel + '" stroke-width=".9" stroke-linecap="round"/></g>'; }).join('');
    return {
      schatten: '<path d="' + umriss + '"/>',
      form: wurzeln + '<path d="' + umriss + '" fill="' + MANGROVE.schatten + '" stroke="' + MANGROVE.umriss + '" stroke-width="1.3" stroke-linejoin="round"/>' + lagen + '<g fill="' + MANGROVE.blatt + '">' + helle + '</g><g fill="' + MANGROVE.blattDunkel + '">' + dunkle + '</g>'
    };
  }
  // Wrackteil: was von einem Rumpf aus dem Wasser ragt: der Kiel schräg, die Spanten in Paaren, ein Stück Beplankung; das Wasser steht dazwischen
  function wrackTeile() {
    var kiel = 'M7.4 29.4L28 8.6', spanten = 'M11 25.4C8 23.4 5.6 20.6 4.8 17.6M14.8 21.6C11.6 19.2 9.6 15.8 9 12.4M18.8 17.6C15.8 15 14 11.6 13.8 8M22.8 13.6C20.2 11 18.8 8 18.8 4.8M11 25.8C13 28.8 16 30.8 19 31.4M14.8 21.8C17 25 20.2 27 23.6 27.4M18.8 17.8C21.4 21 24.4 22.8 28 23M22.8 13.8C25.4 16.4 28.2 18 31.4 18';
    var planke = 'M17.4 31.2C22 31 27.4 26.6 29.8 20.4';
    return {
      schatten: '<path d="' + kiel + '" fill="none" stroke="#2a2119" stroke-width="4"/><path d="' + spanten + planke + '" fill="none" stroke="#2a2119" stroke-width="2.6" stroke-linecap="round"/>',
      form: '<path d="' + spanten + '" fill="none" stroke="#3b3028" stroke-width="3.2" stroke-linecap="round"/><path d="' + spanten + '" fill="none" stroke="#7d6242" stroke-width="1.7" stroke-linecap="round"/>' +
        '<path d="' + planke + '" fill="none" stroke="#3b3028" stroke-width="4.2" stroke-linecap="square"/><path d="' + planke + '" fill="none" stroke="#a98f67" stroke-width="2.6" stroke-linecap="square"/>' +
        '<path d="' + kiel + '" fill="none" stroke="#3b3028" stroke-width="4.6" stroke-linecap="square"/><path d="' + kiel + '" fill="none" stroke="#5f4930" stroke-width="3" stroke-linecap="square"/><path d="M8.4 27.6L26.6 9.2" stroke="#8f7450" stroke-width=".9"/>' +
        gTang('M5.6 16q2.2-1.6 3.8-4') + '<path d="M2.6 31q2.4-1.4 4.8-.2M28.6 5.4q1.8-.9 3.6 0" fill="none" stroke="' + GW.schaum + '" stroke-width="1.2" stroke-linecap="round"/>'
    };
  }
  // Treibgut: Klumpen aus Tang an der Oberfläche, dazwischen Bretter und ein Stück Tau; liegt auf dem Wasser, darum ohne Schatten
  function treibgutTeile() {
    function klumpen(cx, cy, r, ph) { return '<path d="' + wolke(cx, cy, r, 9, ph) + '" fill="#59592f" stroke="#3b3028" stroke-width="1"/>'; }
    return klumpen(11.6, 11.6, 6.8, 0.3) + klumpen(24.4, 24.4, 7.4, 1.1) + klumpen(26.4, 9.6, 3.8, 0.7) + klumpen(9.2, 26.8, 4, 0.2) +
      gTang('M7 12q3-2.4 6-.4t4-.6') + gTang('M19.6 25q3-2.4 6-.4t4-.6') + gBlasen([[10.6, 8], [15.4, 15], [22.4, 20], [28, 28], [26.4, 9.6], [9.2, 26.8]]) +
      '<g transform="rotate(-44 18 18)"><rect x="6" y="15.6" width="23" height="4.6" fill="#a88f67" stroke="#3b3028" stroke-width="1"/><path d="M9 17.8h7M20 17.2h5" stroke="#6f5a3e" stroke-width=".8" stroke-linecap="round"/><path d="M29 15.6l-2.2 1.8 2.2 1 -2 1.8" fill="none" stroke="#3b3028" stroke-width=".8"/></g>' +
      '<g transform="rotate(30 18 18)"><rect x="19.6" y="7" width="10" height="3.6" fill="#94795a" stroke="#3b3028" stroke-width=".9"/></g>' +
      '<path d="M12.6 23.6a2.5 2.1 0 1 1 4.4 1.3a1.3 1.1 0 1 1-2.1-1.1" fill="none" stroke="#3b3028" stroke-width="2"/><path d="M12.6 23.6a2.5 2.1 0 1 1 4.4 1.3a1.3 1.1 0 1 1-2.1-1.1" fill="none" stroke="#c9b68c" stroke-width="1"/>';
  }
  // Wetter: Gischt und Salz auf der Seite zum Licht; ein feuchter Streifen, weiße Kruste
  function salzWetter(x, y, w, rot) {
    return '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')"><path d="M' + gr(x - w / 2) + ' ' + y + 'q' + gr(w / 4) + ' -1.6 ' + gr(w / 2) + ' 0t' + gr(w / 2) + ' 0" fill="none" stroke="#f2f4ef" stroke-width="1.4" stroke-linecap="round"/><path d="M' + gr(x - w / 2 + 1) + ' ' + gr(y + 1.7) + 'q' + gr(w / 5) + ' 1 ' + gr(w * 0.42) + ' 0" fill="none" stroke="#7d9ea3" stroke-width=".9" stroke-linecap="round"/></g><g fill="#f2f4ef"><circle cx="' + gr(x + w * 0.3) + '" cy="' + gr(y + 3) + '" r=".7"/><circle cx="' + gr(x - w * 0.2) + '" cy="' + gr(y - 2.6) + '" r=".6"/></g>';
  }
  // Selten auf dem Deck: ein aufgeschossenes Tau
  function gTau(x, y) {
    return '<circle cx="' + x + '" cy="' + y + '" r="6" fill="#c9b68c" stroke="#3b3028" stroke-width="1"/><circle cx="' + x + '" cy="' + y + '" r="3.9" fill="none" stroke="#8f7a55" stroke-width=".9"/><circle cx="' + x + '" cy="' + y + '" r="1.9" fill="#8f7a55"/><path d="M' + gr(x + 5.6) + ' ' + gr(y + 2) + 'q3.4 1.2 4.6 3.8" fill="none" stroke="#3b3028" stroke-width="2.2" stroke-linecap="round"/><path d="M' + gr(x + 5.6) + ' ' + gr(y + 2) + 'q3.4 1.2 4.6 3.8" fill="none" stroke="#c9b68c" stroke-width="1" stroke-linecap="round"/>';
  }
  // Ring um das Lagerfeuer: dunkler, feuchter Kies, dazwischen verkohltes Treibholz und Muschelbruch
  function treibkohle() {
    return '<g stroke-linecap="round"><path d="M6 11L11 6.4M28 25l4-3.6M7 28l3.4 2.6" stroke="#2c2822" stroke-width="2.6"/><path d="M6.6 10.6L10 7.4M28.6 24.6l2.6-2.4M7.6 28.6l2 1.4" stroke="#8d897e" stroke-width=".8"/></g><g fill="#e8e2d0" stroke="#6e6a5c" stroke-width=".5"><circle cx="30" cy="10" r="1.2"/><circle cx="4.6" cy="20" r="1"/></g>';
  }
  var GEWAESSER = {
    id: 'gewaesser', nr: 9, name: 'Gewässer', standard: 'kies', status: 'fertig', weheName: 'Pfütze mit Tang',
    // Das Schiff (Max, 2.11.): Deck, was darauf steht, Mast und Fallreep ergeben sich aus den Nachbarn; was im Wasser steht, steht im Wasser
    schiff: { deck: 'e', anBord: 'OWL#+=szclhTfpSHbrutok/dx', wasser: ['meer', 'seicht', 'grundTief', 'grundSeicht'], draussen: ['deck', 'deckQuer', 'meer', 'seicht', 'grundTief', 'grundSeicht'] },
    // Unter Wasser (Max, 2.11., Variante c): dieselben Zeichen von unten, nur mit dem Karteneintrag unterWasser: true; Trübung folgt der Regel des Nebels (nebel: n), Tiefe der Regel der Dunkelheit (grundlicht)
    unterWasser: {
      schleier: '#2a7c8c', deckung: 0.3, saum: '#6e9a94', kante: '#c2cbac', kaustikFarbe: '#eaf8f2',
      kaustik: 'M-0.2 0.2Q5.3 3.9 11.9 4.9M59.8 0.2Q65.3 3.9 71.9 4.9M11.9 4.9Q16.5 3.6 20 0.3M11.9 4.9Q12.9 9.3 10.9 13.4M20 0.3Q24.8 1.9 28.6 5M28.6 5Q35 4.3 40.6 1.1M28.6 5Q29.7 10.2 30.7 15.4M40.6 1.1Q43.8 4.1 48.2 4.3M48.2 4.3Q53.9 1.9 59.8 0.2M48.2 4.3Q50.5 8.6 50.1 13.4M-1.8 21.1Q4.7 17.6 10.9 13.4M58.2 21.1Q64.7 17.6 70.9 13.4M58.2 21.1Q57.5 25.1 58.6 29.1M10.9 13.4Q16.9 16.9 22.1 21.7M22.1 21.7Q25.6 17.5 30.7 15.4M22.1 21.7Q21.4 26.6 19.7 31.2M30.7 15.4Q34.1 18.2 38.5 18.3M38.5 18.3Q44.6 16.6 50.1 13.4M38.5 18.3Q40.5 24.3 40 30.6M50.1 13.4Q54.7 16.7 58.2 21.1M-1.4 29.1Q4 30.9 7.9 34.9M58.6 29.1Q64 30.9 67.9 34.9M7.9 34.9Q13.4 31.7 19.7 31.2M7.9 34.9Q8.8 40.6 11.5 45.7M19.7 31.2Q25.3 32.4 30.1 35.5M30.1 35.5Q35.1 33.2 40 30.6M30.1 35.5Q29.7 39.5 29.1 43.5M40 30.6Q45.2 31.5 49.8 34.2M49.8 34.2Q54.6 32.3 58.6 29.1M49.8 34.2Q51.8 39.2 51.5 44.6M2.2 51.8Q7.1 49.2 11.5 45.7M2.2 51.8Q2.2 56.3 -0.2 60.2M2.2 -8.2Q2.2 -3.7 -0.2 0.2M62.2 51.8Q62.2 56.3 59.8 60.2M62.2 -8.2Q62.2 -3.7 59.8 0.2M11.5 45.7Q15.4 47.2 19.2 49M19.2 49Q23.7 45.4 29.1 43.5M19.2 49Q20.3 54.6 20 60.3M19.2 -11Q20.3 -5.4 20 0.3M29.1 43.5Q34.4 47.9 41.2 49.6M41.2 49.6Q46.8 48 51.5 44.6M41.2 49.6Q41.5 55.4 40.6 61.1M41.2 -10.4Q41.5 -4.6 40.6 1.1M51.5 44.6Q56.2 49.2 62.2 51.8M-8.5 44.6Q-3.8 49.2 2.2 51.8',
      stil: { schleier: '#8fc2bc', deckung: 0.12, wand: '#3f7f8b', schwade: '#5a98a2', schwaden: 'M3 7q5-3 10 0M18 4q4-2.4 8 0M7 16q5-3 10 0M21 19q3.4-2 7 0M3 25q5-3 10 0M18 28q4-2.4 8 0' },
      text: 'Ein Eintrag auf der Karte (<code>unterWasser: true</code>) zeigt dieselben Zeichen von unten, ohne neue Kacheln: <code>~</code> und <code>i</code> zeigen den Grund statt der Oberfläche, darüber liegt in jeder Ansicht ein Schleier mit Lichtnetz; Kanten von Ebenen tragen keinen Steinrand, denn man schwimmt darüber. Höher heißt: näher an der Oberfläche. Ein Deck ist ein gesunkenes Schiff, der Mast gebrochen und ohne Segel. Trübes Wasser folgt der Regel des Nebels (<code>nebel: n</code>): Die Figur sieht nur, was höchstens n Felder entfernt liegt, dahinter die Wasserwand mit allen Wesen darin. Tiefes, dunkles Wasser folgt der Regel der Dunkelheit (<code>grundlicht: \'dunkel\'</code>). Ein Vorschlag wie Nebel und Dunkelheit: Was es im Kampf kostet und was es mit Waffen und Feuer macht (PHB, Kampf unter Wasser), ist eine Regelwerk-Frage an den Weltenhüter.',
      probe: { boden: ['.:...~~~~', '..:.~~eee', '.FF.~~eOe', '.F..~~eee', '..:.~~~~~', '...~~~x~~'], wesen: [{ x: 4, y: 3, art: 'figur', kurz: 'FS' }, { x: 6, y: 5, art: 'gegner', kurz: 'W' }, { x: 8, y: 2, art: 'gegner', kurz: 'W' }] },
      ansichten: [[{}, 'klares Wasser: alles zu sehen'], [{ nebel: 3 }, 'trübes Wasser, <code>nebel: 3</code>'], [{ grundlicht: 'dunkel', lichter: [[4, 3, 2, 4]] }, 'tief und dunkel, <code>grundlicht: \'dunkel\'</code>, ein Licht bei der Figur']]
    },
    // Das Blatt „Die Schiffe“ (Max, 2.11.): 22 feste Größen, siehe SCHIFFSKLASSEN und schiffBau
    schiffsblatt: {
      text: 'Die Schiffe kommen in 22 festen Größen, Länge × Breite in Feldern. Offene Boote haben Bänke und Riemen, weder Deck noch Segel. Dann ein Deck und ein Segel; zwei Decks und zwei Segel; drei Decks und drei Segel; 18 × 7, 21 × 7, 19 × 9 und 30 × 9 tragen dazu am Heck ein Kastell. Decks gibt es auf zwei Arten: Hauptdeck, Achterdeck und Poop liegen als Ebenen auf einer Karte, Mitteldeck und Unterdeck sind eigene Karten ohne Wasser und Segel, mit denselben Spalten und Zeilen, so stimmen Masten und Leitern übereinander. Gebaut ist alles nach den Schiffen des 14. Jahrhunderts: rund, Bug und Heck ähnlich, Heckruder, Rahsegel, die breiter sind als das Schiff, Kastelle mit Brustwehr und im Krieg ein Krähennest. Die Kogge von Bremen (um 1380) entspricht etwa 15 × 5 Feldern, das Wrack aus dem Sund bei Kopenhagen (um 1410) etwa 18 × 6. Die größten Größen gehen über das hinaus, was für Rundschiffe des 14. Jahrhunderts belegt ist; sie folgen derselben Bauart. Eine Ballista (<code>x</code>; vier Felder im Block sind eine große) macht jedes Schiff zum Kriegsschiff; <code>gerefft: [[x, y]]</code> legt ein Segel auf die Rahe, und die Spielsteine liegen ohnehin obenauf. Wähle eine Größe; unter der Karte stehen die Zeilen zum Übernehmen.'
    },
    text: 'Auf dem offenen Wasser: See, Meer und breite Flüsse, kleine Inseln, Riffe und Schiffe. Das meiste der Karte ist das offene Wasser, dunkel und unruhig, mit einer Dünung, die über die Felder läuft; hier schwimmt man. Der Standard ist der Kies einer kleinen Insel, Tang und Seegras sind das schwierige Gelände. Das seichte Wasser über einer Sandbank nimmt das Zeichen des Eises wie im Sumpf: Man watet, und wo es ins Tiefe übergeht, liegt die Tiefenkante. Der Weg des Sets ist das Schiffsdeck: Aus Deckfeldern mit Höhen wird ein Schiff in einer von 22 Größen, die Karte legt die Bordwand glatt darum; ein Streifen von einem Feld Breite, der an Land oder an einem Schiff endet, ist die Laufplanke. An Bord zeichnen vier Zeichen anders: Der Baum ist der Mast mit einem Segel, das als Krone weit über die Bordwände reicht, die Treppe ist Leiter, Luke und Fallreep, das Dickicht Tauwerk, das Hindernis die Ballista; sonst sind sie Mangrove, Felsstufen, Treibgut und Wrackteil. Ein Schiff mit Ballista ist ein Kriegsschiff. Unter Deck ist eine eigene Karte (<code>unterDeck: true</code>). Was an Bord steht, steht auf dem Deck, was im Wasser steht, im Wasser. Das Riff ist der Fels des Sets, dunkel und voller Seepocken; es steht mit dem Fuß im Wasser, und Gischt liegt darum. Das Dickicht ist Treibgut, das Hindernis ein Wrackteil. Das Wetter des Sets sind Salz und Gischt auf allem, was draußen steht; durch Lücken kommt eine Pfütze mit Tang herein. Eine Strömung legt die Karte als Eintrag über das Wasser, nur als Zeichnung. Ein weiterer Eintrag zeigt dieselben Felder unter Wasser. Seenebel ist der Nebel aus Set 6. Die Tür ist die Standardtür.',
    rollen: [
      ['Grund', GW.kies, 'Kies; Kiesel #8b8676 und #a8a290, Kante #625d50, Seestern #b5855f'], ['Grund dunkel', GW.kiesDunkel, 'Tang und Seegras; Bänder #4a4d28 und #757a3c, Blasen #a9a65f, Seegras #5c6431'], ['Zeichnung', GW.stein, 'Kiesel, Steinplatte #a4a092, nasser Sand #b5ae99'],
      ['Licht', GW.linie, 'Ufer an Wand und Kartenrand, Rippeln im Sand'], ['Fels', '#56605c', 'Riff: Brocken; Grund #3b4543, Licht #94a198, Fugen #2a3230, Seepocken #dcd9ca, Gischt #dbe9e6'], ['Wasser', GW.tief, 'offenes Wasser; Mulden #285665, Kämme #86b5ba, Schaum und Ufersaum #dbe9e6, Kante #1c4552, Strömung #c4e0de'],
      ['Eis', GW.seicht, 'seichtes Wasser (i); Rippeln #6fa498, Kräusel und Tiefenkante #bcdcd2, Kante #47796f'], ['Grün', MANGROVE.grund, 'Mangrove #2f4f3c bis #5f8a5c, Blätter #a3c088, Wurzeln #7b6a50; Treibgut #59592f'], ['Weg', GW.planke[0], 'Schiffsdeck: Planken #ad9468 bis #c0a87c, Fugen #4a3c2a, Reling #6f5236, Bordwand #57432f'],
      ['Holz', '#7d6242', 'Wrack: Spanten; Kiel #5f4930, Beplankung #a98f67; Mastkopf #7d5f3f; Leiter #967c54 bis #c0a87c; Ballista #8f6f4a und #a5855c, Eisen #7f868a; Zinnen #c7ad82'], ['Segel', '#e6dcc2', 'Segel; Streifen #c2a56c, auf dem Kriegsschiff #8a7054, Nähte #ab9c7c, Licht #f7f1de, Rahe #6f5236'], ['Wetter', '#f2f4ef', 'Salz und Gischt, feuchter Streifen #7d9ea3, auf allem, was draußen steht'],
      ['Unter Wasser', '#2a7c8c', 'Schleier mit 30 %, Lichtnetz #eaf8f2; Grund #7c9482 und #c2cbac; Wasserwand #3f7f8b']
    ],
    ufer: { flaeche: GW.kies, linie: GW.linie, nachbar: true },
    weg: { wall: GW.reling, band: GW.planke[0], kante: '#3b3028', spuren: GW.nagel },
    // Eine Pfütze mit Tang: Was durch eine Lücke hereinkommt, ist Seewasser
    wehe: {
      2: '<path d="M3 30C7 25 13 25 18 27S30 30 33 27V33H3Z" fill="#8fb2b1" opacity=".9"/><path d="M6 30q5-2 10-.4" fill="none" stroke="#dcebe6" stroke-width="1" stroke-linecap="round"/><path d="M5 11C9 9 13 10 15 12C11 14 7 14 5 11Z" fill="#8fb2b1" opacity=".8"/>' + gTang('M19 16q4-3 8-.6') + gBlasen([[23, 13.6]]),
      1: '<path d="M6 27C10 24 15 25 17 28C13 30 9 30 6 27Z" fill="#8fb2b1" opacity=".8"/>' + gTang('M22 14q3-2 6-.4')
    },
    // Dunkler, feuchter Kies um das Lagerfeuer, verkohltes Treibholz und Muschelbruch
    feuerring: '<path d="' + FEUER_RING + '" fill="#45433b" opacity=".5"/>' + treibkohle(),
    // Riff: dunkler Fels mit Seepocken (pocken zeichnet felsTextur dazu), Gischt am Fuß, wo er im Wasser steht (gischtAuf); riff: frei stehend keine Plattform, sondern Fuß ringsum
    fels: { m: 7, h: 6, krone: '#56605c', licht: '#94a198', fuge: '#2b3331', front: '#3b4543', frontFuge: '#2a3230', flanke: '#47514e', pocken: '#dcd9ca', gischt: GW.schaum, gischtAuf: [GW.tief, GW.seicht], riff: true, riffGrund: GW.tief },
    // Wetter: Salz und Gischt auf der Seite zum Licht, auf den gemeinsamen Dingen draußen (und drinnen unter einer Wehe)
    wetter: {
      fass: salzWetter(13.4, 12.6, 9, -35), kiste: salzWetter(12.6, 11.2, 9, -20), truhe: salzWetter(11, 5.6, 8, -10),
      stuhl: salzWetter(13.6, 15, 7, -25), hocker: salzWetter(15.4, 15, 7, -35), tisch: salzWetter(11.4, 10.4, 9, -20), bank: salzWetter(10, 15.8, 7, -10)
    },
    muster: {
      kies: { grund: GW.kies, saum: GW.schaum, bilder: [
        gKiesel(8, 8, 3, 2.1, 20) + gKiesel(21, 6, 2.2, 1.6, -30, GW.steinHell) + gKiesel(29, 13, 3.1, 2.2, 10) + gKiesel(13, 17, 2.1, 1.5, 40, GW.steinHell) + gKiesel(24, 23, 2.6, 1.8, -15) + gKiesel(8, 27, 2.8, 2, -25, GW.steinHell) + gKiesel(18, 30, 1.8, 1.3, 15) + gKiesel(30, 30, 2.2, 1.5, 30, GW.steinHell),
        gKiesel(7, 12, 2.6, 1.9, -20) + gKiesel(16, 5.6, 1.9, 1.4, 25, GW.steinHell) + muschel(24, 12, 0.85, 20) + gKiesel(30, 21, 2.4, 1.7, 30) + gKiesel(14, 22, 3, 2.1, 10, GW.steinHell) + gKiesel(6, 29, 2, 1.5, 15) + gKiesel(23, 30, 2.6, 1.8, -25),
        '<path d="M6 9C13 6 25 7 31 12C33 17 27 21 18 20C10 20 3 15 6 9Z" fill="' + GW.kiesFein + '"/><path d="M9 11q3.4-2 7 0t7 0M12 16q3-1.8 6.4 0t6 0" fill="none" stroke="' + GW.linie + '" stroke-width="1" stroke-linecap="round"/>' + gKiesel(8, 25, 2.8, 2, 20) + gKiesel(19, 27, 2.1, 1.5, -20, GW.steinHell) + gKiesel(29, 26, 2.8, 2, 30) + gKiesel(14, 32, 1.7, 1.2, 10),
        '<path d="M11 8L19.6 6.4L25.6 10.4L24.6 17L16.6 19.4L10 15.4Z" fill="#a4a092" stroke="' + GW.steinKante + '" stroke-width="1" stroke-linejoin="round"/><path d="M12 9L19.4 7.6" stroke="' + GW.steinLicht + '" stroke-width="1" stroke-linecap="round"/><g fill="#e8e5d8" stroke="#6e6a5c" stroke-width=".4"><circle cx="15" cy="13.4" r=".9"/><circle cx="18" cy="11.6" r=".7"/><circle cx="21" cy="14.6" r=".9"/></g>' + gKiesel(5.6, 22, 2.4, 1.7, -20, GW.steinHell) + gKiesel(10, 30, 2.1, 1.5, 15) + gKiesel(21, 27, 2.8, 2, 15) + gKiesel(30, 24, 2.1, 1.5, 35) + gKiesel(30, 6, 1.9, 1.4, 20)
      ], selten: gSeestern(18, 19, 7, 12) },
      tang: { grund: GW.kiesDunkel, saum: GW.schaum, bilder: [
        gKiesel(29, 7, 2.2, 1.6, 20) + gKiesel(7, 31, 2, 1.4, -15) + gTang('M4 10q5-4 9-1t8-1') + gTang('M16 19q4-3 8-.8t9-1.4') + gTang('M4 23q4-3 8-.6t7 1') + gTang('M18 31q4-2.4 8-.6t6-1') + gBlasen([[9, 6.6], [17, 7.4], [22, 16.6], [29, 18], [9, 20.6], [16, 23.6], [24, 28.6]]) + gSeegras(29, 12) + gSeegras(7, 16)
      ] },
      seicht: { grund: GW.seicht, bilder: [gSeicht()] },
      // Vier Bilder, obwohl es nicht der Standard ist: das offene Wasser füllt die Karte, und die Dünung läuft über die Felder
      meer: { grund: GW.tief, saum: GW.schaum, bilder: [0, 1, 2, 3].map(gWellen), selten: gBrecher() },
      deck: { grund: GW.planke[0], bilder: ['<g transform="rotate(-90 18 18)">' + gPlanken() + '</g>'], selten: gTau(20, 17) },
      deckQuer: { grund: GW.planke[0], bilder: [gPlanken()], selten: gTau(20, 17) },
      // Unter Deck: was außerhalb des Rumpfs liegt, dunkel und ohne Kontrast wie die Felsmasse
      rumpfMasse: { grund: '#2b2118', bilder: ['<path d="M0 9H36M0 27H36" stroke="#352a1f" stroke-width="1.4"/>'] },
      riff: { grund: '#3b4543', bilder: ['<path d="M0 7C7 9 13 10 21 8S32 6 36 7V13C29 12 23 11 15 13S5 14 0 13Z" fill="#56605c"/><path d="M0 22C8 24 15 25 23 23S32 21 36 22V28C29 27 22 26 14 28S5 29 0 28Z" fill="#47514e"/>' +
        '<g fill="#dcd9ca"><circle cx="9" cy="10" r=".9"/><circle cx="26" cy="9.4" r=".8"/><circle cx="14" cy="25" r=".9"/><circle cx="29" cy="24" r=".8"/></g>'] },
      // unter Wasser: der Grund statt der Oberfläche (unterWasser bei den Kacheln ~ und i)
      grundTief: { grund: '#7c9482', bilder: ['<path d="M4 7q2.4-1.5 4.8 0t4.8 0M18 11q2.4-1.5 4.8 0t4.8 0M5 22q2.4-1.5 4.8 0t4.8 0M19 27q2.4-1.5 4.8 0t4.8 0" fill="none" stroke="#62796a" stroke-width="1.2" stroke-linecap="round"/>' + gKiesel(27, 19, 2.2, 1.5, 20, '#6b8272') + gKiesel(9, 30, 1.7, 1.2, -20, '#6b8272') + '<path d="M9 14l1.4 1.2 1.6-.8" fill="none" stroke="#b4c4ae" stroke-width=".9" stroke-linecap="round"/>'], selten: '<g fill="none" stroke="#dcefe8" stroke-width=".9"><circle cx="16" cy="20" r="2"/><circle cx="20" cy="14" r="1.4"/><circle cx="17" cy="9" r="1"/></g>' },
      grundSeicht: { grund: '#c2cbac', bilder: ['<path d="M5 8q2.4-1.5 4.8 0t4.8 0M19 13q2.4-1.5 4.8 0t4.8 0M6 24q2.4-1.5 4.8 0t4.8 0M20 29q2.4-1.5 4.8 0t4.8 0" fill="none" stroke="#a2ae90" stroke-width="1.2" stroke-linecap="round"/>' + gKiesel(26, 21, 1.8, 1.3, 20, '#a7b197')] }
    },
    aufsatz: {
      riffstufen: '<rect x="4" y="4" width="28" height="7" fill="#9aa39b"/><rect x="4" y="11" width="28" height="7" fill="#858f88"/><rect x="4" y="18" width="28" height="7" fill="#6f7a74"/><rect x="4" y="25" width="28" height="7" fill="#5a6661"/>' +
        '<path d="M4 11H32M4 18H32M4 25H32" stroke="#2b3331" stroke-width="1.6"/><path d="M5 5.6h26M5 12.6h26M5 19.6h26M5 26.6h26" stroke="#c6cdc4" stroke-width="1" opacity=".85"/>' +
        '<g fill="#e4e2d4"><circle cx="9" cy="8" r=".8"/><circle cx="25" cy="15" r=".8"/><circle cx="11" cy="22" r=".8"/><circle cx="23" cy="29" r=".9"/><circle cx="27" cy="29.4" r=".7"/></g>' + gTang('M8 29.6q3-1.4 6-.2'),
      fallreepstufen: '<rect x="8" y="4" width="20" height="28" fill="#4f3b27"/><rect x="9" y="5" width="18" height="5.4" fill="#c0a87c"/><rect x="9" y="12" width="18" height="5.4" fill="#b2986c"/><rect x="9" y="19" width="18" height="5.4" fill="#a48a60"/><rect x="9" y="26" width="18" height="5.4" fill="#967c54"/>' +
        '<path d="M6.2 4V32M29.8 4V32" stroke="#3b3028" stroke-width="2.6"/><path d="M6.2 4V32M29.8 4V32" stroke="#c9b68c" stroke-width="1.1" stroke-dasharray="2 1.4"/>',
      mangrove: mangroveTeile(1),
      mangroveKrone: mangroveTeile(2.1),
      // Beispiel: Segel auf einem Schiff von sechs Feldern Breite (die Karte rechnet es je Mast aus der Breite des Schiffs aus)
      segelBeispiel: segelTeile(6, 8, 8, false, false),
      maststumpf: mastStumpf(),
      // Unter Deck der Fuß des Masts, die Luke im Deck mit der Leiter hinab
      mastfuss: { schatten: '<circle cx="18" cy="18" r="8.4"/>', form: '<circle cx="18" cy="18" r="8.4" fill="#6f5236" stroke="#3b3028" stroke-width="1.2"/><path d="M18 9.6V13M18 23V26.4M9.6 18H13M23 18H26.4" stroke="#3b3028" stroke-width="1.2"/><circle cx="18" cy="18" r="5.2" fill="#8f6f4a" stroke="#3b3028" stroke-width="1"/><path d="M15.6 15.8A3.2 3.2 0 0 1 20 15.4" fill="none" stroke="#c0a87c" stroke-width="1"/>' },
      luke: '<rect x="5" y="5" width="26" height="26" fill="#6f5236" stroke="#3b3028" stroke-width="1.2"/><path d="M6.4 6.6H29.6" stroke="#a5855c" stroke-width="1"/><rect x="9" y="9" width="18" height="18" fill="#241b13" stroke="#3b3028" stroke-width="1"/><path d="M14 9V27M22 9V27" stroke="#6f5236" stroke-width="1.6"/><path d="M14 12.4H22" stroke="#967c54" stroke-width="1.8"/><path d="M14 17H22" stroke="#7d6242" stroke-width="1.8"/><path d="M14 21.6H22" stroke="#5f4930" stroke-width="1.8"/>',
      ballista: ballistaTeile(),
      tauwerk: tauwerkTeile(),
      treibgut: treibgutTeile(),
      wrack: wrackTeile()
    },
    kacheln: [
      { gruppe: 'Draußen', code: '.', name: 'Kies', art: 'Standard', muster: 'kies', kosten: 'kostet 1',
        proben: [[['iiiiii', 'i....i', 'i.::.i', 'i....i', 'iiiiii'], 'eine kleine Insel: Schaum am Ufer, Seichtes ringsum', 216], [['....', '....', '~~~~'], 'Kies +1,5 m über dem Wasser: der Steinrand', 144, { hoehe: ['1111', '1111', '0000'] }]],
        text: 'Der Grund einer kleinen Insel oder Sandbank, kühler und grauer als der Sand der Küste, in vier Varianten: Kiesel verschiedener Größe, Kiesel mit einer Muschel, ein Streifen nasser Sand, eine flache Steinplatte mit Seepocken. Zu viert in einem Muster von 72 Einheiten, damit kein Feld wie sein Nachbar aussieht. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, liegt ein Seestern darauf. Am Wasser liegt ein Saum aus Schaum.' },
      { code: ':', name: 'Tang und Seegras', art: 'schwieriges Gelände', muster: 'tang', kosten: 'kostet 2', naht: ['....', '.::.', '.:::', '..:.'],
        proben: [[['....', '.::.', 'i::i', 'iiii'], 'im Spülsaum, am Seichten', 144]],
        text: 'Wo die Flut den Kies überspült: Bänder aus Blasentang mit dunklem Rand und Blasen, kurze Horste Seegras, dazwischen Kiesel. Derselbe Ton wie der Kies, eine Stufe dunkler, mehr Zeichnung; wer hindurch will, rutscht und bleibt hängen. Bewusst kein Schlick, Ried oder Tiefsand: das haben die anderen Sets. Unter Wasser ist es Tang am Grund.' },
      { code: 'e', name: 'Schiffsdeck', art: 'Weg, gebaut', muster: 'deck', quer: 'deckQuer', steg: true, stueck: deckStueck, wasser: true, kosten: 'kostet 1', naht: ['~~~~~', '~eee~', 'eeeee', '~eee~', '~~~~~'], gross: ['~~~~~', '~eee~', 'eeeee', '~eee~', '~~~~~'],
        proben: [[['~~~~~~~~~~~~~~', '~~~~eeeeee~~~~', '~~eeeeeeeeee~~', '~eeeeeeeeeeee~', '~~eeeeeeeeee~~', '~~~~eeeeee~~~~', '~~~~~~~~~~~~~~'], 'Rumpf: Stufen werden zur glatten Bordwand, nach Süden sieht man sie, die Planken laufen längs; achtern das Ruder, vorn Steven und Bugspriet', 308, { hoehe: ['00000000000000', '00001111110000', '00111111111100', '01111111111110', '00111111111100', '00001111110000', '00000000000000'] }],
          schiffProbe(14, 7, 'gerefft', 'Ebenen, drei Decks: Poop +4,5 m, Achterdeck +3 m, Hauptdeck +1,5 m; die Kante trägt das höhere Feld, Leitern öffnen sie, die Luke führt hinab', 324, 1, 1),
          schiffProbe(18, 7, 'gerefft', 'Das Kastell am Heck: die höchste Stelle des Schiffs, +6 m, mit Zinnen', 324, 1, 1),
          schiffProbe(6, 2, 'segel', 'offenes Boot: Bänke und Riemen, ein schmales Dollbord, kein Ruder und kein Deck', 216, 1, 1),
          schiffProbe(15, 5, 0, 'Unter Deck, eine eigene Karte (<code>unterDeck: true</code>): Außerhalb des Rumpfs ist nur Holz, die Bordwand zeigt von innen die Spanten, ein Schott trennt die Kajüte ab; dieselben Spalten und Zeilen wie oben', 324, 1, 1),
          [['~~~~~~~', '~~~e~~~', '~~eee~~', '~~eee~~', '~~eee~~', '~~eee~~', '~~~e~~~', '~~~~~~~'], 'von Nord nach Süd: die Planken stehen senkrecht, Bug nach Norden', 154, { hoehe: ['0000000', '0001000', '0011100', '0011100', '0011100', '0011100', '0001000', '0000000'] }],
          [['~~~~~~~~~', '~~eeeee~~', '~eeeeeee~', '~~eeeee~~', '~~~~e~~~~', '~~~~e~~~~', '.........'], 'Laufplanke: ein Feld breit, vom Schiff an Land, ohne Bordwand', 198, { hoehe: ['000000000', '001111100', '011111110', '001111100', '000010000', '000010000', '000000000'] }],
          [['~~~~~~~~~', '~~eeeee~~', '~eoekkee~', '~~eeeee~~', '~~~~~~~~~'], 'an Bord: Fass und Kisten stehen auf dem Deck und tragen Salz', 198, { hoehe: ['000000000', '001111100', '011111110', '001111100', '000000000'] }]],
        text: 'Der Weg des Sets: gebaute Planken, die längs des Schiffs laufen, mit dunklen Fugen und einzelnen Stößen. Aus zusammenhängenden Deckfeldern wird ein Rumpf: Die Karte legt um die Felder eine glatte Bordwand mit Reling, auch wo sie eine Ecke abschneidet, und nach Süden sieht man wie bei einer gebauten Wand die Bordwand mit den Köpfen der Deckbalken. Achtern hängt das Ruder, vorn stehen Steven und Bugspriet. Die Decks liegen auf Ebenen: Das höhere Feld trägt an der Kante die Reling, Leitern (<code>/</code>) öffnen sie. Was tiefer liegt, ist eine eigene Karte: Unter Deck (<code>unterDeck: true</code>) steht außerhalb des Rumpfs <code>#</code>, für die Kampfkarte eine Wand, gezeichnet als Holz ohne Kontrast. Ein Schiff ist Deck aus diesem Zeichen, Kajüte aus Holzwänden und Dielen, Mast und Leitern aus <code>O</code> und <code>/</code>; das Blatt „Die Schiffe“ hat die 22 Größen fertig. Ein Boot ohne Mast, höchstens zwei Felder breit, hat Bänke und Riemen. Ein Streifen von einem Feld Breite und mindestens zwei Feldern Länge, der an Land oder an einem Schiff endet, ist die Laufplanke, die über der Reling liegt; schwimmt er frei, ist er ein Boot. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, liegt ein aufgeschossenes Tau darauf. Für das Ufer zählt es als Wasser.' },
      { code: 'i', name: 'Seichtes Wasser', art: 'schwieriges Gelände, waten', muster: 'seicht', rand: GW.seichtRand, unterWasser: 'grundSeicht', kosten: 'kostet 2', naht: ['....', '.ii.', '.iii', '..i.'],
        proben: [[['..::..', 'iiiiii', '~~~~~~'], 'Ufer in der Farbe des Nachbarn: Kies, Tang; zum Tiefen die Tiefenkante', 216]],
        text: 'Wasser über einer Sandbank, bis ans Knie, hell und blaugrün: Rippeln im Sand schimmern durch, ein Stein, kurze helle Kräusel. Es nimmt das Zeichen des Eises wie im Sumpf, denn es ist schwierig: Man watet, aber man schwimmt nicht. Zum Land hin ein Ufer aus Vierteln in der Farbe des Nachbarn; zum tiefen Wasser hin keins, dort zeichnet das tiefe Feld die Tiefenkante.' },
      { code: '~', name: 'Offenes Wasser', art: 'tiefes Wasser, schwimmen', muster: 'meer', rand: GW.rand, kante: { gegen: 'i', flaeche: GW.seicht, linie: GW.glanz }, unterWasser: 'grundTief', kosten: 'kostet 2', naht: ['....', '.~~.', '.~~~', '..~.'],
        proben: [[['iiiii', 'i~~~i', 'i~~~~', 'ii~~i'], 'seicht ringsum, tief in der Mitte', 180],
          [['~~~~~~', '~~~~~~', '~~~~~~', '~~~~~~'], 'Strömung (<code>stroemung</code>): Linien in Fließrichtung, nur Zeichnung', 216, { stroemung: [[1, 2, 90], [2, 2, 90], [3, 2, 90], [4, 2, 180], [4, 3, 90], [5, 3, 90], [6, 3, 90]] }]],
        text: 'Dunkel und unruhig: eine Dünung aus langen Kämmen mit hellem Licht und dunkler Mulde dahinter, hier und da Schaum auf dem Kamm. Sie läuft über die Felder und wiederholt sich erst nach 72 Einheiten, denn fast die ganze Karte besteht daraus; darum kommt das offene Wasser wie alles tiefe Wasser zu viert. Hier schwimmt man. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, bricht eine Welle. Am Land ein Ufer in der Farbe des Nachbarn mit einem Saum aus Schaum; zum seichten Wasser die Tiefenkante; am Riff steht der Fuß im Wasser.' },
      { gruppe: 'Höhe und Wände', code: '/', name: 'Felsstufen', art: 'Treppe, Rampe; an Bord Leiter, Luke und Fallreep', muster: 'kies', aufsatz: 'riffstufen', imWasser: true, anBord: { aufsatz: 'fallreepstufen' }, dreht: true, kosten: 'kostet 1, eine Stufe ohne Klettern',
        proben: [[['.....', 'FF/FF', '.....', '~~~~~'], 'Felsstufen: in den Fels gehauen', 180, { hoehe: ['11111', '11111', '00000', '00000'] }],
          [['~~~~~~~', '~eeeee~', '~eeeee~', '~ee/ee~', '~~~~~~~'], 'an Bord das Fallreep: vom Deck über die Reling hinab zum Wasser', 196, { hoehe: ['0000000', '0111110', '0111110', '0111110', '0000000'] }],
          [['~~~~~~~', '~eeeee~', '~ee/ee~', '~eeeee~', '~~~~~~~'], 'mitten auf dem Deck die Luke: hinab aufs Unterdeck, eine eigene Karte', 196, { hoehe: ['0000000', '0111110', '0111110', '0111110', '0000000'] }]],
        text: 'Zwei Zeichnungen auf einem Zeichen, die Nachbarn entscheiden wie bei Furt und Steg im Wald. Am Fels sind es gehauene Stufen, nass und mit Seepocken, nach oben heller, mit dunkler Stufenlinie, Tang auf der untersten und dem Schattenkeil. Hängt das Feld am Deck, sind es schmale Holzstufen zwischen zwei Tauen: von einem Deck aufs nächste oder über die Reling hinab zum Wasser; die Drehung folgt aus den Ebenen. Liegt das Feld mitten auf dem Deck, ringsum auf derselben Höhe, ist es die Luke mit der Leiter hinab; unter Deck führt die Leiter hinauf, wenn die Karte sie nicht als Luke nennt (<code>luken: [[x, y]]</code>). Hinauf liegt bei 0° oben; auf der Karte zeigt die Höhe der Nachbarn die Richtung.' },
      { code: 'F', name: 'Riff', art: 'Fels, gewachsen', muster: 'riff', kosten: 'gesperrt, ganzes Feld', gross: ['~~~~', '~FFF', '~F~~', '~F~~'],
        proben: [[['~~~~~', '~F~FF', '~~~F~', '~~~~~'], 'frei im Wasser: keine Plattform, Fuß und Gischt ringsum', 180],
          [['.....', 'FF/FF', '~~~~~', '~~~~~'], 'Klippe: oben die Insel, unten der Fuß im Wasser', 180, { hoehe: ['11111', '11111', '00000', '00000'] }],
          [['.....', '..F..', '.....'], 'an Land: ohne Gischt', 180]],
        text: 'Gewachsen, darum keine Mauer, sondern eine Abbruchkante von oben: dunkler, nasser Fels mit hellen Kanten zum Licht und Seepocken, die über die Felder durchlaufen. Welche Seite oben ist, sagen die Höhen der Karte. Anders als in den anderen Sets gibt es keine Plattform: Fels, der frei im Wasser steht, ragt daraus hervor, gesperrt und ohne begehbare Oberseite, mit dem Fuß ringsum im Wasser und Gischt darum. Auch ohne Höhen auf der Karte ist er so zu lesen. Am Kies steht der Fuß auf Kies, ohne Gischt.' },
      { gruppe: 'Umgebung', code: 'O', name: 'Mangrove', art: 'Baum; an Bord der Mast', muster: 'kies', aufsatz: 'mangrove', krone: 'mangroveKrone', imWasser: true, anBord: { krone: true, unten: 'maststumpf' }, kosten: 'nicht betretbar, Dreiviertel-Deckung',
        proben: [schiffProbe(12, 4, 'segel', 'an Bord der Mast: Das Segel ist eine Krone, die Rahe 1,7-mal so lang, wie das Schiff dort breit ist, die Takelage läuft zu Bug, Heck und Reling', 308, 1, 2),
          schiffProbe(15, 5, 'segel', 'zwei Segel: Die Rahe des Hauptmasts bleibt 1,7-mal so lang, die der anderen ist 1,4-mal so lang; die Tiefe lässt Platz bis zum nächsten Mast', 324, 1, 2),
          schiffProbe(12, 4, 'gerefft', 'gerefft (<code>gerefft: [[x, y]]</code>): das Segel liegt auf der Rahe, das Deck ist frei', 308, 1, 2),
          [['~~~~~', '~iii~', '~iOi~', '~iii~', '~~~~~'], 'die Mangrove im Seichten', 180]],
        text: 'Zwei Zeichnungen auf einem Zeichen. Abseits vom Schiff eine Mangrove: eine runde Krone aus ledrigen, dunklen Büscheln; für sich allein ragen unter ihr die Stelzwurzeln hervor, auf der Karte deckt sie die Krone von gut 3 m, die halb über die acht Nachbarn reicht. Sie steht auf dem, was ringsum überwiegt, im Seichten also im Seichten. Hängt das Feld am Deck, ist es der Mast, und sein Segel wird wie ein Baum als Krone behandelt: Gesperrt ist nur das Feld mit dem Mast, darunter geht man hindurch, die Krone gibt keine Deckung, die Spielsteine liegen obenauf, und kein Schatten fällt darauf. Die Rahe des Hauptmasts ist 1,7-mal so lang, wie das Schiff am Mast breit ist, wie bei den Koggen, deren Segel weit über die Bordwände reichte; die der anderen Masten 1,4-mal. Davor steht das volle Segel als große Sichel aus gestreiften Bahnen, die bis kurz vor den nächsten Mast reicht, und die Takelage läuft zu Bug, Heck und Reling. Das Segel hängt höher als alles an Bord und endet nur am Kartenrand. Es zeigt nach dem Bug; ein Eintrag beim Mast dreht das ganze Schiff. Unter Deck sieht man nur den Fuß des Masts. Ob der Mast Deckung gibt, sagt die Spielleitung.' },
      { code: 'd', name: 'Treibgut', art: 'Dickicht; an Bord Tauwerk und Netze', muster: 'meer', aufsatz: 'treibgut', imWasser: true, anBord: { aufsatz: 'tauwerk' }, kosten: 'kostet 2, schwieriges Gelände', naht: ['~~~', '~d~', '~~~'],
        proben: [[['iii', 'idi', 'iii'], 'im Seichten', 108], [['...', '.d.', '...'], 'angespült auf dem Kies', 108], [['~~~~~~~', '~eeeee~', '~eedee~', '~eeeee~', '~~~~~~~'], 'an Bord: Tauwerk und Netze', 224, { hoehe: ['0000000', '0111110', '0111110', '0111110', '0000000'] }]],
        text: 'Klumpen aus Tang an der Oberfläche, mit Blasen, dazwischen gebrochene Bretter und ein Stück Tau; wer hindurch will, schwimmt wie durch ein Netz. Es liegt auf dem, was ringsum überwiegt, auf tiefem oder seichtem Wasser oder auf dem Kies. Es liegt, darum ohne Schatten. Keine Seerosen: Die hat der Weiher in Set 4, und sie wachsen nicht auf offenem Wasser. Hängt das Feld am Deck, sind es aufgeschossene Taue und Netze, durch die man steigen muss.' },
      { code: 'x', name: 'Wrackteil', art: 'Hindernis; an Bord die Ballista', muster: 'meer', aufsatz: 'wrack', imWasser: true, anBord: { aufsatz: 'ballista' }, dreht: true, kosten: 'nicht betretbar', naht: ['~~~', '~x~', '~~~'],
        proben: [[['iii', 'ixi', 'iii'], 'im Seichten', 108], schiffProbe(9, 3, 'krieg', 'an Bord: die Ballista, ein Feld, sie zeigt zum Bug', 264, 1, 1, true),
          schiffProbe(15, 5, 'krieg', 'vier Felder im Block: eine große Ballista (DMG: groß); ein Schiff mit Ballista ist ein Kriegsschiff, was über dem Hauptdeck liegt, trägt Zinnen', 324, 1, 1, true)],
        text: 'Was von einem Rumpf aus dem Wasser ragt: der Kiel schräg von links unten nach rechts oben, die Spanten in Paaren zu beiden Seiten, ein Stück Beplankung, Tang und ein wenig Schaum. Umriss in Tinte und der Schatten als versetzte Silhouette. Es steht in dem Wasser, das ringsum überwiegt. Wie das Gerippe der Wüste und der umgestürzte Stamm dreht es nur nach Eintrag. Hängt das Feld am Deck, ist es die Ballista: die schwere Armbrust auf ihrem Drehkranz, Bogenarme, Sehne, der Bolzen in der Rinne, hinten die Winde; sie zeigt zum Bug, ein Eintrag dreht sie. Ein Schiff mit Ballista ist ein Kriegsschiff: Seine Kastelle tragen Zinnen, im Mast sitzt das Krähennest.' }
    ]
  };
  GEWAESSER.nachCode = {};
  GEWAESSER.kacheln.forEach(function (k) { GEWAESSER.nachCode[k.code] = k; });
  GEWAESSER.nachCode['§'] = { code: '§', name: 'Rumpf von innen', art: 'unter Deck, was außerhalb des Rumpfs liegt (auf der Karte #)', muster: 'rumpfMasse', kosten: 'gesperrt' };

  var DACH = {
    '#': { art: 'ziegel', hell: '#b48d6e', dunkel: '#987359', strich: '#7a5a46', licht: '#cdab8d', first: '#6f5140', toene: [0, 0.07, -0.05], front: '#8f897c', frontFuge: '#6a645a', sockel: '#5e584e' },
    'W': { art: 'schindel', hell: '#a39778', dunkel: '#867b60', strich: '#665c47', licht: '#bdb297', first: '#564d3b', toene: [0, -0.06, 0.05], front: '#6f5439', frontFuge: '#4f3b27', sockel: '#3f2f20' },
    'L': { art: 'stroh', hell: '#c9b57d', dunkel: '#a99660', strich: '#87764a', licht: '#e0cf9c', first: '#7a6a40', toene: [0, -0.05, 0.05], front: '#d9cba9', frontFuge: '#5c4630', sockel: '#5c4630' }
  };

  // Set 10: Stadt. Was zwischen den Häusern liegt: Kopfsteinpflaster, Gassen aus gestampfter Erde, nasses Pflaster, Schutt und Unrat, ein Kanal zwischen Kaimauern,
  // Steintreppen, eine Linde auf dem Platz, Kräuterbeete und ein Ziehbrunnen. Die Häuser kommen aus dem Gemeinsamen, von oben mit Dächern (set.haeuser).
  var SK = { grund: '#a89f8d', stein: ['#c3bba8', '#bab29f', '#cbc3b0', '#b2aa98'], licht: '#e0d9c7', zeichnung: '#7f7767', erde: '#bba88a', erdeDunkel: '#a39072', schutt: '#a0968a', kanal: '#425d5f', rand: '#283d3f', kanalTief: '#39525a', nass: ['#a9ac9f', '#a1a497', '#b1b4a7', '#999c8f'], nassGrund: '#8a8d84', nassLicht: '#dfe6df' };
  // Rollsteine, flach gelegt, in Reihen mit wechselnder Breite; dazwischen die Fuge im Grund. Kein Stein kreuzt den Feldrand, die Fuge ist an der Naht so breit wie innen.
  function pfStein(x0, y0, x1, y1, r) {
    var a = gr(x0 + 0.45), b = gr(y0 + 0.45), c = gr(x1 - 0.45), d = gr(y1 - 0.45);
    return 'M' + gr(a + r) + ' ' + b + 'H' + gr(c - r) + 'Q' + c + ' ' + b + ' ' + c + ' ' + gr(b + r) + 'V' + gr(d - r) + 'Q' + c + ' ' + d + ' ' + gr(c - r) + ' ' + d + 'H' + gr(a + r) + 'Q' + a + ' ' + d + ' ' + a + ' ' + gr(d - r) + 'V' + gr(b + r) + 'Q' + a + ' ' + b + ' ' + gr(a + r) + ' ' + b + 'Z';
  }
  function pflasterSteine(seed, farben, lichtFarbe) {
    function z() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var toene = ['', '', '', ''], licht = '', y = 0, HOEHEN = [7.4, 6.8, 7.6, 7, 7.2];
    HOEHEN.forEach(function (h) {
      var w = [], s = 0, x = 0;
      for (var i = 0; i < 5; i++) { var g = 0.74 + z() * 0.56; w.push(g); s += g; }
      w.forEach(function (g) {
        var b = g / s * 36, r = gr(1.8 + z() * 0.9), t = Math.floor(z() * 4);
        toene[t] += pfStein(x, y, x + b, y + h, r);
        if (z() < 0.5) licht += 'M' + gr(x + 1.2) + ' ' + gr(y + h - 2.6) + 'V' + gr(y + 2.6) + 'Q' + gr(x + 1.2) + ' ' + gr(y + 1.2) + ' ' + gr(x + 2.6) + ' ' + gr(y + 1.2) + 'H' + gr(x + b * 0.62);
        x += b;
      });
      y += h;
    });
    return toene.map(function (d, i) { return d ? '<path d="' + d + '" fill="' + (farben || SK.stein)[i] + '"/>' : ''; }).join('') + '<path d="' + licht + '" fill="none" stroke="' + (lichtFarbe || SK.licht) + '" stroke-width=".8" stroke-linecap="round" opacity=".6"/>';
  }
  function halm(x, y, l, rot, farbe) { return '<path d="M' + x + ' ' + y + 'l' + gr(l * Math.cos(rot * Math.PI / 180)) + ' ' + gr(l * Math.sin(rot * Math.PI / 180)) + '" stroke="' + (farbe || '#c9b06b') + '" stroke-width="1" stroke-linecap="round"/>'; }
  function erdtritt(x, y, rot) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="1.7" ry="2.6" transform="rotate(' + rot + ' ' + x + ' ' + y + ')" fill="' + SK.erdeDunkel + '"/>'; }
  function gKieselchen(x, y, r) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r + '" ry="' + gr(r * 0.72) + '" fill="#a69d8b" stroke="#6f6757" stroke-width=".7"/>'; }
  // Ziegelbruch: ein gebrochenes Stück, kantig
  function bruchstueck(x, y, s, rot, farbe) { return '<path d="M' + gr(x - s) + ' ' + gr(y - s * 0.5) + 'L' + gr(x + s * 0.7) + ' ' + gr(y - s * 0.7) + 'L' + gr(x + s) + ' ' + gr(y + s * 0.2) + 'L' + gr(x + s * 0.1) + ' ' + gr(y + s * 0.7) + 'L' + gr(x - s * 0.8) + ' ' + gr(y + s * 0.5) + 'Z" transform="rotate(' + rot + ' ' + x + ' ' + y + ')" fill="' + farbe + '" stroke="#4f4436" stroke-width=".9"/>'; }
  function brettstueck(x, y, l, rot) { return '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')"><rect x="' + gr(x - l / 2) + '" y="' + gr(y - 1.9) + '" width="' + l + '" height="3.8" fill="#8f7350" stroke="#3b3028" stroke-width=".9"/><path d="M' + gr(x - l / 2 + 1.6) + ' ' + gr(y - 0.5) + 'h' + gr(l * 0.45) + '" stroke="#b39a72" stroke-width=".7" stroke-linecap="round"/></g>'; }
  // Das Ende des Pflasters: am Rand einer Gasse und eines nassen Flecks liegt es lose aus (Viertel oben links, 0 bis 18)
  var PFLASTER_RAND = 'M0 0H18V3.8C14.6 5.6 12 3.6 8.6 5S3 5.4 0 3.8Z';
  function pflasterStueck(st) {
    var o = [], n = st === 'oben' || st === 'aussen', w = st === 'links' || st === 'aussen';
    function saum() { return '<path d="' + PFLASTER_RAND + '" fill="' + SK.grund + '"/><path d="' + pfStein(0.6, -0.4, 5.6, 3.6, 1.4) + pfStein(11.6, -0.4, 17.6, 3.4, 1.4) + '" fill="' + SK.stein[0] + '"/><path d="' + pfStein(5.8, -0.4, 11.4, 4, 1.4) + '" fill="' + SK.stein[3] + '"/>'; }
    if (n) o.push(saum());
    if (w) o.push('<g transform="matrix(0 1 1 0 0 0)">' + saum() + '</g>');
    if (st === 'innen') o.push('<path d="M0 0H5C5 3 3 5 0 5Z" fill="' + SK.grund + '"/><path d="' + pfStein(0, 0, 3.8, 3.8, 1.2) + '" fill="' + SK.stein[1] + '"/>');
    return o.join('');
  }
  // Die Gosse (Karteneintrag, nur Zeichnung): eine gemauerte Rinne, 10 breit (rund 40 cm) zwischen zwei Reihen Randsteinen, gerade wie alles Gebaute; Formen wie der Weg
  var GOSSE = { wasser: '#74735f', tief: '#5c5c4a', kraeusel: '#a3a38c', kante: '#4a4538', saum: '#9f9786', fuge: '#5e584c' };
  var GOSSE_PFADE = {
    gerade: ['M13 0V36H23V0Z', 'M13 0V36M23 0V36', 'M18 0V36', 'M15.6 7q2 -1 4 .2M16 24q2 -1 4 .2', 'M10 9h3M23 9h3M10 27h3M23 27h3'],
    ecke: ['M13 0V19Q13 23 17 23H36V13H25Q23 13 23 11V0Z', 'M13 0V19Q13 23 17 23H36M23 0V11Q23 13 25 13H36', 'M18 0V15Q18 18 21 18H36', 'M15.4 7q2 -1 4 .2M26 16.4q2 -1 4 .2', 'M10 9h3M23 7h3M28 10v3M28 23v3'],
    abzweig: ['M13 0V36H23V23H36V13H23V0Z', 'M13 0V36M23 0V13H36M36 23H23V36', 'M18 0V36M18 18H36', 'M15.6 7q2 -1 4 .2M27 16.4q2 -1 4 .2', 'M10 9h3M10 27h3M23 7h3M23 29h3M29 10v3M29 23v3'],
    kreuz: ['M13 0V13H0V23H13V36H23V23H36V13H23V0Z', 'M13 0V13H0M0 23H13V36M23 36V23H36M36 13H23V0', 'M18 0V36M0 18H36', 'M15.6 6q2 -1 4 .2M26 16.4q2 -1 4 .2', 'M10 7h3M23 7h3M10 29h3M23 29h3M7 10v3M29 10v3M7 23v3M29 23v3'],
    ende: ['M13 0V24H23V0Z', 'M13 0V24H23V0', 'M18 0V21', 'M15.6 8q2 -1 4 .2', 'M10 9h3M23 9h3'],
    fleck: ['M18 10C23 10 26 13 26 18S23 26 18 26 10 23 10 18 13 10 18 10Z', 'M18 10C23 10 26 13 26 18S23 26 18 26 10 23 10 18 13 10 18 10Z', '', 'M14.6 18a3.4 2.4 0 1 0 6.8 0a3.4 2.4 0 1 0 -6.8 0', '']
  };
  function gosseSvg(form) {
    var p = GOSSE_PFADE[form];
    return '<path d="' + p[1] + '" fill="none" stroke="' + GOSSE.saum + '" stroke-width="5.6"/><path d="' + p[0] + '" fill="' + GOSSE.wasser + '"/>' + (p[2] ? '<path d="' + p[2] + '" fill="none" stroke="' + GOSSE.tief + '" stroke-width="3"/>' : '') +
      '<path d="' + p[3] + '" fill="none" stroke="' + GOSSE.kraeusel + '" stroke-width=".9" stroke-linecap="round"/><path d="' + p[1] + '" fill="none" stroke="' + GOSSE.kante + '" stroke-width="1.2"/>' + (p[4] ? '<path d="' + p[4] + '" fill="none" stroke="' + GOSSE.fuge + '" stroke-width=".8"/>' : '') + (form === 'ende' ? '<rect x="11" y="24" width="14" height="4.4" fill="' + GOSSE.saum + '" stroke="' + GOSSE.kante + '" stroke-width="1"/>' : '');
  }
  // Bruchstein in Lagen (Kaimauer): Lagen zu 9, Steine ungleich lang, über 72 × 72 fortlaufend. Als Pfad: Lagerfugen und Stoßfugen, Lichtkanten
  var QUADER = (function () {
    var seed = 11, f = '', l = '';
    function z() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var j = 0; j < 8; j++) {
      var y = j * 9, x = -(z() * 8), start = x;
      f += 'M0 ' + y + 'H72';
      while (x < 72 + start - 0.01) {
        var b = 11 + z() * 10;
        if (x + b > 72 + start - 6) b = 72 + start - x;
        var xe = x + b;
        [0, 72].forEach(function (d) { if (xe - d > -1 && xe - d < 73) f += 'M' + gr(xe - d) + ' ' + y + 'V' + (y + 9); });
        if (z() < 0.7) { var la = Math.max(0, x + 1), le = Math.min(72, xe - 2); if (le > la) l += 'M' + gr(la) + ' ' + (y + 1) + 'H' + gr(le); if (x + 1 < 0) l += 'M' + gr(73 + x) + ' ' + (y + 1) + 'H72'; }
        x = xe;
      }
    }
    return { fugen: f + 'M0 72H72', licht: l };
  })();
  function schmutz(x, y, r, ph) { return '<path d="' + wolke(x, y, r, 7, ph || 0.4) + '" fill="#6f6656" opacity=".09"/>'; }
  // Linde: eine runde Krone aus vielen kleinen Büscheln, mittleres Grün, heller Blütenstaub. f wie bei allen Bäumen
  var LINDE = { schatten: '#4d6a3c', grund: '#6a8a4a', licht: '#87a65e', blatt: '#b6cb8d', bluete: '#dcd9a3' };
  function lindeTeile(f) {
    var g = f > 1.5, R = gr(13.6 * f), umriss = wolke(18, 18, R, g ? 28 : 15, 0.5), buesch = '', hell = '', flecken = '', seed = 9;
    function z() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    function ring(n, abstand, r, ph) {
      for (var i = 0; i < n; i++) {
        var a = ph + i * 2 * Math.PI / n, x = 18 + abstand * Math.cos(a), y = 18 + abstand * Math.sin(a), rr = gr(r * (0.9 + z() * 0.2));
        var zumLicht = Math.cos(a + 3 * Math.PI / 4) > -0.2;
        buesch += '<path d="' + wolke(gr(x + 1), gr(y + 1), rr, 8, a) + '" fill="' + LINDE.schatten + '"/><path d="' + wolke(gr(x), gr(y), rr, 8, a) + '" fill="' + (zumLicht ? LINDE.licht : LINDE.grund) + '"/>';
        hell += 'M' + gr(x - rr * 0.6) + ' ' + gr(y - rr * 0.1) + 'q' + gr(rr * 0.3) + ' ' + gr(-rr * 0.55) + ' ' + gr(rr * 0.75) + ' ' + gr(-rr * 0.45);
        if (i % 2 === 0) flecken += '<circle cx="' + gr(x + rr * 0.2) + '" cy="' + gr(y + rr * 0.15) + '" r=".8"/>';
      }
    }
    if (g) { ring(15, 22.5, 6.6, 0.1); ring(10, 13.4, 6.4, 0.5); ring(5, 5.4, 5.8, 0.9); }
    else { ring(8, 8.6, 4.6, 0.2); ring(3, 3.2, 4.2, 0.8); }
    return {
      schatten: '<path d="' + umriss + '"/>',
      form: '<path d="' + umriss + '" fill="' + LINDE.schatten + '" stroke="#3b3028" stroke-width="1.3" stroke-linejoin="round"/>' + buesch + '<path d="' + hell + '" fill="none" stroke="' + LINDE.blatt + '" stroke-width="1" stroke-linecap="round"/><g fill="' + LINDE.bluete + '">' + flecken + '</g>'
    };
  }
  // Kräuterbeet in einem Flechtzaun, kleiner und heller als der Baum
  function beetTeile() {
    var kraut = [[11, 11], [18.4, 10.4], [25, 12], [10.6, 18], [18, 18.4], [25.4, 19], [11.4, 25], [18.6, 25.6], [25, 25]], k = '', h = '', bl = '';
    kraut.forEach(function (p, i) {
      var c = i % 3 === 0 ? '#8fa365' : i % 3 === 1 ? '#a7b67c' : '#7f9a5e';
      k += '<path d="' + wolke(p[0], p[1], 3.3, 6, i) + '" fill="' + c + '" stroke="#55663c" stroke-width=".7"/>';
      h += 'M' + gr(p[0] - 1.6) + ' ' + gr(p[1] - 0.6) + 'q1 -1.4 2.6 -1';
      if (i % 4 === 1) bl += '<circle cx="' + gr(p[0] + 0.8) + '" cy="' + gr(p[1] + 0.8) + '" r="1" fill="#c9a34a"/>';
    });
    var flecht = ''; for (var a = 7; a <= 29; a += 3.6) flecht += 'M' + gr(a) + ' 5.4v2.4M' + gr(a) + ' 28.2v2.4M5.4 ' + gr(a) + 'h2.4M28.2 ' + gr(a) + 'h2.4';
    return {
      schatten: '<rect x="4" y="4" width="28" height="28" rx="2"/>',
      form: '<rect x="4" y="4" width="28" height="28" rx="2" fill="#8a6e4a" stroke="#3b3028" stroke-width="1.3"/><rect x="7.6" y="7.6" width="20.8" height="20.8" fill="#6a5640"/>' + k + '<path d="' + h + '" fill="none" stroke="#d3dcb4" stroke-width=".8" stroke-linecap="round"/>' + bl + '<path d="' + flecht + '" stroke="#5c4630" stroke-width="1.1"/>'
    };
  }
  // Ziehbrunnen: ein Ring aus Steinen (1,2 m), dunkles Wasser, Balken mit Winde und Eimer
  function brunnenTeile() {
    var fugen = ''; for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5 + 0.2; fugen += 'M' + gr(18 + 9.4 * Math.cos(a)) + ' ' + gr(18 + 9.4 * Math.sin(a)) + 'L' + gr(18 + 14 * Math.cos(a)) + ' ' + gr(18 + 14 * Math.sin(a)); }
    return {
      schatten: '<circle cx="18" cy="18" r="14.6"/>',
      form: '<circle cx="18" cy="18" r="14.4" fill="#a39c8d" stroke="#3b3028" stroke-width="1.3"/><path d="' + fugen + '" stroke="#6a645a" stroke-width=".9"/><path d="M6.6 13.4A12.6 12.6 0 0 1 16.4 5.6" fill="none" stroke="#d0c9b8" stroke-width="1.2" stroke-linecap="round"/>' +
        '<circle cx="18" cy="18" r="9.2" fill="#2f3a3b" stroke="#3b3028" stroke-width="1.1"/><path d="M13.4 22q3 2 6.4 1.4" fill="none" stroke="#7f9694" stroke-width="1" stroke-linecap="round"/>' +
        '<rect x="2.6" y="15.8" width="30.8" height="4.4" fill="#7d5f3f" stroke="#3b3028" stroke-width="1.1"/><path d="M4 17h12M21 17h11" stroke="#a5855c" stroke-width=".8"/><rect x="14" y="14.6" width="8" height="6.8" fill="#6f5236" stroke="#3b3028" stroke-width="1"/><path d="M16 14.8v6.4M18 14.8v6.4M20 14.8v6.4" stroke="#a5855c" stroke-width=".7"/>' +
        '<circle cx="24.6" cy="24.2" r="2.7" fill="#8a6e4a" stroke="#3b3028" stroke-width="1"/><path d="M23 20.2l1.4 1.6" stroke="#c9b68c" stroke-width=".9"/>'
    };
  }
  // Wetter: Ruß und Regenflecken, ein dunkler Schmierer auf der Seite zum Licht mit einer Regenspur
  function russWetter(x, y, w, rot) {
    return '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')"><path d="M' + gr(x - w / 2) + ' ' + y + 'q' + gr(w / 2) + ' -2 ' + w + ' -.2" fill="none" stroke="#3a352e" stroke-width="1.9" stroke-linecap="round" opacity=".62"/><path d="M' + gr(x + w * 0.1) + ' ' + gr(y + 0.8) + 'v2.8" stroke="#3a352e" stroke-width=".9" stroke-linecap="round" opacity=".5"/><circle cx="' + gr(x - w * 0.3) + '" cy="' + gr(y + 2) + '" r=".7" fill="#3a352e" opacity=".6"/></g>';
  }
  // Ring: ein Brandfleck auf dem Pflaster, Rußfahnen und zwei zersprungene Steine
  function brandfleck() {
    return '<path d="M4 10q3 -5 8 -6M30 8q3 4 3 9M31 26q-3 5 -9 6M6 28q-3 -4 -3 -9" fill="none" stroke="#2a2520" stroke-width="2.4" stroke-linecap="round" opacity=".5"/><path d="M9 6l2.4 2.4M27 28l2.2 -2.2" stroke="#d0c9b8" stroke-width=".8" stroke-linecap="round"/>';
  }
  var BOHLEN = '<path d="M0 0H36V6.6H0ZM0 7.4H36V14H0ZM0 14.8H36V21.4H0ZM0 22.2H36V28.8H0ZM0 29.6H36V36H0Z" fill="#a48a60"/><path d="M0 1.2H36M0 8.6H36M0 16H36M0 23.4H36M0 30.8H36" stroke="#c0a87c" stroke-width=".8"/><path d="M12 4l5 .4M22 11l6 -.3M6 18.6l5 .3M25 26l5 .2M10 33l6 -.2" stroke="#6f5a3e" stroke-width=".8" stroke-linecap="round"/>';
  var STADT = {
    id: 'stadt', nr: 10, name: 'Stadt', standard: 'pflaster', status: 'fertig', weheName: 'Unrat, Stroh und Laub',
    // Häuser von oben (Max, 2.11., b + c): Blöcke von mindestens 2 × 2 gebauten Feldern sind gesperrte Masse unter einem Dach; Räume, die die Figur nicht sieht, liegen unter demselben Dach
    haeuser: {
      text: 'Eine Stadtkarte ist vor allem Haus, und die meisten Häuser betritt niemand. Darum ist jede gebaute Wand, die mindestens zwei Felder tief und breit steht, ein <b>Block</b>: gesperrte Masse unter einem Dach, ohne Innenraum und ohne neues Zeichen. Das Material folgt dem Zeichen: Lehmwand <code>L</code> ist Fachwerk mit Stroh, Holzwand <code>W</code> Bohlen mit Schindeln, Steinmauer <code>#</code> Bruchstein mit Ziegeln. Wechselt das Zeichen, beginnt ein neues Haus; ein langer Block teilt sich von selbst in Häuser von 3 bis 6 Feldern (4,5 bis 9 m) und liegt ab 4 Feldern Tiefe mit dem Giebel oder der Traufe zur Straße, wie es die Form ergibt: Ein Haus, das tiefer ist als breit, zeigt nach Süden den Giebel. Nach Süden sieht man die Front, wie bei jeder gebauten Wand; am Kartenrand läuft das Haus hinaus. <b>Ein Haus mit Tür</b> hat seinen Grundriss wie bisher, Wände aus einem Feld und Innenböden. In der Vorführung ist er zu sehen, im Kampf liegt er unter demselben Dach, solange die Figur nicht hineinsieht, nur die Tür bleibt darauf zu sehen. Steht die Tür offen oder ist die Figur drin, verschwindet das Dach dieses Hauses. Ein Hof mit Boden von draußen bekommt kein Dach. Dächer sind auf der Karte gesperrt wie die Wand darunter; ob man sie begehen kann, ist eine Regelwerk-Frage an den Weltenhüter. Ein Dach gibt keine neue Regel: Die Felder bleiben, was sie in kampf.js sind. Bei Nacht und im dichten Nebel zeigt die Karte vom Dach nur, was die Figur sieht.',
      ansichten: [
        [{ boden: ['LLLLL', 'LLLLL', 'LLLLL', 'LLLLL', 'LLLLL', '.....'] }, null, 'Lehm: Fachwerk und Stroh, 7,5 × 7,5 m, der Giebel nach Süden'],
        [{ boden: ['WWWWWW', 'WWWWWW', 'WWWWWW', 'WWWWWW', '......'] }, null, 'Holz: Bohlen und Schindeln, 9 × 6 m, die Traufe nach Süden'],
        [{ boden: ['#####', '#####', '#####', '#####', '#####', '.....'] }, null, 'Stein: Bruchstein und Ziegel, mit Rauchfang'],
        [{ boden: ['LLLLWWWWW###LLL', 'LLLLWWWWW###LLL', 'LLLLWWWWW###LLL', 'LLLLWWWWW###LLL', 'LLLLWWWWW###LLL', '...............'] }, null, 'Eine Zeile: Wo das Zeichen wechselt, beginnt ein Haus'],
        [{ boden: ['LLLLLLLLLLLLLLL', 'LLLLLLLLLLLLLLL', 'LLLLLLLLLLLLLLL', 'LLLLLLLLLLLLLLL', '...............', '...............', 'WWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWW'] }, null, 'Ein langer Block teilt sich von selbst; flach oder am Kartenrand ohne Front'],
        [{ boden: ['LLLLWWWWWW', 'LLLLW===tW', 'LLLLW=pp=W', 'LLLLW====W', 'LLLLWW+WWW', '..........', '..........'], wesen: [{ x: 3, y: 6, art: 'figur', kurz: 'FS' }, { x: 8, y: 3, art: 'gegner', kurz: 'W' }] }, { sicht: true }, 'Haus mit Tür, im Kampf: unter dem Dach, nur die Tür bleibt zu sehen, W nicht'],
        [{ boden: ['LLLLWWWWWW', 'LLLLW===tW', 'LLLLW=pp=W', 'LLLLW====W', 'LLLLWW+WWW', '..........', '..........'], wesen: [{ x: 3, y: 6, art: 'figur', kurz: 'FS' }, { x: 8, y: 3, art: 'gegner', kurz: 'W' }] }, { sicht: true, offen: { '7,5': 1 } }, 'Die Tür steht offen: das Dach ist fort, W ist zu sehen'],
        [{ boden: ['LLLLWWWWWW', 'LLLLWWWWWW', 'LLLLWWWWWW', 'LLLLWWWWWW', 'LLLLWWWWWW', '..........', '..........'], grundlicht: 'dunkel', lichter: [[3, 6, 4, 8]], wesen: [{ x: 3, y: 6, art: 'figur', kurz: 'FS' }] }, { sicht: true }, 'Bei Nacht, im Kampf, mit einer Fackel: nur die Kante im Licht']
      ]
    },
    hangAuf: ['bohlen', 'bohlenQuer', 'holz'],
    bollwerk: true,
    // Schiffe (Max, 2.11.): dieselben Zeilen wie in Set 9; frei: e ist an Land die Gasse, ein Schiff ist nur, was an einem Mast oder einer Bank im Wasser hängt
    schiff: { deck: 'e', anBord: 'O/dxbkotSHp', frei: true, wasser: ['kanal'], draussen: ['deck', 'deckQuer', 'kanal'] },
    text: 'Zwischen den Häusern, auf dem Stand des 14. Jahrhunderts: Märkte und Hauptstraßen sind gepflastert, die Nebengassen meist noch nicht. Der Grund ist Kopfsteinpflaster aus flachen Flusssteinen. Der Weg des Sets ist die Gasse aus gestampfter Erde; sie füllt das Feld, denn eine Gasse ist breiter als eine Linie, und über Wasser wird sie von selbst zur Brücke aus Bohlen. Nasses Pflaster nimmt das Zeichen des Eises, denn es ist glatt. Schutt und Unrat sind das schwierige Gelände. Der Kanal liegt dunkel zwischen Mauern. Die Kaimauer ist der Fels des Sets: gebaut, darum gerade, doch mit der Kante aus den Höhen und mit dem Fuß im Wasser; Steintreppen führen an ihr hinab. Der Baum ist eine Linde, das Dickicht ein Kräuterbeet im Flechtzaun, das Hindernis ein Ziehbrunnen. Das Wetter des Sets sind Ruß und Regenflecken auf allem, was draußen steht; durch Lücken kommen Unrat, Stroh und Laub herein. Die Tür ist die Standardtür. Häuser zeichnet das Set nicht neu: Sie sind die gemeinsamen Wände, von oben mit Dächern (unten das Blatt „Häuser von oben“). Zwei Einträge kommen dazu, beide nur Zeichnung: die Gosse in der Mitte einer Straße und die Plane über einem Marktstand. Ein Haus hat ein oder zwei Obergeschosse, selten einen Keller oder einen Dachboden, jedes als eigene Karte (Blatt „Die Häuser“). Am Wasser ist die Stadt ein Hafen: Holzkai, Kran und die Schiffe aus Set 9 (Blatt „Der Hafen“).',
    rollen: [
      ['Grund', SK.stein[0], 'Kopfsteinpflaster: Steine #bab29f bis #cbc3b0, Licht #e0d9c7, Fuge #a89f8d; Pfütze #7f9294'], ['Grund dunkel', SK.schutt, 'Schutt und Unrat: Ziegelbruch #a8765c und #96684f, Stein #b5ad9b, Brett #8f7350, Stroh #c9b06b'], ['Zeichnung', '#6f6757', 'Kante der Kiesel; Kiesel #a69d8b'], ['Licht', SK.licht, 'Steinkanten, Ufersaum'],
      ['Fels', '#8d8779', 'Kaimauer: Lagen; Fugen #4d483e, Licht #c1baa8, Kante unten #3b3028'], ['Wasser', SK.kanal, 'Kanal; tiefer Fleck #39525a, Kräusel #6f8886, Kante #283d3f'], ['Eis', SK.nass[2], 'nasses Pflaster (i): Steine #999c8f bis #b1b4a7, Fuge #8a8d84, Glanz #dfe6df'], ['Grün', LINDE.grund, 'Linde #4d6a3c bis #87a65e, Blätter #b6cb8d, Blüten #dcd9a3; Kräuter #7f9a5e bis #a7b67c'],
      ['Weg', SK.erde, 'Gasse: gestampfte Erde; Tritte #a39072; über Wasser Bohlen #a48a60, Fugen #4a3c2a, Licht #c0a87c'], ['Holz', '#7d5f3f', 'Brunnenbalken; Winde #6f5236, Flechtzaun #8a6e4a und #5c4630'], ['Wetter', '#3a352e', 'Ruß und Regenflecken auf allem, was draußen steht'],
      ['Dach', DACH['#'].hell, 'Ziegel #987359 bis #b48d6e (kein Rot); Schindeln #867b60 bis #a39778; Stroh #a99660 bis #c9b57d; Linien #7a5a46, #665c47, #87764a'], ['Front', DACH.L.front, 'Fachwerk: Putz #d9cba9, Balken #5c4630; Bohlen #6f5439, Fugen #4f3b27; Bruchstein #8f897c, Fugen #6a645a'],
      ['Gosse', GOSSE.wasser, 'Eintrag: Rinne #5c5c4a, Randsteine #9f9786, Kante #4a4538'], ['Plane', '#d9cda9', 'Eintrag: Streifen #a8a67a, Saum #c7ba92, Naht #8a7a56']
    ],
    ufer: { flaeche: SK.grund, linie: SK.licht, nachbar: true },
    weg: { wall: SK.grund, band: SK.erde, kante: SK.zeichnung, spuren: SK.erdeDunkel },
    // Was durch eine Lücke hereinkommt: Unrat, Stroh, ein Stück Ziegel, Laub
    wehe: {
      2: '<path d="M2 31C6 26 12 25 18 27S30 31 34 28V34H2Z" fill="#9c8f76" opacity=".85"/><path d="M4 11C8 9 13 10 16 12C12 14 7 14 4 11Z" fill="#9c8f76" opacity=".8"/>' + halm(6, 29, 7, -20) + halm(14, 31, 6, 15) + halm(22, 29.6, 7, -35) + bruchstueck(27, 31, 2, 20, '#a8765c') + halm(7, 12, 6, 10) + buchenblatt(24, 15, 4.4, 30, STREU[1]),
      1: '<path d="M6 27C10 24 15 25 17 28C13 30 9 30 6 27Z" fill="#9c8f76" opacity=".8"/>' + halm(8, 27, 6, -15) + halm(24, 14, 6, 40)
    },
    feuerring: '<path d="' + FEUER_RING + '" fill="#3a352e" opacity=".42"/>' + brandfleck(),
    // Kaimauer: gebaut, darum Lagen und gerade Kanten (quader, gerade); sie folgt sonst der Regel des Felses
    fels: { m: 7, h: 6, krone: '#8d8779', licht: '#c1baa8', fuge: '#4d483e', front: '#6f6a5e', frontFuge: '#4d483e', flanke: '#7a7569', quader: true, gerade: true },
    wetter: {
      fass: russWetter(13.2, 12.4, 7, 10), kiste: russWetter(12, 11.4, 7, 15), truhe: russWetter(10.6, 5.6, 7, 0), stuhl: russWetter(13.6, 14.4, 5.4, 20),
      hocker: russWetter(15.4, 15, 5, 10), tisch: russWetter(11, 10.6, 7, 15), bank: russWetter(9.6, 15.4, 7, 5)
    },
    muster: {
      pflaster: { grund: SK.grund, ufer: SK.grund, saum: SK.licht, bilder: [
        pflasterSteine(3),
        pflasterSteine(17) + schmutz(24, 24, 7, 0.9) + halm(9, 12, 6, 25),
        pflasterSteine(29),
        pflasterSteine(41) + halm(24, 9, 6, -30) + halm(27, 11, 5, 10)
      ], selten: '<path d="M7 17C9 11 15 9 20 11S30 13 30 19 25 28 18 27 5 23 7 17Z" fill="#7f9294" opacity=".48"/><path d="M11 15q4 -3 9 -2" fill="none" stroke="#d5e0da" stroke-width=".9" stroke-linecap="round" opacity=".8"/>' },
      gasse: { grund: SK.erde, ufer: SK.erde, bilder: [
        erdtritt(9, 10, 20) + erdtritt(13.6, 15, 20) + gKieselchen(25, 9, 1.7) + halm(21, 24, 7, -20) + erdtritt(25, 27, -10) + '<path d="M4 25q5 -2 9 .6" fill="none" stroke="' + SK.erdeDunkel + '" stroke-width="1.2" stroke-linecap="round"/>',
        gKieselchen(9, 24, 1.8) + gKieselchen(14, 28, 1.3) + erdtritt(24, 11, -25) + erdtritt(20, 17, -25) + halm(8, 9, 6, 30) + '<path d="M22 28q5 -2 9 .4" fill="none" stroke="' + SK.erdeDunkel + '" stroke-width="1.2" stroke-linecap="round"/>'
      ] },
      nass: { grund: SK.nassGrund, ufer: SK.nassGrund, bilder: [
        pflasterSteine(53, SK.nass, SK.nassLicht) + '<path d="M6 12q6 -3 12 -1M20 26q5 -2 10 -.4" fill="none" stroke="' + SK.nassLicht + '" stroke-width="1" stroke-linecap="round" opacity=".75"/>',
        pflasterSteine(67, SK.nass, SK.nassLicht) + '<path d="M18 9q5 -2 10 -.4M5 24q6 -3 11 -1" fill="none" stroke="' + SK.nassLicht + '" stroke-width="1" stroke-linecap="round" opacity=".75"/>'
      ] },
      unrat: { grund: SK.schutt, bilder: [
        bruchstueck(10, 10, 4.4, 15, '#a8765c') + bruchstueck(25, 8, 3.2, -30, '#96684f') + brettstueck(23, 19, 15, 28) + bruchstueck(8, 24, 3.6, 60, '#b5ad9b') + bruchstueck(17, 29, 3, 10, '#a8765c') + bruchstueck(29, 28, 3.6, -15, '#8f8778') + halm(5, 16, 6, 30) + halm(13, 18, 5, -40)
      ] },
      kanal: { grund: SK.kanal, bilder: tiefwasser({ fleck: SK.kanalTief, deckung: .8, farbe: '#6f8886', breite: .9, bogen: 1.4, zahl: 2 }), selten: halm(11, 14, 7, 15, '#a39a72') + halm(14, 18, 6, -20, '#a39a72') + buchenblatt(23, 22, 4.4, 30, '#7f7a55', '#5c5a40') },
      kaimauer: { grund: '#8d8779', bilder: ['<path d="M0 0H36M0 36H36M0 9H36M0 18H36M0 27H36M9 0V9M27 0V9M18 9V18M6 18V27M24 18V27M14 27V36M30 27V36" fill="none" stroke="#4d483e" stroke-width=".9"/>'] },
      deck: GEWAESSER.muster.deck,
      deckQuer: GEWAESSER.muster.deckQuer,
      // Unter der Dachschräge: Dielen im Schatten, darüber die Sparren
      schraege: { grund: '#6b5236', bilder: ['<path d="M9 0V36M18 0V36M27 0V36" stroke="#4a3a26" stroke-width=".9"/><path d="M0 10H36M0 28H36" stroke="#3b3028" stroke-width="3.8"/><path d="M0 9.2H36M0 27.2H36" stroke="#8a6d4a" stroke-width="1.2"/>'] },
      bohlen: { grund: '#4a3c2a', bilder: [BOHLEN] },
      bohlenQuer: { grund: '#4a3c2a', bilder: ['<g transform="rotate(90 18 18)">' + BOHLEN + '</g>'] }
    },
    aufsatz: {
      kaistufen: '<rect x="4" y="4" width="28" height="7" fill="#c9c2b0"/><rect x="4" y="11" width="28" height="7" fill="#b8b1a0"/><rect x="4" y="18" width="28" height="7" fill="#a59e8e"/><rect x="4" y="25" width="28" height="7" fill="#928b7c"/><path d="M4 11H32M4 18H32M4 25H32" stroke="#4d483e" stroke-width="1.1"/><path d="M5 5.4H31M5 12.4H31M5 19.4H31M5 26.4H31" stroke="#e4decd" stroke-width=".9" opacity=".8"/><path d="M14 4v7M25 11v7M11 18v7M22 25v7" stroke="#6f6a5e" stroke-width=".8"/>',
      // Die Stiege: schmale Holzstufen zwischen zwei Wangen
      stiegenstufen: '<rect x="4" y="4" width="28" height="28" fill="#4f3b27"/><rect x="8" y="5" width="20" height="6" fill="#c0a87c"/><rect x="8" y="12" width="20" height="6" fill="#b2986c"/><rect x="8" y="19" width="20" height="6" fill="#a58a60"/><rect x="8" y="26" width="20" height="5" fill="#967c54"/><path d="M6 4V32M30 4V32" stroke="#6f5236" stroke-width="3.4"/><path d="M8.6 6.2H27M8.6 13.2H27M8.6 20.2H27M8.6 27.2H27" stroke="#d6c39a" stroke-width=".8"/>',
      linde: lindeTeile(1), lindeKrone: lindeTeile(2.1), beet: beetTeile(), brunnen: brunnenTeile(),
      fallreepstufen: GEWAESSER.aufsatz.fallreepstufen, mastfuss: GEWAESSER.aufsatz.mastfuss, luke: GEWAESSER.aufsatz.luke, ballista: GEWAESSER.aufsatz.ballista, tauwerk: GEWAESSER.aufsatz.tauwerk, maststumpf: GEWAESSER.aufsatz.maststumpf
    },
    kacheln: [
      { gruppe: 'Draußen', code: '.', name: 'Kopfsteinpflaster', art: 'Standard', muster: 'pflaster', kosten: 'kostet 1', text: 'Flusssteine, flach gelegt, in Reihen mit wechselnder Breite; dazwischen die Fuge aus Sand und Dreck. So lagen Märkte und Hauptstraßen im 14. Jahrhundert; Nebengassen kamen oft erst ein Jahrhundert später dran. Ein wirklicher Stein misst 5 bis 13 cm und wäre bei 36 Pixeln nicht zu erkennen, darum sind die Steine rund dreimal zu groß. Zu viert in einem Muster von 72 Einheiten, zwei mit etwas Stroh. Kein Stein kreuzt den Feldrand, und die Fuge ist an der Naht so breit wie innen. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, steht eine Pfütze, durch die man die Steine sieht.' },
      { code: ':', name: 'Schutt und Unrat', art: 'schwieriges Gelände; im Dachboden unter der Schräge', muster: 'unrat', dachboden: 'schraege', kosten: 'kostet 2',
        proben: [[['#####', '#:=:#', '#:=:#', '#####'], 'auf dem Dachboden: der Boden unter der Schräge', 180, { dachboden: true }]],
        text: 'Was an einer Baustelle und hinter den Häusern liegt: Ziegelbruch, Bruchstein, ein gebrochenes Brett, Stroh. Eine Stufe dunkler als das Pflaster, mehr Zeichnung; wer hindurch will, stolpert. Es ist kein Geröll und kein Schutt der Höhle: Hier hat alles einmal zu einem Haus gehört. Auf einem Dachboden (<code>dachboden: true</code>) ist dasselbe Zeichen der niedrige Boden unter der Schräge: Man geht geduckt.' },
      { code: 'e', name: 'Gasse', art: 'Weg, gestampfte Erde; über Wasser Brücke, im Hafen Schiffsdeck', muster: 'gasse', steg: true, stueck: pflasterStueck, randGegen: '.i', bruecke: { ns: 'bohlen', ow: 'bohlenQuer' }, deck: { muster: 'deck', quer: 'deckQuer', stueck: deckStueck, code: 'e' }, kosten: 'kostet 1', naht: ['....', '.ee.', '.ee.', '....'], gross: ['.e..', '.ee.', '..e.', '..ee'],
        proben: [[['.....', '.eee.', '.e.e.', '.eee.', '.....'], 'Innen und außen: Wo sie ans Pflaster stößt, liegt es lose aus', 180], [['F~~~F', 'eeeee', 'F~~~F'], 'Über den Kanal: von selbst eine Brücke, die Bohlen quer zur Richtung', 216, { hoehe: ['10001', '11111', '10001'] }], [['F~~F', 'eeee', 'eeee', 'F~~F'], 'zwei Felder breit', 144, { hoehe: ['1001', '1111', '1111', '1001'] }], [['.e.', '.e.', '~~~'], 'am Wasser ohne Mauer: ein Ufer, keine Brücke', 108, true],
          [['~~~~~~~~~', '~~eeeee~~', '~eeOeeee~', '~~eeeee~~', '~~~~e~~~~', '~~~~e~~~~', '.........'], 'Hängt es an einem Mast, ist es ein Schiff; der Streifen an Land die Laufplanke', 198, { hoehe: ['000000000', '001111100', '011111110', '001111100', '000010000', '000010000', '111111111'], gerefft: [[4, 3]] }],
          [['~~~~~~~', '~ebebe~', '~ebebe~', '~~~~~~~'], 'Hängt es an einer Bank, ist es ein offenes Boot', 196, true]],
        text: 'Gestampfte Erde mit Tritten, Kieseln und Stroh, in zwei Varianten: So sah die Nebengasse aus, solange kein Pflaster lag. Eine Gasse ist breiter als eine Linie, darum ist der Weg dieses Sets kein Kantensatz, sondern füllt sein Feld, als Fläche aus Vierteln; so kennt ihn auch die Kampfkarte (<code>e</code>: Erde). Wo sie ans Pflaster stößt, liegen dessen Steine lose aus. Liegt ein Gassenfeld über Wasser, reicht also ein Lauf von Gassenfeldern nach beiden Seiten bis ans Wasser, ist es eine Brücke: Bohlen quer zur Richtung, Kantbalken und Pfahlköpfe wie der Steg, auch zwei Felder breit; die Felder an der Kaimauer gehören dazu. Eine Brücke kostet wie die Gasse, ihre Kanten tragen keinen Steinrand; so entstehen auch Landungsbrücke und Laufplanke. Hängt das Zeichen im Wasser an einem Mast oder einer Bank, ist es das Deck eines Schiffs (Blatt „Der Hafen“).' },
      { code: 'i', name: 'Nasses Pflaster', art: 'glatt', muster: 'nass', steg: true, stueck: pflasterStueck, randGegen: '.', kosten: 'kostet 2', naht: ['....', '.ii.', '.ii.', '....'], gross: ['.i..', '.ii.', '..i.', '..ii'],
        proben: [[['..x..', '.iii.', '..i..'], 'am Brunnen: wo das Wasser überläuft', 180]],
        text: 'Dieselben Steine, nass: grauer und dunkler, mit einem Glanz. Das glatte Gelände der Stadt, darum das Zeichen des Eises (die Kampfkarte: glatt, kostet 2), etwa wo am Brunnen das Wasser überläuft oder ein Fischhändler spült. Eine Fläche aus Vierteln in zwei Varianten; am trockenen Pflaster liegen dessen Steine lose aus wie an der Gasse, zur Gasse hin zeichnet die Gasse den Rand.' },
      { code: '~', name: 'Kanal', art: 'tiefes Wasser, schwimmen', muster: 'kanal', rand: SK.rand, kosten: 'kostet 2', naht: ['....', '.~~.', '.~~~', '..~.'],
        proben: [[['~~~~~~', '~~~~~~', '~~~~~~', '~~~~~~'], 'große Fläche: Die Flecken laufen über die Felder', 216], [['FFFF', '~~~~', '~~~~'], 'zwischen Mauern: der Fuß steht im Wasser', 144, { hoehe: ['1111', '0000', '0000'] }],
          [['....', '====', '~~~~', '~~~~'], 'am Holzkai: Kantbalken und Pfähle zum Wasser', 144, { hoehe: ['1111', '1111', '0000', '0000'] }]],
        text: 'Stehendes, dunkles Wasser zwischen Mauern, ruhiger als das offene Wasser von Set 9; hier schwimmt man. Zu einer Kaimauer zeichnet es kein Ufer, an offenem Boden ein Ufer in der Farbe des Nachbarn. Selten, etwa an jedem siebten Feld und nie an zwei nebeneinander, treibt Stroh und ein Blatt darauf. Zu viert in einem Muster von 72 Einheiten; die Flecken laufen über die Felder, damit eine große Wasserfläche nicht stempelt.' },
      { gruppe: 'Höhe und Wände', code: '/', name: 'Steintreppe', art: 'Treppe, Rampe; drinnen die Stiege, an Bord die Leiter', muster: 'pflaster', aufsatz: 'kaistufen', stellt: true, drinnen: 'stiegenstufen', anBord: { aufsatz: 'fallreepstufen' }, dreht: true, kosten: 'kostet 1, eine Stufe ohne Klettern',
        proben: [[['.....', 'FF/FF', '~~~~~'], 'Kaitreppe: hinab zum Wasser', 180, { hoehe: ['11111', '11111', '00000'] }],
          [['WWWWW', 'W=/=W', 'W===W', 'WW+WW'], 'drinnen: die Stiege', 180, true],
          [['#####', '#s/s#', '#sss#', '##+##'], 'auf Steinplatten aus Stein', 180, true],
          [['WWWWW', 'W=/=W', 'W===W', 'WWWWW'], 'wo es nur hinabgeht: die Luke', 180, { luken: [[3, 2]] }],
          [['~~~~~~~', '~eeOee~', '~e/eee~', '~eeeee~', '~~~~~~~'], 'an Bord: die Luke', 196, { hoehe: ['0000000', '0111110', '0111110', '0111110', '0000000'], gerefft: [[4, 2]] }]],
        text: 'Gehauene Stufen, gerade wie alles Gebaute, mit Stoßfugen und Lichtkanten, nach oben heller, mit dem Schattenkeil. Als Kaitreppe führt sie zum Wasser hinab, als Freitreppe an einer Stützmauer hinauf. Hinauf liegt bei 0° oben; auf der Karte zeigt die Höhe der Nachbarn die Richtung. Drinnen, zwischen zwei Geschossen, ist sie eine schmale Holzstiege (auf Steinplatten bleibt sie aus Stein), an Bord eines Schiffs die Leiter wie in Set 9.' },
      { code: 'F', name: 'Kaimauer', art: 'gebaut, Kante aus den Höhen', muster: 'kaimauer', kosten: 'gesperrt, ganzes Feld', grossKarte: { boden: ['....', 'FFFF', '~~~~', '~~~~'], hoehe: ['1111', '1111', '0000', '0000'] },
        proben: [[['..O..', 'FF/FF', '.....', '.:...'], 'Stützmauer mit Freitreppe, oben eine Linde', 180, { hoehe: ['11111', '11111', '00000', '00000'] }], [['F~~', 'F~~', 'FFF', '...'], 'um die Ecke', 108, { hoehe: ['100', '100', '111', '111'] }]],
        text: 'Bruchstein in Lagen zu 9 Einheiten, die über die Felder durchlaufen. Sie ist gebaut, darum sind Lippe und Fuß gerade und die Ecken knapp (Regel 5), doch sie folgt der Regel des Felses und nicht der gebauten Wand: von oben eine Kante, an der höheren Seite die obere Ebene, an der tieferen der Fuß und ein Schlagschatten; welche Seite oben ist, sagen die Höhen. Am Kanal steht ihr Fuß im Wasser. Dasselbe Zeichen ist die Stützmauer eines Geländesprungs. Eine niedrige Kante ohne Mauer trägt den Steinrand, in der Stadt ebenfalls gerade.' },
      { gruppe: 'Umgebung', code: 'O', name: 'Linde', art: 'Baum; an Bord der Mast', muster: 'pflaster', aufsatz: 'linde', krone: 'lindeKrone', imWasser: true, anBord: { krone: true, unten: 'maststumpf' }, kosten: 'nicht betretbar, Dreiviertel-Deckung',
        proben: [schiffProbe(9, 3, 'segel', 'im Wasser am Deck: der Mast mit dem Segel', 264, 1, 2)],
        text: 'Die Linde auf dem Platz: eine runde Krone aus vielen kleinen Büscheln, im Sommer mit hellem Blütenstaub. Wie jede Krone gut 3 m breit, halb über den acht Nachbarfeldern, gesperrt ist nur das Feld mit dem Stamm; sie gibt keine Deckung und endet an Haus, Tür und Kartenrand. In einer Nische klein. Rund, darum dreht sie nicht. Hängt das Feld im Wasser am Deck eines Schiffs, ist es der Mast mit dem Segel als Krone, wie in Set 9.' },
      { code: 'd', name: 'Kräuterbeet', art: 'Busch, Dickicht; an Bord Tauwerk', muster: 'pflaster', aufsatz: 'beet', imWasser: true, anBord: { aufsatz: 'tauwerk' }, kosten: 'kostet 2, schwieriges Gelände',
        proben: [[['~~~~~~~', '~eeOee~', '~eedee~', '~eeeee~', '~~~~~~~'], 'an Bord: Tauwerk und Netze', 196, { hoehe: ['0000000', '0111110', '0111110', '0111110', '0000000'], gerefft: [[4, 2]] }]],
        text: 'Ein Beet im Flechtzaun, wie sie in Höfen und vor Häusern standen: Erde, neun Horste Kräuter in hellen Grüntönen, ein paar Blüten in Ocker. Kleiner und heller als der Baum; wer hindurch will, tritt über den Zaun und ins Beet. Hängt das Feld am Deck eines Schiffs, sind es aufgeschossene Taue und Netze.' },
      { code: 'x', name: 'Ziehbrunnen', art: 'Hindernis; an Bord die Ballista', muster: 'pflaster', aufsatz: 'brunnen', imWasser: true, anBord: { aufsatz: 'ballista' }, kosten: 'nicht betretbar',
        proben: [schiffProbe(9, 3, 'krieg', 'an Bord: die Ballista, das Schiff ist ein Kriegsschiff', 264, 1, 1, true)],
        text: 'Der öffentliche Brunnen: ein Ring aus Steinen von 1,2 m, dunkles Wasser, darüber der Balken mit der Winde und ein Eimer. Umriss in Tinte und der Schatten als versetzte Silhouette. Er dreht nicht; Karren, Marktkreuz und Pranger wären andere Dinge auf demselben Zeichen, sie sind noch nicht gezeichnet. Hängt das Feld am Deck eines Schiffs, ist es die Ballista wie in Set 9.' }
    ]
  };
  STADT.nachCode = {};
  STADT.kacheln.forEach(function (k) { STADT.nachCode[k.code] = k; });
  // Die Häuser (Max, 2.11.): ein oder zwei Obergeschosse, in Ausnahmefällen Keller oder Dachboden. Jedes Geschoss ist eine eigene Karte, die Stiege steht auf jedem am selben Feld.
  // Der Hafen (Max, 2.11.): eine Karte zum Anschauen und ihre Zeilen, kein Spielstand
  var SET_NAMEN = ['Arktis', 'Berge', 'Flussufer und Küste', 'Grasland', 'Höhlen und Unterreich', 'Sumpf', 'Wald', 'Wüste', 'Gewässer', 'Stadt'];
  var BODEN_INNEN = { '=': 'holz', 's': 'stein', 'z': 'ziegel', 'c': 'fliesen', 'l': 'erde' };
  var BEDECKT = { 'T': 1, 'f': 1, 'h': 1 };
  // Nachschlagen: das Set zuerst (es darf gemeinsame Kacheln ersetzen), dann der gemeinsame Block
  function kachelVon(set, code) { return set.nachCode[code] || GEMEINSAM.nachCode[code]; }
  function musterVon(set, id) { if (id === 'aussen') id = set.standard; return set.muster[id] || GEMEINSAM.muster[id]; }
  function aufsatzVon(set, id) { var a = set.aufsatz[id] || GEMEINSAM.aufsatz[id]; return typeof a === 'function' ? a(set) : a; }
  function wetterVon(set, id) { return (set.wetter && set.wetter[id]) || ''; }
  // Alle 31 Zeichen eines Sets in fester Reihenfolge (Band, Legende): draußen, Höhe und Wände, drinnen, Möbel, Feuer, Umgebung, Dinge
  var ORDNUNG = '.:ei~/F#WL+=szclhTfpSHbruOdxokt';
  // Ein Set darf Zeichen dazunehmen, die die Kampfkarte schon kennt (seit Set 6: Morast m); dann nennt es seine eigene Ordnung
  function alleKacheln(set) { return (set.ordnung || ORDNUNG).split('').map(function (c) { return kachelVon(set, c); }); }
  // Möbel, die über Felder wachsen: Tisch (in alle Richtungen) und Bank (längs). n, o, s, w: Nachbar ist dasselbe Möbel.
  var HOLZ_M = { platte: '#c29a63', fuge: '#8a6a40', flanke: '#7d5a36', licht: '#e0c08a' };
  // Tisch: zwei Drittel eines Feldes breit (24 Einheiten, 1 m) und mittig darin; zum Nachbartisch reicht die Platte bis an die Kante,
  // an freien Seiten endet sie 6 davor. n, o, s, w kommen schon längs (aufsatzFuer); die Bretter laufen der Länge nach.
  function tischSvg(set, n, o, s, w, draussen, detail) {
    var x0 = w ? 0 : 6, y0 = n ? 0 : 6, x1 = o ? 36 : 30, y1 = s ? 36 : 30, senk = n || s, out = [];
    out.push('<g transform="translate(2.5 2.5)" opacity=".18"><rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" fill="#2a2119"/></g>');
    out.push('<rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" fill="' + HOLZ_M.platte + '"/>');
    out.push('<path d="' + [14, 22].map(function (v) { return senk ? 'M' + v + ' ' + y0 + 'V' + y1 : 'M' + x0 + ' ' + v + 'H' + x1; }).join('') + '" stroke="' + HOLZ_M.fuge + '" stroke-width=".9"/>');
    if (!s) out.push('<path d="M' + x0 + ' ' + (y1 - 1.2) + 'H' + x1 + '" stroke="' + HOLZ_M.flanke + '" stroke-width="2.4"/>');
    if (!o) out.push('<path d="M' + (x1 - 1.2) + ' ' + y0 + 'V' + y1 + '" stroke="' + HOLZ_M.flanke + '" stroke-width="2.4"/>');
    if (!n) out.push('<path d="M' + x0 + ' ' + (y0 + 1.3) + 'H' + x1 + '" stroke="' + HOLZ_M.licht + '" stroke-width=".9"/>');
    if (!w) out.push('<path d="M' + (x0 + 1.3) + ' ' + y0 + 'V' + y1 + '" stroke="' + HOLZ_M.licht + '" stroke-width=".9"/>');
    var rand = (!n ? 'M' + x0 + ' ' + y0 + 'H' + x1 : '') + (!o ? 'M' + x1 + ' ' + y0 + 'V' + y1 : '') + (!s ? 'M' + x0 + ' ' + y1 + 'H' + x1 : '') + (!w ? 'M' + x0 + ' ' + y0 + 'V' + y1 : '');
    if (rand) out.push('<path d="' + rand + '" fill="none" stroke="#3b3028" stroke-width="1.3" stroke-linecap="square"/>');
    if (detail) out.push('<circle cx="21" cy="14" r="4.2" fill="#ddd5c2" stroke="#8b7f68" stroke-width=".8"/><circle cx="21" cy="14" r="2.2" fill="none" stroke="#c4b9a1" stroke-width=".7"/><circle cx="13" cy="23" r="2.7" fill="#7d6443" stroke="#3b3028" stroke-width=".8"/><circle cx="13" cy="23" r="1.4" fill="#4a3520"/>');
    if (draussen && !n && !w) out.push(wetterVon(set, 'tisch'));
    return out.join('');
  }
  // Bank waagrecht gezeichnet; a und b: Nachbarbank links und rechts (senkrecht wird sie um 90° gedreht)
  function bankSvg(set, a, b, draussen) {
    var x0 = a ? 0 : 3, x1 = b ? 36 : 33, out = [];
    out.push('<g transform="translate(2.5 2.5)" opacity=".18"><rect x="' + x0 + '" y="12" width="' + (x1 - x0) + '" height="12" fill="#2a2119"/></g>');
    out.push('<rect x="' + x0 + '" y="12" width="' + (x1 - x0) + '" height="12" fill="' + HOLZ_M.platte + '"/><path d="M' + x0 + ' 18H' + x1 + '" stroke="' + HOLZ_M.fuge + '" stroke-width=".9"/>');
    out.push('<path d="M' + x0 + ' 22.8H' + x1 + '" stroke="' + HOLZ_M.flanke + '" stroke-width="2.4"/><path d="M' + x0 + ' 13.3H' + x1 + '" stroke="' + HOLZ_M.licht + '" stroke-width=".9"/>');
    if (!a) out.push('<rect x="5" y="10" width="3" height="16" rx="1" fill="#6b4f30" stroke="#3b3028" stroke-width=".8"/>');
    if (!b) out.push('<rect x="28" y="10" width="3" height="16" rx="1" fill="#6b4f30" stroke="#3b3028" stroke-width=".8"/>');
    out.push('<path d="M' + x0 + ' 12H' + x1 + 'M' + x0 + ' 24H' + x1 + (!a ? 'M3 12V24' : '') + (!b ? 'M33 12V24' : '') + '" fill="none" stroke="#3b3028" stroke-width="1.3" stroke-linecap="square"/>');
    if (draussen && !a) out.push(wetterVon(set, 'bank'));
    return out.join('');
  }
  var WAND = { '#': 1, 'F': 1, 'W': 1, 'L': 1 };
  // Gebaute Wände stehen aufrecht: ein Körper schmaler als das Feld (das Feld bleibt gesperrt), von Süden gesehen.
  // Die Krone liegt um h nach oben versetzt, darunter die Südseite (Front), Umriss in Tinte, Schlagschatten nach rechts unten.
  // Wo der Nachbar auch gebaute Wand oder Tür ist, läuft die Krone bis an die Kante; neben dem Körper liegt der Boden der Nachbarn.
  var BAU = { '#': 1, 'W': 1, 'L': 1 };
  var WANDSTIL = {
    '#': { m: 8, h: 6, krone: '#716b5f', licht: '#9a9386', fuge: '#4a443b', front: '#524c43', frontFuge: '#3a352e', flanke: '#5a544a' },
    'W': { m: 11, h: 5, krone: '#6b4f35', licht: '#8f6f4d', fuge: '#3e2d1e', front: '#4a3624', frontFuge: '#2f2217', flanke: '#5a4129' },
    'L': { m: 9, h: 5, krone: '#6e5640', licht: '#8c7254', fuge: '#4f3d2c', front: '#4d3b2b', frontFuge: '#3a2c20', flanke: '#5c4734' }
  };
  function verbunden(c) { return !!BAU[c] || c === '+'; }
  // Körper: gebaute Wände und gewachsener Fels (F); der Fels nimmt seinen Stil aus dem Set (set.fels)
  var KOERPER = { '#': 1, 'W': 1, 'L': 1, 'F': 1 };
  // n, o, s, w: Nachbar ist Wand oder Tür; ecken [nw, no, so, sw]: Diagonale ist Wand oder Tür; selten: Detail auf der Krone
  function wandKoerper(code, n, o, s, w, ecken, selten, stil) {
    var st = stil || WANDSTIL[code], m = st.m, h = st.h, x0 = m, x1 = 36 - m, y1 = 36 - m, cy0 = m - h, cy1 = y1 - h;
    var krone = [[x0, n ? 0 : cy0, x1, s ? 36 : cy1]], front = [];
    if (w) krone.push([0, cy0, x0, cy1]);
    if (o) krone.push([x1, cy0, 36, cy1]);
    if (n && w && ecken[0]) krone.push([0, 0, x0, cy0]);
    if (n && o && ecken[1]) krone.push([x1, 0, 36, cy0]);
    if (s && o && ecken[2]) krone.push([x1, cy1, 36, 36]);
    if (s && w && ecken[3]) krone.push([0, cy1, x0, 36]);
    if (!s) front.push([x0, cy1, x1, y1]);
    if (w && !(s && ecken[3])) front.push([0, cy1, x0, y1]);
    if (o && !(s && ecken[2])) front.push([x1, cy1, 36, y1]);
    function r(q, f, extra) { return '<rect x="' + q[0] + '" y="' + q[1] + '" width="' + (q[2] - q[0]) + '" height="' + (q[3] - q[1]) + '" fill="' + f + '"' + (extra || '') + '/>'; }
    var fuss = krone.map(function (q) { return [q[0], q[1] + h, q[2], Math.min(36 + h, q[3] + h)]; });
    var out = [];
    // Schlagschatten: der Fuß des Körpers, nach rechts unten versetzt (darf über den Rand)
    out.push('<g transform="translate(3.5 3)" fill="#2a2119" opacity=".22">' + fuss.map(function (q) { return r(q, '#2a2119'); }).join('') + '</g>');
    var k = [];
    // Umriss: alle Teile breit in Tinte, dann dieselben Teile gefüllt darüber; so bleibt nur der äußere Rand
    // Gewachsener Fels: Buckel an den freien Kanten machen den Umriss krumm (feste Stellen je Feld, nie über die Naht)
    var bk = [], bf = [], RB = [2.8, 1.8, 3.2, 2.2, 2.6];
    if (code === 'F') {
      var ka = w ? 0 : x0, kb = o ? 36 : x1, kva = n ? 0 : cy0, kvb = s ? 36 : cy1;
      if (!n) [5, 12, 19, 26, 31].forEach(function (x, i) { if (x > ka + 1.5 && x < kb - 1.5) bk.push([x, cy0 + 1.4, RB[i]]); });
      if (!w) [4, 11, 18, 25, 32].forEach(function (y, i) { if (y > kva + 1.5 && y < kvb - 1.5) bk.push([x0 + 0.6, y, RB[(i + 2) % 5]]); });
      if (!o) [6, 13, 20, 27, 33].forEach(function (y, i) { if (y > kva + 1.5 && y < kvb - 1.5) bk.push([x1 - 0.6, y, RB[(i + 1) % 5]]); });
      front.forEach(function (q) { [5, 11, 17, 24, 31].forEach(function (x, i) { if (x > q[0] + 1.5 && x < q[2] - 1.5) bf.push([x, y1 - 0.6, RB[(i + 3) % 5] * 0.9]); }); });
    }
    function c(b, f, extra) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + f + '"' + (extra || '') + '/>'; }
    krone.concat(front).forEach(function (q) { k.push(r(q, '#3b3028', ' stroke="#3b3028" stroke-width="2.4"')); });
    bk.concat(bf).forEach(function (b) { k.push(c(b, '#3b3028', ' stroke="#3b3028" stroke-width="2.4"')); });
    front.forEach(function (q) { k.push(r(q, st.front)); });
    bf.forEach(function (b) { k.push(c(b, st.front)); });
    krone.forEach(function (q) { k.push(r(q, st.krone)); });
    bk.forEach(function (b) { k.push(c(b, st.krone)); });
    // Fugen und Maserung auf der Krone: in Laufrichtung, an festen Stellen im Feld, damit sie an der Naht weiterlaufen
    var waag = w || o, senk = n || s, kreuz = waag && senk, d = [];
    function inX(x) { return !kreuz || x < x0 || x > x1; } function inY(y) { return !kreuz || y < cy0 || y > cy1; }
    var ha = w ? 0 : x0, hb = o ? 36 : x1, va = n ? 0 : cy0, vb = s ? 36 : cy1, my = (cy0 + cy1) / 2, mx = 18;
    if (code === 'F') {
      // Schichten in Laufrichtung (an der Naht auf derselben Höhe), dazu Risse und ein Grat
      if (waag) d.push('M' + ha + ' ' + (my - 3) + 'C' + (ha + 8) + ' ' + (my - 1) + ' ' + (hb - 14) + ' ' + (my - 6) + ' ' + hb + ' ' + (my - 3));
      if (senk) d.push('M' + (mx - 3) + ' ' + va + 'C' + (mx - 1) + ' ' + (va + 8) + ' ' + (mx - 6) + ' ' + (vb - 14) + ' ' + (mx - 3) + ' ' + vb);
      if (!waag && !senk) d.push('M' + (x0 + 2) + ' ' + (my - 3) + 'C' + (x0 + 8) + ' ' + (my - 1) + ' ' + (x1 - 10) + ' ' + (my - 6) + ' ' + (x1 - 2) + ' ' + (my - 3));
      // Facetten: hellere Flächen zum Licht, an festen Stellen, damit der Fels nicht wie gemauert aussieht
      var fa = [];
      if (waag || (!waag && !senk)) [3, 21].forEach(function (x) { if (x >= ha && x + 11 <= hb) fa.push('M' + x + ' ' + (cy0 + 3) + 'l7 -1 4 4 -4 4 -7 0z'); });
      if (senk) [3, 21].forEach(function (y) { if (y >= va && y + 11 <= vb && (!kreuz || y < cy0 || y > cy1)) fa.push('M' + (x0 + 2) + ' ' + y + 'l1 7 4 4 4 -4 0 -7z'); });
      if (fa.length) k.push('<path d="' + fa.join('') + '" fill="' + st.licht + '" opacity=".28"/>');
      k.push('<path d="' + d.join('') + '" fill="none" stroke="' + st.licht + '" stroke-width="1.1" opacity=".8"/>');
      k.push('<path d="M' + (x0 + 5) + ' ' + (my + 2) + 'l3 2.5-1 3M' + (x1 - 7) + ' ' + (cy0 + 4) + 'l-2 3M22 ' + (my + 3) + 'l4-1 2.5 1.8" fill="none" stroke="' + st.fuge + '" stroke-width="1.1" stroke-linecap="round"/>');
    } else if (code === '#') {
      if (waag) {
        d.push('M' + ha + ' ' + my + 'H' + (kreuz && w ? x0 : hb) + (kreuz && o ? 'M' + x1 + ' ' + my + 'H' + hb : ''));
        [9, 27].filter(function (x) { return x > ha + 1 && x < hb - 1 && inX(x); }).forEach(function (x) { d.push('M' + x + ' ' + cy0 + 'V' + my); });
        [18].filter(function (x) { return x > ha + 1 && x < hb - 1 && inX(x); }).forEach(function (x) { d.push('M' + x + ' ' + my + 'V' + cy1); });
      }
      if (senk) {
        d.push('M' + mx + ' ' + va + 'V' + (kreuz && n ? cy0 : vb) + (kreuz && s ? 'M' + mx + ' ' + cy1 + 'V' + vb : ''));
        [9, 27].filter(function (y) { return y > va + 1 && y < vb - 1 && inY(y); }).forEach(function (y) { d.push('M' + x0 + ' ' + y + 'H' + mx); });
        [18].filter(function (y) { return y > va + 1 && y < vb - 1 && inY(y); }).forEach(function (y) { d.push('M' + mx + ' ' + y + 'H' + x1); });
      }
      if (!waag && !senk) d.push('M' + mx + ' ' + cy0 + 'V' + cy1 + 'M' + x0 + ' ' + my + 'H' + mx);
      k.push('<path d="' + d.join('') + '" fill="none" stroke="' + st.fuge + '" stroke-width="1"/>');
    } else if (code === 'W') {
      // Blockwand: zwei Stämme in Laufrichtung, an Enden und Ecken die Balkenköpfe
      var t = (x1 - x0) / 2;
      if (waag) d.push('M' + ha + ' ' + (cy0 + t) + 'H' + hb);
      if (senk) d.push('M' + (x0 + t) + ' ' + va + 'V' + vb);
      k.push('<path d="' + d.join('') + '" fill="none" stroke="' + st.fuge + '" stroke-width="1.1"/>');
      if (waag) k.push('<path d="M' + (ha + 2) + ' ' + (cy0 + 3.5) + 'q6 1 11 0M' + (hb - 14) + ' ' + (cy1 - 3) + 'q6 -1 11 0" fill="none" stroke="' + st.licht + '" stroke-width=".8" opacity=".7"/>');
      if (senk) k.push('<path d="M' + (x0 + 3.5) + ' ' + (va + 2) + 'q1 6 0 11M' + (x1 - 3) + ' ' + (vb - 14) + 'q-1 6 0 11" fill="none" stroke="' + st.licht + '" stroke-width=".8" opacity=".7"/>');
      if (!(waag && !senk && w && o) && !(senk && !waag && n && s)) k.push('<circle cx="18" cy="' + (cy0 + t) + '" r="' + (t - 1.4) + '" fill="' + st.licht + '" stroke="' + st.fuge + '" stroke-width=".9"/><circle cx="18" cy="' + (cy0 + t) + '" r="' + Math.max(1, t - 4.2) + '" fill="none" stroke="' + st.fuge + '" stroke-width=".8"/>');
    } else {
      // Lehm: verstrichen, ein paar Kellenstriche und Halme, keine Fugen
      if (waag) d.push('M' + (ha + 3) + ' ' + (cy0 + 5) + 'q5 -2 10 0M' + (hb - 13) + ' ' + (cy1 - 4) + 'q5 -2 10 0');
      if (senk) d.push('M' + (x0 + 4) + ' ' + (va + 4) + 'q-2 5 0 10M' + (x1 - 4) + ' ' + (vb - 14) + 'q-2 5 0 10');
      if (!waag && !senk) d.push('M' + (x0 + 3) + ' ' + (cy0 + 6) + 'q7 -3 13 0');
      k.push('<path d="' + d.join('') + '" fill="none" stroke="' + st.licht + '" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>');
      k.push('<path d="M' + (x0 + 5) + ' ' + (cy1 - 6) + 'l2.5 .6M' + (x1 - 7) + ' ' + (cy0 + 9) + 'l2.5 -.5" stroke="#b89a5c" stroke-width=".9" stroke-linecap="round"/>');
      if (selten) k.push('<path d="M14 ' + (cy0 + 6) + 'C17 ' + (cy0 + 4) + ' 21 ' + (cy0 + 4.5) + ' 23 ' + (cy0 + 6.5) + 'S24 ' + (cy0 + 12) + ' 21 ' + (cy0 + 13.5) + ' 14 ' + (cy0 + 13) + ' 13 ' + (cy0 + 10) + 'Z" fill="' + st.fuge + '" stroke="' + st.licht + '" stroke-width=".9"/><path d="M14 ' + (cy0 + 8.3) + 'h9M13.5 ' + (cy0 + 11) + 'h9.5M16.5 ' + (cy0 + 5) + 'v8.5M20 ' + (cy0 + 4.8) + 'v8.7" stroke="#8a6d4a" stroke-width=".9"/>');
    }
    // Licht von links oben: helle Kante oben und links, dunkle Flanke rechts
    var hl = [];
    if (!n) hl.push('M' + (w ? 0 : x0) + ' ' + (cy0 + 0.9) + 'H' + (o ? 36 : x1));
    if (!w) hl.push('M' + (x0 + 0.9) + ' ' + (n ? 0 : cy0) + 'V' + (s ? 36 : cy1));
    if (code === 'F') k.push(bk.filter(function (b) { return b[1] < cy0 + 2 || b[0] < x0 + 2; }).map(function (b) { return '<path d="M' + (b[0] - b[2] * 0.7) + ' ' + (b[1] - b[2] * 0.2) + 'A' + b[2] + ' ' + b[2] + ' 0 0 1 ' + (b[0] + b[2] * 0.2) + ' ' + (b[1] - b[2] * 0.75) + '" fill="none" stroke="' + st.licht + '" stroke-width="1"/>'; }).join(''));
    else if (hl.length) k.push('<path d="' + hl.join('') + '" fill="none" stroke="' + st.licht + '" stroke-width="1.1"/>');
    if (!o) k.push('<path d="M' + (x1 - 1) + ' ' + (n ? 0 : cy0) + 'V' + (s ? 36 : cy1) + '" stroke="' + st.flanke + '" stroke-width="2"/>');
    // Front: die Kante zur Krone, Fugen, unten die dunkle Standlinie
    front.forEach(function (q) {
      k.push('<path d="M' + q[0] + ' ' + q[1] + 'H' + q[2] + '" stroke="#3b3028" stroke-width=".9"/>');
      var fx = code === '#' ? [4.5, 13.5, 22.5, 31.5] : code === 'W' ? [] : [];
      var fd = fx.filter(function (x) { return x > q[0] + 1 && x < q[2] - 1; }).map(function (x) { return 'M' + x + ' ' + (q[1] + 0.5) + 'V' + q[3]; }).join('');
      if (code === 'W') fd += 'M' + q[0] + ' ' + (q[1] + h / 2) + 'H' + q[2];
      if (code === '#') fd += 'M' + q[0] + ' ' + (q[1] + h / 2) + 'H' + q[2];
      if (code === 'F') fd += [7, 16, 25, 33].filter(function (x) { return x > q[0] + 1 && x < q[2] - 1; }).map(function (x, i) { return 'M' + x + ' ' + (q[1] + 0.6) + 'l' + (i % 2 ? 1.2 : -1) + ' ' + (h * 0.55) + 'l' + (i % 2 ? -0.6 : 0.8) + ' ' + (h * 0.4); }).join('');
      if (fd) k.push('<path d="' + fd + '" stroke="' + st.frontFuge + '" stroke-width=".8"/>');
    });
    out.push('<svg width="36" height="36" viewBox="0 0 36 36" overflow="hidden">' + k.join('') + '</svg>');
    return out.join('');
  }
  // Woher der Boden in jedem Viertel eines Wandfelds kommt: erst die freien Seiten des Viertels, dann die Diagonale
  function wandQuelle(ctx, x, y, q) {
    function frei(dx, dy) { var c = zeichen(ctx, x + dx, y + dy); return c === null ? 'rand' : (!WAND[c] && c !== '+'); }
    var a = D4[q], b = D4[(q + 3) % 4], kand = [a, b, [a[0] + b[0], a[1] + b[1]]];
    for (var i = 0; i < 3; i++) { var f = frei(kand[i][0], kand[i][1]); if (f === 'rand') return null; if (f) return [x + kand[i][0], y + kand[i][1]]; }
    return null;
  }
  // Felsmasse: ein Viertel ohne freie Quelle neben Fels zeigt die Füllung der Masse (eine Mauer, die in den Fels gebaut ist)
  function viertelMasse(ctx, x, y, q) { if (!ctx.masse) return false; var a = D4[q], b = D4[(q + 3) % 4]; return [a, b, [a[0] + b[0], a[1] + b[1]]].some(function (d) { return zeichen(ctx, x + d[0], y + d[1]) === 'F'; }); }
  var VIERTEL_POS = [[0, 0], [18, 0], [18, 18], [0, 18]];
  // Gewachsener Fels (Entwurf, 1.11.): kein Körper wie eine Mauer, sondern eine Abbruchkante. Das Feld ist Felswand von oben,
  // verkürzt: Brocken in der Felsfarbe, an der hohen Seite die Lippe (der Grund von oben läuft bis an die Kante, darunter eine helle Kante),
  // an der tiefen Seite der Fuß mit Geröll und ein Schlagschatten auf den tieferen Boden (karteSvg). Welche Seite hoch oder tief ist,
  // sagen die Höhen: tief ist ein freier Nachbar unter der Oberkante (felsOben); ohne Höhenunterschied ist jede freie Seite tief.
  // Fels, Wand und Kartenrand gelten als Fortsetzung. seiten: [N, O, S, W] je 'hoch', 'tief' oder null.
  // Felstextur über 72 × 72, über die Ränder fortlaufend (Brocken in einem verrückten Raster, an den Rändern umgebrochen);
  // jedes Feld zeigt das Viertel nach variante(x, y), darum läuft die Wand ohne Naht durch
  var FELS_BROCKEN = (function () {
    var out = [], seed = 7;
    function r() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var j = 0; j < 6; j++) for (var i = 0; i < 6; i++) {
      var cx = 12 * i + 6 + (r() - 0.5) * 4, cy = 12 * j + 6 + (r() - 0.5) * 4, n = 6, pt = [], a0 = r() * Math.PI;
      for (var k = 0; k < n; k++) { var a = a0 + k * 2 * Math.PI / n, rr = 5.6 + r() * 1.6; pt.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
      pt.sort(function (p, q) { return Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx); });
      out.push(pt);
    }
    return out;
  })();
  var FELS_NR = 0;
  function felsTextur(st, v) {
    var ox = (v % 2) * 36, oy = Math.floor(v / 2) * 36, flaechen = '', licht = '';
    if (st.quader) return '<svg width="36" height="36" overflow="hidden"><rect width="36" height="36" fill="' + st.krone + '"/><g transform="translate(' + (-ox) + ' ' + (-oy) + ')"><path d="' + QUADER.licht + '" stroke="' + st.licht + '" stroke-width="1" opacity=".7"/><path d="' + QUADER.fugen + '" fill="none" stroke="' + st.frontFuge + '" stroke-width="1"/></g></svg>';
    FELS_BROCKEN.forEach(function (pt) {
      [-72, 0, 72].forEach(function (dx) { [-72, 0, 72].forEach(function (dy) {
        var q = pt.map(function (p) { return [p[0] + dx - ox, p[1] + dy - oy]; });
        if (q.every(function (p) { return p[0] < -1; }) || q.every(function (p) { return p[0] > 37; }) || q.every(function (p) { return p[1] < -1; }) || q.every(function (p) { return p[1] > 37; })) return;
        flaechen += 'M' + q.map(function (p) { return gr(p[0]) + ' ' + gr(p[1]); }).join('L') + 'Z';
        // Lichtkante: die Kanten, die nach links oben zeigen
        for (var k = 0; k < q.length; k++) { var p1 = q[k], p2 = q[(k + 1) % q.length], mx = (p1[0] + p2[0]) / 2 - (q.reduce(function (s, p) { return s + p[0]; }, 0) / q.length), my = (p1[1] + p2[1]) / 2 - (q.reduce(function (s, p) { return s + p[1]; }, 0) / q.length);
          if (mx + my < -3) licht += 'M' + gr(p1[0]) + ' ' + gr(p1[1]) + 'L' + gr(p2[0]) + ' ' + gr(p2[1]); }
      }); });
    });
    return '<svg width="36" height="36" overflow="hidden"><rect width="36" height="36" fill="' + st.front + '"/><path d="' + flaechen + '" fill="' + st.krone + '" stroke="' + st.frontFuge + '" stroke-width=".9" stroke-linejoin="round"/><path d="' + licht + '" stroke="' + st.licht + '" stroke-width="1.1" stroke-linecap="round" opacity=".85"/>' +
      (st.schichten ? '<path d="' + SCHICHTEN + (oy ? '' : 'M0 -2C10 0 24 -4 36 -2S60 0 72 -2') + '" transform="translate(' + (-ox) + ' ' + (1.5 - oy) + ')" fill="none" stroke="' + st.fuge + '" stroke-width=".8" stroke-linecap="round" opacity=".55"/><path d="' + SCHICHTEN + '" transform="translate(' + (-ox) + ' ' + (-oy) + ')" fill="none" stroke="' + st.schichten + '" stroke-width="1.1" stroke-linecap="round" opacity=".85"/>' : '') +
      (st.fasern ? '<path d="' + FASERN + '" transform="translate(' + (-ox) + ' ' + (-oy) + ')" fill="none" stroke="' + st.fasern + '" stroke-width=".8" stroke-linecap="round" opacity=".8"/>' : '') + (st.moos ? felsMoos(st, ox, oy) : '') + (st.pocken ? felsPocken(st, ox, oy) : '') + '</svg>';
  }
  // Wurzelfasern im Torf (Set 6, fels.fasern): Fäden über 72 × 72, die am Rand des Musters an derselben Stelle weiterlaufen
  var FASERN = 'M0 8C8 5 15 11 24 8S40 4 49 9S63 11 72 8M0 27C9 30 17 24 27 28S43 31 52 26S65 25 72 27M0 46C7 43 16 49 25 45S41 42 50 47S64 48 72 46M0 63C10 66 18 60 28 64S44 66 53 61S66 61 72 63' +
    'M15 9l2.6 4.2M38 6l-1.8 4M30 28l2.4 4M58 26l-2 4.4M9 46l2.2 4M44 44l-1.6 4.2M22 64l2.6 3.4M60 62l-2 3.6';
  // tonS, tonD (nur Felsmasse): Höhenton des Bodens je Seite und je Diagonale; sonst gilt ton[1] für alle tiefen Seiten.
  // Seite 'masse' (nur Felsmasse): die Lippe zur Masse, gefüllt mit dem Muster masse des Sets (es dreht nicht).
  // grundS, grundD (seit Set 6, nur wo das Set ufer.nachbar einschaltet): der Grund des tieferen Nachbarn je Seite und je Diagonale,
  // damit der Fuß im Wasser steht statt auf dem Standardgrund; sonst gilt der Standardgrund des Sets.
  function felsStueck(set, seiten, v, ton, diag, tonS, tonD, grundS, grundD) {
    var st = set.fels, grund = musterVon(set, set.standard).grund, o = [], ton = ton || [0, 0];
    o.push(felsTextur(st, v || 0));
    // Ende einer Wand (sie läuft gegenüber weiter und hat links und rechts Lippe oder Fuß): nur die Felstextur bis an den Rand
    seiten = seiten.map(function (sd, q) { return sd && sd !== 'masse' && seiten[(q + 2) % 4] === null && seiten[(q + 1) % 4] !== null && seiten[(q + 3) % 4] !== null ? (sd === 'tief' ? 'ende-t' : 'ende-h') : sd; });
    function tt(q) { return tonS ? tonS[q] : ton[1]; }
    function dreh(q, inhalt) { return '<g transform="rotate(' + q * 90 + ' 18 18)">' + inhalt + '</g>'; }
    function gs(q) { return grundS ? grundS[q] : undefined; }
    function getont(d, t, g) { return '<path d="' + d + '" fill="' + (g || grund) + '"/>' + (t ? '<path d="' + d + '" fill="#fff6dc" fill-opacity="' + t + '"/>' : ''); }
    // Masse in einer Form, die um q gedreht ist: die Füllung selbst dreht nicht, darum über einen Ausschnitt
    function masse(d, q) { var id = 'ma-' + (++FELS_NR); return '<clipPath id="' + id + '"><path d="' + d + '" transform="rotate(' + q * 90 + ' 18 18)"/></clipPath><g clip-path="url(#' + id + ')">' + bild(set, 'masse', v || 0) + '</g>'; }
    var lippe = st.masse && st.masse.lippe || st.licht;
    // tiefe Seite (unten gezeichnet): der tiefere Boden greift wellig in den Fuß, dunkle Fußlinie, Geröll davor
    var TIEF = 'M0 36H36V29C30 27 25 31.4 19 29.2S8 26.4 3 29.6C1.8 30.2 .8 29.4 0 29Z', TIEF_L = 'M36 29C30 27 25 31.4 19 29.2S8 26.4 3 29.6C1.8 30.2 .8 29.4 0 29';
    if (st.gerade) { TIEF = 'M0 36H36V29.4H0Z'; TIEF_L = 'M36 29.4H0'; }
    seiten.forEach(function (sd, q) {
      if (sd === 'tief') o.push(dreh((q + 2) % 4, '' + (st.gerade ? '' : '<path d="M11 19l-1 5 1.5 3M25 20l1 4-1 3" fill="none" stroke="' + st.fuge + '" stroke-width="1" stroke-linecap="round"/>') + getont(TIEF, tt(q), gs(q)) + '<path d="' + TIEF + '" fill="#2a2119" fill-opacity=".24"/>' +
        '<path d="' + TIEF_L + '" fill="none" stroke="#3b3028" stroke-width="1.2"/>' + (gischtAuf(st, gs(q)) ? '<path d="M36 30.6C30 28.6 25 33 19 30.8S8 28 3 31.2C1.8 31.8 .8 31 0 30.6" fill="none" stroke="' + st.gischt + '" stroke-width="1.5"/>' : '') +
        (st.gischt || st.gerade ? [] : [[7, 31.6, 2.4, 1.6, 15], [15.5, 32.6, 1.6, 1.2, -20], [24, 31.4, 2.1, 1.5, 30], [30.5, 32.8, 1.4, 1.1, 0]]).map(function (k) { return '<ellipse cx="' + k[0] + '" cy="' + k[1] + '" rx="' + k[2] + '" ry="' + k[3] + '" transform="rotate(' + k[4] + ' ' + k[0] + ' ' + k[1] + ')" fill="' + st.krone + '" stroke="#3b3028" stroke-width=".8"/>'; }).join('')));
    });
    // hohe Seite (oben gezeichnet): der obere Grund läuft wellig bis an die Lippe, darunter die helle Kante und ein Schattenstrich
    var HOCH = 'M0 0H36V6C31 8.6 26 4.4 20 6.6S9 8.8 4 5.4C2.4 4.6 1.2 5.6 0 6Z', HOCH_L = 'M36 6C31 8.6 26 4.4 20 6.6S9 8.8 4 5.4C2.4 4.6 1.2 5.6 0 6';
    if (st.gerade) { HOCH = 'M0 0H36V6H0Z'; HOCH_L = 'M36 6H0'; }
    var SCHATTENSTRICH = st.gerade ? '<path d="M36 8.2H0" fill="none" stroke="#3b3028" stroke-width=".9" opacity=".6"/>' : '<path d="M36 8.2C31 10.6 26 6.6 20 8.8S9 11 4 7.6C2.4 6.8 1.2 7.8 0 8.2" fill="none" stroke="#3b3028" stroke-width=".9" opacity=".6"/>';
    seiten.forEach(function (sd, q) {
      if (sd === 'hoch') o.push(dreh(q, getont(HOCH, ton[0]) + '<path d="' + HOCH_L + '" fill="none" stroke="' + st.licht + '" stroke-width="1.6"/>' + SCHATTENSTRICH));
      // Seite zur Masse: dieselbe Lippe, statt des oberen Grunds die Füllung der Masse
      if (sd === 'masse') o.push(masse(HOCH, q) + dreh(q, '<path d="' + HOCH_L + '" fill="none" stroke="' + lippe + '" stroke-width="1.6"/>' + SCHATTENSTRICH));
    });
    function ecke(q, art, inhalt) { return '<g transform="rotate(' + q * 90 + ' 18 18)">' + inhalt + '</g>'; }
    function boden(d, tief, t, g) { if (t === undefined) t = tief ? ton[1] : ton[0]; return '<path d="' + d + '" fill="' + (g || grund) + '"/>' + (t ? '<path d="' + d + '" fill="#fff6dc" fill-opacity="' + t + '"/>' : '') + (tief ? '<path d="' + d + '" fill="#2a2119" fill-opacity=".24"/>' : ''); }
    // Außenecken (zwei freie Seiten nebeneinander): gerundet
    [0, 1, 2, 3].forEach(function (q) {
      var a = seiten[q], b2 = seiten[(q + 3) % 4];
      if (!a || !b2 || a.indexOf('ende') === 0 || b2.indexOf('ende') === 0) return;
      var dT = a === 'tief' ? 7 : 6, dL = b2 === 'tief' ? 7 : 6, tief = a === 'tief' || b2 === 'tief', r = st.gerade ? 1.5 : tief ? 7 : 3;
      var d = 'M0 0H' + (dL + r) + 'V' + dT + 'A' + r + ' ' + r + ' 0 0 0 ' + dL + ' ' + (dT + r) + 'H0Z', bogen = 'M' + dL + ' ' + (dT + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (dL + r) + ' ' + dT;
      if (a === 'masse' && b2 === 'masse') { o.push(masse(d, q) + ecke(q, 0, '<path d="' + bogen + '" fill="none" stroke="' + lippe + '" stroke-width="1.6"/>')); return; }
      o.push(ecke(q, 0, boden(d, tief, tonS && tief ? tt(a === 'tief' ? q : (q + 3) % 4) : undefined, tief ? gs(a === 'tief' ? q : (q + 3) % 4) : undefined) + '<path d="' + bogen + '" fill="none" stroke="' + (tief ? '#3b3028' : st.licht) + '" stroke-width="' + (tief ? 1.2 : 1.6) + '"/>' + (tief && gischtAuf(st, gs(a === 'tief' ? q : (q + 3) % 4)) ? '<path d="M' + (dL - 1.8) + ' ' + (dT + r) + 'A' + (r + 1.8) + ' ' + (r + 1.8) + ' 0 0 1 ' + (dL + r) + ' ' + (dT - 1.8) + '" fill="none" stroke="' + st.gischt + '" stroke-width="1.5"/>' : '')));
    });
    // Offenes Ende vor tieferem Boden: die Ecken gerundet. Zur tiefen Seite greift der Fuß mit dem tieferen Boden um die Ecke;
    // zur hohen Seite endet die Lippe gerundet und Fels bleibt außen, auf der Höhe des Steinrands (4,6), der dort weiterläuft.
    // Gezeichnet in der Lage „Ende oben, Seite links“, sonst an der Diagonale gespiegelt; die Felstextur dreht nie.
    [0, 1, 2, 3].forEach(function (q) {
      var a = seiten[q], b2 = seiten[(q + 3) % 4], ende = a === 'ende-t' ? 'a' : b2 === 'ende-t' ? 'b' : null;
      if (!ende) return;
      var seite = ende === 'a' ? b2 : a, spiegel = ende === 'a' ? '' : ' matrix(0 1 1 0 0 0)', lage = 'rotate(' + q * 90 + ' 18 18)' + spiegel;
      if (seite === 'tief') {
        var r = st.gerade ? 2 : 9, d = 'M0 0H' + (7 + r) + 'A' + r + ' ' + r + ' 0 0 0 7 ' + r + 'H0Z';
        o.push('<g transform="' + lage + '">' + boden(d, true, tonS ? tt(ende === 'a' ? (q + 3) % 4 : q) : undefined, gs(ende === 'a' ? (q + 3) % 4 : q)) + '<path d="M7 ' + r + 'A' + r + ' ' + r + ' 0 0 1 ' + (7 + r) + ' 0" fill="none" stroke="#3b3028" stroke-width="1.2"/>' + (gischtAuf(st, gs(ende === 'a' ? (q + 3) % 4 : q)) ? '<path d="M5.2 9A10.8 10.8 0 0 1 10 0" fill="none" stroke="' + st.gischt + '" stroke-width="1.5"/>' : '') + '</g>');
      } else if (seite === 'hoch') {
        var R = 6, oben = 4.6, id = 'fe-' + (++FELS_NR);
        var rest = 'M0 0H10V' + (oben + R) + 'H' + R + 'A' + R + ' ' + R + ' 0 0 0 0 ' + oben + 'Z';
        o.push('<clipPath id="' + id + '"><path d="' + rest + '" transform="' + lage + '"/></clipPath><g clip-path="url(#' + id + ')">' + felsTextur(st, v || 0) + '</g>' +
          '<path d="M' + R + ' ' + (oben + R) + 'A' + R + ' ' + R + ' 0 0 0 0 ' + oben + '" transform="' + lage + '" fill="none" stroke="' + st.licht + '" stroke-width="1.6"/>');
      }
    });
    // Innenecken (beide Nachbarn Fels, die Diagonale frei): eine kleine Mulde mit Lippe oder Fuß; zur Masse hin ein Bogen der Füllung
    (diag || []).forEach(function (dg, q) {
      if (!dg || seiten[q] || seiten[(q + 3) % 4]) return;
      var tief = dg === 'tief', r = st.gerade ? 2 : tief ? 7 : 6, d = 'M0 0H' + r + 'A' + r + ' ' + r + ' 0 0 1 0 ' + r + 'Z', bogen = 'M' + r + ' 0A' + r + ' ' + r + ' 0 0 1 0 ' + r;
      if (dg === 'masse') { o.push(masse(d, q) + ecke(q, 0, '<path d="' + bogen + '" fill="none" stroke="' + lippe + '" stroke-width="1.6"/>')); return; }
      o.push(ecke(q, 0, boden(d, tief, tonD && tief ? tonD[q] : undefined, tief && grundD ? grundD[q] : undefined) + '<path d="' + bogen + '" fill="none" stroke="' + (tief ? '#3b3028' : st.licht) + '" stroke-width="' + (tief ? 1.2 : 1.6) + '"/>'));
    });
    return o.join('');
  }
  // Plattform und Rücken: von oben nur die Fläche mit dem Höhenton ihrer Ebene, keine Kante, kein Steinrand;
  // die Höhe zeigt allein der Schatten auf den tieferen Nachbarn (karteSvg)
  function felsPlattform(set, v, ton) {
    return bild(set, set.standard, v) + (ton ? '<rect width="36" height="36" fill="#fff6dc" fill-opacity="' + ton + '"/>' : '');
  }
  // Felsmasse (Set 5, set.fels.masse): Fels reicht bis zur Decke. Ein Felsfeld ohne freies Feld unter seinen acht Nachbarn
  // ist das Innere der Masse (ruhige Füllung); die Felsfelder am Höhlenboden sind die Höhlenwand: Fuß zu jedem freien Nachbarn,
  // zur Masse hin die Lippe mit der Füllung, Fels, Wand und Kartenrand gelten als Fortsetzung. Keine Plattform, kein Rücken.
  function freiFeld(ctx, x, y) { var c = zeichen(ctx, x, y); return c !== null && !WAND[c] && c !== '+'; }
  function istMasse(ctx, x, y) {
    if (!ctx.masse || zeichen(ctx, x, y) !== 'F') return false;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) if ((dx || dy) && freiFeld(ctx, x + dx, y + dy)) return false;
    return true;
  }
  function felsSeiten(ctx, x, y) {
    if (ctx.masse) return D4.map(function (d) { var nx = x + d[0], ny = y + d[1], c = zeichen(ctx, nx, ny); if (c === null) return null; if (c === 'F') return istMasse(ctx, nx, ny) ? 'masse' : null; if (WAND[c] || c === '+') return null; return 'tief'; });
    var top = felsOben(ctx, x, y), out = D4.map(function (d) { var c = zeichen(ctx, x + d[0], y + d[1]); if (c === null || WAND[c] || c === '+') return null; return ctx.hoehe(x + d[0], y + d[1]) < top ? 'tief' : 'hoch'; });
    var blk = felsBlock(ctx, x, y);
    if (blk) return blk.tief ? out : out.map(function (sd) { return sd ? 'tief' : null; });
    if (out.indexOf('tief') < 0 && top <= ctx.hoehe(x, y)) out = out.map(function (sd) { return sd ? 'tief' : null; });
    return out;
  }
  function wandSvg(set, ctx, x, y) {
    var c = zeichen(ctx, x, y);
    if (c === 'F' && ctx.masse) {
      // Felsmasse: das Innere ruhig gefüllt; ein einzelnes Felsfeld, tiefer als alle vier Nachbarn, bleibt ein Schacht (Loch)
      if (istMasse(ctx, x, y)) return bild(set, 'masse', variante(x, y));
      var hm = ctx.hoehe(x, y);
      if (D4.every(function (d) { return freiFeld(ctx, x + d[0], y + d[1]) && ctx.hoehe(x + d[0], y + d[1]) > hm; })) { var tm = Math.min(0.55, 0.16 * felsOben(ctx, x, y)); return felsStueck(set, ['hoch', 'hoch', 'hoch', 'hoch'], variante(x, y), [tm, tm]); }
      // sonst Höhlenwand bis zur Decke: Fuß zu jedem freien Nachbarn (mit dessen Höhenton), Lippe zur Masse; frei stehend ein Pfeiler
      var sdm = felsSeiten(ctx, x, y), DGM = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      var tonS = D4.map(function (d, i) { return sdm[i] === 'tief' ? Math.min(0.55, 0.16 * ctx.hoehe(x + d[0], y + d[1])) : 0; });
      var diagm = DGM.map(function (d) { var nx = x + d[0], ny = y + d[1]; if (zeichen(ctx, nx, ny) === 'F') return istMasse(ctx, nx, ny) ? 'masse' : null; return freiFeld(ctx, nx, ny) ? 'tief' : null; });
      var tonD = DGM.map(function (d) { return freiFeld(ctx, x + d[0], y + d[1]) ? Math.min(0.55, 0.16 * ctx.hoehe(x + d[0], y + d[1])) : 0; });
      return felsStueck(set, sdm, variante(x, y), [0, 0], diagm, tonS, tonD);
    }
    if (c === 'F') {
      // Einzelfeld: Loch (tiefer als die Nachbarn) oder Plattform (höher oder ohne Höhenunterschied)
      var frei4 = D4.every(function (d) { var z = zeichen(ctx, x + d[0], y + d[1]); return z !== null && !WAND[z] && z !== '+'; });
      if (frei4) {
        var h0 = ctx.hoehe(x, y), loch = D4.every(function (d) { return ctx.hoehe(x + d[0], y + d[1]) > h0; });
        // Loch: an allen vier Seiten die obere Seite der Felswand (Lippe); Plattform: nur Fläche, der Schatten fällt nach außen
        var tl = Math.min(0.55, 0.16 * felsOben(ctx, x, y));
        if (loch || !set.fels.riff) return loch ? felsStueck(set, ['hoch', 'hoch', 'hoch', 'hoch'], variante(x, y), [tl, tl]) : felsPlattform(set, variante(x, y), Math.min(0.55, 0.16 * (h0 + 1)));
      }
      // Höhenton der oberen und der tieferen Ebene, damit der Grund an Lippe und Fuß zu den Nachbarn passt
      var sd = felsSeiten(ctx, x, y), top = felsOben(ctx, x, y), tief = top;
      // keine höhere Seite: ein Rücken oder eine Plattform, oben Fläche statt Felswand
      // Klippe statt Rücken: wenn der Fels über den Kartenrand läuft (das obere Land liegt jenseits) oder eine Ecke der Wand ist,
      // deren Diagonale höher liegt als der tiefere Boden des Feldes
      // zusammenhängender Fels, der den Kartenrand berührt (einmal je Karte geflutet)
      if (!ctx.felsRand) {
        ctx.felsRand = {}; var st = [];
        for (var yy = 1; yy <= ctx.ze; yy++) for (var xx = 1; xx <= ctx.sp; xx++) if (zeichen(ctx, xx, yy) === 'F' && (xx === 1 || yy === 1 || xx === ctx.sp || yy === ctx.ze)) { ctx.felsRand[xx + ',' + yy] = 1; st.push([xx, yy]); }
        while (st.length) { var p = st.pop(); D4.forEach(function (d) { var nx = p[0] + d[0], ny = p[1] + d[1], k = nx + ',' + ny; if (!ctx.felsRand[k] && zeichen(ctx, nx, ny) === 'F') { ctx.felsRand[k] = 1; st.push([nx, ny]); } }); }
      }
      var amRand = !!ctx.felsRand[x + ',' + y], unten = Infinity;
      D4.forEach(function (d) { var z = zeichen(ctx, x + d[0], y + d[1]); if (z !== null && !WAND[z] && z !== '+') unten = Math.min(unten, ctx.hoehe(x + d[0], y + d[1])); });
      if (unten === Infinity) unten = ctx.hoehe(x, y);
      var hoeherDiag = [[-1, -1], [1, -1], [1, 1], [-1, 1]].some(function (d) { var z = zeichen(ctx, x + d[0], y + d[1]); return z !== null && !WAND[z] && ctx.hoehe(x + d[0], y + d[1]) > unten && zeichen(ctx, x + d[0], y) === 'F' && zeichen(ctx, x, y + d[1]) === 'F'; });
      if (!set.fels.riff && sd.indexOf('hoch') < 0 && top <= ctx.hoehe(x, y) && !hoeherDiag && !amRand && !felsBlock(ctx, x, y)) return felsPlattform(set, variante(x, y), Math.min(0.55, 0.16 * (top + 1)));
      D4.forEach(function (d, i) { if (sd[i] === 'tief') tief = Math.min(tief, ctx.hoehe(x + d[0], y + d[1])); });
      // Diagonalen je Viertel q (Ecke zwischen Seite q und q+3): frei und tiefer oder höher
      var DG = [[-1, -1], [1, -1], [1, 1], [-1, 1]], diag = DG.map(function (d) { var c = zeichen(ctx, x + d[0], y + d[1]); if (c === null || WAND[c] || c === '+') return null; return ctx.hoehe(x + d[0], y + d[1]) < top ? 'tief' : 'hoch'; });
      if (sd.every(function (q) { return q !== 'hoch'; }) && !(felsBlock(ctx, x, y) && felsBlock(ctx, x, y).tief)) diag = diag.map(function (q) { return q ? 'tief' : null; });
      // seit Set 6 (ufer.nachbar): der Fuß zeigt den Grund des tieferen Nachbarn, im Wasser also Wasser
      var gN = set.ufer.nachbar ? function (dx, dy) { var z = zeichen(ctx, x + dx, y + dy); return z === null || WAND[z] || z === '+' ? undefined : musterVon(set, musterFuer(set, ctx, x + dx, y + dy)).grund; } : null;
      return felsStueck(set, sd, variante(x, y), [Math.min(0.55, 0.16 * top), Math.min(0.55, 0.16 * tief)], diag, undefined, undefined, gN ? D4.map(function (d) { return gN(d[0], d[1]); }) : undefined, gN ? DG.map(function (d) { return gN(d[0], d[1]); }) : undefined);
    }
    // Fels hängt an Fels und läuft über den Kartenrand weiter; gebaute Wände hängen an Wand und Tür
    function v(dx, dy) { var z = zeichen(ctx, x + dx, y + dy); return c === 'F' ? (z === null || !!WAND[z]) : verbunden(z); }
    return wandKoerper(c, v(0, -1), v(1, 0), v(0, 1), v(-1, 0), [v(-1, -1), v(1, -1), v(1, 1), v(-1, 1)], c === 'L' && seltenErlaubt(set, ctx, x, y), c === 'F' ? set.fels : null);
  }
  // Die gezeichnete Wand für sich (Band, Legende, Proben): ein Stück in Laufrichtung, draußen oben, Dielen unten
  function wandEinzeln(set, code) {
    if (code === 'F') return felsStueck(set, [set.fels.masse ? 'masse' : 'hoch', null, 'tief', null], 0, undefined, undefined, undefined, undefined, set.fels.riffGrund ? [null, null, set.fels.riffGrund, null] : undefined);
    return '<svg width="36" height="18" overflow="hidden">' + bild(set, set.standard, 0) + '</svg><svg y="18" width="36" height="18" viewBox="0 18 36 18" overflow="hidden">' + bild(set, code === 'F' ? set.standard : 'holz', 0) + '</svg>' + wandKoerper(code, false, true, false, true, [false, false, false, false], false, code === 'F' ? set.fels : null);
  }

  function bild(set, musterId, v) {
    var m = musterVon(set, musterId), b = m.bilder;
    return '<rect width="36" height="36" fill="' + m.grund + '"/>' + b[((v || 0) % b.length + b.length) % b.length];
  }
  // Aufsatz: ohne Schatten (Text) oder mit; draußen kommt das Wetter des Sets auf den Körper
  // dy (nur der Stuhl am Tisch): der Aufsatz rückt vor dem Drehen um dy nach unten, zur Vorderkante seines Feldes
  // Treppe: ihre Seitenwand wirft einen Keil Schatten auf den tieferen Boden, breit oben (dort ist sie am höchsten), schmal am Fuß;
  // er fällt vom Licht weg (nach rechts oder unten), darum liegt er vor dem Drehen rechts (0°, 90°) oder links (180°, 270°)
  function treppeSchatten(r) {
    var rechts = r % 360 === 0 || r % 360 === 90;
    return '<path d="' + (rechts ? 'M32 4L35.6 6.4 35.6 9 32 32Z' : 'M4 4L.4 6.4 .4 9 4 32Z') + '" fill="#2a2119" opacity=".26"/>' +
      '<path d="' + (rechts ? 'M31.2 4.6V31.4' : 'M4.8 4.6V31.4') + '" stroke="#2a2119" stroke-width="1.4" opacity=".35"/>';
  }
  function aufsatzSvg(set, id, r, draussen, dy) {
    var a = aufsatzVon(set, id), v0 = dy ? '<g transform="translate(0 ' + dy + ')">' : '', v1 = dy ? '</g>' : '';
    if (/stufen$/.test(id)) return '<g transform="rotate(' + r + ' 18 18)">' + treppeSchatten(r || 0) + a + '<path d="M4 4H32V32H4Z" fill="none" stroke="#3b3028" stroke-width="1.1"/></g>';
    if (typeof a === 'string') return '<g transform="rotate(' + r + ' 18 18)">' + v0 + a + v1 + '</g>';
    return '<g transform="translate(2.5 2.5)" fill="#2a2119" opacity=".18"><g transform="rotate(' + r + ' 18 18)">' + v0 + a.schatten + v1 + '</g></g><g transform="rotate(' + r + ' 18 18)">' + v0 + a.form + (draussen ? wetterVon(set, id) : '') + v1 + '</g>';
  }
  // Herd und Lagerfeuer: mit Kochtopf (karte.kochtopf), erloschen (karte.erloschen)
  function feuerId(k, ctx, x, y) {
    var key = x + ',' + y, aus = !!(ctx.aus && ctx.aus[key]);
    if (k.code === 'r') return 'feuerstelle' + (ctx.topf && ctx.topf[key] ? 'Topf' : '') + (aus ? 'Kalt' : '');
    if (k.code === 'u') return aus ? 'lagerfeuerKalt' : 'lagerfeuer';
    return k.aufsatz;
  }
  function amTisch(ctx, x, y) { return D4.some(function (d) { return zeichen(ctx, x + d[0], y + d[1]) === 'p'; }); }
  function wegAuf(set, form, r) { return '<g transform="rotate(' + r + ' 18 18)">' + wegFormen(set)[form] + '</g>'; }
  function viertel(stueck, zustaende) { return zustaende.map(function (st, q) { var s = stueck(st); return s ? '<g transform="rotate(' + q * 90 + ' 18 18)">' + s + '</g>' : ''; }).join(''); }
  var ALLE_AUSSEN = ['aussen', 'aussen', 'aussen', 'aussen'];

  // Eine Kachel für sich: Grund, dann Ufer, Teppich, Weg oder Aufsatz. bodenId überstimmt den Grund (gemeinsame Dinge drinnen zeigen).
  function kachelInnen(set, k, v, r, form, bodenId) {
    if (KOERPER[k.code]) return wandEinzeln(set, k.code);
    var boden = bodenId || (k.unter ? (k.unterStd || 'holz') : k.muster), draussen = boden === 'aussen' || boden === set.standard, s = bild(set, boden, v);
    if (k.weg) return s + wegAuf(set, form || 'gerade', r || 0);
    if (k.bach) return s + '<g transform="rotate(' + (r || 0) + ' 18 18)">' + bachSvg(form || 'ecke') + '</g>';
    if (k.stroh) return s + viertel(strohStueck, ALLE_AUSSEN);
    if (k.moebel === 'tisch') return s + tischSvg(set, false, false, false, false, draussen, false);
    if (k.moebel === 'bank') return s + '<g transform="rotate(' + (r || 0) + ' 18 18)">' + bankSvg(set, false, false, draussen) + '</g>';
    if (k.rand) return s + viertel(function (st) { return uferStueck(set, st, k.rand); }, ALLE_AUSSEN);
    if (k.teppich) return s + viertel(teppichStueck, ALLE_AUSSEN) + TEP_MITTE;
    if (k.steg) return s + viertel(k.stueck || stegStueck, ALLE_AUSSEN);
    return s + (k.aufsatz ? aufsatzSvg(set, k.aufsatz, r || 0, draussen) : '');
  }
  // Für das Ufer zählen Wasser und Eis als gleich, dazu jede Kachel, die sich als Wasser erklärt (der Steg in Set 3)
  function istWasser(set, c) { if (istBach(set, c)) return false; if (c === '~' || c === 'i') return true; var k = kachelVon(set, c); return !!(k && k.wasser); }
  function kachelSvg(set, k, s, v, attr, r, form, bodenId) {
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 36 36" ' + (attr || 'aria-hidden="true"') + '>' + kachelInnen(set, k, v, r, form, bodenId) + '</svg>';
  }
  function variante(x, y) { return (x % 2) + 2 * (y % 2); }

  // Auf der Karte: alles aus der Nachbarschaft
  function zeichen(ctx, x, y) { return x < 1 || y < 1 || x > ctx.sp || y > ctx.ze ? null : ctx.boden[y - 1][x - 1]; }
  function anschluss(ctx, x, y) { var c = zeichen(ctx, x, y); return c === null ? !!ctx.randOffen : 'e+/'.indexOf(c) >= 0 || !!(ctx.furt && ctx.furt[x + ',' + y] !== undefined); }
  function maske(ctx, x, y) { return (anschluss(ctx, x, y - 1) ? 1 : 0) | (anschluss(ctx, x + 1, y) ? 2 : 0) | (anschluss(ctx, x, y + 1) ? 4 : 0) | (anschluss(ctx, x - 1, y) ? 8 : 0); }
  // Je Viertel q (0 oben links, im Uhrzeigersinn): Seiten q und q+3, Ecke dazwischen
  function viertelZustaende(ctx, x, y, gleich) {
    function ist(dx, dy) { var c = zeichen(ctx, x + dx, y + dy); return c === null ? !!ctx.randOffen : gleich(c, x + dx, y + dy); }
    var out = [];
    for (var q = 0; q < 4; q++) {
      var a = D4[q], b = D4[(q + 3) % 4], n = !ist(a[0], a[1]), w = !ist(b[0], b[1]);
      out.push(n && w ? 'aussen' : n ? 'oben' : w ? 'links' : !ist(a[0] + b[0], a[1] + b[1]) ? 'innen' : 'leer');
    }
    return out;
  }
  // Boden unter Dingen: ringweise durch Möbel und Bedecktes hindurch; der erste Ring mit Innenboden entscheidet (Mehrheit),
  // ein Ring nur mit Feldern draußen heißt draußen (sonst), Wände und Türen zählen nicht.
  function bodenVon(set, ctx, x, y, sonst) {
    var gesehen = {}, ring = [[x, y]];
    gesehen[x + ',' + y] = 1;
    for (var tiefe = 0; tiefe < 6 && ring.length; tiefe++) {
      var z = {}, best = null, bw = 0, aussen = 0, weiter = [], kai = 0, nass = 0;
      ring.forEach(function (p) {
        D4.forEach(function (d) {
          var nx = p[0] + d[0], ny = p[1] + d[1], key = nx + ',' + ny, c = zeichen(ctx, nx, ny);
          if (c === null || gesehen[key]) return;
          gesehen[key] = 1;
          var m = BODEN_INNEN[c], k = kachelVon(set, c);
          if (set.bollwerk && c === '=' && bollwerkFelder(ctx)[key]) { kai++; return; }
          if (c === '~') nass++;
          if (ctx.dachboden && k && k.dachboden) m = k.dachboden;
          if (m) { z[m] = (z[m] || 0) + 1; if (z[m] > bw) { bw = z[m]; best = m; } }
          else if (WAND[c] || c === '+') return;
          else if (BEDECKT[c] || (k && k.stellt)) weiter.push([nx, ny]);
          else aussen++;
        });
      });
      if (best) return best;
      if (kai && (nass || kai > aussen)) return 'holz';
      if (aussen) return sonst;
      ring = weiter;
    }
    return sonst;
  }
  // Das Muster eines Feldes: Beläge und Dinge nehmen den Boden ihrer Nachbarn, draußen den Standardgrund des Sets
  function musterFuer(set, ctx, x, y) {
    var k = kachelVon(set, zeichen(ctx, x, y)) || kachelVon(set, '.');
    if (ctx.unterWasser && k.unterWasser) return k.unterWasser;
    if (k.unter) return bodenVon(set, ctx, x, y, k.unterStd || 'holz');
    if (k.drinnen) return bordFeld(set, ctx, x, y) ? deckMuster(set, ctx, x, y) : bodenVon(set, ctx, x, y, k.muster);
    if (k.stellt) return bodenVon(set, ctx, x, y, set.schiff ? grundDraussen(set, ctx, x, y) : set.standard);
    if (set.schiff && ((k.code === set.schiff.deck && (!set.schiff.frei || bordFeld(set, ctx, x, y))) || k.imWasser)) return grundDraussen(set, ctx, x, y);
    if (ctx.dachboden && k.dachboden) return k.dachboden;
    if (k.bruecke) { var bruecke = brueckenVon(set, ctx)[x + ',' + y]; if (bruecke !== undefined) return bruecke === 90 ? k.bruecke.ow : k.bruecke.ns; }
    // Knüppeldamm (Set 6): die Stämme liegen quer zur Richtung; läuft der Damm durch das Feld von West nach Ost weiter als von Nord nach Süd, quer
    if (k.quer) { var lauf = function (dx, dy) { var n = 0, cx = x + dx, cy = y + dy; while (zeichen(ctx, cx, cy) === k.code) { n++; cx += dx; cy += dy; } return n; }; if (lauf(-1, 0) + lauf(1, 0) > lauf(0, -1) + lauf(0, 1)) return k.quer; }
    return k.muster === 'aussen' ? set.standard : k.muster;
  }
  function drehung(ctx, x, y) {
    var c = zeichen(ctx, x, y), e = ctx.drehung && ctx.drehung[x + ',' + y];
    if (e !== undefined) return e;
    function lv(nx, ny) { return zeichen(ctx, nx, ny) === null ? -1 : ctx.hoehe(nx, ny); }
    if (c === '/') {
      var best = 0, bw = 0;
      D4.forEach(function (d, i) {
        if (zeichen(ctx, x + d[0], y + d[1]) === '/') return;
        var w = lv(x + d[0], y + d[1]) - lv(x - d[0], y - d[1]); if (w > bw) { bw = w; best = i * 90; }
      });
      return best;
    }
    if (c === 'r' || c === 't') { var wd = -1; D4.forEach(function (d, i) { if (wd < 0 && WAND[zeichen(ctx, x + d[0], y + d[1])]) wd = i; }); return wd < 0 ? 0 : wd * 90; } // Herd und Truhe: Rücken an die Wand
    if (c === 'S') { var t = -1; D4.forEach(function (d, i) { if (t < 0 && zeichen(ctx, x + d[0], y + d[1]) === 'p') t = i; }); return t < 0 ? 0 : ((t + 2) % 4) * 90; } // Lehne vom Tisch weg
    if (c === '+') { var w =!!WAND[zeichen(ctx, x - 1, y)] + !!WAND[zeichen(ctx, x + 1, y)], n = !!WAND[zeichen(ctx, x, y - 1)] + !!WAND[zeichen(ctx, x, y + 1)]; return n > w ? 90 : 0; } // Ober- und Unterkante zeigen auf die freien Seiten
    return 0;
  }
  // Ufer einer Fläche (Wasser, Eis): zu jedem Nachbarn, der kein Wasser ist, ein Viertelstück. Seit Set 6 wahlweise:
  // k.kante = {gegen, flaeche, linie}: zum Nachbarn gegen (seichtes Wasser) eine Kante, der seichte Grund bis 6, dahinter die dunkle Linie;
  // set.ufer.nachbar: das Ufer nimmt Farbe und Saum des Nachbarn (Ried, Morast, Sumpfboden), nicht die eine Farbe des Sets.
  // Seit Set 7: wo ein Bach in den Teich fließt, nach dem Ufer die Mündung
  function uferFuer(set, ctx, x, y, k) { return uferFuer0(set, ctx, x, y, k) + muendung(set, ctx, x, y); }
  function uferFuer0(set, ctx, x, y, k) {
    // seit Set 8: auch das eigene Zeichen gilt als gleich (der Treibsand auf m ist kein Wasser und hat doch einen Rand)
    var zst = viertelZustaende(ctx, x, y, function (c, nx, ny) { return c === k.code || istWasser(set, c) || (!!set.ufer.nachbar && c === 'F') || (!!set.haeuser && (c === '/' || (!!set.bollwerk && !WAND[c] && musterFuer(set, ctx, nx, ny) === 'holz') || (c === 'e' && brueckenVon(set, ctx)[nx + ',' + ny] !== undefined))) || (!!set.schiff && (bordFeld(set, ctx, nx, ny) || (WAND[c] ? false : set.schiff.wasser.indexOf(musterFuer(set, ctx, nx, ny)) >= 0))); });
    if (!k.kante && !set.ufer.nachbar) return viertel(function (st) { return uferStueck(set, st, k.rand); }, zst);
    var aus = k.kante ? viertel(function (st) { return uferStueckF(st, k.rand, ctx.unterWasser ? set.unterWasser.kante : k.kante.flaeche, ctx.unterWasser ? set.unterWasser.saum : k.kante.linie); }, viertelZustaende(ctx, x, y, function (c) { return c !== k.kante.gegen; })) : '';
    if (!set.ufer.nachbar) return aus + viertel(function (st) { return uferStueck(set, st, k.rand); }, zst);
    function farbe(dx, dy) {
      var c = zeichen(ctx, x + dx, y + dy);
      if (c === null || KOERPER[c]) return [set.ufer.flaeche, set.ufer.linie];
      var m = musterVon(set, musterFuer(set, ctx, x + dx, y + dy));
      return [m.ufer || m.grund, (ctx.unterWasser && set.unterWasser.saum) || m.saum || set.ufer.linie];
    }
    return aus + zst.map(function (st, q) {
      var a = D4[q], b = D4[(q + 3) % 4], s = '';
      if (st === 'oben' || st === 'aussen') { var fa = farbe(a[0], a[1]), fb = farbe(b[0], b[1]); }
      if (st === 'oben') s = uferStueckF('oben', k.rand, fa[0], fa[1]);
      else if (st === 'links') { var fl = farbe(b[0], b[1]); s = uferStueckF('links', k.rand, fl[0], fl[1]); }
      else if (st === 'innen') { var fi = farbe(a[0] + b[0], a[1] + b[1]); s = uferStueckF('innen', k.rand, fi[0], fi[1]); }
      else if (st === 'aussen') {
        if (fa[0] === fb[0] && fa[1] === fb[1]) s = uferStueckF('aussen', k.rand, fa[0], fa[1]);
        else { var ca = 'krone-' + (++KRONE_NR), cb = 'krone-' + (++KRONE_NR); s = '<clipPath id="' + ca + '"><path d="M0 0H18V18Z"/></clipPath><clipPath id="' + cb + '"><path d="M0 0V18H18Z"/></clipPath><g clip-path="url(#' + ca + ')">' + uferStueckF('aussen', k.rand, fa[0], fa[1]) + '</g><g clip-path="url(#' + cb + ')">' + uferStueckF('aussen', k.rand, fb[0], fb[1]) + '</g>'; }
      }
      return s ? '<g transform="rotate(' + q * 90 + ' 18 18)">' + s + '</g>' : '';
    }).join('');
  }
  function aufsatzFuer(set, ctx, x, y) {
    var k = kachelVon(set, zeichen(ctx, x, y));
    if (!k) return '';
    if (KOERPER[k.code]) return istDachblock(set, ctx, x, y) ? '' : wandSvg(set, ctx, x, y);
    // Bäume: die Krone kommt nach den Höhenschatten (kroneFuer); im Wald Stamm und Schatten, auch in der Nische (stammFuer)
    if (k.krone && !((ctx.unterWasser || ctx.unterDeck) && k.anBord && bordFeld(set, ctx, x, y)) && (set.kronendach === 'schatten' || !inNische(ctx, x, y))) return '';
    if (k.weg) { var sg = stegFuer(set, ctx, x, y); if (sg !== null) return sg; var f = wegForm(maske(ctx, x, y)); return wegAuf(set, f.form, f.r); }
    if (k.bach) return bachFuer(set, ctx, x, y);
    if (k.rand) return uferFuer(set, ctx, x, y, k);
    if (k.teppich) return viertel(teppichStueck, viertelZustaende(ctx, x, y, function (c) { return c === 'T'; })) + TEP_MITTE;
    if (k.randGegen && !bordFeld(set, ctx, x, y)) return pflasterFlaeche(set, ctx, x, y, k);
    if (k.steg && set.schiff) return deckViertel(set, ctx, x, y, k.deck || k);
    if (k.steg) return viertel(k.stueck || stegStueck, viertelZustaende(ctx, x, y, function (c) { return c === k.code; }));
    if (k.stroh) return viertel(strohStueck, viertelZustaende(ctx, x, y, function (c) { return c === 'h'; }));
    if (k.moebel === 'tisch' || k.moebel === 'bank') {
      var gl = function (dx, dy) { return zeichen(ctx, x + dx, y + dy) === k.code; }, laengs = function (dy) { return gl(0, dy) && !gl(-1, dy) && !gl(1, dy); }, draussen = !ctx.unterDeck && draussenAuf(set, musterFuer(set, ctx, x, y));
      if (k.moebel === 'tisch') { var tw = gl(-1, 0) || gl(1, 0), ts = !tw && (gl(0, -1) || gl(0, 1)); return tischSvg(set, ts && laengs(-1), tw && gl(1, 0), ts && laengs(1), tw && gl(-1, 0), draussen, streu(x, y) && !draussen); }
      var senk = (gl(0, -1) || gl(0, 1)) && !(gl(-1, 0) || gl(1, 0));
      if (!gl(0, -1) && !gl(0, 1) && !gl(-1, 0) && !gl(1, 0)) senk = drehung(ctx, x, y) % 180 === 90;
      return senk ? '<g transform="rotate(90 18 18)">' + bankSvg(set, laengs(-1), laengs(1), draussen) + '</g>' : bankSvg(set, gl(-1, 0), gl(1, 0), draussen);
    }
    if (k.anBord && bordFeld(set, ctx, x, y)) return anBordFuer(set, ctx, x, y, k);
    if (k.drinnen && !ctx.unterDeck && !draussenAuf(set, musterFuer(set, ctx, x, y))) { if (ctx.luken && ctx.luken[x + ',' + y]) return aufsatzSvg(set, 'luke', 0, false); return aufsatzSvg(set, musterFuer(set, ctx, x, y) === 'stein' ? k.aufsatz : k.drinnen, drehung(ctx, x, y), false); }
    return k.aufsatz ? aufsatzSvg(set, feuerId(k, ctx, x, y), drehung(ctx, x, y), (!ctx.unterDeck && draussenAuf(set, musterFuer(set, ctx, x, y))) || (ctx.wehe && ctx.wehe[x + ',' + y] > 0), k.code === 'S' && amTisch(ctx, x, y) ? 6 : 0) : '';
  }
  function flaeche(k) { return k && (k.rand || k.teppich || k.stroh || k.steg); }
  // Große Kronen (krone: Aufsatz-id): über die Nachbarfelder hinaus, darum nach allen anderen Aufsätzen gezeichnet, vor Raster und Steinen
  // Die Krone endet an gebauter Wand und Tür (sie überdeckt kein Haus) und am Kartenrand; über einer Felswand liegt sie, wenn deren
  // Oberkante höchstens eine Ebene (1,5 m) über dem Baum liegt, sonst endet sie auch dort. Oberkante: die höchste Ebene der Felswand
  // und ihrer freien Nachbarn. Die Nachbarfelder werden dazu einzeln weggeschnitten (clipPath je Baum).
  var KRONE_NR = 0;
  // Steinrand an der Kante einer höheren Ebene ohne Fels (seit 1.11.): heißt „von hier nicht begehbar“ (ohne Treppe klettert man).
  // Ein schmales Band Felstextur des Sets an der Seite q (0 = oben); die Textur dreht nicht, damit sie über die Felder durchläuft.
  var RAND_BAND = 'M0 0H36V4.6C30 6.2 25 3.8 19 5.2S8 6.4 0 4.6Z', RAND_LINIE = 'M36 4.6C30 6.2 25 3.8 19 5.2S8 6.4 0 4.6';
  function randBand(set, q, v) {
    var id = 'rand-' + (++KRONE_NR);
    if (set.fels.gerade) return '<clipPath id="' + id + '"><path d="M0 0H36V4.6H0Z" transform="rotate(' + q * 90 + ' 18 18)"/></clipPath><g clip-path="url(#' + id + ')">' + felsTextur(set.fels, v) + '</g><path d="M36 4.6H0" transform="rotate(' + q * 90 + ' 18 18)" fill="none" stroke="' + set.fels.fuge + '" stroke-width=".8" opacity=".6"/>';
    return '<clipPath id="' + id + '"><path d="' + RAND_BAND + '" transform="rotate(' + q * 90 + ' 18 18)"/></clipPath><g clip-path="url(#' + id + ')">' + felsTextur(set.fels, v) + '</g>' +
      '<path d="' + RAND_LINIE + '" transform="rotate(' + q * 90 + ' 18 18)" fill="none" stroke="' + set.fels.fuge + '" stroke-width=".8" opacity=".6"/>';
  }
  // Eine Plattform ganz aus Fels (Max, 2.11.2026): Zusammenhängender Fels, der ein Quadrat von 2 × 2 Feldern enthält und nicht am Kartenrand liegt, zeigt überall die Felstextur wie Fels am Rand.
  // Oberkante und Seiten gelten für den ganzen Block: Ein freier Nachbar unter der Oberkante ist tief, sonst hoch; hat der Block keinen tieferen Nachbarn, steht er auf ebenem Grund und jede freie Seite ist tief. Liegt er tiefer als alles ringsum, ist er ein Loch und bleibt, wie er war.
  function felsBlock(ctx, x, y) {
    if (!ctx.felsBloecke) {
      ctx.felsBloecke = {};
      var gesehen = {};
      if (!ctx.masse) for (var by = 1; by <= ctx.ze; by++) for (var bx = 1; bx <= ctx.sp; bx++) {
        if (zeichen(ctx, bx, by) !== 'F' || gesehen[bx + ',' + by]) continue;
        var teile = [], st = [[bx, by]]; gesehen[bx + ',' + by] = 1;
        while (st.length) { var q = st.pop(); teile.push(q); D4.forEach(function (d) { var nx = q[0] + d[0], ny = q[1] + d[1], k = nx + ',' + ny; if (zeichen(ctx, nx, ny) === 'F' && !gesehen[k]) { gesehen[k] = 1; st.push([nx, ny]); } }); }
        var amRand = teile.some(function (t) { return t[0] === 1 || t[1] === 1 || t[0] === ctx.sp || t[1] === ctx.ze; });
        var dick = teile.some(function (t) { return zeichen(ctx, t[0] + 1, t[1]) === 'F' && zeichen(ctx, t[0], t[1] + 1) === 'F' && zeichen(ctx, t[0] + 1, t[1] + 1) === 'F'; });
        if (amRand || !dick) continue;
        var top = 0, frei = [];
        teile.forEach(function (t) { top = Math.max(top, ctx.hoehe(t[0], t[1])); });
        var eigen = top;
        teile.forEach(function (t) { D4.forEach(function (d) { var c = zeichen(ctx, t[0] + d[0], t[1] + d[1]); if (c !== null && !WAND[c]) { top = Math.max(top, ctx.hoehe(t[0] + d[0], t[1] + d[1])); if (c !== '+') frei.push(ctx.hoehe(t[0] + d[0], t[1] + d[1])); } }); });
        if (frei.length && frei.every(function (h) { return h > eigen; })) continue;
        var block = { top: top, tief: frei.some(function (h) { return h < top; }) };
        teile.forEach(function (t) { ctx.felsBloecke[t[0] + ',' + t[1]] = block; });
      }
    }
    return ctx.felsBloecke[x + ',' + y];
  }
  function felsOben(ctx, x, y) { var blk = felsBlock(ctx, x, y); if (blk) return blk.top; var h = ctx.hoehe(x, y); D4.forEach(function (d) { var c = zeichen(ctx, x + d[0], y + d[1]); if (c !== null && !WAND[c]) h = Math.max(h, ctx.hoehe(x + d[0], y + d[1])); }); return h; }
  // Fels über der Krone: höher als eine Ebene über dem Stamm, oder Felsmasse, die bis zur Decke reicht
  function felsUeber(ctx, x, y, dx, dy) { return ctx.masse || felsOben(ctx, x + dx, y + dy) - ctx.hoehe(x, y) > 1; }
  function kroneGesperrt(ctx, x, y, dx, dy) { var c = zeichen(ctx, x + dx, y + dy); return c !== null && (!!BAU[c] || c === '+' || (c === 'F' && felsUeber(ctx, x, y, dx, dy))); }
  // Ein Baum in einer Nische (die Krone fände oben und unten oder links und rechts eine Wand) wächst klein: Krone ein Feld, wie für sich allein
  function inNische(ctx, x, y) { return (kroneGesperrt(ctx, x, y, 0, -1) && kroneGesperrt(ctx, x, y, 0, 1)) || (kroneGesperrt(ctx, x, y, -1, 0) && kroneGesperrt(ctx, x, y, 1, 0)); }
  function kroneFuer(set, ctx, x, y) {
    var k = kachelVon(set, zeichen(ctx, x, y)); if (k && k.krone && k.anBord && bordFeld(set, ctx, x, y)) return ctx.unterWasser || ctx.unterDeck ? '' : segelKrone(set, ctx, x, y); if (!k || !k.krone || inNische(ctx, x, y)) return '';
    var h0 = ctx.hoehe(x, y), frei = [], ganz = true;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      var c = dx || dy ? zeichen(ctx, x + dx, y + dy) : 'O';
      var offen = c !== null && !BAU[c] && c !== '+' && !(c === 'F' && felsUeber(ctx, x, y, dx, dy));
      if (offen) frei.push([dx, dy]); else ganz = false;
    }
    var svg = aufsatzSvg(set, k.krone, 0, true);
    if (ganz) return svg;
    var id = 'krone-' + (++KRONE_NR);
    return '<clipPath id="' + id + '">' + frei.map(function (q) { return '<rect x="' + q[0] * 36 + '" y="' + q[1] * 36 + '" width="36" height="36"/>'; }).join('') + '</clipPath><g clip-path="url(#' + id + ')">' + svg + '</g>';
  }
  // Klima drinnen: Innenfelder, Lücken in der Wand und Löcher im Dach geben eine Wehe (2 am Loch, 1 daneben)
  function istInnen(set, ctx, x, y) {
    var c = zeichen(ctx, x, y), k = kachelVon(set, c);
    if (!k) return false;
    if (ctx.dachboden && k.dachboden) return true;
    if (set.bollwerk) { var bw = bollwerkFelder(ctx); if (bw[x + ',' + y] || ((k.stellt || k.unter) && D4.some(function (d) { return bw[(x + d[0]) + ',' + (y + d[1])]; }))) return false; }
    if (BODEN_INNEN[c] || BEDECKT[c]) return true;
    return !!k.stellt && c !== '+' && !draussenAuf(set, musterFuer(set, ctx, x, y));
  }
  function klima(set, ctx) {
    var wehe = {}, rand = [];
    for (var y = 1; y <= ctx.ze; y++) for (var x = 1; x <= ctx.sp; x++) {
      if (!istInnen(set, ctx, x, y)) continue;
      var luecke = D4.some(function (d) { var c = zeichen(ctx, x + d[0], y + d[1]); return c !== null && !WAND[c] && c !== '+' && !istInnen(set, ctx, x + d[0], y + d[1]); });
      if (luecke) rand.push([x, y]);
    }
    (ctx.dach || []).forEach(function (p) { rand.push(p); });
    rand.forEach(function (p) {
      wehe[p[0] + ',' + p[1]] = 2;
      D4.forEach(function (d) { var nx = p[0] + d[0], ny = p[1] + d[1], key = nx + ',' + ny; if (istInnen(set, ctx, nx, ny) && !wehe[key]) wehe[key] = 1; });
    });
    ctx.wehe = wehe;
    return ctx;
  }
  // Seltene Details: fest je Feld gestreut, etwa jedes siebte, nie zwei Nachbarn
  function streu(x, y) { var h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) % 7 === 0; }
  function seltenErlaubt(set, ctx, x, y) {
    var m = musterVon(set, musterFuer(set, ctx, x, y));
    if (!m || !m.selten || !streu(x, y)) return false;
    if (set.schiff && bordFeld(set, ctx, x, y) && (zeichen(ctx, x, y) !== set.schiff.deck || !bordFeld(set, ctx, x - 1, y) || !bordFeld(set, ctx, x + 1, y) || !bordFeld(set, ctx, x, y - 1) || !bordFeld(set, ctx, x, y + 1))) return false;
    if (set.schiff && !bordFeld(set, ctx, x, y)) { for (var sy = -1; sy <= 1; sy++) for (var sx = -1; sx <= 1; sx++) if (bordFeld(set, ctx, x + sx, y + sy)) return false; }
    return ![[-1, 0], [0, -1], [-1, -1], [1, -1]].some(function (d) { return streu(x + d[0], y + d[1]) && musterFuer(set, ctx, x + d[0], y + d[1]) === musterFuer(set, ctx, x, y); });
  }
  // Wände tragen ihr seltenes Detail auf der Krone (wandSvg), nicht im Grund; unter einem Weg liegt keins (seit Set 4: die Wiese hat eins), unter dem Bach auch nicht (Set 7)
  function seltenFuer(set, ctx, x, y) { var k = kachelVon(set, zeichen(ctx, x, y)); return !BAU[zeichen(ctx, x, y)] && !(k && (k.weg || k.bach)) && seltenErlaubt(set, ctx, x, y) ? musterVon(set, musterFuer(set, ctx, x, y)).selten : ''; }
  function weheFuer(set, ctx, x, y) { var w = ctx.wehe && ctx.wehe[x + ',' + y]; return w ? (set.wehe[w] || '') : ''; }
  // Kleine Karte ohne Höhe für die Proben
  function felder(liste) { var o = {}; (liste || []).forEach(function (p) { o[p[0] + ',' + p[1]] = 1; }); return o; }
  function bildKnapp(set, id, v) { return bild(set, id, v).replace('<rect ', '<rect shape-rendering="crispEdges" '); }
  function viertelGedeckt(set, ctx, x, y, q, src, mu) { var c = zeichen(ctx, x, y), a = D4[q], b = D4[(q + 3) % 4]; return !src && mu !== 'masse' && !istDachblock(set, ctx, x, y) && (c === 'F' || [a, b, [a[0] + b[0], a[1] + b[1]]].every(function (d) { return verbunden(zeichen(ctx, x + d[0], y + d[1])); })) ? (c === 'F' ? set.fels.front : WANDSTIL[c].krone) : null; }
  function miniSvg(set, rows, s, drehungen, dach, topf, aus) {
    var ctx = furten(set, klima(set, { boden: rows, sp: rows[0].length, ze: rows.length, hoehe: function () { return 0; }, drehung: drehungen || {}, dach: dach, topf: felder(topf), aus: felder(aus), masse: !!set.fels.masse })), out = [];
    function zelle(x, y, inhalt) { if (inhalt) out.push('<g transform="translate(' + (x - 1) * 36 + ' ' + (y - 1) * 36 + ')">' + inhalt + '</g>'); }
    for (var y = 1; y <= ctx.ze; y++) for (var x = 1; x <= ctx.sp; x++) {
      if (schiffVon(set, ctx, x, y)) { zelle(x, y, bildKnapp(set, wasserBei(set, ctx, x, y), variante(x, y))); continue; }
      if (!KOERPER[zeichen(ctx, x, y)]) { zelle(x, y, bildKnapp(set, musterFuer(set, ctx, x, y), variante(x, y))); continue; }
      // Wandfeld: je Viertel der Boden der Nachbarn, an derselben Stelle wie dort (das Muster läuft durch)
      zelle(x, y, VIERTEL_POS.map(function (p, q) { var src = wandQuelle(ctx, x, y, q), mu = src ? musterFuer(set, ctx, src[0], src[1]) : viertelMasse(ctx, x, y, q) ? 'masse' : set.standard, gd = viertelGedeckt(set, ctx, x, y, q, src, mu);
        return gd ? '<rect shape-rendering="crispEdges" x="' + p[0] + '" y="' + p[1] + '" width="18" height="18" fill="' + gd + '"/>' : '<svg x="' + p[0] + '" y="' + p[1] + '" width="18" height="18" viewBox="' + p[0] + ' ' + p[1] + ' 18 18" overflow="hidden">' + bild(set, mu, variante(x, y)) + '</svg>'; }).join(''));
    }
    if (set.schiff) {
      out.push(schiffBasis(set, ctx, 0, 0, 36, null));
      for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) {
        if (!schiffVon(set, ctx, x, y)) continue;
        if (!KOERPER[zeichen(ctx, x, y)]) { var mz = musterFuer(set, ctx, x, y); if (!istDeckMuster(set, mz)) zelle(x, y, bild(set, mz, variante(x, y))); continue; }
        zelle(x, y, VIERTEL_POS.map(function (p, q) { var src = wandQuelle(ctx, x, y, q); if (!src || !bordFeld(set, ctx, src[0], src[1])) return ''; var mu = musterFuer(set, ctx, src[0], src[1]); if (istDeckMuster(set, mu)) return ''; return '<svg x="' + p[0] + '" y="' + p[1] + '" width="18" height="18" viewBox="' + p[0] + ' ' + p[1] + ' 18 18" overflow="hidden">' + bild(set, mu, variante(x, y)) + '</svg>'; }).join(''));
      }
    }
    for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) { var k = kachelVon(set, zeichen(ctx, x, y)); zelle(x, y, seltenFuer(set, ctx, x, y) + (flaeche(k) ? aufsatzFuer(set, ctx, x, y) : '') + relingFuer(set, ctx, x, y) + weheFuer(set, ctx, x, y)); }
    if (set.schiff) out.push(schiffReling(set, ctx, 0, 0, 36));
    for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) { var kk = kachelVon(set, zeichen(ctx, x, y)); if (!flaeche(kk)) zelle(x, y, aufsatzFuer(set, ctx, x, y)); }
    if (set.haeuser) out.push(daecherSvg(set, ctx, 1, 0, 0, function () { return false; }, null));
    if (set.kronendach === 'schatten') {
      var ksch = '';
      for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) { var kz = kronenSchatten(set, ctx, x, y); if (kz) ksch += '<g transform="translate(' + (x - 1) * 36 + ' ' + (y - 1) * 36 + ')">' + kz + '</g>'; }
      if (ksch) out.push('<g opacity="' + KRONENDACH.deckung + '">' + ksch + '</g>');
      for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) zelle(x, y, stammFuer(set, ctx, x, y));
    } else for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) zelle(x, y, kroneFuer(set, ctx, x, y));
    return '<svg width="' + s + '" height="' + Math.round(s * ctx.ze / ctx.sp) + '" viewBox="0 0 ' + ctx.sp * 36 + ' ' + ctx.ze * 36 + '" aria-hidden="true">' + out.join('') + '</svg>';
  }
  function nahtRows(k) {
    if (k.naht) return k.naht;
    var n = k.aufsatz || k.teppich ? (k.unter ? '=' : '.') : k.code;
    return [n + n + n, n + k.code + n, n + n + n];
  }
  function stein(cx, cy, r, art, kurz) {
    var form, fill = art === 'figur' ? KONST.tinte : art === 'gefolge' ? KONST.gruen : KONST.rot;
    if (art === 'gegner') { var d = r * 1.2; form = '<polygon points="' + cx + ',' + (cy - d) + ' ' + (cx + d) + ',' + cy + ' ' + cx + ',' + (cy + d) + ' ' + (cx - d) + ',' + cy + '" fill="' + fill + '" stroke="' + KONST.hell + '" stroke-width="1.5"/>'; }
    else form = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="' + KONST.hell + '" stroke-width="1.5"/>';
    var ring = art === 'figur' ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 3) + '" fill="none" stroke="' + KONST.gold + '" stroke-width="2.5"/>' : '';
    return ring + form + '<text x="' + cx + '" y="' + (cy + r * 0.36) + '" text-anchor="middle" font-family="EB Garamond,Georgia,serif" font-weight="600" font-size="' + (r * 0.95) + '" fill="' + KONST.schrift + '">' + kurz + '</text>';
  }
  function steinSvg(set, k, s, bodenId) {
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 36 36" aria-hidden="true">' + kachelInnen(set, k, 0, 0, k.weg ? 'ecke' : null, bodenId) + stein(18, 18, 10.5, 'figur', 'FS') + '</svg>';
  }

  // Sicht im Kampf: von der Figur aus über alles, was keine Wand und keine geschlossene Tür ist
  function sichtVon(S, offen) {
    var sp = S.boden[0].length, ze = S.boden.length, f = S.wesen.filter(function (w) { return w.art === 'figur'; })[0], sicht = {}, stapel = [[f.x, f.y]];
    function c(x, y) { return S.boden[y - 1][x - 1]; }
    sicht[f.x + ',' + f.y] = 1;
    while (stapel.length) {
      var p = stapel.pop();
      D4.forEach(function (d) {
        var nx = p[0] + d[0], ny = p[1] + d[1], key = nx + ',' + ny;
        if (nx < 1 || ny < 1 || nx > sp || ny > ze || sicht[key]) return;
        var z = c(nx, ny);
        if (WAND[z] || (z === '+' && !offen[key])) return;
        sicht[key] = 1; stapel.push([nx, ny]);
      });
    }
    var rand = {};
    Object.keys(sicht).forEach(function (key) {
      var q = key.split(',').map(Number);
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var nx = q[0] + dx, ny = q[1] + dy; if (nx < 1 || ny < 1 || nx > sp || ny > ze) continue;
        var z = c(nx, ny); if (WAND[z] || z === '+') rand[nx + ',' + ny] = 1;
      }
    });
    Object.keys(rand).forEach(function (key) { sicht[key] = 1; });
    return sicht;
  }
  // Im Dunkeln (Vorschlag mit Set 5): Die Figur sieht von dem, was die Sichtflut erreicht, nur, was im Licht liegt oder in ihrer Dunkelsicht
  // (w.dunkelsicht, in Feldern); ihr eigenes Feld immer. Wände und Türen an dieser Grenze bleiben zu sehen.
  function sichtImLicht(S, sicht, stufe) {
    var sp = S.boden[0].length, ze = S.boden.length, f = S.wesen.filter(function (w) { return w.art === 'figur'; })[0], ds = f.dunkelsicht || 0, neu = {};
    function c(x, y) { return S.boden[y - 1][x - 1]; }
    Object.keys(sicht).forEach(function (key) {
      var q = key.split(',').map(Number), z = c(q[0], q[1]);
      if (WAND[z] || z === '+') return;
      if (stufe(key) >= 1 || (q[0] - f.x) * (q[0] - f.x) + (q[1] - f.y) * (q[1] - f.y) <= ds * ds || (q[0] === f.x && q[1] === f.y)) neu[key] = 1;
    });
    var rand = {};
    Object.keys(neu).forEach(function (key) {
      var q = key.split(',').map(Number);
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var nx = q[0] + dx, ny = q[1] + dy; if (nx < 1 || ny < 1 || nx > sp || ny > ze) continue;
        var z = c(nx, ny); if (WAND[z] || z === '+') rand[nx + ',' + ny] = 1;
      }
    });
    Object.keys(rand).forEach(function (key) { neu[key] = 1; });
    return neu;
  }
  // Farben des Nebels: der Schleier über dem, was die Figur im Nebel sieht, und die Nebelwand dahinter (hell, nicht schwarz: dort ist Nebel)
  var NEBEL = { schleier: '#eceae3', deckung: 0.34, wand: '#d3d4cc', schwade: '#e4e5de' };
  // Dichter Nebel (Vorschlag mit Set 6, S.nebel = n Felder): Die Figur sieht von dem, was die Sichtflut erreicht, nur, was höchstens n Felder
  // entfernt liegt (Kreis um ihr Feld); Licht hilft im Nebel nicht. Wände und Türen an dieser Grenze bleiben zu sehen.
  function sichtImNebel(S, sicht, n) {
    var sp = S.boden[0].length, ze = S.boden.length, f = S.wesen.filter(function (w) { return w.art === 'figur'; })[0], neu = {};
    function c(x, y) { return S.boden[y - 1][x - 1]; }
    Object.keys(sicht).forEach(function (key) {
      var q = key.split(',').map(Number), z = c(q[0], q[1]);
      if (WAND[z] || z === '+') return;
      if ((q[0] - f.x) * (q[0] - f.x) + (q[1] - f.y) * (q[1] - f.y) <= n * n) neu[key] = 1;
    });
    var rand = {};
    Object.keys(neu).forEach(function (key) {
      var q = key.split(',').map(Number);
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var nx = q[0] + dx, ny = q[1] + dy; if (nx < 1 || ny < 1 || nx > sp || ny > ze) continue;
        var z = c(nx, ny); if ((WAND[z] || z === '+') && sicht[nx + ',' + ny]) rand[nx + ',' + ny] = 1;
      }
    });
    Object.keys(rand).forEach(function (key) { neu[key] = 1; });
    return neu;
  }
  function karteSvg(set, S, modus) {
    if (S.unterDeck) S = Object.assign({}, S, { boden: S.boden.map(function (z) { return z.replace(/#/g, '§'); }) });
    var probeKarte = !!(modus && modus.probe), Z = 30, RAND = probeKarte ? 0 : 26, sp = S.boden[0].length, ze = S.boden.length, W = RAND * 2 + sp * Z, H = RAND * 2 + ze * Z, k = Z / 36, out = [];
    function hoehe(x, y) { var c = (S.hoehe[y - 1] || '')[x - 1] || '0'; return parseInt(c, 10) || 0; }
    function code(x, y) { return S.boden[y - 1][x - 1]; }
    function sichtbar(x, y) { return x >= 1 && y >= 1 && x <= sp && y <= ze && !WAND[code(x, y)]; }
    function px(x) { return RAND + (x - 1) * Z; } function py(y) { return RAND + (y - 1) * Z; }
    var ctx = furten(set, klima(set, { boden: S.boden, sp: sp, ze: ze, hoehe: hoehe, drehung: S.drehung, randOffen: true, dach: S.dach, topf: felder(S.kochtopf), aus: felder(S.erloschen), masse: !!set.fels.masse, unterWasser: !!S.unterWasser, unterDeck: !!S.unterDeck, luken: felder(S.luken), gerefft: felder(S.gerefft), dachboden: !!S.dachboden }));
    // Licht: Feuer (licht: warm, hell 4 Felder = 6 m, dämmrig 8 = 12 m), Kacheln, die selbst leuchten (leuchtet: {hell, daemmer}, kaltes Licht),
    // und Lichter der Karte (S.lichter: [[x, y, hell, daemmer]], etwa eine Fackel in der Hand). Es hält an Wänden und geschlossenen Türen.
    var licht = {}, kalt = {}, offen = (modus && modus.offen) || {};
    function leuchte(fx, fy, hell, daemmer, ziel) {
      var lg = {}, st = [[fx, fy]]; lg[fx + ',' + fy] = 1;
      while (st.length) {
        var p = st.pop(), dist = Math.sqrt((p[0] - fx) * (p[0] - fx) + (p[1] - fy) * (p[1] - fy)), stufe = hell > 0 && dist <= hell ? 2 : 1, key0 = p[0] + ',' + p[1];
        ziel[key0] = Math.max(ziel[key0] || 0, stufe);
        if (WAND[code(p[0], p[1])] || (code(p[0], p[1]) === '+' && !offen[key0] && (p[0] !== fx || p[1] !== fy))) continue;
        [[0, -1], [1, 0], [0, 1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (d) {
          var nx = p[0] + d[0], ny = p[1] + d[1], key = nx + ',' + ny;
          if (nx < 1 || ny < 1 || nx > sp || ny > ze || lg[key]) return;
          if ((nx - fx) * (nx - fx) + (ny - fy) * (ny - fy) > daemmer * daemmer) return;
          if (d[0] && d[1] && (WAND[code(p[0] + d[0], p[1])] || WAND[code(p[0], p[1] + d[1])])) return;
          lg[key] = 1; st.push([nx, ny]);
        });
      }
    }
    for (var fy = 1; fy <= ze; fy++) for (var fx = 1; fx <= sp; fx++) {
      var fk = kachelVon(set, code(fx, fy)); if (!fk || ctx.aus[fx + ',' + fy]) continue;
      if (fk.licht) leuchte(fx, fy, 4, 8, licht);
      if (fk.leuchtet) leuchte(fx, fy, fk.leuchtet.hell, fk.leuchtet.daemmer, kalt);
    }
    (S.lichter || []).forEach(function (l) { leuchte(l[0], l[1], l[2], l[3], licht); });
    [licht, kalt].forEach(function (L) { Object.keys(L).forEach(function (key) { var q = key.split(',').map(Number); if (WAND[code(q[0], q[1])]) delete L[key]; }); });
    // Dunkelheit (seit Set 5, Max 1.11.): Liegt die Karte im Dunkeln (S.grundlicht 'dunkel' oder 'daemmrig'), sieht die Figur im Kampf
    // nur, was im Licht liegt oder in ihrer Dunkelsicht (sichtImLicht); Dämmriges und nur mit Dunkelsicht Gesehenes liegt unter einem Schleier
    var grundStufe = S.grundlicht === 'dunkel' ? 0 : S.grundlicht === 'daemmrig' ? 1 : 2, nacht = modus && modus.sicht && grundStufe < 2 ? 'licht' : null;
    function lichtStufe(key) { return Math.max(grundStufe, licht[key] || 0, kalt[key] || 0); }
    var sicht = modus && modus.sicht ? sichtVon(S, modus.offen || {}) : null;
    if (sicht && nacht === 'licht') sicht = sichtImLicht(S, sicht, lichtStufe);
    // Nebel (Vorschlag mit Set 6, nur im Kampf): S.nebel 'leicht' legt einen hellen Schleier über alles, was die Figur sieht (Regelwerk 9.7,
    // leicht verdeckt); S.nebel n (dichter Nebel) zeigt nur, was höchstens n Felder entfernt ist, der Rest liegt hinter der Nebelwand.
    var nebel = modus && modus.sicht && S.nebel ? S.nebel : null, imNebel = {}, NS = (S.unterWasser && set.unterWasser.stil) || set.nebelStil || NEBEL;
    if (sicht && typeof nebel === 'number') { var vorNebel = sicht; sicht = sichtImNebel(S, sicht, nebel); Object.keys(vorNebel).forEach(function (key) { if (!sicht[key]) imNebel[key] = 1; }); }
    function dunkel(x, y) { return sicht && !sicht[x + ',' + y]; }
    function verdeckt(x, y) { return imNebel[x + ',' + y] ? 'nebelwand' : 'dunkel'; }
    function nurSicht(inhalt) { if (!sicht || !set.schiff || !inhalt) return inhalt; var d = ''; for (var sy = 1; sy <= ze; sy++) for (var sx = 1; sx <= sp; sx++) if (!dunkel(sx, sy)) d += 'M' + px(sx) + ' ' + py(sy) + 'h' + Z + 'v' + Z + 'h-' + Z + 'Z'; var nid = 'krone-' + (++KRONE_NR); return '<clipPath id="' + nid + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + nid + ')">' + inhalt + '</g>'; }
    // Muster je Set mit eigenem Präfix, damit zwei Karten auf einer Seite sich nicht in die Quere kommen
    var pm = 'm-' + set.id + (probeKarte ? '-p-' : '-'), musterIds = Object.keys(GEMEINSAM.muster).concat(Object.keys(set.muster));
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Probekarte ' + S.titel + '">');
    out.push('<defs>' + musterIds.map(function (id) {
      var m = musterVon(set, id), n = m.bilder.length, w = n > 1 ? 2 * Z : Z, g = '';
      for (var v = 0; v < (n > 1 ? 4 : 1); v++) g += '<g transform="translate(' + (v % 2) * Z + ' ' + Math.floor(v / 2) * Z + ') scale(' + k + ')">' + m.bilder[v % n] + '</g>';
      return '<pattern id="' + pm + id + '" patternUnits="userSpaceOnUse" x="' + RAND + '" y="' + RAND + '" width="' + w + '" height="' + w + '"><rect width="' + w + '" height="' + w + '" fill="' + m.grund + '"/>' + g + '</pattern>';
    }).join('') + '<pattern id="' + pm + 'dunkel" patternUnits="userSpaceOnUse" x="' + RAND + '" y="' + RAND + '" width="' + Z + '" height="' + Z + '"><rect width="' + Z + '" height="' + Z + '" fill="#2f2b26"/><path d="M-3 3l6-6M0 ' + Z + 'L' + Z + ' 0M' + (Z - 3) + ' ' + (Z + 3) + 'l6-6M0 ' + Z / 2 + 'L' + Z / 2 + ' 0M' + Z / 2 + ' ' + Z + 'L' + Z + ' ' + Z / 2 + '" stroke="#3e3832" stroke-width="1.6"/></pattern>' +
      (nebel ? '<pattern id="' + pm + 'nebelwand" patternUnits="userSpaceOnUse" x="' + RAND + '" y="' + RAND + '" width="' + Z + '" height="' + Z + '"><rect width="' + Z + '" height="' + Z + '" fill="' + NS.wand + '"/><path d="' + (NS.schwaden || ('M0 ' + Z / 2 + 'Q' + Z / 4 + ' ' + (Z / 2 - 4) + ' ' + Z / 2 + ' ' + Z / 2 + 'T' + Z + ' ' + Z / 2 + 'M0 ' + Z + 'Q' + Z / 4 + ' ' + (Z - 4) + ' ' + Z / 2 + ' ' + Z + 'T' + Z + ' ' + Z + 'M0 0Q' + Z / 4 + ' -4 ' + Z / 2 + ' 0T' + Z + ' 0')) + '" fill="none" stroke="' + NS.schwade + '" stroke-width="1.6"' + (NS.schwaden ? ' stroke-linecap="round"' : '') + '/></pattern>' +
        (NS.streifen ? '<pattern id="' + pm + 'streifen" patternUnits="userSpaceOnUse" x="' + RAND + '" y="' + RAND + '" width="' + Z + '" height="' + Z + '"><path d="' + NS.streifen + '" fill="none" stroke="' + NS.streifenFarbe + '" stroke-width="1.2" stroke-linecap="round"/></pattern>' : '') : '') + (S.unterWasser ? '<pattern id="' + pm + 'kaustik" patternUnits="userSpaceOnUse" x="' + RAND + '" y="' + RAND + '" width="' + 2 * Z + '" height="' + 2 * Z + '"><path d="' + set.unterWasser.kaustik + '" fill="none" stroke="' + set.unterWasser.kaustikFarbe + '" stroke-width="1.1" stroke-linecap="round" opacity=".34"/></pattern>' : '') + '</defs>');
    out.push('<rect width="' + W + '" height="' + H + '" rx="6" fill="' + KONST.pergament + '"/><rect x="' + RAND + '" y="' + RAND + '" width="' + (sp * Z) + '" height="' + (ze * Z) + '" fill="#f4ead0" opacity=".6"/>');
    out.push('<g shape-rendering="crispEdges">');
    for (var y = 1; y <= ze; y++) for (var x = 1; x <= sp; x++) {
      if (schiffVon(set, ctx, x, y)) { out.push('<rect x="' + px(x) + '" y="' + py(y) + '" width="' + Z + '" height="' + Z + '" fill="url(#' + pm + wasserBei(set, ctx, x, y) + ')"/>'); continue; }
      if (!KOERPER[code(x, y)] || dunkel(x, y)) { out.push('<rect x="' + px(x) + '" y="' + py(y) + '" width="' + Z + '" height="' + Z + '" fill="url(#' + pm + (dunkel(x, y) ? verdeckt(x, y) : musterFuer(set, ctx, x, y)) + ')"/>'); continue; }
      // Wandfeld: je Viertel der Boden der Nachbarn (im Dunkeln dunkel), der Körper kommt mit den Aufsätzen
      VIERTEL_POS.forEach(function (p, q) {
        var src = wandQuelle(ctx, x, y, q), mu = !src ? (viertelMasse(ctx, x, y, q) ? 'masse' : set.standard) : dunkel(src[0], src[1]) ? verdeckt(src[0], src[1]) : musterFuer(set, ctx, src[0], src[1]);
        var gedeckt = !src && mu !== 'masse' && !istDachblock(set, ctx, x, y) && (code(x, y) === 'F' || [D4[q], D4[(q + 3) % 4], [D4[q][0] + D4[(q + 3) % 4][0], D4[q][1] + D4[(q + 3) % 4][1]]].every(function (d) { return verbunden(zeichen(ctx, x + d[0], y + d[1])); }));
        out.push('<rect x="' + (px(x) + p[0] * k) + '" y="' + (py(y) + p[1] * k) + '" width="' + Z / 2 + '" height="' + Z / 2 + '" fill="' + (gedeckt ? (code(x, y) === 'F' ? set.fels.front : WANDSTIL[code(x, y)].krone) : 'url(#' + pm + mu + ')') + '"/>');
      });
    }
    out.push('</g>');
    if (set.schiff) {
      out.push(nurSicht(schiffBasis(set, ctx, RAND, RAND, Z, pm)));
      for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) {
        if (!schiffVon(set, ctx, x, y)) continue;
        if (!KOERPER[code(x, y)] || dunkel(x, y)) { var mz = dunkel(x, y) ? verdeckt(x, y) : musterFuer(set, ctx, x, y); if (!istDeckMuster(set, mz)) out.push('<rect x="' + px(x) + '" y="' + py(y) + '" width="' + Z + '" height="' + Z + '" fill="url(#' + pm + mz + ')"/>'); continue; }
        VIERTEL_POS.forEach(function (p, q) {
          var src = wandQuelle(ctx, x, y, q); if (!src || !bordFeld(set, ctx, src[0], src[1])) return;
          var mu = dunkel(src[0], src[1]) ? verdeckt(src[0], src[1]) : musterFuer(set, ctx, src[0], src[1]); if (istDeckMuster(set, mu)) return;
          out.push('<rect x="' + (px(x) + p[0] * k) + '" y="' + (py(y) + p[1] * k) + '" width="' + Z / 2 + '" height="' + Z / 2 + '" fill="url(#' + pm + mu + ')"/>');
        });
      }
    }
    var sc = Math.round(k * 100000) / 100000;
    // Ufer, Teppich, Stroh und Wehe vor dem Höhenton, Weg und Aufsätze danach; im Dunkeln nichts
    for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) {
      if (dunkel(x, y)) continue;
      var kk = kachelVon(set, code(x, y)), la = licht[x + ',' + y], lk = kalt[x + ',' + y];
      var inh = seltenFuer(set, ctx, x, y) + (flaeche(kk) ? aufsatzFuer(set, ctx, x, y) : '') + relingFuer(set, ctx, x, y) + stromFuer(S, ctx, x, y) + gosseFuer(S, ctx, x, y) + bollwerkFuer(set, ctx, x, y) + weheFuer(set, ctx, x, y) + (la ? '<rect width="36" height="36" fill="#f7d98a" opacity="' + (la === 2 ? 0.26 : 0.12) + '"/>' : '') + (lk ? '<rect width="36" height="36" fill="#a9e2d6" opacity="' + (lk === 2 ? 0.24 : 0.13) + '"/>' : '');
      if (BAU[code(x, y)]) VIERTEL_POS.forEach(function (p, q) {
        var qu = wandQuelle(ctx, x, y, q); if (!qu || dunkel(qu[0], qu[1])) return;
        var ql = licht[qu[0] + ',' + qu[1]], qk = kalt[qu[0] + ',' + qu[1]];
        if (ql) inh += '<rect x="' + p[0] + '" y="' + p[1] + '" width="18" height="18" fill="#f7d98a" opacity="' + (ql === 2 ? 0.26 : 0.12) + '"/>';
        if (qk) inh += '<rect x="' + p[0] + '" y="' + p[1] + '" width="18" height="18" fill="#a9e2d6" opacity="' + (qk === 2 ? 0.24 : 0.13) + '"/>';
      });
      if (inh) out.push('<g transform="translate(' + px(x) + ' ' + py(y) + ') scale(' + sc + ')">' + inh + '</g>');
    }
    // Kanten der Ebenen ohne Fels: Steinrand an der höheren Seite, wenn man dort nicht hinaufgehen kann; ein Hang (karte.hang, seit Set 8 auch
    // von selbst auf den Böden, die das Set nennt: set.hangAuf) und die Treppe
    // bleiben ohne Rand, man sieht nur den Schatten. Vor den Aufsätzen, damit Dinge auf dem Rand stehen.
    var hang = felder(S.hang), raender = [];
    for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) {
      if (!sichtbar(x, y) || dunkel(x, y) || hang[x + ',' + y] || hangVonSelbst(set, ctx, x, y)) continue;
      var rb = '';
      D4.forEach(function (d, q) {
        var nx = x + d[0], ny = y + d[1];
        if (!sichtbar(nx, ny) || dunkel(nx, ny)) return;
        var dd = hoehe(x, y) - hoehe(nx, ny); if (dd <= 0) return;
        if (dd === 1 && (code(x, y) === '/' || code(nx, ny) === '/')) return;
        rb += randBand(set, q, variante(x, y));
      });
      if (rb) raender.push('<g transform="translate(' + px(x) + ' ' + py(y) + ') scale(' + sc + ')">' + rb + '</g>');
    }
    var toene = '';
    for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) { var h = hoehe(x, y); if (h > 0 && !WAND[code(x, y)] && !dunkel(x, y)) { var tr = '<rect x="' + px(x) + '" y="' + py(y) + '" width="' + Z + '" height="' + Z + '" fill="' + KONST.hoehenton + '" fill-opacity="' + Math.min(0.55, 0.16 * h) + '"/>'; if (schiffVon(set, ctx, x, y)) toene += tr; else out.push(tr); } else if (set.schiff && !dunkel(x, y) && (h = rumpfEbene(set, ctx, x, y))) toene += '<rect x="' + px(x) + '" y="' + py(y) + '" width="' + Z + '" height="' + Z + '" fill="' + KONST.hoehenton + '" fill-opacity="' + Math.min(0.55, 0.16 * h) + '"/>'; }
    if (toene) out.push('<g clip-path="url(#' + ctx.schiffClip + ')">' + toene + '</g>');
    for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) if (BAU[code(x, y)] && !dunkel(x, y) && !(set.schiff && schiffVon(set, ctx, x, y))) VIERTEL_POS.forEach(function (p, q) {
      var qu = wandQuelle(ctx, x, y, q), qh = qu && !dunkel(qu[0], qu[1]) ? hoehe(qu[0], qu[1]) : 0;
      if (qh > 0) out.push('<rect x="' + (px(x) + p[0] * k) + '" y="' + (py(y) + p[1] * k) + '" width="' + Z / 2 + '" height="' + Z / 2 + '" fill="' + KONST.hoehenton + '" fill-opacity="' + Math.min(0.55, 0.16 * qh) + '"/>');
    });
    out.push(raender.join(''));
    if (set.schiff) out.push(nurSicht(schiffReling(set, ctx, RAND, RAND, Z)));
    for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) {
      var kq = kachelVon(set, code(x, y)); if (!kq || flaeche(kq) || dunkel(x, y)) continue;
      var auf = aufsatzFuer(set, ctx, x, y);
      if (auf) out.push('<g transform="translate(' + px(x) + ' ' + py(y) + ') scale(' + sc + ')">' + auf + '</g>');
    }
    var SEITEN = [[0, -1, 'n'], [0, 1, 's'], [-1, 0, 'w'], [1, 0, 'e']];
    function seiteIndex(dx, dy) { for (var i = 0; i < 4; i++) if (D4[i][0] === dx && D4[i][1] === dy) return i; return -1; }
    // Wirft (nx, ny) Schatten auf (x, y)? zumFeld: die Seiten des Nachbarn, die zum Feld zeigen (bei einer Diagonale zwei)
    function wurf(x, y, nx, ny, zumFeld) {
      if (nx < 1 || ny < 1 || nx > sp || ny > ze || dunkel(nx, ny)) return null;
      if (set.schiff && bordFeld(set, ctx, nx, ny) && !bordFeld(set, ctx, x, y)) return null;
      var h0 = hoehe(x, y);
      if (code(nx, ny) === 'F') {
        var fs = felsSeiten(ctx, nx, ny);
        if (!zumFeld.some(function (q) { return fs[q] === 'tief'; })) return null;
        return { dh: Math.max(1, felsOben(ctx, nx, ny) - h0), stufe: false };
      }
      if (!sichtbar(nx, ny)) return null;
      var dh = hoehe(nx, ny) - h0; if (dh <= 0) return null;
      return { dh: dh, stufe: dh === 1 && (code(x, y) === '/' || code(nx, ny) === '/') };
    }
    function mass(sw) { return { b: sw.stufe ? 6 : Math.min(Z * 0.8, 7 + 5 * sw.dh), n: sw.stufe ? 2 : 4, st: sw.stufe ? [.16, .07] : [.36, .24, .13, .05], tiefe: sw.stufe ? 1 : Math.min(1.6, 0.85 + 0.25 * sw.dh) }; }
    function rd(v) { return Math.round(v * 100) / 100; }
    for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) {
      if (!sichtbar(x, y) || dunkel(x, y)) continue;
      var X0 = px(x), Y0 = py(y), wirftAn = {};
      SEITEN.forEach(function (s) {
        var sw = wurf(x, y, x + s[0], y + s[1], [seiteIndex(-s[0], -s[1])]);
        if (!sw) return;
        wirftAn[s[2]] = true;
        var x1 = s[2] === 'e' ? X0 + Z : X0, y1 = s[2] === 's' ? Y0 + Z : Y0, x2 = s[2] === 'w' ? X0 : X0 + Z, y2 = s[2] === 'n' ? Y0 : Y0 + Z;
        var ts = s[2] === 's' || s[2] === 'e' ? 0.75 : 1, m = mass(sw);
        for (var q = 0; q < m.n; q++) {
          var o = q * m.b / m.n, w = m.b / m.n, r;
          if (s[2] === 'n') r = [X0, Y0 + o, Z, w]; else if (s[2] === 's') r = [X0, Y0 + Z - o - w, Z, w]; else if (s[2] === 'w') r = [X0 + o, Y0, w, Z]; else r = [X0 + Z - o - w, Y0, w, Z];
          out.push('<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" fill="' + KONST.schatten + '" opacity="' + Math.round(Math.min(.5, m.st[q] * m.tiefe * ts) * 100) / 100 + '"/>');
        }
        if (sw.stufe) out.push('<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" fill="none" stroke="#6b573f" stroke-width="1" stroke-dasharray="3 2"/>');
      });
      // Äußere Ecken: die Diagonale wirft Schatten, aber keiner der beiden Nachbarn an dieser Ecke; der Schatten legt sich als Viertelkreis um die Ecke
      [[-1, -1, 'n', 'w', 0], [1, -1, 'n', 'e', 90], [1, 1, 's', 'e', 180], [-1, 1, 's', 'w', 270]].forEach(function (e) {
        if (wirftAn[e[2]] || wirftAn[e[3]]) return;
        var sw = wurf(x, y, x + e[0], y + e[1], [seiteIndex(-e[0], 0), seiteIndex(0, -e[1])]);
        if (!sw) return;
        var m = mass(sw), ts = ((e[2] === 's' ? 0.75 : 1) + (e[3] === 'e' ? 0.75 : 1)) / 2;
        var cx = e[0] > 0 ? X0 + Z : X0, cy = e[1] > 0 ? Y0 + Z : Y0, a0 = e[4] * Math.PI / 180, a1 = a0 + Math.PI / 2;
        function pt(R, a) { return rd(cx + R * Math.cos(a)) + ' ' + rd(cy + R * Math.sin(a)); }
        for (var q = 0; q < m.n; q++) {
          var R0 = q * m.b / m.n, R1 = R0 + m.b / m.n;
          var d = R0 ? 'M' + pt(R1, a0) + 'A' + rd(R1) + ' ' + rd(R1) + ' 0 0 1 ' + pt(R1, a1) + 'L' + pt(R0, a1) + 'A' + rd(R0) + ' ' + rd(R0) + ' 0 0 0 ' + pt(R0, a0) + 'Z'
            : 'M' + rd(cx) + ' ' + rd(cy) + 'L' + pt(R1, a0) + 'A' + rd(R1) + ' ' + rd(R1) + ' 0 0 1 ' + pt(R1, a1) + 'Z';
          out.push('<path d="' + d + '" fill="' + KONST.schatten + '" opacity="' + Math.round(Math.min(.5, m.st[q] * m.tiefe * ts) * 100) / 100 + '"/>');
        }
      });
    }
    // Dächer (seit Set 10): im Kampf deckt ein Dach jeden Raum, den die Figur nicht sieht; bei Nacht und im dichten Nebel zeigen sie nur, was sie sieht. Darüber die Planen.
    if (set.haeuser) out.push(daecherSvg(set, ctx, sc, RAND, RAND, function (raum) { return !!sicht && !Object.keys(raum.felder).some(function (key) { return sicht[key]; }); }, sicht && (nacht || typeof nebel === 'number') ? function (dx, dy) { return !dunkel(dx, dy); } : null), planenSvg(S, ctx, sc, RAND, RAND, sicht ? function (dx, dy) { return !dunkel(dx, dy); } : null), kranSvg(S, ctx, sc, RAND, RAND, sicht ? function (dx, dy) { return !dunkel(dx, dy); } : null));
    // Kronen über den Höhenschatten (ein Schatten fällt nicht auf einen Baum), darüber das Raster
    // Im Wald (Set 7, kronendach: 'schatten'): erst alle Kronenschatten in einer Gruppe, dann die Stämme
    if (set.kronendach === 'schatten') {
      var ksch = '';
      for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) { if (dunkel(x, y)) continue; var kz = kronenSchatten(set, ctx, x, y); if (kz) ksch += '<g transform="translate(' + px(x) + ' ' + py(y) + ') scale(' + sc + ')">' + kz + '</g>'; }
      if (ksch) out.push('<g opacity="' + KRONENDACH.deckung + '">' + ksch + '</g>');
      for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) { if (dunkel(x, y)) continue; var stm = stammFuer(set, ctx, x, y); if (stm) out.push('<g transform="translate(' + px(x) + ' ' + py(y) + ') scale(' + sc + ')">' + stm + '</g>'); }
    } else for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) { if (dunkel(x, y)) continue; var kr = kroneFuer(set, ctx, x, y); if (kr) out.push(nurSicht('<g transform="translate(' + px(x) + ' ' + py(y) + ') scale(' + sc + ')">' + kr + '</g>')); }
    // Schleier der Dunkelheit (nur im Kampf auf einer dunklen Karte): dämmrig leicht, dunkel stärker; Wände nehmen das Licht ihrer freien Nachbarn
    if (nacht) for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) {
      if (dunkel(x, y)) continue;
      var sv = lichtStufe(x + ',' + y);
      if (WAND[code(x, y)] || code(x, y) === '+') { sv = -1; for (var vy = -1; vy <= 1; vy++) for (var vx = -1; vx <= 1; vx++) if (sichtbar(x + vx, y + vy)) sv = Math.max(sv, lichtStufe((x + vx) + ',' + (y + vy))); if (sv < 0) sv = grundStufe; }
      if (sv < 2) out.push('<rect x="' + px(x) + '" y="' + py(y) + '" width="' + Z + '" height="' + Z + '" fill="#1b1814" opacity="' + (sv === 1 ? 0.24 : 0.42) + '"/>');
    }
    // Nebel (nur im Kampf): ein heller Schleier über allem, was die Figur sieht; seit Set 8 in den Farben des Sets (set.nebelStil), in der Wüste mit Streifen
    if (nebel) {
      var nb = '';
      for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) if (!dunkel(x, y)) nb += 'M' + px(x) + ' ' + py(y) + 'h' + Z + 'v' + Z + 'h-' + Z + 'Z';
      if (nb) out.push('<path d="' + nb + '" fill="' + NS.schleier + '" fill-opacity="' + NS.deckung + '"/>' + (NS.streifen ? '<path d="' + nb + '" fill="url(#' + pm + 'streifen)"/>' : ''));
    }
    if (S.unterWasser) { var uw = set.unterWasser, ub = ''; for (y = 1; y <= ze; y++) for (x = 1; x <= sp; x++) if (!dunkel(x, y)) ub += 'M' + px(x) + ' ' + py(y) + 'h' + Z + 'v' + Z + 'h-' + Z + 'Z'; if (ub) out.push('<path d="' + ub + '" fill="' + uw.schleier + '" fill-opacity="' + uw.deckung + '"/><path d="' + ub + '" fill="url(#' + pm + 'kaustik)"/>'); }
    var g = '';
    for (var i = 0; i <= sp; i++) g += 'M' + px(i + 1) + ' ' + RAND + 'V' + (RAND + ze * Z);
    for (var j = 0; j <= ze; j++) g += 'M' + RAND + ' ' + py(j + 1) + 'H' + (RAND + sp * Z);
    out.push('<path d="' + g + '" fill="none" stroke="' + KONST.tinte + '" stroke-opacity=".28" stroke-width=".8"/>');
    if (!probeKarte) for (x = 1; x <= sp; x++) { out.push('<text x="' + (px(x) + Z / 2) + '" y="' + (RAND - 8) + '" text-anchor="middle" class="be">' + x + '</text><text x="' + (px(x) + Z / 2) + '" y="' + (RAND + ze * Z + 17) + '" text-anchor="middle" class="be">' + x + '</text>'); }
    if (!probeKarte) for (y = 1; y <= ze; y++) { var zb = 'ABCDEFGHIJKL'[y - 1]; out.push('<text x="' + (RAND - 8) + '" y="' + (py(y) + Z / 2 + 4.5) + '" text-anchor="end" class="be">' + zb + '</text><text x="' + (RAND + sp * Z + 8) + '" y="' + (py(y) + Z / 2 + 4.5) + '" text-anchor="start" class="be">' + zb + '</text>'); }
    // Höhenschilder, von Hand gesetzt: ein Schild hängt links oben an seinem Feld
    (probeKarte ? [] : S.schilder || []).forEach(function (sh) { if (dunkel(sh.x, sh.y)) return; out.push('<g><rect x="' + (px(sh.x) - 14) + '" y="' + (py(sh.y) + 8) + '" width="44" height="14" rx="4" fill="#f9f2de" fill-opacity=".9" stroke="#6b573f" stroke-width=".7"/><text x="' + (px(sh.x) + 8) + '" y="' + (py(sh.y) + 19) + '" text-anchor="middle" class="hs">' + sh.text + '</text></g>'); });
    S.wesen.forEach(function (w) { if (!dunkel(w.x, w.y)) out.push(stein(px(w.x) + Z / 2, py(w.y) + Z / 2, 11, w.art, w.kurz)); });
    out.push('<style>.be{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:13px;fill:#3b3028;opacity:.9}.hs{font-family:"EB Garamond",Georgia,serif;font-size:10.5px;fill:#3b3028}</style></svg>');
    return { svg: out.join(''), W: W };
  }

  // Seit Set 7 (Wald): der Bach als Kantensatz, Furt und Steg aus den Nachbarn, die Mündung in den Teich, das Kronendach als Schatten
  function istBach(set, c) { var k = c ? kachelVon(set, c) : null; return !!(k && k.bach); }
  // Der Bach schließt an Bach, Kartenrand (nur auf der Karte) und an einen Steg an, unter dem er durchfließt
  function bachNachbar(set, ctx, x, y) { var c = zeichen(ctx, x, y); if (c === null) return !!ctx.randOffen; return istBach(set, c) || !!(ctx.stege && ctx.stege[x + ',' + y] !== undefined); }
  // In einen Teich mündet er nur, wo er endet (höchstens ein Nachbar im Bach), und dann einmal: ins erste Teichfeld nach N, O, S, W. Seite oder -1
  function bachMuendet(set, ctx, x, y) {
    var n = 0; D4.forEach(function (d) { if (bachNachbar(set, ctx, x + d[0], y + d[1])) n++; });
    if (n > 1) return -1;
    for (var q = 0; q < 4; q++) if (zeichen(ctx, x + D4[q][0], y + D4[q][1]) === '~') return q;
    return -1;
  }
  function bachMaske(set, ctx, x, y) { var m = 0, mu = bachMuendet(set, ctx, x, y); D4.forEach(function (d, q) { if (q === mu || bachNachbar(set, ctx, x + d[0], y + d[1])) m |= 1 << q; }); return m; }
  // Furt: ein Bachfeld mit Weg (Weg, Tür, Treppe) an zwei gegenüberliegenden Seiten und an den beiden anderen keinem; man watet.
  // Steg: ein Wegfeld mit Bach oder Teich an zwei gegenüberliegenden Seiten und Weg an den beiden anderen; man geht trocken.
  // Wert je Feld: Drehung des Wegs (0: Nord–Süd, 90: West–Ost). Nur in Sets mit einem Bach (k.bach).
  function furten(set, ctx) {
    ctx.furt = null; ctx.stege = null;
    if (!set.kacheln || !set.kacheln.some(function (k) { return k.bach; })) return ctx;
    ctx.furt = {}; ctx.stege = {};
    function w(x, y) { var z = zeichen(ctx, x, y); return z !== null && 'e+/'.indexOf(z) >= 0; }
    function b(x, y) { var z = zeichen(ctx, x, y); return z !== null && (istBach(set, z) || z === '~'); }
    for (var y = 1; y <= ctx.ze; y++) for (var x = 1; x <= ctx.sp; x++) {
      var k = kachelVon(set, zeichen(ctx, x, y)); if (!k) continue;
      if (k.bach) {
        if (w(x, y - 1) && w(x, y + 1) && !w(x - 1, y) && !w(x + 1, y)) ctx.furt[x + ',' + y] = 0;
        else if (w(x - 1, y) && w(x + 1, y) && !w(x, y - 1) && !w(x, y + 1)) ctx.furt[x + ',' + y] = 90;
      } else if (k.weg) {
        if (w(x, y - 1) && w(x, y + 1) && b(x - 1, y) && b(x + 1, y)) ctx.stege[x + ',' + y] = 0;
        else if (w(x - 1, y) && w(x + 1, y) && b(x, y - 1) && b(x, y + 1)) ctx.stege[x + ',' + y] = 90;
      }
    }
    return ctx;
  }
  var BACH_NAME = { gerade: 'gerade', ecke: 'Ecke', abzweig: 'Abzweig', kreuz: 'Kreuzung', ende: 'Quelle', fleck: 'Quelltopf' };
  function bachFuer(set, ctx, x, y) {
    var f = ctx.furt ? ctx.furt[x + ',' + y] : undefined;
    var m = bachMaske(set, ctx, x, y);
    if (f === undefined) { var b = wegForm(m); return '<g transform="rotate(' + b.r + ' 18 18)">' + bachSvg(b.form) + '</g>'; }
    // Furt: der Weg gerade, darüber der Bach quer (nur seine Seiten zählen), Kies im Band und Trittsteine in der Richtung des Wegs
    var bf = wegForm(f === 0 ? (m & 10) : (m & 5)), id = 'krone-' + (++KRONE_NR);
    return wegAuf(set, 'gerade', f) + '<g transform="rotate(' + bf.r + ' 18 18)">' + bachSvg(bf.form) + '</g>' +
      '<clipPath id="' + id + '"><path d="' + BACH_PFADE[bf.form][0] + '" transform="rotate(' + bf.r + ' 18 18)"/></clipPath><g clip-path="url(#' + id + ')"><g transform="rotate(' + f + ' 18 18)">' + FURT_KIES + '</g></g><g transform="rotate(' + f + ' 18 18)">' + FURT_STEINE + '</g>';
  }
  // Steg: der Weg gerade, darunter der Bach quer, darüber die Bohlen; null, wenn das Wegfeld kein Steg ist
  function stegFuer(set, ctx, x, y) {
    var f = ctx.stege ? ctx.stege[x + ',' + y] : undefined; if (f === undefined) return null;
    return wegAuf(set, 'gerade', f) + '<g transform="rotate(' + (f + 90) + ' 18 18)">' + bachSvg('gerade') + '</g><g transform="rotate(' + f + ' 18 18)">' + BACHSTEG + '</g>';
  }
  // Mündung: an der Seite eines Teichfelds, an der ein Bach in den Teich fließt (bachMuendet) oder der Bach unter einem Steg, nach dem Ufer gezeichnet
  function muendung(set, ctx, x, y) {
    if (!ctx.furt) return '';
    var o = '';
    D4.forEach(function (d, q) {
      var nx = x + d[0], ny = y + d[1], s = ctx.stege[nx + ',' + ny];
      if ((istBach(set, zeichen(ctx, nx, ny)) && bachMuendet(set, ctx, nx, ny) === (q + 2) % 4) || (s !== undefined && (s === 0) === (q % 2 === 1))) o += '<g transform="rotate(' + q * 90 + ' 18 18)">' + MUENDUNG + '</g>';
    });
    return o;
  }
  // Kronendach (Set 7, kronendach: 'schatten'): die Krone als Schatten mit Lichtflecken (Löcher, evenodd), alle Schatten einer Karte in einer
  // Gruppe, damit sie sich nicht verdunkeln, wo sie sich überdecken; darüber die Stämme. Beschnitten wie eine Krone.
  var KRONENDACH = { farbe: '#2a2119', deckung: 0.22 };
  function lichtflecken(liste) { return liste.map(function (e) { return 'M' + gr(e[0] - e[2]) + ' ' + e[1] + 'a' + e[2] + ' ' + e[3] + ' 0 1 0 ' + gr(2 * e[2]) + ' 0a' + e[2] + ' ' + e[3] + ' 0 1 0 ' + gr(-2 * e[2]) + ' 0Z'; }).join(''); }
  var LICHTFLECKEN = lichtflecken([[6, 8, 2.6, 1.6], [27, 4, 2.2, 1.4], [32, 25, 2.4, 1.5], [9, 29, 2.8, 1.7], [-3, 18, 2, 1.3], [20, 34, 2.2, 1.4], [36, 13, 1.8, 1.2]]);
  var LICHTFLECKEN_KLEIN = lichtflecken([[11, 12, 1.8, 1.2], [24, 23, 1.6, 1.1]]);
  function kronenClip(ctx, x, y, svg) {
    var frei = [], ganz = true;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      var c = dx || dy ? zeichen(ctx, x + dx, y + dy) : 'O';
      var offen = c !== null && !BAU[c] && c !== '+' && !(c === 'F' && felsUeber(ctx, x, y, dx, dy));
      if (offen) frei.push([dx, dy]); else ganz = false;
    }
    if (ganz) return svg;
    var id = 'krone-' + (++KRONE_NR);
    return '<clipPath id="' + id + '">' + frei.map(function (q) { return '<rect x="' + q[0] * 36 + '" y="' + q[1] * 36 + '" width="36" height="36"/>'; }).join('') + '</clipPath><g clip-path="url(#' + id + ')">' + svg + '</g>';
  }
  function kronenSchatten(set, ctx, x, y) {
    var k = kachelVon(set, zeichen(ctx, x, y)); if (!k || !k.krone || !k.dach) return '';
    if (inNische(ctx, x, y)) return '<path d="' + k.dach[1] + LICHTFLECKEN_KLEIN + '" fill-rule="evenodd" fill="' + KRONENDACH.farbe + '"/>';
    return kronenClip(ctx, x, y, '<path d="' + k.dach[0] + LICHTFLECKEN + '" fill-rule="evenodd" fill="' + KRONENDACH.farbe + '"/>');
  }
  // Der Stamm über dem Schatten; in einer Nische ein junger Baum mit dünnerem Stamm
  function stammFuer(set, ctx, x, y) {
    var k = kachelVon(set, zeichen(ctx, x, y)); if (!k || !k.krone || !k.stamm) return '';
    var s = aufsatzSvg(set, k.stamm, 0, true);
    return inNische(ctx, x, y) ? '<g transform="translate(18 18) scale(.72) translate(-18 -18)">' + s + '</g>' : s;
  }
  // Moos und Farn auf dem Fels (Set 7, fels.moos, fels.farn): ein Polster auf der Seite zum Licht jedes dritten Brockens, Farn in jeder fünften
  // Fuge; über die Ränder fortlaufend wie die Brocken (das Viertel v ist um ox, oy versetzt)
  function felsMoos(st, ox, oy) {
    var m = '', h = '', f = '';
    FELS_BROCKEN.forEach(function (pt, i) {
      if (i % 3 !== 1 && !(st.farn && i % 5 === 2)) return;
      var cx = pt.reduce(function (s, p) { return s + p[0]; }, 0) / pt.length, cy = pt.reduce(function (s, p) { return s + p[1]; }, 0) / pt.length;
      [-72, 0, 72].forEach(function (dx) { [-72, 0, 72].forEach(function (dy) {
        var x = cx + dx - ox, y = cy + dy - oy;
        if (x < -9 || x > 45 || y < -9 || y > 45) return;
        if (i % 3 === 1) { m += '<ellipse cx="' + gr(x - 1.6) + '" cy="' + gr(y - 2) + '" rx="3.2" ry="1.9" transform="rotate(-25 ' + gr(x - 1.6) + ' ' + gr(y - 2) + ')"/>'; h += '<circle cx="' + gr(x - 2.6) + '" cy="' + gr(y - 2.6) + '" r=".6"/>'; }
        if (st.farn && i % 5 === 2) f += farn(gr(x + 5.6), gr(y + 5.4), 4.4, -125, st.farn, null) + farn(gr(x + 5.6), gr(y + 5.4), 4, -55, st.farn, null);
      }); });
    });
    return '<g fill="' + st.moos + '">' + m + '</g><g fill="#b3bf80">' + h + '</g>' + f;
  }
  // Seit Set 8 (Wüste): Kanten der Ebenen auf den Böden, die das Set nennt (set.hangAuf), sind von selbst ein Hang wie karte.hang: nur Schatten
  function hangVonSelbst(set, ctx, x, y) { return !!(ctx.unterWasser || (set.hangAuf && set.hangAuf.indexOf(musterFuer(set, ctx, x, y)) >= 0) || (set.schiff && set.schiff.draussen.indexOf(musterFuer(set, ctx, x, y)) >= 0)); }
  // Seit Set 9 (Gewässer): das Schiff, der Grund aus dem Wasser, die Strömung, unter Wasser
  WAND['§'] = 1; // unter Deck: was außerhalb des Rumpfs liegt (auf der Karte # , siehe karteSvg)
  // An Bord: Ein Feld gehört zum Schiff, wenn es Deck ist oder über Zeichen, die an Bord stehen können (set.schiff.anBord), am Deck hängt. Einmal je Karte geflutet.
  function bordFeld(set, ctx, x, y) {
    if (!set.schiff) return false;
    if (!ctx.bordFelder) {
      var b = ctx.bordFelder = {}, st = [], xx, yy;
      if (set.schiff.frei) { freieSchiffe(set, ctx, b); return !!b[x + ',' + y]; }
      for (yy = 1; yy <= ctx.ze; yy++) for (xx = 1; xx <= ctx.sp; xx++) if (zeichen(ctx, xx, yy) === set.schiff.deck) { b[xx + ',' + yy] = 1; st.push([xx, yy]); }
      while (st.length) { var p = st.pop(); D4.forEach(function (d) { var nx = p[0] + d[0], ny = p[1] + d[1], c = zeichen(ctx, nx, ny), key = nx + ',' + ny; if (c !== null && !b[key] && set.schiff.anBord.indexOf(c) >= 0) { b[key] = 1; st.push([nx, ny]); } }); }
    }
    return !!ctx.bordFelder[x + ',' + y];
  }
  // Ein Streifen von einem Feld Breite (Laufplanke) gehört nicht zum Rumpf: nur Deck, Nachbarn an Bord nur in einer Richtung, mindestens zwei Felder lang und an einem Ende Land oder ein Schiff; schwimmt er frei, ist er ein Boot
  function istStreifen(set, ctx, x, y) {
    if (zeichen(ctx, x, y) !== set.schiff.deck) return false;
    function b(cx, cy) { return bordFeld(set, ctx, cx, cy); }
    var we = b(x - 1, y) || b(x + 1, y), ns = b(x, y - 1) || b(x, y + 1);
    if (we === ns) return false;
    function schmal(cx, cy, dx) { return zeichen(ctx, cx, cy) === set.schiff.deck && (dx ? !b(cx, cy - 1) && !b(cx, cy + 1) : !b(cx - 1, cy) && !b(cx + 1, cy)); }
    function lauf(dx, dy) { var n = 0, cx = x + dx, cy = y + dy; while (schmal(cx, cy, dx)) { n++; cx += dx; cy += dy; } var c = zeichen(ctx, cx, cy); return { n: n, fest: c === null || (c !== '~' && c !== 'i') }; }
    var a1 = we ? lauf(-1, 0) : lauf(0, -1), a2 = we ? lauf(1, 0) : lauf(0, 1);
    return a1.n + a2.n >= 1 && (a1.fest || a2.fest);
  }
  // Die Schiffe einer Karte: je zusammenhängender Rumpf die Felder, die Lage, der Bug (Richtung des Segels: ein Eintrag beim Mast, sonst Osten oder Norden), die Ebene des Hauptdecks und der Umriss
  function schiffeVon(set, ctx) {
    if (ctx.schiffe) return ctx.schiffe;
    var liste = ctx.schiffe = [], feld = ctx.schiffFeld = {};
    if (!set.schiff) return liste;
    for (var y = 1; y <= ctx.ze; y++) for (var x = 1; x <= ctx.sp; x++) {
      if (!bordFeld(set, ctx, x, y) || feld[x + ',' + y] || istStreifen(set, ctx, x, y)) continue;
      var s = { felder: [], x0: x, x1: x, y0: y, y1: y, krieg: false }, st = [[x, y]], zaehl = {}; feld[x + ',' + y] = s;
      while (st.length) {
        var p = st.pop(), c = zeichen(ctx, p[0], p[1]); s.felder.push(p);
        s.x0 = Math.min(s.x0, p[0]); s.x1 = Math.max(s.x1, p[0]); s.y0 = Math.min(s.y0, p[1]); s.y1 = Math.max(s.y1, p[1]);
        if (c === 'x') s.krieg = true;
        if (c === set.schiff.deck) zaehl[ctx.hoehe(p[0], p[1])] = (zaehl[ctx.hoehe(p[0], p[1])] || 0) + 1;
        D4.forEach(function (d) { var nx = p[0] + d[0], ny = p[1] + d[1], key = nx + ',' + ny; if (!feld[key] && bordFeld(set, ctx, nx, ny) && !istStreifen(set, ctx, nx, ny)) { feld[key] = s; st.push([nx, ny]); } });
      }
      s.quer = s.x1 - s.x0 >= s.y1 - s.y0; s.bug = s.quer ? 90 : 0;
      s.masten = s.felder.filter(function (q) { return zeichen(ctx, q[0], q[1]) === 'O'; });
      s.boot = !s.masten.length && Math.min(s.x1 - s.x0, s.y1 - s.y0) <= 1;
      s.felder.forEach(function (q) { var e = ctx.drehung && ctx.drehung[q[0] + ',' + q[1]]; if (zeichen(ctx, q[0], q[1]) === 'O' && e !== undefined) s.bug = e; });
      s.haupt = 0; var beste = -1; Object.keys(zaehl).forEach(function (h) { if (zaehl[h] > beste) { beste = zaehl[h]; s.haupt = Number(h); } });
      s.q = rumpfPunkte(s.felder, ctx);
      liste.push(s);
    }
    return liste;
  }
  function schiffVon(set, ctx, x, y) { if (!set.schiff) return null; schiffeVon(set, ctx); return ctx.schiffFeld[x + ',' + y] || null; }
  // Der Umriss: die Außenkante der Felder (am offenen Kartenrand läuft der Rumpf hinaus), geglättet: lange Seiten bleiben gerade, Stufen werden zur Kurve (Stützpunkte einer quadratischen Kurve)
  function rumpfPunkte(felder, ctx) {
    var drin = {}, aus = {};
    function setz(x, y) { drin[x + ',' + y] = 1; }
    felder.forEach(function (p) { setz(p[0], p[1]); if (ctx.randOffen) { if (p[0] === 1) { setz(0, p[1]); setz(-1, p[1]); } if (p[0] === ctx.sp) { setz(ctx.sp + 1, p[1]); setz(ctx.sp + 2, p[1]); } if (p[1] === 1) { setz(p[0], 0); setz(p[0], -1); } if (p[1] === ctx.ze) { setz(p[0], ctx.ze + 1); setz(p[0], ctx.ze + 2); } } });
    function kante(ax, ay, bx, by) { var k = ax + ',' + ay; (aus[k] = aus[k] || []).push(bx + ',' + by); }
    Object.keys(drin).forEach(function (key) {
      var q = key.split(',').map(Number), x = q[0], y = q[1];
      if (!drin[x + ',' + (y - 1)]) kante(x - 1, y - 1, x, y - 1);
      if (!drin[(x + 1) + ',' + y]) kante(x, y - 1, x, y);
      if (!drin[x + ',' + (y + 1)]) kante(x, y, x - 1, y);
      if (!drin[(x - 1) + ',' + y]) kante(x - 1, y, x - 1, y - 1);
    });
    var beste = [], besteF = 0;
    Object.keys(aus).forEach(function (k0) {
      while (aus[k0].length) {
        var loop = [], a = k0;
        do { loop.push(a.split(',').map(Number)); a = aus[a].shift(); } while (a !== k0 && aus[a] && aus[a].length);
        var f = 0; loop.forEach(function (p, i) { var r = loop[(i + 1) % loop.length]; f += p[0] * r[1] - r[0] * p[1]; });
        if (Math.abs(f) > besteF) { besteF = Math.abs(f); beste = loop; }
      }
    });
    var ecken = beste.filter(function (p, i) { var v = beste[(i + beste.length - 1) % beste.length], n = beste[(i + 1) % beste.length]; return (p[0] - v[0]) * (n[1] - p[1]) - (p[1] - v[1]) * (n[0] - p[0]) !== 0; }), q = [];
    ecken.forEach(function (p, i) {
      var r = ecken[(i + 1) % ecken.length], L = Math.abs(r[0] - p[0]) + Math.abs(r[1] - p[1]), dx = (r[0] - p[0]) / L, dy = (r[1] - p[1]) / L;
      if (L <= 2) q.push([p[0] + dx * L / 2, p[1] + dy * L / 2]);
      else { q.push([p[0] + dx * 0.8, p[1] + dy * 0.8]); q.push([r[0] - dx * 0.8, r[1] - dy * 0.8]); }
    });
    // Ein Rumpf hat keine Dellen: Stützpunkte sind die konvexe Hülle; lange Seiten bleiben gerade, indem sie nahe den Enden je einen weiteren Punkt bekommen
    var hl = q.slice().sort(function (a, c) { return a[0] - c[0] || a[1] - c[1]; }), unten = [], oben = [];
    function kreuz(o, a, c) { return (a[0] - o[0]) * (c[1] - o[1]) - (a[1] - o[1]) * (c[0] - o[0]); }
    hl.forEach(function (p) { while (unten.length >= 2 && kreuz(unten[unten.length - 2], unten[unten.length - 1], p) <= 0) unten.pop(); unten.push(p); });
    hl.slice().reverse().forEach(function (p) { while (oben.length >= 2 && kreuz(oben[oben.length - 2], oben[oben.length - 1], p) <= 0) oben.pop(); oben.push(p); });
    var konvex = unten.slice(0, -1).concat(oben.slice(0, -1)), aus2 = [];
    konvex.forEach(function (p, i) {
      var r = konvex[(i + 1) % konvex.length], L = Math.sqrt((r[0] - p[0]) * (r[0] - p[0]) + (r[1] - p[1]) * (r[1] - p[1]));
      aus2.push(p);
      if (L > 2.4) { aus2.push([p[0] + (r[0] - p[0]) * 0.8 / L, p[1] + (r[1] - p[1]) * 0.8 / L]); aus2.push([r[0] - (r[0] - p[0]) * 0.8 / L, r[1] - (r[1] - p[1]) * 0.8 / L]); }
    });
    return aus2;
  }
  function rumpfD(s, ox, oy, sk) {
    var c = s.q, n = c.length;
    function P(p) { return gr(ox + p[0] * sk) + ' ' + gr(oy + p[1] * sk); }
    function M(i) { var a = c[(i + n) % n], b = c[(i + 1) % n]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
    var d = 'M' + P(M(n - 1));
    for (var i = 0; i < n; i++) d += 'Q' + P(c[i]) + ' ' + P(M(i));
    return d + 'Z';
  }
  // Wo der glatte Rumpf über ein Feld neben dem Deck reicht, trägt er dort den Höhenton des Decks daneben
  function rumpfEbene(set, ctx, x, y) {
    if (schiffVon(set, ctx, x, y) || ctx.hoehe(x, y) > 0) return 0;
    var h = 0; D4.forEach(function (d) { if (schiffVon(set, ctx, x + d[0], y + d[1])) h = Math.max(h, ctx.hoehe(x + d[0], y + d[1])); });
    return h;
  }
  function istDeckMuster(set, m) { var k = deckKachel(set); return m === k.muster || m === k.quer; }
  // Die Planken laufen längs des Schiffs; ein Streifen läuft mit sich selbst
  function deckMuster(set, ctx, x, y) {
    var k = deckKachel(set), s = schiffVon(set, ctx, x, y);
    if (s) return s.quer ? k.quer : k.muster;
    return bordFeld(set, ctx, x - 1, y) || bordFeld(set, ctx, x + 1, y) ? k.quer : k.muster;
  }
  // Was unter dem Rumpf liegt: tiefes oder seichtes Wasser (in den Ecken, die der glatte Rumpf freilässt)
  function wasserBei(set, ctx, x, y) {
    if (ctx.unterDeck) return 'rumpfMasse';
    var t = 0, s = 0, l = 0;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      var c = zeichen(ctx, x + dx, y + dy), kn = c === null ? null : kachelVon(set, c);
      if (c === '~') t++; else if (c === 'i' && !set.schiff.frei) s++; else if (kn && !WAND[c] && !kn.imWasser && !kn.stellt && !bordFeld(set, ctx, x + dx, y + dy)) l++;
    }
    return l > t + s || (set.schiff.frei && !t) ? set.standard : t >= s ? (ctx.unterWasser ? 'grundTief' : kachelVon(set, '~').muster) : (ctx.unterWasser ? 'grundSeicht' : 'seicht');
  }
  // Der Rumpf unter dem Deck: Schlagschatten, Ruder und Vorsteven, die Bordwand nach Süden (wie bei einer gebauten Wand, der Rumpf um h versetzt), die Deckfläche
  function schiffBasis(set, ctx, ox, oy, sk, pm) {
    var u = sk / 36, o = '', clip = '', schiffe = schiffeVon(set, ctx);
    if (!schiffe.length) return '';
    schiffe.forEach(function (s) {
      var id = 'krone-' + (++KRONE_NR), d = rumpfD(s, ox, oy, sk), h = gr((s.boot ? 3.5 : 7) * u), deck = s.quer ? deckKachel(set).quer : deckKachel(set).muster;
      s.pid = id; clip += '<use href="#' + id + '"/>';
      function nutz(attr) { return '<use href="#' + id + '" ' + attr + '/>'; }
      o += '<defs><path id="' + id + '" d="' + d + '"/><clipPath id="' + id + 'c"><use href="#' + id + '"/></clipPath></defs>';
      function flaechen() {
        if (pm) return nutz('fill="url(#' + pm + deck + ')"');
        var f = '';
        for (var cy = Math.max(1, s.y0 - 1); cy <= Math.min(ctx.ze, s.y1 + 1); cy++) for (var cx = Math.max(1, s.x0 - 1); cx <= Math.min(ctx.sp, s.x1 + 1); cx++) f += '<g transform="translate(' + (cx - 1) * 36 + ' ' + (cy - 1) * 36 + ')">' + bild(set, deck, 0) + '</g>';
        return '<g clip-path="url(#' + id + 'c)">' + f + '</g>';
      }
      // Unter Deck sieht man nur den Boden, etwas dunkler, die Wand kommt mit schiffReling
      if (ctx.unterDeck) { o += flaechen() + nutz('fill="#2a2119" opacity=".2"'); return; }
      o += nutz('transform="translate(' + gr((s.boot ? 3 : 6) * u) + ' ' + gr((s.boot ? 5 : 10) * u) + ')" fill="#2a2119" opacity=".26"');
      // Ruder am Heck, Vorsteven und Bugspriet am Bug: am äußersten Punkt des Rumpfs in Fahrtrichtung; ein offenes Boot hat statt dessen Riemen an seinen Bänken
      var r = ((s.bug % 360) + 360) % 360, vorn = D4[r / 90], ende = function (sgn) { var best = null, wert = -Infinity; s.felder.forEach(function (p) { var w = sgn * (p[0] * vorn[0] + p[1] * vorn[1]); if (w > wert) { wert = w; best = [p]; } else if (w === wert) best.push(p); }); var mx = 0, my = 0; best.forEach(function (p) { mx += p[0] - 0.5; my += p[1] - 0.5; }); return [mx / best.length + sgn * vorn[0] * 0.5, my / best.length + sgn * vorn[1] * 0.5]; };
      if (s.boot) {
        var seit = [vorn[1], -vorn[0]], halb = (s.quer ? s.y1 - s.y0 + 1 : s.x1 - s.x0 + 1) / 2, mx = (s.x0 - 1 + s.x1) / 2, my = (s.y0 - 1 + s.y1) / 2, gesehen = {};
        s.felder.forEach(function (p) {
          if (zeichen(ctx, p[0], p[1]) !== 'b') return;
          var la = s.quer ? p[0] : p[1]; if (gesehen[la]) return; gesehen[la] = 1;
          [1, -1].forEach(function (sg) {
            var ax = (s.quer ? p[0] - 0.5 : mx) + sg * seit[0] * (halb - 0.14), ay = (s.quer ? my : p[1] - 0.5) + sg * seit[1] * (halb - 0.14), bx = ax + sg * seit[0] * 0.92 - vorn[0] * 0.34, by = ay + sg * seit[1] * 0.92 - vorn[1] * 0.34, cx = ax + (bx - ax) * 0.68, cy = ay + (by - ay) * 0.68;
            function P(q, w) { return gr(ox + q * sk) + ' ' + gr(oy + w * sk); }
            o += '<path d="M' + P(ax, ay) + 'L' + P(bx, by) + '" stroke="#3b3028" stroke-width="' + gr(2.8 * u) + '" stroke-linecap="round"/><path d="M' + P(cx, cy) + 'L' + P(bx, by) + '" stroke="#3b3028" stroke-width="' + gr(5.2 * u) + '" stroke-linecap="round"/><path d="M' + P(ax, ay) + 'L' + P(bx, by) + '" stroke="#a5855c" stroke-width="' + gr(1.3 * u) + '" stroke-linecap="round"/><path d="M' + P(cx, cy) + 'L' + P(bx, by) + '" stroke="#8f6f4a" stroke-width="' + gr(3.4 * u) + '" stroke-linecap="round"/>';
          });
        });
      } else {
        var b = ende(1), a = ende(-1), trans = function (p) { return 'translate(' + gr(ox + p[0] * sk) + ' ' + gr(oy + p[1] * sk + 7 * u) + ') rotate(' + r + ') scale(' + gr(u * 100) / 100 + ')'; };
        o += '<g transform="' + trans(a) + '"><path d="M-2 -8H2L3.4 28L-3.4 28Z" fill="#6f5236" stroke="#3b3028" stroke-width="1.1" stroke-linejoin="round"/><path d="M0 -6V25" stroke="#a5855c" stroke-width=".8"/></g>';
        o += '<g transform="' + trans(b) + '"><path d="M0 10V-34" stroke="#3b3028" stroke-width="3.6" stroke-linecap="round"/><path d="M0 10V-34" stroke="#8f6f4a" stroke-width="1.9" stroke-linecap="round"/><path d="M-3.6 7L0 -9L3.6 7Z" fill="#6f5236" stroke="#3b3028" stroke-width="1.1" stroke-linejoin="round"/></g>';
      }
      // Bordwand: der Rumpf nach unten versetzt, mit Plankengängen und den Köpfen der Deckbalken, die durch die Bordwand treten
      o += nutz('transform="translate(0 ' + h + ')" fill="' + GW.rumpf + '" stroke="#3b3028" stroke-width="' + gr(1.3 * u) + '" stroke-linejoin="round"');
      if (!s.boot) {
        o += nutz('transform="translate(0 ' + gr(2.4 * u) + ')" fill="none" stroke="' + GW.rumpfFuge + '" stroke-width="' + gr(0.8 * u) + '"') + nutz('transform="translate(0 ' + gr(4.8 * u) + ')" fill="none" stroke="' + GW.rumpfFuge + '" stroke-width="' + gr(0.8 * u) + '"');
        o += nutz('transform="translate(0 ' + gr(3.6 * u) + ')" fill="none" stroke="#2c2015" stroke-width="' + gr(2.8 * u) + '" stroke-dasharray="' + gr(2.8 * u) + ' ' + gr(60 * u) + '"');
      }
      o += flaechen();
    });
    ctx.schiffClip = 'krone-' + (++KRONE_NR);
    o = '<defs></defs>' + o + '<clipPath id="' + ctx.schiffClip + '">' + clip + '</clipPath>';
    return kartenClip(ctx, ox, oy, sk, o);
  }
  // Am offenen Kartenrand endet das Schiff am Raster
  function kartenClip(ctx, ox, oy, sk, inhalt) {
    if (!ctx.randOffen) return inhalt;
    var id = 'krone-' + (++KRONE_NR);
    return '<clipPath id="' + id + '"><rect x="' + ox + '" y="' + oy + '" width="' + ctx.sp * sk + '" height="' + ctx.ze * sk + '"/></clipPath><g clip-path="url(#' + id + ')">' + inhalt + '</g>';
  }
  // Die Reling folgt dem Rumpf, darüber bei Kriegsschiffen auf den Kastellen die Zinnen; dazu die Pinne am Ruder
  // Zinnen trägt das Kastell (drei Ebenen über dem Hauptdeck); auf einem Kriegsschiff alles, was über dem Hauptdeck liegt
  function zinnenAuf(s, h) { return h > s.haupt && (s.krieg || h >= s.haupt + 3); }
  function schiffReling(set, ctx, ox, oy, sk) {
    var u = sk / 36, o = '';
    schiffeVon(set, ctx).forEach(function (s) {
      function nutz(attr) { return '<use href="#' + s.pid + '" fill="none" stroke-linejoin="round" ' + attr + '/>'; }
      // Unter Deck ist die Bordwand die Wand: von innen die Spanten, außen der Rumpf
      if (ctx.unterDeck) { o += '<g clip-path="url(#' + s.pid + 'c)">' + nutz('stroke="' + GW.relingDunkel + '" stroke-width="' + gr(20 * u) + '" stroke-dasharray="' + gr(5 * u) + ' ' + gr(19 * u) + '"') + nutz('stroke="' + GW.reling + '" stroke-width="' + gr(17 * u) + '" stroke-dasharray="' + gr(3 * u) + ' ' + gr(21 * u) + '" stroke-dashoffset="' + gr(-1 * u) + '"') + '</g>' + nutz('stroke="#3b3028" stroke-width="' + gr(8 * u) + '"') + nutz('stroke="' + GW.rumpf + '" stroke-width="' + gr(5.6 * u) + '"'); return; }
      // Ein offenes Boot hat nur ein schmales Dollbord
      if (s.boot) { o += nutz('stroke="#3b3028" stroke-width="' + gr(3.8 * u) + '"') + nutz('stroke="' + GW.reling + '" stroke-width="' + gr(2.4 * u) + '"') + nutz('stroke="' + GW.relingLicht + '" stroke-width="' + gr(0.7 * u) + '"'); return; }
      o += nutz('stroke="#3b3028" stroke-width="' + gr(5.8 * u) + '"') + nutz('stroke="' + GW.reling + '" stroke-width="' + gr(4 * u) + '"') + nutz('stroke="' + GW.relingLicht + '" stroke-width="' + gr(1 * u) + '"') + nutz('stroke="' + GW.relingDunkel + '" stroke-width="' + gr(4 * u) + '" stroke-dasharray="' + gr(1.6 * u) + ' ' + gr(13 * u) + '"');
      {
        var kast = ''; s.felder.forEach(function (p) { if (zinnenAuf(s, ctx.hoehe(p[0], p[1]))) kast += '<rect x="' + gr(ox + (p[0] - 1) * sk) + '" y="' + gr(oy + (p[1] - 1) * sk) + '" width="' + sk + '" height="' + sk + '"/>'; });
        if (kast) { var id = 'krone-' + (++KRONE_NR); o += '<clipPath id="' + id + '">' + kast + '</clipPath><g clip-path="url(#' + id + ')">' + nutz('stroke="#c7ad82" stroke-width="' + gr(3.6 * u) + '" stroke-dasharray="' + gr(4 * u) + ' ' + gr(3.6 * u) + '"') + '</g>'; }
      }
    });
    return o ? kartenClip(ctx, ox, oy, sk, o) : '';
  }
  // Das Segel ist eine Krone: gesperrt ist nur das Feld mit dem Mast, darunter geht man hindurch, es gibt keine Deckung, die Spielsteine liegen obenauf. Die Rahe des Hauptmasts ist 1,7-mal so lang wie das Schiff dort breit
  // (Kogge: 185 m² Segel bei gut 7 m Breite), die der anderen Masten 1,4-mal; die Tiefe lässt Platz bis zum nächsten Mast. Die Takelage läuft zu Bug, Heck, Reling und zum nächsten Mast. Es endet nur am Kartenrand, denn es hängt höher als alles an Bord.
  function segelKrone(set, ctx, x, y) {
    var s = schiffVon(set, ctx, x, y) || { bug: 90, krieg: false, quer: true, masten: [[x, y]], x0: x, x1: x, y0: y, y1: y }, e = ctx.drehung && ctx.drehung[x + ',' + y], r = e !== undefined ? e : s.bug, v = D4[(((r % 360) + 360) % 360) / 90];
    function lauf(dx, dy) { var n = 0, cx = x + dx, cy = y + dy; while (bordFeld(set, ctx, cx, cy)) { n++; cx += dx; cy += dy; } return n; }
    function bisMast(dx, dy) { var n = 0, cx = x + dx, cy = y + dy; while (bordFeld(set, ctx, cx, cy)) { n++; if (zeichen(ctx, cx, cy) === 'O') return { n: n, mast: true }; cx += dx; cy += dy; } return { n: n, mast: false }; }
    var vor = bisMast(v[0], v[1]), hinter = bisMast(-v[0], -v[1]), breit = lauf(v[1], -v[0]) + lauf(-v[1], v[0]) + 1;
    var mx = (s.x0 + s.x1) / 2, my = (s.y0 + s.y1) / 2, haupt = null, abst = Infinity;
    s.masten.forEach(function (q) { var a = Math.abs(q[0] - mx) + Math.abs(q[1] - my); if (a < abst) { abst = a; haupt = q; } });
    var istHaupt = !haupt || (haupt[0] === x && haupt[1] === y);
    var teile = segelTeile(breit, vor.n, hinter.n, s.krieg, !!(ctx.gerefft && ctx.gerefft[x + ',' + y]), istHaupt ? 1.7 : 1.4, (vor.mast ? 0.55 : 0.8) * vor.n * 36, s.krieg && istHaupt);
    var id = 'krone-' + (++KRONE_NR), bid = 'krone-' + (++KRONE_NR);
    return '<clipPath id="' + id + '"><rect x="' + (-(x - 1) * 36) + '" y="' + (-(y - 1) * 36) + '" width="' + ctx.sp * 36 + '" height="' + ctx.ze * 36 + '"/></clipPath><g clip-path="url(#' + id + ')"><g transform="translate(6 7)" fill="#2a2119" opacity=".16"><g transform="rotate(' + r + ' 18 18)">' + teile.schatten + '</g></g><g transform="rotate(' + r + ' 18 18)">' + teile.form.replace(/SEGELCLIP/g, bid) + '</g></g>';
  }
  // Die Luke: eine Leiter mitten auf dem Deck, ringsum dieselbe Höhe; sie führt hinab auf das Unterdeck, eine eigene Karte. Unter Deck nennt die Karte sie (luken: [[x, y]]), sonst führt die Leiter hinauf.
  function istLuke(set, ctx, x, y) {
    if (ctx.unterDeck) return !!(ctx.luken && ctx.luken[x + ',' + y]);
    var h0 = ctx.hoehe(x, y), ja = true;
    D4.forEach(function (d) { if (!bordFeld(set, ctx, x + d[0], y + d[1]) || ctx.hoehe(x + d[0], y + d[1]) !== h0) ja = false; });
    return ja;
  }
  // Wie der Fallreep liegt: hinauf zum höheren Deck; ein tieferes Deck gegenüber geht vor, sonst das Wasser
  function fallreepDrehung(set, ctx, x, y) {
    var e = ctx.drehung && ctx.drehung[x + ',' + y]; if (e !== undefined) return e;
    var h0 = ctx.hoehe(x, y), r = -1;
    D4.forEach(function (d, i) { if (r < 0 && bordFeld(set, ctx, x + d[0], y + d[1]) && bordFeld(set, ctx, x - d[0], y - d[1]) && zeichen(ctx, x - d[0], y - d[1]) !== '/' && ctx.hoehe(x - d[0], y - d[1]) < h0 && ctx.hoehe(x + d[0], y + d[1]) >= h0) r = i; });
    if (r < 0) D4.forEach(function (d, i) { if (r < 0 && bordFeld(set, ctx, x + d[0], y + d[1]) && !bordFeld(set, ctx, x - d[0], y - d[1])) r = i; });
    return r < 0 ? 0 : r * 90;
  }
  // Was an Bord anders zeichnet: der Mast (die Krone kommt später; unter Wasser der Stumpf), das Fallreep, die Ballista (vier Felder im Block sind eine große: DMG, groß), Tauwerk
  function anBordFuer(set, ctx, x, y, k) {
    var e = ctx.drehung && ctx.drehung[x + ',' + y], s = schiffVon(set, ctx, x, y), bug = s ? s.bug : 90;
    if (k.krone) return ctx.unterWasser && k.anBord.unten ? aufsatzSvg(set, k.anBord.unten, e !== undefined ? e : bug, true) : ctx.unterDeck ? aufsatzSvg(set, 'mastfuss', 0, false) : '';
    if (k.code === '/') return istLuke(set, ctx, x, y) ? aufsatzSvg(set, 'luke', 0, false) : aufsatzSvg(set, k.anBord.aufsatz, fallreepDrehung(set, ctx, x, y), true);
    if (k.code === 'x') {
      function g(dx, dy) { return zeichen(ctx, x + dx, y + dy) === 'x'; }
      var r = e !== undefined ? e : bug;
      if (g(1, 0) && g(0, 1) && g(1, 1)) return '<g transform="translate(36 36) scale(2) translate(-18 -18)">' + aufsatzSvg(set, k.anBord.aufsatz, r, true) + '</g>';
      if ((g(-1, 0) && g(0, 1) && g(-1, 1)) || (g(0, -1) && g(1, 0) && g(1, -1)) || (g(-1, 0) && g(0, -1) && g(-1, -1))) return '';
      return aufsatzSvg(set, k.anBord.aufsatz, r, true);
    }
    return aufsatzSvg(set, k.anBord.aufsatz, e !== undefined ? e : 0, true);
  }
  // Grund draußen in einem Set mit Schiff: an Bord das Deck; sonst, was ringsum überwiegt: Wasser oder der Standardgrund
  function grundDraussen(set, ctx, x, y) { return bordFeld(set, ctx, x, y) ? deckMuster(set, ctx, x, y) : wasserBei(set, ctx, x, y); }
  // Gischt am Fuß des Riffs, nur wo er im Wasser steht
  function gischtAuf(st, g) { return !!(st.gischt && g && st.gischtAuf.indexOf(g) >= 0); }
  function draussenAuf(set, m) { return m === set.standard || !!(set.schiff && set.schiff.draussen.indexOf(m) >= 0); }
  // Das Deck: Die Außenkante zeichnet der Rumpf; aus Vierteln kommt die Reling an den Kanten zwischen den Ebenen (Achterdeck zum Hauptdeck, Poop zum Achterdeck, Kastell zur Poop) und die Laufplanke.
  // Eine Kante hat das höhere Feld, außer wo eine Treppe sie öffnet; nach Süden sieht man dort wie bei einer gebauten Wand die Bordwand.
  function deckViertel(set, ctx, x, y, k) {
    var s = schiffVon(set, ctx, x, y);
    if (!s) return viertel(k.stueck, viertelZustaende(ctx, x, y, function (c2, nx, ny) { return bordFeld(set, ctx, nx, ny); }));
    var h0 = ctx.hoehe(x, y), z = zinnenAuf(s, h0);
    function offen(dx, dy) { var nx = x + dx, ny = y + dy; return bordFeld(set, ctx, nx, ny) && ctx.hoehe(nx, ny) < h0 && zeichen(ctx, nx, ny) !== '/' && zeichen(ctx, x, y) !== '/'; }
    var o = '';
    for (var q = 0; q < 4; q++) {
      var a = D4[q], b = D4[(q + 3) % 4], n = offen(a[0], a[1]), w = offen(b[0], b[1]), teil = '';
      if (n) teil += q === 2 ? k.stueck('oben', null, true, z) : k.stueck('oben', null, false, z);
      if (w) teil += q === 3 ? '<g transform="matrix(0 1 1 0 0 0)">' + k.stueck('oben', null, true, z) + '</g>' : k.stueck('links', null, false, z);
      if (teil) o += '<g transform="rotate(' + q * 90 + ' 18 18)">' + teil + '</g>';
    }
    return o;
  }
  // Was an einer Kante zwischen den Ebenen steht (Fass, Kiste, Mast), ändert nichts an ihr; unter Wänden, Treppen und auf Dielen läuft sie nicht
  function relingFuer(set, ctx, x, y) {
    if (!set.schiff || !bordFeld(set, ctx, x, y)) return '';
    var c = zeichen(ctx, x, y);
    if (c === set.schiff.deck || c === '/' || WAND[c] || !istDeckMuster(set, musterFuer(set, ctx, x, y))) return '';
    return deckViertel(set, ctx, x, y, deckKachel(set));
  }
  // Strömung (karte.stroemung: [[x, y, Richtung]], 0 Norden, 90 Osten, 180 Süden, 270 Westen): drei Linien in Fließrichtung, ein Winkel zeigt, wohin;
  // wo die Strömung aus einem Nachbarn von der Seite kommt, biegen die Linien; nur Zeichnung, keine Regel. Am Anfang und am Ende (im Feld) enden die Linien vor dem Rand.
  var STROM_FARBE = '#c4e0de';
  function stromFuer(S, ctx, x, y) {
    if (!S.stroemung) return '';
    if (!ctx.strom) { ctx.strom = {}; S.stroemung.forEach(function (e) { ctx.strom[e[0] + ',' + e[1]] = e[2]; }); }
    var r = ctx.strom[x + ',' + y]; if (r === undefined) return '';
    var von = null, weiter = false, d = D4[r / 90], nach = ctx.strom[(x + d[0]) + ',' + (y + d[1])];
    if (nach !== undefined || zeichen(ctx, x + d[0], y + d[1]) === null) weiter = true;
    D4.forEach(function (a) { var n = ctx.strom[(x + a[0]) + ',' + (y + a[1])]; if (n !== undefined && D4[n / 90][0] === -a[0] && D4[n / 90][1] === -a[1]) { if (von === null || n === r) von = n; } });
    var kommt = von !== null || zeichen(ctx, x - d[0], y - d[1]) === null;
    var strich = ' fill="none" stroke="' + STROM_FARBE + '" stroke-width="1.3" stroke-linecap="round"';
    if (von !== null && von !== r) {
      var rechts = (r - von + 360) % 360 === 90;
      return '<g transform="rotate(' + von + ' 18 18)' + (rechts ? '' : ' translate(36 0) scale(-1 1)') + '"><path d="M28 36A8 8 0 0 1 ' + (weiter ? '36 28' : '33 28.6') + 'M18 36A18 18 0 0 1 ' + (weiter ? '36 18' : '33 18.6') + 'M8 36A28 28 0 0 1 ' + (weiter ? '36 8' : '33 8.2') + '"' + strich + '/><path d="M-3.4 2L0-2L3.4 2" transform="translate(23.3 23.3) rotate(45)"' + strich + ' stroke-linejoin="round"/></g>';
    }
    var o = weiter ? 0 : 3, u = kommt ? 36 : 33;
    return '<g transform="rotate(' + r + ' 18 18)"><path d="M8 ' + o + 'V' + u + 'M18 ' + o + 'V' + u + 'M28 ' + o + 'V' + u + '"' + strich + '/><path d="M14.6 20.6L18 16.6L21.4 20.6"' + strich + ' stroke-linejoin="round"/></g>';
  }
  // Das Blatt „Die Schiffe“: alle Größen im selben Maßstab als Knöpfe, darunter die gewählte als Karte mit ihren Ansichten und Zeilen
  function schiffUmriss(pl) {
    var q = [], g = 5, sk = g; for (var y = 1; y <= pl.b; y++) for (var c = 1; c <= pl.l; c++) if (pl.boden[y - 1][c - 1] !== '~') q.push([c, y]);
    var d = rumpfD({ q: rumpfPunkte(q, { randOffen: false }) }, 0, 0, sk), li = '';
    [pl.a2, pl.a3, pl.k4].forEach(function (a) { if (a) li += 'M' + a * sk + ' 0V' + pl.b * sk; });
    var cid = 'krone-' + (++KRONE_NR), W2 = pl.l * sk, H2 = pl.b * sk;
    return '<svg width="' + W2 + '" height="' + H2 + '" viewBox="-1 -1 ' + (W2 + 2) + ' ' + (H2 + 2) + '" aria-hidden="true" style="display:block;margin:0 auto 2px;background:none;border:0"><clipPath id="' + cid + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="' + GW.planke[0] + '" stroke="' + GW.reling + '" stroke-width="1.2"/>' + (li ? '<path d="' + li + '" stroke="' + GW.reling + '" stroke-width=".8" clip-path="url(#' + cid + ')"/>' : '') + (pl.k4 ? '<rect width="' + pl.k4 * sk + '" height="' + H2 + '" fill="' + GW.reling + '" clip-path="url(#' + cid + ')"/>' : '') + pl.masten.map(function (ma) { return '<circle cx="' + (ma[0] - 0.5) * sk + '" cy="' + (ma[1] - 0.5) * sk + '" r="1.6" fill="#3b3028"/>'; }).join('') + '</svg>';
  }
  function schiffsblattHtml(set, id) {
    var o = '<h3 class="gruppe">Die Schiffe</h3><p>' + set.schiffsblatt.text + '</p><div id="schiffe-' + id + '">';
    SCHIFFSKLASSEN.forEach(function (kl) {
      o += '<p style="margin:12px 0 4px"><b>' + kl.name + '</b></p><div class="werk" style="display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end">';
      kl.groessen.forEach(function (g) { o += '<button type="button" data-schiff="' + g[0] + 'x' + g[1] + '" aria-pressed="false" style="padding:4px 8px">' + schiffUmriss(schiffBau(g[0], g[1])) + g[0] + ' × ' + g[1] + '</button>'; });
      o += '</div>';
    });
    return o + '<div class="werk" data-schiffansicht style="display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 6px"></div><p data-schifftext style="margin:4px 0 6px"></p><div class="skizze" data-schiffkarte></div><details style="margin-top:6px"><summary>Zeilen für die Kampfkarte</summary><pre data-schiffzeilen style="overflow:auto;max-width:100%"></pre></details></div>';
  }
  function schiffAnsichten(pl) {
    var a = [];
    if (!pl.decks) return [['segel', 'Boot']];
    a.push(['segel', 'Segel gesetzt'], ['gerefft', 'Segel gerefft'], ['krieg', 'Kriegsschiff'], ['kriegGerefft', 'Kriegsschiff, gerefft']);
    pl.unten.forEach(function (u, i) { a.push([i, u.titel]); });
    return a;
  }
  function schiffBeschreibung(pl) {
    var m = function (f) { return String(f * 1.5).replace('.', ','); }, t = pl.l + ' × ' + pl.b + ' Felder (' + m(pl.l) + ' m × ' + m(pl.b) + ' m): ';
    if (!pl.decks) return t + 'offenes Boot mit Bänken und Riemen, ohne Deck und Segel.';
    if (pl.decks === 1) return t + 'ein Deck, ein Segel.';
    if (pl.decks === 2) return t + 'zwei Decks, zwei Segel. Auf der Karte das Hauptdeck und achtern das Achterdeck +3 m; darunter das Unterdeck als eigene Karte.';
    return t + 'drei Decks, drei Segel. Auf der Karte das Hauptdeck, das Achterdeck +3 m und die Poop +4,5 m' + (pl.kastell ? ', am Heck dazu das Kastell +6 m mit Zinnen' : '') + '; darunter Mitteldeck und Unterdeck als eigene Karten.';
  }
  function schiffsblattAn(set, id) {
    var w = document.getElementById('schiffe-' + id); if (!w) return;
    var aktiv = '18x7', ans = 'segel';
    function zeichne() {
      var g = aktiv.split('x').map(Number), pl = schiffBau(g[0], g[1]), liste = schiffAnsichten(pl);
      if (!liste.some(function (a) { return a[0] === ans; })) ans = liste[0][0];
      w.querySelectorAll('[data-schiff]').forEach(function (bt) { bt.setAttribute('aria-pressed', bt.dataset.schiff === aktiv ? 'true' : 'false'); });
      w.querySelector('[data-schiffansicht]').innerHTML = liste.map(function (a) { return '<button type="button" data-ans="' + a[0] + '" aria-pressed="' + (a[0] === ans) + '">' + a[1] + '</button>'; }).join('');
      var rx = 2, ry = Math.max(1, Math.ceil(0.35 * pl.b + 0.2)), krieg = ans === 'krieg' || ans === 'kriegGerefft', S = schiffKarte(pl, ans === 'kriegGerefft' ? 'krieg' : ans, typeof ans === 'number' ? 1 : rx, typeof ans === 'number' ? 1 : ry, ans === 'kriegGerefft');
      w.querySelector('[data-schifftext]').textContent = schiffBeschreibung(pl) + (krieg ? ' Mit Ballisten ein Kriegsschiff: Zinnen auf allem, was über dem Hauptdeck liegt, im Hauptmast das Krähennest.' : '');
      var br = 26 * S.boden[0].length;
      w.querySelector('[data-schiffkarte]').innerHTML = probeKarteSvg(set, Object.assign({ titel: aktiv }, S), null, br).replace('<svg ', '<svg style="max-width:100%;height:auto" ');
      var zeilen = ['boden: ' + JSON.stringify(S.boden), 'hoehe: ' + JSON.stringify(S.hoehe)];
      if (Object.keys(S.drehung).length) zeilen.push('drehung: ' + JSON.stringify(S.drehung));
      if (S.gerefft) zeilen.push('gerefft: ' + JSON.stringify(S.gerefft));
      if (S.unterDeck) zeilen.push('unterDeck: true', 'luken: ' + JSON.stringify(S.luken));
      w.querySelector('[data-schiffzeilen]').textContent = zeilen.join(',\n');
    }
    w.addEventListener('click', function (ev) {
      var bt = ev.target.closest('button'); if (!bt) return;
      if (bt.dataset.schiff) { aktiv = bt.dataset.schiff; zeichne(); }
      else if (bt.dataset.ans !== undefined) { ans = /^\d+$/.test(bt.dataset.ans) ? Number(bt.dataset.ans) : bt.dataset.ans; zeichne(); }
    });
    zeichne();
  }
  // Seit Set 10 (Stadt): Häuser von oben (Max, 2.11., b + c). Gebaute Wand, die mindestens zwei Felder tief und breit steht, ist ein Block: ein Haus, das niemand betritt,
  // gesperrte Masse unter einem Dach. Räume mit Innenboden, die die Figur im Kampf nicht sieht, tragen dasselbe Dach; es verschwindet, sobald sie hineinsieht.
  // Nur wo das Set es einschaltet (set.haeuser); das Material folgt dem Zeichen der Wand.
  function dachTon(hex, t) {
    if (!t) return hex;
    var n = parseInt(hex.slice(1), 16), a = [n >> 16, (n >> 8) & 255, n & 255].map(function (w) { return Math.max(0, Math.min(255, Math.round(t > 0 ? w + (255 - w) * t : w * (1 + t)))); });
    return '#' + a.map(function (w) { return (w < 16 ? '0' : '') + w.toString(16); }).join('');
  }
  function dachHash(x, y) { var h = (x * 73856093 ^ y * 19349663) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; }
  // Felder in Rechtecke zerlegen, das größte zuerst
  function dachRechtecke(felder) {
    var rest = Object.assign({}, felder), out = [];
    function da(x, y) { return !!rest[x + ',' + y]; }
    while (Object.keys(rest).length) {
      var best = null;
      Object.keys(rest).forEach(function (key) {
        var p = key.split(',').map(Number), breit = Infinity;
        for (var y = p[1]; da(p[0], y); y++) {
          var b = 0; while (da(p[0] + b, y)) b++;
          breit = Math.min(breit, b);
          var fl = breit * (y - p[1] + 1);
          if (!best || fl > best.fl || (fl === best.fl && (p[1] < best.y0 || (p[1] === best.y0 && p[0] < best.x0)))) best = { fl: fl, x0: p[0], y0: p[1], x1: p[0] + breit - 1, y1: y };
        }
      });
      for (var y = best.y0; y <= best.y1; y++) for (var x = best.x0; x <= best.x1; x++) delete rest[x + ',' + y];
      out.push(best);
    }
    return out;
  }
  // Eine Länge in Häuser teilen, jedes zwischen klein und gross, nach einer festen Folge
  function dachLaengen(L, klein, gross, folge, i) {
    var o = [], rest = L;
    while (rest > 0) {
      var w = Math.min(folge[i++ % folge.length], rest), danach = rest - w;
      if (danach > 0 && danach < klein) { if (w + danach <= gross) w += danach; else w -= klein - danach; }
      o.push(w); rest -= w;
    }
    return o;
  }
  // Ein Block in Häuser: bis 6 Felder breit ein Haus; breiter teilt er sich längs der Breite, ab 4 Feldern Tiefe in Häuser von 3 bis 6 Feldern, flacher von 5 bis 8.
  // Der First läuft längs der längeren Seite, bei gleichen Seiten von Nord nach Süd; ein schmaler, langer Block teilt sich längs der Tiefe.
  function dachTeilen(r) {
    var b = r.x1 - r.x0 + 1, h = r.y1 - r.y0 + 1, out = [], start = dachHash(r.x0, r.y0);
    function firstVon(w, t) { return w > t ? 'ow' : 'ns'; }
    function quer(liste) { var x = r.x0; liste.forEach(function (w) { out.push({ x0: x, y0: r.y0, x1: x + w - 1, y1: r.y1, first: firstVon(w, h) }); x += w; }); }
    function laengs(liste) { var y = r.y0; liste.forEach(function (w) { out.push({ x0: r.x0, y0: y, x1: r.x1, y1: y + w - 1, first: firstVon(b, w) }); y += w; }); }
    if (b > 6) quer(h >= 4 ? dachLaengen(b, 3, 6, [4, 5, 3, 6, 4, 5], start) : dachLaengen(b, 5, 8, [6, 5, 8, 7], start));
    else if (h > (b <= 3 ? 8 : 13)) laengs(dachLaengen(h, 5, b <= 3 ? 8 : 13, b <= 3 ? [6, 5, 8, 7] : [9, 11, 8, 10], start));
    else quer([b]);
    return out;
  }
  // Der Plan der Häuser einer Karte, einmal je Karte: Räume mit ihren Dächern und Blöcke
  function hausplan(set, ctx) {
    if (ctx.hausplanFertig) return ctx.hausplan;
    ctx.hausplanFertig = true; ctx.hausplan = null;
    if (!set.haeuser) return null;
    var plan = { block: {}, bloecke: [], raeume: [] }, raumWand = {}, y, x;
    function codeVon(r) { var z = {}, best = '#', bw = 0; for (var yy = r.y0; yy <= r.y1; yy++) for (var xx = r.x0; xx <= r.x1; xx++) { var c = zeichen(ctx, xx, yy); if (BAU[c]) { z[c] = (z[c] || 0) + 1; if (z[c] > bw) { bw = z[c]; best = c; } } } return best; }
    // Räume: was keine Wand und keine Tür ist und vom Kartenrand aus nicht zu erreichen; nur mit Innenboden, ein Hof bekommt kein Dach. Türen verbinden Räume zu einem Haus.
    var draussen = {}, st = [];
    for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) if ((x === 1 || y === 1 || x === ctx.sp || y === ctx.ze) && !WAND[zeichen(ctx, x, y)] && zeichen(ctx, x, y) !== '+' && !istInnen(set, ctx, x, y)) { draussen[x + ',' + y] = 1; st.push([x, y]); }
    while (st.length) { var p = st.pop(); D4.forEach(function (d) { var nx = p[0] + d[0], ny = p[1] + d[1], c = zeichen(ctx, nx, ny), key = nx + ',' + ny; if (c === null || draussen[key] || WAND[c] || c === '+') return; draussen[key] = 1; st.push([nx, ny]); }); }
    var gesehen = {};
    for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) {
      var c0 = zeichen(ctx, x, y), k0 = x + ',' + y;
      if (WAND[c0] || c0 === '+' || draussen[k0] || gesehen[k0]) continue;
      var raum = {}, innen = false, s2 = [[x, y]]; gesehen[k0] = 1;
      while (s2.length) {
        var q = s2.pop(), kq = q[0] + ',' + q[1];
        if (zeichen(ctx, q[0], q[1]) !== '+') { raum[kq] = 1; if (istInnen(set, ctx, q[0], q[1])) innen = true; }
        D4.forEach(function (d) { var nx = q[0] + d[0], ny = q[1] + d[1], c = zeichen(ctx, nx, ny), key = nx + ',' + ny; if (c === null || gesehen[key] || WAND[c] || draussen[key]) return; gesehen[key] = 1; s2.push([nx, ny]); });
      }
      if (!innen) continue;
      // Das Dach deckt die Räume, die Türen und die Wände ringsum
      var flaeche = {}, tueren = {};
      Object.keys(raum).forEach(function (key) { var pq = key.split(',').map(Number); for (var ay = -1; ay <= 1; ay++) for (var ax = -1; ax <= 1; ax++) { var nx = pq[0] + ax, ny = pq[1] + ay, c = zeichen(ctx, nx, ny), kn = nx + ',' + ny; if (c === null) continue; if (BAU[c]) { flaeche[kn] = 1; raumWand[kn] = 1; } else if (c === '+') { flaeche[kn] = 1; tueren[kn] = 1; } else if (!ax && !ay) flaeche[kn] = 1; else if (raum[kn]) flaeche[kn] = 1; } });
      plan.raeume.push({ felder: raum, tueren: tueren, teile: dachRechtecke(flaeche).map(function (r) { return { x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1, first: r.x1 - r.x0 > r.y1 - r.y0 ? 'ow' : 'ns', code: codeVon(r) }; }) });
    }
    // Blöcke: 2 × 2 gebaute Felder, die keine Wand eines Raums sind; je Zeichen für sich, denn wo das Zeichen wechselt, beginnt ein Haus
    function bau(fx, fy) { var c = zeichen(ctx, fx, fy); return c !== null && !!BAU[c] && !raumWand[fx + ',' + fy]; }
    for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) {
      if (!bau(x, y)) continue;
      for (var dy = -1; dy <= 0; dy++) for (var dx = -1; dx <= 0; dx++) if (bau(x + dx, y + dy) && bau(x + dx + 1, y + dy) && bau(x + dx, y + dy + 1) && bau(x + dx + 1, y + dy + 1)) plan.block[x + ',' + y] = 1;
    }
    ['#', 'W', 'L'].forEach(function (code) {
      var nur = {}; Object.keys(plan.block).forEach(function (key) { var pq = key.split(',').map(Number); if (zeichen(ctx, pq[0], pq[1]) === code) nur[key] = 1; });
      dachRechtecke(nur).forEach(function (r) { dachTeilen(r).forEach(function (t) { t.code = code; plan.bloecke.push(t); }); });
    });
    ctx.hausplan = plan;
    return plan;
  }
  function istDachblock(set, ctx, x, y) { var p = set.haeuser ? hausplan(set, ctx) : null; return !!(p && p.block[x + ',' + y]); }
  // Eine Dachfläche zwischen First und Traufe; first 'ow': die Reihen laufen von West nach Ost
  function dachStriche(art, x0, y0, x1, y1, first, seed) {
    var d = '', u, v, u0 = first === 'ow' ? x0 : y0, u1 = first === 'ow' ? x1 : y1, v0 = first === 'ow' ? y0 : x0, v1 = first === 'ow' ? y1 : x1;
    function strich(ua, va, ub, vb) { d += first === 'ow' ? 'M' + gr(ua) + ' ' + gr(va) + 'L' + gr(ub) + ' ' + gr(vb) : 'M' + gr(va) + ' ' + gr(ua) + 'L' + gr(vb) + ' ' + gr(ub); }
    function rnd(n) { seed = (seed * 9301 + 49297) % 233280; return (seed / 233280) * n; }
    if (art === 'schindel') {
      var reihe = 0;
      for (v = v0 + 6; v < v1 - 0.5; v += 6) strich(u0, v, u1, v);
      for (v = v0; v < v1 - 0.5; v += 6) { for (u = u0 + (reihe % 2 ? 4 : 8) + rnd(1.5); u < u1 - 1; u += 8) strich(u, v + 0.3, u, Math.min(v + 6, v1)); reihe++; }
    } else if (art === 'ziegel') {
      for (u = u0 + 4.5; u < u1 - 1; u += 4.5) strich(u, v0, u, v1);
      for (v = v0 + 9; v < v1 - 0.5; v += 9) strich(u0, v, u1, v);
    } else {
      // Stroh: Halme vom First zur Traufe, in Lagen versetzt
      for (u = u0 + 1.6; u < u1 - 0.8; u += 3.2) {
        var lage = v0 + 1 + rnd(5);
        while (lage < v1 - 1.5) { var l = 5 + rnd(5); strich(u + rnd(1.2) - 0.6, lage, u + rnd(1.2) - 0.6, Math.min(lage + l, v1 - 0.6)); lage += l + 2.5 + rnd(3); }
      }
    }
    return d;
  }
  // Ein Dach in Einheiten (Feld 36), Feld 1/1 liegt bei 0/0. sued: je Feld der Südseite, ob dort die Hausfront frei liegt
  function dachSvg(t, sued) {
    var X0 = (t.x0 - 1) * 36, Y0 = (t.y0 - 1) * 36, X1 = t.x1 * 36, Y1 = t.y1 * 36, D = DACH[t.code] || DACH['#'], ton = D.toene[dachHash(t.x0, t.y0) % D.toene.length], o = [], FH = 9, GH = 7;
    var hell = dachTon(D.hell, ton), dunkel = dachTon(D.dunkel, ton), seed = dachHash(t.x0 * 7, t.y0 * 3) % 233280;
    // Über den freien Feldern im Süden endet das Dach um FH früher, dort steht die Front; ein Giebel im Süden (First Nord–Süd) als Winkel
    var ganzFrei = sued.every(function (s) { return s; }), giebel = t.first === 'ns' && ganzFrei, unten = Y1 - (ganzFrei ? FH : 0), xm = (X0 + X1) / 2, ym = (Y0 + unten) / 2, spitze = unten - GH;
    if (t.first === 'ow') {
      o.push('<rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (ym - Y0) + '" fill="' + hell + '"/><rect x="' + X0 + '" y="' + ym + '" width="' + (X1 - X0) + '" height="' + (unten - ym) + '" fill="' + dunkel + '"/>');
      o.push('<path d="' + dachStriche(D.art, X0, Y0, X1, ym, 'ow', seed) + '" fill="none" stroke="' + D.strich + '" stroke-width=".9" opacity=".75"/><path d="' + dachStriche(D.art, X0, ym, X1, unten, 'ow', seed + 11) + '" fill="none" stroke="' + D.strich + '" stroke-width=".9" opacity=".85"/>');
      o.push('<path d="M' + X0 + ' ' + (Y0 + 1) + 'H' + X1 + '" stroke="' + D.licht + '" stroke-width="1.2"/>');
      o.push('<path d="M' + X0 + ' ' + ym + 'H' + X1 + '" stroke="' + D.first + '" stroke-width="' + (D.art === 'stroh' ? 3 : 2.2) + '"/><path d="M' + X0 + ' ' + (ym - 1.6) + 'H' + X1 + '" stroke="' + D.licht + '" stroke-width=".9"/>');
    } else {
      var ende = giebel ? spitze : unten, sd = 'M' + X0 + ' ' + Y0 + 'H' + xm + 'V' + ende + (giebel ? 'L' + X0 + ' ' + unten : 'H' + X0) + 'Z', so = 'M' + xm + ' ' + Y0 + 'H' + X1 + 'V' + unten + (giebel ? 'L' + xm + ' ' + spitze : 'H' + xm) + 'Z';
      var idW = 'krone-' + (++KRONE_NR), idO = 'krone-' + (++KRONE_NR);
      o.push('<clipPath id="' + idW + '"><path d="' + sd + '"/></clipPath><clipPath id="' + idO + '"><path d="' + so + '"/></clipPath>');
      o.push('<path d="' + sd + '" fill="' + hell + '"/><path d="' + so + '" fill="' + dunkel + '"/>');
      o.push('<g clip-path="url(#' + idW + ')"><path d="' + dachStriche(D.art, X0, Y0, xm, unten, 'ns', seed) + '" fill="none" stroke="' + D.strich + '" stroke-width=".9" opacity=".75"/></g><g clip-path="url(#' + idO + ')"><path d="' + dachStriche(D.art, xm, Y0, X1, unten, 'ns', seed + 11) + '" fill="none" stroke="' + D.strich + '" stroke-width=".9" opacity=".85"/></g>');
      o.push('<path d="M' + (X0 + 1) + ' ' + Y0 + 'V' + unten + '" stroke="' + D.licht + '" stroke-width="1.2"/>');
      o.push('<path d="M' + xm + ' ' + Y0 + 'V' + ende + '" stroke="' + D.first + '" stroke-width="' + (D.art === 'stroh' ? 3 : 2.2) + '"/><path d="M' + (xm - 1.6) + ' ' + Y0 + 'V' + (ende - 1) + '" stroke="' + D.licht + '" stroke-width=".9"/>');
    }
    // Die Front: nur, wo die Südseite frei liegt; Fachwerk beim Lehm, Bohlen beim Holz, Bruchstein beim Stein; hier und da ein Fenster mit Laden, nie mit Messing: benutzbar ist es nicht
    var fd = '', r = '', yf = ganzFrei ? unten : Y1 - FH, i;
    sued.forEach(function (frei, n) { if (frei) r += '<rect x="' + (X0 + n * 36) + '" y="' + yf + '" width="36" height="' + (Y1 - yf) + '" fill="' + D.front + '"/>'; });
    if (r) {
      if (giebel) r = '<path d="M' + X0 + ' ' + Y1 + 'V' + unten + 'L' + xm + ' ' + spitze + 'L' + X1 + ' ' + unten + 'V' + Y1 + 'Z" fill="' + D.front + '"/>';
      o.push(r);
      for (i = 0; i < sued.length; i++) {
        if (!sued[i]) continue;
        var a = X0 + i * 36, b = a + 36;
        if (D.art === 'stroh') fd += 'M' + a + ' ' + (yf + 0.6) + 'V' + Y1 + 'M' + (a + 18) + ' ' + (yf + 0.6) + 'V' + Y1 + 'M' + (a + 18) + ' ' + (Y1 - 1) + 'L' + (a + 27) + ' ' + (yf + 1) + 'M' + a + ' ' + (Y1 - 3.5) + 'H' + b;
        else if (D.art === 'schindel') fd += 'M' + a + ' ' + yf + 'V' + Y1 + 'M' + (a + 6) + ' ' + yf + 'V' + Y1 + 'M' + (a + 12) + ' ' + yf + 'V' + Y1 + 'M' + (a + 18) + ' ' + yf + 'V' + Y1 + 'M' + (a + 24) + ' ' + yf + 'V' + Y1 + 'M' + (a + 30) + ' ' + yf + 'V' + Y1;
        else fd += 'M' + a + ' ' + (yf + 4.5) + 'H' + b + 'M' + (a + 9) + ' ' + yf + 'V' + (yf + 4.5) + 'M' + (a + 27) + ' ' + yf + 'V' + (yf + 4.5) + 'M' + (a + 18) + ' ' + (yf + 4.5) + 'V' + Y1;
      }
      o.push('<path d="' + fd + '" fill="none" stroke="' + D.frontFuge + '" stroke-width="' + (D.art === 'stroh' ? 1.5 : 0.9) + '"/>');
      for (i = 0; i < sued.length; i++) if (sued[i] && (i + dachHash(t.x0, t.y1)) % 3 === 0) { var fa = X0 + i * 36 + 12; o.push('<rect x="' + fa + '" y="' + (yf + 1.6) + '" width="5.6" height="5.2" fill="#2f2a24"/><rect x="' + (fa + 5.6) + '" y="' + (yf + 1.6) + '" width="2.6" height="5.2" fill="' + D.frontFuge + '"/>'); }
      o.push('<path d="M' + X0 + ' ' + (Y1 - 0.6) + 'H' + X1 + '" stroke="' + D.sockel + '" stroke-width="1.2"/>');
      if (giebel) o.push('<path d="M' + X0 + ' ' + (unten + 1) + 'L' + xm + ' ' + (spitze + 1) + 'L' + X1 + ' ' + (unten + 1) + '" fill="none" stroke="#2a2119" stroke-width="1.8" opacity=".38"/>');
      else o.push('<path d="M' + X0 + ' ' + (yf + 1) + 'H' + X1 + '" stroke="#2a2119" stroke-width="1.8" opacity=".38"/>');
    }
    // Der Umriss des Hauses
    o.push('<path d="M' + X0 + ' ' + Y0 + 'H' + X1 + 'V' + Y1 + 'H' + X0 + 'Z" fill="none" stroke="#3b3028" stroke-width="1.3"/>');
    if (giebel) o.push('<path d="M' + X0 + ' ' + unten + 'L' + xm + ' ' + spitze + 'L' + X1 + ' ' + unten + '" fill="none" stroke="#3b3028" stroke-width="1"/>');
    else if (r) o.push('<path d="M' + X0 + ' ' + yf + 'H' + X1 + '" stroke="#3b3028" stroke-width="1"/>');
    // Bei jedem zweiten größeren Haus ein Rauchfang neben dem First
    if ((t.x1 - t.x0 + 1) * (t.y1 - t.y0 + 1) >= 12 && dachHash(t.x1, t.y0) % 2 === 0) {
      var kx = t.first === 'ow' ? X0 + 14 + (dachHash(t.x0, t.y1) % Math.max(1, X1 - X0 - 28)) : xm + 3, ky = t.first === 'ow' ? ym + 3 : Y0 + 14 + (dachHash(t.x0, t.y1) % Math.max(1, unten - Y0 - 28));
      o.push('<rect x="' + (kx + 2) + '" y="' + (ky + 2) + '" width="7" height="7" fill="#2a2119" opacity=".3"/><rect x="' + kx + '" y="' + ky + '" width="7" height="7" fill="#8f897c" stroke="#3b3028" stroke-width="1"/><rect x="' + (kx + 2.2) + '" y="' + (ky + 2.2) + '" width="2.6" height="2.6" fill="#2f2a24"/>');
    }
    return o.join('');
  }
  // Die Südseite eines Dachs liegt frei, wo darunter kein Dach, keine Wand und nicht der Kartenrand liegt
  function dachSued(ctx, auf, t) { var o = []; for (var x = t.x0; x <= t.x1; x++) { var c = zeichen(ctx, x, t.y1 + 1); o.push(c !== null && !WAND[c] && c !== '+' && !auf[x + ',' + (t.y1 + 1)]); } return o; }
  function sichtClip(ctx, gesehen, inhalt) {
    if (!gesehen) return inhalt;
    var nd = '', nid = 'krone-' + (++KRONE_NR);
    for (var y = 1; y <= ctx.ze; y++) for (var x = 1; x <= ctx.sp; x++) if (gesehen(x, y)) nd += 'M' + (x - 1) * 36 + ' ' + (y - 1) * 36 + 'h36v36h-36Z';
    return '<clipPath id="' + nid + '"><path d="' + nd + '"/></clipPath><g clip-path="url(#' + nid + ')">' + inhalt + '</g>';
  }
  // Die Dächer einer Karte: zuDecken(raum) sagt, ob ein Raum unter seinem Dach liegt; gesehen(x, y): bei Nacht und im dichten Nebel nur, was die Figur sieht
  function daecherSvg(set, ctx, sc, X, Y, zuDecken, gesehen) {
    var p = hausplan(set, ctx); if (!p) return '';
    var teile = p.bloecke.slice(), tueren = [], auf = {}, s = '', d = '', tt = '';
    p.raeume.forEach(function (r) { if (zuDecken(r)) { r.teile.forEach(function (t) { teile.push(t); }); Object.keys(r.tueren).forEach(function (key) { tueren.push(key.split(',').map(Number)); }); } });
    if (!teile.length) return '';
    teile.forEach(function (t) { for (var y = t.y0; y <= t.y1; y++) for (var x = t.x0; x <= t.x1; x++) auf[x + ',' + y] = 1; });
    teile.forEach(function (t) { s += '<rect x="' + ((t.x0 - 1) * 36 + 8) + '" y="' + ((t.y0 - 1) * 36 + 8) + '" width="' + ((t.x1 - t.x0 + 1) * 36) + '" height="' + ((t.y1 - t.y0 + 1) * 36) + '"/>'; d += dachSvg(t, dachSued(ctx, auf, t)); });
    tueren.forEach(function (q) { tt += '<g transform="translate(' + (q[0] - 1) * 36 + ' ' + (q[1] - 1) * 36 + ')">' + aufsatzFuer(set, ctx, q[0], q[1]) + '</g>'; });
    var id = 'krone-' + (++KRONE_NR);
    return '<g transform="translate(' + X + ' ' + Y + ') scale(' + sc + ')">' + sichtClip(ctx, gesehen, '<clipPath id="' + id + '"><rect width="' + ctx.sp * 36 + '" height="' + ctx.ze * 36 + '"/></clipPath><g clip-path="url(#' + id + ')"><g fill="#2a2119" opacity=".26">' + s + '</g>' + d + tt + '</g>') + '</g>';
  }
  // Eine Plane über einem Marktstand (Karteneintrag planen: [[x0, y0, x1, y1]], Felder einschließlich): Sie liegt hinter dem Tisch und reicht 8 auf das Feld davor,
  // obenauf wie Krone und Segel: Darunter geht man hindurch, sie gibt keine Deckung, die Spielsteine liegen darüber
  function planenSvg(S, ctx, sc, X, Y, gesehen) {
    if (!S.planen || !S.planen.length) return '';
    var o = '';
    S.planen.forEach(function (p, i) {
      var X0 = (p[0] - 1) * 36 + 3, Y0 = (p[1] - 1) * 36 + 3, X1 = p[2] * 36 - 3, Y1 = p[3] * 36 + 8, w = X1 - X0, h = Y1 - Y0, n = Math.max(2, Math.round(w / 9)), b = w / n, st = '', kante = '', j;
      for (j = 0; j < n; j++) if ((j + i) % 2 === 0) st += '<rect x="' + gr(X0 + j * b) + '" y="' + Y0 + '" width="' + gr(b) + '" height="' + h + '" fill="#a8a67a"/>';
      for (j = 0; j < n; j++) kante += 'M' + gr(X0 + j * b) + ' ' + Y1 + 'q' + gr(b / 2) + ' 4 ' + gr(b) + ' 0';
      o += '<rect x="' + (X0 + 6) + '" y="' + (Y0 + 6) + '" width="' + w + '" height="' + h + '" fill="#2a2119" opacity=".22"/><rect x="' + X0 + '" y="' + Y0 + '" width="' + w + '" height="' + h + '" fill="#d9cda9"/>' + st +
        '<path d="M' + X0 + ' ' + gr(Y0 + h / 2) + 'H' + X1 + '" stroke="#8a7a56" stroke-width="1.2"/><path d="' + kante + '" fill="#c7ba92" stroke="#3b3028" stroke-width="1"/><rect x="' + X0 + '" y="' + Y0 + '" width="' + w + '" height="' + h + '" fill="none" stroke="#3b3028" stroke-width="1.3"/>';
    });
    return '<g transform="translate(' + X + ' ' + Y + ') scale(' + sc + ')">' + sichtClip(ctx, gesehen, o) + '</g>';
  }
  // Die Gosse (Karteneintrag gosse: [[x0, y0, x1, y1]], gerade Läufe, Felder einschließlich): nur Zeichnung, keine Regel; Formen wie der Weg. Der Kartenrand zählt als Anschluss, wo der Lauf auf ihn zuläuft.
  function gosseFuer(S, ctx, x, y) {
    if (!S.gosse) return '';
    if (!ctx.gossen) { ctx.gossen = {}; S.gosse.forEach(function (e) { var dx = e[2] > e[0] ? 1 : e[2] < e[0] ? -1 : 0, dy = e[3] > e[1] ? 1 : e[3] < e[1] ? -1 : 0, cx = e[0], cy = e[1]; for (;;) { ctx.gossen[cx + ',' + cy] = 1; if (cx === e[2] && cy === e[3]) break; cx += dx; cy += dy; } }); }
    if (!ctx.gossen[x + ',' + y]) return '';
    function an(d) { var nx = x + d[0], ny = y + d[1]; return !!ctx.gossen[nx + ',' + ny] || (zeichen(ctx, nx, ny) === null && !!ctx.gossen[(x - d[0]) + ',' + (y - d[1])]); }
    var m = 0; D4.forEach(function (d, q) { if (an(d)) m |= 1 << q; });
    var b = wegForm(m);
    return '<g transform="rotate(' + b.r + ' 18 18)">' + gosseSvg(b.form) + '</g>';
  }
  // Eine Gasse über Wasser ist eine Brücke: Felder, von denen ein Lauf aus Gassenfeldern nach beiden Seiten bis ans Wasser reicht; dazu die Felder an der Kaimauer, die an einer solchen Brücke liegen.
  // So entstehen auch Landungsbrücke und Laufplanke. Felder an Bord gehören nicht dazu. Wert: die Richtung der Brücke (0 Nord–Süd, 90 West–Ost).
  function brueckenVon(set, ctx) {
    if (ctx.bruecken) return ctx.bruecken;
    var b = ctx.bruecken = {}, y, x;
    function gasse(fx, fy) { return zeichen(ctx, fx, fy) === 'e' && !bordFeld(set, ctx, fx, fy); }
    function lauf(fx, fy, dx, dy) { var cx = fx + dx, cy = fy + dy; while (gasse(cx, cy)) { cx += dx; cy += dy; } return zeichen(ctx, cx, cy); }
    for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) {
      if (!gasse(x, y)) continue;
      if (lauf(x, y, 0, -1) === '~' && lauf(x, y, 0, 1) === '~') b[x + ',' + y] = 90;
      else if (lauf(x, y, -1, 0) === '~' && lauf(x, y, 1, 0) === '~') b[x + ',' + y] = 0;
    }
    for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) {
      if (!gasse(x, y) || b[x + ',' + y] !== undefined) continue;
      if (lauf(x, y, 0, -1) === 'F' && lauf(x, y, 0, 1) === 'F' && (b[(x - 1) + ',' + y] === 90 || b[(x + 1) + ',' + y] === 90)) b[x + ',' + y] = 90;
      else if (lauf(x, y, -1, 0) === 'F' && lauf(x, y, 1, 0) === 'F' && (b[x + ',' + (y - 1)] === 0 || b[x + ',' + (y + 1)] === 0)) b[x + ',' + y] = 0;
    }
    return b;
  }
  // Schiffe in der Stadt (set.schiff.frei): Dasselbe Zeichen e ist an Land die Gasse. Ein Schiff ist, was von einem Mast oder einer Bank aus über Deck und Dinge zusammenhängt und mehr ans Wasser grenzt als an Land.
  // Eine Laufplanke trennt es vom Land: ein Streifen von einem Feld Breite, dessen beide Enden etwas treffen; ein Streifen, der im Wasser endet, gehört als Bug oder Heck zum Rumpf.
  function freieSchiffe(set, ctx, b) {
    var an = set.schiff.anBord, deck = set.schiff.deck, gesehen = {}, x, y;
    function teil(c) { return c !== null && (c === deck || an.indexOf(c) >= 0); }
    function nass(cx, cy) { var z = zeichen(ctx, cx, cy); return z === '~' || z === 'i' || z === null; }
    function planke(cx, cy) {
      if (zeichen(ctx, cx, cy) !== deck) return false;
      var ow = nass(cx - 1, cy) && nass(cx + 1, cy), ns = nass(cx, cy - 1) && nass(cx, cy + 1);
      if (ow === ns) return false;
      function ende(dx, dy) { var ax = cx + dx, ay = cy + dy; while (zeichen(ctx, ax, ay) === deck && (dx ? nass(ax, ay - 1) && nass(ax, ay + 1) : nass(ax - 1, ay) && nass(ax + 1, ay))) { ax += dx; ay += dy; } return zeichen(ctx, ax, ay); }
      function fest(z) { return z !== null && z !== '~' && z !== 'i'; }
      return ow ? fest(ende(0, -1)) && fest(ende(0, 1)) : fest(ende(-1, 0)) && fest(ende(1, 0));
    }
    for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) {
      var c0 = zeichen(ctx, x, y);
      if ((c0 !== 'O' && c0 !== 'b') || gesehen[x + ',' + y]) continue;
      var feld = {}, st = [[x, y]], wasser = 0, land = 0, mitDeck = false; feld[x + ',' + y] = 1; gesehen[x + ',' + y] = 1;
      while (st.length) {
        var p = st.pop(); if (zeichen(ctx, p[0], p[1]) === deck) mitDeck = true;
        D4.forEach(function (d) {
          var nx = p[0] + d[0], ny = p[1] + d[1], key = nx + ',' + ny, c = zeichen(ctx, nx, ny);
          if (teil(c) && !planke(nx, ny)) { if (!feld[key]) { feld[key] = 1; gesehen[key] = 1; st.push([nx, ny]); } }
          else if (nass(nx, ny)) wasser++; else land++;
        });
      }
      if (mitDeck && wasser > land) Object.keys(feld).forEach(function (key) { b[key] = 1; });
    }
  }
  function deckKachel(set) { var k = kachelVon(set, set.schiff.deck); return k.deck || k; }
  // Der Holzkai (set.bollwerk): Dielen, die an Wasser grenzen, liegen auf Pfählen, mit Kantbalken und Pfahlköpfen zum Wasser; was an ihnen hängt, gilt als draußen
  function bollwerkFelder(ctx) {
    if (ctx.bollwerkF) return ctx.bollwerkF;
    var b = ctx.bollwerkF = {}, st = [], x, y;
    for (y = 1; y <= ctx.ze; y++) for (x = 1; x <= ctx.sp; x++) if (zeichen(ctx, x, y) === '=' && D4.some(function (d) { return zeichen(ctx, x + d[0], y + d[1]) === '~'; })) { b[x + ',' + y] = 1; st.push([x, y]); }
    while (st.length) { var p = st.pop(); D4.forEach(function (d) { var nx = p[0] + d[0], ny = p[1] + d[1], key = nx + ',' + ny; if (!b[key] && zeichen(ctx, nx, ny) === '=') { b[key] = 1; st.push([nx, ny]); } }); }
    return b;
  }
  function bollwerkFuer(set, ctx, x, y) {
    if (!set.bollwerk || musterFuer(set, ctx, x, y) !== 'holz') return '';
    return viertel(stegStueck, viertelZustaende(ctx, x, y, function (c) { return c !== '~'; }));
  }
  // Der Kran (Karteneintrag kran: [[x0, y0, x1, y1, Richtung, Länge]]): Ein Block von Holzwand ist der feste Turm; Dach und Ausleger drehen sich. Der Ausleger liegt obenauf wie eine Krone, sperrt nichts, an seinem Ende hängt ein Fass.
  function kranSvg(S, ctx, sc, X, Y, gesehen) {
    if (!S.kran || !S.kran.length) return '';
    var o = '';
    S.kran.forEach(function (e) {
      var cx = (e[0] - 1 + e[2]) * 18, cy = (e[1] - 1 + e[3]) * 18 - 2, r = e[4] === undefined ? 180 : e[4], L = e[5] || 118, streben = '';
      for (var t = 22; t < L - 6; t += 18) streben += 'M-4.5 ' + t + 'L4.5 ' + (t + 9) + 'L-4.5 ' + (t + 18);
      o += '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + (r - 180) + ')"><g transform="translate(7 7)" opacity=".22"><rect x="-4.5" y="0" width="9" height="' + L + '" fill="#2a2119"/><circle cx="0" cy="' + (L + 13) + '" r="6" fill="#2a2119"/></g>' +
        '<rect x="-4.5" y="0" width="9" height="' + L + '" fill="#8f6f4a" stroke="#3b3028" stroke-width="1.3"/><path d="' + streben + '" fill="none" stroke="#5c4430" stroke-width="1"/>' +
        '<circle cx="3" cy="3" r="17" fill="#2a2119" opacity=".25"/><circle cx="0" cy="0" r="17" fill="#8a7b5f" stroke="#3b3028" stroke-width="1.4"/><circle cx="0" cy="0" r="11" fill="none" stroke="#665c47" stroke-width="1"/><circle cx="0" cy="0" r="5" fill="#6f5439" stroke="#3b3028" stroke-width="1.1"/>' +
        '<circle cx="0" cy="' + L + '" r="4.6" fill="#7f868a" stroke="#3b3028" stroke-width="1.2"/><path d="M0 ' + (L + 4.6) + 'v3" stroke="#3b3028" stroke-width="1.4"/><circle cx="0" cy="' + (L + 13) + '" r="6.4" fill="#a88a5c" stroke="#3b3028" stroke-width="1.2"/><circle cx="0" cy="' + (L + 13) + '" r="3.4" fill="none" stroke="#6f5a3e" stroke-width=".9"/></g>';
    });
    return '<g transform="translate(' + X + ' ' + Y + ') scale(' + sc + ')">' + sichtClip(ctx, gesehen, o) + '</g>';
  }
  // Die Häuser (Blatt des Sets): je Größe die Geschosse als eigene Karten mit denselben Spalten und Zeilen, die Stiege auf jedem am selben Feld
  function hausUmriss(kl) { var f = 4, st = kl.stiege; return '<svg width="' + (kl.b * f + 2) + '" height="' + (kl.t * f + 2) + '" viewBox="0 0 ' + (kl.b * f + 2) + ' ' + (kl.t * f + 2) + '" aria-hidden="true" style="display:block;margin:0 auto 2px;background:none;border:0"><rect x="1" y="1" width="' + kl.b * f + '" height="' + kl.t * f + '" fill="' + DACH[kl.code].hell + '" stroke="#3b3028"/><rect x="' + (1 + (st[0] - 1) * f) + '" y="' + (1 + (st[1] - 1) * f) + '" width="' + f + '" height="' + f + '" fill="#3b3028"/></svg>'; }
  function hausKarte(kl, g) { var S = { titel: kl.b + ' × ' + kl.t + ', ' + g[0], boden: g[1], drehung: {} }; if (kl.dreh) S.drehung[kl.stiege[0] + ',' + kl.stiege[1]] = kl.dreh; return Object.assign(S, g[2] || {}); }
  function hausblattHtml(set, id) {
    var o = '<h3 class="gruppe">Die Häuser: Stockwerke, Keller und Dachboden</h3><p>' + set.hausblatt.text + '</p><div id="geschosse-' + id + '"><div class="werk" style="display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end">';
    set.hausblatt.klassen.forEach(function (kl, i) { o += '<button type="button" data-haus="' + i + '" aria-pressed="false" style="padding:4px 8px">' + hausUmriss(kl) + kl.b + ' × ' + kl.t + '<small style="display:block">' + kl.kurz + '</small></button>'; });
    return o + '</div><div class="werk" data-hausansicht style="display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 6px"></div><p data-haustext style="margin:4px 0 6px"></p><div class="skizze" data-hauskarte></div><details style="margin-top:6px"><summary>Zeilen für die Kampfkarte</summary><pre data-hauszeilen style="overflow:auto;max-width:100%"></pre></details></div>';
  }
  function hausblattAn(set, id) {
    var w = document.getElementById('geschosse-' + id); if (!w) return;
    var aktiv = set.hausblatt.start, ans = 'Erdgeschoss';
    function m(f) { return String(f * 1.5).replace('.', ','); }
    function zeichne() {
      var kl = set.hausblatt.klassen[aktiv];
      if (!kl.geschosse.some(function (g) { return g[0] === ans; })) ans = 'Erdgeschoss';
      var S = hausKarte(kl, kl.geschosse.filter(function (g) { return g[0] === ans; })[0]);
      w.querySelectorAll('[data-haus]').forEach(function (bt) { bt.setAttribute('aria-pressed', Number(bt.dataset.haus) === aktiv ? 'true' : 'false'); });
      w.querySelector('[data-hausansicht]').innerHTML = kl.geschosse.map(function (g) { return '<button type="button" data-ans="' + g[0] + '" aria-pressed="' + (g[0] === ans) + '">' + g[0] + '</button>'; }).join('');
      w.querySelector('[data-haustext]').textContent = kl.b + ' × ' + kl.t + ' Felder (' + m(kl.b) + ' m × ' + m(kl.t) + ' m): ' + kl.text;
      w.querySelector('[data-hauskarte]').innerHTML = probeKarteSvg(set, S, null, 40 * kl.b).replace('<svg ', '<svg style="max-width:100%;height:auto" ');
      var zeilen = ['boden: ' + JSON.stringify(S.boden)];
      if (kl.dreh) zeilen.push('drehung: ' + JSON.stringify(S.drehung));
      if (S.luken) zeilen.push('luken: ' + JSON.stringify(S.luken));
      if (S.dachboden) zeilen.push('dachboden: true');
      if (S.grundlicht) zeilen.push("grundlicht: '" + S.grundlicht + "'");
      w.querySelector('[data-hauszeilen]').textContent = zeilen.join(',\n');
    }
    w.addEventListener('click', function (ev) {
      var bt = ev.target.closest('button'); if (!bt) return;
      if (bt.dataset.haus !== undefined) { aktiv = Number(bt.dataset.haus); zeichne(); }
      else if (bt.dataset.ans !== undefined) { ans = bt.dataset.ans; zeichne(); }
    });
    zeichne();
  }
  // Gasse und nasses Pflaster: Flächen aus Vierteln, die nur zu den Zeichen in randGegen einen Rand zeichnen; die Gasse über Wasser ist eine Brücke mit Kantbalken und Pfählen
  function pflasterFlaeche(set, ctx, x, y, k) {
    if (k.bruecke && brueckenVon(set, ctx)[x + ',' + y] !== undefined) return viertel(stegStueck, viertelZustaende(ctx, x, y, function (c) { return c !== '~' && c !== 'F'; }));
    return viertel(k.stueck, viertelZustaende(ctx, x, y, function (c) { return k.randGegen.indexOf(c) < 0; }));
  }
  // ---------- Seite ----------
  // Set 5: das Muster der Felsmasse aus denselben Brocken wie die Höhlenwand, dunkel und ohne Kontrast (jetzt steht felsTextur)
  UNTERREICH.muster.masse = { grund: MASSE_STIL.front, bilder: [0, 1, 2, 3].map(function (v) { return felsTextur(MASSE_STIL, v); }) };
  var SETLISTE = [ARKTIS, BERGE, KUESTE, GRASLAND, UNTERREICH, SUMPF, WALD, WUESTE, GEWAESSER, STADT];
  var ziel = typeof window !== 'undefined' ? window : globalThis;
  ziel.KACHELN = { sets: SETLISTE, gemeinsam: GEMEINSAM, kachelVon: kachelVon, kachelSvg: kachelSvg, karteSvg: karteSvg, alleKacheln: alleKacheln, schiffBau: schiffBau, schiffKarte: schiffKarte, schiffsklassen: SCHIFFSKLASSEN };
  if (typeof module !== 'undefined' && module.exports) module.exports = ziel.KACHELN;
})();
