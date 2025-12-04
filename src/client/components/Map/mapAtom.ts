import { atom } from "jotai";
import type { MapLayer } from "../../modules/MapLayer";
import { Coordinate } from "../../modules/coordinates";

export const markerPositionsAtom = atom<Coordinate[]>([
  new Coordinate(32.0853, 34.7818), // Tel Aviv
  new Coordinate(32.794, 34.9896), // Haifa
]);

export const routeCoordinatesAtom = atom<Coordinate[]>([]);

export const mapLayersAtom = atom<MapLayer[]>([]);

export const polygonCoordsAtom = atom<Coordinate[]>([]);

export const drawnPolygonAtom = atom<Coordinate[] | null>(null);
