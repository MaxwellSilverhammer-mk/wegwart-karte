#!/usr/bin/env node
// Spielerbuch (Regelwerk 3.0, 4.7): eine Seite je Figur, ein Artefakt mit Datenbank. Zeigt Glossar, Logbuch, Gepäck,
// Karte und „Was bisher geschah“ aus der Datenbank der Seite; die Tische sind eingebaut (ein Artefakt lädt keine
// Skripte von GitHub).
//
//   node seite/bauen.js --seite [--titel "Probefigurs Buch"] > buch.gebaut.html
//       baut die Seite aus seite/buch.html, glossar.js, karte.js, inventar.js, questlog.js und seite/ikonen.svg;
//       --titel setzt den Titel, den die Seite vor dem Laden zeigt (sonst „Spielerbuch“; danach gilt titel aus meta/buch)
//   node seite/bauen.js --db <ordner> [--stand "Stand: Tag 12"] [--stufe 3] [--titel "Probefigurs Buch"] [--reihe-ab n] [--sl-reihe-ab n] <dateien …>
//       schreibt die Dokumente der Datenbank nach <ordner>/<sammlung>/<id>.json; die Art jeder Datei erkennt es selbst:
//       02_glossar.md (Glossar-Text)          -> glossar/<id>, meta/glossar
//       02_karte.md, 02_inventar.md, 02_questlog.md (json-Block oder .json) -> tische/karte, tische/gepaeck, tische/logbuch
//       02_geschichte.md (Abschnitte „### …“) -> geschichte/<id>  („Was bisher geschah“, Wortlaut aus dem Spielstand)
//       --sl <datei> (Abschnitte „## …“)       -> sl/<id>          (Archiv der Spielleitung, z. B. Würfelprotokolle; die Seite zeigt es nicht)
//       --reihe-ab n, --sl-reihe-ab n: Nummer (reihe) des ersten Abschnitts der Geschichte bzw. des Archivs in dieser Datei, wenn
//       nur neue Abschnitte eingespielt werden (n = Zahl der Dokumente, die es schon gibt, aus dem list-Ergebnis); sonst 0.
//       dazu meta/buch (titel, stand, stufe, figur).
//   Einspielen: ArtifactData batch, je Dokument set mit file_path; bestehende Dokumente mit if_version aus einem list davor.
//   node seite/bauen.js --batches <ordner> [--alt <db-ordner>] [versionen …]
//       schreibt die Batches dafür, je Zeile ein writes-Array für ArtifactData batch (höchstens 50 Schreibvorgänge und
//       etwa 900 KB je Batch): set mit file_path, mit if_version, wo die Versionen das Dokument kennen; Dokumente, die
//       es in <ordner> nicht mehr gibt (glossar, geschichte, sl, tische), als delete. --alt <db-ordner> (der Ordner
//       von --zurueck bzw. out_dir) lässt unveränderte Dokumente weg. versionen: der Text der ArtifactData-list-Ergebnisse
//       (Zeilen „- "id"  123 bytes  version 4  "…/sammlung/id.json"“) oder json {"sammlung/id": 4}.
//   node seite/bauen.js --zurueck <db-ordner> <zielordner>
//       der Weg zurück zum Bearbeiten und Prüfen: liest, was ArtifactData mit out_dir gespeichert hat
//       (<db-ordner>/<sammlung>/<id>.json), und schreibt 02_glossar.md, 02_karte.json, 02_inventar.json, 02_questlog.json,
//       02_geschichte.md und 03_archiv.md (sl) in den Zielordner; nach dem Bearbeiten pruefen.js, dann wieder --db.
//       Aus der Ablage (sl/_spielstand, sl/_spoiler, sl/_uebergabe) schreibt es 02_spielstand.md,
//       03_spielleitung_SPOILER.md und uebergabe.md daneben und meldet, von wann sie sind und ob die Prüfsumme stimmt;
//       kennt die Kopie die Projektdokumente, dazu projekt-dokumente.txt zum Vergleich mit project_info (Werkstatt 21.5).
//
//   Ablage der Spielleitung (Regelwerk 3.5, Werkstatt 21.4 und 21.5): Dokumente sl/_… sind kein Archiv. --zurueck nimmt sie
//   nicht in 03_archiv.md, --batches schreibt und löscht sie nie; geschrieben werden sie nur so:
//   node seite/bauen.js --kopie <ordner> --projekt <größe> [--dokumente <datei>] [--sitzung "Sitzung 11"] [--sitzungsende] 02_spielstand.md 03_spielleitung_SPOILER.md [versionen …]
//       Kopien von Spielstand und Spoilerdatei (text, zeichen, sha256, projekt = knowledge_size aus project_info gleich
//       nach dem Schreiben ins Projekt, dokumente = die Pfade der Projektdokumente aus project_info, je Zeile einer in <datei>,
//       sitzung, geschrieben) nach <ordner>/sl/; auf stdout eine Zeile für ArtifactData batch, mit if_version, wo die
//       Versionen die Kopie kennen; --sitzungsende löscht dabei die Übergabe.
//   node seite/bauen.js --uebergabe <ordner> uebergabe.md [versionen …]
//       die Übergabe eines Zwischenhalts nach <ordner>/sl/_uebergabe.json, dazu die Zeile für ArtifactData batch.
'use strict';
var fs = require('fs'), path = require('path'), crypto = require('crypto');
var WURZEL = path.join(__dirname, '..');
var glossar = require(path.join(WURZEL, 'glossar.js'));

