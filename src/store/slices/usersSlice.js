import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api/axiosInstance';  // ⭐ مسار مصحّح

// ============ Thunks ============

// 0. تسجيل الدخول
export const verifySuperAdmin = createAsyncThunk(
  'users/verifySuperAdmin',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/verify-superadmin/', {
        username,
        password,
      });

      // ⭐ حفظ التوكن في AsyncStorage
      if (data.access && data.refresh) {
        await AsyncStorage.setItem('access_token', data.access);
        await AsyncStorage.setItem('refresh_token', data.refresh);
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'بيانات الدخول غير صحيحة'
      );
    }
  }
);

// 1. جلب المستخدمين
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/get_users/');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'فشل جلب المستخدمين'
      );
    }
  }
);

// 2. التحقق الدوري
export const verifyMe = createAsyncThunk(
  'users/verifyMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/verify-me/');
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'انتهت الجلسة'
      );
    }
  }
);

// 3. إضافة مستخدم
export const addUser = createAsyncThunk(
  'users/add',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/add_user/', userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'فشل إضافة المستخدم');
    }
  }
);

// 4. حذف مستخدم
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/delete_user/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'فشل حذف المستخدم'
      );
    }
  }
);

// ⭐ Thunk لتحميل المستخدم من AsyncStorage عند بدء التطبيق
export const loadCurrentUser = createAsyncThunk(
  'users/loadCurrentUser',
  async () => {
    const userStr = await AsyncStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
);

// ============ Slice ============
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    isLoading: false,
    error: null,
    // ⭐ currentUser يبدأ null — سيُحمَّل من AsyncStorage لاحقاً
    currentUser: null,
    isReady: false,  // ⭐ لمعرفة أن التحميل انتهى
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    // ⭐ تسجيل الخروج (نستخدم AsyncStorage — يحتاج async)
    logout: (state) => {
      state.currentUser = null;
      state.users = [];
      state.error = null;
      // ملاحظة: AsyncStorage هنا لا يمكن استخدامه مباشرة في reducer
      // لأنه reducer يجب أن يكون sync
      // الحل: نستخدم thunk منفصل للتنظيف
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== Load Current User ==========
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isReady = true;
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.isReady = true;
      })

      // ========== Verify SuperAdmin ==========
      .addCase(verifySuperAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifySuperAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        const user = {
          username: action.payload.username,
          role: action.payload.role,
        };
        state.currentUser = user;
        // ⭐ حفظ في AsyncStorage
        AsyncStorage.setItem('currentUser', JSON.stringify(user));
      })
      .addCase(verifySuperAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== Verify Me ==========
      .addCase(verifyMe.fulfilled, (state, action) => {
        const user = {
          username: action.payload.username,
          role: action.payload.role,
        };
        state.currentUser = user;
        AsyncStorage.setItem('currentUser', JSON.stringify(user));
      })
      .addCase(verifyMe.rejected, (state) => {
        state.currentUser = null;
        state.users = [];
        state.error = null;
        // ⭐ مسح من AsyncStorage
        AsyncStorage.multiRemove([
          'currentUser',
          'access_token',
          'refresh_token',
        ]);
      })

      // ========== Fetch ==========
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== Add ==========
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ========== Delete ==========
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// ⭐ Thunk لتسجيل الخروج (لأن AsyncStorage async)
export const logoutUser = () => async (dispatch) => {
  await AsyncStorage.multiRemove([
    'currentUser',
    'access_token',
    'refresh_token',
  ]);
  dispatch(logout());
};

// ⭐ تصدير
export const { clearError, logout } = usersSlice.actions;
export default usersSlice.reducer;