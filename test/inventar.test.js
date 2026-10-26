// Gepäck 2.1: Pixel-Ikonen 32 × 32 (Sammlung und eigene im Feld pixel), Werte statt Erzählung
'use strict';
var path = require('path'), assert = require('assert');
var inv = require(path.join(__dirname, '..', 'inventar.js'));
var wissen = require(path.join(__dirname, '..', 'wissen.js'));
var pixel = require(path.join(__dirname, '..', 'seite', 'pixel.js'));
var n = 0;
function ok(name, f) { f(); n++; console.log('ok  ' + name); }

// Eine eigene Ikone, gezeichnet wie im Spiel: von der Sammlung ausgehen und ändern
var eigen = pixel.zeichne(function (z) { z.von('dolch'); z.punkt(6, 26, 'gold.hell'); });
var D = {
  titel: 'Probefigurs Gepäck', stand: 'Stand: Tag 8', geld: { ga: 3 },
  traeger: [{ id: 'selbst', name: 'Probefigur', art: 'figur', staerke: 12, dinge: [
    { name: 'Kurzschwert', art: 'waffe', kg: 1, angriff: '+5', schaden: '1W6+3 Stich', notiz: 'Vom Großvater, rostig am Heft.' },
    { name: 'Seil', art: 'seil', kg: 5, vorrat: [12, 15], einheit: 'm', herkunft: 'Von Ilse, Tag 3.' },
    { name: 'Zauberstab', art: 'wertsache', ikone: 'kohle', vorrat: [3, 7], einheit: 'Ladungen' },
    { name: 'Lederrüstung', art: 'ruestung', kg: 5, rk: 11 },
    { name: 'Brief an Bodo', art: 'brief', wortlaut: 'Komm heim.', glossar: 'Bodo' },
    { name: 'Rationen', art: 'ration', anzahl: 3, kg: 0.5 },
    { name: 'Kerze', art: 'licht' },
    { name: 'Großvaters Dolch', art: 'waffe', pixel: eigen },
    { name: 'Großvaters zweiter Dolch', art: 'waffe', pixel: eigen }
  ] }]
};
var h = inv.zeichne(D);

ok('Notiz und Herkunft erscheinen nicht', function () {
  assert(h.indexOf('Großvater,') < 0 && h.indexOf('rostig') < 0);
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
ok('Jedes Ding öffnet ein Fenster mit seiner Ikone groß', function () {
  assert.strictEqual((h.match(/class="gpPxG"/g) || []).length, 9);
  assert(h.indexOf(' disabled') < 0);
  assert(h.indexOf('<small>Waffe</small>') >= 0);
});
ok('Ikonen raten: nach Name und Art, ausdrücklich, Bogen nur bei Waffen', function () {
  assert.strictEqual(inv.ikoneVon({ name: 'Kurzschwert', art: 'waffe' }), 'schwert');
  assert.strictEqual(inv.ikoneVon({ name: 'Hanfseil, 12 m', art: 'seil' }), 'seil');
  assert.strictEqual(inv.ikoneVon({ name: 'Zauberstab', art: 'wertsache', ikone: 'kohle' }), 'kohle');
  assert.strictEqual(inv.ikoneVon({ name: 'Drei Bogen Papier', art: 'papier' }), 'rolle');
  assert.strictEqual(inv.ikoneVon({ name: 'Kurzbogen', art: 'waffe' }), 'bogen');
  assert.strictEqual(inv.ikoneVon({ name: 'Schlafsack', art: 'schlafzeug' }), 'schlafsack');
  assert.strictEqual(inv.ikoneVon({ name: 'Rationen', art: 'ration' }), 'ration');
  assert.strictEqual(inv.ikoneVon({ name: 'Irgendwas', art: 'sonstiges' }), 'buendel');
});
ok('Eigene Ikone statt Sammlung; gleiche Raster stehen nur einmal als Symbol', function () {
  var symbole = h.match(/<symbol id="[^"]+"/g) || [];
  var eindeutig = symbole.filter(function (x, i) { return symbole.indexOf(x) === i; });
  assert.strictEqual(symbole.length, eindeutig.length);
  // Kurzschwert, Seil, Kohle, Rüstung, Brief, Rationen, Kerze und einmal die eigene Ikone
  assert.strictEqual(symbole.length, 8);
  assert.strictEqual((h.match(/<symbol[^>]*viewBox="0 0 32 32"/g) || []).length, 8);
});
ok('Anzahl als Zahl an der Ikone', function () { assert(/<b class="gpAnz">3<\/b>/.test(h)); });
ok('Die Sammlung: lauter gültige Raster 32 × 32 mit Farben aus FARBEN', function () {
  Object.keys(inv.IKONEN).forEach(function (k) { assert.strictEqual(inv.rasterFehler(inv.IKONEN[k]), '', k); assert.strictEqual(inv.IKONEN[k].split('|').length, 32, k); });
  assert(Object.keys(inv.IKONEN).length >= 60);
});
ok('Die Sammlung in inventar.js ist die aus seite/pixel.js', function () {
  pixel.REIHE.forEach(function (k) { assert.strictEqual(inv.IKONEN[k], pixel.zeichne(pixel.SAMMLUNG[k]), k + ' neu zeichnen: node seite/pixel.js'); });
  assert.deepStrictEqual(inv.FARBEN, pixel.FARBEN);
});
ok('Schema: unbekannte Ikone, schiefes Raster und fremde Farbe werden abgelehnt', function () {
  var stand = 'Probefigur Kurzschwert Seil Zauberstab Lederrüstung Brief an Bodo Rationen Kerze Großvaters Dolch Großvaters zweiter Dolch';
  var X = JSON.parse(JSON.stringify(D));
  X.traeger[0].dinge[2].ikone = 'zauberstab-gibt-es-nicht';
  X.traeger[0].dinge[7].pixel = eigen.split('|').slice(0, 31).join('|');
  X.traeger[0].dinge[8].pixel = eigen.replace(/k/, 'Ä');
  var r = wissen.pruefe(X, inv.SCHEMA, { spielstand: stand, spoiler: 'x' }, inv.zusatz);
  assert(r.fehler.some(function (f) { return /ist nicht erlaubt/.test(f); }));
  assert(r.fehler.some(function (f) { return /nicht quadratisch/.test(f); }));
  assert(r.fehler.some(function (f) { return /keine Farbe/.test(f); }));
  var Y = JSON.parse(JSON.stringify(D));
  var gut = wissen.pruefe(Y, inv.SCHEMA, { spielstand: stand + ' Großvater rostig am Heft Vom Ilse Tag 3 Ladungen Stich', spoiler: 'x' }, inv.zusatz);
  assert(!gut.fehler.some(function (f) { return /pixel|Raster|raster/.test(f); }), gut.fehler.join('\n'));
});
ok('Werkzeug: von einem fertigen Raster ausgehen ändert nichts, bis man zeichnet', function () {
  assert.strictEqual(pixel.zeichne(function (z) { z.vonRaster(eigen); }), eigen);
  var neu = pixel.zeichne(function (z) { z.vonRaster(eigen); z.wegRechteck(0, 0, 15, 31); });
  assert(neu !== eigen && neu.split('|').every(function (r) { return /^\.{15}/.test(r); }));
});
ok('Werkzeug: Karte „Neu im Gepäck“ ist ein PNG', function () {
  var b = pixel.karte([eigen, inv.IKONEN.seil]);
  assert.strictEqual(b.slice(1, 4).toString(), 'PNG');
  assert.strictEqual(b.readUInt32BE(16), 2 * 152 + 10);
});
console.log(n + ' Prüfungen bestanden.');
