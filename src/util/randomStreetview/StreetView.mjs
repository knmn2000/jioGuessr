import EventEmitter from 'events';
import Google from './Google';

export default class StreetView extends EventEmitter {
  constructor() {
    super();
    this.slowCpu = false;
    this.coverageCache = this.importCoverageCache();

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    //google maps coverage images are 256x256
    this.canvas.width = 256;
    this.canvas.height = 256;
    this.enableCaching = true;
    this.cacheKey = 'rsv__world';
    this.polygon = false;
    this.google = false;
    this.area = 1;
    this.smallestContainingTile = { x: 0, y: 0, zoom: 0 };

    this.typeColors = [
      { color: [84, 160, 185], id: 'sv' },
      { color: [165, 224, 250, 102], id: 'photo' },
    ];
  }

  setParameters(polygon, enableCaching, cacheKey, google) {
    this.google = google;
    this.cacheKey = cacheKey;
    this.enableCaching = enableCaching;
    this.smallestContainingTile = this.polygonToSmallestContainingTile(polygon);
    this.polygon = polygon;
    let area = 0;
    polygon.getPaths().forEach((path) => {
      area += this.google.maps.geometry.spherical.computeArea(path);
    });
    this.area = area;
  }

  async randomValidLocation({
    endZoom = 14,
    type = 'sv',
    distribution = 'weighted',
  }) {
    this.distribution = distribution;

    let tile = await this.randomValidTile(
      endZoom,
      type,
      this.smallestContainingTile
    );
    if (tile === false) return false;
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    if (tile.img === false)
      tile.img = await this.getTileImage(tile.x, tile.y, tile.zoom);
    let img = tile.img;
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);

    let data = context.getImageData(0, 0, img.width, img.height).data;

    let pixelCounts = { count: 0, indices: [] };
    for (let i = 0; i < data.length; i += 4) {
      let color = data.slice(i, i + 4);
      let colorType = this.getColorType(color);
      if (colorType === type || (colorType !== 'empty' && type === 'both')) {
        pixelCounts.count++;
        pixelCounts.indices.push(i);
      }
    }

