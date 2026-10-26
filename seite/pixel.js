#!/usr/bin/env node
// Pixel-Ikonen für das Gepäck (inventar.js), 32 × 32 im Stil alter Taktikspiele: gefüllte Formen mit Licht von
// links oben, dunkle Kontur. Gezeichnet wird mit Materialien (Stahl, Holz, Leder …); Licht und Schatten setzt das
// Werkzeug selbst, ebenso die Kontur. Details (Gravuren, Nieten, Buchstaben) kommen als einzelne Farben obendrauf.
//
//   node seite/pixel.js                          gibt FARBEN und IKONEN für inventar.js aus (die Sammlung)
//   node seite/pixel.js --bogen bogen.png        zeichnet alle Ikonen der Sammlung als Bogen zum Ansehen
//   node seite/pixel.js --ding zeichnung.js [--png neu.png] [--bogen bogen.png]
//                                                zeichnet die Ikonen eines Dings (oder mehrerer) aus einer Datei und
//                                                gibt sie als json {Name: Raster} aus; --png schreibt die Karte
//                                                „Neu im Gepäck“ (Regelwerk 4.4), --bogen einen Bogen
//   node seite/pixel.js --raster raster.json --png karte.png
//                                                zeichnet fertige Raster (json {Name: Raster}) als Karte
//
// Eine Zeichnung für ein Ding ist eine kleine Datei:
//   module.exports = function (ikone) {
//     ikone('Brasks Dolch', function (z) {
//       z.von('dolch');                                  // von einer Ikone der Sammlung ausgehen, oder leer anfangen
//       z.balken(10, 20, 6, 24, 3, 'knochen');           // Griff aus Hirschhorn
//       z.punkt(5, 25, 'gold.hell');                     // ein Messingnagel
//     });
//   };
// Formen: rechteck, ellipse, ring, kugel (rund schattiert), vieleck, balken, klinge, kurve, linie, flaeche.
// Details: punkt, strich, punkte, raster (mit Legende). Löschen: weg, wegRechteck. Ausgehen von: von (Sammlung),
// vonRaster (eine fertige Ikone, etwa die alte eines Dings, das sich sichtbar verändert hat).
// Materialien und Farben: MATERIAL unten; Farbnamen für Details: 'stahl', 'stahl.hell', 'gold.tief', 'k' …
// Die Formen nehmen Pixelkoordinaten (0 bis 32, x nach rechts, y nach unten) und zählen ein Pixel, wenn seine
// Mitte drin liegt. Eine Pixelreihe Rand bleibt frei, damit die Kontur Platz hat.
// Ein Raster sind 32 Zeilen zu 32 Zeichen, mit | verbunden; '.' ist durchsichtig, 'k' die Kontur, jedes andere
// Zeichen eine Farbe aus FARBEN. So steht eine eigene Ikone im Gepäck unter `pixel`.
'use strict';
var N = 32;
var KONTUR = '#1d1a24';

