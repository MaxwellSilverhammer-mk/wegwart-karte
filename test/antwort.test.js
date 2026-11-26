'use strict';
// Prüft die Antwortprüfung (antwort.js) an der erfundenen Welt aus test/szene-beispiel.js: eine richtige Antwort ohne Befund,
// dann je ein eingebauter Fehler der Form (Regelwerk 3) und des Inhalts (Tarnname, Termin, Tote, Abwesende, Geschlecht,
// Anrede, 🎭, Spoilernamen und -wörter), dazu --ohne-sl und die Rückgaben. Aufruf: node test/antwort.test.js
var fs = require('fs'), os = require('os'), path = require('path'), kind = require('child_process');
var welt = require(path.join(__dirname, 'szene-beispiel.js'));
var ANTWORT = path.join(__dirname, '..', 'antwort.js');

var fehlgeschlagen = 0, bestanden = 0;
function ok(bed, name, sonst) {
  console.log((bed ? 'ok  ' : 'FEHL') + ' ' + name + (bed ? '' : ' – ' + (sonst || '')));
  if (bed) bestanden++; else fehlgeschlagen++;
}
var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'antwort-')), nr = 0;
function pruefe(W, text, mehr) {
  var f = path.join(dir, 'antwort' + (nr++) + '.md');
  fs.writeFileSync(f, text);
  var r = kind.spawnSync(process.execPath, [ANTWORT, '--json', '--buch', W.buch, '--ablage', W.ablage, '--notizen', W.notizen].concat(mehr || [], [f]), { encoding: 'utf8' });
  var j = null;
  try { j = JSON.parse(r.stdout); } catch (e) { j = { befunde: [], fehler: -1 }; }
  return { rc: r.status, B: j.befunde, j: j, fehler: r.stderr };
}
function hat(r, regel, stufe, zitat) {
  return r.B.some(function (b) { return b.regel === regel && (!stufe || b.stufe === stufe) && (!zitat || b.zitat.indexOf(zitat) >= 0); });
}
function zeige(r) { return r.B.map(function (b) { return b.stufe + ' ' + b.regel + ': ' + b.zitat; }).join(' | ') || '(keine Befunde)'; }

var W = welt.schreibe(path.join(dir, 'welt'));
var GUT = [
  'Torfrauch hängt unter den Balken. Bodo wischt über den Tresen und schiebt dir einen Krug hin.',
  '',
  '„Bleib sitzen“, sagt er. „In fünf Tagen ist Vollmond, dann sehen wir weiter.“',
  '',
  '*Fünf Tage also.*',
  '',
  '---',
  '',
  '📅 Tag 9 · Abend · ☁️ · TP 9/14',
  '',
  '1. Bodo nach den Lichtern fragen.',
  '2. Ida um Suppe bitten.',
  '3. Zum Weiher gehen.',
  '4. Schlafen gehen.',
  '',
  'Oder schreib frei, was Probefigur tut, oder ein **Schlüsselwort**, um nachzufragen.',
  ''
].join('\n');
function mit(von, nach) { if (GUT.indexOf(von) < 0) throw new Error('nicht im Text: ' + von); return GUT.replace(von, nach); }

var g = pruefe(W, GUT);
ok(g.rc === 0 && g.B.length === 0, 'richtige Antwort: keine Befunde, Rückgabe 0', zeige(g));

