/* eslint-disable no-undef */
import React from 'react';
import ReactStreetview from 'react-streetview';

interface StreetViewOptions{
position: {lat : number, lng : number},
pov : {heading: number, pitch: number},
zoom: 1,
}
let map : google.maps.Map;
const google = window.google ? window.google : {};
export default function StreetView() {
    const streetViewPanoramaOptions : StreetViewOptions= {
			position: {lat: 46.9171876, lng: 17.8951832},
			pov: {heading: 100, pitch: 0},
			zoom: 1
		};
        console.log(google);
    map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: {lat: -34.397, lng: 150.644}
    })
    return (
        <div id='map'>
            {map}
        </div>
        	// <div style={{height: '75vh', width: '75vw', 
            // }}>
			// 	<ReactStreetview
			// 		apiKey='AIzaSyAWshrSlfc_0dvnBmVV-um5RoqkT5_MgoE'
            //         style={{position: 'inherit', }}
			// 		streetViewPanoramaOptions={streetViewPanoramaOptions}
			// 	/>
			// </div>

    )
}
