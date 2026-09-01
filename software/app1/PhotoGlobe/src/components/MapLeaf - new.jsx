import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Rectangle,
} from "react-leaflet";
import MapImage from "./MapImage.jsx";
import "leaflet/dist/leaflet.css";

// FIX: Leaflet marker icons can sometimes fail to load in React builds.
// This block ensures the default marker icon asset points to the correct CDN.
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Captures user drag/zoom movements and pipes them UP to the parent page.
function MapBoundsTracker({ isOverview, updateMapCenter, setMapBounds }) {
  const map = useMapEvents({
    moveend: () => {
      // CRITICAL: Only push data up if a human is physically dragging/zooming this specific instance
      if (
        map.dragHandler?.active() ||
        map.zoomControl?._animating ||
        map.touchExtend?.active()
      ) {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const currentCenter = bounds.getCenter();
        const mySource = isOverview ? "overview" : "detail";

        if (setMapBounds)
          setMapBounds([
            [sw.lat, sw.lng],
            [ne.lat, ne.lng],
          ]);
        if (updateMapCenter) updateMapCenter(currentCenter, mySource);

        console.log(
          `[${mySource.toUpperCase()} MAP] User dragged map. Dispatched center up.`,
        );
      }
    },
  });
  return null;
}

export default function LeafletMap({
  isOverview,
  mapCenter,
  updateMapCenter,
  setMapBounds,
  activeItem,
  isMapLoading,
  setIsMapLoading,
}) {
  const [mapInstance, setMapInstance] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const doCenterMap = useRef(true);

  const initMinZoom = isOverview ? 8 : 12;
  const initMaxZoom = isOverview ? 12 : 18;
  const startZoom = isOverview ? 7 : 18;

  // 1. FALLBACK GUARD: If parent state is missing or loading, use a safe default array
  const defaultCenter = [51.505, -0.09];
  const hasValidCoords =
    mapCenter &&
    typeof mapCenter.lat === "number" &&
    typeof mapCenter.lng === "number";

  // Safely extract coordinates for the dependency array using optional chaining (?.)
  const targetLat = mapCenter?.lat;
  const targetLng = mapCenter?.lng;

  // React calls this function when the element mounts or unmounts
  const mapRefCallback = useCallback((map) => {
    if (map !== null) {
      setMapInstance(map);
      map.invalidateSize(); // Fixes hidden canvas sizing bugs instantly on load
    }
  }, []);

  function ZoomLimiter({ min, max }) {
    const map = mapInstance;

    useEffect(() => {
      if (map) {
        map.setMinZoom(min);
        map.setMaxZoom(max);
      }
    }, [map, min, max]);

    return null;
  }

  const crossIcon = new L.DivIcon({
    html: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="3" stroke-linecap="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  `,
    className: "custom-cross-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  useEffect(() => {
    if (!mapInstance || !hasValidCoords) {
      console.log(
        "❌ Sync blocked by guard. Waiting for mapInstance or valid coordinates...",
      );
      return;
    }
    if (typeof mapInstance._loaded !== "undefined" && !mapInstance._loaded) {
      console.log(
        "Debug: mapInstance exists but is still booting up layout layers. Skipping frame...",
      );
      return;
    }
    console.log("🚀 SUCCESS! Map layout is fully ready. Querying positions...");
    const currentCenter = mapInstance.getCenter();
    const distanceDiff = Math.sqrt(
      Math.pow(currentCenter.lat - mapCenter.lat, 2) +
        Math.pow(currentCenter.lng - mapCenter.lng, 2),
    );

    // Only move if the target coordinate is different from the current map center
    if (distanceDiff > 0.0001) {
      const currentRole = isOverview ? "overview" : "detail";

      // ACTION A: Active item changed or external trigger -> Smoothly pan to the item
      if (mapCenter.source === "external") {
        doCenterMap.current = false; // Lock human tracking guards

        // Execute smooth pan movement to the item coordinates
        mapInstance.panTo([mapCenter.lat, mapCenter.lng], {
          animate: true,
          duration: 1.2,
        });
        console.log(`${currentRole} map smoothly panning to new active item.`);

        // Release user tracking lock once animation settles down
        setTimeout(() => {
          doCenterMap.current = true;
        }, 1300);
      }

      // ACTION B: Sister map was dragged -> Mirror the position smoothly
      else if (mapCenter.source !== currentRole && doCenterMap.current) {
        doCenterMap.current = false;
        mapInstance.panTo([mapCenter.lat, mapCenter.lng]);

        mapInstance.once("moveend", () => {
          doCenterMap.current = true;
        });
      }
    }
  }, [isOverview, mapCenter, mapInstance, hasValidCoords]);

  return (
    <MapContainer
      ref={mapRefCallback}
      center={markerPosition}
      zoom={startZoom}
      className="rounded-xl overflow-hidden isolate border border-slate-800"
      // dragging={!isOverview}
      // scrollWheelZoom={canInteract}
      // doubleClickZoom={canInteract}
      // boxZoom={canInteract}
      // keyboard={canInteract}
      // touchZoom={canInteract}
      // zoomControl={canInteract}

      style={{ height: "100%", width: "100%" }}
    >
      <MapBoundsTracker
        updateMapCenter={updateMapCenter}
        setMapBounds={setMapBounds}
        whenReady={(mapEvent) => {
          const nativeMapObject = mapEvent.target;
          setMapInstance(nativeMapObject);
          console.log(
            "✅ Map initialization complete. mapInstance populated safely.",
          );
        }}
      />

      <ZoomLimiter min={initMinZoom} max={initMaxZoom} />
      {/* OpenStreetMap provides the actual map image tiles */}
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <TileLayer
                url="https://arcgisonline.com{z}/{y}/{x}"
  attribution="&copy; Esri"
            />
             */}
      {/* Keeps limits synced */}
      {/* {Array.isArray(mapBounds) && mapBounds.length > 0 && (
        <Rectangle
          bounds={mapBounds}
          pathOptions={{ color: "red", fillColor: "orange", fillOpacity: 0.5 }}
        />
      )} */}
      {/* A clickable map pin marker */}
      {markerPosition && (
        <Marker
          position={markerPosition}
          icon={isOverview ? crossIcon : L.Marker.prototype.options.icon}
        >
          <Popup minWidth={240} maxWidth={320} className="custom-image-popup">
            {/* 2. Style your popup container */}
            <div className="flex flex-col gap-2 p-1 font-sans">
              {activeItem ? (
                <MapImage
                  fileName={activeItem.FileName}
                  label={activeItem.FileName}
                />
              ) : (
                ""
              )}

              {/* Optional overlay text */}
              <div className="mt-1">
                <h3 className="font-bold text-base text-slate-900 m-0">
                  Copper Kettle
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Use Value Score 2/5
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Chadburn Value Score 2/5
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
