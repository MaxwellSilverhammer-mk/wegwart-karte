#!/usr/bin/env node
// Szenenblatt (Regelwerk 3.1, Werkstatt 21.3 und 24), nur bei der Spielleitung.
// Ein Aufruf statt vieler grep-Läufe: zu den Namen einer Szene je Person wenige Zeilen aus Glossar, Geschichte, Logbuch,
// Spielstand („Jetzt“), Werkbank, den Notizen der laufenden Sitzung, Wissensbuch und Spoilerdatei; oder zu einer Frage die
// besten Stellen aus allen Quellen.
//   node szene.js [--buch <arbeit>] [--ablage <ablage>] [--notizen <datei>]… [--ohne-sl] [--voll] NAME [NAME …]
//   node szene.js [--buch <arbeit>] [--ablage <ablage>] [--notizen <datei>]… [--ohne-sl] [--treffer N] --frage "WÖRTER …"
// --buch     Ordner mit 02_glossar.md, 02_geschichte.md und 02_questlog.json (node seite/bauen.js --zurueck), sonst ./arbeit
// --ablage   Ordner der Ablage mit 02_spielstand.md, wissensbuch.md, 03_spielleitung_SPOILER.md und werkbank.md, sonst ./ablage;
//            fehlt wissensbuch.md, gilt der Abschnitt „## Wer weiß was“ der Spoilerdatei
// --notizen  Übergabe eines Zwischenhalts, Sitzungsnotizen (mehrfach)
// --ohne-sl  Werkbank, Wissensbuch und Spoilerdatei nur zählen, nie zeigen
// --voll     das ganze Wissen jeder Person, sonst die letzten zehn Zeilen
// --treffer  Stellen je Frage, sonst 8
// Seit 1.1: oben die Lage (Zustand der Figur, Neues aus den Notizen, Termine der nächsten Tage), unten eine Prüfliste
// für den Entwurf; wahre Namen aus der Spoilerdatei (Abschnitt „## Namen“: „- Glossarname = wahrer Name“) gelten für alles,
// was die Spielleitung liest, und stehen mit --ohne-sl nirgends.
// Zeilen mit [SL] kommen aus Wissensbuch und Spoilerdatei: Was sie sagen, steht nie in der Erzählung (Regelwerk 4.8).
// Übertragen aus dem Entwurf szene.py von Visegards Tisch (Sitzung 31, 25.11.2026); was davon abweicht, steht in der README („Szenenblatt“).
'use strict';
var fs = require('fs'), path = require('path');
var glossarTisch = require(path.join(__dirname, 'glossar.js'));

var VERSION = '1.3';
var RUBRIK = { person: 'Personen', gruppe: 'Gruppen', ort: 'Orte', ding: 'Dinge', geruecht: 'Gerüchte' };
var HALTUNG = { verbuendet: 'verbündet', freund: 'freundlich', feind: 'feindlich', gefangen: 'gefangen', tot: 'tot', vermisst: 'vermisst', unklar: 'unklar' };
// Ein Wortzeichen wie \w in Python: Buchstaben aller Schriften (auch Umlaute und ß), Ziffern, Unterstrich
var W = '[\\p{L}\\p{N}_]', VOR = '(?<!' + W + ')', NACH = '(?!' + W + ')';
var WEIBL = 'Frau|Hauptfrau|Witwe|Tochter|Schwester|Laienschwester|Mutter|Mädchen|Magd|Hebamme|Braut|Enkelin|Nichte|Tante|Gesellin|Schamanin|Druidin|Kundschafterin|Dolmetscherin|Jägerin|Näherin|Händlerin|Bäuerin|Köchin|Elfe|Waldelfe';
var MAENNL = 'Mann|Witwer|Sohn|Bruder|Laienbruder|Vater|Junge|Knecht|Jäger|Häuptling|Schmied|Zimmermann|Lokator|Junker|Diener|Kaplan|Pelzer|Hirt|Schäfer|Ochsenwart|Zeugwart|Krieger|Kundschafter|Dolmetscher|Händler|Bauer|Altbauer|Bauernsprecher|Neffe|Onkel|Enkel|Großvater|Ritter|Visitator|Bischof|Altvater|Priester|Akolyth|Bandit|Kapitän|Schreiber|Wardog';
var STOP = {};
('der die das und oder ein eine einer eines dem den des mit von vom zum zur auf aus bei für ist war hat wie was wer wann wo nicht ' +
  'nur noch schon auch sich sie ihn ihm ihr er es wir ich du am im an in zu so ob dass als').split(' ').forEach(function (w) { STOP[w] = true; });

/* ---------- Hilfen ---------- */
function lies(p) { try { return fs.readFileSync(p, 'utf8').replace(/\r\n?/g, '\n'); } catch (e) { return null; } }
function escRe(s) { return String(s).replace(/[\\^$.*+?()[\]{}|\/]/g, '\\$&'); }
function zeichen(s) { return Array.from(String(s)); }
// Stelle in Zeichen (wie Python zählt), nicht in UTF-16-Einheiten
function stelle(text, i) { return zeichen(String(text).slice(0, i)).length; }
function zeilen(text) { return String(text || '').split('\n'); }
// Kürzt auf n Zeichen; liegt die Fundstelle um weiter hinten, beginnt der Ausschnitt kurz davor
function kurz(text, n, um) {
  if (n === undefined) n = 220;
  var t = zeichen(String(text).replace(/\s+/g, ' ').trim());
  if (t.length <= n) return t.join('');
  if (typeof um === 'number' && um > Math.floor(n / 2)) t = ['…'].concat(t.slice(Math.max(0, um - Math.floor(n / 3))));
  return t.slice(0, n).join('').replace(/\s+$/, '') + '…';
}
// Text eines Abschnitts unter der ersten Überschrift, die auf kopf passt, bis zur nächsten Überschrift derselben oder einer höheren Ebene
function abschnitt(text, kopf, ebene) {
  var m = new RegExp(kopf, 'mu').exec(text || '');
  if (!m) return '';
  var rest = text.slice(m.index + m[0].length), e = new RegExp('^#{1,' + ebene + '} (?!#)', 'm').exec(rest);
  return e ? rest.slice(0, e.index) : rest;
}

