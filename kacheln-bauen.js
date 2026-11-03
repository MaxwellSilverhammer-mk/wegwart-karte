#!/usr/bin/env node
// Baut kacheln.js aus der Seite „Kacheln der Kampfkarte“ (Artefakt des Weltenhüters, https://claude.ai/artifact/DrXHmiHsozWNf1uXgGmJuC).
// Die Seite bleibt die einzige Quelle: Hier wird nichts von Hand gezeichnet und kacheln.js nie von Hand geändert. Neue Fassung der Seite holen
// (Artifact, action read, path index.html), dann:  node kacheln-bauen.js <index.html> > kacheln.js
// Übernommen wird der Zeichenmotor mit den zehn Sets bis zur Liste der Sets. Weg bleiben die Seite selbst und die Probekarten (die braucht keine
// Kampfkarte, und in ihren Erklärungen stehen Spielsteine einer Figur). Die Kampfkarte lädt die Datei nur, wenn eine Karte `gelaende` trägt.
'use strict';
var fs = require('fs'), crypto = require('crypto');
var datei = process.argv[2];
if (!datei) { console.error('Aufruf: node kacheln-bauen.js <index.html> > kacheln.js'); process.exit(2); }
var roh = fs.readFileSync(datei), zeilen = roh.toString('utf8').split('\n');
var start = zeilen.findIndex(function (z, i) { return z === '(function () {' && zeilen[i - 1] === '<script>'; });
var ende = zeilen.findIndex(function (z) { return z.indexOf('  var SETLISTE = [') === 0; });
if (start < 0 || ende < 0) { console.error('Die Seite hat nicht den erwarteten Aufbau: Skriptanfang oder SETLISTE fehlt.'); process.exit(1); }
var aus = [], weg = 0, i = start;
while (i <= ende) {
  // Die Probekarten und die Blätter der Seite: je ein Block `  NAME.karte = {` bis `  };`
  if (/^  [A-Z]+\.(karte|hausblatt|hafen) = \{$/.test(zeilen[i])) {
    var j = i; while (j <= ende && zeilen[j] !== '  };') j++;
    if (j > ende) { console.error('Block ohne Ende: ' + zeilen[i]); process.exit(1); }
    weg += j - i + 1; i = j + 1; continue;
  }
  aus.push(zeilen[i]); i++;
}
var kern = aus.join('\n');
['.karte', '.hausblatt.', '.hafen.'].forEach(function (s) {
  var t = kern.split('\n').filter(function (z) { return z.indexOf('set' + s) >= 0 && !/function (baueSet|hausblatt|schiffsblatt)/.test(z); });
  if (t.length) console.error('Hinweis: `set' + s + '` kommt noch ' + t.length + '-mal vor');
});
var summe = crypto.createHash('sha256').update(roh).digest('hex');
process.stdout.write('// Kacheln der Kampfkarte, gebaut von kacheln-bauen.js aus der Seite des Weltenhüters (sha256 ' + summe + '). Nicht von Hand ändern.\n' + kern + '\n' +
  '  var ziel = typeof window !== \'undefined\' ? window : globalThis;\n' +
  '  ziel.KACHELN = { sets: SETLISTE, gemeinsam: GEMEINSAM, kachelVon: kachelVon, kachelSvg: kachelSvg, karteSvg: karteSvg, alleKacheln: alleKacheln, schiffBau: schiffBau, schiffKarte: schiffKarte, schiffsklassen: SCHIFFSKLASSEN };\n' +
  '  if (typeof module !== \'undefined\' && module.exports) module.exports = ziel.KACHELN;\n})();\n');
console.error(weg + ' Zeilen Probekarten und Blätter weggelassen, ' + aus.length + ' Zeilen übernommen, Quelle sha256 ' + summe.slice(0, 16) + '.');
