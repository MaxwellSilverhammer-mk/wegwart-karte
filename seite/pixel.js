#!/usr/bin/env node
// Pixel-Ikonen für das Gepäck (inventar.js), 16 × 16 im Stil alter Taktikspiele: gefüllte Formen, dunkle Kontur.
// Aufruf: node seite/pixel.js            schreibt die Raster als JS-Objekt (zum Einsetzen in inventar.js, Block IKONEN)
//         node seite/pixel.js --png <d>  schreibt dazu einen Bogen aller Ikonen als PPM-Datei zum Ansehen
// Jede Ikone wird aus wenigen Grundformen gezeichnet; die Kontur (k) setzt das Werkzeug selbst um alles Gefüllte.
'use strict';
var N = 16;

// Palette: ein Buchstabe je Farbe; k ist die Kontur
var FARBEN = {
  k: '#1d1a24',
  s: '#e4e8ef', S: '#a3aec0', d: '#5f6a7e',          // Stahl hell, mittel, dunkel
  w: '#c8894a', W: '#7a4a24',                        // Holz
  g: '#f2c94c', G: '#b07d1e',                        // Gold, Messing
  r: '#c8412f', R: '#7d1f16',                        // Rot
  l: '#a8693c', L: '#6b3f22',                        // Leder
  p: '#f4ead2', P: '#cdb98e',                        // Papier
  b: '#4a7cc4', B: '#253f78',                        // Blau
  n: '#5ea152', N: '#2f6230',                        // Grün
  o: '#efe6c8', O: '#b9aa83',                        // Knochen
  f: '#ffae2a', F: '#fff2a6',                        // Flamme
  c: '#9a9ca8', C: '#5e606b',                        // Tuch grau
  h: '#d2bb80', H: '#8f7748',                        // Hanf
  e: '#2c3350',                                      // Tinte
  m: '#8e866f', M: '#5e584a',                        // Schlamm, Stein
  t: '#3d8c8a', T: '#1f5654',                        // Türkis (Wasser, Glas)
  y: '#f6e27a'
};

function leer() { var g = []; for (var y = 0; y < N; y++) { g.push([]); for (var x = 0; x < N; x++) g[y].push('.'); } return g; }
function Z(g) {
  return {
    g: g,
    p: function (x, y, c) { if (x >= 0 && y >= 0 && x < N && y < N) g[y][x] = c; return this; },
    linie: function (x0, y0, x1, y1, c) {
      var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
      for (;;) { this.p(x0, y0, c); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
      return this;
    },
    rechteck: function (x0, y0, x1, y1, c) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) this.p(x, y, c); return this; },
    ellipse: function (cx, cy, rx, ry, c) {
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) { var a = (x - cx) / rx, b = (y - cy) / ry; if (a * a + b * b <= 1.0001) this.p(x, y, c); }
      return this;
    },
    // Raster als Zeilen, '.' bleibt, alles andere wird gesetzt
    bild: function (x0, y0, zeilen) { zeilen.forEach(function (z, j) { for (var i = 0; i < z.length; i++) if (z[i] !== '.') g[y0 + j][x0 + i] = z[i]; }); return this; }
  };
}
function kontur(g) {
  var h = g.map(function (r) { return r.slice(); });
  for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
    if (g[y][x] !== '.') continue;
    var n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { var X = x + d[0], Y = y + d[1]; return X >= 0 && Y >= 0 && X < N && Y < N && g[Y][X] !== '.' && g[Y][X] !== 'k'; });
    if (n) h[y][x] = 'k';
  }
  return h;
}

var I = {};
function ikone(name, f) { var g = leer(), z = Z(g); f(z); I[name] = kontur(g).map(function (r) { return r.join(''); }); }