/* ---------- Glossar ---------- */
// Wie der Glossar-Tisch die Kurzzeile schreibt: Beim Lesen fällt ihr Schlusspunkt weg
function satzende(s) { s = String(s || '').trim(); return /[.!?“”)]$/.test(s) ? s : s + '.'; }
function herkunft(w) {
  if (w.bekannt === 'gesehen') return 'gesehen';
  if (w.bekannt === 'gehoert') return 'von ' + w.quelle;
  if (w.bekannt === 'gelesen') return 'gelesen: ' + w.quelle;
  if (w.bekannt === 'karte') return 'laut ' + w.quelle;
  if (w.bekannt === 'geruecht') return w.quelle ? 'Gerücht von ' + w.quelle : 'Gerücht';
  return '';
}
// Gelesen wird mit dem Glossar-Tisch selbst (Grammatik der README): auch 🎭, 🩸, ☠️, Post: und siehe:
function glossarLesen(text) {
  var P = glossarTisch.ausText(text);
  var G = P.D.eintraege.map(function (e) {
    return {
      art: e.art, kat: RUBRIK[e.art] || '', name: e.name, spieler: !!e.spieler, gefahr: e.gefahr || '',
      haltung: e.haltung ? HALTUNG[e.haltung] || e.haltung : '', auch: e.namen || [], ort: e.ort || '', beschreibung: e.kurz ? satzende(e.kurz) : '',
      gfeld: e.geschlecht || '', afeld: e.anrede || null,
      posten: (e.wissen || []).map(function (w) {
        var h = herkunft(w);
        return { text: w.text + (h ? ' (' + h + (w.tag ? ', Tag ' + w.tag : '') + ')' : ''), tag: w.tag || 0 };
      })
    };
  });
  var PERS = G.filter(function (e) { return e.art === 'person'; });
  G.forEach(function (e) {
    e.keys = schluessel(e, PERS);
    // Auch der Genitiv: „Bodos“ findet Bodo
    e.re = muster(e.keys);
    e.slKeys = e.keys; e.slRe = e.re; e.wahr = [];
  });
  return { G: G, probleme: P.probleme, figur: P.D.figur || '' };
}
// Ein Artikel am Anfang passt groß und klein: „Der Zöllner“ am Satzanfang, „der Zöllner“ mitten im Satz
function artikelfrei(k) { return escRe(k).replace(/^[Dd](er|ie|as|en|em|es) /, '[Dd]$1 '); }
function muster(keys) { return new RegExp(VOR + '(' + keys.map(artikelfrei).join('|') + ')s?' + NACH, 'u'); }
// Schlüssel: Name, auch-Namen, bei Personen Vor- oder Nachname, wenn keine andere Person ihn trägt
function schluessel(e, PERS) {
  var k = [e.name].concat(e.auch), teile = e.name.split(/\s+/).filter(Boolean);
  if (e.art === 'person' && teile.length > 1) [teile[0], teile[teile.length - 1]].forEach(function (t) {
    if (zeichen(t).length >= 4 && PERS.filter(function (p) { return p.name.split(/\s+/).indexOf(t) >= 0; }).length === 1) k.push(t);
  });
  var aus = [];
  k.forEach(function (x) { if (zeichen(x).length >= 3 && aus.indexOf(x) < 0) aus.push(x); });
  // Ein Name unter drei Zeichen („Bo“) gilt als ganzes Wort; ohne Schlüssel passte das Muster auf jede Zeile
  if (!aus.length) aus.push(e.name);
  return aus.sort(function (a, b) { return zeichen(b).length - zeichen(a).length; });
}
function finde(K, name) {
  var n = name.toLowerCase();
  var exakt = K.G.filter(function (e) { return e.keys.some(function (k) { return k.toLowerCase() === n; }); });
  if (exakt.length) return exakt.slice().sort(function (a, b) { return (a.art !== 'person') - (b.art !== 'person'); });
  return K.G.filter(function (e) {
    return e.keys.some(function (k) { return k.split(/\s+/).some(function (t) { return t.toLowerCase() === n; }); });
  });
}

/* ---------- Geschichte ---------- */
function geschichteLesen(text) {
  var aus = [], sitzung = '', szene = '', tag = 0;
  zeilen(text).forEach(function (z) {
    var m;
    if (z.indexOf('### ') === 0) {
      sitzung = z.slice(4).trim().replace(/,.*$/, ''); szene = '';
      if ((m = /Tag (\d+)/.exec(z))) tag = +m[1];
      return;
    }
    if (!z.trim() || z.charAt(0) === '#') return;
    if ((m = /^\*\*(.+?)\*\*/.exec(z))) szene = m[1].replace(/\.+$/, '');
    aus.push({ sitzung: sitzung, szene: szene, text: z, tag: tag });
  });
  return aus;
}

