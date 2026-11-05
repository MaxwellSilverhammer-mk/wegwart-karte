// Lädt den Titelbildschirm (titel.js) mit dem Aufruf aus Regelwerk 4.2 in Chromium und prüft Menü,
// Spielstände, Nachrichten und das fertige Bild. Erfundene Figur, keine Daten einer echten Figur.
// Braucht Playwright mit Chromium: node test/titel.test.js
'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path');
var chromium = require('playwright').chromium;
var code = fs.readFileSync(path.join(__dirname, '..', 'titel.js'), 'utf8');
var n = 0;
function ok(name) { n++; console.log('ok  ' + name); }

// Ein erfundenes Bildnis: ein 2 × 2 Pixel großes PNG, damit kein echtes Bild im Test liegt.
var BILDNIS = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVQI12P4z8DwHwyBFBhCeAwMAHbkC/Vb8m9oAAAAAElFTkSuQmCC', 'base64');
var BILD = 'https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/bildnisse/probefigur.webp';

var TITEL = {
  fuss: 'Regelwerk 3.6 · Welttag 9 · 9. Patchwall 576 CY',
  buch: 'https://claude.ai/artifact/beispiel',
  befehle: ['Questlog', 'Glossar', 'Karte', 'Inventar'],
  figuren: [{ name: 'Probefigur', zeile: 'Barde 2 · Wegwart', ort: 'Rohrdorf, Alte Eiche', datum: '9. Patchwall 576', tageszeit: 'Abend',
    welttag: 9, frist: [9, 28, 'Die Brücke bei Rohrdorf'], ep: [450, 900, 3, 300], sitzung: 4, held: true, bild: BILD }]
};

function aufruf(daten) {
  return '<h2 class="sr-only">Titelbildschirm: Die Wege von Oerik</h2>\n' +
    '<div id="titel">Titelbild lädt … Falls nicht, schreib „Spiel laden“.</div>\n' +
    '<script>var TITEL=' + JSON.stringify(daten) + '</script>\n' +
    '<script>var s=document.createElement(\'script\');s.src=\'https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/titel.js\';document.head.appendChild(s);</script>';
}

