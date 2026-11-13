// Spielerbuch 2.0 (Regelwerk 4.2): Buch und Ablage als Dateien. Dateien hin (--dateien) und zurück (--zurueck) ändern nichts;
// die Seiten bauen; die Ablage ordnet geholte Dateien über stand.json ein und nennt, was zu veröffentlichen ist; der Umzug
// aus der Datenbank von vor 4.2 (Ordner oder zip) ergibt dasselbe Buch und dieselbe Ablage. Dazu der Kern (Regelwerk 21.1):
// messen, das Kapitel „Stand der Dinge“ schreiben und die Verlustprobe.
// Erfundene Mini-Welt, keine privaten Dateien.
'use strict';
var fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process'), zlib = require('zlib'), crypto = require('crypto');
var bauen = path.join(__dirname, '..', 'seite', 'bauen.js'), glossar = require(path.join(__dirname, '..', 'glossar.js'));
var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'buch-'));
function schreib(name, text) { var p = path.join(dir, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); return p; }
function lese(p) { return fs.readFileSync(p, 'utf8'); }
function lauf(args) { return cp.spawnSync(process.execPath, [bauen].concat(args), { encoding: 'utf8', maxBuffer: 1 << 26 }); }
function sha(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }
var ok = 0, fehl = 0;
function pruef(name, bed, info) { if (bed) ok++; else { fehl++; console.log('FEHL ' + name + (info ? '\n' + info : '')); } }

var gl = schreib('02_glossar.md', ['# Glossar Probefigur',
  '*Stand: Tag 3 · Gefahr nach Stufe 1 · Figur: Probefigur*', '',
  '### Personen',
  '- **Bodo** (freundlich) · Ort: Zur Alten Eiche',
  '  Wirt der Alten Eiche.',
  '  - Wirt, schenkt dünnes Bier. (gesehen, Tag 2)',
  '### Orte',
  '- **Zur Alten Eiche** · auch: Alten Eiche',
  '  Gasthaus am Damm.',
  '  - Drei Stunden von Mühlfurt über den Damm. (gesehen, Tag 2)', ''
].join('\n'));
var karte = schreib('02_karte.json', JSON.stringify({ titel: 'Probekarte', stand: 'Stand: Tag 3', orte: [{ id: 'eiche', name: 'Zur Alten Eiche', x: 7, y: 2, art: 'gasthaus', bekannt: 'gesehen' }], wege: [] }));
var gepaeck = schreib('02_inventar.json', JSON.stringify({ titel: 'Gepäck', stand: 'Stand: Tag 3', traeger: [{ id: 'selbst', name: 'Probefigur', art: 'figur', dinge: [{ name: 'Wanderstab', art: 'werkzeug', kg: 1 }] }] }));
var logbuch = schreib('02_questlog.json', JSON.stringify({ titel: 'Logbuch', stand: 'Stand: Tag 3', auftraege: [{ id: 'brief', titel: 'Der Brief des Vogts', status: 'offen' }] }));
var ges = schreib('02_geschichte.md', '# Was bisher geschah\n\n### Sitzung 1, Tag 1\n- Aufbruch in der Hafenstadt.\n  > *Ein Brief: „Komm bald.“*\n\n### Sitzung 2, Tag 2\n- Bodo schenkt Bier aus.\n');

