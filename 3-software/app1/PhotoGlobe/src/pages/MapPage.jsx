import React from "react";
import { useState, useEffect } from "react";
import ImageList from "../components/ImageList.jsx";
import MapImage from "../components/MapImage.jsx";
import Map3D from "../components/Map3D.jsx";
import MapLeaf from "../components/MapLeaf.jsx";
import MapGoogle from "../components/MapGoogle.jsx";
import StreetView from "../components/StreetView.jsx";
import { useAppState } from "../hooks/useAppState.js";
import { Panel, Group, Separator } from "react-resizable-panels";

export default function MapPage() {
  const {
    activeItem,
    setActiveItem,
    overviewMap,
    photos,
    mainMap,
    setNextOverviewMap,
    setNextMainMap,
  } = useAppState();

  const [activeMap, setActiveMap] = useState("leaf");
  const [overviewMapScale, setOverviewMapScale] = useState(8);

  const [mapBounds, setMapBounds] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const { loading } = useAppState();

  const updateMapCenter = (latLng, source) => {
    setMapCenter({
      lat: latLng.lat,
      lng: latLng.lng,
      source: source, // 'external', 'overview', or 'detail'
    });
  };

  useEffect(() => {
    if (loading) return;

    // if no activeItem
    if (photos && photos.length > 0 && !activeItem) {
      setActiveItem(photos[0]); // Pick the first user automatically
    }
    // axriveItem changed
    if (
      activeItem &&
      typeof activeItem.gpsLatitude === "number" &&
      typeof activeItem.gpsLongitude === "number"
    ) {
      setMapCenter({
        lat: activeItem.gpsLatitude,
        lng: activeItem.gpsLongitude, // Map lon to standard Leaflet lng property
        source: "external", // Critical flag to command both maps to warp
      });
    }
  }, [photos, activeItem, loading]);

  const renderMap = (map) => {
    const mapNotValidForActiveItem = map.disableForType.includes(
      activeItem?.type || "",
    ); // Default to empty string if activeItem is null or undefined
    if (mapNotValidForActiveItem) {
      return <p>{map.name} not supported for this image type.</p>;
    }

    switch (map.viewer) {
      case "mapLeaf":
        return (
          <MapLeaf
            isOverview={false}
            activeItem={activeItem}
            selectedMap={map}
            setMapBounds={setMapBounds}
            setMapCenter={setMapCenter}
          />
        );
      case "mapCesium":
        return <Map3D activeItem={activeItem} />;
      case "streeetView":
        return <StreetView activeItem={activeItem} />;
      case "mapGoogle":
        return <MapGoogle activeItem={activeItem} />;
      default:
        return <p>Map viewer not supported.</p>;
    }
  };

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Panel: Fixed width, interior scrolling only */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
          <ImageList
            appData={photos}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
          />
        </aside>

        {/* Left Sidebar Panel */}

        {/* 'flex-1' allows it to stretch to the right browser wall dynamically */}
        <main className="flex-1 h-full w-full overflow-hidden bg-slate-950 relative grid grid-cols-[1fr_minmax(0px,400px)] p-2 gap-2">
          {/* Left Column (Takes up 100% height of the left side) */}
          <div className=" relative rounded-lg  flex flex-col items-center justify-center ">
            {renderMap(mainMap)}

            <button
              onClick={setNextMainMap}
              className="absolute rounded-sm  top-3 right-3 z-10 px-3 py-1 border-2 border-gray-500 bg-white text-gray-950 text-sm"
            >
              {mainMap?.name || "Next Map"}
            </button>
          </div>

          {/* Right Column (Split into 2 equal rows) */}
          <div className="grid grid-rows-[auto_1fr] gap-2 h-full min-h-0 ">
            {/* Right Column - Top Row */}
            <div className="border border-emerald-500/50 rounded-xl flex flex-col items-center justify-center min-h-50 max-h-100 h-full overflow-hidden">
              {activeItem ? (
                <MapImage
                  fileName={activeItem.fileName}
                  label={activeItem.fileName}
                />
              ) : (
                ""
              )}
            </div>

            {/* Right Column - Bottom Row */}
            <div className="relative  flex flex-col items-center justify-center">
              <MapLeaf
                activeItem={activeItem}
                isOverview={true}
                mapBounds={mapBounds}
                mapCenter={mapCenter}
                selectedMap={overviewMap}
              />

              {/* Bottom-left corner button */}
              <button
                onClick={setNextOverviewMap}
                className="absolute rounded-sm  top-3 right-3 z-10 px-3 py-1 border-2 border-gray-500 bg-white text-gray-950 text-sm"
              >
                {overviewMap?.name || "Next Map"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