function lies(p) { return fs.readFileSync(p, 'utf8'); }
function slug(t) {
  return String(t).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'abschnitt';
}
// Ablage der Spielleitung: sl/_… mit festem Dateinamen beim Zurückholen
var ABLAGE = { _spielstand: '02_spielstand.md', _spoiler: '03_spielleitung_SPOILER.md', _uebergabe: 'uebergabe.md' };
function istAblage(sammlung, id) { return sammlung === 'sl' && /^_/.test(id); }
function pruefsumme(t) { return crypto.createHash('sha256').update(t, 'utf8').digest('hex'); }
function zahl(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
// Text so in <script type="text/plain"> stellen, dass kein </script> ihn vorzeitig schließt
function alsSkripttext(js) { return js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--'); }

function html(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function seite(titel) {
  var vorlage = lies(path.join(__dirname, 'buch.html'));
  if (titel) {
    vorlage = vorlage.replace('<title>Spielerbuch</title>', '<title>' + html(titel) + '</title>')
      .replace('<h1 id="titel">Spielerbuch</h1>', '<h1 id="titel">' + html(titel) + '</h1>');
  }
  var teile = { GLOSSAR_JS: 'glossar.js', KARTE_JS: 'karte.js', INVENTAR_JS: 'inventar.js', QUESTLOG_JS: 'questlog.js' };
  Object.keys(teile).forEach(function (k) {
    var marke = '/*' + k + '*/';
    if (vorlage.indexOf(marke) < 0) throw new Error('Platzhalter ' + marke + ' fehlt in seite/buch.html');
    vorlage = vorlage.split(marke).join(alsSkripttext(lies(path.join(WURZEL, teile[k]))));
  });
  vorlage = vorlage.replace('<!--SPRITE-->', lies(path.join(__dirname, 'ikonen.svg')).trim());
  return vorlage;
}

function jsonAus(text, datei) {
  if (/\.json$/i.test(datei)) return JSON.parse(text);
  var m = text.match(/```json\s*([\s\S]*?)```/);
  return m ? JSON.parse(m[1]) : null;
}
function abschnitte(text, ebene) {
  var re = ebene === 3 ? /^###\s+(.+)$/ : /^##\s+(.+)$/, aus = [], akt = null;
  text.split('\n').forEach(function (z) {
    var m = z.match(re);
    if (m && !(ebene === 2 && /^###/.test(z))) { akt = { titel: m[1].trim(), zeilen: [] }; aus.push(akt); return; }
    if (akt) akt.zeilen.push(z);
  });
  return aus.map(function (a, i) { return { id: slug(a.titel), reihe: i, titel: a.titel, text: a.zeilen.join('\n').replace(/^\n+|\s+$/g, '') }; });
}

function db(args) {
  var ordner = args.shift(), opt = { titel: '', stand: '', stufe: null, reiheAb: 0, slReiheAb: 0 }, dateien = [], sl = [];
  while (args.length) {
    var a = args.shift();
    if (a === '--stand') opt.stand = args.shift();
    else if (a === '--reihe-ab') opt.reiheAb = +args.shift() || 0;
    else if (a === '--sl-reihe-ab') opt.slReiheAb = +args.shift() || 0;
    else if (a === '--stufe') opt.stufe = +args.shift();
    else if (a === '--titel') opt.titel = args.shift();
    else if (a === '--sl') sl.push(args.shift());
    else dateien.push(a);
  }
  var docs = [], figur = '', probleme = [];
  dateien.forEach(function (datei) {
    var text = lies(datei);
    // Spielleitungswissen (Spoilerdatei, Archiv) darf nie in eine Sammlung, die das Buch zeigt
    if (/^03_/.test(path.basename(datei)) || /^#\s+Archiv der Spielleitung/m.test(text) || /^##\s+Wer wei(ß|ss) was/m.test(text)) {
      probleme.push(datei + ': Spielleitungswissen. Das Archiv gehört mit --sl übergeben, die Spoilerdatei nie ins Buch.'); return;
    }
    if (/^###\s+(Personen|Gruppen|Orte|Dinge|Gerüchte)\s*$/m.test(text) && /^-\s+\*\*/m.test(text)) {
      var g = glossar.ausText(text);
      if (g.probleme && g.probleme.length) probleme = probleme.concat(g.probleme.map(function (p) { return datei + ': ' + (p.text || p); }));
      glossar.alsDokumente(g.D).forEach(function (d) { docs.push(d); });
      figur = figur || g.D.figur || '';
      if (!opt.stand && g.D.stand) opt.stand = g.D.stand;
      if (opt.stufe == null && typeof g.D.stufe === 'number') opt.stufe = g.D.stufe;
      return;
    }
    var D = null;
    try { D = jsonAus(text, datei); } catch (e) { probleme.push(datei + ': json nicht lesbar (' + e.message + ')'); return; }
    if (D) {
      var id = D.orte || D.wege ? 'karte' : D.traeger ? 'gepaeck' : D.auftraege ? 'logbuch' : '';
      if (!id) { probleme.push(datei + ': weder Karte noch Gepäck noch Logbuch'); return; }
      docs.push({ sammlung: 'tische', id: id, daten: D });
      if (!figur && D.figur) figur = D.figur;
      return;
    }
    var g3 = abschnitte(text, 3);
    if (!g3.length) { probleme.push(datei + ': keine Abschnitte „### …“'); return; }
    // Die Geschichte hat die Überschrift „# Was bisher geschah“ oder nur Abschnitte „### Sitzung …“; sonst ist es die falsche Datei
    if (!/^#\s+Was bisher geschah/m.test(text) && g3.some(function (a) { return !/^Sitzung\b/i.test(a.titel); })) {
      probleme.push(datei + ': keine Geschichte (Überschrift „# Was bisher geschah“ oder Abschnitte „### Sitzung …“)'); return;
    }
    g3.forEach(function (a) { docs.push({ sammlung: 'geschichte', id: a.id, daten: { reihe: a.reihe + opt.reiheAb, titel: a.titel, text: a.text } }); });
  });
  sl.forEach(function (datei) {
    abschnitte(lies(datei), 2).forEach(function (a) { docs.push({ sammlung: 'sl', id: a.id, daten: { reihe: a.reihe + opt.slReiheAb, titel: a.titel, text: a.text } }); });
  });
  if (probleme.length) { console.error('Nicht geschrieben:\n  ' + probleme.join('\n  ')); process.exit(1); }
  var meta = { titel: opt.titel || ((figur ? figur + 's' : 'Das') + ' Buch'), stand: opt.stand, figur: figur };
  if (opt.stufe != null && !isNaN(opt.stufe)) meta.stufe = opt.stufe;
  docs.push({ sammlung: 'meta', id: 'buch', daten: meta });
  var gross = docs.filter(function (d) { return Buffer.byteLength(JSON.stringify(d.daten)) > 250 * 1024; });
  if (gross.length) { console.error('Zu groß für ein Dokument (256 KiB): ' + gross.map(function (d) { return d.sammlung + '/' + d.id; }).join(', ')); process.exit(1); }
  docs.forEach(function (d) {
    var p = path.join(ordner, d.sammlung, d.id + '.json');
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(d.daten, null, 1) + '\n');
  });
  process.stdout.write(docs.map(function (d) { return d.sammlung + '/' + d.id; }).join('\n') + '\n');
  console.error(docs.length + ' Dokumente in ' + ordner + '. Einspielen: ArtifactData batch (höchstens 50 je Aufruf), je Dokument set mit file_path; bestehende mit if_version aus einem list davor; gestrichene mit delete.');
}

function liesSammlung(ordner, name) {
  var d = path.join(ordner, name);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter(function (f) { return /\.json$/.test(f); }).map(function (f) {
    return { id: f.replace(/\.json$/, ''), daten: JSON.parse(lies(path.join(d, f))) };
  });
}
function zurueck(ordner, ziel) {
  fs.mkdirSync(ziel, { recursive: true });
  var aus = [], meta = {};
  liesSammlung(ordner, 'meta').forEach(function (m) { meta[m.id] = m.daten; });
  var g = liesSammlung(ordner, 'glossar');
  if (g.length) {
    var D = glossar.ausDokumenten(meta.glossar || {}, g);
    fs.writeFileSync(path.join(ziel, '02_glossar.md'), glossar.alsText(D));
    aus.push('02_glossar.md (' + g.length + ' Einträge)');
  }
  var namen = { karte: '02_karte.json', gepaeck: '02_inventar.json', logbuch: '02_questlog.json' };
  liesSammlung(ordner, 'tische').forEach(function (t) {
    if (!namen[t.id]) return;
    fs.writeFileSync(path.join(ziel, namen[t.id]), JSON.stringify(t.daten, null, 1) + '\n');
    aus.push(namen[t.id]);
  });
  function alsMd(liste, kopf, ebene) {
    return kopf + '\n\n' + liste.sort(function (a, b) { return (a.daten.reihe || 0) - (b.daten.reihe || 0); })
      .map(function (x) { return ebene + ' ' + x.daten.titel + '\n' + x.daten.text + '\n'; }).join('\n');
  }
  var ge = liesSammlung(ordner, 'geschichte');
  if (ge.length) { fs.writeFileSync(path.join(ziel, '02_geschichte.md'), alsMd(ge, '# Was bisher geschah', '###')); aus.push('02_geschichte.md (' + ge.length + ' Abschnitte)'); }
  var slAlle = liesSammlung(ordner, 'sl');
  var sl = slAlle.filter(function (d) { return !istAblage('sl', d.id); });
  if (sl.length) { fs.writeFileSync(path.join(ziel, '03_archiv.md'), alsMd(sl, '# Archiv der Spielleitung', '##')); aus.push('03_archiv.md (' + sl.length + ' Abschnitte)'); }
  slAlle.filter(function (d) { return istAblage('sl', d.id); }).forEach(function (d) {
    var name = ABLAGE[d.id], k = d.daten || {};
    if (!name || typeof k.text !== 'string') { aus.push('sl/' + d.id + ' übergangen (unbekannt)'); return; }
    fs.writeFileSync(path.join(ziel, name), k.text);
    if (d.id === '_spielstand' && Array.isArray(k.dokumente)) {
      fs.writeFileSync(path.join(ziel, 'projekt-dokumente.txt'), k.dokumente.join('\n') + '\n');
      aus.push('projekt-dokumente.txt (' + k.dokumente.length + ' Projektdokumente zur Zeit der Kopie)');
    }
    var von = [k.sitzung, k.geschrieben, k.projekt != null ? 'Projektgröße ' + zahl(k.projekt) : ''].filter(Boolean).join(', ');
    aus.push(name + ' aus sl/' + d.id + ' (' + (von ? von + '; ' : '') + 'Prüfsumme ' + (k.sha256 === pruefsumme(k.text) ? 'stimmt' : 'STIMMT NICHT') + ')');
  });
  console.error('Geschrieben nach ' + ziel + ': ' + (aus.join(', ') || 'nichts'));
}

// Versionen aus dem Text der ArtifactData-list-Ergebnisse oder aus json {"sammlung/id": n}
function versionenAus(text) {
  var v = {};
  try {
    var j = JSON.parse(text);
    if (j && typeof j === 'object' && !Array.isArray(j)) { Object.keys(j).forEach(function (k) { if (+j[k] > 0) v[k] = +j[k]; }); return v; }
  } catch (e) { /* Text */ }
  var sammlung = '';
  text.split('\n').forEach(function (z) {
    // Kopfzeile eines list-Ergebnisses: »222 documents from collection "glossar" saved as JSON files under "…"«
    var k = z.match(/documents? from collection "([^"]+)"/);
    if (k) sammlung = k[1].split('/').pop();
    var m = z.match(/"([^"]+)"\s+\d+\s+bytes\s+version\s+(\d+)\s+"([^"]+)"/);
    if (m) { v[path.basename(path.dirname(m[3])) + '/' + m[1]] = +m[2]; return; }
    // Gekürzter Rest eines langen Ergebnisses: »[172 more saved documents, … (id, version): "alke" 2, "arn" 7, …]«
    if (/more saved documents/.test(z) && sammlung) {
      var re = /"([^"]+)"\s+(\d+)/g, t;
      while ((t = re.exec(z))) v[sammlung + '/' + t[1]] = +t[2];
      return;
    }
    m = z.match(/^\s*-?\s*([A-Za-z0-9_\-.~:@+]+)\/([A-Za-z0-9_\-.~:@+]+)\s*[:=]?\s*(?:version\s*)?(\d+)\s*$/);
    if (m) v[m[1] + '/' + m[2]] = +m[3];
  });
  return v;
}
var SAMMLUNGEN = ['meta', 'glossar', 'tische', 'geschichte', 'sl'], LOESCHBAR = ['glossar', 'tische', 'geschichte', 'sl'];
// Die Datenbank gibt Dokumente mit sortierten Schlüsseln zurück; verglichen wird darum ohne Rücksicht auf die Reihenfolge
function kanonisch(o) {
  if (Array.isArray(o)) return o.map(kanonisch);
  if (o && typeof o === 'object') { var r = {}; Object.keys(o).sort().forEach(function (k) { r[k] = kanonisch(o[k]); }); return r; }
  return o;
}
function batches(args) {
  var ordner = args.shift(), alt = null, versionen = {};
  while (args.length) {
    var a = args.shift();
    if (a === '--alt') alt = args.shift();
    else { var v = versionenAus(lies(a)); Object.keys(v).forEach(function (k) { versionen[k] = v[k]; }); }
  }
  var neu = {}, writes = [], zaehl = { neu: 0, ersetzt: 0, gleich: 0, geloescht: 0 };
  SAMMLUNGEN.forEach(function (s) {
    liesSammlung(ordner, s).forEach(function (d) {
      if (istAblage(s, d.id)) return;
      var k = s + '/' + d.id; neu[k] = true;
      if (alt) {
        var ap = path.join(alt, s, d.id + '.json');
        if (fs.existsSync(ap) && JSON.stringify(kanonisch(JSON.parse(lies(ap)))) === JSON.stringify(kanonisch(d.daten))) { zaehl.gleich++; return; }
      }
      var w = { op: 'set', collection: s, doc_id: d.id, file_path: path.resolve(ordner, s, d.id + '.json') };
      if (versionen[k]) { w.if_version = versionen[k]; zaehl.ersetzt++; } else zaehl.neu++;
      w._groesse = fs.statSync(w.file_path).size;
      writes.push(w);
    });
  });
  Object.keys(versionen).sort().forEach(function (k) {
    var s = k.split('/')[0];
    if (neu[k] || LOESCHBAR.indexOf(s) < 0 || istAblage(s, k.slice(s.length + 1))) return;
    writes.push({ op: 'delete', collection: s, doc_id: k.slice(s.length + 1), if_version: versionen[k], _groesse: 100 });
    zaehl.geloescht++;
  });
  var aus = [], akt = [], groesse = 0;
  writes.forEach(function (w) {
    if (akt.length && (akt.length >= 50 || groesse + w._groesse > 900 * 1024)) { aus.push(akt); akt = []; groesse = 0; }
    groesse += w._groesse; delete w._groesse; akt.push(w);
  });
  if (akt.length) aus.push(akt);
  aus.forEach(function (b) { process.stdout.write(JSON.stringify(b) + '\n'); });
  console.error(writes.length + ' Schreibvorgänge in ' + aus.length + ' Batch' + (aus.length === 1 ? '' : 'es') + ': ' + zaehl.neu + ' neu, ' + zaehl.ersetzt + ' ersetzt' +
    (alt ? ', ' + zaehl.gleich + ' unverändert weggelassen' : '') + ', ' + zaehl.geloescht + ' gelöscht.' +
    (Object.keys(versionen).length ? '' : ' Keine Versionen angegeben: Jedes Dokument, das es schon gibt, braucht if_version aus einem list davor.'));
}

// Ablage: ein Dokument je Datei, ganz oder gar nicht; eine Zeile für ArtifactData batch
function ablageDok(datei, extra) {
  var text = lies(datei);
  var d = { datei: path.basename(datei), text: text, zeichen: Array.from(text).length, sha256: pruefsumme(text), geschrieben: new Date().toISOString().slice(0, 10) };
  Object.keys(extra || {}).forEach(function (k) { if (extra[k] != null && extra[k] !== '') d[k] = extra[k]; });
  return d;
}
function ablageSchreiben(ordner, docs, versionen, loeschen) {
  var zuGross = docs.filter(function (x) { return Buffer.byteLength(JSON.stringify(x.daten)) > 250 * 1024; });
  if (zuGross.length) {
    console.error('Nicht geschrieben: ' + zuGross.map(function (x) { return x.daten.datei + ' (' + Math.round(Buffer.byteLength(JSON.stringify(x.daten)) / 1024) + ' KiB)'; }).join(', ') +
      ' ist zu groß für ein Dokument (256 KiB). Erst kürzen (Regelwerk 21.1).');
    process.exit(1);
  }
  var writes = [];
  docs.forEach(function (x) {
    var p = path.resolve(ordner, 'sl', x.id + '.json');
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(x.daten, null, 1) + '\n');
    var w = { op: 'set', collection: 'sl', doc_id: x.id, file_path: p };
    if (versionen['sl/' + x.id]) w.if_version = versionen['sl/' + x.id];
    writes.push(w);
  });
  (loeschen || []).forEach(function (id) {
    if (versionen['sl/' + id]) writes.push({ op: 'delete', collection: 'sl', doc_id: id, if_version: versionen['sl/' + id] });
  });
  process.stdout.write(JSON.stringify(writes) + '\n');
  return writes;
}
function versionenDazu(versionen, datei) { var v = versionenAus(lies(datei)); Object.keys(v).forEach(function (k) { versionen[k] = v[k]; }); }
function kopie(args) {
  var ordner = args.shift(), projekt = null, sitzung = '', ende = false, dateien = [], versionen = {}, dokumente = null;
  while (args.length) {
    var a = args.shift();
    if (a === '--projekt') projekt = args.shift();
    else if (a === '--dokumente') dokumente = lies(args.shift()).split('\n').map(function (z) { return z.trim(); }).filter(Boolean);
    else if (a === '--sitzung') sitzung = args.shift();
    else if (a === '--sitzungsende') ende = true;
    else if (/\.md$/i.test(a)) dateien.push(a);
    else versionenDazu(versionen, a);
  }
  var n = projekt == null ? NaN : Number(String(projekt).replace(/[.\s]/g, ''));
  if (!(n > 0)) { console.error('--projekt <größe> fehlt: knowledge_size aus project_info, gleich nach dem Schreiben ins Projekt.'); process.exit(2); }
  var docs = [], probleme = [];
  dateien.forEach(function (datei) {
    var b = path.basename(datei), id = /^02_spielstand/i.test(b) ? '_spielstand' : /^03_/.test(b) ? '_spoiler' : '';
    if (!id) probleme.push(datei + ': weder 02_spielstand… noch 03_…');
    else if (docs.some(function (x) { return x.id === id; })) probleme.push(datei + ': ' + id + ' doppelt');
    else docs.push({ id: id, daten: ablageDok(datei, { projekt: n, sitzung: sitzung, dokumente: dokumente }) });
  });
  if (!docs.length && !probleme.length) probleme.push('keine Datei angegeben (02_spielstand.md, 03_spielleitung_SPOILER.md)');
  if (probleme.length) { console.error('Nicht geschrieben:\n  ' + probleme.join('\n  ')); process.exit(1); }
  var w = ablageSchreiben(ordner, docs, versionen, ende ? ['_uebergabe'] : []);
  console.error(docs.length + (docs.length === 1 ? ' Kopie' : ' Kopien') + ' nach ' + path.join(ordner, 'sl') + ': ' +
    docs.map(function (x) { return x.daten.datei + ' (' + zahl(x.daten.zeichen) + ' Zeichen' + (w.some(function (y) { return y.doc_id === x.id && y.if_version; }) ? ', ersetzt' : ', neu') + ')'; }).join(', ') +
    '; Projektgröße ' + zahl(n) + (dokumente ? ', ' + dokumente.length + ' Projektdokumente' : '') + '. Die Zeile auf stdout geht unverändert als ein ArtifactData batch hinaus' +
    (w.some(function (y) { return y.op === 'delete'; }) ? '; sie löscht auch die Übergabe.' : '.') +
    (Object.keys(versionen).length ? '' : ' Keine Versionen angegeben: Gibt es die Kopien schon, braucht jede if_version aus einem list davor.'));
}
function uebergabe(args) {
  var ordner = args.shift(), datei = null, versionen = {};
  args.forEach(function (a) { if (!datei && /\.md$/i.test(a)) datei = a; else versionenDazu(versionen, a); });
  if (!datei) { console.error('Aufruf: node seite/bauen.js --uebergabe <ordner> uebergabe.md [versionen …]'); process.exit(2); }
  if (!lies(datei).trim()) { console.error('Nicht geschrieben: ' + datei + ' ist leer.'); process.exit(1); }
  var w = ablageSchreiben(ordner, [{ id: '_uebergabe', daten: ablageDok(datei) }], versionen, []);
  console.error('Übergabe nach ' + path.join(ordner, 'sl', '_uebergabe.json') + (w[0].if_version ? ' (ersetzt Version ' + w[0].if_version + ')' : ' (neu)') +
    '. Die Zeile auf stdout geht unverändert als ein ArtifactData batch hinaus.' +
    (w[0].if_version || Object.keys(versionen).length ? '' : ' Gibt es schon eine Übergabe, braucht sie if_version aus einem list davor.'));
}

