import React, { useEffect, useState, useMemo } from "react";
import { useAppState } from "../hooks/useAppState.js";
import HomeImage from "../components/HomeImage.jsx";

// Helper functions placed outside the component to prevent re-creation
const getRandomItems = (arr) => {
  const shuffled = [...arr];
  shuffled.sort(() => 0.5 - Math.random());
  return shuffled;
};

const chunkIntoSix = (arr) => {
  const size = Math.floor(arr.length / 6);
  const remainder = arr.length % 6;
  let offset = 0;

  return Array.from({ length: 6 }, (_, index) => {
    const currentChunkSize = size + (index < remainder ? 1 : 0);
    const chunk = arr.slice(offset, offset + currentChunkSize);
    offset += currentChunkSize;
    return chunk;
  });
};

export default function HomePage() {
  const { photos, loading, error } = useAppState();
  const [chunks, setChunks] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [isPageActive, setIsPageActive] = useState(true);

  // 1. Memoize filtered photos so it doesn't recalculate on every render
  const photosOfType = useMemo(() => {
    console.log(">>", photos);
    return photos?.filter((x) => x.type === "view") || [];
  }, [photos]);

  // 2. Separate Effect: Only handle photo shuffling when the API data actually changes
  useEffect(() => {
    if (photosOfType.length > 0) {
      const shuffled = getRandomItems(photosOfType);
      const c = chunkIntoSix(shuffled);
      setChunks(c);
    }
  }, [photosOfType]);

  // 3. Separate Effect: Monitor page visibility focus/blur
  useEffect(() => {
    const handleBlur = () => setIsPageActive(false);
    const handleFocus = () => setIsPageActive(true);

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // 4. Separate Effect: Only manages the interval timer
  useEffect(() => {
    if (!isPageActive || chunks.length === 0) return;

    const intervalId = setInterval(() => {
      setActiveImage((prevIndex) => (prevIndex + 1) % 6);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isPageActive, chunks.length]);

  if (loading) return <div>Loading...</div>; // Optional: Handle loading state gracefully
  if (error) return <div>Error loading photos.</div>;

  return (
    <div className="grid h-screen w-screen grid-cols-3 grid-rows-2 gap-2 p-2 overflow-hidden">
      {console.log(
        "Rendering HomePage with chunks:",
        chunks,
        "and activeImage:",
        activeImage,
      )}
      {chunks.map((item, index) => (
        <div
          key={index}
          className="w-full h-full overflow-hidden relative  border rounded-xl border-emerald-500/50"
        >
          <HomeImage
            chunk={item}
            imageNumber={index}
            activeImage={activeImage}
          />
        </div>
      ))}
    </div>
  );
}
