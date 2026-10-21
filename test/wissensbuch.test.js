'use strict';
// Prüft das Wissensbuch (wissensbuch.js) an einer erfundenen Welt: Ketten, Kreise, Gerüchte ohne Grund, Tage,
// „erlebt“ ohne Zeuge im Spielstand. Aufruf: node test/wissensbuch.test.js
var path = require('path');
var wb = require(path.join(__dirname, '..', 'wissensbuch.js')), glossar = require(path.join(__dirname, '..', 'glossar.js'));

var SPIELSTAND = [
  '# Spielstand Probefigur',
  'Stand: Tag 9. Stufe 2 seit Tag 4.',
  '## Was bisher geschah',
  '- Tag 3: Im Gasthaus Alte Eiche in Rohrdorf erzählt dir der Wirt Bodo vom Schwarzen Weiher.',
  '- Tag 4: Am Weiher fragst du den Fischer Jost nach den Lichtern. Jost sagt, er fische nachts nicht mehr.',
  '- Tag 5: Du erzählst Bodo am Tresen, dass Jost nachts nicht mehr fischt.',
  '- Tag 8: Der Schläger Jaro Brandt schlägt dich an der Brücke nieder; der Zöllner Wenzel Hartlieb sieht zu.',
  '## Glossar',
  'Das Glossar steht in 02_glossar.md.'
].join('\n');
var SPOILER = [
  '# SPOILER',
  '- Im Schwarzen Weiher liegt die versunkene Kapelle des Kults; der Kultführer heißt Ortwin.',
  '- Jost ist ein Spitzel des Kults und verrät die Probefigur an Tag 14.',
  '## Zeitleiste',
  '- Tag 6: Jost trifft Ortwin in der Kapelle und berichtet ihm von der Probefigur.',
  '## Wer weiß was',
  '*Stand: Tag 9 · Figur: Probefigur*',
  '### Bodo',
  '- Die Probefigur fragt nach dem Schwarzen Weiher. (erlebt, Tag 3)',
  '- Jost fischt nachts nicht mehr. (von Probefigur, Tag 5)',
  '### Jost',
  '- Die Probefigur fragt nach den Lichtern am Weiher. (erlebt, Tag 4)',
  '- Jost fischt nachts nicht mehr. (erlebt, Tag 4)',
  '### Ortwin',
  '- Die Probefigur fragt nach den Lichtern am Weiher. (von Jost, Tag 6)',
  '- Ein neuer Wegwart reitet durch Rohrdorf. (Gerücht, Tag 7; die Fuhrleute reden darüber)',
  '## Geheimnisse',
  '- Die Lichter am Weiher sind Laternen der Kultisten.'
].join('\n');
var GLOSSAR = [
  '# Glossar',
  '*Stand: Tag 9 · Gefahr nach Stufe 2 · Figur: Probefigur*',
  '### Personen',
  '- **Bodo** · Ort: Rohrdorf',
  '  Wirt der Alten Eiche.',
  '  - Erzählte vom Schwarzen Weiher. (von Bodo, Tag 3)',
  '- **Jost**',
  '  Fischer am Weiher.',
  '  - Fischt nachts nicht mehr. (von Jost, Tag 4)',
  '### Orte',
  '- **Schwarzer Weiher**',
  '  - Am Weiher sollen nachts Lichter brennen. (von Bodo, Tag 3)'
].join('\n');

var fehlgeschlagen = 0;
function ok(bed, name, sonst) { console.log((bed ? 'ok  ' : 'FEHL') + ' ' + name + (bed ? '' : ' – ' + (sonst || ''))); if (!bed) fehlgeschlagen++; }
function pruefe(spoiler, extra) {
  var B = wb.ausText(spoiler);
  return wb.pruefe(B, Object.assign({ spielstand: SPIELSTAND, spoiler: spoiler, glossar: glossar.ausText(GLOSSAR).D }, extra || {}));
}

// Lesen
var B = wb.ausText(SPOILER);
ok(B.probleme.length === 0 && B.heute === 9 && B.figur === 'Probefigur' && B.figuren.length === 3, 'Wissensbuch wird gelesen: Stand, Figur, 3 Figuren', B.probleme.join(' | '));
ok(B.figuren[0].zeilen[1].herkunft === 'von' && B.figuren[0].zeilen[1].von === 'Probefigur' && B.figuren[0].zeilen[1].tag === 5 && B.figuren[2].zeilen[1].herkunft === 'geruecht' && /Fuhrleute/.test(B.figuren[2].zeilen[1].grund), 'Herkunft, Tag und Grund werden gelesen');

// Sauber
var r0 = pruefe(SPOILER);
ok(r0.ok, 'Sauberes Wissensbuch geht durch', r0.fehler.join(' | '));
ok(!r0.hinweise.some(function (h) { return /erlebt/.test(h); }), 'Erlebtes mit Zeuge im Spielstand gibt keinen Hinweis', r0.hinweise.join(' | '));

