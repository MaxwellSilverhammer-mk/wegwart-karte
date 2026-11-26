'use strict';
// Antwortprüfung: prüft eine fertige Antwort der Spielleitung, bevor sie abgeschickt wird. Das Szenenblatt (szene.js) wirkt
// vorbeugend, die Antwortprüfung deckt auf. Sie liest dieselben Quellen und prüft die Form nach Regelwerk 3 und die Stellen,
// die sich aus den Daten entscheiden lassen: Tarnname, Termine, Tote, Abwesende, Geschlecht, Anrede, 🎭 und Namen oder Wörter,
// die nur die Spoilerdatei kennt. Was nur Verstehen entscheidet (die neueste Notiz, ein Preis, wer was weiß), sieht sie nicht;
// dafür bleibt die Prüfliste des Szenenblatts.
// Aufruf: node antwort.js [--buch <arbeit>] [--ablage <ablage>] [--notizen <datei>]… [--ohne-sl] [--json] <antwort.md | ->
// Rückgabe: 0 ohne Fehler, 1 mit Fehlern, 2 bei falschem Aufruf. Hinweise allein ergeben 0.
var fs = require('fs'), path = require('path');
var S = require(path.join(__dirname, 'szene.js'));
var wissen = require(path.join(__dirname, 'wissen.js'));
var VERSION = '1.1';
var AUFRUF = 'Aufruf: node antwort.js [--buch <arbeit>] [--ablage <ablage>] [--notizen <datei>]… [--ohne-sl] [--json] <antwort.md | ->';

var L = '\\p{L}';
var UHR = new RegExp('(?<![' + L + '\\d])(\\d{1,2}(?:[:.]\\d{2})?|ein|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf)\\s+Uhr(?![' + L + '])', 'giu');
var REL = new RegExp('(?<![' + L + '])(heute|übermorgen|morgen|in (\\d+|zwei|drei|vier|fünf|sechs|sieben) Tagen)(?![' + L + '])', 'giu');
var ZAHL = { zwei: 2, drei: 3, vier: 4, 'fünf': 5, sechs: 6, sieben: 7 };
var TOD = /(?<![\p{L}])(tot|tote[nmrs]?|Tod|Todes|gestorben|starb|Leiche|Grab|Grabe?s?|ertrunken|ertrank|ermordet|erschlagen|begraben|selig)(?![\p{L}])/iu;

