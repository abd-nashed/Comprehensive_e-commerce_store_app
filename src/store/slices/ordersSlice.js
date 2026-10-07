import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";  // ⭐ المسار المصحّح

// ============ Thunks ============

// 1. إنشاء طلب (للزوار)
export const createOrder = createAsyncThunk(
  "orders/create",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/create_order/", orderData);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors ||
          error.response?.data?.details ||
          "فشل إنشاء الطلب"
      );
    }
  }
);

// 2. جلب كل الطلبات
export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/get_orders/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل جلب الطلبات"
      );
    }
  }
);

// 3. جلب طلب واحد
export const fetchOrder = createAsyncThunk(
  "orders/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/get_order/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل جلب الطلب"
      );
    }
  }
);

// 4. تعديل حالة الطلب
export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/update_order_status/${id}/`,
        { status }
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل تعديل الحالة"
      );
    }
  }
);

// 5. حذف طلب واحد
export const deleteOrder = createAsyncThunk(
  "orders/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/delete_order/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل حذف الطلب"
      );
    }
  }
);

// 6. ⭐ حذف كل الطلبات
export const deleteAllOrders = createAsyncThunk(
  "orders/deleteAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete("/delete_all_orders/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل حذف الطلبات"
      );
    }
  }
);

// 7. جلب المبيعات اليومية
export const fetchDailySales = createAsyncThunk(
  "orders/dailySales",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/daily_sales/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل جلب المبيعات"
      );
    }
  }
);

// ============ Slice ============
const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    currentOrder: null,
    lastOrder: null,
    dailySales: [],
    isLoading: false,
    isCreating: false,
    error: null,
  },
  reducers: {
    clearOrdersError: (state) => {
      state.error = null;
    },
    clearLastOrder: (state) => {
      state.lastOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== Create Order ==========
      .addCase(createOrder.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreating = false;
        state.lastOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // ========== Fetch Orders ==========
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== Fetch One ==========
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== Update Status ==========
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map((o) =>
          o.id === action.payload.id ? action.payload : o
        );
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ========== Delete One ==========
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((o) => o.id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ========== Delete All ==========
      .addCase(deleteAllOrders.fulfilled, (state) => {
        state.orders = [];
      })
      .addCase(deleteAllOrders.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ========== Daily Sales ==========
      .addCase(fetchDailySales.fulfilled, (state, action) => {
        state.dailySales = action.payload;
      })
      .addCase(fetchDailySales.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearOrdersError, clearLastOrder } = ordersSlice.actions;
export default ordersSlice.reducer;