import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.pm";
import "leaflet.pm/dist/leaflet.pm.css";
import { Coordinate } from "../../modules/coordinates";

interface MapWithPm extends ReturnType<typeof useMap> {
  pm: any;
}

interface DrawPolygonProps {
  onPolygonChange: (coords: Coordinate[]) => void;
}

export const DrawPolygon = ({ onPolygonChange }: DrawPolygonProps) => {
  const map = useMap() as unknown as MapWithPm; // cast through unknown

  useEffect(() => {
    if (!map || !map.pm) return;

    map.pm.addControls({
      position: "topleft",
      drawMarker: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
    });

    map.on("pm:create", (e: any) => {
      if (e.layer && e.layer._latlngs) {
        const coords: Coordinate[] = e.layer._latlngs[0].map(
          (v: any) => new Coordinate(v.lat, v.lng)
        );
        onPolygonChange(coords);
      }
    });

    map.on("pm:edit", (e: any) => {
      const layer = e.layer;
      if (layer && layer._latlngs) {
        const coords: Coordinate[] = layer._latlngs[0].map(
          (v: any) => new Coordinate(v.lat, v.lng)
        );
        onPolygonChange(coords);
      }
    });

    return () => {
      map.off("pm:create");
      map.off("pm:edit");
    };
  }, [map, onPolygonChange]);

  return null;
};