var PROBE = /^\((Akrobatik|Arkane Kunde|Athletik|Auftreten|Einschüchtern|Fingerfertigkeit|Geschichte|Heilkunde|Heimlichkeit|Mit Tieren umgehen|Motiv erkennen|Nachforschungen|Naturkunde|Religion|Täuschen|Überlebenskunst|Überzeugen|Wahrnehmung|Stärke|Geschicklichkeit|Konstitution|Intelligenz|Weisheit|Charisma|Probe|[\wäöüß]*[Ww]erkzeug)\b/;

// Schlüsselwörter (Regelwerk 5): was die zweite Zeile als ergänzt meldet, steht in der Erzählung fett; ein Name, den die
// Erzählung einführt („namens …“), ist ein Schlüsselwort; höchstens zwei, drei neue je Antwort
function schluesselwoerter(K, erz, tischText, melde) {
  var fett = [], m, r = /\*\*([^*]+?)\*\*/g;
  while ((m = r.exec(erz))) fett.push(m[1].trim());
  function istFett(n) { return fett.some(function (f) { return f === n || f.indexOf(n) >= 0 || n.indexOf(f) >= 0; }); }
  function imGlossar(n) { return K.G.some(function (e) { return e.re.test(n); }); }
  var g = /Glossar:\s*([^·\n]+?)\s+ergänzt/.exec(tischText);
  if (g) g[1].split(/\s*(?:,|\bund\b)\s*/).map(function (n) { return n.replace(/\*\*/g, '').trim(); }).filter(Boolean).forEach(function (n) {
    if (!istFett(n)) melde('Fehler', 'schluesselwort', 'Die zweite Zeile meldet „' + n + '“ als ergänzt; in der Erzählung steht es nicht fett', n);
  });
  var neu = fett.filter(function (f) { return !imGlossar(f); });
  if (neu.length > 3) melde('Hinweis', 'schluesselwort', 'Höchstens zwei, drei neue Schlüsselwörter je Antwort, hier ' + neu.length, neu.join(', '));
  var einf = /(?:namens|heißt|nennt sich|genannt)\s+((?:[A-ZÄÖÜ][\p{L}-]+)(?:\s+[A-ZÄÖÜ][\p{L}-]+)?)/gu;
  while ((m = einf.exec(erz.replace(/\*\*[^*]+\*\*/g, '§')))) if (!imGlossar(m[1])) melde('Hinweis', 'schluesselwort', 'Ein neuer Name ohne Fettdruck: Ist „' + m[1] + '“ ein Schlüsselwort?', m[0]);
}

function satzteile(text) { return String(text).split(/(?<=[.!?…])\s+|\n+/).map(function (s) { return s.trim(); }).filter(Boolean); }
function absaetze(text) { return String(text).split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean); }
// Rede: alles in „…“ und in geraden Anführungszeichen
function reden(text) { var r = [], m, re = /„([^“]*)“|"([^"\n]*)"/g; while ((m = re.exec(text))) r.push(m[1] !== undefined ? m[1] : m[2]); return r; }
function ohneRede(text) { return String(text).replace(/„[^“]*“|"[^"\n]*"/g, ' … '); }
function alle(re) { return new RegExp(re.source, re.flags.indexOf('g') >= 0 ? re.flags : re.flags + 'g'); }
function kontext(text, i, n) { return text.slice(Math.max(0, i - 30), Math.min(text.length, i + (n || 40))).replace(/\s+/g, ' '); }

function pruefe(K, text) {
  var B = [];
  function melde(stufe, regel, meldung, zitat) { B.push({ stufe: stufe, regel: regel, meldung: meldung, zitat: String(zitat || '').trim().slice(0, 140) }); }
  text = String(text).replace(/\r/g, '');
  var Z = text.split('\n'), m, i;
  var iLinie = Z.findIndex(function (z) { return z.trim() === '---'; });
  var iEnde = iLinie >= 0 ? iLinie : Z.findIndex(function (z) { return /📅|^\d+\.\s|^Oder schreib frei/.test(z); });
  var erz = Z.slice(0, iEnde >= 0 ? iEnde : Z.length).join('\n');
  var personen = K.G.filter(function (e) { return e.art === 'person'; });
  function nenntAndere(s, e) { return personen.some(function (x) { return x !== e && x.re.test(s); }); }

  /* ---------- Form (Regelwerk 3) ---------- */
  // Endet die Antwort mit einem Tisch (Würfelkasten 6.2, Rastübersicht 4.3, Händlertisch 4.9), folgen Statuszeile und
  // Optionen erst danach. Die Kampfkarte steht dagegen nach den Optionen (12.1), mit einem Satz darunter.
  var tisch = iLinie >= 0 && /<script\b/i.test(Z.slice(iLinie).join('\n')) && !/<div id="karte"/.test(text);
  var ohneHtml = Z.filter(function (z) { return !/^\s*</.test(z); }).join('\n');
  while ((m = UHR.exec(ohneHtml))) melde('Fehler', 'uhrzeit', 'Nie Uhrzeiten', m[0]);
  ['div', 'script', 'h2', 'details', 'summary', 'table'].forEach(function (t) {
    var auf = (text.match(new RegExp('<' + t + '\\b', 'gi')) || []).length, zu = (text.match(new RegExp('</' + t + '>', 'gi')) || []).length;
    if (auf !== zu) melde('Fehler', 'html-tag', '<' + t + '> ' + auf + '-mal geöffnet, ' + zu + '-mal geschlossen', t);
  });
  if (/<div id="wk"/.test(text) || /var WK\s*=/.test(text)) {
    [[/<h2 class="sr-only">Würfelkasten:/, 'die Überschrift <h2 class="sr-only">Würfelkasten: …</h2>'], [/<div id="wk">/, '<div id="wk">'],
     [/var WK\s*=\s*\{[^}]*\bart:\s*'[a-z]+'[^}]*\bname:/, 'var WK={art:…, name:…}'], [/wegwart-wuerfel@/, 'die Ladezeile für wuerfel.js']].forEach(function (x) {
      if (!x[0].test(text)) melde('Fehler', 'wuerfelkasten', 'Im Würfelkasten fehlt ' + x[1]);
    });
  }
  if (iLinie < 0) melde('Fehler', 'trennlinie', 'Die Trennlinie --- fehlt');
  Z.forEach(function (z, k) {
    if (z.trim() === '---' && ((k > 0 && Z[k - 1].trim()) || (k + 1 < Z.length && Z[k + 1].trim())))
      melde('Fehler', 'trennlinie', 'Vor und nach --- steht eine Leerzeile', (Z[k - 1] || '').trim() ? Z[k - 1] : Z[k + 1]);
  });
  var iStatus = Z.findIndex(function (z) { return z.indexOf('📅') >= 0; });
  if (tisch) { /* Statuszeile, Optionen und Schlusszeile kommen nach dem Wurf */ }
  else if (iStatus < 0) {
    var st = Z.filter(function (z) { return /(?<![\p{L}])Tag \d+/u.test(z) && /·/.test(z) && /TP \d/.test(z); })[0];
    melde('Fehler', 'statuszeile', st ? 'Die Statuszeile beginnt mit 📅' : 'Die Statuszeile fehlt', st);
  } else if (iLinie >= 0 && iStatus < iLinie) melde('Fehler', 'statuszeile', 'Die Statuszeile steht nach der Trennlinie', Z[iStatus]);
  var opt = Z.slice(iLinie >= 0 ? iLinie : 0).filter(function (z) { return /^\d+\.\s/.test(z); });
  if (tisch) { /* siehe oben */ }
  else if (opt.length !== 4) melde('Fehler', 'optionen', 'Genau vier Optionen, hier ' + opt.length, opt[opt.length - 1]);
  else if (opt.some(function (z, k) { return z.indexOf((k + 1) + '. ') !== 0; })) melde('Fehler', 'optionen', 'Optionen 1 bis 4 der Reihe nach', opt.join(' '));
  // Löst eine Option eine Probe aus, steht sie mit Bonus in Klammern dahinter (Regelwerk 3); ein Wagnis braucht eine Probe
  opt.forEach(function (z) {
    var kl = z.match(/\(([^()]*)\)/g) || [], mitBonus = kl.some(function (k) { return /[+−-]\s?\d/.test(k) || /^\(Zauber:/.test(k); });
    kl.forEach(function (k) { if (PROBE.test(k) && !/[+−-]\s?\d/.test(k)) melde('Fehler', 'option-probe', 'Probe ohne Bonus: ' + k, z); });
    if (/^\d+\.\s+\*\*Wagen:?\*\*/.test(z) && !mitBonus) melde('Fehler', 'option-probe', 'Ein Wagnis ohne Probe und Bonus', z);
  });
  var schluss = /^Oder schreib frei, was .+ tut, oder ein \*\*Schlüsselwort\*\*, um nachzufragen\.\s*$/;
  var iSchluss = Z.findIndex(function (z) { return schluss.test(z); });
  var letzte = Z.map(function (z) { return z.trim(); }).filter(Boolean).pop() || '';
  // Nach der Schlusszeile darf nur die Kampfkarte mit einem Satz stehen
  if (iSchluss >= 0 && /<div id="karte"/.test(Z.slice(iSchluss).join('\n'))) {
    var nachKarte = Z.slice(iSchluss + 1).filter(function (z) { return z.trim() && !/^\s*</.test(z) && !/^\s*(var|function|\}|\{|\/\/)/.test(z); });
    letzte = nachKarte.length <= 1 ? Z[iSchluss] : nachKarte[nachKarte.length - 1];
  }
  if (tisch) { /* siehe oben */ }
  else if (iSchluss < 0) melde('Fehler', 'schlusszeile', 'Die Schlusszeile „Oder schreib frei, was … tut, oder ein **Schlüsselwort**, um nachzufragen.“ fehlt', letzte);
  else if (!schluss.test(letzte)) melde('Fehler', 'schlusszeile', 'Nach der Schlusszeile steht nichts mehr', letzte);
  if ((i = ohneHtml.indexOf('"')) >= 0) melde('Fehler', 'anfuehrung', 'Rede steht in „…“', kontext(ohneHtml, i));
  var P = absaetze(erz), innen = P.filter(function (p) { return /^\*[^*\s][^*]*\*$/.test(p) && p.indexOf('📅') < 0; });
  if (innen.length > 1) melde('Fehler', 'innere-stimme', 'Höchstens eine innere Stimme, hier ' + innen.length, innen[1]);
  else if (innen.length === 1 && P[P.length - 1] !== innen[0]) melde('Fehler', 'innere-stimme', 'Die innere Stimme ist der letzte Absatz vor der Trennlinie', innen[0]);
  innen.forEach(function (p) {
    if (/[„“"]/.test(p)) melde('Fehler', 'innere-stimme', 'Die innere Stimme steht ohne Anführungszeichen', p);
    if (satzteile(p.replace(/^\*|\*$/g, '')).length > 1) melde('Fehler', 'innere-stimme', 'Die innere Stimme ist höchstens ein Satz', p);
  });
  // Längere Schriftstücke stehen zusätzlich als eingerückter Block (Regelwerk 3)
  erz.split('\n').forEach(function (z) {
    var r = /„\*([^*„“]+)\*“/g, x;
    while ((x = r.exec(z))) if ((x[1].length > 200 || satzteile(x[1]).length >= 3) && !/^\s*>/.test(z)) melde('Fehler', 'schriftstueck', 'Ein längeres Schriftstück steht als eingerückter Block (> …)', '„' + x[1] + '“');
  });
  schluesselwoerter(K, erz, Z.slice(iLinie >= 0 ? iLinie : Z.length).join('\n'), melde);
  K.G.filter(function (e) { return e.spieler; }).forEach(function (e) {
    var re = alle(e.re), x;
    while ((x = re.exec(text))) {
      if (!/🎭\s?$/.test(text.slice(Math.max(0, x.index - 3), x.index))) { melde('Fehler', 'spielerfigur', '🎭 vor ' + e.name + ' (Figur eines anderen Spielers)', kontext(text, x.index)); break; }
    }
  });

  /* ---------- Inhalt aus den Daten ---------- */
  var tarn = S.tarnname(K);
  if (tarn && K.figur) {
    var figurRe = S.muster([K.figur]);
    reden(erz).forEach(function (r) {
      if (figurRe.test(r)) melde('Fehler', 'tarnname', 'In der Rede heißt die Figur ' + tarn + ' (Lage), außer der Sprecher weiß es', '„' + r + '“');
    });
  }
  // Heute: die Statuszeile der Antwort, sonst wie das Szenenblatt
  var heute = (m = /📅[^\n]*?(?<![\p{L}])Tag (\d+)/u.exec(text)) ? +m[1] : K.heute.tag;
  if (heute !== null) (K.LOG.termine || []).filter(function (t) { return t && typeof t.tag === 'number' && t.tag >= heute && t.tag <= heute + 7; }).forEach(function (t) {
    var w = [String(t.text || '').split(':')[0].trim().split(/\s+/)[0]];
    if (t.mond === 'voll') w.push('Vollmond');
    if (t.mond === 'dunkel' || t.mond === 'neu') w.push('Neumond');
    var wRe = new RegExp('(?<![' + L + '])(' + w.filter(Boolean).map(S.escRe).join('|') + ')', 'iu'), soll = t.tag - heute;
    satzteile(text).forEach(function (s) {
      var k = s.search(wRe), x, best = null;
      if (k < 0) return;
      REL.lastIndex = 0;
      while ((x = REL.exec(s))) {
        if (/^Morgen$/.test(x[1]) && /(?:am|früh|frühen?|früher|guten|jeden|diesen|den|dem|der)\s+$/i.test(s.slice(0, x.index))) continue;
        var tage = /heute/i.test(x[1]) ? 0 : /übermorgen/i.test(x[1]) ? 2 : /morgen/i.test(x[1]) ? 1 : (+x[2] || ZAHL[x[2].toLowerCase()]);
        if (best === null || Math.abs(x.index - k) < Math.abs(best.i - k)) best = { i: x.index, tage: tage, wort: x[1] };
      }
      if (best && best.tage !== soll) melde('Fehler', 'termin', t.text + ': ' + S.relTag(t.tag, heute) + ' (Tag ' + t.tag + '), nicht „' + best.wort + '“', s);
    });
  });
  var erzS = satzteile(ohneRede(erz));
  personen.forEach(function (e) {
    var s;
    // Tote: genannt ohne ein Wort für den Tod im selben Satz
    if (e.haltung === 'tot' && (s = satzteile(erz).filter(function (x) { return e.re.test(x) && !TOD.test(x); })[0]))
      melde('Hinweis', 'tot', e.name + ' ist tot (Glossar)', s);
  });
  // Abwesend: „X ist seit/bis Tag N in …“ in Jetzt, Lage oder Neu festgelegt; nur in der Erzählung, nicht in der Rede
  var lagez = S.jetztZeilen(K, true).concat(K.NOTIZ_AB.Lage || [], K.NOTIZ_AB['Neu festgelegt'] || []);
  personen.forEach(function (e) {
    var a = null;
    lagez.forEach(function (z) {
      var x = new RegExp(S.VOR + '(?:' + e.keys.map(S.artikelfrei).join('|') + ')' + S.NACH + '\\s+ist\\s+(seit|bis)\\s+Tag\\s+(\\d+)\\s+(in|nach|auf|bei|im)\\s+([^.;,]+)', 'u').exec(z);
      if (x && !(x[1] === 'bis' && heute !== null && heute > +x[2])) a = x[1] + ' Tag ' + x[2] + ' ' + x[3] + ' ' + x[4].trim();
    });
    var s = a && erzS.filter(function (x) { return e.re.test(x); })[0];
    if (s) melde('Hinweis', 'abwesend', e.name + ' ist laut Lage ' + a, s);
  });
  personen.forEach(function (e) {
    // Geschlecht und Anrede: aus dem Glossar, sonst aus den Stehenden Dingen (die szene.js ohne SL nicht liest)
    if (/^w \((Stehende Dinge|Glossar)\)/.test(S.geschlecht(K, e))) {
      for (var k = 0; k < erzS.length; k++) {
        var s = erzS[k], x = e.re.exec(s);
        if (!x || nenntAndere(s, e)) continue;
        if (/(?<![\p{L}])(er|ihm|ihn|sein|seine[mnrs]?)(?![\p{L}])/u.test(s.slice(x.index + x[0].length)) || /^(Er|Ihm|Ihn|Sein|Seine[mnrs]?)(?![\p{L}])/u.test(erzS[k + 1] || '')) {
          melde('Hinweis', 'pronomen', e.name + ' ist eine Frau (Stehende Dinge)', s + ' ' + (erzS[k + 1] || '')); break;
        }
      }
    }
    var gs = S.geschlecht(K, e), sicher = /^[mw] \((Glossar|Stehende Dinge)\)/.test(gs);
    if (sicher) e.keys.filter(function (k) { return !/^[Dd](er|ie|as|en|em|es) /.test(k); }).forEach(function (k) {
      var art = gs.charAt(0) === 'm' ? 'die' : '(?:den|dem)', x = new RegExp('(?<![\\p{L}])(' + art + ')\\s+' + S.escRe(k) + '(?![\\p{L}])', 'iu').exec(ohneRede(erz) + ' ' + reden(erz).join(' '));
      if (x) melde('Hinweis', 'artikel', e.name + ' ist ' + (gs.charAt(0) === 'm' ? 'ein Mann' : 'eine Frau') + ' (' + gs.replace(/^.\s*\(|\)$/g, '') + '): „' + x[0] + '“?', x[0]);
    });
    var an = S.anrede(K, e);
    if (/^(Ihr|Sie|Euer)/.test(an)) absaetze(erz).forEach(function (p) {
      if (!e.re.test(p) || nenntAndere(ohneRede(p), e)) return;
      reden(p).forEach(function (r) { if (/(?<![\p{L}])(du|dich|dir|dein\p{L}*)(?![\p{L}])/iu.test(r)) melde('Hinweis', 'anrede', e.name + ' sagt ' + an + ' (Stehende Dinge)', '„' + r + '“'); });
    });
  });
  if (!K.ohneSl) spoiler(K, text, melde);
  return B;
}

// Namen und Wörter, die nur Spoilerdatei und Wissensbuch kennen, nicht aber Glossar, Geschichte, Logbuch, Spielstand und Notizen
function spoiler(K, text, melde) {
  var spieler = wissen.wortschatz([K.GLOSSAR_TEXT, K.GESCHICHTE_TEXT, JSON.stringify(K.LOG), K.STAND, K.NOTIZ].join('\n'));
  var namen = {}, woerter = {};
  function unbekannt(w) { return w.length >= 3 && !wissen.kennt(spieler, wissen.norm(w)); }
  // Namen genau vergleichen: „Mareth“ ist nicht bekannt, nur weil „Mareike“ im Buch steht (unscharf nur für Wortformen)
  function nameUnbekannt(w) { var n = wissen.norm(w); return w.length >= 3 && !spieler.exakt[n] && !spieler.exakt[n.replace(/s$/, '')]; }
  function name(n, quelle) {
    n = String(n).replace(/\*\*/g, '').replace(/:$/, '').trim();
    if (!/^[A-ZÄÖÜ][\p{L}-]+(?: [A-ZÄÖÜ][\p{L}-]+)*$/u.test(n)) return;
    n.split(' ').forEach(function (w) { if (nameUnbekannt(w)) namen[w] = quelle; });
  }
  K.G.forEach(function (e) { e.wahr.forEach(function (n) { name(n, 'wahrer Name von ' + e.name); }); });
  String(K.WISSEN || '').replace(/^### (.+?)\s*$/gm, function (a, n) { name(n, 'Wissensbuch'); return a; });
  String(K.SPOILER || '').replace(/^- \*\*([^*]+?)\*\*/gm, function (a, n) { name(n, 'Spoilerdatei'); return a; });
  K.SP_SONST.map(function (x) { return [x.z, x.kopf]; }).concat(S.zeilen(K.SP_ZEIT).map(function (z) { return [z, 'Zeitleiste']; })).forEach(function (zk) {
    (zk[0].replace(/\*\*/g, '').match(/(?<![\p{L}])[A-ZÄÖÜ][\p{L}]{3,}/gu) || []).forEach(function (w) { if (!namen[w] && unbekannt(w)) woerter[wissen.norm(w)] = zk[1]; });
  });
  // Glossarnamen sind nie Spoiler, auch wenn ein Wort davon sonst nirgends steht
  K.G.forEach(function (e) { e.keys.forEach(function (k) { k.split(' ').forEach(function (w) { delete namen[w]; delete woerter[wissen.norm(w)]; }); }); });
  var nw = wissen.wortschatz(Object.keys(woerter).join(' ')), gemeldet = {};
  (text.match(/(?<![\p{L}])[\p{L}][\p{L}-]{2,}/gu) || []).forEach(function (w) {
    var basis = namen[w] ? w : namen[w.replace(/s$/, '')] ? w.replace(/s$/, '') : null, n = wissen.norm(w);
    if (basis && !gemeldet[basis]) { gemeldet[basis] = 1; melde('Fehler', 'spoiler-name', 'Name nur aus der Spoilerseite (' + namen[basis] + ')', w); }
    else if (!basis && /^[A-ZÄÖÜ]/.test(w) && w.length >= 4 && wissen.kennt(nw, n) && !gemeldet[n]) {
      var quelle = woerter[n] || Object.keys(woerter).filter(function (x) { return wissen.kennt(wissen.wortschatz(x), n); }).map(function (x) { return woerter[x]; })[0];
      gemeldet[n] = 1; melde('Hinweis', 'spoiler-wort', 'Wort nur aus der Spoilerdatei (' + quelle + ')', w);
    }
  });
}

function lade(A) {
  var K = S.lade(A), buch = A.buch || 'arbeit';
  function lies(f) { try { return fs.readFileSync(path.join(buch, f), 'utf8'); } catch (e) { return ''; } }
  K.GLOSSAR_TEXT = lies('02_glossar.md'); K.GESCHICHTE_TEXT = lies('02_geschichte.md');
  return K;
}

if (typeof module !== 'undefined' && module.exports) module.exports = { pruefe: pruefe, lade: lade, version: VERSION };
if (require.main === module) {
  var argv = process.argv.slice(2), json = argv.indexOf('--json') >= 0, A;
  argv = argv.filter(function (a) { return a !== '--json'; });
  try { A = S.argumente(argv); } catch (e) { console.error(e.message + '\n' + AUFRUF); process.exit(2); }
  if (A.hilfe || A.namen.length !== 1) { console.error(AUFRUF); process.exit(A.hilfe ? 0 : 2); }
  var text;
  try { text = fs.readFileSync(A.namen[0] === '-' ? 0 : A.namen[0], 'utf8'); } catch (e) { console.error('Antwort nicht lesbar: ' + A.namen[0]); process.exit(2); }
  var K;
  try { K = lade(A); } catch (e) { console.error(e.message); process.exit(2); }
  var B = pruefe(K, text), nF = B.filter(function (b) { return b.stufe === 'Fehler'; }).length;
  if (json) process.stdout.write(JSON.stringify({ version: VERSION, fehler: nF, hinweise: B.length - nF, befunde: B }, null, 1) + '\n');
  else {
    B.forEach(function (b) { console.log((b.stufe === 'Fehler' ? 'Fehler ' : 'Hinweis') + ' · ' + b.regel + ' · ' + b.meldung + (b.zitat ? ' · ' + b.zitat : '')); });
    console.log('— ' + nF + ' Fehler, ' + (B.length - nF) + ' Hinweis(e)' + (nF ? '. Erst nach der Korrektur abschicken.' : '.'));
  }
  if (K.fehlt.length) console.error('Nicht gefunden (bleibt leer): ' + K.fehlt.join(', '));
  process.exit(nF ? 1 : 0);
}
