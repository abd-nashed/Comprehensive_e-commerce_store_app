import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";  // ⭐ المسار المصحّح

// ============ Thunks ============

// ⭐ إرسال رسالة (للزوار — بدون توكن)
export const sendMessage = createAsyncThunk(
  "contact/sendMessage",
  async ({ full_name, phone, message }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/contact/", {
        full_name,
        phone,
        message,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors ||
        error.response?.data?.details ||
        "فشل إرسال الرسالة"
      );
    }
  }
);

// ⭐ جلب كل الرسائل (للمسؤولين)
export const fetchMessages = createAsyncThunk(
  "contact/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/get_messages/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل جلب الرسائل"
      );
    }
  }
);

// ⭐ حذف رسالة (للمسؤولين)
export const deleteMessage = createAsyncThunk(
  "contact/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/delete_message/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "فشل حذف الرسالة"
      );
    }
  }
);

// ============ Slice ============
const contactSlice = createSlice({
  name: "contact",
  initialState: {
    messages: [],
    isLoading: false,
    isSending: false,
    error: null,
  },
  reducers: {
    clearContactError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== Send Message ==========
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.isSending = false;
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      })

      // ========== Fetch Messages ==========
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== Delete Message ==========
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearContactError } = contactSlice.actions;
export default contactSlice.reducer;