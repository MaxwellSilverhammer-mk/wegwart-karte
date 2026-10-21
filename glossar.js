/*
 * Wegwart-Glossar – Glossar für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.0 (Entwurf)
 *
 * Aufruf in einem Visualizer-Widget: Die Spielleitung kopiert den Text aus 02_glossar.md unverändert
 * zwischen die beiden Tags; der Tisch liest ihn und zeichnet daraus das Pergament.
 *   <h2 class="sr-only">Glossar: was Fürchtegott weiß, Stand Tag 12</h2>
 *   <div id="glossar">Glossar lädt … Falls nicht, frag nach dem Glossar als Text.</div>
 *   <script type="text/plain" id="glossar-text">
 *   *Stand: Tag 12 · Gefahr nach Stufe 3 · Figur: Fürchtegott*
 *   ### Personen
 *   - **Ksshar** (verbündet) · Ort: Schuppenkreis · Logbuch: Die Gelbkehlen · siehe: Ssark
 *     Späher der Gelbkehlen, dein Vertrauter.
 *     - Späher der Gelbkehlen, der Echsenmann vom Knüppeldamm. (gesehen, Tag 3)
 *     - Hat Brasks Boote gesehen und die Köpfe gezählt. (von Ksshar, Tag 4)
 *   <\/script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/glossar.js';document.head.appendChild(s);<\/script>
 *
 * Zwei Formen aus derselben Datei: der Auszug (ein Eintrag, Kopfzeile mit „Auszug: 1 von 64“) und das
 * ganze Glossar (alle Einträge, ein Tipp klappt einen auf). Jeder Posten trägt seine Herkunft (selbst
 * gesehen, von wem gehört, gelesen, laut Karte, Gerücht) und den Welttag. Die Datei ist der Glossar-
 * Abschnitt des Spielstands in eigener Datei; sie wird vorher mit pruefen.js geprüft (README).
 * Dieselbe Datei füllt das Spielerbuch (seite/buch.html, Artefakt mit Datenbank): node glossar.js --db oder
 * node seite/bauen.js --db schreibt die Dokumente, die die Spielleitung beim Sitzungsende mit ArtifactData einspielt.
 */
