'use strict';
// Prüft das Szenenblatt (szene.js 1.2) an der erfundenen Welt aus test/szene-beispiel.js: Lage oben, Namen, Kurz- und
// Beinamen, Genitiv, mehrdeutige und unbekannte Namen, 🎭 und Gefahrzeichen, Geschichte, Logbuch, Wort, Termine mit
// relativem Tag, Notizen, Tarnname, Anrede, wahre Namen, alle Abschnitte der Spoilerdatei, das vollständige Wissensbuch,
// die Prüfliste und --ohne-sl, das nichts aus Werkbank, Wissensbuch und Spoilerdatei zeigen darf. Aufruf: node test/szene.test.js
var fs = require('fs'), os = require('os'), path = require('path'), kind = require('child_process');
var welt = require(path.join(__dirname, 'szene-beispiel.js'));
var SZENE = path.join(__dirname, '..', 'szene.js');

var fehlgeschlagen = 0, bestanden = 0;
function ok(bed, name, sonst) {
  console.log((bed ? 'ok  ' : 'FEHL') + ' ' + name + (bed ? '' : ' – ' + (sonst || '')));
  if (bed) bestanden++; else fehlgeschlagen++;
}
function lauf(W, args) {
  var r = kind.spawnSync(process.execPath, [SZENE, '--buch', W.buch, '--ablage', W.ablage, '--notizen', W.notizen].concat(args), { encoding: 'utf8' });
  var aus = (r.stdout || '').split('\n').filter(function (z) { return z && !/^— \d+ Zeichen/.test(z); });
  return { rc: r.status, aus: aus, text: aus.join('\n'), fehler: r.stderr || '' };
}
function zeile(r, muster) { return r.aus.filter(function (z) { return muster.test(z); }); }
// Teile des Blatts: die Lage oben, das Blatt einer Person, die Prüfliste unten
function stueck(r, von, bis) {
  var i = r.aus.findIndex(von);
  if (i < 0) return [];
  var j = i + 1;
  while (j < r.aus.length && !bis(r.aus[j])) j++;
  return r.aus.slice(i, j);
}
function blattVon(r, name) {
  return stueck(r, function (z) { return z.indexOf('■ ' + name + ' ') === 0 || z === '■ ' + name; }, function (z) { return /^[■?◆]/.test(z); });
}
function lageVon(r) { return stueck(r, function (z) { return z.indexOf('◆ Lage') === 0; }, function (z) { return /^[■?◆]/.test(z); }); }
function pruefVon(r) { return stueck(r, function (z) { return z === '◆ Vor dem Absenden prüfen'; }, function () { return false; }); }
function kopf(r) { return r.aus.filter(function (z) { return /^[■?] /.test(z); })[0] || ''; }
function mitNotizen(text) { return function (n, t) { return n === 'notizen.md' ? text : t; }; }

var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'szene-'));
var W = welt.schreibe(path.join(dir, 'welt'));

