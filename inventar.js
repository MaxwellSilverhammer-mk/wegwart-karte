/*
 * Wegwart-Gepäck – Inventar für die geteilte Welt „Hold der Seeprinzen“
 * Version 3.0
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Inventar: Probefigurs Gepäck</h2>
 *   <div id="gepaeck">Gepäck lädt …</div>
 *   <script>var INVENTAR={titel:'Probefigurs Gepäck', stand:'Stand: Tag 8', geld:{ga:3,sm:5}, traeger:[…]}<\/script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/inventar.js';document.head.appendChild(s);<\/script>
 *
 * Pergament wie der Kartentisch: Geldbeutel, Rationen, Traglast je Träger und die Dinge,
 * die die Figur bei sich hat, jedes mit seinem Zeichen: ein Strichbild wie im Würfelkasten (seite/zeichen.js) auf einem
 * Plättchen, dessen Ring die Seltenheit färbt (seltenheit, wie bei D&D Beyond) und das unten rechts eine Marke trägt (marke:
 * gesiegelt, beschädigt, benannt, unbekannt).
 * Die Zeile zeigt rechts den wichtigsten Wert
 * (Vorrat, Schaden, RK, Anzahl), wer ein Ding antippt, sieht seine Werte: Angriff, Schaden, Reichweite,
 * Merkmale, Vorrat, Wirkung, Zustand, bei Schriftstücken den Wortlaut. Was die Figur über ein Ding weiß
 * und woher es stammt, steht im Glossar; der Tisch zeigt notiz, herkunft und quelle nicht (seit 2.0).
 * Die Daten kommen aus dem Spielstand und werden vorher mit pruefen.js geprüft (README).
 */
