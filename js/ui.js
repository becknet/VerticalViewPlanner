export function initUI() {
  const relHeightInput = document.getElementById("relHeight");
  const relHeightValue = document.getElementById("relHeightValue");
  const headingInput = document.getElementById("heading");
  const headingValue = document.getElementById("headingValue");
  const locateButton = document.getElementById("locate");
  const placeSearchInput = document.getElementById("placeSearch");
  const eHome = document.getElementById("eHome");
  const eCenter = document.getElementById("eCenter");
  const hRel = document.getElementById("hRel");
  const agl = document.getElementById("agl");
  const horizDist = document.getElementById("horizDist");
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

  return {
    relHeightInput,
    headingInput,
    locateButton,
    placeSearchInput,
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
    setFootprint,
    setWarningVisible(visible) {
      warning.style.display = visible ? "block" : "none";
    },
  };
}
