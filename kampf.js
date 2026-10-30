/*
 * Wegwart-Karte – Kampfkarte für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.6
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Kampfkarte: Keller des Siedehauses, Runde 2</h2>
 *   <div id="kampf">Kampfkarte lädt … Falls nicht, frag nach der Lage als Text.</div>
 *   <script>var KAMPF={nr:3, titel:'Keller des Siedehauses', runde:2, figur:'f', boden:[…], hoehe:[…], wesen:[…]}</script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/kampf.js';document.head.appendChild(s);</script>
 *
 * Raster: 36 × 12 Felder zu 1,5 m (Regelwerk 12.6), Spalten 1–36, Zeilen A–L. Die Karte zeigt nur, was die
 * Figur sieht. Seit 1.1 hat jedes Feld eine Höhenlage (`hoehe`, eine Ziffer je Feld, 1 = 1,5 m): Ebenen sind
 * getönt, Kanten tragen Schatten und Höhenschilder, Spielsteine über dem Boden eine Höhenmarke; Klettern kostet
 * je Ebene ein Feld extra, Treppen (`/`) nicht, Entfernungen zählen das größere Maß aus waagerecht und senkrecht.
 * Seit 1.2 (Stufe A der Vorbilder aus den Taktikspielen): die Waffen der Figur (`waffen`) zeichnen vom gewählten
 * Feld aus ein rotes Reichweitenquadrat, Gegner tragen `reichweite` und bedrohen Felder (gestrichelt, ein Tipp
 * auf den Gegner oder der Knopf „Gefahr“), der Weg warnt vor Gelegenheitsangriffen, eine Lagezeile nennt vor dem
 * Wurf Reichweite, Deckung, Vorteil und Nachteil mit Gründen (ohne SG und RK), eine Initiativleiste (`reihenfolge`)
 * zeigt, wer gehandelt hat und wer noch kommt, und der Kopf trägt Ziel, Uhren und Lage (`ziel`, `uhren`, `lage`).
 * Seit 1.3: jede Bodenart ist eine gezeichnete Kachel (Stein, Planken, Erde `e`, Gras `g`, Wasser, seichtes Wasser `,`,
 * Schlamm `m`, Eis `i`, Geröll, Dickicht `d`, Wand, Nebel), Höhe zeigt sich als Schatten auf das tiefere Feld (breiter
 * und dunkler je Ebene) und als hellere Fläche mit einem Schild je Ebene; Spielsteine tragen Wundringe und die Plaketten
 * der Zustände (`zustaende`, Wortschatz des Lagebilds 1.2: „ergibt sich“ ist die weiße Fahne); Waffen haben Modi
 * (`modi`: einhändig/beidhändig, Nahkampf/geworfen; ein Tipp auf die gewählte Waffe wechselt, Faust, zwei Fäuste,
 * Fadenkreuz), Zauber (`zauber`) eine eigene Zeile, ein Zauber `mit:'waffe'` nutzt die gewählte Waffe; der Pfeil
 * schickt den Zug (ohne Zielfeld bleibt die Figur stehen). Die Legende nennt nur, was auf der Karte vorkommt.
 * Seit 1.4: ein blauer Rahmen zeigt, wie weit die Figur in diesem Zug kommt (gestrichelt mit Spurt); vier Pfeile am
 * Kartenrand blättern, wo die Karte weitergeht; ein Tipp auf ein Wesen nennt, was die Figur über es weiß; Zauber mit
 * Rettungswurf (`rettung`, `sg`), Heilung (`heilung`) und Wirkung (`wirkung`) stehen in der Zauberzeile; „Aktion
 * zuerst“ dreht die Zugzeile um („Zauber: … auf Räuber 2, dann nach 13/C“); `tp: [jetzt, max]` der Figur im Kopf.
 * Seit 1.5 (Stufe B): Bonusaktionen der Figur (`bonus[]`: Healing Word, Bardische Inspiration, die Zweitwaffe) als eigener
 * Knopfblock, ein zweiter Tipp auf einen Stein wählt ihr Ziel, die Zugzeile hängt „· Bonusaktion: Healing Word auf Rolf (3 m)“
 * an; liegt die Figur, steht ein Schalter „Aufstehen“ in der Zugzeile (halbe Bewegung, hebt „du liegst“ auf, „steht auf ·“
 * vorn in der Zeile; ohne ihn kriecht sie); Gefolge und Unbeteiligte als Ziel bekommen einen Hinweis in der Lagezeile;
 * der Knopf „Warum?“ ist weg (die Sätze stehen als Tipp an der Lagezeile); der Kartenrahmen ist in der Höhe begrenzt,
 * damit die Pfeile auch nach oben und unten blättern.
 * Seit 1.6: Der Zug ist eine Folge von Schritten in der Reihenfolge der Tipps (PHB: die Bewegung darf beliebig geteilt
 * werden, Aktion und Bonusaktion stehen irgendwo dazwischen): jeder Tipp auf ein Feld ein Wegstück vom aktuellen Stand, ein
 * Tipp auf Waffe oder Zauber und dann auf einen Stein die Aktion von dort, eine Bonusaktion ebenso; Spurt und Rückzug sind
 * Aktionen (keine stillschweigende Verdoppelung mehr), weitere Aktionen ohne Ziel kommen aus `aktionen[]`; „Zurück“ nimmt den
 * letzten Schritt; ein Geisterstein steht am aktuellen Stand, die Wegstücke als Spur mit Stationen; die Zweitwaffe nur neben
 * der Angriffsaktion mit einer leichten Waffe (`waffen[].leicht`); unter der Karte in dieser Reihenfolge: Werkzeuge, Infozeile
 * (ohne Erklärtext, ohne Höhe in Worten), Lagezeile, Aktion, Bonusaktion, der Kasten „Zug“ mit der Folge, dem Freitext und
 * dem breiten Knopf „Zug abschicken“, zuletzt die Legende; die Knöpfe tragen das Zeichen ihrer Schadensart (dieselben 13
 * Umrisse wie der Würfelkasten); Rampen und Treppen bekommen einen leichten Schatten.
 * Der Spieler zieht seine Figur und schickt den Zug als „Kampf #nr · …“ per sendPrompt an die Spielleitung.
 * Alle Felder stehen in der README (Abschnitt „Kampf“).
 */
