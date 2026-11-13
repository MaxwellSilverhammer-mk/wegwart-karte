#!/usr/bin/env node
// Spielerbuch und Ablage (Regelwerk 4.2, 4.7 und 21; Spielerbuch 2.0): zwei Artefakte je Figur, beide mit Dateien statt
// Datenbank. Das Spielerbuch zeigt Glossar, Logbuch, Gepäck, Karte und „Was bisher geschah“ aus vier Dateien unter daten/;
// die Tische sind eingebaut (ein Artefakt lädt keine Skripte von GitHub). Die Ablage hält, was nur die Spielleitung liest:
// Spielstand, Spoilerdatei, Wissensbuch, Einstellungen, Werkbank, Übergabe, Bühnen, Profile und Archiv.
// Hinein gehen Dateien mit publish_files, heraus mit read_file und paths: Ihr Text läuft nicht durch den Chat.
//
//   node seite/bauen.js --seite [--titel "Probefigurs Buch"] > buch.gebaut.html
//       baut die Seite des Spielerbuchs aus seite/buch.html, glossar.js, karte.js, inventar.js, questlog.js und
//       seite/ikonen.svg; --titel setzt den Titel, den die Seite vor dem Laden zeigt (sonst „Spielerbuch“; danach gilt
//       titel aus daten/meta.json). Veröffentlicht wird sie als index.html.
//   node seite/bauen.js --ablage-seite [--titel "Probefigurs Ablage"] > ablage.gebaut.html
//       baut die Seite der Ablage aus seite/ablage.html: ein Deckblatt, das nur den Stand nennt.
//   node seite/bauen.js --dateien <ordner> [--stand "Stand: Tag 12"] [--stufe 3] [--titel "Probefigurs Buch"] <dateien …>
//       schreibt die Dateien des Buchs nach <ordner>/daten/; die Art jeder Datei erkennt es selbst:
//       02_glossar.md (Glossar-Text)                                         -> glossar.json und meta.json
//       02_karte.json, 02_inventar.json, 02_questlog.json (oder .md mit json-Block) -> tische.json
//       02_geschichte.md (Abschnitte „### …“ unter „# Was bisher geschah“)   -> geschichte.json
//       dazu immer meta.json (buch: titel, stand, stufe, figur; glossar: die Kopfdaten des Glossars).
//       Auf stdout steht die Liste für publish_files (files), je Datei as und path.
//   node seite/bauen.js --zurueck <ordner> <zielordner>
//       der Weg zurück zum Bearbeiten und Prüfen: liest die Dateien des Buchs, wie read_file mit paths sie gespeichert hat
//       (unter beliebigen Namen in <ordner> oder <ordner>/daten; erkannt wird am Inhalt), und schreibt 02_glossar.md,
//       02_karte.json, 02_inventar.json, 02_questlog.json und 02_geschichte.md in den Zielordner. Liest auch den alten
//       Aufbau <ordner>/<sammlung>/<id>.json. Nach dem Bearbeiten pruefen.js, dann wieder --dateien.
//   node seite/bauen.js --einordnen <ablage-ordner> <geholte dateien …>
//       legt geholte Dateien der Ablage unter ihrem Pfad in <ablage-ordner> ab. Welche Datei wohin gehört, sagt stand.json
//       (immer mitholen) über die Prüfsumme; so ist jede eingeordnete Datei zugleich geprüft. Eine Datei, die der Stand
//       nicht kennt, nennt man mit pfad=datei.
//   node seite/bauen.js --ablage <ablage-ordner> [--sitzung "Sitzung 18"] [--sitzungsende] [--entfernen <pfad> …]
//       vergleicht den Ordner mit stand.json, schreibt stand.json neu (sha256 und Zeichen je Datei, sitzung, geschrieben)
//       und gibt auf stdout {"files": […], "remove": […]} für publish_files aus: nur Neues und Geändertes, dazu stand.json.
//       Dateien, die der Stand kennt und die im Ordner fehlen, gelten als nicht geholt und bleiben, wie sie sind.
//       --sitzungsende entfernt die Übergabe; --entfernen entfernt eine genannte Datei.
//   node seite/bauen.js --umzug <paket.zip | db-ordner> <zielordner>
//       Umzug eines Buchs von vor Regelwerk 4.2: liest das Umzugspaket der Seite (oder einen Ordner
//       <sammlung>/<id>.json) und schreibt <zielordner>/buch/daten/ und <zielordner>/ablage/ samt stand.json.
//       Meldet nur Zahlen und Prüfsummen, keinen Inhalt.
'use strict';
var fs = require('fs'), path = require('path'), crypto = require('crypto'), zlib = require('zlib');
var WURZEL = path.join(__dirname, '..');
var glossar = require(path.join(WURZEL, 'glossar.js'));

