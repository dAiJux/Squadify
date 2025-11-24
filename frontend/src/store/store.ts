import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user';
import profileReducer from './profile';

export const store = configureStore({
  reducer: {
    user: userReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;