from fastapi import FastAPI
from pydantic import BaseModel
from typing import Tuple, List
import openrouteservice
from .config.api import API_KEY
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Route API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RouteRequest(BaseModel):
    start: Tuple[float, float]  
    end: Tuple[float, float]  

class RouteResponse(BaseModel):
    distance: float            
    duration: float             
    coordinates: List[Tuple[float, float]] 

client = openrouteservice.Client(key=API_KEY)

@app.post("/route", response_model=RouteResponse)
def calculate_route(route: RouteRequest):
    coords = [(route.start[1], route.start[0]), (route.end[1], route.end[0])]

    result = client.directions(coords, profile='driving-car', format='geojson')

    properties = result['features'][0]['properties']['summary']
    distance = properties['distance']   
    duration = properties['duration']   
    geometry = result['features'][0]['geometry']['coordinates']
    coordinates = [(lat, lng) for lng, lat in geometry]

    return RouteResponse(distance=distance, duration=duration, coordinates=coordinates)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.server.main:app", host="127.0.0.1", port=8000, reload=True)
