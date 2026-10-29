// Lädt die Kampfkarte (kampf.js) mit dem Aufruf aus Regelwerk 4.2 in Chromium und prüft Raster, Erreichbarkeit,
// Weg, Ziel und Nachricht. Erfundene Welt (test/kampf-beispiel.js), keine Daten einer echten Figur.
// Braucht Playwright mit Chromium: node test/kampf.test.js
'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path');
var chromium = require('playwright').chromium;
var code = fs.readFileSync(path.join(__dirname, '..', 'kampf.js'), 'utf8');
var KAMPF = require('./kampf-beispiel.js');
var kampf = require('../kampf.js');
var n = 0;
function ok(name) { n++; console.log('ok  ' + name); }

function aufruf(daten) {
  return '<h2 class="sr-only">Kampfkarte: ' + daten.titel + '</h2>\n' +
    '<div id="kampf">Kampfkarte lädt … Falls nicht, frag nach der Lage als Text.</div>\n' +
    '<script>var KAMPF=' + JSON.stringify(daten) + '</script>\n' +
    '<script>var s=document.createElement(\'script\');s.src=\'https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/kampf.js\';document.head.appendChild(s);</script>';
}

async function seite(b, daten, opt) {
  var pg = await b.newPage({ viewport: { width: 380, height: 900 } }), fehler = [];
  pg.on('pageerror', function (e) { fehler.push(String(e)); });
  await pg.route('https://cdn.jsdelivr.net/**', function (r) { r.fulfill({ status: 200, contentType: 'application/javascript', body: code }); });
  await pg.route('https://fonts.googleapis.com/**', function (r) { r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
  var stub = opt && opt.ohnePrompt ? '' : '<script>window.GESENDET=[];window.sendPrompt=function(t){GESENDET.push(t)}</script>';
  await pg.setContent('<!doctype html><meta charset="utf-8">' + stub + aufruf(daten));
  await pg.waitForSelector('#kampf svg');
  pg.fehler = fehler;
  return pg;
}
function klickFeld(pg, x, y) {
  return pg.evaluate(function (p) { document.querySelector('g.kkF[data-x="' + p[0] + '"][data-y="' + p[1] + '"] rect.kkK').dispatchEvent(new MouseEvent('click', { bubbles: true })); }, [x, y]);
}
function klickWesen(pg, i) {
  return pg.evaluate(function (i) { document.querySelector('g.kkO[data-w="' + i + '"] circle.kkTok').dispatchEvent(new MouseEvent('click', { bubbles: true })); }, i);
}

// Rechnung ohne Browser
(function () {
  var K = kampf.lies(KAMPF), W = kampf.wege(K, K.figur);
  assert.strictEqual(K.figur.name, 'Probefigur');
  assert.strictEqual(W.dist['4,5'], 0);
  assert.strictEqual(W.dist['7,3'], 3, 'diagonal zählt wie gerade');
  assert.strictEqual(W.dist['16,5'], 13, 'schwieriges Gelände zählt doppelt');
  assert.strictEqual(W.dist['14,3'], undefined, 'durch einen Gegner geht es nicht');
  assert.strictEqual(W.dist['3,6'], 1, 'zahmes Tier lässt durch');
  assert.strictEqual(W.dist['1,1'], undefined, 'Wand');
  assert.strictEqual(kampf.feldName(KAMPF, 14, 3), '14/C');
  assert.strictEqual(kampf.abstand({ x: 4, y: 5, groesse: 1 }, K.wesen[5]), 22, 'Abstand zum Bären, Kante zu Kante');
  ok('Wege und Abstände');
})();

(async function () {
  var b = await chromium.launch();
  try {
    var pg = await seite(b, KAMPF);
    assert.strictEqual(await pg.locator('#kampf g.kkF').count(), 36 * 12);
    assert.strictEqual(await pg.locator('#kampf g.kkO').count(), 7);
    assert.ok((await pg.locator('#kampf g.kkF.kkEr').count()) > 20, 'erreichbare Felder markiert');
    assert.ok((await pg.locator('#kampf g.kkF.kkSp').count()) > 5, 'Spurtfelder markiert');
    var breite = await pg.evaluate(function () { return parseInt(document.querySelector('#kampf svg').style.width, 10); });
    assert.ok(breite > 600, 'auf dem Handy vergrößert und scrollbar: ' + breite);
    ok('Raster, Wesen, Markierung');

    await klickFeld(pg, 7, 3);
    assert.ok(/nach 7\/C · 4,5 m/.test(await pg.innerText('#kampf .kkI')), 'Weg und Entfernung');
    assert.ok(await pg.locator('#kampf .kkWeg path').count() === 1, 'Weg gezeichnet');
    await klickWesen(pg, 3);
    assert.ok(/Ziel: Räuber 1 · 10,5 m · verwundet/.test(await pg.innerText('#kampf .kkI')), 'Ziel mit Entfernung');
    await pg.fill('#kampf input', 'Starry Wisp auf ihn');
    await pg.click('#kampf button[data-k="zug"]');
    var g = await pg.evaluate(function () { return GESENDET; });
    assert.deepStrictEqual(g, ['Kampf #7 · Probefigur nach 7/C · 4,5 m · Ziel: Räuber 1 (10,5 m) · Starry Wisp auf ihn']);
    ok('Zug abgeschickt');

    var pg2 = await seite(b, KAMPF, { ohnePrompt: true });
    await klickFeld(pg2, 30, 7);
    assert.ok(/so weit kommst du in einem Zug nicht/.test(await pg2.innerText('#kampf .kkI')), 'zu weit');
    await klickFeld(pg2, 11, 10);
    assert.ok(/Spurt/.test(await pg2.innerText('#kampf .kkI')), 'mit Spurt');
    await klickFeld(pg2, 14, 3);
    assert.ok(/Da steht schon jemand/.test(await pg2.innerText('#kampf .kkI')), 'besetztes Feld');
    await pg2.click('#kampf button[data-k="bleib"]');
    assert.ok(/Schreib das in den Chat: Kampf #7 · Probefigur bleibt auf 4\/E/.test(await pg2.innerText('#kampf .kkI')), 'ohne sendPrompt');
    await pg2.click('#kampf button[data-k="leg"]');
    assert.ok((await pg2.locator('#kampf .kkL span').count()) >= 15, 'Legende');
    ok('Grenzen, Spurt, ohne sendPrompt');

    var pg3 = await seite(b, { nr: 1, titel: 'Leer', wesen: [{ id: 'r', name: 'Räuber', art: 'gegner', x: 2, y: 2 }] });
    assert.ok(/Die Figur steht nicht auf der Karte/.test(await pg3.innerText('#kampf .kkI')), 'ohne Figur');
    assert.strictEqual(await pg3.locator('#kampf rect.kkN').count(), 0, 'ohne boden ist alles Boden');
    ok('ohne Figur');

    assert.deepStrictEqual(pg.fehler.concat(pg2.fehler, pg3.fehler), [], 'keine Fehler im Browser');
    ok('keine Fehler');
    console.log('\n' + n + ' Prüfungen bestanden.');
  } finally { await b.close(); }
})().catch(function (e) { console.error(e); process.exit(1); });