// Das ganze Blatt einer Person
var r = lauf(W, ['Bodo']), b = blattVon(r, 'Bodo');
ok(r.rc === 0, 'Aufruf mit einem Namen endet mit 0', r.fehler);
ok(r.aus[0] === '◆ Lage · heute Tag 9 (Jetzt)', 'die Lage steht oben; heute aus der Statuszeile, wenn die Notizen keine Lage haben', r.aus[0]);
ok(lageVon(r).indexOf('  Stand: Tag 9 · Abend · Alte Eiche in Rohrdorf · TP 9/14') >= 0, 'Lage: die Statuszeile', lageVon(r).join(' | '));
ok(b[0] === '■ Bodo · Personen · freundlich · Ort Rohrdorf · Geschlecht m (Stehende Dinge)', 'Kopfzeile: Rubrik, Haltung, Ort, Geschlecht aus den Stehenden Dingen', b[0]);
ok(b.indexOf('  auch: der Wirt') >= 0 && b.indexOf('  Wirt der Alten Eiche in Rohrdorf.') >= 0, 'auch-Namen und Kurzzeile', r.text);
ok(zeile(r, /^  Glossar \(2 Posten\), zuletzt Tag 3: Beim Schwarzen Weiher .*\(von Bodo, Tag 3\)$/).length === 1, 'der letzte Posten mit Herkunft und Tag', r.text);
var g = zeile(r, /^  Geschichte /);
ok(g.length === 2, 'Geschichte: nur die letzten zwei Stellen', g.join(' | '));
ok(/Bodos Hund Bo/.test(g[0]) && /Bodo gibt der Probefigur einen Brief/.test(g[1]), 'Genitiv: „Bodos“ zählt als Stelle von Bodo, in der Reihenfolge der Geschichte', g.join(' | '));
ok(/^  Geschichte Sitzung 1, „Am Weiher“: /.test(g[0]), 'Stelle mit Sitzung und Szene', g[0]);
ok(b.indexOf('  Jetzt: Bodo steht am Tresen; Ida bringt Suppe.') >= 0 && !/Titelbildschirm/.test(r.text), 'Zeile aus „Jetzt“, ohne die Titelbildschirm-Zeile', r.text);
ok(b.indexOf('  Logbuch offen (1): Die Lichter am Weiher') >= 0, 'offener Auftrag', r.text);
ok(b.indexOf('  Wort offen (an Bodo): Ich sehe bei Vollmond am Weiher nach.') >= 0, 'offenes Wort an die Person', r.text);
ok(b.indexOf('  Stehend: Bodo ist ein Mann mit Glatze') >= 0, 'Stehende Dinge aus der Werkbank', r.text);
ok(b.indexOf('  Notizen (1, die letzten): - Bodo stellt der Probefigur Suppe hin, ohne Geld zu nehmen.') >= 0, 'Notizen der laufenden Sitzung', r.text);
ok(b.indexOf('  [SL] Wissensbuch (1): Die Probefigur fragt nach dem Schwarzen Weiher. (erlebt, Tag 3)') >= 0 &&
  b.indexOf('  [SL] Reaktion (wenn Jost erwähnt wird): wird still.') >= 0 && b.indexOf('  [SL] Neigung zuletzt: +2') >= 0, 'Spielleitung: Wissensbuch, Reaktion mit Text, Neigung', b.join(' | '));
var p = pruefVon(r);
ok(p.indexOf('  - Bodo: Mann.') >= 0 && p.indexOf('  - Offenes Wort an Bodo.') >= 0, 'Prüfliste: Geschlecht aus den Stehenden Dingen und offenes Wort', p.join(' | '));
ok(p.indexOf('  - [SL] Die Spoilerdatei hat keinen Abschnitt „## Namen“: wahre Namen sind nur aus Sätzen geraten.') >= 0, 'Prüfliste: Hinweis, solange „## Namen“ fehlt', p.join(' | '));

// Namen finden
var h = lauf(W, ['Hartlieb']);
ok(/^■ Wenzel Hartlieb · Personen · unklar · Geschlecht m\? \(geraten aus „Mann“\)$/.test(kopf(h)), 'Nachname allein findet die Person; Geschlecht geraten aus der Kurzzeile', kopf(h));
ok(zeile(h, /Hartliebs Leute/).length === 1, 'Genitiv beim Nachnamen', h.text);
ok(kopf(lauf(W, ['der Zöllner'])) === kopf(h) && kopf(lauf(W, ['Wenzel'])) === kopf(h), 'auch-Name und Vorname finden dieselbe Person');
ok(zeile(h, /^  \[SL\] Stand: \*\*Wenzel Hartlieb:\*\* nimmt Silber/).length === 1, 'Stand nach der letzten Sitzung', h.text);
var art = lauf(welt.schreibe(path.join(dir, 'artikel'), function (n, t) {
  return n === '02_spielstand.md' ? t.replace('- Bodo steht am Tresen;', '- Der Zöllner zählt Münzen.\n- Bodo steht am Tresen;') : t;
}), ['Hartlieb']);
ok(blattVon(art, 'Wenzel Hartlieb').indexOf('  Jetzt: Der Zöllner zählt Münzen.') >= 0, 'auch-Name mit Artikel am Satzanfang („Der Zöllner“)', blattVon(art, 'Wenzel Hartlieb').join(' | '));
var o = lauf(W, ['Ole']);
ok(zeile(o, /^\? Ole: mehrdeutig: Ole Kramer, Ole Wendt$/).length === 1 && !zeile(o, /^■/).length, 'mehrdeutiger Vorname', o.text);
var u = lauf(W, ['Hilmar']);
ok(u.rc === 0 && zeile(u, /^\? Hilmar: nicht im Glossar$/).length === 1 && !zeile(u, /^■/).length, 'ein Name nur aus der Spoilerdatei ist nicht im Glossar', u.text);
ok(kopf(lauf(W, ['Kramer'])) === '■ Ole Kramer · Personen · – · Ort Rohrdorf · Geschlecht ?', 'ohne Haltung: Strich', kopf(lauf(W, ['Kramer'])));
ok(/Geschlecht m\? \(geraten aus „Einer …“\)$/.test(kopf(lauf(W, ['Wendt']))), 'Geschlecht geraten aus „Einer …“', kopf(lauf(W, ['Wendt'])));

