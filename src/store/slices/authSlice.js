import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api/axiosInstance';

// ============ Thunks ============

// 1. تسجيل الدخول
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/login/', {
        username,
        password,
      });

      // ⭐ حفظ التوكنات
      if (data.access && data.refresh) {
        await AsyncStorage.setItem('access_token', data.access);
        await AsyncStorage.setItem('refresh_token', data.refresh);
      }

      // ⭐ حفظ بيانات المستخدم
      if (data.user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'بيانات الدخول غير صحيحة'
      );
    }
  }
);

// 2. تسجيل حساب جديد
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/register/', userData);

      // ⭐ حفظ التوكنات إن وُجدت
      if (data.access && data.refresh) {
        await AsyncStorage.setItem('access_token', data.access);
        await AsyncStorage.setItem('refresh_token', data.refresh);
      }

      if (data.user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors ||
        error.response?.data?.details ||
        error.response?.data?.error ||
        'فشل إنشاء الحساب'
      );
    }
  }
);

// 3. تسجيل الخروج
export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.multiRemove([
    'access_token',
    'refresh_token',
    'currentUser',
  ]);
  return true;
});

// 4. التحقق من الجلسة عند بدء التطبيق
export const verifySession = createAsyncThunk(
  'auth/verifySession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        // لا يوجد توكن — ليس مسجلاً
        const userStr = await AsyncStorage.getItem('currentUser');
        return {
          isAuthenticated: false,
          user: userStr ? JSON.parse(userStr) : null,
        };
      }

      // يوجد توكن — تحقق من صحته
      const { data } = await axiosInstance.get('/verify-me/');

      return {
        isAuthenticated: true,
        user: data,
      };
    } catch (error) {
      // التوكن غير صالح → امسح كل شيء
      await AsyncStorage.multiRemove([
        'access_token',
        'refresh_token',
        'currentUser',
      ]);
      return rejectWithValue('انتهت الجلسة');
    }
  }
);

// 5. تحميل بيانات المستخدم من AsyncStorage
export const loadStoredUser = createAsyncThunk(
  'auth/loadStoredUser',
  async () => {
    const userStr = await AsyncStorage.getItem('currentUser');
    const token = await AsyncStorage.getItem('access_token');

    return {
      user: userStr ? JSON.parse(userStr) : null,
      isAuthenticated: !!token,
    };
  }
);

// ============ Slice ============
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoaded: false,      // هل تم التحميل من AsyncStorage؟
    isLoading: false,     // هل هناك عملية جارية؟
    error: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    // ⭐ تحديث بيانات المستخدم يدوياً
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== Load Stored User (عند بدء التطبيق) ==========
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isLoaded = true;
      })

      // ========== Login ==========
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== Register ==========
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = !!action.payload.access;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== Logout ==========
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })

      // ========== Verify Session ==========
      .addCase(verifySession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.error = null;
      })
      .addCase(verifySession.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;