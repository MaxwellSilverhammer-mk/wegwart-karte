#!/usr/bin/env node
// Spoilerprüfung für Kartendaten, Inventar, Questlog, Glossar und Wissensbuch:
//   node pruefen.js <daten.md|.json|.js> <02_spielstand.md> <03_spielleitung_SPOILER.md> [weitere Dateien …]
// Erkennt die Art an den Daten: Karte (orte, wege), Inventar (traeger), Questlog (auftraege), Glossar (Textform
// mit Rubriken „### Personen“ … oder ein Objekt mit eintraege), Wissensbuch (Abschnitt „## Wer weiß was“, meist
// in der Spoilerdatei selbst: node pruefen.js 03_spielleitung_SPOILER.md 02_spielstand.md 03_spielleitung_SPOILER.md 02_glossar.md).
// Weitere Markdown-Dateien ohne Daten (etwa 02_geschichte.md) sind Teile des Spielstands und zählen wie er.
// Weitere Dateien nach den drei Pflichtdateien dienen sonst den Querverweisen: Kartendaten, Gepäck, Logbuch und Glossar
// der Figur und eine Figurenliste der Weltchronik (json: ["Name", …] oder {"figuren":[…]}). Das Glossar
// (02_glossar.md) ist der Glossar-Abschnitt des Spielstands in eigener Datei und zählt für Karte, Gepäck und
// Logbuch als Spielstand mit. Fehlen weitere Dateien, bleiben die Querverweise ungeprüft, und die Prüfung sagt das.
// Rückgabe 0 mit FREIGEGEBEN, wenn das Widget nur zeigt, was im Spielstand steht; sonst 1 mit der Liste der Fehler.
// Mit --ohne-kern (irgendwo im Aufruf) folgt ein Hinweis, was allein am Kern hängt: die Sätze, die ohne 02_spielstand.md
// keinen Beleg mehr hätten, und die Zahl der Namen, Wörter und Zahlen, die nur dort stehen (Regelwerk 21.1). Am Ergebnis
// ändert der Schalter nichts.
'use strict';
var fs = require('fs'), path = require('path');

