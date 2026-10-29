// Spielerbuch: Dokumente hin (--db) und zurück (--zurueck) ändern nichts; die Seite baut und enthält alle Tische.
// Erfundene Mini-Welt, keine privaten Dateien.
'use strict';
var fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
var bauen = path.join(__dirname, '..', 'seite', 'bauen.js'), glossar = require(path.join(__dirname, '..', 'glossar.js'));
var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'buch-'));
function schreib(name, text) { var p = path.join(dir, name); fs.writeFileSync(p, text); return p; }
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
var ges = schreib('02_geschichte.md', '# Was bisher geschah\n\n### Sitzung 1, Tag 1\n- Aufbruch in der Hafenstadt.\n  > *Ein Brief: „Komm bald.“*\n\n### Sitzung 2, Tag 2\n- Bodo schenkt Bier aus.\n');
var sl = schreib('03_archiv.md', '# Archiv\n\n## Würfelprotokoll Sitzung 1\nWahrnehmung 13.\n');
var db = path.join(dir, 'db'), zur = path.join(dir, 'zurueck');
var r = cp.spawnSync(process.execPath, [bauen, '--db', db, gl, karte, ges, '--sl', sl, '--stufe', '1'], { encoding: 'utf8' });
pruef('--db läuft', r.status === 0, r.stderr);
['glossar/bodo.json', 'glossar/zur-alten-eiche.json', 'meta/glossar.json', 'meta/buch.json', 'tische/karte.json', 'geschichte/sitzung-1-tag-1.json', 'geschichte/sitzung-2-tag-2.json', 'sl/wuerfelprotokoll-sitzung-1.json'].forEach(function (f) {
  pruef('Dokument ' + f, fs.existsSync(path.join(db, f)));
});
var meta = JSON.parse(fs.readFileSync(path.join(db, 'meta/buch.json'), 'utf8'));
pruef('meta/buch', meta.titel === 'Probefigurs Buch' && meta.stufe === 1 && meta.stand === 'Stand: Tag 3', JSON.stringify(meta));
r = cp.spawnSync(process.execPath, [bauen, '--zurueck', db, zur], { encoding: 'utf8' });
pruef('--zurueck läuft', r.status === 0, r.stderr);
pruef('Glossar hin und zurück gleich', JSON.stringify(glossar.ausText(fs.readFileSync(gl, 'utf8')).D) === JSON.stringify(glossar.ausText(fs.readFileSync(path.join(zur, '02_glossar.md'), 'utf8')).D));
pruef('Karte hin und zurück gleich', JSON.stringify(JSON.parse(fs.readFileSync(karte, 'utf8'))) === JSON.stringify(JSON.parse(fs.readFileSync(path.join(zur, '02_karte.json'), 'utf8'))));
var g2 = fs.readFileSync(path.join(zur, '02_geschichte.md'), 'utf8');
pruef('Geschichte hin und zurück gleich', g2.indexOf('### Sitzung 1, Tag 1\n- Aufbruch in der Hafenstadt.\n  > *Ein Brief: „Komm bald.“*') >= 0 && g2.indexOf('### Sitzung 2, Tag 2\n- Bodo schenkt Bier aus.') >= 0, g2);
var seite = cp.spawnSync(process.execPath, [bauen, '--seite'], { encoding: 'utf8', maxBuffer: 1 << 26 });
pruef('Seite baut', seite.status === 0 && /<title>[^<]+<\/title>/.test(seite.stdout), seite.stderr);
['GLOSSAR_JS', 'KARTE_JS', 'INVENTAR_JS', 'QUESTLOG_JS', 'SPRITE'].forEach(function (k) { pruef('Platzhalter ' + k + ' ersetzt', seite.stdout.indexOf(k === 'SPRITE' ? '<!--SPRITE-->' : '/*' + k + '*/') < 0); });
pruef('kein </script> in eingebauten Tischen', (seite.stdout.match(/<\/script>/g) || []).length === 5);
pruef('Klasse sr-only und Textfarben der Widget-Umgebung definiert', /\.sr-only\{[^}]*clip:rect\(0,0,0,0\)/.test(seite.stdout) && /--text-primary:/.test(seite.stdout) && /--text-secondary:/.test(seite.stdout));
pruef('Vorlage ohne Namen einer Figur', /<title>Spielerbuch<\/title>/.test(seite.stdout) && seite.stdout.indexOf('<h1 id="titel">Spielerbuch</h1>') >= 0);
var seite2 = cp.spawnSync(process.execPath, [bauen, '--seite', '--titel', 'Probefigurs <Buch>'], { encoding: 'utf8', maxBuffer: 1 << 26 });
pruef('--titel setzt Titel und Überschrift', seite2.status === 0 && seite2.stdout.indexOf('<title>Probefigurs &lt;Buch&gt;</title>') >= 0 && seite2.stdout.indexOf('<h1 id="titel">Probefigurs &lt;Buch&gt;</h1>') >= 0, seite2.stderr);

