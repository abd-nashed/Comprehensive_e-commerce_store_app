import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";  // ⭐ مسار مصحّح

// ============ Thunks ============

// 1. جلب كل المتاجر
export const fetchStores = createAsyncThunk(
  "stores/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/get_stores/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل جلب المتاجر"
      );
    }
  }
);

// 2. إضافة متجر (للمسؤولين)
export const addStore = createAsyncThunk(
  "stores/add",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/add_store/", formData);
      return response.data.store;
    } catch (error) {
      return rejectWithValue(error.response?.data || "فشل إضافة المتجر");
    }
  }
);

// 3. تعديل متجر (للمسؤولين)
export const updateStore = createAsyncThunk(
  "stores/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/update_store/${id}/`,
        formData
      );
      return response.data.store;
    } catch (error) {
      return rejectWithValue(error.response?.data || "فشل تعديل المتجر");
    }
  }
);

// 4. حذف متجر (للمسؤولين)
export const deleteStore = createAsyncThunk(
  "stores/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/delete_store/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل حذف المتجر"
      );
    }
  }
);

// 5. جلب طلبات المتاجر (للمسؤولين)
export const fetchStoreRequests = createAsyncThunk(
  "stores/fetchRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/get_store_requests/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل جلب الطلبات"
      );
    }
  }
);

// 6. إرسال طلب فتح متجر (للزوار)
export const sendStoreRequest = createAsyncThunk(
  "stores/sendRequest",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/send_store_request/",
        formData
      );
      return response.data.request;
    } catch (error) {
      return rejectWithValue(error.response?.data || "فشل إرسال الطلب");
    }
  }
);

// 7. الموافقة على طلب (للمسؤولين)
export const approveStoreRequest = createAsyncThunk(
  "stores/approveRequest",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/approve_store_request/${id}/`
      );
      return { id, store: response.data.store };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل الموافقة على الطلب"
      );
    }
  }
);

// 8. رفض طلب (للمسؤولين)
export const rejectStoreRequest = createAsyncThunk(
  "stores/rejectRequest",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/reject_store_request/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل رفض الطلب"
      );
    }
  }
);

// ============ Slice ============
const storesSlice = createSlice({
  name: "stores",
  initialState: {
    stores: [],
    requests: [],
    isLoading: false,
    isSending: false,
    error: null,
  },
  reducers: {
    clearStoresError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== Fetch Stores ==========
      .addCase(fetchStores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== Add Store ==========
      .addCase(addStore.fulfilled, (state, action) => {
        state.stores.unshift(action.payload);
      })
      .addCase(addStore.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ========== Update Store ==========
      .addCase(updateStore.fulfilled, (state, action) => {
        state.stores = state.stores.map((s) =>
          s.id === action.payload.id ? action.payload : s
        );
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ========== Delete Store ==========
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.stores = state.stores.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ========== Fetch Requests ==========
      .addCase(fetchStoreRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStoreRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload;
      })
      .addCase(fetchStoreRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== Send Request ==========
      .addCase(sendStoreRequest.pending, (state) => {
        state.isSending = true;
      })
      .addCase(sendStoreRequest.fulfilled, (state, action) => {
        state.isSending = false;
        state.requests.unshift(action.payload);
      })
      .addCase(sendStoreRequest.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      })

      // ========== Approve Request ==========
      .addCase(approveStoreRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (r) => r.id !== action.payload.id
        );
        state.stores.unshift(action.payload.store);
      })
      .addCase(approveStoreRequest.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ========== Reject Request ==========
      .addCase(rejectStoreRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter((r) => r.id !== action.payload);
      })
      .addCase(rejectStoreRequest.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearStoresError } = storesSlice.actions;
export default storesSlice.reducer;