var ohneKern = false, args = process.argv.slice(2).filter(function (x) { if (x === '--ohne-kern') { ohneKern = true; return false; } return true; });
if (args.length < 3) {
  console.error('Aufruf: node pruefen.js <daten.md|.json|.js> <spielstand.md> <spoiler.md> [02_karte.md 02_inventar.md 02_questlog.md 02_glossar.md figuren.json] [--ohne-kern]');
  process.exit(2);
}
var glossarModul = require(path.join(__dirname, 'glossar.js')), wissensbuch = require(path.join(__dirname, 'wissensbuch.js'));
function istGlossarText(text) { return /^###\s+(Personen|Gruppen|Orte|Dinge|Gerüchte)\s*$/m.test(text) && /^-\s+\*\*/m.test(text); }
function istWissensbuch(text) { return /^##\s+Wer wei(ß|ss) was/mi.test(text); }
function lade(datei, weitere) {
  var text = fs.readFileSync(datei, 'utf8');
  if (/\.json$/i.test(datei)) return { D: JSON.parse(text) };
  if (/\.js$/i.test(datei)) return { D: require(path.resolve(datei)) };
  // Das Wissensbuch steht in der Spoilerdatei; die erkennt es zuerst, auch wenn sie anderswo einen json-Block hat
  if (!weitere && istWissensbuch(text)) { var wb = wissensbuch.ausText(text); wb.wissensbuch = true; return { D: wb, text: text }; }
  // Markdown mit einem Block ```json … ```, einer Zeile var KARTE={…} (ebenso INVENTAR, QUESTLOG, GLOSSAR) oder, beim Glossar, Text
  var m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(?:KARTE|INVENTAR|QUESTLOG|GLOSSAR)\s*=\s*(\{[\s\S]*\})\s*;?\s*(<\/script>|$)/);
  if (m) return { D: JSON.parse(m[1]) };
  if (istWissensbuch(text)) { var b = wissensbuch.ausText(text); b.wissensbuch = true; return { D: b, text: text }; }
  if (istGlossarText(text)) { var g = glossarModul.ausText(text); return { D: g.D, probleme: g.probleme, text: text }; }
  // Eine weitere Markdown-Datei ohne Daten ist ein Teil des Spielstands (etwa 02_geschichte.md, „Was bisher geschah“ im Spielerbuch)
  if (weitere && /\.md$/i.test(datei)) return { D: null, text: text, spielstandTeil: true };
  throw new Error('In ' + datei + ' steht kein json-Block, kein KARTE={…}, INVENTAR={…}, QUESTLOG={…} oder GLOSSAR={…}, kein Glossar-Text und kein Wissensbuch.');
}
function art(D) {
  if (!D || typeof D !== 'object') return '';
  if (D.wissensbuch) return 'wissensbuch';
  if (Array.isArray(D) || D.figuren) return 'figuren';
  if (D.orte || D.wege) return 'karte';
  if (D.traeger) return 'inventar';
  if (D.auftraege) return 'questlog';
  if (D.eintraege) return 'glossar';
  return '';
}
// Die Quellen einer Prüfung. kern ist der Text des Spielstands (02_spielstand.md). Mit --ohne-kern läuft die Prüfung ein
// zweites Mal mit leerem Kern: Was dann gesperrt wäre, hängt allein an ihm (Regelwerk 21.1, „Schreiben vor Kürzen“).
function quellenMit(geladen, was, kern, still) {
  var q = { spielstand: kern, spoiler: fs.readFileSync(args[2], 'utf8') }, teile = 0;
  if (geladen.probleme) q.probleme = geladen.probleme;
  if (was === 'glossar') {
    // Das Glossar ist selbst Spielstand: Wörter und Zahlen zählen mit ihm, Namen und Quellen müssen im übrigen Spielstand stehen
    q.namenKorpus = q.spielstand;
    q.spielstand += '\n\n' + (geladen.text || glossarModul.alsText(geladen.D));
  }
  args.slice(3).forEach(function (datei) {
    var X = lade(datei, true), a = art(X.D);
    if (X.spielstandTeil) {
      // Weitere Teile des Spielstands zählen wie der Spielstand selbst, für Wörter, Belege, Namen und Quellen
      q.spielstand += '\n\n' + X.text;
      if (q.namenKorpus != null) q.namenKorpus += '\n\n' + X.text;
      teile++;
      if (!still) console.error('Weitere Datei ' + datei + ' als Teil des Spielstands gelesen.');
      return;
    }
    if (!a || a === was) { if (a !== 'wissensbuch' && !still) console.error('Weitere Datei ' + datei + ' nicht erkannt oder von derselben Art wie die geprüften Daten; übergangen.'); return; }
    q[a] = X.D;
    // Das Glossar ist Spielstand: Was dort steht, belegt Karte, Gepäck und Logbuch wie der Spielstand selbst
    if (a === 'glossar') {
      // Dazu jeder Eintrag noch einmal als eine Zeile (Kurzzeile und alle Posten), damit die Belegprüfung der anderen Tische
      // einen Satz weiter an einem ganzen Eintrag messen kann, wie am alten Glossar-Absatz des Spielstands
      var ganz = (X.D.eintraege || []).map(function (e) { return [e.kurz || ''].concat((e.wissen || []).map(function (w) { return w && w.text || ''; })).join(' '); });
      q.spielstand += '\n\n' + (X.text || glossarModul.alsText(X.D)) + '\n\n' + ganz.join('\n');
      q.glossarNamen = [];
      (X.D.eintraege || []).forEach(function (e) { if (e && e.name) q.glossarNamen.push(e.name); (e && e.namen || []).forEach(function (n) { q.glossarNamen.push(n); }); });
      teile++;
    }
  });
  return { quellen: q, teile: teile };
}
function pruefeMit(D, was, quellen) {
  var r, kopf;
  if (was === 'wissensbuch') {
    r = wissensbuch.pruefe(D, quellen);
    kopf = 'Wissensbuch: ' + r.zaehl.figur + ' Figuren, ' + r.zaehl.zeile + ' Zeilen · Wissensbuch ' + wissensbuch.version;
  } else if (was === 'karte') {
    var karte = require(path.join(__dirname, 'karte.js'));
    r = karte.pruefen(D, quellen);
    kopf = r.orte + ' Orte, ' + r.wege + ' Wege · Kartentisch ' + karte.version;
  } else if (was === 'inventar' || was === 'questlog' || was === 'glossar') {
    var modul = was === 'glossar' ? glossarModul : require(path.join(__dirname, was + '.js')), wissen = require(path.join(__dirname, 'wissen.js'));
    r = wissen.pruefe(D, modul.SCHEMA, quellen, modul.zusatz);
    var z = r.zaehl;
    kopf = was === 'inventar'
      ? 'Inventar: ' + (z.traeger || 0) + ' Träger, ' + (z.ding || 0) + ' Dinge · Gepäck ' + modul.version
      : was === 'questlog'
        ? 'Questlog: ' + (z.auftrag || 0) + ' Aufträge, ' + (z.etappe || 0) + ' Etappen, ' + (z.termin || 0) + ' Termine, ' + (z.wort || 0) + ' Mal Wort · Logbuch ' + modul.version
        : 'Glossar: ' + (z.eintrag || 0) + ' Einträge, ' + (z.wissen || 0) + ' Posten' + (D.auszug ? ' (Auszug)' : '') + ' · Glossar ' + modul.version;
  } else {
    console.error('Unbekannte Daten: weder Karte (orte, wege) noch Inventar (traeger) noch Questlog (auftraege) noch Glossar (Text oder eintraege) noch Wissensbuch (## Wer weiß was).');
    process.exit(2);
  }
  return { r: r, kopf: kopf };
}
var geladen = lade(args[0]), was = art(geladen.D), kern = fs.readFileSync(args[1], 'utf8');
var erg = pruefeMit(geladen.D, was, quellenMit(geladen, was, kern, false).quellen), r = erg.r;
console.log((r.ok ? 'FREIGEGEBEN' : 'GESPERRT') + ' · ' + erg.kopf);
r.fehler.forEach(function (f) { console.log('  ✗ ' + f); });
r.hinweise.forEach(function (h) { console.log('  · ' + h); });
if (ohneKern) {
  var g2 = lade(args[0]), q2 = quellenMit(g2, was, '', true);
  if (!q2.teile) console.log('  · Ohne den Kern: Kein Teil des Spielstands ist mitgegeben (02_geschichte.md, 02_glossar.md); dann trägt der Kern alles.');
  else {
    // Zeile und Anteil der besten Stelle wechseln mit den Quellen; verglichen wird die Meldung davor
    var kurz = function (f) { return f.split(' Die beste Stelle im Spielstand')[0]; }, da = {};
    r.fehler.forEach(function (f) { da[kurz(f)] = true; });
    var nur = pruefeMit(g2.D, was, q2.quellen).r.fehler.filter(function (f) { return !da[kurz(f)]; });
    var saetze = nur.filter(function (f) { return f.indexOf(': nicht belegt: ') >= 0; }), rest = nur.length - saetze.length;
    console.log(!nur.length ? '  · Ohne den Kern: Nichts hängt allein an ihm; Geschichte und Glossar tragen alle Angaben.'
      : '  · Ohne den Kern (Regelwerk 21.1): ' + (saetze.length ? saetze.length + (saetze.length === 1 ? ' Satz hat seinen' : ' Sätze haben ihren') + ' Beleg nur dort' : 'Jeder Satz hat einen Beleg außerhalb') +
        (rest ? '; dazu ' + rest + (rest === 1 ? ' Angabe' : ' Angaben') + ' (Namen, Wörter, Zahlen), die nur dort ' + (rest === 1 ? 'steht' : 'stehen') : '') + '.');
    saetze.forEach(function (f) { console.log('      ◦ ' + kurz(f).replace(': nicht belegt: ', ': ').replace(/\.$/, '')); });
  }
}
process.exit(r.ok ? 0 : 1);