/* ---------- Buch: hin und zurück ---------- */
var aus = path.join(dir, 'buch'), zur = path.join(dir, 'zurueck');
var r = lauf(['--dateien', aus, gl, karte, gepaeck, logbuch, ges, '--stufe', '1']);
pruef('--dateien läuft', r.status === 0, r.stderr);
['meta', 'glossar', 'tische', 'geschichte'].forEach(function (k) { pruef('Datei daten/' + k + '.json', fs.existsSync(path.join(aus, 'daten', k + '.json'))); });
var liste = r.status === 0 ? JSON.parse(r.stdout.trim()) : [];
pruef('stdout ist files für publish_files: as und absoluter Pfad', liste.length === 4 && liste.every(function (x) { return /^daten\/[a-z]+\.json$/.test(x.as) && path.isAbsolute(x.path) && fs.existsSync(x.path); }), r.stdout);
var meta = JSON.parse(lese(path.join(aus, 'daten', 'meta.json')));
pruef('meta: buch und glossar', meta.buch && meta.buch.titel === 'Probefigurs Buch' && meta.buch.stufe === 1 && meta.buch.stand === 'Stand: Tag 3' && meta.buch.figur === 'Probefigur' && !!meta.glossar, JSON.stringify(meta));
var gB = JSON.parse(lese(path.join(aus, 'daten', 'glossar.json')));
pruef('glossar: Liste {id, daten} in der Reihenfolge des Textes', Array.isArray(gB) && gB.length === 2 && gB[0].id === 'bodo' && gB[1].id === 'zur-alten-eiche' && gB[0].daten.name === 'Bodo', JSON.stringify(gB).slice(0, 300));
var tB = JSON.parse(lese(path.join(aus, 'daten', 'tische.json')));
pruef('tische: Karte, Gepäck, Logbuch', !!(tB.karte && tB.karte.orte && tB.gepaeck && tB.gepaeck.traeger && tB.logbuch && tB.logbuch.auftraege));
var geB = JSON.parse(lese(path.join(aus, 'daten', 'geschichte.json')));
pruef('geschichte: Abschnitte in Reihenfolge', geB.length === 2 && geB[0].titel === 'Sitzung 1, Tag 1' && geB[0].reihe === 0 && geB[1].reihe === 1 && /Komm bald/.test(geB[0].text));
r = lauf(['--zurueck', aus, zur]);
pruef('--zurueck läuft', r.status === 0, r.stderr);
function gleichesBuch(z, name) {
  pruef(name + ': Glossar gleich', JSON.stringify(glossar.ausText(lese(gl)).D) === JSON.stringify(glossar.ausText(lese(path.join(z, '02_glossar.md'))).D));
  pruef(name + ': Karte gleich', JSON.stringify(JSON.parse(lese(karte))) === JSON.stringify(JSON.parse(lese(path.join(z, '02_karte.json')))));
  pruef(name + ': Gepäck und Logbuch gleich', JSON.stringify(JSON.parse(lese(gepaeck))) === JSON.stringify(JSON.parse(lese(path.join(z, '02_inventar.json')))) && JSON.stringify(JSON.parse(lese(logbuch))) === JSON.stringify(JSON.parse(lese(path.join(z, '02_questlog.json')))));
  var g2 = lese(path.join(z, '02_geschichte.md'));
  pruef(name + ': Geschichte gleich', g2.indexOf('### Sitzung 1, Tag 1\n- Aufbruch in der Hafenstadt.\n  > *Ein Brief: „Komm bald.“*') >= 0 && g2.indexOf('### Sitzung 2, Tag 2\n- Bodo schenkt Bier aus.') >= 0, g2);
}
gleichesBuch(zur, 'hin und zurück');
// noch einmal hin: dieselben Dateien, Byte für Byte
var aus2 = path.join(dir, 'buch2');
r = lauf(['--dateien', aus2, path.join(zur, '02_glossar.md'), path.join(zur, '02_karte.json'), path.join(zur, '02_inventar.json'), path.join(zur, '02_questlog.json'), path.join(zur, '02_geschichte.md'), '--stufe', '1']);
pruef('hin, zurück, hin: dieselben Dateien', r.status === 0 && ['meta', 'glossar', 'tische', 'geschichte'].every(function (k) { return sha(path.join(aus, 'daten', k + '.json')) === sha(path.join(aus2, 'daten', k + '.json')); }), r.stderr);
// read_file mit paths speichert unter Namen, die der Client vergibt: erkannt wird am Inhalt
var geholt = path.join(dir, 'geholt');
fs.mkdirSync(geholt);
['meta', 'glossar', 'tische', 'geschichte'].forEach(function (k, i) { fs.copyFileSync(path.join(aus, 'daten', k + '.json'), path.join(geholt, 'mcp-claude-artifacts-blob-17945' + i + '-x' + i + '.json')); });
fs.writeFileSync(path.join(geholt, 'fremd.json'), '{"irgendwas": 1}');
r = lauf(['--zurueck', geholt, path.join(dir, 'zurueck-geholt')]);
pruef('--zurueck erkennt die Dateien am Inhalt', r.status === 0, r.stderr);
gleichesBuch(path.join(dir, 'zurueck-geholt'), 'unter fremden Namen');
// alter Aufbau <sammlung>/<id>.json, wie out_dir ihn schrieb
var db = path.join(dir, 'db');
function alsAltbestand(ziel) {
  Object.keys(meta).forEach(function (id) { schreib(path.relative(dir, path.join(ziel, 'meta', id + '.json')), JSON.stringify(meta[id])); });
  gB.forEach(function (d) { schreib(path.relative(dir, path.join(ziel, 'glossar', d.id + '.json')), JSON.stringify(d.daten)); });
  Object.keys(tB).forEach(function (id) { schreib(path.relative(dir, path.join(ziel, 'tische', id + '.json')), JSON.stringify(tB[id])); });
  geB.forEach(function (d) { schreib(path.relative(dir, path.join(ziel, 'geschichte', d.id + '.json')), JSON.stringify({ reihe: d.reihe, titel: d.titel, text: d.text })); });
}
alsAltbestand(db);
r = lauf(['--zurueck', db, path.join(dir, 'zurueck-alt')]);
pruef('--zurueck liest den alten Aufbau', r.status === 0 && /alter Aufbau/.test(r.stderr), r.stderr);
gleichesBuch(path.join(dir, 'zurueck-alt'), 'alter Aufbau');
// tische.json ersetzt alle Tische: fehlt einer, sagt es die Meldung
r = lauf(['--dateien', path.join(dir, 'buch-halb'), karte]);
pruef('Warnung, wenn Tische fehlen', r.status === 0 && /es fehlen gepaeck, logbuch/.test(r.stderr), r.stderr);
// zwei Abschnitte mit derselben Überschrift behalten beide ihren Platz
var doppelt = schreib('doppelt/02_geschichte.md', '# Was bisher geschah\n\n### Sitzung 1, Tag 1\n- Erster Teil.\n\n### Sitzung 1, Tag 1\n- Zweiter Teil.\n');
r = lauf(['--dateien', path.join(dir, 'buch-doppelt'), doppelt]);
var gD = r.status === 0 ? JSON.parse(lese(path.join(dir, 'buch-doppelt', 'daten', 'geschichte.json'))) : [];
pruef('gleiche Überschrift: zwei Abschnitte, zwei ids', gD.length === 2 && gD[0].id !== gD[1].id && /Zweiter Teil/.test(gD[1].text), JSON.stringify(gD));

