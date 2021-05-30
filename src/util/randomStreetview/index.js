import StreetView from './StreetView';
import Google from './Google';
import EventEmitter from 'events';

class RandomStreetView extends EventEmitter {
  constructor() {
    super();
    this._streetView = new StreetView();
    this._streetView.on('tiles', (tiles) => this.emit('tiles', tiles));
    this.endZoom = 14;
    this.type = 'sv';
    this.distribution = 'weighted';
  }

  setHighCpuUsage() {
    this._streetView.slowCpu = false;
  }

  setLowCpuUsage() {
    this._streetView.slowCpu = true;
  }

  async setParameters({
    polygon = false,
    enableCaching = true,
    endZoom = 14,
    cacheKey = false,
    type = 'sv',
    distribution = 'weighted',
    google = true,
  }) {
    if (!['sv', 'photo', 'both'].includes(type))
      console.error("Type parameter should be either 'sv', 'photo', or 'both'");
    if (!['weighted', 'uniform'].includes(distribution))
      console.error(
        "Distribution parameter should be either 'uniform' or 'weighted'"
      );
    if (endZoom < 11)
      console.warn('endZoom parameter should not be less than 11');
    if (endZoom > 22) console.error("endZoom can't be higher than 22");
    if (!google) {
      await Google.wait();
      google = Google;
    }
    if (polygon instanceof Array) {
      let paths = polygon.map((path) =>
        path.map(([lat, lng]) => new google.maps.LatLng(lat, lng))
      );
      polygon = new google.maps.Polygon({
        paths: paths,
        strokeColor: '#00ff7a',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00ff7a',
        fillOpacity: 0.35,
        draggable: false,
        clickable: false,
      });
    }
    if (!cacheKey && enableCaching && polygon) {
      cacheKey = '';
      polygon
        .getPaths()
        .forEach((p) =>
          p.forEach((c) => (cacheKey += c.lat().toString() + c.lng()))
        );
    }

    this._streetView.setParameters(polygon, enableCaching, cacheKey, google);
    this.endZoom = endZoom;
    this.type = type;
    this.distribution = distribution;
  }

  async getRandomLocations(nLocations, onLocation = () => 0) {
    let get = async () => {
      let location = await this.getRandomLocation();
      onLocation(location);
      return location;
    };
    let tasks = [];
    for (let i = 0; i < nLocations; i++)
      tasks.push(new Promise((resolve) => get().then(resolve)));
    return await Promise.all(tasks);
  }

  async getRandomLocation() {
    if (!this._streetView.google) {
      await Google.wait();
      this._streetView.google = Google;
    }
    let location = await this._streetView.randomValidLocation({
      endZoom: this.endZoom,
      distribution: this.distribution,
      type: this.type,
    });
    if (location === false) return false;
    return [location.lat(), location.lng()];
  }
}

export default new RandomStreetView();
