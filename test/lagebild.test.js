// Prüft das Lagebild (lagebild.js): Felder und Entfernungen nach PHB 2014, Zeichnung, Formprüfung (keine Werte der
// Gegner), und mit Playwright die Bedienung im Browser: Tippen auf Wesen und Felder, Reihenfolge, Legende, Glossarknopf.
// Erfundene Welt der Tests (test/lagebild-beispiel.js), keine Daten einer Figur. Ohne Playwright läuft nur der Node-Teil.
'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path');
var L = require(path.join(__dirname, '..', 'lagebild.js'));
var beispiel = require(path.join(__dirname, 'lagebild-beispiel.js'));
var n = 0;
function pruefe(name, f) { f(); n++; console.log('ok  ' + name); }
function klon(o) { return JSON.parse(JSON.stringify(o)); }

pruefe('Felder heißen wie beim Schach, A1 links oben', function () {
  assert.deepStrictEqual(L.feldLesen('G5'), { x: 6, y: 4 });
  assert.deepStrictEqual(L.feldLesen('a1'), { x: 0, y: 0 });
  assert.strictEqual(L.feldName(6, 4), 'G5');
  assert.strictEqual(L.feldName(9, 7), 'J8');
  assert.strictEqual(L.feldLesen('5G'), null);
});

pruefe('Entfernung: jedes Feld zählt eins, auch schräg; große Wesen vom nächsten Feld', function () {
  var D = L.vorbereiten(beispiel), du = D._du;
  function w(id) { return D.wesen.filter(function (x) { return x.id === id; })[0]; }
  assert.strictEqual(L.entfernung(du, w('w1')), 1, 'D5 → E4 ist ein Feld, schräg');
  assert.strictEqual(L.entfernung(du, w('w3')), 4, 'D5 → H4');
  assert.strictEqual(L.entfernung(du, w('jost')), 1);
  assert.strictEqual(L.entfernung(du, { _x: 3, _y: 4, groesse: 1 }), 0, 'das eigene Feld');
  assert.strictEqual(L.entfernung({ _x: 0, _y: 0, groesse: 2 }, { _x: 3, _y: 3, groesse: 1 }), 2, '2 × 2 Felder ab A1 bis D4');
});

pruefe('Vorbereiten: Zeichen, Rechtecke, Kreise', function () {
  var D = L.vorbereiten(beispiel);
  assert.deepStrictEqual(D.wesen.map(function (w) { return w._zeichen; }), ['Pr', 'Jo', 'Gr', 'Il', 'W1', 'W2', 'W3', 'Ho']);
  assert.strictEqual(D._zellen.filter(function (z) { return z.art === 'wasser'; }).length, 20, 'A7 bis J8');
  assert.strictEqual(D._zellen.filter(function (z) { return z.art === 'mauer' && z.name === 'Mauer des Speichers'; }).length, 3);
  assert.strictEqual(D.bereiche[0]._drin.length, 13, 'r = 2: die Achsen, nicht die Ecken');
  assert.strictEqual(L.vorbereiten({ breite: 12, hoehe: 12, bereiche: [{ feld: 'F6', r: 4 }] }).bereiche[0]._drin.length, 49, 'r = 4 (6 m, etwa Sleep)');
  assert.strictEqual(L.vorbereiten({ wesen: [{ name: 'Goblin', art: 'feind', x: 2, y: 3 }] }).wesen[0]._feld, 'B3', 'x und y zählen ab 1 wie die Beschriftung');
});

