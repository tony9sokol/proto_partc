class Coordinate:
    def __init__(self, lat: float, lng: float):
        self.lat = lat
        self.lng = lng

    def to_tuple(self):
        return (self.lat, self.lng)

    def to_lnglat(self):
        return (self.lng, self.lat)  # ORS format
