import React, { useState } from 'react'
import { GoogleApiWrapper, Map, Marker} from 'google-maps-react';
import {Box, Button, Grid, makeStyles} from '@material-ui/core';
import { DetailedHTMLProps } from 'react';
import distanceCalculator from '../util/distanceCalculator'
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
function BoxComponent() {
    const classes = useStyles();
    const [coord, setCoord]= useState<Coordinates>({lat:51.53196799967446,lng: -0.10627818467629299});
    const handleMapClick=(mapProps, map, clickEvent)=>{
        setCoord({
            lat:clickEvent.latLng.lat(),
            lng:clickEvent.latLng.lng(),
        })
        console.log(distanceCalculator(51.53196799967446, -0.10627818467629299, coord['lat'], coord['lng']));
        
    }
    const containerStyle = {
  width: '100%',
  height: '100%'
}
const [opacity, setOpacity] = useState<String>('5');
const styles :  React.CSSProperties = {width: '500px', height:'500px',
         position:'fixed', bottom:'100px', right:'0px', zIndex:3, opacity:opacity.toString().concat('%')};
    return (
        <div onMouseEnter={()=>setOpacity('100')} onMouseLeave={()=>setOpacity('5')} style={styles}>
            <Grid container direction='column' spacing={0}>
            <Grid item xs>
            <Button color='default' fullWidth className={classes.button}>
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
export default GoogleApiWrapper({apiKey: 'AIzaSyAWshrSlfc_0dvnBmVV-um5RoqkT5_MgoE'})(BoxComponent);