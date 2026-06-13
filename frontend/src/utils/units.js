/**
 * Unit conversion utilities.
 * Default application state from backend is assumed to be:
 * - Temperature: Celsius (°C)
 * - Rainfall: Millimeters (mm)
 * - Area: Acres
 */

export function formatTemp(celsius, unitPref) {
  if (celsius === undefined || celsius === null) return 'N/A';
  if (unitPref === 'imperial') {
    const f = (celsius * 9/5) + 32;
    return `${f.toFixed(1)}°F`;
  }
  return `${Number(celsius).toFixed(1)}°C`;
}

export function formatRainfall(mm, unitPref) {
  if (mm === undefined || mm === null) return 'N/A';
  if (unitPref === 'imperial') {
    const inches = mm / 25.4;
    return `${inches.toFixed(2)} in`;
  }
  return `${Number(mm).toFixed(1)} mm`;
}

export function formatArea(acres, unitPref) {
  if (acres === undefined || acres === null) return '--';
  if (unitPref === 'metric') {
    const hectares = acres * 0.404686;
    return `${hectares.toFixed(2)} Ha`;
  }
  return `${Number(acres).toFixed(1)} Acres`;
}
