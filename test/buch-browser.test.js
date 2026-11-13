// Prüft das Spielerbuch 2.0 im Browser (Regelwerk 4.2): Seiten aus den Dateien des Artefakts, Altbestand aus der Datenbank,
// Umzugspaket für den Besitzer und sein Weg durch --umzug. Erfundene Mini-Welt, keine privaten Dateien.
// Braucht Playwright mit Chromium: node test/buch-browser.test.js
'use strict';
var assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
var chromium = require('playwright').chromium;
var bauenPfad = path.join(__dirname, '..', 'seite', 'bauen.js'), bauen = require(bauenPfad);
var n = 0;
function ok(name) { n++; console.log('ok  ' + name); }
var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'buch-browser-'));
function schreib(name, text) { var p = path.join(dir, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); return p; }
function lese(p) { return fs.readFileSync(p, 'utf8'); }
function sha(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }
function lauf(args) { return cp.spawnSync(process.execPath, [bauenPfad].concat(args), { encoding: 'utf8', maxBuffer: 1 << 26 }); }

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
var karte = schreib('02_karte.json', JSON.stringify({ titel: 'Probekarte', stand: 'Stand: Tag 3', orte: [{ id: 'eiche', name: 'Zur Alten Eiche', x: 7, y: 2, art: 'gasthaus', bekannt: 'gesehen' }, { id: 'muehlfurt', name: 'Mühlfurt', x: 4, y: 2, art: 'dorf', bekannt: 'gesehen' }], wege: [] }));
var gepaeck = schreib('02_inventar.json', JSON.stringify({ titel: 'Gepäck', stand: 'Stand: Tag 3', traeger: [{ id: 'selbst', name: 'Probefigur', art: 'figur', dinge: [{ name: 'Wanderstab', art: 'werkzeug', kg: 1 }] }] }));
var logbuch = schreib('02_questlog.json', JSON.stringify({ titel: 'Logbuch', stand: 'Stand: Tag 3', auftraege: [{ id: 'brief', titel: 'Der Brief des Vogts', status: 'offen' }] }));
var ges = schreib('02_geschichte.md', '# Was bisher geschah\n\n### Sitzung 1, Tag 1\n- Aufbruch in der Hafenstadt.\n\n### Sitzung 2, Tag 2\n- Bodo schenkt **dünnes** Bier aus.\n');
var buch = path.join(dir, 'buch');
var r = lauf(['--dateien', buch, gl, karte, gepaeck, logbuch, ges, '--stufe', '1']);
assert.strictEqual(r.status, 0, r.stderr);
var D = {};
['meta', 'glossar', 'tische', 'geschichte'].forEach(function (k) { D[k] = lese(path.join(buch, 'daten', k + '.json')); });
var seite = bauen.seite('Probefigurs Buch');

// Dieselben Daten als Datenbank von vor 4.2, dazu die Ablage in sl
var meta = JSON.parse(D.meta), gB = JSON.parse(D.glossar), tB = JSON.parse(D.tische), geB = JSON.parse(D.geschichte);
var standText = '# Spielstand Probefigur\n\n## Jetzt\nTag 3, Abend, in der Alten Eiche.\n', spoilText = '# Spoiler\n\n## Wahrheit\nDer Wirt lügt. Äöüß ✦ 🎭\n';
function kopie(datei, text) { return { datei: datei, text: text, zeichen: Array.from(text).length, sha256: crypto.createHash('sha256').update(text, 'utf8').digest('hex'), geschrieben: '2026-11-01' }; }
var SAMMLUNGEN = { meta: meta, glossar: {}, tische: tB, geschichte: {}, sl: {
  _spielstand: kopie('02_spielstand.md', standText), _spoiler: kopie('03_spielleitung_SPOILER.md', spoilText),
  '_buehne-keller': { id: 'keller', art: 'buehne', ort: 'eiche', gelaende: 'gewoelbe', boden: ['....'] },
  'wuerfelprotokoll-sitzung-1': { reihe: 101, titel: 'Würfelprotokoll Sitzung 1', text: 'Wahrnehmung 13.' } } };
gB.forEach(function (d) { SAMMLUNGEN.glossar[d.id] = d.daten; });
geB.forEach(function (d) { SAMMLUNGEN.geschichte[d.id] = { reihe: d.reihe, titel: d.titel, text: d.text }; });

