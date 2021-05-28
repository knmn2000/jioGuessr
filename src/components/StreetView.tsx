/* eslint-disable no-undef */
import React, {useEffect, useState} from 'react';
import ReactStreetview from 'react-streetview';
import axios from 'axios';
import Streetview from 'react-google-streetview';
import { GoogleApiWrapper } from 'google-maps-react';
interface StreetViewOptions{
position: {lat : number, lng : number},
pov : {heading: number, pitch: number},
zoom: 1,
}
const google = window.google ? window.google : {};
function StreetView() {
    const options = {zoomControl: false};
    const handlePositionChange = (position)=>{
        console.log(position);
        console.log(position.lat);
        console.log(position['lat']);
        console.log(Object.values(position)[0]);

    }
    return (
        <div  style={{
      width: '100vw',
      height: '100vh',
    }}>
           <Streetview apiKey={'AIzaSyAWshrSlfc_0dvnBmVV-um5RoqkT5_MgoE'} onPositionChanged={handlePositionChange}/>
           {/* streetViewPanoramaOptions={Object({addressControl:false})} */}
           
        </div>

    )
}

export default GoogleApiWrapper({apiKey: 'AIzaSyAWshrSlfc_0dvnBmVV-um5RoqkT5_MgoE'})(StreetView);