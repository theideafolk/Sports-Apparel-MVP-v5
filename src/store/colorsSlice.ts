import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PathColor {
  id: string;
  name: string;
  fill: string;
}

interface ColorsState {
  pathColors: PathColor[];
}

const initialState: ColorsState = {
  pathColors: [],
};

export const colorsSlice = createSlice({
  name: 'colors',
  initialState,
  reducers: {
    setPathColors: (state, action: PayloadAction<PathColor[]>) => {
      state.pathColors = action.payload;
    },
    updatePathColor: (state, action: PayloadAction<{ id: string; fill: string }>) => {
      const path = state.pathColors.find(p => p.id === action.payload.id);
      if (path) {
        path.fill = action.payload.fill;
      }
    },
    loadSavedColors: (state, action: PayloadAction<PathColor[]>) => {
      state.pathColors = action.payload;
    },
    clearColors: (state) => {
      state.pathColors = [];
    },
  },
});

export const { setPathColors, updatePathColor, loadSavedColors, clearColors } = colorsSlice.actions;

export default colorsSlice.reducer;