async function seite(b, daten, opt) {
  var pg = await b.newPage({ viewport: { width: 380, height: 1000 } }), fehler = [];
  pg.on('pageerror', function (e) { fehler.push(String(e)); });
  if (opt && opt.ruhig) await pg.emulateMedia({ reducedMotion: 'reduce' });
  await pg.route('https://cdn.jsdelivr.net/**', function (r) {
    var u = r.request().url();
    if (/fehlt\.webp$/.test(u)) return r.fulfill({ status: 404, body: '' });
    if (/\.webp$/.test(u)) return r.fulfill({ status: 200, contentType: 'image/png', body: BILDNIS });
    r.fulfill({ status: 200, contentType: 'application/javascript', body: code });
  });
  await pg.route('https://fonts.googleapis.com/**', function (r) { r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
  var stub = opt && opt.ohnePrompt ? '' : '<script>window.GESENDET=[];window.sendPrompt=function(t){GESENDET.push(t)}</script>';
  await pg.setContent('<!doctype html><meta charset="utf-8">' + stub + aufruf(daten));
  await pg.waitForSelector('#titel button.ts-haupt');
  pg.fehler = fehler;
  return pg;
}

(async function () {
  var b = await chromium.launch();
  try {
    var pg = await seite(b, TITEL), t0 = Date.now();
    assert.strictEqual((await pg.textContent('button.ts-haupt')).trim(), 'Spiel laden');
    assert.ok(await pg.$('link[data-ts-schrift]'), 'Schriften werden selbst geladen');
    assert.deepStrictEqual(await pg.$$eval('#titel .ts-befehle .ts-cmd', function (e) { return e.map(function (x) { return x.textContent; }); }),
      ['Spielerbuch', 'Questlog', 'Glossar', 'Karte', 'Inventar']);
    assert.strictEqual(await pg.getAttribute('a.ts-cmd', 'href'), TITEL.buch);
    assert.ok((await pg.textContent('#titel .ts-fuss')).indexOf('Welttag 9') >= 0);
    ok('Menü aus dem Vier-Zeilen-Aufruf');

    await pg.click('button.ts-haupt');
    var slot = await pg.textContent('button.ts-slot');
    ['9. Patchwall 576 · Abend', 'Probefigur', 'Barde 2 · Wegwart', 'Rohrdorf, Alte Eiche', 'Tag 9 von 28 · Die Brücke bei Rohrdorf',
      'EP 450 von 900 bis Stufe 3', 'Nach Sitzung 4', '✦ Heldenmut'].forEach(function (s) { assert.ok(slot.indexOf(s) >= 0, 'Platz zeigt „' + s + '“'); });
    assert.strictEqual(await pg.getAttribute('button.ts-slot canvas.ts-mond', 'aria-label'), 'Luna: zunehmender Mond');
    assert.strictEqual(await pg.$$eval('.ts-spur i', function (e) { return e.map(function (x) { return x.style.width; }).join(' '); }), '32% 25%');
    assert.ok((await pg.textContent('.ts-leer')).indexOf('Freier Platz') >= 0);
    ok('Spielstände: ein Platz je Figur, Mond, Frist und EP');

    await pg.waitForFunction(function () { var i = document.querySelector('button.ts-slot .ts-rahmen img.ts-bildnis'); return i && i.complete && i.naturalWidth > 0; });
    assert.strictEqual(await pg.getAttribute('button.ts-slot img.ts-bildnis', 'src'), BILD);
    assert.strictEqual(await pg.getAttribute('button.ts-slot img.ts-bildnis', 'alt'), '', 'das Bildnis ist Schmuck, der Name steht daneben');
    var lage = await pg.evaluate(function () {
      var r = document.querySelector('.ts-rahmen').getBoundingClientRect(), n = document.querySelector('.ts-name').getBoundingClientRect();
      return { links: r.right <= n.left, hoehe: Math.round(r.height) };
    });
    assert.ok(lage.links, 'das Bildnis steht links neben dem Namen');
    assert.ok(lage.hoehe > 80 && lage.hoehe < 100, 'Miniatur im Hochformat (' + lage.hoehe + ' px)');
    ok('Bildnis links neben dem Namen');

    await pg.click('button.ts-slot');
    assert.deepStrictEqual(await pg.evaluate('GESENDET'), ['Spiel laden: Probefigur']);
    assert.strictEqual((await pg.textContent('button.ts-slot .ts-laden')).trim(), 'Wird geladen …');
    await pg.click('button.ts-slot');
    assert.strictEqual((await pg.evaluate('GESENDET')).length, 1, 'zweiter Tipp schickt nichts');
    ok('Laden schickt „Spiel laden: <Name>“ einmal');

    await pg.click('button.ts-zurueck');
    await pg.click('button.ts-cmd:has-text("Karte")');
    await pg.click('button.ts-klein');
    assert.deepStrictEqual((await pg.evaluate('GESENDET')).slice(1), ['Karte', '(Wie wird gespielt?)']);
    ok('Befehle und „Wie wird gespielt?“');

    await pg.waitForSelector('#titel canvas[data-fertig]', { timeout: 180000 });
    var bunt = await pg.evaluate(function () {
      var c = document.querySelector('#titel canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, s = 0, q = 0, k = 0;
      for (var i = 0; i < d.length; i += 4 * 97) { var v = d[i] + d[i + 1] + d[i + 2]; s += v; q += v * v; k++; }
      return Math.sqrt(q / k - (s / k) * (s / k));
    });
    assert.ok(bunt > 40, 'das Bild ist gemalt (Streuung ' + Math.round(bunt) + ')');
    assert.deepStrictEqual(pg.fehler, []);
    ok('Bild fertig gemalt nach ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s, ohne Fehler');
    await pg.close();

    pg = await seite(b, { figuren: TITEL.figuren, einfuehrung: false, frei: false }, { ruhig: true });
    assert.strictEqual(await pg.$('button.ts-klein'), null);
    await pg.click('button.ts-haupt');
    assert.strictEqual(await pg.$('.ts-leer'), null);
    await pg.waitForSelector('#titel canvas[data-fertig]', { timeout: 60000 });
    assert.deepStrictEqual(pg.fehler, []);
    ok('ohne Einführung und ohne freien Platz; reduzierte Bewegung malt fertig');
    await pg.close();

    pg = await seite(b, TITEL, { ohnePrompt: true });
    await pg.click('button.ts-haupt');
    await pg.click('button.ts-slot');
    assert.ok((await pg.textContent('.ts-hinweis')).indexOf('„Spiel laden: Probefigur“') >= 0);
    assert.strictEqual((await pg.textContent('button.ts-slot .ts-laden')).trim(), 'Laden ↗');
    ok('ohne sendPrompt: Hinweis statt Nachricht');
    await pg.close();

    pg = await seite(b, { figuren: [{ name: 'Probefigur', zeile: 'Barde 2 · Wegwart', bild: BILD.replace('probefigur', 'fehlt') }, { name: 'Zweite Figur', zeile: 'Kundschafterin' }] }, { ruhig: true });
    await pg.click('button.ts-haupt');
    await pg.waitForFunction(function () { return !document.querySelector('.ts-rahmen'); });
    assert.strictEqual(await pg.$$eval('button.ts-slot .ts-name', function (e) { return e.map(function (x) { return x.textContent; }); }).then(function (a) { return a.join('|'); }), 'Probefigur|Zweite Figur');
    assert.strictEqual(await pg.$('img.ts-bildnis'), null, 'ein Bild, das nicht lädt, verschwindet samt Rahmen');
    assert.deepStrictEqual(pg.fehler, []);
    ok('ohne Bildnis und bei einem Bild, das nicht lädt: Platz wie bisher');
    await pg.close();
  } finally { await b.close(); }
  console.log(n + ' Prüfungen bestanden.');
})().catch(function (e) { console.error(e); process.exit(1); });