// Form
var r = pruefe(W, mit('unter den Balken.', 'unter den Balken. Die Glocke schlägt neun Uhr.'));
ok(r.rc === 1 && hat(r, 'uhrzeit', 'Fehler', 'neun Uhr'), 'Uhrzeit: Fehler, Rückgabe 1', zeige(r));
ok(!hat(pruefe(W, mit('unter den Balken.', 'unter den Balken. Die Uhr an der Wand steht still.')), 'uhrzeit'), 'eine Uhr ohne Zeit ist keine Uhrzeit');
ok(hat(pruefe(W, mit('*Fünf Tage also.*\n\n---', '*Fünf Tage also.*\n---')), 'trennlinie', 'Fehler'), 'Trennlinie ohne Leerzeile davor');
ok(hat(pruefe(W, mit('\n---\n', '\n')), 'trennlinie', 'Fehler'), 'Trennlinie fehlt');
ok(hat(pruefe(W, mit('📅 Tag 9', 'Tag 9')), 'statuszeile', 'Fehler', 'Tag 9 · Abend'), 'Statuszeile ohne 📅');
ok(hat(pruefe(W, mit('4. Schlafen gehen.\n', '')), 'optionen', 'Fehler'), 'drei Optionen');
ok(hat(pruefe(W, mit('4. Schlafen gehen.\n', '4. Schlafen gehen.\n5. Gehen.\n')), 'optionen', 'Fehler'), 'fünf Optionen');
ok(hat(pruefe(W, mit('Oder schreib frei, was Probefigur tut, oder ein **Schlüsselwort**, um nachzufragen.', '')), 'schlusszeile', 'Fehler'), 'Schlusszeile fehlt');
ok(hat(pruefe(W, mit('„Bleib sitzen“', '"Bleib sitzen"')), 'anfuehrung', 'Fehler'), 'gerade Anführungszeichen');
ok(hat(pruefe(W, mit('*Fünf Tage also.*', '*Fünf Tage also.*\n\n*Und Bodo weiß es.*')), 'innere-stimme', 'Fehler'), 'zwei innere Stimmen');
ok(hat(pruefe(W, mit('*Fünf Tage also.*', '*Fünf Tage also.*\n\nBodo gähnt.')), 'innere-stimme', 'Fehler'), 'innere Stimme nicht am Ende');
var sp = pruefe(W, mit('Bodo wischt über den Tresen', 'Gerlind von Aue stimmt die Laute. Bodo wischt über den Tresen'));
ok(hat(sp, 'spielerfigur', 'Fehler', 'Gerlind'), '🎭 fehlt vor einer Figur eines anderen Spielers', zeige(sp));
ok(!hat(pruefe(W, mit('Bodo wischt über den Tresen', '🎭 Gerlind von Aue stimmt die Laute. Bodo wischt über den Tresen')), 'spielerfigur'), 'mit 🎭 kein Befund');

// Termine: heute aus der Statuszeile der Antwort; Vollmond ist Tag 14
var t = pruefe(W, mit('In fünf Tagen ist Vollmond', 'Morgen ist Vollmond'));
ok(hat(t, 'termin', 'Fehler', 'Morgen ist Vollmond'), 'Termin mit falschem relativem Tag', zeige(t));
ok(!hat(pruefe(W, mit('Torfrauch hängt', 'Am Morgen sprach Bodo vom Vollmond. Torfrauch hängt')), 'termin'), '„am Morgen“ ist kein Tag');
ok(!hat(pruefe(W, mit('📅 Tag 9', '📅 Tag 13').replace('In fünf Tagen ist Vollmond', 'Morgen ist Vollmond')), 'termin'), 'heute aus der Statuszeile der Antwort (Tag 13: morgen ist richtig)');

// Tarnname, Tote, Abwesende, Geschlecht, Anrede
function variante(name, aendern) { return welt.schreibe(path.join(dir, name), aendern); }
var WT = variante('tarn', function (n, x) { return n === '02_spielstand.md' ? x.replace('- Bodo steht am Tresen;', '- Die Probefigur ist verkleidet als Saub.\n- Jaro Brandt ist seit Tag 8 in Mühlfurt.\n- Bodo steht am Tresen;') : x; });
var ta = pruefe(WT, mit('„Bleib sitzen“', '„Bleib sitzen, Probefigur“'));
ok(hat(ta, 'tarnname', 'Fehler', 'Probefigur'), 'Tarnname: der echte Name in der Rede', zeige(ta));
ok(!hat(pruefe(WT, GUT), 'tarnname'), 'Tarnname: der echte Name in der Schlusszeile ist richtig');
var ab = pruefe(WT, mit('Bodo wischt', 'Jaro Brandt sitzt am Fenster. Bodo wischt'));
ok(hat(ab, 'abwesend', 'Hinweis', 'Jaro Brandt sitzt'), 'Abwesende Person in der Erzählung', zeige(ab));
ok(!hat(pruefe(WT, mit('„Bleib sitzen“', '„Jaro Brandt ist in Mühlfurt“')), 'abwesend'), 'über Abwesende reden ist richtig');
var WD = variante('tot', function (n, x) { return n === '02_glossar.md' ? x.replace('- **Ida** (freundlich)', '- **Ida** (tot)') : x; });
ok(hat(pruefe(WD, mit('Bodo wischt', 'Ida bringt Suppe. Bodo wischt')), 'tot', 'Hinweis', 'Ida bringt Suppe'), 'Tote handelt');
ok(!hat(pruefe(WD, mit('Bodo wischt', 'Ida ist seit dem Winter tot. Bodo wischt')), 'tot'), 'über Tote reden ist richtig');
ok(hat(pruefe(W, mit('Bodo wischt', '🎭 Gerlind von Aue kommt herein. Er setzt sich. Bodo wischt')), 'pronomen', 'Hinweis'), '„er“ für eine Frau (Stehende Dinge)');
ok(!hat(pruefe(W, mit('Bodo wischt', '🎭 Gerlind von Aue kommt herein. Sie setzt sich. Bodo wischt')), 'pronomen'), '„sie“ für eine Frau ist richtig');
var WGF = variante('gfeld', function (n, x) { return n === '02_glossar.md' ? x.replace("- **Ida** (freundlich)\n", "- **Ida** (freundlich) · w · Anrede: Ihr\n") : x; });
ok(hat(pruefe(WGF, mit('Bodo wischt', 'Ida bringt Suppe. Er setzt sich. Bodo wischt'), ['--ohne-sl']), 'pronomen', 'Hinweis'), 'Glossarfeld: „er“ für eine Frau, auch ohne SL');
ok(hat(pruefe(WGF, mit('Torfrauch hängt unter den Balken.', 'Ida stellt die Suppe ab. „Iss du nur.“\n\nTorfrauch hängt unter den Balken.')), 'anrede', 'Hinweis'), 'Glossarfeld: du statt Ihr');
var WA = variante('anrede', function (n, x) { return n === 'werkbank.md' ? x.replace('Gerlind von Aue ist eine Frau, die nie den Hut abnimmt', 'Gerlind von Aue ist eine Frau und sagt Ihr zu der Probefigur') : x; });
ok(hat(pruefe(WA, mit('Torfrauch hängt unter den Balken.', '🎭 Gerlind von Aue nickt dir zu. „Kommst du mit?“\n\nTorfrauch hängt unter den Balken.')), 'anrede', 'Hinweis'), 'du statt Ihr (Stehende Dinge)');

