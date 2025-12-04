from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Tuple, List, Optional
import openrouteservice
from .config.api import API_KEY
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from shapely.geometry import Polygon
from shapely.ops import unary_union
from shapely import area as shapely_area
import json

app = FastAPI(title="Route API")

origins = ["http://localhost:5175", "http://127.0.0.1:5175"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteRequest(BaseModel):
    start: Tuple[float, float]
    end: Tuple[float, float]
    avoid_polygons: Optional[List[List[Tuple[float, float]]]] = None

class RouteResponse(BaseModel):
    distance: float
    duration: float
    coordinates: List[Tuple[float, float]]

client = openrouteservice.Client(key=API_KEY)

MAX_ORS_AREA = 2e8 


@app.post("/route", response_model=RouteResponse)
def calculate_route(route: RouteRequest):
    print("Received route request:", route.dict(), flush=True)

    coords = [
        (route.start[1], route.start[0]),
        (route.end[1], route.end[0])
    ]
    multipolygon = []  

    if route.avoid_polygons:
        for poly in route.avoid_polygons:
            if not poly or len(poly) < 3:
                continue

            shapely_poly = Polygon([(lng, lat) for lat, lng in poly])

            approx_area = shapely_poly.area * (111_000 ** 2)

            print(f"Polygon area: {approx_area} m²", flush=True)

            if approx_area > MAX_ORS_AREA:
                raise HTTPException(
                    status_code=400,
                    detail=f"One avoid polygon is too large ({int(approx_area)} m²). "
                        f"Max allowed is 200,000,000 m²."
                )

            ring = [[x, y] for x, y in shapely_poly.exterior.coords]
            multipolygon.append([ring])  

    avoid = {
        "type": "MultiPolygon",
        "coordinates": multipolygon
    } if multipolygon else None


    if avoid:
        print("Final avoid polygon:", json.dumps(avoid, indent=2), flush=True)

    result = client.directions(
        coordinates=coords,
        profile="driving-car",
        format="geojson",
        options={"avoid_polygons": avoid} if avoid else None,
    )

    props = result["features"][0]["properties"]["summary"]
    geometry = result["features"][0]["geometry"]["coordinates"]

    coordinates = [(lat, lng) for lng, lat in geometry]

    return RouteResponse(
        distance=props["distance"],
        duration=props["duration"],
        coordinates=coordinates
    )


if __name__ == "__main__":
    uvicorn.run("src.server.main:app", host="127.0.0.1", port=8000, reload=True)