(function () {
  'use strict';

  var VERSION = '1.0';

  /* ---------- Arten ---------- */
  // Art → [Tabler-Icon, Einzahl, Mehrzahl (= Rubrik im Text)]
  var ART = {
    person: ['user', 'Person', 'Personen'], gruppe: ['users', 'Gruppe', 'Gruppen'], ort: ['map-pin', 'Ort', 'Orte'],
    ding: ['package', 'Ding', 'Dinge'], geruecht: ['speakerphone', 'Gerücht', 'Gerüchte']
  };
  var REIHE = ['person', 'gruppe', 'ort', 'ding', 'geruecht'];
  // Herkunft eines Wissenspostens → [Tabler-Icon, Beschriftung]; {q} ist die Quelle
  var BEKANNT = {
    gesehen: ['eye', 'selbst gesehen'], gehoert: ['ear', 'von {q}'], gelesen: ['file-text', 'gelesen: {q}'],
    karte: ['map', 'laut {q}'], geruecht: ['wind', 'Gerücht']
  };
  var HALTUNG = { verbuendet: 'verbündet', freund: 'freundlich', feind: 'feindlich', gefangen: 'gefangen', tot: 'tot', vermisst: 'vermisst', unklar: 'unklar' };
  var GEFAHR = { hart: ['droplet', 'harter Gegner', '🩸'], toedlich: ['skull', 'jenseits deiner Stufe', '☠️'] };
  var TISCH = { ort: ['Karte', 'Karte'], ding: ['Inventar', 'Gepäck'] };

  /* ---------- Schema für die Prüfung (pruefen.js) ---------- */
  var SCHEMA = {
    name: 'Glossar',
    wurzel: 'glossar',
    felder: {
      glossar: { titel: 'text', stand: 'text', heute: 'zahl', stufe: 'zahl', figur: 'text', auszug: 'ja', gesamt: 'zahl', eintraege: 'eintrag[]' },
      eintrag: { id: 'id', name: 'text', namen: 'text[]', art: 'eintragsart', kurz: 'text', spieler: 'ja', haltung: 'haltung', gefahr: 'gefahr', ort: 'text', logbuch: 'text[]', siehe: 'text[]', post: 'post', wissen: 'wissen[]' },
      wissen: { text: 'text', bekannt: 'bekannt', quelle: 'text', tag: 'zahl' },
      post: { ort: 'text', wie: 'text' }
    },
    wahl: { eintragsart: REIHE, bekannt: Object.keys(BEKANNT), haltung: Object.keys(HALTUNG), gefahr: Object.keys(GEFAHR) },
    pflicht: { glossar: ['stand', 'heute', 'eintraege'], eintrag: ['id', 'name', 'art', 'wissen'], wissen: ['text', 'bekannt'], post: ['ort'] },
    // Namen prüft zusatz(): Das Glossar ist das Register der Schlüsselwörter, ein Name muss nicht wörtlich im übrigen
    // Spielstand stehen; er sperrt, wenn ein Wort davon nur die Spoilerdatei kennt
    namen: {},
    // Das Glossar ist selbst Spielstand (in eigener Datei): Posten brauchen keine Stelle anderswo, und der
    // Wortpaar-Vergleich mit der Spoilerdatei wäre nur Rauschen. Was die Maschine prüft, steht in zusatz().
    belege: {},
    // Logbuch-Titel müssen im Spielstand vorkommen. Quellen der Posten, „siehe“ und „Ort“ prüft zusatz(): gegen den
    // übrigen Spielstand, die Einträge des Glossars und die Kartendaten.
    quellen: { eintrag: ['logbuch'] },
    // Zahlen, die im Spielstand stehen müssen
    zahlen: { glossar: ['heute'], wissen: ['tag'] }
  };

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function zahl(v, d) { v = +v; return isFinite(v) ? v : (d || 0); }
  function ikon(name, gr) {
    return '<i class="ti ti-' + name + '" aria-hidden="true"' + (gr ? ' style="font-size:' + gr + 'px"' : '') + '></i>';
  }
  var AKZENT = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(AKZENT, '');
  }
  function stichwort(s) { return norm(s).replace(/🎭/g, '').replace(/[„“"‚‘]/g, '').replace(/\s+/g, ' ').trim(); }
  function idVon(name) { return stichwort(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'eintrag'; }
  // Zitate „…“ und *Fremdworte* stehen kursiv, wie im Spiel (Regelwerk 3)
  function prosa(s) {
    return esc(s).replace(/„([^“]+)“/g, '<i>„$1“</i>').replace(/\*([^*\n]+)\*/g, '<i>$1</i>');
  }
  function anzeigeName(e) { return (e.spieler ? '🎭 ' : '') + esc(e.name); }
  function gueltig(w) {
    if (!w || typeof w.text !== 'string' || !BEKANNT[w.bekannt]) return false;
    if ((w.bekannt === 'gehoert' || w.bekannt === 'gelesen' || w.bekannt === 'karte') && !w.quelle) return false;
    return true;
  }
  // Laufzeitsperre: Einträge ohne gültige Art oder ohne gültigen Posten werden nicht gezeigt
  function sichtbar(D) {
    return (D.eintraege || []).filter(function (e) {
      return e && typeof e.id === 'string' && e.name && ART[e.art] && Array.isArray(e.wissen) && e.wissen.some(gueltig);
    });
  }
  function herkunft(w) {
    var b = BEKANNT[w.bekannt], t = b[1].replace('{q}', w.quelle || '');
    if (w.bekannt === 'geruecht' && w.quelle) t = 'Gerücht von ' + w.quelle;
    if (w.bekannt === 'gesehen' && w.quelle) t = w.quelle;
    return t;
  }
  function suchtext(e) {
    return norm([e.name].concat(e.namen || [], [e.kurz || ''], e.wissen.map(function (w) { return (w.text || '') + ' ' + (w.quelle || ''); })).join(' '));
  }

  /* ---------- Textform lesen und schreiben ---------- */
  // Das Glossar steht als Text in 02_glossar.md (Grammatik in der README). ausText() liest ihn in das
  // Objekt, mit dem Tisch und Prüfung arbeiten; alsText() schreibt es zurück, Zeile für Zeile gleich.
  var RUBRIK = {}, HALTUNG_WORT = {};
  REIHE.forEach(function (a) { RUBRIK[norm(ART[a][2])] = a; });
  Object.keys(HALTUNG).forEach(function (k) { HALTUNG_WORT[norm(HALTUNG[k])] = k; });
  // Listen im Kopf trennt „; “, weil Titel und Namen Kommas tragen können („Magister Sevrin, der Rote Mann“)
  function liste(s) { return String(s).split(/;\s*/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function herkunftAus(s) {
    var m;
    s = s.trim();
    if (/^(selbst )?gesehen$/i.test(s)) return { bekannt: 'gesehen' };
    if ((m = /^von (.+)$/i.exec(s))) return { bekannt: 'gehoert', quelle: m[1].trim() };
    if ((m = /^gelesen:? (.+)$/i.exec(s))) return { bekannt: 'gelesen', quelle: m[1].trim() };
    if ((m = /^laut (.+)$/i.exec(s))) return { bekannt: 'karte', quelle: m[1].trim() };
    if ((m = /^Gerücht(?: von (.+))?$/i.exec(s)) || (m = /^Geruecht(?: von (.+))?$/i.exec(s))) return m[1] ? { bekannt: 'geruecht', quelle: m[1].trim() } : { bekannt: 'geruecht' };
    return null;
  }
  function ausText(text) {
    var D = { eintraege: [] }, probleme = [], art = null, e = null, zeilen = String(text || '').replace(/\r/g, '').split('\n');
    function kopf(z) {
      var s = z.replace(/^\*+|\*+$/g, '').trim(), m;
      if ((m = /Stand:\s*Tag\s+(\d+)/i.exec(s))) { D.stand = 'Stand: Tag ' + m[1]; D.heute = +m[1]; }
      if ((m = /Stufe\s+(\d+)/i.exec(s))) D.stufe = +m[1];
      if ((m = /Figur:\s*([^·]+)/i.exec(s))) D.figur = m[1].trim();
      if ((m = /Auszug:\s*(\d+)\s+von\s+(\d+)/i.exec(s))) { D.auszug = true; D.gesamt = +m[2]; }
    }
    zeilen.forEach(function (z, i) {
      var m, nr = i + 1;
      if (!z.trim()) return;
      if ((m = /^#\s+(.*)$/.exec(z))) { if (!D.titel) D.titel = m[1].replace(/\s+–.*$/, '').trim(); if (/Stand:/.test(z)) kopf(z); return; }
      if ((m = /^##\s+(.*)$/.exec(z))) { if (!D.titel) D.titel = m[1].trim(); return; }
      if ((m = /^###\s+(.*)$/.exec(z))) {
        art = RUBRIK[norm(m[1]).trim()] || null; e = null;
        if (!art) probleme.push('Zeile ' + nr + ': Rubrik „' + m[1] + '“ unbekannt (Personen, Gruppen, Orte, Dinge, Gerüchte).');
        return;
      }
      if ((m = /^-\s+\*\*(.+?)\*\*\s*(.*)$/.exec(z)) && !art) { probleme.push('Zeile ' + nr + ': Eintrag „' + m[1] + '“ steht vor der ersten Rubrik.'); return; }
      // Vor der ersten Rubrik: die Kopfzeile lesen, sonstige Prosa (Hinweise für die Spielleitung) übergehen
      if (!art) { if (/Stand:|Auszug:|Figur:|Stufe\s+\d/.test(z)) kopf(z); return; }
      if (m) {
        var name = m[1].trim(), rest = m[2].trim();
        e = { id: idVon(name), name: name.replace(/🎭\s*/g, '').trim(), art: art, wissen: [] };
        if (/🎭/.test(name)) e.spieler = true;
        if (/☠️|☠/.test(rest)) { e.gefahr = 'toedlich'; rest = rest.replace(/☠️|☠/g, ' '); }
        else if (/🩸/.test(rest)) { e.gefahr = 'hart'; rest = rest.replace(/🩸/g, ' '); }
        var h = /^\s*\(([^)]*)\)/.exec(rest);
        if (h) {
          var hw = HALTUNG_WORT[norm(h[1]).trim()];
          if (hw) e.haltung = hw; else probleme.push('Zeile ' + nr + ': Haltung „' + h[1] + '“ unbekannt (' + Object.keys(HALTUNG).map(function (k) { return HALTUNG[k]; }).join(', ') + ').');
          rest = rest.slice(h[0].length);
        }
        rest.split(/\s*·\s*/).forEach(function (f) {
          f = f.trim();
          if (!f) return;
          var k;
          if ((k = /^Ort:\s*(.+)$/i.exec(f))) e.ort = k[1].trim();
          else if ((k = /^Logbuch:\s*(.+)$/i.exec(f))) e.logbuch = liste(k[1]);
          else if ((k = /^siehe:?\s+(.+)$/i.exec(f))) e.siehe = liste(k[1]);
          else if ((k = /^auch:\s*(.+)$/i.exec(f))) e.namen = liste(k[1]);
          else if ((k = /^Post:\s*(.+)$/i.exec(f))) { var p = k[1].split(/\s+–\s+/); e.post = { ort: p[0].trim() }; if (p[1]) e.post.wie = p.slice(1).join(' – ').trim(); }
          else probleme.push('Zeile ' + nr + ': „' + f + '“ im Kopf von „' + name + '“ nicht verstanden (Ort:, Logbuch:, siehe:, auch:, Post:; Listen mit „; “ trennen).');
        });
        D.eintraege.push(e);
        return;
      }
      if ((m = /^\s+-\s+(.*)$/.exec(z))) {
        if (!e) { probleme.push('Zeile ' + nr + ': Posten ohne Eintrag.'); return; }
        var t = m[1].trim(), k2 = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(t), w = null;
        if (k2) {
          var inhalt = k2[2], tg = /^(.*?)(?:,\s*Tag\s+(\d+))?\s*$/.exec(inhalt), hk = herkunftAus(tg[1]);
          if (hk) { w = hk; w.text = k2[1].trim(); if (tg[2]) w.tag = +tg[2]; }
        }
        if (!w) { probleme.push('Zeile ' + nr + ': Posten „' + t.slice(0, 50) + '“ ohne lesbare Herkunft am Ende: (gesehen, Tag n), (von X, Tag n), (gelesen: X, Tag n), (laut X, Tag n), (Gerücht von X, Tag n).'); w = { text: t, bekannt: 'unklar' }; }
        else if (w.tag === undefined) probleme.push('Zeile ' + nr + ': Posten „' + t.slice(0, 50) + '“ ohne Tag.');
        e.wissen.push(w);
        return;
      }
      if (/^\s+\S/.test(z) && e) { if (e.kurz) probleme.push('Zeile ' + nr + ': zweite Kurzzeile bei „' + e.name + '“; Posten beginnen mit „- “.'); else e.kurz = z.trim().replace(/\.$/, ''); return; }
      probleme.push('Zeile ' + nr + ': „' + z.slice(0, 50) + '“ nicht verstanden.');
    });
    return { D: D, probleme: probleme };
  }
  function satzende(s) { s = String(s || '').trim(); return /[.!?“”)]$/.test(s) ? s : s + '.'; }
  function alsText(D) {
    var aus = [], kopf = [];
    if (D.stand) kopf.push(D.stand); else if (typeof D.heute === 'number') kopf.push('Stand: Tag ' + D.heute);
    if (D.auszug) kopf.push('Auszug: ' + (D.eintraege || []).length + ' von ' + (D.gesamt || (D.eintraege || []).length));
    if (typeof D.stufe === 'number') kopf.push('Gefahr nach Stufe ' + D.stufe);
    if (D.figur) kopf.push('Figur: ' + D.figur);
    aus.push('# ' + (D.titel || 'Glossar'));
    aus.push('*' + kopf.join(' · ') + '*');
    REIHE.forEach(function (a) {
      var es = (D.eintraege || []).filter(function (e) { return e && e.art === a; });
      if (!es.length) return;
      aus.push('', '### ' + ART[a][2]);
      es.forEach(function (e) {
        var k = '- **' + (e.spieler ? '🎭 ' : '') + e.name + '**';
        if (e.gefahr && GEFAHR[e.gefahr]) k += ' ' + GEFAHR[e.gefahr][2];
        if (e.haltung && HALTUNG[e.haltung]) k += ' (' + HALTUNG[e.haltung] + ')';
        if (e.namen && e.namen.length) k += ' · auch: ' + e.namen.join('; ');
        if (e.ort) k += ' · Ort: ' + e.ort;
        if (e.logbuch && e.logbuch.length) k += ' · Logbuch: ' + e.logbuch.join('; ');
        if (e.siehe && e.siehe.length) k += ' · siehe: ' + e.siehe.join('; ');
        if (e.post && e.post.ort) k += ' · Post: ' + e.post.ort + (e.post.wie ? ' – ' + e.post.wie : '');
        aus.push(k);
        if (e.kurz) aus.push('  ' + satzende(e.kurz));
        (e.wissen || []).forEach(function (w) {
          var hk = w.bekannt === 'gesehen' ? 'gesehen' : w.bekannt === 'gehoert' ? 'von ' + w.quelle : w.bekannt === 'gelesen' ? 'gelesen: ' + w.quelle : w.bekannt === 'karte' ? 'laut ' + w.quelle : w.quelle ? 'Gerücht von ' + w.quelle : 'Gerücht';
          aus.push('  - ' + satzende(w.text) + ' (' + hk + (typeof w.tag === 'number' ? ', Tag ' + w.tag : '') + ')');
        });
      });
    });
    return aus.join('\n') + '\n';
  }
  // Auszug: ein Eintrag mit Posten, aufgeklappt; die Kopfzeile sagt, wie viele Einträge das Glossar hat
  function alsAuszug(D, name) {
    var E = sichtbar(D), e = E.filter(function (x) { return x.id === name || stichwort(x.name) === stichwort(name) || (x.namen || []).some(function (n) { return stichwort(n) === stichwort(name); }); })[0];
    if (!e) return null;
    var A = { titel: D.titel, stand: D.stand, heute: D.heute, stufe: D.stufe, figur: D.figur, auszug: true, gesamt: E.length, eintraege: [e] };
    Object.keys(A).forEach(function (k) { if (A[k] === undefined) delete A[k]; });
    return A;
  }

  /* ---------- Zeichnen ---------- */
  // Ein Querverweis öffnet den Eintrag an Ort und Stelle, wenn er in den Daten steht, sonst fragt er die Spielleitung danach
  function verweis(karte, name, icon) {
    var z = karte[stichwort(name)];
    if (z) return '<button type="button" class="glK" data-ziel="' + esc(z.id) + '">' + (icon ? ikon(icon, 14) + ' ' : '') + anzeigeName(z) + '</button>';
    return '<button type="button" class="glK" data-prompt="' + esc('Glossar ' + name) + '">' + (icon ? ikon(icon, 14) + ' ' : '') + esc(name) + ' ↗</button>';
  }
  function eintragHtml(D, e, i, karte) {
    var id = 'gl' + i, g = e.gefahr && GEFAHR[e.gefahr];
    // Gefahr steht nur als Zeichen am Namen (Regelwerk 3); die Stufe, auf der es eingeschätzt ist, trägt die Beschriftung
    var gefahrText = g ? g[1] + (typeof D.stufe === 'number' ? ' (eingeschätzt auf Stufe ' + D.stufe + ')' : '') : '';
    var h = '<li class="glE" data-id="' + esc(e.id) + '"><button type="button" class="glZ" aria-expanded="false" aria-controls="' + id + '">' +
      ikon(ART[e.art][0], 17) + '<span class="glN">' + anzeigeName(e) +
      (g ? ' <i class="ti ti-' + g[0] + ' glGef" role="img" aria-label="' + esc(gefahrText) + '" title="' + esc(gefahrText) + '"></i>' : '') +
      (e.haltung && HALTUNG[e.haltung] ? ' <em class="glH" title="' + esc((D.figur || 'die Figur') + ' schätzt') + '">' + esc(HALTUNG[e.haltung]) + '</em>' : '') +
      (e.kurz ? '<small>' + prosa(e.kurz) + '</small>' : '') + '</span><i class="glPlus" aria-hidden="true">+</i></button>';
    h += '<div class="glD" id="' + id + '" hidden>';
    // Wissen, Posten für Posten, in der Reihenfolge, in der die Figur es erfuhr
    var wissen = e.wissen.filter(gueltig).map(function (w, k) { return { w: w, k: k }; });
    wissen.sort(function (a, b) {
      var ta = typeof a.w.tag === 'number' ? a.w.tag : -1, tb = typeof b.w.tag === 'number' ? b.w.tag : -1;
      return ta - tb || a.k - b.k;
    });
    h += '<ul class="glW">';
    wissen.forEach(function (x) {
      var w = x.w, b = BEKANNT[w.bekannt];
      h += '<li class="' + esc(w.bekannt) + '">' + ikon(b[0], 16) + '<span>' + prosa(w.text) + '<small>' + esc(herkunft(w)) +
        (typeof w.tag === 'number' ? ' · Tag ' + w.tag : '') + '</small></span></li>';
    });
    h += '</ul>';
    // Haltung: der Eindruck der Figur, nicht die Wahrheit; darum steht sie als Satz der Figur unter dem Wissen
    if (e.haltung && HALTUNG[e.haltung]) h += '<p class="glKl">' + esc(D.figur || 'Die Figur') + ' hält ' + esc(e.name.replace(/^(Der|Die|Das) /, function (a) { return a.toLowerCase(); })) + ' für ' + esc(HALTUNG[e.haltung]) + '.</p>';
    // Querverweise: Ort, siehe auch, Logbuch, Post; dann die Tische, auf denen das Stichwort liegt
    var quer = '';
    if (e.ort && stichwort(e.ort) !== stichwort(e.name)) quer += verweis(karte, e.ort, 'map-pin');
    (e.siehe || []).forEach(function (s) { if (stichwort(s) !== stichwort(e.name)) quer += verweis(karte, s); });
    if (quer) h += '<p class="glKl">Siehe auch</p><p class="glQ">' + quer + '</p>';
    if (e.logbuch && e.logbuch.length) h += '<p class="glKl">Im Logbuch: ' + e.logbuch.map(esc).join(', ') + '</p>';
    if (e.post && e.post.ort) h += '<p class="glKl">Post: ' + esc(e.post.ort) + (e.post.wie ? ', ' + esc(e.post.wie) : '') + '</p>';
    var tische = '';
    if (e.logbuch && e.logbuch.length) tische += '<button type="button" class="glK" data-prompt="Questlog">Logbuch ↗</button>';
    if (TISCH[e.art]) tische += '<button type="button" class="glK" data-prompt="' + TISCH[e.art][0] + '">' + TISCH[e.art][1] + ' ↗</button>';
    if (tische) h += '<p class="glQ glSp">' + tische + '</p>';
    return h + '</div></li>';
  }

  function zeichne(D) {
    var E = sichtbar(D), karte = {};
    E.forEach(function (e) { karte[stichwort(e.name)] = e; (e.namen || []).forEach(function (n) { if (!karte[stichwort(n)]) karte[stichwort(n)] = e; }); });
    var kopf = D.auszug
      ? ' · Auszug: ' + E.length + (D.gesamt ? ' von ' + zahl(D.gesamt) + ' Einträgen' : E.length === 1 ? ' Eintrag' : ' Einträge')
      : ' · ' + E.length + (E.length === 1 ? ' Stichwort' : ' Stichwörter');
    var h = '<div class="glKopf"><p class="glT">' + esc(D.titel || 'Glossar') + '</p><p class="glS">' + esc(D.stand || '') + kopf + '</p></div>';
    if (!E.length) return h + '<p class="glLeer">Noch kein Stichwort. Fett gedruckte Wörter im Spiel landen hier.</p>';
    if (!D.auszug) {
      h += '<div class="glSuche">' + ikon('search', 18) + '<input type="search" class="glIn" aria-label="Stichwort suchen" placeholder="Stichwort suchen" autocomplete="off"></div>';
      h += '<div class="glChips" role="group" aria-label="Rubriken"><button type="button" class="glC" data-art="" aria-pressed="true">Alle</button>';
      REIHE.forEach(function (a) {
        var n = E.filter(function (e) { return e.art === a; }).length;
        if (n) h += '<button type="button" class="glC" data-art="' + a + '" aria-pressed="false">' + ART[a][2] + ' <b>' + n + '</b></button>';
      });
      h += '</div>';
    }
    var nr = 0;
    REIHE.forEach(function (a) {
      var es = E.filter(function (e) { return e.art === a; });
      if (!es.length) return;
      h += '<section class="glR" data-art="' + a + '" aria-label="' + ART[a][2] + '"><p class="glG">' + ART[a][2] + '</p><ul class="glL">';
      es.forEach(function (e) { h += eintragHtml(D, e, nr++, karte); });
      h += '</ul></section>';
    });
    h += '<p class="glLeer glNix" hidden>Nichts gefunden.</p>';
    if (D.auszug) h += '<p class="glQ"><button type="button" class="glK" data-prompt="Glossar">Ganzes Glossar ↗</button></p>';
    return h;
  }

  var CSS = [
    '.gl{--pg:#efe2c3;--ink:#3b3028;--ink2:#5a4a3a;--rot:#8e3b22;--rahmen:#8b6d45;--linie:rgba(59,48,40,.28);',
    'background:var(--pg);color:var(--ink);border:3px solid var(--rahmen);border-radius:14px;padding:5px;font-family:"EB Garamond",Garamond,Georgia,serif;font-size:17px;line-height:1.45}',
    '[data-mode="dark"] .gl{--pg:#d8c9a3}',
    '@media (prefers-color-scheme:dark){:root:not([data-mode]) .gl{--pg:#d8c9a3}}',
    '.gl p{margin:0}.gl [hidden]{display:none!important}',
    '.glIn0{border:1px solid var(--rahmen);border-radius:9px;padding:14px 16px 12px;display:flex;flex-direction:column;gap:12px}',
    '.glT{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:27px;line-height:1.1}',
    '.glS,.glKl{font-style:italic;color:var(--ink2)}.glS{font-size:17px}.glKl{font-size:15px}',
    '.glSuche{display:flex;align-items:center;gap:8px;border-bottom:1.5px solid var(--rahmen);padding:2px 4px 4px;color:var(--ink2)}',
    '.gl input.glIn{all:unset;flex:1;min-width:0;font-family:inherit;font-size:17px;color:var(--ink);line-height:1.4}',
    '.gl input.glIn::placeholder{color:var(--ink2);opacity:.8;font-style:italic}',
    '.gl input.glIn::-webkit-search-cancel-button{-webkit-appearance:none}',
    '.glChips{display:flex;flex-wrap:wrap;gap:6px}',
    '.gl button.glC{all:unset;cursor:pointer;font-family:inherit;font-size:15px;color:var(--ink);border:1px solid var(--rahmen);border-radius:999px;padding:1px 11px;line-height:1.5}',
    '.gl button.glC b{font-weight:400;color:var(--ink2)}',
    '.gl button.glC[aria-pressed="true"]{background:var(--ink);color:var(--pg)}.gl button.glC[aria-pressed="true"] b{color:var(--pg)}',
    '.gl button.glC:focus-visible,.gl button.glZ:focus-visible,.gl .glK:focus-visible,.gl input.glIn:focus-visible{outline:2px solid var(--rot);outline-offset:1px}',
    '.glR{border-top:1.5px solid var(--rahmen);padding-top:8px}',
    '.glG{font-style:italic;font-size:15px;color:var(--rot);margin-bottom:2px!important}',
    '.glL{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:1px}',
    '.gl button.glZ{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:flex-start;gap:8px;padding:4px 4px;border-radius:5px;cursor:pointer;color:var(--ink);font-family:inherit;font-size:17px;line-height:1.35}',
    '.gl button.glZ:hover{background:rgba(59,48,40,.07)}',
    '.gl button.glZ[aria-expanded="true"]{background:rgba(142,59,34,.09)}',
    '.glZ .ti{flex-shrink:0;margin-top:4px;color:var(--ink2)}',
    '.glN{flex:1;min-width:0;display:block}.glN small{display:block;font-size:15px;font-style:italic;color:var(--ink2);line-height:1.3}',
    '.glH{font-style:italic;font-size:14px;color:var(--ink2);border:1px solid var(--linie);border-radius:4px;padding:0 5px;white-space:nowrap}',
    '.glGef{color:var(--rot);font-size:16px;vertical-align:-2px}',
    '.glPlus{font-style:normal;color:var(--rot);font-size:17px;margin-top:1px}',
    '.glD{margin:2px 4px 10px 29px;padding:4px 0 2px 12px;border-left:2px solid var(--rot);display:flex;flex-direction:column;gap:8px;font-size:16px}',
    '.glW{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}',
    '.glW li{display:flex;gap:8px;align-items:flex-start;line-height:1.4}',
    '.glW li .ti{flex-shrink:0;margin-top:3px;color:var(--ink2)}',
    '.glW li.gehoert .ti,.glW li.geruecht .ti{color:var(--rot)}',
    '.glW li span{min-width:0}.glW small{display:block;font-style:italic;font-size:14px;color:var(--ink2)}',
    '.glW li.geruecht span>span{font-style:italic}',
    '.glQ{display:flex;flex-wrap:wrap;gap:6px}.glSp{margin-top:2px}',
    '.gl .glK{all:unset;cursor:pointer;font-family:inherit;font-size:15px;color:var(--ink);border:1px solid var(--rahmen);border-radius:6px;padding:1px 10px;line-height:1.5}',
    '.gl .glK:hover{background:rgba(59,48,40,.07)}',
    '.gl .glK .ti{vertical-align:-2px}',
    '.glLeer{font-style:italic;color:var(--ink2);font-size:15px}'
  ].join('');

  function schriftLaden() {
    try {
      if (document.getElementById('ktSchrift')) return;
      var l = document.createElement('link');
      l.id = 'ktSchrift'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=IM+Fell+English:ital@0;1&display=swap';
      document.head.appendChild(l);
    } catch (e) { return; }
  }

  function einbauen(el, D, auf) {
    schriftLaden();
    el.className = 'gl';
    el.innerHTML = '<style>' + CSS + '</style><div class="glIn0">' + zeichne(D) + '</div>';
    var E = sichtbar(D), texte = {};
    E.forEach(function (e) { texte[e.id] = suchtext(e); });
    var art = '', suche = '';
    function oeffne(li, auf) {
      var b = li.querySelector('button.glZ'), d = b && document.getElementById(b.getAttribute('aria-controls') || '');
      if (!b || !d) return;
      if (auf === undefined) auf = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(auf));
      d.hidden = !auf;
      var plus = b.querySelector('.glPlus');
      if (plus) plus.textContent = auf ? '−' : '+';
    }
    function filtere() {
      var treffer = 0;
      Array.prototype.forEach.call(el.querySelectorAll('.glR'), function (r) {
        var n = 0;
        Array.prototype.forEach.call(r.querySelectorAll('.glE'), function (li) {
          var e = E.filter(function (x) { return x.id === li.getAttribute('data-id'); })[0];
          var ok = !!e && (art === '' || e.art === art) && (!suche || texte[e.id].indexOf(suche) >= 0);
          li.hidden = !ok;
          if (ok) n++;
        });
        r.hidden = !n;
        treffer += n;
      });
      var nix = el.querySelector('.glNix');
      if (nix) nix.hidden = treffer > 0;
    }
    var input = el.querySelector('input.glIn');
    if (input) input.addEventListener('input', function () { suche = norm(input.value).trim(); filtere(); });
    el.addEventListener('click', function (ev) {
      var t = ev.target, z;
      if (!t.closest) return;
      if ((z = t.closest('[data-prompt]'))) { if (typeof sendPrompt === 'function') sendPrompt(z.getAttribute('data-prompt')); return; }
      if ((z = t.closest('[data-ziel]'))) {
        var li = el.querySelector('.glE[data-id="' + z.getAttribute('data-ziel').replace(/"/g, '') + '"]');
        if (!li) return;
        // Querverweis: Filter lösen, Ziel aufklappen und hinscrollen
        if (li.hidden || (li.closest('.glR') || {}).hidden) {
          art = ''; suche = ''; if (input) input.value = '';
          Array.prototype.forEach.call(el.querySelectorAll('.glC'), function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-art') === '')); });
          filtere();
        }
        oeffne(li, true);
        if (li.scrollIntoView) li.scrollIntoView({ block: 'start', behavior: 'smooth' });
        var b = li.querySelector('button.glZ'); if (b && b.focus) b.focus({ preventScroll: true });
        return;
      }
      if ((z = t.closest('button.glC'))) {
        art = z.getAttribute('data-art');
        Array.prototype.forEach.call(el.querySelectorAll('.glC'), function (c) { c.setAttribute('aria-pressed', String(c === z)); });
        filtere();
        return;
      }
      if ((z = t.closest('button.glZ'))) oeffne(z.closest('.glE'));
    });
    if (typeof sendPrompt !== 'function') Array.prototype.forEach.call(el.querySelectorAll('[data-prompt]'), function (x) { x.remove(); });
    if (D.auszug && E.length === 1) oeffne(el.querySelector('.glE'), true);
    // Ein bestimmter Eintrag soll offen sein (die Glossar-Seite liest ihn aus #id der Adresse)
    if (auf) {
      var ziel = el.querySelector('.glE[data-id="' + String(auf).replace(/"/g, '') + '"]');
      if (ziel) { oeffne(ziel, true); if (ziel.scrollIntoView) ziel.scrollIntoView({ block: 'start' }); }
    }
  }

  // Daten: der Text aus 02_glossar.md in <script type="text/plain" id="glossar-text"> (oder <pre id="glossar-text" hidden>),
  // zur Not ein fertiges Objekt in window.GLOSSAR
  function daten() {
    if (window.GLOSSAR && typeof window.GLOSSAR === 'object') return window.GLOSSAR;
    var t = document.getElementById('glossar-text');
    if (!t) return null;
    return ausText(t.textContent || '').D;
  }
  function start() {
    var el = document.getElementById('glossar');
    if (!el) return false;
    var D = daten();
    if (!D) return false;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Das Glossar ließ sich nicht zeichnen: ' + err.message; }
    return true;
  }

  /* ---------- Zusatzprüfung für pruefen.js ---------- */
  // Lore- und Verweisprüfung: Stand, Tage und Stufe, Herkunft je Posten, 🎭-Figuren gegen die Chronik, Gefahrzeichen,
  // Querverweise auf Einträge, Karte, Gepäck und Logbuch, wenn deren Daten mitgegeben sind; Grammatikfehler des Textes.
  function stufeAus(stand) {
    var re = /Stufe\s+(\d+)\s+seit/gi, m, best = null;
    while ((m = re.exec(stand))) if (best === null || +m[1] > best) best = +m[1];
    if (best !== null) return best;
    m = /bis\s+Stufe\s+(\d+)/i.exec(stand);
    if (m) return +m[1] - 1;
    return null;
  }
  function zusatz(D, h) {
    var fehler = [], hinweise = [], heute = D.heute, q = h.quellen || {};
    (q.probleme || []).forEach(function (p) { fehler.push('Text: ' + p); });
    var E = Array.isArray(D.eintraege) ? D.eintraege.filter(function (e) { return e && typeof e === 'object'; }) : [];
    var namen = {}, byName = {};
    E.forEach(function (e) {
      if (e.name) byName[stichwort(e.name)] = e;
      (e.namen || []).forEach(function (n) { if (typeof n === 'string' && !byName[stichwort(n)]) byName[stichwort(n)] = e; });
    });
    // Spoilerwörter: ein Wort, das die Spoilerdatei kennt und der übrige Spielstand nicht. Kurze Wörter zählen nur
    // wörtlich (sonst sperrt „fern“ wegen „Ferne“), längere auch gebeugt („Ortwins“ zu „Ortwin“).
    var wSpExakt = {}, wRest = typeof q.namenKorpus === 'string' && h.wortschatz ? h.wortschatz(q.namenKorpus) : null;
    if (typeof q.spoiler === 'string' && h.woerterVon) h.woerterVon(q.spoiler).forEach(function (x) { wSpExakt[x] = true; });
    function spoilerWort(w) { return !!(wRest && h.wSpoiler && (wSpExakt[w] || (w.length >= 6 && h.kennt(h.wSpoiler, w))) && !h.kennt(wRest, w)); }
    function woerter(t) { return (h.woerterVon ? h.woerterVon(t) : []).filter(function (x) { return x.length >= 4; }); }
    // Namen: Das Glossar ist das Register der Schlüsselwörter (Regelwerk 5), darum muss ein Name nicht wörtlich im übrigen
    // Spielstand stehen. Er sperrt, wenn eines seiner Wörter nur die Spoilerdatei kennt; sonst nur ein Hinweis.
    var nurGlossar = [];
    E.forEach(function (e) {
      var ns = [e.name].concat(e.namen || []).filter(function (n) { return typeof n === 'string' && n.trim(); });
      if (!ns.length || typeof h.nNamen !== 'string') return;
      if (ns.some(function (n) { return h.kommtVor(h.nNamen, n); })) return;
      var boese = [];
      ns.forEach(function (n) { woerter(n).forEach(function (x) { if (spoilerWort(x) && boese.indexOf(x) < 0) boese.push(x); }); });
      if (boese.length) fehler.push('Spoiler: Eintrag „' + e.name + '“: Der Name steht nicht im übrigen Spielstand, und „' + boese.join('“, „') + '“ kennt nur die Spoilerdatei.');
      else nurGlossar.push(e.name);
    });
    if (nurGlossar.length) hinweise.push('Namen, die nur im Glossar stehen (die Chronik des Spielstands nennt sie nicht): ' + nurGlossar.join('; '));
    var st = /tag\s+(\d+)/i.exec(D.stand || '');
    if (st && +st[1] !== heute) fehler.push('Stand „' + D.stand + '“ passt nicht zu heute (Tag ' + heute + ').');
    if (D.auszug && typeof D.gesamt !== 'number') hinweise.push('Auszug ohne „von N“: Der Kopf kann nicht sagen, wie viele Einträge das ganze Glossar hat.');
    // Gefahr ist eine Einschätzung nach der Stufe der Figur (Regelwerk 12.2): Die Stufe steht im Kopf und muss die heutige sein
    var mitGefahr = E.filter(function (e) { return e.gefahr; }).length, stufe = stufeAus(h.stand);
    if (mitGefahr && typeof D.stufe !== 'number') fehler.push('Gefahrzeichen ohne „Gefahr nach Stufe N“ im Kopf: 🩸 und ☠️ gelten nur für eine Stufe (Regelwerk 12.2).');
    if (typeof D.stufe === 'number') {
      if (stufe === null) hinweise.push('Stufe der Figur im Spielstand nicht erkannt („Stufe N seit …“ oder „bis Stufe N+1“); „Gefahr nach Stufe ' + D.stufe + '“ ungeprüft.');
      else if (stufe !== D.stufe) fehler.push('Lore: Gefahrzeichen auf Stufe ' + D.stufe + ' eingeschätzt, die Figur hat Stufe ' + stufe + '. Nach dem Aufstieg alle 🩸 und ☠️ neu einschätzen (Regelwerk 12.2) und die Stufe im Kopf anpassen.');
    }
    var karte = q.karte && Array.isArray(q.karte.orte) ? q.karte.orte : null, inventar = q.inventar && Array.isArray(q.inventar.traeger) ? q.inventar : null;
    var questlog = q.questlog && Array.isArray(q.questlog.auftraege) ? q.questlog : null;
    var figuren = Array.isArray(q.figuren) ? q.figuren : q.figuren && Array.isArray(q.figuren.figuren) ? q.figuren.figuren : null;
    if (!karte) hinweise.push('Ohne Kartendaten (02_karte.md) bleiben Ortsverweise ungeprüft.');
    if (!questlog) hinweise.push('Ohne Logbuchdaten (02_questlog.md) bleiben Logbuchverweise ungeprüft.');
    if (!inventar) hinweise.push('Ohne Gepäckdaten (02_inventar.md) bleiben Dinge ungeprüft.');
    var orteNamen = {}, dingNamen = [], titel = [];
    (karte || []).forEach(function (o) { if (o && o.name) orteNamen[stichwort(o.name)] = o; (o && o.namen || []).forEach(function (n) { orteNamen[stichwort(n)] = o; }); });
    ((inventar || {}).traeger || []).forEach(function (t) { (t && t.dinge || []).forEach(function (d) { if (d && d.name) dingNamen.push(stichwort(d.name)); (d && d.namen || []).forEach(function (n) { dingNamen.push(stichwort(n)); }); }); });
    ((questlog || {}).auftraege || []).forEach(function (a) { if (a && a.titel) titel.push(stichwort(a.titel)); });
    if (figuren && !figuren.length) hinweise.push('Die Figurenliste der Chronik ist leer.');
    var figurNamen = (figuren || []).map(function (f) { return stichwort(typeof f === 'string' ? f : f && (f.name || f.id) || ''); });
    E.forEach(function (e, i) {
      var wo = 'Eintrag „' + (e.name || e.id || i + 1) + '“';
      var n = stichwort(e.name || '');
      if (namen[n]) fehler.push(wo + ': Der Name kommt mehrfach vor.'); namen[n] = true;
      if (/🎭/.test(e.name || '')) fehler.push(wo + ': 🎭 gehört in den fetten Namen des Textes, nicht in „name“.');
      if (e.spieler) {
        if (D.figur && n === stichwort(D.figur)) fehler.push(wo + ': Die eigene Figur bekommt nie 🎭 (Regelwerk 3).');
        if (figuren && figurNamen.indexOf(n) < 0 && !(e.namen || []).some(function (x) { return figurNamen.indexOf(stichwort(x)) >= 0; })) fehler.push('Lore: ' + wo + ' trägt 🎭, steht aber nicht unter figuren in der Weltchronik.');
        if (!figuren) hinweise.push(wo + ': 🎭 ungeprüft, weil keine Figurenliste der Chronik mitgegeben ist.');
      }
      if (e.gefahr && GEFAHR[e.gefahr] && typeof h.quellen.namenKorpus === 'string') {
        // Ein Gefahrzeichen, das sonst nirgends im Spielstand bei diesem Namen steht, fällt der Spielleitung zur Prüfung vor
        var zeichen = GEFAHR[e.gefahr][2], nk = h.quellen.namenKorpus.split('\n').some(function (z) { return z.indexOf(zeichen) >= 0 && h.kommtVor(h.norm(z), e.name); });
        if (!nk) hinweise.push(wo + ': ' + zeichen + ' steht sonst nirgends im Spielstand bei diesem Namen. Stimmt die Einschätzung nach Regelwerk 12.2?');
      }
      var w = Array.isArray(e.wissen) ? e.wissen : [];
      if (!w.some(gueltig)) fehler.push(wo + ': ohne gültigen Wissensposten; der Tisch zeigt den Eintrag nicht.');
      w.forEach(function (x, k) {
        if (!x || typeof x !== 'object') return;
        var wx = wo + ', Posten ' + (k + 1);
        if ((x.bekannt === 'gehoert' || x.bekannt === 'gelesen' || x.bekannt === 'karte') && !x.quelle) fehler.push(wx + ': „' + x.bekannt + '“ braucht eine Quelle (wer, welches Schriftstück, welche Karte).');
        if (x.bekannt === 'gesehen' && x.quelle && !/^selbst/i.test(x.quelle)) fehler.push(wx + ': Selbst Gesehenes nennt keine Quelle; von jemandem Erzähltes ist „von X“.');
        // Quelle: jemand oder etwas, das der übrige Spielstand nennt oder das selbst einen Eintrag hat
        else if (typeof x.quelle === 'string' && typeof h.nNamen === 'string') {
          x.quelle.split(/,\s*|\s+und\s+/).forEach(function (teil) {
            teil = teil.trim();
            if (!teil || /^selbst/i.test(teil)) return;
            if (!h.kommtVor(h.nNamen, teil) && !byName[stichwort(teil)]) fehler.push(wx + ': Quelle „' + teil + '“ steht weder im übrigen Spielstand noch als Eintrag im Glossar.');
          });
        }
        if (typeof x.tag === 'number' && x.tag > heute) fehler.push('Lore: ' + wx + ': Tag ' + x.tag + ' liegt nach heute (Tag ' + heute + ').');
        if (typeof x.tag === 'number' && x.tag < 1) fehler.push(wx + ': Tag ' + x.tag + ' gibt es nicht.');
      });
      (e.siehe || []).forEach(function (s) {
        if (typeof s !== 'string') return;
        if (stichwort(s) === n) fehler.push(wo + ': verweist auf sich selbst.');
        else if (!byName[stichwort(s)] && !D.auszug) fehler.push(wo + ': „siehe“ nennt „' + s + '“, das es im Glossar nicht gibt.');
      });
      if (typeof e.ort === 'string' && karte && !orteNamen[stichwort(e.ort)]) fehler.push(wo + ': „Ort: ' + e.ort + '“ kommt in den Kartendaten nicht vor.');
      if (e.art === 'ort' && karte && !orteNamen[n] && !(e.namen || []).some(function (x) { return !!orteNamen[stichwort(x)]; })) hinweise.push(wo + ': Ort ohne Stelle auf der Karte. Fehlt die Lage noch, ist das richtig so.');
      if (e.art === 'ding' && inventar && dingNamen.indexOf(n) < 0 && !(e.namen || []).some(function (x) { return dingNamen.indexOf(stichwort(x)) >= 0; })) hinweise.push(wo + ': Ding ohne Stück im Gepäck. Verbraucht, abgegeben oder nur gesehen? Dann ist das richtig so.');
      (e.logbuch || []).forEach(function (t) { if (questlog && titel.indexOf(stichwort(t)) < 0) fehler.push(wo + ': „Logbuch: ' + t + '“, aber so heißt kein Auftrag in 02_questlog.md.'); });
    });
    // Spoilerwörter: Was in der Spoilerdatei steht und sonst nirgends im Spielstand, legt die Prüfung vor, damit ein
    // verirrter Name (ein Ort, eine Person aus der Spoilerdatei) beim Überfliegen auffällt. Kein Tor, weil das Glossar
    // eigenes Wissen trägt und viele harmlose Wörter mit der Spoilerdatei teilt.
    if (h.wSpoiler && h.wortschatz && h.quellen && typeof h.quellen.namenKorpus === 'string') {
      var wProper = h.wortschatz(h.quellen.namenKorpus), schon = {}, liste = [];
      E.forEach(function (e) {
        var texte = [e.kurz || ''].concat((e.wissen || []).map(function (x) { return x && x.text || ''; }));
        h.inhalt(texte.join(' ')).forEach(function (w) {
          if (schon[w] || !h.kennt(h.wSpoiler, w) || h.kennt(wProper, w)) return;
          schon[w] = true; liste.push(w + ' (' + e.name + ')');
        });
      });
      if (liste.length) hinweise.push('Wörter, die außer im Glossar nur in der Spoilerdatei stehen (auf verirrte Namen prüfen): ' + liste.join(', '));
    }
    // Hervorgehobene Begriffe der Spoilerdatei (fett oder in einer Überschrift) sind fast immer Namen: Personen, Orte,
    // Geheimnisse. Steht so ein Wort in einer Kurzzeile oder einem Posten und sonst nirgends im Spielstand, ist es ein
    // verirrter Spoiler, und das sperrt. Gewöhnliche Wörter sperren nicht, weil sie im Spielstand vorkommen.
    if (typeof q.spoiler === 'string' && h.wortschatz && h.inhalt && h.woerterVon && typeof q.namenKorpus === 'string') {
      var hervor = [];
      (q.spoiler.match(/\*\*([^*\n]+)\*\*/g) || []).forEach(function (t) { hervor.push(t.slice(2, -2)); });
      (q.spoiler.match(/^#{1,6}\s+.*$/gm) || []).forEach(function (t) { hervor.push(t.replace(/^#+\s+/, '')); });
      // Kurze Wörter nur wörtlich, längere auch gebeugt (wie bei spoilerWort)
      var wHervor = h.wortschatz(hervor.join('\n')), exakt = {};
      h.woerterVon(hervor.join('\n')).forEach(function (x) { exakt[x] = true; });
      E.forEach(function (e) {
        var texte = [e.kurz || ''].concat((e.wissen || []).map(function (x) { return x && x.text || ''; }));
        texte.forEach(function (t, k) {
          h.inhalt(t).forEach(function (w) {
            if ((exakt[w] || (w.length >= 6 && h.kennt(wHervor, w))) && wRest && !h.kennt(wRest, w)) fehler.push('Spoiler: Eintrag „' + (e.name || e.id) + '“' + (k ? ', Posten ' + k : ', Kurzzeile') + ': „' + w + '“ ist ein hervorgehobener Begriff der Spoilerdatei und steht sonst nirgends im Spielstand.');
          });
        });
      });
    }
    return { fehler: fehler, hinweise: hinweise };
  }

  // Dokumente für die Glossar-Seite (Artefakt mit Datenbank): je Eintrag ein Dokument glossar/<id>, dazu meta/glossar.
  // Die Seite liest beide Sammlungen und zeichnet daraus denselben Tisch.
  function alsDokumente(D) {
    var E = sichtbar(D), aus = [];
    E.forEach(function (e, i) {
      var d = { reihe: i, name: e.name, art: e.art, wissen: e.wissen.filter(gueltig) };
      ['kurz', 'haltung', 'gefahr', 'ort', 'post'].forEach(function (k) { if (e[k]) d[k] = e[k]; });
      ['namen', 'logbuch', 'siehe'].forEach(function (k) { if (e[k] && e[k].length) d[k] = e[k]; });
      if (e.spieler) d.spieler = true;
      aus.push({ sammlung: 'glossar', id: e.id, daten: d });
    });
    var meta = { titel: D.titel || 'Glossar', stand: D.stand || '', heute: D.heute, figur: D.figur || '', anzahl: E.length };
    if (typeof D.stufe === 'number') meta.stufe = D.stufe;
    aus.push({ sammlung: 'meta', id: 'glossar', daten: meta });
    return aus;
  }
  // Die Seite baut ihre Daten aus den Dokumenten wieder zusammen (auch die Prüfung kann das)
  function ausDokumenten(meta, docs) {
    var D = Object.assign({ titel: 'Glossar', eintraege: [] }, meta || {});
    delete D.anzahl;
    D.eintraege = (docs || []).slice().sort(function (a, b) { return (a.daten.reihe || 0) - (b.daten.reihe || 0); })
      .map(function (d) { return Object.assign({ id: d.id }, d.daten); });
    return D;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { zeichne: zeichne, ausText: ausText, alsText: alsText, alsAuszug: alsAuszug, alsDokumente: alsDokumente, ausDokumenten: ausDokumenten, sichtbar: sichtbar, stufeAus: stufeAus, SCHEMA: SCHEMA, zusatz: zusatz, version: VERSION };
    // Aufruf: node glossar.js --auszug <Name> 02_glossar.md   (Text des Auszugs)
    //         node glossar.js --json 02_glossar.md            (das gelesene Objekt, zum Nachsehen)
    //         node glossar.js --text daten.json               (Objekt → Text, etwa beim Umstellen)
    //         node glossar.js --db <ordner> 02_glossar.md     (Dokumente für die Glossar-Seite: <ordner>/glossar/<id>.json, <ordner>/meta/glossar.json)
    //         node glossar.js --liste 02_glossar.md           (Stichwortliste für den Spielstand: je Eintrag Name, Haltung, Zeichen und Kurzzeile)
    //         Die Seite mit dem Glossar ist das Spielerbuch: node seite/bauen.js --seite
    if (typeof require !== 'undefined' && require.main === module) {
      var fs = require('fs'), path = require('path'), args = process.argv.slice(2), was = args[0];
      if (was === '--seite') { console.error('Die Glossar-Seite ist jetzt das Spielerbuch: node seite/bauen.js --seite'); process.exit(2); }
      var datei = args[args.length - 1], roh = fs.readFileSync(datei, 'utf8');
      var jm = roh.match(/```json\s*([\s\S]*?)```/), D = jm || /^\s*\{/.test(roh) ? JSON.parse(jm ? jm[1] : roh) : null, P = D ? { D: D, probleme: [] } : ausText(roh);
      if (was === '--text') process.stdout.write(alsText(P.D));
      else if (was === '--json') { process.stdout.write(JSON.stringify(P.D, null, 1) + '\n'); if (P.probleme.length) console.error(P.probleme.join('\n')); }
      else if (was === '--liste') {
        var RUBRIK = { person: 'Personen', gruppe: 'Gruppen', ort: 'Orte', ding: 'Dinge', geruecht: 'Gerüchte' }, zeilen = [], vorher = '';
        sichtbar(P.D).forEach(function (e) {
          var r = RUBRIK[e.art] || e.art;
          if (r !== vorher) { zeilen.push('', '**' + r + ':**'); vorher = r; }
          zeilen.push('- ' + (e.spieler ? '🎭 ' : '') + e.name + (e.gefahr ? ' ' + (e.gefahr === 'toedlich' ? '☠️' : '🩸') : '') +
            (e.haltung && HALTUNG[e.haltung] ? ' (' + HALTUNG[e.haltung] + ')' : '') + (e.kurz ? ': ' + e.kurz.replace(/\.$/, '') : '') +
            (e.namen && e.namen.length ? ' · auch: ' + e.namen.join('; ') : ''));
        });
        process.stdout.write(zeilen.join('\n').replace(/^\n/, '') + '\n');
      }
      else if (was === '--auszug') { var A = alsAuszug(P.D, args[1]); if (!A) { console.error('Kein Eintrag „' + args[1] + '“.'); process.exit(1); } process.stdout.write(alsText(A)); }
      else if (was === '--db') {
        if (P.probleme.length) { console.error('Erst die Prüfung bestehen:\n' + P.probleme.join('\n')); process.exit(1); }
        var ordner = args[1], docs = alsDokumente(P.D);
        docs.forEach(function (d) {
          var dir = path.join(ordner, d.sammlung);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, d.id + '.json'), JSON.stringify(d.daten, null, 1) + '\n');
        });
        process.stdout.write(docs.map(function (d) { return d.sammlung + '/' + d.id; }).join('\n') + '\n');
        console.error(docs.length + ' Dokumente in ' + ordner + ' (' + (docs.length - 1) + ' Einträge, 1 meta). Einspielen: ArtifactData batch, je Dokument set mit file_path; bestehende Dokumente mit if_version aus einem list davor.');
      }
      else { console.error('Aufruf: node glossar.js --auszug <Name>|--json|--text|--liste|--db <ordner> <02_glossar.md>'); process.exit(2); }
    }
  } else {
    // Im Browser: Haken für das Spielerbuch, das seine Daten aus der Datenbank holt und dann zeichnen lässt
    window.GLOSSAR_TISCH = { einbauen: einbauen, ausText: ausText, ausDokumenten: ausDokumenten, version: VERSION };
    (function warten(n) { if (!start() && n < 60) setTimeout(function () { warten(n + 1); }, 50); })(0);
  }
})();
