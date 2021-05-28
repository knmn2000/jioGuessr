import StreetView from './components/StreetView';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

function App() {
  return (
    <div className="App" >
      <StreetView/>
      {/* <Map google={window.google} streetView={new window.google.maps.StreetViewPanorama(
        document.getElementById("map") as HTMLElement,
        {
        position: { lat: 72.345573, lng: -71.098326 },
        pov: {
            heading: 34,
            pitch: 10,
        },
        }
      )}/> */}
    </div>
  );
}

// export default GoogleApiWrapper({apiKey: 'AIzaSyAWshrSlfc_0dvnBmVV-um5RoqkT5_MgoE'})(App);
export default App;
