import React from "react";
import { useEffect, useState } from "react";
import { usePhotos } from "../hooks/usePhotos.js";
import HomeImage from "../components/HomeImage.jsx";
import { useAppState } from "../hooks/useAppState.js";

export default function HomePage() {
  const { data: photos, isLoading, isError, error, isFetching } = usePhotos();
  const [randomItems, setRandomItems] = useState([]);

  // Function to pick 20 unique random items
  const getRandomItems = (arr) => {
    // 1. Create a shallow copy to avoid mutating the original data
    const shuffled = [...arr];

    // 2. Shuffle using a basic sort (or a Fisher-Yates shuffle for better randomness)
    shuffled.sort(() => 0.5 - Math.random());

    // 3. Take the first 20 items
    return shuffled.slice(0, 6);
  };

  const photosOfType = photos?.filter((x) => x.type === "view") || [];

  useEffect(() => {
    if (photos) {
      if (photosOfType) {
        const selected = getRandomItems(photosOfType);
        setRandomItems(selected);
      }
    }
  }, [photos]);

  return (
    <>
      {randomItems ? (
        <div className="grid h-screen w-screen grid-cols-3 grid-rows-2 overflow-hidden">
          {randomItems.map((item, index) => (
            /* The wrapper must explicitly dictate the cell boundaries */
            <div key={index} className="w-full h-full overflow-hidden relative">
              <HomeImage
                fileName={item.fileName}
                label={item.fileName}
                className="absolute inset-0 min-h-full min-w-full h-full w-full object-cover object-center"
              />
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
    </>
  );
}
