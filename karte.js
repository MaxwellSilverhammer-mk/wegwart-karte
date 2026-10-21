/*
 * Wegwart-Karte – Kartentisch für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.0
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Karte: Rund um Rohrdorf</h2>
 *   <div id="karte">Karte lädt …</div>
 *   <script>var KARTE={titel:'Rund um Rohrdorf', orte:[…], wege:[…]}</script>
 *   <script src="https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/karte.js"></script>
 *
 * Weltraster: 1 Einheit = 1 Stunde zu Fuß (etwa 4,5 km). Monmurg liegt bei (0, 0),
 * x wächst nach Osten, y nach Süden. Alle Felder stehen in der README.
 */
(function () {
  'use strict';

  var VERSION = '1.0';
  var K = 60;        // Kartenpunkte je Stunde
  var RAND = 26;     // Rahmenbreite
  var ZOOM_MIN = 1.6; // Vergrößerung beim Antippen, mindestens

  var F = {
    kohle: '#3b3028', varrin: '#8e3b22', wasser: '#3f6c84', kueste: '#4b5f61', welle: '#6f979c',
    halm: '#5d6a3a', baum: '#4d5b33', krone: '#8d9c63', berg: '#6b573f', feld: '#93793a',
    tot: '#76695a', mangrove: '#5f7446', rahmen: '#8b6d45', nebel: '#f8f2df'
  };
  var FLAECHE = {
    sumpf: { fill: '#aab785', op: 0.32, text: '#4f5c33' },
    totholz: { fill: '#a9a184', op: 0.28, text: '#5b5143' },
    wald: { fill: '#97a66c', op: 0.30, text: '#42502c' },
    berge: { fill: '#b9a27c', op: 0.30, text: '#5b4a33' },
    felder: { fill: '#d2bb72', op: 0.32, text: '#6f5c27' },
    mangroven: { fill: '#8fa46d', op: 0.30, text: '#46593a' }
  };
  var BEKANNT = { gesehen: true, karte: true, gehoert: true };
  function herkunft(o, D) {
    if (o.bekannt === 'gesehen') return 'Selbst gesehen.';
    if (o.bekannt === 'karte') return 'Aus ' + (o.quelle || D.kartenquelle || 'einer Karte') + '.';
    return 'Vom Hörensagen' + (o.quelle ? ' (' + o.quelle + ')' : '') + '.';
  }
  var LAGE = {
    r: [20, 8, 'start'], l: [-20, 8, 'end'], o: [0, -26, 'middle'], u: [0, 40, 'middle'],
    or: [16, -18, 'start'], ol: [-16, -18, 'end'], ur: [16, 32, 'start'], ul: [-16, 32, 'end']
  };

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function hash(s) {
    var h = 2166136261; s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function zufall(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function inFlaeche(p, poly) {
    var x = p[0], y = p[1], drin = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) drin = !drin;
    }
    return drin;
  }
  function abstandStrecke(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
    var t = l ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(a[0] + t * dx - p[0], a[1] + t * dy - p[1]);
  }
  function abstandLinie(p, pts) {
    var m = Infinity;
    for (var i = 1; i < pts.length; i++) m = Math.min(m, abstandStrecke(p, pts[i - 1], pts[i]));
    return m;
  }
  function glatt(pts, zu) {
    var n = pts.length;
    if (n < 2) return '';
    var d = 'M' + r1(pts[0][0]) + ' ' + r1(pts[0][1]);
    if (n === 2 && !zu) return d + 'L' + r1(pts[1][0]) + ' ' + r1(pts[1][1]);
    for (var i = 0; i < (zu ? n : n - 1); i++) {
      var p0 = pts[zu ? (i - 1 + n) % n : Math.max(0, i - 1)], p1 = pts[i], p2 = pts[(i + 1) % n];
      var p3 = pts[zu ? (i + 2) % n : Math.min(n - 1, i + 2)];
      d += 'C' + r1(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + r1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
        r1(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + r1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + r1(p2[0]) + ' ' + r1(p2[1]);
    }
    return d + (zu ? 'Z' : '');
  }
  function zittern(pts, schritt, amp, rnd, zu) {
    var aus = [], n = pts.length, m = zu ? n : n - 1, w = 0;
    for (var i = 0; i < m; i++) {
      var a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      var k = Math.max(1, Math.round(l / schritt)), nx = -dy / l, ny = dx / l;
      for (var j = 0; j < k; j++) {
        w = w * 0.55 + (rnd() - 0.5) * amp;
        var fest = j === 0;
        aus.push([a[0] + dx * j / k + (fest ? 0 : nx * w), a[1] + dy * j / k + (fest ? 0 : ny * w)]);
      }
    }
    if (!zu) aus.push(pts[n - 1]);
    return aus;
  }
  function mitte(pts, anteil) {
    var L = 0, seg = [], i;
    for (i = 1; i < pts.length; i++) { seg.push(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); L += seg[i - 1]; }
    var ziel = L * (anteil == null ? 0.5 : anteil), s = 0;
    for (i = 1; i < pts.length; i++) {
      if (s + seg[i - 1] >= ziel) {
        var t = (ziel - s) / (seg[i - 1] || 1), dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], l = Math.hypot(dx, dy) || 1;
        return { x: pts[i - 1][0] + t * dx, y: pts[i - 1][1] + t * dy, nx: -dy / l, ny: dx / l };
      }
      s += seg[i - 1];
    }
    var e = pts[pts.length - 1];
    return { x: e[0], y: e[1], nx: 0, ny: -1 };
  }
  function streuen(poly, abstand, rnd, frei) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, aus = [], zeile = 0;
    poly.forEach(function (p) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    for (var y = y0 + abstand / 2; y < y1; y += abstand * 0.87, zeile++) {
      for (var x = x0 + (zeile % 2) * abstand / 2; x < x1; x += abstand) {
        var p = [x + (rnd() - 0.5) * abstand * 0.7, y + (rnd() - 0.5) * abstand * 0.7];
        if (inFlaeche(p, poly) && (!frei || frei(p))) aus.push(p);
      }
    }
    return aus;
  }

  /* ---------- Zeichen der Orte (Ursprung in der Mitte) ---------- */
  var ZEICHEN = {
    stadt: '<rect x="-15" y="-8" width="9" height="16" class="kP"/><rect x="-5" y="-18" width="10" height="26" class="kP"/><rect x="6" y="-11" width="9" height="19" class="kP"/><path d="M-5 -18v-4h3v3h4v-3h3v4M-17 8h34"/>',
    furt: '<rect x="-6" y="-14" width="12" height="15" class="kP"/><path d="M-8 -14l8 -7 8 7" class="kP"/><path d="M-18 7q4.5 -4 9 0t9 0 9 0 9 0" stroke="' + F.wasser + '"/>',
    gasthaus: '<path d="M-11 8V-4L-1 -13 9 -4V8Z" class="kP"/><path d="M-4 8v-7h6v7M9 -3h8M15 -3v3"/><rect x="11" y="0" width="8" height="7" class="kP"/>',
    pfahldorf: '<path d="M-15 -1v-8l7 -6 7 6v8Z" class="kP"/><path d="M3 -1v-7l6 -5 6 5v7Z" class="kP"/><path d="M-13 -1v9M-8 -1v9M-3 -1v9M5 -1v9M9 -1v9M13 -1v9"/><path d="M-19 8q4 -3.5 8 0t8 0 8 0 8 0 8 0" stroke="' + F.wasser + '"/>',
    dorf: '<path d="M-16 8v-8l6 -6 6 6v8Z" class="kP"/><path d="M-3 8v-11l6 -6 6 6v11Z" class="kP"/><path d="M10 8v-7l5 -5 5 5v7Z" class="kP"/>',
    gut: '<path d="M-15 8V-5h30V8Z" class="kP"/><path d="M-17 -5L0 -15 17 -5Z" class="kP"/><path d="M-9 0v3M-3 0v3M3 0v3M9 0v3M-2 8v-4h4v4"/>',
    haus: '<path d="M-10 8V-5h20V8Z" class="kP"/><path d="M-12 -5L0 -13 12 -5Z" class="kP"/><path d="M4 -9l1.5 -10 4 0.8 -1.6 8" class="kP"/><path d="M-3 8v-6h6v6"/>',
    wehr: '<path d="M-16 0h32" stroke-width="2.8"/><path d="M-11 -7v14M-4 -8v16M3 -6v13M10 -8v15"/><path d="M-17 7q4 -3 8 0t8 0 8 0 8 0" stroke="' + F.wasser + '"/>',
    pfahl: '<path d="M0 11V-15"/><ellipse cx="-5" cy="-9" rx="5" ry="3.5" class="kP"/><ellipse cx="5" cy="-2" rx="5" ry="3.5" class="kP"/>',
    echsen: '<circle r="12" class="kP"/><circle r="3.5"/><path d="M-3 -16a3 3 0 0 1 6 0M11 -10a3 3 0 0 1 5 5M14 6a3 3 0 0 1 -4 5M3 16a3 3 0 0 1 -6 0M-10 10a3 3 0 0 1 -5 -4M-14 -6a3 3 0 0 1 4 -5"/>',
    toterbaum: '<path d="M0 12V-1M0 -1l-9 -8M0 -1l-4 -12M0 -1l3 -13M0 -1l9 -9M0 4l10 -3" stroke-width="2.6"/>',
    hain: '<circle cx="0" cy="-12" r="5" class="kP"/><circle cx="11" cy="-4" r="5" class="kP"/><circle cx="7" cy="9" r="5" class="kP"/><circle cx="-7" cy="9" r="5" class="kP"/><circle cx="-11" cy="-4" r="5" class="kP"/><circle r="2.5"/>',
    steine: '<rect x="-14" y="-8" width="7" height="16" rx="3" class="kP"/><rect x="-4" y="-15" width="8" height="23" rx="3" class="kP"/><rect x="7" y="-6" width="7" height="14" rx="3" class="kP"/><path d="M-17 8h34"/>',
    ruine: '<path d="M-8 10V-10l3 -4 2 3 3 -6 2 5 4 -2V10Z" class="kP"/><path d="M-1 -2v5M-12 10h24"/>',
    stelle: '<path d="M-7 -7l14 14M7 -7l-14 14" stroke-width="3"/>',
    punkt: '<circle r="6" class="kP"/>'
  };

  /* ---------- Wege ---------- */
  function wegSvg(d, art, tinte, gehoert, trasse) {
    var s = '', op = gehoert ? ' opacity="0.72"' : '', dash = gehoert ? ' stroke-dasharray="7 6"' : '';
    if (trasse) s += '<path d="' + d + '" stroke="' + F.varrin + '" stroke-width="15" stroke-opacity="0.16" stroke-linecap="round"/>';
    if (art === 'damm') s += '<path d="' + d + '" stroke="' + tinte + '" stroke-width="7"' + op + '/><path d="' + d + '" class="kPs" stroke-width="2.8"/>';
    else if (art === 'knueppeldamm') s += '<path d="' + d + '" stroke="' + tinte + '" stroke-width="1.8"' + op + '/><path d="' + d + '" stroke="' + tinte + '" stroke-width="10" stroke-dasharray="2 6"' + op + '/>';
    else if (art === 'wasser') s += '<path d="' + d + '" stroke="' + F.wasser + '" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="' + (gehoert ? '2 7' : '9 6') + '"/>';
    else if (art === 'graben') s += '<path d="' + d + '" stroke="' + F.wasser + '" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 5"/>';
    else if (art === 'pfad') s += '<path d="' + d + '" stroke="' + tinte + '" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="0.1 7"' + op + '/>';
    else if (art === 'unvermessen') s += '<path d="' + d + '" stroke="' + F.varrin + '" stroke-width="2.4" stroke-dasharray="14 9" opacity="0.85"/>';
    else s += '<path d="' + d + '" stroke="' + tinte + '" stroke-width="3.2" stroke-linecap="round"' + dash + op + '/>';
    return '<g fill="none" stroke-linejoin="round">' + s + '</g>';
  }
  var WEGNAME = {
    strasse: 'Straße', damm: 'Damm', knueppeldamm: 'Knüppeldamm', wasser: 'Wasserweg',
    graben: 'Graben', pfad: 'Pfad', unvermessen: 'unvermessen'
  };

  function tinteVon(b) { return b === 'karte' ? F.varrin : F.kohle; }

  function text(x, y, inhalt, o) {
    o = o || {};
    var zeilen = String(inhalt).split('\n'), gr = o.groesse || 24, s = '';
    var cls = 'kT ' + (o.meer ? 'kHm' : 'kH') + (o.fell ? ' kF' : '') + (o.rang === 2 ? ' k2' : '') + (o.klasse ? ' ' + o.klasse : '');
    var attr = ' font-size="' + gr + '" text-anchor="' + (o.anker || 'start') + '" fill="' + (o.farbe || F.kohle) + '"' +
      (o.kursiv ? ' font-style="italic"' : '') + (o.sperren ? ' letter-spacing="' + o.sperren + '"' : '') +
      (o.deckkraft ? ' opacity="' + o.deckkraft + '"' : '');
    var y0 = y - (zeilen.length - 1) * gr * 1.1 * (o.oben ? 1 : 0.5) * (o.unten ? 0 : 1);
    if (o.unten) y0 = y;
    s += '<text class="' + cls + '" x="' + r1(x) + '" y="' + r1(y0) + '"' + attr + '>';
    zeilen.forEach(function (z, i) {
      s += i ? '<tspan x="' + r1(x) + '" dy="' + r1(gr * 1.1) + '">' + esc(z) + '</tspan>' : esc(z);
    });
    return s + '</text>';
  }

  /* ---------- Karte zeichnen (ohne DOM) ---------- */
  function zeichne(D) {
    var rnd = zufall(hash(D.titel || 'karte'));
    var orte = (D.orte || []).filter(function (o) { return o && BEKANNT[o.bekannt] && isFinite(o.x) && isFinite(o.y); })
      .map(function (o) { var k = {}; Object.keys(o).forEach(function (s) { k[s] = o[s]; }); return k; });
    var wege = (D.wege || []).filter(function (w) { return w && BEKANNT[w.bekannt]; });
    var gebiete = D.gebiete || [], notizen = D.notizen || [];
    var idx = {}, liste = [];
    orte.forEach(function (o, i) { o._i = i; idx[o.id] = o; });

    var a = D.ausschnitt;
    if (!a) {
      var xs = orte.map(function (o) { return o.x; }), ys = orte.map(function (o) { return o.y; });
      a = [Math.min.apply(0, xs) - 1, Math.min.apply(0, ys) - 1, Math.max.apply(0, xs) + 1, Math.max.apply(0, ys) + 1];
    }
    var W = Math.round((a[2] - a[0]) * K + 2 * RAND), H = Math.round((a[3] - a[1]) * K + 2 * RAND);
    function P(p) { return [(p[0] - a[0]) * K + RAND, (p[1] - a[1]) * K + RAND]; }
    function PP(pts) { return pts.map(P); }
    function sichtbar(p, m) { m = m || 0; return p[0] >= RAND + m && p[0] <= W - RAND - m && p[1] >= RAND + m && p[1] <= H - RAND - m; }

    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-labelledby="ktTitel ktBeschr">');
    out.push('<title id="ktTitel">' + esc(D.titel || 'Karte') + '</title><desc id="ktBeschr">' + esc((D.stand ? D.stand + '. ' : '') + orte.length + ' Orte, ' + wege.length + ' Wege') + '</desc>');
    out.push('<style>' + SVG_CSS + '</style>');
    out.push('<defs><clipPath id="ktRahmen"><rect x="' + RAND + '" y="' + RAND + '" width="' + (W - 2 * RAND) + '" height="' + (H - 2 * RAND) + '"/></clipPath>');

    // Meer
    var meerPoly = null, kuestePts = null;
    if (D.kueste && D.kueste.linie && D.kueste.linie.length > 1) {
      kuestePts = zittern(PP(D.kueste.linie), 14, 3, rnd, false);
      var e1 = kuestePts[kuestePts.length - 1], e0 = kuestePts[0], seite = D.kueste.meer || 's', fern = 4000;
      var ecken = { s: [[e1[0], fern], [e0[0], fern]], n: [[e1[0], -fern], [e0[0], -fern]], o: [[fern, e1[1]], [fern, e0[1]]], w: [[-fern, e1[1]], [-fern, e0[1]]] }[seite];
      meerPoly = kuestePts.concat(ecken);
      out.push('<clipPath id="ktMeer"><path d="' + glatt(kuestePts, false) + 'L' + ecken.map(function (p) { return p.join(' '); }).join('L') + 'Z"/></clipPath>');
    }
    out.push('</defs>');
    out.push('<rect x="2" y="2" width="' + (W - 4) + '" height="' + (H - 4) + '" rx="14" class="kP" stroke="' + F.rahmen + '" stroke-width="3"/>');
    out.push('<g clip-path="url(#ktRahmen)">');

    // Wege vorberechnen (für Freiräume)
    var wegDaten = wege.map(function (w) {
      var roh;
      if (w.punkte) roh = w.punkte.slice();
      else {
        var v = idx[w.von], n = w.nach ? idx[w.nach] : null;
        if (!v || (!n && !w.bis)) return null;
        roh = [[v.x, v.y]].concat(w.ueber || []).concat([n ? [n.x, n.y] : w.bis]);
      }
      var pts = PP(roh);
      return { w: w, pts: pts, fein: zittern(pts, 16, 2.4, rnd, false) };
    });
    function nahWeg(p, abst) {
      for (var i = 0; i < wegDaten.length; i++) if (wegDaten[i] && abstandLinie(p, wegDaten[i].pts) < abst) return true;
      return false;
    }
    function nahOrt(p, abst) {
      for (var i = 0; i < orte.length; i++) { var q = P([orte[i].x, orte[i].y]); if (Math.hypot(p[0] - q[0], p[1] - q[1]) < abst) return true; }
      return false;
    }
    function imMeer(p) { return meerPoly ? inFlaeche(p, meerPoly) : false; }

    // Gebiete
    var flaechen = gebiete.map(function (g) { return { g: g, pts: PP(g.punkte || []) }; });
    flaechen.forEach(function (fl, i) {
      var st = FLAECHE[fl.g.art] || FLAECHE.sumpf;
      var weich = zittern(fl.pts, 20, 6, rnd, true);
      out.push('<path d="' + glatt(weich, true) + '" fill="' + st.fill + '" fill-opacity="' + st.op + '"/>');
      liste.push({ typ: 'flaeche', art: fl.g.art, pts: weich });
      var frei = function (p) {
        if (imMeer(p) || nahWeg(p, 15) || nahOrt(p, 34)) return false;
        for (var j = i + 1; j < flaechen.length; j++) if (inFlaeche(p, flaechen[j].pts)) return false;
        return true;
      };
      var d = '', d2 = '', art = fl.g.art;
      if (art === 'sumpf') {
        streuen(fl.pts, 30, rnd, frei).forEach(function (p) {
          var x = r1(p[0]), y = r1(p[1]);
          if (rnd() < 0.72) d += 'M' + (x - 8) + ' ' + y + 'h16M' + (x - 5) + ' ' + y + 'l-2 -8M' + x + ' ' + y + 'v-10M' + (x + 5) + ' ' + y + 'l2 -8';
          else d2 += 'M' + (x - 7) + ' ' + y + 'h14';
        });
        out.push('<path d="' + d + '" fill="none" stroke="' + F.halm + '" stroke-width="1.5" stroke-linecap="round"/>');
        out.push('<path d="' + d2 + '" fill="none" stroke="' + F.wasser + '" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>');
      } else if (art === 'totholz') {
        streuen(fl.pts, 30, rnd, frei).forEach(function (p) {
          var x = r1(p[0]), y = r1(p[1]);
          d += 'M' + x + ' ' + y + 'v-16M' + x + ' ' + (y - 8) + 'l-6 -6M' + x + ' ' + (y - 11) + 'l5 -6M' + (x - 6) + ' ' + y + 'h12';
        });
        out.push('<path d="' + d + '" fill="none" stroke="' + F.tot + '" stroke-width="1.6" stroke-linecap="round"/>');
      } else if (art === 'wald') {
        streuen(fl.pts, 25, rnd, frei).forEach(function (p) {
          var x = r1(p[0]), y = r1(p[1]), r = 5 + Math.round(rnd() * 2);
          d += 'M' + (x - r) + ' ' + (y - 8) + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0';
          d2 += 'M' + x + ' ' + (y - 8 + r) + 'v5';
        });
        out.push('<path d="' + d2 + '" fill="none" stroke="' + F.baum + '" stroke-width="1.6"/>');
        out.push('<path d="' + d + '" fill="' + F.krone + '" stroke="' + F.baum + '" stroke-width="1.3"/>');
        if (fl.g.nebel) {
          var dn = '', nk = streuen(fl.pts, 70, rnd, null);
          for (var k = 0; k < fl.g.nebel && nk.length; k++) {
            var q = nk.splice(Math.floor(rnd() * nk.length), 1)[0];
            dn += 'M' + r1(q[0] - 60) + ' ' + r1(q[1]) + 'q30 -10 60 0t60 0 60 0';
          }
          out.push('<path d="' + dn + '" fill="none" stroke="' + F.nebel + '" stroke-width="8" stroke-linecap="round" opacity="0.6"/>');
        }
      } else if (art === 'berge') {
        streuen(fl.pts, 46, rnd, frei).forEach(function (p) {
          var x = r1(p[0]), y = r1(p[1]), s = 0.8 + rnd() * 0.5;
          d += 'M' + r1(x - 15 * s) + ' ' + y + 'L' + r1(x - 2 * s) + ' ' + r1(y - 17 * s) + 'L' + r1(x + 13 * s) + ' ' + y + 'Z';
          d2 += 'M' + r1(x + 1 * s) + ' ' + r1(y - 12 * s) + 'l' + r1(4 * s) + ' ' + r1(10 * s) + 'M' + r1(x + 5 * s) + ' ' + r1(y - 7 * s) + 'l' + r1(3 * s) + ' ' + r1(6 * s);
        });
        out.push('<path d="' + d + '" class="kP" stroke="' + F.berg + '" stroke-width="1.8" stroke-linejoin="round"/>');
        out.push('<path d="' + d2 + '" fill="none" stroke="' + F.berg + '" stroke-width="1.3"/>');
      } else if (art === 'felder') {
        streuen(fl.pts, 14, rnd, frei).forEach(function (p) {
          var x = r1(p[0]), y = r1(p[1]);
          d += 'M' + x + ' ' + y + 'v-9';
        });
        out.push('<path d="' + d + '" fill="none" stroke="' + F.feld + '" stroke-width="1.4" stroke-linecap="round"/>');
      } else if (art === 'mangroven') {
        streuen(fl.pts, 26, rnd, frei).forEach(function (p) {
          var x = r1(p[0]), y = r1(p[1]);
          d += 'M' + (x - 5) + ' ' + (y - 9) + 'a5 5 0 1 0 10 0a5 5 0 1 0 -10 0';
          d2 += 'M' + (x - 7) + ' ' + y + 'q2 -6 7 -5q5 -1 7 5';
        });
        out.push('<path d="' + d2 + '" fill="none" stroke="' + F.mangrove + '" stroke-width="1.4"/>');
        out.push('<path d="' + d + '" fill="' + F.krone + '" stroke="' + F.mangrove + '" stroke-width="1.2"/>');
      }
    });

    // Meer über die Gebiete legen
    if (meerPoly) {
      var kd = glatt(kuestePts, false);
      out.push('<path d="' + kd + 'L' + meerPoly.slice(kuestePts.length).map(function (p) { return p.join(' '); }).join('L') + 'Z" class="kM"/>');
      out.push('<g clip-path="url(#ktMeer)" fill="none" stroke="' + F.welle + '">' +
        '<path d="' + kd + '" stroke-width="60" stroke-opacity="0.10"/><path d="' + kd + '" stroke-width="36" stroke-opacity="0.16"/>' +
        '<path d="' + kd + '" stroke-width="16" stroke-opacity="0.26"/></g>');
      var wd = '';
      streuen([[RAND, RAND], [W - RAND, RAND], [W - RAND, H - RAND], [RAND, H - RAND]], 74, rnd, function (p) {
        return imMeer(p) && abstandLinie(p, kuestePts) > 46;
      }).forEach(function (p) { wd += 'M' + r1(p[0] - 9) + ' ' + r1(p[1]) + 'q4.5 -5 9 0t9 0'; });
      out.push('<path d="' + wd + '" fill="none" stroke="' + F.welle + '" stroke-width="1.6" stroke-linecap="round"/>');
      out.push('<path d="' + kd + '" fill="none" stroke="' + F.kueste + '" stroke-width="2.4" stroke-linejoin="round"/>');
      liste.push({ typ: 'meer', pts: meerPoly });
    }

    // Wege
    wegDaten.forEach(function (wd2) {
      if (!wd2) return;
      var w = wd2.w;
      out.push(wegSvg(glatt(wd2.fein, false), w.art || 'strasse', tinteVon(w.bekannt), w.bekannt === 'gehoert', w.trasse));
      if (w.pfeil) {
        var e2 = wd2.pts[wd2.pts.length - 1], e1 = wd2.pts[wd2.pts.length - 2], ux = e2[0] - e1[0], uy = e2[1] - e1[1], ul = Math.hypot(ux, uy) || 1;
        ux /= ul; uy /= ul;
        out.push('<path d="M' + r1(e2[0] + ux * 10) + ' ' + r1(e2[1] + uy * 10) + 'L' + r1(e2[0] - uy * 7) + ' ' + r1(e2[1] + ux * 7) + 'L' + r1(e2[0] + uy * 7) + ' ' + r1(e2[1] - ux * 7) + 'Z" fill="' + tinteVon(w.bekannt) + '"/>');
      }
      liste.push({ typ: 'weg', art: w.art || 'strasse', pts: wd2.pts, bekannt: w.bekannt, trasse: !!w.trasse });
    });
    out.push('</g>');

    // Orte
    var randzeiger = [];
    orte.forEach(function (o) {
      var p = P([o.x, o.y]);
      o._px = p[0]; o._py = p[1];
      if (!sichtbar(p, 4)) { randzeiger.push(o); return; }
      var tinte = tinteVon(o.bekannt), gz = ZEICHEN[o.art] || ZEICHEN.punkt;
      out.push('<g class="kO" data-i="' + o._i + '" transform="translate(' + r1(p[0]) + ' ' + r1(p[1]) + ')">' +
        '<circle r="34" fill="transparent"/><circle class="kR" r="25" fill="none" stroke="' + F.varrin + '" stroke-width="2.4" stroke-dasharray="5 4"/>' +
        '<g fill="none" stroke="' + tinte + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"' +
        (o.bekannt === 'gehoert' ? ' stroke-dasharray="3 3" opacity="0.8"' : '') + '>' + gz + '</g></g>');
      liste.push({ typ: 'ort', x: p[0], y: p[1], id: o.id });
    });

    // ---------- Beschriftungen mit Platzsuche ----------
    var belegt = [], belegt2 = [], proben = [];
    wegDaten.forEach(function (wd2) {
      if (!wd2) return;
      for (var i = 1; i < wd2.pts.length; i++) {
        var a2 = wd2.pts[i - 1], b2 = wd2.pts[i], n2 = Math.max(1, Math.round(Math.hypot(b2[0] - a2[0], b2[1] - a2[1]) / 9));
        for (var j = 0; j <= n2; j++) proben.push([a2[0] + (b2[0] - a2[0]) * j / n2, a2[1] + (b2[1] - a2[1]) * j / n2]);
      }
    });
    function kasten(x, y, inhalt, gr, anker, kursiv, sperren) {
      var z = String(inhalt).split('\n'), n = Math.max.apply(0, z.map(function (s) { return s.length; }));
      var b = n * (gr * (kursiv ? 0.43 : 0.46) + (sperren || 0));
      var x0 = anker === 'middle' ? x - b / 2 : anker === 'end' ? x - b : x;
      return { x0: x0 - 3, x1: x0 + b + 3, y0: y - gr * 0.8, y1: y + gr * 0.28 + (z.length - 1) * gr * 1.1 };
    }
    function ueberdeckt(a3, b3) {
      var w3 = Math.min(a3.x1, b3.x1) - Math.max(a3.x0, b3.x0), h3 = Math.min(a3.y1, b3.y1) - Math.max(a3.y0, b3.y0);
      return w3 > 0 && h3 > 0 ? w3 * h3 : 0;
    }
    function kosten(b, rang2) {
      var k = 0, i;
      for (i = 0; i < belegt.length; i++) k += ueberdeckt(b, belegt[i]) * 4;
      if (rang2) for (i = 0; i < belegt2.length; i++) k += ueberdeckt(b, belegt2[i]) * 4;
      if (b.x0 < RAND + 2 || b.x1 > W - RAND - 2 || b.y0 < RAND + 2 || b.y1 > H - RAND - 2) k += 1e6;
      for (i = 0; i < proben.length; i++) { var p = proben[i]; if (p[0] > b.x0 && p[0] < b.x1 && p[1] > b.y0 && p[1] < b.y1) k += 40; }
      return k;
    }
    function merke(b, rang2) { (rang2 ? belegt2 : belegt).push(b); }
    function nass(x, y, gr) { return imMeer([x, y - gr * 0.3]); }
    function vermerke(x, y, t, gr, anker, rang, kursiv) { liste.push({ typ: 'text', x: x, y: y, t: t, gr: gr, anker: anker, rang: rang, kursiv: kursiv }); }

    orte.forEach(function (o) {
      if (sichtbar([o._px, o._py], 4)) belegt.push({ x0: o._px - 19, x1: o._px + 19, y0: o._py - 23, y1: o._py + 13 });
    });

    // Kompass
    var kx = W - RAND - 52, ky = RAND + 66;
    if (D.kompass) { var kq = P(D.kompass); kx = kq[0]; ky = kq[1]; }
    out.push('<g transform="translate(' + r1(kx) + ' ' + r1(ky) + ')" stroke="' + F.kohle + '" stroke-width="1.4" stroke-linejoin="round">' +
      '<circle r="24" fill="none" stroke-opacity="0.55"/><path d="M0 -38L6 0 0 38 -6 0Z" class="kP"/><path d="M0 -38L6 0H-6Z" fill="' + F.kohle + '"/>' +
      '<path d="M-30 0L0 5 30 0 0 -5Z" class="kP"/></g>');
    out.push(text(kx, ky - 44, 'N', { groesse: 25, anker: 'middle', fell: true }));
    belegt.push({ x0: kx - 34, x1: kx + 34, y0: ky - 66, y1: ky + 42 });
    liste.push({ typ: 'ort', x: kx, y: ky, id: 'kompass' });

    // Kartusche mit Titel, Stand und Maßstab (Standard: unten links)
    if (D.titel) {
      var tb = Math.round(Math.max(D.titel.length * 17, (D.stand || '').length * 10.2, K + 14 + 15 * 23 * 0.43) + 40), th = D.stand ? 118 : 92;
      var ecke = D.titelEcke || 'ul', tx = ecke.charAt(1) === 'r' ? W - RAND - 14 - tb : RAND + 14, ty = ecke.charAt(0) === 'o' ? RAND + 14 : H - RAND - 14 - th;
      out.push('<rect x="' + r1(tx) + '" y="' + r1(ty) + '" width="' + tb + '" height="' + th + '" rx="6" class="kP" stroke="' + F.rahmen + '" stroke-width="1.6"/>');
      out.push('<rect x="' + r1(tx + 5) + '" y="' + r1(ty + 5) + '" width="' + (tb - 10) + '" height="' + (th - 10) + '" rx="4" fill="none" stroke="' + F.rahmen + '" stroke-width="0.8"/>');
      out.push(text(tx + 20, ty + 42, D.titel, { groesse: 34, fell: true }));
      if (D.stand) out.push(text(tx + 20, ty + 70, D.stand, { groesse: 23, kursiv: true, farbe: '#5a4a3a' }));
      var mx = tx + 20, my = ty + th - 22;
      out.push('<path d="M' + r1(mx) + ' ' + r1(my) + 'h' + K + 'M' + r1(mx) + ' ' + r1(my - 7) + 'v14M' + r1(mx + K / 2) + ' ' + r1(my - 4) + 'v8M' + r1(mx + K) + ' ' + r1(my - 7) + 'v14" fill="none" stroke="' + F.kohle + '" stroke-width="2.2"/>');
      out.push(text(mx + K + 14, my + 8, '1 Stunde zu Fuß', { groesse: 23, kursiv: true }));
      belegt.push({ x0: tx - 4, x1: tx + tb + 4, y0: ty - 4, y1: ty + th + 4 });
      liste.push({ typ: 'kasten', x: tx, y: ty, b: tb, h: th });
    }

    // Gebiete und Küste (feste Lage)
    flaechen.forEach(function (fl) {
      if (!fl.g.name || !fl.g.beschriftung) return;
      var st = FLAECHE[fl.g.art] || FLAECHE.sumpf, q = P(fl.g.beschriftung), gr = fl.g.groesse || 30, sp = fl.g.sperren || 3, r2 = fl.g.rang === 2;
      out.push(text(q[0], q[1], fl.g.name, { groesse: gr, anker: 'middle', farbe: st.text, kursiv: true, fell: true, sperren: sp, rang: fl.g.rang, meer: nass(q[0], q[1], gr) }));
      merke(kasten(q[0], q[1], fl.g.name, gr, 'middle', true, sp), r2);
      vermerke(q[0], q[1], fl.g.name, gr, 'middle', r2 ? 2 : 1, true);
    });
    if (D.kueste && D.kueste.name && D.kueste.beschriftung) {
      var qm = P(D.kueste.beschriftung);
      out.push(text(qm[0], qm[1], D.kueste.name, { groesse: 28, anker: 'middle', farbe: '#46696d', kursiv: true, fell: true, sperren: 3, meer: nass(qm[0], qm[1], 28) }));
      merke(kasten(qm[0], qm[1], D.kueste.name, 28, 'middle', true, 3), false);
      vermerke(qm[0], qm[1], D.kueste.name, 28, 'middle', 1, true);
    }

    // Notizen: feste Lage (x, y) oder neben einem Ort (ort)
    function notizZeilen(n) {
      if (n.zeilen) return n.zeilen;
      return String(n.text).split('\n').map(function (t) { return { text: t, tinte: n.tinte, durch: n.durch }; });
    }
    function notizBox(n, x, y, anker, gr) {
      return kasten(x, y, notizZeilen(n).map(function (z) { return z.text; }).join('\n'), gr, anker, true);
    }
    function notizZeichnen(n, x, y, anker, gr, r2) {
      var zeilen = notizZeilen(n), s = '';
      zeilen.forEach(function (z, i) {
        var farbe = z.tinte === 'varrin' ? F.varrin : F.kohle, yy = y + i * gr * 1.1, o2 = { groesse: gr, anker: anker, farbe: farbe, kursiv: true, unten: true, meer: nass(x, yy, gr) };
        if (n.verwischt) {
          s += text(x + 2, yy + 1.5, z.text, { groesse: gr, anker: anker, farbe: farbe, kursiv: true, unten: true, deckkraft: 0.3 }) +
            text(x - 1.5, yy - 1, z.text, { groesse: gr, anker: anker, farbe: farbe, kursiv: true, unten: true, deckkraft: 0.3 });
          o2.deckkraft = 0.6;
        }
        s += text(x, yy, z.text, o2);
        if (z.durch) {
          var breite = z.text.length * gr * 0.42, x0 = anker === 'middle' ? x - breite / 2 : anker === 'end' ? x - breite : x;
          s += '<path d="M' + r1(x0 - 4) + ' ' + r1(yy - gr * 0.3) + 'q' + r1(breite / 2) + ' -5 ' + r1(breite + 8) + ' 2" fill="none" stroke="' + farbe + '" stroke-width="2.2" stroke-linecap="round"/>';
        }
      });
      out.push('<g class="kNotiz' + (r2 ? ' k2' : '') + '">' + s + '</g>');
      vermerke(x, y, zeilen.map(function (z) { return z.text; }).join('\n'), gr, anker, r2 ? 2 : 1, true);
    }
    var NOTIZLAGE = [[0, 62, 'middle'], [0, -54, 'middle'], [34, 6, 'start'], [-34, 6, 'end'], [30, 50, 'start'], [-30, 50, 'end'], [30, -40, 'start'], [-30, -40, 'end'], [0, 92, 'middle'], [0, -84, 'middle']];
    function notizSetzen(n) {
      var o = idx[n.ort], r2 = (n.rang || 2) === 2, gr = r2 ? 21 : 23, best = null;
      if (!o || o._px == null) return;
      NOTIZLAGE.forEach(function (l, i) {
        var x = o._px + l[0], y = o._py + l[1], b = notizBox(n, x, y, l[2], gr), k = kosten(b, r2) + i * 25;
        if (!best || k < best.k) best = { k: k, x: x, y: y, anker: l[2], b: b };
      });
      if (!best || best.k >= 1e6) return;
      merke(best.b, r2);
      notizZeichnen(n, best.x, best.y, best.anker, gr, r2);
    }
    notizen.forEach(function (n) {
      if (n.ort) return;
      var q = P([n.x, n.y]), r2 = (n.rang || 2) === 2, gr = r2 ? 21 : 23, anker = n.anker || 'middle';
      merke(notizBox(n, q[0], q[1], anker, gr), r2);
      notizZeichnen(n, q[0], q[1], anker, gr, r2);
    });

    // Randzeiger für Orte außerhalb (feste Lage)
    randzeiger.forEach(function (o) {
      var wd2 = null;
      wegDaten.forEach(function (w) { if (w && (w.w.von === o.id || w.w.nach === o.id)) wd2 = w; });
      var punkt = null, richtung = null, c = [W / 2, H / 2], innen = 40;
      if (wd2) {
        var pts = wd2.w.nach === o.id ? wd2.pts : wd2.pts.slice().reverse();
        for (var i = pts.length - 1; i > 0; i--) {
          if (sichtbar(pts[i - 1], innen)) {
            var a1 = pts[i - 1], b1 = pts[i], t0 = 0, t1 = 1;
            for (var k2 = 0; k2 < 24; k2++) { var tm = (t0 + t1) / 2, pm = [a1[0] + (b1[0] - a1[0]) * tm, a1[1] + (b1[1] - a1[1]) * tm]; if (sichtbar(pm, innen)) t0 = tm; else t1 = tm; }
            punkt = [a1[0] + (b1[0] - a1[0]) * t0, a1[1] + (b1[1] - a1[1]) * t0]; richtung = [b1[0] - a1[0], b1[1] - a1[1]];
            break;
          }
        }
      }
      if (!punkt) {
        var dx = o._px - c[0], dy = o._py - c[1], f = Math.min(Math.abs((W / 2 - innen) / (dx || 1e-9)), Math.abs((H / 2 - innen) / (dy || 1e-9)));
        punkt = [c[0] + dx * f, c[1] + dy * f]; richtung = [dx, dy];
      }
      var pfeil = Math.abs(richtung[0]) > Math.abs(richtung[1]) ? (richtung[0] > 0 ? '→' : '←') : (richtung[1] > 0 ? '↓' : '↑');
      var zeit = wd2 && wd2.w.zeit ? ' · ' + wd2.w.zeit : '', inhalt, anker, x = punkt[0], y = punkt[1], unten = o.zeigerLage === 'u';
      if (pfeil === '→') { inhalt = o.name + zeit + ' →'; anker = 'end'; y += unten ? 32 : -14; }
      else if (pfeil === '←') { inhalt = '← ' + o.name + zeit; anker = 'start'; y += unten ? 32 : -14; }
      else if (pfeil === '↑') { inhalt = '↑ ' + o.name + zeit; anker = 'middle'; y += 4; }
      else { inhalt = o.name + zeit + ' ↓'; anker = 'middle'; }
      out.push('<g class="kO" data-i="' + o._i + '">' + text(x, y, inhalt, { groesse: 25, anker: anker, farbe: tinteVon(o.bekannt), kursiv: true, meer: nass(x, y, 25) }) + '</g>');
      merke(kasten(x, y, inhalt, 25, anker, true), false);
      vermerke(x, y, inhalt, 25, anker, 1, true);
    });

    // Ortsnamen und Wegzeiten: beste freie Stelle suchen
    var REIHE = ['r', 'l', 'u', 'o', 'ur', 'ul', 'or', 'ol'];
    function ortsname(o, rang2) {
      var gr = rang2 ? 21 : (o.art === 'stadt' ? 28 : 25), name = o.beschriftung || o.name, zeilen = name.split('\n').length;
      var kursiv = o.bekannt === 'gehoert', best = null;
      var kand = (o.lage ? [o.lage] : []).concat(REIHE.filter(function (l) { return l !== o.lage; }));
      kand.forEach(function (lg, i) {
        var l = LAGE[lg], x = o._px + l[0], y = o._py + l[1];
        if (zeilen > 1) { if (lg.charAt(0) === 'o') y -= (zeilen - 1) * gr * 1.1; else if (lg.charAt(0) !== 'u') y -= (zeilen - 1) * gr * 0.55; }
        var b = kasten(x, y, name, gr, l[2], kursiv), k = kosten(b, rang2) + i * 30;
        if (!best || k < best.k) best = { k: k, x: x, y: y, anker: l[2], b: b };
      });
      merke(best.b, rang2);
      out.push(text(best.x, best.y, name, { groesse: gr, anker: best.anker, farbe: tinteVon(o.bekannt), kursiv: kursiv, rang: rang2 ? 2 : 1, unten: true, meer: nass(best.x, best.y, gr) }));
      vermerke(best.x, best.y, name, gr, best.anker, rang2 ? 2 : 1, kursiv);
    }
    function wegzeit(wd2, rang2) {
      var w = wd2.w, gr = rang2 ? 21 : 23, farbe = w.art === 'wasser' || w.art === 'graben' ? F.wasser : tinteVon(w.bekannt);
      var anteile = [w.zeitBei == null ? 0.5 : w.zeitBei, 0.5, 0.38, 0.62, 0.28, 0.72], s0 = w.zeitSeite || 1, best = null, i = 0;
      anteile.forEach(function (an) {
        [s0, -s0].forEach(function (s) {
          var m = mitte(wd2.pts, an), nx = m.nx * s, ny = m.ny * s, x, y, anker;
          if (Math.abs(nx) > Math.abs(ny)) { anker = nx > 0 ? 'start' : 'end'; x = m.x + nx * 14; y = m.y + 8; }
          else { anker = 'middle'; x = m.x; y = ny > 0 ? m.y + 30 : m.y - 12; }
          var b = kasten(x, y, w.zeit, gr, anker, true), k = kosten(b, rang2) + (i++) * 15;
          if (!best || k < best.k) best = { k: k, x: x, y: y, anker: anker, b: b };
        });
      });
      if (!best || best.k >= 1e6) return;
      merke(best.b, rang2);
      out.push(text(best.x, best.y, w.zeit, { groesse: gr, anker: best.anker, farbe: farbe, kursiv: true, rang: rang2 ? 2 : 1, meer: nass(best.x, best.y, gr) }));
      vermerke(best.x, best.y, w.zeit, gr, best.anker, rang2 ? 2 : 1, true);
    }
    function zeitTragend(wd2) {
      if (!wd2 || !wd2.w.zeit) return false;
      var v = idx[wd2.w.von], n = idx[wd2.w.nach];
      return !(v && randzeiger.indexOf(v) >= 0) && !(n && randzeiger.indexOf(n) >= 0);
    }
    [false, true].forEach(function (rang2) {
      orte.forEach(function (o) { if (randzeiger.indexOf(o) < 0 && (o.rang === 2) === rang2) ortsname(o, rang2); });
      wegDaten.forEach(function (wd2) { if (zeitTragend(wd2) && (wd2.w.rang === 2) === rang2) wegzeit(wd2, rang2); });
      notizen.forEach(function (n) { if (n.ort && ((n.rang || 2) === 2) === rang2) notizSetzen(n); });
    });

    out.push('<rect x="' + (RAND - 6) + '" y="' + (RAND - 6) + '" width="' + (W - 2 * RAND + 12) + '" height="' + (H - 2 * RAND + 12) + '" rx="8" fill="none" stroke="' + F.rahmen + '" stroke-width="1.2"/>');
    out.push('</svg>');

    // Legende (HTML)
    var arten = {}, leg = '';
    wege.forEach(function (w) { arten[w.art || 'strasse'] = true; });
    Object.keys(WEGNAME).forEach(function (art) {
      if (!arten[art]) return;
      leg += '<span><svg width="46" height="16" viewBox="0 0 46 16" aria-hidden="true"><rect width="46" height="16" rx="3" class="kP"/>' + wegSvg('M5 8H41', art, F.kohle, false, false) + '</svg>' + WEGNAME[art] + '</span>';
    });
    if (wege.some(function (w) { return w.trasse; })) leg += '<span><svg width="46" height="16" viewBox="0 0 46 16" aria-hidden="true"><rect width="46" height="16" rx="3" class="kP"/>' + wegSvg('M5 8H41', 'pfad', F.varrin, false, true) + '</svg>' + esc(D.trassenname || 'Geplante Trasse') + '</span>';
    leg += '<span><svg width="46" height="16" viewBox="0 0 46 16" aria-hidden="true"><rect width="46" height="16" rx="3" class="kP"/><path d="M5 8H41" stroke="' + F.kohle + '" stroke-width="3"/></svg>Selbst gesehen</span>';
    leg += '<span><svg width="46" height="16" viewBox="0 0 46 16" aria-hidden="true"><rect width="46" height="16" rx="3" class="kP"/><path d="M5 8H41" stroke="' + F.varrin + '" stroke-width="3"/></svg>' + esc(D.kartenquelle || 'Fremde Karte') + '</span>';
    leg += '<span><svg width="46" height="16" viewBox="0 0 46 16" aria-hidden="true"><rect width="46" height="16" rx="3" class="kP"/><path d="M5 8H41" stroke="' + F.kohle + '" stroke-width="3" stroke-dasharray="7 6" opacity="0.72"/></svg>Vom Hörensagen</span>';

    return { svg: out.join(''), breite: W, hoehe: H, orte: orte, legende: leg, liste: liste };
  }

  /* ---------- Spoilerprüfung (nur für die Spielleitung) ---------- */
  // pruefen(D, { spielstand, spoiler }) gleicht die Kartendaten mit dem Spielstand ab.
  // Grundsatz: Die Karte zeigt nur, was im Spielstand steht. Jedes Wort, jede Zahl, jeder Ort
  // und jede Reisezeit muss sich dort finden. Was nur in der Spoilerdatei steht, ist ein Fehler.
  // Die Spoilerdatei wird nur gelesen, nie ausgegeben.
  var WAHL = {
    ecke: ['ol', 'ul', 'or', 'ur'], meer: ['s', 'n', 'o', 'w'], zeigerLage: ['u', 'o'], anker: ['start', 'middle', 'end'],
    tinte: ['kohle', 'varrin'], rang: [1, 2], bekannt: Object.keys(BEKANNT), lage: Object.keys(LAGE),
    ortsart: Object.keys(ZEICHEN), wegart: Object.keys(WEGNAME), gebietsart: Object.keys(FLAECHE)
  };
  var FELDER = {
    karte: { titel: 'text', stand: 'text', titelEcke: 'ecke', ausschnitt: 'rahmen', kompass: 'punkt', kartenquelle: 'text', trassenname: 'text',
      kueste: 'kueste', gebiete: 'gebiet[]', orte: 'ort[]', wege: 'weg[]', notizen: 'notiz[]' },
    kueste: { linie: 'punkte', meer: 'meer', name: 'text', beschriftung: 'punkt' },
    gebiet: { art: 'gebietsart', punkte: 'punkte', name: 'text', beschriftung: 'punkt', groesse: 'zahl', sperren: 'zahl', nebel: 'zahl', rang: 'rang' },
    ort: { id: 'id', name: 'text', namen: 'text[]', x: 'zahl', y: 'zahl', art: 'ortsart', bekannt: 'bekannt', quelle: 'text', notiz: 'text',
      beschriftung: 'text', lage: 'lage', rang: 'rang', zeigerLage: 'zeigerLage' },
    weg: { von: 'id', nach: 'id', bis: 'punkt', punkte: 'punkte', ueber: 'punkte', art: 'wegart', bekannt: 'bekannt', quelle: 'text', zeit: 'text',
      trasse: 'ja', pfeil: 'ja', rang: 'rang', zeitBei: 'zahl', zeitSeite: 'zahl' },
    notiz: { ort: 'id', x: 'zahl', y: 'zahl', anker: 'anker', text: 'text', zeilen: 'zeile[]', tinte: 'tinte', durch: 'ja', verwischt: 'ja', rang: 'rang' },
    zeile: { text: 'text', tinte: 'tinte', durch: 'ja' }
  };
  var PFLICHT = { karte: ['titel', 'stand'], kueste: ['linie'], gebiet: ['art', 'punkte'], ort: ['id', 'name', 'x', 'y', 'art', 'bekannt'], weg: ['bekannt'], notiz: [], zeile: ['text'] };
  var ZAHLWORT = { 1: 'eine|einer|einen|ein|eins', 2: 'zwei', 3: 'drei', 4: 'vier', 5: 'fuenf', 6: 'sechs', 7: 'sieben', 8: 'acht', 9: 'neun', 10: 'zehn', 11: 'elf', 12: 'zwoelf' };

  var AKZENT = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(AKZENT, '');
  }
  function woerterVon(s) { return norm(s).match(/[a-z]{3,}/g) || []; }
  function wortschatz(s) {
    var ws = { exakt: {}, fach: {} };
    woerterVon(s).forEach(function (w) {
      if (ws.exakt[w]) return;
      ws.exakt[w] = true;
      (ws.fach[w.slice(0, 3)] = ws.fach[w.slice(0, 3)] || []).push(w);
    });
    return ws;
  }
  function verwandt(a, b) {
    var n = 0, m = Math.min(a.length, b.length), lang = Math.max(a.length, b.length);
    while (n < m && a.charCodeAt(n) === b.charCodeAt(n)) n++;
    return n >= Math.min(4, m) && lang - n <= (m < 5 ? 2 : 3);
  }
  function kennt(ws, w, alsAnfang) {
    if (ws.exakt[w]) return true;
    return (ws.fach[w.slice(0, 3)] || []).some(function (x) { return verwandt(w, x) || (alsAnfang && w.length >= 4 && x.indexOf(w) === 0); });
  }
  function zahlBekannt(stand, nStand, z) {
    if (new RegExp('(^|[^0-9])' + z + '([^0-9]|$)').test(stand)) return true;
    return !!ZAHLWORT[+z] && new RegExp('(^|[^a-z])(' + ZAHLWORT[+z] + ')([^a-z]|$)').test(nStand);
  }
  function regexText(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function kommtVor(text, form) {
    form = norm(form).trim();
    return !!form && new RegExp('(^|[^a-z0-9])' + regexText(form) + '(s|es|n|en|e|er|ern|em)?([^a-z0-9]|$)').test(text);
  }
  function zahlIn(zeile, n) {
    return new RegExp('(^|[^0-9a-z])(' + n + (ZAHLWORT[n] ? '|' + ZAHLWORT[n] : '') + ')(,[0-9]+)? ?(h\\b|std\\b|stunden?\\b|tage?\\b)').test(zeile);
  }
  function stelle(zeile, formen) {
    var best = -1;
    formen.forEach(function (f) { var m = new RegExp('(^|[^a-z0-9])' + regexText(norm(f).trim())).exec(zeile); if (m && (best < 0 || m.index < best)) best = m.index; });
    return best;
  }
  function verbunden(zeile, fa, fb) {
    var a = stelle(zeile, fa), b = stelle(zeile, fb);
    if (a < 0 || b < 0) return false;
    var von = Math.min(a, b), bis = Math.max(a, b), dazwischen = zeile.slice(von, bis);
    return bis - von <= 70 && /(–|-|\bnach\b|\bzum\b|\bzur\b|\bbis\b|\bund\b|\bvom\b|\bvon\b)/.test(dazwischen);
  }
  function istZahl(z) { return typeof z === 'number' && isFinite(z); }
  function istPunkt(p) { return Array.isArray(p) && p.length === 2 && istZahl(p[0]) && istZahl(p[1]); }

  function pruefen(D, quellen) {
    quellen = quellen || {};
    var fehler = [], hinweise = [], schon = {}, texte = [], ids = {}, idWoerter = [];
    function melde(liste, s) { if (!schon[s]) { schon[s] = true; liste.push(s); } }
    var stand = String(quellen.spielstand || ''), spoiler = String(quellen.spoiler || '');
    if (!stand.trim()) melde(fehler, 'Spielstand fehlt: Ohne ihn lässt sich nichts belegen.');
    if (!spoiler.trim()) melde(fehler, 'Spoilerdatei fehlt: Ohne sie keine Freigabe.');
    var wStand = wortschatz(stand), wSpoiler = wortschatz(spoiler);
    var nStand = norm(stand), zeilenStand = stand.split('\n').map(norm);

    if (!D || typeof D !== 'object' || Array.isArray(D)) return { ok: false, fehler: ['Kartendaten fehlen oder sind kein Objekt.'], hinweise: [] };
    (Array.isArray(D.orte) ? D.orte : []).forEach(function (o) { if (o && typeof o.id === 'string') ids[o.id] = ids[o.id] ? 'doppelt' : o; });
    function ortName(id) { var o = ids[id]; return o && o !== 'doppelt' ? o.name : id; }
    function etikett(typ, x, i, wo) {
      x = x && typeof x === 'object' ? x : {};
      if (typ === 'ort') return 'Ort ' + (x.name || x.id || i + 1);
      if (typ === 'gebiet') return 'Gebiet ' + (x.name || i + 1);
      if (typ === 'notiz') return 'Notiz ' + (i + 1) + (x.ort ? ' bei ' + ortName(x.ort) : '');
      if (typ === 'zeile') return wo + ', Zeile ' + (i + 1);
      if (typ === 'weg') return 'Weg ' + (x.punkte ? 'Linie ' + (i + 1) : ortName(x.von) + ' – ' + (x.nach ? ortName(x.nach) : 'Punkt'));
      return wo + ' ' + (i + 1);
    }
    function wert(v, typ, wo) {
      if (v === undefined) return;
      if (/\[\]$/.test(typ)) {
        var t = typ.slice(0, -2);
        if (!Array.isArray(v)) { melde(fehler, wo + ': muss eine Liste sein'); return; }
        v.forEach(function (x, i) { wert(x, t, FELDER[t] ? etikett(t, x, i, wo) : wo); });
        return;
      }
      if (FELDER[typ]) { objekt(v, typ, wo); return; }
      if (WAHL[typ]) { if (WAHL[typ].indexOf(v) < 0) melde(fehler, wo + ': „' + v + '“ ist nicht erlaubt (' + WAHL[typ].join(', ') + ')'); return; }
      if (typ === 'text') { if (typeof v !== 'string') melde(fehler, wo + ': muss Text sein'); else texte.push({ t: v, wo: wo }); return; }
      if (typ === 'id') { if (typeof v !== 'string' || !/^[a-z0-9_-]+$/.test(v)) melde(fehler, wo + ': id nur aus Kleinbuchstaben, Ziffern, - und _'); else idWoerter.push({ t: v, wo: wo }); return; }
      if (typ === 'zahl') { if (!istZahl(v)) melde(fehler, wo + ': muss eine Zahl sein'); return; }
      if (typ === 'ja') { if (typeof v !== 'boolean') melde(fehler, wo + ': muss true oder false sein'); return; }
      if (typ === 'punkt') { if (!istPunkt(v)) melde(fehler, wo + ': muss [x, y] sein'); return; }
      if (typ === 'punkte') { if (!Array.isArray(v) || !v.every(istPunkt)) melde(fehler, wo + ': muss eine Liste aus [x, y] sein'); return; }
      if (typ === 'rahmen') { if (!Array.isArray(v) || v.length !== 4 || !v.every(istZahl)) melde(fehler, wo + ': muss [xMin, yMin, xMax, yMax] sein'); return; }
    }
    function objekt(o, typ, wo) {
      if (!o || typeof o !== 'object' || Array.isArray(o)) { melde(fehler, wo + ': muss ein Objekt sein'); return; }
      Object.keys(o).forEach(function (k) {
        if (!FELDER[typ][k]) melde(fehler, wo + ': Feld „' + k + '“ gibt es nicht. Alles in den Kartendaten steht lesbar im Widget.');
        else wert(o[k], FELDER[typ][k], typ === 'karte' && /\[\]$/.test(FELDER[typ][k]) ? wo : (FELDER[FELDER[typ][k]] ? (typ === 'karte' ? 'Küste' : wo) : wo + ' (' + k + ')'));
      });
      PFLICHT[typ].forEach(function (k) { if (o[k] === undefined) melde(fehler, wo + ': „' + k + '“ fehlt'); });
    }
    objekt(D, 'karte', 'Karte');

    // Orte: Name, Quelle, Herkunft
    (Array.isArray(D.orte) ? D.orte : []).forEach(function (o, i) {
      if (!o || typeof o !== 'object') return;
      var wo = etikett('ort', o, i);
      if (ids[o.id] === 'doppelt') melde(fehler, wo + ': id „' + o.id + '“ kommt mehrfach vor');
      if (o.bekannt === 'gehoert' && !o.quelle) melde(fehler, wo + ': vom Hörensagen, aber ohne „quelle“');
      if (typeof o.quelle === 'string' && !kommtVor(nStand, o.quelle)) melde(fehler, wo + ': Quelle „' + o.quelle + '“ steht nicht im Spielstand');
      var formen = [o.name].concat(Array.isArray(o.namen) ? o.namen : []).filter(function (f) { return typeof f === 'string'; });
      if (!formen.some(function (f) { return kommtVor(nStand, f); })) melde(fehler, wo + ': Der Name steht nicht im Spielstand');
    });

    // Wege: Endpunkte, Verbindung und Reisezeit müssen im Spielstand stehen
    (Array.isArray(D.wege) ? D.wege : []).forEach(function (w, i) {
      if (!w || typeof w !== 'object') return;
      var wo = etikett('weg', w, i), v = ids[w.von], n = ids[w.nach];
      if (w.bekannt === 'gehoert' && !w.quelle) melde(fehler, wo + ': vom Hörensagen, aber ohne „quelle“');
      if (typeof w.quelle === 'string' && !kommtVor(nStand, w.quelle)) melde(fehler, wo + ': Quelle „' + w.quelle + '“ steht nicht im Spielstand');
      if (w.punkte) {
        if (w.von || w.nach || w.zeit) melde(fehler, wo + ': Eine Linie aus „punkte“ hat weder Orte noch Reisezeit');
        return;
      }
      if (!v || v === 'doppelt') { melde(fehler, wo + ': Startort „' + w.von + '“ fehlt in den Orten'); return; }
      if (w.nach !== undefined && (!n || n === 'doppelt')) { melde(fehler, wo + ': Zielort „' + w.nach + '“ fehlt in den Orten'); return; }
      if (w.nach === undefined && !w.bis) { melde(fehler, wo + ': Weg ohne Ziel („nach“ oder „bis“)'); return; }
      if (!n) { if (w.zeit) melde(fehler, wo + ': Ein Weg ins Ungewisse („bis“) hat keine Reisezeit'); return; }
      function formenVon(o) { return [o.name].concat(Array.isArray(o.namen) ? o.namen : []).filter(function (f) { return typeof f === 'string'; }); }
      var fv = formenVon(v), fn = formenVon(n), zahlen = typeof w.zeit === 'string' ? (w.zeit.match(/\d+/g) || []) : [];
      if (typeof w.zeit === 'string' && !zahlen.length) melde(fehler, wo + ': Reisezeit „' + w.zeit + '“ ohne Zahl lässt sich nicht belegen');
      var zeilen = zeilenStand.filter(function (zl) {
        return fv.some(function (f) { return kommtVor(zl, f); }) && fn.some(function (f) { return kommtVor(zl, f); });
      });
      if (zahlen.length) {
        if (!zeilen.some(function (zl) { return zahlen.every(function (z) { return zahlIn(zl, +z); }); }))
          melde(fehler, wo + ': Reisezeit „' + w.zeit + '“ steht in keiner Zeile, die beide Orte nennt');
      } else if (!zeilen.some(function (zl) { return verbunden(zl, fv, fn); })) {
        melde(fehler, wo + ': Keine Zeile im Spielstand verbindet beide Orte (Namen nah beieinander mit „–“, „nach“, „zum“ oder „und“)');
      }
    });

    // Notizen: Ort oder feste Lage, Inhalt
    (Array.isArray(D.notizen) ? D.notizen : []).forEach(function (nz, i) {
      if (!nz || typeof nz !== 'object') return;
      var wo = etikett('notiz', nz, i);
      if (nz.ort !== undefined && (!ids[nz.ort] || ids[nz.ort] === 'doppelt')) melde(fehler, wo + ': Ort „' + nz.ort + '“ fehlt in den Orten');
      if (nz.ort === undefined && (!istZahl(nz.x) || !istZahl(nz.y))) melde(fehler, wo + ': braucht „ort“ oder „x“ und „y“');
      if (nz.text === undefined && !nz.zeilen) melde(fehler, wo + ': ohne Inhalt');
    });

    // Wortschatz: jedes Wort und jede Zahl aus dem Spielstand, nichts aus der Spoilerdatei
    texte.forEach(function (x) {
      woerterVon(x.t).forEach(function (w) {
        if (kennt(wStand, w)) return;
        if (kennt(wSpoiler, w)) melde(fehler, x.wo + ': „' + w + '“ steht nur in der Spoilerdatei');
        else melde(fehler, x.wo + ': „' + w + '“ steht nicht im Spielstand');
      });
      (x.t.match(/\d+/g) || []).forEach(function (z) {
        if (!zahlBekannt(stand, nStand, z)) melde(fehler, x.wo + ': Zahl ' + z + ' steht nicht im Spielstand');
      });
    });
    idWoerter.forEach(function (x) {
      woerterVon(x.t).forEach(function (w) {
        if (!kennt(wStand, w, true) && kennt(wSpoiler, w, true)) melde(fehler, x.wo + ': id „' + x.t + '“ enthält „' + w + '“ aus der Spoilerdatei');
      });
    });
    var orte = Array.isArray(D.orte) ? D.orte.length : 0, wege = Array.isArray(D.wege) ? D.wege.length : 0;
    if (!orte) melde(hinweise, 'Die Karte hat keine Orte.');
    return { ok: fehler.length === 0, fehler: fehler, hinweise: hinweise, orte: orte, wege: wege };
  }

  var SVG_CSS =
    '.kP{fill:#efe2c3}.kPs{stroke:#efe2c3}.kH{stroke:#efe2c3}.kM{fill:#c5d5cf}' +
    '[data-mode="dark"] .kP{fill:#d8c9a3}[data-mode="dark"] .kPs,[data-mode="dark"] .kH{stroke:#d8c9a3}[data-mode="dark"] .kM{fill:#b2c3bd}[data-mode="dark"] .kHm{stroke:#b2c3bd}' +
    '@media (prefers-color-scheme:dark){:root:not([data-mode]) .kP{fill:#d8c9a3}:root:not([data-mode]) .kPs,:root:not([data-mode]) .kH{stroke:#d8c9a3}:root:not([data-mode]) .kM{fill:#b2c3bd}:root:not([data-mode]) .kHm{stroke:#b2c3bd}}' +
    '.kT{font-family:"EB Garamond",Garamond,Georgia,serif}.kF{font-family:"IM Fell English","EB Garamond",Georgia,serif}' +
    '.kH,.kHm{paint-order:stroke;stroke-width:6px;stroke-linejoin:round}.kHm{stroke:#c5d5cf}' +
    '.k2{display:none}.kZ .k2{display:inline}.kO{cursor:pointer}.kO .kR{opacity:0}.kO.kS .kR{opacity:1}';

  var UI_CSS =
    '.kt{display:flex;flex-direction:column;gap:10px}' +
    '.kt .ktK svg{display:block;width:100%;height:auto;touch-action:manipulation}' +
    '.kt .ktI{margin:0;font-size:14px;line-height:1.55;color:var(--text-secondary);min-height:44px}' +
    '.kt .ktI b{font-weight:500;color:var(--text-primary)}' +
    '.kt .ktB{display:flex;flex-wrap:wrap;gap:8px}' +
    '.kt .ktL{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 12px;font-size:12px;color:var(--text-secondary)}' +
    '.kt .ktL span{display:flex;align-items:center;gap:6px}.kt .ktL svg{flex-shrink:0}.kt [hidden]{display:none!important}';

  /* ---------- Einbau ins Widget ---------- */
  function ruhig() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function schriftLaden() {
    try {
      if (document.getElementById('ktSchrift')) return;
      var l = document.createElement('link');
      l.id = 'ktSchrift'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&family=IM+Fell+English:ital@0;1&display=swap';
      document.head.appendChild(l);
    } catch (e) { return; }
  }

  function einbauen(el, D) {
    schriftLaden();
    var e = zeichne(D), W = e.breite, H = e.hoehe;
    el.classList.add('kt');
    el.innerHTML = '<style>' + UI_CSS + '</style><div class="ktK">' + e.svg + '</div>' +
      '<p class="ktI" aria-live="polite">Tippe auf einen Ort.</p>' +
      '<div class="ktB"><button type="button" data-k="ganz">Ganze Karte</button>' +
      '<button type="button" data-k="leg" aria-expanded="false">Legende</button>' +
      '<button type="button" data-k="glossar" hidden></button></div>' +
      '<div class="ktL" hidden>' + e.legende + '</div>';
    var svg = el.querySelector('svg'), info = el.querySelector('.ktI'), leg = el.querySelector('.ktL');
    var bLeg = el.querySelector('[data-k="leg"]'), bGlossar = el.querySelector('[data-k="glossar"]');
    var vb = [0, 0, W, H], gewaehlt = null, lauf = 0;

    function pruefe() {
      var breite = svg.getBoundingClientRect().width || 380;
      svg.classList.toggle('kZ', breite / vb[2] >= 0.9);
    }
    function setze(v) { vb = v; svg.setAttribute('viewBox', v.map(r1).join(' ')); pruefe(); }
    function fahre(ziel) {
      var start = vb.slice(), t0 = null, dauer = ruhig() ? 0 : 320, nr = ++lauf;
      if (!dauer || !window.requestAnimationFrame) { setze(ziel); return; }
      function schritt(t) {
        if (nr !== lauf) return;
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dauer), q = 1 - Math.pow(1 - p, 3);
        setze(start.map(function (s, i) { return s + (ziel[i] - s) * q; }));
        if (p < 1) requestAnimationFrame(schritt);
      }
      requestAnimationFrame(schritt);
    }
    function zoomAuf(x, y) {
      var basis = (svg.getBoundingClientRect().width || 380) / W, f = Math.min(3, Math.max(ZOOM_MIN, 1.1 / basis));
      var w = W / f, h = H / f;
      fahre([Math.max(0, Math.min(W - w, x - w / 2)), Math.max(0, Math.min(H - h, y - h / 2)), w, h]);
    }

    svg.addEventListener('click', function (ev) {
      var g = ev.target && ev.target.closest ? ev.target.closest('.kO') : null;
      if (!g) return;
      var o = e.orte[+g.getAttribute('data-i')];
      if (!o) return;
      var alt = svg.querySelector('.kO.kS');
      if (alt) alt.classList.remove('kS');
      g.classList.add('kS');
      gewaehlt = o;
      info.innerHTML = '<b>' + esc(o.name) + '</b>' + (o.notiz ? ' · ' + esc(o.notiz) : '') + ' ' + esc(herkunft(o, D));
      if (typeof sendPrompt === 'function') { bGlossar.hidden = false; bGlossar.textContent = 'Glossar ' + o.name + ' ↗'; }
      var sichtbar = o._px >= 0 && o._px <= W && o._py >= 0 && o._py <= H;
      if (sichtbar) zoomAuf(o._px, o._py);
    });
    el.querySelector('[data-k="ganz"]').addEventListener('click', function () { fahre([0, 0, W, H]); });
    bLeg.addEventListener('click', function () {
      leg.hidden = !leg.hidden;
      bLeg.setAttribute('aria-expanded', String(!leg.hidden));
    });
    bGlossar.addEventListener('click', function () {
      if (gewaehlt && typeof sendPrompt === 'function') sendPrompt('Glossar ' + gewaehlt.name);
    });
    if (window.ResizeObserver) new ResizeObserver(pruefe).observe(svg);
    else window.addEventListener('resize', pruefe);
    pruefe();
  }

  function start() {
    var el = document.getElementById('karte'), D = window.KARTE;
    if (!el || !D) return;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Die Karte ließ sich nicht zeichnen: ' + err.message; }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { zeichne: zeichne, pruefen: pruefen, version: VERSION };
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
