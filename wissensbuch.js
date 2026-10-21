/*
 * Wissensbuch – Wer weiß was: das Wissen der Figuren eines Reviers (NPCs), Zeile für Zeile mit Herkunft und
 * Welttag, und die Prüfung, dass keine Figur etwas weiß, das nicht zu ihr gelangt ist. Version 1.0 (Entwurf)
 *
 * Das Gegenstück zum Glossar: Das Glossar sagt, was die Spielerfigur weiß und woher; das Wissensbuch sagt, was
 * die Leute des Reviers wissen und woher. Ein NPC spricht im Spiel nur an, was in seinem Abschnitt steht.
 *
 * Grammatik, als Abschnitt der Spoilerdatei oder in einer eigenen Datei (beides gehört nie ins Repository):
 *   ## Wer weiß was
 *   *Stand: Tag 9 · Figur: Probefigur*
 *   ### Jost
 *   - Die Probefigur fragt nach den Lichtern am Weiher. (erlebt, Tag 4)
 *   ### Ortwin
 *   - Die Probefigur fragt nach den Lichtern am Weiher. (von Jost, Tag 6; Treffen in der Kapelle)
 *   - Ein neuer Wegwart reitet durch Rohrdorf. (Gerücht, Tag 7; die Fuhrleute reden darüber)
 *   (die erfundene Welt aus test/wissensbuch.test.js; Beispiele aus einem laufenden Revier gehören nicht hierher)
 * Herkunft am Ende jeder Zeile: „erlebt“ (war dabei), „von X“ (X hat es erzählt: eine Figur des Buchs oder die
 * Spielerfigur), „Gerücht“ (hat es aufgeschnappt; nach „;“ steht, wo es herkam). Dazu der Welttag.
 *
 * Die Prüfung (pruefen.js, mit Spielstand, Spoilerdatei und 02_glossar.md):
 *   - „von X“ braucht eine Kette: X hat dieselbe Sache in seinem Abschnitt, nicht später; oder X hat sie der
 *     Spielerfigur erzählt (Posten „von X“ im Glossar); ist X die Spielerfigur, muss sie es laut Glossar oder
 *     Spielstand bis dahin gewusst haben. Ohne Kette: gesperrt. Ein Kreis (A von B, B von A): gesperrt.
 *   - „Gerücht“ ohne Grund: gesperrt. Ein Tag nach dem Stand: gesperrt.
 *   - „erlebt“: Hinweis, wenn keine Zeile des Spielstands oder der Spoilerdatei die Figur bei der Sache nennt.
 */
'use strict';
var w = require('./wissen.js');

var VERSION = '1.0';

