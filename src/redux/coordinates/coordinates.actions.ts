import {USER_POSITION_UPDATE, GUESS_POSITION_UPDATE} from './coordinates.types';

export const updateUserPosition =(coordinates)=>{
    return {
        type: USER_POSITION_UPDATE,
        coordinates
    }
}
export const updateGuessPosition =(coordinates)=>{
    return {
        type: GUESS_POSITION_UPDATE,
        coordinates
    }
}