// Prüft Bühnen und Profile (buehne.js): die Prüfung, den Ausschnitt, verdeckte Gruppen, die erste Karte, das Aufdecken, die Wortprüfung und den
// Weg von der Bühne über die erste Karte in den Browser. Erfundene Welt (test/buehne-beispiel.json, test/profil-beispiel.json).
// node test/buehne.test.js
'use strict';
var assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path'), kind = require('child_process');
var buehne = require('../buehne.js'), kampf = require('../kampf.js');
var B = JSON.parse(fs.readFileSync(path.join(__dirname, 'buehne-beispiel.json'), 'utf8'));
var P = JSON.parse(fs.readFileSync(path.join(__dirname, 'profil-beispiel.json'), 'utf8'));
var n = 0;
function ok(name) { n++; console.log('ok  ' + name); }
function kopie(o) { return JSON.parse(JSON.stringify(o)); }
function falsch(aendere) { var x = kopie(B); aendere(x); return buehne.pruefe(x); }
function meldet(r, muster) { assert.ok(!r.ok && r.fehler.some(function (f) { return muster.test(f); }), 'erwartet ' + muster + ', bekam: ' + r.fehler.join(' | ')); }

// Die Prüfung
var r0 = buehne.pruefe(B);
assert.ok(r0.ok, r0.fehler.join(' | '));
assert.deepStrictEqual(r0.groesse, { sp: 30, ze: 12 });
ok('die Beispielbühne ist sauber');
meldet(falsch(function (x) { x.boden[3] = x.boden[3].slice(0, 20); }), /Zeile D hat 20 statt 30 Zeichen/);
meldet(falsch(function (x) { x.boden[0] = 'Q' + x.boden[0].slice(1); }), /unbekanntes Zeichen „Q“ bei 1\/A/);
meldet(falsch(function (x) { x.hoehe[1] = x.hoehe[1].slice(0, 3); }), /Höhe, Zeile B hat 3/);
meldet(falsch(function (x) { x.hoehe.pop(); }), /`hoehe` hat 11 statt 12/);
meldet(falsch(function (x) { x.verdeckt[2] = x.verdeckt[2].replace('a', 'z'); }), /Gruppe „z“ .* steht nicht in `gruppen`/);
meldet(falsch(function (x) { x.merkmale[0].zeichen = 'x'; }), /Merkmal „Brunnen“: bei 13\/F steht „O“, nicht „x“/);
meldet(falsch(function (x) { x.merkmale[0].feld = '99/A'; }), /Merkmal „Brunnen“: Feld „99\/A“ liegt nicht auf der Bühne/);
meldet(falsch(function (x) { x.szene[0].feld = '14/F'; }), /Szene „Der Brunnen mitten im Hof“: bei 14\/F steht „e“, nicht „O“/);
meldet(falsch(function (x) { x.eingaenge[0].feld = '3/B'; }), /Eingang „Weg von Westen“ bei 3\/B ist nicht betretbar/);
meldet(falsch(function (x) { x.ausschnitte.gross = ['25/A', 10, 5]; }), /Ausschnitt „gross“ ragt über die Bühne hinaus/);
meldet(falsch(function (x) { x.ausschnitte.kaputt = ['Hof', 10, 5]; }), /Ausschnitt „kaputt“ ist unlesbar/);
meldet(falsch(function (x) { x.boden = x.boden.map(function () { return new Array(62).join('g'); }); x.hoehe = null; x.verdeckt = null; x.merkmale = []; x.szene = []; x.eingaenge = []; x.ausschnitte = {}; }), /höchstens 60 × 26/);
assert.ok(buehne.pruefe({ id: 'x', titel: 'X', boden: ['..', '..'] }).hinweise.some(function (h) { return /nichts bindet/.test(h); }), 'ohne Merkmale und Szene ein Hinweis');
ok('Zeilen, Zeichen, Höhe, Gruppen, Merkmale, Szenenzettel, Eingänge, Ausschnitte, Größe');

