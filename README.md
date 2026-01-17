# Drone Vertical View Planner

Browserbasierte Web-App zur Planung eines 16:9-Nadir-Overlays auf Google Maps unter Beruecksichtigung von Terrainhoehen und relativer Hoehe zur Startposition.

## Setup
1) Google Maps JavaScript API Key erstellen.
2) Map ID fuer AdvancedMarkerElement erstellen (erforderlich).
3) API Key in `index.html` einsetzen.
4) Map ID in `js/main.js` bei `CONFIG.mapId` einsetzen.

## Start
Die App ist client-side. Oeffne `index.html` im Browser (oder ueber einen lokalen Server).

## Nutzung
- Ort suchen und auswaehlen (oder "Mein Standort").
- Marker werden am Ort gesetzt.
- Relative Hoehe anpassen.
- Rotation direkt im Bild ueber den Rotationsgriff.
- Overlay zeigt den berechneten 16:9-Ausschnitt.
- Flugdauer basiert auf 10 m/s und der Horizontaldistanz.

## Wichtige Hinweise
- Die Maps JavaScript API und Places API muessen im Google Cloud Console Projekt aktiviert sein.
- `AdvancedMarkerElement` erfordert eine Map ID.
- Elevation-Abfragen werden gecached und debounced.
- Standardansicht ist Satellit.

## Projektstruktur
- `index.html` UI und Maps-Script
- `styles.css` Layout und Styles
- `js/main.js` App-Logik und State
- `js/map.js` Map-Initialisierung
- `js/markers.js` Marker-Erstellung
- `js/elevation.js` Elevation-Service
- `js/footprint.js` Footprint-Logik
- `js/ui.js` UI-Glue

## Annahmen
- Assumption: Default map center ist die Schweiz (46.8, 8.33) mit Zoom 8.
- Assumption: Standardansicht ist Satellit.
- Assumption: Default HFOV ist 69 Grad.
- Assumption: Relative Hoehe Standardbereich ist -200 bis +120 m.
- Assumption: Elevation-Debounce ist 400 ms.
- Assumption: Cache-Raster ist 0.0001 Grad (ca. 11 m).
- Assumption: Standortauswahl zoomt auf 16.
- Assumption: Flugzeit berechnet mit 10 m/s.
