import React, { useEffect, useRef } from "react";
import { Viewer, Terrain, Ion, Cartesian3, Math as CesiumMath } from "cesium";

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_KEY;

export default function Map3D({ activeItem }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Cesium Viewer
    viewerRef.current = new Viewer(containerRef.current, {
      terrain: Terrain.fromWorldTerrain(),
      timeline: false, // hides the timeline bar
      animation: false, // hides the animation clock widget
      infoBox: false, // Disables the InfoBox widget
      selectionIndicator: false,
      geocoder: false, // Search bar
      homeButton: false, // Home view button
      fullscreenButton: false, // Fullscreen toggle
      geocoder: false, // Removes search bar (top right)
      navigationHelpButton: false, // Removes "?" help button (top right)
      sceneModePicker: false, // Removes 2D/3D toggle button (top right)//baseLayerPicker: false  // Removes
      baseLayerPicker: false, // Removes map background switcher (top right)
    });

    return () => {
      viewerRef.current.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current || !activeItem) return;

    console.log(">>> CESIUM:", activeItem);
    viewerRef.current.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        activeItem.gpsLongitude,
        activeItem.gpsLatitude,
        activeItem.gpsAltitude || 1000,
      ),
      orientation: {
        pitch: CesiumMath.toRadians(0), // Look downward at an angle
        heading: CesiumMath.toRadians(activeItem.gpsImgDirection), // Adjust pitch based on
        roll: 0, // No roll
      },
      duration: 2.0, // 3-second travel animation
    });
  }, [activeItem]);

  return <div ref={containerRef} className="w-full h-full rounded-lg" />;
}
