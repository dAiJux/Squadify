import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
  userId: string;
  username: string;
  email: string;
  setupCompleted: boolean;
}

interface UserState {
  isAuthenticated: boolean;
  token: string | null;
  data: UserData | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  token: null,
  data: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<{ token: string } & UserData>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.data = {
        userId: action.payload.userId,
        username: action.payload.username,
        email: action.payload.email,
        setupCompleted: action.payload.setupCompleted,
      };
    },
    clearUserData: (state) => {
      state.isAuthenticated = false;
      state.token = null;
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