// Eingeschlossene Felder: der Wegetest, der bei den Häusern der Kacheln den ersten Lauf nicht bestand
meldet(falsch(function (x) { x.boden[10] = 'ggggg####gg:::ggggggggggggg,~~'; x.boden[11] = 'ggggg#..#ggggggggggggdgggggg,~'; x.verdeckt[11] = x.verdeckt[11].replace(/c/g, '.'); }), /eingeschlossen, kein Weg dorthin: 7\/L, 8\/L/);
assert.ok(buehne.pruefe(B).ok, 'eine Gruppe mit `abgeschlossen` darf ohne Weg sein');
var durchs = buehne.pruefe({ id: 'x', titel: 'X', boden: ['..~~..', '..~~..'] });
assert.ok(durchs.ok, 'über Wasser geht es');
var mauer = buehne.pruefe({ id: 'x', titel: 'X', boden: ['..#..', '..#..'] });
meldet(mauer, /eingeschlossen/);
var tuer = buehne.pruefe({ id: 'x', titel: 'X', boden: ['..#..', '..+..'] });
assert.ok(tuer.ok, 'durch eine Tür geht es');
ok('eingeschlossene Felder');

// Was die Figur sieht
var k1 = buehne.karte(B, { kampf: 'pf-s1-1', nr: 4, ausschnitt: 'hof', profil: P, feld: '5/G', tp: 22, wesen: [{ id: 'ta', feld: '4/G', tp: [11, 11] }, { id: 'sp', name: 'Späher', kurz: 'SP', art: 'gegner', feld: '24/G' }] }), d1 = k1.daten;
assert.ok(d1.boden.every(function (z) { return z.length === 30; }));
assert.strictEqual(d1.boden[2].slice(3, 8), '?????', 'das Wohnhaus liegt verdeckt');
assert.strictEqual(d1.boden[2].slice(20, 25), '?????', 'die Scheune auch');
assert.strictEqual(d1.boden[3][8], '+', 'die Tür bleibt zu sehen');
assert.strictEqual(d1.boden[11].slice(6, 8), '??', 'der Keller auch');
var text = JSON.stringify(d1);
assert.ok(!/Geheimfach/.test(text), 'kein Merkmal einer verdeckten Gruppe');
assert.ok(!/Fass mit Pech/.test(text), 'auch nicht, was in einer verdeckten Gruppe steht');
assert.ok(!/Köhler nicht verkauft/.test(text), 'der Text der Bühne kommt nie in die Karte');
assert.ok(!/szene|verdeckt|gruppen|merkmale|eingaenge/.test(text), 'keine Felder der Bühne in der Karte');
assert.deepStrictEqual(d1.notizen.map(function (x) { return x.text; }), ['Brunnen', 'Meiler', 'Haustür', 'Scheunentor'], 'nur Schilder, die man sieht');
assert.deepStrictEqual(d1.licht.map(function (l) { return l.feld; }), ['13/I'], 'nur Licht, das man sieht');
assert.ok(d1.hoehe, 'der Meiler liegt höher');
assert.strictEqual(d1.ursprung, undefined, 'die ganze Bühne braucht keinen Ursprung');
assert.deepStrictEqual(d1.wesen.map(function (w) { return w.id; }), ['pf', 'ta', 'sp'], 'Figur, Gefährtin aus dem Profil, Gegner; Brock ist nicht dabei');
assert.strictEqual(d1.wesen[0].art, 'figur', 'die Figur ist eine Figur, kein Profil');
assert.strictEqual(d1.ganz, true, 'die Karte aus der Bühne ist eine ganze Karte');
assert.strictEqual(d1.wesen[0].waffen.length, 2);
assert.deepStrictEqual(d1.wesen[0].tp, [22, 27]);
assert.strictEqual(d1.wesen[1].notiz, 'Kurzbogen', 'die Gefährtin aus dem Profil, ihr Feld aus `wesen`');
assert.strictEqual(d1.wesen[1].feld, '4/G');
assert.strictEqual(d1.wesen[0].gefolge, undefined, 'die Liste des Gefolges bleibt draußen');
assert.deepStrictEqual(kampf.kartenFehler(kampf.falten([kopie(d1)])), [], 'die Karte hat keinen Schreibfehler');
ok('die erste Karte zeigt nur, was die Figur sieht');

