// Prüft den Briefkasten der Chronikseite im Browser (Regelwerk 4.2, Werkstatt 18): Ein Chroniknachtrag legt Neues an,
// ersetzt mit `daten` die genannten Felder und hängt mit `anhaengen` einen Satz an, ohne zu überschreiben und nie doppelt.
// Erfundene Welt, eine Datenbank im Speicher. Braucht Playwright mit Chromium: node test/chronik-browser.test.js
'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path');
var chromium = require('playwright').chromium;
var seite = fs.readFileSync(path.join(__dirname, '..', 'seite', 'chronik.html'), 'utf8');
var n = 0;
function ok(name) { n++; console.log('ok  ' + name); }

// window.claude der Seite: db mit doc(pfad) und collection(name); update ersetzt die genannten Felder wie die echte Datenbank
function claudeStub(anfang) {
  var S = JSON.parse(JSON.stringify(anfang)), zaehler = 0;
  window.__db = S;
  function schnappschuss(p) { return { exists: Object.prototype.hasOwnProperty.call(S, p), id: p.split('/').pop(), data: function () { return S[p] === undefined ? undefined : JSON.parse(JSON.stringify(S[p])); } }; }
  var db = {
    doc: function (p) {
      return {
        get: function () { return Promise.resolve(schnappschuss(p)); },
        set: function (d) { S[p] = JSON.parse(JSON.stringify(d)); return Promise.resolve(); },
        update: function (d) { if (window.__sperre && p.indexOf('meta/') === 0) return Promise.reject({ code: 'invalid_argument' }); if (!S[p]) return Promise.reject({ code: 'not_found' }); Object.keys(d).forEach(function (k) { S[p][k] = JSON.parse(JSON.stringify(d[k])); }); return Promise.resolve(); },
        delete: function () { delete S[p]; return Promise.resolve(); }
      };
    },
    collection: function (name) {
      return {
        get: function () { return Promise.resolve({ docs: Object.keys(S).filter(function (k) { return k.indexOf(name + '/') === 0; }).map(schnappschuss) }); },
        doc: function () { return db.doc(name + '/auto' + (++zaehler)); }
      };
    }
  };
  window.claude = { use: function (was) { return Promise.resolve(was === 'db' ? db : null); } };
}
var ANFANG = {
  'meta/welt': { regelwerk_version: '4.2', aktualisiert: '2026-11-13', weltenhueter: 'Max' },
  'figuren/probefigur': { name: 'Probefigur', spieler: 'Spielername', status: 'aktiv', ruf: 'In Rohrdorf kennt man sie als die mit dem Stab.', gefolge: ['Graue Stute'], stand: { welttag: 2, ort: 'Rohrdorf' }, treue: 3 },
  'reviere/probe-revier': { name: 'Probe-Revier', inhaber: 'Probefigur' }
};

