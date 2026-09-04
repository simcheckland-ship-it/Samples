import React, { useEffect, useRef } from "react";
import { useApiIsLoaded } from "@vis.gl/react-google-maps";

export default function CustomRefMap({ activeItem, zoom }) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null); // Keeps track of the map object across renders
  const apiIsLoaded = useApiIsLoaded();
  const markerRef = useRef(null);

  useEffect(() => {
    // 1. Safety checks
    if (!apiIsLoaded || !containerRef.current || !activeItem) return;

    const { gpsLatitude: lat, gpsLongitude: lng } = activeItem;
    const position = { lat, lng };

    // 2. If the map doesn't exist yet, create it
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(
        containerRef.current,
        {
          center: position,
          zoom: zoom || 13,
          disableDefaultUI: true, // Hides default controls for a cleaner look
          mapTypeId: window.google.maps.MapTypeId.HYBRID, // Or 'satellite', 'hybrid'
        },
      );
    } else {
      //If the map already exists, simply pan smoothly to the new coordinates
      mapInstanceRef.current.panTo(position);
    }

    // Handle Marker updates
    if (!markerRef.current) {
      // Create marker if it does not exist
      markerRef.current = new window.google.maps.Marker({
        position: position,
        map: mapInstanceRef.current,
      });
    } else {
      // Move existing marker to the new position
      markerRef.current.setPosition(position);
    }
  }, [activeItem, apiIsLoaded]);

  return <div ref={containerRef} className="w-full h-full rounded-lg" />;
}
