import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
  userId: string;
  username: string;
  email: string;
  setupCompleted: boolean;
}

interface UserState {
  isAuthenticated: boolean;
  data: UserData | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  data: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.isAuthenticated = true;
      state.data = action.payload;
    },
    clearUserData: (state) => {
      state.isAuthenticated = false;
      state.data = null;
    },
    completeSetup: (state) => {
      if (state.data) {
        state.data.setupCompleted = true;
      }
    }
  },
});

export const { setUserData, clearUserData, completeSetup } = userSlice.actions;
export default userSlice.reducer;