// Spielleitungswissen landet nie in einer Sammlung, die das Buch zeigt
var falsch = schreib('03_spielleitung_SPOILER.md', '# SPOILER\n### Geheim\n- Der Wirt ist der Kultführer.\n');
r = cp.spawnSync(process.execPath, [bauen, '--db', path.join(dir, 'db-falsch'), gl, falsch], { encoding: 'utf8' });
pruef('Spoilerdatei als Geschichte abgelehnt', r.status === 1 && !fs.existsSync(path.join(dir, 'db-falsch', 'geschichte')), r.stderr);
var archivOhneSl = schreib('archiv-kopie.md', '# Archiv der Spielleitung\n\n### SG der Probe\nWahrnehmung SG 15.\n');
r = cp.spawnSync(process.execPath, [bauen, '--db', path.join(dir, 'db-falsch2'), gl, archivOhneSl], { encoding: 'utf8' });
pruef('Archiv ohne --sl abgelehnt', r.status === 1, r.stderr);
var keineGeschichte = schreib('notizen.md', '# Notizen\n### Einkauf\n- Brot.\n');
r = cp.spawnSync(process.execPath, [bauen, '--db', path.join(dir, 'db-falsch3'), keineGeschichte], { encoding: 'utf8' });
pruef('Fremde Datei nicht als Geschichte', r.status === 1, r.stderr);

// Batches: Versionen aus dem Text eines list-Ergebnisses, unveränderte weglassen, gestrichene löschen
var neu = path.join(dir, 'db-neu');
var gl2 = schreib('02_glossar_neu.md', fs.readFileSync(gl, 'utf8').replace('  Gasthaus am Damm.', '  Gasthaus am Damm, mit Kegelbahn.'));
r = cp.spawnSync(process.execPath, [bauen, '--db', neu, gl2, karte, ges, '--sl', sl, '--stufe', '1'], { encoding: 'utf8' });
var liste = schreib('versionen.txt', [
  '30 documents from collection "glossar" saved as JSON files under "/x/glossar":',
  '- "bodo"  750 bytes  version 3  "' + path.join(db, 'glossar', 'bodo.json') + '"',
  '- "zur-alten-eiche"  700 bytes  version 2  "' + path.join(db, 'glossar', 'zur-alten-eiche.json') + '"',
  '- "gestrichen"  500 bytes  version 5  "' + path.join(db, 'glossar', 'gestrichen.json') + '"',
  'meta/glossar 1', 'meta/buch: 4', 'tische/karte 7'
].join('\n'));
r = cp.spawnSync(process.execPath, [bauen, '--batches', neu, '--alt', db, liste], { encoding: 'utf8' });
var b = r.stdout.trim().split('\n').filter(Boolean).map(JSON.parse), w = [].concat.apply([], b);
function finde(c, id) { return w.filter(function (x) { return x.collection === c && x.doc_id === id; })[0]; }
pruef('--batches läuft', r.status === 0 && b.length === 1, r.stderr);
pruef('geänderter Eintrag mit if_version', finde('glossar', 'zur-alten-eiche') && finde('glossar', 'zur-alten-eiche').if_version === 2 && finde('glossar', 'zur-alten-eiche').op === 'set', JSON.stringify(w));
pruef('unveränderte weggelassen', !finde('glossar', 'bodo') && !finde('tische', 'karte') && !finde('geschichte', 'sitzung-1-tag-1'), JSON.stringify(w));
pruef('gestrichener Eintrag gelöscht', finde('glossar', 'gestrichen') && finde('glossar', 'gestrichen').op === 'delete' && finde('glossar', 'gestrichen').if_version === 5, JSON.stringify(w));
pruef('file_path absolut und vorhanden', w.filter(function (x) { return x.op === 'set'; }).every(function (x) { return path.isAbsolute(x.file_path) && fs.existsSync(x.file_path); }));
// Die Datenbank liefert Dokumente mit sortierten Schlüsseln (out_dir); unverändert bleibt unverändert
function sortiert(o) { if (Array.isArray(o)) return o.map(sortiert); if (o && typeof o === 'object') { var r = {}; Object.keys(o).sort().forEach(function (k) { r[k] = sortiert(o[k]); }); return r; } return o; }
var dbS = path.join(dir, 'db-sortiert');
fs.readdirSync(db).forEach(function (c) {
  fs.mkdirSync(path.join(dbS, c), { recursive: true });
  fs.readdirSync(path.join(db, c)).forEach(function (f) { fs.writeFileSync(path.join(dbS, c, f), JSON.stringify(sortiert(JSON.parse(fs.readFileSync(path.join(db, c, f), 'utf8'))), null, 2)); });
});
r = cp.spawnSync(process.execPath, [bauen, '--batches', neu, '--alt', dbS, liste], { encoding: 'utf8' });
var wS = [].concat.apply([], r.stdout.trim().split('\n').filter(Boolean).map(JSON.parse));
pruef('--alt mit sortierten Schlüsseln: nur das Geänderte', r.status === 0 && wS.some(function (x) { return x.doc_id === 'zur-alten-eiche'; }) && !wS.some(function (x) { return x.doc_id === 'bodo' || x.doc_id === 'karte'; }), JSON.stringify(wS.map(function (x) { return x.collection + '/' + x.doc_id; })));
r = cp.spawnSync(process.execPath, [bauen, '--batches', neu], { encoding: 'utf8' });
var alle = [].concat.apply([], r.stdout.trim().split('\n').map(JSON.parse));
pruef('ohne --alt alle Dokumente, je Batch höchstens 50', alle.length === fs.readdirSync(neu).reduce(function (n, c) { return n + fs.readdirSync(path.join(neu, c)).length; }, 0) && r.stdout.trim().split('\n').every(function (z) { return JSON.parse(z).length <= 50; }), r.stderr);

