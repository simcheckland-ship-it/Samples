import React, { createContext, useContext, useState, useEffect } from "react";
import { getPhotos } from "../api/photoService"; // Adjust this path to your service file
import maps from "../mapsData.json";

export const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [activeItem, setActiveItem] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [overviewMap, setOverviewMap] = useState(() =>
    maps.find((map) => map.id === 1),
  );
  const [mainMap, setMainMap] = useState(() =>
    maps.find((map) => map.id === 2),
  );
  const setNextMainMap = () => {
    setMainMap((current) => {
      if (!current) return maps[0]; // Fallback if current state is empty

      // Find where the current map is in the JSON array
      const currentIndex = maps.findIndex((m) => m.id === current.id);

      // Calculate the next index. The % operator handles wrapping back to 0 at the end.
      const nextIndex = (currentIndex + 1) % maps.length;

      return maps[nextIndex];
    });
  };
  const setNextOverviewMap = () => {
    setOverviewMap((current) => {
      if (!current) return maps[0]; // Fallback if current state is empty

      // Find where the current map is in the JSON array
      const currentIndex = maps.findIndex(
        (m) => m.id === current.id && m.useForOverview === true,
      );

      // Calculate the next index. The % operator handles wrapping back to 0 at the end.
      const nextIndex = (currentIndex + 1) % maps.length;

      return maps[nextIndex];
    });
  };

  useEffect(() => {
    fetchPhotos();
    if (photos && photos.length > 0) {
      setActiveItem(photos[0]); 
    }

  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);

    try {

      const response = await getPhotos();
      // Axios stores the payload inside the .data property
      setPhotos(response.data);
    } catch (err) {
      console.log("ERROR:", err);
      setError(err.message || "Failed to fetch photos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        activeItem,
        setActiveItem,
        photos,
        fetchPhotos,
        loading,
        mainMap,
        overviewMap,
        setNextMainMap,
        setNextOverviewMap,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}
