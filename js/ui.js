export function initUI() {
  const relHeightInput = document.getElementById("relHeight");
  const relHeightValue = document.getElementById("relHeightValue");
  const headingInput = document.getElementById("heading");
  const headingValue = document.getElementById("headingValue");
  const locateButton = document.getElementById("locate");
  const placeSearchContainer = document.getElementById("placeSearch");
  const sunDateInput = document.getElementById("sunDate");
  const sunTimeInput = document.getElementById("sunTime");
  const sunNowButton = document.getElementById("sunNow");
  const sunAltitude = document.getElementById("sunAltitude");
  const sunAzimuth = document.getElementById("sunAzimuth");
  const sunStatus = document.getElementById("sunStatus");
  const eHome = document.getElementById("eHome");
  const eCenter = document.getElementById("eCenter");
  const hRel = document.getElementById("hRel");
  const agl = document.getElementById("agl");
  const horizDist = document.getElementById("horizDist");
  const flightTime = document.getElementById("flightTime");
  const footprint = document.getElementById("footprint");
  const warning = document.getElementById("warning");

  function setOutput(element, value, fractionDigits = 1) {
    if (value === null || Number.isNaN(value)) {
      element.textContent = "-";
      return;
    }
    element.textContent = value.toFixed(fractionDigits);
  }

  function setFootprint(value) {
    if (!value) {
      footprint.textContent = "-";
      return;
    }
    footprint.textContent = `${value.width.toFixed(1)} x ${value.height.toFixed(1)}`;
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function setSunDateTime(date) {
    sunDateInput.value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    sunTimeInput.value = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function getSunDateTime() {
    if (!sunDateInput.value || !sunTimeInput.value) {
      return null;
    }
    return new Date(`${sunDateInput.value}T${sunTimeInput.value}`);
  }

  return {
    relHeightInput,
    headingInput,
    locateButton,
    placeSearchContainer,
    sunDateInput,
    sunTimeInput,
    sunNowButton,
    setSunDateTime,
    getSunDateTime,
    setRelHeightValue(value) {
      relHeightValue.textContent = value.toFixed(0);
      hRel.textContent = value.toFixed(0);
    },
    setHeadingValue(value) {
      headingValue.textContent = value.toFixed(0);
    },
    setElevations({ E_home, E_center }) {
      setOutput(eHome, E_home);
      setOutput(eCenter, E_center);
    },
    setAgl(value) {
      setOutput(agl, value);
    },
    setHorizontalDistance(value) {
      setOutput(horizDist, value);
    },
    setFlightTime(valueSeconds) {
      setOutput(flightTime, valueSeconds);
    },
    setFootprint,
    setSunPosition(value) {
      if (!value) {
        sunAltitude.textContent = "-";
        sunAzimuth.textContent = "-";
        sunStatus.textContent = "-";
        return;
      }
      sunAltitude.textContent = `${value.altitudeDeg.toFixed(1)}°`;
      sunAzimuth.textContent = `${value.azimuthDeg.toFixed(0)}°`;
      sunStatus.textContent = value.altitudeDeg > 0 ? "über Horizont" : "unter Horizont";
    },
    setWarningVisible(visible) {
      warning.style.display = visible ? "block" : "none";
    },
  };
}
