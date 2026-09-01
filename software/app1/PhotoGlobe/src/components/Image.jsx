import React from "react";
import { useAppState } from "../hooks/useAppState.js";

export default function Image({ fileName, label }) {
  const { imgBaseUrl, loading } = useAppState();

  const imagePath = `/uploads/${fileName.toLowerCase()}`;

  if (loading) {
    return <div>Loading assets...</div>;
  }

  return (
    <img
      src={imagePath}
      alt="Grid constrained layout"
      className="max-w-full max-h-full w-auto h-auto object-fill "
    />
  );
}