/* ---------- Waffen (diagonal, Spitze oben rechts wie im Taktikspiel) ---------- */
ikone('schwert', function (z) {
  z.linie(13, 2, 6, 9, 's').linie(14, 2, 7, 9, 'S').p(14, 1, 's').p(13, 1, 's');
  z.linie(13, 3, 7, 9, 'S');
  z.linie(3, 8, 7, 12, 'G').linie(4, 8, 8, 12, 'g');
  z.linie(5, 10, 3, 12, 'W').linie(4, 10, 2, 12, 'W');
  z.p(2, 13, 'g').p(1, 13, 'G').p(2, 14, 'G').p(1, 14, 'g');
});
ikone('dolch', function (z) {
  z.linie(12, 4, 8, 8, 's').linie(13, 4, 9, 8, 'S').p(13, 3, 's');
  z.linie(5, 7, 8, 10, 'G');
  z.linie(6, 10, 4, 12, 'l').linie(5, 10, 3, 12, 'L');
  z.p(3, 13, 'G').p(2, 13, 'g');
});
ikone('saebel', function (z) {
  z.p(13, 2, 's').p(13, 3, 's').p(12, 4, 's').p(12, 5, 's').p(11, 6, 's').p(10, 7, 's').p(9, 8, 's').p(8, 9, 's');
  z.p(14, 2, 'S').p(14, 3, 'S').p(13, 4, 'S').p(13, 5, 'S').p(12, 6, 'S').p(11, 7, 'S').p(10, 8, 'S').p(9, 9, 'S');
  z.linie(5, 9, 8, 12, 'g');
  z.linie(6, 11, 4, 13, 'W').linie(7, 11, 5, 13, 'W');
  z.p(3, 14, 'g');
});
ikone('kolben', function (z) {
  z.linie(4, 13, 9, 8, 'W').linie(3, 13, 8, 8, 'w');
  z.ellipse(11, 5, 3, 3, 'S').p(10, 4, 's').p(11, 3, 's');
  z.p(14, 5, 'd').p(11, 2, 'd').p(8, 5, 'd').p(11, 8, 'd');
  z.p(2, 14, 'd');
});
ikone('armbrust', function (z) {
  z.linie(3, 13, 11, 5, 'W').linie(4, 13, 12, 5, 'w');
  z.linie(5, 4, 13, 12, 'w').linie(6, 4, 13, 11, 'W');
  z.linie(5, 4, 3, 13, 'c');
  z.p(12, 4, 's').p(13, 3, 's').p(14, 2, 's');
});
ikone('bolzen', function (z) {
  z.linie(3, 12, 11, 4, 'w');
  z.p(12, 3, 's').p(11, 3, 'S').p(12, 4, 'S').p(13, 2, 's');
  z.p(2, 12, 'r').p(3, 13, 'r').p(2, 13, 'R');
});
ikone('glefe', function (z) {
  z.linie(2, 14, 10, 6, 'W');
  z.bild(9, 1, ['...s', '..ss', '.sSs', 'sSS.', 'sS..']);
});

/* ---------- Rüstung, Kleidung ---------- */
ikone('ruestung', function (z) {
  z.rechteck(4, 4, 11, 13, 'l').rechteck(2, 3, 4, 7, 'l').rechteck(11, 3, 13, 7, 'l');
  z.rechteck(6, 2, 9, 3, '.');
  z.linie(7, 4, 7, 13, 'L');
  [[5, 6], [9, 6], [5, 9], [9, 9], [5, 12], [9, 12], [3, 5], [12, 5]].forEach(function (q) { z.p(q[0], q[1], 'g'); });
});
ikone('kleidung', function (z) {
  z.rechteck(4, 4, 11, 13, 'b').rechteck(2, 4, 3, 9, 'b').rechteck(12, 4, 13, 9, 'b');
  z.rechteck(6, 3, 9, 4, '.').p(7, 5, 'B').p(8, 5, 'B').p(7, 6, 'B');
  z.rechteck(4, 10, 11, 10, 'L');
});
ikone('mantel', function (z) {
  z.bild(3, 1, ['...MMMM...', '..MmmmmM..', '..Mm..mM..', '..Mm..mM..', '..MmmmmM..', '.MmmmmmmM.', '.MmmmMmmM.', 'MmmmmMmmmM', 'MmmmmMmmmM', 'MmmmmMmmmM', 'MmmmmMmmmM', 'MmmmmMmmmM', 'MMMMMMMMMM']);
  z.rechteck(6, 3, 7, 4, 'C');
  z.rechteck(2, 1, 13, 1, '.').rechteck(4, 0, 11, 1, 'W').rechteck(1, 1, 14, 1, 'W');
});
ikone('kostuem', function (z) {
  z.ellipse(7.5, 7, 5.5, 5, 'n').rechteck(2, 7, 13, 9, 'n');
  z.rechteck(4, 6, 6, 7, 'k').rechteck(9, 6, 11, 7, 'k');
  z.linie(5, 11, 10, 11, 'N');
  z.p(2, 3, 'y').p(13, 3, 'y').rechteck(2, 2, 3, 3, 'g').rechteck(12, 2, 13, 3, 'g');
});

