import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileData {
  games: string[];
  schedules: string[];
  playStyle: string | null;
}

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileData: (state, action: PayloadAction<ProfileData>) => {
      state.data = action.payload;
      state.loading = false;
    },
    clearProfileData: (state) => {
      state.data = null;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
});

export const { setProfileData, clearProfileData, setLoading } = profileSlice.actions;
export default profileSlice.reducer;