// Spoiler: Wörter und Namen, die nur Spoilerdatei und Wissensbuch kennen
var wo = pruefe(W, mit('Zum Weiher gehen.', 'Zur Kapelle gehen.'));
ok(hat(wo, 'spoiler-wort', 'Hinweis', 'Kapelle'), 'Wort nur aus der Spoilerdatei', zeige(wo));
var WN = variante('namen', function (n, x) { return n === '03_spielleitung_SPOILER.md' ? x.replace('## Geheimnisse', '## Namen\n- Ida = Isolde\n\n## Geheimnisse') : x; });
var na = pruefe(WN, mit('2. Ida um Suppe bitten.', '2. Isolde um Suppe bitten.'));
ok(hat(na, 'spoiler-name', 'Fehler', 'Isolde'), 'wahrer Name aus „## Namen“', zeige(na));
ok(pruefe(WN, GUT).B.length === 0, 'ein Glossarname ist nie Spoiler');
var os1 = pruefe(WN, mit('2. Ida um Suppe bitten.', '2. Isolde um Suppe bitten.').replace('Zum Weiher', 'Zur Kapelle'), ['--ohne-sl']);
ok(!os1.B.some(function (b) { return /^spoiler/.test(b.regel); }), '--ohne-sl: keine Prüfung gegen die Spoilerseite', zeige(os1));

// Formfehler aus Sitzung 31 (Übergabe, Abschnitt 6): Würfelkasten, innere Stimme, Schriftstück, Option mit Probe, Schlüsselwörter
var KASTEN = ['<h2 class="sr-only">Würfelkasten: Überzeugen +3</h2>', '<div id="wk">Würfelkasten lädt … Falls nicht, würfle selbst: Überzeugen +3.</div>',
  "<script>var WK={art:'probe',nr:1,name:'Überzeugen',bonus:3,anlass:'Bodo glaubt dir',held:false,sg:12}</script>",
  "<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/MaxwellSilverhammer-mk/wegwart-wuerfel@44c4ff5/wuerfel.js';document.head.appendChild(s);</script>"];