if (require.main === module) {
  var a = process.argv.slice(2), was = a.shift();
  if (was === '--seite' && (a.length === 0 || (a.length === 2 && a[0] === '--titel'))) process.stdout.write(seite(a[1]));
  else if (was === '--db' && a.length >= 2) db(a);
  else if (was === '--zurueck' && a.length === 2) zurueck(a[0], a[1]);
  else if (was === '--batches' && a.length >= 1) batches(a);
  else if (was === '--kopie' && a.length >= 2) kopie(a);
  else if (was === '--uebergabe' && a.length >= 2) uebergabe(a);
  else { console.error('Aufruf: node seite/bauen.js --seite [--titel …] | --db <ordner> [--stand …] [--stufe n] [--titel …] [--sl datei] <dateien …> | --zurueck <db-ordner> <zielordner> | --batches <ordner> [--alt <db-ordner>] [versionen …] | --kopie <ordner> --projekt <größe> [--sitzung …] [--sitzungsende] <02_spielstand.md> <03_….md> [versionen …] | --uebergabe <ordner> <uebergabe.md> [versionen …]'); process.exit(2); }
}
module.exports = { seite: seite, abschnitte: abschnitte, slug: slug, zurueck: zurueck, versionenAus: versionenAus, istAblage: istAblage, pruefsumme: pruefsumme };
