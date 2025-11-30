import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

export function Map() {
  const center: [number, number] = [39.8283, -98.5795];

  // State to track marker positions
  const [markerPositions, setMarkerPositions] = useState([
    [39.8283, -98.5795],
    [40.0, -97.0],
  ]);

  useEffect(() => {
    // Initialize the map
    const map = L.map("map").setView(center, 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    // Create markers and make them draggable
    const markers = markerPositions.map((pos, index) => {
      const marker = L.marker(pos, { draggable: true }).addTo(map);
      marker.bindPopup(`Marker ${index + 1}`);

      // Update state when marker is dragged
      marker.on("dragend", () => {
        const newPos = marker.getLatLng();
        setMarkerPositions((prev) => {
          const updated = [...prev];
          updated[index] = [newPos.lat, newPos.lng];
          return updated;
        });
      });

      return marker;
    });

    return () => {
      map.remove();
    };
  }, []); // empty deps so map initializes only once

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}