// Ablage (Regelwerk 3.5): Kopien und Übergabe unter sl/_…, nie im Archiv, nie von --batches angefasst
function lauf(args) { return cp.spawnSync(process.execPath, [bauen].concat(args), { encoding: 'utf8' }); }
function lese(p) { return fs.readFileSync(p, 'utf8'); }
var stand = schreib('02_spielstand.md', '# Spielstand Probefigur\n\n## Jetzt\nTag 3, Abend, in der Alten Eiche.\n\n## Klang\n- Weg: https://example.org/weg\n');
var spoil = schreib('03_spielleitung_SPOILER.md', '# Spoiler\n\n## Wahrheit\nDer Wirt lügt. Äöüß ✦\n');
var abl = path.join(dir, 'ablage');
r = lauf(['--kopie', abl, '--projekt', '1234', '--sitzung', 'Sitzung 2', stand, spoil]);
var wk = r.status === 0 ? JSON.parse(r.stdout.trim()) : [];
pruef('--kopie läuft: zwei set ohne if_version', r.status === 0 && wk.length === 2 && wk.every(function (x) { return x.op === 'set' && x.collection === 'sl' && !x.if_version && path.isAbsolute(x.file_path) && fs.existsSync(x.file_path); }), r.stderr + r.stdout);
var ks = JSON.parse(lese(path.join(abl, 'sl', '_spielstand.json')));
pruef('Kopie trägt Datei, Text, Zeichen, Prüfsumme, Projektgröße, Sitzung, Datum', ks.datei === '02_spielstand.md' && ks.text === lese(stand) && ks.zeichen === Array.from(ks.text).length && /^[0-9a-f]{64}$/.test(ks.sha256) && ks.projekt === 1234 && ks.sitzung === 'Sitzung 2' && /^\d{4}-\d{2}-\d{2}$/.test(ks.geschrieben), JSON.stringify(ks).slice(0, 400));
var ueb = schreib('uebergabe.md', '# Übergabe, Sitzung 2, Teil 1\n\n## Letzter Spieltisch\n📅 Tag 3 · Abend\n');
r = lauf(['--uebergabe', abl, ueb]);
var wu = r.status === 0 ? JSON.parse(r.stdout.trim()) : [];
pruef('--uebergabe läuft', r.status === 0 && wu.length === 1 && wu[0].doc_id === '_uebergabe' && wu[0].op === 'set' && !wu[0].if_version && JSON.parse(lese(wu[0].file_path)).text === lese(ueb), r.stderr);
var dbA = path.join(dir, 'db-ablage');
fs.readdirSync(db).forEach(function (c) { fs.mkdirSync(path.join(dbA, c), { recursive: true }); fs.readdirSync(path.join(db, c)).forEach(function (f) { fs.copyFileSync(path.join(db, c, f), path.join(dbA, c, f)); }); });
fs.readdirSync(path.join(abl, 'sl')).forEach(function (f) { fs.copyFileSync(path.join(abl, 'sl', f), path.join(dbA, 'sl', f)); });
var zurA = path.join(dir, 'zurueck-ablage');
r = lauf(['--zurueck', dbA, zurA]);
pruef('--zurueck legt die Ablage als Dateien daneben', r.status === 0 && lese(path.join(zurA, '02_spielstand.md')) === lese(stand) && lese(path.join(zurA, '03_spielleitung_SPOILER.md')) === lese(spoil) && lese(path.join(zurA, 'uebergabe.md')) === lese(ueb) && (r.stderr.match(/Prüfsumme stimmt/g) || []).length === 3 && /Sitzung 2/.test(r.stderr) && /Projektgröße 1\.234/.test(r.stderr), r.stderr);
var arch = lese(path.join(zurA, '03_archiv.md'));
pruef('Ablage nicht im Archiv', arch.indexOf('Der Wirt lügt') < 0 && arch.indexOf('Alten Eiche') < 0 && arch.indexOf('Übergabe') < 0 && arch.indexOf('Würfelprotokoll Sitzung 1') >= 0, arch);
var falschK = JSON.parse(lese(path.join(dbA, 'sl', '_spoiler.json'))); falschK.text += 'nachträglich';
fs.writeFileSync(path.join(dbA, 'sl', '_spoiler.json'), JSON.stringify(falschK));
r = lauf(['--zurueck', dbA, path.join(dir, 'zurueck-falsch')]);
pruef('veränderte Kopie fällt auf', r.status === 0 && /03_spielleitung_SPOILER\.md aus sl\/_spoiler \([^)]*STIMMT NICHT\)/.test(r.stderr) && !/02_spielstand\.md aus sl\/_spielstand \([^)]*STIMMT NICHT\)/.test(r.stderr), r.stderr);
var listeA = schreib('versionen-ablage.txt', [
  '4 documents from collection "sl" saved as JSON files under "' + path.join(dbA, 'sl') + '":',
  '- "wuerfelprotokoll-sitzung-1"  300 bytes  version 2  "' + path.join(dbA, 'sl', 'wuerfelprotokoll-sitzung-1.json') + '"',
  '- "_spielstand"  900 bytes  version 4  "' + path.join(dbA, 'sl', '_spielstand.json') + '"',
  '- "_spoiler"  500 bytes  version 6  "' + path.join(dbA, 'sl', '_spoiler.json') + '"',
  '- "_uebergabe"  200 bytes  version 1  "' + path.join(dbA, 'sl', '_uebergabe.json') + '"'
].join('\n'));
fs.copyFileSync(path.join(abl, 'sl', '_uebergabe.json'), path.join(neu, 'sl', '_uebergabe.json'));
r = lauf(['--batches', neu, '--alt', dbA, liste, listeA]);
var wb = r.status === 0 ? [].concat.apply([], r.stdout.trim().split('\n').filter(Boolean).map(JSON.parse)) : [];
pruef('--batches lässt die Ablage in Ruhe', r.status === 0 && !wb.some(function (x) { return /^_/.test(x.doc_id); }) && wb.some(function (x) { return x.doc_id === 'zur-alten-eiche'; }), JSON.stringify(wb));
fs.unlinkSync(path.join(neu, 'sl', '_uebergabe.json'));
r = lauf(['--kopie', abl, '--projekt', '1.300', '--sitzung', 'Sitzung 3', '--sitzungsende', stand, spoil, listeA]);
var we = r.status === 0 ? JSON.parse(r.stdout.trim()) : [];
function in_(id) { return we.filter(function (x) { return x.doc_id === id; })[0] || {}; }
pruef('--kopie --sitzungsende pinnt auf die Versionen und löscht die Übergabe', r.status === 0 && in_('_spielstand').if_version === 4 && in_('_spoiler').if_version === 6 && in_('_uebergabe').op === 'delete' && in_('_uebergabe').if_version === 1 && we.length === 3, JSON.stringify(we) + r.stderr);
pruef('Projektgröße mit Tausenderpunkt gelesen', JSON.parse(lese(path.join(abl, 'sl', '_spielstand.json'))).projekt === 1300);
r = lauf(['--kopie', abl, '--projekt', '1300', stand, listeA]);
pruef('ohne --sitzungsende bleibt die Übergabe', r.status === 0 && JSON.parse(r.stdout.trim()).length === 1, r.stdout);
r = lauf(['--kopie', abl, stand]);
pruef('ohne --projekt abgelehnt', r.status === 2, r.stderr);
var riesig = schreib('03_riesig.md', '# Spoiler\n' + 'Sumpf '.repeat(45000));
r = lauf(['--kopie', path.join(dir, 'ablage-gross'), '--projekt', '5', riesig]);
pruef('zu große Kopie abgelehnt, nichts geschrieben', r.status === 1 && !fs.existsSync(path.join(dir, 'ablage-gross')) && /zu groß/.test(r.stderr), r.stderr);
r = lauf(['--kopie', abl, '--projekt', '5', schreib('notizen-x.md', 'x')]);
pruef('fremde Datei nicht als Kopie', r.status === 1, r.stderr);

