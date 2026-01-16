# Drone Vertical View Planner

Browserbasierte Web-App zur Planung eines 16:9-Nadir-Overlays auf Google Maps unter Beruecksichtigung von Terrainhoehen und relativer Hoehe zur Startposition.

## Setup
1) Google Maps JavaScript API Key erstellen.
2) (Optional) Map ID fuer AdvancedMarkerElement erstellen.
3) API Key in `index.html` einsetzen.
4) Map ID in `js/main.js` bei `CONFIG.mapId` einsetzen.

## Start
Die App ist client-side. Oeffne `index.html` im Browser (oder ueber einen lokalen Server).

## Nutzung
- Ort suchen und auswaehlen.
- Marker werden am Ort gesetzt.
- Relative Hoehe, Heading und HFOV anpassen.
- Overlay zeigt den berechneten 16:9-Ausschnitt.

## Wichtige Hinweise
- Die Maps JavaScript API und Places API muessen im Google Cloud Console Projekt aktiviert sein.
- `AdvancedMarkerElement` erfordert eine Map ID.
- Elevation-Abfragen werden gecached und debounced.

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
- Assumption: Default HFOV ist 78 Grad (typischer Wert fuer DJI Mini 3, Foto 16:9).
- Assumption: Relative Hoehe Standardbereich ist -200 bis +150 m.
- Assumption: Elevation-Debounce ist 400 ms.
- Assumption: Cache-Raster ist 0.0001 Grad (ca. 11 m).
