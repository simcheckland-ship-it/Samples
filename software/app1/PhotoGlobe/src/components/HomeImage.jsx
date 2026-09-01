import React, { useState, useEffect, useRef } from "react";
import { useAppState } from "../hooks/useAppState.js";
import { useNavigate } from "react-router-dom";

export default function Image({ chunk, imageNumber, activeImage }) {
  const { imgBaseUrl, loading, setActiveItem } = useAppState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevImageSrc, setPrevImageSrc] = useState(null);
  const navigate = useNavigate();

  const wasActiveRef = useRef(false);
  const isActive = imageNumber === activeImage;

  // 1. Reset states when the chunk changes
  useEffect(() => {
    setIsLoaded(false);
    setCurrentIndex(0);
    setPrevImageSrc(null);
    wasActiveRef.current = false;
  }, [chunk]);

  // 2. Step forward exactly once when activated
  useEffect(() => {
    if (!chunk || !chunk.length) return;

    if (isActive && !wasActiveRef.current) {
      const currentFileName =
        chunk[currentIndex]?.fileName?.toLowerCase() || "";
      if (currentFileName) {
        setPrevImageSrc(`/uploads/small/${currentFileName}`);
      }

      setIsLoaded(false);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % chunk.length);
    }

    wasActiveRef.current = isActive;
  }, [isActive, chunk, currentIndex, imgBaseUrl]);

  if (!chunk || !chunk.length) return <div>No image provided</div>;
  if (loading) return <div>Loading assets...</div>;

  // Paths for current image
  const fileName = chunk[currentIndex]?.fileName?.toLowerCase() || "";
  const highResPath = `/uploads/small/${fileName}`;

  // Calculate and point to the NEXT image for preloading
  const nextIndex = (currentIndex + 1) % chunk.length;
  const nextFileName = chunk[nextIndex]?.fileName?.toLowerCase() || "";
  const nextImagePreloadPath = nextFileName
    ? `/uploads/small/${nextFileName}`
    : "";

  const handleClick = () => {
    setActiveItem(chunk[currentIndex]);
    navigate("/map");
  };

  return (
    <div className="absolute inset-0 min-h-full min-w-full h-full w-full overflow-hidden bg-black">
      {/* 1. Preload Layer: Hidden from view but forces browser caching */}
      {nextImagePreloadPath && (
        <link
          rel="preload"
          as="image"
          href={nextImagePreloadPath}
          key={`preload-${nextImagePreloadPath}`}
        />
      )}

      {/* 2. Background Layer: Holds the previous image during crossfade */}
      {prevImageSrc && (
        <img
          src={prevImageSrc}
          alt=""
          className="absolute inset-0 min-h-full min-w-full h-full w-full object-cover object-center"
        />
      )}

      {/* 3. Foreground Layer: Smooth transition */}
      <img
        key={highResPath}
        src={highResPath}
        alt=""
        onClick={handleClick}
        onLoad={() => setIsLoaded(true)}
        style={{ cursor: "pointer" }}
        className={`absolute inset-0 min-h-full min-w-full h-full w-full object-cover object-center transition-opacity duration-1000 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
