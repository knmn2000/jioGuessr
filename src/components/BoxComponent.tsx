/* eslint-disable no-undef */
import React, { useState } from 'react'
import { GoogleApiWrapper, Map, Marker} from 'google-maps-react';
import {Box, Button, Grid, makeStyles} from '@material-ui/core';
import { connect, useDispatch } from 'react-redux';
import distanceCalculator from '../util/distanceCalculator';
import { updateGuessPosition } from '../redux/coordinates/coordinates.actions';
import randomStreetView from '../util/randomStreetview'
const useStyles = makeStyles({
    button: {
        backgroundColor:'#243C8F',
        padding: '8px',
        color:'white',
        "&:hover":{
            backgroundColor: '#0186D0',
        }
    }
})
interface Coordinates{
    lat: number,
    lng: number,
}
// randomStreetView.setParameters({
//     google: true,
// })
function BoxComponent(props) {
    const streetViewCoords = props.state.coordinates.userCoordinates;
    const classes = useStyles();
    const dispatch = useDispatch();
    const [coord, setCoord]= useState<Coordinates>(streetViewCoords);
    const handleMapClick=(mapProps, map, clickEvent)=>{
        setCoord({
            lat:clickEvent.latLng.lat(),
            lng:clickEvent.latLng.lng(),
        })
        dispatch(updateGuessPosition(coord));
    }
    const containerStyle = {
  width: '100%',
  height: '100%'
}
function HandleCallback(data, status) {
    if (status == 'OK') {
      // Call your code to display the panorama here.
      console.log('PASS');
    } else {
      // Nothing here! Let's try another location.
      console.log("FAIL");
    }
}
const sv = new google.maps.StreetViewService();
var location;
const handleGuess = async ()=>{
    const {lat, lng} = props.state.coordinates.guessCoordinates;
    const result = Math.round(distanceCalculator(lat,lng, coord['lat'], coord['lng'])*100)/100;
        console.log(result);
        // window.alert("You were off by " +result+ ' KMs')
        // location = await randomStreetView.getRandomLocation();
        // console.log(location);
//          sv.getPanorama({
//       location: new window.google.maps.LatLng(value[0], value[1]),
//       radius: 50
//   }, HandleCallback);

}
const [opacity, setOpacity] = useState<String>('5');
const styles :  React.CSSProperties = {width: '500px', height:'500px',
         position:'fixed', bottom:'100px', right:'0px', zIndex:3, opacity:opacity.toString().concat('%')};
    return (
        <div onMouseEnter={()=>setOpacity('100')} onMouseLeave={()=>setOpacity('5')} style={styles}>
            <Grid container direction='column' spacing={0}>
            <Grid item xs>
            <Button color='default' fullWidth className={classes.button} onClick={handleGuess}>
            jioGuess
            </Button>
            </Grid>
            <Grid item xs>
           <Map google={window.google} 
           initialCenter={coord}
           disableDefaultUI
           zoomControl
           fullscreenControl
           
           containerStyle={containerStyle} onClick={handleMapClick} >
               <Marker position={coord}/>
           </Map>
            </Grid>
            </Grid>

        </div>
    )
}
const mapStateToProps = (state: any) =>({
    state,
})
export default GoogleApiWrapper({apiKey: 'AIzaSyAWshrSlfc_0dvnBmVV-um5RoqkT5_MgoE'})(connect(mapStateToProps)(BoxComponent));