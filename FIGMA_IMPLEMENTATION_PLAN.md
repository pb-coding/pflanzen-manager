# 🎨 Figma Design Implementation Plan

## 📋 Projekt-Übersicht

**Ziel**: Implementierung der 4 Figma-Designs als Proof of Concept mit vereinfachtem Water Management, basierend auf bestehender Infrastruktur.

**Strategie**: Separate `/figma/...` Routen für saubere Trennung, Wiederverwendung der bestehenden IndexedDB + Zustand Store.

## 🎯 Figma Designs

1. **Plant List (18-2)** ✅ - Hauptliste aller Pflanzen
2. **Plant Detail (27-2)** - Detailansicht mit Water Management  
3. **Add Plant (26-170)** - Vereinfachtes Formular
4. **Settings (26-73)** - Einstellungen

## 🏗️ Architektur

### Routen-Struktur
```
/figma/plants           → FigmaPlantListScreen (Design 18-2)
/figma/plants/:id       → FigmaPlantDetailScreen (Design 27-2)  
/figma/add-plant        → FigmaAddPlantScreen (Design 26-170)
/figma/settings         → FigmaSettingsScreen (Design 26-73)
```

### Komponenten-Hierarchie
```
src/components/figma/
├── atoms/
│   ├── FigmaButton.tsx          # Buttons (Plus, Navigation, Action)
│   ├── FigmaIcon.tsx            # SVG Icons mit Figma-Farben
│   ├── FigmaInput.tsx           # Form Inputs
│   └── FigmaToggle.tsx          # Toggle Switches
├── molecules/
│   ├── FigmaHeader.tsx          # Header mit Title + Action Button
│   ├── FigmaBottomNav.tsx       # Bottom Navigation (3 Icons)
│   ├── FigmaPlantCard.tsx       # Plant Card für Liste
│   ├── FigmaWateringInfo.tsx    # Watering Status Display
│   └── FigmaFormField.tsx       # Form Field mit Label
├── organisms/
│   ├── FigmaPlantList.tsx       # Liste aller Plant Cards
│   ├── FigmaWateringSchedule.tsx # Bewässerungsplan Sektion
│   ├── FigmaWateringHistory.tsx # Bewässerungshistorie
│   └── FigmaSettingsGroup.tsx   # Settings Gruppen
├── templates/
│   ├── FigmaLayout.tsx          # 390px Container + Navigation
│   └── FigmaScreen.tsx          # Screen-Level Layout
└── screens/
    ├── FigmaPlantListScreen.tsx
    ├── FigmaPlantDetailScreen.tsx
    ├── FigmaAddPlantScreen.tsx
    └── FigmaSettingsScreen.tsx
```

## 🎨 Design System

### Farben (aus Figma Dev Mode)
```css
:root {
  /* Figma Colors */
  --figma-bg-dark: #12211A;        /* Haupthintergrund */
  --figma-text-white: #FFFFFF;     /* Haupttext */
  --figma-accent-green: #94C7AD;   /* Akzentfarbe */
  --figma-card-bg: #1A3326;        /* Card/Navigation Hintergrund */
  --figma-border: #244736;         /* Borders */
  --figma-button-green: #14B866;   /* Action Buttons */
  --figma-input-bg: #244736;       /* Input Hintergründe */
  
  /* Figma Typography */
  --figma-font-family: 'Lexend', sans-serif;
  --figma-font-weight-regular: 400;
  --figma-font-weight-medium: 500;
  --figma-font-weight-bold: 700;
  
  /* Figma Spacing */
  --figma-container-width: 390px;
  --figma-padding-base: 16px;
  --figma-gap-small: 8px;
  --figma-gap-medium: 16px;
  --figma-border-radius: 12px;
}
```

### Typography Scale
```css
.figma-text-h1 { font-size: 18px; font-weight: 700; line-height: 1.28; }
.figma-text-h2 { font-size: 22px; font-weight: 700; line-height: 1.27; }
.figma-text-body { font-size: 16px; font-weight: 400; line-height: 1.5; }
.figma-text-small { font-size: 14px; font-weight: 400; line-height: 1.5; }
```

## 🔄 Daten-Integration

