import * as utm from "utm";

function getPopupContent(index: number, lat: number, lng: number) {
  const utmCoords = utm.fromLatLon(lat, lng);

  return `
    Marker ${index + 1}<br>
    Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}<br>
    UTM: Zone ${utmCoords.zoneNum}${utmCoords.zoneLetter}, 
    Easting: ${utmCoords.easting.toFixed(2)}, 
    Northing: ${utmCoords.northing.toFixed(2)}
  `;
}

export const popupService = {
  getPopupContent,
};
