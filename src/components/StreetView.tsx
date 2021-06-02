/* eslint-disable no-undef */
import React, { useCallback, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import Streetview from 'react-google-streetview';
import { GoogleApiWrapper } from 'google-maps-react';
import { Grid } from '@material-ui/core';
import { updateUserPosition } from '../redux/coordinates/coordinates.actions';
import BoxComponent from '../components/BoxComponent';
// TODO : add types
// interface StreetViewOptions {
//   position: { lat: number; lng: number };
//   pov: { heading: number; pitch: number };
//   zoom: 1;
// }
function StreetView(props) {
  const dispatch = useDispatch();
  const [coord, setCoord] = useState({
    lat: 51.53196799967446,
    lng: -0.10627818467629299,
  });
  const [options, setOptions] = useState<google.maps.StreetViewPanoramaOptions>(
    {
      addressControl: false,
      position: coord,
      showRoadLabels: false,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.LEFT_BOTTOM,
      },
    }
  );
  const handlePositionChange = (position) => {
    setCoord({
      lat: position.lat(),
      lng: position.lng(),
    });
    dispatch(updateUserPosition({ lat: position.lat(), lng: position.lng() }));
  };
  const handleOptions = useCallback(
    (coordinates) => {
      setOptions({
        ...options,
        position: new window.google.maps.LatLng(
          coordinates.lat,
          coordinates.lng
        ),
      });
    },
    [options, setOptions]
  );
  const boxComponentProps = { callback: handleOptions };
  return (
    <Grid container direction='column' justify='center'>
      <BoxComponent {...boxComponentProps} />
      <Grid item>
        <div style={{ height: '100vh', width: '100vw' }}>
          <Streetview
            apiKey={'AIzaSyAyesbQMyKVVbBgKVi2g6VX7mop2z96jBo'}
            onPositionChanged={handlePositionChange}
            streetViewPanoramaOptions={options}
          />
        </div>
      </Grid>
    </Grid>
  );
}

const mapStateToProps = (state: any) => ({
  state,
});

export default GoogleApiWrapper({
  apiKey: 'AIzaSyAWshrSlfc_0dvnBmVV-um5RoqkT5_MgoE',
})(connect(mapStateToProps)(StreetView));
