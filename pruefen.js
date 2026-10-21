#!/usr/bin/env node
// Spoilerprüfung für Kartendaten, Inventar, Questlog und Glossar:
//   node pruefen.js <daten.md|.json|.js> <02_spielstand.md> <03_spielleitung_SPOILER.md> [weitere Dateien …]
// Erkennt die Art an den Daten: Karte (orte, wege), Inventar (traeger), Questlog (auftraege), Glossar (Textform
// mit Rubriken „### Personen“ … oder ein Objekt mit eintraege).
// Weitere Dateien nach den drei Pflichtdateien dienen den Querverweisen: Kartendaten, Gepäck, Logbuch und Glossar
// der Figur und eine Figurenliste der Weltchronik (json: ["Name", …] oder {"figuren":[…]}). Das Glossar
// (02_glossar.md) ist der Glossar-Abschnitt des Spielstands in eigener Datei und zählt für Karte, Gepäck und
// Logbuch als Spielstand mit. Fehlen weitere Dateien, bleiben die Querverweise ungeprüft, und die Prüfung sagt das.
// Rückgabe 0 mit FREIGEGEBEN, wenn das Widget nur zeigt, was im Spielstand steht; sonst 1 mit der Liste der Fehler.
'use strict';
var fs = require('fs'), path = require('path');

var args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Aufruf: node pruefen.js <daten.md|.json|.js> <spielstand.md> <spoiler.md> [02_karte.md 02_inventar.md 02_questlog.md 02_glossar.md figuren.json]');
  process.exit(2);
}
var glossarModul = require(path.join(__dirname, 'glossar.js'));
function istGlossarText(text) { return /^###\s+(Personen|Gruppen|Orte|Dinge|Gerüchte)\s*$/m.test(text) && /^-\s+\*\*/m.test(text); }
function lade(datei) {
  var text = fs.readFileSync(datei, 'utf8');
  if (/\.json$/i.test(datei)) return { D: JSON.parse(text) };
  if (/\.js$/i.test(datei)) return { D: require(path.resolve(datei)) };
  // Markdown mit einem Block ```json … ```, einer Zeile var KARTE={…} (ebenso INVENTAR, QUESTLOG, GLOSSAR) oder, beim Glossar, Text
  var m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(?:KARTE|INVENTAR|QUESTLOG|GLOSSAR)\s*=\s*(\{[\s\S]*\})\s*;?\s*(<\/script>|$)/);
  if (m) return { D: JSON.parse(m[1]) };
  if (istGlossarText(text)) { var g = glossarModul.ausText(text); return { D: g.D, probleme: g.probleme, text: text }; }
  throw new Error('In ' + datei + ' steht kein json-Block, kein KARTE={…}, INVENTAR={…}, QUESTLOG={…} oder GLOSSAR={…} und kein Glossar-Text.');
}
function art(D) {
  if (!D || typeof D !== 'object') return '';
  if (Array.isArray(D) || D.figuren) return 'figuren';
  if (D.orte || D.wege) return 'karte';
  if (D.traeger) return 'inventar';
  if (D.auftraege) return 'questlog';
  if (D.eintraege) return 'glossar';
  return '';
}
var geladen = lade(args[0]), D = geladen.D, was = art(D);
var quellen = { spielstand: fs.readFileSync(args[1], 'utf8'), spoiler: fs.readFileSync(args[2], 'utf8') };
if (geladen.probleme) quellen.probleme = geladen.probleme;
if (was === 'glossar') {
  // Das Glossar ist selbst Spielstand: Wörter und Zahlen zählen mit ihm, Namen und Quellen müssen im übrigen Spielstand stehen
  quellen.namenKorpus = quellen.spielstand;
  quellen.spielstand += '\n\n' + (geladen.text || glossarModul.alsText(D));
}
args.slice(3).forEach(function (datei) {
  var X = lade(datei), a = art(X.D);
  if (!a || a === was) { console.error('Weitere Datei ' + datei + ' nicht erkannt oder von derselben Art wie die geprüften Daten; übergangen.'); return; }
  quellen[a] = X.D;
  // Das Glossar ist Spielstand: Was dort steht, belegt Karte, Gepäck und Logbuch wie der Spielstand selbst
  if (a === 'glossar') {
    // Dazu jeder Eintrag noch einmal als eine Zeile (Kurzzeile und alle Posten), damit die Belegprüfung der anderen Tische
    // einen Satz weiter an einem ganzen Eintrag messen kann, wie am alten Glossar-Absatz des Spielstands
    var ganz = (X.D.eintraege || []).map(function (e) { return [e.kurz || ''].concat((e.wissen || []).map(function (w) { return w && w.text || ''; })).join(' '); });
    quellen.spielstand += '\n\n' + (X.text || glossarModul.alsText(X.D)) + '\n\n' + ganz.join('\n');
    quellen.glossarNamen = [];
    (X.D.eintraege || []).forEach(function (e) { if (e && e.name) quellen.glossarNamen.push(e.name); (e && e.namen || []).forEach(function (n) { quellen.glossarNamen.push(n); }); });
  }
});
var r, kopf;
if (was === 'karte') {
  var karte = require(path.join(__dirname, 'karte.js'));
  r = karte.pruefen(D, quellen);
  kopf = r.orte + ' Orte, ' + r.wege + ' Wege · Kartentisch ' + karte.version;
} else if (was === 'inventar' || was === 'questlog' || was === 'glossar') {
  var modul = was === 'glossar' ? glossarModul : require(path.join(__dirname, was + '.js')), wissen = require(path.join(__dirname, 'wissen.js'));
  r = wissen.pruefe(D, modul.SCHEMA, quellen, modul.zusatz);
  var z = r.zaehl;
  kopf = was === 'inventar'
    ? 'Inventar: ' + (z.traeger || 0) + ' Träger, ' + (z.ding || 0) + ' Dinge · Gepäck ' + modul.version
    : was === 'questlog'
      ? 'Questlog: ' + (z.auftrag || 0) + ' Aufträge, ' + (z.etappe || 0) + ' Etappen, ' + (z.termin || 0) + ' Termine, ' + (z.wort || 0) + ' Mal Wort · Logbuch ' + modul.version
      : 'Glossar: ' + (z.eintrag || 0) + ' Einträge, ' + (z.wissen || 0) + ' Posten' + (D.auszug ? ' (Auszug)' : '') + ' · Glossar ' + modul.version;
} else {
  console.error('Unbekannte Daten: weder Karte (orte, wege) noch Inventar (traeger) noch Questlog (auftraege) noch Glossar (Text oder eintraege).');
  process.exit(2);
}
console.log((r.ok ? 'FREIGEGEBEN' : 'GESPERRT') + ' · ' + kopf);
r.fehler.forEach(function (f) { console.log('  ✗ ' + f); });
r.hinweise.forEach(function (h) { console.log('  · ' + h); });
process.exit(r.ok ? 0 : 1);
