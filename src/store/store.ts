import { configureStore } from '@reduxjs/toolkit';
import decorationsReducer from './decorationsSlice';
import designsReducer from './designsSlice';
import colorsReducer from './colorsSlice';
import cartReducer from './cartSlice';
import modelsReducer from './modelsSlice';

export const store = configureStore({
  reducer: {
    decorations: decorationsReducer,
    designs: designsReducer,
    colors: colorsReducer,
    cart: cartReducer,
    models: modelsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;