function ausText(text) {
  var B = { figuren: [], probleme: [] }, zeilen = String(text || '').replace(/\r/g, '').split('\n'), drin = false, fig = null;
  zeilen.forEach(function (z, i) {
    var m, nr = i + 1;
    if (/^##\s+Wer weiß was/i.test(z) || /^##\s+Wer weiss was/i.test(z)) { drin = true; return; }
    if (!drin) return;
    if (/^##\s/.test(z) && !/^###/.test(z)) { drin = false; return; }
    if (!z.trim()) return;
    if ((m = /^\*?\s*Stand:\s*Tag\s+(\d+)/i.exec(z))) {
      B.heute = +m[1];
      var f = /Figur:\s*([^·*]+)/i.exec(z);
      if (f) B.figur = f[1].trim();
      return;
    }
    if ((m = /^###\s+(.*)$/.exec(z))) {
      var name = m[1].trim();
      if (B.figuren.some(function (x) { return w.norm(x.name) === w.norm(name); })) B.probleme.push('Zeile ' + nr + ': „' + name + '“ hat schon einen Abschnitt.');
      fig = { name: name, zeilen: [] };
      B.figuren.push(fig);
      return;
    }
    if ((m = /^-\s+(.*)$/.exec(z))) {
      if (!fig) { B.probleme.push('Zeile ' + nr + ': Zeile ohne Figur (zuerst „### Name“).'); return; }
      var t = m[1].trim(), k = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(t);
      if (!k) { B.probleme.push('Zeile ' + nr + ': „' + t.slice(0, 50) + '“ ohne Herkunft am Ende: (erlebt, Tag n), (von X, Tag n) oder (Gerücht, Tag n; woher).'); return; }
      var teile = k[2].split(/;/), kopf = teile[0], grund = teile.slice(1).join(';').trim(), tg = /^(.*?)(?:,\s*Tag\s+(\d+))?\s*$/.exec(kopf), hk = tg[1].trim(), e = { text: k[1].trim(), nr: nr, grund: grund || undefined };
      if (/^erlebt$/i.test(hk)) e.herkunft = 'erlebt';
      else if (/^von\s+(.+)$/i.test(hk)) { e.herkunft = 'von'; e.von = /^von\s+(.+)$/i.exec(hk)[1].trim(); }
      else if (/^Ger(ü|ue)cht$/i.test(hk)) e.herkunft = 'geruecht';
      else { B.probleme.push('Zeile ' + nr + ': Herkunft „' + hk + '“ unbekannt (erlebt, von X, Gerücht).'); return; }
      if (tg[2]) e.tag = +tg[2]; else B.probleme.push('Zeile ' + nr + ': ohne Tag.');
      fig.zeilen.push(e);
      return;
    }
    B.probleme.push('Zeile ' + nr + ': „' + z.slice(0, 50) + '“ nicht verstanden.');
  });
  if (!B.figuren.length && !B.probleme.length) B.probleme.push('Kein Abschnitt „## Wer weiß was“ mit Figuren gefunden.');
  return B;
}

// Trägt eine Zeile (oder ein Posten) dieselbe Sache? Bei kurzen Fakten müssen alle Inhaltswörter in der Zeile
// stehen, bei längeren darf je fünf Wörter eines fehlen („fragt nach dem Schwarzen Weiher“ und „fragt nach den
// Lichtern am Weiher“ sind zwei Sachen). Darum: dieselbe Sache in denselben Worten schreiben, in jedem Abschnitt.
function fehlend(fakt, zeile) {
  var n = w.inhalt(fakt).length;
  if (!n) return Infinity;
  return Math.round(n - w.beleg(fakt, w.einheiten(zeile)).anteil * n);
}
function dieselbeSache(fakt, zeile) { var n = w.inhalt(fakt).length; return n > 0 && fehlend(fakt, zeile) <= Math.floor(n / 5); }
// War die Figur dabei? Eine Zeile des Spielstands oder der Spoilerdatei nennt sie und beschreibt die Sache
// (höchstens jedes dritte Wort fehlt) oder steht unter dem Tag der Sache und trägt die Hälfte der Wörter
// Eine Person heißt im Text oft nur beim Rufnamen („Aske“ statt „Mutter Aske“): Titel zählen nicht mit
var TITEL = /^(mutter|grossmutter|großmutter|vater|grossvater|großvater|magister|prinz|prinzessin|feldwebel|hauptmann|bruder|schwester|herr|frau|kapitaen|kapitän|meister|meisterin|alte|alter|der|die|das)$/i;
function namenVon(name) {
  var teile = String(name).split(/\s+/).filter(function (x) { return x.length >= 3 && !TITEL.test(x); });
  return [name].concat(teile.length > 1 || teile[0] !== name ? teile : []);
}
function genannt(text, name) { var t = w.norm(text); return namenVon(name).some(function (nm) { return w.kommtVor(t, nm); }); }
function dabei(name, fakt, tag, zeile) {
  var n = w.inhalt(fakt).length;
  if (!n || !genannt(zeile.text, name)) return false;
  var f = fehlend(fakt, zeile.text);
  if (f <= Math.floor(n / 3)) return true;
  return typeof tag === 'number' && zeile.tag === tag && f <= Math.floor(n / 2);
}
// Die Zeilen von Spielstand und Spoilerdatei, jede mit dem Tag, unter dem sie steht („### Sitzung 5, Tag 11: …“
// oder „Tag 11“ in der Zeile selbst)
function zeilenMitTag(text) {
  var aus = [], kontext;
  String(text || '').split('\n').forEach(function (z) {
    if (!z.trim()) return;
    var m = /(^|[^0-9])Tag\s+(\d+)([^0-9]|$)/.exec(z);
    if (/^#/.test(z)) { kontext = m ? +m[2] : undefined; return; }
    aus.push({ text: z, tag: m ? +m[2] : kontext });
  });
  return aus;
}

function pruefe(B, quellen) {
  quellen = quellen || {};
  var fehler = [], hinweise = [], heute = typeof B.heute === 'number' ? B.heute : null;
  (B.probleme || []).forEach(function (p) { fehler.push('Text: ' + p); });
  var stand = String(quellen.spielstand || ''), spoiler = String(quellen.spoiler || '');
  if (!stand.trim()) fehler.push('Spielstand fehlt: Ohne ihn lässt sich nichts belegen.');
  // Die Spoilerdatei ohne das Wissensbuch selbst, damit sich das Buch nicht selbst belegt
  var spoilerRest = spoiler.replace(/^##\s+Wer wei(ß|ss) was[\s\S]*?(?=^##\s(?!#)|(?![\s\S]))/mi, '');
  var G = quellen.glossar && Array.isArray(quellen.glossar.eintraege) ? quellen.glossar : null;
  var figur = B.figur || (G && G.figur) || '';
  if (heute === null) hinweise.push('Ohne „*Stand: Tag N*“ im Wissensbuch bleiben die Tage ungeprüft.');
  var byName = {};
  B.figuren.forEach(function (f) { byName[w.norm(f.name).trim()] = f; });
  var zeilenStand = zeilenMitTag(stand + '\n' + spoilerRest);
  // Was die Spielerfigur selbst weiß, belegt nur der Spielstand (mit seinen Teilen), nie die Spoilerdatei
  var zeilenNurStand = zeilenMitTag(stand);
  // Posten des Glossars: was die Spielerfigur weiß (mit Tag), und wer es ihr gesagt hat (Quelle)
  var posten = [];
  if (G) G.eintraege.forEach(function (e) { (e.wissen || []).forEach(function (x) { if (x && x.text) posten.push({ text: x.text, tag: x.tag, quelle: x.quelle || '', bekannt: x.bekannt }); }); });
  function wusste(name, fakt, tag) {
    // Die Spielerfigur: ein Posten des Glossars bis zu diesem Tag, sonst eine Zeile des Spielstands
    if (figur && w.norm(name).trim() === w.norm(figur).trim()) {
      if (posten.some(function (p) { return dieselbeSache(fakt, p.text) && (typeof p.tag !== 'number' || typeof tag !== 'number' || p.tag <= tag); })) return 'glossar';
      if (zeilenNurStand.some(function (z) { return dieselbeSache(fakt, z.text) && (typeof z.tag !== 'number' || typeof tag !== 'number' || z.tag <= tag); })) return 'spielstand';
      return null;
    }
    // Eine Figur des Reviers: hat es der Spielerfigur selbst erzählt (Posten „von X“ im Glossar) …
    if (posten.some(function (p) { return p.quelle && w.kommtVor(w.norm(p.quelle), name) && dieselbeSache(fakt, p.text) && (typeof p.tag !== 'number' || typeof tag !== 'number' || p.tag <= tag); })) return 'glossar';
    // … oder weiß es laut eigenem Abschnitt bis zu diesem Tag
    var f = byName[w.norm(name).trim()];
    if (!f) return null;
    var z = f.zeilen.filter(function (x) { return dieselbeSache(fakt, x.text) && (typeof x.tag !== 'number' || typeof tag !== 'number' || x.tag <= tag); })[0];
    return z ? { figur: f, zeile: z } : null;
  }
  // Die Kette bis zur Wurzel verfolgen: erlebt, Gerücht, die Spielerfigur oder ein Posten des Glossars; ein Kreis ist keine Wurzel
  function wurzel(f, z, besucht) {
    var schluessel = f.name + '#' + z.nr;
    if (besucht.indexOf(schluessel) >= 0) return { kreis: true };
    besucht = besucht.concat([schluessel]);
    if (z.herkunft !== 'von') return { ok: true };
    var q = wusste(z.von, z.text, z.tag);
    if (!q) return { fehlt: z.von };
    if (q === 'glossar' || q === 'spielstand') return { ok: true };
    return wurzel(q.figur, q.zeile, besucht);
  }
  var zaehl = { figur: B.figuren.length, zeile: 0 };
  B.figuren.forEach(function (f) {
    var nStandSpoiler = w.norm(stand + '\n' + spoilerRest);
    if (!w.kommtVor(nStandSpoiler, f.name)) hinweise.push('„' + f.name + '“ steht weder im Spielstand noch in der Spoilerdatei: eine neue Figur?');
    f.zeilen.forEach(function (z) {
      zaehl.zeile++;
      var wo = f.name + ', Zeile ' + z.nr + ' („' + z.text.slice(0, 40) + (z.text.length > 40 ? '…' : '') + '“)';
      if (typeof z.tag === 'number' && heute !== null && z.tag > heute) fehler.push('Lore: ' + wo + ': Tag ' + z.tag + ' liegt nach dem Stand (Tag ' + heute + ').');
      if (typeof z.tag === 'number' && z.tag < 1) fehler.push(wo + ': Tag ' + z.tag + ' gibt es nicht.');
      if (z.herkunft === 'geruecht' && !z.grund) fehler.push(wo + ': Ein Gerücht braucht einen Grund nach „;“ (wo es herkam, wer es trug).');
      if (z.herkunft === 'von') {
        var bekannt = (figur && w.norm(z.von).trim() === w.norm(figur).trim()) || byName[w.norm(z.von).trim()] || posten.some(function (p) { return p.quelle && w.kommtVor(w.norm(p.quelle), z.von); });
        if (!bekannt) fehler.push(wo + ': „von ' + z.von + '“, aber ' + z.von + ' hat weder einen Abschnitt im Wissensbuch noch einen Posten als Quelle im Glossar und ist nicht die Spielerfigur.');
        else {
          var r = wurzel(f, z, []);
          // Zwei Figuren des Reviers: Steht nirgends, dass sie sich getroffen haben, fragt die Prüfung nach, wenn kein Grund dabeisteht
          if (byName[w.norm(z.von).trim()] && !z.grund && !zeilenStand.some(function (zl) { return genannt(zl.text, f.name) && genannt(zl.text, z.von); })) hinweise.push(wo + ': „von ' + z.von + '“, aber keine Zeile des Spielstands oder der Spoilerdatei nennt ' + f.name + ' und ' + z.von + ' zusammen. Wann haben sie gesprochen? (Grund nach „;“ eintragen.)');
          if (r.kreis) fehler.push(wo + ': Die Kette läuft im Kreis; irgendwer muss es erlebt oder gehört haben.');
          else if (r.fehlt) fehler.push('Begründung fehlt: ' + wo + ' „von ' + z.von + '“, aber ' + r.fehlt + ' weiß das selbst nicht' + (typeof z.tag === 'number' ? ' (bis Tag ' + z.tag + ')' : '') + ': keine Zeile in seinem Abschnitt, kein Posten im Glossar' + (r.fehlt === figur ? ', keine Zeile im Spielstand' : '') + '.');
        }
      }
      if (z.herkunft === 'erlebt') {
        // Hinweis, wenn keine Zeile des Spielstands oder der Spoilerdatei die Figur bei dieser Sache nennt
        var zeuge = zeilenStand.some(function (zl) { return dabei(f.name, z.text, z.tag, zl); });
        if (!zeuge) hinweise.push(wo + ': „erlebt“, aber keine Zeile des Spielstands oder der Spoilerdatei nennt ' + f.name + ' bei dieser Sache. War ' + f.name + ' dabei?');
      }
    });
  });
  return { ok: fehler.length === 0, fehler: fehler, hinweise: hinweise, zaehl: zaehl };
}

module.exports = { ausText: ausText, pruefe: pruefe, version: VERSION };
