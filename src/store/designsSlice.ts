import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Design {
  id: string;
  name: string;
  path: string;
  productType: 'jersey' | 'sock';
  modelId: string;
  price: number;
  isDefault?: boolean;
}

interface DesignsState {
  designs: Design[];
  selectedDesignId: string;
  selectedProductType: 'jersey' | 'sock';
  models: {
    models: {
      id: string;
      productType: 'jersey' | 'sock';
      isDefault: boolean;
    }[];
  };
}

const initialState: DesignsState = {
  designs: [
    { 
      id: 'jersey-classic',
      name: 'Classic',
      path: 'dist/assets/designs/jersey/soccer_jersey/classic.svg',
      productType: 'jersey',
      modelId: 'jersey_1',
      price: 49.99,
      isDefault: true
    },
    { 
      id: 'jersey-tiger', 
      name: 'Tiger', 
      path: 'dist/assets/designs/jersey/soccer_jersey/tiger.svg',
      modelId: 'jersey_1',
      price: 54.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-bones', 
      name: 'Bones', 
      path: 'dist/assets/designs/jersey/roundneck_jersey/bones.svg',
      modelId: 'jersey_4',
      price: 59.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-dynamic', 
      name: 'Dynamic', 
      path: 'dist/assets/designs/jersey/roundneck_jersey/dynamic.svg',
      modelId: 'jersey_4',
      price: 59.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-warrior', 
      name: 'Warrior', 
      path: 'dist/assets/designs/jersey/roundneck_jersey/warrior.svg',
      modelId: 'jersey_4',
      price: 64.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-pinstripes', 
      name: 'Pinstripes', 
      path: 'dist/assets/designs/jersey/softball_jersey/pinstripes.svg',
      modelId: 'jersey_3',
      price: 54.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-stripes', 
      name: 'Stripes', 
      path: 'dist/assets/designs/jersey/softball_jersey/stripes.svg',
      modelId: 'jersey_3',
      price: 54.99,
      productType: 'jersey'
    },
    { 
      id: 'jersey-velocity', 
      name: 'Velocity', 
      path: 'dist/assets/designs/jersey/softball_jersey/velocity.svg',
      modelId: 'jersey_3',
      price: 59.99,
      productType: 'jersey'
    },
    { 
      id: 'sock-lines', 
      name: 'Lines', 
      path: 'dist/assets/designs/sock/lines.svg',
      productType: 'sock',
      modelId: 'socks_1',
      price: 19.99,
      isDefault: true
    },
  ],
  selectedDesignId: 'jersey-classic',
  selectedProductType: 'jersey',
  models: {
    models: [
      {
        id: 'jersey_1',
        productType: 'jersey',
        isDefault: true
      },
      {
        id: 'socks_1',
        productType: 'sock',
        isDefault: true
      },
    ],
  },
};

export const designsSlice = createSlice({
  name: 'designs',
  initialState,
  reducers: {
    setSelectedProductType: (state, action: PayloadAction<'jersey' | 'sock'>) => {
      state.selectedProductType = action.payload;
      
      // Find default model for this product type
      const defaultModel = state.models.models.find(m => 
        m.productType === action.payload && 
        m.isDefault
      );
      
      if (defaultModel) {
        // Find default design for this model
        const defaultDesign = state.designs.find(d => 
          d.productType === action.payload && 
          d.modelId === defaultModel.id && 
          d.isDefault
        );
        
        if (defaultDesign) {
          state.selectedDesignId = defaultDesign.id;
        }
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