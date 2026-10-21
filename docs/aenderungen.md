# Änderungen am Regelwerk und an den Werkzeugen

Die Regelwerke selbst liegen daneben (`regelwerk-2.8.md`, `regelwerk-3.0.md`). Diese Liste lädt keine Spielleitung mit; sie ist für den Weltenhüter und für Spieler, die wissen wollen, was neu ist.

## Regelwerk 3.0 (21. Oktober 2026)

Gegenüber 2.8 (20. Oktober 2026). Keine Regel ist entfallen; was nicht mehr im Text steht, steht an der genannten Stelle.

- **Spielerbuch** (4.7): eine Seite je Figur mit Glossar, Logbuch, Gepäck, Karte und „Was bisher geschah“. Die Daten der Tische liegen dort statt als Dateien im Projekt; die Befehle Questlog, Glossar, Karte und Inventar geben den Link, mit „hier“ den Tisch im Chat (4). Das Buch zeigt den Stand des letzten Sitzungsendes. Nur ohne Artefakt-Datenbank oder ohne Code bleiben die Dateien im Projekt (22.1).
- **Glossar** (4.6): eigene Grammatik mit Posten, Herkunft und Welttag, Haltung als Eindruck der Figur, Gefahrzeichen nach Stufe; „Glossar <Stichwort>“ zeigt einen Auszug aus einer Kopie für die Sitzung; Stichwortliste im Spielstand. Nach dem Aufstieg Gefahrzeichen neu einschätzen (7.4).
- **Tische** (4.2): ein Aufruf mit Tabelle (Kennung, Ladetext, Daten, Datei) statt vier Beispielen, ein Stand für alle Dateien des Repositorys (`tische_stand`, bei Abweichung gilt meta/welt). Spoilerschutz und Prüfung an einer Stelle (4.8), in fester Reihenfolge: erst das Glossar, dann Karte, Gepäck und Logbuch, dann das Wissensbuch.
- **Wissensbuch** (5.1): wer im Revier was weiß, mit Herkunft und Prüfung. NPCs wissen, was zu Leben, Handwerk und Ort gehört und was sie erleben; von heiklen Dingen nur, was ihr Abschnitt trägt.
- **Fristen, Auslöser, Uhren und Weltzug** (8.3); die Neigung der wichtigsten NPCs zur Figur (verdeckt, −3 bis +3, nicht die Haltung im Glossar); Konsequenzen über Uhren (10).
- **Vor jeder Antwort** (3.1): stille Prüfung von Zeit, Ort, Wissen, Ressourcen und Fälligem.
- **Spieltisch** (3): Die Schlusszeile lädt auch zum Nachfragen über Schlüsselwörter ein; Gefahrzeichen gelten für die heutige Stufe.
- **Spielstand** (21): immer geladener Kern bis etwa 50.000 Zeichen statt 40.000 mit Zusammenfassung; der Wortlaut alter Sitzungen wandert ins Spielerbuch, nicht ins Nichts; was die Tische zeigen, bleibt auch nach dem Kürzen belegt. Spoilerdatei bis etwa 80.000 Zeichen. Feste Abläufe für Sitzungsbeginn und Sitzungsende (neun Schritte); während der Sitzung keine Änderung an Projekt und Spielerbuch. Irrtümer der Figur sind gewollt; bei widersprüchlichen Notizen gilt das Gespielte.
- **Weltchronik** (18): meta/welt mit Glossar, `tische_stand` und `spielerbuch`; `buch` unter figuren; `eingetragen` unter chronik; zu Sitzungsbeginn gezielt lesen (neue Einträge nach `eingetragen`, Post nach `an` und `ankunft.ort`); Ids für Tage vor Welttag 1.
- **Einstieg** (22): Spielerbuch, Uhren und Wissensbuch beim Anlegen einer Figur; Umstieg laufender Figuren (22.2).
- Diese Liste stand im Entwurf als Anhang im Regelwerk. Sie liegt jetzt hier, damit sie nicht jede Nachricht mitlädt.

## Werkzeuge zum Stand von Regelwerk 3.0

- `seite/buch.html`, `seite/bauen.js`: das Spielerbuch (`--seite`, `--db`, `--zurueck`, `--batches`). `--db` nimmt Spielleitungswissen nur über `--sl` an und lehnt Dateien ab, die keine Geschichte sind. `--batches` schreibt die Schreibvorgänge für ArtifactData `batch` mit Versionen, lässt Unverändertes weg und löscht Gestrichenes. Anker `#questlog` und `#inventar` gehen auch.
- `pruefen.js`: Weitere Markdown-Dateien ohne Daten (etwa `02_geschichte.md`) zählen als Teile des Spielstands. Die Spoilerdatei wird als Wissensbuch erkannt, auch wenn sie einen json-Block hat.
- `wissensbuch.js`: Was die Spielerfigur weiß, belegt nur der Spielstand mit seinen Teilen, nie die Spoilerdatei, und nur bis zu dem Tag, an dem sie es erfuhr. Hinweise erkennen Personen auch am Rufnamen („Aske“ für „Mutter Aske“).
- `glossar.js`: `--liste` für die Stichwortliste; der Fuß „Ganzes Glossar ↗“ eines Auszugs schickt „Glossar“; die eigene Glossar-Seite ist im Spielerbuch aufgegangen.
- README: Beispiele zum Wissensbuch aus der erfundenen Welt der Tests statt aus einem laufenden Revier.
