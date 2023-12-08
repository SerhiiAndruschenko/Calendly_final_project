import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import user from './UserSlice';
import events from './EventSlice';


const store = configureStore({
  reducer: combineReducers({
		user, 
		events
	})
});

export default store;