// Zeichen am Namen und Figuren anderer Spieler
var j = lauf(W, ['Jaro']);
ok(kopf(j) === '■ Jaro Brandt ☠️ · Personen · feindlich · Geschlecht ?', 'Gefahrzeichen: Haltung bleibt erhalten', kopf(j));
ok(zeile(j, /^  Logbuch offen \(1\): Die Brücke bei Rohrdorf$/).length === 1, 'Auftrag über das Feld glossar, auch ohne text', j.text);
var ge = lauf(W, ['Gerlind']);
ok(/^■ 🎭 Gerlind von Aue · Personen · freundlich · Geschlecht w \(Stehende Dinge\)$/.test(kopf(ge)), '🎭: Figur eines anderen Spielers, gefunden mit dem Vornamen', kopf(ge));
ok(zeile(ge, /^  Geschichte .*den Gerlind von Aue dagelassen hat/).length === 1, '🎭: Stellen in der Geschichte werden ohne das Zeichen gefunden', ge.text);
ok(pruefVon(ge).indexOf('  - 🎭 Gerlind von Aue: Figur eines anderen Spielers; sie handelt nicht in deiner Erzählung.') >= 0, 'Prüfliste: 🎭', pruefVon(ge).join(' | '));

// Kurze Namen, Orte mit Personennamen
var bo = lauf(W, ['Bo']), bob = blattVon(bo, 'Bo');
ok(bob[0] === '■ Bo · Personen · freundlich · Geschlecht ?', 'ein Name unter drei Zeichen wird gefunden', bo.text);
ok(zeile(bo, /^  Geschichte /).length === 1 && zeile(bo, /Hund Bo läuft/).length === 1, 'ein Name unter drei Zeichen passt nur als ganzes Wort', bo.text);
ok(!bob.some(function (z) { return /Neigung|Jetzt|Notizen/.test(z); }), '„Bo“ bekommt nichts von „Bodo“', bob.join(' | '));
var hof = lauf(W, ['Hof Brandt']), hofb = blattVon(hof, 'Hof Brandt');
ok(hofb[0] === '■ Hof Brandt · Orte · – · Geschlecht –' && !hofb.some(function (z) { return /^  (Geschichte|Jetzt)/.test(z); }), 'ein Ort mit Personennamen erbt keine Stellen der Person', hofb.join(' | '));

// Mehrere Namen: jede Zeile nur einmal, beim zweiten Mal ein Rückverweis
var bi = lauf(W, ['Bodo', 'Ida']);
ok(zeile(bi, /^  Jetzt: Bodo steht am Tresen/).length === 1, 'eine Zeile aus „Jetzt“ kommt nur einmal, beim ersten Namen', bi.text);
var ida = blattVon(bi, 'Ida');
ok(ida.indexOf('  Jetzt: siehe Bodo') >= 0, 'beim zweiten Namen: Rückverweis statt Dublette', ida.join(' | '));
ok(ida.length && !ida.some(function (z) { return /Logbuch offen|Wort offen/.test(z); }), 'Erledigtes und eingelöstes Wort zählen nicht', ida.join(' | '));

// Spielleitung
var jo = lauf(W, ['Jost']), job = blattVon(jo, 'Jost');
ok(job[0] === '■ Jost · Personen · unklar · Ort Schwarzer Weiher · Geschlecht m (Stehende Dinge)', 'Kopfzeile Jost', job[0]);
ok(zeile(jo, /^  \[SL\] Stand: /).length === 1 && zeile(jo, /^  \[SL\] Stand: \*\*Jost:\*\* hat Hilmar/).length === 1, 'Stand: nur der Abschnitt nach der letzten Sitzung, ohne Zeitleiste', zeile(jo, /\[SL\] Stand/).join(' | '));
ok(job.indexOf('  [SL] Reaktion (wenn die Probefigur nach der Kapelle fragt): lügt schlecht und schaut zum Wasser.') >= 0 &&
  job.indexOf('  [SL] Neigung zuletzt: −1') >= 0, 'eigene Reaktion mit Text und Neigung', job.join(' | '));
