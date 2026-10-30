// Lädt die Kampfkarte (kampf.js) mit dem Aufruf aus Regelwerk 4.2 in Chromium und prüft Raster, Erreichbarkeit,
// Weg, Ziel, Höhe und Nachricht. Erfundene Welt (test/kampf-beispiel.js, test/kampf-hoehe-beispiel.js), keine Daten
// einer echten Figur.
// Braucht Playwright mit Chromium: node test/kampf.test.js
'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path');
var chromium = require('playwright').chromium;
var code = fs.readFileSync(path.join(__dirname, '..', 'kampf.js'), 'utf8');
var KAMPF = require('./kampf-beispiel.js');
var HOEHE = require('./kampf-hoehe-beispiel.js');
var STUFEA = require('./kampf-stufe-a-beispiel.js');
var DREI = require('./kampf-1-3-beispiel.js');
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
  assert.strictEqual(kampf.hoehe(K, 6, 7), 1, '^ ohne hoehe ist Ebene 1');
  assert.strictEqual(W.dist['6,7'], 3, 'auf ein ^ hinauf kostet ein Feld extra');
  ok('Wege und Abstände');

  // Höhe: Terrasse (Ebene 2), Geröllrampe (b), Treppe (c, b), Brustwehr
  var H = kampf.lies(HOEHE), WH = kampf.wege(H, H.figur);
  assert.strictEqual(kampf.hoehe(H, 15, 5), 2, 'Terrasse auf Ebene 2');
  assert.strictEqual(kampf.hoehe(H, 10, 4), 1, 'Rampe b ist Ebene 1');
  assert.strictEqual(WH.dist['18,8'], 3, 'bis unter die Kante drei Felder');
  assert.strictEqual(WH.dist['18,6'], 8, 'über die Brustwehr hinauf: 4 Felder bis unter die Kante, dann 2 (Deckung) + 2 (zwei Ebenen)');
  assert.strictEqual(WH.dist['27,7'], 9, 'die Treppe hinauf kostet nichts extra');
  assert.strictEqual(WH.dist['27,6'], 10, 'oberste Stufe');
  assert.deepStrictEqual(kampf.pfadHoehe(H, kampf.pfad(WH, 27, 6)), { klettern: 0, sprung: 0 }, 'über die Treppe wird nicht geklettert');
  assert.strictEqual(WH.dist['11,5'], 10, 'auf die Geröllrampe: Geröll doppelt, Ebene frei');
  assert.deepStrictEqual(kampf.pfadHoehe(H, kampf.pfad(WH, 12, 5)), { klettern: 2, sprung: 0 }, 'der kürzeste Weg nach 12/E klettert die Mauer');
  assert.strictEqual(kampf.abstand({ x: 15, y: 7, groesse: 1 }, H.wesen[2], H), 2, 'unter der Kante: zwei Felder waagerecht, zwei Ebenen: 3 m');
  assert.strictEqual(kampf.abstand({ x: 15, y: 8, groesse: 1 }, H.wesen[2], H), 3, 'ein Feld weiter unten zählt wieder das Waagerechte');
  assert.strictEqual(kampf.abstand({ x: 15, y: 6, groesse: 1 }, H.wesen[2], H), 1, 'auf der Brustwehr, gleiche Ebene: ein Feld');
  assert.strictEqual(kampf.abstand(H.figur, H.wesen[2]), 6, 'ohne Karte wie bisher flach');
  var oben = kampf.lies({ boden: HOEHE.boden, hoehe: HOEHE.hoehe, wesen: [{ id: 'f', name: 'Oben', art: 'figur', x: 12, y: 5, bewegung: 9 }] });
  var WO = kampf.wege(oben, oben.figur);
  assert.deepStrictEqual(kampf.pfadHoehe(oben, kampf.pfad(WO, 12, 7)), { klettern: 0, sprung: 2 }, 'von der Terrasse über die Brustwehr hinab ist ein Sprung von zwei Ebenen');
  assert.strictEqual(WO.dist['12,7'], 3, 'hinab kostet nur das Gelände');
  ok('Höhe: Klettern, Treppe, Rampe, Sprung, Abstand');

  // Stufe A (1.2): Waffen, Reichweite, Zonen, Gelegenheitsangriffe, Deckung, Lage
  assert.deepStrictEqual([1.5, 3, 18, 96, 0.5].map(kampf.felder), [1, 2, 12, 64, 1], 'Meter in Felder');
  var A = kampf.lies(STUFEA), fig = A.figur, r1 = A.wesen[2], r2 = A.wesen[3], s = A.wesen[5];
  assert.strictEqual(fig.waffen.length, 3);
  assert.deepStrictEqual([fig.waffen[0].r, fig.waffen[0].rl, fig.waffen[0].fern], [1, 0, false], 'Langschwert: Nahkampf, ein Feld');
  assert.deepStrictEqual([fig.waffen[1].r, fig.waffen[1].rl, fig.waffen[1].fern], [4, 12, true], 'Dolch geworfen: 6/18 m');
  assert.deepStrictEqual([fig.waffen[2].r, fig.waffen[2].rl, fig.waffen[2].fern, fig.waffen[2].zauber], [12, 0, true, true], 'Starry Wisp: 18 m, Zauber');
  assert.strictEqual(r2._r, 2, 'Spieß: 3 m sind zwei Felder');
  assert.strictEqual(kampf.bedroht(A, r2, 7, 5), true, 'zwei Felder schräg: bedroht');
  assert.strictEqual(kampf.bedroht(A, r2, 6, 5), false, 'drei Felder: nicht');
  assert.strictEqual(kampf.bedroht(A, r2, 9, 3), false, 'das eigene Feld nicht');
  assert.strictEqual(Object.keys(kampf.zone(A, r1)).length, 8, 'Zone eines Räubers mit 1,5 m: acht Felder');
  assert.strictEqual(Object.keys(kampf.zone(A, r2)).length, 19, 'Zone mit 3 m: 24 Felder, ohne die fünf in der Wand');
  assert.strictEqual(kampf.gelegenheiten(A, [[6, 4], [5, 3]]).length, 1, 'aus der Reichweite heraus: Gelegenheitsangriff');
  assert.strictEqual(kampf.gelegenheiten(A, [[6, 4], [7, 4], [8, 5]]).length, 0, 'in der Reichweite bleiben: keiner');
  assert.strictEqual(kampf.gelegenheiten(A, [[6, 4], [5, 3], [6, 4], [5, 3]]).length, 1, 'je Gegner nur einmal');
  var dk = kampf.deckung(A, fig, s);
  assert.strictEqual(dk.stufe, 3, 'die Wand zwischen Keller und Vorraum: ganze Deckung');
  dk = kampf.deckung(A, { x: 4, y: 5, groesse: 1 }, r2);
  assert.deepStrictEqual([dk.stufe, dk.grund], [1, 'Gesine bei 5/D'], 'Gesine steht in der Linie (und dahinter das Fass): halbe Deckung');
  dk = kampf.deckung(A, { x: 6, y: 6, groesse: 1 }, { x: 6, y: 2, groesse: 1 });
  assert.deepStrictEqual([dk.stufe, dk.grund], [1, 'niedrige Deckung bei 6/D'], 'die Spalte hinauf liegt nur das Fass in der Linie');
  dk = kampf.deckung(A, { x: 4, y: 3, groesse: 1 }, r2);
  assert.strictEqual(dk.stufe, 0, 'die Zeile entlang ist frei');
  var L = kampf.angriffsLage(A, { x: 6, y: 5, groesse: 1 }, r1, fig.waffen[0], false);
  assert.deepStrictEqual([L.status, L.vor, L.nach, L.netto, L.deckung.stufe], ['in', ['Ziel am Boden'], [], 1, 0], 'Langschwert auf den Liegenden: Vorteil');
  assert.strictEqual(kampf.lageKurz(L, fig.waffen[0], r1), 'Angriff: Langschwert auf Räuber 1 (1,5 m; Vorteil: Ziel am Boden)');
  L = kampf.angriffsLage(A, { x: 6, y: 5, groesse: 1 }, r1, fig.waffen[1], false);
  assert.deepStrictEqual([L.status, L.vor, L.nach, L.netto], ['in', ['Ziel am Boden'], ['Gegner neben dir'], 0], 'Wurf aus 1,5 m auf den Liegenden: hebt sich auf');
  L = kampf.angriffsLage(A, fig, s, fig.waffen[2], false);
  assert.strictEqual(L.status, 'aus'); assert.ok(/^keine Sichtlinie, eine Wand bei 12\/C/.test(L.grund), 'Zauber durch die Wand: ' + L.grund);
  assert.strictEqual(kampf.lageKurz(L, fig.waffen[2], s), 'Ziel: Schütze (außer Reichweite: keine Sichtlinie, eine Wand bei 12/C)');
  L = kampf.angriffsLage(A, fig, r2, fig.waffen[1], false);
  assert.deepStrictEqual([L.status, L.nach, L.netto, L.deckung.stufe], ['lang', ['lange Reichweite'], -1, 1], 'Dolch auf 7,5 m: lange Reichweite, Fass dazwischen');
  assert.strictEqual(kampf.lageKurz(L, fig.waffen[1], r2), 'Angriff: Dolch, geworfen auf Räuber 2 (7,5 m; lange Reichweite; halbe Deckung)');
  L = kampf.angriffsLage(A, fig, r1, fig.waffen[0], false);
  assert.deepStrictEqual([L.status, L.grund], ['aus', '4,5 m, Langschwert reicht 1,5 m'], 'zu weit für das Schwert');
  var hochA = kampf.lies({ boden: ['....', '....', '....'], hoehe: ['0000', '0022', '0022'], wesen: [{ id: 'f', name: 'F', art: 'figur', x: 1, y: 2, waffen: [{ name: 'Schwert', reichweite: 1.5 }] }, { id: 'g', name: 'Oben', art: 'gegner', x: 3, y: 2 }] });
  L = kampf.angriffsLage(hochA, { x: 2, y: 2, groesse: 1 }, hochA.wesen[1], hochA.figur.waffen[0], false);
  assert.deepStrictEqual([L.status, L.grund], ['aus', '3 m höher'], 'direkt unter der Kante: die Höhe ist der Grund');
  assert.strictEqual(kampf.bedroht(hochA, hochA.wesen[1], 2, 2), false, 'von 3 m oben bedroht ein Schwert das Feld darunter nicht');
  ok('Stufe A: Waffen, Zonen, Gelegenheitsangriffe, Deckung, Lage');

  // 1.3: Modi, Zauber mit Waffe, Zustände, Wunden, wer bedroht
  var B = kampf.lies(DREI), bf = B.figur, b1 = B.wesen[1], b2 = B.wesen[2], b4 = B.wesen[4], hanno = B.wesen[5];
  assert.strictEqual(kampf.version, '1.4');
  assert.deepStrictEqual(bf.waffen[0].modi.map(function (mo) { return mo.zeichen; }), ['faust', 'faeuste'], 'Langschwert: Faust, zwei Fäuste');
  assert.deepStrictEqual(bf.waffen[1].modi.map(function (mo) { return mo.zeichen; }), ['faust', 'kreuz'], 'Dolch: Faust, Fadenkreuz');
  var e1 = kampf.wirksam(bf.waffen[0], 1, null);
  assert.deepStrictEqual([e1.name, e1.bonus, e1.schaden, e1.typ, e1.r, e1.rl], ['Langschwert, beidhändig', 4, '1W10+2', 'Hieb', 1, 0], 'beidhändig: der Modus überschreibt den Schaden');
  var e2 = kampf.wirksam(bf.waffen[1], 1, null);
  assert.deepStrictEqual([e2.name, e2.r, e2.rl, e2.fern], ['Dolch, geworfen', 4, 12, true], 'geworfen: 6/18 m');
  var e3 = kampf.wirksam(bf.zauber[1], null, e2);
  assert.deepStrictEqual([e3.name, e3.bonus, e3.schaden, e3.typ, e3.r, e3.rl, e3.zauber], ['Zielsicherer Schlag mit Dolch, geworfen', 4, '1W4+2', 'gleißend', 4, 12, true], 'Zauber mit Waffe: Reichweite und Schaden der Waffe, Schadensart des Zaubers');
  assert.deepStrictEqual([bf.zauber[0].r, bf.zauber[0].zauber, bf.zauber[0].mit], [12, true, false], 'Starry Wisp: 18 m');
  assert.deepStrictEqual(b1.zustaende, ['ergibt sich']); assert.strictEqual(kampf.kampffaehig(b1), false, 'wer sich ergibt, kämpft nicht');
  assert.deepStrictEqual([b2.zustaende, b2._wunde], [['vergiftet', 'liegend'], 'schwer'], 'Wörter in zustand werden zu Plaketten, die Wunde aus zustand');
  assert.strictEqual(kampf.wehrlos(b4), true, 'bewusstlos ist wehrlos'); assert.strictEqual(kampf.kampffaehig(b4), false);
  assert.strictEqual(hanno.zustaende.length, 5);
  assert.strictEqual(kampf.gelegenheiten(B, [[8, 2], [9, 3]]).length, 0, 'wer sich ergibt, löst keinen Gelegenheitsangriff aus');
  var L2 = kampf.angriffsLage(B, { x: 5, y: 7, groesse: 1 }, b4, kampf.wirksam(bf.waffen[0], 0, null), false);
  assert.deepStrictEqual([L2.status, L2.vor, L2.netto], ['in', ['Ziel wehrlos'], 1], 'auf den Bewusstlosen: Vorteil');
  assert.ok(kampf.kachelBild('~').indexOf('<svg') === 0 && kampf.plaketteBild('ergibt sich').indexOf('kkPl') > 0, 'Bilder für die Legende');
  assert.strictEqual(kampf.zustaende.length, 20, 'zwanzig Zustände mit Plakette (Lagebild 1.2)');
  ok('1.3: Modi, Zauber mit Waffe, Zustände, Wunden');

  // 1.4: Zauber mit Rettungswurf und Heilung, Trefferpunkte
  var dw = kampf.wirksam(bf.zauber[2]), hw = kampf.wirksam(bf.zauber[3]);
  assert.deepStrictEqual([dw.ohneWurf, dw.rettung, dw.sg, dw.r, hw.ohneWurf, hw.heilung], [true, 'WEI', 12, 12, true, '2W4+2'], 'ohne Angriffswurf');
  var L3 = kampf.angriffsLage(B, bf, b2, dw, false);
  assert.deepStrictEqual([L3.status, L3.vor, L3.nach, L3.netto], ['in', [], [], 0], 'Rettungswurf-Zauber: nur Reichweite und Sichtlinie');
  assert.strictEqual(kampf.lageKurz(L3, dw, b2), 'Zauber: Dissonant Whispers auf Räuber 2 (3 m; Rettungswurf WEI SG 12)');
  var hanL = kampf.angriffsLage(B, bf, hanno, hw, false);
  assert.strictEqual(kampf.lageKurz(hanL, hw, hanno), 'Zauber: Healing Word auf Hanno (1,5 m)');
  assert.deepStrictEqual([bf._tp, bf._wunde], [[8, 27], 'angeschlagen'], 'TP der Figur, Wundstufe daraus');
  var tot0 = kampf.lies({ wesen: [{ id: 'f', name: 'F', art: 'figur', x: 1, y: 1, tp: [0, 20] }] }).figur;
  assert.ok(tot0.zustaende.indexOf('bewusstlos') >= 0, '0 TP heißt bewusstlos');
  ok('1.4: Rettungswurf, Heilung, Trefferpunkte');
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
    assert.ok(/nach 7\/C, Stein · 4,5 m/.test(await pg.innerText('#kampf .kkI')), 'Weg, Feldart und Entfernung: ' + await pg.innerText('#kampf .kkI'));
    assert.ok(await pg.locator('#kampf .kkWeg path').count() === 1, 'Weg gezeichnet');
    await klickWesen(pg, 3);
    assert.ok(/Räuber 1 \(R1\) · Gegner · 14\/C · 10,5 m von 7\/C · angeschlagen · bedroht/.test(await pg.innerText('#kampf .kkI')), 'Wesen-Info mit Entfernung vom Zielfeld: ' + await pg.innerText('#kampf .kkI'));
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
    await klickFeld(pg2, 4, 5); // das eigene Feld hebt das Ziel auf
    assert.strictEqual(await pg2.locator('#kampf button[data-k="bleib"]').count(), 0, 'seit 1.3 kein Knopf „Bleiben“ mehr');
    await pg2.click('#kampf button[data-k="zug"]');
    assert.ok(/Schreib das in den Chat: Kampf #7 · Probefigur bleibt auf 4\/E/.test(await pg2.innerText('#kampf .kkI')), 'ohne Zielfeld bleibt die Figur, ohne sendPrompt: ' + await pg2.innerText('#kampf .kkI'));
    await pg2.click('#kampf button[data-k="leg"]');
    var legN = await pg2.locator('#kampf .kkL span').count();
    assert.ok(legN >= 12 && legN <= 26, 'Legende, knapp: ' + legN);
    assert.ok((await pg2.locator('#kampf .kkL svg.kkKb').count()) >= 6, 'Kachelbilder in der Legende');
    ok('Grenzen, Spurt, ohne sendPrompt');

    var pgH = await seite(b, HOEHE);
    assert.strictEqual(await pgH.locator('#kampf g.kkHm').count(), 3, 'drei Spielsteine mit Höhenmarke');
    assert.ok((await pgH.locator('#kampf .kkKan path.kkKa').count()) >= 14, 'Kanten mit Schatten');
    assert.ok((await pgH.locator('#kampf g.kkHs').count()) >= 2, 'Höhenschilder');
    assert.ok((await pgH.locator('#kampf .kkZl span').count()) === 12, 'Zeilenbuchstaben links, die stehen bleiben');
    await klickFeld(pgH, 12, 4);
    assert.ok(/nach 12\/D \(3 m hoch\), Stein · 15 m · klettert 3 m · Spurt/.test(await pgH.innerText('#kampf .kkI')), 'Weg mit Höhe und Klettern: ' + await pgH.innerText('#kampf .kkI'));
    await klickWesen(pgH, 2);
    assert.ok(/Räuber 1 \(R1\) · Gegner · 15\/E \(3 m hoch\) · 4,5 m von 12\/D/.test(await pgH.innerText('#kampf .kkI')), 'Ziel auf gleicher Ebene ohne Höhenangabe: ' + await pgH.innerText('#kampf .kkI'));
    await klickFeld(pgH, 12, 4);
    assert.ok(/· 9 m, 3 m höher von dir/.test(await pgH.innerText('#kampf .kkI')), 'Ziel von unten: Entfernung und Höhe: ' + await pgH.innerText('#kampf .kkI'));
    await klickFeld(pgH, 27, 7);
    await pgH.click('#kampf button[data-k="zug"]');
    var gH = await pgH.evaluate(function () { return GESENDET; });
    assert.deepStrictEqual(gH, ['Kampf #2 · Probefigur nach 27/G (1,5 m hoch) · 13,5 m · Spurt · Ziel: Räuber 1 (18 m, 1,5 m höher)']);
    ok('Höhe im Widget');

    var pg3 = await seite(b, { nr: 1, titel: 'Leer', wesen: [{ id: 'r', name: 'Räuber', art: 'gegner', x: 2, y: 2 }] });
    assert.ok(/Die Figur steht nicht auf der Karte/.test(await pg3.innerText('#kampf .kkI')), 'ohne Figur');
    assert.strictEqual(await pg3.locator('#kampf rect[fill="url(#kkM-nebel)"]').count(), 0, 'ohne boden ist alles Boden');
    assert.strictEqual(await pg3.locator('#kampf rect[fill="url(#kkM-stein)"]').count(), 36 * 12, 'Steinboden als Kachel');
    assert.strictEqual(await pg3.locator('#kampf svg defs pattern').count(), 12, 'zwölf Kacheln in den defs');
    ok('ohne Figur');

    // Stufe A im Widget: Kopf, Reihenfolge, Waffen, Reichweite, Zonen, Lagezeile, Zugzeile
    var pgA = await seite(b, STUFEA);
    var kopf = await pgA.innerText('#kampf .kkKopf2');
    assert.ok(/Ziel: Jost und das Zollfass/.test(kopf) && /Fackel: noch 2 Runden/.test(kopf) && /Wache: jetzt/.test(kopf) && /dämmrig/.test(kopf), 'Kopf mit Ziel, Uhren und Lage: ' + kopf);
    assert.strictEqual(await pgA.locator('#kampf .kkIni .kkIt').count(), 7, 'Reihenfolge mit sieben Steinen');
    assert.strictEqual(await pgA.locator('#kampf .kkIt.kkGeh').count(), 2, 'zwei haben vor der Figur gehandelt');
    assert.strictEqual(await pgA.locator('#kampf .kkIt.kkJetzt').count(), 1, 'die Figur ist am Zug');
    assert.strictEqual(await pgA.locator('#kampf button[data-k="waffe"]').count(), 3, 'drei Waffen');
    assert.strictEqual(await pgA.getAttribute('#kampf button[data-k="waffe"][data-i="0"]', 'aria-pressed'), 'true', 'die erste Waffe ist gewählt');
    assert.strictEqual(await pgA.locator('#kampf .kkReich rect').count(), 1, 'das Reichweitenquadrat des Schwerts');
    assert.strictEqual(await pgA.locator('#kampf .kkO.kkFern').count(), 4, 'alle vier Gegner außer Schwertreichweite: blass');
    await pgA.click('#kampf button[data-k="waffe"][data-i="1"]');
    assert.strictEqual(await pgA.locator('#kampf .kkReich rect').count(), 2, 'Dolch: normale und lange Reichweite');
    assert.strictEqual(await pgA.locator('#kampf .kkReich rect.kkRl').count(), 1, 'die lange gestrichelt');
    await pgA.click('#kampf button[data-k="waffe"][data-i="2"]');
    assert.strictEqual(await pgA.locator('#kampf .kkO.kkFern').count(), 0, 'Starry Wisp reicht zu allen');
    await pgA.click('#kampf button[data-k="waffe"][data-i="0"]');
    await klickWesen(pgA, 2);
    assert.strictEqual(await pgA.locator('#kampf .kkF.kkGz').count(), 8, 'die Zone des angetippten Räubers');
    var A1 = await pgA.innerText('#kampf .kkA');
    assert.ok(/Angriff: Langschwert \+4 · 1W8\+2 Hieb · Räuber 1: außer Reichweite \(4,5 m, Langschwert reicht 1,5 m\)/.test(A1), 'Lagezeile außer Reichweite: ' + A1);
    assert.ok(/kkAus/.test(await pgA.getAttribute('#kampf .kkA', 'class')), 'blass');
    await klickFeld(pgA, 6, 5);
    assert.ok(/nach 6\/E, Stein · 3 m/.test(await pgA.innerText('#kampf .kkI')), 'Weg: ' + await pgA.innerText('#kampf .kkI'));
    var A2 = await pgA.innerText('#kampf .kkA');
    assert.ok(/Räuber 1: 1,5 m · in Reichweite · Vorteil: Ziel am Boden/.test(A2), 'Lagezeile mit Vorteil: ' + A2);
    assert.ok(/kkVor/.test(await pgA.getAttribute('#kampf .kkA', 'class')), 'grün');
    await pgA.click('#kampf button[data-k="warum"]');
    assert.ok((await pgA.locator('#kampf .kkWarum li').count()) >= 2, 'Warum: ein Satz je Posten');
    await pgA.click('#kampf button[data-k="gefahr"]');
    assert.ok((await pgA.locator('#kampf .kkF.kkGzA').count()) >= 30, 'Gefahr: alle Zonen');
    await pgA.click('#kampf button[data-k="zug"]');
    var gA = await pgA.evaluate(function () { return GESENDET; });
    assert.deepStrictEqual(gA, ['Kampf #9 · Probefigur nach 6/E · 3 m · Angriff: Langschwert auf Räuber 1 (1,5 m; Vorteil: Ziel am Boden)']);
    ok('Stufe A im Widget');

    var pgA2 = await seite(b, STUFEA);
    await pgA2.click('#kampf .kkIt[data-w="3"]');
    assert.strictEqual(await pgA2.locator('#kampf .kkO[data-w="3"].kkSel').count(), 1, 'Tipp in der Leiste wählt den Gegner');
    assert.strictEqual(await pgA2.locator('#kampf .kkF.kkGz').count(), 19, 'und zeigt seine Zone (Spieß, 3 m, ohne die Wand)');
    await pgA2.click('#kampf .kkIt[data-w="3"]');
    assert.strictEqual(await pgA2.locator('#kampf .kkF.kkGz').count(), 0, 'noch einmal: aufgehoben');
    await pgA2.press('#kampf input', 'Enter'); // der Pfeil, auch mit Enter im Freitext; ohne Zielfeld bleibt die Figur
    var gA2 = await pgA2.evaluate(function () { return GESENDET; });
    assert.deepStrictEqual(gA2, ['Kampf #9 · Probefigur bleibt auf 4/E · Waffe: Langschwert'], 'ohne Ziel steht die Waffe trotzdem in der Zeile (1.3.1)');
    ok('Leiste und Stehenbleiben');

    // 1.3 im Widget: Kacheln, Schatten, Modi, Zauber, Zustände
    var pgD = await seite(b, DREI);
    assert.ok((await pgD.locator('#kampf rect[fill="url(#kkM-wasser)"]').count()) >= 20, 'tiefes Wasser als Kachel');
    assert.ok((await pgD.locator('#kampf rect[fill="url(#kkM-gras)"]').count()) >= 20, 'Gras als Kachel');
    assert.strictEqual(await pgD.locator('#kampf rect[fill="url(#kkM-eis)"]').count(), 4, 'Eis als Kachel');
    assert.ok((await pgD.locator('#kampf .kkKan rect.kkSch').count()) >= 12, 'Schatten an der Böschung');
    assert.strictEqual(await pgD.locator('#kampf g.kkHs').count(), 2, 'ein Schild je Fläche: Böschung +3 m und die Stufe +1,5 m');
    assert.strictEqual(await pgD.locator('#kampf button[data-k="waffe"]').count(), 2, 'zwei Waffen');
    assert.strictEqual(await pgD.locator('#kampf button[data-k="zauber"]').count(), 4, 'vier Zauber');
    assert.strictEqual(await pgD.locator('#kampf button[data-k="bleib"]').count(), 0, 'kein „Bleiben“');
    assert.strictEqual(await pgD.locator('#kampf button.kkPfeil[data-k="zug"] svg').count(), 1, 'der Pfeil schickt den Zug');
    assert.strictEqual(await pgD.getAttribute('#kampf button[data-k="waffe"][data-i="0"] svg.kkMo', 'aria-label'), 'einhändig', 'Langschwert zeigt eine Faust');
    await klickWesen(pgD, 3); // Räuber 3 auf der Böschung
    assert.ok(/Angriff: Langschwert, einhändig \+4 · 1W8\+2 Hieb/.test(await pgD.innerText('#kampf .kkA')), 'Lagezeile einhändig: ' + await pgD.innerText('#kampf .kkA'));
    await pgD.click('#kampf button[data-k="waffe"][data-i="0"]'); // noch einmal: beidhändig
    assert.strictEqual(await pgD.getAttribute('#kampf button[data-k="waffe"][data-i="0"] svg.kkMo', 'aria-label'), 'beidhändig', 'zwei Fäuste');
    assert.ok(/Angriff: Langschwert, beidhändig \+4 · 1W10\+2 Hieb/.test(await pgD.innerText('#kampf .kkA')), 'Lagezeile beidhändig: ' + await pgD.innerText('#kampf .kkA'));
    await pgD.click('#kampf button[data-k="waffe"][data-i="1"]'); // Dolch, Nahkampf
    assert.strictEqual(await pgD.getAttribute('#kampf button[data-k="waffe"][data-i="1"]', 'aria-pressed'), 'true');
    assert.strictEqual(await pgD.locator('#kampf .kkReich rect').count(), 1, 'Dolch im Nahkampf: ein Quadrat');
    await pgD.click('#kampf button[data-k="waffe"][data-i="1"]'); // geworfen
    assert.strictEqual(await pgD.getAttribute('#kampf button[data-k="waffe"][data-i="1"] svg.kkMo', 'aria-label'), 'geworfen', 'Fadenkreuz');
    assert.strictEqual(await pgD.locator('#kampf .kkReich rect').count(), 2, 'geworfen: normale und lange Reichweite');
    await pgD.click('#kampf button[data-k="zauber"][data-i="1"]'); // Zielsicherer Schlag mit dem Dolch, geworfen
    assert.strictEqual(await pgD.locator('#kampf button[data-k="waffe"][data-i="1"].kkMit').count(), 1, 'die Waffe des Zaubers ist markiert');
    var AD = await pgD.innerText('#kampf .kkA');
    assert.ok(/Zauber: Zielsicherer Schlag mit Dolch, geworfen \+4 · 1W4\+2 gleißend/.test(AD), 'Zauber mit Waffe: ' + AD);
    await pgD.click('#kampf button[data-k="zauber"][data-i="0"]');
    assert.ok(/Zauber: Starry Wisp \+4 · 1W8 gleißend · Räuber 3: 13,5 m, 3 m höher/.test(await pgD.innerText('#kampf .kkA')), 'Starry Wisp: ' + await pgD.innerText('#kampf .kkA'));
    await pgD.click('#kampf button[data-k="zug"]');
    var gD = await pgD.evaluate(function () { return GESENDET; });
    assert.deepStrictEqual(gD, ['Kampf #11 · Probefigur bleibt auf 9/C · Zauber: Starry Wisp auf Räuber 3 (13,5 m, 3 m höher)']);
    ok('1.3: Kacheln, Schatten, Modi, Zauber');

    var pgE = await seite(b, DREI);
    await klickWesen(pgE, 1); // Räuber 1 ergibt sich
    assert.strictEqual(await pgE.locator('#kampf .kkF.kkGz').count(), 0, 'wer sich ergibt, bedroht kein Feld');
    assert.strictEqual(await pgE.locator('#kampf g.kkO[data-w="1"] g.kkPl').count(), 1, 'eine Plakette: die weiße Fahne');
    assert.strictEqual(await pgE.$eval('#kampf g.kkO[data-w="1"] g.kkPl title', function (e) { return e.textContent; }), 'ergibt sich');
    assert.strictEqual(await pgE.locator('#kampf .kkIt[data-w="1"] svg.kkKb').count(), 1, 'die Plakette auch in der Reihenfolge');
    assert.strictEqual(await pgE.locator('#kampf g.kkO[data-w="2"] circle.kkWs').count(), 1, 'schwer verletzt: roter Ring');
    assert.strictEqual(await pgE.locator('#kampf g.kkO[data-w="2"] g.kkPl').count(), 2, 'vergiftet und liegend (aus dem Wort „am Boden“)');
    assert.strictEqual(await pgE.locator('#kampf g.kkO[data-w="4"].kkBlass').count(), 1, 'bewusstlos: blass');
    assert.strictEqual(await pgE.locator('#kampf g.kkO[data-w="5"] g.kkPl').count(), 4, 'fünf Zustände: drei Plaketten und „+2“');
    assert.ok(/\+2/.test(await pgE.$eval('#kampf g.kkO[data-w="5"]', function (e) { return e.textContent; })), '„+2“ am Stein');
    await pgE.click('#kampf button[data-k="gefahr"]');
    var gz = await pgE.locator('#kampf .kkF.kkGzA').count();
    assert.ok(gz >= 20 && gz <= 32, 'Gefahr: nur Räuber 2 und 3 bedrohen (' + gz + ')');
    await pgE.click('#kampf button[data-k="leg"]');
    var legT = await pgE.innerText('#kampf .kkL');
    assert.ok(/ergibt sich/.test(legT) && /schwer verletzt/.test(legT) && /Gras/.test(legT) && /Eis/.test(legT) && !/Planken/.test(legT), 'Legende nennt, was vorkommt: ' + legT.replace(/\n/g, ' | '));
    await klickWesen(pgE, 4); // der Bewusstlose
    await klickFeld(pgE, 5, 7);
    assert.ok(/Vorteil: Ziel wehrlos/.test(await pgE.innerText('#kampf .kkA')), 'wehrlos: Vorteil: ' + await pgE.innerText('#kampf .kkA'));
    ok('1.3: Zustände, Wunden, Gefahr, Legende');

    // 1.3.1: ohne angetipptes Ziel trägt die Zugzeile den gewählten Zauber (Probekampf an der Furt: „Auf S“ kam ohne den Zielsicheren Schlag an)
    var pgF = await seite(b, DREI);
    await pgF.click('#kampf button[data-k="zauber"][data-i="1"]');
    await pgF.fill('#kampf input', 'Auf S');
    await pgF.click('#kampf button[data-k="zug"]');
    var gF = await pgF.evaluate(function () { return GESENDET; });
    assert.deepStrictEqual(gF, ['Kampf #11 · Probefigur bleibt auf 9/C · Zauber: Zielsicherer Schlag mit Langschwert, einhändig · Auf S']);
    ok('1.3.1: Zauber ohne Ziel in der Zugzeile');

    // 1.4 im Widget: blauer Rahmen, Pfeile, Wesen-Info, Rettungswurf-Zauber, Aktion zuerst, TP im Kopf
    var pgG = await seite(b, DREI);
    assert.ok((await pgG.getAttribute('#kampf .kkBew path.kkBw', 'd')).length > 40, 'blauer Rahmen der Bewegung');
    assert.ok((await pgG.getAttribute('#kampf .kkBew path.kkBwS', 'd')).length > 40, 'gestrichelt mit Spurt');
    assert.ok(/TP: 8\/27/.test(await pgG.innerText('#kampf .kkKopf2')), 'TP im Kopf');
    assert.strictEqual(await pgG.locator('#kampf .kkTp.kkTpA').count(), 1, 'unter der Hälfte: gold');
    assert.strictEqual(await pgG.locator('#kampf g.kkO.kkA-figur circle.kkWa').count(), 1, 'die Figur trägt den Wundring');
    assert.strictEqual(await pgG.locator('#kampf .kkBl-e:not([hidden])').count(), 1, 'Pfeil nach rechts, die Karte geht weiter');
    assert.strictEqual(await pgG.locator('#kampf .kkBl-n:not([hidden])').count(), 0, 'nach oben nicht');
    var sl0 = await pgG.evaluate(function () { return document.querySelector('#kampf .kkR').scrollLeft; });
    await pgG.click('#kampf .kkBl-e');
    await pgG.waitForTimeout(600);
    var sl1 = await pgG.evaluate(function () { return document.querySelector('#kampf .kkR').scrollLeft; });
    assert.ok(sl1 > sl0 + 50, 'geblättert: ' + sl0 + ' -> ' + sl1);
    await klickWesen(pgG, 2); // Räuber 2
    var wiT = await pgG.innerText('#kampf .kkI');
    assert.ok(/^Räuber 2 \(R2\) · Gegner · 11\/B · 3 m von dir · schwer verletzt · vergiftet · liegend · bedroht 8 Felder/.test(wiT), 'Wesen-Info: ' + wiT);
    await pgG.click('#kampf button[data-k="zauber"][data-i="2"]'); // Dissonant Whispers
    var AG = await pgG.innerText('#kampf .kkA');
    assert.ok(/^Zauber: Dissonant Whispers · Rettungswurf WEI gegen SG 12 · 3W6 psychisch · halb bei Erfolg; muss mit seiner Reaktion fliehen · Räuber 2: 3 m · in Reichweite/.test(AG), 'Lagezeile ohne Angriffswurf: ' + AG);
    await klickFeld(pgG, 13, 3);
    await pgG.click('#kampf button[data-k="zuerst"]');
    assert.ok(/Aktion zuerst/.test(await pgG.innerText('#kampf .kkI')), 'Aktion zuerst in der Infozeile');
    await pgG.click('#kampf button[data-k="zug"]');
    var gG = await pgG.evaluate(function () { return GESENDET; });
    assert.deepStrictEqual(gG, ['Kampf #11 · Probefigur: Zauber: Dissonant Whispers auf Räuber 2 (3 m; Rettungswurf WEI SG 12), dann nach 13/C · 6 m · verlässt Räuber 2: Gelegenheitsangriff']);
    ok('1.4: Rahmen, Pfeile, Wesen-Info, Rettungswurf, Aktion zuerst, TP');

    var OA = { nr: 3, titel: 'Gasse', figur: 'f', spalten: 8, zeilen: 4, boden: ['########', '........', '........', '........'],
      wesen: [{ id: 'f', name: 'Figur', art: 'figur', x: 2, y: 2, bewegung: 9, waffen: [{ name: 'Keule', reichweite: 1.5 }] }, { id: 'r', name: 'Räuber', art: 'gegner', x: 3, y: 3 }] };
    var pgO = await seite(b, OA);
    await klickFeld(pgO, 6, 2);
    assert.ok(/verlässt Räuber: Gelegenheitsangriff/.test(await pgO.innerText('#kampf .kkI')), 'Warnung vor dem Gelegenheitsangriff: ' + await pgO.innerText('#kampf .kkI'));
    assert.strictEqual(await pgO.locator('#kampf .kkWeg polygon.kkOa').count(), 1, 'das Dreieck am Weg');
    await pgO.click('#kampf button[data-k="zug"]');
    var gO = await pgO.evaluate(function () { return GESENDET; });
    assert.deepStrictEqual(gO, ['Kampf #3 · Figur nach 6/B · 6 m · verlässt Räuber: Gelegenheitsangriff · Waffe: Keule']);
    ok('Gelegenheitsangriff');

    assert.deepStrictEqual(pg.fehler.concat(pg2.fehler, pgH.fehler, pg3.fehler, pgA.fehler, pgA2.fehler, pgD.fehler, pgE.fehler, pgF.fehler, pgG.fehler, pgO.fehler), [], 'keine Fehler im Browser');
    ok('keine Fehler');
    console.log('\n' + n + ' Prüfungen bestanden.');
  } finally { await b.close(); }
})().catch(function (e) { console.error(e); process.exit(1); });