/* ---------- Laden ---------- */
// optionen: buch, ablage, notizen[], ohneSl. Gibt die gelesenen Quellen zurück; fehlt das Glossar, wirft es.
function lade(optionen) {
  var o = optionen || {}, buch = o.buch || 'arbeit', ablage = o.ablage || 'ablage', fehlt = [], hinweise = [];
  function datei(ordner, name, pflicht) {
    var p = path.join(ordner, name), t = lies(p);
    if (t === null) { if (pflicht) throw new Error('Kein ' + name + ' unter ' + ordner + ': --buch <Ordner mit 02_glossar.md> angeben (node seite/bauen.js --zurueck schreibt ihn).'); fehlt.push(p); return ''; }
    return t;
  }
  var GL = glossarLesen(datei(buch, '02_glossar.md', true));
  if (GL.probleme.length) hinweise.push('Glossar: ' + GL.probleme.length + ' Zeile(n) nicht verstanden (node glossar.js --json zeigt sie).');
  var LOG = {}, logText = lies(path.join(buch, '02_questlog.json')), jm;
  if (logText === null) {
    // Ohne Spielerbuch liegt das Logbuch als Markdown mit json-Block im Projekt (Werkstatt 4.7, Fall 3)
    var md = lies(path.join(buch, '02_questlog.md'));
    if (md !== null && (jm = md.match(/```json\s*([\s\S]*?)```/))) logText = jm[1];
    else fehlt.push(path.join(buch, '02_questlog.json'));
  }
  if (logText) {
    try { LOG = JSON.parse(logText); } catch (e) { hinweise.push('Logbuch: kein gültiges JSON (' + e.message + '); ohne Logbuch weiter.'); LOG = {}; }
  }
  var SPOILER = datei(ablage, '03_spielleitung_SPOILER.md'), WISSEN = lies(path.join(ablage, 'wissensbuch.md')), wissenAusSpoiler = false;
  if (WISSEN === null) {
    WISSEN = abschnitt(SPOILER, '^## Wer weiß was.*$', 2);
    if (WISSEN) wissenAusSpoiler = true; else fehlt.push(path.join(ablage, 'wissensbuch.md'));
  }
  var STAND = datei(ablage, '02_spielstand.md'), WERKBANK = o.ohneSl ? '' : datei(ablage, 'werkbank.md');
  var NOTIZ = (o.notizen || []).map(function (n) { var t = lies(n); if (t === null) fehlt.push(n); return t || ''; }).join('\n');

  var ns = [];
  SPOILER.replace(/^### Stand nach Sitzung (\d+)/gm, function (a, n) { ns.push(+n); return a; });
  var stehend = WERKBANK.match(/\*\*Stehende Dinge für Sitzung \d+\*\*[^\n]*/g) || [];
  var K = {
    G: GL.G, figur: GL.figur, GESCH: geschichteLesen(datei(buch, '02_geschichte.md')), LOG: LOG && typeof LOG === 'object' ? LOG : {},
    STAND: STAND, WISSEN: WISSEN, wissenAusSpoiler: wissenAusSpoiler, SPOILER: SPOILER, NOTIZ: NOTIZ, NOTIZ_AB: teile(NOTIZ),
    SP_SONST: sonstigeAbschnitte(SPOILER), SP_ZEIT: abschnitt(SPOILER, '^## Zeitleiste.*$', 2), SP_NAMEN: /^## Namen/m.test(SPOILER),
    JETZT: abschnitt(STAND, '^## Jetzt.*$', 2),
    // Der Stand nach der letzten Sitzung, bis zur nächsten Überschrift der Ebene 2 oder 3
    SP_STAND: ns.length ? abschnitt(SPOILER, '^### Stand nach Sitzung ' + Math.max.apply(null, ns) + '(?!\\d).*$', 3) : '',
    SP_REAKT: abschnitt(SPOILER, '^## Reaktionen.*$', 2),
    NEIGUNG: (SPOILER.match(/^\*\*Neigung.*$/gm) || []).join('\n'),
    STEHEND: stehend.length ? stehend[stehend.length - 1].split(/ · |\*\*Vor dem Abschicken/).slice(1).map(function (s) { return s.trim(); }) : [],
    ohneSl: !!o.ohneSl, voll: !!o.voll, kurz: !!o.kurz, ort: o.ort || '', treffer: o.treffer || 8, gezeigt: {}, inLage: {}, fehlt: fehlt, hinweise: hinweise
  };
  K.REAKT = reaktionen(K.SP_REAKT);
  wahreNamen(K);
  K.heute = heuteVon(K);
  return K;
}
// Alle übrigen Abschnitte der Spoilerdatei (Geheimnisse, Wahrheit, Uhren …): Zeilen mit ihrer Überschrift.
// Ausgenommen sind die Abschnitte, die das Blatt eigens liest. So hängt nichts an einer bestimmten Überschrift.
function sonstigeAbschnitte(text) {
  var aus = [], kopf = '', weg = /^(Stand|Reaktion|Zeitleiste|Wer weiß was|Namen)/;
  zeilen(text).forEach(function (z) {
    var m = /^##\s+(.+?)\s*$/.exec(z);
    if (m) { kopf = weg.test(m[1]) ? '' : m[1]; return; }
    if (kopf && /^\s*- /.test(z)) aus.push({ kopf: kopf, z: z.trim() });
  });
  return aus;
}
// Eine Notizdatei in ihren Teilen („## Lage“, „## Neu festgelegt“ …, Werkstatt 21.8)
function teile(text) {
  var A = {}, kopf = '';
  zeilen(text).forEach(function (z) {
    var m = /^##\s+(.+?)\s*$/.exec(z);
    if (m) { kopf = m[1]; A[kopf] = A[kopf] || []; return; }
    if (kopf && z.trim() && z.charAt(0) !== '#') A[kopf].push(z);
  });
  return A;
}
function reaktionen(text) {
  var R = [];
  zeilen(text).forEach(function (z) {
    var m = /^- \*\*(.+?)\*\*\s*(?:\(([^)]*)\))?:?\s*(.*)$/.exec(z);
    if (m) R.push({ wer: m[1].trim(), wenn: (m[2] || '').trim(), was: m[3].trim() });
  });
  return R;
}
// Wahre Namen: „## Namen“ mit „- Glossarname = wahrer Name; weitere“, sonst „X ist der <Glossarname>“ unter den Geheimnissen
function wahreNamen(K) {
  function dazu(e, n) {
    n = n.replace(/\*\*/g, '').trim();
    if (!n || e.keys.indexOf(n) >= 0 || e.wahr.indexOf(n) >= 0) return;
    e.wahr.push(n); e.slKeys = e.keys.concat(e.wahr); e.slRe = muster(e.slKeys);
  }
  function ohneArtikel(x) { return x.toLowerCase().replace(/^(der|die|das|den|dem) /, '').trim(); }
  zeilen(abschnitt(K.SPOILER, '^## Namen.*$', 2)).forEach(function (z) {
    var m = /^-\s*(.+?)\s*=\s*(.+)$/.exec(z), es;
    if (!m || (es = finde(K, m[1].replace(/\*\*/g, '').trim())).length !== 1) return;
    m[2].split(/;\s*/).forEach(function (n) { dazu(es[0], n); });
  });
  function person(n) { return K.G.filter(function (e) { return e.art === 'person' && e.keys.some(function (k) { return ohneArtikel(k) === ohneArtikel(n); }); }); }
  function bekannt(n) { return K.G.some(function (e) { return e.keys.some(function (k) { return ohneArtikel(k) === ohneArtikel(n); }); }); }
  var NAME = '((?:[Dd](?:er|ie|as) )?[A-ZÄÖÜ][\\p{L}-]+(?: (?:mit|von|vom|aus|der|dem|den) [\\p{L}-]+(?: [A-ZÄÖÜ][\\p{L}-]+)?| [A-ZÄÖÜ][\\p{L}-]+)?)';
  var satz = new RegExp('(?:^|[;:.]\\s+|^-\\s*)' + NAME + '\\s+ist\\s+(in Wahrheit\\s+|eigentlich\\s+|in Wirklichkeit\\s+)?' + NAME, 'gu');
  K.SP_SONST.forEach(function (x) {
    var z = x.z.replace(/\*\*/g, ''), m;
    satz.lastIndex = 0;
    while ((m = satz.exec(z))) {
      var links = m[1], rechts = m[3], ziel;
      // „X ist (in Wahrheit) der <Glossarname>“: X ist der wahre Name
      if (/^[Dd](?:er|ie|as) /.test(rechts) && !bekannt(links) && (ziel = person(rechts)).length === 1) dazu(ziel[0], links);
      // „<Glossarname> ist in Wahrheit X“: nur mit „in Wahrheit“, „eigentlich“ oder „in Wirklichkeit“
      else if (m[2] && !bekannt(rechts) && (ziel = person(links)).length === 1) dazu(ziel[0], rechts.replace(/^[Dd](?:er|ie|as) /, ''));
    }
  });
}
// Heute: der letzte „Tag N“ der Lage in den Notizen, sonst die Statuszeile in „Jetzt“, sonst „heute“ im Logbuch
function heuteVon(K) {
  var r = /(?<![\p{L}])Tag (\d+)/gu, m, t = null;
  while ((m = r.exec((K.NOTIZ_AB.Lage || []).join('\n')))) t = +m[1];
  if (t !== null) return { tag: t, quelle: 'Notizen' };
  var status = zeilen(K.JETZT).filter(function (z) { return /^\*/.test(z); }).join(' ');
  if ((m = /(?<![\p{L}])Tag (\d+)/u.exec(status))) return { tag: +m[1], quelle: 'Jetzt' };
  if (typeof K.LOG.heute === 'number') return { tag: K.LOG.heute, quelle: 'Logbuch' };
  return { tag: null, quelle: '' };
}
function relTag(t, heute) {
  if (heute === null || typeof t !== 'number') return '';
  var d = t - heute;
  return d === 0 ? 'heute' : d === 1 ? 'morgen' : d === 2 ? 'übermorgen' : d === -1 ? 'gestern' : d > 0 ? 'in ' + d + ' Tagen' : 'vor ' + (-d) + ' Tagen';
}
function tagVon(z) { var m = /(?<![\p{L}])Tag (\d+)/u.exec(z); return m ? +m[1] : null; }

