import loadGoogleMapsApi from 'load-google-maps-api'
import EventEmitter from "events";

class Google extends EventEmitter {
    constructor() {
        super();
        this.maps = false;
        this.initCalled = false;
    }

    setThirdPartyGoogle(google) {
        this.initCalled = true;
        this.maps = google.maps;
    }

    init() {
        this.initCalled = true;
        loadGoogleMapsApi({
            libraries: ['geometry']
        }).then(googleMaps => {
            this.maps = googleMaps;
            this.emit('maps');
        });
    }

    async wait() {
        if (!this.initCalled)
            this.init();
        if (this.maps)
            return this.maps;
        return new Promise(resolve => {
            this.once('maps', () => resolve());
        });
    }
}

export default new Google()