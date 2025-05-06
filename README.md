# pflanzen-manager

## Konzept

### Fachliches Konzept

Die App dient der strukturierten Pflege und Dokumentation von Zimmer- und Balkonpflanzen. Alle Daten werden lokal im Browser gespeichert und optional mit OpenAI ausgewertet.

#### 1. Datenmodelle

**Räume**
- `name`: Name des Raums
- `lightDirection`: Norden | Osten | Süden | Westen
- `indoor`: boolean (true = Innenraum, false = Außenbereich)

**Pflanzen**
- `roomId`: Referenz auf zugehörigen Raum
- `name`: Pflanzenname
- `windowDistanceCm`: Abstand zum Fenster (cm)
- `nearHeater`: boolean
- `sizeCm`: Pflanzengröße (cm)
- `potSizeCm`: Topfdurchmesser (cm)

**Bilder**
- `plantId`: Referenz auf Pflanze
- `timestamp`: Zeitstempel
- `dataURL`: kodiertes Bild

**Tipps (generiert durch OpenAI)**
- Gießen
- Düngen
- Umtopfen (inkl. Substrat)
- Standortempfehlung
- Gesundheitszustand
- Besprühen

**Aufgaben**
- Typen: Gießen, Düngen, Umtopfen, Reinigen, Foto erstellen
- Aufgaben werden automatisch generiert, sind abhakbar und enthalten Erinnerungsdaten

#### 2. Views

**Räume-Übersicht**
- Auflistung aller Räume als Cards
- Lichtsymbol je Raum
- Vorschau der zugehörigen Pflanzen
- Hinweis auf offene Aufgaben
- Button zum Erstellen eines neuen Raums

**Raum-Detailansicht**
- Pflanzenübersicht im Raum als Cards
- Pflanzennamen, Profilbild, Aufgabenstatus
- Button zum Erstellen einer neuen Pflanze

**Pflanzen-Detailansicht**
- Aktuelles Profilbild + 2 ältere Bilder als Header
- Pflanzeneigenschaften (Fensterabstand, Heizungsnähe, Topfgröße, Raum)
- Generierte Tipps (basierend auf letztem Bild)
- Aufgabenliste mit Abhak-Funktion
- Foto-Funktion
- Button zum Löschen (Friedhof)

---

### Technisches Konzept

**Architektur**
- Frontend-only SPA
- Framework: React mit Vite
- Styling: Tailwind CSS
- Datenhaltung: IndexedDB (`idb` oder `Dexie`)
- Kein Backend
- OpenAI-API-Key wird vom User manuell eingegeben und lokal gespeichert (LocalStorage)

**Technische Komponenten**

**IndexedDB-Datenstruktur**
- `rooms`: { id, name, lightDirection, indoor }
- `plants`: { id, roomId, name, windowDistanceCm, nearHeater, sizeCm, potSizeCm }
- `images`: { id, plantId, timestamp, dataURL }
- `tasks`: { id, plantId, type, dueDate, done }
- `tips`: { id, plantId, generatedAt, content }
- `settings`: { openAiApiKey }

**State-Management**
- Lightweight (Zustand oder `useContext` + `useReducer`)

**Security**
- API-Key wird ausschließlich lokal gehalten
- UI-Warnung bzgl. Verantwortung und Sichtbarkeit
- Optional: Sichtprüfung des gespeicherten Keys

**Offlinefähigkeit**
- Volle Funktion ohne Internet (außer OpenAI-Zugriffe)
- Optionaler Service Worker zur Offline-Optimierung


### Tipps, Aufgaben mittesl OpenAI API-Integration

- Eingabe und Speicherung des API-Keys im UI (LocalStorage)
- Keine Weitergabe des API-Keys außerhalb des Clients
- OpenAI analysiert das Bild zusammen mit den strukturellen Informationen und gibt daraufhin eine strukturierte Textantwort zurück

Die generierten Hinweise umfassen typischerweise:
- Gießempfehlung
- Düngeintervall
- Hinweis auf Umtopfbedarf inkl. Substrat
- Standortoptimierung
- Gesundheitszustand (z. B. gelbe Blätter, Schädlinge)
- Empfehlung zum Besprühen (z. B. bei trockener Luft)

Diese Tipps werden lokal gespeichert und im Pflanzenprofil angezeigt.

---

### Automatische Aufgabenableitung

Basierend auf den generierten Tipps erstellt die Anwendung automatisch Aufgaben. Beispiele:
- Wenn die KI empfiehlt, alle 10 Tage zu gießen, wird eine wiederkehrende Aufgabe angelegt
- Erkennt das System Schädlingsbefall, wird eine einmalige Aufgabe mit hoher Priorität erzeugt

Jede Aufgabe enthält ein Fälligkeitsdatum, ist abhakbar und erscheint in den Übersichten:
- Räume-Übersicht
- Raum-Detailansicht
- Pflanzen-Detailansicht

---

### Interaktion & Pflege

Der Nutzer kann regelmäßig neue Bilder hinzufügen, um den Pflegezustand zu aktualisieren. Dabei gilt:
- Ältere Bilder bleiben gespeichert
- Neue Analysen basieren stets auf dem aktuellsten Bild und den neuesten Metadaten

---

## Technologiestack

- **Framework/Bibliothek:** [React](https://react.dev/)
- **Build-Tool:** [Vite](https://vitejs.dev/)
- **Sprache:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Linting:** [ESLint](https://eslint.org/)
- **Paketmanager:** npm
