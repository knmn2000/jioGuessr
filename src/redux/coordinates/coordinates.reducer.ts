import {USER_POSITION_UPDATE, GUESS_POSITION_UPDATE} from './coordinates.types';

const INITIAL_STATE ={
    userCoordinates: {lat:51.53196799967446,lng: -0.10627818467629299},
    guessCoordinates: {lat: 0, lng:0}
}

const reducer = (state = INITIAL_STATE, action) => {
        switch (action.type) {

            case USER_POSITION_UPDATE:

               return {

                 ...state, userCoordinates: action.coordinates,

               };

            case GUESS_POSITION_UPDATE:

               return {
                  ...state, guessCoordinates: action.coordinates,

               };

             default: return state;

        }

    };

    export default reducer;