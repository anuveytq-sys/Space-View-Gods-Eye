/** Location status and geolocation helpers */
export function getLocationStatus() {
  return { available: typeof navigator !== "undefined" && !!navigator.geolocation };
}
