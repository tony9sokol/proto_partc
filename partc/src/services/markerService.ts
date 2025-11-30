import { useEffect } from "react";
import L from "leaflet";
import { popupService } from "./popupService";

export function useMarkers(
  map: L.Map | null,
  positions: [number, number][],
  setPositions: React.Dispatch<React.SetStateAction<[number, number][]>>
) {
  useEffect(() => {
    if (!map) return;

    const markers = positions.map((pos, index) => {
      const marker = L.marker(pos, { draggable: true }).addTo(map);
      marker.bindPopup(popupService.getPopupContent(index, pos[0], pos[1]));

      marker.on("dragend", () => {
        const newPos = marker.getLatLng();
        setPositions((prev) => {
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

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [map, positions]);
}
