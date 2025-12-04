import { Coordinate } from "../modules/coordinates";

async function fetchRoute(
  start: [number, number],
  end: [number, number],
  avoidPolygons: [number, number][][]
) {
  const body: any = { start, end };

  if (avoidPolygons && avoidPolygons.length > 0) {
    body.avoid_polygons = avoidPolygons;
  }

  console.log("Request payload:", JSON.stringify(body, null, 2));

  const res = await fetch("http://127.0.0.1:8000/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    alert(error.detail);
    throw new Error(error.detail);
  }

  return res.json();
}

export const routeService = { fetchRoute };
