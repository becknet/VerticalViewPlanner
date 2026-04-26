const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const J2000 = 2451545;

function toJulian(date) {
  return date.valueOf() / 86400000 - 0.5 + 2440588;
}

function toDays(date) {
  return toJulian(date) - J2000;
}

function rightAscension(lon, lat) {
  const e = 23.4397 * RAD;
  return Math.atan2(
    Math.sin(lon) * Math.cos(e) - Math.tan(lat) * Math.sin(e),
    Math.cos(lon)
  );
}

function declination(lon, lat) {
  const e = 23.4397 * RAD;
  return Math.asin(
    Math.sin(lat) * Math.cos(e) + Math.cos(lat) * Math.sin(e) * Math.sin(lon)
  );
}

function solarMeanAnomaly(days) {
  return RAD * (357.5291 + 0.98560028 * days);
}

function eclipticLongitude(meanAnomaly) {
  const center =
    RAD *
    (1.9148 * Math.sin(meanAnomaly) +
      0.02 * Math.sin(2 * meanAnomaly) +
      0.0003 * Math.sin(3 * meanAnomaly));
  const perihelion = RAD * 102.9372;
  return meanAnomaly + center + perihelion + Math.PI;
}

function siderealTime(days, lw) {
  return RAD * (280.16 + 360.9856235 * days) - lw;
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

export function getSunPosition(date, latLng) {
  const latitude = getLat(latLng) * RAD;
  const longitude = getLng(latLng) * RAD;
  const lw = -longitude;
  const days = toDays(date);
  const meanAnomaly = solarMeanAnomaly(days);
  const eclipticLon = eclipticLongitude(meanAnomaly);
  const decl = declination(eclipticLon, 0);
  const ra = rightAscension(eclipticLon, 0);
  const hourAngle = siderealTime(days, lw) - ra;

  const altitude = Math.asin(
    Math.sin(latitude) * Math.sin(decl) +
      Math.cos(latitude) * Math.cos(decl) * Math.cos(hourAngle)
  );
  const azimuthSouth = Math.atan2(
    Math.sin(hourAngle),
    Math.cos(hourAngle) * Math.sin(latitude) - Math.tan(decl) * Math.cos(latitude)
  );

  return {
    altitudeDeg: altitude * DEG,
    azimuthDeg: ((azimuthSouth * DEG + 180) % 360 + 360) % 360,
  };
}
