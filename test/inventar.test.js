// Gepäck 3.0: Umrisszeichen aus seite/zeichen.js (Tabler und eigene), Seltenheit und Marke statt Pixel-Ikonen
'use strict';
var path = require('path'), assert = require('assert'), fs = require('fs');
var inv = require(path.join(__dirname, '..', 'inventar.js'));
var hd = require(path.join(__dirname, '..', 'handel.js'));
var wissen = require(path.join(__dirname, '..', 'wissen.js'));
var zeichen = require(path.join(__dirname, '..', 'seite', 'zeichen.js'));
var n = 0;
function ok(name, f) { f(); n++; console.log('ok  ' + name); }

var D = {
  titel: 'Probefigurs Gepäck', stand: 'Stand: Tag 8', geld: { ga: 3 },
  traeger: [{ id: 'selbst', name: 'Probefigur', art: 'figur', staerke: 12, dinge: [
    { name: 'Kurzschwert', art: 'waffe', kg: 1, angriff: '+5', schaden: '1W6+3 Stich', notiz: 'Vom Großvater, rostig am Heft.' },
    { name: 'Seil', art: 'seil', kg: 5, vorrat: [12, 15], einheit: 'm', herkunft: 'Von Ilse, Tag 3.' },
    { name: 'Zauberstab', art: 'wertsache', ikone: 'kohle', vorrat: [3, 7], einheit: 'Ladungen', seltenheit: 'selten' },
    { name: 'Lederrüstung', art: 'ruestung', kg: 5, rk: 11 },
    { name: 'Brief an Bodo', art: 'brief', wortlaut: 'Komm heim.', glossar: 'Bodo', marke: 'siegel' },
    { name: 'Rationen', art: 'ration', anzahl: 3, kg: 0.5 },
    { name: 'Kerze', art: 'licht' },
    { name: 'Großvaters Dolch', art: 'waffe', marke: 'benannt', seltenheit: 'ungewoehnlich', zustand: 'rostig' },
    { name: 'Zerbrochene Scheibe', art: 'fund', marke: 'beschaedigt' }
  ] }]
};
var h = inv.zeichne(D);

