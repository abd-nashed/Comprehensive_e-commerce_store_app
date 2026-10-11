import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { DeviceEventEmitter, I18nManager, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from '@/store/store';
import i18n from '@/i18n';
import { ThemeProvider } from '@/context/ThemeContext';
import { loadCurrentUser } from '@/store/slices/usersSlice';
import { loadLanguage } from '@/store/slices/langugeSlice';
import { loadCart } from '@/store/slices/cartSlice';

function AppContent() {
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.lang.lang);
  const direction = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    i18n.changeLanguage(lang);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = lang;
      document.body.dir = direction;
    }
  }, [direction, lang]);

  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(false);
  }, []);

  useEffect(() => {
    dispatch(loadCurrentUser());
    dispatch(loadLanguage());
    dispatch(loadCart());

    const sub = DeviceEventEmitter.addListener('auth:logout', () => {
      router.replace('/login');
    });

    return () => sub.remove();
  }, [dispatch]);

  return (
    <View style={{ flex: 1, direction }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { direction },
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}