import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Popup,
  useMapEvents,
  Rectangle,
  Polyline,
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

function MapBoundsTracker({ onBoundsChange }) {
  const map = useMapEvents({
    // Fires whenever the user stops dragging/panning the map
    moveend: () => {
      onBoundsChange(map.getBounds(), true);
    },
    // Fires whenever the user stops zooming the map
    zoomend: () => {
      onBoundsChange(map.getBounds(), false);
    },
  });

  return null; // This component does not render any visual UI
}

// Utility to calculate destination point given start point, angle, and distance
const getDestinationPoint = (lat, lng, bearingDegrees, distanceKm) => {
  // Return null if inputs are invalid
  if (lat == null || lng == null) return null;

  const R = 6371; // Earth's radius in km
  const bearing = (bearingDegrees * Math.PI) / 180; // Convert angle to radians

  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;

  // Haversine formula for destination
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearing),
  );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distanceKm / R) * Math.cos(lat1),
      Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2),
    );

  // Convert back to degrees
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
};

export default function LeafletMap({
  activeItem,
  isOverview,
  setMapBounds,
  mapBounds,
  setMapCenter,
  mapCenter,
  selectedMap,
}) {
  const initMinZoom = isOverview ? 8 : selectedMap?.minZoom || 12;
  const initMaxZoom = isOverview ? 12 : selectedMap?.maxZoom || 18;
  const startZoom = isOverview ? 10 : 16;

  const [mapInstance, setMapInstance] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(startZoom);
  const doCenterMap = useRef(true);
  const [viewDirection, setViewDirection] = useState(null);

  const angle = 45; // Angle in degrees clockwise from North (0 = North, 90 = East...)
  const lengthKm = () => {
    //console.log(">>>", isOverview, zoomLevel);
    if (zoomLevel === 18) return 0.05;
    if (zoomLevel === 17) return 0.07;
    if (zoomLevel === 16) return 0.1;
    if (zoomLevel === 15) return 0.3;
    if (zoomLevel === 14) return 0.5;
    if (zoomLevel === 13) return 0.75;
    if (zoomLevel === 12) return 1;
    if (zoomLevel === 11) return 3;
    if (zoomLevel === 10) return 6;
    if (zoomLevel === 9) return 9;
    if (zoomLevel === 8) return 12;
    return 0;
  };
  const showViewDirection = () => {
    if (!activeItem.gpsImgDirection || activeItem.type !== "view") return false;
    return true;
  };

  useEffect(() => {
    flyTo();
  }, [activeItem, selectedMap, mapInstance]);

  // React calls this function when the element mounts or unmounts
  const mapRefCallback = useCallback((map) => {
    if (map !== null) {
      setMapInstance(map);
    }
  }, []);

  const flyTo = () => {
    console.log("Selected map:", selectedMap?.name);
    //console.log("Is Overview:", isOverview);

    if (!activeItem) return;

    const coordinates = [activeItem.gpsLatitude, activeItem.gpsLongitude];
    setMarkerPosition(coordinates);
    if (activeItem.gpsImgDirection) {
      setViewDirection(activeItem.gpsImgDirection);
    } else {
      setViewDirection(null);
    }
    setIsLoading(false);

    if (!mapInstance) return;

    //console.log("FlyTo", coordinates);
    mapInstance.setView(coordinates, zoomLevel);
    //console.log("FlyTo - Zoom Level:", zoomLevel);
  };

  const handleBoundsChange = (bounds, moved) => {
    // console.log("Is Overview:", isOverview);
    // console.log("Selected item:", activeItem?.FileName);

    if (isOverview && !moved) {
      if (mapCenter && mapInstance && doCenterMap.current) {
        const currentCenter = mapInstance.getCenter();
        // 2. Only pan if the distance change is meaningful (e.g., > 0.0001 degrees)
        const distanceDiff = Math.sqrt(
          Math.pow(currentCenter.lat - mapCenter.lat, 2) +
            Math.pow(currentCenter.lng - mapCenter.lng, 2),
        );
        if (distanceDiff > 0.0001) {
          doCenterMap.current = false;
          mapInstance.panTo(mapCenter);
          console.log("MapCentre Updated", mapCenter);
          // 3. Wait for the pan animation to finish before unlocking
          mapInstance.once("moveend", () => {
            doCenterMap.current = true;
          });
        }
      }
    } else {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const c = bounds.getCenter();
      const sqare = [
        [sw.lat, sw.lng],
        [ne.lat, ne.lng],
      ];
      if (setMapBounds) setMapBounds(sqare);
      if (setMapCenter) setMapCenter(c);
      //console.log("SetMapCentre", c);
    }
  };

  function ZoomLimiter({ min, max }) {
    const map = mapInstance;

    if (!isOverview && selectedMap?.minZoom) {
      console.log("min:", min, "max:", max);
      console.log(
        "selected min:",
        selectedMap?.minZoom,
        "selected max:",
        selectedMap?.maxZoom,
      );
    }

    useEffect(() => {
      if (map) {
        map.setMinZoom(min);
        map.setMaxZoom(max);
      }
    }, [map, min, max]);

    return null;
  }

  function ZoomListener({ onZoomChange }) {
    const map = useMapEvents({
      zoomend: () => {
        // Get the precise zoom level when zooming stops
        const currentZoom = map.getZoom();
        console.log("CURRENT:", currentZoom);
        onZoomChange(currentZoom);
      },
    });

    return null; // This component doesn't render any visible UI
  }

  if (isLoading) {
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading map configurations...</p>
      </div>
    );
  }

  if (
    !markerPosition ||
    !Array.isArray(markerPosition) ||
    markerPosition.length < 2
  ) {
    return (
      <div style={{ color: "gray", padding: "10px" }}>
        Waiting for location data...
      </div>
    );
  }

  // Calculate the end point of our line
  const destinationPosition = getDestinationPoint(
    markerPosition[0],
    markerPosition[1],
    viewDirection,
    lengthKm(),
  );

  // Array of points defining the line
  const linePositions = [markerPosition, destinationPosition];

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

  // const handleMapReady = (mapInstance) => {
  //     if (mapInstance) {
  //         setMap(mapInstance);

  //         console.log("Map Ready");

  //         // Forces Leaflet to recalculate layout dimensions and clear margins
  //         setTimeout(() => {
  //             mapInstance.invalidateSize();
  //         }, 100);

  //     }
  // };

  return (
    <MapContainer
      ref={mapRefCallback}
      center={markerPosition}
      zoom={zoomLevel}
      className="rounded-xl overflow-hidden isolate border border-slate-800"
      dragging={!isOverview}
      // scrollWheelZoom={!isOverview}
      // doubleClickZoom={!isOverview}
      // boxZoom={canInteract}
      // keyboard={canInteract}
      // touchZoom={canInteract}
      // zoomControl={canInteract}
      style={{ height: "100%", width: "100%" }}
    >
      <MapBoundsTracker onBoundsChange={handleBoundsChange} />
      <ZoomLimiter min={initMinZoom} max={initMaxZoom} />
      <ZoomListener onZoomChange={setZoomLevel} />

      {/* OS API provides the actual map image tiles */}
      <TileLayer
        attribution={selectedMap?.attribution || ""}
        url={
          selectedMap?.url.replace(
            "<apiKey_OS>",
            import.meta.env.VITE_OS_KEY,
          ) || ""
        }
      />

      {/* Keeps limits synced */}
      {Array.isArray(mapBounds) && mapBounds.length > 0 && (
        <Rectangle
          bounds={mapBounds}
          pathOptions={{ color: "blue", fillOpacity: 0.1, weight: 1 }}
        />
      )}
      {/* A clickable map pin marker */}
      {markerPosition && (
        <CircleMarker
          center={markerPosition}
          radius={14}
          pathOptions={{
            color: "red",
            fillOpacity: 0,
            weight: 2,
          }}
        >
          {showViewDirection() ? (
            <Polyline
              positions={linePositions}
              pathOptions={{ color: "red", weight: 2 }}
            />
          ) : (
            <Marker position={markerPosition} icon={crossIcon} />
          )}

          <Popup minWidth={240} maxWidth={320} className="custom-image-popup">
            {/* 2. Style your popup container */}
            <div className="flex flex-col gap-2 p-1 font-sans">
              {activeItem ? (
                <MapImage
                  fileName={activeItem.fileName}
                  label={activeItem.fileName}
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
        </CircleMarker>
      )}
    </MapContainer>
  );
}
