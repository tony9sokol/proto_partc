// src/components/Map/Map.tsx
import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import { popupService } from "../../services/popupService";
import { routeService } from "../../services/routeService";
import { AddLayerForm } from "./AddLayerForm";
import { RouteControls } from "./RouteControl";
import type { MapLayer } from "../../modules/MapLayer";
import "leaflet/dist/leaflet.css";
import "./Map.css";

const MapClickHandler = ({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const Map = () => {
  const [markerPositions, setMarkerPositions] = useState<
    Array<[number, number]>
  >([
    [32.0853, 34.7818], // Tel Aviv
    [32.794, 34.9896], // Haifa
  ]);

  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<[number, number]>
  >([]);
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([]);
  const [showAddLayerForm, setShowAddLayerForm] = useState(false);
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);

  // --- Route ---
  const handleCalculateRoute = async () => {
    if (markerPositions.length < 2) return;

    try {
      let fullRoute: Array<[number, number]> = [];

      for (let i = 0; i < markerPositions.length - 1; i++) {
        const start = markerPositions[i];
        const end = markerPositions[i + 1];

        const segment = await routeService.fetchRoute(start, end);
        const coordsToAdd =
          i === 0 ? segment.coordinates : segment.coordinates.slice(1);

        fullRoute = fullRoute.concat(coordsToAdd);
      }

      setRouteCoordinates(fullRoute);
    } catch (err) {
      console.error("Failed to fetch route:", err);
    }
  };

  const handleSaveLayer = (layer: MapLayer) => {
    setMapLayers((prev) => [...prev, layer]);
    setShowAddLayerForm(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!isAddingWaypoint) return;

    setMarkerPositions((prev) => {
      const updated = [...prev];
      updated.splice(updated.length - 1, 0, [lat, lng]); // insert before target
      return updated;
    });

    setIsAddingWaypoint(false);
  };

  return (
    <div className="page-layout">
      <aside className="sidebar">
        <RouteControls
          onCalculateRoute={handleCalculateRoute}
          onAddLayer={() => setShowAddLayerForm(true)}
        />

        <div className="waypoints-sidebar">
          <h3>Waypoints</h3>
          <ul>
            {markerPositions.map((pos, index) => (
              <li key={index}>
                {index === 0
                  ? "Source"
                  : index === markerPositions.length - 1
                  ? "Target"
                  : `Waypoint ${index}`}
                : {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
              </li>
            ))}
          </ul>

          <button
            className="add-waypoint-button"
            onClick={() => setIsAddingWaypoint(true)}
          >
            Add Waypoint
          </button>
        </div>
      </aside>

      <div className="map-side">
        <MapContainer
          center={markerPositions[0]}
          zoom={8}
          className="map-container"
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>

            {mapLayers.map((layer, index) => (
              <LayersControl.BaseLayer key={index} name={layer.name}>
                <TileLayer url={layer.url} />
              </LayersControl.BaseLayer>
            ))}
          </LayersControl>

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
            <Polyline positions={routeCoordinates} />
          )}

          <MapClickHandler onClick={handleMapClick} />
        </MapContainer>
      </div>

      {showAddLayerForm && (
        <AddLayerForm
          onSaveLayer={handleSaveLayer}
          onCancel={() => setShowAddLayerForm(false)}
        />
      )}
    </div>
  );
};
