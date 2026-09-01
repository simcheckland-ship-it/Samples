import React from "react";
import { useAppState } from "../hooks/useAppState.js";

export default function IconImage({ fileName, label }) {
  const { imgBaseUrl, loading } = useAppState();

  const iconPath = `/uploads/thumbs/${fileName.toLowerCase()}`;

  if (loading) {
    return <div>Loading assets...</div>;
  }

  return (
    <img
      src={iconPath}
      alt={label}
      // CRUCIAL: w-full and h-full tell the image to stretch to the 10x10 amber box
      // object-cover crops it cleanly so it doesn't look stretched or distorted
      className="w-full h-full object-cover block"
    />
  );
}
