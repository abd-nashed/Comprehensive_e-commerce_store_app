import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';  
import { deleteWithVerification } from '../api/deleteWithVerification';


// 0. جلب الأقسام
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/get_categories/');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'فشل جلب الأقسام'
      );
    }
  }
);

export const addCategory = createAsyncThunk(
  'categories/add',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/add_category/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'فشل إضافة القسم');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/update_category/${id}/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'فشل تعديل القسم');
    }
  }
);

// 3. حذف قسم
export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      return await deleteWithVerification(
        `/delete_category/${id}/`,
        '/get_categories/',
        id
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'فشل حذف القسم'
      );
    }
  }
);

//   Slice
const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //   Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      //   Add
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.unshift(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      //   Update
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.categories = state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      //   Delete
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;