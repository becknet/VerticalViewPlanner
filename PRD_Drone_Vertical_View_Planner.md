# 📄 PRD / Codex-Prompt  
## Drone Vertical View Planner – Google Maps Overlay

**Ziel:** Planung von 16:9-Drohnen-Nadir-Aufnahmen unter Berücksichtigung von Terrain-Höhen sowie positiver **und negativer relativer Höhe** zur Startposition.

---

## 1. Ziel des Produkts
Entwickle eine browserbasierte Web-Applikation, mit der Drohnen-Fotograf:innen auf Google Maps einen **rotierbaren 16:9-Bild-Ausschnitt (Overlay)** planen können.

Der dargestellte Bildausschnitt soll:
- der realen **Bodenabdeckung einer senkrecht nach unten gerichteten Kamera (Nadir)** entsprechen,
- von der **relativen Höhe der Drohne zur Startposition** abhängen (auch negativ),
- die **Höhendifferenz des Terrains** zwischen Startpunkt und Motiv berücksichtigen.

---

## 2. Kernkonzepte & Begriffe

### Home Point (Startpunkt)
Ort, an dem die Drohne startet. Referenzpunkt für die relative Höhe.

### Image Center
Punkt auf der Karte, auf den die Kamera senkrecht nach unten zeigt.

### Relative Höhe `H_rel`
Höhe der Drohne relativ zum Home Point.

- Kann **positiv oder negativ** sein  
- Wertebereich: **konfigurierbar**, z. B. `-200 m … +150 m`

### Terrainhöhen
- `E_home`: Terrainhöhe am Home Point (m ü. M.)
- `E_center`: Terrainhöhe am Image Center (m ü. M.)

### Effektive Höhe über Grund (AGL)
```
AGL_center = (E_home + H_rel) − E_center
```

Nur wenn `AGL_center > 0` ist ein gültiger Bildausschnitt möglich.

---

## 3. Funktionale Anforderungen

### 3.1 Karte
- Google Maps JavaScript API
- Aktivierte Libraries:
  - `geometry`
  - `elevation`
- Initiale Kartenposition: Schweiz

---

### 3.2 Marker

#### Home Point
- Marker „Home / Startpunkt“
- Setzbar per Klick
- Draggable
- Optionaler Button:
  - „Mein Standort“ → `navigator.geolocation`

#### Image Center
- Marker „Bildzentrum“
- Draggable
- Bewegt das Overlay live

---

### 3.3 Höhenmodell
- Verwende **Google Maps ElevationService**
- Ermittle:
  - `E_home`
  - `E_center`
- Anforderungen:
  - Debounce Elevation-Requests (300–500 ms)
  - Caching (z. B. Koordinaten auf 5–10 m Raster runden)

---

### 3.4 Relative-Höhe-Slider
- Slider für `H_rel`
- Default-Bereich:
  - z. B. `-200 m … +150 m` (konfigurierbar)
- UI-Label:
  - **„Relative Höhe zur Startposition (m)“**
- Negative Werte explizit erlauben
- Bei Änderung:
  - Neu berechne `AGL_center`
  - Aktualisiere Overlay

---

### 3.5 Kamera & Bildausschnitt
- Kamera:
  - senkrecht nach unten (Nadir)
- Bildformat:
  - fix **16:9**
- Kamera-Parameter:
  - konfigurierbarer **Horizontal Field of View (HFOV)**

#### Footprint-Berechnung
```
groundWidth  = 2 * AGL_center * tan(HFOV / 2)
groundHeight = groundWidth * 9 / 16
```

- Nur berechnen, wenn `AGL_center > 0`

---

### 3.6 Overlay
- Overlay als **Polygon mit 4 Eckpunkten**
- Eigenschaften:
  - zentriert auf Image Center
  - halbtransparent
  - **rotierbar (Heading 0–360°)**
- Eckpunkte berechnen mit:
  - `google.maps.geometry.spherical.computeOffset`
- Heading steuerbar per Slider oder Input

---

### 3.7 Visual Feedback
Live anzeigen:
- Elevation Home (m ü. M.)
- Elevation Image Center (m ü. M.)
- Relative Höhe `H_rel` (m)
- Effektive AGL am Motiv (m)
- Footprint-Größe (Breite × Höhe in m)

#### Warnlogik
- Wenn `AGL_center <= 0`:
  - Overlay rot oder ausgeblendet
  - Hinweis:
    - „Motiv liegt höher als die aktuelle Drohnenhöhe relativ zum Startpunkt.“

---

## 4. Nicht-funktionale Anforderungen
- Reine Client-Side-App
- Technologien:
  - HTML
  - CSS
  - Vanilla JavaScript
- Modularer Code:
  - `map.js`
  - `markers.js`
  - `elevation.js`
  - `footprint.js`
  - `ui.js`

---

## 5. UX-Anforderungen
- Intuitiv für Drohnen-Fotograf:innen
- Klare visuelle Trennung:
  - Home Point
  - Image Center
  - Overlay
- Flüssige Interaktion ohne flackernde Updates

---

## 6. Out of Scope
- Luftraum- / Zonen-Prüfungen
- Rechtliche Bewertung
- Schrägaufnahmen
- Wind, Sichtlinie, Funkreichweite

---

## 7. Deliverables
- Lauffähige HTML-Datei
- Strukturierter, modularer JavaScript-Code
- README-Kommentar im Code

---

## 8. Optional / Bonus
- Preset-Buttons für `H_rel`
- Elevation-Sampling der Footprint-Ecken
- Export als GeoJSON