(function () {
  'use strict';

  var VERSION = '1.6';
  var Z = 30;      // Kantenlänge eines Felds in Kartenpunkten
  var RAND = 26;   // Rand für die Beschriftung, auf allen vier Seiten
  var METER = 1.5; // ein Feld, auch eine Höhenstufe
  var ZEILEN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var F = { tinte: '#3b3028', gold: '#b08d3a', rot: '#8e3b22', gruen: '#4d5b33', grau: '#76695a', braun: '#6b573f' };

  // Was ein Zeichen im Boden bedeutet. kosten 0: nicht betretbar. stufe: Treppe oder Rampe, Ebenenwechsel ohne Klettern.
  // Seit 1.3 trägt jede Art eine Kachel (`muster`, ein SVG-Muster) und manche einen Aufsatz (Tür, Treppe, Fass, Baum, Kreuz).
  var ARTEN = {
    '.': { name: 'Steinboden', kurz: 'Stein', kosten: 1, muster: 'stein' },
    '=': { name: 'Planken, Steg, Deck', kurz: 'Planken', kosten: 1, muster: 'holz' },
    'e': { name: 'Erde, Lehm, Weg', kurz: 'Erde', kosten: 1, muster: 'erde' },
    'g': { name: 'Gras, Wiese', kurz: 'Gras', kosten: 1, muster: 'gras' },
    '+': { name: 'Tür, Durchgang', kurz: 'Tür', kosten: 1, muster: 'stein', aufsatz: 'tuer' },
    '/': { name: 'Treppe, Rampe (eine Stufe hinauf ohne Klettern)', kurz: 'Treppe', kosten: 1, stufe: true, muster: 'stein', aufsatz: 'treppe' },
    '^': { name: 'erhöht (Ebene 1, alte Schreibweise)', kurz: 'erhöht', kosten: 1, erhoeht: true, muster: 'stein' },
    ':': { name: 'Geröll, Trümmer: schwieriges Gelände', kurz: 'Geröll', kosten: 2, muster: 'geroell' },
    'd': { name: 'Dickicht, Schilf: schwieriges Gelände', kurz: 'Dickicht', kosten: 2, muster: 'dickicht' },
    ',': { name: 'seichtes Wasser: schwieriges Gelände', kurz: 'seicht', kosten: 2, muster: 'seicht' },
    'm': { name: 'Schlamm: schwieriges Gelände', kurz: 'Schlamm', kosten: 2, muster: 'schlamm' },
    'i': { name: 'Eis: schwieriges Gelände, glatt', kurz: 'Eis', kosten: 2, muster: 'eis' },
    '~': { name: 'tiefes Wasser (schwimmen)', kurz: 'tiefes Wasser', kosten: 2, wasser: true, muster: 'wasser' },
    'o': { name: 'Fass, Kiste, Mauerrest, Brustwehr: halbe Deckung, drüber ist schwer', kurz: 'Fass: halbe Deckung', kosten: 2, deckung: 'halbe', muster: 'stein', aufsatz: 'fass' },
    'O': { name: 'Baum, Pfeiler, Karren: Dreiviertel-Deckung, nicht betretbar', kurz: 'Baum: Dreiviertel', kosten: 0, deckung: 'Dreiviertel-', muster: 'stein', aufsatz: 'baum' },
    '#': { name: 'Wand, Fels', kurz: 'Wand', kosten: 0, muster: 'wand' },
    'x': { name: 'Hindernis, unpassierbar', kurz: 'Hindernis', kosten: 0, muster: 'stein', aufsatz: 'kreuz' },
    '?': { name: 'nicht zu sehen', kurz: 'nicht zu sehen', kosten: 1, unbekannt: true, muster: 'nebel' },
    ' ': { name: 'nicht zu sehen', kurz: 'nicht zu sehen', kosten: 1, unbekannt: true, muster: 'nebel' }
  };
  // Die Kacheln: Grundfarbe und Zeichnung auf 36 × 36, kachelbar; die Karte skaliert sie auf Z
  var MUSTER = {
    stein: ['#d6cbb0', '<path d="M0 12H14V0M14 12V24H0M14 24H36M36 12H22V0M22 12V24M22 24V36M8 24V36" fill="none" stroke="#b9ab8c" stroke-width="1"/>'],
    holz: ['#caa66c', '<path d="M0 12H36M0 24H36" stroke="#8d6a3f" stroke-width="1.1"/><path d="M3 5q8 1 16-1M20 18q7-1 13 1M2 31q10 1 18-1" fill="none" stroke="#a9864f" stroke-width=".8" opacity=".8"/>'],
    erde: ['#c6b28c', '<circle cx="7" cy="9" r="1.2" fill="#9c845e"/><circle cx="24" cy="6" r=".9" fill="#9c845e"/><circle cx="17" cy="20" r="1.3" fill="#9c845e"/><circle cx="30" cy="27" r="1" fill="#9c845e"/><circle cx="8" cy="30" r=".9" fill="#9c845e"/>'],
    gras: ['#b7c585', '<path d="M6 30l2-7 2 7M20 14l2-7 2 7M28 32l2-6 2 6M12 18l1.5-5 1.5 5" fill="none" stroke="#6f8c3c" stroke-width="1.3" stroke-linecap="round"/>'],
    wasser: ['#5c8db2', '<path d="M-2 10q5-4 10 0t10 0 10 0 10 0M-2 26q5-4 10 0t10 0 10 0 10 0" fill="none" stroke="#dbe9f2" stroke-width="1.3" opacity=".85"/>'],
    seicht: ['#9fc2d1', '<path d="M-2 14q5-3 10 0t10 0 10 0 10 0M-2 30q5-3 10 0t10 0 10 0 10 0" fill="none" stroke="#eef5f8" stroke-width="1.2" opacity=".9"/><circle cx="9" cy="24" r="1.2" fill="#8aa5a0" opacity=".8"/><circle cx="26" cy="6" r="1" fill="#8aa5a0" opacity=".8"/>'],
    schlamm: ['#8c7552', '<ellipse cx="11" cy="12" rx="6" ry="3.5" fill="#6d583c" opacity=".8"/><ellipse cx="26" cy="26" rx="7" ry="4" fill="#6d583c" opacity=".8"/><circle cx="28" cy="8" r="1.5" fill="#6d583c"/>'],
    eis: ['#dde9ef', '<path d="M4 6l10 9 8-4 9 12M14 15l-3 13" fill="none" stroke="#9ab7c8" stroke-width="1"/>'],
    geroell: ['#cdbf9f', '<path d="M4 10l5-4 6 3-3 5zM20 6l7-2 4 5-6 4zM8 24l6-3 5 4-4 6-7-2zM25 22l6 1 2 6-7 2z" fill="#a9977a" stroke="#7d6d55" stroke-width=".9" stroke-linejoin="round"/>'],
    dickicht: ['#8fa661', '<path d="M4 32q8-14 14-20M18 12q4 6 14-2M6 20q6-2 10 4M22 30q6-8 12-6" fill="none" stroke="#4e6a2f" stroke-width="1.6" stroke-linecap="round"/>'],
    wand: ['#4a3f33', '<path d="M0 12H36M0 24H36M12 0V12M26 0V12M6 12V24M20 12V24M30 12V24M12 24V36M26 24V36" fill="none" stroke="#6a5c4d" stroke-width="1.2"/>'],
    nebel: ['#8a8276', '<path d="M-4 4l8-8M0 16L16 0M8 28L28 8M20 36L36 20M32 40l8-8" stroke="#6f675c" stroke-width="2" opacity=".35"/>']
  };
  var AUFSATZ = {
    tuer: '<rect x="5" y="3" width="26" height="30" rx="2" fill="#7b5a34" stroke="#3b3028" stroke-width="1.2"/><path d="M12 3V33M24 3V33" stroke="#5a3f22" stroke-width="1"/><circle cx="27" cy="18" r="1.6" fill="#e8d08a"/>',
    treppe: '<rect x="4" y="5" width="28" height="26" fill="none" stroke="#3b3028" stroke-width="1" opacity=".5"/><path d="M4 11H32M4 18H32M4 25H32" stroke="#3b3028" stroke-width="1.8" opacity=".8"/>',
    fass: '<ellipse cx="18" cy="19" rx="11" ry="12" fill="#a98a5a" stroke="#4a3520" stroke-width="1.3"/><path d="M7 14h22M7 24h22" stroke="#4a3520" stroke-width="1.2"/><path d="M18 7v24" stroke="#4a3520" stroke-width=".8" opacity=".6"/>',
    baum: '<circle cx="18" cy="18" r="15" fill="#4f6b33" stroke="#2f4320" stroke-width="1.3"/><circle cx="13" cy="13" r="6" fill="#6b8a45" opacity=".9"/><circle cx="22" cy="20" r="5" fill="#3e5629" opacity=".8"/>',
    kreuz: '<path d="M7 7L29 29M29 7L7 29" stroke="#3b3028" stroke-width="3" stroke-linecap="round"/>'
  };
  function musterDefs() {
    var k = Z / 36;
    return '<defs>' + Object.keys(MUSTER).map(function (id) {
      return '<pattern id="kkM-' + id + '" patternUnits="userSpaceOnUse" width="' + Z + '" height="' + Z + '"><rect width="' + Z + '" height="' + Z + '" fill="' + MUSTER[id][0] + '"/><g transform="scale(' + k + ')">' + MUSTER[id][1] + '</g></pattern>';
    }).join('') + '</defs>';
  }
  // Ein Muster als kleines Bild für Legende und Auskunft (16 × 16)
  function kachelBild(c, gross) {
    var a = ARTEN[c] || ARTEN['?'], s = gross || 16;
    return '<svg class="kkKb" width="' + s + '" height="' + s + '" viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" fill="' + MUSTER[a.muster][0] + '"/>' + MUSTER[a.muster][1] + (a.aufsatz ? AUFSATZ[a.aufsatz] : '') + '</svg>';
  }
  var ART_WESEN = { figur: F.tinte, gefolge: F.gruen, gegner: F.rot, npc: F.grau, tier: F.braun };
  var ART_NAME = { figur: 'die Figur', gefolge: 'Gefolge, Gefährte', gegner: 'Gegner', npc: 'Unbeteiligte', tier: 'Tier' };

  /* Zustände mit fester Plakette (Lagebild 1.2, 28.10.2026): die Zustände des PHB 2014 und, was im Kampf sonst zählt. Eine runde
     Plakette am Rand des Spielsteins, dieselbe in Reihenfolge und Legende. Farbe nach Gruppe: Kontrolle violett, Sinne Tinte,
     Gift grün, Feuer rot, Haltung braun, Gutes gold und blau. Glyphen im Kasten −7…7, weiß. */
  var GR = { kontrolle: '#6b4a8f', sinne: '#3b3028', gift: '#4f7a3a', feuer: '#b8562a', haltung: '#7a6248', gut: '#a8801a', blau: '#2f4f70' };
  var STATUS = {
    'geblendet': [GR.sinne, 'Auge, durchgestrichen', 'M-4.6 0Q0-4.2 4.6 0Q0 4.2-4.6 0Z|c0,0,1.3|M-4 4L4-4'],
    'taub': [GR.sinne, 'Ohr, durchgestrichen', 'M-1.2 3.8C-3.6 3.8-3.8-4 0.4-4C3.4-4 3.6-0.6 1.2 0.4C0.2 0.9 0.4 2.6-1.2 3.8|M-4 4L4-4'],
    'unsichtbar': [GR.sinne, 'gestrichelter Kreis', 'd|M3.8 0A3.8 3.8 0 1 1-3.8 0A3.8 3.8 0 1 1 3.8 0'],
    'versteckt': [GR.sinne, 'geschlossenes Auge', 'M-4.6-0.6Q0 3.6 4.6-0.6|M-2.6 1.3l-0.9 1.5M0 2v1.8M2.6 1.3l0.9 1.5'],
    'vergiftet': [GR.gift, 'Tropfen', 'fM0-4.6C2.6-1.2 3.6 0.4 3.6 1.7A3.6 3.6 0 0 1-3.6 1.7C-3.6 0.4-2.6-1.2 0-4.6Z'],
    'brennt': [GR.feuer, 'Flamme', 'fM0-4.8C2.6-2.2 3.6-0.6 3.6 1.4A3.6 3.2 0 0 1-3.6 1.4C-3.6-0.6-2.2-1.2-1.2-3C-0.2-1.8 0.4-1.6 0-4.8Z'],
    'bezaubert': [GR.kontrolle, 'Herz', 'fM0 4C-5 0.4-4.6-4-1.8-4C-0.8-4 0-3 0-2.4C0-3 0.8-4 1.8-4C4.6-4 5 0.4 0 4Z'],
    'verängstigt': [GR.kontrolle, 'Ausrufezeichen', 'M0-4.2V1|c0,3.4,1'],
    'gepackt': [GR.kontrolle, 'zwei Ringe', 'M0.8 0A2.4 2.4 0 1 1-4 0A2.4 2.4 0 1 1 0.8 0|M4 0A2.4 2.4 0 1 1-0.8 0A2.4 2.4 0 1 1 4 0'],
    'festgesetzt': [GR.kontrolle, 'Netz', 'M-3.8-1.6H3.8M-3.8 1.6H3.8M-1.6-3.8V3.8M1.6-3.8V3.8'],
    'gelähmt': [GR.kontrolle, 'zwei Balken', 'w|M-1.7-3.6V3.6M1.7-3.6V3.6'],
    'betäubt': [GR.kontrolle, 'Spirale', 'M0.4 0.2A0.9 0.9 0 1 1-0.9-0.8A2.1 2.1 0 1 1 1.8 1.6A3.5 3.5 0 1 1 3.4-2'],
    'kampfunfähig': [GR.kontrolle, 'Kreis, durchgestrichen', 'M3.8 0A3.8 3.8 0 1 1-3.8 0A3.8 3.8 0 1 1 3.8 0|M-2.7 2.7L2.7-2.7'],
    'bewusstlos': [GR.kontrolle, 'Zz', 'M-4-3.4H0.6L-4 1H0.6|M1.2 0.4H4L1.2 3.6H4'],
    'versteinert': [GR.haltung, 'Stein', 'fM-3.8-1.2L-1.2-4L2.8-3.2L4 0.8L1.2 4L-3 3.2Z'],
    'liegend': [GR.haltung, 'liegende Gestalt', 'c-3,0.4,1.3|M-1.4 0.6H3.8|M-4.4 2.8H4.4'],
    'ergibt sich': [GR.haltung, 'weiße Fahne', 'M-3 4.4V-4.4|fM-3-4.2H3.6L2-2.3L3.6-0.4H-3Z'],
    'flieht': [GR.haltung, 'Pfeil fort', 'M-3.8 0H3.2M0.4-3L3.4 0L0.4 3'],
    'konzentriert': [GR.blau, 'Ziel', 'M3.8 0A3.8 3.8 0 1 1-3.8 0A3.8 3.8 0 1 1 3.8 0|c0,0,1.4'],
    'inspiriert': [GR.gut, 'Note', 'M1.6-4.2V2.2|c-0.2,2.5,1.7|M1.6-4.2Q4-3.2 3.6-0.8']
  };
  var WEHRLOS = ['bewusstlos', 'gelähmt', 'betäubt', 'kampfunfähig', 'versteinert'];      // Angriffe mit Vorteil, aus 1,5 m kritisch (PHB)
  var HARMLOS = WEHRLOS.concat(['ergibt sich', 'flieht']);                                 // bedroht kein Feld
  // Legacy: Wörter in `zustand`, die seit 1.3 Plaketten sind
  var ZUSTAND_WORTE = [[/boden|liegt|gestürzt|liegend/, 'liegend'], [/bewusstlos|ohnmächtig|schläft/, 'bewusstlos'], [/ergibt/, 'ergibt sich'], [/flieht|flucht/, 'flieht'],
    [/gelähmt/, 'gelähmt'], [/betäubt/, 'betäubt'], [/versteinert/, 'versteinert'], [/vergiftet/, 'vergiftet'], [/brennt/, 'brennt'], [/geblendet/, 'geblendet'],
    [/gepackt/, 'gepackt'], [/festgesetzt/, 'festgesetzt'], [/verängstigt/, 'verängstigt'], [/bezaubert/, 'bezaubert'], [/kampfunfähig/, 'kampfunfähig'],
    [/konzentriert/, 'konzentriert'], [/inspiriert/, 'inspiriert'], [/unsichtbar/, 'unsichtbar'], [/versteckt/, 'versteckt'], [/\btaub/, 'taub']];
  function r1(v) { return Math.round(v * 10) / 10; }
  // Eine Plakette mit Ikone: Mitte cx, cy, Radius r
  function plakette(key, cx, cy, r) {
    var S0 = STATUS[key]; if (!S0) return '';
    var k = r / 7, out = '<g class="kkPl" transform="translate(' + r1(cx) + ' ' + r1(cy) + ') scale(' + Math.round(k * 100) / 100 + ')"><title>' + esc(key) + '</title>' +
      '<circle r="7" fill="' + S0[0] + '" stroke="#f7efdc" stroke-width="1.3"/>', strich = '', breit = 1.4;
    S0[2].split('|').forEach(function (teil) {
      if (teil === 'd') { strich = ' stroke-dasharray="2 1.6"'; return; }
      if (teil === 'w') { breit = 2; return; }
      if (teil[0] === 'c') { var c = teil.slice(1).split(','); out += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#fff"/>'; return; }
      if (teil[0] === 'f') { out += '<path d="' + teil.slice(1) + '" fill="#fff"/>'; return; }
      out += '<path d="' + teil + '" fill="none" stroke="#fff" stroke-width="' + breit + '" stroke-linecap="round" stroke-linejoin="round"' + strich + '/>';
    });
    return out + '</g>';
  }
  function plaketteBild(key, s) { return '<svg class="kkKb" width="' + (s || 16) + '" height="' + (s || 16) + '" viewBox="-8 -8 16 16" aria-hidden="true">' + plakette(key, 0, 0, 7) + '</svg>'; }
  // Die Zeichen der Waffenmodi am Knopf: eine Faust (einhändig, Nahkampf), zwei Fäuste (beidhändig), ein Fadenkreuz (geworfen, Schuss)
  // Faust von der Seite als Umriss (seit 1.4): drei Knöchel oben, der Daumen als Bogen über den Fingern, nur Linien
  var FAUST = '<path d="M1.6 9.6V12.4A1.8 1.8 0 0 0 3.4 14.2H12.2A2.2 2.2 0 0 0 14.4 12V6.6A2.1 2.1 0 0 0 10.2 6.6A2.1 2.1 0 0 0 6 6.6V8.6A1.7 1.7 0 0 0 2.6 8.6Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>' +
    '<path d="M3.2 10.6H8.4A1.6 1.6 0 0 1 8.4 13.8H4.2M10.2 6.6V9.4M6 8.6V9.6" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>';
  var MODUS_BILD = {
    faust: [16, FAUST],
    faeuste: [26, '<g transform="translate(-0.4 1) scale(.86)">' + FAUST + '</g><g transform="translate(12.2 1) scale(.86)">' + FAUST + '</g>'],
    kreuz: [16, '<circle cx="8" cy="8" r="4.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.2V5M8 11v3.8M1.2 8H5M11 8h3.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/>']
  };
  function modusBild(zeichen, name) {
    var b = MODUS_BILD[zeichen] || MODUS_BILD.faust;
    return '<svg class="kkMo" width="' + b[0] + '" height="16" viewBox="0 0 ' + b[0] + ' 16" role="img" aria-label="' + esc(name || zeichen) + '">' + b[1] + '</svg>';
  }
  var PFEIL = '<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M3 11h14M11 4.5L17.5 11 11 17.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  /* Die Zeichen der Schadensarten (seit 1.6): dieselben 13 Umrisse, die der Würfelkasten je Schadensart zeigt (wegwart-wuerfel,
     wuerfel.js, Stand 3d5d64a805af778d4cb382d64f896f12b0af4415, `FX`: Tabler Icons flame, snowflake, bolt, volume, droplet, flask,
     ghost, sun, brain, atom, sword, arrow-narrow-right, hammer; MIT-Lizenz, https://tabler.io/icons), als Strichbilder 24 × 24,
     Strich 2, runde Enden, in Tintenfarbe wie die Zeichen von seite/zeichen.js. Dazu Zeichen für Rettungswurf (shield), Heilung
     (heart), Inspiration (music), Wirkung (sparkles), Spurt (run), Rückzug (arrow-back-up), eine freie Aktion (hand-stop) und
     unbekannte Schadensarten (swords). */
  var ZEICHEN = {
    'feuer': ['M12 10.941c2.333 -3.308 .167 -7.823 -1 -8.941c0 3.395 -2.235 5.299 -3.667 6.706c-1.43 1.408 -2.333 3.294 -2.333 5.588c0 3.704 3.134 6.706 7 6.706c3.866 0 7 -3.002 7 -6.706c0 -1.712 -1.232 -4.403 -2.333 -5.588c-2.084 3.353 -3.257 3.353 -4.667 2.235'],
    'kälte': ['M10 4l2 1l2 -1', 'M12 2v6.5l3 1.72', 'M17.928 6.268l.134 2.232l1.866 1.232', 'M20.66 7l-5.629 3.25l.01 3.458', 'M19.928 14.268l-1.866 1.232l-.134 2.232', 'M20.66 17l-5.629 -3.25l-2.99 1.738', 'M14 20l-2 -1l-2 1', 'M12 22v-6.5l-3 -1.72', 'M6.072 17.732l-.134 -2.232l-1.866 -1.232', 'M3.34 17l5.629 -3.25l-.01 -3.458', 'M4.072 9.732l1.866 -1.232l.134 -2.232', 'M3.34 7l5.629 3.25l2.99 -1.738'],
    'blitz': ['M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11'],
    'schall': ['M15 8a5 5 0 0 1 0 8', 'M17.7 5a9 9 0 0 1 0 14', 'M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5'],
    'säure': ['M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0c2.602 -2.105 3.262 -5.708 1.566 -8.546l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546'],
    'gift': ['M9 3l6 0', 'M10 9l4 0', 'M10 3v6l-4 11a.7 .7 0 0 0 .5 1h11a.7 .7 0 0 0 .5 -1l-4 -11v-6'],
    'nekrotisch': ['M5 11a7 7 0 0 1 14 0v7a1.78 1.78 0 0 1 -3.1 1.4a1.65 1.65 0 0 0 -2.6 0a1.65 1.65 0 0 1 -2.6 0a1.65 1.65 0 0 0 -2.6 0a1.78 1.78 0 0 1 -3.1 -1.4v-7', 'M10 10l.01 0', 'M14 10l.01 0', 'M10 14a3.5 3.5 0 0 0 4 0'],
    'gleißend': ['M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', 'M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7'],
    'psychisch': ['M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8', 'M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8', 'M17.5 16a3.5 3.5 0 0 0 0 -7h-.5', 'M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0', 'M6.5 16a3.5 3.5 0 0 1 0 -7h.5', 'M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10'],
    'energie': ['M12 12v.01', 'M19.071 4.929c-1.562 -1.562 -6 .337 -9.9 4.243c-3.905 3.905 -5.804 8.337 -4.242 9.9c1.562 1.561 6 -.338 9.9 -4.244c3.905 -3.905 5.804 -8.337 4.242 -9.9', 'M4.929 4.929c-1.562 1.562 .337 6 4.243 9.9c3.905 3.905 8.337 5.804 9.9 4.242c1.561 -1.562 -.338 -6 -4.244 -9.9c-3.905 -3.905 -8.337 -5.804 -9.9 -4.242'],
    'hieb': ['M20 4v5l-9 7l-4 4l-3 -3l4 -4l7 -9l5 0', 'M6.5 11.5l6 6'],
    'stich': ['M5 12l14 0', 'M15 16l4 -4', 'M15 8l4 4'],
    'wucht': ['M11.414 10l-7.383 7.418a2.091 2.091 0 0 0 0 2.967a2.11 2.11 0 0 0 2.976 0l7.407 -7.385', 'M18.121 15.293l2.586 -2.586a1 1 0 0 0 0 -1.414l-7.586 -7.586a1 1 0 0 0 -1.414 0l-2.586 2.586a1 1 0 0 0 0 1.414l7.586 7.586a1 1 0 0 0 1.414 0'],
    'rettung': ['M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3'],
    'heilung': ['M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572'],
    'inspiration': ['M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0', 'M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0', 'M9 17v-13h10v13', 'M9 8h10'],
    'wirkung': ['M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6'],
    'spurt': ['M11.007 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M4 17l5 1l.75 -1.5', 'M15 21v-4l-4 -3l1 -6', 'M7 12v-3l5 -1l3 3l3 1'],
    'rueckzug': ['M9 14l-4 -4l4 -4', 'M5 10h11a4 4 0 1 1 0 8h-1'],
    'aktion': ['M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5', 'M11 5.5v-2a1.5 1.5 0 1 1 3 0v8.5', 'M14 5.5a1.5 1.5 0 0 1 3 0v6.5', 'M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47'],
    'schaden': ['M21 3v5l-11 9l-4 4l-3 -3l4 -4l9 -11l5 0', 'M5 13l6 6', 'M14.32 17.32l3.68 3.68l3 -3l-3.365 -3.365', 'M10 5.5l-2 -2.5h-5v5l3 2.5']
  };
  var SCHADENSARTEN = ['feuer', 'kälte', 'blitz', 'schall', 'säure', 'gift', 'nekrotisch', 'gleißend', 'psychisch', 'energie', 'hieb', 'stich', 'wucht'];
  // Das Zeichen zu einer Schadensart („Hieb“, „gleißend“), oder eines der übrigen (`rettung`, `heilung`, …); unbekannte Arten: gekreuzte Klingen
  function zeichenVon(typ) { var t = String(typ || '').toLowerCase(); return ZEICHEN[t] ? t : t ? 'schaden' : ''; }
  function zeichenBild(key, name) {
    var p = ZEICHEN[key]; if (!p) return '';
    return '<svg class="kkZc" width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="' + esc(name || key) + '" data-z="' + esc(key) + '">' +
      p.map(function (d) { return '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'; }).join('') + '</svg>';
  }
  // Das Zeichen einer wirksamen Waffe oder eines Zaubers: die Schadensart, sonst Heilung, Rettungswurf, Wirkung
  function waffenZeichen(e) {
    if (!e) return '';
    if (e.typ) return zeichenVon(e.typ);
    if (e.heilung) return 'heilung';
    if (e.rettung) return 'rettung';
    return 'wirkung';
  }

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function m(felder) { var v = felder * METER; return (Math.round(v * 2) / 2).toString().replace('.', ',') + ' m'; }
  function feldName(D, x, y) { return (D._ux + x - 1) + '/' + (ZEILEN[(D._uy + y - 2) % 26] || '?'); }

  function lies(D) {
    var sp = Math.max(1, Math.min(60, +D.spalten || 36)), ze = Math.max(1, Math.min(26, +D.zeilen || 12));
    var zeilen = Array.isArray(D.boden) ? D.boden : [];
    var hz = Array.isArray(D.hoehe) ? D.hoehe : null;
    var raster = [], hoehen = [], rampen = [];
    for (var y = 1; y <= ze; y++) {
      var z = String(zeilen[y - 1] == null ? '' : zeilen[y - 1]), r = [], h = [], rz = [];
      var hzz = hz ? String(hz[y - 1] == null ? '' : hz[y - 1]) : '';
      for (var x = 1; x <= sp; x++) {
        var c = zeilen.length ? (z[x - 1] == null ? '?' : z[x - 1]) : '.';
        c = ARTEN[c] ? c : '?';
        var hc = hzz[x - 1], hv = 0, ra = false;
        if (hc >= '0' && hc <= '9') hv = +hc;
        else if (hc >= 'a' && hc <= 'j') { hv = hc.charCodeAt(0) - 97; ra = true; }
        if (ARTEN[c].erhoeht && hv < 1) hv = 1;
        r.push(c); h.push(hv); rz.push(ra);
      }
      raster.push(r); hoehen.push(h); rampen.push(rz);
    }
    var u = Array.isArray(D.ursprung) ? D.ursprung : [1, 'A'];
    D._ux = Math.max(1, +u[0] || 1);
    D._uy = Math.max(1, ZEILEN.indexOf(String(u[1] || 'A').toUpperCase()) + 1 || 1);
    var wesen = (D.wesen || []).filter(function (w) { return w && w.name && isFinite(w.x) && isFinite(w.y); }).map(function (w, i) {
      var k = {}; Object.keys(w).forEach(function (s) { k[s] = w[s]; });
      k.x = +w.x; k.y = +w.y; k.groesse = Math.max(1, Math.min(4, +w.groesse || 1)); k._i = i;
      k.art = ART_WESEN[k.art] ? k.art : 'npc';
      if (!k.kurz) k.kurz = String(k.name).split(/[\s-]+/).filter(function (t) { return t && !/^(der|die|das|des|dem|den|ein|eine|eines|einer|von|vom|zur|zum|am|im|mit|aus|the|of)$/i.test(t); })
        .map(function (t) { return t[0] || ''; }).join('').toUpperCase().slice(0, 3) || '?';
      // seit 1.2: Reichweite in Feldern (Standard 1,5 m, ein Feld) und die Waffen der Figur; seit 1.3 Zauber, Zustände mit
      // Plakette (`zustaende`, feste Wörter; Wörter in `zustand` werden erkannt) und die Verwundung aus `zustand`
      k._r = felder(w.reichweite == null ? METER : w.reichweite);
      k.waffen = (Array.isArray(w.waffen) ? w.waffen : []).map(waffeInfo).filter(function (x) { return !!x; });
      k.zauber = (Array.isArray(w.zauber) ? w.zauber : []).map(function (z) { var zi = waffeInfo(z); if (zi) { zi.zauber = true; zi.mit = z && z.mit === 'waffe'; } return zi; }).filter(function (x) { return !!x; });
      // seit 1.5: die Bonusaktionen der Figur (`bonus[]`), die Zweitwaffe findet ihre Waffe in `waffen`
      k.bonus = (Array.isArray(w.bonus) ? w.bonus : []).map(function (b) { return bonusInfo(b, k.waffen); }).filter(function (x) { return !!x; });
      // seit 1.6: weitere Aktionen ohne Ziel (`aktionen[]`: Hilfe, Ausweichen, …); Spurt und Rückzug kennt die Karte selbst
      k.aktionen = (Array.isArray(w.aktionen) ? w.aktionen : []).map(aktionInfo).filter(function (x) { return !!x; });
      var zt = String(w.zustand || '').toLowerCase();
      k.zustaende = (Array.isArray(w.zustaende) ? w.zustaende : []).map(function (z) { return String(z).toLowerCase().trim(); }).filter(function (z, i, a) { return STATUS[z] && a.indexOf(z) === i; });
      ZUSTAND_WORTE.forEach(function (p) { if (p[0].test(zt) && k.zustaende.indexOf(p[1]) < 0) k.zustaende.push(p[1]); });
      k._wunde = /(^|[^a-zäöü])tot([^a-zäöü]|$)/.test(zt) ? 'tot' : /schwer verletzt|schwer verwundet|sterbend|angeschlagen schwer/.test(zt) ? 'schwer' : /verwundet|verletzt|blut|angeschlagen/.test(zt) ? 'angeschlagen' : '';
      // seit 1.4: Trefferpunkte (`tp: [jetzt, max]` oder `tp` und `tpMax`), für die Figur im Kopf; die Wundstufe folgt daraus
      var tpa = Array.isArray(w.tp) ? [+w.tp[0], +w.tp[1]] : (isFinite(+w.tp) && isFinite(+w.tpMax) ? [+w.tp, +w.tpMax] : null);
      if (tpa && isFinite(tpa[0]) && tpa[1] > 0) {
        k._tp = [Math.max(0, tpa[0]), tpa[1]];
        if (!k._wunde) k._wunde = k._tp[0] <= 0 ? '' : k._tp[0] * 4 <= k._tp[1] ? 'schwer' : k._tp[0] * 2 <= k._tp[1] ? 'angeschlagen' : '';
        if (k._tp[0] <= 0 && k.zustaende.indexOf('bewusstlos') < 0 && k._wunde !== 'tot') k.zustaende.push('bewusstlos');
      }
      return k;
    });
    var figur = null;
    wesen.forEach(function (w) { if (!figur && (w.id === D.figur || (!D.figur && w.art === 'figur'))) figur = w; });
    if (figur) figur.art = 'figur';
    return { sp: sp, ze: ze, raster: raster, hoehen: hoehen, rampen: rampen, wesen: wesen, figur: figur, ux: D._ux, uy: D._uy };
  }

  // Höhenlage eines Felds (0, wenn außerhalb) und eines Wesens (sein Ankerfeld)
  function hoehe(K, x, y) {
    if (!K || !K.hoehen || x < 1 || y < 1 || y > K.ze || x > K.sp) return 0;
    return K.hoehen[y - 1][x - 1] || 0;
  }
  function hoeheVon(K, w) { return w && isFinite(w.x) && isFinite(w.y) ? hoehe(K, w.x, w.y) : 0; }
  // Rampe oder Treppe: ein Schritt von einer Nachbarebene (eine Stufe hinauf oder hinab) kostet dort nichts extra
  function istStufe(K, x, y) {
    if (!K || x < 1 || y < 1 || y > K.ze || x > K.sp) return false;
    var a = ARTEN[K.raster[y - 1][x - 1]];
    return !!((a && a.stufe) || (K.rampen && K.rampen[y - 1][x - 1]));
  }
  // Was ein Schritt an Höhe bedeutet: klettern (Ebenen hinauf, zu bezahlen), sprung (Ebenen hinab ohne Treppe), sonst 0
  function schritt(K, fx, fy, x, y) {
    var dh = hoehe(K, x, y) - hoehe(K, fx, fy);
    if (!dh) return { klettern: 0, sprung: 0 };
    var sanft = Math.abs(dh) === 1 && (istStufe(K, fx, fy) || istStufe(K, x, y));
    if (dh > 0) return { klettern: sanft ? 0 : dh, sprung: 0 };
    return { klettern: 0, sprung: (sanft || dh === -1) ? 0 : -dh };
  }

  function belegt(K) {
    var b = {};
    K.wesen.forEach(function (w) {
      for (var dx = 0; dx < w.groesse; dx++) for (var dy = 0; dy < w.groesse; dy++) b[(w.x + dx) + ',' + (w.y + dy)] = w;
    });
    return b;
  }

  // Dijkstra über das Raster: Kosten in Feldern, Diagonale zählt wie gerade (PHB). Hinauf kostet je Ebene ein Feld
  // extra (Klettern: jeder Meter hoch ein Meter extra), außer eine Stufe über Rampe oder Treppe; hinab kostet nichts.
  // Liefert Entfernung und Weg. `von` ist die Figur oder (seit 1.6) ein Zwischenstand `{x, y, groesse, schwimmen, _figur}`
  // nach einem Wegstück; das Ausgangsfeld der Figur bleibt dann frei.
  function wege(K, von) {
    var sp = K.sp, ze = K.ze, b = belegt(K), dist = {}, vor = {}, offen = [];
    var schwimmt = !!(von.schwimmen);
    function kosten(fx, fy, x, y) {
      if (x < 1 || y < 1 || x > sp || y > ze) return 0;
      var a = ARTEN[K.raster[y - 1][x - 1]] || ARTEN['?'];
      var k = a.kosten;
      if (!k) return 0;
      if (a.wasser && schwimmt) k = 1;
      var w = b[x + ',' + y];
      if (w && w !== von && w !== von._figur) { if (w.art === 'gegner') return 0; if (w.art === 'tier' && !w.zahm) return 0; }
      k += schritt(K, fx, fy, x, y).klettern;
      return k;
    }
    var s = von.x + ',' + von.y;
    dist[s] = 0; offen.push([0, von.x, von.y]);
    while (offen.length) {
      offen.sort(function (p, q) { return p[0] - q[0]; });
      var e = offen.shift(), d = e[0], x = e[1], y = e[2];
      if (d > dist[x + ',' + y]) continue;
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        var nx = x + dx, ny = y + dy, k = kosten(x, y, nx, ny);
        if (!k) continue;
        var nd = d + k, key = nx + ',' + ny;
        if (dist[key] == null || nd < dist[key]) { dist[key] = nd; vor[key] = x + ',' + y; offen.push([nd, nx, ny]); }
      }
    }
    return { dist: dist, vor: vor, belegt: b };
  }
  function pfad(W, x, y) {
    var p = [], key = x + ',' + y;
    while (key) { var t = key.split(','); p.unshift([+t[0], +t[1]]); key = W.vor[key]; }
    return p;
  }
  // Was ein Weg an Höhe kostet: geklettert (Ebenen hinauf ohne Treppe) und der tiefste Sprung (zwei Ebenen oder mehr hinab ohne Treppe)
  function pfadHoehe(K, p) {
    var klettern = 0, sprung = 0;
    for (var i = 1; i < p.length; i++) {
      var a = p[i - 1], b = p[i], st = schritt(K, a[0], a[1], b[0], b[1]);
      klettern += st.klettern;
      sprung = Math.max(sprung, st.sprung);
    }
    return { klettern: klettern, sprung: sprung };
  }
  // Abstand Kante zu Kante in Feldern; mit K dreidimensional: das größere Maß aus waagerecht und senkrecht (PHB, Diagonale wie gerade)
  function abstand(a, b, K) {
    var best = Infinity;
    var ga = a.groesse || 1, gb = b.groesse || 1;
    for (var ax = 0; ax < ga; ax++) for (var ay = 0; ay < ga; ay++)
      for (var bx = 0; bx < gb; bx++) for (var by = 0; by < gb; by++)
        best = Math.min(best, Math.max(Math.abs(a.x + ax - b.x - bx), Math.abs(a.y + ay - b.y - by)));
    if (K) best = Math.max(best, Math.abs(hoeheVon(K, a) - hoeheVon(K, b)));
    return best;
  }
  function hoehenText(dh) { return (dh > 0 ? '+' : dh < 0 ? '−' : '') + m(Math.abs(dh)); }
  function feldNameK(K, x, y) { return ((K.ux || 1) + x - 1) + '/' + (ZEILEN[((K.uy || 1) + y - 2) % 26] || '?'); }
  function hochTief(dh) { return m(Math.abs(dh)) + (dh > 0 ? ' höher' : ' tiefer'); }
  function namen(liste) {
    var n = liste.map(function (w) { return w.name; });
    return n.length <= 1 ? n.join('') : n.slice(0, -1).join(', ') + ' und ' + n[n.length - 1];
  }

  /* ---------- Waffen, Reichweite, Gefahr und Deckung (seit 1.2) ---------- */
  // Meter in Felder: 1,5 m ist ein Feld; weniger zählt als ein Feld
  function felder(meter) { var v = +meter; return isFinite(v) && v > 0 ? Math.max(1, Math.round(v / METER)) : 1; }
  // Reichweite in Metern lesen: eine Zahl (Nahkampf, oder Zauber ohne lange Reichweite) oder [normal, lang] (Fernkampf)
  function reichweiteLesen(rw, fehlt) {
    var norm, lang = 0;
    if (Array.isArray(rw)) { norm = felder(rw[0]); lang = rw[1] ? felder(rw[1]) : 0; } else norm = felder(rw == null ? fehlt : rw);
    if (lang && lang <= norm) lang = 0;
    return { r: norm, rl: lang };
  }
  function zahl(v) { return isFinite(+v) && v !== '' && v != null ? +v : null; }
  // Das Zeichen eines Modus: eine Faust (einhändig, Nahkampf), zwei Fäuste (beidhändig), Fadenkreuz (geworfen, Schuss)
  function modusZeichen(mo) {
    if (mo.zeichen && /^(faust|faeuste|kreuz)$/.test(mo.zeichen)) return mo.zeichen;
    if (/beid|zwei|2h/i.test(mo.name)) return 'faeuste';
    if (/wurf|geworfen|schuss|schie|fern|ziel/i.test(mo.name) || Array.isArray(mo.reichweite)) return 'kreuz';
    return 'faust';
  }
  // Eine Waffe oder ein Angriffszauber der Figur: name, bonus, schaden, typ, reichweite; seit 1.3 dazu `modi[]`
  // (einhändig/beidhändig, Nahkampf/geworfen …), jeder Modus überschreibt, was er nennt; `modus` wählt vor (Index).
  function waffeInfo(w) {
    if (!w || !w.name) return null;
    var basis = { name: String(w.name), bonus: zahl(w.bonus), schaden: w.schaden ? String(w.schaden) : '', typ: w.typ ? String(w.typ) : '', reichweite: w.reichweite == null ? METER : w.reichweite, zauber: !!w.zauber,
      // seit 1.4: Zauber mit Rettungswurf (`rettung:'WEI'`, `sg`), Heilung und freie Wirkung als Text; seit 1.6 `leicht` (PHB: leichte Waffe, für die Zweitwaffe)
      rettung: w.rettung ? String(w.rettung).toUpperCase() : '', sg: zahl(w.sg), heilung: w.heilung ? String(w.heilung) : '', wirkung: w.wirkung ? String(w.wirkung) : '', leicht: w.leicht === true };
    var modi = (Array.isArray(w.modi) ? w.modi : []).filter(function (mo) { return mo && mo.name; }).map(function (mo) {
      var k = { name: String(mo.name), bonus: zahl(mo.bonus), schaden: mo.schaden ? String(mo.schaden) : '', typ: mo.typ ? String(mo.typ) : '', reichweite: mo.reichweite, zeichen: '' };
      k.zeichen = modusZeichen(k); return k;
    });
    basis.modi = modi; basis.modus = Math.max(0, Math.min(modi.length - 1, +w.modus || 0));
    var rw = reichweiteLesen(basis.reichweite, METER); basis.r = rw.r; basis.rl = rw.rl; basis.fern = !!rw.rl || rw.r > 2;
    return basis;
  }
  // Die wirksame Waffe: Basis mit dem gewählten Modus; für einen Zauber „mit Waffe“ (Zielsicherer Schlag) Reichweite und
  // Schaden der Waffe, Name, Bonus und Schadensart des Zaubers, wo er sie nennt
  function wirksam(wf, mi, mitWaffe) {
    if (!wf) return null;
    var e = { name: wf.name, bonus: wf.bonus, schaden: wf.schaden, typ: wf.typ, reichweite: wf.reichweite, zauber: wf.zauber, mit: !!wf.mit, leicht: !!wf.leicht,
      rettung: wf.rettung || '', sg: wf.sg == null ? null : wf.sg, heilung: wf.heilung || '', wirkung: wf.wirkung || '' };
    e.ohneWurf = !!(e.rettung || e.heilung || (e.zauber && e.bonus == null && !e.mit)); // kein Angriffswurf: Rettungswurf, Heilung, reine Wirkung
    var mo = wf.modi && wf.modi.length ? wf.modi[Math.max(0, Math.min(wf.modi.length - 1, mi == null ? wf.modus : mi))] : null;
    if (mo) {
      e.name = wf.name + ', ' + mo.name;
      if (mo.bonus != null) e.bonus = mo.bonus;
      if (mo.schaden) e.schaden = mo.schaden;
      if (mo.typ) e.typ = mo.typ;
      if (mo.reichweite != null) e.reichweite = mo.reichweite;
    }
    if (wf.mit && mitWaffe) {
      e.name = wf.name + ' mit ' + mitWaffe.name;
      if (e.bonus == null) e.bonus = mitWaffe.bonus;
      e.schaden = mitWaffe.schaden;
      if (!e.typ) e.typ = mitWaffe.typ;
      e.reichweite = mitWaffe.reichweite;
    }
    var rw = reichweiteLesen(e.reichweite, METER); e.r = rw.r; e.rl = rw.rl; e.fern = !!rw.rl || rw.r > 2;
    return e;
  }
  function bonusText(b) { return b == null ? '' : (b >= 0 ? '+' : '−') + Math.abs(b); }
  function waffeText(wf) {
    if (wf.rettung) return ' · Rettungswurf ' + wf.rettung + (wf.sg != null ? ' gegen SG ' + wf.sg : '') + (wf.schaden ? ' · ' + wf.schaden + (wf.typ ? ' ' + wf.typ : '') : '') + (wf.wirkung ? ' · ' + wf.wirkung : '');
    if (wf.heilung) return ' · ' + wf.heilung + ' Heilung' + (wf.wirkung ? ' · ' + wf.wirkung : '');
    return (wf.bonus != null ? ' ' + bonusText(wf.bonus) : '') + (wf.schaden ? ' · ' + wf.schaden : '') + (wf.typ ? ' ' + wf.typ : '') + (wf.wirkung ? ' · ' + wf.wirkung : '');
  }
  /* ---------- Bonusaktionen (seit 1.5, Stufe B) ---------- */
  // Eine Bonusaktion der Figur: `name`, `art` (`heilung`, `inspiration`, `waffe`, `frei`), `ziel` (ein Wort oder eine Liste aus
  // `gefolge`, `figur`, `gegner`, `npc`, `tier`, `jedes`, `keins`), `reichweite` in Metern (Standard 18, bei der Zweitwaffe die
  // der Waffe), bei `waffe` der Name der Zweitwaffe aus `waffen`, dazu `heilung` („2W4+2“) und `wirkung` als freier Text.
  var BONUS_ARTEN = { heilung: 1, inspiration: 1, waffe: 1, frei: 1 };
  var ZIEL_ARTEN = ['gefolge', 'figur', 'gegner', 'npc', 'tier', 'jedes', 'keins'];
  var ZIEL_NAME = { gefolge: 'Gefolge', figur: 'du selbst', gegner: 'Gegner', npc: 'Unbeteiligte', tier: 'Tiere', jedes: 'jedes Wesen, auch du selbst' };
  function bonusInfo(b, waffen) {
    if (!b || !b.name) return null;
    var art = BONUS_ARTEN[String(b.art)] ? String(b.art) : 'frei';
    var roh = Array.isArray(b.ziel) ? b.ziel : [b.ziel == null ? (art === 'waffe' ? 'gegner' : art === 'frei' ? 'keins' : 'jedes') : b.ziel];
    var ziele = roh.map(function (z) { return String(z).toLowerCase().trim(); }).filter(function (z, i, a) { return ZIEL_ARTEN.indexOf(z) >= 0 && a.indexOf(z) === i; });
    if (!ziele.length) ziele = ['keins'];
    var k = { name: String(b.name), art: art, ziele: ziele, heilung: b.heilung ? String(b.heilung) : '', wirkung: b.wirkung ? String(b.wirkung) : '',
      waffe: null, reichweite: b.reichweite, bonus: zahl(b.bonus), schaden: b.schaden ? String(b.schaden) : '', typ: b.typ ? String(b.typ) : '' };
    if (art === 'waffe') {
      var wn = String(b.waffe || b.name).toLowerCase();
      (waffen || []).forEach(function (w) { if (!k.waffe && w.name.toLowerCase() === wn) k.waffe = w; });
      if (k.waffe) {
        // der Nahkampf-Modus der Waffe, sonst die Waffe selbst; der Schaden der Zweitwaffe ohne Modifikator (PHB)
        var nah = k.waffe.modi.filter(function (mo) { return mo.reichweite == null || !Array.isArray(mo.reichweite); })[0] || null;
        if (k.bonus == null) k.bonus = nah && nah.bonus != null ? nah.bonus : k.waffe.bonus;
        if (!k.schaden) k.schaden = String((nah && nah.schaden) || k.waffe.schaden || '').replace(/\s*[+−-]\s*\d+\s*$/, '');
        if (!k.typ) k.typ = (nah && nah.typ) || k.waffe.typ;
        if (k.reichweite == null) k.reichweite = nah && nah.reichweite != null ? nah.reichweite : (Array.isArray(k.waffe.reichweite) ? k.waffe.reichweite[0] : k.waffe.reichweite);
        if (!k.wirkung) k.wirkung = 'Zweitwaffe: leichte Waffe in der anderen Hand, Schaden ohne Modifikator (PHB)';
      }
    }
    var rw = reichweiteLesen(k.reichweite, art === 'waffe' ? METER : 12 * METER); k.r = rw.r; k.rl = rw.rl;
    k.ohneZiel = ziele.indexOf('keins') >= 0;
    k.nurSelbst = !k.ohneZiel && ziele.length === 1 && ziele[0] === 'figur';
    return k;
  }
  // Darf das Wesen Ziel dieser Bonusaktion sein?
  function bonusErlaubt(bo, w, figur) {
    if (!bo || bo.ohneZiel || !w) return false;
    if (w === figur) return bo.ziele.indexOf('figur') >= 0 || bo.ziele.indexOf('jedes') >= 0;
    return bo.ziele.indexOf('jedes') >= 0 || bo.ziele.indexOf(w.art) >= 0;
  }
  function bonusZieleText(bo) { return bo.ziele.map(function (z) { return ZIEL_NAME[z] || z; }).join(', '); }
  function bonusWerte(bo) {
    if (bo.art === 'waffe') return (bo.bonus != null ? ' ' + bonusText(bo.bonus) : '') + (bo.schaden ? ' · ' + bo.schaden : '') + (bo.typ ? ' ' + bo.typ : '');
    return bo.heilung ? ' · ' + bo.heilung + ' Heilung' : '';
  }
  // Die Bonusaktion für die Zugzeile: „Bonusaktion: Healing Word auf Rolf (3 m)“, mit Ziel und Entfernung vom Standort
  function bonusZeile(K, bo, ziel, stand, figur) {
    var s = 'Bonusaktion: ' + bo.name + (bo.art === 'waffe' ? ' (Zweitwaffe)' : '');
    if (bo.ohneZiel) return s;
    if (!ziel) return s + ' (ohne Ziel)';
    if (ziel === figur) return s + ' auf dich selbst';
    var ab = abstand(stand, ziel, K), dh = hoeheVon(K, ziel) - hoeheVon(K, stand), weit = bo.rl || bo.r;
    s += ' auf ' + ziel.name;
    if (ab > weit) return s + ' (außer Reichweite: ' + m(ab) + ', ' + bo.name + ' reicht ' + m(weit) + ')';
    return s + ' (' + m(ab) + (dh ? ', ' + hochTief(dh) : '') + (bo.rl && ab > bo.r ? '; lange Reichweite' : '') + ')';
  }

  /* ---------- Aktionen ohne Ziel (seit 1.6) ---------- */
  // Eine Aktion der Figur aus `aktionen[]`: `name`, `wirkung` als freier Text, `zeichen` (ein Schlüssel aus ZEICHEN, sonst die Hand).
  // Spurt und Rückzug stehen nicht hier; die Karte kennt sie selbst (PHB: beide sind Aktionen).
  function aktionInfo(a) {
    if (!a || !a.name) return null;
    var z = String(a.zeichen || '').toLowerCase();
    return { name: String(a.name), wirkung: a.wirkung ? String(a.wirkung) : '', zeichen: ZEICHEN[z] ? z : 'aktion' };
  }

  function hatZustand(w, liste) { var z = w && w.zustaende || []; return liste.some(function (s) { return z.indexOf(s) >= 0; }); }
  // Wer wehrlos ist (bewusstlos, gelähmt, betäubt, kampfunfähig, versteinert, tot), wird mit Vorteil getroffen;
  // wer sich ergibt oder flieht, bedroht dazu kein Feld mehr
  function wehrlos(w) { return (w && w._wunde === 'tot') || hatZustand(w, WEHRLOS); }
  function kampffaehig(w) { return !(w && w._wunde === 'tot') && !hatZustand(w, HARMLOS); }
  function liegt(w) { return hatZustand(w, ['liegend']); }
  function gegnerAktiv(K) { return K.wesen.filter(function (w) { return w.art === 'gegner' && kampffaehig(w); }); }
  // Bedroht ein Wesen das Feld? Innerhalb seiner Reichweite, dreidimensional (PHB), die eigenen Felder nicht
  function bedroht(K, w, x, y) {
    if (!w || !isFinite(w.x) || !isFinite(w.y)) return false;
    for (var dx = 0; dx < w.groesse; dx++) for (var dy = 0; dy < w.groesse; dy++) if (w.x + dx === x && w.y + dy === y) return false;
    return abstand({ x: x, y: y, groesse: 1 }, w, K) <= (w._r || 1);
  }
  // Die Zone eines Wesens: alle betretbaren Felder, die es bedroht, als Schlüssel „x,y“ (Wände und Hindernisse nicht)
  function zone(K, w) {
    var z = {}, r = w._r || 1, g = w.groesse || 1;
    for (var y = Math.max(1, w.y - r); y <= Math.min(K.ze, w.y + g - 1 + r); y++)
      for (var x = Math.max(1, w.x - r); x <= Math.min(K.sp, w.x + g - 1 + r); x++)
        if ((ARTEN[K.raster[y - 1][x - 1]] || ARTEN['?']).kosten && bedroht(K, w, x, y)) z[x + ',' + y] = 1;
    return z;
  }
  // Welche Gegner ein Weg aus ihrer Reichweite heraus verlässt (Gelegenheitsangriff nach PHB), je Gegner einmal;
  // `schritt` ist der Index des Felds, auf dem die Figur die Zone verlässt
  function gelegenheiten(K, p) {
    var out = [];
    if (!p || p.length < 2) return out;
    gegnerAktiv(K).forEach(function (g) {
      for (var i = 1; i < p.length; i++) {
        if (bedroht(K, g, p[i - 1][0], p[i - 1][1]) && !bedroht(K, g, p[i][0], p[i][1])) { out.push({ wesen: g, schritt: i }); return; }
      }
    });
    return out;
  }
  // Felder, durch die die gerade Linie von Feldmitte zu Feldmitte läuft, ohne Anfang und Ende
  function linie(ax, ay, bx, by) {
    var out = [], seen = {}, n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 8;
    for (var i = 1; i < n; i++) {
      var t = i / n, x = Math.round(ax + (bx - ax) * t), y = Math.round(ay + (by - ay) * t), key = x + ',' + y;
      if ((x === ax && y === ay) || (x === bx && y === by) || seen[key]) continue;
      seen[key] = 1; out.push([x, y]);
    }
    return out;
  }
  // Das Feld eines (großen) Ziels, das dem Standort am nächsten liegt
  function naechstesFeld(von, ziel) {
    var best = null, bd = Infinity, g = ziel.groesse || 1;
    for (var dx = 0; dx < g; dx++) for (var dy = 0; dy < g; dy++) {
      var d = Math.max(Math.abs(ziel.x + dx - von.x), Math.abs(ziel.y + dy - von.y));
      if (d < bd) { bd = d; best = [ziel.x + dx, ziel.y + dy]; }
    }
    return best;
  }
  // Deckung des Ziels aus der Geometrie: Wand und Hindernis ganz (3), hohe Deckung Dreiviertel (2), niedrige Deckung und
  // Wesen dazwischen halb (1). Ein Vorschlag; die Spielleitung entscheidet nach PHB (Regelwerk 12.6).
  var DECKUNG_NAME = ['keine', 'halbe', 'Dreiviertel-', 'ganze'], DECKUNG_STERN = ['', '★', '★★', '★★★'], DECKUNG_RK = ['', '+2', '+5', ''];
  function deckung(K, von, ziel) {
    var zf = naechstesFeld(von, ziel), b = belegt(K), stufe = 0, grund = '';
    linie(von.x, von.y, zf[0], zf[1]).forEach(function (f) {
      var x = f[0], y = f[1];
      if (x < 1 || y < 1 || x > K.sp || y > K.ze) return;
      var c = K.raster[y - 1][x - 1], s = 0, g = '';
      if (c === '#' || c === 'x') { s = 3; g = c === '#' ? 'eine Wand' : 'ein Hindernis'; }
      else if (c === 'O') { s = 2; g = 'hohe Deckung'; }
      else if (c === 'o') { s = 1; g = 'niedrige Deckung'; }
      var w = b[x + ',' + y];
      if (w && w !== ziel && w.art !== 'figur' && s < 1) { s = 1; g = w.name; }
      if (s > stufe) { stufe = s; grund = g + ' bei ' + feldNameK(K, x, y); }
    });
    return { stufe: stufe, grund: grund, name: DECKUNG_NAME[stufe], stern: DECKUNG_STERN[stufe], rk: DECKUNG_RK[stufe] };
  }
  // Die Lage eines Angriffs vom Standort `stand` auf `ziel` mit der Waffe `wf`: Reichweite, Deckung, Vorteil und Nachteil
  // mit Gründen und einem Satz je Posten (`warum`). Hilfe für den Spieler, keine Regelentscheidung; SG und RK kommen
  // nicht vor. `liegtSelbst`: die Figur greift vom Boden aus an.
  function angriffsLage(K, stand, ziel, wf, liegtSelbst) {
    var ab = abstand(stand, ziel, K), flach = abstand(stand, ziel), dh = hoeheVon(K, ziel) - hoeheVon(K, stand);
    var L = { abstand: ab, dh: dh, status: 'aus', grund: '', vor: [], nach: [], warum: [], deckung: { stufe: 0, stern: '', name: 'keine' }, netto: 0, hinweis: '' };
    var weit = wf.rl || wf.r;
    // seit 1.5: Gefolge und Unbeteiligte als Ziel eines Angriffs bekommen einen Hinweis, kein Verbot (Regelwerk 16.2, 13)
    if (!wf.heilung && ziel.art === 'gefolge') { L.hinweis = 'dein eigener Mann'; L.warum.push('Hinweis: ' + ziel.name + ' gehört zu dir; die Karte verbietet es nicht, die Spielleitung erzählt die Folgen (Regelwerk 16.2).'); }
    else if (!wf.heilung && ziel.art === 'npc') { L.hinweis = 'ein Unbeteiligter'; L.warum.push('Hinweis: ' + ziel.name + ' ist unbeteiligt; wer blankzieht, eskaliert (Regelwerk 13).'); }
    if (ab <= wf.r) L.status = 'in'; else if (wf.rl && ab <= wf.rl) L.status = 'lang';
    var reichText = 'Reichweite: ' + wf.name + ' reicht ' + m(wf.r) + (wf.rl ? ', mit Nachteil bis ' + m(wf.rl) : '') + '; ' + ziel.name + ' ist ' + m(ab) + ' entfernt' + (dh ? ' (' + hochTief(dh) + ')' : '') + '.';
    L.warum.push(reichText);
    if (L.status === 'aus') {
      L.grund = (flach <= weit && Math.abs(dh) > weit) ? hochTief(dh) : m(ab) + ', ' + wf.name + ' reicht ' + m(weit);
      return L;
    }
    // seit 1.4: ohne Angriffswurf (Rettungswurf, Heilung, Wirkung) zählen nur Reichweite und Sichtlinie
    if (wf.ohneWurf) {
      var dk0 = deckung(K, stand, ziel);
      if (dk0.stufe === 3) { L.status = 'aus'; L.grund = 'keine Sichtlinie, ' + dk0.grund; L.warum.push('Ganze Deckung: ' + dk0.grund + ' liegt zwischen euch; ohne Sichtlinie kein Ziel (PHB).'); return L; }
      if (wf.rettung) L.warum.push('Kein Angriffswurf: ' + ziel.name + ' legt einen Rettungswurf auf ' + wf.rettung + (wf.sg != null ? ' gegen SG ' + wf.sg : '') + ' ab' + (dk0.stufe && wf.rettung === 'GES' ? '; Deckung gibt ' + dk0.rk + ' auf GES-Rettungswürfe (PHB)' : '') + '.');
      if (hatZustand(ziel, ['taub']) && wf.rettung) { L.nach.push('Ziel ist taub'); L.warum.push('Ein Ziel, das nicht hören kann, ist gegen Zauber mit Stimme meist im Vorteil oder gar nicht betroffen (PHB, je Zauber).'); }
      L.netto = L.nach.length ? -1 : 0;
      return L;
    }
    if (L.status === 'lang') { L.nach.push('lange Reichweite'); L.warum.push('Nachteil: Jenseits der normalen Reichweite trifft ein Fernkampfangriff mit Nachteil (PHB).'); }
    var nah = ab <= 1;
    if (liegt(ziel)) {
      if (nah) { L.vor.push('Ziel am Boden'); L.warum.push('Vorteil: Ein Ziel am Boden wird aus 1,5 m mit Vorteil getroffen (PHB).'); }
      else { L.nach.push('Ziel am Boden, aus der Ferne'); L.warum.push('Nachteil: Ein Ziel am Boden ist aus mehr als 1,5 m schwer zu treffen (PHB).'); }
    }
    if (wehrlos(ziel)) { L.vor.push('Ziel wehrlos'); L.warum.push('Vorteil: Ein bewusstloses oder gelähmtes Ziel wird mit Vorteil getroffen; ein Treffer aus 1,5 m ist kritisch (PHB).'); }
    if (wf.fern) {
      var neben = gegnerAktiv(K).filter(function (g) { return abstand(stand, g, K) <= 1; });
      if (neben.length) { L.nach.push('Gegner neben dir'); L.warum.push('Nachteil: Ein Fernkampfangriff mit einem Gegner in 1,5 m (' + namen(neben) + ') geht mit Nachteil (PHB).'); }
    }
    if (liegtSelbst) { L.nach.push('du liegst'); L.warum.push('Nachteil: Wer am Boden liegt, greift mit Nachteil an; aufstehen kostet die halbe Bewegung (PHB).'); }
    var dk = deckung(K, stand, ziel);
    L.deckung = dk;
    if (dk.stufe === 3) { L.status = 'aus'; L.grund = 'keine Sichtlinie, ' + dk.grund; L.warum.push('Ganze Deckung: ' + dk.grund + ' liegt zwischen euch; ohne Sichtlinie kein Ziel (PHB).'); return L; }
    if (dk.stufe) L.warum.push((dk.stufe === 2 ? 'Dreiviertel-Deckung: ' : 'Halbe Deckung: ') + dk.grund + ' liegt in der Linie; das gibt dem Ziel ' + dk.rk + ' auf RK und GES-Rettungswürfe. Die Spielleitung entscheidet (12.6).');
    if (L.vor.length && L.nach.length) { L.netto = 0; L.warum.push('Vorteil und Nachteil zugleich heben sich auf (PHB).'); }
    else L.netto = L.vor.length ? 1 : L.nach.length ? -1 : 0;
    return L;
  }
  // Die Lagezeile zum Angriff (HTML) und ihre Kurzform für die Zugzeile
  function lageText(L, wf, ziel) {
    var t = [(wf.zauber ? 'Zauber: ' : 'Angriff: ') + '<b>' + esc(wf.name) + '</b>' + esc(waffeText(wf))];
    var hw = L.hinweis ? ' <span class="kkHw">(' + esc(L.hinweis) + ')</span>' : '';
    if (L.status === 'aus') { t.push('<b>' + esc(ziel.name) + '</b>' + hw + ': außer Reichweite (' + esc(L.grund) + ')'); return t.join(' · '); }
    t.push('<b>' + esc(ziel.name) + '</b>' + hw + ': ' + m(L.abstand) + (L.dh ? ', ' + hochTief(L.dh) : '') + (L.status === 'lang' ? ' · lange Reichweite: Nachteil' : ' · in Reichweite'));
    if (wf.ohneWurf) { L.nach.forEach(function (v) { t.push(esc(v)); }); return t.join(' · '); }
    if (L.deckung.stufe) t.push(esc(L.deckung.name) + ' Deckung ' + L.deckung.stern);
    L.vor.forEach(function (v) { t.push('Vorteil: ' + esc(v)); });
    L.nach.forEach(function (v) { if (v !== 'lange Reichweite') t.push('Nachteil: ' + esc(v)); });
    if (L.vor.length && L.nach.length) t.push('hebt sich auf');
    return t.join(' · ');
  }
  function lageKurz(L, wf, ziel) {
    // seit 1.6 nennt auch „außer Reichweite“ die Waffe, denn die Aktion steht fest in der Folge
    if (L.status === 'aus') return (wf.zauber ? 'Zauber: ' : 'Angriff: ') + wf.name + ' auf ' + ziel.name + ' (außer Reichweite: ' + L.grund + ')';
    var k = [m(L.abstand) + (L.dh ? ', ' + hochTief(L.dh) : '')];
    if (wf.ohneWurf) {
      if (wf.rettung) k.push('Rettungswurf ' + wf.rettung + (wf.sg != null ? ' SG ' + wf.sg : ''));
      L.nach.forEach(function (v) { k.push(v); });
      return 'Zauber: ' + wf.name + ' auf ' + ziel.name + ' (' + k.join('; ') + ')';
    }
    if (L.status === 'lang') k.push('lange Reichweite');
    if (L.deckung.stufe) k.push(L.deckung.name + ' Deckung');
    L.vor.forEach(function (v) { k.push('Vorteil: ' + v); });
    L.nach.forEach(function (v) { if (v !== 'lange Reichweite') k.push('Nachteil: ' + v); });
    return (wf.zauber ? 'Zauber: ' : 'Angriff: ') + wf.name + ' auf ' + ziel.name + ' (' + k.join('; ') + ')';
  }

  /* ---------- Zeichnen ---------- */
  function px(x) { return RAND + (x - 1) * Z; }
  function py(y) { return RAND + (y - 1) * Z; }

  // Ein Feld: die Kachel seiner Art, darüber je Ebene ein hellerer Ton, dann der Aufsatz (Tür, Treppe, Fass, Baum, Kreuz)
  function feld(K, x, y) {
    var c = K.raster[y - 1][x - 1], a = ARTEN[c] || ARTEN['?'], h = hoehe(K, x, y), X = px(x), Y = py(y), out = [];
    out.push('<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" fill="url(#kkM-' + a.muster + ')"/>');
    if (h > 0 && !a.unbekannt && c !== '#') out.push('<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" class="kkHo" fill="#fff6dc" fill-opacity="' + Math.min(0.55, 0.16 * h) + '"/>');
    if (a.aufsatz) out.push('<g transform="translate(' + X + ' ' + Y + ') scale(' + (Math.round(Z / 36 * 1000) / 1000) + ')">' + AUFSATZ[a.aufsatz] + '</g>');
    return '<g id="kk' + x + '_' + y + '" data-x="' + x + '" data-y="' + y + '" data-h="' + h + '" class="kkF">' + out.join('') + '<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" class="kkK"/></g>';
  }

  // Kanten: wo ein Nachbarfeld höher liegt, fällt auf das tiefere Feld ein Schatten, das Leitzeichen der Höhe (seit 1.3):
  // breiter und tiefer je Höhenunterschied, in vier Stufen weich auslaufend, dazu eine Linie an der Kante; an Treppen
  // nur eine feine Linie. Ein Schild je zusammenhängender Fläche über dem Boden, in ihrer Mitte.
  function kanten(K, meiden) {
    var out = [], schilder = [];
    meiden = meiden || {};
    var SEITEN = [[0, -1, 'n'], [0, 1, 's'], [-1, 0, 'w'], [1, 0, 'e']];
    function sichtbar(x, y) { var c = K.raster[y - 1][x - 1]; return c !== '#' && c !== '?' && c !== ' ' && c !== 'x'; }
    for (var y = 1; y <= K.ze; y++) for (var x = 1; x <= K.sp; x++) {
      if (!sichtbar(x, y)) continue;
      var h = hoehe(K, x, y), X = px(x), Y = py(y);
      SEITEN.forEach(function (s) {
        var nx = x + s[0], ny = y + s[1];
        if (nx < 1 || ny < 1 || nx > K.sp || ny > K.ze || !sichtbar(nx, ny)) return;
        var dh = hoehe(K, nx, ny) - h;
        if (dh <= 0) return;
        var stufe = dh === 1 && (istStufe(K, x, y) || istStufe(K, nx, ny));
        var x1 = s[2] === 'e' ? X + Z : X, y1 = s[2] === 's' ? Y + Z : Y, x2 = s[2] === 'w' ? X : X + Z, y2 = s[2] === 'n' ? Y : Y + Z;
        if (stufe) {
          // seit 1.6: auch an Rampen und Treppen ein leichter Schatten (zwei schmale Streifen), damit die Höhe zu sehen ist; dazu die Stufenlinie
          var bs = 6, ts = s[2] === 's' || s[2] === 'e' ? 0.75 : 1, sts = [.16, .07];
          for (var j = 0; j < 2; j++) {
            var oj = j * bs / 2, wj = bs / 2, rj;
            if (s[2] === 'n') rj = [X, Y + oj, Z, wj]; else if (s[2] === 's') rj = [X, Y + Z - oj - wj, Z, wj]; else if (s[2] === 'w') rj = [X + oj, Y, wj, Z]; else rj = [X + Z - oj - wj, Y, wj, Z];
            out.push('<rect x="' + rj[0] + '" y="' + rj[1] + '" width="' + rj[2] + '" height="' + rj[3] + '" class="kkSch kkSchR" style="opacity:' + Math.round(sts[j] * ts * 100) / 100 + '"/>');
          }
          out.push('<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" class="kkSt"/>'); return;
        }
        // Licht von links oben: nach rechts und unten fällt der Schatten voll, nach links und oben etwas schwächer
        var b = Math.min(Z * 0.8, 7 + 5 * dh), tiefe = Math.min(1.6, 0.85 + 0.25 * dh) * (s[2] === 's' || s[2] === 'e' ? 0.75 : 1), st = [.36, .24, .13, .05];
        for (var i = 0; i < 4; i++) {
          var o = i * b / 4, w = b / 4, r;
          if (s[2] === 'n') r = [X, Y + o, Z, w]; else if (s[2] === 's') r = [X, Y + Z - o - w, Z, w]; else if (s[2] === 'w') r = [X + o, Y, w, Z]; else r = [X + Z - o - w, Y, w, Z];
          out.push('<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" class="kkSch" style="opacity:' + Math.round(Math.min(.5, st[i] * tiefe) * 100) / 100 + '"/>');
        }
        out.push('<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" class="' + (dh >= 2 ? 'kkKa' : 'kkKs') + '"/>');
      });
    }
    // Schilder: eines je zusammenhängender Fläche gleicher Ebene über dem Boden (Vierer-Nachbarschaft), in deren Mitte
    var gesehen = {};
    for (y = 1; y <= K.ze; y++) for (x = 1; x <= K.sp; x++) {
      var h0 = hoehe(K, x, y);
      if (!h0 || gesehen[x + ',' + y] || !sichtbar(x, y)) continue;
      var stapel = [[x, y]], flaeche = [];
      gesehen[x + ',' + y] = 1;
      while (stapel.length) {
        var f = stapel.pop(); flaeche.push(f);
        SEITEN.forEach(function (s) {
          var nx = f[0] + s[0], ny = f[1] + s[1], key = nx + ',' + ny;
          if (nx < 1 || ny < 1 || nx > K.sp || ny > K.ze || gesehen[key] || !sichtbar(nx, ny) || hoehe(K, nx, ny) !== h0) return;
          gesehen[key] = 1; stapel.push([nx, ny]);
        });
      }
      var sx = 0, sy = 0;
      flaeche.forEach(function (q) { sx += q[0]; sy += q[1]; });
      sx /= flaeche.length; sy /= flaeche.length;
      // das Feld nächst der Mitte, möglichst ohne Spielstein oder Notiz darauf
      var best = flaeche[0], bd = Infinity;
      flaeche.forEach(function (q) { var d = Math.abs(q[0] - sx) + Math.abs(q[1] - sy) + (meiden[q[0] + ',' + q[1]] ? 100 : 0); if (d < bd) { bd = d; best = q; } });
      var t = '+' + m(h0), w2 = t.length * 6.4 + 10, cx = px(best[0]) + Z / 2, cy = py(best[1]) + Z / 2;
      schilder.push('<g class="kkHs"><rect x="' + (cx - w2 / 2) + '" y="' + (cy - 7) + '" width="' + w2 + '" height="14" rx="4"/><text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle">' + esc(t) + '</text></g>');
    }
    return out.join('') + schilder.join('');
  }

  // Ein Spielstein: Kreis in der Farbe der Art, Kürzel, Wundring (gold angeschlagen, rot gestrichelt schwer verletzt, Kreuz tot),
  // Plaketten der Zustände am oberen Rand (bis drei, dann „+n“), blass bei bewusstlos und versteinert, Höhenmarke
  function wesenSvg(K, w) {
    var X = px(w.x), Y = py(w.y), g = w.groesse, cx = X + Z * g / 2, cy = Y + Z * g / 2, r = Z * g * 0.4;
    var farbe = ART_WESEN[w.art], out = [], h = hoeheVon(K, w), blass = w._wunde === 'tot' || hatZustand(w, ['bewusstlos', 'versteinert']);
    out.push('<g class="kkO kkA-' + w.art + (blass ? ' kkBlass' : '') + '" data-w="' + w._i + '">');
    if (w.art === 'figur') out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 3) + '" class="kkRing"/>');
    if (w._wunde === 'angeschlagen') out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 2.2) + '" class="kkWa"/>');
    if (w._wunde === 'schwer') out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 2.2) + '" class="kkWs"/>');
    out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + farbe + '" class="kkTok"/>');
    var schrift = Math.max(10, Math.min(16, r * (w.kurz.length > 2 ? 0.75 : 1)));
    out.push('<text x="' + cx + '" y="' + (cy + schrift * 0.36) + '" text-anchor="middle" font-size="' + schrift + '" class="kkTx">' + esc(w.kurz) + '</text>');
    if (w._wunde === 'tot') out.push('<path d="M' + (cx - r * 0.7) + ' ' + (cy - r * 0.7) + 'L' + (cx + r * 0.7) + ' ' + (cy + r * 0.7) + 'M' + (cx + r * 0.7) + ' ' + (cy - r * 0.7) + 'L' + (cx - r * 0.7) + ' ' + (cy + r * 0.7) + '" class="kkZu"/>');
    var zs = w.zustaende || [], pr = Math.max(5, r * 0.46), zeig = zs.length > 4 ? 3 : zs.length;
    for (var i = 0; i < zeig; i++) { var a = -Math.PI * 0.62 + i * 0.72; out.push(plakette(zs[i], cx + Math.cos(a) * (r + 1), cy + Math.sin(a) * (r + 1), pr)); }
    if (zs.length > 4) { var a2 = -Math.PI * 0.62 + 3 * 0.72, qx = cx + Math.cos(a2) * (r + 1), qy = cy + Math.sin(a2) * (r + 1); out.push('<g class="kkPl"><circle cx="' + r1(qx) + '" cy="' + r1(qy) + '" r="' + pr + '" fill="' + GR.sinne + '" stroke="#f7efdc" stroke-width="1.3"/><text x="' + r1(qx) + '" y="' + r1(qy + pr * 0.4) + '" text-anchor="middle" font-size="' + (pr * 1.1) + '" class="kkTx">+' + (zs.length - 3) + '</text></g>'); }
    if (h > 0) {
      var t = m(h), bw = t.length * 5.6 + 8, bx = X + Z * g - bw + 2, by = Y - 6;
      out.push('<g class="kkHm"><rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="12" rx="3"/><text x="' + (bx + bw / 2) + '" y="' + (by + 9) + '" text-anchor="middle">' + esc(t) + '</text></g>');
    }
    out.push('<title>' + esc(w.name) + (h > 0 ? ' · ' + m(h) + ' hoch' : '') + (w.zustand ? ' · ' + esc(w.zustand) : '') + (zs.length ? ' · ' + esc(zs.join(', ')) : '') + '</title></g>');
    return out.join('');
  }

  function zeichne(D) {
    var K = lies(D), sp = K.sp, ze = K.ze;
    var W = RAND * 2 + sp * Z, H = RAND * 2 + ze * Z, out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(D.titel || 'Kampfkarte') + '">');
    out.push('<style>' + SVG_CSS + '</style>' + musterDefs());
    out.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="6" class="kP"/>');
    out.push('<rect x="' + RAND + '" y="' + RAND + '" width="' + (sp * Z) + '" height="' + (ze * Z) + '" class="kkB"/>');
    // Felder
    for (var y = 1; y <= ze; y++) for (var x = 1; x <= sp; x++) out.push(feld(K, x, y));
    // Licht, seit 1.3 als Schein über den Kacheln
    (D.licht || []).forEach(function (l, i) {
      if (!isFinite(l.x) || !isFinite(l.y)) return;
      var cx = px(+l.x) + Z / 2, cy = py(+l.y) + Z / 2, hell = Math.max(0.5, +l.hell || 4), daemmer = Math.max(hell, +l.daemmer || hell * 2);
      out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (daemmer * Z) + '" class="kkLd"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (hell * Z) + '" class="kkLh"/>');
    });
    // Rasterlinien
    var g = '';
    for (var i = 0; i <= sp; i++) g += 'M' + px(i + 1) + ' ' + RAND + 'V' + (RAND + ze * Z);
    for (var j = 0; j <= ze; j++) g += 'M' + RAND + ' ' + py(j + 1) + 'H' + (RAND + sp * Z);
    out.push('<path d="' + g + '" class="kkG"/>');
    // Kanten und Höhenschilder; die Schilder meiden Felder mit Spielstein oder Notiz
    var meiden = {};
    (D.notizen || []).forEach(function (n) { if (n && isFinite(n.x) && isFinite(n.y)) { meiden[(+n.x) + ',' + (+n.y)] = 1; meiden[(+n.x - 1) + ',' + (+n.y)] = 1; meiden[(+n.x + 1) + ',' + (+n.y)] = 1; } });
    K.wesen.forEach(function (w) { for (var dx = 0; dx < w.groesse; dx++) for (var dy = 0; dy < w.groesse; dy++) meiden[(w.x + dx) + ',' + (w.y + dy)] = 1; });
    out.push('<g class="kkKan">' + kanten(K, meiden) + '</g>');
    // Beschriftung, oben und unten, links und rechts
    for (x = 1; x <= sp; x++) {
      out.push('<text x="' + (px(x) + Z / 2) + '" y="' + (RAND - 8) + '" text-anchor="middle" class="kkBe">' + (D._ux + x - 1) + '</text>');
      out.push('<text x="' + (px(x) + Z / 2) + '" y="' + (RAND + ze * Z + 17) + '" text-anchor="middle" class="kkBe">' + (D._ux + x - 1) + '</text>');
    }
    for (y = 1; y <= ze; y++) {
      var zb = ZEILEN[(D._uy + y - 2) % 26] || '?';
      out.push('<text x="' + (RAND - 8) + '" y="' + (py(y) + Z / 2 + 4.5) + '" text-anchor="end" class="kkBe">' + zb + '</text>');
      out.push('<text x="' + (RAND + sp * Z + 8) + '" y="' + (py(y) + Z / 2 + 4.5) + '" text-anchor="start" class="kkBe">' + zb + '</text>');
    }
    // Notizen als Schilder
    (D.notizen || []).forEach(function (n) {
      if (!n || !isFinite(n.x) || !isFinite(n.y) || !n.text) return;
      var t = String(n.text), w = t.length * 5.9 + 10, cx = px(+n.x) + Z / 2, cy = py(+n.y) + Z - 9;
      out.push('<g class="kkNo"><rect x="' + (cx - w / 2) + '" y="' + (cy - 7) + '" width="' + w + '" height="14" rx="4"/><text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle">' + esc(t) + '</text></g>');
    });
    out.push('<g class="kkBew"></g><g class="kkReich"></g><g class="kkWeg"></g><g class="kkZiel"></g>');
    // Wesen
    K.wesen.forEach(function (w) { out.push(wesenSvg(K, w)); });
    out.push('</svg>');
    return { svg: out.join(''), breite: W, hoehe: H, karte: K, legende: legendeHtml(K) };
  }

  // Kleine Bilder für die Legende: Höhe (heller, Schatten auf das tiefere Feld) und die Wundringe
  function hoeheBild() {
    return '<svg class="kkKb" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect width="16" height="16" fill="#d6cbb0"/><rect width="8" height="16" fill="#fff6dc" fill-opacity=".45"/>' +
      '<rect x="8" width="2" height="16" fill="#2a2119" fill-opacity=".4"/><rect x="10" width="2" height="16" fill="#2a2119" fill-opacity=".25"/><rect x="12" width="2" height="16" fill="#2a2119" fill-opacity=".12"/><path d="M8 0V16" stroke="#3b3028" stroke-width="1.2"/></svg>';
  }
  function ringBild(art) {
    var ring = art === 'angeschlagen' ? '<circle cx="8" cy="8" r="6.6" fill="none" stroke="#c48a2a" stroke-width="2"/>' :
      art === 'schwer' ? '<circle cx="8" cy="8" r="6.6" fill="none" stroke="#a3261c" stroke-width="2" stroke-dasharray="3 2"/>' : '';
    var kreuz = art === 'tot' ? '<path d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5" stroke="#f6efdd" stroke-width="1.8"/>' : '';
    return '<svg class="kkKb" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5" fill="' + F.rot + '"' + (art === 'tot' ? ' opacity=".6"' : '') + '/>' + ring + kreuz + '</svg>';
  }
  // Die Legende (seit 1.3 knapp): nur die Kacheln, Arten, Wunden und Zustände, die auf dieser Karte vorkommen, dazu die Markierungen
  function legendeHtml(K) {
    var da = {}, out = [];
    K.raster.forEach(function (r) { r.forEach(function (c) { da[c === ' ' ? '?' : c] = 1; }); });
    ['.', '=', 'e', 'g', '+', '/', '^', ':', 'd', ',', 'm', 'i', '~', 'o', 'O', '#', 'x', '?'].forEach(function (c) {
      if (da[c]) out.push('<span title="' + esc(ARTEN[c].name) + '">' + kachelBild(c) + ' ' + esc(ARTEN[c].kurz) + '</span>');
    });
    if (K.hoehen.some(function (r) { return r.some(function (h) { return h > 0; }); })) out.push('<span>' + hoeheBild() + ' höher: heller, mit Schatten auf das tiefere Feld (je Ebene 1,5 m; an Rampen und Treppen leicht)</span>');
    var arten = {}; K.wesen.forEach(function (w) { arten[w.art] = 1; });
    Object.keys(ART_WESEN).forEach(function (a) { if (arten[a]) out.push('<span><i class="kkLe" style="background:' + ART_WESEN[a] + '"></i> ' + ART_NAME[a] + '</span>'); });
    out.push('<span><i class="kkLe kkLeB"></i> Bewegung: der blaue Rahmen reicht, so weit die Figur vom aktuellen Stand noch kommt, gestrichelt mit Spurt (Felder gold getönt)</span>',
      '<span><i class="kkLe kkLeG"></i> Geisterstein: wo die Figur nach den Wegstücken steht; die Spur mit Stationen ist der Weg</span>',
      '<span><i class="kkLe kkLeR"></i> Reichweite der Waffe von dort; blasse Gegner außer Reichweite</span>',
      '<span><i class="kkLe kkLeZ"></i> bedroht: Reichweite eines Gegners (Tipp auf ihn, oder „Gefahr“)</span>',
      '<span><i class="kkLe kkLeO"></i> Gelegenheitsangriff beim Verlassen</span>');
    var wunden = {}, zust = {};
    K.wesen.forEach(function (w) { if (w._wunde) wunden[w._wunde] = 1; (w.zustaende || []).forEach(function (z) { zust[z] = 1; }); });
    if (wunden.angeschlagen) out.push('<span>' + ringBild('angeschlagen') + ' angeschlagen</span>');
    if (wunden.schwer) out.push('<span>' + ringBild('schwer') + ' schwer verletzt</span>');
    if (wunden.tot) out.push('<span>' + ringBild('tot') + ' tot</span>');
    Object.keys(STATUS).forEach(function (k) { if (zust[k]) out.push('<span>' + plaketteBild(k) + ' ' + esc(k) + '</span>'); });
    return out.join('');
  }

  var SVG_CSS =
    '.kP{fill:#efe2c3}[data-mode="dark"] .kP{fill:#d8c9a3}@media (prefers-color-scheme:dark){:root:not([data-mode]) .kP{fill:#d8c9a3}}' +
    '.kkB{fill:#f4ead0;opacity:.6}.kkG{fill:none;stroke:#3b3028;stroke-opacity:.28;stroke-width:.8}' +
    '.kkBe{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:13px;fill:#3b3028;opacity:.9}' +
    '.kkNo text{font-family:"EB Garamond",Georgia,serif;font-style:italic;font-size:11px;fill:#3b3028}.kkNo rect{fill:#f9f2de;fill-opacity:.92;stroke:#6b573f;stroke-width:.7}.kkNo{pointer-events:none}' +
    '.kkHs text{font-family:"EB Garamond",Georgia,serif;font-size:10.5px;fill:#3b3028}.kkHs rect{fill:#f9f2de;fill-opacity:.9;stroke:#6b573f;stroke-width:.7}.kkHs{pointer-events:none}' +
    '.kkHm text{font-family:"EB Garamond",Georgia,serif;font-size:9.5px;fill:#f6efdd;font-weight:600}.kkHm rect{fill:#3b3028;stroke:#efe2c3;stroke-width:.8}.kkHm{pointer-events:none}' +
    // seit 1.3: Kacheln als Muster (defs), Ebenen heller, Schatten als Leitzeichen der Höhe
    '.kkHo{pointer-events:none}' +
    '.kkSch{fill:#2a2119}.kkKa{fill:none;stroke:#2a2119;stroke-width:2.2;stroke-linecap:square;stroke-opacity:.85}.kkKs{fill:none;stroke:#2a2119;stroke-width:1.2;stroke-linecap:square;stroke-opacity:.8}.kkSt{fill:none;stroke:#6b573f;stroke-width:1;stroke-dasharray:3 2}' +
    '.kkKan{pointer-events:none}' +
    '.kkK{fill:transparent;cursor:pointer}' +
    '.kkF.kkEr .kkK{fill:#b08d3a;fill-opacity:.27}.kkF.kkSp .kkK{fill:#b08d3a;fill-opacity:.13}.kkF.kkZi .kkK{fill:#8e3b22;fill-opacity:.35}' +
    '.kkLd{fill:#f1d27a;opacity:.14}.kkLh{fill:#f7df8e;opacity:.22}' +
    '.kkO{cursor:pointer}.kkRing{fill:none;stroke:#b08d3a;stroke-width:2.5}.kkTok{stroke:#efe2c3;stroke-width:1.5}.kkO.kkSel .kkTok{stroke:#b08d3a;stroke-width:3}' +
    '.kkTx{fill:#f6efdd;font-family:"EB Garamond",Georgia,serif;font-weight:600;pointer-events:none}.kkZu{stroke:#f6efdd;stroke-width:2.2;fill:none;pointer-events:none}' +
    // seit 1.3: Wundringe (gold angeschlagen, rot gestrichelt schwer verletzt), blasse Steine (tot, bewusstlos, versteinert), Plaketten
    '.kkWa{fill:none;stroke:#c48a2a;stroke-width:2.2}.kkWs{fill:none;stroke:#a3261c;stroke-width:2.2;stroke-dasharray:4 2.5}' +
    '.kkO.kkBlass .kkTok,.kkO.kkBlass .kkTx,.kkO.kkBlass .kkRing,.kkO.kkBlass .kkWa,.kkO.kkBlass .kkWs{opacity:.5}.kkPl{pointer-events:none}' +
    '.kkWeg path{fill:none;stroke:#3b3028;stroke-width:2;stroke-dasharray:4 3;opacity:.8}.kkZiel path{fill:none;stroke:#3b3028;stroke-width:2}' +
    // seit 1.2: Reichweite der Waffe, bedrohte Felder, Gelegenheitsangriff, Gegner außer Reichweite
    '.kkReich rect{fill:#8e3b22;fill-opacity:.07;stroke:#8e3b22;stroke-width:2;pointer-events:none}.kkReich rect.kkRl{fill:none;stroke-dasharray:7 4;stroke-width:1.4;stroke-opacity:.8}' +
    '.kkF.kkGz .kkK{stroke:#8e3b22;stroke-width:1.8;stroke-dasharray:5 3}.kkF.kkGzA .kkK{stroke:#8e3b22;stroke-width:1.2;stroke-dasharray:4 3;stroke-opacity:.75}' +
    '.kkWeg .kkOa{fill:#8e3b22;stroke:#efe2c3;stroke-width:1.2}.kkO.kkFern{opacity:.4}.kkO.kkLang{opacity:.7}' +
    // seit 1.4: der blaue Rahmen der Bewegung (gestrichelt mit Spurt)
    '.kkBew{pointer-events:none}.kkBew .kkBw{fill:none;stroke:#2f4f70;stroke-width:2.2;stroke-linecap:square}.kkBew .kkBwS{fill:none;stroke:#2f4f70;stroke-width:1.3;stroke-dasharray:5 3;stroke-opacity:.8}' +
    // seit 1.6: die Spur der Wegstücke mit Stationen, der Geisterstein am aktuellen Stand, Ringe um das Ziel der Aktion und der Bonusaktion
    '.kkWeg{pointer-events:none}.kkWeg .kkStat{fill:#efe2c3;stroke:#3b3028;stroke-width:1.6}.kkZiel{pointer-events:none}' +
    '.kkGeist .kkGk{fill:#efe2c3;fill-opacity:.6;stroke:#3b3028;stroke-width:2;stroke-dasharray:4 3}.kkGeist text{fill:#3b3028;font-family:"EB Garamond",Georgia,serif;font-weight:600}' +
    '.kkO.kkZielW .kkTok{stroke:#8e3b22;stroke-width:3}.kkO.kkBonZ .kkTok{stroke:#b08d3a;stroke-width:3;stroke-dasharray:4 3}';

  var UI_CSS =
    '.kk{display:flex;flex-direction:column;gap:10px}' +
    '.kk .kkKopf{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:15px;color:var(--text-primary)}' +
    '.kk .kkKopf small{font-family:inherit;font-size:13px;color:var(--text-secondary)}' +
    '.kk .kkR{overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y;border-radius:6px;max-height:520px}' +
    '.kk .kkR svg{display:block;height:auto}' +
    '.kk .kkZl{position:sticky;left:0;height:0;width:0;overflow:visible;z-index:1;pointer-events:none}' +
    '.kk .kkZl span{position:absolute;left:0;width:22px;text-align:center;font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:13px;line-height:18px;color:#3b3028;background:rgba(239,226,195,.92);border-radius:0 4px 4px 0;transform:translateY(-50%)}' +
    '.kk .kkI{margin:0;font-size:14px;line-height:1.55;color:var(--text-secondary)}.kk .kkI:empty{display:none}' +
    '.kk .kkI b{font-weight:500;color:var(--text-primary)}' +
    '.kk .kkB{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '.kk input{flex:1 1 180px;min-width:120px;font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--border-300,#c8bda4);border-radius:6px;background:transparent;color:var(--text-primary)}' +
    '.kk .kkL{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 12px;font-size:12px;color:var(--text-secondary)}' +
    '.kk .kkL span{display:flex;align-items:center;gap:6px}.kk .kkL code{font-size:12px;padding:0 4px;border:1px solid var(--border-300,#c8bda4);border-radius:3px}' +
    '.kk .kkLe{display:inline-block;width:12px;height:12px;border-radius:50%;flex:0 0 auto}.kk [hidden]{display:none!important}' +
    // seit 1.3: Kachelbilder in der Legende, Modus-Zeichen an der Waffe, Plakette in der Reihenfolge
    '.kk .kkKb{display:inline-block;vertical-align:middle;border-radius:3px;flex:0 0 auto}' +
    '.kk .kkMo{display:inline-block;height:16px;vertical-align:-3px;margin-left:6px}' +
    '.kk .kkIt{position:relative}.kk .kkIt .kkKb{position:absolute;right:-5px;top:-5px;width:13px;height:13px;border-radius:50%}' +
    // seit 1.4: Pfeile zum Blättern am Kartenrand, Trefferpunkte im Kopf
    '.kk .kkRW{position:relative}.kk .kkBl{position:absolute;z-index:2;width:30px;height:30px;padding:0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;opacity:.92;box-shadow:0 1px 4px rgba(0,0,0,.25)}' +
    '.kk .kkBl svg{width:17px;height:17px;display:block}.kk .kkBl-w{left:8px;top:50%;transform:translateY(-50%) rotate(180deg)}.kk .kkBl-e{right:8px;top:50%;transform:translateY(-50%)}' +
    '.kk .kkBl-n{top:8px;left:50%;transform:translateX(-50%) rotate(-90deg)}.kk .kkBl-s{bottom:8px;left:50%;transform:translateX(-50%) rotate(90deg)}' +
    '.kk .kkTp .kkTpB{display:inline-block;width:64px;height:8px;border:1px solid var(--border-300,#c8bda4);border-radius:4px;vertical-align:middle;overflow:hidden;background:rgba(0,0,0,.05)}.kk .kkTp .kkTpB i{display:block;height:100%;background:#4d5b33}' +
    '.kk .kkTp.kkTpA .kkTpB i{background:#c48a2a}.kk .kkTp.kkTpS .kkTpB i{background:#a3261c}' +
    // seit 1.2: Kopf mit Ziel und Uhren, Initiativleiste, Lagezeile
    '.kk .kkKopf2{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;line-height:1.45;color:var(--text-secondary)}.kk .kkKopf2 b{font-weight:500;color:var(--text-primary)}' +
    '.kk .kkIni{display:flex;align-items:center;gap:6px;overflow-x:auto;font-size:13px;color:var(--text-secondary);padding:2px 0}' +
    '.kk .kkIni .kkInL{flex:0 0 auto;margin-right:2px}' +
    '.kk .kkIt{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;color:#f6efdd;font-family:"EB Garamond",Georgia,serif;font-weight:600;font-size:12px;border:2px solid transparent;cursor:pointer;flex:0 0 auto;box-sizing:border-box}' +
    '.kk .kkIt.kkGeh{opacity:.38}.kk .kkIt.kkJetzt{border-color:#b08d3a;box-shadow:0 0 0 2px rgba(176,141,58,.4);cursor:default}.kk .kkIt.kkSelI{border-color:#efe2c3;box-shadow:0 0 0 2px #b08d3a}' +
    '.kk .kkIni .kkInT{flex:0 0 auto;font-size:12px;margin:0 2px}' +
    '.kk .kkB .kkWl{font-size:13px;color:var(--text-secondary);flex:0 0 auto}' +
    '.kk .kkA{margin:0;font-size:14px;line-height:1.55;padding:6px 10px;border-radius:6px;border:1px solid var(--border-300,#c8bda4);color:var(--text-primary)}' +
    '.kk .kkA.kkVor{border-color:#4d5b33;background:rgba(77,91,51,.09)}.kk .kkA.kkNach{border-color:#8e3b22;background:rgba(142,59,34,.09)}.kk .kkA.kkAus{color:var(--text-secondary)}' +
    '.kk .kkA b{font-weight:500}.kk .kkA .kkHw{color:#8e3b22;font-weight:500}' +
    '.kk .kkOaT{color:#8e3b22;font-weight:500}' +
    '.kk .kkLeB{border-radius:2px;border:2px solid #2f4f70;background:rgba(176,141,58,.25);box-sizing:border-box}.kk .kkLeR{border-radius:2px;border:2px solid #8e3b22;background:rgba(142,59,34,.1);box-sizing:border-box}' +
    '.kk .kkLeZ{border-radius:2px;border:2px dashed #8e3b22;box-sizing:border-box}.kk .kkLeO{width:0;height:0;border-radius:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:11px solid #8e3b22}' +
    '.kk .kkLeG{border:2px dashed #3b3028;background:rgba(239,226,195,.6);box-sizing:border-box}' +
    // seit 1.6: Werkzeuge in einer schmalen Zeile unter der Karte; die Knöpfe der Aktion und der Bonusaktion mit Zeichen in drei Zuständen
    // (wartet: gestrichelt, gewählt: gold, nicht mehr erlaubt: blass); der Kasten „Zug“ mit der Folge als Chips, „Zurück“, Freitext und
    // dem breiten Knopf „Zug abschicken“; nach dem Senden bleibt der Kasten, alles andere wird blass
    '.kk .kkWz{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:-2px}.kk .kkWz button{font-size:12px;padding:3px 9px;min-height:28px;line-height:1.2}' +
    '.kk .kkZc{display:inline-block;width:16px;height:16px;vertical-align:-3px;margin-right:5px;flex:0 0 auto}' +
    '.kk .kkB button.kkWart{outline:2px dashed #b08d3a;outline-offset:-2px}' +
    '.kk .kkB button.kkGold{outline:2px solid #b08d3a;outline-offset:-2px;background:rgba(176,141,58,.16)}' +
    '.kk .kkB button.kkBlass{opacity:.42}.kk .kkB button.kkMit{box-shadow:inset 0 -3px 0 rgba(176,141,58,.75)}' +
    '.kk .kkZk{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border:1px solid var(--border-300,#c8bda4);border-radius:8px}' +
    '.kk .kkZkT{display:flex;justify-content:space-between;gap:8px;font-size:13px;color:var(--text-secondary)}.kk .kkZkT b{font-weight:500;color:var(--text-primary)}' +
    '.kk .kkFo{display:flex;flex-wrap:wrap;gap:6px;align-items:center}' +
    '.kk .kkCh{display:inline-flex;align-items:center;gap:4px;font-size:13px;line-height:1.3;padding:3px 9px;border-radius:14px;border:1px solid var(--border-300,#c8bda4);color:var(--text-primary);background:transparent;font-family:inherit}' +
    '.kk .kkCh-weg{border-color:#2f4f70}.kk .kkCh-ak{border-color:#b08d3a;background:rgba(176,141,58,.16)}.kk .kkCh-bo{border-color:#b08d3a;border-style:dashed;background:rgba(176,141,58,.08)}' +
    '.kk .kkCh-oa{border-color:#8e3b22;color:#8e3b22}.kk .kkCh-steht{color:var(--text-secondary);border-style:dotted}' +
    '.kk button.kkCh-auf{cursor:pointer}.kk button.kkCh-auf[aria-pressed="false"]{color:var(--text-secondary);border-style:dotted}' +
    '.kk .kkFo button[data-k="zurueck"]{margin-left:auto;font-size:13px}.kk .kkFo button[data-k="zurueck"][disabled]{opacity:.42}' +
    '.kk .kkZk input{flex:1 1 auto;width:100%;box-sizing:border-box}' +
    '.kk button.kkSenden{width:100%;box-sizing:border-box;font-size:15px;font-weight:500;padding:10px 12px;min-height:44px}.kk button.kkSenden[disabled]{opacity:.55}' +
    '.kk .kkZkS{margin:0;font-size:13px;color:var(--text-secondary)}.kk .kkZkS b{font-weight:500;color:var(--text-primary)}' +
    '.kk.kkFertig .kkRW,.kk.kkFertig .kkWz,.kk.kkFertig .kkI,.kk.kkFertig .kkA,.kk.kkFertig .kkAk,.kk.kkFertig .kkBo,.kk.kkFertig .kkL{opacity:.5;pointer-events:none}';

  /* ---------- Der Zug als Folge (seit 1.6) ---------- */
  // Der Spieler baut den Zug als Folge von Schritten, in der Reihenfolge, in der er sie tut (PHB: die Bewegung darf beliebig
  // geteilt werden, Aktion und Bonusaktion stehen irgendwo dazwischen, nur die Summe zählt): Wegstücke (`weg`, je vom aktuellen
  // Stand aus gerechnet), höchstens eine Aktion (`aktion`: `waffe` oder `zauber` mit Ziel, `spurt`, `rueckzug` oder `frei` aus
  // `aktionen[]`) und höchstens eine Bonusaktion (`bonus`). Liegt die Figur, steht `aufstehen` vorn (halbe Bewegung, PHB);
  // abgewählt kriecht sie (jedes Feld doppelt, also ebenfalls die halbe Bewegung). Spurt gibt die Bewegung noch einmal dazu,
  // Rückzug nimmt den folgenden Wegstücken die Gelegenheitsangriffe; je Gegner zählt ein Gelegenheitsangriff im ganzen Zug einmal.
  function zugModell(K, figur) {
    var liegtFigur = liegt(figur), basis = Math.max(0, Math.floor((+figur.bewegung || 9) / METER));
    var Zg = { schritte: [], aufstehen: liegtFigur, liegt: liegtFigur, basis: basis, modus: figur.waffen.map(function (w) { return w.modus || 0; }), waffeIdx: 0 };
    function standObj(x, y) { return { x: x, y: y, groesse: figur.groesse, schwimmen: !!figur.schwimmen, _figur: figur }; }
    Zg.kriecht = function () { return liegtFigur && !Zg.aufstehen; };
    Zg.aktion = function () { for (var i = 0; i < Zg.schritte.length; i++) if (Zg.schritte[i].art === 'aktion') return Zg.schritte[i]; return null; };
    Zg.bonus = function () { for (var i = 0; i < Zg.schritte.length; i++) if (Zg.schritte[i].art === 'bonus') return Zg.schritte[i]; return null; };
    Zg.hatSpurt = function () { var a = Zg.aktion(); return !!(a && a.kind === 'spurt'); };
    // was Spurt dazugäbe: die Bewegung noch einmal; kriechend die Hälfte (jedes Feld zählt doppelt)
    Zg.spurtMehr = function () { return Zg.kriecht() ? Math.floor(basis / 2) : basis; };
    Zg.budget = function () {
      var grund = liegtFigur ? Math.floor(basis / 2) : basis;
      return grund + (Zg.hatSpurt() ? Zg.spurtMehr() : 0);
    };
    Zg.verbraucht = function () { var s = 0; Zg.schritte.forEach(function (st) { if (st.art === 'weg') s += st.d; }); return s; };
    Zg.rest = function () { return Zg.budget() - Zg.verbraucht(); };
    Zg.bewegt = function () { return Zg.schritte.some(function (s) { return s.art === 'weg'; }); };
    // der Stand vor dem Schritt i (von dort geht eine Aktion aus), und der aktuelle Stand nach allen Schritten
    Zg.standBei = function (i) { var s = null; for (var k = 0; k < i && k < Zg.schritte.length; k++) if (Zg.schritte[k].art === 'weg') s = Zg.schritte[k]; return s ? standObj(s.x, s.y) : figur; };
    Zg.stand = function () { return Zg.standBei(Zg.schritte.length); };
    Zg.wege = function () { return wege(K, Zg.stand()); };
    Zg.wegHinzu = function (x, y) {
      var W = Zg.wege(), key = x + ',' + y, d = W.dist[key], st = Zg.stand(), w = W.belegt[key];
      if (x === st.x && y === st.y) return { fehler: 'steht' };
      if (w && w !== figur) return { fehler: 'besetzt', wesen: w };
      if (d == null) return { fehler: 'unerreichbar' };
      if (d > Zg.rest()) return { fehler: 'zuweit', d: d, rest: Zg.rest(), spurt: !Zg.aktion() && d <= Zg.rest() + Zg.spurtMehr() };
      var p = pfad(W, x, y), s = { art: 'weg', x: x, y: y, p: p, d: d, hoehe: pfadHoehe(K, p) };
      Zg.schritte.push(s);
      return { ok: true, schritt: s };
    };
    Zg.aktionHinzu = function (kind, idx, ziel) { if (Zg.aktion()) return null; var s = { art: 'aktion', kind: kind, idx: idx == null ? 0 : idx, ziel: ziel || null }; Zg.schritte.push(s); return s; };
    Zg.bonusHinzu = function (idx, ziel) { if (Zg.bonus()) return null; var s = { art: 'bonus', idx: idx, ziel: ziel || null }; Zg.schritte.push(s); return s; };
    Zg.zurueck = function () { if (!Zg.schritte.length) return null; var s = Zg.schritte.pop(); Zg.pruefe(); return s; };
    Zg.entferne = function (schritt) { var i = Zg.schritte.indexOf(schritt); if (i >= 0) Zg.schritte.splice(i, 1); Zg.pruefe(); };
    // Die Zweitwaffe (PHB): nur neben der Angriffsaktion mit einer leichten Waffe; ein Zauber ist keine Angriffsaktion
    Zg.zweitwaffeErlaubt = function (a) { a = a === undefined ? Zg.aktion() : a; return !!(a && a.kind === 'waffe' && figur.waffen[a.idx] && figur.waffen[a.idx].leicht); };
    // Nach einer Änderung (Zurück, Spurt weg, Aufstehen abgewählt): Wegstücke über dem Budget fallen samt allem danach, eine Zweitwaffe ohne ihre Angriffsaktion fällt
    Zg.pruefe = function () {
      var neu = [], verb = 0, b = Zg.budget(), a = null, stop = false;
      Zg.schritte.forEach(function (s) {
        if (stop) return;
        if (s.art === 'weg') { if (verb + s.d > b) { stop = true; return; } verb += s.d; }
        if (s.art === 'bonus' && figur.bonus[s.idx] && figur.bonus[s.idx].art === 'waffe' && !Zg.zweitwaffeErlaubt(a)) return;
        if (s.art === 'aktion') a = s;
        neu.push(s);
      });
      Zg.schritte = neu;
    };
    // Gelegenheitsangriffe je Wegstück (Liste je Schritt, leer bei Aktion und Bonusaktion): je Gegner einmal im ganzen Zug, nach Rückzug keine mehr
    Zg.gelegenheiten = function () {
      var out = [], schon = {}, frei = false;
      Zg.schritte.forEach(function (s) {
        if (s.art === 'aktion' && s.kind === 'rueckzug') frei = true;
        if (s.art !== 'weg') { out.push([]); return; }
        var l = frei ? [] : gelegenheiten(K, s.p).filter(function (o) { return !schon[o.wesen._i]; });
        l.forEach(function (o) { schon[o.wesen._i] = 1; });
        out.push(l);
      });
      return out;
    };
    // die wirksame Waffe eines Aktionsschritts (Waffe in ihrem Modus; ein Zauber „mit Waffe“ nimmt die zuletzt gewählte Waffe)
    Zg.waffeAkt = function () { var w = figur.waffen[Math.min(Zg.waffeIdx, figur.waffen.length - 1)]; return w ? wirksam(w, Zg.modus[Math.min(Zg.waffeIdx, figur.waffen.length - 1)], null) : null; };
    Zg.wirksam = function (kind, idx) {
      if (kind === 'waffe') { var w = figur.waffen[idx]; return w ? wirksam(w, Zg.modus[idx], null) : null; }
      if (kind === 'zauber') { var z = figur.zauber[idx]; return z ? wirksam(z, null, z.mit ? Zg.waffeAkt() : null) : null; }
      return null;
    };
    Zg.lage = function (s) {
      var i = Zg.schritte.indexOf(s), wf = Zg.wirksam(s.kind, s.idx);
      if (!wf || !s.ziel) return null;
      return { L: angriffsLage(K, Zg.standBei(i < 0 ? Zg.schritte.length : i), s.ziel, wf, Zg.kriecht()), wf: wf };
    };
    Zg.aktionText = function (s) {
      if (s.kind === 'spurt') return 'Spurt';
      if (s.kind === 'rueckzug') return 'Rückzug';
      if (s.kind === 'frei') { var a = figur.aktionen[s.idx]; return 'Aktion: ' + (a ? a.name : '?'); }
      var wf = Zg.wirksam(s.kind, s.idx);
      if (!wf) return '';
      if (!s.ziel) return (wf.zauber ? 'Zauber: ' : 'Waffe: ') + wf.name;
      var A = Zg.lage(s);
      return lageKurz(A.L, wf, s.ziel);
    };
    Zg.wegText = function (s, kurz) {
      var t = (Zg.kriecht() ? 'kriecht nach ' : 'nach ') + feldNameK(K, s.x, s.y) + ' (' + m(s.d) + ')';
      if (s.hoehe.klettern) t += ' · klettert ' + m(s.hoehe.klettern);
      if (s.hoehe.sprung) t += ' · springt ' + m(s.hoehe.sprung) + ' hinab';
      return kurz ? t.replace(/^(kriecht )?nach /, '$1→ ') : t;
    };
    function oaText(l) { return l.length ? 'verlässt ' + namen(l.map(function (o) { return o.wesen; })) + ': Gelegenheitsangriff' + (l.length > 1 ? 'e' : '') : ''; }
    Zg.oaText = oaText;
    // Die Zugzeile, wie sie an die Spielleitung geht: die Folge von links nach rechts, hinten „Weg 7,5 von 9 m“ und der Freitext;
    // `extra` hängt an, was keinen Schritt hat (eine Waffe, die noch wartet; eine Bonusaktion ohne Ziel; ein Ziel ohne Waffen)
    Zg.zeile = function (D, freitext, extra) {
      var t = [], oa = Zg.gelegenheiten();
      if (liegtFigur && Zg.aufstehen) t.push('steht auf');
      if (!Zg.bewegt()) t.push((Zg.kriecht() ? 'bleibt liegen auf ' : 'bleibt auf ') + feldNameK(K, figur.x, figur.y));
      Zg.schritte.forEach(function (s, i) {
        if (s.art === 'weg') { t.push(Zg.wegText(s, false)); if (oa[i].length) t.push(oaText(oa[i])); }
        else if (s.art === 'aktion') t.push(Zg.aktionText(s));
        else if (s.art === 'bonus') { var bo = figur.bonus[s.idx]; if (bo) t.push(bonusZeile(K, bo, s.ziel, Zg.standBei(i), figur)); }
      });
      (extra || []).forEach(function (x) { if (x) t.push(x); });
      if (Zg.bewegt()) t.push('Weg ' + m(Zg.verbraucht()).replace(/ m$/, '') + ' von ' + m(Zg.budget()));
      if (freitext) t.push(freitext);
      return 'Kampf #' + (D.nr || '?') + ' · ' + figur.name + ': ' + t.join(' · ');
    };
    return Zg;
  }

  /* ---------- Einbau ins Widget ---------- */
  function schriftLaden() {
    try {
      if (document.getElementById('ktSchrift')) return;
      var l = document.createElement('link');
      l.id = 'ktSchrift'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&family=IM+Fell+English:ital@0;1&display=swap';
      document.head.appendChild(l);
    } catch (e) { return; }
  }

  function einbauen(el, D) {
    schriftLaden();
    var e = zeichne(D), K = e.karte, W = e.breite, H = e.hoehe, figur = K.figur;
    var Zg = figur ? zugModell(K, figur) : null;
    var waffen = figur ? figur.waffen : [], zauber = figur ? figur.zauber : [], bonus = figur ? figur.bonus : [], aktionen = figur ? figur.aktionen : [];
    // die Wahl, die auf ein Ziel wartet: die erste Waffe ist vorgewählt (sonst der erste Zauber); eine Bonusaktion wartet nach ihrem Tipp
    var wartet = waffen.length ? { art: 'waffe', i: 0 } : zauber.length ? { art: 'zauber', i: 0 } : null, bonusWartet = -1;
    var betrachtet = null;     // das angetippte Wesen (Auskunft und Zone)
    var zielOhne = null;       // ohne Waffen und Zauber: das angetippte Ziel, für die Zugzeile („Ziel: Räuber 1 (10,5 m)“)
    var gesendet = false, stufe = 0, gefahrAn = false;
    var STUFEN = [1, 1.8, 2.8, 4];
    // Kopf: Ziel, Uhren und Lage (seit 1.2), Trefferpunkte der Figur (seit 1.4)
    var kopf2 = [];
    if (figur && figur._tp) {
      var tpq = Math.max(0, Math.min(100, Math.round(figur._tp[0] / figur._tp[1] * 100)));
      kopf2.push('<span class="kkTp' + (tpq <= 25 ? ' kkTpS' : tpq <= 50 ? ' kkTpA' : '') + '"><b>TP:</b> ' + figur._tp[0] + '/' + figur._tp[1] + ' <i class="kkTpB" aria-hidden="true"><i style="width:' + tpq + '%"></i></i></span>');
    }
    if (D.ziel) kopf2.push('<span class="kkZiel"><b>Ziel:</b> ' + esc(D.ziel) + '</span>');
    (Array.isArray(D.uhren) ? D.uhren : []).forEach(function (u) {
      if (!u || !u.name) return;
      var r = +u.rest;
      kopf2.push('<span class="kkUhr"><b>' + esc(u.name) + ':</b> ' + (isFinite(r) ? (r <= 0 ? 'jetzt' : 'noch ' + r + (r === 1 ? ' Runde' : ' Runden')) : esc(u.rest)) + '</span>');
    });
    (Array.isArray(D.lage) ? D.lage : []).forEach(function (l) { if (l) kopf2.push('<span class="kkLage">' + esc(l) + '</span>'); });
    // Initiativleiste (seit 1.2): wer vor der Figur steht, hat in dieser Runde gehandelt
    var reihe = [], ini = '';
    if (Array.isArray(D.reihenfolge)) {
      var byId = {}; K.wesen.forEach(function (w) { if (w.id != null) byId[String(w.id)] = w; });
      D.reihenfolge.forEach(function (id) { var w = byId[String(id)]; if (w && reihe.indexOf(w) < 0) reihe.push(w); });
      var fi = figur ? reihe.indexOf(figur) : -1;
      if (reihe.length) ini = '<div class="kkIni" role="list" aria-label="Reihenfolge"><span class="kkInL">Reihenfolge</span>' + reihe.map(function (w, i) {
        var kl = 'kkIt' + (fi >= 0 && i < fi ? ' kkGeh' : '') + (w === figur ? ' kkJetzt' : ''), was = fi >= 0 && i < fi ? 'hat gehandelt' : w === figur ? 'am Zug' : 'kommt noch';
        var zs = w.zustaende || [];
        return '<span class="' + kl + '" role="listitem" data-w="' + w._i + '" title="' + esc(w.name + ' · ' + was + (zs.length ? ' · ' + zs.join(', ') : '')) + '" style="background:' + ART_WESEN[w.art] + '"' + (w !== figur ? ' tabindex="0"' : '') + '>' + esc(w.kurz) + (zs.length ? plaketteBild(zs[0], 13) : '') + '</span>' +
          (w === figur && i < reihe.length - 1 ? '<span class="kkInT" aria-hidden="true">›</span>' : '');
      }).join('') + '</div>';
    }
    el.classList.add('kk');
    el.innerHTML = '<style>' + UI_CSS + '</style>' +
      '<div class="kkKopf"><span>' + esc(D.titel || 'Kampfkarte') + '</span><small>' + (D.runde ? 'Runde ' + esc(D.runde) + ' · ' : '') +
      (figur ? esc(figur.name) + ' · Bewegung ' + m(Zg.basis) + (Zg.liegt ? ' (liegt)' : '') : '') + (D.stand ? ' · ' + esc(D.stand) : '') + '</small></div>' +
      (kopf2.length ? '<div class="kkKopf2">' + kopf2.join('') + '</div>' : '') + ini +
      // 1. die Karte mit vier Pfeilen zum Blättern (seit 1.4), sichtbar nur, wo die Karte weitergeht; darunter die Werkzeuge in einer schmalen Zeile
      '<div class="kkRW"><div class="kkR"><div class="kkZl" aria-hidden="true"></div>' + e.svg + '</div>' +
      ['w', 'e', 'n', 's'].map(function (r) { return '<button type="button" class="kkBl kkBl-' + r + '" data-k="blatt" data-r="' + r + '" aria-label="' + ({ w: 'Karte nach links', e: 'Karte nach rechts', n: 'Karte nach oben', s: 'Karte nach unten' })[r] + '" hidden>' + PFEIL + '</button>'; }).join('') + '</div>' +
      '<div class="kkWz" role="toolbar" aria-label="Werkzeuge"><button type="button" data-k="minus" aria-label="Kleiner" title="Kleiner">−</button><button type="button" data-k="plus" aria-label="Größer" title="Größer">+</button>' +
      '<button type="button" data-k="figur" title="Die Karte zur Figur rücken">Zur Figur</button><button type="button" data-k="gefahr" aria-pressed="false" title="Alle Felder, die ein Gegner bedroht">Gefahr</button><button type="button" data-k="leg" aria-expanded="false" title="Die Legende, ganz unten">Legende</button></div>' +
      // 2. die Infozeile: nur, was die Karte nicht zeigen kann; 3. die Lagezeile zum Angriff
      '<p class="kkI" aria-live="polite"></p>' +
      '<p class="kkA" hidden></p>' +
      // 4. Aktion, 5. Bonusaktion, 6. der Kasten „Zug“
      '<div class="kkB kkAk"' + (figur ? '' : ' hidden') + '></div><div class="kkB kkBo"' + (bonus.length ? '' : ' hidden') + '></div>' +
      '<div class="kkZk"' + (figur ? '' : ' hidden') + '><div class="kkZkT"><b>Zug</b><span class="kkZkW"></span></div><div class="kkFo"></div>' +
      '<input type="text" maxlength="120" placeholder="und sonst … (Rufen, Trick, Gegenstand)" aria-label="Was die Figur sonst tut">' +
      '<button type="button" class="kkSenden" data-k="zug">Zug abschicken</button><p class="kkZkS" hidden></p></div>' +
      // 7. die Legende, eingeklappt
      '<div class="kkL" hidden>' + e.legende + '</div>';
    var rahmen = el.querySelector('.kkR'), svg = rahmen.querySelector('svg'), info = el.querySelector('.kkI'), eingabe = el.querySelector('input');
    var leg = el.querySelector('.kkL'), bLeg = el.querySelector('[data-k="leg"]'), angriff = el.querySelector('.kkA');

    function $(q) { return el.querySelector(q); }
    function feldEl(x, y) { return svg.querySelector('g.kkF[data-x="' + x + '"][data-y="' + y + '"]'); }
    function sag(t) { info.innerHTML = t || ''; }
    function reichText(x) { return ' · Reichweite ' + m(x.r) + (x.rl ? ' (' + m(x.rl) + ')' : ''); }

    /* ---- die Knöpfe der Aktion und der Bonusaktion ---- */
    function knopf(k, i, kl, pressed, blass, tipp, inhalt) {
      return '<button type="button" data-k="' + k + '"' + (i == null ? '' : ' data-i="' + i + '"') + ' class="' + kl.join(' ') + '" aria-pressed="' + (pressed ? 'true' : 'false') + '"' +
        (blass ? ' aria-disabled="true"' : '') + ' title="' + esc(tipp) + '">' + inhalt + '</button>';
    }
    function zeigeKnoepfe() {
      if (!figur) return;
      var a = Zg.aktion(), b = Zg.bonus(), out = [], nurEine = 'nur eine Aktion je Zug; „Zurück“ oder ein Tipp auf die gewählte nimmt sie aus dem Zug';
      var mitWaffe = (a && a.kind === 'zauber' && zauber[a.idx] && zauber[a.idx].mit) || (!a && wartet && wartet.art === 'zauber' && zauber[wartet.i] && zauber[wartet.i].mit);
      out.push('<span class="kkWl">Aktion</span>');
      waffen.forEach(function (w, i) {
        var e2 = wirksam(w, Zg.modus[i], null), mo = w.modi.length ? w.modi[Zg.modus[i]] : null;
        var gold = !!(a && a.kind === 'waffe' && a.idx === i), wart = !a && !!(wartet && wartet.art === 'waffe' && wartet.i === i), blass = !!a && !gold;
        var tipp = e2.name + waffeText(e2) + reichText(e2) + (w.leicht ? ' · leicht' : '') +
          ((gold || wart) && w.modi.length > 1 ? ' · noch einmal tippen: ' + w.modi[(Zg.modus[i] + 1) % w.modi.length].name : gold ? ' · noch einmal tippen: aus dem Zug nehmen' : wart ? ' · wartet: tippe auf einen Stein als Ziel' : blass ? ' · ' + nurEine : '');
        out.push(knopf('waffe', i, ['kkKn', gold ? 'kkGold' : '', wart ? 'kkWart' : '', blass ? 'kkBlass' : '', mitWaffe && i === Zg.waffeIdx ? 'kkMit' : ''].filter(Boolean), gold, blass, tipp,
          zeichenBild(waffenZeichen(e2), e2.typ || 'Waffe') + esc(w.name) + (mo ? modusBild(mo.zeichen, mo.name) : '')));
      });
      zauber.forEach(function (z, i) {
        var e2 = wirksam(z, null, z.mit ? Zg.waffeAkt() : null);
        var gold = !!(a && a.kind === 'zauber' && a.idx === i), wart = !a && !!(wartet && wartet.art === 'zauber' && wartet.i === i), blass = !!a && !gold;
        var tipp = e2.name + waffeText(e2) + reichText(e2) + (z.mit ? ' · mit der gewählten Waffe' : '') + (gold ? ' · noch einmal tippen: aus dem Zug nehmen' : wart ? ' · wartet: tippe auf einen Stein als Ziel' : blass ? ' · ' + nurEine : '');
        out.push(knopf('zauber', i, ['kkKn', gold ? 'kkGold' : '', wart ? 'kkWart' : '', blass ? 'kkBlass' : ''].filter(Boolean), gold, blass, tipp,
          zeichenBild(waffenZeichen(e2), e2.typ || (e2.heilung ? 'Heilung' : e2.rettung ? 'Rettungswurf' : 'Wirkung')) + esc(z.name)));
      });
      [['spurt', 'Spurt', 'Spurt ist eine Aktion (PHB): die Bewegung noch einmal dazu (' + m(Zg.spurtMehr()) + ')'], ['rueckzug', 'Rückzug', 'Rückzug ist eine Aktion (PHB): die Wegstücke danach lösen keinen Gelegenheitsangriff aus']].forEach(function (q) {
        var gold = !!(a && a.kind === q[0]), blass = !!a && !gold;
        out.push(knopf(q[0], null, ['kkKn', gold ? 'kkGold' : '', blass ? 'kkBlass' : ''].filter(Boolean), gold, blass, q[2] + (gold ? ' · noch einmal tippen: aus dem Zug nehmen' : blass ? ' · ' + nurEine : ''), zeichenBild(q[0], q[1]) + q[1]));
      });
      aktionen.forEach(function (ak, i) {
        var gold = !!(a && a.kind === 'frei' && a.idx === i), blass = !!a && !gold;
        out.push(knopf('aktion', i, ['kkKn', gold ? 'kkGold' : '', blass ? 'kkBlass' : ''].filter(Boolean), gold, blass, ak.name + (ak.wirkung ? ' · ' + ak.wirkung : '') + (gold ? ' · noch einmal tippen: aus dem Zug nehmen' : blass ? ' · ' + nurEine : ''), zeichenBild(ak.zeichen, ak.name) + esc(ak.name)));
      });
      $('.kkAk').innerHTML = out.join('');
      var bo = ['<span class="kkWl">Bonusaktion</span>'];
      bonus.forEach(function (x, i) {
        var gold = !!(b && b.idx === i), wart = !b && bonusWartet === i, zw = x.art === 'waffe' && !Zg.zweitwaffeErlaubt(), blass = (!!b && !gold) || (!b && zw);
        var tipp = x.name + bonusWerte(x) + ' · Reichweite ' + m(x.r) + (x.rl ? ' (' + m(x.rl) + ')' : '') + (x.ohneZiel ? '' : ' · Ziel: ' + bonusZieleText(x)) + (x.wirkung ? ' · ' + x.wirkung : '') +
          (gold ? ' · noch einmal tippen: aus dem Zug nehmen' : wart ? ' · wartet: tippe auf einen Stein als Ziel' : zw && !b ? ' · nur neben einer leichten Waffe und der Angriffsaktion (PHB)' : blass ? ' · nur eine Bonusaktion je Zug' : '');
        var z = x.art === 'waffe' ? zeichenVon(x.typ || 'schaden') : x.art === 'heilung' ? 'heilung' : x.art === 'inspiration' ? 'inspiration' : 'wirkung';
        bo.push(knopf('bonus', i, ['kkKn', gold ? 'kkGold' : '', wart ? 'kkWart' : '', blass ? 'kkBlass' : ''].filter(Boolean), gold, blass, tipp, zeichenBild(z, x.art === 'waffe' ? x.typ || 'Zweitwaffe' : x.art) + esc(x.name)));
      });
      $('.kkBo').innerHTML = bo.join('');
    }

    /* ---- der Kasten „Zug“: die Folge als Chips ---- */
    function chip(kl, text, tipp) { return '<span class="kkCh ' + kl + '"' + (tipp ? ' title="' + esc(tipp) + '"' : '') + '>' + text + '</span>'; }
    function aktionKurz(s) {
      if (s.kind === 'spurt') return zeichenBild('spurt', 'Spurt') + 'Spurt (+' + m(Zg.spurtMehr()) + ')';
      if (s.kind === 'rueckzug') return zeichenBild('rueckzug', 'Rückzug') + 'Rückzug';
      if (s.kind === 'frei') { var ak = aktionen[s.idx]; return zeichenBild(ak ? ak.zeichen : 'aktion', 'Aktion') + 'Aktion: ' + esc(ak ? ak.name : '?'); }
      var wf = Zg.wirksam(s.kind, s.idx); if (!wf) return '';
      var A = Zg.lage(s), t = esc((wf.zauber ? 'Zauber: ' : 'Angriff: ') + wf.name + (s.ziel ? ' auf ' + s.ziel.name : ''));
      if (A && A.L.status === 'aus') t += ' <span class="kkOaT">(außer Reichweite)</span>';
      else if (A) t += ' (' + m(A.L.abstand) + ')';
      return zeichenBild(waffenZeichen(wf), wf.typ || 'Aktion') + t;
    }
    function zeigeKasten() {
      if (!figur) return;
      var out = [], oa = Zg.gelegenheiten();
      if (Zg.liegt) out.push('<button type="button" class="kkCh kkCh-auf" data-k="auf" aria-pressed="' + (Zg.aufstehen ? 'true' : 'false') + '" title="Aufstehen kostet die halbe Bewegung und hebt den Nachteil vom Boden auf (PHB); abgewählt bleibt die Figur liegen und kriecht (jedes Feld zählt doppelt)">' + (Zg.aufstehen ? 'steht auf' : 'bleibt liegen') + '</button>');
      if (!Zg.bewegt()) out.push(chip('kkCh-steht', (Zg.kriecht() ? 'bleibt liegen auf ' : 'bleibt auf ') + esc(feldNameK(K, figur.x, figur.y)), 'Ohne Wegstück bleibt die Figur stehen; ein Tipp auf ein Feld zieht dorthin'));
      Zg.schritte.forEach(function (s, i) {
        if (s.art === 'weg') {
          var fa = feldArt(s.x, s.y);
          out.push(chip('kkCh-weg', esc(Zg.wegText(s, true)), feldNameK(K, s.x, s.y) + (fa ? ': ' + fa : '') + ' · ' + m(s.d) + (i === Zg.schritte.length - 1 ? ' · ein Tipp auf den Geisterstein nimmt das Stück zurück' : '')));
          if (oa[i].length) out.push(chip('kkCh-oa', esc(Zg.oaText(oa[i])), 'Wer die Reichweite eines Gegners verlässt, fängt dessen Reaktion, außer er nimmt die Aktion Rückzug (PHB)'));
        } else if (s.art === 'aktion') out.push(chip('kkCh-ak', aktionKurz(s), Zg.aktionText(s)));
        else if (s.art === 'bonus') { var bo = bonus[s.idx]; if (bo) out.push(chip('kkCh-bo', zeichenBild(bo.art === 'waffe' ? zeichenVon(bo.typ || 'schaden') : bo.art === 'heilung' ? 'heilung' : bo.art === 'inspiration' ? 'inspiration' : 'wirkung', bo.art) + esc(bonusZeile(K, bo, s.ziel, Zg.standBei(i), figur)), bo.wirkung)); }
      });
      out.push('<button type="button" data-k="zurueck"' + (Zg.schritte.length ? '' : ' disabled') + ' title="Den letzten Schritt aus dem Zug nehmen">Zurück</button>');
      $('.kkFo').innerHTML = out.join('');
      $('.kkZkW').textContent = 'Weg ' + m(Zg.verbraucht()).replace(/ m$/, '') + ' von ' + m(Zg.budget());
    }

    /* ---- die Karte: Erreichbares, Rahmen, Spur, Geisterstein, Reichweite, Zonen ---- */
    var zonen = {};
    function zoneVon(w) { if (!zonen[w._i]) zonen[w._i] = zone(K, w); return zonen[w._i]; }
    function zeigeZone(w) {
      Array.prototype.forEach.call(svg.querySelectorAll('.kkF.kkGz'), function (f) { f.classList.remove('kkGz'); });
      if (!w || w.art !== 'gegner' || !kampffaehig(w)) return;
      Object.keys(zoneVon(w)).forEach(function (key) { var t = key.split(','), g = feldEl(+t[0], +t[1]); if (g) g.classList.add('kkGz'); });
    }
    function zeigeGefahr(an) {
      Array.prototype.forEach.call(svg.querySelectorAll('.kkF.kkGzA'), function (f) { f.classList.remove('kkGzA'); });
      if (!an) return;
      gegnerAktiv(K).forEach(function (g) { Object.keys(zoneVon(g)).forEach(function (key) { var t = key.split(','), f = feldEl(+t[0], +t[1]); if (f) f.classList.add('kkGzA'); }); });
    }
    // die Waffe, deren Reichweite die Karte zeigt, und von wo: die Aktion von ihrem Stand, sonst die wartende Waffe vom aktuellen Stand
    function reichweiteWaffe() {
      var a = Zg.aktion();
      if (a && (a.kind === 'waffe' || a.kind === 'zauber')) return { wf: Zg.wirksam(a.kind, a.idx), stand: Zg.standBei(Zg.schritte.indexOf(a)) };
      if (!a && wartet) return { wf: Zg.wirksam(wartet.art, wartet.i), stand: Zg.stand() };
      return null;
    }
    function zeigeReich() {
      var g = svg.querySelector('.kkReich'), rw = reichweiteWaffe();
      Array.prototype.forEach.call(svg.querySelectorAll('.kkO.kkFern,.kkO.kkLang'), function (o) { o.classList.remove('kkFern'); o.classList.remove('kkLang'); });
      if (!g) return;
      if (!rw || !rw.wf) { g.innerHTML = ''; return; }
      var wf = rw.wf, s = rw.stand, gr = s.groesse || 1, out = [];
      [wf.r, wf.rl].forEach(function (r, i) {
        if (!r) return;
        var x1 = Math.max(1, s.x - r), y1 = Math.max(1, s.y - r), x2 = Math.min(K.sp, s.x + gr - 1 + r), y2 = Math.min(K.ze, s.y + gr - 1 + r);
        out.push('<rect x="' + px(x1) + '" y="' + py(y1) + '" width="' + ((x2 - x1 + 1) * Z) + '" height="' + ((y2 - y1 + 1) * Z) + '" rx="3"' + (i ? ' class="kkRl"' : '') + '/>');
      });
      g.innerHTML = out.join('');
      K.wesen.forEach(function (w) {
        if (w === figur || w.art !== 'gegner') return;
        var o = svg.querySelector('.kkO[data-w="' + w._i + '"]'); if (!o) return;
        var ab = abstand(s, w, K);
        if (ab > (wf.rl || wf.r)) o.classList.add('kkFern'); else if (ab > wf.r) o.classList.add('kkLang');
      });
    }
    function umriss(inSet) {
      var d = '';
      Object.keys(inSet).forEach(function (key) {
        var t = key.split(','), x = +t[0], y = +t[1], X = px(x), Y = py(y);
        if (!inSet[x + ',' + (y - 1)]) d += 'M' + X + ' ' + Y + 'H' + (X + Z);
        if (!inSet[x + ',' + (y + 1)]) d += 'M' + X + ' ' + (Y + Z) + 'H' + (X + Z);
        if (!inSet[(x - 1) + ',' + y]) d += 'M' + X + ' ' + Y + 'V' + (Y + Z);
        if (!inSet[(x + 1) + ',' + y]) d += 'M' + (X + Z) + ' ' + Y + 'V' + (Y + Z);
      });
      return d;
    }
    // erreichbare Felder vom aktuellen Stand mit dem Rest der Bewegung, gold getönt, und der blaue Rahmen darum (gestrichelt mit Spurt)
    function zeigeBewegung() {
      var g = svg.querySelector('.kkBew');
      Array.prototype.forEach.call(svg.querySelectorAll('.kkF.kkEr'), function (f) { f.classList.remove('kkEr'); });
      if (!g || !figur) return;
      var Wg = Zg.wege(), rest = Zg.rest(), nah = {};
      Object.keys(Wg.dist).forEach(function (key) {
        var d = Wg.dist[key];
        if (d > rest) return;
        nah[key] = 1;
        if (!d || (Wg.belegt[key] && Wg.belegt[key] !== figur)) return;
        var t = key.split(','), f = feldEl(+t[0], +t[1]);
        if (f) f.classList.add('kkEr');
      });
      // Felder mit einem Wesen darauf, rundum erreichbar, gehören zum Rahmen dazu (sonst zeichnet er Löcher um jeden Stein)
      K.wesen.forEach(function (w) {
        for (var dx = 0; dx < w.groesse; dx++) for (var dy = 0; dy < w.groesse; dy++) {
          var x = w.x + dx, y = w.y + dy, n = 0;
          [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (s) { if (nah[(x + s[0]) + ',' + (y + s[1])]) n++; });
          if (n >= 3) nah[x + ',' + y] = 1;
        }
      });
      g.innerHTML = rest > 0 ? '<path class="' + (Zg.hatSpurt() ? 'kkBwS' : 'kkBw') + '" d="' + umriss(nah) + '"/>' : '';
    }
    // die Spur der Wegstücke (gestrichelt, Punkte an den Stationen, rote Dreiecke, wo ein Gegner den Gelegenheitsangriff bekommt) und der
    // Geisterstein am aktuellen Stand
    function zeigeWeg() {
      var g = svg.querySelector('.kkWeg'), gz = svg.querySelector('.kkZiel'), out = [], oa = Zg.gelegenheiten();
      Zg.schritte.forEach(function (s, i) {
        if (s.art !== 'weg') return;
        var p = s.p;
        out.push('<path d="' + p.map(function (q, j) { return (j ? 'L' : 'M') + (px(q[0]) + Z / 2) + ' ' + (py(q[1]) + Z / 2); }).join('') + '"/>');
        oa[i].forEach(function (o) {
          var a = p[o.schritt - 1], b = p[o.schritt], cx = (px(a[0]) + px(b[0])) / 2 + Z / 2, cy = (py(a[1]) + py(b[1])) / 2 + Z / 2;
          out.push('<polygon class="kkOa" points="' + cx + ',' + (cy - 7) + ' ' + (cx + 7) + ',' + (cy + 6) + ' ' + (cx - 7) + ',' + (cy + 6) + '"><title>' + esc('Gelegenheitsangriff: ' + o.wesen.name) + '</title></polygon>');
        });
        out.push('<circle class="kkStat" cx="' + (px(s.x) + Z / 2) + '" cy="' + (py(s.y) + Z / 2) + '" r="4"/>');
      });
      g.innerHTML = out.join('');
      var st = Zg.stand();
      if (st === figur) { gz.innerHTML = ''; return; }
      var gr = figur.groesse, cx = px(st.x) + Z * gr / 2, cy = py(st.y) + Z * gr / 2, r = Z * gr * 0.4, schrift = Math.max(10, Math.min(16, r * (figur.kurz.length > 2 ? 0.75 : 1)));
      gz.innerHTML = '<g class="kkGeist"><title>' + esc(figur.name + ' nach den Wegstücken: ' + feldNameK(K, st.x, st.y)) + '</title><circle class="kkGk" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>' +
        '<text x="' + cx + '" y="' + (cy + schrift * 0.36) + '" text-anchor="middle" font-size="' + schrift + '">' + esc(figur.kurz) + '</text></g>';
    }
    function zeigeRinge() {
      Array.prototype.forEach.call(svg.querySelectorAll('.kkO.kkSel,.kkO.kkZielW,.kkO.kkBonZ'), function (o) { o.classList.remove('kkSel'); o.classList.remove('kkZielW'); o.classList.remove('kkBonZ'); });
      Array.prototype.forEach.call(el.querySelectorAll('.kkIt.kkSelI'), function (i) { i.classList.remove('kkSelI'); });
      function mark(w, kl) { if (!w) return; var o = svg.querySelector('.kkO[data-w="' + w._i + '"]'); if (o) o.classList.add(kl); }
      var a = Zg ? Zg.aktion() : null, b = Zg ? Zg.bonus() : null;
      if (a && a.ziel) mark(a.ziel, 'kkZielW');
      if (b && b.ziel && b.ziel !== figur) mark(b.ziel, 'kkBonZ');
      if (betrachtet) { mark(betrachtet, 'kkSel'); var it = el.querySelector('.kkIt[data-w="' + betrachtet._i + '"]'); if (it) it.classList.add('kkSelI'); }
    }
    // die Lagezeile zum Angriff (seit 1.2): grün bei Vorteil, rot bei Nachteil, blass außer Reichweite; nur mit Ziel
    function zeigeLage() {
      var a = Zg ? Zg.aktion() : null, A = a && a.ziel && (a.kind === 'waffe' || a.kind === 'zauber') ? Zg.lage(a) : null;
      if (!A) { angriff.hidden = true; angriff.innerHTML = ''; angriff.title = ''; return; }
      var L = A.L, warum = L.warum.slice();
      if (Zg.gelegenheiten().some(function (l) { return l.length; })) warum.push('Gelegenheitsangriff: Wer die Reichweite eines Gegners verlässt, fängt dessen Reaktion, außer er nimmt die Aktion Rückzug (PHB).');
      angriff.hidden = false;
      angriff.className = 'kkA' + (L.status === 'aus' ? ' kkAus' : L.netto > 0 ? ' kkVor' : L.netto < 0 ? ' kkNach' : '');
      angriff.innerHTML = lageText(L, A.wf, a.ziel);
      angriff.title = warum.join('\n');
    }
    function zeigeAlles() {
      if (!figur) return;
      zeigeKnoepfe(); zeigeKasten(); zeigeBewegung(); zeigeWeg(); zeigeReich(); zeigeRinge(); zeigeLage();
    }

    /* ---- Texte für die Infozeile: nur, was die Karte nicht zeigt ---- */
    function feldArt(x, y) {
      var a = ARTEN[K.raster[y - 1][x - 1]] || ARTEN['?'];
      if (a.unbekannt) return '';
      return a.kurz + (a.kosten === 2 ? ', schwierig' : '') + (istStufe(K, x, y) && !a.stufe ? ', Rampe' : '');
    }
    function zielText(von, w) {
      var ab = abstand(von, w, K), dh = hoeheVon(K, w) - hoeheVon(K, von);
      return m(ab) + (dh ? ', ' + m(Math.abs(dh)) + (dh > 0 ? ' höher' : ' tiefer') : '');
    }
    // was die Figur über ein Wesen weiß (seit 1.4): Art, Feld, Entfernung vom Stand, Reichweite, Wunde, Zustände, Notiz; keine Höhe in Worten (1.6)
    function wesenText(w, von) {
      var t = ['<b>' + esc(w.name) + '</b>' + (w.kurz !== w.name ? ' (' + esc(w.kurz) + ')' : '') + ' · ' + ART_NAME[w.art] + (w.groesse > 1 ? ', ' + w.groesse + ' × ' + w.groesse + ' Felder' : '')];
      t.push(feldNameK(K, w.x, w.y) + ' · ' + zielText(von, w) + ' von ' + (von === figur ? 'dir' : feldNameK(K, von.x, von.y)));
      if (w._r && w._r > 1) t.push('Reichweite ' + m(w._r));
      if (w._wunde) t.push({ angeschlagen: 'angeschlagen', schwer: 'schwer verletzt', tot: 'tot' }[w._wunde]);
      if (w._tp) t.push('TP ' + w._tp[0] + '/' + w._tp[1]);
      (w.zustaende || []).forEach(function (z) { t.push(z); });
      String(w.zustand || '').split(/[,;]\s*/).forEach(function (teil) {
        var tl = teil.toLowerCase().trim();
        if (!tl) return;
        if (ZUSTAND_WORTE.some(function (p) { return p[0].test(tl); }) || /tot|verletzt|verwundet|blut|angeschlagen|sterbend/.test(tl)) return;
        t.push(esc(teil.trim()));
      });
      if (w.notiz) t.push(esc(w.notiz));
      if (w.art === 'gegner' && kampffaehig(w)) t.push('bedroht ' + Object.keys(zoneVon(w)).length + ' Felder (gestrichelt)');
      return t.join(' · ');
    }
    // was ein neues Wegstück bringt, das die Karte nicht zeigt: Sprung, Ungewisses, Deckung am Ziel
    function wegHinweis(s) {
      var t = [], a = ARTEN[K.raster[s.y - 1][s.x - 1]];
      if (s.hoehe.sprung) t.push('springt ' + m(s.hoehe.sprung) + ' hinab (1W6 Wucht je 3 m, am Boden)');
      if (a && a.unbekannt) t.push('ins Ungewisse');
      if (a && a.deckung) t.push(a.deckung + ' Deckung auf ' + feldNameK(K, s.x, s.y));
      return t.join(' · ');
    }
    // was in die Zugzeile kommt, ohne ein Schritt zu sein: die Waffe, die noch wartet (seit 1.3.1), die Bonusaktion ohne Ziel, das Ziel ohne Waffen
    function extras() {
      var x = [];
      if (!Zg.aktion() && wartet) { var wf = Zg.wirksam(wartet.art, wartet.i); if (wf) x.push((wf.zauber ? 'Zauber: ' : 'Waffe: ') + wf.name); }
      if (!Zg.bonus() && bonusWartet >= 0 && bonus[bonusWartet]) x.push(bonusZeile(K, bonus[bonusWartet], null, Zg.stand(), figur));
      if (zielOhne) x.push('Ziel: ' + zielOhne.name + ' (' + zielText(Zg.stand(), zielOhne) + ')');
      return x;
    }
    // Nach dem Senden bleibt der Kasten mit der Folge stehen, alles andere wird blass; ohne sendPrompt sagt der Kasten, was in den Chat gehört
    function senden(s) {
      var sb = $('button[data-k="zug"]'), zs = $('.kkZkS');
      zs.hidden = false;
      if (typeof sendPrompt === 'function') {
        gesendet = true; el.classList.add('kkFertig'); sb.disabled = true;
        sb.textContent = 'Abgeschickt';
        zs.innerHTML = '<b>' + esc(s) + '</b> · Die Spielleitung erzählt, was geschieht.';
        sendPrompt(s);
      } else zs.innerHTML = 'Schreib das in den Chat: <b>' + esc(s) + '</b>';
    }

    /* ---- Tipps: Wesen, Felder, Knöpfe ---- */
    // ein Tipp auf einen Stein (Karte oder Reihenfolge): die wartende Bonusaktion nimmt ihn, sonst die wartende Waffe (die Aktion vom
    // aktuellen Stand), sonst nennt die Infozeile, was die Figur über ihn weiß, und die Karte seine Zone
    function tippWesen(w) {
      if (gesendet || !figur) return;
      if (bonusWartet >= 0) {
        var bo = bonus[bonusWartet];
        if (bonusErlaubt(bo, w, figur)) { Zg.bonusHinzu(bonusWartet, w); bonusWartet = -1; sag(''); }
        else sag('<b>' + esc(w === figur ? 'Du selbst' : w.name) + '</b> taugt nicht als Ziel für ' + esc(bo.name) + ' (' + esc(bonusZieleText(bo)) + ').');
        zeigeAlles(); return;
      }
      if (w !== figur && wartet && !Zg.aktion()) {
        var s = Zg.aktionHinzu(wartet.art, wartet.i, w);
        betrachtet = w; sag(wesenText(w, Zg.standBei(Zg.schritte.indexOf(s))));
        zeigeZone(w); zeigeAlles(); return;
      }
      if (w === figur) { betrachtet = null; sag(''); zeigeZone(null); zeigeAlles(); return; }
      betrachtet = betrachtet === w ? null : w;
      if (!waffen.length && !zauber.length) zielOhne = betrachtet;
      sag(betrachtet ? wesenText(w, Zg.stand()) : '');
      zeigeZone(betrachtet); zeigeAlles();
    }
    function tippFeld(x, y) {
      if (gesendet || !figur) return;
      var r = Zg.wegHinzu(x, y);
      if (r.ok) { sag(wegHinweis(r.schritt)); zeigeAlles(); return; }
      if (r.fehler === 'steht') {
        // ein Tipp auf den aktuellen Stand (den Geisterstein) nimmt das letzte Wegstück zurück
        var letzt = Zg.schritte[Zg.schritte.length - 1];
        if (letzt && letzt.art === 'weg') { Zg.zurueck(); sag(''); zeigeAlles(); }
        return;
      }
      if (r.fehler === 'besetzt') { sag('Da steht schon jemand: <b>' + esc(r.wesen.name) + '</b>.'); return; }
      if (r.fehler === 'unerreichbar') { var a = ARTEN[K.raster[y - 1][x - 1]]; if (a && a.kosten) sag('Nach ' + esc(feldNameK(K, x, y)) + ' führt in diesem Zug kein Weg.'); return; }
      sag('Bis ' + esc(feldNameK(K, x, y)) + ' sind es ' + m(r.d) + ', du hast noch ' + m(r.rest) + (r.spurt ? '; <b>Spurt</b> (eine Aktion) brächte dich hin.' : '; so weit kommst du in diesem Zug nicht.'));
    }
    svg.addEventListener('click', function (ev) {
      var t = ev.target, o = t && t.closest ? t.closest('.kkO') : null;
      if (o) { var w = K.wesen[+o.getAttribute('data-w')]; if (w) tippWesen(w); return; }
      var f = t && t.closest ? t.closest('g.kkF') : null;
      if (!f) return;
      tippFeld(+f.getAttribute('data-x'), +f.getAttribute('data-y'));
    });
    el.addEventListener('click', function (ev) {
      var it = ev.target && ev.target.closest ? ev.target.closest('.kkIt[data-w]') : null;
      if (it) { var wi = K.wesen[+it.getAttribute('data-w')]; if (wi) tippWesen(wi); return; }
      var b = ev.target && ev.target.closest ? ev.target.closest('button[data-k]') : null;
      if (!b) return;
      var k = b.getAttribute('data-k'), i = +b.getAttribute('data-i') || 0;
      if (k === 'leg') { leg.hidden = !leg.hidden; bLeg.setAttribute('aria-expanded', String(!leg.hidden)); return; }
      if (k === 'plus') { stufe = Math.min(STUFEN.length - 1, stufe + 1); stelle(); zurFigur(); return; }
      if (k === 'minus') { stufe = Math.max(0, stufe - 1); stelle(); zurFigur(); return; }
      if (k === 'figur') { zurFigur(); return; }
      if (k === 'blatt') { blaettern(b.getAttribute('data-r')); return; }
      if (k === 'gefahr') { gefahrAn = !gefahrAn; b.setAttribute('aria-pressed', String(gefahrAn)); zeigeGefahr(gefahrAn); return; }
      if (gesendet || !figur) { if (k === 'zug' && !figur) sag('Ohne Figur auf der Karte gibt es keinen Zug; schreib in den Chat, was sie tut.'); return; }
      var a = Zg.aktion(), bo = Zg.bonus();
      if (k === 'waffe') {
        var w2 = waffen[i]; if (!w2) return;
        if (a) {
          if (a.kind === 'waffe' && a.idx === i) { if (w2.modi.length > 1) Zg.modus[i] = (Zg.modus[i] + 1) % w2.modi.length; else { Zg.entferne(a); wartet = { art: 'waffe', i: i }; } }
          else if (a.kind === 'zauber' && zauber[a.idx] && zauber[a.idx].mit && Zg.waffeIdx === i && w2.modi.length > 1) Zg.modus[i] = (Zg.modus[i] + 1) % w2.modi.length;
          else return;
        } else if (wartet && wartet.art === 'waffe' && wartet.i === i) { if (w2.modi.length > 1) Zg.modus[i] = (Zg.modus[i] + 1) % w2.modi.length; else wartet = null; }
        else { wartet = { art: 'waffe', i: i }; Zg.waffeIdx = i; }
      } else if (k === 'zauber') {
        if (!zauber[i]) return;
        if (a) { if (a.kind === 'zauber' && a.idx === i) { Zg.entferne(a); wartet = { art: 'zauber', i: i }; } else return; }
        else if (wartet && wartet.art === 'zauber' && wartet.i === i) wartet = null;
        else wartet = { art: 'zauber', i: i };
      } else if (k === 'spurt' || k === 'rueckzug' || k === 'aktion') {
        var kind = k === 'aktion' ? 'frei' : k;
        if (k === 'aktion' && !aktionen[i]) return;
        if (a) { if (a.kind === kind && (kind !== 'frei' || a.idx === i)) Zg.entferne(a); else return; }
        else Zg.aktionHinzu(kind, i, null);
      } else if (k === 'bonus') {
        var x = bonus[i]; if (!x) return;
        if (bo) { if (bo.idx === i) Zg.entferne(bo); else return; }
        else if (bonusWartet === i) bonusWartet = -1;
        else {
          if (x.art === 'waffe' && !Zg.zweitwaffeErlaubt()) return;
          if (x.ohneZiel) Zg.bonusHinzu(i, null); else if (x.nurSelbst) Zg.bonusHinzu(i, figur); else bonusWartet = i;
        }
      } else if (k === 'auf') { Zg.aufstehen = !Zg.aufstehen; Zg.pruefe(); }
      else if (k === 'zurueck') { Zg.zurueck(); sag(''); }
      else if (k === 'zug') { senden(Zg.zeile(D, (eingabe.value || '').trim(), extras())); return; }
      zeigeAlles();
    });
    el.addEventListener('keydown', function (ev) {
      var it = ev.target && ev.target.classList && ev.target.classList.contains('kkIt') ? ev.target : null;
      if (it && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); it.click(); }
    });
    eingabe.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); $('[data-k="zug"]').click(); } });

    /* ---- Blättern, Größe, zur Figur (seit 1.1 und 1.4) ---- */
    var leiste = el.querySelector('.kkZl'), rahmenW = el.querySelector('.kkRW');
    function pfeile() {
      var l = rahmen.scrollLeft, t = rahmen.scrollTop, mw = rahmen.scrollWidth - rahmen.clientWidth, mh = rahmen.scrollHeight - rahmen.clientHeight;
      var an = { w: l > 4, e: l < mw - 4, n: t > 4, s: t < mh - 4 };
      Object.keys(an).forEach(function (r) { var b = rahmenW.querySelector('.kkBl-' + r); if (b) b.hidden = !an[r]; });
    }
    function blaettern(r) {
      var dx = r === 'e' ? rahmen.clientWidth * 0.8 : r === 'w' ? -rahmen.clientWidth * 0.8 : 0, dy = r === 's' ? rahmen.clientHeight * 0.8 : r === 'n' ? -rahmen.clientHeight * 0.8 : 0;
      if (rahmen.scrollBy) rahmen.scrollBy({ left: dx, top: dy, behavior: 'smooth' }); else { rahmen.scrollLeft += dx; rahmen.scrollTop += dy; }
      setTimeout(pfeile, 400);
    }
    rahmen.addEventListener('scroll', pfeile);
    function stelle() {
      var breit = rahmen.getBoundingClientRect().width || 380;
      var faktor = STUFEN[stufe];
      if (!stufe) { var minZ = 36; faktor = Math.max(1, minZ / (breit / (W / Z))); }
      svg.style.width = Math.round(breit * faktor) + 'px';
      var f = Math.round(breit * faktor) / W, zl = [];
      if (faktor > 1.02) for (var y = 1; y <= K.ze; y++) zl.push('<span style="top:' + Math.round((py(y) + Z / 2) * f) + 'px">' + (ZEILEN[(D._uy + y - 2) % 26] || '?') + '</span>');
      leiste.innerHTML = zl.join('');
      pfeile();
    }
    function zurFigur() {
      if (!figur) return;
      var breit = svg.getBoundingClientRect().width || 380, f = breit / W;
      rahmen.scrollLeft = Math.max(0, (px(figur.x) + Z / 2) * f - rahmen.clientWidth / 2);
      rahmen.scrollTop = Math.max(0, (py(figur.y) + Z / 2) * f - rahmen.clientHeight / 2);
      pfeile();
    }

    if (window.ResizeObserver) new ResizeObserver(stelle).observe(rahmen);
    else window.addEventListener('resize', stelle);
    stelle(); zurFigur();
    if (!figur) sag('Die Figur steht nicht auf der Karte; die Spielleitung erzählt die Lage.');
    else zeigeAlles();
    if (D.hinweis) sag(esc(D.hinweis) + (info.innerHTML ? ' · ' + info.innerHTML : ''));
  }

  function start() {
    var el = document.getElementById('kampf'), D = window.KAMPF;
    if (!el || !D) return;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Die Kampfkarte ließ sich nicht zeichnen: ' + err.message; }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { zeichne: zeichne, lies: lies, wege: wege, pfad: pfad, pfadHoehe: pfadHoehe, abstand: abstand, hoehe: hoehe, feldName: feldName,
    felder: felder, waffeInfo: waffeInfo, bedroht: bedroht, zone: zone, gelegenheiten: gelegenheiten, linie: linie, deckung: deckung, angriffsLage: angriffsLage, lageKurz: lageKurz,
    wirksam: wirksam, kampffaehig: kampffaehig, wehrlos: wehrlos, kachelBild: kachelBild, plaketteBild: plaketteBild, zustaende: Object.keys(STATUS), arten: ARTEN, version: VERSION,
    bonusInfo: bonusInfo, bonusErlaubt: bonusErlaubt, bonusZeile: bonusZeile,
    // seit 1.6: der Zug als Folge, die Zeichen der Schadensarten, Aktionen ohne Ziel
    zugModell: zugModell, zeichenBild: zeichenBild, zeichenVon: zeichenVon, waffenZeichen: waffenZeichen, schadensarten: SCHADENSARTEN, aktionInfo: aktionInfo };
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