/* ---------- Seiten ---------- */
var seite = lauf(['--seite']);
pruef('Seite baut als ganzes Dokument', seite.status === 0 && /^<!DOCTYPE html>/.test(seite.stdout) && /<title>[^<]+<\/title>/.test(seite.stdout) && /<\/html>\s*$/.test(seite.stdout), seite.stderr);
['GLOSSAR_JS', 'KARTE_JS', 'INVENTAR_JS', 'QUESTLOG_JS', 'SPRITE'].forEach(function (k) { pruef('Platzhalter ' + k + ' ersetzt', seite.stdout.indexOf(k === 'SPRITE' ? '<!--SPRITE-->' : '/*' + k + '*/') < 0); });
pruef('kein </script> in eingebauten Tischen', (seite.stdout.match(/<\/script>/g) || []).length === 5);
pruef('Klasse sr-only und Textfarben der Widget-Umgebung definiert', /\.sr-only\{[^}]*clip:rect\(0,0,0,0\)/.test(seite.stdout) && /--text-primary:/.test(seite.stdout) && /--text-secondary:/.test(seite.stdout));
pruef('Vorlage ohne Namen einer Figur', /<title>Spielerbuch<\/title>/.test(seite.stdout) && seite.stdout.indexOf('<h1 id="titel">Spielerbuch</h1>') >= 0);
pruef('Seite liest ihre Dateien und kennt den Umzug', seite.stdout.indexOf("holeJson('daten/meta.json')") >= 0 && seite.stdout.indexOf('spielerbuch-umzug.zip') >= 0);
// die eingebauten Tische stehen als Text in <script type="text/plain">; ihre Beispiele laden nichts
var ohneTische = seite.stdout.replace(/<script type="text\/plain"[\s\S]*?<\/script>/g, '');
pruef('Seite lädt nichts von fremden Adressen außer den Schriften', (ohneTische.match(/(?:src|href)="https?:\/\/[^"]+"/g) || []).every(function (x) { return /fonts\.googleapis\.com/.test(x); }));
var seite2 = lauf(['--seite', '--titel', 'Probefigurs <Buch>']);
pruef('--titel setzt Titel und Überschrift', seite2.status === 0 && seite2.stdout.indexOf('<title>Probefigurs &lt;Buch&gt;</title>') >= 0 && seite2.stdout.indexOf('<h1 id="titel">Probefigurs &lt;Buch&gt;</h1>') >= 0, seite2.stderr);
var ablSeite = lauf(['--ablage-seite', '--titel', 'Probefigurs Ablage']);
pruef('Ablage-Seite baut, nennt keinen Dateinamen', ablSeite.status === 0 && /^<!DOCTYPE html>/.test(ablSeite.stdout) && ablSeite.stdout.indexOf('<title>Probefigurs Ablage</title>') >= 0 && ablSeite.stdout.indexOf("fetch('stand.json'") >= 0 && !/03_spielleitung|buehnen\//.test(ablSeite.stdout), ablSeite.stderr);

/* ---------- Spielleitungswissen landet nie in einer Datei, die das Buch zeigt ---------- */
var spoil = schreib('03_spielleitung_SPOILER.md', '# Spoiler\n\n## Wahrheit\nDer Wirt lügt. Äöüß ✦\n### Geheim\n- Der Wirt ist der Kultführer.\n');
r = lauf(['--dateien', path.join(dir, 'buch-falsch'), gl, spoil]);
pruef('Spoilerdatei abgelehnt, nichts geschrieben', r.status === 1 && !fs.existsSync(path.join(dir, 'buch-falsch')), r.stderr);
var archivKopie = schreib('archiv-kopie.md', '# Archiv der Spielleitung\n\n### SG der Probe\nWahrnehmung SG 15.\n');
r = lauf(['--dateien', path.join(dir, 'buch-falsch2'), gl, archivKopie]);
pruef('Archiv abgelehnt', r.status === 1, r.stderr);
var wb = schreib('wissensbuch.md', '*Stand: Tag 3 · Figur: Probefigur*\n\n## Wer weiß was\n\n### Bodo\n- Der Damm ist unterspült. (erlebt, Tag 2)\n');
r = lauf(['--dateien', path.join(dir, 'buch-falsch3'), wb]);
pruef('Wissensbuch abgelehnt', r.status === 1, r.stderr);
var keineGeschichte = schreib('notizen.md', '# Notizen\n### Einkauf\n- Brot.\n');
r = lauf(['--dateien', path.join(dir, 'buch-falsch4'), keineGeschichte]);
pruef('Fremde Datei nicht als Geschichte', r.status === 1, r.stderr);

/* ---------- Ablage ---------- */
var abl = path.join(dir, 'ablage');
var stand = schreib('ablage/02_spielstand.md', '# Spielstand Probefigur\n\n## Jetzt\nTag 3, Abend, in der Alten Eiche.\n');
fs.copyFileSync(spoil, path.join(abl, '03_spielleitung_SPOILER.md'));
fs.copyFileSync(wb, path.join(abl, 'wissensbuch.md'));
schreib('ablage/buehnen/keller.json', JSON.stringify({ id: 'keller', art: 'buehne', ort: 'eiche', gelaende: 'gewoelbe', boden: ['....'] }));
schreib('ablage/archiv/001-wuerfelprotokoll-sitzung-1.md', '## Würfelprotokoll Sitzung 1\n\nWahrnehmung 13.\n');
schreib('ablage/index.html', '<!DOCTYPE html><title>Deckblatt</title>');
r = lauf(['--ablage', abl, '--sitzung', 'Sitzung 2']);
var a1 = r.status === 0 ? JSON.parse(r.stdout.trim()) : { files: [], remove: [] };
var st = fs.existsSync(path.join(abl, 'stand.json')) ? JSON.parse(lese(path.join(abl, 'stand.json'))) : {};
pruef('--ablage läuft: alles neu, dazu stand.json, nichts zu entfernen', r.status === 0 && a1.files.length === 6 && a1.remove.length === 0 && a1.files[a1.files.length - 1].as === 'stand.json' && a1.files.every(function (x) { return path.isAbsolute(x.path) && fs.existsSync(x.path); }), r.stderr + r.stdout);
pruef('das Deckblatt gehört nicht zur Ablage', !a1.files.some(function (x) { return x.as === 'index.html'; }) && !(st.dateien || {})['index.html']);
pruef('stand.json: Format, Sitzung, Datum, sha256 und Zeichen je Datei', st.format === 'ablage-stand' && st.sitzung === 'Sitzung 2' && /^\d{4}-\d\d-\d\d$/.test(st.geschrieben) && st.dateien['02_spielstand.md'].sha256 === sha(stand) && st.dateien['03_spielleitung_SPOILER.md'].zeichen === Array.from(lese(spoil)).length && !!st.dateien['buehnen/keller.json'], JSON.stringify(st));
pruef('Meldung nennt keinen Inhalt', r.stderr.indexOf('Der Wirt lügt') < 0 && r.stderr.indexOf('unterspült') < 0, r.stderr);
r = lauf(['--ablage', abl]);
pruef('unverändert: nichts zu veröffentlichen', r.status === 0 && JSON.parse(r.stdout.trim()).files.length === 0 && /Nichts zu veröffentlichen/.test(r.stderr), r.stderr);
fs.appendFileSync(path.join(abl, 'wissensbuch.md'), '- Bodo weiß vom Brief. (von Probefigur, Tag 3; am Tresen)\n');
fs.writeFileSync(path.join(abl, 'uebergabe.md'), '# Übergabe, Sitzung 3, Teil 1\n');
r = lauf(['--ablage', abl, '--sitzung', 'Sitzung 3']);
var a2 = r.status === 0 ? JSON.parse(r.stdout.trim()) : { files: [], remove: [] };
pruef('nur Geändertes und Neues, dazu stand.json', r.status === 0 && a2.files.map(function (x) { return x.as; }).sort().join(',') === 'stand.json,uebergabe.md,wissensbuch.md' && /1 geändert \(wissensbuch\.md\), 1 neu \(uebergabe\.md\)/.test(r.stderr), r.stderr);

// Holen: read_file speichert unter fremden Namen; stand.json sagt über die Prüfsumme, was wohin gehört
var blobs = path.join(dir, 'blobs'), neuAbl = path.join(dir, 'ablage-geholt');
fs.mkdirSync(blobs);
['stand.json', '02_spielstand.md', '03_spielleitung_SPOILER.md', 'wissensbuch.md', 'uebergabe.md'].forEach(function (f, i) { fs.copyFileSync(path.join(abl, f), path.join(blobs, 'blob-' + i + (f === 'stand.json' ? '.json' : '.md'))); });
r = lauf(['--einordnen', neuAbl].concat(fs.readdirSync(blobs).map(function (f) { return path.join(blobs, f); })));
pruef('--einordnen legt jede Datei unter ihren Pfad', r.status === 0 && ['stand.json', '02_spielstand.md', '03_spielleitung_SPOILER.md', 'wissensbuch.md', 'uebergabe.md'].every(function (f) { return sha(path.join(neuAbl, f)) === sha(path.join(abl, f)); }), r.stderr);
pruef('--einordnen meldet Stand, Prüfsummen und was nicht geholt ist', /Stand der Ablage: Sitzung 3/.test(r.stderr) && (r.stderr.match(/Prüfsumme stimmt/g) || []).length === 4 && /Nicht geholt: 2 Dateien/.test(r.stderr), r.stderr);
// nicht Geholtes bleibt, wie es liegt: weder neu veröffentlicht noch entfernt
fs.appendFileSync(path.join(neuAbl, '02_spielstand.md'), '\n## Karte\nMühlfurt, drei Stunden.\n');
r = lauf(['--ablage', neuAbl, '--sitzung', 'Sitzung 3', '--sitzungsende']);
var a3 = r.status === 0 ? JSON.parse(r.stdout.trim()) : { files: [], remove: [] };
var st3 = JSON.parse(lese(path.join(neuAbl, 'stand.json')));
pruef('--sitzungsende: Spielstand und Stand hinaus, Übergabe entfernt', r.status === 0 && a3.files.map(function (x) { return x.as; }).sort().join(',') === '02_spielstand.md,stand.json' && a3.remove.join(',') === 'uebergabe.md' && !fs.existsSync(path.join(neuAbl, 'uebergabe.md')), r.stderr + r.stdout);
pruef('nicht Geholtes bleibt im Stand, die Übergabe nicht', !!st3.dateien['buehnen/keller.json'] && !!st3.dateien['archiv/001-wuerfelprotokoll-sitzung-1.md'] && st3.dateien['buehnen/keller.json'].sha256 === st.dateien['buehnen/keller.json'].sha256 && !st3.dateien['uebergabe.md'] && /2 nicht geholt/.test(r.stderr), JSON.stringify(st3) + r.stderr);
// eine veränderte Datei fällt beim Einordnen auf
var blobs2 = path.join(dir, 'blobs2'); fs.mkdirSync(blobs2);
fs.copyFileSync(path.join(abl, 'stand.json'), path.join(blobs2, 'a.json'));
fs.writeFileSync(path.join(blobs2, 'b.md'), lese(path.join(abl, '03_spielleitung_SPOILER.md')) + 'nachträglich');
r = lauf(['--einordnen', path.join(dir, 'ablage-falsch'), path.join(blobs2, 'a.json'), path.join(blobs2, 'b.md')]);
pruef('veränderte Datei wird nicht eingeordnet', r.status === 1 && /keine Datei des Stands hat diese Prüfsumme/.test(r.stderr) && !fs.existsSync(path.join(dir, 'ablage-falsch', '03_spielleitung_SPOILER.md')), r.stderr);
r = lauf(['--einordnen', path.join(dir, 'ablage-genannt'), path.join(blobs2, 'a.json'), '03_spielleitung_SPOILER.md=' + path.join(blobs2, 'b.md')]);
pruef('pfad=datei ordnet ein, meldet aber die falsche Prüfsumme', r.status === 1 && /PRÜFSUMME STIMMT NICHT/.test(r.stderr) && fs.existsSync(path.join(dir, 'ablage-genannt', '03_spielleitung_SPOILER.md')), r.stderr);
r = lauf(['--einordnen', path.join(dir, 'ablage-ohne'), path.join(blobs2, 'b.md')]);
pruef('ohne stand.json nicht zuzuordnen', r.status === 1 && /ohne stand\.json/.test(r.stderr), r.stderr);
r = lauf(['--einordnen', path.join(dir, 'ablage-raus'), path.join(blobs2, 'a.json'), '../draussen.md=' + path.join(blobs2, 'b.md')]);
pruef('kein Pfad aus der Ablage hinaus', r.status === 1 && !fs.existsSync(path.join(dir, 'draussen.md')), r.stderr);
r = lauf(['--ablage', neuAbl, '--entfernen', 'wissensbuch.md']);
var a4 = r.status === 0 ? JSON.parse(r.stdout.trim()) : { files: [], remove: [] };
pruef('--entfernen nimmt eine Datei aus Ablage und Stand', r.status === 0 && a4.remove.join(',') === 'wissensbuch.md' && !JSON.parse(lese(path.join(neuAbl, 'stand.json'))).dateien['wissensbuch.md'], r.stderr);
['--db', '--batches', '--kopie', '--uebergabe'].forEach(function (alt) {
  r = lauf([alt, abl, stand]);
  pruef(alt + ' gibt es nicht mehr, mit Hinweis', r.status === 2 && /seit Regelwerk 4\.2 nicht mehr/.test(r.stderr), r.stderr);
});

/* ---------- Umzug aus der Datenbank von vor 4.2 ---------- */
var alt = path.join(dir, 'altbestand');
alsAltbestand(alt);
function kopieDok(datei, text, extra) { var d = { datei: datei, text: text, zeichen: Array.from(text).length, sha256: crypto.createHash('sha256').update(text, 'utf8').digest('hex'), geschrieben: '2026-11-01' }; Object.keys(extra || {}).forEach(function (k) { d[k] = extra[k]; }); return JSON.stringify(d); }
var standText = lese(stand), spoilText = lese(spoil), wbText = lese(wb);
schreib('altbestand/sl/_spielstand.json', kopieDok('02_spielstand.md', standText, { projekt: 1234, sitzung: 'Sitzung 2' }));
schreib('altbestand/sl/_spoiler.json', kopieDok('03_spielleitung_SPOILER.md', spoilText, { projekt: 1234, sitzung: 'Sitzung 2' }));
schreib('altbestand/sl/_wissensbuch.json', kopieDok('wissensbuch.md', wbText));
schreib('altbestand/sl/_werkstatt-kacheln.json', kopieDok('02_uebergabe_kacheln.md', '# Übergabe Kacheln\nZehn Sets.\n', { art: 'werkstatt', titel: 'Übergabe: Kacheln' }));
schreib('altbestand/sl/_buehne-keller.json', JSON.stringify({ id: 'keller', art: 'buehne', ort: 'eiche', gelaende: 'gewoelbe', boden: ['....'] }));
schreib('altbestand/sl/_profil-probefigur.json', JSON.stringify({ art: 'profil', figur: 'Probefigur', bewegung: 9 }));
schreib('altbestand/sl/_pruefsummen.json', JSON.stringify({ datei: 'pruefsummen', spielstand: { sha256: 'x' } }));
schreib('altbestand/sl/wuerfelprotokoll-sitzung-1.json', JSON.stringify({ reihe: 101, titel: 'Würfelprotokoll Sitzung 1', text: 'Wahrnehmung 13.' }));
schreib('altbestand/sl/wuerfelprotokoll-sitzung-2.json', JSON.stringify({ reihe: 102, titel: 'Würfelprotokoll Sitzung 2', text: 'Athletik 9.' }));
var um = path.join(dir, 'umzug');
r = lauf(['--umzug', alt, um]);
pruef('--umzug läuft', r.status === 0, r.stderr);
gleichesBuchAus(path.join(um, 'buch'), 'Umzug aus dem Ordner');
function gleichesBuchAus(buchOrdner, name) {
  var z = path.join(dir, 'zurueck-' + name.replace(/\W+/g, '-'));
  var rr = lauf(['--zurueck', buchOrdner, z]);
  pruef(name + ': --zurueck läuft', rr.status === 0, rr.stderr);
  gleichesBuch(z, name);
}
var ua = path.join(um, 'ablage');
pruef('Umzug: Spielstand, Spoilerdatei und Wissensbuch Zeichen für Zeichen', lese(path.join(ua, '02_spielstand.md')) === standText && lese(path.join(ua, '03_spielleitung_SPOILER.md')) === spoilText && lese(path.join(ua, 'wissensbuch.md')) === wbText);
pruef('Umzug: Bühne, Profil, Werkstatt-Übergabe, Archiv an ihrem Platz', JSON.parse(lese(path.join(ua, 'buehnen', 'keller.json'))).gelaende === 'gewoelbe' && JSON.parse(lese(path.join(ua, 'profile', 'probefigur.json'))).bewegung === 9 && /Zehn Sets/.test(lese(path.join(ua, 'werkstatt', '02_uebergabe_kacheln.md'))) &&
  lese(path.join(ua, 'archiv', '001-wuerfelprotokoll-sitzung-1.md')) === '## Würfelprotokoll Sitzung 1\n\nWahrnehmung 13.\n' && fs.existsSync(path.join(ua, 'archiv', '002-wuerfelprotokoll-sitzung-2.md')));
var stU = JSON.parse(lese(path.join(ua, 'stand.json')));
pruef('Umzug: stand.json kennt jede Datei, die alten Prüfsummen sind nicht dabei', stU.sitzung === 'Umzug' && Object.keys(stU.dateien).length === 8 && stU.dateien['02_spielstand.md'].sha256 === crypto.createHash('sha256').update(standText, 'utf8').digest('hex') && !fs.existsSync(path.join(ua, 'sonstiges')), JSON.stringify(Object.keys(stU.dateien)));
pruef('Umzug meldet Prüfsummen und Zahlen, keinen Inhalt und keine Bühnennamen', /02_spielstand\.md \(Prüfsumme stimmt\)/.test(r.stderr) && /2 Abschnitte Archiv, 1 Bühnen, 1 Profile, 1 Werkstatt-Übergaben/.test(r.stderr) && r.stderr.indexOf('Der Wirt lügt') < 0 && r.stderr.indexOf('keller') < 0 && r.stderr.indexOf('Wahrnehmung') < 0, r.stderr);
// ein veränderter Text fällt auf
var faul = path.join(dir, 'altbestand-faul');
cp.spawnSync('cp', ['-r', alt, faul]);
var fk = JSON.parse(lese(path.join(faul, 'sl', '_spoiler.json'))); fk.text += 'nachträglich'; fs.writeFileSync(path.join(faul, 'sl', '_spoiler.json'), JSON.stringify(fk));
r = lauf(['--umzug', faul, path.join(dir, 'umzug-faul')]);
pruef('Umzug: veränderter Text fällt auf', r.status === 1 && /03_spielleitung_SPOILER\.md \(Prüfsumme STIMMT NICHT\)/.test(r.stderr) && !/02_spielstand\.md \(Prüfsumme STIMMT NICHT\)/.test(r.stderr), r.stderr);

// dasselbe aus dem Umzugspaket der Seite: ein zip, gespeichert wie von der Seite oder gepackt wie von anderen Werkzeugen
function crc32(buf) { var c = ~0, i, k; for (i = 0; i < buf.length; i++) { c ^= buf[i]; for (k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; } return (~c) >>> 0; }
function zip(eintraege, packen) {
  var teile = [], verz = [], ort = 0;
  eintraege.forEach(function (e) {
    var name = Buffer.from(e.name, 'utf8'), roh = packen ? zlib.deflateRawSync(e.daten) : e.daten, art = packen ? 8 : 0, crc = crc32(e.daten);
    var l = Buffer.alloc(30); l.writeUInt32LE(0x04034b50, 0); l.writeUInt16LE(20, 4); l.writeUInt16LE(0x0800, 6); l.writeUInt16LE(art, 8); l.writeUInt32LE(crc, 14); l.writeUInt32LE(roh.length, 18); l.writeUInt32LE(e.daten.length, 22); l.writeUInt16LE(name.length, 26);
    var z = Buffer.alloc(46); z.writeUInt32LE(0x02014b50, 0); z.writeUInt16LE(20, 4); z.writeUInt16LE(20, 6); z.writeUInt16LE(0x0800, 8); z.writeUInt16LE(art, 10); z.writeUInt32LE(crc, 16); z.writeUInt32LE(roh.length, 20); z.writeUInt32LE(e.daten.length, 24); z.writeUInt16LE(name.length, 28); z.writeUInt32LE(ort, 42);
    teile.push(l, name, roh); verz.push(z, name); ort += 30 + name.length + roh.length;
  });
  var v = Buffer.concat(verz), ende = Buffer.alloc(22); ende.writeUInt32LE(0x06054b50, 0); ende.writeUInt16LE(eintraege.length, 8); ende.writeUInt16LE(eintraege.length, 10); ende.writeUInt32LE(v.length, 12); ende.writeUInt32LE(ort, 16);
  return Buffer.concat(teile.concat([v, ende]));
}
function eintraegeAus(ordner) {
  var aus = [{ name: 'umzug.json', daten: Buffer.from(JSON.stringify({ format: 'spielerbuch-umzug', version: 1 })) }];
  fs.readdirSync(ordner).forEach(function (s) { fs.readdirSync(path.join(ordner, s)).forEach(function (f) { aus.push({ name: s + '/' + f, daten: fs.readFileSync(path.join(ordner, s, f)) }); }); });
  return aus;
}
[false, true].forEach(function (packen) {
  var name = packen ? 'gepackt' : 'gespeichert', paket = schreib('paket-' + name + '.zip', zip(eintraegeAus(alt), packen)), z = path.join(dir, 'umzug-zip-' + name);
  r = lauf(['--umzug', paket, z]);
  pruef('Umzug aus dem zip (' + name + ') läuft', r.status === 0, r.stderr);
  pruef('Umzug aus dem zip (' + name + '): dieselben Dateien wie aus dem Ordner', ['buch/daten/meta.json', 'buch/daten/glossar.json', 'buch/daten/tische.json', 'buch/daten/geschichte.json', 'ablage/02_spielstand.md', 'ablage/03_spielleitung_SPOILER.md', 'ablage/wissensbuch.md', 'ablage/buehnen/keller.json', 'ablage/archiv/002-wuerfelprotokoll-sitzung-2.md'].every(function (f) { return sha(path.join(z, f)) === sha(path.join(um, f)); }));
});
var fremdPaket = schreib('paket-fremd.zip', zip(eintraegeAus(alt).concat([{ name: '../draussen.json', daten: Buffer.from('{}') }, { name: 'sl/unter/ordner.json', daten: Buffer.from('{}') }]), false));
r = lauf(['--umzug', fremdPaket, path.join(dir, 'umzug-fremd')]);
pruef('Umzug: fremde Namen im Paket werden gemeldet, nichts landet außerhalb', r.status === 1 && /2 Einträge des Pakets/.test(r.stderr) && !fs.existsSync(path.join(dir, 'draussen.json')), r.stderr);
r = lauf(['--umzug', schreib('kein.zip', 'kein Archiv'), path.join(dir, 'umzug-kein')]);
pruef('Umzug: kein zip, klare Absage', r.status !== 0 && /kein zip-Archiv/.test(r.stderr), r.stderr);

/* ---------- Kern pflegen (Regelwerk 21.1, Werkstatt 21.7): messen, Kapitel „Stand der Dinge“, Verlustprobe ---------- */
var kAlt = schreib('kern/alt.md', ['# Spielstand der Probefigur · nach Sitzung 3',
  '*Stand: Tag 3*', '',
  '## Jetzt', '- In Mühlfurt, Tag 3, abends.', '',
  '## Für die Spielleitung', '- Würfe der Spielleitung: offen.', '- Kehraus zuletzt nach Sitzung 1.', '',
  '## Karte', '- Mühlfurt: drei Stunden über den Damm zur Alten Eiche.', '- Die Furt führt im Frühjahr Hochwasser; Bodo riet zum Umweg.', '',
  '## Questlog', '### Offene Aufträge', '- **Der Brief des Vogts:** nach Mühlfurt bringen.', '  - Bodo kennt den Empfänger nicht.', '  - Der Vogt zahlt bei Rückkehr.',
  '### Gegebenes Wort', '- Dem Vogt: Schweigen über den Brief.', '',
  '## Stichwortliste', '- Bodo · Wirt', ''].join('\n'));
var kNeu = schreib('kern/neu.md', ['# Spielstand der Probefigur · nach Sitzung 3',
  '*Stand: Tag 3*', '',
  '## Jetzt', '- In Mühlfurt, Tag 3, abends.', '',
  '## Für die Spielleitung', '- Würfe der Spielleitung: offen.', '',
  '## Karte', '- Mühlfurt: drei Stunden über den Damm zur Alten Eiche.', '',
  '## Questlog', '### Offene Aufträge', '- **Der Brief des Vogts:** nach Mühlfurt bringen. Stand: unterwegs.',
  '### Gegebenes Wort', '- Dem Vogt: Schweigen über den Brief.', '',
  '## Stichwortliste', '- Bodo · Wirt', '- Vogt · Auftraggeber', ''].join('\n'));
var kWerkbank = schreib('kern/werkbank.md', '# Werkbank der Probefigur\n\n## Kürzen\n- Kehraus zuletzt nach Sitzung 1.\n');
var kGes = schreib('kern/02_geschichte.md', '# Was bisher geschah\n\n### Sitzung 1, Tag 1\n- Aufbruch in der Hafenstadt.\n\n### Sitzung 2, Tag 2\n- Bodo schenkt Bier aus.\n');
var kTitel = 'Stand der Dinge nach Sitzung 3 (Welttag 3)';
r = lauf(['--kern', 'messen', kAlt, '--richtwert', '300']);
var kOhne = lese(kAlt).slice(0, lese(kAlt).indexOf('\n## Stichwortliste'));
pruef('Kern messen: Abschnitte, Summe ohne Stichwortliste, Abstand zum Richtwert',
  r.status === 0 && /## Questlog/.test(r.stdout) && !/Stichwortliste\n/.test(r.stdout.replace(/ohne die Stichwortliste/, '')) &&
  r.stdout.indexOf(String(Array.from(kOhne).length) + '         ohne die Stichwortliste · Richtwert 300 · ' + (Array.from(kOhne).length - 300) + ' darüber') >= 0, r.stdout + r.stderr);
var kSumme = 0; r.stdout.split('\n').forEach(function (z) { var m = z.match(/^\s*([\d.]+)\s+\d+ %/); if (m) kSumme += parseInt(m[1].replace(/\./g, ''), 10); });
pruef('Kern messen: Die Abschnitte ergeben zusammen die Summe', kSumme === Array.from(kOhne).length, kSumme + ' / ' + Array.from(kOhne).length);
var kSpoiler = schreib('kern/03_spielleitung_SPOILER.md', '# SPOILER\n## Der wahre Vogt\n- Der Vogt ist ein Hochstapler.\n## Uhren\n- Die Flut: 2 von 6.\n');
r = lauf(['--kern', 'messen', kSpoiler]);
pruef('Kern messen: Die Spoilerdatei nennt Nummern statt Überschriften', r.status === 0 && /Abschnitt 2 ab Zeile 2/.test(r.stdout) && !/Vogt|Uhren/.test(r.stdout) && /im Ganzen · Richtwert 100\.000/.test(r.stdout), r.stdout + r.stderr);
r = lauf(['--kern', 'kapitel', kAlt, kNeu, kGes, '--titel', 'Rückblick', 'Karte']);
pruef('Kern Kapitel: Der Titel muss mit „Stand der Dinge“ beginnen', r.status === 1 && /beginnt mit „Stand der Dinge“/.test(r.stderr), r.stdout + r.stderr);
r = lauf(['--kern', 'kapitel', kAlt, kNeu, kGes, '--titel', kTitel, 'Fäden']);
pruef('Kern Kapitel: Ein unbekannter Abschnitt wird abgelehnt, mit der Liste der Abschnitte', r.status === 1 && /„Fäden“ gibt es nicht/.test(r.stderr) && /Jetzt · Für die Spielleitung · Karte · Questlog/.test(r.stderr), r.stdout + r.stderr);
r = lauf(['--kern', 'kapitel', kAlt, kNeu, kGes, '--titel', kTitel, 'Karte', 'Für die Spielleitung']);
pruef('Kern Kapitel: Ein Abschnitt für die Spielleitung geht nicht ins Buch', r.status === 1 && /gehört in die Werkbank/.test(r.stderr) && lese(kGes).indexOf('Stand der Dinge') < 0, r.stdout + r.stderr);
r = lauf(['--kern', 'kapitel', kSpoiler, kNeu, kGes, '--titel', kTitel, 'Uhren']);
pruef('Kern Kapitel: Spielleitungswissen geht nie in die Geschichte', r.status === 1 && /Spielleitungswissen/.test(r.stderr) && lese(kGes).indexOf('Stand der Dinge') < 0, r.stdout + r.stderr);
r = lauf(['--kern', 'verlust', kAlt, kNeu, kGes, kWerkbank]);
pruef('Verlustprobe vor dem Kapitel: nennt die Zeilen, die nirgends mehr stehen', r.status === 1 && /FEHLT: Zeile 13 · - Die Furt führt im Frühjahr Hochwasser; Bodo riet zum Umweg\./.test(r.stdout) && /4 von 17 Zeilen/.test(r.stdout), r.stdout + r.stderr);
r = lauf(['--kern', 'kapitel', kAlt, kNeu, kGes, '--titel', kTitel, '--ohne', kWerkbank, 'questlog', 'Karte', 'Jetzt']);
var kText = lese(kGes), kKapitel = ['### ' + kTitel, '#### Karte', '- Die Furt führt im Frühjahr Hochwasser; Bodo riet zum Umweg.', '', '#### Questlog', '##### Offene Aufträge',
  '- **Der Brief des Vogts:** nach Mühlfurt bringen.', '  - Bodo kennt den Empfänger nicht.', '  - Der Vogt zahlt bei Rückkehr.', '', '### Sitzung 1, Tag 1'].join('\n');
pruef('Kern Kapitel: steht vor der ersten Sitzung, Zeilen wörtlich, Überschriften ab ####, in der Reihenfolge des Kerns',
  r.status === 0 && kText.indexOf('# Was bisher geschah\n\n' + kKapitel) === 0 && /Jetzt: nichts hat den Kern verlassen/.test(r.stdout) && /Karte: 1 Zeile\n/.test(r.stdout) && /Questlog: 3 Zeilen/.test(r.stdout) && /: 4 Zeilen, /.test(r.stdout), r.stdout + r.stderr + '\n' + kText);
pruef('Kern Kapitel: Was in der Werkbank steht, geht nicht ins Buch; die Sitzungen bleiben unberührt',
  kText.indexOf('Kehraus zuletzt') < 0 && !/Nicht ins Kapitel genommen/.test(r.stdout) && /### Sitzung 2, Tag 2\n- Bodo schenkt Bier aus\.\n$/.test(kText), r.stdout + '\n' + kText);
var kNeuVorher = lese(kNeu);
r = lauf(['--kern', 'kapitel', kAlt, kGes, kNeu, '--titel', kTitel, 'Karte']);
pruef('Kern Kapitel: Vertauschte Dateien, geschrieben wird nur in eine Geschichte', r.status === 1 && /ist keine Geschichte/.test(r.stderr) && lese(kNeu) === kNeuVorher, r.stdout + r.stderr);
r = lauf(['--kern', 'kapitel', kAlt, kNeu, kGes, '--titel', kTitel, 'Karte']);
pruef('Kern Kapitel: Dasselbe Kapitel gibt es nicht zweimal', r.status === 1 && /gibt es in .* schon/.test(r.stderr) && lese(kGes) === kText, r.stdout + r.stderr);
r = lauf(['--kern', 'verlust', kAlt, kNeu, kGes, kWerkbank]);
pruef('Verlustprobe: nichts verloren, auch die tiefer gesetzten Überschriften zählen', r.status === 0 && /NICHTS VERLOREN: Jede der 17 Zeilen/.test(r.stdout), r.stdout + r.stderr);
r = lauf(['--kern', 'verlust', kAlt, kNeu, kGes]);
pruef('Verlustprobe: ohne die Werkbank fehlt deren Zeile', r.status === 1 && /FEHLT: Zeile 9 · - Kehraus zuletzt nach Sitzung 1\./.test(r.stdout) && /1 von 17 Zeilen der alten Fassung steht nirgends mehr/.test(r.stdout), r.stdout + r.stderr);
// Das Kapitel übersteht den Weg ins Buch und zurück als ein Abschnitt
var kBuch = path.join(dir, 'kern', 'buch'), kZur = path.join(dir, 'kern', 'zurueck');
r = lauf(['--dateien', kBuch, '--stand', 'Stand: Tag 3', kGes]);
var kJson = JSON.parse(lese(path.join(kBuch, 'daten', 'geschichte.json')));
pruef('Kern Kapitel im Buch: ein Abschnitt, an erster Stelle, mit seinen Überschriften im Text', r.status === 0 && kJson.length === 3 && kJson[0].titel === kTitel && /^#### Karte\n/.test(kJson[0].text) && /\n##### Offene Aufträge\n/.test(kJson[0].text), r.stderr + JSON.stringify(kJson.map(function (x) { return x.titel; })));
r = lauf(['--kern', 'verlust', kAlt, kNeu, path.join(kBuch, 'daten', 'geschichte.json'), kWerkbank]);
pruef('Verlustprobe liest auch geschichte.json', r.status === 0 && /NICHTS VERLOREN/.test(r.stdout), r.stdout + r.stderr);
r = lauf(['--zurueck', kBuch, kZur]);
pruef('Kern Kapitel: hin und zurück ändert die Geschichte nicht', r.status === 0 && lese(path.join(kZur, '02_geschichte.md')) === kText && !/Überschriften jetzt ab/.test(r.stderr), r.stderr);
// Ein Abschnitt aus der Zeit vor 4.2, dessen Text Überschriften „##“ und „###“ trägt, bliebe beim Zurückschreiben nicht ganz: --zurueck setzt sie tiefer
var kAltbuch = path.join(dir, 'kern', 'altbuch');
fs.mkdirSync(path.join(kAltbuch, 'daten'), { recursive: true });
fs.writeFileSync(path.join(kAltbuch, 'daten', 'geschichte.json'), JSON.stringify([{ id: 'stand', reihe: 0, titel: 'Stand der Dinge nach Sitzung 2 (Welttag 2)', text: '## Questlog\n### Offene Aufträge\n- Der Brief.\n#### Etappen\n- Aufbruch.' },
  { id: 's1', reihe: 1, titel: 'Sitzung 1, Tag 1', text: '- Aufbruch in der Hafenstadt.' }]));
var kAltZur = path.join(dir, 'kern', 'altzurueck');
r = lauf(['--zurueck', kAltbuch, kAltZur]);
var kAltMd = lese(path.join(kAltZur, '02_geschichte.md'));
pruef('--zurueck setzt Überschriften im Text eines Abschnitts ab #### und sagt es', r.status === 0 && /in 1 stehen Überschriften jetzt ab „####“/.test(r.stderr) && kAltMd.indexOf('#### Questlog\n##### Offene Aufträge\n- Der Brief.\n###### Etappen\n- Aufbruch.') > 0, r.stderr + kAltMd);
r = lauf(['--dateien', path.join(dir, 'kern', 'altbuch2'), kAltMd === '' ? kGes : path.join(kAltZur, '02_geschichte.md')]);
pruef('… und der Abschnitt bleibt beim nächsten --dateien einer', r.status === 0 && JSON.parse(lese(path.join(dir, 'kern', 'altbuch2', 'daten', 'geschichte.json'))).length === 2, r.stderr);
// Ein zweiter Kehraus: Sein Kapitel steht nach dem ersten und vor den Sitzungen
var kNeu2 = schreib('kern/neu2.md', lese(kNeu).replace('- Dem Vogt: Schweigen über den Brief.\n', ''));
r = lauf(['--kern', 'kapitel', kNeu, kNeu2, kGes, '--titel', 'Stand der Dinge nach Sitzung 9 (Welttag 12)', 'Questlog']);
var kText2 = lese(kGes);
pruef('Kern Kapitel: Das zweite steht nach dem ersten, vor den Sitzungen', r.status === 0 && kText2.indexOf('### ' + kTitel) < kText2.indexOf('### Stand der Dinge nach Sitzung 9') && kText2.indexOf('### Stand der Dinge nach Sitzung 9') < kText2.indexOf('### Sitzung 1, Tag 1') &&
  /### Stand der Dinge nach Sitzung 9 \(Welttag 12\)\n#### Questlog\n##### Gegebenes Wort\n- Dem Vogt: Schweigen über den Brief\.\n\n### Sitzung 1/.test(kText2), r.stdout + r.stderr + kText2);
r = lauf(['--kern', 'kapitel', kNeu, kNeu, kGes, '--titel', 'Stand der Dinge nach Sitzung 10 (Welttag 13)', 'Questlog']);
pruef('Kern Kapitel: Ohne Kürzung entsteht kein Kapitel', r.status === 1 && /nichts den Kern verlassen/.test(r.stderr) && lese(kGes) === kText2, r.stdout + r.stderr);
// Spielleitungswissen: Die Verlustprobe nennt nur Zeilennummern
var kSpoilerNeu = schreib('kern/03_neu.md', '# SPOILER\n## Uhren\n- Die Flut: 2 von 6.\n');
r = lauf(['--kern', 'verlust', kSpoiler, kSpoilerNeu]);
pruef('Verlustprobe an der Spoilerdatei: Zeilennummern, kein Wortlaut', r.status === 1 && /FEHLT: Zeile 2\nFEHLT: Zeile 3\n2 von 5 Zeilen/.test(r.stdout) && !/Hochstapler|wahre/.test(r.stdout), r.stdout + r.stderr);
var kArchiv = schreib('kern/archiv/004-der-wahre-vogt.md', '## Der wahre Vogt\n\n- Der Vogt ist ein Hochstapler.\n');
r = lauf(['--kern', 'verlust', kSpoiler, kSpoilerNeu, kArchiv]);
pruef('Verlustprobe an der Spoilerdatei: Das Archiv trägt, was sie verlassen hat', r.status === 0 && /NICHTS VERLOREN: Jede der 5 Zeilen/.test(r.stdout), r.stdout + r.stderr);

console.log((fehl ? 'FEHLER' : 'ok') + ' · buch.test.js: ' + ok + ' bestanden, ' + fehl + ' fehlgeschlagen');
process.exit(fehl ? 1 : 0);