/* ---------- Instrumente ---------- */
ikone('laute', function (z) {
  z.ellipse(5.5, 10.5, 4, 4, 'w').p(4, 10, 'W').p(5, 10, 'k').p(6, 11, 'k').p(5, 11, 'k').p(6, 10, 'k');
  z.linie(8, 7, 12, 3, 'W').linie(9, 7, 13, 3, 'W');
  z.rechteck(12, 1, 14, 3, 'L');
  z.linie(4, 13, 12, 4, 'P');
});
ikone('floete', function (z) {
  [[2, 12], [4, 11], [6, 10], [8, 9], [10, 8], [12, 7]].forEach(function (r, i) { z.rechteck(r[0], 3, r[0] + 1, r[1], i % 2 ? 'H' : 'h'); z.p(r[0], 3, 'W'); z.p(r[0] + 1, 3, 'W'); });
  z.rechteck(2, 5, 13, 6, 'r').rechteck(2, 6, 13, 6, 'R');
});

/* ---------- Ausrüstung ---------- */
ikone('seil', function (z) {
  z.ellipse(7.5, 8, 6, 5, 'h').ellipse(7.5, 8, 3.5, 2.6, '.');
  z.ellipse(7.5, 8, 4.6, 3.7, 'H').ellipse(7.5, 8, 3.5, 2.6, '.');
  z.linie(12, 11, 14, 14, 'h');
});
ikone('kerze', function (z) {
  z.rechteck(6, 7, 9, 13, 'p').rechteck(9, 7, 9, 13, 'P');
  z.p(7, 6, 'k').ellipse(7.5, 3.5, 1.4, 2.3, 'f').p(7, 4, 'F').p(8, 4, 'F');
  z.rechteck(4, 14, 11, 14, 'G');
});
ikone('laterne', function (z) {
  z.rechteck(5, 5, 10, 12, 'G').rechteck(6, 6, 9, 11, 'F').rechteck(7, 7, 8, 10, 'f');
  z.rechteck(4, 4, 11, 4, 'd').rechteck(4, 13, 11, 13, 'd');
  z.rechteck(6, 2, 9, 3, 'd').p(7, 1, 'S').p(8, 1, 'S');
});
ikone('decke', function (z) {
  z.ellipse(5, 8, 3.5, 5, 'r').rechteck(5, 3, 12, 13, 'r').ellipse(12, 8, 2, 5, 'R');
  z.linie(5, 4, 5, 12, 'R').rechteck(8, 3, 9, 13, 'g');
});
ikone('netz', function (z) {
  z.rechteck(2, 3, 13, 12, 'c');
  for (var y = 3; y <= 12; y++) for (var x = 2; x <= 13; x++) if ((x + y) % 3 && (x - y + 30) % 3) z.p(x, y, '.');
});
ikone('rucksack', function (z) {
  z.rechteck(3, 4, 12, 14, 'l').ellipse(7.5, 4, 4.5, 2.4, 'l');
  z.rechteck(4, 7, 11, 9, 'L').rechteck(7, 8, 8, 9, 'g');
  z.rechteck(5, 11, 10, 13, 'L');
  z.linie(6, 1, 9, 1, 'L');
});
ikone('schlauch', function (z) {
  z.ellipse(7.5, 9.5, 5, 4.5, 'l').p(5, 8, 'w').p(6, 7, 'w');
  z.rechteck(7, 2, 8, 5, 'L').rechteck(6, 1, 9, 1, 'W');
  z.linie(3, 7, 12, 7, 'L');
});
ikone('werkzeug', function (z) {
  z.bild(2, 3, ['....mmmmmm..', '..mmMmmmmmm.', '.mmmmmmMmmm.', 'mmMmmmmmmmmM', 'mmmmmmmmmMM.', '.MMMMMMMMM..']);
  z.rechteck(4, 11, 11, 13, '.');
});
ikone('striegel', function (z) {
  z.rechteck(2, 6, 13, 9, 'w').rechteck(2, 9, 13, 9, 'W');
  for (var x = 2; x <= 13; x += 2) z.rechteck(x, 10, x, 12, 'H');
  z.linie(4, 5, 11, 5, 'W');
});
ikone('boot', function (z) {
  z.bild(1, 7, ['w............w', 'wwwwwwwwwwwwww', '.WwwwwwwwwwwW.', '..WWWWWWWWWW..']);
  z.linie(9, 3, 9, 7, 'W').linie(10, 2, 3, 13, 'w');
  z.rechteck(1, 12, 14, 13, 't');
});
ikone('wasser', function (z) { z.ellipse(7.5, 9, 4.5, 5, 't').p(6, 8, 's'); z.linie(7, 2, 3, 8, 't').linie(8, 2, 12, 8, 't').p(7, 3, 't').p(8, 3, 't'); });

