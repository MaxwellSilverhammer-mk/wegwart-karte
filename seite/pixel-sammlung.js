// Die Sammlung allgemeiner Ikonen für das Gepäck, 32 × 32 (gezeichnet mit seite/pixel.js).
// Jede Ikone ist eine kleine Zeichnung aus Formen und Details. Licht fällt von links oben, Waffen liegen
// schräg mit der Spitze oben rechts. Eigene Ikonen besonderer Stücke gehören nicht hierher, sondern ins
// Gepäck der Figur (Feld `pixel`), denn sie zeigen, was diese Figur gesehen hat.
'use strict';
module.exports = function (sammlung, hilfe) {
  var kp = hilfe.kurvenpunkte;
  // Punkte in einem gedrehten Rahmen: Mitte H, Achse v (Länge), Querachse u (Breite)
  function lokal(H, v, u, pts) { return pts.map(function (p) { return [H[0] + p[0] * v[0] + p[1] * u[0], H[1] + p[0] * v[1] + p[1] * u[1]]; }); }
  var S = Math.SQRT1_2, HOCH = [S, -S], QUER = [-S, -S];   // entlang der Diagonale nach rechts oben, quer nach links oben

  /* ---------- Waffen ---------- */
  sammlung('schwert', function (z) {
    z.balken(10.5, 22.5, 4.2, 28.8, 3, 'leder');
    z.punkte([[8, 23], [6, 25]], 'leder.tief');
    z.klinge(10, 22, 29.4, 2.6, 3.8, 4.5, 'stahl');
    z.strich(13, 18, 25, 6, 'stahl.dunkel');
    z.balken(5.2, 17.2, 14.8, 26.8, 2.8, 'gold');
    z.kugel(5.2, 17.2, 1.8, 1.8, 'gold'); z.kugel(14.8, 26.8, 1.8, 1.8, 'gold');
    z.kugel(3.4, 28.6, 2.4, 2.4, 'gold', true);
  });
  sammlung('dolch', function (z) {
    z.balken(12.5, 19.5, 7.6, 24.4, 2.8, 'dunkelholz');
    z.klinge(12, 20, 26.8, 5.2, 3.6, 4, 'stahl');
    z.strich(14, 17, 22, 9, 'stahl.dunkel');
    z.balken(8.8, 16.2, 15.6, 23, 2.4, 'gold');
    z.kugel(6.8, 25.2, 2.1, 2.1, 'gold', true);
  });
  sammlung('saebel', function (z) {
    z.balken(10.5, 22.5, 5, 28, 2.8, 'holz');
    z.kurve([10, 22], [25, 18], [29.6, 2.2], 4.8, 1.2, 'stahl');
    z.punkte(kp([12, 21.5], [24, 16.6], [28, 5.6]).slice(1, -4), 'stahl.dunkel');
    z.kurve([7.6, 18.6], [1.2, 22], [4, 28.6], 1.8, 1.8, 'gold');
    z.balken(7, 18, 13.8, 24.8, 2.6, 'gold');
    z.kugel(4.2, 28.6, 1.9, 1.9, 'gold', true);
  });
  sammlung('axt', function (z) {
    z.balken(3.6, 29.4, 24.6, 8.4, 3, 'holz');
    z.punkte([[9, 23], [14, 18]], 'holz.tief');
    z.vieleck(lokal([21.5, 11.5], HOCH, QUER, [[-2.6, -2.2], [2.6, -2.2], [3, 3], [7, 8], [4.5, 10.4], [0, 11], [-4.5, 10.4], [-7, 8], [-3, 3]]), 'eisen');
    z.punkte(kp([12.6, 5.8], [16, 2], [21.4, 2.6]), 'stahl.hell');
  });
  sammlung('kolben', function (z) {
    z.balken(4, 28, 18.5, 13.5, 2.8, 'dunkelholz');
    z.balken(4, 28, 8.6, 23.4, 3.4, 'leder');
    z.punkte([[5, 25], [7, 23]], 'leder.tief');
    [-90, -30, 30, 90, 150].forEach(function (g) {
      var r = g * Math.PI / 180;
      z.klinge(21.5, 10.5, 21.5 + Math.cos(r) * 9.2, 10.5 + Math.sin(r) * 9.2, 4.2, 3.4, 'eisen');
    });
    z.kugel(21.5, 10.5, 5.2, 5.2, 'eisen', true);
    z.kugel(15.5, 16.5, 2, 2, 'eisen');
  });
  sammlung('keule', function (z) {
    z.kurve([4, 28], [13, 18], [24.5, 7.5], 2.6, 9, 'holz');
    z.ellipse(24.5, 7.5, 4.4, 4.4, 'holz');
    z.punkte([[17, 14], [21, 12], [24, 6], [20, 7], [14, 18]], 'holz.tief');
    z.punkte([[18, 13], [22, 11], [25, 5]], 'holz.hell');
  });
  sammlung('speer', function (z) {
    z.balken(2.6, 29.4, 21, 11, 2.2, 'holz');
    z.vieleck(lokal([22.5, 9.5], HOCH, QUER, [[-1.5, 0], [1.5, -2.6], [5.5, -2.2], [10, 0], [5.5, 2.2], [1.5, 2.6]]), 'stahl');
    z.strich(22, 9, 28, 3, 'stahl.dunkel');
    z.balken(19.4, 12.6, 22.2, 9.8, 3.2, 'hanf');
  });
  sammlung('glefe', function (z) {
    z.balken(2.6, 29.4, 19.5, 12.5, 2.4, 'holz');
    z.vieleck(lokal([18.5, 13.5], HOCH, QUER, [[0, -1.8], [6, -1.8], [7, -3.8], [8.4, -1.8], [13, -1.8], [16, 0], [13.5, 3.5], [9, 5.6], [4, 5.6], [1, 4], [0, 2.5]]), 'stahl');
    z.punkte(kp([15.5, 9], [18, 4.5], [26.5, 2.5]), 'stahl.hell');
    z.balken(16.6, 15.4, 19.4, 12.6, 3.2, 'gold');
  });
  sammlung('bogen', function (z) {
    z.strich(6, 5, 26, 25, 'hanf.hell');
    z.kurve([6, 5], [17.2, 4.2], [22.2, 9.2], 1.6, 3.2, 'holz');
    z.kurve([22.2, 9.2], [27.2, 14.2], [26, 25], 3.2, 1.6, 'holz');
    z.balken(20.6, 7.6, 23.8, 10.8, 4, 'leder');
    z.punkte([[6, 5], [26, 25]], 'knochen');
  });
  sammlung('armbrust', function (z) {
    z.balken(3.4, 28.6, 22, 10, 3.8, 'holz');
    z.strich(5, 27, 9, 23, 'holz.tief');
    z.kurve([14.4, 4.4], [24, 9], [27.6, 17.6], 2.4, 2.4, 'stahl');
    z.strich(15, 5, 17, 15, 'hanf.hell'); z.strich(27, 17, 17, 15, 'hanf.hell');
    z.strich(17, 14, 25, 6, 'stahl');
    z.punkt(26, 5, 'stahl.hell');
    z.balken(10, 23, 8, 26, 1.4, 'eisen');
  });
  sammlung('bolzen', function (z) {
    z.balken(5, 27, 23.5, 8.5, 1.8, 'holz');
    z.klinge(22.5, 9.5, 29.6, 2.4, 3.6, 3.6, 'eisen');
    z.vieleck([[3.5, 22.5], [9, 24.6], [8, 26.5]], 'rot');
    z.vieleck([[9.5, 28.5], [7.4, 23], [5.5, 24]], 'papier');
  });
  sammlung('koecher', function (z) {
    [[15.5, 8.5, 12, 1.5], [18.5, 8.5, 18.5, 0.8], [21, 9.5, 25, 2.6]].forEach(function (b) {
      z.balken(b[0], b[1] + 2, b[2], b[3] + 1, 1.6, 'holz');
      z.punkte([[Math.round(b[2]), Math.round(b[3])], [Math.round(b[2]) - 1, Math.round(b[3]) + 1]], 'rot');
      z.punkt(Math.round(b[2]) + 1, Math.round(b[3]) + 1, 'papier.hell');
    });
    z.balken(13.5, 29.5, 19.5, 10, 8.6, 'leder');
    z.balken(15.6, 10.6, 23.4, 13.4, 2.6, 'leder', 'dunkel');
    z.strich(13, 26, 16, 14, 'leder.dunkel');
    z.kurve([12, 12], [26, 20], [18, 30], 1.4, 1.4, 'hanf');
  });
  sammlung('schild', function (z) {
    z.ellipse(16, 16, 14.2, 14.2, 'eisen');
    z.ellipse(16, 16, 12, 12, 'holz');
    [10, 16, 22].forEach(function (x) { z.strich(x, 5, x, 27, 'holz.dunkel'); });
    [[16, 3], [16, 29], [3, 16], [29, 16], [7, 7], [25, 7], [7, 25], [25, 25]].forEach(function (p) { z.punkt(p[0], p[1], 'stahl.hell'); });
    z.kugel(16, 16, 4.6, 4.6, 'eisen', true);
  });
  sammlung('ruestung', function (z) {
    z.vieleck([[8, 4], [13, 4], [16, 8], [19, 4], [24, 4], [29, 8], [29, 14], [25, 14], [25, 29.5], [7, 29.5], [7, 14], [3, 14], [3, 8]], 'leder');
    z.strich(16, 9, 16, 28, 'leder.tief');
    z.rechteck(7, 21, 25, 22, 'dunkelholz');
    z.rechteck(15, 20, 17, 23, 'gold');
    [[10, 11], [13, 11], [19, 11], [22, 11], [10, 15], [13, 15], [19, 15], [22, 15], [10, 25], [13, 25], [19, 25], [22, 25], [10, 18], [22, 18], [5, 9], [27, 9], [5, 12], [27, 12]].forEach(function (p) { z.punkt(p[0], p[1], 'gold.hell'); z.punkt(p[0] + 1, p[1] + 1, 'gold.tief'); });
  });
  sammlung('kettenhemd', function (z) {
    z.vieleck([[8, 4], [13, 4], [16, 7], [19, 4], [24, 4], [29, 9], [29, 16], [25, 16], [25, 29.5], [7, 29.5], [7, 16], [3, 16], [3, 9]], 'eisen');
    for (var y = 5; y < 30; y++) for (var x = 3; x < 30; x++) if (y % 2 === 0 ? x % 2 === 0 : x % 2 === 1) z.punkt(x, y, (x + y) % 4 === 0 ? 'eisen.hell' : 'eisen.tief');
    z.weg(function (px, py) { return !inForm(px, py); });
    function inForm(px, py) {
      var pts = [[8, 4], [13, 4], [16, 7], [19, 4], [24, 4], [29, 9], [29, 16], [25, 16], [25, 29.5], [7, 29.5], [7, 16], [3, 16], [3, 9]], c = false;
      for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) { var a = pts[i], b = pts[j]; if (((a[1] > py) !== (b[1] > py)) && (px < (b[0] - a[0]) * (py - a[1]) / (b[1] - a[1]) + a[0])) c = !c; }
      return c;
    }
    z.rechteck(7, 27, 25, 28, 'leder');
  });

  /* ---------- Kleidung ---------- */
  sammlung('kleidung', function (z) {
    z.vieleck([[10, 3.5], [13.5, 3.5], [16, 6], [18.5, 3.5], [22, 3.5], [29.5, 9], [27, 16], [24, 14], [24, 29.5], [8, 29.5], [8, 14], [5, 16], [2.5, 9]], 'blau');
    z.strich(13, 4, 16, 8, 'blau.tief'); z.strich(19, 4, 16, 8, 'blau.tief');
    z.rechteck(8, 19, 24, 20, 'leder');
    z.rechteck(14, 18, 17, 21, 'gold');
    z.strich(16, 9, 16, 17, 'blau.dunkel');
  });
  sammlung('mantel', function (z) {
    z.vieleck([[16, 1.5], [22.5, 7], [23.5, 12], [28.5, 29.5], [3.5, 29.5], [8.5, 12], [9.5, 7]], 'tuch');
    z.vieleck([[16, 5], [19.5, 9], [19, 13], [16, 15], [13, 13], [12.5, 9]], 'tuch', 'tief');
    z.vieleck([[13.5, 16], [18.5, 16], [21, 29.5], [11, 29.5]], 'rot', 'dunkel');
    z.strich(13, 16, 10, 29, 'tuch.hell'); z.strich(19, 16, 22, 29, 'tuch.dunkel');
    z.strich(7, 20, 6, 28, 'tuch.dunkel'); z.strich(25, 20, 26, 28, 'tuch.dunkel');
    z.strich(13, 16, 19, 16, 'gold.dunkel');
    z.kugel(13, 16, 1.4, 1.4, 'gold'); z.kugel(19, 16, 1.4, 1.4, 'gold');
  });
  sammlung('kostuem', function (z) {
    var form = [[10, 4.5], [13.5, 4.5], [16, 7], [18.5, 4.5], [22, 4.5], [29.5, 10], [27, 17], [24, 15], [24, 28.5], [8, 28.5], [8, 15], [5, 17], [2.5, 10]];
    z.vieleck(form, 'gruen');
    z.flaeche(function (px, py, x, y) { return Math.floor((x + y) / 4) % 2 === 0 && Math.floor((x - y + 64) / 4) % 2 === 0; }, 'gelb', 'mittel');
    z.weg(function (px, py) { var c = false, pts = form; for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) { var a = pts[i], b = pts[j]; if (((a[1] > py) !== (b[1] > py)) && (px < (b[0] - a[0]) * (py - a[1]) / (b[1] - a[1]) + a[0])) c = !c; } return !c; });
    z.vieleck([[9, 3.5], [12, 7.5], [14, 3.5], [16, 8.5], [18, 3.5], [20, 7.5], [23, 3.5], [21, 9], [11, 9]], 'rot');
    z.kugel(9, 3, 1.4, 1.4, 'gold'); z.kugel(23, 3, 1.4, 1.4, 'gold'); z.kugel(16, 2.6, 1.4, 1.4, 'gold');
    z.rechteck(8, 20, 24, 21, 'leder');
  });
  sammlung('verkleidung', function (z) {
    z.vieleck([[5, 8], [26, 8], [28.5, 15], [3, 15]], 'holz', 'dunkel');
    z.rechteck(3, 15, 28, 27, 'holz');
    z.rechteck(5, 15, 26, 17, 'holz', 'tief');
    z.raster(6, 11, [
      '..aaa....aaa..',
      '.abbba..abbba.',
      'abb.bbaabb.bba',
      'ab....bb....ba'
    ], { a: 'dunkelholz.mittel', b: 'dunkelholz.hell' });
    z.kugel(22, 13, 3, 2.4, 'rot', true);
    z.rechteck(12, 21, 19, 23, 'gold');
    z.punkte([[8, 23], [9, 24], [24, 23], [23, 24]], 'teer');
  });

  /* ---------- Instrumente ---------- */
  sammlung('laute', function (z) {
    z.balken(14, 17, 25, 6, 3.4, 'dunkelholz');
    z.balken(24, 7, 29, 6, 3.2, 'dunkelholz');
    z.punkte([[26, 4], [28, 4], [27, 8], [29, 8]], 'knochen');
    z.ellipse(12.5, 19.5, 7.8, 7.8, 'holz');
    z.ellipse(9.8, 22.2, 7.4, 7.4, 'holz');
    z.ring(11.2, 20.8, 2.8, 2.8, 1, 'dunkelholz');
    z.ellipse(11.2, 20.8, 1.8, 1.8, 'teer', 'mittel');
    z.balken(6.2, 23.4, 8.8, 26, 1.6, 'dunkelholz');
    z.strich(8, 23, 24, 7, 'knochen.hell'); z.strich(9, 24, 25, 8, 'knochen');
  });
  sammlung('floete', function (z) {
    [[3, 28], [7, 26], [11, 24], [15, 22], [19, 20], [23, 18], [27, 16]].forEach(function (r) {
      z.rechteck(r[0], 4, r[0] + 2, r[1], 'hanf');
      z.punkt(r[0] + 1, 4, 'hanf.tief');
      z.strich(r[0], Math.round((4 + r[1]) / 2) + 3, r[0] + 2, Math.round((4 + r[1]) / 2) + 3, 'hanf.dunkel');
    });
    z.rechteck(2, 8, 30, 10, 'rot');
  });
  sammlung('trommel', function (z) {
    z.rechteck(5, 12, 26, 26, 'rot');
    z.ellipse(15.5, 26, 10.5, 3.4, 'rot');
    for (var i = 0; i < 6; i++) { var x = 6 + i * 4; z.strich(x, 13, x + 2, 25, 'hanf.hell'); z.strich(x + 2, 13, x, 25, 'hanf'); }
    z.ring(15.5, 12, 10.5, 3.4, 1.4, 'holz');
    z.ellipse(15.5, 12, 9.2, 2.2, 'knochen');
    z.rechteck(5, 24, 26, 25, 'holz');
    z.balken(9, 9, 27, 1.5, 1.8, 'holz'); z.kugel(27.5, 1.6, 1.6, 1.4, 'holz');
    z.balken(4, 1.5, 21, 8.5, 1.8, 'holz'); z.kugel(3.6, 1.6, 1.6, 1.4, 'holz');
  });
  sammlung('horn', function (z) {
    z.kurve([20, 18], [10, 30], [3, 22], 1, 1, 'leder');
    z.kurve([4.5, 25.5], [6, 8], [25, 9], 2.2, 8.6, 'knochen');
    z.ellipse(25.4, 9.2, 2.2, 4.4, 'teer', 'mittel');
    z.balken(22.4, 4.6, 23.6, 13.4, 2.2, 'gold');
    z.balken(4, 23.6, 6.6, 24.6, 3, 'gold');
    z.punkte([[9, 12], [12, 10], [15, 9]], 'knochen.hell');
  });

  /* ---------- Ausrüstung ---------- */
  sammlung('seil', function (z) {
    z.ring(15.5, 15.5, 13.5, 11.5, 3.2, 'hanf');
    z.ring(15.5, 15.5, 9.3, 7.4, 3, 'hanf');
    z.ring(15.5, 15.5, 5.2, 3.6, 2.4, 'hanf');
    for (var a = 0; a < 360; a += 20) {
      var r = a * Math.PI / 180;
      [[12, 10], [7.8, 6], [3.8, 2.4]].forEach(function (R) { z.punkt(Math.round(15.5 + Math.cos(r) * R[0] - 0.5), Math.round(15.5 + Math.sin(r) * R[1] - 0.5), 'hanf.dunkel'); });
    }
    z.kurve([25, 23], [28, 27], [30, 30.5], 3, 2.4, 'hanf');
    z.punkte([[29, 30], [31, 29]], 'hanf.hell');
  });
  sammlung('kerze', function (z) {
    z.ring(26.5, 24, 3.2, 3, 1.4, 'gold');
    z.ellipse(15.5, 27, 10, 3, 'gold');
    z.rechteck(12, 11, 19, 26, 'knochen');
    z.punkte([[12, 12], [12, 13], [13, 12], [18, 12], [18, 13], [18, 14], [18, 15]], 'knochen.hell');
    z.strich(15, 8, 15, 10, 'teer');
    z.ellipse(15.5, 5.5, 2.8, 4, 'flamme', 'dunkel');
    z.ellipse(15.5, 6.6, 1.6, 2.4, 'flamme', 'mittel');
    z.punkte([[15, 6], [15, 7]], 'flamme.hell');
  });
  sammlung('laterne', function (z) {
    z.ring(15.5, 3, 2.8, 2.4, 1.2, 'eisen');
    z.vieleck([[6.5, 11], [24.5, 11], [21, 5], [10, 5]], 'eisen', 'dunkel');
    z.rechteck(8, 11, 23, 27, 'eisen');
    z.rechteck(10, 13, 21, 25, 'flamme', 'dunkel');
    z.ellipse(15.5, 19.5, 3.6, 4.8, 'flamme', 'mittel');
    z.ellipse(15.5, 20.5, 1.6, 2.6, 'flamme', 'hell');
    z.rechteck(15, 13, 16, 25, 'eisen', 'dunkel');
    z.rechteck(6, 27, 25, 29, 'eisen');
  });
  sammlung('fackel', function (z) {
    z.balken(7, 29.5, 17.5, 13.5, 2.8, 'holz');
    z.balken(16, 15.5, 21.4, 8.6, 5.2, 'hanf');
    [[15, 14], [17, 12], [19, 10]].forEach(function (p) { z.strich(p[0], p[1], p[0] + 3, p[1] + 3, 'hanf.dunkel'); });
    z.vieleck([[21, 0.5], [26.5, 5], [26, 10], [21.5, 11.5], [17.5, 9], [18, 4.5]], 'flamme', 'dunkel');
    z.vieleck([[21.4, 3], [24.5, 6.4], [23.5, 9.5], [20.5, 9.5], [19.5, 6.5]], 'flamme', 'mittel');
    z.punkte([[21, 7], [22, 7], [21, 8]], 'flamme.hell');
    z.punkte([[27, 2], [28, 6]], 'flamme.mittel');
  });
  sammlung('decke', function (z) {
    z.rechteck(4, 7, 27, 27, 'rot');
    z.ellipse(4.4, 10.5, 2, 3.5, 'rot'); z.ellipse(4.4, 17, 2, 3.5, 'rot'); z.ellipse(4.4, 23.5, 2, 3.5, 'rot');
    z.rechteck(17, 7, 20, 27, 'gelb');
    z.strich(3, 14, 27, 14, 'rot.tief'); z.strich(3, 20, 27, 20, 'rot.tief');
    z.strich(17, 14, 20, 14, 'gelb.dunkel'); z.strich(17, 20, 20, 20, 'gelb.dunkel');
  });
  sammlung('schlafsack', function (z) {
    z.rechteck(4, 10, 24, 25, 'gruen');
    z.ellipse(24.5, 17.5, 5, 7.6, 'gruen', 'dunkel');
    z.ring(24.5, 17.5, 3.4, 5.4, 1, 'gruen', 'hell');
    z.ellipse(24.5, 17.5, 1.4, 2.4, 'gruen', 'tief');
    z.ellipse(4, 17.5, 1.8, 7.6, 'gruen');
    [9, 18].forEach(function (x) { z.rechteck(x, 9, x + 2, 26, 'leder'); z.rechteck(x, 16, x + 2, 18, 'gold'); });
  });
  sammlung('netz', function (z) {
    z.flaeche(function (px, py, x, y) { return py > 5 && py < 28 && px > 3 + (py - 5) * 0.1 && px < 29 - (py - 5) * 0.1 && ((x + y) % 4 === 0 || (x - y + 64) % 4 === 0); }, 'hanf');
    z.balken(2, 5, 30, 5, 2.4, 'holz');
    z.kugel(7, 28, 2.4, 2.4, 'holz'); z.kugel(16, 29, 2.4, 2.4, 'holz'); z.kugel(25, 28, 2.4, 2.4, 'holz');
  });
  sammlung('rucksack', function (z) {
    z.ring(15.5, 6, 3.4, 3, 1.3, 'leder', 'dunkel');
    z.rechteck(6, 9, 25, 29, 'leder');
    z.ellipse(15.5, 10, 9.5, 4.5, 'leder');
    z.vieleck([[6, 9], [25, 9], [25, 18], [15.5, 21], [6, 18]], 'leder', 'hell');
    z.strich(6, 18, 15, 21, 'leder.tief'); z.strich(25, 18, 16, 21, 'leder.tief');
    z.rechteck(14, 18, 17, 21, 'gold');
    z.rechteck(9, 23, 22, 28, 'leder', 'dunkel');
    z.strich(9, 23, 22, 23, 'leder.tief');
  });
  sammlung('schlauch', function (z) {
    z.kurve([16, 7], [30, 10], [27, 30], 1.4, 1.4, 'hanf');
    z.kugel(15, 20, 10.2, 9.2, 'leder');
    z.rechteck(12, 6, 18, 11, 'leder', 'dunkel');
    z.rechteck(12, 2, 18, 5, 'holz');
    z.strich(11, 9, 19, 9, 'hanf');
    z.punkte([[9, 16], [10, 15], [11, 14]], 'leder.hell');
  });
  sammlung('werkzeug', function (z) {
    z.balken(6.5, 23.5, 25.5, 9.5, 7.6, 'stein');
    z.ellipse(6.5, 23.5, 3.8, 3.8, 'stein'); z.ellipse(25.5, 9.5, 3.8, 3.8, 'stein');
    z.strich(5, 21, 23, 8, 'stein.hell');
    z.punkte([[27, 6], [28, 5], [26, 5]], 'weiss');
  });
  sammlung('striegel', function (z) {
    z.kurve([7, 13], [16, 1], [25, 13], 3, 3, 'leder');
    for (var x = 5; x <= 26; x++) z.rechteck(x, 20, x, x % 2 ? 27 : 26, 'hanf', x % 2 ? 'dunkel' : 'mittel');
    z.rechteck(4, 12, 27, 20, 'holz');
    z.ellipse(4.5, 16, 2, 4, 'holz'); z.ellipse(26.5, 16, 2, 4, 'holz');
    z.strich(6, 18, 25, 18, 'holz.dunkel');
  });
  sammlung('boot', function (z) {
    z.ellipse(16, 27.5, 15, 2.6, 'wasser');
    z.balken(9, 30, 24, 1.5, 1.8, 'dunkelholz');
    z.vieleck([[1.5, 16.5], [30.5, 16.5], [27, 25], [5, 25]], 'holz');
    z.strich(3, 20, 28, 20, 'holz.dunkel'); z.strich(4, 22, 27, 22, 'holz.dunkel');
    z.rechteck(2, 17, 29, 17, 'holz', 'tief');
    z.punkte([[4, 28], [8, 27], [22, 28], [27, 27]], 'wasser.hell');
  });
  sammlung('kette', function (z) {
    var p = kp([7, 13], [16, 34], [25, 13], 40), letzte = null;
    for (var i = 0; i < p.length; i += 4) {
      var q = p[i], quer = (i / 4) % 2 === 0;
      z.ring(q[0] + 0.5, q[1] + 0.5, quer ? 2.6 : 1.7, quer ? 1.7 : 2.6, 1.1, 'eisen');
      letzte = q;
    }
    z.ring(7, 8, 5.6, 5.6, 2.2, 'eisen'); z.ring(25, 8, 5.6, 5.6, 2.2, 'eisen');
    z.rechteck(6, 13, 8, 15, 'eisen', 'dunkel'); z.rechteck(24, 13, 26, 15, 'eisen', 'dunkel');
  });
  sammlung('kompass', function (z) {
    z.ring(16, 3.4, 2.6, 2.2, 1.1, 'gold');
    z.ellipse(16, 17.5, 13, 13, 'gold');
    z.ellipse(16, 17.5, 10, 10, 'papier', 'mittel');
    [[16, 8.5], [16, 26.5], [7, 17.5], [25, 17.5]].forEach(function (p) { z.punkt(Math.floor(p[0]), Math.floor(p[1]), 'tinte'); });
    z.klinge(16, 17.5, 16, 9.5, 2.6, 4, 'rot', 'mittel');
    z.klinge(16, 17.5, 16, 25.5, 2.6, 4, 'stahl', 'dunkel');
    z.kugel(16, 17.5, 1.2, 1.2, 'gold');
    z.punkte([[11, 12], [12, 11], [10, 13]], 'weiss');
  });
  sammlung('schluessel', function (z) {
    z.balken(10, 10, 26, 26, 3, 'gold');
    z.ring(8, 8, 6.4, 6.4, 2.6, 'gold');
    z.vieleck([[21, 25], [24, 22], [28.5, 26.5], [25.5, 29.5]], 'gold');
    z.wegRechteck(24, 27, 25, 28);
    z.punkte([[5, 4], [4, 5], [6, 3]], 'gold.hell');
  });

  /* ---------- Proviant ---------- */
  sammlung('ration', function (z) {
    z.rechteck(11, 4, 27, 18, 'hanf');
    z.rechteck(4, 10, 20, 25, 'hanf');
    [[14, 7], [18, 7], [22, 7], [24, 11], [24, 15], [7, 13], [11, 13], [15, 13], [7, 17], [11, 17], [15, 17], [7, 21], [11, 21], [15, 21]].forEach(function (p) { z.punkt(p[0], p[1], 'hanf.tief'); });
    z.balken(13, 29, 29.5, 19.5, 5, 'rot', 'dunkel');
    z.strich(15, 28, 28, 20, 'knochen'); z.strich(16, 29, 29, 21, 'rot.tief');
  });
  sammlung('fisch', function (z) {
    z.vieleck([[22, 16], [29.5, 8], [28, 16], [29.5, 24]], 'stahl');
    z.vieleck([[10, 11], [15, 7], [18, 11]], 'stahl', 'dunkel');
    z.ellipse(14, 16, 11.4, 6, 'stahl');
    z.flaeche(function (px, py) { var a = (px - 14) / 11.4, b = (py - 16) / 6; return a * a + b * b <= 1 && py > 17.5; }, 'stahl', 'hell');
    z.punkt(7, 14, 'k'); z.punkt(6, 14, 'weiss');
    z.punkte(kp([10, 11], [12, 16], [10, 21]), 'stahl.dunkel');
    [[14, 13], [17, 13], [20, 13], [15, 15], [18, 15], [21, 15]].forEach(function (p) { z.punkt(p[0], p[1], 'stahl.dunkel'); });
  });
  sammlung('kraut', function (z) {
    [[14, 12, 10, 2], [16, 12, 17, 1], [18, 12, 23, 3]].forEach(function (s) {
      z.strich(s[0], s[1], s[2], s[3], 'gruen.dunkel');
      var dx = s[2] - s[0], dy = s[3] - s[1];
      for (var t = 0.25; t < 1; t += 0.25) { var x = Math.round(s[0] + dx * t), y = Math.round(s[1] + dy * t); z.punkt(x - 1, y, 'gruen.hell'); z.punkt(x + 1, y - 1, 'gruen'); }
      z.punkt(s[2], s[3] - 1, 'gruen.hell');
    });
    z.kugel(16, 22.5, 10, 8.4, 'hanf');
    z.vieleck([[9, 10], [12.5, 13], [19.5, 13], [23, 10], [21, 15], [11, 15]], 'hanf');
    z.strich(10, 15, 22, 15, 'leder.dunkel'); z.strich(11, 16, 21, 16, 'leder');
    z.punkte([[12, 20], [11, 24], [14, 27]], 'hanf.dunkel');
  });
  sammlung('schale', function (z) {
    z.rechteck(11, 25, 20, 27, 'holz', 'dunkel');
    z.flaeche(function (px, py) { var a = (px - 16) / 14, b = (py - 14) / 12; return a * a + b * b <= 1 && py >= 14; }, 'holz');
    z.ellipse(16, 14, 14, 4, 'holz', 'hell');
    z.ellipse(16, 14, 12, 2.8, 'stein');
    z.punkte([[11, 13], [17, 14], [21, 13]], 'stein.hell');
  });
  sammlung('trank', function (z) {
    z.kugel(16, 20.5, 9.6, 9.4, 'rot', true);
    z.rechteck(13, 6, 18, 12, 'wasser', 'hell');
    z.rechteck(17, 6, 18, 12, 'wasser');
    z.rechteck(12, 2, 19, 5, 'holz');
    z.strich(8, 15, 24, 15, 'rot.hell');
  });
  sammlung('flasche', function (z) {
    z.vieleck([[9.5, 15], [13, 10], [13, 4], [19, 4], [19, 10], [22.5, 15], [22.5, 29.5], [9.5, 29.5]], 'gruen');
    z.rechteck(13, 1, 18, 4, 'holz');
    z.rechteck(11, 18, 21, 24, 'papier');
    z.strich(11, 16, 11, 28, 'gruen.hell');
    z.strich(13, 21, 19, 21, 'tinte');
  });

  /* ---------- Papiere ---------- */
  sammlung('brief', function (z) {
    z.rechteck(2, 7, 29, 25, 'papier');
    z.strich(2, 7, 15, 17, 'papier.dunkel'); z.strich(29, 7, 16, 17, 'papier.dunkel');
    z.strich(2, 25, 11, 18, 'papier.dunkel'); z.strich(29, 25, 20, 18, 'papier.dunkel');
    z.kugel(15.5, 17, 3.4, 3.2, 'rot', true);
  });
  sammlung('zettel', function (z) {
    z.vieleck([[5, 4], [24, 2.5], [28, 27], [7.5, 29.5]], 'papier');
    z.vieleck([[20, 2.8], [24, 2.5], [24.6, 7]], 'papier', 'dunkel');
    [[8, 8, 20, 7], [8, 12, 22, 11], [9, 16, 17, 15], [9, 20, 23, 19], [10, 24, 19, 23]].forEach(function (l) { z.strich(l[0], l[1], l[2], l[3], 'tinte'); });
  });
  sammlung('siegel', function (z) {
    z.rechteck(5, 2, 26, 25, 'papier');
    [5, 8, 11, 14].forEach(function (y, i) { z.strich(8, y, i === 3 ? 18 : 23, y, 'tinte'); });
    z.vieleck([[11.5, 25], [15, 25], [13, 31], [10.5, 29.5]], 'blau');
    z.vieleck([[16, 25], [19.5, 25], [20.5, 29.5], [18, 31]], 'blau');
    z.kugel(15.5, 22, 4.6, 4.4, 'rot', true);
    z.ring(15.5, 22, 2.6, 2.4, 0.9, 'rot', 'tief');
  });
  sammlung('rolle', function (z) {
    z.rechteck(8, 6, 23, 26, 'papier');
    [10, 13, 16, 19, 22].forEach(function (y, i) { z.strich(10, y, i % 2 ? 19 : 21, y, 'tinte'); });
    z.balken(5, 5.5, 26, 5.5, 4.2, 'papier'); z.balken(5, 26.5, 26, 26.5, 4.2, 'papier');
    [[3.5, 5.5], [27.5, 5.5], [3.5, 26.5], [27.5, 26.5]].forEach(function (p) { z.kugel(p[0], p[1], 2, 2, 'holz'); });
    z.rechteck(15, 24, 16, 29, 'rot');
  });
  sammlung('karte', function (z) {
    z.rechteck(2, 5, 29, 26, 'papier');
    z.flaeche(function (px, py) { return px < 9 + Math.sin(py * 0.7) * 2 && py > 5 && py < 26 && px > 2; }, 'wasser', 'hell');
    z.strich(11, 5, 11, 26, 'papier.dunkel'); z.strich(20, 5, 20, 26, 'papier.dunkel');
    z.punkte([[14, 8], [16, 9], [15, 11], [24, 21], [26, 22], [25, 20]], 'gruen.dunkel');
    z.punkte(kp([9, 21], [17, 22], [19, 13]).filter(function (p, i) { return i % 3 !== 2; }), 'rot');
    z.punkte(kp([19, 13], [22, 8], [26, 9]).filter(function (p, i) { return i % 2 === 0; }), 'rot');
    z.punkte([[23, 12], [24, 11], [25, 12]], 'stein.tief');
  });
  sammlung('buch', function (z) {
    z.rechteck(8, 6, 27, 29, 'papier');
    z.rechteck(5, 3, 25, 27, 'rot');
    z.rechteck(5, 3, 7, 27, 'rot', 'tief');
    z.ring(16, 14, 4, 4, 1.2, 'gold');
    z.punkte([[9, 6], [22, 6], [9, 24], [22, 24]], 'gold');
    z.rechteck(24, 14, 27, 16, 'gold');
    z.rechteck(13, 27, 14, 31, 'blau');
  });
  sammlung('tinte', function (z) {
    z.kugel(13, 22, 9, 7.6, 'tinte', true);
    z.rechteck(9, 12, 17, 15, 'tinte');
    z.ellipse(13, 12, 4, 1.2, 'teer', 'tief');
    z.kurve([13, 13], [18, 6], [28.5, 1.5], 1, 1, 'knochen', 'dunkel');
    z.vieleck([[17, 9], [21, 3], [28.5, 1], [26, 5], [20, 10.5]], 'papier');
    z.strich(18, 9, 27, 2, 'papier.dunkel');
  });
  sammlung('feder', function (z) {
    z.vieleck([[9, 25], [12, 18], [17, 11], [23, 5], [29.5, 1.5], [27, 8], [21.5, 14], [14.5, 21]], 'papier');
    z.strich(6, 28, 28, 3, 'knochen.dunkel');
    [[13, 19], [16, 15], [19, 12], [22, 9], [25, 6]].forEach(function (p) { z.strich(p[0], p[1], p[0] - 2, p[1] - 1, 'papier.dunkel'); z.strich(p[0] + 1, p[1] + 1, p[0] + 3, p[1] + 1, 'papier.dunkel'); });
    z.strich(3, 30, 5, 28, 'tinte');
  });
  sammlung('wachs', function (z) {
    z.balken(5, 27, 22, 10, 5.6, 'rot');
    z.ellipse(22, 10, 2.8, 2.8, 'rot', 'dunkel');
    z.strich(5, 24, 19, 10, 'rot.hell');
    z.kugel(24, 24, 5.6, 4.6, 'rot');
    z.ring(24, 24, 3.2, 2.6, 1, 'rot', 'tief');
  });
  sammlung('kohle', function (z) {
    z.balken(6, 26, 24.5, 7.5, 4.4, 'teer');
    z.punkte([[24, 6], [25, 7], [23, 9]], 'teer.hell');
    z.balken(4.5, 27.5, 12, 20, 5.4, 'papier');
    z.strich(6, 24, 11, 19, 'papier.dunkel');
    z.punkte([[26, 12], [28, 11], [27, 14], [29, 13]], 'tuch.dunkel');
  });

  /* ---------- Zeichen, Werte, Fundstücke ---------- */
  sammlung('beutel', function (z) {
    z.kugel(13, 18.5, 10, 9.4, 'leder');
    z.rechteck(9, 6, 17, 10, 'leder', 'dunkel');
    z.vieleck([[6.5, 3.5], [10.5, 6.5], [15.5, 6.5], [19.5, 3.5], [17.5, 8], [8.5, 8]], 'leder');
    z.strich(8, 10, 18, 10, 'gold');
    [[23.5, 27, 3, 2.3], [28, 22.5, 2.4, 1.9], [18.5, 29.6, 2.4, 1.5]].forEach(function (m) { z.ellipse(m[0], m[1], m[2], m[3], 'gold'); z.punkt(Math.floor(m[0]) - 1, Math.floor(m[1]) - 1, 'gold.hell'); });
  });
  sammlung('muenze', function (z) {
    z.ellipse(20, 21, 9, 9, 'gold', 'dunkel');
    z.ellipse(13, 13, 10.4, 10.4, 'gold');
    z.ring(13, 13, 10.4, 10.4, 1.4, 'gold', 'dunkel');
    z.ring(13, 13, 6.4, 6.4, 1, 'gold', 'dunkel');
    z.punkte([[8, 7], [7, 8], [9, 7]], 'gold.hell');
    z.punkte([[12, 12], [13, 12], [12, 13]], 'gold.tief');
  });
  sammlung('ring', function (z) {
    z.ring(16, 20, 10.4, 8.4, 2.6, 'gold');
    z.punkte([[9, 16], [8, 18], [10, 15]], 'gold.hell');
    z.rechteck(13, 9, 18, 12, 'gold', 'dunkel');
    z.kugel(15.5, 8, 4.6, 4.6, 'rot', true);
  });
  sammlung('juwel', function (z) {
    z.vieleck([[9, 6], [22, 6], [28, 13], [15.5, 28.5], [3, 13]], 'blau');
    z.strich(3, 13, 28, 13, 'blau.dunkel');
    z.vieleck([[9, 6], [12, 13], [6, 13]], 'blau', 'hell');
    z.vieleck([[12, 13], [19, 13], [15.5, 26]], 'blau', 'hell');
    z.vieleck([[22, 6], [25, 13], [19, 13]], 'blau', 'dunkel');
    z.punkte([[11, 9], [12, 8]], 'weiss');
  });
  sammlung('perle', function (z) {
    z.kugel(16, 16, 11, 11, 'gruen', true);
    z.ellipse(16.5, 16.5, 2.4, 2.4, 'teer', 'tief');
    z.punkte([[18, 18], [17, 19]], 'gruen.dunkel');
  });
  sammlung('band', function (z) {
    z.kurve([14.5, 13], [10, 22], [7, 29.5], 3.4, 2.6, 'gruen');
    z.kurve([17.5, 13], [22, 22], [25, 29.5], 3.4, 2.6, 'gruen');
    z.ellipse(9, 9.5, 7, 5, 'gruen'); z.ellipse(23, 9.5, 7, 5, 'gruen');
    z.weg(function (px, py) { var a = (px - 8.5) / 3, b = (py - 9.5) / 1.6, c = (px - 23.5) / 3; return (a * a + b * b < 1) || (c * c + b * b < 1); });
    z.kugel(16, 11, 3.4, 3.4, 'gruen');
    z.wegRechteck(7, 30, 7, 31); z.wegRechteck(25, 30, 25, 31);
  });
  sammlung('band-blau', function (z) {
    z.kurve([14.5, 13], [10, 22], [7, 29.5], 3.4, 2.6, 'blau');
    z.kurve([17.5, 13], [22, 22], [25, 29.5], 3.4, 2.6, 'blau');
    z.ellipse(9, 9.5, 7, 5, 'blau'); z.ellipse(23, 9.5, 7, 5, 'blau');
    z.weg(function (px, py) { var a = (px - 8.5) / 3, b = (py - 9.5) / 1.6, c = (px - 23.5) / 3; return (a * a + b * b < 1) || (c * c + b * b < 1); });
    z.kugel(16, 11, 3.4, 3.4, 'blau');
    z.wegRechteck(7, 30, 7, 31); z.wegRechteck(25, 30, 25, 31);
  });
  sammlung('flagge', function (z) {
    z.balken(5.5, 3, 5.5, 30.5, 2.2, 'holz');
    z.flaeche(function (px, py) { var w = Math.sin(px * 0.45) * 1.6; return px > 6.5 && px < 29 && py > 4 + w && py < 18 + w; }, 'blau');
    z.flaeche(function (px, py) { var w = Math.sin(px * 0.45) * 1.6; return px > 14 && px < 21 && py > 8 + w && py < 14 + w; }, 'knochen');
    z.kugel(5.5, 2.4, 2, 2, 'gold', true);
  });
  sammlung('scheibe', function (z) {
    z.strich(16, 0, 16, 5, 'hanf');
    z.ellipse(16, 17, 12, 12, 'knochen');
    z.ellipse(16, 8, 1.6, 1.6, 'teer', 'mittel');
    z.ring(16, 17, 8, 8, 1, 'knochen', 'dunkel');
    [[11, 17], [16, 13], [21, 17], [16, 22]].forEach(function (p) { z.punkt(p[0], p[1], 'knochen.tief'); });
  });
  sammlung('seide', function (z) {
    z.kurve([4, 17], [16, 3], [28, 15], 1.4, 1.4, 'rot');
    z.kurve([28, 15], [16, 30], [4, 17], 1.4, 1.4, 'rot');
    z.kurve([7, 13], [18, 6], [26, 19], 1.2, 1.2, 'rot');
    z.kurve([26, 19], [14, 27], [7, 13], 1.2, 1.2, 'rot');
    z.kurve([24, 22], [27, 27], [30, 30], 1.2, 1, 'rot');
    z.kurve([6, 11], [3, 6], [1.5, 2], 1.2, 1, 'rot');
    z.punkte([[10, 9], [15, 6], [20, 8], [9, 15]], 'rot.hell');
  });
  sammlung('schwimmer', function (z) {
    z.kurve([1.5, 6], [16, 16], [30.5, 6], 1.3, 1.3, 'hanf');
    [[6, 9.5], [16, 11], [26, 9.5]].forEach(function (p) { z.strich(p[0], p[1], p[0], p[1] + 4, 'hanf.dunkel'); z.kugel(p[0] + 0.5, p[1] + 9.5, 3, 5, 'holz'); z.strich(p[0] - 1, p[1] + 9, p[0] + 2, p[1] + 9, 'holz.tief'); });
  });
  sammlung('tuch', function (z) {
    z.vieleck([[3, 9], [25, 4.5], [29, 23], [7, 28.5]], 'knochen');
    z.vieleck([[19, 5.8], [25, 4.5], [26, 11]], 'knochen', 'hell');
    z.strich(5, 18, 27, 13, 'knochen.dunkel');
    z.strich(15, 7, 18, 26, 'knochen.dunkel');
  });
  sammlung('karten', function (z) {
    z.vieleck([[3, 9], [12, 6], [17, 25], [8, 28]], 'papier');
    z.vieleck([[19, 4], [28, 7], [24, 27], [15, 24]], 'papier');
    z.rechteck(10, 4, 20, 25, 'papier');
    z.ring(15, 14.5, 5, 9, 0.8, 'papier', 'dunkel');
    z.raster(13, 7, ['.a.a.', 'aaaaa', 'aaaaa', '.aaa.', '..a..'], { a: 'rot' });
    z.raster(12, 17, ['..b..', '.bbb.', 'bbbbb', '..b..', '.bbb.'], { b: 'teer' });
  });
  sammlung('buendel', function (z) {
    z.kugel(16, 20, 11.5, 9.4, 'hanf');
    z.vieleck([[10, 5], [14, 10], [18, 10], [23, 4], [21, 11], [11, 11]], 'hanf');
    z.rechteck(12, 10, 20, 12, 'leder');
    z.strich(9, 24, 23, 17, 'hanf.dunkel');
  });
};