// Materialien: Codes und Farben von hell über mittel und dunkel bis tief. Die Codes bleiben fest, damit
// gespeicherte Raster gültig bleiben; neue Materialien bekommen neue Zeichen, alte werden nie umbelegt.
var MATERIAL = {
  stahl: ['abcd', '#f4f7fb', '#c3ccd9', '#8592ab', '#55607a'],
  eisen: ['efgh', '#a9adb5', '#7d828c', '#565a63', '#373a41'],
  rost: ['ijl', '#e08a4a', '#b0592a', '#7a3518'],
  gold: ['mnop', '#fff4b0', '#f5cc4a', '#c8911c', '#8a5b10'],
  holz: ['qrst', '#e3a96c', '#b5743c', '#80491f', '#542c10'],
  dunkelholz: ['uvw', '#9a6a48', '#6e4528', '#4a2c18'],
  leder: ['xyzA', '#d8925a', '#a8642f', '#76411c', '#4f2810'],
  papier: ['BCDE', '#fffaea', '#efe2c2', '#cdb98e', '#9c8862'],
  rot: ['FGHI', '#ff8a6a', '#da4630', '#9a2618', '#62140c'],
  blau: ['JKLM', '#9cc4f5', '#5a8ad6', '#2f5aa2', '#1c3466'],
  gruen: ['NOPQ', '#b6e38a', '#6cb255', '#38773a', '#1f4a26'],
  gelb: ['RST', '#fff59a', '#f2d64a', '#c4a32a'],
  knochen: ['UVWX', '#fffcec', '#ecdfba', '#c2b087', '#8c7c5a'],
  tuch: ['YZ01', '#d6d8df', '#a6a9b5', '#717480', '#4a4c55'],
  hanf: ['2345', '#f1dfaa', '#d2b77a', '#9a7e4a', '#64502c'],
  stein: ['6789', '#c7c0a8', '#9a927a', '#6a6452', '#46412f'],
  wasser: ['!#$%', '#a6efe4', '#4cb8b0', '#25807c', '#14504e'],
  flamme: ['&()*', '#fffde0', '#ffe25a', '#ffa22e', '#e0581c'],
  tinte: ['+,-', '#5a6a9a', '#36406a', '#1f2540'],
  teer: ['/:;', '#6a5a4c', '#40352c', '#26201b'],
  lila: ['<=>', '#d9b8ff', '#9a6ae0', '#5e3aa0'],
  schildpatt: ['?@[', '#f0b860', '#b97a2c', '#6e4214'],
  weiss: [']', '#ffffff']
};
var FARBEN = { k: KONTUR }, STUFE = { hell: 0, mittel: 1, dunkel: 2, tief: 3 };
Object.keys(MATERIAL).forEach(function (m) {
  var M = MATERIAL[m];
  for (var i = 0; i < M[0].length; i++) FARBEN[M[0][i]] = M[i + 1];
});
function stufen(mat) { return MATERIAL[mat][0].length; }
function code(mat, stufe) {
  var M = MATERIAL[mat];
  if (!M) throw new Error('Material unbekannt: ' + mat + ' (' + Object.keys(MATERIAL).join(', ') + ')');
  return M[0][Math.max(0, Math.min(M[0].length - 1, stufe))];
}
// Farbname für Details: 'k', 'stahl', 'stahl.hell', 'stahl.dunkel', 'gold.tief' …
function farbe(name) {
  if (name === 'k' || name === 'kontur') return 'k';
  var t = String(name).split('.'), s = t.length > 1 ? STUFE[t[1]] : 1;
  if (s === undefined) throw new Error('Stufe unbekannt: ' + name + ' (hell, mittel, dunkel, tief)');
  return code(t[0], s);
}
function stufeIndex(s) { if (s == null) return null; if (typeof s === 'number') return s; if (STUFE[s] === undefined) throw new Error('Stufe unbekannt: ' + s); return STUFE[s]; }

