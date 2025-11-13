import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
  userId: string;
  username: string;
  email: string;
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
      };
    },
    clearUserData: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.data = null;
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;