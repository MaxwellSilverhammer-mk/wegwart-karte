#!/usr/bin/env node
// Spoilerprüfung für Kartendaten, Inventar und Questlog:
//   node pruefen.js <daten.md|.json|.js> <02_spielstand.md> <03_spielleitung_SPOILER.md>
// Erkennt die Art an den Daten: Karte (orte, wege), Inventar (traeger), Questlog (auftraege).
// Rückgabe 0 mit FREIGEGEBEN, wenn das Widget nur zeigt, was im Spielstand steht; sonst 1 mit der Liste der Fehler.
'use strict';
var fs = require('fs'), path = require('path');

var args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Aufruf: node pruefen.js <daten.md|.json|.js> <spielstand.md> <spoiler.md>');
  process.exit(2);
}
function lade(datei) {
  var text = fs.readFileSync(datei, 'utf8');
  if (/\.json$/i.test(datei)) return JSON.parse(text);
  if (/\.js$/i.test(datei)) return require(path.resolve(datei));
  // Markdown mit einem Block ```json … ``` oder einer Zeile var KARTE={…} (ebenso INVENTAR, QUESTLOG)
  var m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(?:KARTE|INVENTAR|QUESTLOG)\s*=\s*(\{[\s\S]*\})\s*;?\s*(<\/script>|$)/);
  if (!m) throw new Error('In ' + datei + ' steht kein json-Block und kein KARTE={…}, INVENTAR={…} oder QUESTLOG={…}.');
  return JSON.parse(m[1]);
}
var D = lade(args[0]);
var quellen = { spielstand: fs.readFileSync(args[1], 'utf8'), spoiler: fs.readFileSync(args[2], 'utf8') };
var r, kopf;
if (D && (D.orte || D.wege)) {
  var karte = require(path.join(__dirname, 'karte.js'));
  r = karte.pruefen(D, quellen);
  kopf = r.orte + ' Orte, ' + r.wege + ' Wege · Kartentisch ' + karte.version;
} else if (D && (D.traeger || D.auftraege)) {
  var art = D.traeger ? 'inventar' : 'questlog';
  var modul = require(path.join(__dirname, art + '.js')), wissen = require(path.join(__dirname, 'wissen.js'));
  r = wissen.pruefe(D, modul.SCHEMA, quellen, modul.zusatz);
  var z = r.zaehl;
  kopf = art === 'inventar'
    ? 'Inventar: ' + (z.traeger || 0) + ' Träger, ' + (z.ding || 0) + ' Dinge · Gepäck ' + modul.version
    : 'Questlog: ' + (z.auftrag || 0) + ' Aufträge, ' + (z.etappe || 0) + ' Etappen, ' + (z.termin || 0) + ' Termine, ' + (z.wort || 0) + ' Mal Wort · Logbuch ' + modul.version;
} else {
  console.error('Unbekannte Daten: weder Karte (orte, wege) noch Inventar (traeger) noch Questlog (auftraege).');
  process.exit(2);
}
console.log((r.ok ? 'FREIGEGEBEN' : 'GESPERRT') + ' · ' + kopf);
r.fehler.forEach(function (f) { console.log('  ✗ ' + f); });
r.hinweise.forEach(function (h) { console.log('  · ' + h); });
process.exit(r.ok ? 0 : 1);
