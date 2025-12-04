import { Map } from "leaflet";

declare module "leaflet" {
  interface Map {
    pm: any;
  }
}
    