var MIT_KASTEN = GUT.split('\n---\n')[0] + '\n---\n\n' + KASTEN.join('\n') + '\n';
var wk = pruefe(W, MIT_KASTEN);
ok(wk.rc === 0 && !wk.B.some(function (b) { return b.stufe === 'Fehler'; }), 'Antwort mit Würfelkasten: Statuszeile und Optionen kommen erst nach dem Wurf', zeige(wk));
var wk2 = pruefe(W, MIT_KASTEN.replace('sg:12}</script>', 'sg:12}'));
ok(wk2.rc === 1 && hat(wk2, 'html-tag', 'Fehler', 'script'), 'Würfelkasten ohne schließendes </script>', zeige(wk2));
ok(hat(pruefe(W, MIT_KASTEN.replace(KASTEN[3] + '\n', '')), 'wuerfelkasten', 'Fehler'), 'Würfelkasten ohne Ladezeile');
ok(hat(pruefe(W, mit('*Fünf Tage also.*', '*Fünf Tage also. Und dann?*')), 'innere-stimme', 'Fehler', 'Und dann'), 'innere Stimme mit zwei Sätzen');
var ZETTEL = 'Auf dem Zettel steht: „*Komm allein. Bring das Geld. Sag niemandem etwas.*“';
ok(hat(pruefe(W, mit('Torfrauch hängt unter den Balken.', ZETTEL + '\n\nTorfrauch hängt unter den Balken.')), 'schriftstueck', 'Fehler'), 'längeres Schriftstück ohne Block');
ok(!hat(pruefe(W, mit('Torfrauch hängt unter den Balken.', 'Auf dem Zettel steht:\n\n> „*Komm allein. Bring das Geld. Sag niemandem etwas.*“\n\nTorfrauch hängt unter den Balken.')), 'schriftstueck'), 'Schriftstück als eingerückter Block ist richtig');
ok(hat(pruefe(W, mit('2. Ida um Suppe bitten.', '2. Ida um Suppe bitten. (Überzeugen)')), 'option-probe', 'Fehler', 'Überzeugen'), 'Option mit Probe ohne Bonus');
ok(!hat(pruefe(W, mit('2. Ida um Suppe bitten.', '2. Ida um Suppe bitten. (Überzeugen +3)')), 'option-probe'), 'Option mit Probe und Bonus ist richtig');
ok(hat(pruefe(W, mit('3. Zum Weiher gehen.', '3. **Wagen:** Nachts über den Weiher rudern.')), 'option-probe', 'Fehler', 'Wagen'), 'Wagnis ohne Probe und Bonus');
ok(!hat(pruefe(W, mit('3. Zum Weiher gehen.', '3. **Wagen:** Nachts über den Weiher rudern. (Athletik +4)')), 'option-probe'), 'Wagnis mit Probe ist richtig');
var GE = mit('📅 Tag 9 · Abend · ☁️ · TP 9/14', '📅 Tag 9 · Abend · ☁️ · TP 9/14\nGlossar: Jost ergänzt');
ok(hat(pruefe(W, GE.replace('Bodo wischt', 'Jost kommt herein. Bodo wischt')), 'schluesselwort', 'Fehler', 'Jost'), 'gemeldetes Schlüsselwort ohne Fettdruck');
ok(!hat(pruefe(W, GE.replace('Bodo wischt', '**Jost** kommt herein. Bodo wischt')), 'schluesselwort'), 'gemeldetes Schlüsselwort fett ist richtig');
ok(hat(pruefe(W, mit('Bodo wischt', 'Ein Händler namens Ewald Sturm sitzt am Ofen. Bodo wischt')), 'schluesselwort', 'Hinweis', 'Ewald Sturm'), 'neuer Name ohne Fettdruck');
ok(hat(pruefe(W, mit('„Bleib sitzen“, sagt er.', '„Bleib sitzen“, sagt die Bodo.')), 'artikel', 'Hinweis', 'die Bodo'), '„die“ vor einem Mann (Stehende Dinge)');
ok(hat(pruefe(WGF, mit('Bodo wischt', 'Bodo gibt dem Ida einen Krug. Bodo wischt')), 'artikel', 'Hinweis', 'dem Ida'), '„dem“ vor einer Frau (Glossar)');
var KARTE = GUT.trim() + '\n\n<div id="karte">Karte lädt …</div>\n<script>var KT={}</script>\nDie Karte zeigt den Hof der Alten Eiche.\n';
ok(!pruefe(W, KARTE).B.some(function (b) { return b.regel === 'schlusszeile'; }), 'Kampfkarte mit einem Satz nach der Schlusszeile ist richtig', zeige(pruefe(W, KARTE)));

// Aufruf
var leer = kind.spawnSync(process.execPath, [ANTWORT, '--buch', W.buch], { encoding: 'utf8' });
ok(leer.status === 2 && /^Aufruf:/.test(leer.stderr), 'ohne Antwort: Rückgabe 2 mit Aufruf', leer.stderr);
var ein = kind.spawnSync(process.execPath, [ANTWORT, '--buch', W.buch, '--ablage', W.ablage, '-'], { encoding: 'utf8', input: GUT });
ok(ein.status === 0 && /— 0 Fehler, 0 Hinweis\(e\)\./.test(ein.stdout), 'Antwort von der Standardeingabe, Textausgabe', ein.stdout + ein.stderr);

fs.rmSync(dir, { recursive: true, force: true });
console.log(fehlgeschlagen ? fehlgeschlagen + ' Prüfung(en) fehlgeschlagen' : bestanden + ' Prüfungen bestanden.');
process.exit(fehlgeschlagen ? 1 : 0);
