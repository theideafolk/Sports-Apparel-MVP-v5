import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TextProperties {
  text: string;
  fontFamily: string;
  fill: string;
  strokeWidth: number;
  stroke: string;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  opacity?: number;
}

export interface ImageProperties {
  src: string;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  opacity?: number;
}

export interface Decoration {
  id: string;
  type: 'text' | 'image';
  properties: TextProperties | ImageProperties;
}

interface DecorationsState {
  items: Decoration[];
  selectedId: string | null;
}

const initialState: DecorationsState = {
  items: [],
  selectedId: null,
};

export const decorationsSlice = createSlice({
  name: 'decorations',
  initialState,
  reducers: {
    addDecoration: (state, action: PayloadAction<Decoration>) => {
      state.items.push(action.payload);
      state.selectedId = action.payload.id;
    },
    updateDecoration: (state, action: PayloadAction<{ id: string; properties: Partial<TextProperties | ImageProperties> }>) => {
      const decoration = state.items.find(item => item.id === action.payload.id);
      if (decoration) {
        decoration.properties = { ...decoration.properties, ...action.payload.properties };
      }
    },
    removeDecoration: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      if (state.selectedId === action.payload) {
        state.selectedId = null;
      }
    },
    setSelectedDecoration: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
    loadSavedDecorations: (state, action: PayloadAction<Decoration[]>) => {
      state.items = action.payload;
      state.selectedId = null;
    },
    clearDecorations: (state) => {
      state.items = [];
      state.selectedId = null;
    },
  },
});

export const { 
  addDecoration, 
  updateDecoration, 
  removeDecoration, 
  setSelectedDecoration,
  loadSavedDecorations,
  clearDecorations
} = decorationsSlice.actions;

export default decorationsSlice.reducer;