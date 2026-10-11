import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';  
import { deleteWithVerification } from '../api/deleteWithVerification';


// 1. جلب كل المنتجات
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/get_products/');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'فشل جلب المنتجات'
      );
    }
  }
);

// 2. جلب منتجات قسم معين
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/get_products_by_category/${categoryId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'فشل جلب منتجات القسم'
      );
    }
  }
);

// 3. إضافة منتج
export const addProduct = createAsyncThunk(
  'products/add',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/add_product/', formData);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'فشل إضافة المنتج');
    }
  }
);

// 4. تعديل منتج
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/update_product/${id}/`,
        formData
      );
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'فشل تعديل المنتج');
    }
  }
);

// 5. حذف منتج
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      return await deleteWithVerification(
        `/delete_product/${id}/`,
        '/get_products/',
        id
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'فشل حذف المنتج'
      );
    }
  }
);

//   Slice
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //   Fetch All
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      //   Fetch By Category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      //   Add
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.error = action.payload;
      })

      //   Update
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.products = state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload;
      })

      //   Delete
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearProductsError } = productsSlice.actions;
export default productsSlice.reducer;