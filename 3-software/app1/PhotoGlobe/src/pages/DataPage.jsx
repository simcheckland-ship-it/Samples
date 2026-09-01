import React, { useState, useEffect } from "react";
import axios from "axios";
import MapImage from "../components/MapImage.jsx";
import ImageList from "../components/ImageList.jsx";
import StreetView from "../components/StreetView.jsx";
import { useAppState } from "../hooks/useAppState.js";

const renderStatus = (status) => {
  if (status === svStatus.LOADING) return <p>Loading Street View...</p>;
  if (status === svStatus.FAILURE) return <p>Error loading maps.</p>;
  return null;
};

export default function DataPage() {
  const [data, setData] = useState([]);
  const { activeItem, setActiveItem, photos, fetchPhotos } = useAppState();
  const { loading } = useAppState();
  const [ttLoading, setTtLoading] = useState(true);
  const [ttError, setTtError] = useState(null);

  const lat = activeItem ? activeItem.gpsLatitude : null;
  const lon = activeItem ? activeItem.gpsLongitude : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTtLoading(true);
        // Axios automatically parses JSON data into the 'data' property

        const url = `https://api.tomtom.com/search/2/nearbySearch/.json?lat=${lat}&lon=${lon}&limit=10&radius=500&categorySet=7315&view=Unified&relatedPois=off&key=${import.meta.env.VITE_TT_KEY}`;
        console.log("Fetching data from TomTom API:", url);
        const response = await axios.get(url);
        setData(response.data);
      } catch (err) {
        setTtError(err.message || "Something went wrong");
      } finally {
        setTtLoading(false);
      }
    };

    if (!activeItem) return; // Skip fetching if an active item is not set

    fetchData();
  }, [photos, activeItem, loading]);

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
          <ImageList
            appData={photos}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            loading={loading}
          />
        </aside>

        <main className="flex-1 h-full w-full overflow-hidden bg-slate-950 relative grid grid-cols-[1fr_minmax(0px,400px)] p-2 gap-2">
          {/* Left Column */}
          <div className=" relative rounded-lg  flex flex-col items-center justify-center ">
            {activeItem ? (
              <StreetView activeItem={activeItem} />
            ) : (
              "No active item selected"
            )}
          </div>
          {/* Right Column */}
          <div className="grid grid-rows-[auto_1fr] gap-2 h-full min-h-0 ">
            {/* Right Column - Top Row */}
            <div className="border border-emerald-500/50 rounded-xl flex flex-col items-center justify-center min-h-50 max-h-100 h-full overflow-hidden">
              {activeItem ? (
                <MapImage
                  fileName={activeItem.fileName}
                  label={activeItem.fileName}
                />
              ) : (
                "No active item selected"
              )}
            </div>
            {/* Right Column - Bottom Row */}
            <div className="relative  flex flex-col items-center justify-center">
              {ttLoading && <div>Loading data...</div>}
              {ttError && <div>Error: {ttError}</div>}
              {!ttLoading &&
                !ttError &&
                data.results &&
                data.results.length === 0 && (
                  <div>No results found for the selected item.</div>
                )}
              <div>
                <h1>Fetched Items</h1>
                <ul>
                  {data.results?.map((item) => (
                    <li key={item.id}>
                      {item.poi.name} - {item.dist}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
