import L from "leaflet";

async function fetchRoute(start: [number, number], end: [number, number]) {
  const res = await fetch("http://127.0.0.1:8000/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, end }),
  });
  if (!res.ok) throw new Error("Failed to fetch route");
  return res.json();
}

async function calculateAndDrawRoute(
  map: L.Map,
  markerPositions: [number, number][],
  routeLayer: L.Polyline | null,
  setRouteLayer: (layer: L.Polyline | null) => void
) {
  if (markerPositions.length < 2) return;

  try {
    const route = await fetchRoute(markerPositions[0], markerPositions[1]);

    if (routeLayer) routeLayer.remove();

    const polyline = L.polyline(route.coordinates, { color: "blue" }).addTo(
      map
    );
    setRouteLayer(polyline);

    map.fitBounds(polyline.getBounds());
  } catch (err) {
    console.error("Failed to fetch route:", err);
  }
}
export const routeService = {
  fetchRoute,
  calculateAndDrawRoute,
};
