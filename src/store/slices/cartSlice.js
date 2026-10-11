import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

//   Thunks

export const loadCart = createAsyncThunk("cart/load", async () => {
  const cartStr = await AsyncStorage.getItem("cart");
  return cartStr ? JSON.parse(cartStr) : [];
});

//   Slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    isLoaded: false,
  },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((item) => item.id === product.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.final_price || product.price,
          image: product.main_image,
          stock: product.stock,
          store_name: product.store_name || "",
          quantity: 1,
        });
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        } else {
          item.quantity = quantity;
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCart.fulfilled, (state, action) => {
      state.items = action.payload;
      state.isLoaded = true;
    });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;