import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Design } from './designsSlice';
import type { PathColor } from './colorsSlice';
import type { Decoration } from './decorationsSlice';

export interface SavedDesign {
  id: string;
  saveId: string | null; // Track if this is a new design or editing existing
  timestamp: number;
  design: Design;
  modelPath: string; // Add model path
  pathColors: PathColor[];
  quantity: number;
  decorations: Decoration[];
  preview: string;
  vectorData: string;
}

interface CartState {
  items: SavedDesign[];
  currentSaveId: string | null; // Track current editing session
}

const initialState: CartState = {
  items: [],
  currentSaveId: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<SavedDesign>) => {
      if (action.payload.saveId) {
        // If we have a saveId, update the existing design
        const index = state.items.findIndex(item => 
          item.id === action.payload.saveId || item.saveId === action.payload.saveId
        );
        if (index !== -1) {
          // Update existing item but preserve its original ID
          const originalId = state.items[index].id;
          state.items[index] = {
            ...action.payload,
            id: originalId,
            saveId: originalId
          };
        } else {
          // If not found (shouldn't happen), add as new
          state.items.push(action.payload);
        }
      } else {
        // Add new design
        state.items.push(action.payload);
      }
      state.currentSaveId = null; // Reset current save ID after saving
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      if (state.currentSaveId === action.payload) {
        state.currentSaveId = null;
      }
    },
    setCurrentSaveId: (state, action: PayloadAction<string | null>) => {
      state.currentSaveId = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, setCurrentSaveId } = cartSlice.actions;

export default cartSlice.reducer;