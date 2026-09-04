import React, { useState, useEffect } from "react";
import { useAppState } from "../hooks/useAppState.js";

export default function Image({ fileName, label }) {
  const { imgBaseUrl, loading } = useAppState();

  // 1. Calculate paths directly inside the component body
  const fileNameLower = fileName?.toLowerCase();
  const lowResPath = fileNameLower
    ? `${imgBaseUrl}/thumbs/${fileNameLower}`
    : "";
  const highResPath = fileNameLower ? `${imgBaseUrl}/${fileNameLower}` : "";

  // 2. Only track the active source and the load state in React state
  const [currentSrc, setCurrentSrc] = useState(lowResPath);
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);

  useEffect(() => {
    if (!highResPath || !lowResPath || loading) return;

    // Reset to low-res placeholder when fileName or URLs change
    setIsHighResLoaded(false);
    setCurrentSrc(lowResPath);

    // Preload the high-resolution image in the background
    const img = new window.Image();
    img.src = highResPath;

    img.onload = () => {
      setCurrentSrc(highResPath);
      setIsHighResLoaded(true);
    };

    // Clean up onload listener if component unmounts or paths change
    return () => {
      img.onload = null;
    };
  }, [lowResPath, highResPath, loading]); // Depend directly on the calculated paths

  // Handle global app loading or missing files early
  if (!fileName) return <div>No image provided</div>;
  if (loading) return <div>Loading assets...</div>;

  return (
    <img
      src={currentSrc}
      alt={label || fileName}
      className={`absolute inset-0 min-h-full min-w-full h-full w-full object-cover object-center transition-all duration-1000 ${
        isHighResLoaded ? "blur-0 scale-100" : "blur-sm scale-105"
      }`}
    />
  );
}
