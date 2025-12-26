import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileData {
  games: string[];
  schedules: string[];
  playStyle: string | null;
}

interface ProfileState {
  data: ProfileData | null;
}

const initialState: ProfileState = {
  data: null,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileData: (state, action: PayloadAction<ProfileData>) => {
      state.data = action.payload;
    },
    clearProfileData: (state) => {
      state.data = null;
    },
  },
});

export const { setProfileData, clearProfileData } = profileSlice.actions;
export default profileSlice.reducer;