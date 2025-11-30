import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import * as utm from "utm";

export function Map() {
  const center: [number, number] = [32.0853, 34.7818];

  const [markerPositions, setMarkerPositions] = useState([
    [32.0853, 34.7818], // Tel Aviv
    [32.794, 34.9896], // Haifa
  ]);

  useEffect(() => {
    const map = L.map("map").setView(center, 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    const markers = markerPositions.map((pos, index) => {
      const marker = L.marker(pos, { draggable: true }).addTo(map);
      const utmCoords = utm.fromLatLon(pos[0], pos[1]);

      marker.bindPopup(
        `Marker ${index + 1}<br>Lat: ${pos[0].toFixed(
          4
        )}, Lng: ${pos[1].toFixed(4)} , UTM: Zone ${utmCoords.zoneNum}${
          utmCoords.zoneLetter
        }, Easting: ${utmCoords.easting.toFixed(
          2
        )}, Northing: ${utmCoords.northing.toFixed(2)}`
      );
      marker.on("dragend", () => {
        const newPos = marker.getLatLng();
        setMarkerPositions((prev) => {
          const updated = [...prev];
          updated[index] = [newPos.lat, newPos.lng];
          return updated;
        });
        const newUtm = utm.fromLatLon(newPos.lat, newPos.lng);

        marker.setPopupContent(
          `Marker ${index + 1}<br>
           Lat: ${newPos.lat.toFixed(4)}, Lng: ${newPos.lng.toFixed(4)}<br>
           UTM: Zone ${newUtm.zoneNum}${
            newUtm.zoneLetter
          }, Easting: ${newUtm.easting.toFixed(
            2
          )}, Northing: ${newUtm.northing.toFixed(2)}`
        );
      });

      return marker;
    });

    return () => {
      map.remove();
    };
  }, []);
  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}
