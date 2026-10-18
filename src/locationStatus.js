/** Location status UI helpers */
export function formatCoords(lat, lon, precision = 5) {
  if (lat == null || lon == null) return '—';
  return `${Number(lat).toFixed(precision)}, ${Number(lon).toFixed(precision)}`;
}

export function isGeolocationAvailable() {
  return typeof navigator !== 'undefined' && !!navigator.geolocation;
}
