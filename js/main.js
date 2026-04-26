import { createMap } from "./map.js";
import { createLabel, createMarkers } from "./markers.js";
import { createElevationFetcher } from "./elevation.js";
import { computeFootprint, computeCorners } from "./footprint.js";
import { getSunPosition } from "./sun.js";
import { initUI } from "./ui.js";

const CONFIG = {
  // Assumption: Default relative height range and start value follow PRD example.
  relHeightMin: -200,
  relHeightMax: 120,
  relHeightDefault: 50,
  // Assumption: Default HFOV is 69 degrees (typical consumer drone camera).
  hfovDefault: 69,
  // Assumption: Elevation debounce uses 400 ms within the 300-500 ms range.
  elevationDebounceMs: 400,
  // Assumption: Cache rounding uses 0.0001 degrees (~11 m) to approximate a 5-10 m grid.
  elevationGridDeg: 0.0001,
  // Assumption: Heading slider default is 0 degrees (north-up orientation).
  headingDefault: 0,
  // Assumption: Replace with your Google Maps Map ID to enable AdvancedMarkerElement.
  mapId: "63a5a9a4011800734ca37433",
  // Assumption: Drone horizontal speed is 10 m/s for flight time estimation.
  droneSpeedMetersPerSec: 10,
  // Assumption: Zoom to 16 when a new location is selected for closer planning.
  selectionZoom: 16,
  // Assumption: 400 m is long enough to show sun direction without cluttering the map.
  sunLineLengthMeters: 400,
};

