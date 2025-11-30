import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMarkers } from "../../services/markerService";
import "./Map.css";

export function Map() {
  const [map, setMap] = useState<L.Map | null>(null);
  const [markerPositions, setMarkerPositions] = useState<[number, number][]>([
    [32.0853, 34.7818], // Tel Aviv
    [32.794, 34.9896], // Haifa
  ]);

  useEffect(() => {
    const mapInstance = L.map("map").setView(markerPositions[0], 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(mapInstance);

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  useMarkers(map, markerPositions, setMarkerPositions);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}
