async function fetchRoute(start: [number, number], end: [number, number]) {
  const res = await fetch("http://127.0.0.1:8000/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, end }),
  });
  if (!res.ok) throw new Error("Failed to fetch route");
  return res.json();
}

export const routeService = {
  fetchRoute,
};