function lies(p) { return fs.readFileSync(p, 'utf8'); }
function slug(t) {
  return String(t).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'abschnitt';
}
// Ablage vor Regelwerk 4.2: Dokumente sl/_… der Datenbank; ihre Dateinamen in der Ablage aus Dateien
var ABLAGE = { _spielstand: '02_spielstand.md', _spoiler: '03_spielleitung_SPOILER.md', _uebergabe: 'uebergabe.md' };
var UEBERGABE = 'uebergabe.md', STAND = 'stand.json';
function istAblage(sammlung, id) { return sammlung === 'sl' && /^_/.test(id); }
function pruefsumme(t) { return crypto.createHash('sha256').update(t, typeof t === 'string' ? 'utf8' : undefined).digest('hex'); }
function zahl(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function heute() { return new Date().toISOString().slice(0, 10); }
// Text so in <script type="text/plain"> stellen, dass kein </script> ihn vorzeitig schließt
function alsSkripttext(js) { return js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--'); }

function html(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function mitTitel(vorlage, alt, titel) {
  if (!titel) return vorlage;
  return vorlage.replace('<title>' + alt + '</title>', '<title>' + html(titel) + '</title>')
    .replace('<h1 id="titel">' + alt + '</h1>', '<h1 id="titel">' + html(titel) + '</h1>');
}
function seite(titel) {
  var vorlage = mitTitel(lies(path.join(__dirname, 'buch.html')), 'Spielerbuch', titel);
  var teile = { GLOSSAR_JS: 'glossar.js', KARTE_JS: 'karte.js', INVENTAR_JS: 'inventar.js', QUESTLOG_JS: 'questlog.js' };
  Object.keys(teile).forEach(function (k) {
    var marke = '/*' + k + '*/';
    if (vorlage.indexOf(marke) < 0) throw new Error('Platzhalter ' + marke + ' fehlt in seite/buch.html');
    vorlage = vorlage.split(marke).join(alsSkripttext(lies(path.join(WURZEL, teile[k]))));
  });
  vorlage = vorlage.replace('<!--SPRITE-->', lies(path.join(__dirname, 'ikonen.svg')).trim());
  return vorlage;
}
function ablageSeite(titel) { return mitTitel(lies(path.join(__dirname, 'ablage.html')), 'Ablage der Spielleitung', titel); }

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
function schreib(p, inhalt) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, inhalt); }
function alsJson(o) { return JSON.stringify(o, null, 1) + '\n'; }

/* ---------- Buch: Dokumente bündeln und Bündel lesen ---------- */

// Aus den Dateien der Spielleitung werden Dokumente {sammlung, id, daten}, wie das Buch sie vor 4.2 in der Datenbank hielt.
function dokumenteAus(dateien, opt) {
  var docs = [], figur = '', probleme = [], buch = !!(opt.titel || opt.stand || opt.stufe != null), ids = {};
  dateien.forEach(function (datei) {
    var text = lies(datei);
    // Spielleitungswissen (Spoilerdatei, Archiv, Wissensbuch) darf nie in eine Datei, die das Buch zeigt
    if (/^03_/.test(path.basename(datei)) || /^#\s+Archiv der Spielleitung/m.test(text) || /^##\s+Wer wei(ß|ss) was/m.test(text)) {
      probleme.push(datei + ': Spielleitungswissen. Archiv, Spoilerdatei und Wissensbuch gehören in die Ablage, nie ins Buch.'); return;
    }
    if (/^###\s+(Personen|Gruppen|Orte|Dinge|Gerüchte)\s*$/m.test(text) && /^-\s+\*\*/m.test(text)) {
      var g = glossar.ausText(text);
      if (g.probleme && g.probleme.length) probleme = probleme.concat(g.probleme.map(function (p) { return datei + ': ' + (p.text || p); }));
      glossar.alsDokumente(g.D).forEach(function (d) { docs.push(d); });
      figur = figur || g.D.figur || ''; buch = true;
      if (!opt.stand && g.D.stand) opt.stand = g.D.stand;
      if (opt.stufe == null && typeof g.D.stufe === 'number') opt.stufe = g.D.stufe;
      return;
    }
    var D = null;
    try { D = jsonAus(text, datei); } catch (e) { probleme.push(datei + ': json nicht lesbar (' + e.message + ')'); return; }
    if (D) {
      var id = D.orte || D.wege ? 'karte' : D.traeger ? 'gepaeck' : D.auftraege ? 'logbuch' : '';
      if (!id) { probleme.push(datei + ': weder Karte noch Gepäck noch Logbuch'); return; }
      docs.push({ sammlung: 'tische', id: id, daten: D }); buch = true;
      if (!figur && D.figur) figur = D.figur;
      return;
    }
    var g3 = abschnitte(text, 3);
    if (!g3.length) { probleme.push(datei + ': keine Abschnitte „### …“'); return; }
    // Die Geschichte hat die Überschrift „# Was bisher geschah“ oder nur Abschnitte „### Sitzung …“; sonst ist es die falsche Datei
    if (!/^#\s+Was bisher geschah/m.test(text) && g3.some(function (a) { return !/^Sitzung\b/i.test(a.titel); })) {
      probleme.push(datei + ': keine Geschichte (Überschrift „# Was bisher geschah“ oder Abschnitte „### Sitzung …“)'); return;
    }
    g3.forEach(function (a) {
      // Zwei Abschnitte mit derselben Überschrift bekämen dieselbe id; die zweite bekommt eine Nummer
      var gid = a.id, n = 2;
      while (ids[gid]) gid = a.id + '-' + n++;
      ids[gid] = true;
      docs.push({ sammlung: 'geschichte', id: gid, daten: { reihe: a.reihe, titel: a.titel, text: a.text } });
    });
  });
  if (buch) {
    var meta = { titel: opt.titel || ((figur ? figur + 's' : 'Das') + ' Buch'), stand: opt.stand || '', figur: figur };
    if (opt.stufe != null && !isNaN(opt.stufe)) meta.stufe = opt.stufe;
    docs.push({ sammlung: 'meta', id: 'buch', daten: meta });
  }
  return { docs: docs, probleme: probleme };
}
function nachReihe(a, b) { return ((a.daten || a).reihe || 0) - ((b.daten || b).reihe || 0); }
// Vier Dateien: meta (Objekt je id), glossar (Liste {id, daten}), tische (Objekt je Tisch), geschichte (Liste mit id)
function buendel(docs) {
  var aus = {}, von = function (s) { return docs.filter(function (d) { return d.sammlung === s; }); };
  if (von('meta').length) { aus.meta = {}; von('meta').forEach(function (d) { aus.meta[d.id] = d.daten; }); }
  if (von('glossar').length) aus.glossar = von('glossar').sort(nachReihe).map(function (d) { return { id: d.id, daten: d.daten }; });
  if (von('tische').length) { aus.tische = {}; von('tische').forEach(function (d) { aus.tische[d.id] = d.daten; }); }
  if (von('geschichte').length) {
    aus.geschichte = von('geschichte').sort(nachReihe).map(function (d, i) { return { id: d.id, reihe: i, titel: d.daten.titel, text: d.daten.text }; });
  }
  return aus;
}
var BUENDEL = ['meta', 'glossar', 'tische', 'geschichte'];
function schreibeBuendel(ordner, B) {
  var liste = [];
  BUENDEL.forEach(function (k) {
    if (B[k] === undefined) return;
    var p = path.resolve(ordner, 'daten', k + '.json');
    schreib(p, alsJson(B[k]));
    liste.push({ as: 'daten/' + k + '.json', path: p });
  });
  return liste;
}
function beschreibe(B) {
  var t = [];
  if (B.meta) t.push('meta.json');
  if (B.glossar) t.push('glossar.json (' + B.glossar.length + ' Einträge)');
  if (B.tische) t.push('tische.json (' + ['karte', 'gepaeck', 'logbuch'].filter(function (k) { return B.tische[k]; }).map(function (k) { return { karte: 'Karte', gepaeck: 'Gepäck', logbuch: 'Logbuch' }[k]; }).join(', ') + ')');
  if (B.geschichte) t.push('geschichte.json (' + B.geschichte.length + ' Abschnitte)');
  return t.join(', ');
}

function dateien(args) {
  var ordner = args.shift(), opt = { titel: '', stand: '', stufe: null }, eingabe = [];
  while (args.length) {
    var a = args.shift();
    if (a === '--stand') opt.stand = args.shift();
    else if (a === '--stufe') opt.stufe = +args.shift();
    else if (a === '--titel') opt.titel = args.shift();
    else eingabe.push(a);
  }
  var r = dokumenteAus(eingabe, opt);
  if (!r.docs.length && !r.probleme.length) r.probleme.push('keine Datei angegeben (02_glossar.md, 02_karte.json, 02_inventar.json, 02_questlog.json, 02_geschichte.md)');
  if (r.probleme.length) { console.error('Nicht geschrieben:\n  ' + r.probleme.join('\n  ')); process.exit(1); }
  var B = buendel(r.docs), liste = schreibeBuendel(ordner, B);
  process.stdout.write(JSON.stringify(liste) + '\n');
  var fehlen = B.tische ? ['karte', 'gepaeck', 'logbuch'].filter(function (k) { return !B.tische[k]; }) : [];
  console.error(liste.length + ' Dateien nach ' + path.join(ordner, 'daten') + ': ' + beschreibe(B) + '. Die Zeile auf stdout ist files für publish_files (slug des Spielerbuchs, base_version, mode patch).' +
    (fehlen.length ? ' Achtung: tische.json ersetzt alle Tische des Buchs; es fehlen ' + fehlen.join(', ') + '.' : ''));
}

function liesSammlung(ordner, name) {
  var d = path.join(ordner, name);
  if (!fs.existsSync(d) || !fs.statSync(d).isDirectory()) return [];
  return fs.readdirSync(d).filter(function (f) { return /\.json$/.test(f); }).map(function (f) {
    return { id: f.replace(/\.json$/, ''), daten: JSON.parse(lies(path.join(d, f))) };
  });
}
function istObjekt(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
// Ein Bündel am Inhalt erkennen: read_file speichert unter Namen, die der Client vergibt
function artVon(j, name) {
  if (Array.isArray(j)) {
    if (j.length && j.every(function (x) { return istObjekt(x) && typeof x.id === 'string' && istObjekt(x.daten); })) return 'glossar';
    if (j.length && j.every(function (x) { return istObjekt(x) && typeof x.titel === 'string' && typeof x.text === 'string'; })) return 'geschichte';
    if (!j.length) return /glossar/i.test(name) ? 'glossar' : /geschichte/i.test(name) ? 'geschichte' : '';
    return '';
  }
  if (!istObjekt(j)) return '';
  if (j.format === 'ablage-stand') return 'stand';
  if (['karte', 'gepaeck', 'logbuch'].some(function (k) { return istObjekt(j[k]); })) return 'tische';
  if (istObjekt(j.buch) || istObjekt(j.glossar)) return 'meta';
  return '';
}
// Liest die Dateien des Buchs aus <ordner> (und <ordner>/daten) oder, im alten Aufbau, die Sammlungen als Unterordner
function liesBuch(ordner) {
  var B = {}, uebergangen = [], alt = ['glossar', 'tische', 'geschichte', 'meta'].some(function (s) { return fs.existsSync(path.join(ordner, s)) && fs.statSync(path.join(ordner, s)).isDirectory(); });
  if (alt) {
    var docs = [];
    BUENDEL.forEach(function (s) { liesSammlung(ordner, s).forEach(function (d) { docs.push({ sammlung: s, id: d.id, daten: d.daten }); }); });
    return { B: buendel(docs), uebergangen: uebergangen, alt: true };
  }
  [ordner, path.join(ordner, 'daten')].forEach(function (d) {
    if (!fs.existsSync(d) || !fs.statSync(d).isDirectory()) return;
    fs.readdirSync(d).sort().forEach(function (f) {
      var p = path.join(d, f);
      if (!fs.statSync(p).isFile()) return;
      var j;
      try { j = JSON.parse(lies(p)); } catch (e) { return; }
      var art = artVon(j, f);
      if (!art || art === 'stand') return;
      if (B[art] !== undefined) { uebergangen.push(f + ' (zweites Bündel „' + art + '“)'); return; }
      B[art] = j;
    });
  });
  return { B: B, uebergangen: uebergangen, alt: false };
}
function alsMd(liste, kopf, ebene) {
  return kopf + '\n\n' + liste.map(function (x) { return ebene + ' ' + x.titel + '\n' + x.text + '\n'; }).join('\n');
}
function schreibeArbeitsdateien(B, ziel) {
  var aus = [];
  if (B.glossar && B.glossar.length) {
    var D = glossar.ausDokumenten((B.meta || {}).glossar || {}, B.glossar);
    schreib(path.join(ziel, '02_glossar.md'), glossar.alsText(D));
    aus.push('02_glossar.md (' + B.glossar.length + ' Einträge)');
  }
  var namen = { karte: '02_karte.json', gepaeck: '02_inventar.json', logbuch: '02_questlog.json' };
  Object.keys(namen).forEach(function (k) {
    if (!B.tische || !B.tische[k]) return;
    schreib(path.join(ziel, namen[k]), alsJson(B.tische[k]));
    aus.push(namen[k]);
  });
  if (B.geschichte && B.geschichte.length) {
    schreib(path.join(ziel, '02_geschichte.md'), alsMd(B.geschichte, '# Was bisher geschah', '###'));
    aus.push('02_geschichte.md (' + B.geschichte.length + ' Abschnitte)');
  }
  return aus;
}
function zurueck(ordner, ziel) {
  fs.mkdirSync(ziel, { recursive: true });
  var r = liesBuch(ordner), aus = schreibeArbeitsdateien(r.B, ziel);
  console.error('Geschrieben nach ' + ziel + ': ' + (aus.join(', ') || 'nichts') + (r.alt ? ' (alter Aufbau)' : '') +
    (r.uebergangen.length ? '. Übergangen: ' + r.uebergangen.join(', ') : '') +
    (r.alt && fs.existsSync(path.join(ordner, 'sl')) ? '. Die Sammlung sl zieht nur --umzug um.' : ''));
}

/* ---------- Ablage: Dateien einordnen, Stand schreiben, Liste für publish_files ---------- */

function alleDateien(ordner, unter) {
  var aus = [];
  fs.readdirSync(path.join(ordner, unter || '')).sort().forEach(function (f) {
    if (/^\./.test(f)) return;
    var rel = unter ? unter + '/' + f : f, st = fs.statSync(path.join(ordner, rel));
    if (st.isDirectory()) aus = aus.concat(alleDateien(ordner, rel));
    else if (st.isFile()) aus.push(rel);
  });
  return aus;
}
function istText(buf) { return buf.indexOf(0) < 0; }
function eintrag(buf) {
  var e = { sha256: pruefsumme(buf) };
  if (istText(buf)) e.zeichen = Array.from(buf.toString('utf8')).length;
  return e;
}
function liesStand(ordner) {
  var p = path.join(ordner, STAND);
  if (!fs.existsSync(p)) return null;
  var j = JSON.parse(lies(p));
  if (!istObjekt(j) || j.format !== 'ablage-stand' || !istObjekt(j.dateien)) throw new Error(p + ' ist kein Stand der Ablage');
  return j;
}
function sichererPfad(p) {
  return typeof p === 'string' && p.length > 0 && p.length < 200 && !/^[\/\\]/.test(p) && !/\\/.test(p) &&
    p.split('/').every(function (t) { return t && t !== '.' && t !== '..' && !/^\./.test(t); }) && p !== 'index.html';
}
function einordnen(args) {
  var ordner = args.shift(), genannt = [], rest = [], stand = null, standDatei = '';
  args.forEach(function (a) {
    var m = a.match(/^([^=]+)=(.+)$/);
    if (m && !fs.existsSync(a)) genannt.push({ pfad: m[1], datei: m[2] }); else rest.push(a);
  });
  // Der Stand ist die eine Datei, die sich als Stand der Ablage liest
  rest.forEach(function (d) {
    if (stand) return;
    var buf = fs.readFileSync(d);
    if (buf.length > 2 * 1024 * 1024 || !istText(buf)) return;
    try { var j = JSON.parse(buf.toString('utf8')); if (artVon(j, d) === 'stand' && istObjekt(j.dateien)) { stand = j; standDatei = d; } } catch (e) { /* kein json */ }
  });
  var probleme = [], gut = [], vonSumme = {};
  if (stand) Object.keys(stand.dateien).forEach(function (p) { vonSumme[stand.dateien[p].sha256] = vonSumme[stand.dateien[p].sha256] || []; vonSumme[stand.dateien[p].sha256].push(p); });
  genannt.forEach(function (g) {
    if (!sichererPfad(g.pfad)) { probleme.push(g.pfad + ': kein Pfad der Ablage'); return; }
    if (!fs.existsSync(g.datei)) { probleme.push(g.datei + ': gibt es nicht'); return; }
    var buf = fs.readFileSync(g.datei), soll = stand && stand.dateien[g.pfad];
    schreib(path.join(ordner, g.pfad), buf);
    gut.push(g.pfad + (soll ? (soll.sha256 === pruefsumme(buf) ? ' (Prüfsumme stimmt)' : ' (PRÜFSUMME STIMMT NICHT)') : ' (ohne Prüfsumme: der Stand kennt die Datei nicht)'));
    if (soll && soll.sha256 !== pruefsumme(buf)) probleme.push(g.pfad + ': Prüfsumme stimmt nicht mit dem Stand');
  });
  rest.forEach(function (d) {
    if (d === standDatei) return;
    if (!stand) { probleme.push(d + ': ohne stand.json nicht zuzuordnen (stand.json mitholen oder pfad=datei nennen)'); return; }
    var buf = fs.readFileSync(d), ziele = vonSumme[pruefsumme(buf)];
    if (!ziele) { probleme.push(path.basename(d) + ': keine Datei des Stands hat diese Prüfsumme (geändert seit dem Stand? dann pfad=datei nennen)'); return; }
    ziele.forEach(function (p) {
      if (!sichererPfad(p)) { probleme.push(p + ': kein Pfad der Ablage'); return; }
      schreib(path.join(ordner, p), buf); gut.push(p + ' (Prüfsumme stimmt)');
    });
  });
  if (stand) schreib(path.join(ordner, STAND), fs.readFileSync(standDatei));
  var da = {}; gut.forEach(function (g) { da[g.replace(/ \(.*$/, '')] = true; });
  var nichtGeholt = stand ? Object.keys(stand.dateien).filter(function (p) { return !da[p] && !fs.existsSync(path.join(ordner, p)); }).length : 0;
  console.error((stand ? 'Stand der Ablage: ' + [stand.sitzung, stand.geschrieben].filter(Boolean).join(', ') + '. ' : '') +
    'Eingeordnet nach ' + ordner + ': ' + (gut.join(', ') || 'nichts') + (nichtGeholt ? '. Nicht geholt: ' + nichtGeholt + (nichtGeholt === 1 ? ' Datei' : ' Dateien') + ' des Stands' : '') + '.' +
    (probleme.length ? '\nNicht eingeordnet:\n  ' + probleme.join('\n  ') : ''));
  if (probleme.length) process.exit(1);
}
// Schreibt stand.json neu und nennt, was zu veröffentlichen ist. entfernen: Pfade, die aus der Ablage verschwinden sollen.
function ablageStand(ordner, sitzung, entfernen) {
  var alt = liesStand(ordner) || { dateien: {} }, neu = {}, files = [], remove = [], zaehl = { neu: [], geaendert: [], gleich: 0, nichtGeholt: 0 };
  (entfernen || []).forEach(function (p) {
    var lokal = path.join(ordner, p);
    if (fs.existsSync(lokal)) fs.unlinkSync(lokal);
    if (alt.dateien[p]) remove.push(p);
  });
  var lokal = alleDateien(ordner).filter(function (p) { return p !== STAND && p !== 'index.html'; });
  lokal.forEach(function (p) {
    if (!sichererPfad(p)) throw new Error(p + ': kein Pfad der Ablage (keine Punktdateien, keine Rückstriche)');
    var buf = fs.readFileSync(path.join(ordner, p));
    if (buf.length > 20 * 1024 * 1024) throw new Error(p + ' ist zu groß für eine Datei (20 MiB)');
    neu[p] = eintrag(buf);
    if (!alt.dateien[p]) { zaehl.neu.push(p); files.push({ as: p, path: path.resolve(ordner, p) }); }
    else if (alt.dateien[p].sha256 !== neu[p].sha256) { zaehl.geaendert.push(p); files.push({ as: p, path: path.resolve(ordner, p) }); }
    else zaehl.gleich++;
  });
  Object.keys(alt.dateien).forEach(function (p) {
    if (neu[p] || remove.indexOf(p) >= 0) return;
    neu[p] = alt.dateien[p]; zaehl.nichtGeholt++;    // nicht geholt: bleibt, wie es in der Ablage liegt
  });
  var geordnet = {}; Object.keys(neu).sort().forEach(function (p) { geordnet[p] = neu[p]; });
  var aendert = files.length > 0 || remove.length > 0 || !fs.existsSync(path.join(ordner, STAND));
  if (aendert) {
    var stand = { format: 'ablage-stand', version: 1, sitzung: sitzung || alt.sitzung || '', geschrieben: heute(), dateien: geordnet };
    schreib(path.join(ordner, STAND), alsJson(stand));
    files.push({ as: STAND, path: path.resolve(ordner, STAND) });
  }
  return { files: files, remove: remove, zaehl: zaehl, aendert: aendert };
}
function ablage(args) {
  var ordner = args.shift(), sitzung = '', entfernen = [];
  while (args.length) {
    var a = args.shift();
    if (a === '--sitzung') sitzung = args.shift();
    else if (a === '--sitzungsende') entfernen.push(UEBERGABE);
    else if (a === '--entfernen') entfernen.push(args.shift());
    else { console.error('Unbekannt: ' + a + '. Der Ordner selbst sagt, was in der Ablage liegt; Dateien werden nicht einzeln genannt.'); process.exit(2); }
  }
  if (!fs.existsSync(ordner)) { console.error('Den Ordner ' + ordner + ' gibt es nicht.'); process.exit(2); }
  var r;
  try { r = ablageStand(ordner, sitzung, entfernen); } catch (e) { console.error('Nicht geschrieben: ' + e.message); process.exit(1); }
  process.stdout.write(JSON.stringify({ files: r.files, remove: r.remove }) + '\n');
  var z = r.zaehl;
  console.error(!r.aendert ? 'Nichts zu veröffentlichen: Der Ordner gleicht dem Stand.' :
    'Ablage: ' + z.geaendert.length + ' geändert' + (z.geaendert.length ? ' (' + z.geaendert.join(', ') + ')' : '') + ', ' + z.neu.length + ' neu' + (z.neu.length ? ' (' + z.neu.join(', ') + ')' : '') +
    ', ' + r.remove.length + ' entfernt' + (r.remove.length ? ' (' + r.remove.join(', ') + ')' : '') + ', ' + z.gleich + ' unverändert, ' + z.nichtGeholt + ' nicht geholt. ' +
    'Die Zeile auf stdout trägt files und remove für publish_files (slug der Ablage, base_version, mode patch). ' +
    'Was du nicht in dieser Sitzung selbst geschrieben hast, muss vor dem Veröffentlichen einmal ganz gelesen sein (Werkstatt 21.3).');
}

/* ---------- Umzug: Buch und Ablage aus der Datenbank von vor 4.2 ---------- */

// Kleiner zip-Leser (gespeichert oder deflate), ohne Fremdpakete
function entpacke(buf) {
  var ende = -1;
  for (var i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) if (buf.readUInt32LE(i) === 0x06054b50) { ende = i; break; }
  if (ende < 0) throw new Error('kein zip-Archiv');
  var n = buf.readUInt16LE(ende + 10), pos = buf.readUInt32LE(ende + 16), aus = [];
  for (var k = 0; k < n; k++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) throw new Error('zip-Verzeichnis beschädigt');
    var art = buf.readUInt16LE(pos + 10), gepackt = buf.readUInt32LE(pos + 20), nl = buf.readUInt16LE(pos + 28), el = buf.readUInt16LE(pos + 30), kl = buf.readUInt16LE(pos + 32), lokal = buf.readUInt32LE(pos + 42);
    var name = buf.slice(pos + 46, pos + 46 + nl).toString('utf8');
    pos += 46 + nl + el + kl;
    if (/\/$/.test(name)) continue;
    if (buf.readUInt32LE(lokal) !== 0x04034b50) throw new Error('zip-Eintrag beschädigt: ' + name);
    var start = lokal + 30 + buf.readUInt16LE(lokal + 26) + buf.readUInt16LE(lokal + 28), roh = buf.slice(start, start + gepackt);
    if (art !== 0 && art !== 8) throw new Error('zip-Eintrag mit unbekannter Packart: ' + name);
    aus.push({ name: name, daten: art === 0 ? roh : zlib.inflateRawSync(roh) });
  }
  return aus;
}
// Liest Paket oder Ordner als Dokumente {sammlung, id, daten}; fremd zählt, was nicht <sammlung>/<id>.json heißt
function liesAltbestand(quelle) {
  var docs = [], fremd = 0;
  if (fs.statSync(quelle).isDirectory()) {
    ['meta', 'glossar', 'tische', 'geschichte', 'sl'].forEach(function (s) { liesSammlung(quelle, s).forEach(function (d) { docs.push({ sammlung: s, id: d.id, daten: d.daten }); }); });
    return { docs: docs, fremd: 0 };
  }
  entpacke(fs.readFileSync(quelle)).forEach(function (e) {
    if (e.name === 'umzug.json') return;
    var m = e.name.match(/^(meta|glossar|tische|geschichte|sl)\/([^\/\\]+)\.json$/);
    if (!m) { fremd++; return; }
    docs.push({ sammlung: m[1], id: m[2], daten: JSON.parse(e.daten.toString('utf8')) });
  });
  return { docs: docs, fremd: fremd };
}
function sichererName(t) { return String(t).replace(/[^A-Za-z0-9_\-.äöüÄÖÜß]+/g, '-').replace(/^[-.]+|-+$/g, '').slice(0, 100); }
function umzug(quelle, ziel) {
  var alt = liesAltbestand(quelle), docs = alt.docs, meld = [], warn = [];
  if (alt.fremd) warn.push(alt.fremd + ' Einträge des Pakets heißen nicht <sammlung>/<id>.json und sind übergangen');
  if (!docs.length) { console.error('Nichts gefunden in ' + quelle + ' (erwartet: meta, glossar, tische, geschichte, sl als <sammlung>/<id>.json).'); process.exit(1); }
  // Buch
  var B = buendel(docs.filter(function (d) { return d.sammlung !== 'sl'; })), liste = schreibeBuendel(path.join(ziel, 'buch'), B);
  meld.push('Buch (' + liste.length + ' Dateien nach ' + path.join(ziel, 'buch', 'daten') + '): ' + (beschreibe(B) || 'leer'));
  // Ablage
  var abl = path.join(ziel, 'ablage'), zaehl = { buehnen: 0, profile: 0, archiv: 0, werkstatt: 0, sonst: 0 }, namen = {};
  fs.mkdirSync(abl, { recursive: true });
  function lege(pfad, inhalt) {
    if (!sichererPfad(pfad) || namen[pfad]) { warn.push('ein Dokument der Ablage ließ sich nicht ablegen (Name doppelt oder unbrauchbar)'); return false; }
    namen[pfad] = true; schreib(path.join(abl, pfad), inhalt); return true;
  }
  docs.filter(function (d) { return d.sammlung === 'sl'; }).sort(function (a, b) { return nachReihe(a, b) || (a.id < b.id ? -1 : 1); }).forEach(function (d) {
    var k = d.daten || {};
    if (!istAblage('sl', d.id)) {         // Archiv: je Abschnitt eine Datei, in der alten Reihenfolge
      zaehl.archiv++;
      lege('archiv/' + ('00' + zaehl.archiv).slice(-3) + '-' + sichererName(d.id) + '.md', '## ' + (k.titel || d.id) + '\n\n' + String(k.text || '').replace(/\s+$/, '') + '\n');
      return;
    }
    if (d.id === '_pruefsummen') return;    // ersetzt durch stand.json
    if (/^_buehne-/.test(d.id) || k.art === 'buehne') { if (lege('buehnen/' + sichererName(d.id.replace(/^_buehne-/, '')) + '.json', alsJson(k))) zaehl.buehnen++; return; }
    if (/^_profil-/.test(d.id) || k.art === 'profil') { if (lege('profile/' + sichererName(d.id.replace(/^_profil-/, '')) + '.json', alsJson(k))) zaehl.profile++; return; }
    if (typeof k.text === 'string') {
      var name = ABLAGE[d.id] || sichererName(k.datei || d.id.replace(/^_/, '') + '.md');
      if (k.art === 'werkstatt') { name = 'werkstatt/' + name; zaehl.werkstatt++; }
      if (!lege(name, k.text)) return;
      var teil = ABLAGE[d.id] || k.art !== 'werkstatt' ? name : 'eine Werkstatt-Übergabe';
      meld.push(teil + (k.sha256 ? ' (Prüfsumme ' + (k.sha256 === pruefsumme(k.text) ? 'stimmt' : 'STIMMT NICHT') + ')' : ' (ohne Prüfsumme)'));
      if (k.sha256 && k.sha256 !== pruefsumme(k.text)) warn.push(teil + ': Der Text gleicht seiner Prüfsumme nicht');
      return;
    }
    if (lege('sonstiges/' + sichererName(d.id.replace(/^_/, '')) + '.json', alsJson(k))) zaehl.sonst++;
  });
  var r = ablageStand(abl, 'Umzug', []);
  meld.push('Ablage (' + (r.files.length - 1) + ' Dateien nach ' + abl + ', dazu stand.json): ' + zaehl.archiv + ' Abschnitte Archiv, ' + zaehl.buehnen + ' Bühnen, ' + zaehl.profile + ' Profile' +
    (zaehl.werkstatt ? ', ' + zaehl.werkstatt + ' Werkstatt-Übergaben' : '') + (zaehl.sonst ? ', ' + zaehl.sonst + ' sonstige' : ''));
  console.error(meld.join('\n') + (warn.length ? '\nACHTUNG:\n  ' + warn.join('\n  ') : '') +
    '\nWeiter: beide Ordner prüfen (--zurueck ' + path.join(ziel, 'buch') + ' <ordner>, dann pruefen.js), die Seiten bauen (--seite, --ablage-seite) und veröffentlichen (Werkstatt 22.2).');
  if (warn.length) process.exit(1);
}

if (require.main === module) {
  var a = process.argv.slice(2), was = a.shift();
  if ((was === '--seite' || was === '--ablage-seite') && (a.length === 0 || (a.length === 2 && a[0] === '--titel'))) process.stdout.write(was === '--seite' ? seite(a[1]) : ablageSeite(a[1]));
  else if (was === '--dateien' && a.length >= 2) dateien(a);
  else if (was === '--zurueck' && a.length === 2) zurueck(a[0], a[1]);
  else if (was === '--einordnen' && a.length >= 2) einordnen(a);
  else if (was === '--ablage' && a.length >= 1) ablage(a);
  else if (was === '--umzug' && a.length === 2) umzug(a[0], a[1]);
  else {
    console.error('Aufruf: node seite/bauen.js --seite [--titel …] | --ablage-seite [--titel …] | --dateien <ordner> [--stand …] [--stufe n] [--titel …] <dateien …> | --zurueck <ordner> <zielordner> | ' +
      '--einordnen <ablage-ordner> <geholte dateien …> | --ablage <ablage-ordner> [--sitzung …] [--sitzungsende] [--entfernen <pfad>] | --umzug <paket.zip|db-ordner> <zielordner>' +
      (/^--(db|batches|kopie|uebergabe)$/.test(was || '') ? '\n' + was + ' gibt es seit Regelwerk 4.2 nicht mehr: Buch und Ablage liegen als Dateien vor (Werkstatt 4.7, 21.3, 21.4).' : ''));
    process.exit(2);
  }
}
module.exports = { seite: seite, ablageSeite: ablageSeite, abschnitte: abschnitte, slug: slug, zurueck: zurueck, buendel: buendel, liesBuch: liesBuch, artVon: artVon, entpacke: entpacke,
  ablageStand: ablageStand, istAblage: istAblage, pruefsumme: pruefsumme };
