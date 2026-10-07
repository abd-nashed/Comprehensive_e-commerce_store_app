import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============ Thunks ============

// ⭐ تحميل اللغة من AsyncStorage عند بدء التطبيق
export const loadLanguage = createAsyncThunk(
  'lang/load',
  async () => {
    const savedLang = await AsyncStorage.getItem('lang');
    return savedLang || 'ar';
  }
);

// ⭐ تبديل اللغة + حفظها
export const toggleLanguage = createAsyncThunk(
  'lang/toggle',
  async (_, { getState }) => {
    const current = getState().lang.lang;
    const newLang = current === 'ar' ? 'en' : 'ar';
    await AsyncStorage.setItem('lang', newLang);
    return newLang;
  }
);

// ============ Slice ============
const langSlice = createSlice({
  name: 'lang',
  initialState: {
    lang: 'ar',       // ⭐ القيمة الافتراضية
    isLoaded: false,  // ⭐ هل تم التحميل من AsyncStorage؟
  },
  reducers: {
    // ⭐ reducer sync (اختياري)
    setLanguage: (state, action) => {
      state.lang = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== Load Language ==========
      .addCase(loadLanguage.fulfilled, (state, action) => {
        state.lang = action.payload;
        state.isLoaded = true;
      })

      // ========== Toggle Language ==========
      .addCase(toggleLanguage.fulfilled, (state, action) => {
        state.lang = action.payload;
      });
  },
});

export const { setLanguage } = langSlice.actions;
export default langSlice.reducer;