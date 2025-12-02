import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { markerService } from "../../services/markerService";
import { routeService } from "../../services/routeService";
import "./Map.css";

export function Map() {
  const [map, setMap] = useState<L.Map | null>(null);
  const [markerPositions, setMarkerPositions] = useState<[number, number][]>([
    [32.0853, 34.7818], // Tel Aviv
    [32.794, 34.9896], // Haifa
  ]);

  const [routeLayer, setRouteLayer] = useState<L.Polyline | null>(null);

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

  markerService.useMarkers(map, markerPositions, setMarkerPositions);

  const handleCalculateRoute = () => {
    if (!map || markerPositions.length < 2) return;

    // Remove old route if it exists
    if (routeLayer) {
      routeLayer.remove();
    }

    // Draw new route
    routeService
      .fetchRoute(markerPositions[0], markerPositions[1])
      .then((route: { coordinates: [number, number][] }) => {
        const polyline = L.polyline(route.coordinates, { color: "blue" }).addTo(
          map
        );
        setRouteLayer(polyline);

        map.fitBounds(polyline.getBounds());
      })
      .catch((err) => console.error("Failed to fetch route:", err));
  };

  return (
    <div className="map-wrapper">
      <div id="map" className="map-container" />
      <button className="button" onClick={handleCalculateRoute}>
        calculate route{" "}
      </button>
    </div>
  );
}
