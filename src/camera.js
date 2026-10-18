/** Camera helpers for God's Eye View */
export function createCameraController(viewer) {
  return {
    flyTo(options) {
      return viewer.camera.flyTo(options);
    },
    setView(options) {
      viewer.camera.setView(options);
    },
  };
}