pruefe('Zeichnung: Wesen, Gelände, Bereich, Kompass, Pergament', function () {
  var e = L.zeichne(beispiel);
  assert.strictEqual((e.svg.match(/class="lO/g) || []).length, 8, 'acht Marken');
  assert.strictEqual((e.svg.match(/class="lG"/g) || []).length, 35, 'Geländefelder');
  assert.ok(e.svg.indexOf('class="lP"') >= 0 && e.svg.indexOf('prefers-color-scheme:dark') >= 0, 'Pergament, gedämpft im Dunkeln');
  assert.ok(/aria-label="Wegelagerer 1, E4, schwer verletzt"/.test(e.svg));
  assert.ok(e.svg.indexOf('>N<') >= 0, 'Kompass');
  assert.ok(e.svg.indexOf('Schlaf · 3 m') >= 0);
  assert.strictEqual(e.liste.filter(function (x) { return x.typ === 'wesen'; }).length, 8);
  assert.ok(e.legende.indexOf('1 Feld = 1,5 m') >= 0 && e.legende.indexOf('Schilf') >= 0 && e.legende.indexOf('Grube') < 0, 'Legende nur mit dem, was vorkommt');
  var ohne = L.zeichne({ titel: 'leer' });
  assert.ok(ohne.svg.indexOf('>N<') < 0 && ohne.breite === 24 + 10 * 40 + 12, 'ohne norden kein Kompass, 10 × 8 Felder');
  assert.throws(function () { L.zeichne({ breite: 40 }); }, /zwischen 3 und 16/);
});

pruefe('Bewegung: schräg eins, Schilf und Wasser doppelt, Gegner versperren, auf Freunden nicht enden', function () {
  var B = { breite: 10, hoehe: 8, gelaende: [{ art: 'schilf', von: 'A2', bis: 'J2' }, { art: 'mauer', feld: 'D4' }],
    wesen: [{ id: 'du', name: 'Du', art: 'figur', feld: 'B4', bewegung: 9 }, { id: 'k', name: 'K', art: 'gefolge', feld: 'B5' },
      { id: 's', name: 'S', art: 'feind', feld: 'G4' }, { id: 't', name: 'T', art: 'feind', feld: 'C3', zustand: 'tot' }], aktiv: 'du' };
  var D = L.vorbereiten(B), k = D._weg.kosten;
  function f(n) { var l = L.feldLesen(n); return k[l.x + ',' + l.y]; }
  function weit(n) { var l = L.feldLesen(n); return L.kostenBis(D, D._du, l.x, l.y); }
  assert.strictEqual(f('H3'), 6, 'sechs Felder schräg und gerade, 9 m');
  assert.strictEqual(f('H2'), undefined, 'H2 im Schilf kostet sieben');
  assert.strictEqual(weit('H2'), 7);
  assert.strictEqual(f('B5'), undefined, 'auf Ksshars Feld endet man nicht');
  assert.strictEqual(f('D4'), undefined, 'Mauer'); assert.strictEqual(weit('D4'), null);
  assert.strictEqual(weit('G4'), null, 'ein Gegner versperrt sein Feld');
  assert.strictEqual(f('C3'), 1, 'ein Toter versperrt nicht');
  assert.strictEqual(f('B4'), 0, 'stehen bleiben');
  var gross = L.erreichbar(L.vorbereiten({ wesen: [] }), { _x: 0, _y: 0, groesse: 2, art: 'tier', bewegung: 3 });
  assert.strictEqual(gross['2,2'], 2, 'ein großes Tier, 2 × 2 Felder');
  var ohne = L.vorbereiten({ wesen: [{ id: 'du', name: 'Du', art: 'figur', feld: 'A1' }], aktiv: 'du' });
  assert.strictEqual(ohne._weg, null, 'ohne bewegung keine Felder');
});

pruefe('Reichweiten und Ziele', function () {
  var D = L.vorbereiten(beispiel), du = D._du;
  assert.strictEqual(L.inReichweite(D, du, 1).length, 8, 'Langschwert: die acht Nachbarn');
  assert.strictEqual(L.inReichweite(D, du, 12).length, 79, 'Starry Wisp, 18 m: das ganze Feld außer dem eigenen');
  var e = L.zeichne(beispiel);
  assert.strictEqual((e.svg.match(/class="lRw"/g) || []).length, 2, 'zwei Reichweiten, verborgen');
  assert.strictEqual(e.liste.filter(function (x) { return x.typ === 'ziel'; }).length, 2, 'zwei Pfeile');
  assert.ok(e.svg.indexOf('marker-end="url(#lbPfeil)"') >= 0);
  assert.strictEqual(e.liste.filter(function (x) { return x.typ === 'bewegung'; })[0].felder, 66);
  assert.ok(e.legende.indexOf('erreichbar (Probefigur, 9 m)') >= 0 && e.legende.indexOf('greift an') >= 0);
  var f = L.vorbereiten({ wesen: [{ name: 'G', art: 'feind', feld: 'A1', bewegung: 9, reichweiten: [{ name: 'Bogen', m: 24 }] }] }).wesen[0];
  assert.strictEqual(f.bewegung, null); assert.deepStrictEqual(f.reichweiten, [], 'Gegner zeigen weder Bewegung noch Reichweite');
});

pruefe('Formprüfung: das Beispiel geht durch', function () {
  var p = L.pruefen(beispiel);
  assert.deepStrictEqual(p.fehler, []); assert.ok(p.ok); assert.strictEqual(p.wesen, 8);
});

pruefe('Formprüfung: keine Werte der Gegner, keine fremden Felder', function () {
  var p = L.pruefen({ titel: 'x', geheim: 1, wesen: [
    { name: 'Goblin', art: 'feind', feld: 'A1', tp: [7, 7], rk: 15 },
    { name: 'Goblin', art: 'feind', feld: 'A9', zustand: 'leicht angekratzt' },
    { name: 'Riese', art: 'feind', feld: 'J8', groesse: 2 },
    { id: 'g', name: 'A', art: 'feind', feld: 'B2' }, { id: 'g', name: 'B', art: 'npc', feld: 'B2' }
  ], gelaende: [{ art: 'lava', feld: 'C3' }, { art: 'mauer', von: 'C1', bis: 'Z1' }], bereiche: [{ feld: 'C3' }], initiative: ['nix'], aktiv: 'nix', breite: 12 });
  function hat(t) { assert.ok(p.fehler.some(function (f) { return f.indexOf(t) >= 0; }), 'Fehler erwartet: ' + t + '\n' + p.fehler.join('\n')); }
  hat('Unbekanntes Feld „geheim“'); hat('unbekanntes Feld „rk“'); hat('tp gibt es nur für figur, gefolge und tier');
  hat('zustand muss eins sein von'); hat('liegt außerhalb'); hat('ragt über den Rand'); hat('id „g“ doppelt');
  var q = L.pruefen({ wesen: [{ id: 'g', name: 'G', art: 'feind', feld: 'A1', bewegung: 9, reichweiten: [{ name: 'Bogen', m: 24 }], ziel: 'x' },
    { id: 'du', name: 'Du', art: 'figur', feld: 'B2', reichweiten: [{ name: 'Wisp', m: 18, schaden: '1W8' }] }], aktiv: 'du' });
  ['bewegung gibt es nur für figur', 'reichweiten gibt es nur für figur', 'ziel nennt „x“', 'reichweiten ist eine Liste aus {name, m}'].forEach(function (t) {
    assert.ok(q.fehler.some(function (f) { return f.indexOf(t) >= 0; }), 'Fehler erwartet: ' + t);
  });
  assert.ok(q.hinweise.some(function (h) { return h.indexOf('keine bewegung') >= 0; }));
  hat('unbekannte Art „lava“'); hat('bis fehlt oder liegt außerhalb'); hat('r (Felder) fehlt'); hat('initiative nennt „nix“'); hat('aktiv nennt „nix“');
  assert.ok(p.hinweise.some(function (h) { return h.indexOf('demselben Feld') >= 0; }) && p.hinweise.some(function (h) { return h.indexOf('Mehr als 10 Spalten') >= 0; }));
  assert.ok(!p.ok);
  var ok = L.pruefen({ titel: 'x', wesen: [{ name: 'Du', art: 'figur', feld: 'A1', tp: [9, 12] }, { name: 'Pferd', art: 'tier', x: 2, y: 2, tp: [13, 13], groesse: 2 }] });
  assert.deepStrictEqual(ok.fehler, []);
});

/* ---------- Im Browser ---------- */
var chromium = null;
try { chromium = require('playwright').chromium; } catch (e) { console.log('Playwright fehlt: der Browser-Teil entfällt (npm i playwright).'); }

var code = fs.readFileSync(path.join(__dirname, '..', 'lagebild.js'), 'utf8');
function aufruf(daten) {
  return '<h2 class="sr-only">Lagebild: Steg von Rohrdorf, Runde 2</h2>\n' +
    '<div id="lagebild">Lagebild lädt … Falls nicht, frag nach der Lage als Text.</div>\n' +
    '<script>var LAGEBILD=' + JSON.stringify(daten) + '</script>\n' +
    '<script>var s=document.createElement(\'script\');s.src=\'https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/lagebild.js\';document.head.appendChild(s);</script>';
}
async function seite(b, daten, opt) {
  var pg = await b.newPage({ viewport: { width: opt && opt.breite || 380, height: 900 } }), fehler = [];
  pg.on('pageerror', function (e) { fehler.push(String(e)); });
  pg.on('console', function (m) { if (m.type() === 'error') fehler.push(m.text()); });
  await pg.route('https://cdn.jsdelivr.net/**', function (r) { r.fulfill({ status: 200, contentType: 'application/javascript', body: code }); });
  await pg.route('https://fonts.googleapis.com/**', function (r) { r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
  var stub = opt && opt.ohnePrompt ? '' : '<script>window.GESENDET=[];window.sendPrompt=function(t){GESENDET.push(t)}</script>';
  await pg.setContent('<!doctype html><meta charset="utf-8">' + (opt && opt.dunkel ? '<script>document.documentElement.setAttribute("data-mode","dark")</script>' : '') + stub + aufruf(daten));
  await pg.waitForSelector('#lagebild svg');
  pg.fehler = fehler;
  return pg;
}
async function feldTippen(pg, feld) {
  var l = L.feldLesen(feld), box = await pg.$eval('#lagebild svg', function (s) { var r = s.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, vb: s.viewBox.baseVal.width }; });
  var f = box.w / box.vb;
  await pg.mouse.click(box.x + (24 + l.x * 40 + 20) * f, box.y + (22 + l.y * 40 + 20) * f);
}

(async function () {
  if (!chromium) { console.log(n + ' Prüfungen bestanden.'); return; }
  var b = await chromium.launch();
  try {
    var pg = await seite(b, beispiel);
    assert.strictEqual((await pg.textContent('.ltT')).trim(), 'Steg von Rohrdorf');
    assert.ok(await pg.$('link#lbSchrift'), 'Schriften werden selbst geladen');
    assert.deepStrictEqual(await pg.$$eval('.ltC', function (e) { return e.map(function (x) { return x.textContent.trim().replace(/\s+/g, ' '); }); }),
      ['Wegelagerer 3 flieht', 'Probefigur TP 14/17', 'Wegelagerer 1 schwer verletzt', 'Jost TP 9/11', 'Wegelagerer 2', 'Hofhund tot'], 'Reihenfolge aus initiative');
    assert.ok(await pg.$('.ltC.ltA:has-text("Probefigur")'), 'wer dran ist, steht hervorgehoben');
    assert.strictEqual((await pg.textContent('.ltI')).trim(), 'Tippe auf ein Wesen oder ein Feld.');
    n++; console.log('ok  Kopf, Reihenfolge, Hinweis aus dem Vier-Zeilen-Aufruf');

    await pg.click('.lO[data-i="4"]');
    assert.strictEqual((await pg.textContent('.ltI')).trim(), 'Wegelagerer 1 · Gegner · E4 · schwer verletzt · neben dir · Knüppel, humpelt');
    assert.strictEqual((await pg.textContent('button[data-k="glossar"]')).trim(), 'Glossar Wegelagerer 1 ↗');
    assert.ok(await pg.$('.lO.lS[data-i="4"]') && await pg.$('.ltC.ltS[data-i="4"]'), 'Auswahl auf Karte und in der Reihe');
    await pg.click('.lO[data-i="0"]');
    assert.strictEqual((await pg.textContent('.ltI')).trim(), 'Probefigur · du · D5 · ist dran · TP 14/17 · noch 9 m Bewegung');
    assert.ok(await pg.$eval('button[data-k="glossar"]', function (b) { return b.hidden; }), 'kein Glossarknopf für die eigene Figur');
    n++; console.log('ok  Tippen auf ein Wesen: Zustand, Entfernung, Notiz, Glossarknopf');

    await feldTippen(pg, 'H6');
    assert.strictEqual((await pg.textContent('.ltI')).trim(), 'H6 · frei · in: Schlaf · 3 m · 4 Felder (6 m) von dir · erreichst du mit 6 m');
    await feldTippen(pg, 'C3');
    assert.strictEqual((await pg.textContent('.ltI')).trim(), 'C3 · Schutt · schwieriges Gelände · 2 Felder (3 m) von dir · erreichst du mit 4,5 m');
    await feldTippen(pg, 'J8');
    assert.strictEqual((await pg.textContent('.ltI')).trim(), 'J8 · Der Fluss · waten oder schwimmen · 6 Felder (9 m) von dir · zu weit: 12 m, du hast noch 9 m');
    await feldTippen(pg, 'E4');
    assert.ok((await pg.textContent('.ltI')).indexOf('Wegelagerer 1') === 0, 'ein belegtes Feld zeigt das Wesen');
    n++; console.log('ok  Tippen auf ein Feld: Name, Gelände, Bereich, Entfernung');

    await pg.click('.ltC[data-i="1"]');
    assert.strictEqual((await pg.textContent('.ltI')).trim(), 'Jost · Gefolge · C5 · TP 9/11 · angeschlagen · neben dir · greift Wegelagerer 1 an');
    await pg.click('button[data-k="glossar"]');
    assert.deepStrictEqual(await pg.evaluate('GESENDET'), ['Glossar Jost'], 'nur der Glossarknopf schickt etwas');
    assert.ok(await pg.$eval('.ltL', function (l) { return l.hidden; }));
    await pg.click('button[data-k="leg"]');
    assert.ok(!(await pg.$eval('.ltL', function (l) { return l.hidden; })) && (await pg.textContent('.ltL')).indexOf('1 Feld = 1,5 m') >= 0);
    assert.deepStrictEqual(pg.fehler, []);
    n++; console.log('ok  Reihe, Glossar und Legende');

    await pg.click('.lO[data-i="0"]');
    assert.deepStrictEqual(await pg.$$eval('.ltRw button', function (b) { return b.map(function (x) { return x.textContent; }); }), ['Langschwert · 1,5 m', 'Starry Wisp · 18 m']);
    assert.ok(await pg.$eval('.lRw[data-rw="0-1"]', function (g) { return g.style.display === 'none'; }));
    await pg.click('.ltRw button:has-text("Starry Wisp")');
    assert.ok(await pg.$eval('.lRw[data-rw="0-1"]', function (g) { return g.style.display === ''; }), 'Ring an');
    await pg.click('.ltRw button:has-text("Langschwert")');
    assert.ok(await pg.$eval('.lRw[data-rw="0-1"]', function (g) { return g.style.display === 'none'; }) && await pg.$eval('.lRw[data-rw="0-0"]', function (g) { return g.style.display === ''; }), 'immer nur ein Ring');
    await pg.click('.ltRw button:has-text("Langschwert")');
    assert.ok(await pg.$eval('.lRw[data-rw="0-0"]', function (g) { return g.style.display === 'none'; }), 'zweiter Tipp: aus');
    await pg.click('.lO[data-i="4"]');
    assert.strictEqual(await pg.$$eval('.ltRw button', function (b) { return b.length; }), 0, 'ein Gegner hat keine Ringe');
    assert.ok(await pg.$('.lW rect'), 'erreichbare Felder sind getönt');
    assert.deepStrictEqual(pg.fehler, []);
    n++; console.log('ok  Bewegung, Reichweiten und Ziele im Browser');
    await pg.close();

    pg = await seite(b, beispiel, { ohnePrompt: true, dunkel: true, breite: 760 });
    await pg.click('.lO[data-i="1"]');
    assert.ok(await pg.$eval('button[data-k="glossar"]', function (b) { return b.hidden; }), 'ohne sendPrompt kein Glossarknopf');
    assert.strictEqual(await pg.$eval('.lP', function (r) { return getComputedStyle(r).fill; }), 'rgb(216, 201, 163)', 'Pergament gedämpft im Dunkeln');
    assert.deepStrictEqual(pg.fehler, []);
    n++; console.log('ok  Ohne sendPrompt, dunkler Modus, breiter Bildschirm');
    await pg.close();
  } finally { await b.close(); }
  console.log(n + ' Prüfungen bestanden.');
})().catch(function (e) { console.error(e); process.exit(1); });
