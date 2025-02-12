import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setSelectedDesign } from './designsSlice';

interface Model3D {
  id: string;
  name: string;
  path: string;
  productType: 'jersey' | 'sock';
  defaultDesignId: string;
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
      name: 'Soccer Jersey',
      path: 'dist/assets/3DObjects/Jersey/jersey_1.obj',
      productType: 'jersey',
      defaultDesignId: 'jersey-classic',
      isDefault: true
    },
    {
      id: 'jersey_3',
      name: 'Softball Jersey',
      path: 'dist/assets/3DObjects/Jersey/Softball.obj',
      defaultDesignId: 'jersey-pinstripes',
      productType: 'jersey'
    },
    {
      id: 'jersey_4',
      name: 'Round Neck Jersey',
      defaultDesignId: 'jersey-warrior',
      path: 'dist/assets/3DObjects/Jersey/RoundNeck.obj',
      productType: 'jersey'
    },
    {
      id: 'socks_1',
      name: 'Short Socks',
      path: 'dist/assets/3DObjects/Socks/socks_1.obj',
      defaultDesignId: 'sock-lines',
      productType: 'sock',
      isDefault: true
    },

    {
      id: 'socks_2',
      name: 'Long Socks',
      path: 'dist/assets/3DObjects/Socks/socks_2.obj',
      defaultDesignId: 'sock-stripes',
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
export const selectModel = (modelId: string) => (dispatch: any, getState: any) => {
  const state = getState();
  const selectedModel = state.models.models.find(m => m.id === modelId);
  
  console.log('Model selection:', {
    modelId,
    selectedModel,
    defaultDesignId: selectedModel?.defaultDesignId,
    availableDesigns: state.designs.designs
  });
  
  if (selectedModel) {
    dispatch(setSelectedModel(modelId));
    
    const defaultDesign = state.designs.designs.find(d => 
      d.id === selectedModel.defaultDesignId
    );
    
    console.log('Default design found:', defaultDesign);
    
    if (defaultDesign) {
      dispatch(setSelectedDesign(defaultDesign.id));
    }
  }
};
export default modelsSlice.reducer; 