/* eslint-disable no-undef */
import React, {useEffect, useState} from 'react';
import ReactStreetview from 'react-streetview';
import axios from 'axios';
import { connect, useDispatch } from 'react-redux';
import Streetview, {onPositionChanged} from 'react-google-streetview';
import { GoogleApiWrapper, Map } from 'google-maps-react';
import {Grid, Box, makeStyles, } from '@material-ui/core';
import { updateUserPosition } from '../redux/coordinates/coordinates.actions';
interface StreetViewOptions{
position: {lat : number, lng : number},
pov : {heading: number, pitch: number},
zoom: 1,
}
const google = window.google ? window.google : {};
function StreetView(props) {
    const dispatch = useDispatch();
    const containerStyle = {
  width: '100%',
  height: '100%'
}
    // const [coord, setCoord]= useState({lat:46.9719,lng:16.399});
    const [coord, setCoord]= useState({lat:51.53196799967446,lng: -0.10627818467629299});
    const options : google.maps.StreetViewPanoramaOptions= {addressControl: false, position: coord, showRoadLabels: false, 
        zoomControlOptions:{position: window.google.maps.ControlPosition.LEFT_BOTTOM}};
    const handlePositionChange = (position)=>{
        setCoord({
            lat:position.lat(),
            lng:position.lng(),
        })
        dispatch(updateUserPosition({lat: position.lat(), lng:position.lng()}))
    }
    return (
        <Grid container direction='column' justify='center' >
            <Grid item>
                <div style={{height:'100vh', width:'100vw'}}>
           <Streetview apiKey={'AIzaSyAyesbQMyKVVbBgKVi2g6VX7mop2z96jBo'} onPositionChanged={handlePositionChange} streetViewPanoramaOptions={options}/>
                </div>
            </Grid>
            {/* <Grid item>
           <Map google={window.google} containerStyle={containerStyle} />
            </Grid> */}
        </Grid>

    )
}

const mapStateToProps = (state: any) =>({
    state,
})

export default GoogleApiWrapper({apiKey: 'AIzaSyAWshrSlfc_0dvnBmVV-um5RoqkT5_MgoE'})(connect(mapStateToProps)(StreetView));
           {/* <Streetview apiKey={'AIzaSyAWshrSlfc_0dvnBmVV-um5RoqkT5_MgoE'} onPositionChanged={handlePositionChange} streetViewPanoramaOptions={options}/> */}