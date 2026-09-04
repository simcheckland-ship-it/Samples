import React, { useEffect, useRef } from "react";
import { useApiIsLoaded } from "@vis.gl/react-google-maps";

export default function StreetView({ activeItem }) {
  const containerRef = useRef(null);
  const apiIsLoaded = useApiIsLoaded(); // Safely tracks when the Google script is active

  useEffect(() => {
    // Check if the API is loaded, the DOM container exists, and activeItem is provided
    if (!apiIsLoaded || !containerRef.current || !activeItem) return;

    const { gpsLatitude: lat, gpsLongitude: lng } = activeItem;

    // Initialize the panorama canvas using the global constructor
    const panorama = new window.google.maps.StreetViewPanorama(
      containerRef.current,
      {
        position: { lat, lng },
        pov: {
          heading: 165,
          pitch: 0,
        },
        zoom: 1,
        visible: true,

        // OPTION A: REMOVE ALL DEFAULT UI BUTTONS AT ONCE
        disableDefaultUI: true,

        // OPTION B: FINE-GRAINED CONTROL (Use this if you want to keep some elements)
        /*
    addressControl: false,    // Hides the street address/name text box at the top
    linksControl: false,      // Hides the white travel arrows on the ground
    panControl: false,        // Hides the directional compass wheel
    zoomControl: false,       // Hides the +/- zoom buttons
    enableCloseButton: false, // Hides the 'X' back button in the top-left corner
    motionTracking: false,    // Disables mobile device gyroscope camera rotation
    */
      },
    );

    console.log(">>>", lat, lng);
  }, [activeItem, apiIsLoaded]);

  return <div ref={containerRef} className="w-full h-full rounded-lg" />;
}
