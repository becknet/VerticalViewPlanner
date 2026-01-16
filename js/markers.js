export function createLabel(content) {
  const el = document.createElement("div");
  el.className = "marker-label";
  el.textContent = content;
  return el;
}

export function createMarkers(google, map, options) {
  const homeMarker = new google.maps.marker.AdvancedMarkerElement({
    map,
    position: options.homePosition,
    gmpDraggable: true,
    title: "Home / Startpunkt",
    // Assumption: Short labels H/B provide quick visual distinction.
    content: createLabel("H"),
  });

  const centerMarker = new google.maps.marker.AdvancedMarkerElement({
    map,
    position: options.centerPosition,
    gmpDraggable: true,
    title: "Bildzentrum",
    content: createLabel("B"),
  });

  homeMarker.addListener("drag", () => options.onHomeMove(homeMarker.position));
  homeMarker.addListener("dragend", () => options.onHomeMove(homeMarker.position));

  centerMarker.addListener("drag", () => options.onCenterMove(centerMarker.position));
  centerMarker.addListener("dragend", () => options.onCenterMove(centerMarker.position));

  return { homeMarker, centerMarker };
}
