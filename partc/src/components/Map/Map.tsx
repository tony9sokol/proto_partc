import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { popupService } from "../../services/popupService";
import { routeService } from "../../services/routeService";
import "leaflet/dist/leaflet.css";
import "./Map.css";

export function Map() {
  const [markerPositions, setMarkerPositions] = useState<[number, number][]>([
    [32.0853, 34.7818], // Tel Aviv
    [32.794, 34.9896], // Haifa
  ]);

  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );

  const handleCalculateRoute = async () => {
    if (markerPositions.length < 2) return;

    try {
      const route = await routeService.fetchRoute(
        markerPositions[0],
        markerPositions[1]
      );
      setRouteCoordinates(route.coordinates);
    } catch (err) {
      console.error("Failed to fetch route:", err);
    }
  };

  return (
    <div className="map-wrapper">
      <MapContainer
        center={markerPositions[0]}
        zoom={8}
        className="map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />

        {markerPositions.map((pos, index) => (
          <Marker
            key={index}
            position={pos}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const newPos = e.target.getLatLng();
                setMarkerPositions((prev) => {
                  const updated = [...prev];
                  updated[index] = [newPos.lat, newPos.lng];
                  return updated;
                });
              },
            }}
          >
            <Popup>
              <div
                dangerouslySetInnerHTML={{
                  __html: popupService.getPopupContent(index, pos[0], pos[1]),
                }}
              />
            </Popup>
          </Marker>
        ))}

        {routeCoordinates.length > 0 && (
          <Polyline positions={routeCoordinates} color="blue" />
        )}
      </MapContainer>

      <button className="calculate-button" onClick={handleCalculateRoute}>
        Calculate Route
      </button>
    </div>
  );
}
