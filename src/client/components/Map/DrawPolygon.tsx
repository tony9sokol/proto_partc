import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { Coordinate } from "../../modules/coordinates";

interface DrawPolygonProps {
  onPolygonChange: (coords: Coordinate[]) => void;
}

export const DrawPolygon = ({ onPolygonChange }: DrawPolygonProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Enable Geoman controls
    map.pm.addControls({
      position: "topleft",
      drawMarker: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: true,
      editMode: true,
      dragMode: true,
      removalMode: true,
    });

    map.on("create", (e: any) => {
      const layer = e.layer;
      if (!layer || !layer.getLatLngs) return;

      layer.pm.enable({
        allowEditing: true,
        allowDragging: true,
        allowRotation: true,
      });

      const coords: Coordinate[] = layer
        .getLatLngs()[0]
        .map((v: any) => new Coordinate(v.lat, v.lng));
      onPolygonChange(coords);

      layer.on("edit dragend rotateend", () => {
        const updatedCoords: Coordinate[] = layer
          .getLatLngs()[0]
          .map((v: any) => new Coordinate(v.lat, v.lng));
        onPolygonChange(updatedCoords);
        console.log("Polygon updated:", updatedCoords);
      });
    });

    map.on("edit", (e: any) => {
      const layer = e.layer;
      if (layer) {
        layer.pm.enable({
          allowEditing: true,
          allowDragging: true,
          allowRotation: true,
        });
      }
    });

    return () => {
      map.off("create");
      map.off("edit");
    };
  }, [map, onPolygonChange]);

  return null;
};
