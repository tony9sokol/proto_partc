import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import  {popupService}  from "../../services/popupService";
import "./Map.css";

export function Map() {
  const center: [number, number] = [32.0853, 34.7818]; // Tel Aviv

  const [markerPositions, setMarkerPositions] = useState([
    [32.0853, 34.7818], // Tel Aviv
    [32.794, 34.9896], // Haifa
  ]);

  useEffect(() => {
    const map = L.map("map").setView(center, 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    const markers = markerPositions.map((pos, index) => {
      const marker = L.marker(pos, { draggable: true }).addTo(map);

      // Use the popup service
      marker.bindPopup(popupService.getPopupContent(index, pos[0], pos[1]));

      marker.on("dragend", () => {
        const newPos = marker.getLatLng();
        setMarkerPositions((prev) => {
          const updated = [...prev];
          updated[index] = [newPos.lat, newPos.lng];
          return updated;
        });

        marker.setPopupContent(
          popupService.getPopupContent(index, newPos.lat, newPos.lng)
        );
      });

      return marker;
    });

    // Cleanup function: remove map on unmount
    return () => {
      map.remove();
    };
  }, []); // empty deps -> runs once

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}