/* ---------- Proviant und Mittel ---------- */
ikone('ration', function (z) {
  z.ellipse(7.5, 9, 6.5, 4, 'w').ellipse(7.5, 8, 5.5, 3, 'g');
  z.linie(4, 7, 5, 9, 'W').linie(7, 6, 8, 8, 'W').linie(10, 7, 11, 9, 'W');
});
ikone('fisch', function (z) {
  z.ellipse(7, 8, 5.5, 2.4, 'S').ellipse(7, 9, 5, 1.2, 's');
  z.bild(12, 5, ['..SS', '.SS.', 'SS..', 'SS..', '.SS.', '..SS']);
  z.p(3, 7, 'k');
  z.linie(4, 9, 11, 9, 'h');
});
ikone('kraut', function (z) {
  z.ellipse(7.5, 10, 5, 4, 'l').p(5, 9, 'w');
  z.rechteck(6, 5, 9, 6, 'L').linie(5, 6, 10, 6, 'h');
  z.p(6, 3, 'n').p(7, 2, 'n').p(8, 3, 'N').p(9, 2, 'n').p(7, 4, 'N').p(8, 4, 'n');
});
ikone('schale', function (z) {
  z.ellipse(7.5, 8, 6.5, 2.6, 'm').ellipse(7.5, 8, 5, 1.6, 'M');
  z.bild(2, 9, ['OOOOOOOOOOOO', '.OoOoOoOoOO.', '..OOOOOOOO..', '....OOOO....']);
});
ikone('trank', function (z) {
  z.ellipse(7.5, 10, 4.5, 4, 't').rechteck(6, 3, 9, 6, 't').p(6, 9, 's').p(6, 10, 's');
  z.rechteck(6, 1, 9, 2, 'W');
});

