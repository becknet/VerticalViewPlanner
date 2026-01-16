function roundCoord(value, gridSizeDeg) {
  return Math.round(value / gridSizeDeg) * gridSizeDeg;
}

function getLat(latLng) {
  if (typeof latLng.lat === "function") {
    return latLng.lat();
  }
  return latLng.lat;
}

function getLng(latLng) {
  if (typeof latLng.lng === "function") {
    return latLng.lng();
  }
  return latLng.lng;
}

function cacheKey(latLng, gridSizeDeg) {
  const lat = roundCoord(getLat(latLng), gridSizeDeg);
  const lng = roundCoord(getLng(latLng), gridSizeDeg);
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

export function createElevationFetcher(google, options) {
  const service = new google.maps.ElevationService();
  const cache = new Map();
  const debounceMs = options.debounceMs;
  // Assumption: gridSizeDeg is an approximation in degrees for a 5-10 m cache grid.
  const gridSizeDeg = options.gridSizeDeg;
  let timerId = null;
  let pendingRequest = null;

  function resolveFromCache(homeLatLng, centerLatLng, callback) {
    const homeKey = cacheKey(homeLatLng, gridSizeDeg);
    const centerKey = cacheKey(centerLatLng, gridSizeDeg);
    const hasHome = cache.has(homeKey);
    const hasCenter = cache.has(centerKey);

    if (hasHome && hasCenter) {
      callback({
        E_home: cache.get(homeKey),
        E_center: cache.get(centerKey),
      });
      return true;
    }

    return false;
  }

  function requestElevation(homeLatLng, centerLatLng, callback) {
    if (resolveFromCache(homeLatLng, centerLatLng, callback)) {
      return;
    }

    const locations = [];
    const keys = [];

    const homeKey = cacheKey(homeLatLng, gridSizeDeg);
    if (!cache.has(homeKey)) {
      locations.push(homeLatLng);
      keys.push(homeKey);
    }

    const centerKey = cacheKey(centerLatLng, gridSizeDeg);
    if (!cache.has(centerKey)) {
      locations.push(centerLatLng);
      keys.push(centerKey);
    }

    service.getElevationForLocations({ locations }, (results, status) => {
      if (status === "OK" && results && results.length === locations.length) {
        results.forEach((result, index) => {
          cache.set(keys[index], result.elevation);
        });
      }
      // Assumption: On request failure, fall back to cached values or null.
      callback({
        E_home: cache.get(homeKey) ?? null,
        E_center: cache.get(centerKey) ?? null,
      });
    });
  }

  return function requestElevationsDebounced(homeLatLng, centerLatLng, callback) {
    // Assumption: Debounce is set to 400 ms to satisfy the 300-500 ms requirement.
    pendingRequest = { homeLatLng, centerLatLng, callback };
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      if (!pendingRequest) {
        return;
      }
      const { homeLatLng, centerLatLng, callback } = pendingRequest;
      pendingRequest = null;
      requestElevation(homeLatLng, centerLatLng, callback);
    }, debounceMs);
  };
}
