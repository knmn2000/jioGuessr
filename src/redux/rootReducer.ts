import { combineReducers } from 'redux';
import coordinatesReducer from './coordinates/coordinates.reducer';
const rootReducer = combineReducers({
    coordinates: coordinatesReducer,
});
export default rootReducer;