/* ---------- Papiere ---------- */
ikone('brief', function (z) {
  z.rechteck(1, 4, 14, 12, 'p').rechteck(1, 12, 14, 12, 'P');
  z.linie(1, 4, 7, 9, 'P').linie(14, 4, 8, 9, 'P');
  z.ellipse(7.5, 9, 1.8, 1.6, 'r').p(7, 9, 'R');
});
ikone('siegel', function (z) {
  z.rechteck(2, 2, 13, 13, 'p').rechteck(13, 2, 13, 13, 'P');
  z.linie(4, 4, 11, 4, 'P').linie(4, 6, 11, 6, 'P').linie(4, 8, 8, 8, 'P');
  z.ellipse(10.5, 10.5, 2.5, 2.5, 'r').p(10, 10, 'g').p(11, 11, 'R');
  z.linie(9, 13, 8, 15, 'b').linie(11, 13, 12, 15, 'b');
});
ikone('rolle', function (z) {
  z.rechteck(3, 3, 12, 12, 'p').rechteck(3, 3, 3, 12, 'P');
  z.rechteck(2, 2, 13, 2, 'P').rechteck(2, 13, 13, 13, 'P');
  z.linie(5, 5, 10, 5, 'P').linie(5, 7, 11, 7, 'P').linie(5, 9, 9, 9, 'P').linie(5, 11, 10, 11, 'P');
});
ikone('karte', function (z) {
  z.bild(1, 3, ['pppPppppPppppp', 'pppPppppPppppp', 'pnnPpppbPbbppp', 'pnnnpppbbbpppp', 'ppnPpppbPpprpp', 'pppPppppPprrrp', 'pppPppppPpprpp', 'PPPPPPPPPPPPPP', '...']);
  z.rechteck(1, 10, 14, 10, 'P');
});
ikone('tinte', function (z) {
  z.ellipse(5.5, 11, 4, 3, 'e').rechteck(4, 6, 7, 8, 'e').p(4, 10, 'b');
  z.rechteck(4, 5, 7, 5, 'W');
  z.linie(7, 9, 13, 1, 'p').linie(8, 9, 14, 2, 'P').p(14, 1, 'p');
});
ikone('feder', function (z) {
  z.bild(3, 1, ['.........pp', '........ppP', '.......ppP.', '......ppP..', '.....ppP...', '....ppP....', '...ppP.....', '..pPP......', '..PP.......', '.P.........', 'e..........']);
});
ikone('wachs', function (z) {
  z.rechteck(3, 6, 12, 12, 'r').rechteck(3, 10, 12, 12, 'R').rechteck(12, 6, 12, 12, 'R');
  z.linie(4, 7, 7, 7, 'F');
  z.linie(7, 4, 9, 6, 'R');
});
ikone('kohle', function (z) { z.linie(3, 13, 12, 4, 'e').linie(4, 13, 13, 4, 'C').p(13, 3, 'e'); z.rechteck(2, 14, 3, 14, 'e'); });