    if (pixelCounts.count === 0) {
      console.error('No blue pixel found');
      return this.randomValidLocation({ endZoom, type, distribution });
    }
    let randomSvPixel = Math.floor(Math.random() * pixelCounts.count);
    let randomSvIndex = pixelCounts.indices[randomSvPixel];
    let x = (randomSvIndex / 4) % img.width;
    let y = Math.floor(randomSvIndex / 4 / img.width);
    this.saveCoverageCache();
    return this.tilePixelToCoordinate(tile.x, tile.y, tile.zoom, x, y);
  }

  containsLocation(location, polygon) {
    if (polygon === false) return true;
    return this.google.maps.geometry.poly.containsLocation(location, polygon);
  }

  async waitSleep(time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  async randomValidTile(
    endZoom,
    type,
    chosenTile = { x: 0, y: 0, zoom: 0 },
    startZoom = chosenTile.zoom
  ) {
    if (chosenTile.zoom >= endZoom) {
      return chosenTile;
    }
    const photoSphereZoomLevel = 12;

    let subTiles = await this.getSubTiles(
      chosenTile.x,
      chosenTile.y,
      chosenTile.zoom
    );

    let validTiles = subTiles
      .filter(
        (tile) =>
          (type === 'sv' && tile.types.sv) ||
          (type === 'photo' && tile.types.photo) ||
          (type === 'both' && (tile.types.photo || tile.types.sv)) ||
          //When under photosphere zoom level, also consider sv tiles valid tiles, because photospheres aren't visible yet
          (tile.zoom <= photoSphereZoomLevel && tile.types.sv)
      )
      .filter((tile) => this.tileIntersectsMap(tile.x, tile.y, tile.zoom));

    if (
      chosenTile.zoom === startZoom &&
      validTiles.length === 0 &&
      chosenTile.zoom <= 7
    ) {
      //OH OH SPAGHETTIOS
      //Can't find anything in the start tile, trying to go ahead by ignoring street view coverage
      validTiles = subTiles.filter((tile) =>
        this.tileIntersectsMap(tile.x, tile.y, tile.zoom)
      );
      startZoom = validTiles[0].zoom;
    }
    let tilesInfo = subTiles.map((tile) => ({
      ...tile,
      valid: validTiles.includes(tile),
    }));
    this.emit('tiles', tilesInfo);
    // console.log(tilesInfo)

    let shuffleFun =
      this.distribution === 'uniform'
        ? (array) => this.shuffle(array)
        : (array) =>
            this.shuffleWeighted(
              array,
              (item) =>
                item.coverage[
                  chosenTile.zoom + 1 <= photoSphereZoomLevel ? 'both' : type
                ]
            );
    let shuffledTiles = shuffleFun(validTiles);

    for (let tile of shuffledTiles) {
      let subTile = await this.randomValidTile(endZoom, type, tile, startZoom);

      if (subTile !== false && (subTile.types.sv || subTile.types.photo))
        return subTile;
    }
    // console.log("Back tracking");
    return false;
  }

  tileEquals(tileA, tileB) {
    return (
      tileA.x === tileB.x && tileA.y === tileB.y && tileA.zoom === tileB.zoom
    );
  }

  getTileCornerCoordinates(tileX, tileY, zoom) {
    return [
      this.tilePixelToCoordinate(tileX, tileY, zoom, 0, 0), // top left
      this.tilePixelToCoordinate(tileX, tileY, zoom, 256, 0), // top right
      this.tilePixelToCoordinate(tileX, tileY, zoom, 256, 256), // bottom right
      this.tilePixelToCoordinate(tileX, tileY, zoom, 0, 256), // bottom left
    ];
  }

  tileIntersectsMap(tileX, tileY, zoom) {
    if (this.polygon === false) return true;
    let tileCoordinates = this.getTileCornerCoordinates(tileX, tileY, zoom);
    //Check if tile corners are in map bounds
    for (let coordinate of tileCoordinates)
      if (this.containsLocation(coordinate, this.polygon)) {
        return true;
      }
    // return false;

    //Maybe one of the 4 tile corners don't intersect, doesn't mean the two polygons don't intersect
    let mapsBounds = new this.google.maps.LatLngBounds();
    for (let coordinate of tileCoordinates) mapsBounds.extend(coordinate);

    // Check if map coordinates are in within tile bounds
    let mapContains = false;
    this.polygon.getPaths().forEach((path) => {
      path.forEach((point) => {
        if (mapsBounds.contains(point)) mapContains = true;
      });
    });

    // console.log("Using mapContains");
    return mapContains;
  }

  async getSubTiles(x, y, zoom) {
    //Zooming multiplies coordinates by 2 (4 sub tiles in a tile)
    let startX = x * 2;
    let startY = y * 2;
    let endX = startX + 2;
    let endY = startY + 2;

    return this.getTileGrid(startX, endX, startY, endY, zoom + 1);
  }

  async getTileGrid(startX, endX, startY, endY, zoom) {
    let tasks = [];
    for (let y = startY; y < endY; y++)
      for (let x = startX; x < endX; x++) tasks.push(this.getTile(x, y, zoom));
    return await Promise.all(tasks);
  }

  tilePixelToCoordinate(tileX, tileY, zoom, pixelX, pixelY) {
    tileX += pixelX / 256;
    tileY += pixelY / 256;

    tileX *= 2 ** (8 - zoom);
    tileY *= 2 ** (8 - zoom);

    let lng = (tileX / 256) * 360 - 180;
    let n = Math.PI - (2 * Math.PI * tileY) / 256;
    let lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    return new this.google.maps.LatLng(lat, lng);
  }

  toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  polygonToBounds(polygon) {
    const bounds = new this.google.maps.LatLngBounds();
    polygon.getPaths().forEach((path) => {
      path.forEach((pos) => {
        bounds.extend(pos);
      });
    });
    return bounds;
  }

  polygonToSmallestContainingTile(polygon) {
    if (polygon === false) return { x: 0, y: 0, zoom: 0 };
    let bounds = this.polygonToBounds(polygon);
    let ne = bounds.getNorthEast();
    let sw = bounds.getSouthWest();
    let startZoom = 0;
    let endZoom = 18;
    let resultTile = { x: 0, y: 0, zoom: startZoom };
    for (let zoom = startZoom; zoom <= endZoom; zoom++) {
      let neTile = this.coordinateToTile(ne, zoom);
      let swTile = this.coordinateToTile(sw, zoom);
      let equals = this.tileEquals(neTile, swTile);
      if (!equals) break;
      resultTile = neTile;
    }
    return resultTile;
  }

  coordinateToTile(coordinate, zoom) {
    let latRad = this.toRadians(coordinate.lat());
    let n = 2.0 ** zoom;
    let xTile = Math.floor(((coordinate.lng() + 180.0) / 360.0) * n);
    let yTile = Math.floor(
      ((1.0 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) /
        2.0) *
        n
    );
    return { x: xTile, y: yTile, zoom };
  }

  getUrl(x, y, zoom) {
    return `https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i${zoom}!2i${x}!3i${y}!4i256!2m8!1e2!2ssvv!4m2!1scb_client!2sapiv3!4m2!1scc!2s*211m3*211e3*212b1*213e2*211m3*211e2*212b1*213e2!3m3!3sUS!12m1!1e68!4e0`;
    // return `https://mts1.this.googleapis.com/vt?hl=en-US&lyrs=svv|cb_client:apiv3&style=40,18&x=${x}&y=${y}&z=${zoom}`;
  }

  async getTileImage(x, y, zoom) {
    return new Promise(async (resolve) => {
      let response = await fetch(this.getUrl(x, y, zoom));
      let blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => resolve(img);
      };
    });
  }

  async getTile(x, y, zoom) {
    return new Promise(async (resolve) => {
      if (this.coverageCacheContains(x, y, zoom)) {
        let { coverage, types } = this.getCoverageCache(x, y, zoom);
        // console.log("Using cache!", x, y, zoom, coverage);
        resolve({
          coverage,
          types,
          img: false,
          x,
          y,
          zoom,
        });
        return;
      }
      let img = await this.getTileImage(x, y, zoom);
      let c = await this.getTileCoverage(x, y, zoom, img);
      this.setCoverageCache(x, y, zoom, c);
      let { coverage, types } = this.getCoverageCache(x, y, zoom);
      resolve({
        coverage,
        types,
        img,
        x,
        y,
        zoom,
      });
    });
  }

  getColorType(rgba) {
    if (rgba[2] === 0) return 'empty';

    const allowedColorDiff = 4;
    typeLoop: for (let { id, color } of this.typeColors) {
      for (let i = 0; i < color.length; i++) {
        const componentDifference = Math.abs(color[i] - rgba[i]);
        if (componentDifference > allowedColorDiff) continue typeLoop;
      }
      return id;
    }
    return 'empty';
  }

  isTileFullyContainedInMap(tileX, tileY, zoom) {
    let coordinates = this.getTileCornerCoordinates(tileX, tileY, zoom);
    for (let coordinate of coordinates) {
      if (!this.containsLocation(coordinate, this.polygon)) return false;
    }
    return true;
  }

  async getTileCoverage(tileX, tileY, zoom, img) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(img, 0, 0);
    let data = this.context.getImageData(0, 0, img.width, img.height).data;
    //Coverage [sv, photo]
    let coverage = [0, 0];
    let isFullyContained =
      this.polygon !== false &&
      this.isTileFullyContainedInMap(tileX, tileY, zoom);

    //asia area:       87,868,883,173,444
    //spain area:         680,475,474,716
    //EU area:         12,047,591,207,736
    //russia area:     16,934,010,870,404
    let massiveArea = 5000000000000;
    let bigArea = 1000000000000;
    let chunkSize = 16;
    if (zoom <= 2 && this.area < massiveArea)
      //0, 1, 2
      chunkSize = 4;
    else if (zoom <= 4 && this.area < massiveArea)
      //3
      chunkSize = 4;
    else if (zoom <= 7 && this.area < bigArea) chunkSize = 8;
    let pixelChunkSize;
    if (zoom <= 6) pixelChunkSize = 16;
    else if (zoom <= 7) pixelChunkSize = 16;
    else if (zoom <= 8) pixelChunkSize = 8;
    else if (zoom <= 9) pixelChunkSize = 4;
    else pixelChunkSize = 2;
    pixelChunkSize = Math.min(pixelChunkSize, chunkSize);
    // console.log("Using", {chunkSize, pixelChunkSize, zoom, img})

    for (let y = 0; y < img.height; y += chunkSize) {
      for (let x = 0; x < img.width; x += chunkSize) {
        if (this.slowCpu) await this.waitSleep(10);
        if (!isFullyContained) {
          let coordinate = this.tilePixelToCoordinate(
            tileX,
            tileY,
            zoom,
            x + chunkSize / 2,
            y + chunkSize / 2
          );
          if (!this.containsLocation(coordinate, this.polygon)) {
            continue;
          }
          // console.log("Chunk is in polygon!");
        }
        for (
          let pY = y + pixelChunkSize / 2;
          pY < y + chunkSize;
          pY += pixelChunkSize
        ) {
          for (
            let pX = x + pixelChunkSize / 2;
            pX < x + chunkSize;
            pX += pixelChunkSize
          ) {
            // console.log(pX, pY);
            let i = (pY * img.width + pX) * 4;
            let color = data.slice(i, i + 4);
            let colorType = this.getColorType(color);
            if (colorType === 'sv') coverage[0]++;
            if (colorType === 'photo') coverage[1]++;
          }
        }
      }
    }
    return coverage;
  }

  coverageCacheContains(x, y, zoom) {
    let id = this.cacheKey;
    return (
      this.coverageCache[id] &&
      this.coverageCache[id][zoom] &&
      this.coverageCache[id][zoom][x] &&
      this.coverageCache[id][zoom][x][y]
    );
  }

  getCoverageCache(x, y, zoom) {
    let id = this.cacheKey;
    let [svCoverage, photoCoverage] = this.coverageCache[id][zoom][x][y];
    return {
      types: {
        sv: svCoverage > 0,
        photo: photoCoverage > 0,
      },
      coverage: {
        sv: svCoverage,
        photo: photoCoverage,
        both: svCoverage + photoCoverage,
      },
    };
  }

  setCoverageCache(x, y, zoom, value) {
    let id = this.cacheKey;
    if (!this.coverageCache[id]) this.coverageCache[id] = {};
    if (!this.coverageCache[id][zoom]) this.coverageCache[id][zoom] = {};
    if (!this.coverageCache[id][zoom][x]) this.coverageCache[id][zoom][x] = {};
    this.coverageCache[id][zoom][x][y] = value;
  }

  importCoverageCache() {
    return localStorage.getItem('tileCoverage') === null
      ? {}
      : JSON.parse(localStorage.tileCoverage);
  }

  saveCoverageCache() {
    if (this.enableCaching)
      localStorage.tileCoverage = JSON.stringify(this.coverageCache);
  }

  shuffleWeighted(array, weightField = (item) => item.weight) {
    if (array.length === 0) return array;
    let result = [];
    let len = array.length;
    let totalWeights = array.map(weightField).reduce((a, b) => a + b);
    for (let i = 0; i < len; i++) {
      let randomWeightValue = Math.random() * totalWeights;
      let weightedRandomIndex = -1;
      for (let j = 0; j < array.length; j++) {
        let item = array[j];
        if (weightField(item) > randomWeightValue) {
          weightedRandomIndex = j;
          break;
        }
        randomWeightValue -= weightField(item);
      }
      let item = array.splice(weightedRandomIndex, 1)[0];
      totalWeights -= weightField(item);
      result.push(item);
    }
    return result;
  }

  shuffle(input) {
    for (let i = input.length - 1; i >= 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const itemAtIndex = input[randomIndex];

      input[randomIndex] = input[i];
      input[i] = itemAtIndex;
    }
    return input;
  }
}
