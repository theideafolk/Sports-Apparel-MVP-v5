import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Model3D {
  id: string;
  name: string;
  path: string;
  productType: 'jersey' | 'sock';
  isDefault?: boolean;
}

interface ModelsState {
  models: Model3D[];
  selectedModelId: string;
}

const initialState: ModelsState = {
  models: [
    {
      id: 'jersey_1',
      name: 'Half Sleeves',
      path: '/dist/assets/3DObjects/Jersey/jersey_1.obj',
      productType: 'jersey',
      isDefault: true
    },
    {
      id: 'jersey_2',
      name: 'Full Sleeves',
      path: '/dist/assets/3DObjects/Jersey/jersey_2.obj',
      productType: 'jersey'
    },
    {
      id: 'socks_1',
      name: 'Short Socks',
      path: '/dist/assets/3DObjects/Socks/socks_1.obj',
      productType: 'sock',
      isDefault: true
    },
    {
      id: 'socks_2',
      name: 'Long Socks',
      path: '/dist/assets/3DObjects/Socks/socks_2.obj',
      productType: 'sock'
    }
  ],
  selectedModelId: 'jersey_1'
};

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setSelectedModel: (state, action: PayloadAction<string>) => {
      state.selectedModelId = action.payload;
    },
    setDefaultModelForType: (state, action: PayloadAction<'jersey' | 'sock'>) => {
      const defaultModel = state.models.find(
        model => model.productType === action.payload && model.isDefault
      );
      if (defaultModel) {
        state.selectedModelId = defaultModel.id;
      }
    }
  }
});

export const { setSelectedModel, setDefaultModelForType } = modelsSlice.actions;
export default modelsSlice.reducer; 