/* ---------- Zeichen, Wertsachen, Fundstücke ---------- */
ikone('beutel', function (z) {
  z.ellipse(7.5, 10, 5.5, 4.5, 'l').p(5, 8, 'w').p(6, 9, 'w');
  z.rechteck(6, 4, 9, 6, 'L').linie(5, 6, 10, 6, 'g');
  z.rechteck(6, 2, 9, 3, 'l');
  z.ellipse(10, 12, 1.5, 1.2, 'g').p(10, 12, 'G');
});
ikone('muenze', function (z) { z.ellipse(7.5, 7.5, 5.5, 5.5, 'g').ellipse(7.5, 7.5, 3.5, 3.5, 'G').ellipse(7.5, 7.5, 2.5, 2.5, 'g').p(7, 7, 'r'); });
ikone('schluessel', function (z) {
  z.ellipse(4.5, 5, 3, 3, 'G').ellipse(4.5, 5, 1.2, 1.2, '.');
  z.linie(7, 7, 13, 13, 'G').linie(7, 8, 12, 13, 'g');
  z.p(11, 13, 'G').p(10, 13, 'G').p(12, 11, 'G').p(13, 10, 'G');
});
ikone('band', function (z) {
  z.ellipse(5, 6, 3, 2.4, 'n').ellipse(10, 6, 3, 2.4, 'n').rechteck(7, 5, 8, 7, 'N');
  z.linie(7, 8, 4, 14, 'n').linie(8, 8, 11, 14, 'n').p(4, 6, 'N').p(11, 6, 'N');
});
ikone('band-blau', function (z) {
  z.ellipse(5, 6, 3, 2.4, 'b').ellipse(10, 6, 3, 2.4, 'b').rechteck(7, 5, 8, 7, 'B');
  z.linie(7, 8, 4, 14, 'b').linie(8, 8, 11, 14, 'b').p(4, 6, 'B').p(11, 6, 'B');
});
ikone('flagge', function (z) {
  z.linie(3, 2, 3, 14, 'W');
  z.rechteck(4, 2, 13, 8, 'b').rechteck(4, 7, 13, 8, 'B').rechteck(10, 2, 13, 8, 'B').p(13, 2, '.').p(13, 8, '.');
  z.rechteck(6, 4, 8, 6, 's');
});
ikone('perle', function (z) {
  z.ellipse(7.5, 7.5, 5, 5, 'n').ellipse(7.5, 8.5, 4, 3.5, 'N').ellipse(6.5, 6.5, 2.5, 2.5, 'n').p(5, 5, 's').p(6, 5, 's');
  z.linie(6, 10, 9, 10, 'k').linie(7, 9, 9, 9, 'k').p(8, 8, 'k');
});
ikone('scheibe', function (z) { z.ellipse(7.5, 7.5, 6, 6, 'o').ellipse(7.5, 8.5, 5, 4.5, 'O').ellipse(7, 7, 4.5, 4.5, 'o'); z.p(4, 7, 'k').p(7, 6, 'k').p(8, 6, 'k').p(11, 7, 'k'); });
ikone('kompass', function (z) {
  z.ellipse(7.5, 8.5, 6, 6, 'G').ellipse(7.5, 8.5, 4.6, 4.6, 't').ellipse(7.5, 8.5, 3.6, 3.6, 'p');
  z.linie(8, 6, 7, 9, 'r').linie(7, 10, 6, 11, 'C');
  z.rechteck(6, 1, 9, 2, 'G');
  z.linie(9, 5, 11, 8, 'C');
});
ikone('seide', function (z) { z.linie(2, 12, 6, 4, 'r').linie(5, 13, 10, 3, 'R').linie(8, 13, 13, 5, 'r').linie(3, 13, 12, 6, 'r'); });
ikone('schwimmer', function (z) {
  z.linie(1, 4, 14, 4, 'h');
  [[3, 8], [8, 9], [13, 7]].forEach(function (q) { z.ellipse(q[0], q[1], 1.8, 2.6, 'w'); z.p(q[0], q[1] - 1, 'W'); z.linie(q[0], 4, q[0], q[1] - 3, 'h'); });
});
ikone('tuch', function (z) {
  z.bild(2, 3, ['ppppppppppp.', 'pppppppppppp', 'ppMpppppppPp', 'pppppppMpppp', 'pPppppMMpppp', 'ppppppppppPp', 'pppppPpppppp', '.pppppppPppp', '..PPPPPPPPP.']);
});
ikone('karten', function (z) {
  z.rechteck(2, 4, 9, 13, 'p').rechteck(6, 2, 13, 11, 'p').rechteck(6, 2, 13, 2, 'P');
  z.p(9, 6, 'r').p(10, 6, 'r').p(9, 7, 'r').p(10, 7, 'r').p(9, 5, 'r').p(10, 8, 'r').p(4, 10, 'k').p(5, 10, 'k').p(4, 11, 'k');
});
ikone('punkt', function (z) { z.ellipse(7.5, 7.5, 3.5, 3.5, 'c').p(6, 6, 's'); });

if (require.main === module) {
  var args = process.argv.slice(2);
  if (args[0] === '--png') {
    var namen = Object.keys(I), sp = 8, sk = 4, w = sp * (N * sk + 8), zeilen = Math.ceil(namen.length / sp), h = zeilen * (N * sk + 8);
    var px = Buffer.alloc(w * h * 3, 0xd9);
    function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
    namen.forEach(function (n, i) {
      var ox = (i % sp) * (N * sk + 8) + 4, oy = Math.floor(i / sp) * (N * sk + 8) + 4;
      I[n].forEach(function (r, y) { for (var x = 0; x < N; x++) { var c = r[x]; if (c === '.') continue; var rgb = hex(FARBEN[c]); for (var a = 0; a < sk; a++) for (var b = 0; b < sk; b++) { var o = ((oy + y * sk + a) * w + ox + x * sk + b) * 3; px[o] = rgb[0]; px[o + 1] = rgb[1]; px[o + 2] = rgb[2]; } } });
    });
    require('fs').writeFileSync(args[1], Buffer.concat([Buffer.from('P6\n' + w + ' ' + h + '\n255\n'), px]));
    console.log(namen.join(' '));
  } else {
    console.log('var FARBEN = ' + JSON.stringify(FARBEN) + ';');
    console.log('var IKONEN = {');
    Object.keys(I).forEach(function (n, i, a) { console.log('    ' + JSON.stringify(n) + ': ' + JSON.stringify(I[n].join('|')) + (i < a.length - 1 ? ',' : '')); });
    console.log('};');
  }
}
module.exports = { IKONEN: I, FARBEN: FARBEN };
