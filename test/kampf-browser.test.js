// Prüft die Karte im Browser (Kampfkarte 1.10): Felder mit Namen, spätere Karten aus dem Speicher, Spur und „neu“ von selbst, `weg`, `null`,
// `aendern`, neuer Ausschnitt, zurückgeblätterte Karten, leerer Browser, Schreibfehler. Erfundene Welt (test/kampf-browser-beispiel.js).
// Braucht Playwright mit Chromium: node test/kampf-browser.test.js
'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path');
var chromium = require('playwright').chromium;
var code = fs.readFileSync(path.join(__dirname, '..', 'kampf.js'), 'utf8');
var kampf = require('../kampf.js');
var B = require('./kampf-browser-beispiel.js');
var n = 0;
function ok(name) { n++; console.log('ok  ' + name); }
function kopie(o) { return JSON.parse(JSON.stringify(o)); }
function speicher() {
  var m = {};
  return { getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; }, _m: m };
}
function wesenVon(D, id) { return (D.wesen || []).filter(function (w) { return w.id === id; })[0]; }
function aufruf(daten) {
  return '<h2 class="sr-only">Kampfkarte</h2>\n<div id="kampf">Kampfkarte lädt … Falls nicht, frag nach der Lage als Text.</div>\n' +
    '<script>var KAMPF=' + JSON.stringify(daten) + '</script>\n' +
    '<script>var s=document.createElement(\'script\');s.src=\'https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/kampf.js\';document.head.appendChild(s);</script>';
}

