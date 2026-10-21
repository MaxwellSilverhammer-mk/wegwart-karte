// Prüft, dass weitere Markdown-Dateien als Teile des Spielstands zählen (Regelwerk 3.0, 21: Spielstand im Projekt,
// „Was bisher geschah“ im Spielerbuch als 02_geschichte.md). Erfundene Mini-Welt, keine privaten Dateien.
'use strict';
var fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teile-'));
function schreib(name, text) { var p = path.join(dir, name); fs.writeFileSync(p, text); return p; }

var kern = schreib('02_spielstand.md', [
  '# Spielstand der Probefigur · Stand: Tag 3',
  '## Inventar (Gepäck)',
  '- Trägt selbst: Wanderstab 1 kg, Brief des Vogts.'
].join('\n'));
var geschichte = schreib('02_geschichte.md', [
  '# Was bisher geschah',
  '### Sitzung 1, Tag 1',
  '- Der Vogt gab der Probefigur einen versiegelten Brief für die Wirtin Bodil in Mühlfurt.'
].join('\n'));
var spoiler = schreib('03_spoiler.md', '# SPOILER\n- Der Brief des Vogts ist gefälscht; Bodil ist die Schwester des Kultführers Ortwin.\n');
var daten = schreib('02_inventar.md', '```json\n' + JSON.stringify({
  titel: 'Gepäck', stand: 'Stand: Tag 3',
  traeger: [{ id: 'selbst', name: 'Probefigur', art: 'figur', dinge: [
    { name: 'Wanderstab', art: 'werkzeug', kg: 1 },
    { name: 'Brief des Vogts', art: 'brief', notiz: 'Versiegelter Brief für die Wirtin Bodil in Mühlfurt.' }
  ] }]
}) + '\n```\n');
// Die Figur heißt im Kern nur „Probefigur“; die Namen stehen erst in der Geschichte.
fs.appendFileSync(kern, '\n- Probefigur ist die Figur.\n');

var ok = 0, fehl = 0;
function lauf(args) { return cp.spawnSync(process.execPath, [path.join(__dirname, '..', 'pruefen.js')].concat(args), { encoding: 'utf8' }); }
function erwarte(name, args, frei) {
  var r = lauf(args), gut = frei ? r.status === 0 : r.status === 1;
  if (gut) ok++; else { fehl++; console.log('FEHL ' + name + '\n' + r.stdout + r.stderr); }
}
erwarte('ohne Geschichte fehlt der Beleg', [daten, kern, spoiler], false);
erwarte('mit Geschichte als weiterem Teil belegt', [daten, kern, spoiler, geschichte], true);
// Eine weitere Datei mit Spoilerwörtern macht nichts frei, was nur die Spoilerdatei kennt
var spoilerDaten = schreib('02_inventar_spoiler.md', fs.readFileSync(daten, 'utf8').replace('Versiegelter Brief für die Wirtin Bodil in Mühlfurt.', 'Gefälschter Brief, Bodil ist Ortwins Schwester.'));
erwarte('Spoiler bleibt gesperrt', [spoilerDaten, kern, spoiler, geschichte], false);
// Die Spoilerdatei mit Wissensbuch wird als Wissensbuch erkannt, auch wenn sie einen json-Block hat
var wbSpoiler = schreib('03_mit_json.md', '# SPOILER\n```json\n{"notiz": 1}\n```\n- Der Brief des Vogts ist gefälscht.\n## Wer weiß was\n*Stand: Tag 3 · Figur: Probefigur*\n### Bodil\n- Der Vogt gab der Probefigur einen versiegelten Brief. (Gerücht, Tag 2; vom Boten)\n');
var rw = lauf([wbSpoiler, kern, wbSpoiler, geschichte]);
if (/Wissensbuch:/.test(rw.stdout + rw.stderr) && !/Unbekannte Daten/.test(rw.stdout + rw.stderr)) ok++; else { fehl++; console.log('FEHL Wissensbuch mit json-Block\n' + rw.stdout + rw.stderr); }
console.log((fehl ? 'FEHLER' : 'ok') + ' · teile.test.js: ' + ok + ' bestanden, ' + fehl + ' fehlgeschlagen');
process.exit(fehl ? 1 : 0);