/* ---------- Leinwand ---------- */
function Leinwand(n) {
  this.n = n || N;
  this.m = []; this.f = []; this.d = [];
  for (var y = 0; y < this.n; y++) {
    this.m.push([]); this.f.push([]); this.d.push([]);
    for (var x = 0; x < this.n; x++) { this.m[y].push(null); this.f[y].push(null); this.d[y].push(null); }
  }
}
var L = Leinwand.prototype;
L.drin = function (x, y) { return x >= 0 && y >= 0 && x < this.n && y < this.n; };
L.setze = function (x, y, mat, stufe) {
  if (!this.drin(x, y)) return this;
  if (!MATERIAL[mat]) throw new Error('Material unbekannt: ' + mat);
  this.m[y][x] = mat; this.f[y][x] = stufeIndex(stufe); this.d[y][x] = null;
  return this;
};
// Fläche nach einer Bedingung über die Pixelmitten
L.flaeche = function (wahr, mat, stufe) {
  for (var y = 0; y < this.n; y++) for (var x = 0; x < this.n; x++) if (wahr(x + 0.5, y + 0.5, x, y)) this.setze(x, y, mat, stufe);
  return this;
};
L.rechteck = function (x0, y0, x1, y1, mat, stufe) {
  for (var y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (var x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.setze(x, y, mat, stufe);
  return this;
};
L.ellipse = function (cx, cy, rx, ry, mat, stufe) {
  return this.flaeche(function (px, py) { var a = (px - cx) / rx, b = (py - cy) / ry; return a * a + b * b <= 1.0001; }, mat, stufe);
};
L.ring = function (cx, cy, rx, ry, dicke, mat, stufe) {
  return this.flaeche(function (px, py) {
    var a = (px - cx) / rx, b = (py - cy) / ry, c = (px - cx) / Math.max(0.1, rx - dicke), e = (py - cy) / Math.max(0.1, ry - dicke);
    return a * a + b * b <= 1.0001 && c * c + e * e > 1;
  }, mat, stufe);
};
function imVieleck(px, py, pts) {
  var c = false;
  for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
}
L.vieleck = function (pts, mat, stufe) { return this.flaeche(function (px, py) { return imVieleck(px, py, pts); }, mat, stufe); };
function richtung(ax, ay, bx, by) { var dx = bx - ax, dy = by - ay, l = Math.sqrt(dx * dx + dy * dy) || 1; return [dx / l, dy / l]; }
// Ein gerader Streifen von A nach B
L.balken = function (ax, ay, bx, by, breite, mat, stufe) {
  var r = richtung(ax, ay, bx, by), ox = -r[1] * breite / 2, oy = r[0] * breite / 2;
  return this.vieleck([[ax + ox, ay + oy], [bx + ox, by + oy], [bx - ox, by - oy], [ax - ox, ay - oy]], mat, stufe);
};
// Eine Klinge von A (Heft) nach B (Spitze); die letzten „spitze“ Pixel laufen zur Spitze zusammen
L.klinge = function (ax, ay, bx, by, breite, spitze, mat, stufe) {
  var r = richtung(ax, ay, bx, by), ox = -r[1] * breite / 2, oy = r[0] * breite / 2, sx = bx - r[0] * spitze, sy = by - r[1] * spitze;
  return this.vieleck([[ax + ox, ay + oy], [sx + ox, sy + oy], [bx, by], [sx - ox, sy - oy], [ax - ox, ay - oy]], mat, stufe);
};
// Ein Band entlang einer Bézierkurve P0 → P1 (Stütze) → P2, Breite von b0 nach b1
function bezier(p0, p1, p2, t) { var u = 1 - t; return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]; }
L.kurve = function (p0, p1, p2, b0, b1, mat, stufe) {
  var links = [], rechts = [], schritte = 40;
  for (var i = 0; i <= schritte; i++) {
    var t = i / schritte, p = bezier(p0, p1, p2, t), q = bezier(p0, p1, p2, Math.min(1, t + 0.01)), v = bezier(p0, p1, p2, Math.max(0, t - 0.01));
    var r = richtung(v[0], v[1], q[0], q[1]), w = (b0 + (b1 - b0) * t) / 2;
    links.push([p[0] - r[1] * w, p[1] + r[0] * w]); rechts.push([p[0] + r[1] * w, p[1] - r[0] * w]);
  }
  return this.vieleck(links.concat(rechts.reverse()), mat, stufe);
};
// Pixel der Kurve, etwa für Details: [[x, y], …]
function kurvenpunkte(p0, p1, p2, schritte) {
  var aus = [], schon = {};
  for (var i = 0; i <= (schritte || 60); i++) {
    var p = bezier(p0, p1, p2, i / (schritte || 60)), x = Math.floor(p[0]), y = Math.floor(p[1]);
    if (!schon[x + ',' + y]) { schon[x + ',' + y] = 1; aus.push([x, y]); }
  }
  return aus;
}
function bresenham(x0, y0, x1, y1, f) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
  for (;;) { f(x0, y0); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
L.linie = function (x0, y0, x1, y1, mat, stufe) { var z = this; bresenham(x0, y0, x1, y1, function (x, y) { z.setze(x, y, mat, stufe); }); return this; };
// Eine runde Form mit Licht von links oben (Kugel, Knauf, Perle, Flasche)
L.kugel = function (cx, cy, rx, ry, mat, glanz) {
  var lx = -0.45, ly = -0.6, lz = 0.66, n = Math.sqrt(lx * lx + ly * ly + lz * lz), st = stufen(mat), z = this;
  lx /= n; ly /= n; lz /= n;
  this.flaeche(function (px, py, x, y) {
    var a = (px - cx) / rx, b = (py - cy) / ry, q = a * a + b * b;
    if (q > 1.0001) return false;
    var c = Math.sqrt(Math.max(0, 1 - q)), l = a * lx + b * ly + c * lz;
    var s = l > 0.8 ? 0 : l > 0.45 ? 1 : l > 0.12 ? 2 : 3;
    z.setze(x, y, mat, Math.min(s, st - 1));
    if (glanz && l > 0.95) z.punkt(x, y, 'weiss');
    return false;
  });
  return this;
};
L.weg = function (wahr) {
  for (var y = 0; y < this.n; y++) for (var x = 0; x < this.n; x++) if (wahr(x + 0.5, y + 0.5, x, y)) { this.m[y][x] = null; this.f[y][x] = null; this.d[y][x] = null; }
  return this;
};
L.wegRechteck = function (x0, y0, x1, y1) { return this.weg(function (px, py, x, y) { return x >= x0 && x <= x1 && y >= y0 && y <= y1; }); };
// Details: einzelne Farben über den Formen
L.punkt = function (x, y, f) { if (this.drin(x, y)) this.d[y][x] = farbe(f); return this; };
L.punkte = function (liste, f) { var z = this; liste.forEach(function (p) { z.punkt(p[0], p[1], f); }); return this; };
L.strich = function (x0, y0, x1, y1, f) { var z = this; bresenham(x0, y0, x1, y1, function (x, y) { z.punkt(x, y, f); }); return this; };
// Ein Stück von Hand: Zeilen mit Zeichen, die die Legende auf Farbnamen abbildet; '.' und ' ' bleiben frei
L.raster = function (x0, y0, zeilen, legende) {
  var z = this;
  zeilen.forEach(function (r, j) { for (var i = 0; i < r.length; i++) { var c = r[i]; if (c === '.' || c === ' ') continue; if (!legende[c]) throw new Error('Legende ohne „' + c + '“'); z.punkt(x0 + i, y0 + j, legende[c]); } });
  return this;
};
// Von einer Ikone der Sammlung ausgehen
L.von = function (name) {
  if (!SAMMLUNG[name]) throw new Error('Keine Ikone „' + name + '“ in der Sammlung');
  SAMMLUNG[name](this);
  return this;
};
// Von einem fertigen Raster ausgehen (etwa der alten Ikone eines Dings, das sich verändert hat): Jedes Pixel wird
// ein Detail in seiner Farbe; was danach gezeichnet oder gelöscht wird, liegt darüber. Die Kontur zieht ergebnis()
// um alles Neue; alte Konturpixel bleiben, bis sie gelöscht werden.
L.vonRaster = function (raster) {
  var p = pruefeRaster(raster);
  if (p) throw new Error(p);
  var z = raster.split('|'), s = this.n / z.length;
  for (var y = 0; y < this.n; y++) for (var x = 0; x < this.n; x++) {
    var c = z[Math.floor(y / s)][Math.floor(x / s)];
    if (c !== '.') this.d[y][x] = c;
  }
  return this;
};
// Licht und Schatten, Details, Kontur: das fertige Raster als Zeilen
L.ergebnis = function () {
  var n = this.n, m = this.m, f = this.f, d = this.d, aus = [];
  function anders(x, y, mat) { return x < 0 || y < 0 || x >= n || y >= n || m[y][x] !== mat; }
  for (var y = 0; y < n; y++) {
    var zeile = [];
    for (var x = 0; x < n; x++) {
      var mat = m[y][x], c = '.';
      if (mat) {
        var s = f[y][x];
        if (s === null) {
          var wert = (anders(x, y - 1, mat) ? 1 : 0) + (anders(x - 1, y, mat) ? 1 : 0) - (anders(x, y + 1, mat) ? 1 : 0) - (anders(x + 1, y, mat) ? 1 : 0);
          s = wert > 0 ? 0 : wert === 0 ? 1 : wert === -1 ? 2 : 3;
        }
        c = code(mat, Math.min(s, stufen(mat) - 1));
      }
      if (d[y][x]) c = d[y][x];
      zeile.push(c);
    }
    aus.push(zeile);
  }
  // Kontur um alles Gefüllte
  var mitKontur = aus.map(function (r) { return r.slice(); });
  for (var yy = 0; yy < n; yy++) for (var xx = 0; xx < n; xx++) {
    if (aus[yy][xx] !== '.') continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (v) { var X = xx + v[0], Y = yy + v[1]; return X >= 0 && Y >= 0 && X < n && Y < n && aus[Y][X] !== '.' && aus[Y][X] !== 'k'; })) mitKontur[yy][xx] = 'k';
  }
  return mitKontur.map(function (r) { return r.join(''); });
};

