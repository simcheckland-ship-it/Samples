import React from "react";
import { useAppState } from "../hooks/useAppState.js";

export default function Image({ fileName, label }) {
  const { imgBaseUrl, loading } = useAppState();

  const imagePath = `/uploads/small/${fileName.toLowerCase()}`;

  if (loading) {
    return <div>Loading assets...</div>;
  }

  return (
    <img
      src={imagePath}
      alt="Grid constrained layout"
      className="w-full h-full  object-cover "
    />
  );
}