ok('Notiz und Herkunft erscheinen nicht', function () {
  assert(h.indexOf('Großvater,') < 0 && h.indexOf('rostig am Heft') < 0);
  assert(h.indexOf('Von Ilse') < 0);
});
ok('Hauptwert rechts: Schaden, Vorrat mit Höchstwert, RK', function () {
  assert(/class="gpH1">1W6\+3</.test(h));
  assert(/class="gpH1">12\/15 m</.test(h));
  assert(/class="gpH1">3\/7 Ladungen</.test(h));
  assert(/class="gpH1">RK 11</.test(h));
});
ok('Werte im Fenster, Wortlaut eingeklappt, Glossarknopf', function () {
  assert(h.indexOf('<dt>Angriff</dt><dd>+5</dd>') >= 0);
  assert(h.indexOf('<dt>Schaden</dt><dd>1W6+3 Stich</dd>') >= 0);
  assert(/<details class="gpWl"><summary>Wortlaut<\/summary><blockquote>Komm heim\.<\/blockquote>/.test(h));
  assert(h.indexOf('data-glossar="Bodo"') >= 0);
});
ok('Jedes Ding hat ein Plättchen in der Zeile und eines groß im Fenster', function () {
  assert.strictEqual((h.match(/class="wgPl wgPlG"/g) || []).length, 9);
  assert.strictEqual((h.match(/class="wgPl"/g) || []).length, 9);
  assert(h.indexOf(' disabled') < 0);
  assert(h.indexOf('<small>Waffe</small>') >= 0);
});
ok('Zeichen sind Strichbilder: 24 × 24, Strich 2, ohne Füllung, nicht pixelig', function () {
  assert(/<svg class="wgZ" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"/.test(h));
  assert(h.indexOf('pixelated') < 0 && h.indexOf('<symbol') < 0 && h.indexOf('crispEdges') < 0);
});
ok('Zeichen raten: nach Name und Art, ausdrücklich, Bogen nur bei Waffen', function () {
  assert.strictEqual(inv.ikoneVon({ name: 'Kurzschwert', art: 'waffe' }), 'schwert');
  assert.strictEqual(inv.ikoneVon({ name: 'Hanfseil, 12 m', art: 'seil' }), 'seil');
  assert.strictEqual(inv.ikoneVon({ name: 'Zauberstab', art: 'wertsache', ikone: 'kohle' }), 'kohle');
  assert.strictEqual(inv.ikoneVon({ name: 'Drei Bogen Papier', art: 'papier' }), 'rolle');
  assert.strictEqual(inv.ikoneVon({ name: 'Kurzbogen', art: 'waffe' }), 'bogen');
  assert.strictEqual(inv.ikoneVon({ name: 'Schlafsack', art: 'schlafzeug' }), 'schlafsack');
  assert.strictEqual(inv.ikoneVon({ name: 'Rationen', art: 'ration' }), 'ration');
  assert.strictEqual(inv.ikoneVon({ name: 'Irgendwas', art: 'sonstiges' }), 'buendel');
});
ok('Seltenheit färbt Ring und Namen und steht im Fenster; gewöhnlich bleibt Tinte', function () {
  assert(h.indexOf('--selten:#2a62a8') >= 0);                       // selten: blau
  assert(/<span class="gpN" style="color:#2a62a8">Zauberstab/.test(h));
  assert(h.indexOf('<dt>Seltenheit</dt><dd>selten</dd>') >= 0);
  assert(/<span class="gpN">Kurzschwert/.test(h));
  assert(h.indexOf('<dd>gewöhnlich</dd>') < 0);
  assert.deepStrictEqual(Object.keys(inv.SELTENHEIT), ['gewoehnlich', 'ungewoehnlich', 'selten', 'sehr_selten', 'legendaer']);
});
ok('Marken: Siegel, beschädigt, benannt, unbekannt, je ein kleines Zeichen am Plättchen', function () {
  assert.deepStrictEqual(Object.keys(inv.MARKEN), ['siegel', 'beschaedigt', 'benannt', 'unbekannt']);
  assert.strictEqual((h.match(/class="wgMk"/g) || []).length, 3 * 2);   // Brief, Dolch, Scheibe, je Zeile und Fenster
  assert(h.indexOf('<dt>Marke</dt><dd>gesiegelt</dd>') >= 0);
  assert(h.indexOf('<small>Waffe · ungewöhnlich · benannt</small>') >= 0);
  assert(h.indexOf('<small>Fundstück · beschädigt</small>') >= 0);
});
ok('Anzahl als Zahl am Plättchen; Rationen oben als Reihe', function () {
  assert(/<b class="wgAnz">3<\/b>/.test(h));
  assert.strictEqual((h.match(/class="gpBr"/g) || []).length, 3);
});
ok('Die Sammlung: 69 Zeichen, jedes aus Pfaden im Raster 24', function () {
  var namen = Object.keys(inv.ZEICHEN);
  assert.strictEqual(namen.length, 69);
  namen.forEach(function (k) {
    assert(Array.isArray(inv.ZEICHEN[k]) && inv.ZEICHEN[k].length, k);
    inv.ZEICHEN[k].forEach(function (p) {
      assert(/^M/.test(p), k);
      p.replace(/-?(?:\d+\.?\d*|\.\d+)/g, function (z) { assert(Math.abs(+z) <= 24, k + ': ' + z); return z; });
    });
  });
  ['schwert', 'dolch', 'laute', 'brief', 'siegel', 'band-blau', 'punkt'].forEach(function (k) { assert(inv.ZEICHEN[k], k); });
});
ok('Der Zeichenblock steht wörtlich in inventar.js, handel.js und seite/zeichen.js', function () {
  var block = zeichen.block();
  ['inventar.js', 'handel.js'].forEach(function (f) {
    var s = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    assert(s.indexOf(block) >= 0, f + ': node seite/zeichen.js --einbauen');
  });
  assert.deepStrictEqual(hd.ZEICHEN, inv.ZEICHEN);
});
ok('Der Händlertisch zeigt dieselben Plättchen mit Seltenheit und Marke', function () {
  var B = require(path.join(__dirname, 'handel-beispiel.js'));
  var X = JSON.parse(JSON.stringify(B));
  X.haendler.waren[0].seltenheit = 'legendaer'; X.haendler.waren[0].marke = 'unbekannt';
  var H = hd.vorbereiten(X), hh = hd.zeilen(H, {}, 'w') + hd.zeilen(H, {}, 'd');
  assert(hh.indexOf('class="wgPl wgPlK"') >= 0);
  assert(hh.indexOf('--selten:#c7641a') >= 0);
  assert(hh.indexOf('class="wgMk"') >= 0);
  assert(hh.indexOf('class="ti ti-sword"') < 0);
});
ok('Schema: unbekanntes Zeichen, unbekannte Seltenheit, Marke und das alte Feld pixel werden abgelehnt', function () {
  var stand = 'Probefigur Kurzschwert Seil Zauberstab Lederrüstung Brief an Bodo Rationen Kerze Großvaters Dolch Zerbrochene Scheibe';
  var X = JSON.parse(JSON.stringify(D));
  X.traeger[0].dinge[2].ikone = 'zauberstab-gibt-es-nicht';
  X.traeger[0].dinge[7].seltenheit = 'episch';
  X.traeger[0].dinge[8].marke = 'glitzer';
  X.traeger[0].dinge[0].pixel = '....';
  var r = wissen.pruefe(X, inv.SCHEMA, { spielstand: stand, spoiler: 'x' }, inv.zusatz);
  assert(r.fehler.filter(function (f) { return /ist nicht erlaubt/.test(f); }).length >= 3, r.fehler.join('\n'));
  assert(r.fehler.some(function (f) { return /pixel/.test(f); }), r.fehler.join('\n'));
  var Y = JSON.parse(JSON.stringify(D));
  var gut = wissen.pruefe(Y, inv.SCHEMA, { spielstand: stand + ' Großvater rostig am Heft Vom Ilse Tag 3 Ladungen Stich', spoiler: 'x' }, inv.zusatz);
  assert(!gut.fehler.some(function (f) { return /ikone|seltenheit|marke|pixel/i.test(f); }), gut.fehler.join('\n'));
});
console.log(n + ' Prüfungen bestanden.');