ok(!job.some(function (z) { return /Reaktion von Bodo/.test(z); }), 'fremde Reaktion nur, wenn der Reagierende mit angefragt ist', job.join(' | '));
ok(zeile(jo, /^  \[SL\] Wissensbuch \(2\): /).length === 1, 'Wissensbuch der Person', jo.text);
ok(job.indexOf('  Wort offen (von Jost): Er rudert dich hinüber, wenn es hell ist.') >= 0, 'ein Wort, das die Person gab', jo.text);
ok(job.indexOf('  [SL] Geheimnisse: Jost ist ein Spitzel des Kults und verrät die Probefigur an Tag 14.') >= 0, 'Spoiler: Zeile mit ihrer Überschrift', job.join(' | '));
ok(job.indexOf('  [SL] Zeitleiste: Jost, Tag 14: lockt die Probefigur zum Weiher, wenn der Kult es will.') >= 0 &&
  job.indexOf('  [SL] Zeitleiste: Tag 6: Jost trifft Hilmar in der Kapelle.') >= 0, 'Zeitleiste: kommender und vergangener Eintrag', job.join(' | '));
var zf = lauf(welt.schreibe(path.join(dir, 'fern'), function (n, t) {
  return n === '03_spielleitung_SPOILER.md' ? t.replace('## Zeitleiste\n', '## Zeitleiste\n- **Tag 40:** Jost verlässt Rohrdorf.\n') : t;
}), ['Jost']);
ok(!zeile(zf, /Tag 40/).length && zeile(zf, /Zeitleiste: Jost, Tag 14/).length === 1, 'Zeitleiste: nur bis sieben Tage voraus', zeile(zf, /Zeitleiste/).join(' | '));
var bj = lauf(W, ['Bodo', 'Jost']);
ok(blattVon(bj, 'Jost').indexOf('  [SL] Reaktion von Bodo (wenn Jost erwähnt wird): wird still.') >= 0, 'fremde Reaktion, die die Person auslöst', blattVon(bj, 'Jost').join(' | '));

