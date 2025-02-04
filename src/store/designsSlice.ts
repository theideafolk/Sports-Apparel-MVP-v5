import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Design {
  id: string;
  name: string;
  path: string;
  productType: 'jersey' | 'sock';
  isDefault?: boolean;
}

interface DesignsState {
  designs: Design[];
  selectedDesignId: string;
  selectedProductType: 'jersey' | 'sock';
}

const initialState: DesignsState = {
  designs: [
    { 
      id: 'jersey-classic', 
      name: 'Classic', 
      path: '/dist/assets/Designs/Jersey/Classic.svg',
      productType: 'jersey',
      isDefault: true
    },
    { 
      id: 'jersey-tiger', 
      name: 'Tiger', 
      path: '/dist/assets/Designs/Jersey/Tiger.svg',
      productType: 'jersey'
    },
    { 
      id: 'sock-lines', 
      name: 'Lines', 
      path: '/dist/assets/Designs/Sock/lines.svg',
      productType: 'sock',
      isDefault: true
    },
  ],
  selectedDesignId: 'jersey-classic',
  selectedProductType: 'jersey',
};

export const designsSlice = createSlice({
  name: 'designs',
  initialState,
  reducers: {
    setSelectedProductType: (state, action: PayloadAction<'jersey' | 'sock'>) => {
      state.selectedProductType = action.payload;
      // Select the default design for this product type
      const defaultDesign = state.designs.find(d => 
        d.productType === action.payload && d.isDefault
      );
      if (defaultDesign) {
        state.selectedDesignId = defaultDesign.id;
      }
    },
    setSelectedDesign: (state, action: PayloadAction<string>) => {
      state.selectedDesignId = action.payload;
    },
    loadSavedDesign: (state, action: PayloadAction<string>) => {
      const design = state.designs.find(d => d.id === action.payload);
      if (design) {
        state.selectedDesignId = action.payload;
        state.selectedProductType = design.productType;
      }
    },
  },
});

export const { setSelectedProductType, setSelectedDesign, loadSavedDesign } = designsSlice.actions;

export default designsSlice.reducer;