// Eine Gruppe, die getarnt ist: Der Spieler sieht nicht einmal, dass dort etwas ist
assert.ok(buehne.pruefe(B).hinweise.some(function (h) { return /Gruppe „c“ ist abgeschlossen und zeigt `\?`/.test(h); }), 'ohne Tarnung ein Hinweis');
var tarn = kopie(B); tarn.gruppen.c.aussehen = '#';
assert.ok(buehne.pruefe(tarn).ok && !buehne.pruefe(tarn).hinweise.some(function (h) { return /Gruppe „c“/.test(h); }), 'mit Tarnung kein Hinweis');
var dT = buehne.karte(tarn, { kampf: 'x', nr: 1, ausschnitt: 'hof' }).daten;
assert.strictEqual(dT.boden[11].slice(5, 9), '####', 'der Keller sieht aus wie Mauer');
assert.ok(dT.boden.join('').indexOf('.') < 0 || dT.boden[11].indexOf('.') < 0, 'nichts vom Keller');
var dT2 = buehne.karte(tarn, { kampf: 'x', nr: 1, ausschnitt: 'hof', offen: ['c'] }).daten;
assert.strictEqual(dT2.boden[11].slice(5, 9), '#..#', 'offen zeigt sie, was dort ist');
assert.deepStrictEqual(buehne.aufdecken(tarn, 'c', { ausschnitt: 'hof' }).eintrag, ['7/L', '..'], 'aufdecken schreibt das Echte');
meldet((function () { var x = kopie(B); x.gruppen.c.aussehen = 'Q'; return buehne.pruefe(x); })(), /`aussehen` muss ein Zeichen des Bodens sein/);
ok('getarnte Gruppe');

// Offene Gruppe, kleiner Ausschnitt
var k2 = buehne.karte(B, { kampf: 'pf-s1-1', nr: 4, ausschnitt: 'scheune', offen: ['b'], profil: P, feld: '21/D' }), d2 = k2.daten;
assert.deepStrictEqual([d2.spalten, d2.zeilen, d2.ursprung], [10, 7, [18, 'B']]);
assert.strictEqual(d2.boden[2], 'ee+..o..#g', 'Zeile D ab Spalte 18, die Scheune ist offen');
assert.deepStrictEqual(d2.notizen.map(function (x) { return x.text; }), ['Scheunentor', 'Fass mit Pech'], 'jetzt ist auch das Fass zu sehen');
assert.strictEqual(d2.hoehe, undefined, 'hier ist alles flach, also keine Höhe');
var d2k = kopie(d2), Kd2 = kampf.lies(d2k);
assert.deepStrictEqual([Kd2.figur.x, Kd2.figur.y], [4, 3], '21/D in einem Ausschnitt ab 18/B');
assert.strictEqual(kampf.feldName(d2k, 4, 3), '21/D');
assert.throws(function () { buehne.karte(B, { ausschnitt: 'gibtsnicht' }); }, /Ausschnitt/);
var frei = buehne.ausschnittVon(B, '5/C,4,3');
assert.deepStrictEqual([frei.x, frei.y, frei.b, frei.h], [5, 3, 4, 3], 'ein Ausschnitt ohne Namen');
ok('offene Gruppe und kleiner Ausschnitt');

