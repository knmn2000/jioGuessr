import StreetView from './components/StreetView';
import BoxComponent from './components/BoxComponent';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import { connect } from 'react-redux';
function App() {
  return (
    <div className='App'>
      <StreetView />
    </div>
  );
}

export default App;