// Gesperrt
var sperren = {
  'Ohne Begründung: Ortwin weiß von Bodos Weiher-Gespräch, von Jost, der nicht dabei war': SPOILER.replace('### Ortwin\n', '### Ortwin\n- Die Probefigur fragt nach dem Schwarzen Weiher. (von Jost, Tag 6)\n'),
  'Quelle ohne Abschnitt und ohne Posten': SPOILER.replace('(Gerücht, Tag 7; die Fuhrleute reden darüber)', '(von Grete, Tag 7)'),
  'Kette im Kreis': SPOILER.replace('- Jost fischt nachts nicht mehr. (erlebt, Tag 4)', '- Jost fischt nachts nicht mehr. (von Bodo, Tag 5)').replace('(von Probefigur, Tag 5)', '(von Jost, Tag 5)'),
  'Von der Spielerfigur, die es nie erfuhr': SPOILER.replace('(Gerücht, Tag 7; die Fuhrleute reden darüber)', '(von Probefigur, Tag 7)'),
  'Früher gewusst als die Quelle': SPOILER.replace('(von Jost, Tag 6)', '(von Jost, Tag 2)'),
  'Von der Spielerfigur, was nur die Spoilerdatei weiß': SPOILER.replace('### Ortwin\n', '### Ortwin\n- Jost ist ein Spitzel des Kults. (von Probefigur, Tag 8)\n'),
  'Von der Spielerfigur vor dem Tag, an dem sie es erfuhr': SPOILER.replace('(von Probefigur, Tag 5)', '(von Probefigur, Tag 3)'),
  'Gerücht ohne Grund': SPOILER.replace('(Gerücht, Tag 7; die Fuhrleute reden darüber)', '(Gerücht, Tag 7)'),
  'Tag nach dem Stand': SPOILER.replace('(Gerücht, Tag 7; die Fuhrleute reden darüber)', '(Gerücht, Tag 12; die Fuhrleute reden darüber)'),
  'Zeile ohne Herkunft': SPOILER.replace('(Gerücht, Tag 7; die Fuhrleute reden darüber)', ''),
  'Herkunft, die es nicht gibt': SPOILER.replace('(erlebt, Tag 3)', '(geahnt, Tag 3)'),
  'Figur doppelt': SPOILER.replace('### Ortwin', '### Bodo'),
  'Ohne Spielstand': 'ohneStand'
};
Object.keys(sperren).forEach(function (name) {
  var f = sperren[name], r = f === 'ohneStand' ? pruefe(SPOILER, { spielstand: '' }) : pruefe(f);
  ok(!r.ok, 'gesperrt: ' + name + (r.ok ? '' : ' → ' + r.fehler[0].slice(0, 120)), 'DURCHGELASSEN');
});

// Erlaubt: Wissen, das der Spielerfigur laut Glossar erzählt wurde, kennt die Quelle auch ohne eigene Zeile
var rG = pruefe(SPOILER.replace('### Ortwin\n', '### Ortwin\n- Am Weiher sollen nachts Lichter brennen. (von Bodo, Tag 8)\n'));
ok(rG.ok, 'Erlaubt: Bodo hat es der Spielerfigur erzählt (Posten im Glossar), also weiß er es', rG.fehler.join(' | '));
var rK = pruefe(SPOILER.replace('### Ortwin\n', '### Ortwin\n- Jost fischt nachts nicht mehr. (von Bodo, Tag 7)\n'));
ok(rK.ok, 'Erlaubt: Kette Ortwin ← Bodo ← Probefigur ← Jost', rK.fehler.join(' | '));

// Hinweise
var rH = pruefe(SPOILER.replace('### Ortwin\n', '### Ortwin\n- Die Probefigur fragt nach dem Schwarzen Weiher. (erlebt, Tag 3)\n'));
ok(rH.ok && rH.hinweise.some(function (h) { return /Ortwin/.test(h) && /dabei/.test(h); }), 'Hinweis: „erlebt“ ohne Zeile, die die Figur bei der Sache nennt', rH.fehler.join(' | ') + rH.hinweise.join(' | '));
var rN = pruefe(SPOILER.replace('### Ortwin', '### Hagen'));
ok(rN.hinweise.some(function (h) { return /Hagen/.test(h) && /neue Figur/.test(h); }), 'Hinweis: Figur, die weder Spielstand noch Spoilerdatei nennt');
var rT = pruefe(SPOILER.replace('### Bodo', '### Mutter Bodo'));
ok(rT.ok && !rT.hinweise.some(function (h) { return /Mutter Bodo/.test(h) && /dabei/.test(h); }), 'Rufname genügt: „Mutter Bodo“ ist im Spielstand „Bodo“', rT.fehler.join(' | ') + rT.hinweise.join(' | '));
var rS = pruefe(SPOILER.replace('*Stand: Tag 9 · Figur: Probefigur*\n', ''));
ok(rS.hinweise.some(function (h) { return /ungeprüft/.test(h); }), 'Hinweis: ohne Stand bleiben die Tage ungeprüft');

console.log(fehlgeschlagen ? fehlgeschlagen + ' Prüfung(en) fehlgeschlagen' : 'Alle Prüfungen bestanden');
process.exit(fehlgeschlagen ? 1 : 0);
