export function createMap(google, mapElement, mapId) {
  // Assumption: Default map center is central Switzerland (46.8, 8.33) with zoom 8.
  const defaultCenter = { lat: 46.8, lng: 8.33 };

  return new google.maps.Map(mapElement, {
    center: defaultCenter,
    zoom: 8,
    // Assumption: Terrain map type improves height planning context.
    mapTypeId: "terrain",
    tilt: 0,
    heading: 0,
    // Assumption: AdvancedMarkerElement requires a valid Map ID from Google Cloud Console.
    mapId,
  });
}
