// Prüft die Kachelsets der Kampfkarte (1.11): die Zeichen und was sie kosten, alle zehn Sets auf derselben Karte, `zeichnung`, was die Figur nicht sieht,
// spätere Karten aus dem Browser, das Laden von kacheln.js und was geschieht, wenn es nicht lädt. Erfundene Welt (test/kampf-sets-beispiel.js).
// Braucht Playwright mit Chromium: node test/kampf-sets.test.js
'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path');
var chromium = require('playwright').chromium;
var code = fs.readFileSync(path.join(__dirname, '..', 'kampf.js'), 'utf8'), kachelCode = fs.readFileSync(path.join(__dirname, '..', 'kacheln.js'), 'utf8');
var KA = require('../kacheln.js'), kampf = require('../kampf.js'), B = require('./kampf-sets-beispiel.js');
var n = 0;
function ok(name) { n++; console.log('ok  ' + name); }
function kopie(o) { return JSON.parse(JSON.stringify(o)); }
function ganzGefaltet() { return kampf.falten([kopie(B.ganz)]); }

// Ohne Browser
(function () {
  // Die Zeichen und was sie kosten
  var A = kampf.arten;
  'FWL'.split('').forEach(function (c) { assert.strictEqual(A[c].kosten, 0, c + ' ist gesperrt'); assert.ok(A[c].wand, c + ' ist eine Wand'); });
  'szclhTf'.split('').forEach(function (c) { assert.strictEqual(A[c].kosten, 1, c + ' kostet 1'); assert.ok(!A[c].deckung); });
  'pktr'.split('').forEach(function (c) { assert.strictEqual(A[c].kosten, 2, c + ' kostet 2'); assert.strictEqual(A[c].deckung, 'halbe', c + ' gibt halbe Deckung'); });
  'SHbu'.split('').forEach(function (c) { assert.strictEqual(A[c].kosten, 2, c + ' kostet 2'); assert.ok(!A[c].deckung); });
  ok('die neuen Zeichen kosten, was die Kacheln sagen');
  function deckung(z, von, ziel) {
    var K = kampf.lies({ spalten: z[0].length, zeilen: z.length, boden: z, figur: 'f', wesen: [{ id: 'f', name: 'F', art: 'figur', x: von[0], y: von[1] }, { id: 'g', name: 'G', art: 'gegner', x: ziel[0], y: ziel[1] }] });
    return kampf.deckung(K, K.figur, K.wesen[1]);
  }
  assert.deepStrictEqual([deckung(['..W..'], [1, 1], [5, 1]).stufe, deckung(['..W..'], [1, 1], [5, 1]).grund], [3, 'eine Wand bei 3/A']);
  assert.strictEqual(deckung(['..L..'], [1, 1], [5, 1]).stufe, 3);
  assert.strictEqual(deckung(['..F..'], [1, 1], [5, 1]).grund, 'der Fels bei 3/A');
  assert.strictEqual(deckung(['..k..'], [1, 1], [5, 1]).stufe, 1);
  assert.strictEqual(deckung(['..t..'], [1, 1], [5, 1]).stufe, 1);
  assert.strictEqual(deckung(['..S..'], [1, 1], [5, 1]).stufe, 0);
  assert.strictEqual(deckung(['..O..'], [1, 1], [5, 1]).stufe, 2);
  ok('die neuen Zeichen in der Deckung');
  // Alle zehn Sets kennen jedes Zeichen, was sie nicht zeichnen, steht auf ihrem Grund
  assert.deepStrictEqual(KA.sets.map(function (s) { return s.id; }), kampf.gelaende, 'die Liste der Karte ist die Liste der Sets');
  KA.sets.forEach(function (s) {
    Object.keys(A).forEach(function (c) { assert.ok(KA.kachelVon(s, kampf.setZeichen(KA, s, c)), s.id + ': ' + JSON.stringify(c)); });
    assert.strictEqual(kampf.setZeichen(KA, s, 'g'), '.', 'Gras steht auf dem Grund');
    assert.strictEqual(kampf.setZeichen(KA, s, '?'), '.', 'Ungesehenes auch');
  });
  var su = KA.sets.filter(function (s) { return s.id === 'sumpf'; })[0], be = KA.sets.filter(function (s) { return s.id === 'berge'; })[0];
  assert.strictEqual(kampf.setZeichen(KA, su, ','), 'i', 'im Sumpf ist seicht `i`');
  assert.strictEqual(kampf.setZeichen(KA, be, ','), '~', 'in den Bergen gibt es kein Seichtes');
  assert.strictEqual(kampf.setZeichen(KA, su, 'm'), 'm', 'der Sumpf zeichnet den Morast');
  assert.strictEqual(kampf.setZeichen(KA, be, 'm'), ':', 'die Berge nicht');
  ok('alle Sets kennen jedes Zeichen');
  // Alle zehn Sets zeichnen dieselbe Karte: das Set liegt unter den Feldern, die alten Kacheln fehlen, die Felder zum Tippen bleiben
  KA.sets.forEach(function (s) {
    var D = ganzGefaltet(); D.gelaende = s.id;
    var g = kampf.zeichne(D), t = g.svg;
    assert.ok(!/undefined|NaN/.test(t), s.id + ': kein undefined und kein NaN');
    assert.strictEqual((t.match(/class="kkSet"/g) || []).length, 1, s.id + ': ein Set');
    assert.ok(t.indexOf('class="kkSet"') < t.indexOf('class="kkF'), s.id + ': das Set liegt unter den Feldern');
    assert.ok(!/url\(#kkM-/.test(t), s.id + ': keine alte Kachel');
    assert.ok(!/class="kkHo"|class="kkG"|class="kkLd"/.test(t), s.id + ': kein alter Höhenton, kein zweites Raster, kein altes Licht');
    assert.strictEqual((t.match(/<rect [^>]*class="kkK"/g) || []).length, 26 * 12, s.id + ': alle Felder zum Tippen');
    assert.strictEqual((t.match(/url\(#kkUngesehen\)/g) || []).length, 8, s.id + ': die acht Felder, die die Figur nicht sieht');
    assert.ok(g.legende.indexOf(KA.kachelVon(s, 'O').name) >= 0, s.id + ': die Legende nennt den Baum des Sets: ' + KA.kachelVon(s, 'O').name);
  });
  ok('alle zehn Sets zeichnen dieselbe Karte');
  // Ohne `gelaende` oder mit unbekanntem: die alten Kacheln, auch für die neuen Zeichen
  var D0 = ganzGefaltet(); delete D0.gelaende;
  var t0 = kampf.zeichne(D0).svg;
  assert.ok(t0.indexOf('kkSet') < 0 && /url\(#kkM-/.test(t0), 'ohne Gelände die alten Kacheln');
  assert.ok(!/undefined|NaN/.test(t0));
  var D1 = ganzGefaltet(); D1.gelaende = 'mond';
  assert.ok(kampf.zeichne(D1).svg.indexOf('kkSet') < 0, 'unbekanntes Gelände: die alten Kacheln');
  assert.deepStrictEqual(kampf.kartenFehler(D1), ['das Gelände „mond“ gibt es nicht'], 'und ein Schreibfehler');
  assert.deepStrictEqual(kampf.kartenFehler(ganzGefaltet()), [], 'das Beispiel ist sauber');
  ok('ohne Gelände die alten Kacheln');
  // `zeichnung` mit Feldnamen, auch in einem Ausschnitt
  var K2 = kampf.lies({ spalten: 6, zeilen: 4, ursprung: [10, 'C'], boden: ['......', '......', '......', '......'], hoehe: ['001100', '00a100', '000000', '000000'] });
  var Z2 = kampf.zeichnungFuerMotor(K2, { _ux: 10, _uy: 3, zeichnung: { kochtopf: ['12/D', '40/A'], erloschen: [[2, 1]], drehung: { '11/C': 90, '40/A': 90 }, stroemung: [['15/F', 180], ['1/A', 90]], gosse: [['1/D', '12/D']], planen: [['30/A', '40/A']], kran: [['10/C', '11/D', 180, 118]], dachboden: true } });
  assert.deepStrictEqual(Z2.kochtopf, [[3, 2]], 'im Ausschnitt ab 10/C; was draußen liegt, fällt weg');
  assert.deepStrictEqual(Z2.erloschen, [[2, 1]], 'Spalte und Zeile der Karte gelten auch');
  assert.deepStrictEqual(Z2.drehung, { '2,1': 90 });
  assert.deepStrictEqual(Z2.stroemung, [[6, 4, 180]]);
  assert.deepStrictEqual(Z2.gosse, [[1, 2, 3, 2]], 'was über den Rand ragt, endet dort');
  assert.deepStrictEqual(Z2.planen, [], 'ganz draußen: nichts');
  assert.deepStrictEqual(Z2.kran, [[1, 1, 2, 2, 180, 118]]);
  assert.strictEqual(Z2.dachboden, true);
  assert.deepStrictEqual(Z2.hang.map(String).sort(), ['3,1', '3,2', '4,2'], 'die Rampe und die Felder eine Ebene höher daneben');
  ok('zeichnung mit Feldnamen');
  // Spätere Karten: `gelaende` und `zeichnung` bleiben, `aendern` zeigt das Echte
  var S = kampf.falten([kopie(B.ganz), kopie(B.spaeter)]);
  assert.strictEqual(S.gelaende, 'kueste');
  assert.deepStrictEqual(S.zeichnung.kochtopf, ['6/F']);
  assert.strictEqual(S.boden[6].slice(4, 8), 'llll', 'aufgedeckt');
  var tS = kampf.zeichne(kopie(S)).svg;
  assert.strictEqual((tS.match(/url\(#kkUngesehen\)/g) || []).length, 0, 'nichts mehr ungesehen');
  ok('spätere Karte aus dem Browser');
})();

function aufruf(d) {
  return '<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><div id="kampf">Kampfkarte lädt …</div><script>var KAMPF=' + JSON.stringify(d) + '</script>' +
    '<script>var s=document.createElement("script");s.src="https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/kampf.js";document.head.appendChild(s);</script>';
}
async function bereit(ctx, adresse, d, fehler) {
  await ctx.route('https://probe.test/' + adresse, function (r) { r.fulfill({ contentType: 'text/html;charset=utf-8', body: aufruf(d) }); });
  var p = await ctx.newPage();
  p.on('pageerror', function (e) { fehler.push(e.message); });
  await p.addInitScript(function () { window.sendPrompt = function (t) { window.__zug = t; }; });
  await p.goto('https://probe.test/' + adresse);
  await p.waitForSelector('#kampf svg', { timeout: 20000 });
  return p;
}
async function tippe(p, x, y) {
  await p.evaluate(function (a) { document.querySelector('g.kkF[data-x="' + a[0] + '"][data-y="' + a[1] + '"] rect.kkK').dispatchEvent(new MouseEvent('click', { bubbles: true })); }, [x, y]);
}

(async function () {
  var b = await chromium.launch(), fehler = [], ladungen = 0;
  function neuerKontext(kachelnFehlen) {
    return b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }).then(async function (ctx) {
      await ctx.route('https://cdn.jsdelivr.net/**', function (r) {
        if (/kacheln\.js$/.test(r.request().url())) {
          ladungen++;
          if (kachelnFehlen) return r.abort();
          return r.fulfill({ contentType: 'text/javascript;charset=utf-8', body: kachelCode });
        }
        r.fulfill({ contentType: 'text/javascript;charset=utf-8', body: code });
      });
      await ctx.route('https://fonts.googleapis.com/**', function (r) { r.fulfill({ contentType: 'text/css', body: '' }); });
      await ctx.route('https://fonts.gstatic.com/**', function (r) { r.fulfill({ status: 204, body: '' }); });
      return ctx;
    });
  }
  try {
    // Erste Karte, das Set lädt von selbst neben kampf.js
    var ctx = await neuerKontext(false);
    var p1 = await bereit(ctx, 'eins', B.ganz, fehler);
    assert.ok(await p1.$('svg.kkSet'), 'das Set liegt auf der Karte');
    assert.strictEqual(ladungen, 1, 'kacheln.js einmal geladen');
    assert.deepStrictEqual(await p1.$$eval('.kkWarn', function (w) { return w.length; }), 0, 'keine Warnung');
    assert.ok(await p1.$('svg.kkSet pattern'), 'mit den Mustern des Sets');
    ok('kacheln.js lädt neben kampf.js');
    // Der Zug läuft wie immer, und die Auskunft nennt das Gelände mit dem Namen des Sets
    await tippe(p1, 9, 10);
    var titel = await p1.$eval('.kkCh-weg', function (e) { return e.getAttribute('title'); });
    assert.ok(/9\/J: Sand und Kies/.test(titel), 'die Auskunft nennt den Namen aus dem Set: ' + titel);
    await tippe(p1, 10, 10);
    await p1.click('[data-k="zug"]');
    var zug = await p1.evaluate(function () { return window.__zug; });
    assert.ok(/^Kampf #5 · Probefigur: nach 9\/J \(1,5 m\) · nach 10\/J \(1,5 m\)/.test(zug), zug);
    ok('der Zug auf dem Set');
    await p1.close();
    // Eine spätere Karte aus dem Browser: keine Zeile Boden im Aufruf, das Set kommt trotzdem
    var p2 = await bereit(ctx, 'zwei', B.spaeter, fehler);
    assert.ok(await p2.$('svg.kkSet'), 'das Set auf der späteren Karte');
    assert.strictEqual(await p2.$$eval('.kkO', function (w) { return w.length; }), 3, 'die Wesen aus dem Browser');
    var knoepfe = await p2.$$eval('.kkAk button', function (k) { return k.map(function (x) { return x.textContent.trim(); }); });
    assert.ok(knoepfe.indexOf('Langschwert') >= 0, 'die Waffe aus dem Browser');
    await p2.close();
    // Zurückblättern: die erste Karte zeigt noch, was die Figur nicht sah
    var p3 = await bereit(ctx, 'eins', B.ganz, fehler);
    assert.strictEqual(await p3.$$eval('rect[fill="url(#kkUngesehen)"]', function (w) { return w.length; }), 8, 'die erste Karte hat ihre acht ungesehenen Felder');
    await p3.close();
    var p3b = await bereit(ctx, 'zwei', B.spaeter, fehler);
    assert.strictEqual(await p3b.$$eval('rect[fill="url(#kkUngesehen)"]', function (w) { return w.length; }), 0, 'die zweite nicht');
    await p3b.close(); await ctx.close();
    ok('spätere Karte und Zurückblättern');
    // Lädt kacheln.js nicht, zeichnet die Karte wie bisher und meldet nichts
    var ctx2 = await neuerKontext(true);
    var p4 = await bereit(ctx2, 'eins', B.ganz, fehler);
    assert.ok(!(await p4.$('svg.kkSet')), 'kein Set');
    assert.ok(await p4.$('g.kkF[data-x="9"][data-y="10"] rect[fill^="url(#kkM-"]'), 'die alten Kacheln');
    assert.strictEqual(await p4.$$eval('.kkWarn', function (w) { return w.length; }), 0, 'keine Warnung');
    await tippe(p4, 9, 10);
    await p4.click('[data-k="zug"]');
    assert.ok(/nach 9\/J/.test(await p4.evaluate(function () { return window.__zug; })), 'der Zug geht trotzdem');
    await p4.close(); await ctx2.close();
    ok('ohne kacheln.js die alten Kacheln');
    // Ein unbekanntes Gelände lädt nichts und meldet sich
    var ctx3 = await neuerKontext(false), vorher = ladungen, falsch = kopie(B.ganz); falsch.gelaende = 'mond'; falsch.kampf = 'beispiel-111b';
    var p5 = await bereit(ctx3, 'drei', falsch, fehler);
    assert.strictEqual(ladungen, vorher, 'nichts geladen');
    assert.ok(/Gelände „mond“/.test(await p5.$eval('.kkWarn', function (e) { return e.textContent; })));
    await p5.close(); await ctx3.close();
    ok('unbekanntes Gelände');
    // Ohne `gelaende` wird kacheln.js gar nicht erst geholt
    var ctx4 = await neuerKontext(false), vorher2 = ladungen, alt = kopie(B.ganz); delete alt.gelaende; alt.kampf = 'beispiel-111c';
    var p6 = await bereit(ctx4, 'vier', alt, fehler);
    assert.strictEqual(ladungen, vorher2, 'ohne Gelände kein kacheln.js');
    await p6.close(); await ctx4.close();
    ok('ohne Gelände wird nichts geholt');
    assert.deepStrictEqual(fehler, [], 'keine Seitenfehler');
    ok('keine Fehler');
  } finally { await b.close(); }
  console.log('\n' + n + ' Prüfungen bestanden.');
})().catch(function (e) { console.error(e); process.exit(1); });