// Ohne Browser
(function () {
  // Felder mit Namen
  assert.deepStrictEqual(kampf.feldAusName('19/H'), [19, 8]);
  assert.deepStrictEqual(kampf.feldAusName(' 3 / a '), [3, 1], 'Leerzeichen und kleine Buchstaben gehen');
  assert.strictEqual(kampf.feldAusName('H19'), null);
  assert.strictEqual(kampf.feldAusName(null), null);
  var A = kampf.lies({ spalten: 10, zeilen: 6, ursprung: [12, 'C'], boden: ['..........', '..........', '..........', '..........', '..........', '..........'],
    wesen: [{ id: 'a', name: 'Drin', feld: '14/D', vorher: '12/C' }, { id: 'b', name: 'Draußen', feld: '30/D' }, { id: 'c', name: 'Alt', x: 2, y: 2 }],
    notizen: [{ feld: '15/E', text: 'Tür' }, { feld: '40/E', text: 'Weg' }, { x: 1, y: 1, text: 'Alt' }], aufstellung: ['12/C', '13/C', '40/A', [3, 3]] });
  assert.deepStrictEqual(A.wesen.map(function (w) { return [w.id, w.x, w.y]; }), [['a', 3, 2], ['c', 2, 2]], '14/D liegt im Ausschnitt ab 12/C auf 3,2; was außerhalb liegt, steht nicht auf der Karte');
  assert.deepStrictEqual(A.wesen[0]._vorher, [1, 1], 'die Spur mit Namen');
  assert.deepStrictEqual(A.notizen.map(function (x) { return [x.x, x.y, x.text]; }), [[4, 3, 'Tür'], [1, 1, 'Alt']]);
  assert.deepStrictEqual(A.aufstellung, [[1, 1], [2, 1], [3, 3]]);
  assert.strictEqual(kampf.feldName({ _ux: 12, _uy: 3 }, 3, 2), '14/D', 'und zurück');
  ok('Felder mit Namen, auch in einem Ausschnitt');

  // Ohne `kampf` bleibt alles, wie es war
  var alt = kopie(B.ganzRunde2), sp0 = speicher(), g0 = kampf.ausDemBrowser(alt, sp0);
  assert.strictEqual(g0.daten, alt, 'dieselbe Karte, nicht einmal eine Kopie');
  assert.deepStrictEqual(sp0._m, {}, 'nichts im Speicher');
  assert.deepStrictEqual(kampf.kartenFehler({ boden: ['..'] }), [], 'alte Karten melden keine Schreibfehler');
  ok('ohne kampf wie bisher');

  // Erste Karte, dann eine spätere
  var S = speicher(), r1 = kampf.ausDemBrowser(kopie(B.runde1), S).daten;
  assert.strictEqual(wesenVon(r1, 'pf').feld, '14/F');
  assert.strictEqual(wesenVon(r1, 'sp').neu, undefined, 'auf der ersten Karte ist niemand „neu“');
  var r2 = kampf.ausDemBrowser(kopie(B.runde2), S).daten;
  assert.strictEqual(r2.titel, 'Furt am Mühlbach', 'der Titel kommt aus dem Browser');
  assert.strictEqual(r2.boden.length, 12);
  assert.strictEqual(r2.nr, 6);
  assert.strictEqual(r2.runde, 2);
  assert.strictEqual(wesenVon(r2, 'pf').waffen.length, 2, 'die Waffen der Figur kommen aus dem Browser');
  assert.deepStrictEqual(wesenVon(r2, 'pf').tp, [22, 27]);
  assert.strictEqual(wesenVon(r2, 'pf').vorher, undefined, 'die eigene Figur hat keine Spur');
  assert.strictEqual(wesenVon(r2, 'sp').vorher, '20/F', 'die Spur von selbst');
  assert.strictEqual(wesenVon(r2, 'ta').feld, '13/G', 'wer nicht genannt ist, steht noch da');
  assert.strictEqual(wesenVon(r2, 'ta').vorher, undefined, 'und hat keine Spur');
  assert.strictEqual(wesenVon(r2, 'd3').neu, true, 'wer dazukommt, ist neu');
  assert.deepStrictEqual(r2.wesen.map(function (w) { return w.id; }), ['pf', 'ta', 'br', 'sp', 'tr', 'd3'], 'die Reihenfolge bleibt, Neue hinten');
  var K2 = kampf.lies(r2);
  assert.strictEqual(K2.figur.name, 'Probefigur');
  assert.deepStrictEqual([K2.figur.x, K2.figur.y], [17, 6]);
  assert.strictEqual(K2.wesen.filter(function (w) { return w.id === 'tr'; })[0].zustaende.length, 0);
  ok('spätere Karte aus dem Browser: Figur, Felder, Spur, neu');

  // Spur und neu gelten nur auf ihrer Karte; weg, null, aendern
  var r3 = kampf.ausDemBrowser(kopie(B.runde3), S).daten;
  assert.strictEqual(wesenVon(r3, 'sp').vorher, undefined, 'die Spur hält eine Karte');
  assert.strictEqual(wesenVon(r3, 'd3').neu, undefined, 'die Marke auch');
  assert.strictEqual(wesenVon(r3, 'br'), undefined, 'weg: true');
  assert.strictEqual(r3.ziel, undefined, 'null löscht');
  assert.strictEqual(wesenVon(r3, 'sp').zustand, 'tot');
  assert.strictEqual(r3.boden[4][24], ':', 'aendern: die Tür ist Geröll');
  assert.strictEqual(r3.aendern, undefined, 'aendern steht nicht in den Daten der Karte');
  var ohne = kopie(B.runde3); ohne.nr = 10; ohne.aendern = undefined; ohne.wesen = [{ id: 'tr', feld: '27/E', vorher: null }];
  var r3b = kampf.ausDemBrowser(ohne, S).daten;
  assert.strictEqual(r3b.boden[4][24], ':', 'die Änderung bleibt');
  assert.strictEqual(wesenVon(r3b, 'tr').vorher, undefined, 'vorher: null heißt keine Spur');
  ok('Spur und Marke nur auf ihrer Karte, weg, null, aendern bleibt');

  // Alle Formen von aendern
  var T = speicher();
  kampf.ausDemBrowser({ kampf: 'x', nr: 1, spalten: 6, zeilen: 4, boden: ['......', '......', '......', '......'], wesen: [] }, T);
  var ae = kampf.ausDemBrowser({ kampf: 'x', nr: 2, aendern: [['2/A', 'ee'], ['3/B', ['==', '_=']], ['5/C', ['~~'], ['11']], ['6/D', 'OOOO'], ['40/A', '#'], ['Quatsch', '#']] }, T).daten;
  assert.deepStrictEqual(ae.boden, ['.ee...', '..==..', '...=~~', '.....O'], 'eine Zeile, mehrere Zeilen, _ lässt stehen, was über den Rand reicht, fällt weg');
  assert.deepStrictEqual(ae.hoehe, ['', '', '000011'], 'die Höhe entsteht, wo sie fehlte');
  ok('aendern in allen Formen');

  // Neuer Ausschnitt: Figur und Wesen bleiben, Felder behalten ihre Namen
  var v = kampf.ausDemBrowser(kopie(B.ausschnitt), S).daten, Kv = kampf.lies(v);
  assert.strictEqual(wesenVon(v, 'pf').waffen.length, 2, 'die Figur muss nicht noch einmal getippt werden');
  assert.deepStrictEqual(Kv.wesen.map(function (w) { return w.id; }), ['pf', 'tr', 'd3'], 'wer außerhalb steht, ist nicht auf dieser Karte, aber nicht vergessen');
  assert.ok(wesenVon(v, 'ta'), 'Tamsin bleibt im Stand');
  assert.deepStrictEqual([Kv.figur.x, Kv.figur.y], [2, 3], '26/F in einem Ausschnitt ab 25/D');
  assert.deepStrictEqual(Kv.notizen.map(function (x) { return [x.x, x.y, x.text]; }), [[1, 2, 'Tür']], 'die Notiz wandert mit');
  assert.strictEqual(v.boden[1][0], ':', 'die Änderung gilt auch im neuen Ausschnitt');
  assert.strictEqual(kampf.feldName(v, 1, 2), '25/E', 'die Namen bleiben');
  var flach = kampf.ausDemBrowser({ kampf: B.ID, nr: 12, boden: v.boden.map(function (z) { return z; }) }, S).daten;
  assert.strictEqual(flach.hoehe, undefined, 'ein neuer Boden ohne Höhe ist flach');
  ok('neuer Ausschnitt');

  // Zurückblättern: Alte Karten zeigen ihren Stand und drehen nichts zurück
  var zurueck = kampf.ausDemBrowser(kopie(B.runde2), S).daten;
  assert.strictEqual(wesenVon(zurueck, 'pf').feld, '17/F', 'Runde 2 zeigt Runde 2');
  assert.ok(wesenVon(zurueck, 'br'), 'Brock ist in Runde 2 noch da');
  assert.strictEqual(zurueck.boden[4][24], '+', 'und die Tür steht');
  var nach = kampf.ausDemBrowser({ kampf: B.ID, nr: 14, wesen: [] }, S).daten;
  assert.strictEqual(wesenVon(nach, 'br'), undefined, 'danach gilt wieder der letzte Stand');
  assert.strictEqual(wesenVon(nach, 'pf').feld, '26/F');
  ok('zurückgeblätterte Karten drehen nichts zurück');

  // Was nur auf einer Karte gilt
  var Q = speicher();
  kampf.ausDemBrowser({ kampf: 'q', nr: 1, boden: ['.'], spalten: 1, zeilen: 1, hinweis: 'Noch ist niemand da.', aufstellung: ['1/A'], wesen: [{ id: 'f', name: 'F', art: 'figur', feld: '1/A' }] }, Q);
  var q2 = kampf.ausDemBrowser({ kampf: 'q', nr: 2, runde: 1 }, Q).daten;
  assert.strictEqual(q2.hinweis, undefined);
  assert.strictEqual(q2.aufstellung, undefined, 'nach der Aufstellung kommt die Karte ohne Aufstellung');
  var q3 = kampf.ausDemBrowser({ kampf: 'q', nr: 3, runde: 'vorbei', bilanz: { ausgang: 'Aus' } }, Q).daten;
  assert.strictEqual(q3.bilanz.ausgang, 'Aus');
  assert.strictEqual(kampf.ausDemBrowser({ kampf: 'q', nr: 4 }, Q).daten.bilanz, undefined);
  ok('Hinweis, Aufstellung und Bilanz gelten nur auf ihrer Karte');

  // Leerer Browser, kein Speicher, voller Speicher
  var L = speicher();
  assert.deepStrictEqual(kampf.ausDemBrowser(kopie(B.runde2), L), { fehlt: true }, 'ohne erste Karte fehlt sie');
  assert.deepStrictEqual(L._m, {}, 'und nichts wird abgelegt');
  assert.ok(kampf.ausDemBrowser(kopie(B.runde1), L).daten, 'kommt die Karte ganz, geht es weiter');
  assert.ok(kampf.ausDemBrowser(kopie(B.runde2), L).daten.boden);
  assert.ok(kampf.ausDemBrowser(kopie(B.runde1), null).daten.boden, 'ohne Speicher zeichnet die ganze Karte trotzdem');
  assert.deepStrictEqual(kampf.ausDemBrowser(kopie(B.runde2), null), { fehlt: true });
  var voll = speicher(), zaehl = 0; voll.setItem = function (k, w) { if (++zaehl > 0) throw new Error('voll'); };
  assert.ok(kampf.ausDemBrowser(kopie(B.runde1), voll).daten.boden, 'ein voller Speicher hält die Karte nicht auf');
  var kaputt = speicher(); kaputt.setItem('wegwartKampf:' + B.ID, '{kein json');
  assert.ok(kampf.ausDemBrowser(kopie(B.runde1), kaputt).daten.boden, 'Unsinn im Speicher auch nicht');
  ok('leerer Browser, kein Speicher, voller Speicher');

  // Es bleiben die letzten Kämpfe
  var R = speicher();
  for (var i = 1; i <= kampf.SPEICHER_HOECHSTENS + 2; i++) kampf.ausDemBrowser({ kampf: 'k' + i, nr: 1, boden: ['.'], spalten: 1, zeilen: 1, wesen: [] }, R);
  assert.strictEqual(R.getItem('wegwartKampf:k1'), null, 'der älteste ist weg');
  assert.strictEqual(R.getItem('wegwartKampf:k2'), null);
  assert.ok(R.getItem('wegwartKampf:k3'), 'die letzten bleiben');
  assert.strictEqual(JSON.parse(R.getItem('wegwartKampfListe')).length, kampf.SPEICHER_HOECHSTENS);
  ok('es bleiben die letzten ' + kampf.SPEICHER_HOECHSTENS + ' Kämpfe');

  // Schreibfehler
  assert.deepStrictEqual(kampf.kartenFehler(kampf.falten([kopie(B.runde1)])), [], 'die Beispielkarte ist sauber');
  var f = kampf.kartenFehler({ kampf: 'x', spalten: 4, zeilen: 3, ursprung: [10, 'C'], boden: ['....', '...', '..Q.'], wesen: [{ id: 'r9', feld: '10/C' }, { id: 'a', name: 'Ohne Feld' }, { id: 'b', name: 'Gut', x: 1, y: 1 }] });
  assert.ok(f.indexOf('Zeile D hat 3 statt 4 Zeichen') >= 0, f.join(' | '));
  assert.ok(f.indexOf('unbekanntes Zeichen „Q“ bei 12/E') >= 0, f.join(' | '));
  assert.ok(f.indexOf('zu „r9“ steht kein Name im Browser') >= 0, f.join(' | '));
  assert.ok(f.indexOf('„Ohne Feld“ hat kein Feld') >= 0, f.join(' | '));
  assert.strictEqual(f.length, 4, f.join(' | '));
  assert.deepStrictEqual(kampf.kartenFehler({ kampf: 'x', spalten: 1, zeilen: 2, boden: ['.'] }), ['1 statt 2 Zeilen']);
  ok('Schreibfehler werden gefunden');

  // `ganz`: Die neu geschickte Karte fängt neu an, auch über einem Schreibfehler
  var SG = speicher();
  kampf.ausDemBrowser(kopie(B.runde1), SG);
  var bad = kampf.ausDemBrowser({ kampf: B.runde1.kampf, nr: 6, wesen: [{ id: 'rx', feld: '20/F' }] }, SG).daten;
  assert.ok(kampf.kartenFehler(bad).length, 'die falsche `id` meldet sich');
  var ganz = kopie(B.runde1); ganz.nr = 7; ganz.ganz = true;
  var gut = kampf.ausDemBrowser(ganz, SG).daten;
  assert.deepStrictEqual(kampf.kartenFehler(gut), [], 'die ganze Karte fängt neu an: Der Fehler ist weg');
  assert.strictEqual(wesenVon(gut, 'rx'), undefined, 'das falsche Wesen auch');
  assert.strictEqual(gut.ganz, undefined, 'das Wort bleibt nicht im Stand');
  assert.ok(gut.wesen.every(function (w) { return !w.neu && !w.vorher; }), 'auf der ganzen Karte ist niemand „neu“ und niemand hat eine Spur');
  var r8 = kampf.ausDemBrowser({ kampf: B.runde1.kampf, nr: 8, wesen: [{ id: 'sp', feld: '19/F' }] }, SG).daten;
  assert.strictEqual(wesenVon(r8, 'sp').vorher, wesenVon(gut, 'sp').feld, 'danach geht es weiter wie immer');
  var zur = kampf.ausDemBrowser({ kampf: B.runde1.kampf, nr: 6, wesen: [{ id: 'rx', feld: '20/F' }] }, SG).daten;
  assert.ok(kampf.kartenFehler(zur).length, 'die alte Karte zeigt beim Zurückblättern, was sie zeigte');
  ok('eine ganze Karte fängt neu an, auch über einem Schreibfehler');
})();

