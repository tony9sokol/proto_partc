import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  LayersControl,
} from "react-leaflet";
import { popupService } from "../../services/popupService";
import { routeService } from "../../services/routeService";
import { AddLayerForm } from "./AddLayerForm"; // <--- import new form
import type { MapLayer } from "../../modules/MapLayer";
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
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([]);
  const [showAddLayerForm, setShowAddLayerForm] = useState(false);

  const handleCalculateRoute = async () => {
    if (markerPositions.length < 2) return;
    try {
      console.log("hey0000");
      const route = await routeService.fetchRoute(
        markerPositions[0],
        markerPositions[1]
      );
      setRouteCoordinates(route.coordinates);
    } catch (err) {
      console.error("Failed to fetch route:", err);
    }
  };

  const handleSaveLayer = (layer: MapLayer) => {
    setMapLayers((prev) => [...prev, layer]);
    setShowAddLayerForm(false);
  };

  return (
    <div className="map-wrapper">
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
          <Polyline positions={routeCoordinates} color="blue" />
        )}
      </MapContainer>

      <div className="map-buttons">
        <button
          className="add-map-button"
          onClick={() => setShowAddLayerForm(true)}
        >
          Add Map Layer
        </button>
        <button className="calculate-button" onClick={handleCalculateRoute}>
          Calculate Route
        </button>
      </div>

      {showAddLayerForm && (
        <AddLayerForm
          onSaveLayer={handleSaveLayer}
          onCancel={() => setShowAddLayerForm(false)}
        />
      )}
    </div>
  );
}