### Mapping bestehende Daten → Figma UI
```typescript
interface FigmaPlantView {
  id: string;
  name: string;
  imageUrl?: string;
  
  // Water Management aus Tasks ableiten
  nextWatering?: Date;
  lastWatered?: Date;
  wateringFrequencyDays?: number;
  wateringStatus: string; // "Water in X days"
  lastWateredText: string; // "Last watered X days ago"
  
  // Aus Plant.notes oder Tips
  notes?: string;
}

// Service für Water Management
class WaterManagementService {
  static mapPlantToFigmaView(plant: Plant, tasks: Task[], images: PlantImage[]): FigmaPlantView
  static calculateNextWatering(plant: Plant, tasks: Task[]): Date | null
  static getWateringFrequency(plant: Plant, tasks: Task[]): number
  static addWateringEntry(plantId: string, date: Date, notes?: string): Promise<string>
  static getWateringHistory(plantId: string, tasks: Task[]): WateringEntry[]
}
```

## 🚀 Implementierungs-Plan

### **Phase 1: Foundation (Schritt 1-3)**

#### Schritt 1: Design System Setup
- [ ] `src/styles/figma-design-system.css` erstellen
- [ ] Lexend Font in `src/index.css` sicherstellen  
- [ ] CSS Variables und Base Styles definieren

#### Schritt 2: Layout Foundation
- [ ] `src/components/figma/templates/FigmaLayout.tsx` erstellen
- [ ] `src/components/figma/templates/FigmaScreen.tsx` erstellen
- [ ] 390px Container + Basic Structure

#### Schritt 3: Routing Setup
- [ ] Routen in `src/App.tsx` hinzufügen
- [ ] Erste `/figma/plants` Route mit Placeholder

### **Phase 2: Komponenten-Extraktion (Schritt 4-7)**

#### Schritt 4: Atomic Components
- [ ] `FigmaButton.tsx` - Plus Button, Navigation Items
- [ ] `FigmaIcon.tsx` - SVG Icons mit korrekten Farben
- [ ] `FigmaInput.tsx` - Form Inputs für Add Plant

#### Schritt 5: Header & Navigation
- [ ] `FigmaHeader.tsx` aus FigmaDesignTest extrahieren
- [ ] `FigmaBottomNav.tsx` aus FigmaDesignTest extrahieren
- [ ] Navigation funktionsfähig machen

#### Schritt 6: Plant Components
- [ ] `FigmaPlantCard.tsx` - Überarbeitung der bestehenden PlantCard
- [ ] `FigmaPlantList.tsx` - Container für Plant Cards
- [ ] Watering Info Komponenten

#### Schritt 7: Screen Assembly
- [ ] `FigmaPlantListScreen.tsx` zusammenbauen
- [ ] Alle Komponenten integrieren
- [ ] Layout testen

### **Phase 3: Daten-Integration (Schritt 8-9)**

#### Schritt 8: Water Management Service
- [ ] `src/services/waterManagement.ts` erstellen
- [ ] Mapping-Funktionen implementieren
- [ ] Watering Calculation Logic

#### Schritt 9: Store Integration
- [ ] Mock Data durch echte Store-Daten ersetzen
- [ ] useStore Hook in FigmaPlantListScreen
- [ ] Daten-Loading und Error Handling

### **Phase 4: Plant Detail Screen (Schritt 10-12)**

#### Schritt 10: Detail Components
- [ ] `FigmaWateringSchedule.tsx` - "Next watering" Sektion
- [ ] `FigmaWateringHistory.tsx` - Watering History Liste
- [ ] Plant Image Display

#### Schritt 11: Plant Detail Screen
- [ ] `FigmaPlantDetailScreen.tsx` implementieren
- [ ] Navigation von Plant List zu Detail
- [ ] Back Button Funktionalität

#### Schritt 12: Watering Actions
- [ ] "Water Now" Button implementieren
- [ ] Watering Entry hinzufügen
- [ ] History aktualisieren

### **Phase 5: Add Plant Screen (Schritt 13-14)**

#### Schritt 13: Form Components
- [ ] `FigmaFormField.tsx` - Input mit Label
- [ ] `FigmaToggle.tsx` - Reminder Toggle
- [ ] Dropdown für Plant Type

#### Schritt 14: Add Plant Screen
- [ ] `FigmaAddPlantScreen.tsx` implementieren
- [ ] Form Validation
- [ ] Plant Creation Logic

### **Phase 6: Settings Screen (Schritt 15-16)**

#### Schritt 15: Settings Components
- [ ] `FigmaSettingsGroup.tsx` - Settings Sektionen
- [ ] Settings Items mit Toggles
- [ ] Language/Theme Selectors