// Im Widget
async function seiteIm(ctx, daten, opt) {
  var pg = await ctx.newPage(), fehler = [];
  pg.on('pageerror', function (e) { fehler.push(String(e)); });
  await pg.route('https://cdn.jsdelivr.net/**', function (r) { r.fulfill({ status: 200, contentType: 'application/javascript', body: code }); });
  await pg.route('https://fonts.googleapis.com/**', function (r) { r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
  var stub = '<script>window.GESENDET=[];window.sendPrompt=function(t){GESENDET.push(t)}</script>';
  await pg.route('https://widget.test/**', function (r) { r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><meta charset="utf-8">' + stub + aufruf(daten) }); });
  await pg.goto('https://widget.test/k');
  await pg.waitForFunction(function () { var e = document.querySelector('#kampf'); return e && !/lädt/.test(e.textContent); });
  pg.fehler = fehler;
  return pg;
}
function inhalt(pg) { return pg.evaluate(function () { return document.querySelector('#kampf').innerHTML; }); }
function klickFeld(pg, x, y) { return pg.evaluate(function (p) { document.querySelector('g.kkF[data-x="' + p[0] + '"][data-y="' + p[1] + '"] rect.kkK').dispatchEvent(new MouseEvent('click', { bubbles: true })); }, [x, y]); }

(async function () {
  var b = await chromium.launch();
  try {
    var ctx = await b.newContext({ viewport: { width: 900, height: 900 } });
    var p1 = await seiteIm(ctx, B.runde1);
    assert.strictEqual(await p1.locator('#kampf svg').count() > 0, true, 'die erste Karte steht');
    assert.strictEqual(await p1.locator('#kampf .kkWarn').count(), 0, 'ohne Schreibfehler');
    assert.ok(await p1.evaluate(function (id) { return !!localStorage.getItem('wegwartKampf:' + id); }, B.ID), 'und liegt im Browser');
    await p1.close();

    // Die spätere Karte zeigt Zeichen für Zeichen, was die ganz getippte zeigt
    var p2 = await seiteIm(ctx, B.runde2), h2 = await inhalt(p2), bild2 = await p2.screenshot();
    var ctxG = await b.newContext({ viewport: { width: 900, height: 900 } });
    var pG = await seiteIm(ctxG, B.ganzRunde2), hG = await inhalt(pG), bildG = await pG.screenshot();
    assert.strictEqual(h2, hG, 'gleich');
    assert.ok(Buffer.compare(bild2, bildG) === 0, 'Pixel für Pixel');
    ok('Runde 2 aus dem Browser ist Zeichen für Zeichen die ganz getippte');

    // Der Zug aus der späteren Karte
    assert.ok(await p2.locator('#kampf .kkAk button[data-k="waffe"]').count() >= 2, 'die Waffen sind da');
    await klickFeld(p2, 16, 6);
    await p2.fill('#kampf .kkZk input, #kampf .kkZk textarea', 'ruft');
    await p2.click('#kampf button[data-k="zug"]');
    var z = await p2.evaluate(function () { return GESENDET[0]; });
    assert.ok(/^Kampf #6 · Probefigur: nach 16\/F/.test(z), z);
    await p2.close();
    ok('der Zug nennt Nummer und Feld der späteren Karte');

    // Bis zur Bilanz, mit Ausschnitt
    var p3 = await seiteIm(ctx, B.runde3);
    assert.strictEqual(await p3.locator('#kampf .kkO').count(), 5, 'Brock ist weg: Figur, Tamsin, Späher, Treiber und der Dritte als Schatten');
    assert.strictEqual(await p3.locator('#kampf .kkO[data-w="1"]').count(), 1);
    await p3.close();
    var p4 = await seiteIm(ctx, B.ausschnitt);
    var beschriftet = await p4.evaluate(function () { return document.querySelector('#kampf .kkR svg').textContent; });
    assert.ok(/25/.test(beschriftet) && /36/.test(beschriftet), 'der Ausschnitt trägt die Nummern des Ganzen');
    await klickFeld(p4, 3, 3);
    await p4.fill('#kampf .kkZk input, #kampf .kkZk textarea', '');
    await p4.click('#kampf button[data-k="zug"]');
    var z4 = await p4.evaluate(function () { return GESENDET[0]; });
    assert.ok(/nach 27\/F/.test(z4), z4);
    await p4.close();
    var p5 = await seiteIm(ctx, B.bilanz);
    assert.strictEqual(await p5.locator('#kampf .kkBil').count(), 1, 'die Tafel steht');
    assert.strictEqual(await p5.locator('#kampf .kkBiZ polygon').count(), 2, 'mit den Steinen aus dem Browser');
    await p5.close();
    ok('Ausschnitt und Bilanz aus dem Browser');

    // Leerer Browser
    var ctxL = await b.newContext({ viewport: { width: 390, height: 600 } });
    var pL = await seiteIm(ctxL, B.runde2);
    assert.strictEqual(await pL.locator('#kampf svg').count(), 0, 'keine Karte');
    assert.ok(/liegt nicht in diesem Browser/.test(await pL.innerText('#kampf')));
    assert.deepStrictEqual(await pL.evaluate(function () { return GESENDET; }), [], 'von selbst schickt sie nichts: alte Karten laufen beim Zurückblättern noch einmal');
    await pL.click('#kampf button');
    assert.deepStrictEqual(await pL.evaluate(function () { return GESENDET; }), ['(Karte ganz: ' + B.ID + ')'], 'erst der Knopf');
    assert.strictEqual(await pL.locator('#kampf button[disabled]').count(), 1);
    ok('leerer Browser: Hinweis und Knopf, nichts von selbst');

    // Schreibfehler am Handy
    var kaputt = kopie(B.runde1); kaputt.kampf = 'pf-s1-2'; kaputt.boden[5] = kaputt.boden[5].slice(0, 30);
    var pK = await seiteIm(ctxL, kaputt);
    assert.ok(/Zeile F hat 30 statt 36 Zeichen/.test(await pK.innerText('#kampf .kkWarn')));
    assert.strictEqual(await pK.locator('#kampf svg').count() > 0, true, 'die Karte steht trotzdem');
    await pK.click('#kampf .kkWarn button');
    assert.deepStrictEqual(await pK.evaluate(function () { return GESENDET; }), ['(Karte ganz: pf-s1-2)']);
    ok('Schreibfehler stehen auf der Karte, mit Knopf');

    // Ohne erlaubten Speicher (about:blank): Die ganze Karte zeichnet, die spätere fehlt
    var pO = await ctxL.newPage(), fO = [];
    pO.on('pageerror', function (e) { fO.push(String(e)); });
    await pO.route('https://cdn.jsdelivr.net/**', function (r) { r.fulfill({ status: 200, contentType: 'application/javascript', body: code }); });
    await pO.route('https://fonts.googleapis.com/**', function (r) { r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
    await pO.setContent('<!doctype html><meta charset="utf-8"><script>window.sendPrompt=function(){}; Object.defineProperty(window,"localStorage",{get:function(){throw new DOMException("nein","SecurityError")}});</script>' + aufruf(B.runde1));
    await pO.waitForSelector('#kampf svg');
    assert.deepStrictEqual(fO, [], 'ein verbotener Speicher hält die Karte nicht auf');
    await pO.setContent('<!doctype html><meta charset="utf-8"><script>window.sendPrompt=function(){}; Object.defineProperty(window,"localStorage",{get:function(){throw new DOMException("nein","SecurityError")}});</script>' + aufruf(B.runde2));
    await pO.waitForFunction(function () { return /liegt nicht in diesem Browser/.test(document.querySelector('#kampf').textContent); });
    ok('verbotener Speicher: die ganze Karte zeichnet, die spätere bittet um die ganze');

    assert.deepStrictEqual(p1.fehler.concat(p2.fehler, p3.fehler, p4.fehler, p5.fehler, pG.fehler, pL.fehler, pK.fehler), [], 'keine Seitenfehler');
    ok('keine Fehler');
    console.log('\n' + n + ' Prüfungen bestanden.');
  } finally { await b.close(); }
})().catch(function (e) { console.error(e); process.exit(1); });
