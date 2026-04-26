# AGENTS.md

## Project Overview

Vertical View Planner is a client-side Google Maps web app for planning a 16:9 nadir drone image footprint. It accounts for terrain elevation at the home point and image center, plus the drone height relative to the home point.

The app is intentionally simple: static HTML, CSS, and vanilla JavaScript ES modules. There is no package manager, build step, bundler, or test framework in the current repository.

## Tech Stack

- HTML: `index.html`
- CSS: `styles.css`
- JavaScript: vanilla ES modules in `js/`
- External APIs: Google Maps JavaScript API with `geometry`, `elevation`, `marker`, and `places` libraries
- Map UI: Google Maps `AdvancedMarkerElement`, `Polygon`, `ElevationService`, `PlaceAutocompleteElement`

## Repository Structure

- `index.html`: App shell, controls, info panel, Google Maps script loading, `window.initMap` bootstrap
- `styles.css`: Layout, responsive behavior, panel/map styling, marker styling
- `js/main.js`: Main app state, event wiring, overlay lifecycle, elevation refresh, location/search handling
- `js/map.js`: Google Map creation and defaults
- `js/markers.js`: Home marker, image-center marker, marker label helpers
- `js/elevation.js`: Debounced and cached elevation lookup logic
- `js/footprint.js`: Footprint dimensions and rotated polygon corner calculations
- `js/ui.js`: DOM lookup and display update helpers
- `README.md`: Setup, usage, assumptions, and structure summary
- `PRD_Drone_Vertical_View_Planner.md`: Product requirements and formulas

## Core Domain Logic

Effective height above ground at the image center is:

```text
AGL_center = E_home + H_rel - E_center
```

Only render the footprint when `AGL_center > 0`. If AGL is invalid, hide the overlay and show the warning.

Footprint size is calculated in `js/footprint.js`:

```text
groundWidth = 2 * AGL_center * tan(HFOV / 2)
groundHeight = groundWidth * 9 / 16
```

The polygon corners are computed with `google.maps.geometry.spherical.computeOffset`, using the center point, width, height, and heading.

## Important Implementation Details

- Keep the app client-side only unless the user explicitly asks for a backend.
- Preserve the modular split in `js/`; do not collapse logic into `index.html`.
- `CONFIG` in `js/main.js` is the central place for runtime constants such as relative-height bounds, HFOV, debounce time, cache grid, Map ID, speed, and selection zoom.
- `index.html` currently contains the Google Maps API key and loads the Maps script directly. Do not rotate, remove, or expose additional secrets unless asked.
- `AdvancedMarkerElement` requires a valid Google Cloud Map ID. Keep `CONFIG.mapId` wired into `createMap`.
- Place search uses `google.maps.places.PlaceAutocompleteElement`, not the legacy `google.maps.places.Autocomplete` widget.
- Elevation requests are debounced and cached in `js/elevation.js`; preserve this behavior when changing marker/slider interactions.
- Marker creation is delayed until the user selects a place, clicks location, or otherwise initializes a planning point. Avoid creating operational markers before a valid selected point unless the UX requirement changes.
- Home marker and image-center marker have different meanings. Home affects `E_home`; center affects `E_center` and footprint placement.
- Horizontal distance and flight time are informational only. Current flight-time assumption is 10 m/s.
- Rotation is currently controlled by dragging the rotate handle marker. The hidden heading slider exists in the DOM but is not the active UX control.

## Coding Guidelines

- Use plain JavaScript modules and browser APIs.
- Use `const` and `let`; avoid `var`.
- Keep comments short and useful. Existing comments often document assumptions; update them when behavior changes.
- Prefer small pure functions for math and Google Maps coordinate calculations.
- Keep UI formatting in `js/ui.js`; keep domain calculations in `js/footprint.js`; keep API/caching behavior in `js/elevation.js`.
- Preserve German UI copy unless the user asks for localization or copy changes.
- Keep files ASCII where practical, but existing UI text includes German umlauts in HTML/Markdown. Match the surrounding file style.
- Do not introduce a framework, bundler, TypeScript, or dependencies without a clear user request.

## Manual Verification

There is no automated test suite at the moment. Verify changes manually:

1. Start a local server from the repository root:

```sh
python3 -m http.server 8000
```

2. Open:

```text
http://localhost:8000/
```

3. In the browser, check:

- Google Maps loads without API, Map ID, or library errors.
- Place search renders the new Google Places autocomplete element and does not emit the legacy Autocomplete warning.
- Place search selects a location and creates both markers.
- `Mein Standort` works when geolocation permission is granted.
- Dragging the home marker updates home elevation, AGL, distance, and flight time.
- Dragging the image-center marker moves the overlay and updates center elevation.
- Moving the relative-height slider updates AGL and footprint dimensions.
- If AGL is `<= 0`, the overlay disappears and the warning is visible.
- Dragging the rotation handle rotates the polygon around the image center.
- Layout works on desktop and below `960px` viewport width.

## HTML Validation

If changing HTML, validate with the W3C Nu checker when network access is available. The project has previously used a `curl` form upload flow against `https://validator.w3.org/nu/`.

## Known Gaps

- No automated unit tests for footprint math or elevation caching.
- No build-time linting or formatting.
- Google Maps API key is embedded in `index.html` for this static-client setup.
- Elevation failures fall back to cached values or `null`; there is no explicit UI error state.
- Heading slider markup is hidden and not wired to state updates.

## Change Safety

- Do not overwrite user edits or run destructive Git commands.
- Before larger behavioral changes, compare against `PRD_Drone_Vertical_View_Planner.md` and update `README.md` if assumptions or usage change.
- If adding tests or tooling, document the exact commands in this file and `README.md`.