// Regelwerk 3.16: gekürzte list-Ergebnisse, nur neue Abschnitte einspielen, Dokumentliste in der Kopie
var bauenModul = require(bauen);
var vk = bauenModul.versionenAus([
  '222 documents from collection "glossar" saved as JSON files under "/x/buch/glossar":',
  '- "abflussgraben"  686 bytes  version 11  "/x/buch/glossar/abflussgraben.json"',
  '[172 more saved documents, at <that directory>/<doc_id>.json each (id, version): "draus-letzter-brief" 11, "draus-notizblatt" 3, "zur-schiefen-rah" 1]',
  '3 documents from collection "tische" saved as JSON files under "/x/buch/tische":',
  '- "karte"  29549 bytes  version 12  "/x/buch/tische/karte.json"'
].join('\n'));
pruef('versionenAus liest die gekürzte Schlusszeile je Sammlung', vk['glossar/abflussgraben'] === 11 && vk['glossar/draus-letzter-brief'] === 11 && vk['glossar/draus-notizblatt'] === 3 && vk['glossar/zur-schiefen-rah'] === 1 && vk['tische/karte'] === 12 && Object.keys(vk).length === 5, JSON.stringify(vk));
var nurNeu = schreib('02_geschichte-neu.md', '### Sitzung 3, Tag 4\n- Der Damm hält.\n');
var nurSl = schreib('wuerfelprotokoll-3.md', '## Würfelprotokoll Sitzung 3\nAthletik 9.\n');
var dbN = path.join(dir, 'db-nur-neu');
r = lauf(['--db', dbN, '--reihe-ab', '2', '--sl-reihe-ab', '7', nurNeu, '--sl', nurSl]);
var gN = r.status === 0 ? JSON.parse(lese(path.join(dbN, 'geschichte', 'sitzung-3-tag-4.json'))) : {};
var sN = r.status === 0 ? JSON.parse(lese(path.join(dbN, 'sl', 'wuerfelprotokoll-sitzung-3.json'))) : {};
pruef('--reihe-ab und --sl-reihe-ab setzen die Reihe neuer Abschnitte', r.status === 0 && gN.reihe === 2 && gN.titel === 'Sitzung 3, Tag 4' && sN.reihe === 7, r.stderr + JSON.stringify([gN, sN]));
pruef('nur neue Abschnitte: meta/buch bleibt unberührt', !fs.existsSync(path.join(dbN, 'meta', 'buch.json')));
var dokListe = schreib('projekt-dokumente.txt', '00_regelwerk.md\n02_spielstand.md\n\n03_spielleitung_SPOILER.md\n');
var ablD = path.join(dir, 'ablage-dok');
r = lauf(['--kopie', ablD, '--projekt', '2000', '--dokumente', dokListe, '--sitzung', 'Weltenhüter', stand, spoil]);
var kD = r.status === 0 ? JSON.parse(lese(path.join(ablD, 'sl', '_spielstand.json'))) : {};
pruef('--dokumente kommt als Liste in die Kopie', r.status === 0 && JSON.stringify(kD.dokumente) === JSON.stringify(['00_regelwerk.md', '02_spielstand.md', '03_spielleitung_SPOILER.md']) && /3 Projektdokumente/.test(r.stderr), r.stderr);
var zurD = path.join(dir, 'zurueck-dok');
r = lauf(['--zurueck', ablD, zurD]);
pruef('--zurueck legt projekt-dokumente.txt daneben', r.status === 0 && lese(path.join(zurD, 'projekt-dokumente.txt')) === '00_regelwerk.md\n02_spielstand.md\n03_spielleitung_SPOILER.md\n' && /3 Projektdokumente zur Zeit der Kopie/.test(r.stderr), r.stderr);

console.log((fehl ? 'FEHLER' : 'ok') + ' · buch.test.js: ' + ok + ' bestanden, ' + fehl + ' fehlgeschlagen');
process.exit(fehl ? 1 : 0);
