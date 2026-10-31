// Lädt die Kampfkarte (kampf.js) mit dem Aufruf aus Regelwerk 4.2 in Chromium und prüft Raster, Erreichbarkeit,
// Weg, Ziel, Höhe, den Zug als Folge (seit 1.6) und die Nachricht. Erfundene Welt (test/kampf-beispiel.js,
// test/kampf-hoehe-beispiel.js, …, test/kampf-schleusentor-beispiel.js), keine Daten einer echten Figur.
// Braucht Playwright mit Chromium: node test/kampf.test.js
'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path');
var chromium = require('playwright').chromium;
var code = fs.readFileSync(path.join(__dirname, '..', 'kampf.js'), 'utf8');
var KAMPF = require('./kampf-beispiel.js');
var HOEHE = require('./kampf-hoehe-beispiel.js');
var STUFEA = require('./kampf-stufe-a-beispiel.js');
var DREI = require('./kampf-1-3-beispiel.js');
var ZOLL = require('./kampf-zollbruecke-beispiel.js');
var TOR = require('./kampf-schleusentor-beispiel.js');
var AUF = require('./kampf-aufstellung-beispiel.js');
var BIL = require('./kampf-bilanz-beispiel.js');
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
  return pg.evaluate(function (i) { document.querySelector('g.kkO[data-w="' + i + '"] .kkTok').dispatchEvent(new MouseEvent('click', { bubbles: true })); }, i);
}
// die Folge im Kasten „Zug“, ein Chip je Zeile
function folge(pg) { return pg.evaluate(function () { return Array.prototype.map.call(document.querySelectorAll('#kampf .kkFo .kkCh'), function (c) { return c.textContent.trim(); }); }); }
function gesendet(pg) { return pg.evaluate(function () { return GESENDET; }); }

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
  assert.strictEqual(kampf.lageKurz(L, fig.waffen[2], s), 'Zauber: Starry Wisp auf Schütze (außer Reichweite: keine Sichtlinie, eine Wand bei 12/C)', 'seit 1.6 nennt auch „außer Reichweite“ die Waffe');
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
  assert.strictEqual(kampf.version, '1.9');
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

  // 1.5 (Stufe B): Bonusaktionen, Hinweis bei Gefolge und Unbeteiligten
  var Zk = kampf.lies(ZOLL), zf = Zk.figur, hanno2 = Zk.wesen[1], zoe = Zk.wesen[2], faehr = Zk.wesen[6];
  assert.deepStrictEqual(zf.bonus.map(function (b) { return [b.name, b.art, b.ziele.join('/'), b.r, b.ohneZiel, b.nurSelbst]; }),
    [['Healing Word', 'heilung', 'jedes', 12, false, false], ['Bardische Inspiration', 'inspiration', 'gefolge/gegner/npc/tier', 12, false, false], ['Dolch', 'waffe', 'gegner', 1, false, false]], 'drei Bonusaktionen');
  assert.deepStrictEqual([zf.bonus[2].bonus, zf.bonus[2].schaden, zf.bonus[2].typ], [4, '1W4', 'Stich'], 'die Zweitwaffe nimmt Bonus und Art des Dolchs, der Schaden ohne Modifikator');
  assert.deepStrictEqual([kampf.bonusErlaubt(zf.bonus[0], zf, zf), kampf.bonusErlaubt(zf.bonus[1], zf, zf), kampf.bonusErlaubt(zf.bonus[1], hanno2, zf), kampf.bonusErlaubt(zf.bonus[2], hanno2, zf), kampf.bonusErlaubt(zf.bonus[2], zoe, zf)],
    [true, false, true, false, true], 'wer Ziel sein darf: Heilung auch du selbst, Inspiration nicht, die Zweitwaffe nur Gegner');
  assert.strictEqual(kampf.bonusZeile(Zk, zf.bonus[0], hanno2, zf, zf), 'Bonusaktion: Healing Word auf Hanno (3 m)');
  assert.strictEqual(kampf.bonusZeile(Zk, zf.bonus[0], zf, zf, zf), 'Bonusaktion: Healing Word auf dich selbst');
  assert.strictEqual(kampf.bonusZeile(Zk, zf.bonus[2], zoe, zf, zf), 'Bonusaktion: Dolch (Zweitwaffe) auf Zöllner (außer Reichweite: 6 m, Dolch reicht 1,5 m)');
  assert.strictEqual(kampf.bonusZeile(Zk, zf.bonus[2], zoe, { x: 19, y: 8, groesse: 1 }, zf), 'Bonusaktion: Dolch (Zweitwaffe) auf Zöllner (1,5 m)');
  var frei = kampf.bonusInfo({ name: 'Rückzug' }, []);
  assert.deepStrictEqual([frei.art, frei.ohneZiel, kampf.bonusZeile(Zk, frei, null, zf, zf)], ['frei', true, 'Bonusaktion: Rückzug'], 'ohne art und ziel: frei und ohne Ziel');
  var ls = kampf.wirksam(zf.waffen[0], 0, null);
  var Lh = kampf.angriffsLage(Zk, { x: 15, y: 9, groesse: 1 }, hanno2, ls, false);
  assert.deepStrictEqual([Lh.status, Lh.hinweis, Lh.vor, Lh.nach], ['in', 'dein eigener Mann', [], []], 'Gefolge als Ziel: Hinweis, kein Nachteil');
  assert.strictEqual(kampf.angriffsLage(Zk, { x: 12, y: 10, groesse: 1 }, faehr, ls, false).hinweis, 'ein Unbeteiligter');
  assert.strictEqual(kampf.angriffsLage(Zk, { x: 19, y: 8, groesse: 1 }, zoe, ls, false).hinweis, '', 'beim Gegner kein Hinweis');
  assert.strictEqual(kampf.angriffsLage(Zk, { x: 19, y: 8, groesse: 1 }, zoe, ls, true).nach[0], 'du liegst', 'liegen bleiben: Nachteil');
  assert.strictEqual(kampf.wege(Zk, zf).dist['28,4'], 17, 'aufs Dach nur über die Leiter: 16 Felder bis zur Leiter, eins hinauf');
  ok('1.5: Bonusaktionen, Hinweise');

  // 1.6: der Zug als Folge (Modell ohne Browser), Zeichen, leicht, aktionen[]
  var T = kampf.lies(TOR), tf = T.figur, ulf = T.wesen[2], rolf = T.wesen[1];
  assert.deepStrictEqual([tf.waffen[0].leicht, tf.waffen[1].leicht], [false, true], '`leicht` am Dolch');
  assert.deepStrictEqual(tf.aktionen.map(function (a) { return [a.name, a.zeichen]; }), [['Hilfe', 'aktion'], ['Ausweichen', 'aktion']], 'aktionen[] gelesen');
  assert.deepStrictEqual(kampf.aktionInfo({ name: 'Verstecken', zeichen: 'rettung' }).zeichen, 'rettung', 'ein Zeichen aus der Sammlung');
  assert.strictEqual(kampf.schadensarten.length, 13, 'dreizehn Schadensarten wie im Würfelkasten');
  assert.deepStrictEqual(kampf.schadensarten.map(kampf.zeichenVon), kampf.schadensarten, 'jede hat ihr Zeichen');
  assert.deepStrictEqual([kampf.zeichenVon('Hieb'), kampf.zeichenVon('gleißend'), kampf.zeichenVon('Nadelkraut'), kampf.zeichenVon('')], ['hieb', 'gleißend', 'schaden', ''], 'Schadensart in das Zeichen; Unbekanntes: Klingen');
  assert.deepStrictEqual([kampf.waffenZeichen(kampf.wirksam(tf.zauber[2])), kampf.waffenZeichen(kampf.wirksam(tf.zauber[3])), kampf.waffenZeichen(kampf.wirksam(bf.zauber[3]))], ['psychisch', 'rettung', 'heilung'], 'Schadensart vor Rettungswurf, sonst Rettungswurf, Heilung');
  assert.ok(/^<svg class="kkZc"[^>]*data-z="hieb"/.test(kampf.zeichenBild('hieb', 'Hieb')) && kampf.zeichenBild('nix') === '', 'das Zeichen als SVG');
  var Zg = kampf.zugModell(T, tf);
  assert.deepStrictEqual([Zg.liegt, Zg.aufstehen, Zg.basis, Zg.budget(), Zg.rest()], [true, true, 6, 3, 3], 'liegend: die halbe Bewegung, Aufstehen vorgewählt');
  assert.deepStrictEqual(Zg.wegHinzu(17, 8), { fehler: 'steht' }, 'der eigene Stand ist kein Wegstück');
  assert.strictEqual(Zg.wegHinzu(21, 8).fehler, 'besetzt', 'auf Ulf geht es nicht');
  assert.strictEqual(Zg.wegHinzu(10, 3).fehler, 'unerreichbar', 'in die Wand der Hütte führt kein Weg');
  assert.strictEqual(Zg.wegHinzu(17, 6).fehler, 'zuweit', 'tiefes Wasser zählt doppelt: zwei Felder sind vier');
  var zw = Zg.wegHinzu(14, 12);
  assert.deepStrictEqual([zw.fehler, zw.d, zw.rest, zw.spurt], ['zuweit', 6, 3, true], 'zu weit (durchs seichte Wasser sechs Felder), aber mit Spurt (6 Felder dazu) erreichbar');
  assert.strictEqual(Zg.wegHinzu(19, 8).ok, true, 'erstes Wegstück: zwei Felder nach Osten');
  assert.deepStrictEqual([Zg.stand().x, Zg.stand().y, Zg.verbraucht(), Zg.rest()], [19, 8, 2, 1], 'der Stand wandert mit, der Rest schrumpft');
  assert.ok(Zg.aktionHinzu('zauber', 2, ulf), 'Dissonant Whispers auf Ulf vom Zwischenstand');
  assert.strictEqual(Zg.aktionHinzu('waffe', 0, ulf), null, 'nur eine Aktion');
  assert.strictEqual(Zg.wegHinzu(20, 8).ok, true, 'zweites Wegstück nach der Aktion');
  assert.strictEqual(Zg.wegHinzu(20, 9).fehler, 'zuweit', 'das Budget ist verbraucht');
  assert.strictEqual(Zg.zweitwaffeErlaubt(), false, 'die Zweitwaffe nicht neben einem Zauber');
  assert.ok(Zg.bonusHinzu(0, rolf), 'Healing Word auf Rolf, vom aktuellen Stand');
  assert.strictEqual(Zg.zeile({ nr: 21 }, 'Für Rolf!', []), 'Kampf #21 · Probefigur: steht auf · nach 19/H (3 m) · Zauber: Dissonant Whispers auf Ulf (3 m; Rettungswurf WEI SG 12) · nach 20/H (1,5 m) · Bonusaktion: Healing Word auf Rolf (9 m) · Weg 4,5 von 4,5 m · Für Rolf!', 'die Zugzeile ist die Folge von links nach rechts');
  assert.strictEqual(Zg.zurueck().art, 'bonus', '„Zurück“ nimmt den letzten Schritt');
  Zg.zurueck(); Zg.zurueck();
  assert.deepStrictEqual([Zg.schritte.length, Zg.rest()], [1, 1], 'zurück bis zum ersten Wegstück');
  // Zweitwaffe: nur neben der Angriffsaktion mit einer leichten Waffe
  assert.ok(Zg.aktionHinzu('waffe', 0, ulf) && !Zg.zweitwaffeErlaubt(), 'das Langschwert ist nicht leicht');
  Zg.zurueck();
  Zg.modus[1] = 1; // Dolch geworfen
  assert.ok(Zg.aktionHinzu('waffe', 1, ulf) && Zg.zweitwaffeErlaubt(), 'der Dolch ist leicht');
  assert.ok(Zg.bonusHinzu(2, ulf), 'die Zweitwaffe liegt in der Folge');
  assert.strictEqual(Zg.zeile({ nr: 21 }, '', []), 'Kampf #21 · Probefigur: steht auf · nach 19/H (3 m) · Angriff: Dolch, geworfen auf Ulf (3 m; Vorteil: Ziel am Boden) · Bonusaktion: Dolch (Zweitwaffe) auf Ulf (außer Reichweite: 3 m, Dolch reicht 1,5 m) · Weg 3 von 4,5 m'.replace('; Vorteil: Ziel am Boden', ''), 'Zweitwaffe in der Zeile');
  Zg.entferne(Zg.aktion());
  assert.strictEqual(Zg.bonus(), null, 'ohne die Angriffsaktion fällt die Zweitwaffe aus der Folge');
  // Spurt als Aktion: die Bewegung noch einmal dazu, kriechend die Hälfte; fällt Spurt, fallen die Wegstücke darüber
  Zg.schritte = [];
  assert.ok(Zg.aktionHinzu('spurt'), 'Spurt');
  assert.deepStrictEqual([Zg.hatSpurt(), Zg.budget()], [true, 9], 'Aufstehen (3 Felder) und Spurt (6): neun Felder');
  Zg.aufstehen = false; Zg.pruefe();
  assert.strictEqual(Zg.budget(), 6, 'kriechend zählt jedes Feld doppelt: drei und drei');
  Zg.aufstehen = true;
  assert.strictEqual(Zg.wegHinzu(22, 11).ok, true, 'sechs Felder mit Spurt');
  assert.strictEqual(Zg.zeile({ nr: 21 }, '', []), 'Kampf #21 · Probefigur: steht auf · Spurt · nach 22/K (9 m) · verlässt Ulf und Hund: Gelegenheitsangriffe · Weg 9 von 13,5 m', 'Spurt in der Zeile, Gelegenheitsangriffe am Wegstück');
  Zg.entferne(Zg.aktion());
  assert.deepStrictEqual([Zg.schritte.length, Zg.budget()], [0, 3], 'ohne Spurt fällt das Wegstück über dem Budget');
  // Gelegenheitsangriffe je Gegner einmal im ganzen Zug, nach Rückzug keine mehr
  var G = kampf.lies({ nr: 3, titel: 'Gasse', figur: 'f', spalten: 8, zeilen: 4, boden: ['########', '........', '........', '........'],
    wesen: [{ id: 'f', name: 'Figur', art: 'figur', x: 2, y: 2, bewegung: 9, waffen: [{ name: 'Keule', reichweite: 1.5 }] }, { id: 'r', name: 'Räuber', art: 'gegner', x: 3, y: 3 }] });
  var Zo = kampf.zugModell(G, G.figur);
  Zo.wegHinzu(5, 2); Zo.wegHinzu(4, 2); Zo.wegHinzu(6, 2);
  assert.deepStrictEqual(Zo.gelegenheiten().map(function (l) { return l.length; }), [1, 0, 0], 'das erste Stück verlässt die Zone, das dritte noch einmal: je Gegner nur einmal');
  assert.strictEqual(Zo.zeile({ nr: 3 }, '', []), 'Kampf #3 · Figur: nach 5/B (4,5 m) · verlässt Räuber: Gelegenheitsangriff · nach 4/B (1,5 m) · nach 6/B (3 m) · Weg 9 von 9 m');
  Zo.schritte = []; Zo.aktionHinzu('rueckzug'); Zo.wegHinzu(6, 2);
  assert.deepStrictEqual(Zo.gelegenheiten().map(function (l) { return l.length; }), [0, 0], 'nach Rückzug keiner');
  assert.strictEqual(Zo.zeile({ nr: 3 }, '', []), 'Kampf #3 · Figur: Rückzug · nach 6/B (6 m) · Weg 6 von 9 m');
  Zo.schritte = []; Zo.wegHinzu(4, 2); Zo.aktionHinzu('rueckzug'); Zo.wegHinzu(6, 2);
  assert.deepStrictEqual(Zo.gelegenheiten().map(function (l) { return l.length; }), [0, 0, 0], 'vor dem Rückzug blieb sie in der Zone, danach ist sie frei');
  Zo.schritte = []; Zo.aktionHinzu('frei', 0);
  assert.strictEqual(Zo.zeile({ nr: 3 }, '', ['Waffe: Keule']), 'Kampf #3 · Figur: bleibt auf 2/B · Aktion: ? · Waffe: Keule', 'eine Aktion ohne Ziel aus aktionen[] (hier ohne Daten)');
  ok('1.6: Folge, Budget, Spurt, Rückzug, Zweitwaffe, Zeichen');

  // 1.7 (Rest von Stufe B): Spuren seit der letzten Karte, neu, außer Sicht
  var rolf2 = T.wesen[1], hund = T.wesen[3], schuetze = T.wesen[4], t2 = T.wesen[6];
  assert.deepStrictEqual([rolf2._vorher, hund._vorher, t2.neu, schuetze.gesehen, ulf._vorher, ulf.gesehen], [[12, 10], [24, 10], true, false, null, true], '`vorher`, `neu`, `gesehen` gelesen');
  assert.strictEqual(kampf.lies({ wesen: [{ id: 'a', name: 'A', art: 'gegner', x: 3, y: 3, vorher: { x: 3, y: 3 } }] }).wesen[0]._vorher, null, 'vorher am selben Feld ist keine Spur');
  assert.strictEqual(kampf.lies({ wesen: [{ id: 'a', name: 'A', art: 'gegner', x: 3, y: 3, vorher: { x: 5, y: 2 } }] }).wesen[0]._vorher.join(','), '5,2', 'vorher auch als {x, y}');
  var WT = kampf.wege(T, tf);
  assert.strictEqual(WT.belegt['25,5'], undefined, 'wer außer Sicht ist, versperrt auf der Karte nichts');
  assert.ok(WT.dist['25,5'] != null, 'sein letztes Feld ist erreichbar');
  assert.strictEqual(kampf.gelegenheiten(T, [[25, 6], [27, 7]]).length, 0, 'und er bedroht kein Feld');
  var eT = kampf.zeichne(TOR);
  assert.strictEqual((eT.svg.match(/class="kkSp"/g) || []).length, 2, 'zwei Spuren gezeichnet');
  assert.ok(/kkO kkA-gegner kkZuletzt/.test(eT.svg) && (eT.svg.match(/class="kkNeu"/g) || []).length === 1, 'ein Schatten, ein „neu“');
  assert.ok(/Spur:/.test(eT.legende) && /außer Sicht/.test(eT.legende) && /dazugekommen/.test(eT.legende), 'die Legende nennt Spur, Schatten und neu');
  assert.ok(!/Spur:/.test(kampf.zeichne(ZOLL).legende), 'ohne Spuren keine Zeile in der Legende');
  ok('1.7: Spuren, neu, außer Sicht');

  // 1.8 (Stufe C), ohne Browser: Aufstellung, Formen, Fortschritt, Höhenschilder in ihrer Fläche, grau in der Legende
  var U = kampf.lies(AUF);
  assert.strictEqual(kampf.version, '1.9');
  assert.deepStrictEqual([U.aufstellung.length, U.aufSet['12,5'], U.aufSet['12,6'], U.aufstellen.map(function (w) { return w.name; })], [12, 1, undefined, ['Probefigur', 'Tamsin', 'Brock']], 'Aufstellungsfelder gelesen; die Figur zuerst, dann die Ihren mit aufstellen');
  var U2 = kampf.lies({ aufstellung: [[2, 2], { x: 3, y: 2 }, { x: 99, y: 2 }, [2, 2]], wesen: [{ id: 'g', name: 'G', art: 'gegner', x: 5, y: 5, aufstellen: true }, { id: 'f', name: 'F', art: 'figur', x: 1, y: 1 }] });
  assert.deepStrictEqual([U2.aufstellung.length, U2.aufstellen.map(function (w) { return w.name; })], [2, ['F']], 'auch [x, y]; doppelte und Felder außerhalb fallen weg; Gegner stellen sich nie auf');
  assert.strictEqual(kampf.lies({ wesen: [{ id: 'f', name: 'F', art: 'figur', x: 1, y: 1 }, { id: 'r', name: 'R', art: 'gefolge', x: 2, y: 1, aufstellen: true }] }).aufstellen.length, 0, 'ohne Aufstellungsfelder keine Aufstellung');
  assert.deepStrictEqual([kampf.fortschrittLesen([2, 3]), kampf.fortschrittLesen({ ist: 1, von: 4 }), kampf.fortschrittLesen([5, 3]), kampf.fortschrittLesen([1, 0]), kampf.fortschrittLesen('2/3')], [[2, 3], [1, 4], [3, 3], null, null], 'Fortschritt lesen');
  assert.deepStrictEqual(U.notizen.map(function (n) { return [n.text, n.fortschritt]; })[0], ['Tür', [1, 3]], 'die Notiz trägt ihren Fortschritt');
  assert.deepStrictEqual(['figur', 'gefolge', 'gegner', 'npc', 'tier'].map(function (a) { return kampf.formen[a]; }), ['kreis', 'kreis', 'raute', 'duenn', 'quadrat'], 'die Formen der Arten');
  assert.ok(/^<polygon points=/.test(kampf.formSvg('gegner', 10, 10, 5)) && /^<rect /.test(kampf.formSvg('tier', 10, 10, 5)) && /^<circle /.test(kampf.formSvg('npc', 10, 10, 5)), 'Raute, Quadrat, Kreis');
  assert.deepStrictEqual([kampf.formRand('gegner', 10, 0), Math.round(kampf.formRand('gegner', 10, Math.PI / 4) * 100) / 100, kampf.formRand('tier', 10, 0), kampf.formRand('gefolge', 10, 1)], [12, 8.49, 9, 10], 'der Rand der Form je Richtung: dort sitzen die Plaketten');
  var eU = kampf.zeichne(AUF);
  assert.strictEqual((eU.svg.match(/class="kkF kkAuf"/g) || []).length, 12, 'zwölf blaue Felder');
  assert.deepStrictEqual([(eU.svg.match(/<polygon[^>]*class="kkTok/g) || []).length, (eU.svg.match(/<rect[^>]*class="kkTok/g) || []).length, (eU.svg.match(/<circle[^>]*class="kkTok kkDuenn"/g) || []).length, (eU.svg.match(/<circle[^>]*class="kkTok"/g) || []).length], [3, 1, 1, 2], 'drei Rauten, ein Quadrat, ein dünner Kreis, zwei Kreise');
  assert.ok(/<g class="kkNo kkNoF"><title>Tür: 1 von 3<\/title>/.test(eU.svg) && />Tür 1\/3<\/text>/.test(eU.svg) && /class="kkFv"/.test(eU.svg), 'das Schild „Tür 1/3“ mit Balken');
  assert.ok(/Aufstellung: hierhin/.test(eU.legende) && /Aufgabe über Runden/.test(eU.legende) && /<polygon[^>]*class="kkItF"/.test(eU.legende), 'Legende: Aufstellung, Aufgabe, die Formen');
  assert.ok(!/Aufstellung: hierhin/.test(kampf.zeichne(TOR).legende) && !/Aufgabe über Runden/.test(kampf.zeichne(TOR).legende), 'ohne Aufstellung und Fortschritt nichts davon in der Legende');
  assert.ok(/grau: aus dem Kampf/.test(kampf.zeichne(DREI).legende) && !/grau: aus dem Kampf/.test(kampf.zeichne(TOR).legende), 'grau in der Legende nur mit einem Stein aus dem Kampf');
  // Höhenschilder bleiben in ihrer Fläche: jedes Schild liegt über Feldern derselben Ebene und über keinem Spielstein
  [TOR, HOEHE, DREI, AUF].forEach(function (B) {
    var Kb = kampf.lies(B), sv = kampf.zeichne(B).svg, re = /<g class="kkHs"><rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/g, mm, n = 0, belegtF = {};
    Kb.wesen.forEach(function (w) { for (var dx = 0; dx < w.groesse; dx++) for (var dy = 0; dy < w.groesse; dy++) belegtF[(w.x + dx) + ',' + (w.y + dy)] = 1; });
    while ((mm = re.exec(sv))) {
      var x0 = Math.floor((+mm[1] - 26) / 30) + 1, x1 = Math.floor((+mm[1] + +mm[3] - 26 - 0.01) / 30) + 1, y = Math.floor((+mm[2] + 7 - 26) / 30) + 1, h0 = kampf.hoehe(Kb, x0, y);
      assert.ok(h0 > 0, B.titel + ': Schild über einer Fläche über dem Boden');
      for (var x = x0; x <= x1; x++) { assert.strictEqual(kampf.hoehe(Kb, x, y), h0, B.titel + ': das Schild bei ' + x + '/' + y + ' bleibt auf seiner Ebene'); assert.ok(!belegtF[x + ',' + y], B.titel + ': kein Schild über einem Stein'); }
      n++;
    }
    assert.ok(n >= 1, B.titel + ': mindestens ein Schild');
  });
  assert.ok(/<text[^>]*style="font-size:[\d.]+px">\+1,5<\/text>/.test(kampf.zeichne(TOR).svg) && />\+3 m<\/text>/.test(kampf.zeichne(TOR).svg), 'auf der ein Feld breiten Böschung wird die Schrift kleiner und das „m“ fällt; auf der Krone bleibt „+3 m“');
  ok('1.8: Aufstellung, Formen, Fortschritt, Höhenschilder');

  // 1.9, ohne Browser: die Kampfbilanz lesen und zeichnen
  var KB = kampf.lies(BIL), Bz = kampf.bilanzLesen(BIL, KB);
  assert.deepStrictEqual([Bz.ausgang, Bz.ep, Bz.anteile, Bz.gegner.map(function (g) { return [g.name, g.stand, g.plakette, g.grau, g.blass, g.ep]; })],
    ['Der Weg ist frei', 75, 'Probefigur 38 · Tamsin 37', [['Köter', 'gefallen', 'tot', true, false, 25], ['Vorläufer', 'ergibt sich', 'ergibt sich', false, false, 25], ['Treiber', 'geflohen', 'flieht', false, true, 25]]], 'Gegner mit Stand, Stein und EP; der Treiber nur mit Namen');
  assert.deepStrictEqual([Bz.beute.length, Bz.beute[0].zeichen, Bz.gefangene[0].text, Bz.verbrauch[0].weg, Bz.zeit, Bz.knoepfe.map(function (k) { return k.text; })], [3, 'stich', 'Vorläufer, im Graben', true, '3 Runden, kaum zwanzig Herzschläge', ['Durchsuchen', 'Weiter']]);
  assert.deepStrictEqual(Bz.wunden.map(function (w) { return [w.name, w.tp, w.text]; }), [['Probefigur', [22, 27], ''], ['Tamsin', [4, 11], 'ein Bolzen im Arm']], 'Wunden aus der Bilanz');
  var Bz2 = kampf.bilanzLesen({ bilanz: { gegner: [{ name: 'A', ep: 10 }, { name: 'B', stand: 'entkommen' }] }, wesen: [{ id: 'f', name: 'F', art: 'figur', x: 1, y: 1, tp: [5, 20] }, { id: 'g', name: 'G', art: 'gefolge', x: 2, y: 1 }] }, kampf.lies({ wesen: [{ id: 'f', name: 'F', art: 'figur', x: 1, y: 1, tp: [5, 20] }, { id: 'g', name: 'G', art: 'gefolge', x: 2, y: 1 }] }));
  assert.deepStrictEqual([Bz2.ausgang, Bz2.ep, Bz2.wunden.map(function (w) { return [w.name, w.tp]; }), Bz2.knoepfe.map(function (k) { return [k.text, k.prompt, k.haupt]; }), Bz2.gegner[1].blass], ['Der Kampf ist vorbei', 10, [['F', [5, 20]]], [['Weiter', 'Weiter', true]], true], 'Standards: Überschrift, Summe aus den Gegnern, Wunden aus wesen mit tp, Knopf „Weiter“');
  assert.strictEqual(kampf.bilanzLesen({}, KB), null, 'ohne bilanz keine Tafel');
  var hB = kampf.bilanzHtml(Bz);
  assert.ok(/class="kkBil"/.test(hB) && (hB.match(/class="kkBiZ"/g) || []).length === 3 && /data-ep="75"/.test(hB) && /kkBiBar kkBiGold/.test(hB) && (hB.match(/data-k="bilanz"/g) || []).length === 2, 'die Tafel: drei Gegner, EP, Balken, zwei Knöpfe');
  ok('1.9: Kampfbilanz lesen und zeichnen');
})();