// Aufdecken ergibt dasselbe wie die Karte mit offener Gruppe
var ae = buehne.aufdecken(B, 'b', { ausschnitt: 'hof' });
assert.strictEqual(ae.eintrag[0], '21/C');
assert.deepStrictEqual(ae.eintrag[1], ['.....', '..o..', '.....']);
assert.strictEqual(ae.eintrag[2], undefined, 'flach, also keine Höhe');
assert.deepStrictEqual(ae.schilder.map(function (x) { return x.text; }), ['Fass mit Pech']);
var erst = kopie(buehne.karte(B, { kampf: 'x', nr: 1, ausschnitt: 'hof', profil: P, feld: '5/G' }).daten);
var dann = kampf.falten([erst, { kampf: 'x', nr: 2, aendern: [ae.eintrag] }]);
var offen = buehne.karte(B, { kampf: 'x', nr: 1, ausschnitt: 'hof', offen: ['b'], profil: P, feld: '5/G' }).daten;
assert.deepStrictEqual(dann.boden, offen.boden, 'gleich');
assert.strictEqual(buehne.aufdecken(B, 'q', {}), null, 'eine Gruppe, die es nicht gibt');
assert.deepStrictEqual(ae.licht, [], 'in der Scheune brennt nichts');
assert.deepStrictEqual(buehne.aufdecken(B, 'a', { ausschnitt: 'hof' }).licht.map(function (l) { return l.feld; }), ['6/D'], 'im Wohnhaus die Herdstelle');
var hoch = kopie(B); hoch.verdeckt[8] = '...........ddd................'; hoch.gruppen.d = 'Meilerkuppe';
var aeH = buehne.aufdecken(hoch, 'd', {});
assert.deepStrictEqual(aeH.eintrag, ['12/I', 'ooo', '111'], 'mit Höhe, eine Zeile');
ok('aufdecken');

// Ein neuer Ausschnitt mitten im Kampf: die Wesen bleiben, Boden und Schilder wechseln
var start = kopie(buehne.karte(B, { kampf: 'x', nr: 1, ausschnitt: 'hof', profil: P, feld: '19/D', wesen: [{ id: 'sp', name: 'Späher', kurz: 'SP', art: 'gegner', feld: '24/G' }] }).daten);
var wk = buehne.karte(B, { weiter: true, kampf: 'x', nr: 2, ausschnitt: 'scheune', offen: ['b'] }).daten;
assert.strictEqual(wk.ganz, undefined, 'keine ganze Karte');
assert.strictEqual(wk.wesen, undefined, 'die Wesen liegen im Browser');
assert.strictEqual(wk.titel, undefined, 'der Titel auch');
assert.deepStrictEqual(wk.ursprung, [18, 'B']);
var wg = kampf.falten([start, kopie(wk)]);
assert.deepStrictEqual(wg.wesen.map(function (w) { return w.id; }), ['pf', 'sp'], 'beide sind noch da');
assert.strictEqual(wg.wesen[0].waffen.length, 2, 'die Figur hat ihre Waffen');
assert.strictEqual(wg.boden[2], 'ee+..o..#g', 'der neue Boden');
assert.strictEqual(wg.hoehe, undefined, 'die alte Höhe gehört zum alten Boden');
assert.deepStrictEqual(wg.notizen.map(function (x) { return x.text; }), ['Scheunentor', 'Fass mit Pech'], 'die Schilder des neuen Ausschnitts');
assert.deepStrictEqual(kampf.kartenFehler(wg), [], 'kein Schreibfehler');
assert.deepStrictEqual(buehne.karte(B, { weiter: true, kampf: 'x', nr: 3, ausschnitt: 'hof' }).daten.ursprung, [1, 'A'], 'der Ursprung steht immer da, auch ganz oben links');
ok('neuer Ausschnitt mitten im Kampf');

// Wortprüfung gegen Spielstand und Spoilerdatei
var q = { spielstand: 'Der Köhlerhof liegt am Bach. Im Hof steht ein Brunnen, daneben Haustür und Scheunentor. Der Meiler raucht.', spoiler: 'Im Hof wartet der Geheimbund der Pechbrüder auf den Köhler.' };
assert.deepStrictEqual(buehne.woerterPruefen(['Brunnen', 'Meiler', 'Haustür'], q).fehler, []);
assert.ok(/nur in der Spoilerdatei/.test(buehne.woerterPruefen(['Pechbrüder'], q).fehler[0]));
assert.deepStrictEqual(buehne.woerterPruefen(['Karren'], q).fehler, [], 'ein Wort, das nirgends steht, sperrt nicht');
assert.ok(/steht nicht im Spielstand/.test(buehne.woerterPruefen(['Karren'], q).hinweise[0]), 'aber es gibt einen Hinweis');
ok('Wörter: was nur in der Spoilerdatei steht, sperrt');

