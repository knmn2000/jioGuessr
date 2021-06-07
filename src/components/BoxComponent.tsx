/* eslint-disable no-undef */
import React, { useState } from 'react';
import { GoogleApiWrapper, Map, Marker } from 'google-maps-react';
import { Button, Grid, makeStyles } from '@material-ui/core';
import { connect, useDispatch } from 'react-redux';
import distanceCalculator from '../util/distanceCalculator';
import {
  updateGuessPosition,
  updateUserPosition,
} from '../redux/coordinates/coordinates.actions';
import axios from 'axios';
const useStyles = makeStyles({
  button: {
    backgroundColor: '#243C8F',
    padding: '8px',
    color: 'white',
    '&:hover': {
      backgroundColor: '#0186D0',
    },
  },
});
interface Coordinates {
  lat: number;
  lng: number;
}
function BoxComponent(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [coord, setCoord] = useState<Coordinates>({
    lat: 28.6129,
    lng: 77.2295,
  });
  const handleMapClick = (mapProps, map, clickEvent) => {
    setCoord({
      lat: clickEvent.latLng.lat(),
      lng: clickEvent.latLng.lng(),
    });
    dispatch(updateGuessPosition(coord));
  };
  const containerStyle = {
    width: '100%',
    height: '100%',
  };
  const handleGuess = () => {
    const result =
      Math.round(
        distanceCalculator(
          Object.values(props.state.coordinates.userCoordinates)[0],
          Object.values(props.state.coordinates.userCoordinates)[1],
          coord['lat'],
          coord['lng']
        ) * 100
      ) / 100;
    alert('You were off by ' + result + ' KMs');
  };

  const [opacity, setOpacity] = useState<String>('45');
  const styles: React.CSSProperties = {
    width: '600px',
    height: '280px',
    position: 'fixed',
    top: '0px',
    left: '0px',
    zIndex: 3,
    opacity: opacity.toString().concat('%'),
  };
  async function nextMap() {
    await axios
      .get(
        'https://jioguessr-api.herokuapp.com/https://random-ize.com/random-map/map-f.php'
      )
      .then((results) => {
        const randomCoord = {
          lat: results.data.split('1d')[1].split('!')[0],
          lng: results.data.split('2d')[1].split('!')[0],
        };
        props.callback(randomCoord);
        dispatch(
          updateUserPosition({
            lat: results.data.split('1d')[1].split('!')[0],
            lng: results.data.split('2d')[1].split('!')[0],
          })
        );
      });
  }
  return (
    <div
      onMouseEnter={() => setOpacity('100')}
      onMouseLeave={() => setOpacity('15')}
      style={styles}
    >
      <Grid container direction='column' spacing={0}>
        <Grid container direction='row' spacing={1}>
          <Grid item xs>
            <Button
              color='default'
              fullWidth
              className={classes.button}
              onClick={handleGuess}
            >
              jioGuess
            </Button>
          </Grid>
          <Grid item xs>
            <Button
              color='default'
              fullWidth
              className={classes.button}
              onClick={nextMap}
            >
              Next Map!
            </Button>
          </Grid>
        </Grid>
        <Grid item xs>
          <Map
            google={window.google}
            initialCenter={coord}
            zoom={1}
            disableDefaultUI
            zoomControl
            fullscreenControl
            containerStyle={containerStyle}
            onClick={handleMapClick}
          >
            <Marker position={coord} />
          </Map>
        </Grid>
      </Grid>
    </div>
  );
}
const mapStateToProps = (state: any) => ({
  state,
});
export default GoogleApiWrapper({
  apiKey: 'AIzaSyAWshrSlfc_0dvnBmVV-um5RoqkT5_MgoE',
})(connect(mapStateToProps)(BoxComponent));
