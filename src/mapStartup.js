/** Map / Cesium viewer startup helpers */
export async function initMap(container, options = {}) {
  // Cesium viewer initialization is handled by the main entry.
  return { ready: true, options };
}