/* ---------- Prüfen und Ausgeben ---------- */
function pruefeRaster(r) {
  var z = String(r || '').split('|'), n = z.length;
  if (n !== 16 && n !== 32) return 'Ein Raster hat 16 oder 32 Zeilen, dieses ' + n + '.';
  for (var i = 0; i < n; i++) {
    if (z[i].length !== n) return 'Zeile ' + (i + 1) + ' hat ' + z[i].length + ' Zeichen statt ' + n + '.';
    for (var j = 0; j < n; j++) if (z[i][j] !== '.' && !FARBEN[z[i][j]]) return 'Zeichen „' + z[i][j] + '“ in Zeile ' + (i + 1) + ' ist keine Farbe.';
  }
  return '';
}
// PNG ohne Bibliotheken: rgba ist ein Buffer mit breite × hoehe × 4 Bytes
var CRC = (function () { var t = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { var c = 0xffffffff; for (var i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function stueck(typ, daten) {
  var l = Buffer.alloc(4); l.writeUInt32BE(daten.length);
  var td = Buffer.concat([Buffer.from(typ, 'ascii'), daten]), c = Buffer.alloc(4); c.writeUInt32BE(crc32(td));
  return Buffer.concat([l, td, c]);
}
function png(breite, hoehe, rgba) {
  var zlib = require('zlib'), roh = Buffer.alloc((breite * 4 + 1) * hoehe);
  for (var y = 0; y < hoehe; y++) { roh[y * (breite * 4 + 1)] = 0; rgba.copy(roh, y * (breite * 4 + 1) + 1, y * breite * 4, (y + 1) * breite * 4); }
  var kopf = Buffer.alloc(13); kopf.writeUInt32BE(breite, 0); kopf.writeUInt32BE(hoehe, 4); kopf[8] = 8; kopf[9] = 6; kopf[10] = 0; kopf[11] = 0; kopf[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), stueck('IHDR', kopf), stueck('IDAT', zlib.deflateSync(roh, { level: 9 })), stueck('IEND', Buffer.alloc(0))]);
}
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function Bild(b, h) { this.b = b; this.h = h; this.px = Buffer.alloc(b * h * 4, 0); }
Bild.prototype.setze = function (x, y, rgb, a) {
  if (x < 0 || y < 0 || x >= this.b || y >= this.h) return;
  var o = (y * this.b + x) * 4; this.px[o] = rgb[0]; this.px[o + 1] = rgb[1]; this.px[o + 2] = rgb[2]; this.px[o + 3] = a == null ? 255 : a;
};
// Die Kachel wie im Tisch: blaues Feld mit hellem Rand, abgerundet
Bild.prototype.kachel = function (x0, y0, g) {
  var oben = hex('#3a4a6e'), unten = hex('#26304d'), rand = hex('#8fa3cf'), aussen = hex('#141a2b'), r = Math.max(4, Math.round(g * 0.08)), h = g / 2;
  for (var y = 0; y < g; y++) for (var x = 0; x < g; x++) {
    // Abstand zum Rand eines abgerundeten Quadrats (negativ: innen)
    var qx = Math.abs(x + 0.5 - h) - (h - r), qy = Math.abs(y + 0.5 - h) - (h - r);
    var d = Math.sqrt(Math.max(qx, 0) * Math.max(qx, 0) + Math.max(qy, 0) * Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    if (d > 0) continue;
    var t = y / (g - 1), f = [Math.round(oben[0] + (unten[0] - oben[0]) * t), Math.round(oben[1] + (unten[1] - oben[1]) * t), Math.round(oben[2] + (unten[2] - oben[2]) * t)];
    if (d > -2) f = aussen; else if (d > -4) f = rand;
    this.setze(x0 + x, y0 + y, f);
  }
};
Bild.prototype.ikone = function (x0, y0, raster, skala) {
  var z = raster.split('|'), n = z.length, s = skala * 32 / n;
  for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
    var c = z[y][x]; if (c === '.') continue;
    var rgb = hex(FARBEN[c]);
    for (var a = 0; a < s; a++) for (var b = 0; b < s; b++) this.setze(x0 + x * s + b, y0 + y * s + a, rgb);
  }
};
Bild.prototype.png = function () { return png(this.b, this.h, this.px); };
// Die Karte „Neu im Gepäck“: jede Ikone vierfach auf ihrer Kachel, nebeneinander
function karte(raster) {
  var g = 152, luecke = 10, b = raster.length * g + (raster.length - 1) * luecke, bild = new Bild(b, g);
  raster.forEach(function (r, i) { bild.kachel(i * (g + luecke), 0, g); bild.ikone(i * (g + luecke) + 12, 12, r, 4); });
  return bild.png();
}
// Ein Bogen zum Ansehen: viele Ikonen dreifach auf hellem Grund
function bogen(raster, spalten, skala) {
  spalten = spalten || 8; skala = skala || 3;
  var g = 32 * skala + 12, zeilen = Math.ceil(raster.length / spalten), bild = new Bild(spalten * g, zeilen * g);
  for (var y = 0; y < bild.h; y++) for (var x = 0; x < bild.b; x++) bild.setze(x, y, hex('#d9cfb9'));
  raster.forEach(function (r, i) { var x = (i % spalten) * g, y = Math.floor(i / spalten) * g; bild.kachel(x + 2, y + 2, g - 4); bild.ikone(x + 6, y + 6, r, skala); });
  return bild.png();
}

/* ---------- Die Sammlung ---------- */
var SAMMLUNG = {}, REIHE = [];
function sammlung(name, f) { SAMMLUNG[name] = f; REIHE.push(name); }
function zeichne(f) { var z = new Leinwand(N); f(z); return z.ergebnis().join('|'); }

require('./pixel-sammlung.js')(sammlung, { kurvenpunkte: kurvenpunkte });

if (require.main === module) {
  var fs = require('fs'), path = require('path'), args = process.argv.slice(2);
  var wo = function (k) { var i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  if (args[0] === '--ding' || args[0] === '--raster') {
    var fertig = {};
    if (args[0] === '--ding') {
      require(path.resolve(args[1]))(function (name, f) { fertig[name] = zeichne(f); }, { kurvenpunkte: kurvenpunkte, MATERIAL: MATERIAL });
    } else {
      fertig = JSON.parse(fs.readFileSync(args[1], 'utf8'));
      Object.keys(fertig).forEach(function (k) { var p = pruefeRaster(fertig[k]); if (p) throw new Error(k + ': ' + p); });
    }
    if (wo('--png')) fs.writeFileSync(wo('--png'), karte(Object.keys(fertig).map(function (k) { return fertig[k]; })));
    if (wo('--bogen')) fs.writeFileSync(wo('--bogen'), bogen(Object.keys(fertig).map(function (k) { return fertig[k]; }), 6, 3));
    console.log(JSON.stringify(fertig, null, 1));
  } else if (args[0] === '--bogen') {
    fs.writeFileSync(args[1], bogen(REIHE.map(function (n) { return zeichne(SAMMLUNG[n]); }), +(wo('--spalten') || 8), +(wo('--skala') || 3)));
    console.log(REIHE.join(' '));
  } else {
    console.log('var FARBEN = ' + JSON.stringify(FARBEN) + ';');
    console.log('var IKONEN = {');
    REIHE.forEach(function (n, i) { console.log('  ' + JSON.stringify(n) + ': ' + JSON.stringify(zeichne(SAMMLUNG[n])) + (i < REIHE.length - 1 ? ',' : '')); });
    console.log('};');
  }
}
module.exports = { Leinwand: Leinwand, SAMMLUNG: SAMMLUNG, REIHE: REIHE, FARBEN: FARBEN, MATERIAL: MATERIAL, zeichne: zeichne, pruefeRaster: pruefeRaster, karte: karte, bogen: bogen, png: png, kurvenpunkte: kurvenpunkte };
