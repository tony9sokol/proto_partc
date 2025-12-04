// src/utils/coordinates.ts

/** Represents a single coordinate (latitude, longitude) */
export class Coordinate {
  lat: number;
  lng: number;

  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }

  /** Return as a tuple [lat, lng] */
  toTuple(): [number, number] {
    return [this.lat, this.lng];
  }

  /** Optional: string representation */
  toString(): string {
    return `${this.lat}, ${this.lng}`;
  }
}

/** Type alias for an array of coordinates representing a polygon or path */
export type CoordinateArray = Coordinate[];