/* ---------- Szenenblatt ---------- */
function geschlecht(K, e) {
  // Zuerst das Feld im Glossar (Spielerbuch, auch ohne SL), dann die Stehenden Dinge aus der Werkbank (nicht ohne SL), dann geraten
  if (e.gfeld) return e.gfeld + ' (Glossar)';
  if (!K.ohneSl) for (var i = 0; i < K.STEHEND.length; i++) {
    var s = K.STEHEND[i];
    if (e.re.test(s)) {
      if (s.indexOf('ein Mann') >= 0) return 'm (Stehende Dinge)';
      if (s.indexOf('eine Frau') >= 0) return 'w (Stehende Dinge)';
    }
  }
  if (new RegExp('^Einer' + NACH, 'u').test(e.beschreibung)) return 'm? (geraten aus „Einer …“)';
  if (new RegExp('^Eine' + NACH, 'u').test(e.beschreibung)) return 'w? (geraten aus „Eine …“)';
  var text = e.beschreibung + ' ' + e.posten.slice(0, 2).map(function (p) { return p.text; }).join(' '), best = null;
  [['w', WEIBL], ['m', MAENNL]].forEach(function (gm) {
    var m = new RegExp(VOR + '(' + gm[1] + ')' + NACH, 'u').exec(text);
    if (m && (best === null || m.index < best[1])) best = [gm[0], m.index, m[1]];
  });
  return best ? best[0] + '? (geraten aus „' + best[2] + '“)' : '?';
}
function einmal(K, aus, zeile, wer) {
  if (K.gezeigt[zeile]) { if (wer && K.gezeigt[zeile] !== wer) aus.push(zeile.replace(/^(  [^:]+):.*$/, '$1: siehe ' + K.gezeigt[zeile])); return; }
  K.gezeigt[zeile] = wer || true; aus.push(zeile);
}
function wortWer(w) { return w.von && !w.an ? 'von ' + w.von : 'an ' + (w.an || '?'); }
// Anrede aus den Stehenden Dingen: „… sagt Ihr zu …“ oder „… sagt du zu …“ (nicht mit --ohne-sl)
// Wie die Person die Figur anredet: zuerst das Feld im Glossar (auch ohne SL), dann die Stehenden Dinge
function anrede(K, e) {
  if (e.afeld) return e.afeld.person;
  if (K.ohneSl) return '';
  for (var i = 0; i < K.STEHEND.length; i++) {
    var m;
    if (e.re.test(K.STEHEND[i]) && (m = /sagt (Ihr|du|Sie|Euer \S+) zu/.exec(K.STEHEND[i]))) return m[1];
  }
  return '';
}
// Zeilen aus „Jetzt“ ohne Einstieg-Optionen und Titelbildschirm
// Neigung (Übergabe, Schritt 3): Steht eine Zeile „**Neigung …** Name +n · Name 0 → −1“ als feste Liste, gilt der Wert genau
// hinter dem ganzen Namen. Sonst wird roh gelesen wie im Entwurf, mit dem Vermerk „roh“, denn dann kann ein Wert zwischen
// zwei anderen Personen hängen bleiben („X zum Junker +1“).
function neigung(K, e) {
  var aus = [], ohneArtikel = function (x) { return x.toLowerCase().replace(/^(der|die|das|den|dem) /, '').trim(); };
  var bekannt = {};
  K.G.forEach(function (x) { x.slKeys.forEach(function (k) { bekannt[ohneArtikel(k)] = true; }); });
  zeilen(K.NEIGUNG).forEach(function (z) {
    var rest = z.replace(/^\*\*Neigung[^*]*\*\*\s*:?\s*/, '');
    var teile = rest.split(/\s*[·;]\s*/).filter(Boolean), liste = [];
    var fest = teile.length && teile.every(function (t) {
      var m = /^(.+?)\s+([+−-]?\d+)(?:\s*→\s*([+−-]?\d+))?\.?$/u.exec(t.trim()), n = m ? m[1].replace(/\*\*/g, '').trim() : '';
      // ein Eintrag der Liste ist ein Name: ein Schlüssel des Glossars oder Wörter mit großem Anfang (mit von, vom, zu)
      var name = m && (bekannt[ohneArtikel(n)] || /^(?:[Dd](?:er|ie|as) )?[A-ZÄÖÜ][\p{L}-]*(?: (?:von |vom |zu |zur )?[A-ZÄÖÜ][\p{L}-]*)*$/u.test(n));
      if (name) liste.push({ name: n, wert: m[3] || m[2] });
      return !!name;
    });
    if (fest) {
      liste.forEach(function (x) {
        if (e.slKeys.some(function (k) { return ohneArtikel(k) === ohneArtikel(x.name); })) aus.push({ wert: x.wert, roh: false });
      });
    } else {
      var r = new RegExp(VOR + '(?:' + e.slKeys.map(artikelfrei).join('|') + ')s?' + NACH + '[^·\\n]{0,25}?([+−-]?\\d)(?:\\s*→\\s*([+−-]?\\d))?', 'gu'), m;
      while ((m = r.exec(z))) aus.push({ wert: m[2] || m[1], roh: true });
    }
  });
  return aus;
}
function anredeLang(K, e) {
  var a = anrede(K, e);
  return a && e.afeld && e.afeld.figur !== e.afeld.person ? a + ' (die Figur sagt ' + e.afeld.figur + ')' : a;
}
function jetztZeilen(K, nurZustand) {
  var aus = [], vorbei = false;
  zeilen(K.JETZT).forEach(function (z) {
    if (/^###\s/.test(z)) { vorbei = true; return; }
    if (vorbei && nurZustand) return;
    if (!z.trim() || /^#/.test(z) || /^\d+\.\s/.test(z) || /^Oder schreib frei/.test(z) || z.indexOf('Titelbildschirm') === 0) return;
    aus.push(z);
  });
  return aus;
}
function nennt(K, z) { return K.G.some(function (e) { return e.art === 'person' && e.re.test(z); }); }
function tarnname(K) {
  var zz = jetztZeilen(K, true).concat(K.NOTIZ_AB.Lage || []), figurRe = K.figur ? muster([K.figur]) : null, i, m;
  var ALS = '\\bals\\s+((?:\\**[A-ZÄÖÜ][\\p{L}-]+\\**\\s+){0,2}\\**[A-ZÄÖÜ][\\p{L}-]+)';
  function letztes(g) { var w = g.replace(/\*\*/g, '').trim().split(/\s+/); return w[w.length - 1]; }
  for (i = 0; i < zz.length; i++) if ((m = /Tarnname:\s*\**([A-ZÄÖÜ][\p{L}-]+)/u.exec(zz[i]))) return m[1];
  for (i = 0; i < zz.length; i++) if ((m = new RegExp('\\b(?:[Vv]erkleidet|[Gg]etarnt)\\b[^.;\\n]{0,40}?' + ALS, 'u').exec(zz[i]))) return letztes(m[1]);
  for (i = 0; i < zz.length; i++) {
    if (figurRe && figurRe.test(zz[i]) && (m = new RegExp('\\b(?:tritt|reist|gibt sich|ausgibt|unterwegs)\\b[^.;\\n]{0,40}?' + ALS, 'u').exec(zz[i])) &&
        !nennt(K, letztes(m[1]))) return letztes(m[1]);
  }
  return '';
}
// Die Lage: Zustand der Figur, Neues der Sitzung, Termine der nächsten drei Tage. Steht einmal oben, vor den Personen.
function lage(K, es) {
  var aus = [], h = K.heute, figurRe = K.figur ? muster([K.figur]) : null, tarn = tarnname(K), tarnRe = tarn ? muster([tarn]) : null;
  function fuerLage(z) { return (figurRe && figurRe.test(z)) || (tarnRe && tarnRe.test(z)) || !nennt(K, z) || /^\*/.test(z) || /^\**Lage\b/.test(z); }
  aus.push('◆ Lage' + (h.tag !== null ? ' · heute Tag ' + h.tag + ' (' + h.quelle + ')' : ''));
  jetztZeilen(K, true).forEach(function (z) {
    if (!fuerLage(z)) return;
    K.inLage[z] = true; aus.push('  ' + (/^\*/.test(z) ? 'Stand: ' + z.replace(/^\*+|\*+$/g, '') : 'Jetzt: ' + kurz(z.replace(/^[- ]+/, ''), 240)));
  });
  (K.NOTIZ_AB.Lage || []).forEach(function (z) { K.inLage[z] = true; aus.push('  Notizen, Lage: ' + kurz(z.replace(/^[- ]+/, ''), 200)); });
  var neu = [].concat(K.NOTIZ_AB['Neu festgelegt'] || [], K.NOTIZ_AB.Berichtigung || []);
  var wichtig = neu.filter(function (z) { return es.some(function (e) { return e.re.test(z); }) || fuerLage(z); });
  wichtig.slice(-8).forEach(function (z) { K.inLage[z] = true; aus.push('  Neu: ' + kurz(z.replace(/^[- ]+/, ''), 200)); });
  if (neu.length > wichtig.slice(-8).length) aus.push('  (+' + (neu.length - wichtig.slice(-8).length) + ' weitere Zeilen unter „Neu festgelegt“ in den Notizen)');
  if (h.tag !== null) (K.LOG.termine || []).filter(function (t) { return t && typeof t.tag === 'number' && t.tag >= h.tag && t.tag <= h.tag + 3; })
    .sort(function (a, b) { return a.tag - b.tag; })
    .forEach(function (t) { aus.push('  Termin Tag ' + t.tag + ' (' + relTag(t.tag, h.tag) + '): ' + kurz(t.text || '', 160)); });
  return aus;
}
function blatt(K, e, alle) {
  var aus = [], name = (e.spieler ? '🎭 ' : '') + e.name + (e.gefahr ? (e.gefahr === 'toedlich' ? ' ☠️' : ' 🩸') : ''), an = e.art === 'person' ? anredeLang(K, e) : '';
  aus.push('■ ' + name + ' · ' + e.kat + ' · ' + (e.haltung || '–') + (e.ort ? ' · Ort ' + e.ort : '') +
    ' · Geschlecht ' + (e.art === 'person' ? geschlecht(K, e) : '–') + (an ? ' · Anrede ' + an : ''));
  if (e.auch.length) aus.push('  auch: ' + e.auch.slice(0, 6).join('; '));
  if (e.beschreibung) aus.push('  ' + kurz(e.beschreibung, 160));
  if (e.posten.length) {
    var p = e.posten[e.posten.length - 1];
    aus.push('  Glossar (' + e.posten.length + ' Posten), zuletzt Tag ' + (p.tag || '?') + ': ' + kurz(p.text, 200));
  }
  K.GESCH.filter(function (a) { return e.re.test(a.text); }).slice(-2).forEach(function (a) {
    aus.push('  Geschichte ' + a.sitzung + ', „' + kurz(a.szene, 60) + '“: ' + kurz(a.text, 200, stelle(a.text, e.re.exec(a.text).index)));
  });
  jetztZeilen(K, false).forEach(function (z) {
    if (e.re.test(z) && !K.inLage[z]) einmal(K, aus, '  Jetzt: ' + kurz(z.replace(/^[- ]+/, ''), 200), e.name);
  });
  var offen = (K.LOG.auftraege || []).filter(function (a) {
    return a && a.status === 'offen' && ((a.glossar || []).indexOf(e.name) >= 0 || e.re.test((a.titel || '') + ' ' + (a.text || '')));
  });
  if (offen.length) aus.push('  Logbuch offen (' + offen.length + '): ' + offen.slice(0, 6).map(function (a) { return a.titel; }).join('; ') + (offen.length > 6 ? ' …' : ''));
  (K.LOG.wort || []).filter(function (w) {
    return w && w.status === 'offen' && (w.an === e.name || w.von === e.name || e.re.test(w.text || ''));
  }).slice(-3).forEach(function (w) { einmal(K, aus, '  Wort offen (' + wortWer(w) + '): ' + kurz(w.text || '', 160), e.name); });
  (K.LOG.termine || []).filter(function (t) { return t && e.re.test(t.text || '') && (K.heute.tag === null || t.tag >= K.heute.tag); }).slice(0, 3)
    .forEach(function (t) { aus.push('  Termin Tag ' + t.tag + (relTag(t.tag, K.heute.tag) ? ' (' + relTag(t.tag, K.heute.tag) + ')' : '') + ': ' + kurz(t.text || '', 160)); });
  if (!K.ohneSl) K.STEHEND.forEach(function (s) { if (e.re.test(s)) aus.push('  Stehend: ' + s); });
  var nz = zeilen(K.NOTIZ).filter(function (z) { return e.re.test(z) && !K.inLage[z]; });
  nz.slice(-3).forEach(function (z) { einmal(K, aus, '  Notizen (' + nz.length + ', die letzten): ' + kurz(z, 160, stelle(z, e.re.exec(z).index)), e.name); });
  // Spielleitung: mit den wahren Namen aus der Spoilerdatei
  var kopf = [e.name].concat(e.wahr, e.auch), wz = [];
  for (var i = 0; i < kopf.length && !wz.length; i++) {
    wz = zeilen(abschnitt(K.WISSEN, '^### ' + escRe(kopf[i]) + '\\s*$', 3)).filter(function (z) { return z.indexOf('- ') === 0; });
  }
  var sp = zeilen(K.SP_STAND).filter(function (z) { return z.indexOf('- **') === 0 && e.slRe.test(z.split(':**')[0]); });
  var eigen = K.REAKT.filter(function (r) { return e.slKeys.indexOf(r.wer) >= 0; });
  var fremd = K.REAKT.filter(function (r) { return r.wenn && e.slRe.test(r.wenn) && eigen.indexOf(r) < 0 && alle.some(function (x) { return x !== e && x.slKeys.indexOf(r.wer) >= 0; }); });
  var gh = K.SP_SONST.filter(function (x) { return e.slRe.test(x.z); });
  var zl = zeilen(K.SP_ZEIT).filter(function (z) { return /^- /.test(z) && e.slRe.test(z); }).map(function (z) { return { z: z, t: tagVon(z) }; });
  // Zeitleiste: die nächsten zwei Einträge ab heute (bis sieben Tage voraus) und die letzten zwei davor
  var h = K.heute.tag, nachTag = function (a, b) { return (a.t === null ? 1e9 : a.t) - (b.t === null ? 1e9 : b.t); };
  var kommt = zl.filter(function (x) { return h === null || x.t === null || (x.t >= h && x.t <= h + 7); }).sort(nachTag);
  var war = zl.filter(function (x) { return h !== null && x.t !== null && x.t < h; }).sort(nachTag);
  zl = kommt.slice(0, 2).concat(war.slice(-2));
  var ng = neigung(K, e);
  if (K.ohneSl) {
    aus.push('  [SL] Wissensbuch ' + wz.length + ' Zeilen · Spoiler: Stand ' + sp.length + ', Reaktionen ' + (eigen.length + fremd.length) +
      ', sonst ' + gh.length + ', Zeitleiste ' + zl.length + ', Neigung ' + (ng.length ? 'ja' : 'nein'));
  } else {
    if (e.wahr.length) aus.push('  [SL] Wahrer Name: ' + e.wahr.join('; ') + ' (im Spiel nie nennen)');
    // Vollständig: Die Wissensgrenze hängt an jeder Zeile, auch an der ältesten
    if (wz.length) aus.push('  [SL] Wissensbuch (' + wz.length + (wz.length > 30 ? '; lang, verdichten nach Werkstatt' : '') + '): ' +
      wz.map(function (z) { return kurz(z.slice(2), 140); }).join(' | '));
    sp.forEach(function (z) { aus.push('  [SL] Stand: ' + kurz(z.slice(2), 400)); });
    eigen.concat(fremd).slice(0, 6).forEach(function (x) { aus.push('  [SL] Reaktion' + (eigen.indexOf(x) < 0 ? ' von ' + x.wer : '') + (x.wenn ? ' (' + x.wenn + ')' : '') + ': ' + kurz(x.was, 160)); });
    (K.voll ? gh : gh.slice(0, 6)).forEach(function (x) { aus.push('  [SL] ' + x.kopf + ': ' + kurz(x.z.replace(/^- /, ''), 240)); });
    if (!K.voll && gh.length > 6) aus.push('  [SL] (' + (gh.length - 6) + ' weitere Spoilerzeilen; --voll zeigt alle)');
    zl.forEach(function (x) { aus.push('  [SL] Zeitleiste: ' + kurz(x.z.slice(2).replace(/\*\*/g, ''), 200)); });
    if (ng.length) aus.push('  [SL] Neigung zuletzt' + (ng[ng.length - 1].roh ? ' (roh)' : '') + ': ' + ng[ng.length - 1].wert);
  }
  return aus;
}
// Vor dem Absenden: was die Antwort halten muss, aus denselben Quellen (eine Checkliste zum Abhaken, Regelwerk 3.1)
function pruefliste(K, es) {
  var aus = [], tarn = tarnname(K), h = K.heute.tag;
  if (tarn) aus.push('  - Tarnname ' + tarn + ': In der Rede heißt die Figur ' + tarn + ', außer bei denen, die es wissen (Lage).');
  es.forEach(function (e) {
    if (e.art !== 'person') return;
    var g = geschlecht(K, e), an = anredeLang(K, e), teil = [];
    if (/^[mwd] \((Stehende Dinge|Glossar)\)/.test(g)) teil.push({ m: 'Mann', w: 'Frau', d: 'divers' }[g.charAt(0)]);
    if (an) teil.push('sagt ' + an);
    if (teil.length) aus.push('  - ' + e.name + ': ' + teil.join(', ') + '.');
    if (e.haltung === 'tot') aus.push('  - ' + e.name + ' ist tot.');
    if (e.spieler) aus.push('  - 🎭 ' + e.name + ': Figur eines anderen Spielers; sie handelt nicht in deiner Erzählung.');
    if (!K.ohneSl && e.wahr.length) aus.push('  - [SL] ' + e.name + ' ist ' + e.wahr.join('; ') + ': im Spiel nur „' + e.name + '“.');
    jetztZeilen(K, true).forEach(function (z) {
      var m = new RegExp(VOR + '(?:' + e.keys.map(artikelfrei).join('|') + ')' + NACH + ' ist ([^;.]{3,60})', 'u').exec(z);
      if (m) aus.push('  - ' + e.name + ' ist ' + m[1].trim() + ' (Jetzt).');
    });
    var w = (K.LOG.wort || []).filter(function (x) { return x && x.status === 'offen' && (x.an === e.name || x.von === e.name); });
    if (w.length) aus.push('  - Offenes Wort ' + w.map(wortWer).join(', ') + '.');
  });
  if (h !== null) (K.LOG.termine || []).filter(function (t) { return t && t.tag >= h && t.tag <= h + 1; })
    .forEach(function (t) { aus.push('  - Termin ' + relTag(t.tag, h) + ' (Tag ' + t.tag + '): ' + kurz(t.text || '', 100)); });
  if (!K.ohneSl && K.SPOILER && !K.SP_NAMEN) aus.push('  - [SL] Die Spoilerdatei hat keinen Abschnitt „## Namen“: wahre Namen sind nur aus Sätzen geraten.');
  return aus.length ? ['◆ Vor dem Absenden prüfen'].concat(aus) : [];
}
// Lage, dann je Name ein Blatt, dann die Prüfliste; unbekannte und mehrdeutige Namen als Zeile mit „?“
function szenenblatt(K, namen) {
  var aus = [], es = [];
  namen.forEach(function (n) {
    var f = finde(K, n);
    if (!f.length) { aus.push('? ' + n + ': nicht im Glossar'); return; }
    if (f.length > 1 && f[0].kat === f[1].kat && f[0].name !== n) {
      aus.push('? ' + n + ': mehrdeutig: ' + f.slice(0, 6).map(function (e) { return e.name; }).join(', ')); return;
    }
    if (es.indexOf(f[0]) < 0) es.push(f[0]);
  });
  // --ort: alle Personen, die eine Zeile aus „Jetzt“ mit diesem Ort nennt (Übergabe, Schritt 4)
  if (K.ort) {
    var o = finde(K, K.ort).filter(function (e) { return e.art === 'ort'; })[0], ortRe = o ? o.re : new RegExp(VOR + escRe(K.ort) + NACH, 'u'), dazu = 0;
    jetztZeilen(K, true).filter(function (z) { return ortRe.test(z); }).forEach(function (z) {
      K.G.forEach(function (e) {
        if (e.art === 'person' && e.name !== K.figur && e.re.test(z) && es.indexOf(e) < 0) { es.push(e); dazu++; }
      });
    });
    if (!dazu) aus.push('? Ort ' + K.ort + ': laut „Jetzt“ ist dort niemand' + (es.length ? ' außer den genannten Namen' : ''));
  }
  var kopf = lage(K, es);
  es.forEach(function (e) {
    var b = blatt(K, e, es);
    // --kurz: je Person nur Kopf (Ort, Geschlecht, Anrede) und Stand; Lage und Prüfliste bleiben
    if (K.kurz) b = b.filter(function (z, i) { return i === 0 || /^  \[SL\] (Stand:|Wissensbuch \d+ Zeilen)/.test(z); });
    aus = aus.concat(b);
  });
  return kopf.concat(aus, pruefliste(K, es));
}

/* ---------- Frage ---------- */
function rang(z, vorgabe) {
  var t = [], r = /(?:Tag|WT) (\d+)/g, m;
  while ((m = r.exec(z))) t.push(+m[1]);
  return t.length ? Math.max.apply(null, t) * 1000 : (vorgabe || 0);
}
function einheiten(K) {
  var u = [], jetzt = (+K.LOG.welttag || 0) * 1000;
  function neu(quelle, rg, txt, sl) { u.push({ quelle: quelle, rang: rg, txt: String(txt || ''), sl: sl }); }
  K.G.forEach(function (e) { e.posten.forEach(function (p) { neu('Glossar ' + e.name, p.tag * 1000, p.text, false); }); });
  K.GESCH.forEach(function (a, i) {
    a.text.split(/(?<=[.!?“])\s+(?=[A-ZÄÖÜ„*])/u).forEach(function (satz) {
      neu('Geschichte ' + a.sitzung + ', „' + kurz(a.szene, 50) + '“', a.tag * 1000 + i % 1000, satz, false);
    });
  });
  (K.LOG.auftraege || []).forEach(function (a) {
    ((a && a.etappen) || []).forEach(function (et) { neu('Logbuch ' + a.titel, rang((et && et.text) || ''), et && et.text, false); });
  });
  (K.LOG.wort || []).forEach(function (w) { if (w) neu('Wort (' + w.status + ', ' + wortWer(w) + ')', rang(w.text || ''), w.text, false); });
  zeilen(K.STAND).forEach(function (z) { neu('Spielstand', jetzt, z, false); });
  zeilen(K.NOTIZ).forEach(function (z) { neu('Notizen', jetzt + 999, z, false); });
  // Steht das Wissensbuch in der Spoilerdatei, zählen seine Zeilen dort
  if (!K.wissenAusSpoiler) zeilen(K.WISSEN).forEach(function (z) { neu('Wissensbuch', rang(z), z, true); });
  zeilen(K.SPOILER).forEach(function (z) { neu('Spoiler', rang(z), z, true); });
  return u;
}
function frage(K, text) {
  var gruppen = [];
  (String(text).match(/[\p{L}\p{N}_]+/gu) || []).forEach(function (w) {
    if (zeichen(w).length < 3 || STOP[w.toLowerCase()]) return;
    var es = /^\p{Lu}/u.test(w) ? finde(K, w) : [], v = [w.toLowerCase()];
    if (es.length === 1) es[0].keys.forEach(function (k) { if (v.indexOf(k.toLowerCase()) < 0) v.push(k.toLowerCase()); });
    // Wortanfang statt Beugung: „Lichtern“ findet „Licht“
    gruppen.push(v.map(function (x) { return zeichen(x).length > 5 && x.indexOf(' ') < 0 ? zeichen(x).slice(0, 5).join('') : x; }));
  });
  var erg = [], sl = new Map();
  einheiten(K).forEach(function (u) {
    if (!u.txt.trim()) return;
    var t = u.txt.toLowerCase(), s = gruppen.filter(function (g) { return g.some(function (v) { return t.indexOf(v) >= 0; }); }).length;
    var noetig = gruppen.length <= 2 ? gruppen.length : Math.max(2, Math.ceil(gruppen.length / 2));
    if (noetig && s >= noetig) {
      if (u.sl && K.ohneSl) { sl.set(u.quelle, (sl.get(u.quelle) || 0) + 1); return; }
      var pos = null;
      gruppen.forEach(function (g) { g.forEach(function (v) { var i = t.indexOf(v); if (i >= 0 && (pos === null || i < pos)) pos = i; }); });
      erg.push({ s: s, rang: u.rang, quelle: u.quelle, text: kurz(u.txt, 240, pos === null ? 0 : stelle(t, pos)) });
    }
  });
  erg.sort(function (a, b) { return (b.s - a.s) || (b.rang - a.rang); });
  var aus = erg.slice(0, K.treffer).map(function (x) { return x.s + '/' + gruppen.length + ' · ' + x.quelle + ': ' + x.text; });
  if (erg.length > K.treffer) aus.push('(… ' + (erg.length - K.treffer) + ' weitere Treffer)');
  sl.forEach(function (n, q) { aus.push('[SL] ' + q + ': ' + n + ' Treffer (nicht gezeigt)'); });
  return aus.length ? aus : ['Keine Stelle mit genug Wörtern der Frage.'];
}

/* ---------- Aufruf ---------- */
var AUFRUF = 'Aufruf: node szene.js [--buch <arbeit>] [--ablage <ablage>] [--notizen <datei>]… [--ohne-sl] [--voll] [--kurz] [--ort ORT] NAME [NAME …]\n' +
  '        node szene.js [--buch <arbeit>] [--ablage <ablage>] [--notizen <datei>]… [--ohne-sl] [--treffer N] --frage "WÖRTER …"';
function argumente(argv) {
  var A = { notizen: [], namen: [], ohneSl: false, treffer: 8 };
  for (var i = 0; i < argv.length; i++) {
    var a = argv[i];
    if (a === '--ohne-sl') A.ohneSl = true;
    else if (a === '--voll') A.voll = true;
    else if (a === '--kurz') A.kurz = true;
    else if (a === '-h' || a === '--hilfe' || a === '--help') A.hilfe = true;
    else if (['--buch', '--ablage', '--notizen', '--frage', '--treffer', '--ort'].indexOf(a) >= 0) {
      if (i + 1 >= argv.length) throw new Error(a + ' braucht einen Wert.');
      var v = argv[++i];
      if (a === '--notizen') A.notizen.push(v);
      else if (a === '--treffer') { A.treffer = parseInt(v, 10); if (!(A.treffer > 0)) throw new Error('--treffer braucht eine Zahl über 0.'); }
      else A[a.slice(2)] = v;
    }
    else if (/^--/.test(a)) throw new Error('Unbekannter Schalter ' + a + '.');
    else A.namen.push(a);
  }
  return A;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { lade: lade, szenenblatt: szenenblatt, frage: frage, kurz: kurz, version: VERSION,
    // für antwort.js: dieselben Quellen und Regeln wie das Blatt
    argumente: argumente, tarnname: tarnname, jetztZeilen: jetztZeilen, geschlecht: geschlecht, anrede: anrede, relTag: relTag,
    muster: muster, artikelfrei: artikelfrei, escRe: escRe, zeilen: zeilen, VOR: VOR, NACH: NACH };
}
if (require.main === module) {
  var T0 = Date.now(), A;
  try { A = argumente(process.argv.slice(2)); } catch (e) { console.error(e.message + '\n' + AUFRUF); process.exit(2); }
  if (A.hilfe || (!A.namen.length && !A.frage && !A.ort)) { console.error(AUFRUF); process.exit(A.hilfe ? 0 : 2); }
  var K;
  try { K = lade(A); } catch (e) { console.error(e.message); process.exit(2); }
  var out = (A.frage ? frage(K, A.frage) : szenenblatt(K, A.namen)).join('\n');
  process.stdout.write(out + '\n— ' + zeichen(out).length + ' Zeichen, ' + ((Date.now() - T0) / 1000).toFixed(2) + ' s\n');
  if (K.fehlt.length) console.error('Nicht gefunden (bleibt leer): ' + K.fehlt.join(', '));
  K.hinweise.forEach(function (h) { console.error(h); });
}