(function () {
  'use strict';

  var VERSION = '3.0';

  /* ---------- Arten und Gruppen ---------- */
  // Art → [Tabler-Zeichen für den Händlertisch, Gruppe]
  var DINGART = {
    waffe: ['sword', 'waffen'], ruestung: ['shield', 'waffen'], kleidung: ['shirt', 'kleidung'], kostuem: ['masks-theater', 'kleidung'],
    instrument: ['music', 'instrumente'],
    werkzeug: ['tool', 'ausruestung'], schreibzeug: ['pencil', 'ausruestung'], licht: ['flame', 'ausruestung'], seil: ['spiral', 'ausruestung'], behaelter: ['backpack', 'ausruestung'],
    schlafzeug: ['bed', 'ausruestung'], tierbedarf: ['horse', 'ausruestung'], boot: ['sailboat', 'ausruestung'],
    ration: ['baguette', 'proviant'], proviant: ['bottle', 'proviant'], trank: ['flask', 'proviant'],
    papier: ['file-text', 'papiere'], brief: ['mail', 'papiere'], karte: ['map', 'papiere'],
    zeichen: ['bookmark', 'zeichen'], andenken: ['flag', 'zeichen'], fund: ['search', 'zeichen'], wertsache: ['diamond', 'zeichen'],
    spiel: ['cards', 'sonstiges'], sonstiges: ['point', 'sonstiges']
  };
  var GRUPPEN = [['waffen', 'Waffen und Rüstung'], ['kleidung', 'Kleidung'], ['instrumente', 'Instrumente'], ['ausruestung', 'Ausrüstung'],
    ['proviant', 'Proviant'], ['papiere', 'Papiere'], ['zeichen', 'Zeichen und Fundstücke'], ['sonstiges', 'Sonstiges']];
  var TRAEGERART = { figur: 'user', gefolge: 'user', lasttier: 'horse', reittier: 'horse', lager: 'home' };
  var MUENZEN = [
    ['pm', 'Highlord', 'Highlords', '#9aa3ab', '#d9dee2'],
    ['ga', 'Goldadmiral', 'Goldadmirale', '#a67c1a', '#e8c766'],
    ['em', 'Bright Ship', 'Bright Ships', '#8f8450', '#d6cb8e'],
    ['sm', 'Silber', 'Silber', '#7d8085', '#cfd2d6'],
    ['km', 'Common', 'Common', '#8a4b2a', '#d49a6a']
  ];
  var WERT = { pm: 10, ga: 1, em: 0.5, sm: 0.1, km: 0.01 };

  /* ---------- Zeichen (seite/zeichen.js) ---------- */
// ZEICHEN-ANFANG (gemeinsam für inventar.js und handel.js; ändern nur in seite/zeichen.js, dann node seite/zeichen.js --einbauen)
  var ZEICHEN = {
    schwert: ['M20 4v5l-9 7l-4 4l-3 -3l4 -4l7 -9l5 0', 'M6.5 11.5l6 6'],
    dolch: ['M20 4l-1.5 6.5l-6 6l-3 -3l6 -6z', 'M20 4l-9 9', 'M8.5 12.5l5 5', 'M11 15l-5 5', 'M5.5 20.5h.01'],
    saebel: ['M20 3c0 7 -4 12 -10 15l-2 -2c5 -3 8 -7 9 -13z', 'M9 17l-4 4', 'M6 15l4 4'],
    axt: ['M13 9l7.383 7.418c.823 .82 .823 2.148 0 2.967a2.11 2.11 0 0 1 -2.976 0l-7.407 -7.385', 'M6.66 15.66l-3.32 -3.32a1.25 1.25 0 0 1 .42 -2.044l3.24 -1.296l6 -6l3 3l-6 6l-1.296 3.24a1.25 1.25 0 0 1 -2.044 .42'],
    kolben: ['M4 20l7.5 -7.5', 'M16 3l3.5 1.5l1.5 3.5l-1.5 3.5l-3.5 1.5l-3.5 -1.5l-1.5 -3.5l1.5 -3.5z'],
    keule: ['M4 20l2 -3l6 -9c2 -3 6 -4 8 -2c2 2 1 6 -2 8l-9 6z'],
    speer: ['M4 20l11 -11', 'M20 4l-2 6l-4 -4z'],
    glefe: ['M4 20l10 -10', 'M14 10c-1 -4 2 -7 6 -7c0 4 -2 7 -5 8', 'M14 10l2 2'],
    bogen: ['M6 3c7 3 7 15 0 18', 'M6 3v18', 'M6 12h13', 'M16 9l3 3l-3 3'],
    armbrust: ['M3 8c4 -4 14 -4 18 0', 'M3 8h18', 'M12 4v17', 'M9 21h6', 'M12 15h4'],
    bolzen: ['M6 18l12 -12', 'M18 6h-4m4 0v4', 'M8 16l-2 1m2 -1l1 2', 'M6 18l-2 2'],
    koecher: ['M8 9h8v11a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2z', 'M11 9v-7m3 7v-6m-6 6v-5', 'M8 15h8'],
    schild: ['M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3'],
    ruestung: ['M6 4l6 2l6 -2v9c0 4 -3 7 -6 8c-3 -1 -6 -4 -6 -8z', 'M9 4c0 2 1 3 3 3s3 -1 3 -3', 'M12 7v14'],
    kettenhemd: ['M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0', 'M9 12h.01m3 0h.01m3 0h.01m-4.5 3h.01m3 0h.01m-4.5 3h.01m3 0h.01m3 0h.01'],
    kleidung: ['M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0'],
    mantel: ['M16 3l-4 5l-4 -5', 'M12 19a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-8.172a2 2 0 0 1 .586 -1.414l.828 -.828a2 2 0 0 0 .586 -1.414v-2.172a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v2.172a2 2 0 0 0 .586 1.414l.828 .828a2 2 0 0 1 .586 1.414v8.172a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2', 'M20 13h-3a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h3', 'M4 17h3a1 1 0 0 0 1 -1v-2a1 1 0 0 0 -1 -1h-3', 'M12 19v-11'],
    kostuem: ['M13.192 9h6.616a2 2 0 0 1 1.992 2.183l-.567 6.182a4 4 0 0 1 -3.983 3.635h-1.5a4 4 0 0 1 -3.983 -3.635l-.567 -6.182a2 2 0 0 1 1.992 -2.183', 'M15 13h.01', 'M18 13h.01', 'M15 16.5c1 .667 2 .667 3 0', 'M8.632 15.982a4.037 4.037 0 0 1 -.382 .018h-1.5a4 4 0 0 1 -3.983 -3.635l-.567 -6.182a2 2 0 0 1 1.992 -2.183h6.616a2 2 0 0 1 2 2', 'M6 8h.01', 'M9 8h.01', 'M6 12c.764 -.51 1.528 -.63 2.291 -.36'],
    verkleidung: ['M3 11h18', 'M5 11v-4a3 3 0 0 1 3 -3h8a3 3 0 0 1 3 3v4', 'M4 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M14 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M10 17h4'],
    laute: ['M4 15a5 5 0 1 0 10 0a5 5 0 1 0 -10 0', 'M9 15h.01', 'M12.5 11.5l7.5 -7.5', 'M18 3l3 3'],
    floete: ['M3 19l16 -16', 'M5 21l16 -16', 'M3 19l2 2m14 -18l2 2', 'M9 15h.01m3 -3h.01m3 -3h.01'],
    trommel: ['M4 8a8 3 0 0 0 16 0a8 3 0 0 0 -16 0v9a8 3 0 0 0 16 0v-9', 'M7 10.5v6m10 -6v6', 'M3 3l5 4m13 -4l-5 4'],
    horn: ['M4 18c0 -7 7 -13 15 -14', 'M8 20c2 -6 7 -10 12 -11', 'M19 4a1.5 2.5 0 1 1 1 5', 'M4 18a2 2 0 0 0 4 2'],
    seil: ['M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0', 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', 'M20 12c0 4 -1 7 -4 9'],
    kerze: ['M9 21h6v-10a1 1 0 0 0 -1 -1h-4a1 1 0 0 0 -1 1l0 10', 'M12 2l1.465 1.638a2 2 0 1 1 -3.015 .099l1.55 -1.737'],
    laterne: ['M8 9h8v8a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2z', 'M9 9v-2h6v2', 'M9 7a3 3 0 0 1 6 0', 'M12 16c-1.5 -1.5 -.5 -3 0 -4c.5 1 1.5 2.5 0 4', 'M9 21h6'],
    fackel: ['M12 21v-9', 'M9 12h6', 'M9 11c-1 -3 0 -5 3 -8c3 3 4 5 3 8', 'M12 10c-1 -1 -1 -2 0 -3c1 1 1 2 0 3'],
    decke: ['M5 12a2.5 4 0 1 0 5 0a2.5 4 0 1 0 -5 0', 'M7.5 8h11a2.5 4 0 0 1 0 8h-11'],
    schlafsack: ['M5 12a2.5 4 0 1 0 5 0a2.5 4 0 1 0 -5 0', 'M7.5 8h11a2.5 4 0 0 1 0 8h-11', 'M12 8v8m4 -8v8'],
    netz: ['M4 4l16 16', 'M20 4l-16 16', 'M12 4l8 8l-8 8l-8 -8z'],
    rucksack: ['M5 18v-6a6 6 0 0 1 6 -6h2a6 6 0 0 1 6 6v6a3 3 0 0 1 -3 3h-8a3 3 0 0 1 -3 -3', 'M10 6v-1a2 2 0 1 1 4 0v1', 'M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4', 'M11 10h2'],
    schlauch: ['M9 3h6l-1 3c4 2 5 5 5 9a5 5 0 0 1 -5 5h-4a5 5 0 0 1 -5 -5c0 -4 1 -7 5 -9z', 'M9 6h6'],
    werkzeug: ['M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5'],
    striegel: ['M3 21v-4a4 4 0 1 1 4 4h-4', 'M21 3a16 16 0 0 0 -12.8 10.2', 'M21 3a16 16 0 0 1 -10.2 12.8', 'M10.6 9a9 9 0 0 1 4.4 4.4'],
    boot: ['M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1', 'M4 18l-1 -3h18l-1 3', 'M11 12h7l-7 -9v9', 'M8 7l-2 5'],
    kette: ['M9 15l6 -6', 'M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464', 'M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463'],
    kompass: ['M8 16l2 -6l6 -2l-2 6l-6 2', 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 3l0 2', 'M12 19l0 2', 'M3 12l2 0', 'M19 12l2 0'],
    schluessel: ['M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0', 'M15 9h.01'],
    ration: ['M18 4a3 3 0 0 1 2 5.235v8.765a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-8.764a3 3 0 0 1 1.824 -5.231h12.176v-.005'],
    fisch: ['M16.69 7.44a6.973 6.973 0 0 0 -1.69 4.56c0 1.747 .64 3.345 1.699 4.571', 'M2 9.504c7.715 8.647 14.75 10.265 20 2.498c-5.25 -7.761 -12.285 -6.142 -20 2.504', 'M18 11v.01', 'M11.5 10.5c-.667 1 -.667 2 0 3'],
    kraut: ['M5 21c.5 -4.5 2.5 -8 7 -10', 'M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3l.014 0'],
    schale: ['M4 8h16a1 1 0 0 1 1 1v.5c0 1.5 -2.517 5.573 -4 6.5v1a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1v-1c-1.687 -1.054 -4 -5 -4 -6.5v-.5a1 1 0 0 1 1 -1'],
    trank: ['M9 3l6 0', 'M10 9l4 0', 'M10 3v6l-4 11a.7 .7 0 0 0 .5 1h11a.7 .7 0 0 0 .5 -1l-4 -11v-6'],
    flasche: ['M10 5h4v-2a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v2', 'M14 3.5c0 1.626 .507 3.212 1.45 4.537l.05 .07a8.093 8.093 0 0 1 1.5 4.694v6.199a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2v-6.2c0 -1.682 .524 -3.322 1.5 -4.693l.05 -.07a7.823 7.823 0 0 0 1.45 -4.537', 'M7 14.803a2.4 2.4 0 0 0 1 -.803a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 1 -.805'],
    brief: ['M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10', 'M3 7l9 6l9 -6'],
    zettel: ['M13 20l7 -7', 'M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7'],
    siegel: ['M12 15a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M13 17.5v4.5l2 -1.5l2 1.5v-4.5', 'M10 19h-5a2 2 0 0 1 -2 -2v-10c0 -1.1 .9 -2 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -1 1.73', 'M6 9l12 0', 'M6 12l3 0', 'M6 15l2 0'],
    rolle: ['M17 20h-11a3 3 0 0 1 0 -6h11a3 3 0 0 0 0 6h1a3 3 0 0 0 3 -3v-11a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v8'],
    karte: ['M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13', 'M9 4v13', 'M15 7v13'],
    buch: ['M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0', 'M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0', 'M3 6l0 13', 'M12 6l0 13', 'M21 6l0 13'],
    tinte: ['M8 9h8v9a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2z', 'M7 9h10', 'M10 9v-3h4v3', 'M12 14v2'],
    feder: ['M4 20l10 -10m0 -5v5h5m-9 -1v5h5m-9 -1v5h5m-5 -5l4 -4l4 -4', 'M19 10c.638 -.636 1 -1.515 1 -2.486a3.515 3.515 0 0 0 -3.517 -3.514c-.97 0 -1.847 .367 -2.483 1m-3 13l4 -4l4 -4'],
    wachs: ['M15 9l6 -6', 'M4 14a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M10 14h.01'],
    kohle: ['M4 17l12 -12l3 3l-12 12l-4 1z', 'M15 6l2 2'],
    beutel: ['M9.5 3h5a1.5 1.5 0 0 1 1.5 1.5a3.5 3.5 0 0 1 -3.5 3.5h-1a3.5 3.5 0 0 1 -3.5 -3.5a1.5 1.5 0 0 1 1.5 -1.5', 'M4 17v-1a8 8 0 1 1 16 0v1a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4'],
    muenze: ['M3 13a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M12 7.5a6 6 0 1 1 5 10'],
    ring: ['M6 14a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M9 6l3 -3l3 3l-3 3z'],
    juwel: ['M6 5h12l3 5l-8.5 9.5a.7 .7 0 0 1 -1 0l-8.5 -9.5l3 -5', 'M10 12l-2 -2.2l.6 -1'],
    perle: ['M7 12a5 5 0 1 0 10 0a5 5 0 1 0 -10 0', 'M9.5 10.5a3 3 0 0 1 2 -1.5', 'M4 19c2 1 14 1 16 0'],
    band: ['M4 8c5 -3 11 -3 16 0v8c-5 -3 -11 -3 -16 0z', 'M4 12c5 -3 11 -3 16 0'],
    'band-blau': ['M4 8c5 -3 11 -3 16 0v8c-5 -3 -11 -3 -16 0z', 'M4 12c5 -3 11 -3 16 0'],
    flagge: ['M5 14h14l-4.5 -4.5l4.5 -4.5h-14v16'],
    scheibe: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0'],
    seide: ['M6 4h12', 'M6 20h12', 'M8 4v16', 'M16 4v16', 'M8 8h8m-8 4h8m-8 4h8'],
    schwimmer: ['M12 3v4m0 14v-4', 'M8 12a4 6 0 1 0 8 0a4 6 0 1 0 -8 0', 'M8 12h8'],
    tuch: ['M3 5h18', 'M6 5v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2v-13', 'M6 11h12'],
    karten: ['M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304l0 .001', 'M15 4h1a1 1 0 0 1 1 1v3.5', 'M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374'],
    buendel: ['M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5', 'M12 12l8 -4.5', 'M12 12l0 9', 'M12 12l-8 -4.5', 'M16 5.25l-8 4.5'],
    punkt: ['M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0']
  };
  // Seltenheit wie bei D&D Beyond: Farbe des Rings und des Namens; gewöhnlich bleibt Tinte
  var SELTENHEIT = {
    gewoehnlich: ['gewöhnlich', ''], ungewoehnlich: ['ungewöhnlich', '#3f7a2f'], selten: ['selten', '#2a62a8'],
    sehr_selten: ['sehr selten', '#6a3fa8'], legendaer: ['legendär', '#c7641a']
  };
  // Marken: ein kleines Zeichen unten rechts am Plättchen [Beschriftung, Füllung, Strich, Bild (Pfade in 12 × 12)]
  var MARKEN = {
    siegel: ['gesiegelt', '#9b2f22', '#f3d9a6', ['M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0']],
    beschaedigt: ['beschädigt', '#efe2c3', '#3b3028', ['M3 2l3 4l-2 1l3 3']],
    benannt: ['benannt', '#c9a227', '#5a4a1a', ['M6 2.5l1.1 2.3l2.5 .3l-1.8 1.7l.5 2.5l-2.3 -1.2l-2.3 1.2l.5 -2.5l-1.8 -1.7l2.5 -.3z']],
    unbekannt: ['unbekannt', '#efe2c3', '#3b3028', ['M4.3 4.5a1.7 1.7 0 1 1 2.4 1.6c-.5 .3 -.7 .6 -.7 1.2', 'M6 9.3h.01']]
  };
  // Zeichen aus Art und Namen raten, wenn das Ding kein `ikone` trägt: [Muster, Zeichen, nur für diese Arten]
  var RATEN = [
    [/dolch|messer/i, 'dolch', ['waffe']], [/krumms|säbel|saebel/i, 'saebel', ['waffe']], [/schwert|klinge/i, 'schwert', ['waffe']],
    [/axt|beil/i, 'axt', ['waffe', 'werkzeug']], [/kolben|morgenstern/i, 'kolben', ['waffe']], [/keule|knüppel/i, 'keule', ['waffe']],
    [/armbrust/i, 'armbrust', ['waffe']], [/köcher/i, 'koecher'], [/bolzen|pfeil/i, 'bolzen', ['waffe']], [/bogen/i, 'bogen', ['waffe']],
    [/glefe/i, 'glefe', ['waffe']], [/speer|pike|lanze|spieß/i, 'speer', ['waffe']], [/schild/i, 'schild', ['waffe', 'ruestung']],
    [/kettenhemd|panzerhemd/i, 'kettenhemd', ['ruestung']], [/mantel|umhang/i, 'mantel'], [/verkleidung|maske|schminke/i, 'verkleidung'],
    [/flöte|pfeife/i, 'floete'], [/laute|harfe|fiedel|leier/i, 'laute'], [/trommel/i, 'trommel'], [/horn/i, 'horn', ['instrument', 'werkzeug']],
    [/laterne/i, 'laterne'], [/fackel/i, 'fackel'], [/kerze/i, 'kerze'], [/schlafsack/i, 'schlafsack'], [/decke/i, 'decke'],
    [/schwimmer/i, 'schwimmer'], [/netz/i, 'netz'], [/striegel|bürste|kardätsche/i, 'striegel'],
    [/tinte/i, 'tinte'], [/feder/i, 'feder'], [/wachs/i, 'wachs'], [/kohle|stift|kreide/i, 'kohle'],
    [/siegelbrief|urkunde/i, 'siegel'], [/zettel|notiz|streifen/i, 'zettel'], [/schriftrolle|rolle/i, 'rolle'], [/buch/i, 'buch', ['papier', 'wertsache', 'sonstiges', 'fund']],
    [/karte/i, 'karte'], [/schlüssel/i, 'schluessel'], [/kompass/i, 'kompass'], [/kette|fessel/i, 'kette'],
    [/blaues band/i, 'band-blau'], [/band/i, 'band'], [/flagge|banner|wimpel/i, 'flagge'], [/\bring\b/i, 'ring'],
    [/juwel|edelstein|rubin|smaragd|saphir/i, 'juwel'], [/perle/i, 'perle'], [/scheibe/i, 'scheibe'], [/seide|faser/i, 'seide'],
    [/münz|geldbeutel|beutel mit/i, 'beutel'], [/aal|fisch/i, 'fisch'], [/flasche/i, 'flasche'], [/trank|elixier/i, 'trank'],
    [/schlauch|wasser/i, 'schlauch'], [/schlamm|salbe|schale/i, 'schale'], [/kraut|kräuter/i, 'kraut'], [/tuch|leinen/i, 'tuch'],
    [/wetzstein|schleifstein/i, 'werkzeug'], [/rucksack|tasche|ranzen/i, 'rucksack'], [/bündel/i, 'buendel']
  ];
  var ARTZEICHEN = {
    waffe: 'schwert', ruestung: 'ruestung', kleidung: 'kleidung', kostuem: 'kostuem', instrument: 'laute', werkzeug: 'werkzeug',
    schreibzeug: 'feder', licht: 'kerze', seil: 'seil', behaelter: 'rucksack', schlafzeug: 'decke', tierbedarf: 'striegel', boot: 'boot',
    ration: 'ration', proviant: 'schlauch', trank: 'trank', papier: 'rolle', brief: 'brief', karte: 'karte',
    zeichen: 'band', andenken: 'flagge', fund: 'perle', wertsache: 'beutel', spiel: 'karten', sonstiges: 'buendel'
  };
  // Arten, bei denen der Name das Zeichen nicht ändert (ein Hanfseil bleibt ein Seil, Rationen bleiben Rationen)
  var FEST = { seil: 1, ration: 1, spiel: 1, boot: 1 };
  function ikoneVon(d) {
    if (d.ikone && ZEICHEN[d.ikone]) return d.ikone;
    if (!FEST[d.art]) for (var i = 0; i < RATEN.length; i++) {
      var r = RATEN[i];
      if (r[0].test(d.name || '') && (!r[2] || r[2].indexOf(d.art) >= 0)) return r[1];
    }
    return ARTZEICHEN[d.art] || 'punkt';
  }
  function seltenheitVon(d) { return SELTENHEIT[d.seltenheit] ? d.seltenheit : 'gewoehnlich'; }
  // Das Zeichen eines Dings als Strichbild; `px` ist die Kantenlänge
  function zeichenSvg(d, px) {
    var p = ZEICHEN[ikoneVon(d)] || ZEICHEN.punkt;
    return '<svg class="wgZ" viewBox="0 0 24 24" width="' + px + '" height="' + px + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      p.map(function (q) { return '<path d="' + q + '"/>'; }).join('') + '</svg>';
  }
  // Die Marke eines Dings, 14 × 14, oder leer
  function markeSvg(d) {
    var m = MARKEN[d.marke];
    if (!m) return '';
    return '<svg class="wgMk" viewBox="0 0 12 12" width="14" height="14" aria-hidden="true"><circle cx="6" cy="6" r="5.5" fill="' + m[1] + '" stroke="' + m[2] + '" stroke-width="1"/>' +
      m[3].map(function (q) { return '<path d="' + q + '" fill="none" stroke="' + m[2] + '" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'; }).join('') + '</svg>';
  }
  // Das Plättchen: Zeichen in einem Ring in der Farbe der Seltenheit, Marke unten rechts, Anzahl unten links;
  // groesse: 'k' (klein, Händlertisch), '' (Zeile), 'g' (groß, Fenster)
  function plaettchen(d, groesse, anzahl) {
    var s = SELTENHEIT[seltenheitVon(d)], px = groesse === 'g' ? 72 : groesse === 'k' ? 28 : 38, z = groesse === 'g' ? 44 : groesse === 'k' ? 18 : 24;
    return '<span class="wgPl' + (groesse ? ' wgPl' + groesse.toUpperCase() : '') + '" style="width:' + px + 'px;height:' + px + 'px' + (s[1] ? ';--selten:' + s[1] : '') + '">' +
      zeichenSvg(d, z) + markeSvg(d) + (anzahl != null && anzahl !== 1 ? '<b class="wgAnz">' + anzahl + '</b>' : '') + '</span>';
  }
  var ZEICHEN_CSS = '.wgPl{position:relative;display:inline-grid;place-items:center;flex-shrink:0;border-radius:50%;color:var(--ink,#3b3028);background:rgba(59,48,40,.06);box-shadow:inset 0 0 0 1.5px var(--selten,rgba(59,48,40,.45))}' +
    '.wgPl .wgZ{display:block}.wgMk{position:absolute;right:-2px;bottom:-2px}' +
    '.wgAnz{position:absolute;left:-3px;bottom:-4px;min-width:16px;padding:0 4px;box-sizing:border-box;font:600 12px/16px ui-monospace,Menlo,Consolas,monospace;color:#efe2c3;background:var(--ink,#3b3028);border-radius:8px;text-align:center}' +
    '.wgPlG .wgMk{width:20px;height:20px;right:0;bottom:0}.wgPlK .wgMk{width:12px;height:12px;right:-3px;bottom:-3px}.wgPlK .wgAnz{font-size:11px;line-height:14px;min-width:14px;left:-4px}';
// ZEICHEN-ENDE
  var ARTNAME = {
    waffe: 'Waffe', ruestung: 'Rüstung', kleidung: 'Kleidung', kostuem: 'Kostüm', instrument: 'Instrument', werkzeug: 'Werkzeug',
    schreibzeug: 'Schreibzeug', licht: 'Licht', seil: 'Seil', behaelter: 'Behälter', schlafzeug: 'Schlafzeug', tierbedarf: 'Für Tiere',
    boot: 'Boot', ration: 'Proviant', proviant: 'Proviant', trank: 'Trank', papier: 'Schriftstück', brief: 'Brief', karte: 'Karte',
    zeichen: 'Zeichen', andenken: 'Andenken', fund: 'Fundstück', wertsache: 'Wertsache', spiel: 'Spiel', sonstiges: ''
  };

  /* ---------- Schema für die Prüfung (pruefen.js) ---------- */
  var SCHEMA = {
    name: 'Inventar',
    wurzel: 'inventar',
    felder: {
      inventar: { titel: 'text', stand: 'text', figur: 'text', geld: 'geld', esser: 'zahl', traeger: 'traeger[]' },
      geld: { pm: 'zahl', ga: 'zahl', em: 'zahl', sm: 'zahl', km: 'zahl' },
      traeger: { id: 'id', name: 'text', namen: 'text[]', art: 'traegerart', staerke: 'zahl', faktor: 'zahl', ort: 'text', dinge: 'ding[]' },
      ding: { name: 'text', namen: 'text[]', art: 'dingart', ikone: 'ikone', seltenheit: 'seltenheit', marke: 'marke', anzahl: 'zahl', kg: 'zahl',
        angriff: 'text', schaden: 'text', zweihand: 'text', reichweite: 'text', rk: 'zahl', merkmale: 'text[]',
        vorrat: 'zahlen', einheit: 'text', wirkung: 'text', zustand: 'text',
        notiz: 'text', herkunft: 'text', quelle: 'text', wortlaut: 'text', glossar: 'text' }
    },
    wahl: { traegerart: Object.keys(TRAEGERART), dingart: Object.keys(DINGART), ikone: Object.keys(ZEICHEN), seltenheit: Object.keys(SELTENHEIT), marke: Object.keys(MARKEN) },
    pflicht: { inventar: ['titel', 'stand', 'traeger'], geld: [], traeger: ['id', 'name', 'art'], ding: ['name', 'art'] },
    // Werte, deren Zahlen im Spielstand stehen müssen, prüft der Wortschatz mit (jede Zahl in einem Text)
    // Namen, die wörtlich (oder in einer Schreibweise aus „namen“) im Spielstand stehen müssen
    namen: { traeger: 'name', ding: 'name' },
    // Texte, die eine Stelle im Spielstand belegen muss (Anteil der Inhaltswörter)
    belege: { ding: { notiz: 0.7, herkunft: 0.7, wortlaut: 0.9 } },
    // Felder, die eine Person oder Quelle nennen; sie muss im Spielstand vorkommen
    quellen: { ding: ['quelle', 'glossar'] }
  };

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function zahl(v, d) { v = +v; return isFinite(v) ? v : (d || 0); }
  function kg(n) {
    var r = Math.round(n * 10) / 10;
    return String(r).replace('.', ',') + ' kg';
  }
  function ikon(name, gr) {
    return '<i class="ti ti-' + name + '" aria-hidden="true"' + (gr ? ' style="font-size:' + gr + 'px"' : '') + '></i>';
  }
  function anzahlVon(d) { return d.anzahl == null ? 1 : Math.max(0, zahl(d.anzahl, 1)); }
  function gewicht(d) { return zahl(d.kg) * anzahlVon(d); }
  function vorratText(d) {
    var v = d.vorrat;
    if (!Array.isArray(v) || !v.length) return '';
    return v[0] + (v.length > 1 ? '/' + v[1] : '') + (d.einheit ? (d.einheit === 'm' ? ' m' : ' ' + d.einheit) : '');
  }
  // Der eine Wert, der rechts in der Zeile steht, wie die Haltbarkeit im Taktikspiel
  function hauptwert(d) {
    var v = vorratText(d);
    if (v) return v;
    if (d.schaden) return String(d.schaden).split(' ')[0];
    if (d.rk) return 'RK ' + d.rk;
    return '';
  }
  // Werte für das Fenster beim Antippen: [Beschriftung, Wert, breit]
  function werteVon(d) {
    var w = [];
    if (d.angriff) w.push(['Angriff', d.angriff]);
    if (d.schaden) w.push(['Schaden', d.schaden]);
    if (d.zweihand) w.push(['Zweihändig', d.zweihand]);
    if (d.reichweite) w.push(['Reichweite', d.reichweite]);
    if (d.rk) w.push(['RK', String(d.rk)]);
    var v = vorratText(d);
    if (v) w.push(['Vorrat', v]);
    if (anzahlVon(d) !== 1) w.push(['Anzahl', String(anzahlVon(d))]);
    if (d.kg) w.push(['Gewicht', kg(gewicht(d))]);
    if (seltenheitVon(d) !== 'gewoehnlich') w.push(['Seltenheit', SELTENHEIT[seltenheitVon(d)][0]]);
    if (MARKEN[d.marke]) w.push(['Marke', MARKEN[d.marke][0]]);
    if (d.wirkung) w.push(['Wirkung', d.wirkung, true]);
    if (d.zustand) w.push(['Zustand', d.zustand, true]);
    return w;
  }
  function grenzen(t) {
    if (!t.staerke) return null;
    var f = zahl(t.faktor, 1) || 1, s = zahl(t.staerke) * f;
    return [s * 2.5, s * 5, s * 7.5];
  }
  function lastStufe(w, g) {
    if (!g) return '';
    if (w > g[2]) return 'zu schwer';
    if (w > g[1]) return 'schwer belastet';
    if (w > g[0]) return 'belastet';
    return 'unbelastet';
  }

  /* ---------- Zeichnen ---------- */
  function muenzenSvg(art, n) {
    var m = MUENZEN.filter(function (x) { return x[0] === art; })[0], k = Math.max(1, Math.min(6, Math.ceil(Math.log(n + 1) / Math.log(2.2)))), s = '';
    for (var i = 0; i < k; i++) {
      var y = 30 - i * 4.2;
      s += '<ellipse cx="17" cy="' + y + '" rx="13" ry="5" fill="' + m[4] + '" stroke="' + m[3] + '" stroke-width="1.4"/>';
    }
    var top = 30 - (k - 1) * 4.2;
    s += '<ellipse cx="17" cy="' + top + '" rx="8" ry="2.6" fill="none" stroke="' + m[3] + '" stroke-width="1"/>';
    return '<svg viewBox="0 0 34 38" width="30" height="34" aria-hidden="true">' + s + '</svg>';
  }
  function lastSvg(w, g) {
    var B = 300, max = g[2], x = function (v) { return Math.max(0, Math.min(B, v / max * B)); };
    var s = '<svg viewBox="-6 0 ' + (B + 12) + ' 40" width="100%" preserveAspectRatio="none" aria-hidden="true" style="display:block;height:40px">';
    s += '<rect x="0" y="12" width="' + x(g[0]) + '" height="8" fill="var(--gpW1)"/>';
    s += '<rect x="' + x(g[0]) + '" y="12" width="' + (x(g[1]) - x(g[0])) + '" height="8" fill="var(--gpW2)"/>';
    s += '<rect x="' + x(g[1]) + '" y="12" width="' + (B - x(g[1])) + '" height="8" fill="var(--gpW3)"/>';
    s += '<rect x="0" y="12" width="' + x(w) + '" height="8" fill="var(--ink)" opacity="0.78"/>';
    s += '<path d="M0 12V20M' + B + ' 12V20M' + x(g[0]) + ' 9V23M' + x(g[1]) + ' 9V23" stroke="var(--ink)" stroke-width="1.4" fill="none"/>';
    s += '<path d="M' + x(w) + ' 10l-4.5 -7h9z" fill="var(--rot)"/>';
    s += '</svg>';
    return s;
  }
  function zeichne(D) {
    var traeger = (D.traeger || []).filter(function (t) { return t && t.name; });
    var h = '';
    h += '<div class="gpKopf"><p class="gpT">' + esc(D.titel || 'Gepäck') + '</p>' + (D.stand ? '<p class="gpS">' + esc(D.stand) + '</p>' : '') + '</div>';

    // Geldbeutel
    var G = D.geld || {}, muenzen = MUENZEN.filter(function (m) { return zahl(G[m[0]]) > 0; });
    if (muenzen.length || D.geld) {
      var wert = 0;
      MUENZEN.forEach(function (m) { wert += zahl(G[m[0]]) * WERT[m[0]]; });
      h += '<div class="gpBlock"><p class="gpH">' + ikon('coins', 18) + 'Geldbeutel</p><div class="gpMz">';
      if (!muenzen.length) h += '<p class="gpLeer">leer</p>';
      muenzen.forEach(function (m) {
        var n = zahl(G[m[0]]);
        h += '<div class="gpM">' + muenzenSvg(m[0], n) + '<span><b>' + n + '</b> ' + esc(n === 1 ? m[1] : m[2]) + '</span></div>';
      });
      h += '</div>';
      if (muenzen.length > 1) h += '<p class="gpKl">zusammen ' + String(Math.round(wert * 100) / 100).replace('.', ',') + ' Goldadmirale wert</p>';
      h += '</div>';
    }

    // Rationen
    var rat = [], summe = 0;
    traeger.forEach(function (t) {
      var n = 0;
      var ding = null;
      (t.dinge || []).forEach(function (d) { if (d && d.art === 'ration') { n += anzahlVon(d); ding = ding || d; } });
      if (n) rat.push({ t: t, n: n, ding: ding });
      if (t.art !== 'lager') summe += n;
    });
    if (rat.length) {
      var esser = Math.max(1, zahl(D.esser, 1));
      h += '<div class="gpBlock"><p class="gpH">' + ikon('baguette', 18) + 'Rationen</p><div class="gpRat">';
      rat.forEach(function (r) {
        var brote = '';
        for (var i = 0; i < Math.min(r.n, 6); i++) brote += '<span class="gpBr">' + zeichenSvg(r.ding, 22) + '</span>';
        h += '<span class="gpRz"><span class="gpBrot">' + brote + (r.n > 6 ? '<small>+' + (r.n - 6) + '</small>' : '') + '</span>' +
          '<span>' + r.n + ' ' + (r.t.art === 'figur' ? 'dabei' : r.t.art === 'lager' ? esc(r.t.name.replace(/^In /, 'in ')) : 'bei ' + esc(r.t.name)) + '</span></span>';
      });
      h += '</div><p class="gpKl">' + (summe ? 'reicht ' + Math.floor(summe / esser) + (Math.floor(summe / esser) === 1 ? ' Tag' : ' Tage') + (esser > 1 ? ' für ' + esser + ' Esser' : '') : 'nichts zu essen im Gepäck') + '</p></div>';
    }

    // Träger
    var nr = 0;
    traeger.forEach(function (t, ti) {
      var dinge = (t.dinge || []).filter(function (d) { return d && d.name; });
      var g = t.art === 'lager' ? null : grenzen(t), w = 0;
      dinge.forEach(function (d) { w += gewicht(d); });
      var zu = t.art === 'lager', inhalt = 'gpInh' + ti;
      h += '<section class="gpTr" aria-label="' + esc(t.name) + '"><div class="gpTk">' + ikon(TRAEGERART[t.art] || 'user', 22) +
        '<div style="flex:1;min-width:0"><p class="gpTn">' + esc(t.name) + '</p><p class="gpKl">' +
        (zu ? 'nicht im Gepäck · ' + dinge.length + (dinge.length === 1 ? ' Ding' : ' Dinge') + (t.ort ? ' · ' + esc(t.ort) : '') : 'trägt ' + kg(w) + (g ? ' · ' + lastStufe(w, g) : '') + (t.ort ? ' · ' + esc(t.ort) : '')) +
        '</p></div>' + (zu ? '<button type="button" class="gpK gpAuf" aria-expanded="false" aria-controls="' + inhalt + '">zeigen</button>' : '') + '</div>' +
        '<div id="' + inhalt + '"' + (zu ? ' hidden' : '') + '>';
      if (g) {
        h += '<div class="gpLast">' + lastSvg(w, g) + '<div class="gpLz"><span>0</span><span style="left:' + (g[0] / g[2] * 100) + '%">' + Math.round(g[0]) + '</span>' +
          '<span style="left:' + (g[1] / g[2] * 100) + '%">' + Math.round(g[1]) + '</span><span style="left:100%">' + Math.round(g[2]) + ' kg</span></div></div>';
      }
      GRUPPEN.forEach(function (gr) {
        var ds = dinge.filter(function (d) { return (DINGART[d.art] || DINGART.sonstiges)[1] === gr[0]; });
        if (!ds.length) return;
        h += '<p class="gpG">' + gr[1] + '</p><ul class="gpL">';
        ds.forEach(function (d) {
          var n = anzahlVon(d), id = 'gp' + ti + '-' + (nr++), werte = werteVon(d), farbe = SELTENHEIT[seltenheitVon(d)][1];
          h += '<li><button type="button" class="gpZ" data-i="' + id + '" aria-expanded="false" aria-controls="' + id + '">' +
            plaettchen(d, '', n) +
            '<span class="gpN"' + (farbe ? ' style="color:' + farbe + '"' : '') + '>' + esc(d.name) + (d.zustand ? '<small class="gpZu">' + esc(d.zustand) + '</small>' : '') + '</span>' +
            '<span class="gpF"></span><span class="gpH1">' + esc(hauptwert(d)) + '</span><span class="gpW">' + (d.kg ? kg(gewicht(d)) : '–') + '</span></button>';
          // Das Fenster beim Antippen: das Zeichen groß, dann die Werte, der Wortlaut und der Glossarknopf
          h += '<div class="gpD" id="' + id + '" hidden><div class="gpDk">' + plaettchen(d, 'g') +
            '<p class="gpDn"' + (farbe ? ' style="color:' + farbe + '"' : '') + '>' + esc(d.name) + '<small>' + [ARTNAME[d.art], seltenheitVon(d) !== 'gewoehnlich' ? SELTENHEIT[seltenheitVon(d)][0] : '', MARKEN[d.marke] ? MARKEN[d.marke][0] : ''].filter(Boolean).join(' · ') + '</small></p></div>';
          if (werte.length) {
            h += '<dl class="gpSt">';
            werte.forEach(function (w) { h += '<div' + (w[2] ? ' class="gpBreit"' : '') + '><dt>' + w[0] + '</dt><dd>' + esc(w[1]) + '</dd></div>'; });
            h += '</dl>';
          }
          if (d.merkmale && d.merkmale.length) h += '<p class="gpMm">' + d.merkmale.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</p>';
          if (d.wortlaut) h += '<details class="gpWl"><summary>Wortlaut</summary><blockquote>' + esc(d.wortlaut) + '</blockquote></details>';
          if (d.glossar) h += '<button type="button" class="gpK" data-glossar="' + esc(d.glossar) + '">Glossar ' + esc(d.glossar) + ' ↗</button>';
          h += '</div>';
          h += '</li>';
        });
        h += '</ul>';
      });
      if (!dinge.length) h += '<p class="gpLeer">nichts</p>';
      h += '</div></section>';
    });
    return h;
  }

  var CSS = [
    '.gp{--pg:#efe2c3;--ink:#3b3028;--ink2:#5a4a3a;--rot:#8e3b22;--rahmen:#8b6d45;--linie:rgba(59,48,40,.28);--gpW1:rgba(93,106,58,.22);--gpW2:rgba(147,121,58,.30);--gpW3:rgba(142,59,34,.24);',
    'background:var(--pg);color:var(--ink);border:3px solid var(--rahmen);border-radius:14px;padding:5px;font-family:"EB Garamond",Garamond,Georgia,serif;font-size:17px;line-height:1.45}',
    '[data-mode="dark"] .gp{--pg:#d8c9a3}',
    '@media (prefers-color-scheme:dark){:root:not([data-mode]) .gp{--pg:#d8c9a3}}',
    '.gp p{margin:0}.gp [hidden]{display:none!important}',
    '.gpIn{border:1px solid var(--rahmen);border-radius:9px;padding:14px 16px 10px;display:flex;flex-direction:column;gap:14px}',
    '.gpT{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:27px;line-height:1.1}',
    '.gpS,.gpKl{font-style:italic;color:var(--ink2)}',
    '.gpS{font-size:17px}.gpKl{font-size:15px}',
    '.gpBlock{display:flex;flex-direction:column;gap:6px}',
    '.gpH{display:flex;align-items:center;gap:7px;font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:19px}',
    '.gpMz{display:flex;flex-wrap:wrap;gap:6px 18px}',
    '.gpM{display:flex;align-items:flex-end;gap:6px}.gpM b{font-weight:600;font-size:19px}',
    '.gpRat{display:flex;flex-wrap:wrap;gap:6px 18px}',
    '.gpRz{display:inline-flex;align-items:center;gap:6px}',
    '.gpBrot{display:inline-flex;align-items:center}.gpBrot small{font-size:13px;margin-left:3px}',
    '.gpBr{display:inline-grid;place-items:center;width:22px;height:22px;color:var(--ink2)}.gpBr+.gpBr{margin-left:-4px}',
    '.gpTr{border-top:1.5px solid var(--rahmen);padding-top:12px;display:flex;flex-direction:column;gap:4px}',
    '.gpTk{display:flex;align-items:center;gap:10px}',
    '.gpTn{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:22px;line-height:1.15}',
    '.gpLast{position:relative;padding-bottom:16px;margin:2px 4px 4px}',
    '.gpLz{position:absolute;left:0;right:0;bottom:0;height:16px;font-size:13px;font-style:italic;color:var(--ink2)}',
    '.gpLz span{position:absolute;transform:translateX(-50%);white-space:nowrap}.gpLz span:first-child{transform:none}.gpLz span:last-child{transform:translateX(-100%)}',
    '.gpG{font-style:italic;font-size:15px;color:var(--rot);margin-top:6px!important}',
    '.gpL{list-style:none;margin:0;padding:0}',
    '.gp button.gpZ{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:baseline;gap:8px;padding:3px 4px;border-radius:5px;cursor:pointer;color:var(--ink);font-family:inherit;font-size:17px;line-height:1.4}',
    '.gp button.gpZ:disabled{cursor:default}',
    '.gp button.gpZ:not(:disabled):hover{background:rgba(59,48,40,.07)}',
    '.gp button.gpZ:focus-visible,.gp .gpK:focus-visible{outline:2px solid var(--rot);outline-offset:1px}',
    '.gp button.gpZ[aria-expanded="true"]{background:rgba(142,59,34,.09)}',
    '.gp button.gpZ{align-items:center}',
    '.gpDk{display:flex;align-items:center;gap:12px}',
    '.gpDn{font:400 19px/1.2 "IM Fell English","EB Garamond",Georgia,serif;color:var(--ink);display:flex;flex-direction:column;min-width:0}',
    '.gpDn small{font:italic 14px "EB Garamond",Georgia,serif;color:var(--ink2)}',
    '.gpN{min-width:0;display:flex;flex-direction:column;line-height:1.2}',
    '.gpZu{font-style:italic;font-size:14px;color:var(--ink2)}',
    '.gpF{flex:1;min-width:10px;border-bottom:1.5px dotted var(--linie);align-self:center}',
    '.gpH1{white-space:nowrap;font:600 15px ui-monospace,Menlo,Consolas,monospace;color:var(--ink);letter-spacing:-.02em}',
    '.gpH1:empty{display:none}',
    '.gpW{white-space:nowrap;font-style:italic;font-size:15px;color:var(--ink2);min-width:46px;text-align:right}',
    '.gpD{margin:4px 2px 10px 48px;padding:10px 12px;border-radius:8px;background:rgba(59,48,40,.06);color:var(--ink);border:1px solid var(--rahmen);display:flex;flex-direction:column;gap:8px;font-size:15px}',
    '.gpSt{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:4px 18px;margin:0}',
    '.gpSt div{display:flex;justify-content:space-between;gap:8px;border-bottom:1px dotted var(--linie);padding-bottom:2px;min-width:0}',
    '.gpSt div.gpBreit{grid-column:1/-1;flex-direction:column;gap:0}',
    '.gpSt dt{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2);white-space:nowrap}',
    '.gpSt dd{margin:0;font:600 15px ui-monospace,Menlo,Consolas,monospace;color:var(--ink);text-align:right;white-space:nowrap}',
    '.gpSt div.gpBreit dd{font:400 15px/1.35 "EB Garamond",Georgia,serif;text-align:left}',
    '.gpMm{display:flex;flex-wrap:wrap;gap:4px}.gpMm span{font-size:13px;padding:0 7px;border:1px solid var(--rahmen);border-radius:999px;color:var(--ink2)}',
    '.gpWl summary{cursor:pointer;font-size:14px;color:var(--ink2);letter-spacing:.06em;text-transform:uppercase}',
    '.gpWl blockquote{margin:6px 0 0;padding:6px 10px;background:var(--pg);color:var(--ink);border:1px solid var(--linie);border-radius:5px;font:italic 16px/1.45 "EB Garamond",Georgia,serif;white-space:pre-line}',
    '.gp .gpAuf{align-self:center;flex-shrink:0}',
    '.gp .gpK{all:unset;cursor:pointer;align-self:flex-start;font-family:inherit;font-size:15px;color:var(--ink);border:1px solid var(--rahmen);border-radius:6px;padding:2px 10px}',
    '.gp .gpK:hover{background:rgba(59,48,40,.07)}',
    '.gpLeer{font-style:italic;color:var(--ink2);font-size:15px}'
  ].join('') + ZEICHEN_CSS;


  function schriftLaden() {
    try {
      if (document.getElementById('ktSchrift')) return;
      var l = document.createElement('link');
      l.id = 'ktSchrift'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=IM+Fell+English:ital@0;1&display=swap';
      document.head.appendChild(l);
    } catch (e) { return; }
  }

  function einbauen(el, D) {
    schriftLaden();
    el.className = 'gp';
    el.innerHTML = '<style>' + CSS + '</style><div class="gpIn">' + zeichne(D) + '</div>';
    el.addEventListener('click', function (ev) {
      var t = ev.target;
      var auf0 = t.closest ? t.closest('.gpAuf') : null;
      if (auf0) {
        var ziel = document.getElementById(auf0.getAttribute('aria-controls')), offen = auf0.getAttribute('aria-expanded') !== 'true';
        auf0.setAttribute('aria-expanded', String(offen)); auf0.textContent = offen ? 'verbergen' : 'zeigen';
        if (ziel) ziel.hidden = !offen;
        return;
      }
      var g = t.closest ? t.closest('[data-glossar]') : null;
      if (g) { if (typeof sendPrompt === 'function') sendPrompt('Glossar ' + g.getAttribute('data-glossar')); return; }
      var b = t.closest ? t.closest('button.gpZ') : null;
      if (!b || b.disabled) return;
      var d = document.getElementById(b.getAttribute('data-i'));
      if (!d) return;
      var auf = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(auf));
      d.hidden = !auf;
    });
    if (typeof sendPrompt !== 'function') Array.prototype.forEach.call(el.querySelectorAll('[data-glossar]'), function (x) { x.remove(); });
  }

  function start() {
    var el = document.getElementById('gepaeck'), D = window.INVENTAR;
    if (!el || !D) return false;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Das Gepäck ließ sich nicht zeichnen: ' + err.message; }
    return true;
  }

  // Zusatzprüfung für pruefen.js: Geld und Traglast mit dem Spielstand abgleichen (nur Hinweise)
  function zusatz(D, h) {
    var hinweise = [], fehler = [], zeilen = h.stand.split('\n');
    var NAMEN = { pm: 'highlord|pm', ga: 'goldadmiral|ga', em: 'bright ship|em', sm: 'silber|sm', km: 'common|km' };
    Object.keys(D.geld || {}).forEach(function (k) {
      var n = D.geld[k];
      if (!n || !NAMEN[k]) return;
      var re = new RegExp('(^|[^0-9])' + n + ' ?(' + NAMEN[k] + ')', 'i');
      if (!zeilen.some(function (z) { return re.test(h.norm(z)); })) hinweise.push('Geld: ' + n + ' ' + k.toUpperCase() + ' steht so nicht im Spielstand. Stimmt der Betrag?');
    });
    (D.traeger || []).forEach(function (t) {
      if (!t || t.art === 'lager' || !Array.isArray(t.dinge)) return;
      var w = 0;
      t.dinge.forEach(function (d) { if (d) w += zahl(d.kg) * anzahlVon(d); });
      var re = /rund (\d+(?:,\d+)?) kg/i, treffer = zeilen.filter(function (z) { return z.indexOf(t.name) >= 0 && re.test(z); })[0];
      if (treffer) {
        var soll = parseFloat(treffer.match(re)[1].replace(',', '.'));
        if (Math.abs(soll - w) > 1) hinweise.push('Traglast ' + t.name + ': die Dinge wiegen ' + kg(w) + ', der Spielstand sagt rund ' + kg(soll) + '.');
      }
    });
    return { hinweise: hinweise, fehler: fehler };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { zeichne: zeichne, SCHEMA: SCHEMA, zusatz: zusatz, version: VERSION, ZEICHEN: ZEICHEN, SELTENHEIT: SELTENHEIT, MARKEN: MARKEN, ikoneVon: ikoneVon, plaettchen: plaettchen, ARTNAME: ARTNAME };
  else (function warten(n) { if (!start() && n < 60) setTimeout(function () { warten(n + 1); }, 50); })(0);
})();