// --ohne-sl: nichts aus Werkbank, Wissensbuch und Spoilerdatei
var alle = ['Bodo', 'Jost', 'Hartlieb', 'Jaro', 'Gerlind', 'Ida', 'Bo', 'Rohrdorf', 'Schwarzer Weiher'];
var os1 = lauf(W, ['--ohne-sl'].concat(alle));
var verraten = welt.GEHEIM.filter(function (w) { return os1.text.indexOf(w) >= 0; });
ok(os1.rc === 0 && !verraten.length, '--ohne-sl: kein Wort, das nur Werkbank, Wissensbuch oder Spoilerdatei kennen', verraten.join(', '));
ok(!zeile(os1, /Stehend|Stehende Dinge/).length, '--ohne-sl: weder Stehende Dinge noch Geschlecht aus der Werkbank', zeile(os1, /Stehend/).join(' | '));
ok(blattVon(os1, 'Jost').indexOf('  [SL] Wissensbuch 2 Zeilen · Spoiler: Stand 1, Reaktionen 2, sonst 1, Zeitleiste 2, Neigung ja') >= 0, '--ohne-sl: die Spielleitung bekommt nur Zahlen', blattVon(os1, 'Jost').join(' | '));
ok(blattVon(os1, 'Ida').indexOf('  [SL] Wissensbuch 0 Zeilen · Spoiler: Stand 0, Reaktionen 0, sonst 0, Zeitleiste 0, Neigung nein') >= 0, '--ohne-sl: Zahlen auch, wenn nichts da ist', blattVon(os1, 'Ida').join(' | '));
ok(!zeile(os1, /## Namen/).length, '--ohne-sl: kein Hinweis auf die Spoilerdatei', os1.text);

// Frage
var f = lauf(W, ['--frage', 'Lichter am Weiher']);
ok(f.aus[0] === '2/2 · Spielstand: - Bodo will wissen, wer am Schwarzen Weiher nachts Licht macht.', 'Frage: die neueste Stelle mit allen Wörtern zuerst', f.aus[0]);
ok(zeile(f, /^2\/2 · Wissensbuch: - Die Probefigur fragt nach den Lichtern am Weiher/).length === 1, 'Frage: Wissensbuch mit Wortanfang („Lichtern“)', f.text);
var fo = lauf(W, ['--ohne-sl', '--frage', 'Lichter am Weiher']);
ok(fo.aus[fo.aus.length - 1] === '[SL] Wissensbuch: 1 Treffer (nicht gezeigt)' && !welt.GEHEIM.some(function (w) { return fo.text.indexOf(w) >= 0; }), 'Frage mit --ohne-sl: Spielleitung nur gezählt', fo.text);
var fk = lauf(W, ['--frage', 'Jost Kapelle']);
ok(zeile(fk, /^2\/2 · Spoiler: /).length >= 2, 'Frage: Spoilerdatei ohne --ohne-sl gezeigt', fk.text);
ok(lauf(W, ['--frage', 'und oder der']).aus[0] === 'Keine Stelle mit genug Wörtern der Frage.', 'Frage nur aus Füllwörtern');
var ft = lauf(W, ['--treffer', '1', '--frage', 'Lichter Weiher']);
ok(ft.aus.length === 2 && /^\(… 5 weitere Treffer\)$/.test(ft.aus[1]), '--treffer begrenzt die Stellen', ft.text);

// Lage aus den Notizen: heute, Neues der Sitzung, Termine mit relativem Tag
var WL = welt.schreibe(path.join(dir, 'lage'), mitNotizen(['# Sitzungsnotizen, Sitzung 3', '## Lage', '- Tag 13, Abend, Alte Eiche.',
  '## Neu festgelegt', '- Bodo verlangt ab heute zwei Kupfer für die Suppe.', '- Ole Kramer ist krank.', '## Berichtigung', '## Fehlerbuch'].join('\n') + '\n'));
var la = lauf(WL, ['Bodo']), lal = lageVon(la);
ok(lal[0] === '◆ Lage · heute Tag 13 (Notizen)', 'heute: der letzte Tag in der Lage der Notizen', lal[0]);
ok(lal.some(function (z) { return /^  Neu: .*Bodo verlangt ab heute zwei Kupfer/.test(z); }), 'Lage: Neues zu einer angefragten Person', lal.join(' | '));
ok(!lal.some(function (z) { return /Ole Kramer ist krank/.test(z); }), 'Lage: Neues zu anderen Personen bleibt draußen', lal.join(' | '));
ok(lal.some(function (z) { return /Termin Tag 14 \(morgen\): Vollmond: Lichter am Weiher/.test(z); }), 'Lage: Termin mit relativem Tag', lal.join(' | '));
ok(pruefVon(la).indexOf('  - Termin morgen (Tag 14): Vollmond: Lichter am Weiher') >= 0, 'Prüfliste: Termin heute oder morgen', pruefVon(la).join(' | '));

// Tarnname: verkleidet als, tritt als … auf, Tarnname:
function mitJetzt(zeile) {
  return function (n, t) { return n === '02_spielstand.md' ? t.replace('- Bodo steht am Tresen;', zeile + '\n- Bodo steht am Tresen;') : t; };
}
[['- Die Probefigur ist verkleidet als Saub, der Bader.', 'Saub'], ['- Die Probefigur tritt als Pilger Anselm auf; nur Bodo weiß es.', 'Anselm'],
  ['- Tarnname: Kuno', 'Kuno']].forEach(function (x, i) {
  var t = lauf(welt.schreibe(path.join(dir, 'tarn' + i), mitJetzt(x[0])), ['Bodo']);
  ok(pruefVon(t).indexOf('  - Tarnname ' + x[1] + ': In der Rede heißt die Figur ' + x[1] + ', außer bei denen, die es wissen (Lage).') >= 0,
    'Tarnname aus „' + x[0].slice(2, 40) + '“', pruefVon(t).join(' | '));
});
var tn = lauf(welt.schreibe(path.join(dir, 'tarn9'), mitJetzt('- Jost tritt als Zeuge auf.')), ['Bodo']);
ok(!zeile(tn, /Tarnname/).length, 'kein Tarnname, wenn die Zeile die Figur nicht nennt', pruefVon(tn).join(' | '));

// Anrede aus den Stehenden Dingen
var WA = welt.schreibe(path.join(dir, 'anrede'), function (n, t) {
  return n === 'werkbank.md' ? t.replace('Gerlind von Aue ist eine Frau, die nie den Hut abnimmt', 'Gerlind von Aue ist eine Frau und sagt Ihr zu der Probefigur') : t;
});
var an = lauf(WA, ['Gerlind']);
ok(/ · Anrede Ihr$/.test(kopf(an)) && pruefVon(an).indexOf('  - Gerlind von Aue: Frau, sagt Ihr.') >= 0, 'Anrede in Kopfzeile und Prüfliste', kopf(an) + ' | ' + pruefVon(an).join(' | '));

// Geschlecht und Anrede als Feld im Glossar: vor den Stehenden Dingen und auch ohne SL
var WG = welt.schreibe(path.join(dir, 'gfeld'), function (n, t) {
  return n === '02_glossar.md' ? t.replace("- **Ida** (freundlich)\n", "- **Ida** (freundlich) · w · Anrede: Ihr / du\n").replace('- **Bodo** (freundlich) · auch', '- **Bodo** (freundlich) · m · Anrede: Sie · auch') : t;
});
var gi = lauf(WG, ['Ida']);
ok(/ · Geschlecht w \(Glossar\) · Anrede du \(die Figur sagt Ihr\)$/.test(kopf(gi)) && pruefVon(gi).indexOf('  - Ida: Frau, sagt du (die Figur sagt Ihr).') >= 0, 'Glossarfeld: Geschlecht und Anrede in beide Richtungen', kopf(gi) + ' | ' + pruefVon(gi).join(' | '));
ok(/ · Geschlecht w \(Glossar\) · Anrede du \(die Figur sagt Ihr\)$/.test(kopf(lauf(WG, ['--ohne-sl', 'Ida']))), 'Glossarfeld gilt auch mit --ohne-sl', kopf(lauf(WG, ['--ohne-sl', 'Ida'])));
ok(/ · Geschlecht m \(Glossar\) · Anrede Sie$/.test(kopf(lauf(WG, ['Bodo']))), 'Glossarfeld geht den Stehenden Dingen vor', kopf(lauf(WG, ['Bodo'])));

// Wahre Namen: Abschnitt „## Namen“, „… ist in Wahrheit …“, „X ist der …“; der Glossarname bleibt im Spiel
function mitSpoiler(von, nach) { return function (n, t) { return n === '03_spielleitung_SPOILER.md' ? t.replace(von, nach) : t; }; }
var WN = welt.schreibe(path.join(dir, 'namen'), mitSpoiler('## Geheimnisse', '## Namen\n- Ida = Isolde vom Weiher\n\n## Geheimnisse')), wn = lauf(WN, ['Ida']);
ok(blattVon(wn, 'Ida').indexOf('  [SL] Wahrer Name: Isolde vom Weiher (im Spiel nie nennen)') >= 0, '„## Namen“: wahrer Name im Blatt', wn.text);
ok(pruefVon(wn).indexOf('  - [SL] Ida ist Isolde vom Weiher: im Spiel nur „Ida“.') >= 0 && !zeile(wn, /keinen Abschnitt „## Namen“/).length, '„## Namen“: Prüfliste, kein Hinweis mehr', pruefVon(wn).join(' | '));
ok(!zeile(lauf(WN, ['--ohne-sl', 'Ida']), /Isolde/).length, '--ohne-sl: kein wahrer Name');
var ww = lauf(welt.schreibe(path.join(dir, 'wahrheit'), mitSpoiler('## Geheimnisse', '## Geheimnisse\n- Ida ist in Wahrheit Isolde, die Tochter des Kultführers.')), ['Ida']);
ok(blattVon(ww, 'Ida').indexOf('  [SL] Wahrer Name: Isolde (im Spiel nie nennen)') >= 0, '„<Glossarname> ist in Wahrheit X“', blattVon(ww, 'Ida').join(' | '));
var wr = lauf(welt.schreibe(path.join(dir, 'rueck'), mitSpoiler('## Geheimnisse', '## Geheimnisse\n- Hilmar ist der Zöllner und nimmt das Silber selbst.')), ['Hartlieb']);
ok(blattVon(wr, 'Wenzel Hartlieb').indexOf('  [SL] Wahrer Name: Hilmar (im Spiel nie nennen)') >= 0, '„X ist der <Glossarname>“', blattVon(wr, 'Wenzel Hartlieb').join(' | '));
var wb = lauf(welt.schreibe(path.join(dir, 'beiname'), mitSpoiler('## Geheimnisse', '## Geheimnisse\n- Bodo ist in Wahrheit der Wirt.\n- Jost ist Fischer.')), ['Bodo', 'Jost']);
ok(!zeile(wb, /Wahrer Name/).length, 'ein bekannter Beiname oder ein Satz ohne „in Wahrheit“ ist kein wahrer Name', zeile(wb, /Wahrer Name/).join(' | '));

// Schritt 4: kurzer Zuschnitt und Ort
var ku = lauf(W, ['--kurz', 'Bodo', 'Jost']), kub = blattVon(ku, 'Bodo'), kuj = blattVon(ku, 'Jost');
ok(kub.length === 1 && kuj.length === 2 && /^  \[SL\] Stand: /.test(kuj[1]) && lageVon(ku).length && pruefVon(ku).length, '--kurz: je Person Kopf und Stand, Lage und Prüfliste bleiben', kub.concat(kuj).join(' | '));
var WO = welt.schreibe(path.join(dir, 'ort'), function (n, t) {
  return n === '02_spielstand.md' ? t.replace('- Jost ist am Weiher;', '- Schwarzer Weiher: Jost flickt Netze, Ole Wendt wartet am Steg.\n- Jost ist am Weiher;') : t;
});
var or1 = lauf(WO, ['--ort', 'Schwarzer Weiher']);
ok(or1.rc === 0 && blattVon(or1, 'Jost').length && blattVon(or1, 'Ole Wendt').length && !blattVon(or1, 'Bodo').length, '--ort: alle, die laut „Jetzt“ dort sind', or1.aus.filter(function (z) { return /^[■?]/.test(z); }).join(' | '));
var or2 = lauf(WO, ['--ort', 'Rohrdorf', 'Bodo']);
ok(zeile(or2, /^\? Ort Rohrdorf: laut „Jetzt“ ist dort niemand außer den genannten Namen$/).length === 1 && blattVon(or2, 'Bodo').length, '--ort ohne Treffer sagt es, die genannten Namen bleiben', or2.text);

// Spoilerdatei nach Schritt 3: Gruppen im Stand tragen ihre Namen, die Neigung steht als feste Liste
var WS = welt.schreibe(path.join(dir, 'stand'), mitSpoiler('## Zeitleiste', '### Stand nach Sitzung 3\n- **Fischer (Jost, Ole Kramer):** fahren nachts nicht mehr hinaus.\n\n## Zeitleiste'));
ok(blattVon(lauf(WS, ['Jost']), 'Jost').indexOf('  [SL] Stand: **Fischer (Jost, Ole Kramer):** fahren nachts nicht mehr hinaus.') >= 0, 'Stand: eine Gruppe mit ihren Namen im Label', blattVon(lauf(WS, ['Jost']), 'Jost').join(' | '));
var WN1 = welt.schreibe(path.join(dir, 'neig1'), mitSpoiler('**Neigung** Bodo +1 → +2 · Jost 0 → −1', '**Neigung** Ole Kramer +2 · Bodo −1 · Wenzel Hartlieb 0 → +1'));
ok(zeile(lauf(WN1, ['Bodo']), /^  \[SL\] Neigung zuletzt: −1$/).length === 1 && !zeile(lauf(WN1, ['Jost']), /Neigung/).length, 'feste Liste: der Wert genau hinter dem Namen, sonst keiner', zeile(lauf(WN1, ['Bodo']), /Neigung/).join(' | '));
var WN3 = welt.schreibe(path.join(dir, 'neig3'), mitSpoiler('**Neigung** Bodo +1 → +2 · Jost 0 → −1', '**Neigung** Jost zum Bodo +1'));
ok(zeile(lauf(WN3, ['Bodo']), /^  \[SL\] Neigung zuletzt \(roh\): \+1$/).length === 1, '„Jost zum Bodo +1“ ist keine feste Liste: roh, und so vermerkt', zeile(lauf(WN3, ['Bodo']), /Neigung/).join(' | '));
var WN2 = welt.schreibe(path.join(dir, 'neig2'), mitSpoiler('**Neigung** Bodo +1 → +2 · Jost 0 → −1', '**Neigung** Bodo mag Jost, etwa +1; Jost bleibt bei −1'));
ok(zeile(lauf(WN2, ['Bodo']), /^  \[SL\] Neigung zuletzt \(roh\): \+1$/).length === 1, 'keine feste Liste: roh gelesen und so vermerkt', zeile(lauf(WN2, ['Bodo']), /Neigung/).join(' | '));

// Andere Überschriften der Spoilerdatei, vollständiges Wissensbuch
var wu = lauf(welt.schreibe(path.join(dir, 'uhren'), mitSpoiler('## Geheimnisse', '## Uhren\n- Jost verliert die Nerven: 2 von 4.\n\n## Wahrheit')), ['Jost']);
ok(blattVon(wu, 'Jost').indexOf('  [SL] Uhren: Jost verliert die Nerven: 2 von 4.') >= 0 &&
  blattVon(wu, 'Jost').indexOf('  [SL] Wahrheit: Jost ist ein Spitzel des Kults und verrät die Probefigur an Tag 14.') >= 0, 'jede Überschrift der Spoilerdatei wird gelesen', blattVon(wu, 'Jost').join(' | '));
var lang = []; for (var i = 1; i <= 14; i++) lang.push('- Zeile ' + i + ' über die Probefigur. (erlebt, Tag ' + i + ')');
var wl = lauf(welt.schreibe(path.join(dir, 'lang'), function (n, t) { return n === 'wissensbuch.md' ? t.replace('### Bodo\n', '### Bodo\n' + lang.join('\n') + '\n') : t; }), ['Bodo']);
var wlz = zeile(wl, /^  \[SL\] Wissensbuch \(15\): /);
ok(wlz.length === 1 && /Zeile 1 über die Probefigur/.test(wlz[0]), 'Wissensbuch vollständig, auch die älteste Zeile', zeile(wl, /Wissensbuch/).join(' | '));

// Wissensbuch in der Spoilerdatei (README: eigene Datei oder Abschnitt der Spoilerdatei)
var W2 = welt.schreibe(path.join(dir, 'welt2'), function (n, t) {
  if (n === 'wissensbuch.md') return null;
  if (n === '03_spielleitung_SPOILER.md') return t + '\n' + welt.ABLAGE['wissensbuch.md'].replace(/^\*Stand[^\n]*\n/, '');
  return t;
});
var w2 = lauf(W2, ['Jost']);
ok(zeile(w2, /^  \[SL\] Wissensbuch \(2\): /).length === 1 && !zeile(w2, /^  \[SL\] Wer weiß was/).length, 'Wissensbuch als Abschnitt der Spoilerdatei, nicht doppelt', w2.text);
var w2f = lauf(W2, ['--ohne-sl', '--frage', 'Lichter am Weiher']);
ok(w2f.aus.indexOf('[SL] Spoiler: 1 Treffer (nicht gezeigt)') >= 0 && !zeile(w2f, /^\[SL\] Wissensbuch/).length, 'Wissensbuch in der Spoilerdatei zählt bei der Frage einmal', w2f.text);

// Logbuch als Markdown mit json-Block (ohne Spielerbuch, Werkstatt 4.7, Fall 3)
var W3 = welt.schreibe(path.join(dir, 'welt3'), function (n, t) { return n === '02_questlog.json' ? null : t; });
fs.writeFileSync(path.join(W3.buch, '02_questlog.md'), '# Logbuch\n\n```json\n' + welt.BUCH['02_questlog.json'] + '```\n');
ok(lauf(W3, ['Bodo']).aus.indexOf('  Logbuch offen (1): Die Lichter am Weiher') >= 0, 'Logbuch aus 02_questlog.md');

// Fehler im Aufruf
var ohne = kind.spawnSync(process.execPath, [SZENE, '--buch', path.join(dir, 'gibtsnicht'), 'Bodo'], { encoding: 'utf8' });
ok(ohne.status === 2 && /--buch/.test(ohne.stderr), 'ohne Glossar: Rückgabe 2 mit Hinweis auf --buch', ohne.stderr);
var falsch = kind.spawnSync(process.execPath, [SZENE, '--buhc', W.buch, 'Bodo'], { encoding: 'utf8' });
ok(falsch.status === 2 && /Unbekannter Schalter --buhc/.test(falsch.stderr), 'unbekannter Schalter: Rückgabe 2', falsch.stderr);
var leer = kind.spawnSync(process.execPath, [SZENE, '--buch', W.buch], { encoding: 'utf8' });
ok(leer.status === 2 && /^Aufruf:/.test(leer.stderr), 'ohne Namen und Frage: Aufruf', leer.stderr);
var teil = kind.spawnSync(process.execPath, [SZENE, '--buch', W.buch, '--ablage', path.join(dir, 'leer'), 'Bodo'], { encoding: 'utf8' });
ok(teil.status === 0 && /Nicht gefunden \(bleibt leer\):/.test(teil.stderr) && /^■ Bodo /m.test(teil.stdout) && !/## Namen/.test(teil.stdout), 'ohne Ablage: Blatt aus dem Buch, fehlende Dateien auf stderr', teil.stderr);

fs.rmSync(dir, { recursive: true, force: true });
console.log(fehlgeschlagen ? fehlgeschlagen + ' Prüfung(en) fehlgeschlagen' : bestanden + ' Prüfungen bestanden.');
process.exit(fehlgeschlagen ? 1 : 0);
