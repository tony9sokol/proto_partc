import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  LayersControl,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import { useAtom } from "jotai";
import {
  markerPositionsAtom,
  routeCoordinatesAtom,
  mapLayersAtom,
  drawnPolygonAtom,
} from "./mapAtom";
import { routeService } from "../../services/routeService";
import { AddLayerForm } from "./AddLayerForm";
import { RouteControls } from "./RouteControl";
import { DrawPolygon } from "./DrawPolygon";
import { PolygonFromInput } from "./PolygonFromInput";
import type { MapLayer } from "../../modules/MapLayer";
import { Coordinate } from "../../modules/coordinates";
import "leaflet/dist/leaflet.css";
import "./Map.css";

const MapClickHandler = ({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(event) {
      onClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
};

export const Map = () => {
  const [markerPositions, setMarkerPositions] = useAtom(markerPositionsAtom);
  const [routeCoordinates, setRouteCoordinates] = useAtom(routeCoordinatesAtom);
  const [mapLayers, setMapLayers] = useAtom(mapLayersAtom);
  const [drawnPolygon, setDrawnPolygon] = useAtom(drawnPolygonAtom);

  const [polygonCoordinatesList, setPolygonCoordinatesList] = React.useState<
    Coordinate[][]
  >([]);

  const [showAddLayerForm, setShowAddLayerForm] = React.useState(false);
  const [isAddingWaypoint, setIsAddingWaypoint] = React.useState(false);

  const handleCalculateRoute = async () => {
    if (markerPositions.length < 2) return;

    try {
      const allPolygons: Coordinate[][] = [
        ...polygonCoordinatesList,
        ...(drawnPolygon ? [drawnPolygon] : []),
      ];

      const avoidPolygons: [number, number][][] = allPolygons.map((poly) =>
        poly.map((coord) => coord.toTuple())
      );

      console.log("Sending polygons to backend:", avoidPolygons);

      let fullRoute: Coordinate[] = [];

      for (let i = 0; i < markerPositions.length - 1; i++) {
        const start = markerPositions[i].toTuple();
        const end = markerPositions[i + 1].toTuple();

        const segment = await routeService.fetchRoute(
          start,
          end,
          avoidPolygons
        );

        const coordinatesToAdd =
          i === 0 ? segment.coordinates : segment.coordinates.slice(1);

        fullRoute = fullRoute.concat(
          coordinatesToAdd.map(
            ([lat, lng]: [number, number]) => new Coordinate(lat, lng)
          )
        );
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

    const newCoord = new Coordinate(lat, lng);
    setMarkerPositions((prev) => {
      const updated = [...prev];
      updated.splice(updated.length - 1, 0, newCoord);
      return updated;
    });

    setIsAddingWaypoint(false);
  };

  return (
    <div className="page-layout">
      <aside className="sidebar">
        <div className="sidebar-section">
          <RouteControls
            onCalculateRoute={handleCalculateRoute}
            onAddLayer={() => setShowAddLayerForm(true)}
          />

          <PolygonFromInput
            onPolygonChange={(coords: Coordinate[]) =>
              setPolygonCoordinatesList((prev) => [...prev, coords])
            }
          />
        </div>

        <div className="waypoints-sidebar">
          <h3>Waypoints</h3>
          <ul>
            {markerPositions.map((position, index) => (
              <li key={index}>
                {index === 0
                  ? "Source"
                  : index === markerPositions.length - 1
                  ? "Target"
                  : `Waypoint ${index}`}
                : {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
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
          center={markerPositions[0].toTuple()}
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

          <DrawPolygon
            onPolygonChange={(coords: Coordinate[]) =>
              setPolygonCoordinatesList((prev) => [...prev, coords])
            }
          />

          {polygonCoordinatesList.map((poly, idx) => (
            <Polygon
              key={`poly-${idx}`}
              positions={poly.map((c) => c.toTuple())}
              pathOptions={{
                color:
                  idx === polygonCoordinatesList.length - 1 ? "blue" : "red",
              }}
            />
          ))}

          {markerPositions.map((position, index) => (
            <Marker
              key={index}
              position={position.toTuple()}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const newPosition = event.target.getLatLng();
                  setMarkerPositions((prev) => {
                    const updated = [...prev];
                    updated[index] = new Coordinate(
                      newPosition.lat,
                      newPosition.lng
                    );
                    return updated;
                  });
                },
              }}
            >
              <Popup>
                <div className="popup-content">
                  <strong>
                    {index === 0
                      ? "Source"
                      : index === markerPositions.length - 1
                      ? "Target"
                      : `Waypoint ${index}`}
                  </strong>
                  <div>Lat: {position.lat.toFixed(6)}</div>
                  <div>Lng: {position.lng.toFixed(6)}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates.map((c) => c.toTuple())} />
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
