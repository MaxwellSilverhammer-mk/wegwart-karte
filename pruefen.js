#!/usr/bin/env node
// Spoilerprüfung für Kartendaten: node pruefen.js <kartendaten.js|.json> <02_spielstand.md> <03_spielleitung_SPOILER.md>
// Rückgabe 0, wenn die Karte nur zeigt, was im Spielstand steht; sonst 1 mit der Liste der Fehler.
'use strict';
var fs = require('fs'), path = require('path');
var karte = require(path.join(__dirname, 'karte.js'));

var args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Aufruf: node pruefen.js <kartendaten.js|.json|.md> <spielstand.md> <spoiler.md>');
  process.exit(2);
}
function lade(datei) {
  var text = fs.readFileSync(datei, 'utf8');
  if (/\.json$/i.test(datei)) return JSON.parse(text);
  if (/\.js$/i.test(datei)) return require(path.resolve(datei));
  // Markdown mit einem Block ```json … ``` oder einer Zeile var KARTE={…}
  var m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/KARTE\s*=\s*(\{[\s\S]*\})\s*;?\s*(<\/script>|$)/);
  if (!m) throw new Error('In ' + datei + ' steht kein json-Block und kein KARTE={…}.');
  return JSON.parse(m[1]);
}
var D = lade(args[0]);
var r = karte.pruefen(D, { spielstand: fs.readFileSync(args[1], 'utf8'), spoiler: fs.readFileSync(args[2], 'utf8') });
console.log((r.ok ? 'FREIGEGEBEN' : 'GESPERRT') + ' · ' + r.orte + ' Orte, ' + r.wege + ' Wege · Kartentisch ' + karte.version);
r.fehler.forEach(function (f) { console.log('  ✗ ' + f); });
r.hinweise.forEach(function (h) { console.log('  · ' + h); });
process.exit(r.ok ? 0 : 1);