export function initMap() {
  const map = createMap(window.google, document.getElementById("map"), CONFIG.mapId);
  const ui = initUI();

  ui.relHeightInput.min = CONFIG.relHeightMin;
  ui.relHeightInput.max = CONFIG.relHeightMax;
  ui.relHeightInput.value = CONFIG.relHeightDefault;

  ui.setRelHeightValue(CONFIG.relHeightDefault);
  ui.setSunDateTime(new Date());
  ui.locateButton.disabled = false;

  const mapCenter = map.getCenter();

  const state = {
    H_rel: CONFIG.relHeightDefault,
    heading: CONFIG.headingDefault,
    hfov: CONFIG.hfovDefault,
    E_home: null,
    E_center: null,
    lastFootprint: null,
    markersReady: false,
  };

  const overlay = new google.maps.Polygon({
    map,
    paths: [],
    clickable: false,
    strokeColor: "#1d5b66",
    strokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: "#64b5c3",
    fillOpacity: 0.35,
  });

  const sunLine = new google.maps.Polyline({
    map,
    path: [],
    clickable: false,
    strokeColor: "#f5b700",
    strokeOpacity: 0.95,
    strokeWeight: 4,
    zIndex: 1,
  });

  const rotateLabel = createLabel("");
  rotateLabel.innerHTML =
    '<svg class="rotate-icon" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 4a7.9 7.9 0 0 1 5.65 2.35l1.35-1.35V9h-4l1.59-1.59A5.9 5.9 0 1 0 17.9 12h2a7.9 7.9 0 1 1-7.9-8z" />' +
    "</svg>";
  rotateLabel.classList.add("rotate-handle");
  const rotateMarker = new google.maps.marker.AdvancedMarkerElement({
    map: null,
    position: mapCenter,
    gmpDraggable: true,
    title: "Rotation",
    // Assumption: Dedicated rotate handle uses label "R" to keep markers ASCII-only.
    content: rotateLabel,
  });

  let homeMarker = null;
  let centerMarker = null;

  function updateSunPosition(centerPos) {
    const date = ui.getSunDateTime();
    if (!centerPos || !date || Number.isNaN(date.valueOf())) {
      ui.setSunPosition(null);
      sunLine.setPath([]);
      return;
    }
    const sun = getSunPosition(date, centerPos);
    ui.setSunPosition(sun);
    const lineEnd = window.google.maps.geometry.spherical.computeOffset(
      centerPos,
      CONFIG.sunLineLengthMeters,
      sun.azimuthDeg
    );
    sunLine.setPath([centerPos, lineEnd]);
    sunLine.setOptions({ strokeOpacity: sun.altitudeDeg > 0 ? 0.95 : 0.35 });
  }

  function ensureMarkers(centerPos) {
    if (state.markersReady) {
      return;
    }
    // Assumption: Markers are created only after user selects a place.
    const markers = createMarkers(window.google, map, {
      homePosition: centerPos,
      centerPosition: centerPos,
      onHomeMove: (position) => {
        refreshElevations(position, centerMarker.position);
      },
      onCenterMove: (position) => {
        updateOverlayPosition(position);
        updateSunPosition(position);
        refreshElevations(homeMarker.position, position);
      },
    });
    homeMarker = markers.homeMarker;
    centerMarker = markers.centerMarker;
    state.markersReady = true;
    ui.locateButton.disabled = false;
    updateSunPosition(centerMarker.position);
    refreshElevations(homeMarker.position, centerMarker.position);
  }

  const requestElevations = createElevationFetcher(window.google, {
    debounceMs: CONFIG.elevationDebounceMs,
    gridSizeDeg: CONFIG.elevationGridDeg,
  });

  function refreshElevations(homePos, centerPos) {
    if (!homePos || !centerPos) {
      return;
    }
    // Assumption: Horizontal distance equals ground distance between Home and Image Center.
    const horizontalDistance = window.google.maps.geometry.spherical.computeDistanceBetween(
      homePos,
      centerPos
    );
    ui.setHorizontalDistance(horizontalDistance);
    ui.setFlightTime(horizontalDistance / CONFIG.droneSpeedMetersPerSec);
    requestElevations(homePos, centerPos, (result) => {
      state.E_home = result.E_home;
      state.E_center = result.E_center;
      ui.setElevations(result);
      updateDerived();
    });
  }

  function updateDerived() {
    if (state.E_home === null || state.E_center === null) {
      state.lastFootprint = null;
      ui.setAgl(null);
      ui.setFootprint(null);
      ui.setWarningVisible(false);
      overlay.setVisible(false);
      return;
    }

    const agl = state.E_home + state.H_rel - state.E_center;
    ui.setAgl(agl);

    if (agl <= 0) {
      // Assumption: Overlay is hidden when AGL is invalid; warning is shown.
      state.lastFootprint = null;
      ui.setFootprint(null);
      ui.setWarningVisible(true);
      overlay.setVisible(false);
      rotateMarker.map = null;
      return;
    }

    ui.setWarningVisible(false);
    state.lastFootprint = computeFootprint(agl, state.hfov);
    ui.setFootprint(state.lastFootprint);
    updateOverlayPosition(centerMarker.position);
    overlay.setVisible(true);
    rotateMarker.map = map;
  }

  function updateOverlayPosition(centerPos) {
    if (!centerPos || !state.lastFootprint) {
      return;
    }
    const corners = computeCorners(
      window.google,
      centerPos,
      state.lastFootprint.width,
      state.lastFootprint.height,
      state.heading
    );
    overlay.setPath(corners);
    // Assumption: Rotate handle sits slightly above the footprint's top edge.
    const handleDistance = Math.max(state.lastFootprint.height / 2 + 15, 20);
    const handlePos = window.google.maps.geometry.spherical.computeOffset(
      centerPos,
      handleDistance,
      state.heading
    );
    rotateMarker.position = handlePos;
  }

  function updateHeadingFromHandle() {
    if (!centerMarker) {
      return;
    }
    const centerPos = centerMarker.position;
    const handlePos = rotateMarker.position;
    if (!centerPos || !handlePos) {
      return;
    }
    const heading = window.google.maps.geometry.spherical.computeHeading(centerPos, handlePos);
    state.heading = (heading + 360) % 360;
    updateOverlayPosition(centerPos);
  }

  ui.relHeightInput.addEventListener("input", (event) => {
    state.H_rel = Number(event.target.value);
    ui.setRelHeightValue(state.H_rel);
    if (state.markersReady) {
      updateDerived();
    }
  });

  ui.sunDateInput.addEventListener("change", () => {
    if (state.markersReady) {
      updateSunPosition(centerMarker.position);
    }
  });

  ui.sunTimeInput.addEventListener("change", () => {
    if (state.markersReady) {
      updateSunPosition(centerMarker.position);
    }
  });

  ui.sunNowButton.addEventListener("click", () => {
    ui.setSunDateTime(new Date());
    if (state.markersReady) {
      updateSunPosition(centerMarker.position);
    }
  });

  ui.locateButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      return;
    }
    // Assumption: "Mein Standort" updates the Home marker and keeps Image Center unchanged.
    navigator.geolocation.getCurrentPosition((position) => {
      const latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      if (!state.markersReady) {
        map.panTo(latLng);
        map.setZoom(CONFIG.selectionZoom);
        ensureMarkers(latLng);
        return;
      }
      homeMarker.position = latLng;
      map.panTo(latLng);
      refreshElevations(latLng, centerMarker.position);
    });
  });

  map.addListener("click", (event) => {
    if (!state.markersReady) {
      return;
    }
    homeMarker.position = event.latLng;
    refreshElevations(event.latLng, centerMarker.position);
  });

  rotateMarker.addListener("drag", updateHeadingFromHandle);
  rotateMarker.addListener("dragend", updateHeadingFromHandle);

  const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({});
  placeAutocomplete.id = "placeAutocomplete";
  placeAutocomplete.setAttribute("aria-label", "Ort oder Adresse");
  placeAutocomplete.placeholder = "Ort oder Adresse";
  ui.placeSearchContainer.appendChild(placeAutocomplete);

  placeAutocomplete.addEventListener("gmp-select", async (event) => {
    const place = event.placePrediction.toPlace();
    await place.fetchFields({ fields: ["displayName", "location"] });
    if (!place.location) {
      return;
    }
    map.panTo(place.location);
    map.setZoom(CONFIG.selectionZoom);
    if (!state.markersReady) {
      ensureMarkers(place.location);
      return;
    }
    // Assumption: New search recenters both markers to the selected place.
    homeMarker.position = place.location;
    centerMarker.position = place.location;
    updateSunPosition(centerMarker.position);
    refreshElevations(homeMarker.position, centerMarker.position);
  });
}

window.initMap = initMap;
