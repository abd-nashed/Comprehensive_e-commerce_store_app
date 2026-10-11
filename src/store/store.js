import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import categoryReducer from './slices/categorySlice';
import productsReducer from './slices/productsSlice';
import langReducer from './slices/langugeSlice';
import contactReducer from './slices/contactSlice';
import storesReducer from './slices/storesSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,         
    users: usersReducer,
    category: categoryReducer,
    products: productsReducer,
    lang: langReducer,
    contact: contactReducer,
    cart: cartReducer,
    stores: storesReducer,
    orders: ordersReducer,
  },
});