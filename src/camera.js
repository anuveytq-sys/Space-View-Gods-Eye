import * as Cesium from 'cesium';

/**
 * Camera presets for notable locations.
 * Phase 1 default: fly to Austin, TX on load.
 */
export const CAMERA_PRESETS = {
  austin: {
    destination: Cesium.Cartesian3.fromDegrees(-97.7431, 30.2672, 25000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0,
    },
  },
};

export function flyToPreset(viewer, name = 'austin') {
  const preset = CAMERA_PRESETS[name];
  if (!preset || !viewer) return;
  viewer.camera.flyTo({
    destination: preset.destination,
    orientation: preset.orientation,
    duration: 2.5,
  });
}