(async function () {
  var b = await chromium.launch();
  try {
    var pg = await seite(b, KAMPF);
    assert.strictEqual(await pg.locator('#kampf g.kkF').count(), 36 * 12);
    assert.strictEqual(await pg.locator('#kampf g.kkO').count(), 7);
    assert.ok((await pg.locator('#kampf g.kkF.kkEr').count()) > 20, 'erreichbare Felder markiert');
    assert.strictEqual(await pg.locator('#kampf g.kkF.kkSp').count(), 0, 'keine Spurtfelder mehr: Spurt ist eine Aktion (1.6)');
    var breite = await pg.evaluate(function () { return parseInt(document.querySelector('#kampf svg').style.width, 10); });
    assert.ok(breite > 600, 'auf dem Handy vergrößert und scrollbar: ' + breite);
    ok('Raster, Wesen, Markierung');

    await klickFeld(pg, 7, 3);
    assert.deepStrictEqual(await folge(pg), ['→ 7/C (4,5 m)'], 'ein Wegstück als Chip');
    assert.strictEqual(await pg.locator('#kampf .kkWeg path.kkWegS').count(), 1, 'die Spur gezeichnet');
    assert.strictEqual(await pg.locator('#kampf .kkGeist').count(), 1, 'der Geisterstein am neuen Stand');
    await klickWesen(pg, 3);
    assert.ok(/Räuber 1 \(R1\) · Gegner · 14\/C · 10,5 m von 7\/C · angeschlagen · bedroht/.test(await pg.innerText('#kampf .kkI')), 'Wesen-Info mit Entfernung vom aktuellen Stand: ' + await pg.innerText('#kampf .kkI'));
    await pg.fill('#kampf input', 'Starry Wisp auf ihn');
    await pg.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pg), ['Kampf #7 · Probefigur: nach 7/C (4,5 m) · Ziel: Räuber 1 (10,5 m) · Weg 4,5 von 9 m · Starry Wisp auf ihn'], 'ohne Waffen: das angetippte Ziel steht in der Zeile');
    assert.ok(/kkFertig/.test(await pg.getAttribute('#kampf', 'class')), 'nach dem Senden: alles andere blass, der Kasten bleibt');
    assert.strictEqual(await pg.locator('#kampf button[data-k="zug"][disabled]').count(), 1, 'der Knopf ist verbraucht');
    ok('Zug abgeschickt');

    var pg2 = await seite(b, KAMPF, { ohnePrompt: true });
    await klickFeld(pg2, 30, 7);
    assert.ok(/so weit kommst du in diesem Zug nicht/.test(await pg2.innerText('#kampf .kkI')), 'zu weit: ' + await pg2.innerText('#kampf .kkI'));
    await klickFeld(pg2, 11, 10);
    assert.ok(/Bis 11\/J sind es 10,5 m, du hast noch 9 m; Spurt \(eine Aktion\) brächte dich hin/.test(await pg2.innerText('#kampf .kkI')), 'zu weit, aber mit Spurt: ' + await pg2.innerText('#kampf .kkI'));
    await klickFeld(pg2, 14, 3);
    assert.ok(/Da steht schon jemand/.test(await pg2.innerText('#kampf .kkI')), 'besetztes Feld');
    assert.deepStrictEqual(await folge(pg2), ['bleibt auf 4/E'], 'ohne Wegstück bleibt die Figur stehen');
    await pg2.click('#kampf button[data-k="zug"]');
    assert.ok(/Schreib das in den Chat: Kampf #7 · Probefigur: bleibt auf 4\/E/.test(await pg2.innerText('#kampf .kkZkS')), 'ohne sendPrompt sagt der Kasten, was in den Chat gehört: ' + await pg2.innerText('#kampf .kkZkS'));
    await pg2.click('#kampf button[data-k="leg"]');
    var legN = await pg2.locator('#kampf .kkL span').count();
    assert.ok(legN >= 12 && legN <= 26, 'Legende, knapp: ' + legN);
    assert.ok((await pg2.locator('#kampf .kkL svg.kkKb').count()) >= 6, 'Kachelbilder in der Legende');
    ok('Grenzen, Spurt-Hinweis, ohne sendPrompt');

    var pgH = await seite(b, HOEHE);
    assert.strictEqual(await pgH.locator('#kampf g.kkHm').count(), 3, 'drei Spielsteine mit Höhenmarke');
    assert.ok((await pgH.locator('#kampf .kkKan path.kkKa').count()) >= 14, 'Kanten mit Schatten');
    assert.ok((await pgH.locator('#kampf g.kkHs').count()) >= 2, 'Höhenschilder');
    assert.ok((await pgH.locator('#kampf .kkKan rect.kkSchR').count()) >= 4, 'leichter Schatten an Rampe und Treppe (1.6)');
    assert.ok((await pgH.locator('#kampf .kkZl span').count()) === 12, 'Zeilenbuchstaben links, die stehen bleiben');
    await pgH.click('#kampf button[data-k="spurt"]');
    await klickFeld(pgH, 12, 4);
    assert.deepStrictEqual(await folge(pgH), ['Spurt (+9 m)', '→ 12/D (15 m) · klettert 3 m'], 'Weg mit Klettern, ohne Höhe in Worten');
    await klickWesen(pgH, 2);
    assert.ok(/Räuber 1 \(R1\) · Gegner · 15\/E · 4,5 m von 12\/D/.test(await pgH.innerText('#kampf .kkI')), 'Ziel auf gleicher Ebene ohne Höhenangabe: ' + await pgH.innerText('#kampf .kkI'));
    await klickWesen(pgH, 2); // noch einmal: nicht mehr betrachtet
    await pgH.click('#kampf button[data-k="zurueck"]');
    await klickWesen(pgH, 2);
    assert.ok(/· 9 m, 3 m höher von dir/.test(await pgH.innerText('#kampf .kkI')), 'Ziel von unten: Entfernung und Höhenunterschied: ' + await pgH.innerText('#kampf .kkI'));
    await klickFeld(pgH, 27, 7);
    await pgH.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pgH), ['Kampf #2 · Probefigur: Spurt · nach 27/G (13,5 m) · Ziel: Räuber 1 (18 m, 1,5 m höher) · Weg 13,5 von 18 m']);
    ok('Höhe im Widget');

    var pg3 = await seite(b, { nr: 1, titel: 'Leer', wesen: [{ id: 'r', name: 'Räuber', art: 'gegner', x: 2, y: 2 }] });
    assert.ok(/Die Figur steht nicht auf der Karte/.test(await pg3.innerText('#kampf .kkI')), 'ohne Figur');
    assert.strictEqual(await pg3.locator('#kampf .kkZk:not([hidden])').count(), 0, 'ohne Figur kein Kasten „Zug“');
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
    assert.strictEqual(await pgA.locator('#kampf button[data-k="waffe"][data-i="0"].kkWart').count(), 1, 'die erste Waffe wartet auf ihr Ziel');
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
    assert.strictEqual(await pgA.locator('#kampf .kkO[data-w="2"].kkZielW').count(), 1, 'der Tipp mit wartender Waffe macht ihn zum Ziel der Aktion');
    var A1 = await pgA.innerText('#kampf .kkA');
    assert.ok(/Angriff: Langschwert \+4 · 1W8\+2 Hieb · Räuber 1: außer Reichweite \(4,5 m, Langschwert reicht 1,5 m\)/.test(A1), 'Lagezeile außer Reichweite: ' + A1);
    assert.ok(/kkAus/.test(await pgA.getAttribute('#kampf .kkA', 'class')), 'blass');
    assert.strictEqual(await pgA.locator('#kampf button[data-k="waffe"][data-i="0"].kkGold').count(), 1, 'die gewählte Waffe ist gold');
    assert.strictEqual(await pgA.locator('#kampf button[data-k="waffe"][data-i="1"].kkBlass[aria-disabled="true"]').count(), 1, 'die anderen Aktionen blass');
    await pgA.click('#kampf button[data-k="zurueck"]'); // die Aktion weg, die Waffe wartet wieder
    await klickFeld(pgA, 6, 5);
    assert.deepStrictEqual(await folge(pgA), ['→ 6/E (3 m)'], 'Weg: ' + await pgA.innerText('#kampf .kkFo'));
    await klickWesen(pgA, 2);
    var A2 = await pgA.innerText('#kampf .kkA');
    assert.ok(/Räuber 1: 1,5 m · in Reichweite · Vorteil: Ziel am Boden/.test(A2), 'Lagezeile vom Zwischenstand, mit Vorteil: ' + A2);
    assert.ok(/kkVor/.test(await pgA.getAttribute('#kampf .kkA', 'class')), 'grün');
    assert.strictEqual(await pgA.locator('#kampf button[data-k="warum"]').count(), 0, 'kein „Warum?“ (1.5)');
    assert.ok((await pgA.getAttribute('#kampf .kkA', 'title')).split('\n').length >= 2, 'die Sätze stehen als Tipp an der Lagezeile');
    await pgA.click('#kampf button[data-k="gefahr"]');
    assert.ok((await pgA.locator('#kampf .kkF.kkGzA').count()) >= 30, 'Gefahr: alle Zonen');
    await pgA.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pgA), ['Kampf #9 · Probefigur: nach 6/E (3 m) · Angriff: Langschwert auf Räuber 1 (1,5 m; Vorteil: Ziel am Boden) · Weg 3 von 9 m']);
    ok('Stufe A im Widget');

    var pgA2 = await seite(b, STUFEA);
    await pgA2.click('#kampf button[data-k="waffe"][data-i="0"]'); // die wartende Waffe abwählen
    await pgA2.click('#kampf .kkIt[data-w="3"]');
    assert.strictEqual(await pgA2.locator('#kampf .kkO[data-w="3"].kkSel').count(), 1, 'Tipp in der Leiste ohne wartende Waffe: betrachtet den Gegner');
    assert.strictEqual(await pgA2.locator('#kampf .kkF.kkGz').count(), 19, 'und zeigt seine Zone (Spieß, 3 m, ohne die Wand)');
    await pgA2.click('#kampf .kkIt[data-w="3"]');
    assert.strictEqual(await pgA2.locator('#kampf .kkF.kkGz').count(), 0, 'noch einmal: aufgehoben');
    await pgA2.click('#kampf button[data-k="waffe"][data-i="0"]'); // das Schwert wartet wieder
    await pgA2.press('#kampf input', 'Enter'); // Enter im Freitext schickt; ohne Wegstück bleibt die Figur
    assert.deepStrictEqual(await gesendet(pgA2), ['Kampf #9 · Probefigur: bleibt auf 4/E · Waffe: Langschwert'], 'ohne Ziel steht die wartende Waffe trotzdem in der Zeile (1.3.1)');
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
    assert.strictEqual(await pgD.locator('#kampf button.kkSenden[data-k="zug"]').count(), 1, 'der breite Knopf schickt den Zug');
    assert.strictEqual(await pgD.getAttribute('#kampf button[data-k="waffe"][data-i="0"] svg.kkMo', 'aria-label'), 'einhändig', 'Langschwert zeigt eine Faust');
    await klickWesen(pgD, 3); // Räuber 3 auf der Böschung, mit dem wartenden Langschwert
    assert.ok(/Angriff: Langschwert, einhändig \+4 · 1W8\+2 Hieb/.test(await pgD.innerText('#kampf .kkA')), 'Lagezeile einhändig: ' + await pgD.innerText('#kampf .kkA'));
    await pgD.click('#kampf button[data-k="waffe"][data-i="0"]'); // noch einmal: beidhändig, die Aktion bleibt
    assert.strictEqual(await pgD.getAttribute('#kampf button[data-k="waffe"][data-i="0"] svg.kkMo', 'aria-label'), 'beidhändig', 'zwei Fäuste');
    assert.ok(/Angriff: Langschwert, beidhändig \+4 · 1W10\+2 Hieb/.test(await pgD.innerText('#kampf .kkA')), 'Lagezeile beidhändig: ' + await pgD.innerText('#kampf .kkA'));
    await pgD.click('#kampf button[data-k="zurueck"]');
    await pgD.click('#kampf button[data-k="waffe"][data-i="1"]'); // Dolch, Nahkampf, wartet
    assert.strictEqual(await pgD.locator('#kampf button[data-k="waffe"][data-i="1"].kkWart').count(), 1);
    assert.strictEqual(await pgD.locator('#kampf .kkReich rect').count(), 1, 'Dolch im Nahkampf: ein Quadrat');
    await pgD.click('#kampf button[data-k="waffe"][data-i="1"]'); // geworfen
    assert.strictEqual(await pgD.getAttribute('#kampf button[data-k="waffe"][data-i="1"] svg.kkMo', 'aria-label'), 'geworfen', 'Fadenkreuz');
    assert.strictEqual(await pgD.locator('#kampf .kkReich rect').count(), 2, 'geworfen: normale und lange Reichweite');
    await pgD.click('#kampf button[data-k="zauber"][data-i="1"]'); // Zielsicherer Schlag mit dem Dolch, geworfen, wartet
    assert.strictEqual(await pgD.locator('#kampf button[data-k="waffe"][data-i="1"].kkMit').count(), 1, 'die Waffe des Zaubers ist markiert');
    await klickWesen(pgD, 3);
    var AD = await pgD.innerText('#kampf .kkA');
    assert.ok(/Zauber: Zielsicherer Schlag mit Dolch, geworfen \+4 · 1W4\+2 gleißend/.test(AD), 'Zauber mit Waffe: ' + AD);
    await pgD.click('#kampf button[data-k="zurueck"]');
    await pgD.click('#kampf button[data-k="zauber"][data-i="0"]');
    await klickWesen(pgD, 3);
    assert.ok(/Zauber: Starry Wisp \+4 · 1W8 gleißend · Räuber 3: 13,5 m, 3 m höher/.test(await pgD.innerText('#kampf .kkA')), 'Starry Wisp: ' + await pgD.innerText('#kampf .kkA'));
    await pgD.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pgD), ['Kampf #11 · Probefigur: bleibt auf 9/C · Zauber: Starry Wisp auf Räuber 3 (13,5 m, 3 m höher)']);
    ok('1.3: Kacheln, Schatten, Modi, Zauber');

    var pgE = await seite(b, DREI);
    await klickWesen(pgE, 1); // Räuber 1 ergibt sich; das wartende Langschwert macht ihn zum Ziel
    assert.strictEqual(await pgE.locator('#kampf .kkF.kkGz').count(), 0, 'wer sich ergibt, bedroht kein Feld');
    assert.strictEqual(await pgE.locator('#kampf .kkO[data-w="1"].kkZielW').count(), 1, 'Ziel der Aktion');
    await pgE.click('#kampf button[data-k="zurueck"]');
    assert.strictEqual(await pgE.locator('#kampf g.kkO[data-w="1"] g.kkPl').count(), 1, 'eine Plakette: die weiße Fahne');
    assert.strictEqual(await pgE.$eval('#kampf g.kkO[data-w="1"] g.kkPl title', function (e) { return e.textContent; }), 'ergibt sich');
    assert.strictEqual(await pgE.locator('#kampf .kkIt[data-w="1"] svg.kkKb').count(), 1, 'die Plakette auch in der Reihenfolge');
    assert.strictEqual(await pgE.locator('#kampf g.kkO[data-w="2"] polygon.kkWs').count(), 1, 'schwer verletzt: roter Ring, als Raute wie der Gegner (1.8)');
    assert.strictEqual(await pgE.locator('#kampf g.kkO[data-w="2"] g.kkPl').count(), 2, 'vergiftet und liegend (aus dem Wort „am Boden“)');
    assert.strictEqual(await pgE.locator('#kampf g.kkO[data-w="4"].kkBlass').count(), 1, 'bewusstlos: blass');
    assert.strictEqual(await pgE.locator('#kampf g.kkO[data-w="5"] g.kkPl').count(), 4, 'fünf Zustände: drei Plaketten und „+2“');
    assert.ok(/\+2/.test(await pgE.$eval('#kampf g.kkO[data-w="5"]', function (e) { return e.textContent; })), '„+2“ am Stein');
    await pgE.click('#kampf button[data-k="gefahr"]');
    var gz = await pgE.locator('#kampf .kkF.kkGzA').count();
    assert.ok(gz >= 20 && gz <= 32, 'Gefahr: nur Räuber 2 und 3 bedrohen (' + gz + ')');
    await pgE.click('#kampf button[data-k="leg"]');
    var legT = await pgE.innerText('#kampf .kkL');
    assert.ok(/ergibt sich/.test(legT) && /schwer verletzt/.test(legT) && /Gras/.test(legT) && /Eis/.test(legT) && !/Planken/.test(legT) && /Geisterstein/.test(legT), 'Legende nennt, was vorkommt: ' + legT.replace(/\n/g, ' | '));
    await klickFeld(pgE, 5, 7);
    await klickWesen(pgE, 4); // der Bewusstlose, mit dem wartenden Schwert vom Zwischenstand aus
    assert.ok(/Vorteil: Ziel wehrlos/.test(await pgE.innerText('#kampf .kkA')), 'wehrlos: Vorteil: ' + await pgE.innerText('#kampf .kkA'));
    ok('1.3: Zustände, Wunden, Gefahr, Legende');

    // 1.3.1: ohne angetipptes Ziel trägt die Zugzeile den gewählten Zauber (Probekampf an der Furt: „Auf S“ kam ohne den Zielsicheren Schlag an)
    var pgF = await seite(b, DREI);
    await pgF.click('#kampf button[data-k="zauber"][data-i="1"]');
    await pgF.fill('#kampf input', 'Auf S');
    await pgF.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pgF), ['Kampf #11 · Probefigur: bleibt auf 9/C · Zauber: Zielsicherer Schlag mit Langschwert, einhändig · Auf S']);
    ok('1.3.1: Zauber ohne Ziel in der Zugzeile');

    // 1.4 im Widget: blauer Rahmen, Pfeile, Wesen-Info, Rettungswurf-Zauber, TP im Kopf; seit 1.6 die Aktion mitten im Weg statt „Aktion zuerst“
    var pgG = await seite(b, DREI);
    assert.ok((await pgG.getAttribute('#kampf .kkBew path.kkBw', 'd')).length > 40, 'blauer Rahmen der Bewegung');
    assert.strictEqual(await pgG.locator('#kampf .kkBew path.kkBwS').count(), 0, 'gestrichelt nur mit Spurt (1.6)');
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
    assert.strictEqual(await pgG.locator('#kampf button[data-k="zuerst"]').count(), 0, '„Aktion zuerst“ gibt es nicht mehr (1.6)');
    await pgG.click('#kampf button[data-k="zauber"][data-i="2"]'); // Dissonant Whispers wartet
    await klickWesen(pgG, 2); // Räuber 2: die Aktion vom Stand aus, vor dem Weg
    var wiT = await pgG.innerText('#kampf .kkI');
    assert.ok(/^Räuber 2 \(R2\) · Gegner · 11\/B · 3 m von dir · schwer verletzt · vergiftet · liegend · bedroht 8 Felder/.test(wiT), 'Wesen-Info: ' + wiT);
    var AG = await pgG.innerText('#kampf .kkA');
    assert.ok(/^Zauber: Dissonant Whispers · Rettungswurf WEI gegen SG 12 · 3W6 psychisch · halb bei Erfolg; muss mit seiner Reaktion fliehen · Räuber 2: 3 m · in Reichweite/.test(AG), 'Lagezeile ohne Angriffswurf: ' + AG);
    await klickFeld(pgG, 13, 3);
    assert.deepStrictEqual(await folge(pgG), ['Zauber: Dissonant Whispers auf Räuber 2 (3 m)', '→ 13/C (6 m)', 'verlässt Räuber 2: Gelegenheitsangriff'], 'erst die Aktion, dann der Weg: ' + (await folge(pgG)).join(' | '));
    await pgG.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pgG), ['Kampf #11 · Probefigur: Zauber: Dissonant Whispers auf Räuber 2 (3 m; Rettungswurf WEI SG 12) · nach 13/C (6 m) · verlässt Räuber 2: Gelegenheitsangriff · Weg 6 von 9 m']);
    ok('1.4: Rahmen, Pfeile, Wesen-Info, Rettungswurf, TP; Aktion vor dem Weg');

    // 1.5 im Widget (Zollbrücke): Bonusaktion mit Ziel, Aufstehen, Hinweis, vier Pfeile, Ausschnitt mit ursprung
    var pgZ = await seite(b, ZOLL);
    assert.strictEqual(await pgZ.locator('#kampf button[data-k="bonus"]').count(), 3, 'drei Bonusaktionen als Knöpfe');
    assert.strictEqual(await pgZ.locator('#kampf .kkFo button[data-k="auf"][aria-pressed="true"]').count(), 1, '„steht auf“ als erster Chip, weil die Figur liegt');
    assert.ok(/Bewegung 9 m \(liegt\)/.test(await pgZ.innerText('#kampf .kkKopf')), 'die Bewegung im Kopf: ' + await pgZ.innerText('#kampf .kkKopf'));
    assert.strictEqual(await pgZ.innerText('#kampf .kkZkW'), 'Weg 0 von 4,5 m', 'das halbe Budget im Kasten');
    for (var r of ['w', 'e', 'n', 's']) assert.strictEqual(await pgZ.locator('#kampf .kkBl-' + r + ':not([hidden])').count(), 1, 'Pfeil ' + r + ' sichtbar: die Karte geht in alle vier Richtungen weiter');
    var st0 = await pgZ.evaluate(function () { return document.querySelector('#kampf .kkR').scrollTop; });
    await pgZ.click('#kampf .kkBl-n'); await pgZ.waitForTimeout(600);
    var st1 = await pgZ.evaluate(function () { return document.querySelector('#kampf .kkR').scrollTop; });
    assert.ok(st0 > 20 && st1 < st0 - 20, 'nach oben geblättert: ' + st0 + ' -> ' + st1);
    await pgZ.click('#kampf .kkBl-s'); await pgZ.waitForTimeout(600);
    assert.ok((await pgZ.evaluate(function () { return document.querySelector('#kampf .kkR').scrollTop; })) > st1 + 20, 'und wieder nach unten');
    assert.deepStrictEqual(await folge(pgZ), ['steht auf', 'bleibt auf 25/J'], 'ursprung [10, C]: 16/H heißt 25/J');
    await pgZ.click('#kampf button[data-k="bonus"][data-i="0"]'); // Healing Word wartet auf ihr Ziel
    assert.strictEqual(await pgZ.locator('#kampf button[data-k="bonus"][data-i="0"].kkWart').count(), 1, 'die gewählte Bonusaktion wartet (gestrichelt)');
    await klickWesen(pgZ, 1); // Hanno: der zweite Tipp wählt das Ziel der Bonusaktion, nicht das der Aktion
    assert.strictEqual(await pgZ.locator('#kampf .kkO.kkZielW').count(), 0, 'Hanno ist Ziel der Bonusaktion, nicht der Aktion');
    assert.strictEqual(await pgZ.locator('#kampf .kkO[data-w="1"].kkBonZ').count(), 1, 'der gestrichelte Ring der Bonusaktion');
    assert.deepStrictEqual(await folge(pgZ), ['steht auf', 'bleibt auf 25/J', 'Bonusaktion: Healing Word auf Hanno (3 m)'], 'die Bonusaktion vor der Aktion');
    await klickWesen(pgZ, 2); // der Zöllner: jetzt das Ziel der Aktion
    assert.strictEqual(await pgZ.locator('#kampf .kkO[data-w="2"].kkZielW').count(), 1, 'der nächste Tipp wählt das Ziel der Aktion');
    assert.ok(!/du liegst/.test(await pgZ.innerText('#kampf .kkA')), 'mit „steht auf“ kein Nachteil vom Boden: ' + await pgZ.innerText('#kampf .kkA'));
    await klickFeld(pgZ, 19, 8); // neben den Zöllner, 3 Felder, genau die halbe Bewegung; nach der Aktion
    await pgZ.fill('#kampf input', 'Für Hanno!');
    await pgZ.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pgZ), ['Kampf #14 · Probefigur: steht auf · Bonusaktion: Healing Word auf Hanno (3 m) · Angriff: Langschwert, einhändig auf Zöllner (außer Reichweite: 6 m, Langschwert, einhändig reicht 1,5 m) · nach 28/J (4,5 m) · Weg 4,5 von 4,5 m · Für Hanno!'], 'Zugzeile in Folgenreihenfolge: Bonusaktion, Aktion vom Stand, dann der Weg');
    ok('1.5: Bonusaktion vor der Aktion, Aufstehen, Pfeile, Ausschnitt');

    var pgZ2 = await seite(b, ZOLL);
    await pgZ2.click('#kampf .kkFo button[data-k="auf"]'); // liegen bleiben
    assert.deepStrictEqual(await folge(pgZ2), ['bleibt liegen', 'bleibt liegen auf 25/J']);
    await klickWesen(pgZ2, 1); // Hanno als Ziel der Aktion: Hinweis
    assert.ok(/Hanno \(dein eigener Mann\): außer Reichweite/.test(await pgZ2.innerText('#kampf .kkA')), 'Hinweis beim Gefolge: ' + await pgZ2.innerText('#kampf .kkA'));
    await pgZ2.click('#kampf button[data-k="zurueck"]');
    await klickFeld(pgZ2, 15, 9);
    await klickWesen(pgZ2, 1);
    assert.ok(/Hanno \(dein eigener Mann\): 1,5 m · in Reichweite · Nachteil: du liegst/.test(await pgZ2.innerText('#kampf .kkA')), 'liegen bleiben: Nachteil bleibt: ' + await pgZ2.innerText('#kampf .kkA'));
    assert.deepStrictEqual(await folge(pgZ2), ['bleibt liegen', 'kriecht → 24/K (1,5 m)', 'Angriff: Langschwert, einhändig auf Hanno (1,5 m)'], 'kriecht: ' + (await folge(pgZ2)).join(' | '));
    await pgZ2.click('#kampf button[data-k="bonus"][data-i="1"]'); // Inspiration
    await klickWesen(pgZ2, 0); // auf sich selbst: nicht erlaubt
    assert.ok(/Du selbst.*taugt nicht als Ziel für Bardische Inspiration/.test(await pgZ2.innerText('#kampf .kkI')), 'Inspiration nicht auf sich selbst: ' + await pgZ2.innerText('#kampf .kkI'));
    await pgZ2.click('#kampf .kkIt[data-w="5"]'); // der Hund, in der Leiste
    assert.ok(/Bonusaktion: Bardische Inspiration auf Hund \(9 m\)/.test((await folge(pgZ2)).join(' | ')), 'Leiste wählt das Ziel der Bonusaktion: ' + (await folge(pgZ2)).join(' | '));
    await pgZ2.click('#kampf button[data-k="bonus"][data-i="1"]'); // noch einmal: aus dem Zug
    assert.ok(!/Bonusaktion/.test((await folge(pgZ2)).join(' | ')), 'abgewählt');
    assert.strictEqual(await pgZ2.locator('#kampf button[data-k="bonus"][data-i="2"].kkBlass').count(), 1, 'die Zweitwaffe blass neben dem Langschwert (nicht leicht; ohne `leicht` in den Daten der 1.5)');
    await pgZ2.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pgZ2), ['Kampf #14 · Probefigur: kriecht nach 24/K (1,5 m) · Angriff: Langschwert, einhändig auf Hanno (1,5 m; Nachteil: du liegst) · Weg 1,5 von 4,5 m'], 'kriecht, Nachteil');
    ok('1.5: liegen bleiben, Hinweis, Inspiration');

    // 1.6 im Widget (Schleusentor): die Bedienung in der neuen Ordnung, kein Erklärtext, Zeichen, Schatten an der Treppe
    var pgT = await seite(b, TOR);
    var ordnung = await pgT.evaluate(function () { return Array.prototype.map.call(document.querySelector('#kampf').children, function (c) { return c.className; }); });
    assert.deepStrictEqual(ordnung.slice(ordnung.indexOf('kkRW')), ['kkRW', 'kkWz', 'kkI', 'kkA', 'kkB kkAk', 'kkB kkBo', 'kkZk', 'kkL'], 'unter der Karte: Werkzeuge, Infozeile, Lagezeile, Aktion, Bonusaktion, Zug, Legende: ' + ordnung.join(' | '));
    assert.deepStrictEqual(await pgT.evaluate(function () { return Array.prototype.map.call(document.querySelectorAll('#kampf .kkWz button'), function (b) { return b.getAttribute('data-k'); }); }), ['minus', 'plus', 'figur', 'gefahr', 'leg'], 'die Werkzeuge in der schmalen Zeile direkt unter der Karte');
    assert.strictEqual(await pgT.evaluate(function () { var bs = document.querySelectorAll('#kampf .kkZk button'); return bs[bs.length - 1].getAttribute('data-k') + ' ' + bs[bs.length - 1].className; }), 'zug kkSenden', 'der breite Knopf „Zug abschicken“ ist das Letzte im Kasten');
    assert.strictEqual(await pgT.innerText('#kampf .kkI'), '', 'kein Erklärtext in der Infozeile');
    assert.strictEqual(await pgT.locator('#kampf button[data-k="zuerst"], #kampf button[data-k="warum"], #kampf .kkB button[data-k="auf"]').count(), 0, 'keine Schalter „Aktion zuerst“, „Warum?“, „Aufstehen“ mehr');
    assert.deepStrictEqual(await pgT.evaluate(function () { return Array.prototype.map.call(document.querySelectorAll('#kampf .kkAk button svg.kkZc'), function (s) { return s.getAttribute('data-z'); }); }),
      ['hieb', 'stich', 'gleißend', 'gleißend', 'psychisch', 'rettung', 'spurt', 'rueckzug', 'aktion', 'aktion'], 'die Zeichen der Schadensarten an den Knöpfen der Aktion');
    assert.deepStrictEqual(await pgT.evaluate(function () { return Array.prototype.map.call(document.querySelectorAll('#kampf .kkBo button svg.kkZc'), function (s) { return s.getAttribute('data-z'); }); }), ['heilung', 'inspiration', 'stich'], 'und der Bonusaktion');
    assert.ok((await pgT.locator('#kampf .kkKan rect.kkSchR').count()) >= 4 && (await pgT.locator('#kampf .kkKan rect.kkSch:not(.kkSchR)').count()) >= 40, 'leichter Schatten an den Treppen, voller an den Böschungen');
    // 1.7: Spuren, neu, außer Sicht
    assert.strictEqual(await pgT.locator('#kampf .kkSpur g.kkSp').count(), 2, 'zwei Spuren: Rolf und der Hund');
    assert.strictEqual(await pgT.locator('#kampf .kkSpur g.kkSp[data-w="3"] polygon.kkSpK').count(), 1, 'die Pfeilspitze am neuen Feld');
    assert.strictEqual(await pgT.locator('#kampf g.kkO[data-w="4"].kkZuletzt').count(), 1, 'der Schütze als Schatten');
    assert.strictEqual(await pgT.locator('#kampf g.kkO[data-w="6"] g.kkNeu').count(), 1, 'Torfstecher 2 trägt „neu“');
    await klickWesen(pgT, 4); // der Schatten: kein Ziel, nur Auskunft
    assert.ok(/Schütze \(S\) · Gegner · 25\/E · .* · außer Sicht, zuletzt hier gesehen; kein Ziel$/.test(await pgT.innerText('#kampf .kkI')), 'Auskunft zum Schatten: ' + await pgT.innerText('#kampf .kkI'));
    assert.strictEqual((await folge(pgT)).length, 2, 'die wartende Waffe hat ihn nicht zum Ziel gemacht');
    assert.strictEqual(await pgT.locator('#kampf .kkF.kkGz').count(), 0, 'keine Zone für einen Schatten');
    await klickWesen(pgT, 3); // der Hund, mit dem wartenden Langschwert: Ziel, Auskunft mit Spur
    assert.ok(/Hund \(HU\) · Gegner · 22\/I · 7,5 m von dir · Ulfs Rüde · kam von 24\/J · bedroht 8 Felder/.test(await pgT.innerText('#kampf .kkI')), 'Auskunft mit Spur: ' + await pgT.innerText('#kampf .kkI'));
    await pgT.click('#kampf button[data-k="zurueck"]'); // die Aktion auf den Hund wieder weg; das Langschwert wartet erneut
    assert.strictEqual(await pgT.locator('#kampf g.kkHs').count(), 3, 'drei Schilder: Böschung West (mit ihrer Treppe), Krone, Böschung Ost');
    await klickWesen(pgT, 2); // Ulf, mit dem wartenden Langschwert: die Aktion vom Stand, außer Reichweite
    assert.ok(!/hoch\b/.test(await pgT.innerText('#kampf .kkI')) && /Ulf \(U\) · Gegner · 21\/H · 6 m von dir · Reichweite 3 m · der Schleusenwärter, Spieß · bedroht/.test(await pgT.innerText('#kampf .kkI')), 'Auskunft ohne Höhe in Worten: ' + await pgT.innerText('#kampf .kkI'));
    await pgT.click('#kampf button[data-k="zurueck"]');
    await klickFeld(pgT, 19, 8); // erstes Wegstück
    assert.strictEqual(await pgT.innerText('#kampf .kkI'), '', 'ein Wegstück braucht keinen Text');
    assert.strictEqual(await pgT.evaluate(function () { var c = document.querySelector('#kampf g.kkO.kkA-figur circle.kkTok'); return +c.getAttribute('cx'); }), 26 + 16 * 30 + 15, 'der Stein der Figur bleibt am Ausgangsfeld');
    assert.ok(/nach den Wegstücken: 19\/H/.test(await pgT.$eval('#kampf .kkGeist title', function (t) { return t.textContent; })), 'der Geisterstein steht am aktuellen Stand');
    assert.strictEqual(await pgT.locator('#kampf .kkWeg circle.kkStat').count(), 1, 'eine Station');
    await pgT.click('#kampf button[data-k="zauber"][data-i="2"]'); // Dissonant Whispers wartet
    await klickWesen(pgT, 2); // auf Ulf, vom Zwischenstand 19/H: 3 m
    await klickFeld(pgT, 20, 8); // zweites Wegstück nach der Aktion
    assert.strictEqual(await pgT.locator('#kampf .kkWeg path.kkWegS').count(), 2, 'zwei Stücke als Spur');
    assert.strictEqual(await pgT.locator('#kampf .kkWeg circle.kkStat').count(), 2, 'zwei Stationen');
    assert.strictEqual(await pgT.innerText('#kampf .kkZkW'), 'Weg 4,5 von 4,5 m');
    assert.strictEqual(await pgT.locator('#kampf .kkBew path').count(), 0, 'kein Rahmen mehr: die Bewegung ist verbraucht');
    assert.strictEqual(await pgT.locator('#kampf button[data-k="bonus"][data-i="2"].kkBlass[aria-disabled="true"]').count(), 1, 'die Zweitwaffe blass neben einem Zauber');
    await pgT.click('#kampf button[data-k="bonus"][data-i="2"]', { force: true }); // tut nichts
    assert.strictEqual((await folge(pgT)).length, 4, 'blass heißt: kein Schritt');
    await klickFeld(pgT, 20, 8); // ein Tipp auf den Geisterstein nimmt das letzte Stück zurück
    assert.deepStrictEqual(await folge(pgT), ['steht auf', '→ 19/H (3 m)', 'Zauber: Dissonant Whispers auf Ulf (3 m)'], 'Zurück per Tipp auf den Stand');
    await pgT.click('#kampf button[data-k="zurueck"]'); // der Zauber weg
    await pgT.click('#kampf button[data-k="waffe"][data-i="1"]'); // der Dolch (leicht) wartet
    await pgT.click('#kampf button[data-k="waffe"][data-i="1"]'); // geworfen
    await klickWesen(pgT, 2);
    assert.strictEqual(await pgT.locator('#kampf button[data-k="bonus"][data-i="2"]:not(.kkBlass)').count(), 1, 'neben dem leichten Dolch ist die Zweitwaffe erlaubt');
    await pgT.click('#kampf button[data-k="bonus"][data-i="2"]');
    await klickWesen(pgT, 2);
    assert.deepStrictEqual(await folge(pgT), ['steht auf', '→ 19/H (3 m)', 'Angriff: Dolch, geworfen auf Ulf (3 m)', 'Bonusaktion: Dolch (Zweitwaffe) auf Ulf (außer Reichweite: 3 m, Dolch reicht 1,5 m)'], 'die Zweitwaffe in der Folge: ' + (await folge(pgT)).join(' | '));
    await pgT.click('#kampf button[data-k="waffe"][data-i="0"]', { force: true }); // blass: tut nichts
    assert.strictEqual((await folge(pgT)).length, 4);
    await pgT.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pgT), ['Kampf #21 · Probefigur: steht auf · nach 19/H (3 m) · Angriff: Dolch, geworfen auf Ulf (3 m) · Bonusaktion: Dolch (Zweitwaffe) auf Ulf (außer Reichweite: 3 m, Dolch reicht 1,5 m) · Weg 3 von 4,5 m']);
    ok('1.6: Ordnung, Zeichen, Schatten, Geisterstein, Zweitwaffe');

    // 1.6: Spurt als Aktion (Budget), Rückzug, Aktion mitten im Weg, Gelegenheitsangriff je Stück, „Zurück“
    var OA = { nr: 3, titel: 'Gasse', figur: 'f', spalten: 8, zeilen: 4, boden: ['########', '........', '........', '........'],
      wesen: [{ id: 'f', name: 'Figur', art: 'figur', x: 2, y: 2, bewegung: 9, waffen: [{ name: 'Keule', reichweite: 1.5 }], aktionen: [{ name: 'Hilfe', wirkung: 'Vorteil für den Nächsten' }] }, { id: 'r', name: 'Räuber', art: 'gegner', x: 3, y: 3 }] };
    var pgO = await seite(b, OA);
    await klickFeld(pgO, 4, 2);
    assert.strictEqual(await pgO.locator('#kampf .kkWeg polygon.kkOa').count(), 0, 'in der Zone geblieben: kein Dreieck');
    await klickWesen(pgO, 1); // die Keule, vom Zwischenstand 4/B
    assert.ok(/Räuber: 1,5 m · in Reichweite/.test(await pgO.innerText('#kampf .kkA')), 'Aktion mitten im Weg: ' + await pgO.innerText('#kampf .kkA'));
    await klickFeld(pgO, 6, 2);
    assert.deepStrictEqual(await folge(pgO), ['→ 4/B (3 m)', 'Angriff: Keule auf Räuber (1,5 m)', '→ 6/B (3 m)', 'verlässt Räuber: Gelegenheitsangriff'], 'das zweite Stück verlässt die Zone: ' + (await folge(pgO)).join(' | '));
    assert.strictEqual(await pgO.locator('#kampf .kkWeg polygon.kkOa').count(), 1, 'das Dreieck am zweiten Stück');
    assert.ok(/Gelegenheitsangriff/.test(await pgO.getAttribute('#kampf .kkA', 'title')), 'der Satz dazu als Tipp an der Lagezeile');
    await pgO.click('#kampf button[data-k="zurueck"]');
    assert.deepStrictEqual(await folge(pgO), ['→ 4/B (3 m)', 'Angriff: Keule auf Räuber (1,5 m)'], '„Zurück“ nimmt das letzte Stück samt Gelegenheitsangriff');
    await pgO.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pgO), ['Kampf #3 · Figur: nach 4/B (3 m) · Angriff: Keule auf Räuber (1,5 m) · Weg 3 von 9 m']);
    var pgO2 = await seite(b, OA);
    await klickFeld(pgO2, 8, 2);
    assert.deepStrictEqual(await folge(pgO2), ['→ 8/B (9 m)', 'verlässt Räuber: Gelegenheitsangriff'], 'neun Meter reichen gerade');
    await pgO2.click('#kampf button[data-k="zurueck"]');
    await klickFeld(pgO2, 8, 4);
    assert.deepStrictEqual(await folge(pgO2), ['→ 8/D (9 m)', 'verlässt Räuber: Gelegenheitsangriff'], 'sechs Felder schräg');
    await pgO2.click('#kampf button[data-k="zurueck"]');
    await pgO2.click('#kampf button[data-k="rueckzug"]');
    await klickFeld(pgO2, 8, 4);
    assert.deepStrictEqual(await folge(pgO2), ['Rückzug', '→ 8/D (9 m)'], 'nach Rückzug kein Gelegenheitsangriff');
    assert.strictEqual(await pgO2.locator('#kampf button[data-k="waffe"][data-i="0"].kkBlass').count(), 1, 'die Keule blass: Rückzug ist die Aktion');
    await pgO2.click('#kampf button[data-k="rueckzug"]'); // noch einmal: aus dem Zug; das Wegstück bleibt, der Gelegenheitsangriff kehrt zurück
    assert.deepStrictEqual(await folge(pgO2), ['→ 8/D (9 m)', 'verlässt Räuber: Gelegenheitsangriff']);
    await pgO2.click('#kampf button[data-k="zurueck"]');
    await klickFeld(pgO2, 5, 2);
    await pgO2.click('#kampf button[data-k="spurt"]');
    assert.strictEqual(await pgO2.innerText('#kampf .kkZkW'), 'Weg 4,5 von 18 m', 'Spurt verdoppelt das Budget');
    assert.strictEqual(await pgO2.locator('#kampf .kkBew path.kkBwS').count(), 1, 'der Rahmen gestrichelt mit Spurt');
    await klickFeld(pgO2, 8, 4); // 3 weitere Felder
    await klickFeld(pgO2, 2, 4); // 6 zurück: 3 + 3 + 6 = 12 Felder, im Spurt-Budget
    assert.deepStrictEqual(await folge(pgO2), ['→ 5/B (4,5 m)', 'verlässt Räuber: Gelegenheitsangriff', 'Spurt (+9 m)', '→ 8/D (4,5 m)', '→ 2/D (9 m)'], 'drei Stücke, der Gelegenheitsangriff nur einmal: ' + (await folge(pgO2)).join(' | '));
    await pgO2.click('#kampf button[data-k="spurt"]'); // Spurt weg: die Stücke über dem Budget fallen
    assert.deepStrictEqual(await folge(pgO2), ['→ 5/B (4,5 m)', 'verlässt Räuber: Gelegenheitsangriff', '→ 8/D (4,5 m)'], 'ohne Spurt bleibt, was in 9 m passt');
    await pgO2.click('#kampf button[data-k="aktion"][data-i="0"]'); // Hilfe
    await pgO2.click('#kampf button[data-k="zug"]');
    assert.deepStrictEqual(await gesendet(pgO2), ['Kampf #3 · Figur: nach 5/B (4,5 m) · verlässt Räuber: Gelegenheitsangriff · nach 8/D (4,5 m) · Aktion: Hilfe · Weg 9 von 9 m']);
    ok('1.6: Spurt, Rückzug, Stücke, Gelegenheitsangriff, Zurück');

    // 1.8 (Stufe C) im Widget: die Aufstellung vor dem Initiativewurf
    var pgU = await seite(b, AUF);
    assert.strictEqual(await pgU.locator('#kampf .kkAk[hidden], #kampf .kkBo[hidden], #kampf .kkZk:not(.kkAu)[hidden]').count(), 3, 'in der Aufstellung weder Aktion noch Bonusaktion noch Kasten „Zug“');
    assert.strictEqual(await pgU.locator('#kampf .kkZk.kkAu:not([hidden])').count(), 1, 'dafür der Kasten „Aufstellung“');
    assert.strictEqual(await pgU.locator('#kampf .kkAu button.kkSenden[data-k="aufst"].kkBlass[aria-disabled="true"]').count(), 1, 'der breite Knopf wartet blass, solange jemand fehlt');
    assert.strictEqual(await pgU.innerText('#kampf .kkAuW'), '0 von 3 aufgestellt');
    assert.deepStrictEqual(await pgU.evaluate(function () { return Array.prototype.map.call(document.querySelectorAll('#kampf .kkAuF button'), function (c) { return c.textContent.trim() + '|' + c.getAttribute('aria-pressed'); }); }), ['Probefigur · 8/J ?|true', 'Tamsin · 7/J ?|false', 'Brock · 8/K ?|false'], 'ein Chip je Stein, die Figur zuerst dran');
    assert.strictEqual(await pgU.locator('#kampf g.kkF.kkAuf').count(), 12, 'zwölf blaue Felder');
    assert.ok((await pgU.getAttribute('#kampf .kkAufz path', 'd')).length > 40, 'der Rahmen um die Aufstellung');
    assert.strictEqual(await pgU.locator('#kampf .kkBew path, #kampf .kkReich rect, #kampf .kkA:not([hidden])').count(), 0, 'kein blauer Rahmen, kein Reichweitenquadrat, keine Lagezeile');
    assert.strictEqual(await pgU.locator('#kampf g.kkO[data-w="0"].kkAufst').count(), 1, 'die Figur ist zum Setzen gewählt');
    assert.strictEqual(await pgU.innerText('#kampf .kkI'), 'Noch ist niemand in Reichweite.', 'der Hinweis der Spielleitung, sonst nichts');
    await klickFeld(pgU, 20, 5);
    assert.ok(/Nur die blauen Felder/.test(await pgU.innerText('#kampf .kkI')), 'ein graues Feld: ' + await pgU.innerText('#kampf .kkI'));
    await klickFeld(pgU, 12, 5);
    assert.strictEqual(await pgU.evaluate(function () { var c = document.querySelector('#kampf g.kkO[data-w="0"] .kkTok'); return +c.getAttribute('cx'); }), 26 + 11 * 30 + 15, 'die Figur steht auf 12/E');
    assert.strictEqual(await pgU.locator('#kampf g.kkO[data-w="1"].kkAufst').count(), 1, 'danach ist Tamsin dran');
    await klickFeld(pgU, 12, 5);
    assert.ok(/Da steht schon jemand: Probefigur/.test(await pgU.innerText('#kampf .kkI')), 'besetzt: ' + await pgU.innerText('#kampf .kkI'));
    await klickFeld(pgU, 13, 5);
    assert.deepStrictEqual(await pgU.evaluate(function () { return Array.prototype.map.call(document.querySelectorAll('#kampf .kkAuF button'), function (c) { return c.textContent.trim(); }); }), ['Probefigur · 12/E', 'Tamsin · 13/E', 'Brock · 8/K ?'], 'zwei gesetzt, Brock fehlt');
    await pgU.click('#kampf button[data-k="aufst"]', { force: true });
    assert.ok(/Brock.*steht noch nicht auf einem Aufstellungsfeld/.test(await pgU.innerText('#kampf .kkI')), 'der blasse Knopf sagt, wer fehlt: ' + await pgU.innerText('#kampf .kkI'));
    assert.deepStrictEqual(await gesendet(pgU), [], 'und schickt nichts');
    await pgU.click('#kampf .kkAuF button[data-i="0"]'); // die Figur noch einmal: umstellen
    await klickFeld(pgU, 11, 5);
    assert.strictEqual(await pgU.evaluate(function () { var c = document.querySelector('#kampf g.kkO[data-w="0"] .kkTok'); return +c.getAttribute('cx'); }), 26 + 10 * 30 + 15, 'die Figur umgestellt auf 11/E');
    await klickWesen(pgU, 3); // der Späher: Auskunft und Zone, kein Ziel
    assert.ok(/Späher \(SP\) · Gegner · 26\/H/.test(await pgU.innerText('#kampf .kkI')) && (await pgU.locator('#kampf .kkF.kkGz').count()) === 8, 'ein Gegner gibt Auskunft und zeigt seine Zone: ' + await pgU.innerText('#kampf .kkI'));
    await klickWesen(pgU, 2); // Brock
    assert.strictEqual(await pgU.locator('#kampf g.kkO[data-w="2"].kkAufst').count(), 1, 'ein Tipp auf den Hund wählt ihn');
    await klickFeld(pgU, 11, 9);
    assert.strictEqual(await pgU.innerText('#kampf .kkAuW'), '3 von 3 aufgestellt');
    assert.strictEqual(await pgU.locator('#kampf button[data-k="aufst"]:not(.kkBlass):not([aria-disabled])').count(), 1, 'alle stehen: der Knopf ist frei');
    await pgU.click('#kampf button[data-k="aufst"]');
    assert.deepStrictEqual(await gesendet(pgU), ['Aufstellung: Probefigur auf 11/E, Tamsin auf 13/E, Brock auf 11/I'], 'die Aufstellung geht an die Spielleitung');
    assert.ok(/kkFertig/.test(await pgU.getAttribute('#kampf', 'class')) && (await pgU.locator('#kampf button[data-k="aufst"][disabled]').count()) === 1, 'danach ist alles blass, der Knopf verbraucht');
    assert.ok(/Die Spielleitung würfelt die Initiative/.test(await pgU.innerText('#kampf .kkAu .kkZkS')));
    ok('1.8: Aufstellung');

    // 1.8: Formen neben Farben, Fortschritt und die drei Blässen im Widget
    var pgV = await seite(b, AUF);
    assert.strictEqual(await pgV.locator('#kampf g.kkO[data-w="3"] polygon.kkTok, #kampf g.kkO[data-w="4"] polygon.kkTok').count(), 2, 'Gegner als Raute');
    assert.strictEqual(await pgV.locator('#kampf g.kkO[data-w="2"] rect.kkTok').count(), 1, 'das Tier als abgerundetes Quadrat');
    assert.strictEqual(await pgV.locator('#kampf g.kkO[data-w="6"] circle.kkTok.kkDuenn').count(), 1, 'der Unbeteiligte als dünner Kreis');
    assert.strictEqual(await pgV.locator('#kampf g.kkO[data-w="1"] circle.kkTok:not(.kkDuenn), #kampf g.kkO[data-w="0"] circle.kkTok, #kampf g.kkO[data-w="0"] circle.kkRing').count(), 3, 'Gefolge Kreis, die Figur Kreis mit Ring');
    assert.strictEqual(await pgV.locator('#kampf g.kkO[data-w="5"].kkZuletzt polygon.kkTok').count(), 1, 'der Schatten außer Sicht behält die Raute');
    assert.strictEqual((await pgV.evaluate(function () { return getComputedStyle(document.querySelector('#kampf g.kkO[data-w="5"] .kkTok')).strokeDasharray; })).replace(/px/g, ''), '4, 3', 'außer Sicht: gestrichelt');
    assert.strictEqual(await pgV.evaluate(function () { return getComputedStyle(document.querySelector('#kampf g.kkO[data-w="6"] text.kkTx')).fill; }), 'rgb(59, 48, 40)', 'dunkle Schrift auf dem dünnen Kreis');
    assert.strictEqual(await pgV.locator('#kampf g.kkNo.kkNoF').count(), 1, 'ein Schild mit Fortschritt');
    assert.ok(/^Tür 1\/3$/.test(await pgV.$eval('#kampf g.kkNo.kkNoF text', function (e) { return e.textContent; })), '„Tür 1/3“');
    var balken = await pgV.evaluate(function () { var t = document.querySelector('#kampf g.kkNo.kkNoF rect.kkFb'), v = document.querySelector('#kampf g.kkNo.kkNoF rect.kkFv'); return [+t.getAttribute('width'), +v.getAttribute('width')]; });
    assert.ok(Math.abs(balken[1] - balken[0] / 3) < 0.2, 'der Balken ist zu einem Drittel gefüllt: ' + balken.join(' / '));
    await pgV.click('#kampf button[data-k="leg"]');
    var legU = await pgV.innerText('#kampf .kkL');
    assert.ok(/Aufstellung: hierhin/.test(legU) && /Aufgabe über Runden/.test(legU) && (await pgV.locator('#kampf .kkL svg.kkItB polygon.kkItF').count()) === 1, 'Legende mit Aufstellung, Aufgabe und den Formen');
    var pgW = await seite(b, DREI); // Räuber 4 bewusstlos (grau), Räuber 3 außer Reichweite des wartenden Schwerts (blass)
    assert.strictEqual(await pgW.evaluate(function () { return getComputedStyle(document.querySelector('#kampf g.kkO[data-w="4"] .kkTok')).fill; }), 'rgb(154, 144, 134)', 'bewusstlos: der Stein ist grau');
    assert.strictEqual(await pgW.evaluate(function () { return getComputedStyle(document.querySelector('#kampf g.kkO[data-w="4"]')).opacity; }), '0.4', 'und zugleich außer Reichweite: blass (beides zugleich, beides zu sehen)');
    assert.strictEqual(await pgW.evaluate(function () { return getComputedStyle(document.querySelector('#kampf g.kkO[data-w="3"] .kkTok')).fill; }), 'rgb(142, 59, 34)', 'Räuber 3 außer Reichweite bleibt rot');
    assert.strictEqual(await pgW.evaluate(function () { return getComputedStyle(document.querySelector('#kampf g.kkO[data-w="3"]')).opacity; }), '0.4', 'nur blass');
    assert.strictEqual(await pgW.locator('#kampf g.kkO[data-w="2"] polygon.kkWs').count(), 1, 'der Wundring folgt der Raute');
    var pl = await pgW.evaluate(function () { var g = document.querySelector('#kampf g.kkO[data-w="2"]'), t = g.querySelector('.kkTok'), p = g.querySelector('g.kkPl').getAttribute('transform').match(/translate\(([\d.-]+) ([\d.-]+)\)/); var pts = t.getAttribute('points').split(' ').map(function (q) { return q.split(',').map(Number); }); return [(pts[0][0] + pts[2][0]) / 2, (pts[0][1] + pts[2][1]) / 2, +p[1], +p[2]]; });
    var aP = -Math.PI * 0.62, dP = Math.sqrt(Math.pow(pl[2] - pl[0], 2) + Math.pow(pl[3] - pl[1], 2));
    assert.ok(Math.abs(dP - (kampf.formRand('gegner', 12, aP) + 1)) < 0.3, 'die Plakette sitzt am Rand der Raute: ' + dP);
    await pgW.click('#kampf button[data-k="leg"]');
    assert.ok(/grau: aus dem Kampf/.test(await pgW.innerText('#kampf .kkL')), 'die Legende erklärt grau');
    ok('1.8: Formen, Fortschritt, drei Blässen');

    // 1.8: Reihenfolge mit Formen, die Hilfezeile beim Halten eines Knopfs, der helle Saum der Spur
    var pgX = await seite(b, TOR);
    assert.strictEqual(await pgX.locator('#kampf .kkIt[data-w="2"] svg.kkItB polygon.kkItF').count(), 1, 'Ulf in der Reihenfolge als Raute');
    assert.strictEqual(await pgX.locator('#kampf .kkIt[data-w="1"] svg.kkItB circle.kkItF:not(.kkDuenn), #kampf .kkIt[data-w="7"] svg.kkItB circle.kkItF.kkDuenn').count(), 2, 'Rolf als Kreis, das Torfmädchen als dünner Kreis');
    assert.strictEqual(await pgX.evaluate(function () { return getComputedStyle(document.querySelector('#kampf .kkIt.kkJetzt .kkItR')).stroke; }), 'rgb(176, 141, 58)', 'der goldene Ring markiert, wer am Zug ist');
    assert.strictEqual(await pgX.locator('#kampf .kkIt[data-w="0"] svg.kkKb').count(), 1, 'die Plakette bleibt in der Reihenfolge');
    assert.strictEqual(await pgX.locator('#kampf g.kkO[data-w="5"] polygon.kkWa').count(), 1, 'Torfstecher 1: goldener Wundring als Raute');
    var sp = await pgX.locator('#kampf button[data-k="spurt"]').boundingBox();
    await pgX.mouse.move(sp.x + sp.width / 2, sp.y + sp.height / 2); await pgX.mouse.down(); await pgX.waitForTimeout(650);
    assert.ok(/^Spurt ist eine Aktion: deine Bewegung gibt es noch einmal dazu \(\+9 m\)/.test(await pgX.innerText('#kampf .kkI')), 'Halten zeigt die Hilfezeile: ' + await pgX.innerText('#kampf .kkI'));
    await pgX.mouse.up(); await pgX.waitForTimeout(50);
    assert.strictEqual(await pgX.locator('#kampf button[data-k="spurt"][aria-pressed="true"]').count(), 0, 'das Loslassen wählt Spurt nicht');
    assert.ok(/Spurt ist eine Aktion/.test(await pgX.innerText('#kampf .kkI')), 'die Zeile bleibt stehen');
    await pgX.click('#kampf button[data-k="spurt"]');
    assert.strictEqual(await pgX.locator('#kampf button[data-k="spurt"][aria-pressed="true"]').count(), 1, 'ein kurzer Tipp wählt wie bisher');
    var hb = await pgX.locator('#kampf button[data-k="bonus"][data-i="0"]').boundingBox();
    await pgX.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await pgX.mouse.down(); await pgX.waitForTimeout(650); await pgX.mouse.up();
    assert.ok(/^Bonusaktion: Healing Word heilt 2W4\+2 auf 18 m \(Ziel: jedes Wesen, auch du selbst\); tipp danach auf einen Stein\.$/.test(await pgX.innerText('#kampf .kkI')), 'ein Satz zur Bonusaktion: ' + await pgX.innerText('#kampf .kkI'));
    assert.strictEqual(await pgX.locator('#kampf button[data-k="bonus"][data-i="0"].kkWart').count(), 0, 'ohne sie zu wählen');
    var hw = await pgX.locator('#kampf button[data-k="waffe"][data-i="0"]').boundingBox();
    await pgX.mouse.move(hw.x + hw.width / 2, hw.y + hw.height / 2); await pgX.mouse.down(); await pgX.waitForTimeout(650); await pgX.mouse.up();
    assert.ok(/^Angriff: Langschwert, einhändig trifft mit \+4 auf 1,5 m, 1W8\+2 Hieb; tipp auf einen Stein, das ist dein Ziel; ein zweiter Tipp auf den Knopf wechselt zu „beidhändig“\.$/.test(await pgX.innerText('#kampf .kkI')), 'ein Satz zur Waffe: ' + await pgX.innerText('#kampf .kkI'));
    assert.strictEqual(await pgX.getAttribute('#kampf button[data-k="waffe"][data-i="0"] svg.kkMo', 'aria-label'), 'einhändig', 'der Modus blieb');
    await klickFeld(pgX, 19, 8);
    assert.strictEqual(await pgX.locator('#kampf .kkWeg path.kkWegH').count(), 1, 'der helle Saum unter der Spur');
    assert.strictEqual(await pgX.evaluate(function () { return getComputedStyle(document.querySelector('#kampf .kkWeg path.kkWegH')).stroke; }), 'rgb(239, 226, 195)', 'in Pergamentfarbe');
    ok('1.8: Reihenfolge mit Formen, Hilfezeile, Saum der Spur');

    // 1.9 im Widget: die Kampfbilanz über der Karte, kein Zug, die Knöpfe schicken in den Chat
    var pgB = await seite(b, BIL);
    assert.strictEqual(await pgB.locator('#kampf .kkBil').count(), 1, 'die Tafel steht');
    assert.deepStrictEqual(await pgB.evaluate(function () { return Array.prototype.map.call(document.querySelector('#kampf').children, function (c) { return c.className; }).slice(1, 6); }), ['kkKopf', 'kkKopf2', 'kkBil', 'kkRW', 'kkWz'], 'über der Karte, unter dem Kopf: ' );
    assert.strictEqual(await pgB.locator('#kampf .kkAk[hidden], #kampf .kkBo[hidden], #kampf .kkZk[hidden]').count(), 3, 'weder Aktion noch Bonusaktion noch Zug');
    assert.strictEqual(await pgB.locator('#kampf .kkBiZ').count(), 3, 'drei Gegner');
    assert.strictEqual(await pgB.locator('#kampf .kkBiZ polygon').count(), 3, 'als Rauten');
    await pgB.waitForTimeout(1200);
    assert.strictEqual(await pgB.innerText('#kampf .kkBiEp'), '75', 'die EP sind hochgezählt');
    assert.ok(/Der Weg ist frei/.test(await pgB.innerText('#kampf .kkBiK')) && /Probefigur 38 · Tamsin 37/.test(await pgB.innerText('#kampf .kkBiS2')));
    assert.strictEqual(await pgB.locator('#kampf .kkBiBar.kkBiGold').count(), 1, 'Tamsin unter der Hälfte: gold');
    await klickFeld(pgB, 20, 6);
    assert.strictEqual(await pgB.locator('#kampf .kkWeg path').count(), 0, 'ein Tipp auf ein Feld zieht nicht mehr');
    await klickWesen(pgB, 2);
    assert.ok(/Vorläufer \(V\) · Gegner/.test(await pgB.innerText('#kampf .kkI')), 'Steine geben noch Auskunft: ' + await pgB.innerText('#kampf .kkI'));
    await pgB.click('#kampf button[data-k="bilanz"][data-i="0"]');
    assert.deepStrictEqual(await gesendet(pgB), ['Probefigur durchsucht den Köter und den Vorläufer, eine Minute je Körper'], 'der Knopf schickt seinen Satz');
    assert.strictEqual(await pgB.locator('#kampf button[data-k="bilanz"][disabled]').count(), 2, 'danach sind beide verbraucht');
    ok('1.9: Kampfbilanz im Widget');

    assert.deepStrictEqual(pg.fehler.concat(pg2.fehler, pgH.fehler, pg3.fehler, pgA.fehler, pgA2.fehler, pgD.fehler, pgE.fehler, pgF.fehler, pgG.fehler, pgZ.fehler, pgZ2.fehler, pgT.fehler, pgO.fehler, pgO2.fehler, pgU.fehler, pgV.fehler, pgW.fehler, pgX.fehler, pgB.fehler), [], 'keine Fehler im Browser');
    ok('keine Fehler');
    console.log('\n' + n + ' Prüfungen bestanden.');
  } finally { await b.close(); }
})().catch(function (e) { console.error(e); process.exit(1); });