// window.claude der Seite: Datenbank (collection, orderBy, limit, onSnapshot, get) und downloads, das die Datei festhält
function claudeStub(arg) {
  var S = arg.sammlungen;
  function schnappschuss(name, ordnung) {
    var d = S[name] || {}, docs = Object.keys(d).map(function (id) { return { id: id, exists: true, data: function () { return JSON.parse(JSON.stringify(d[id])); } }; });
    if (ordnung) docs = docs.filter(function (x) { return x.data()[ordnung] !== undefined; }).sort(function (a, b) { return a.data()[ordnung] - b.data()[ordnung]; });
    return { docs: docs };
  }
  function sammlung(name) {
    var ordnung = '', verboten = name === 'sl' && !arg.darfSl, q = {
      orderBy: function (f) { ordnung = f; return q; }, limit: function () { return q; },
      onSnapshot: function (cb, err) { setTimeout(function () { if (verboten) err({ code: 'permission_denied' }); else cb(schnappschuss(name, ordnung)); }, 0); },
      get: function () { return verboten ? Promise.reject({ code: 'permission_denied' }) : Promise.resolve(schnappschuss(name, ordnung)); }
    };
    return q;
  }
  window.__gespeichert = null;
  var teile = { db: { collection: sammlung }, downloads: !arg.downloads ? null : { save: function (anfrage) {
    if (arg.ablehnen) return Promise.reject({ code: 'declined' });
    return anfrage.data.arrayBuffer().then(function (b) {
      var u = new Uint8Array(b), s = '', i;
      for (i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
      window.__gespeichert = { filename: anfrage.filename, b64: btoa(s) };
      return { status: 'saved' };
    });
  } } };
  window.claude = { use: function (name) { return Promise.resolve(teile[name] || null); } };
}

async function oeffne(ctx, opt) {
  var pg = await ctx.newPage(), fehler = [];
  pg.on('pageerror', function (e) { fehler.push(String(e)); });
  await pg.route('https://fonts.googleapis.com/**', function (r) { r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
  await pg.route('https://buch.test/**', function (r) {
    var p = new URL(r.request().url()).pathname, m = p.match(/^\/daten\/([a-z]+)\.json$/);
    if (p === '/' || p === '/index.html') return r.fulfill({ status: 200, contentType: 'text/html', body: seite });
    if (m && opt.dateien && opt.dateien[m[1]] !== undefined) return r.fulfill({ status: 200, contentType: 'application/json', body: opt.dateien[m[1]] });
    return r.fulfill({ status: 404, contentType: 'text/plain', body: 'nicht da' });
  });
  if (opt.claude) await pg.addInitScript(claudeStub, opt.claude);
  await pg.goto('https://buch.test/' + (opt.hash || ''));
  pg.fehler = fehler;
  return pg;
}
function text(pg, sel) { return pg.locator(sel).innerText(); }

(async function () {
  var b = await chromium.launch();
  try {
    var ctx = await b.newContext({ viewport: { width: 420, height: 900 } });

    // 1 Seiten aus Dateien
    var p1 = await oeffne(ctx, { dateien: D });
    await p1.waitForFunction(function () { return /Stufe 1/.test(document.getElementById('stand').textContent); });
    assert.strictEqual(await text(p1, '#stand'), 'Stand: Tag 3 · Stufe 1');
    assert.strictEqual(await p1.title(), 'Probefigurs Buch');
    assert.ok(/Bodo/.test(await text(p1, '#glossar')) && /Zur Alten Eiche/.test(await text(p1, '#glossar')), 'Glossar steht');
    ok('Dateien: Kopf und Glossar');
    await p1.click('#t-geschichte');
    assert.ok(/Sitzung 2, Tag 2/.test(await text(p1, '#geschichte')) && /Bodo schenkt dünnes Bier aus/.test(await text(p1, '#geschichte')));
    assert.strictEqual(await p1.locator('#geschichte strong').count(), 1, 'fett bleibt fett');
    ok('Dateien: Geschichte');
    await p1.click('#t-karte');
    await p1.waitForFunction(function () { return document.querySelector('#karte svg') !== null; });
    await p1.click('#t-gepaeck');
    await p1.waitForFunction(function () { return /Wanderstab/.test(document.getElementById('gepaeck').textContent); });
    await p1.click('#t-logbuch');
    await p1.waitForFunction(function () { return /Der Brief des Vogts/.test(document.getElementById('logbuch').textContent); });
    ok('Dateien: Karte, Gepäck und Logbuch zeichnen');
    assert.strictEqual(await p1.locator('#umzug').isHidden(), true, 'kein Umzug, wo schon Dateien liegen');
    assert.deepStrictEqual(p1.fehler, []);
    ok('Dateien: kein Umzugskasten, keine Fehler');
    await p1.close();

    // 1b „Stand der Dinge“ (Regelwerk 21.1): eigene Gruppe „Nachschlagen“ nach der Erzählung, nie von selbst offen
    var gesN = JSON.stringify([{ id: 'stand-3', reihe: 0, titel: 'Stand der Dinge nach Sitzung 3 (Welttag 3)', text: '#### Karte\n- Die Furt führt Hochwasser.\n##### Offene Aufträge\n- **Der Brief** des Vogts.' }]
      .concat(geB.map(function (d, i) { return { id: d.id, reihe: i + 1, titel: d.titel, text: d.text }; })));
    var pN = await oeffne(ctx, { dateien: { meta: D.meta, glossar: D.glossar, tische: D.tische, geschichte: gesN }, hash: '#geschichte' });
    await pN.waitForFunction(function () { return document.querySelectorAll('#geschichte details').length === 3; });
    var bild = await pN.evaluate(function () {
      var el = document.getElementById('geschichte');
      return {
        kinder: Array.prototype.map.call(el.children, function (c) { return c.tagName === 'DETAILS' ? (c.open ? 'offen:' : 'zu:') + c.querySelector('summary').textContent : c.id || c.tagName; }),
        h4: Array.prototype.map.call(el.querySelectorAll('h4, h5'), function (h) { return h.tagName + ' ' + h.textContent; }), roh: /#/.test(el.textContent),
        gruppe: el.querySelector('#nachschlagen h3').textContent
      };
    });
    assert.deepStrictEqual(bild.kinder, ['zu:Sitzung 1, Tag 1', 'offen:Sitzung 2, Tag 2', 'nachschlagen', 'zu:Stand der Dinge nach Sitzung 3 (Welttag 3)']);
    assert.deepStrictEqual(bild.h4, ['H4 Karte', 'H5 Offene Aufträge']);
    assert.strictEqual(bild.roh, false, 'keine rohen Überschriftenzeichen');
    assert.strictEqual(bild.gruppe, 'Nachschlagen');
    assert.deepStrictEqual(pN.fehler, []);
    ok('Dateien: „Stand der Dinge“ steht unter „Nachschlagen“ und bleibt zu; Überschriften im Text sind Zwischenzeilen');
    await pN.close();

    // 2 Anker in der Adresse; fehlende Dateien heißen „noch leer“
    var p2 = await oeffne(ctx, { dateien: { meta: D.meta, glossar: D.glossar }, hash: '#geschichte' });
    await p2.waitForFunction(function () { return /Noch nichts erzählt/.test(document.getElementById('geschichte').textContent); });
    assert.strictEqual(await p2.locator('#t-geschichte').getAttribute('aria-selected'), 'true');
    await p2.click('#t-karte');
    assert.ok(/Noch leer/.test(await text(p2, '#karte')));
    assert.deepStrictEqual(p2.fehler, []);
    ok('Dateien: Anker öffnet den Teil, fehlende Dateien sind leer');
    await p2.close();

    // 3 eine beschädigte Datei wird gemeldet, nicht still übergangen
    var p3 = await oeffne(ctx, { dateien: { meta: '{"buch": ' }, claude: { sammlungen: SAMMLUNGEN, darfSl: true, downloads: true } });
    await p3.waitForFunction(function () { return /ließ sich nicht holen/.test(document.getElementById('stand').textContent); });
    assert.ok(/json daten\/meta\.json/.test(await text(p3, '#stand')));
    assert.strictEqual(await p3.locator('#umzug').isHidden(), true);
    ok('Dateien: beschädigte meta.json wird gemeldet, kein Rückfall auf die Datenbank');
    await p3.close();

    // 4 Altbestand: keine Dateien, die Seite liest die Datenbank und bietet dem Besitzer den Umzug an
    var p4 = await oeffne(ctx, { claude: { sammlungen: SAMMLUNGEN, darfSl: true, downloads: true } });
    await p4.waitForFunction(function () { return /Stufe 1/.test(document.getElementById('stand').textContent) && /Bodo/.test(document.getElementById('glossar').textContent); });
    await p4.waitForFunction(function () { return !document.getElementById('umzug').hidden; });
    ok('Datenbank: das Buch steht, der Umzugskasten erscheint');
    await p4.click('#umzug-knopf');
    await p4.waitForFunction(function () { return window.__gespeichert !== null; });
    var g = await p4.evaluate(function () { return window.__gespeichert; });
    assert.strictEqual(g.filename, 'spielerbuch-umzug.zip');
    assert.ok(/Gespeichert/.test(await text(p4, '#umzug-meldung')));
    var paket = path.join(dir, 'spielerbuch-umzug.zip');
    fs.writeFileSync(paket, Buffer.from(g.b64, 'base64'));
    assert.deepStrictEqual(p4.fehler, []);
    ok('Datenbank: Umzugspaket gespeichert');
    await p4.close();

    // das Paket ist ein gültiges zip (Prüfsummen), und --umzug macht daraus dasselbe Buch und die Ablage
    var py = cp.spawnSync('python3', ['-I', '-c', 'import zipfile,sys\nz=zipfile.ZipFile(sys.argv[1])\nassert z.testzip() is None\nprint(len(z.namelist()))', paket], { encoding: 'utf8' });
    if (py.error) console.log('    (python3 fehlt: zip nur mit dem eigenen Leser geprüft)');
    else { assert.strictEqual(py.status, 0, py.stderr); assert.strictEqual(py.stdout.trim(), String(1 + 2 + gB.length + 3 + geB.length + 4)); ok('Paket: gültiges zip mit allen Dokumenten'); }
    var um = path.join(dir, 'umzug');
    r = lauf(['--umzug', paket, um]);
    assert.strictEqual(r.status, 0, r.stderr);
    ['meta', 'glossar', 'tische', 'geschichte'].forEach(function (k) { assert.strictEqual(sha(path.join(um, 'buch', 'daten', k + '.json')), sha(path.join(buch, 'daten', k + '.json')), k + '.json gleicht dem Buch aus Dateien'); });
    assert.strictEqual(lese(path.join(um, 'ablage', '02_spielstand.md')), standText);
    assert.strictEqual(lese(path.join(um, 'ablage', '03_spielleitung_SPOILER.md')), spoilText);
    assert.strictEqual(JSON.parse(lese(path.join(um, 'ablage', 'buehnen', 'keller.json'))).gelaende, 'gewoelbe');
    assert.ok(fs.existsSync(path.join(um, 'ablage', 'archiv', '001-wuerfelprotokoll-sitzung-1.md')) && fs.existsSync(path.join(um, 'ablage', 'stand.json')));
    assert.ok(/Prüfsumme stimmt/.test(r.stderr) && r.stderr.indexOf('Der Wirt lügt') < 0);
    ok('Paket: --umzug ergibt dasselbe Buch und die Ablage, Zeichen für Zeichen');

    // 5 umgezogen: dieselbe Seite zeigt jetzt die Dateien aus dem Umzug
    var Du = {};
    ['meta', 'glossar', 'tische', 'geschichte'].forEach(function (k) { Du[k] = lese(path.join(um, 'buch', 'daten', k + '.json')); });
    var p5 = await oeffne(ctx, { dateien: Du, claude: { sammlungen: SAMMLUNGEN, darfSl: true, downloads: true } });
    await p5.waitForFunction(function () { return /Bodo/.test(document.getElementById('glossar').textContent); });
    assert.strictEqual(await p5.locator('#umzug').isHidden(), true);
    ok('nach dem Umzug: Seiten aus Dateien, kein Umzugskasten mehr');
    await p5.close();

    // 6 wer die Ablage nicht lesen darf, sieht das Buch, aber keinen Umzug
    var p6 = await oeffne(ctx, { claude: { sammlungen: SAMMLUNGEN, darfSl: false, downloads: true } });
    await p6.waitForFunction(function () { return /Bodo/.test(document.getElementById('glossar').textContent); });
    await p6.waitForTimeout(150);
    assert.strictEqual(await p6.locator('#umzug').isHidden(), true);
    assert.deepStrictEqual(p6.fehler, []);
    ok('Datenbank: Betrachter sehen keinen Umzugskasten');
    await p6.close();

    // 7 abgelehntes Speichern und fehlendes downloads werden gesagt
    var p7 = await oeffne(ctx, { claude: { sammlungen: SAMMLUNGEN, darfSl: true, downloads: true, ablehnen: true } });
    await p7.waitForFunction(function () { return !document.getElementById('umzug').hidden; });
    await p7.click('#umzug-knopf');
    await p7.waitForFunction(function () { return /abgebrochen/.test(document.getElementById('umzug-meldung').textContent); });
    assert.strictEqual(await p7.locator('#umzug-knopf').isDisabled(), false);
    await p7.close();
    var p8 = await oeffne(ctx, { claude: { sammlungen: SAMMLUNGEN, darfSl: true, downloads: false } });
    await p8.waitForFunction(function () { return !document.getElementById('umzug').hidden; });
    await p8.click('#umzug-knopf');
    await p8.waitForFunction(function () { return /lässt sich nichts speichern/.test(document.getElementById('umzug-meldung').textContent); });
    ok('Datenbank: Abbruch und fehlendes Speichern werden gemeldet');
    await p8.close();

    // 8 weder Dateien noch Datenbank
    var p9 = await oeffne(ctx, {});
    await p9.waitForFunction(function () { return /noch keine Seiten/.test(document.getElementById('stand').textContent); });
    assert.deepStrictEqual(p9.fehler, []);
    ok('leeres Buch: sagt, dass die Seiten noch fehlen');
    await p9.close();
  } finally { await b.close(); }
  console.log(n + ' Prüfungen bestanden.');
})().catch(function (e) { console.error(e); process.exit(1); });