#### Schritt 16: Settings Screen
- [ ] `FigmaSettingsScreen.tsx` implementieren
- [ ] Settings Integration mit Store
- [ ] Preferences speichern

### **Phase 7: Polish & Testing (Schritt 17-18)**

#### Schritt 17: Navigation & UX
- [ ] Bottom Navigation zwischen Screens
- [ ] Smooth Transitions
- [ ] Loading States

#### Schritt 18: Final Testing
- [ ] Alle Screens testen
- [ ] Datenfluss validieren
- [ ] Mobile Responsiveness
- [ ] Performance Check

## 📱 Screen-spezifische Details

### Plant List Screen (Design 18-2)
- Header: "My Plants" + Plus Button
- Plant Cards: Name, Image, Watering Status, Last Watered
- Bottom Navigation: Home (active), Plants, Settings
- Scroll-fähige Liste

### Plant Detail Screen (Design 27-2)  
- Header: Back Button + Plant Name
- Large Plant Image
- Watering Schedule: "Next watering: Every 7 days, In 3 days"
- Notes Section: Plant care information
- Watering History: List mit Daten
- Green "Water Now" Button

### Add Plant Screen (Design 26-170)
- Header: Back Button + "Add Plant"
- Form Fields: Plant Name, Plant Type (Dropdown), Watering Frequency
- Reminders Toggle Switch
- Green "Add Plant" Button

### Settings Screen (Design 26-73)
- Header: Back Button + "Settings"
- Preferences: Theme (System), Language (English)
- Notifications: 4 Toggle Switches
- Profile: Edit profile, Logout
- Bottom Navigation

## 🔧 Technische Notizen

### Bestehende Infrastruktur nutzen
- **IndexedDB**: Gleiche Plant/Room/Task/Image Tabellen
- **Zustand Store**: Bestehende Actions und State
- **Services**: db.ts, openai.ts (falls später benötigt)

### Neue Services
- **waterManagement.ts**: Mapping und Calculation Logic
- **figmaNavigation.ts**: Navigation zwischen Figma Screens

### Performance Considerations
- Lazy Loading für Screens
- Image Optimization
- Efficient Re-renders

## 🎯 Success Criteria

### Minimum Viable Product (MVP)
- [ ] Alle 4 Screens implementiert und navigierbar
- [ ] Echte Daten aus bestehender DB angezeigt
- [ ] Water Management funktionsfähig
- [ ] Pixel-perfect zu Figma Designs

### Nice-to-Have
- [ ] Smooth Animations
- [ ] Offline Functionality
- [ ] Push Notifications für Watering
- [ ] Export/Import von Pflanzen

## 📝 Nächste Schritte

**Aktueller Status**: Phase 3 abgeschlossen ✅ - Plant List Screen mit echten Daten funktionsfähig
**Nächster Schritt**: Phase 4, Schritt 10 - Plant Detail Screen Components

### **Phase 4 Implementierungsdetails (basierend auf Figma Design 27-2):**

#### **Schritt 10.1: FigmaWateringSchedule.tsx**
```typescript
// Komponente für Bewässerungsplan-Sektion
// - "Next watering" Label
// - "Every X days" Frequenz (grüne Farbe #94C7AD)
// - "In X days" Status
// Props: nextWatering, frequency, daysUntil
```

#### **Schritt 10.2: FigmaWateringHistory.tsx**
```typescript
// Komponente für Bewässerungshistorie
// - Liste von Bewässerungseinträgen
// - "Watered" + Datum Format
// Props: wateringEntries[]
```

#### **Schritt 10.3: FigmaPlantImage.tsx**
```typescript
// Große Pflanzenbildanzeige
// - 537px Höhe, 12px border-radius
// - Placeholder handling
// Props: imageUrl, plantName
```

#### **Schritt 11: FigmaPlantDetailScreen.tsx**
```typescript
// Komplette Detailansicht Assembly
// - Header mit Back Button + Plant Name
// - Plant Image Section
// - Watering Schedule Section
// - Notes Section
// - Watering History Section
// - Green "Water Now" Button
// - URL Parameter für Plant ID
```

#### **Schritt 12: Navigation & Actions**
```typescript
// Navigation zwischen Screens
// - Plant List → Plant Detail (mit ID)
// - Back Button → Plant List
// - "Water Now" Action → Add Watering Entry
```

---

*Letzte Aktualisierung: 25.05.2025*
*Geschätzte Gesamtzeit: 8-12 Stunden*
*Priorität: Hoch - Proof of Concept für neue UI*