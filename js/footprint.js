function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function computeFootprint(agl, hfovDeg) {
  if (agl <= 0) {
    return null;
  }
  const hfovRad = degToRad(hfovDeg);
  const width = 2 * agl * Math.tan(hfovRad / 2);
  const height = (width * 9) / 16;
  return { width, height };
}

export function computeCorners(google, center, width, height, headingDeg) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Assumption: Heading 0 means north-up; heading rotates the rectangle clockwise.
  const northHeading = headingDeg;
  const eastHeading = (headingDeg + 90) % 360;
  const southHeading = (headingDeg + 180) % 360;
  const westHeading = (headingDeg + 270) % 360;

  const northPoint = google.maps.geometry.spherical.computeOffset(center, halfHeight, northHeading);
  const southPoint = google.maps.geometry.spherical.computeOffset(center, halfHeight, southHeading);

  const northEast = google.maps.geometry.spherical.computeOffset(northPoint, halfWidth, eastHeading);
  const northWest = google.maps.geometry.spherical.computeOffset(northPoint, halfWidth, westHeading);
  const southEast = google.maps.geometry.spherical.computeOffset(southPoint, halfWidth, eastHeading);
  const southWest = google.maps.geometry.spherical.computeOffset(southPoint, halfWidth, westHeading);

  return [northWest, northEast, southEast, southWest];
}