(async function () {
  var b = await chromium.launch();
  try {
    var ctx = await b.newContext({ viewport: { width: 420, height: 900 } });
    var pg = await ctx.newPage(), fehler = [];
    pg.on('pageerror', function (e) { fehler.push(String(e)); });
    await pg.route('https://fonts.googleapis.com/**', function (r) { r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
    await pg.route('https://fonts.gstatic.com/**', function (r) { r.fulfill({ status: 404, body: '' }); });
    await pg.route('https://chronik.test/**', function (r) { r.fulfill({ status: 200, contentType: 'text/html', body: seite }); });
    await pg.addInitScript(claudeStub, ANFANG);
    await pg.goto('https://chronik.test/');
    await pg.waitForFunction(function () { return /Verbunden/.test(document.getElementById('zustand').textContent); });
    assert.strictEqual(await pg.evaluate(function () { return document.compatMode; }), 'CSS1Compat', 'die Seite ist ein ganzes Dokument');
    ok('Seite lädt als ganzes Dokument und verbindet sich');

    async function reiche(nachtrag) {
      await pg.fill('#nachtrag-text', typeof nachtrag === 'string' ? nachtrag : JSON.stringify(nachtrag));
      await pg.evaluate(function () { document.getElementById('nachtrag-meldung').textContent = ''; });
      await pg.click('#reiche-ein');
      await pg.waitForFunction(function () { var t = document.getElementById('nachtrag-meldung').textContent; return t && !/^(Prüfe|Schreibe)/.test(t) && !document.getElementById('reiche-ein').disabled; });
      return { meldung: await pg.locator('#nachtrag-meldung').innerText(), db: await pg.evaluate(function () { return JSON.parse(JSON.stringify(window.__db)); }) };
    }
    var satz = 'In Mühlfurt heißt es, sie habe den Brand gelöscht.';
    var nachtrag = { figur: 'probefigur', stand: '13.11.2026', eintraege: [
      { sammlung: 'chronik', id: 'wt0003-muehlfurt-brand', daten: { welttag: 3, ort: 'Mühlfurt', art: 'ereignis', oeffentlich: 'Die Mühle brannte.', eingetragen: '2026-11-13' } },
      { sammlung: 'figuren', id: 'probefigur', daten: { stand: { welttag: 3, ort: 'Mühlfurt' }, aktualisiert: '2026-11-13' }, anhaengen: { ruf: satz, gefolge: 'Esel Bim' } },
      { sammlung: 'reviere', id: 'probe-revier', anhaengen: { oeffentlich: 'Die Mühle von Mühlfurt ist abgebrannt.' } },
      { sammlung: 'ruf', id: 'probefigur-muellerzunft', anhaengen: { oeffentlich: 'Die Müller schulden ihr etwas.' } }
    ] };
    var r = await reiche(nachtrag);
    assert.ok(/Eingetragen: 2 neu, 2 ergänzt/.test(r.meldung), r.meldung);
    assert.deepStrictEqual(r.db['chronik/wt0003-muehlfurt-brand'].ort, 'Mühlfurt');
    ok('Neues wird angelegt, Vorhandenes ergänzt');
    var f = r.db['figuren/probefigur'];
    assert.strictEqual(f.ruf, 'In Rohrdorf kennt man sie als die mit dem Stab. ' + satz, 'der Satz hängt hinten an');
    assert.deepStrictEqual(f.gefolge, ['Graue Stute', 'Esel Bim'], 'eine Liste bekommt ein Element');
    assert.deepStrictEqual(f.stand, { welttag: 3, ort: 'Mühlfurt' }, 'daten ersetzt das Feld ganz');
    assert.ok(f.name === 'Probefigur' && f.spieler === 'Spielername' && f.treue === 3, 'was nicht genannt ist, bleibt');
    ok('anhaengen hängt an Text und Liste an, daten ersetzt nur die genannten Felder');
    assert.strictEqual(r.db['reviere/probe-revier'].oeffentlich, 'Die Mühle von Mühlfurt ist abgebrannt.', 'ein leeres Feld bekommt den Satz');
    assert.strictEqual(r.db['ruf/probefigur-muellerzunft'].oeffentlich, 'Die Müller schulden ihr etwas.', 'ein neues Dokument auch');
    ok('anhaengen füllt ein leeres Feld und legt ein neues Dokument an');

    // derselbe Nachtrag noch einmal: nichts steht doppelt
    r = await reiche(nachtrag);
    assert.ok(/0 neu, 4 ergänzt/.test(r.meldung), r.meldung);
    assert.strictEqual(r.db['figuren/probefigur'].ruf, 'In Rohrdorf kennt man sie als die mit dem Stab. ' + satz);
    assert.deepStrictEqual(r.db['figuren/probefigur'].gefolge, ['Graue Stute', 'Esel Bim']);
    assert.strictEqual(r.db['reviere/probe-revier'].oeffentlich, 'Die Mühle von Mühlfurt ist abgebrannt.');
    ok('zweimal eingereicht: kein Satz steht doppelt');

    // was sich nicht anhängen lässt, wird gesagt
    r = await reiche({ figur: 'probefigur', eintraege: [{ sammlung: 'figuren', id: 'probefigur', anhaengen: { treue: 'vier' } }] });
    assert.ok(/lässt sich nichts anhängen/.test(r.meldung), r.meldung);
    assert.strictEqual(r.db['figuren/probefigur'].treue, 3);
    ok('anhaengen an eine Zahl wird abgelehnt, das Feld bleibt');

    // Prüfung vor dem Schreiben
    r = await reiche({ figur: 'probefigur', eintraege: [{ sammlung: 'chronik', id: 'wt0004-x', daten: { ort: 'Rohrdorf' } }, { sammlung: 'figuren', id: 'probefigur', daten: { ruf: 'neu' }, anhaengen: { ruf: 'dazu' } }] });
    assert.ok(/steht in daten und in anhaengen/.test(r.meldung), r.meldung);
    assert.strictEqual(r.db['chronik/wt0004-x'], undefined, 'bei einem Fehler in der Prüfung wird nichts geschrieben');
    r = await reiche({ figur: 'probefigur', eintraege: [{ sammlung: 'figuren', id: 'probefigur' }] });
    assert.ok(/daten oder anhaengen fehlt/.test(r.meldung), r.meldung);
    r = await reiche({ figur: 'probefigur', eintraege: [{ sammlung: 'figuren', id: 'probefigur', anhaengen: { ruf: '   ' } }] });
    assert.ok(/muss ein Text sein/.test(r.meldung), r.meldung);
    ok('fehlerhafte Einträge werden vor dem Schreiben abgelehnt');

    // der Weltnachtrag: meta/welt allein und nur mit daten
    r = await reiche({ figur: 'weltenhueter', eintraege: [{ sammlung: 'meta', id: 'welt', daten: { regelwerk_version: '4.3', tische_stand: 'abc123' } }] });
    assert.ok(/Eingetragen: 0 neu, 1 ergänzt/.test(r.meldung), r.meldung);
    assert.deepStrictEqual(r.db['meta/welt'], { regelwerk_version: '4.3', aktualisiert: '2026-11-13', weltenhueter: 'Max', tische_stand: 'abc123' });
    r = await reiche({ figur: 'probefigur', eintraege: [{ sammlung: 'meta', id: 'welt', daten: { regelwerk_version: '9' } }, { sammlung: 'figuren', id: 'probefigur', daten: { treue: 4 } }] });
    assert.ok(/meta ändert nur der Weltenhüter/.test(r.meldung), r.meldung);
    r = await reiche({ figur: 'probefigur', eintraege: [{ sammlung: 'meta', id: 'geheim', daten: { x: 1 } }] });
    assert.ok(/meta ändert nur der Weltenhüter/.test(r.meldung), r.meldung);
    r = await reiche({ figur: 'probefigur', eintraege: [{ sammlung: 'meta', id: 'welt', anhaengen: { regelwerk_version: '9' } }] });
    assert.ok(/meta ändert nur der Weltenhüter/.test(r.meldung), r.meldung);
    assert.strictEqual(r.db['meta/welt'].regelwerk_version, '4.3');
    assert.strictEqual(r.db['figuren/probefigur'].treue, 3);
    ok('Weltnachtrag: meta/welt geht allein und nur mit daten');
    // ohne Schreibrecht auf meta sagt die Seite, wer es darf
    await pg.evaluate(function () { window.__sperre = true; });
    r = await reiche({ figur: 'probefigur', eintraege: [{ sammlung: 'meta', id: 'welt', daten: { regelwerk_version: '9' } }] });
    assert.ok(/schreibt nur der Weltenhüter/.test(r.meldung), r.meldung);
    assert.strictEqual(r.db['meta/welt'].regelwerk_version, '4.3');
    await pg.evaluate(function () { window.__sperre = false; });
    ok('Weltnachtrag ohne Schreibrecht: klare Meldung, nichts geändert');

    // die Seite führt Buch über jeden Nachtrag
    assert.strictEqual(Object.keys(r.db).filter(function (k) { return k.indexOf('nachtraege/') === 0; }).length >= 1, true);
    assert.deepStrictEqual(fehler, []);
    ok('Nachträge sind vermerkt, keine Fehler in der Seite');
  } finally { await b.close(); }
  console.log(n + ' Prüfungen bestanden.');
})().catch(function (e) { console.error(e); process.exit(1); });
