import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Design {
  id: string;
  name: string;
  path: string;
  thumbnailPath: string;
  productType: 'jersey' | 'sock';
  modelId: string;
  price: number;
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
      path: '/assets/designs/jersey/soccer_jersey/classic.svg',
      thumbnailPath: '/assets/designs/jersey/soccer_jersey/classic.png',
      productType: 'jersey',
      modelId: 'jersey_1',
      price: 49.99,
      isDefault: true
    },
    { 
      id: 'jersey-tiger', 
      name: 'Tiger', 
      path: '/assets/designs/jersey/soccer_jersey/tiger.svg',
      thumbnailPath: '/assets/designs/jersey/soccer_jersey/tiger.png',
      productType: 'jersey',
      modelId: 'jersey_1',
      price: 54.99
    },
    { 
      id: 'jersey-bones', 
      name: 'Bones', 
      path: '/assets/designs/jersey/roundneck_jersey/bones.svg',
      thumbnailPath: '/assets/designs/jersey/roundneck_jersey/bones.png',
      modelId: 'jersey_4',
      price: 59.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-dynamic', 
      name: 'Dynamic', 
      path: '/assets/designs/jersey/roundneck_jersey/dynamic.svg',
      thumbnailPath: '/assets/designs/jersey/roundneck_jersey/dynamic.png',
      modelId: 'jersey_4',
      price: 59.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-warrior', 
      name: 'Warrior', 
      path: '/assets/designs/jersey/roundneck_jersey/warrior.svg',
      thumbnailPath: '/assets/designs/jersey/roundneck_jersey/warrior.png',
      modelId: 'jersey_4',
      price: 64.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-pinstripes', 
      name: 'Pinstripes', 
      path: '/assets/designs/jersey/softball_jersey/pinstripes.svg',
      thumbnailPath: '/assets/designs/jersey/softball_jersey/pinstripes.png',
      modelId: 'jersey_3',
      price: 54.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-stripes', 
      name: 'Stripes', 
      path: '/assets/designs/jersey/softball_jersey/stripes.svg',
      thumbnailPath: '/assets/designs/jersey/softball_jersey/stripes.png',
      modelId: 'jersey_3',
      price: 54.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-velocity', 
      name: 'Velocity', 
      path: '/assets/designs/jersey/softball_jersey/velocity.svg',
      thumbnailPath: '/assets/designs/jersey/softball_jersey/velocity.png',
      modelId: 'jersey_3',
      price: 59.99,
      productType: 'jersey'
    },
    {
      id: 'jersey-cheer-motion',
      name: 'Cheer Motion',
      path: '/assets/designs/jersey/Cheer_Jersey/Motion.svg',
      thumbnailPath: '/assets/designs/jersey/Cheer_Jersey/Motion.png',
      modelId: 'jersey_5',
      price: 56.99,
      productType: 'jersey'
    },
    {
      id: 'jersey-cheer-triangle',
      name: 'Cheer Triangle',
      path: '/assets/designs/jersey/Cheer_Jersey/Triangle.svg',
      thumbnailPath: '/assets/designs/jersey/Cheer_Jersey/Triangle.png',
      modelId: 'jersey_5',
      price: 56.99,
      productType: 'jersey'
    },
    { 
      id: 'sock-lines', 
      name: 'Lines', 
      path: '/assets/designs/sock/lines.svg',
      thumbnailPath: '/assets/designs/sock/lines.png',
      productType: 'sock',
      modelId: 'socks_1',
      price: 19.99,
      isDefault: true
    },
  ],
  selectedDesignId: 'jersey-classic',
  selectedProductType: 'jersey'
};

export const designsSlice = createSlice({
  name: 'designs',
  initialState,
  reducers: {
    setSelectedProductType: (state, action: PayloadAction<'jersey' | 'sock'>) => {
      state.selectedProductType = action.payload;
      
      // Find default design for this product type
      const defaultDesign = state.designs.find(d => 
        d.productType === action.payload && 
        d.isDefault
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