// Profil
assert.ok(buehne.profilPruefen(P).ok, buehne.profilPruefen(P).fehler.join(' | '));
var P2 = kopie(P); P2.waffen.push({ schaden: '1W4' });
assert.ok(/`waffen`: 3 angegeben, die Karte liest 2/.test(buehne.profilPruefen(P2).fehler[0]), 'eine Waffe ohne Namen liest die Karte nicht');
assert.ok(!buehne.profilPruefen({ name: 'X' }).ok);
var P3 = kopie(P); delete P3.waffen; delete P3.zauber;
assert.ok(/weder Waffen noch Zauber/.test(buehne.profilPruefen(P3).fehler.join(' ')));
ok('Profil');

// Knappe Schreibweise, die sich wieder lesen lässt
var knapp = buehne.kurz({ a: 1, 'b-c': "Jost's", d: [true, null], e: undefined, ä: 'x\ny' });
assert.strictEqual(knapp, "{a:1,\"b-c\":'Jost\\'s',d:[true,null],ä:'x\\ny'}");
assert.deepStrictEqual(new Function('return ' + knapp)(), { a: 1, 'b-c': "Jost's", d: [true, null], ä: 'x\ny' });
ok('knappe Schreibweise');

// Die Befehle
function befehl(args) {
  var r = kind.spawnSync(process.execPath, [path.join(__dirname, '..', 'buehne.js')].concat(args), { encoding: 'utf8' });
  return { rc: r.status, aus: r.stdout, err: r.stderr };
}
var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'buehne-'));
var bPfad = path.join(__dirname, 'buehne-beispiel.json'), pPfad = path.join(__dirname, 'profil-beispiel.json');
var a1 = befehl(['--pruefe', bPfad]);
assert.strictEqual(a1.rc, 0, a1.aus);
assert.ok(/^FREIGEGEBEN · Köhlerhof, Hof und Scheune · 30 × 12/.test(a1.aus), a1.aus);
var kaputt = kopie(B); kaputt.boden[0] = 'g'; var kPfad = path.join(dir, 'kaputt.json'); fs.writeFileSync(kPfad, JSON.stringify(kaputt));
var a2 = befehl(['--pruefe', kPfad]);
assert.strictEqual(a2.rc, 1);
assert.ok(/^GESPERRT/.test(a2.aus) && /Zeile A hat 1 statt 30/.test(a2.aus), a2.aus);
var a3 = befehl(['--zeige', bPfad, '--ausschnitt', 'scheune']);
assert.strictEqual(a3.rc, 0);
assert.ok(/1234567890|8901234567/.test(a3.aus) && /D   ee\+\.\.o\.\.#g/.test(a3.aus) && /20\/D: Scheunentor/.test(a3.aus), a3.aus);
var wPfad = path.join(dir, 'wesen.json'); fs.writeFileSync(wPfad, JSON.stringify([{ id: 'sp', name: 'Späher', art: 'gegner', feld: '24/G' }]));
var a4 = befehl(['--karte', bPfad, '--kampf', 'pf-s1-1', '--nr', '4', '--runde', '1', '--stand', 'Abend', '--ausschnitt', 'hof', '--profil', pPfad, '--feld', '5/G', '--tp', '22', '--wesen', wPfad]);
assert.strictEqual(a4.rc, 0, a4.aus);
var zeilen = a4.aus.trim().split('\n'), letzte = zeilen[zeilen.length - 1];
assert.ok(/^var KAMPF=\{kampf:'pf-s1-1',nr:4,ganz:true,titel:'Köhlerhof, Hof und Scheune',runde:1,stand:'Abend'/.test(letzte), letzte.slice(0, 120));
var gelesen = new Function(letzte + ';return KAMPF;')();
assert.strictEqual(gelesen.wesen[0].name, 'Probefigur');
assert.deepStrictEqual(kampf.kartenFehler(kampf.falten([gelesen])), [], 'was herauskommt, lässt sich so zeichnen');
var a5 = befehl(['--karte', bPfad]);
assert.strictEqual(a5.rc, 1);
assert.ok(/--kampf fehlt/.test(a5.aus) && /--nr fehlt/.test(a5.aus), a5.aus);
var stand = path.join(dir, 'stand.md'), spoiler = path.join(dir, 'spoiler.md');
fs.writeFileSync(stand, 'Köhlerhof, Hof, Scheune, Brunnen, Meiler, Haustür, Scheunentor.');
fs.writeFileSync(spoiler, 'Der Geheimbund der Pechbrüder trifft sich am Köhlerhof.');
var a6 = befehl(['--karte', bPfad, '--kampf', 'x', '--nr', '1', '--spielstand', stand, '--spoiler', spoiler]);
assert.strictEqual(a6.rc, 0, a6.aus);
var sp2 = kopie(B); sp2.merkmale[0].name = 'Pechbrüder'; var sPfad = path.join(dir, 'spoilerbuehne.json'); fs.writeFileSync(sPfad, JSON.stringify(sp2));
var a7 = befehl(['--karte', sPfad, '--kampf', 'x', '--nr', '1', '--spielstand', stand, '--spoiler', spoiler]);
assert.strictEqual(a7.rc, 1, a7.aus);
assert.ok(/GESPERRT/.test(a7.aus) && /nur in der Spoilerdatei/.test(a7.aus) && !/var KAMPF/.test(a7.aus), 'gesperrt, und es kommt keine Karte heraus: ' + a7.aus);
var a7g = befehl(['--karte', sPfad, '--kampf', 'x', '--nr', '1', '--spielstand', stand, '--spoiler', spoiler, '--gesehen', 'Pechbrüder,Altar']);
assert.strictEqual(a7g.rc, 0, 'was die Figur gerade sieht, nennt die Spielleitung: ' + a7g.aus);
var a7t = befehl(['--karte', bPfad, '--kampf', 'x', '--nr', '1', '--titel', 'Hof bei den Pechbrüdern', '--spielstand', stand, '--spoiler', spoiler]);
assert.strictEqual(a7t.rc, 1, 'auch der Titel wird geprüft: ' + a7t.aus);
var a7u = befehl(['--karte', bPfad, '--kampf', 'x', '--nr', '1', '--titel', 'Scheune und Hof', '--spielstand', stand, '--spoiler', spoiler]);
assert.strictEqual(a7u.rc, 0, a7u.aus);
assert.ok(/titel:'Scheune und Hof'/.test(a7u.aus), a7u.aus);
var a8 = befehl(['--pruefe', sPfad, '--spielstand', stand, '--spoiler', spoiler]);
assert.strictEqual(a8.rc, 1, a8.aus);
var a9 = befehl(['--aufdecken', bPfad, 'b', '--ausschnitt', 'hof']);
assert.strictEqual(a9.rc, 0);
assert.ok(/^aendern:\[\['21\/C',\['\.\.\.\.\.','\.\.o\.\.','\.\.\.\.\.'\]\]\]/.test(a9.aus), a9.aus);
assert.ok(/notizen:\[.*Fass mit Pech/.test(a9.aus), a9.aus);
assert.strictEqual(befehl(['--aufdecken', bPfad, 'q']).rc, 1);
var a11 = befehl(['--karte', bPfad, '--kampf', 'pf-s1-1', '--nr', '5', '--weiter', '--ausschnitt', 'scheune', '--offen', 'b']);
assert.strictEqual(a11.rc, 0, a11.aus);
assert.ok(/var KAMPF=\{kampf:'pf-s1-1',nr:5,spalten:10,zeilen:7,ursprung:\[18,'B'\],boden:/.test(a11.aus), a11.aus);
assert.ok(!/wesen|ganz/.test(a11.aus), a11.aus);
var a12 = befehl(['--karte', bPfad, '--kampf', 'pf-s1-1', '--nr', '5', '--weiter', '--ausschnitt', 'scheune', '--profil', pPfad]);
assert.strictEqual(a12.rc, 1, a12.aus);
var a13 = befehl(['--aufdecken', bPfad, 'a', '--ausschnitt', 'hof']);
assert.ok(/licht:\[\{feld:'6\/D'/.test(a13.aus), a13.aus);
var a10 = befehl(['--profil', pPfad]);
assert.strictEqual(a10.rc, 0);
assert.ok(/2 Waffen, 2 Zauber, 2 Bonusaktionen, 2 Aktionen/.test(a10.aus), a10.aus);
assert.strictEqual(befehl([]).rc, 2);
fs.rmSync(dir, { recursive: true, force: true });
ok('die Befehle');

// Bühnen mit Gelände (seit 1.11): das Set zeichnet die Karte, die Zeichnung verrät so wenig wie der Boden
var GB = {
  art: 'buehne', id: 'fischer', ort: 'ufer', titel: 'Fischerhütte', gelaende: 'kueste', text: 'Unter dem Herd liegt das Netz, das niemand vermisst.',
  boden: ['..........', '.LLLLL..~~', '.LlrlL..~~', '.LllhL.ee~', '.LL+LL.i~~', '........~~'],
  verdeckt: ['..........', '..........', '..aaa.....', '..aaa.....', '..........', '..........'],
  gruppen: { a: 'Hütte, drinnen' },
  merkmale: [{ name: 'Steg', feld: '8/D', zeichen: 'e', schild: true }, { name: 'Herd', feld: '4/C', zeichen: 'r', schild: true, gruppe: 'a' }],
  eingaenge: [{ name: 'vom Weg', feld: '1/F' }],
  szene: [{ text: 'Der Steg', feld: '8/D', zeichen: 'e' }],
  ausschnitte: { westen: ['1/A', 7, 6] },
  zeichnung: { kochtopf: ['4/C'], drehung: { '8/D': 90 }, stroemung: [['9/B', 180]], gosse: [['3/C', '5/D']], planen: [['1/A', '3/A']] }
};
var r1 = buehne.pruefe(GB);
assert.ok(r1.ok, r1.fehler.join(' | '));
function falschG(aendere) { var x = kopie(GB); aendere(x); return buehne.pruefe(x); }
meldet(falschG(function (x) { x.gelaende = 'mond'; }), /das Gelände „mond“ gibt es nicht; es gibt arktis/);
meldet(falschG(function (x) { x.boden[0] = 'g' + x.boden[0].slice(1); }), /„g“ zeichnet das Set „kueste“ nicht: 1\/A/);
meldet(falschG(function (x) { x.boden[5] = ',,,,,,,,~~'; }), /„,“ zeichnet das Set „kueste“ nicht: 1\/F, 2\/F, 3\/F, 4\/F und 4 mehr/);
meldet(falschG(function (x) { x.boden[0] = 'm' + x.boden[0].slice(1); }), /„m“ zeichnet das Set „kueste“ nicht/);
assert.ok(falschG(function (x) { x.gelaende = 'sumpf'; x.boden[0] = 'm' + x.boden[0].slice(1); }).ok, 'Morast gibt es im Sumpf');
assert.ok(buehne.pruefe(Object.assign(kopie(GB), { gelaende: undefined, boden: GB.boden.map(function (z) { return z.replace(/^\./, 'g'); }) })).fehler.every(function (f) { return !/zeichnet das Set/.test(f); }), 'ohne Gelände zählt das Set nicht');
meldet(falschG(function (x) { x.zeichnung.kochtopf = ['5/C']; }), /`zeichnung.kochtopf`: bei 5\/C steht „l“, nicht „r“/);
meldet(falschG(function (x) { x.zeichnung.kochtopf = ['99/C']; }), /`zeichnung.kochtopf`: Feld „99\/C“ liegt nicht auf der Bühne/);
meldet(falschG(function (x) { x.zeichnung.drehung = { '99/C': 90 }; }), /`zeichnung.drehung`: Feld „99\/C“/);
meldet(falschG(function (x) { x.zeichnung.gosse = [['1/A', '99/A']]; }), /`zeichnung.gosse`: Feld „99\/A“/);
ok('das Gelände: nur, was das Set zeichnet; `zeichnung` nur auf der Bühne und auf dem passenden Zeichen');

var dg = buehne.karte(GB, { kampf: 'x', nr: 1, profil: P, feld: '1/F' }).daten;
assert.strictEqual(dg.gelaende, 'kueste', 'das Gelände kommt in die Karte');
assert.strictEqual(dg.boden[2].slice(2, 5), '???', 'die Hütte liegt verdeckt');
assert.ok(!dg.zeichnung.kochtopf, 'der Kochtopf steht in der verdeckten Hütte und bleibt draußen');
assert.ok(!dg.zeichnung.gosse, 'eine Gosse in der verdeckten Hütte auch');
assert.deepStrictEqual(dg.zeichnung.drehung, { '8/D': 90 }, 'die Drehung am Steg ist zu sehen');
assert.deepStrictEqual(dg.zeichnung.stroemung, [['9/B', 180]]);
assert.deepStrictEqual(dg.zeichnung.planen, [['1/A', '3/A']]);
assert.ok(!/Netz|vermisst/.test(JSON.stringify(dg)), 'der Text der Bühne kommt nie in die Karte');
assert.ok(!kampf.kartenFehler(dg).length, 'die Karte hat keine Fehler: ' + kampf.kartenFehler(dg).join(' | '));
var dw = buehne.karte(GB, { kampf: 'x', nr: 1, ausschnitt: 'westen', profil: P, feld: '1/F' }).daten;
assert.ok(!dw.zeichnung.drehung && !dw.zeichnung.stroemung, 'was außerhalb des Ausschnitts liegt, kommt nicht mit');
var dv = buehne.karte(GB, { kampf: 'x', nr: 3, weiter: true, offen: ['a'] }).daten;
assert.ok(!dv.gelaende, 'eine spätere Karte kennt ihr Gelände aus dem Browser');
assert.deepStrictEqual(dv.zeichnung.kochtopf, ['4/C'], 'der Kochtopf kommt, wenn die Hütte offen ist');
assert.deepStrictEqual(dv.zeichnung.gosse, [['3/C', '5/D']], 'die Gosse auch');
var auf = buehne.aufdecken(GB, 'a', {});
assert.deepStrictEqual(auf.zeichnung.kochtopf, ['4/C'], 'aufdecken nennt die Zeichnung, wie sie dann gilt');
assert.deepStrictEqual(auf.eintrag[0], '3/C');
assert.deepStrictEqual(auf.schilder, [{ feld: '4/C', text: 'Herd' }]);
var ohneGelaende = kopie(GB); delete ohneGelaende.gelaende;
var dn = buehne.karte(ohneGelaende, { kampf: 'x', nr: 1 }).daten;
assert.ok(!('gelaende' in dn) && !('zeichnung' in dn), 'ohne Gelände keine Zeichnung: die alte Karte kann nichts damit anfangen');
var dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'buehne-set-'));
var gPfad = path.join(dir2, 'set.json');
fs.writeFileSync(gPfad, JSON.stringify(GB));
function befehl2(args) { var r = kind.spawnSync('node', [path.join(__dirname, '..', 'buehne.js')].concat(args), { encoding: 'utf8' }); return { rc: r.status, aus: (r.stdout || '') + (r.stderr || '') }; }
var c1 = befehl2(['--karte', gPfad, '--kampf', 'x', '--nr', '1']);
assert.strictEqual(c1.rc, 0, c1.aus);
assert.ok(/gelaende:'kueste'/.test(c1.aus) && /zeichnung:\{/.test(c1.aus) && !/kochtopf/.test(c1.aus), c1.aus);
var c2 = befehl2(['--aufdecken', gPfad, 'a']);
assert.strictEqual(c2.rc, 0, c2.aus);
assert.ok(/^zeichnung:\{.*kochtopf:\['4\/C'\]/m.test(c2.aus.replace(/"kochtopf"/, 'kochtopf').replace(/\["4\/C"\]/, "['4/C']")), c2.aus);
var c3 = befehl2(['--zeige', gPfad]);
assert.ok(/Gelände: kueste/.test(c3.aus), c3.aus);
fs.rmSync(dir2, { recursive: true, force: true });
ok('die erste Karte, die spätere und das Aufdecken auf einem Set');

console.log('\n' + n + ' Prüfungen bestanden.');
