import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

export default function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const { theme } = useTheme();
  const c = theme.colors;

  const cartCount = useSelector((state) => state.cart?.items?.length || 0);

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const tabItems = [
    { path: '/', label: t('الرئيسية'), icon: 'home-outline' },
    { path: '/categories', label: t('الأقسام'), icon: 'grid-outline' },
    { path: '/offers', label: t('العروض'), icon: 'flame-outline', badge: '-30%' },
    { path: '/stores', label: t('المتاجر'), icon: 'storefront-outline' },
    { path: '/cart', label: t('السلة'), icon: 'cart-outline', cartBadge: true },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.surface }}>
      <View
        style={[
          styles.bottomTabs,
          { backgroundColor: c.surface, borderTopColor: c.border },
        ]}
      >
        {tabItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Pressable
              key={item.path}
              style={styles.bottomTab}
              onPress={() => router.push(item.path)}
            >
              <View style={styles.bottomTabIconWrapper}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={active ? c.primary : c.grayLight}
                />
                {item.badge && (
                  <View
                    style={[
                      styles.bottomTabBadge,
                      { backgroundColor: c.primary },
                    ]}
                  >
                    <Text style={styles.bottomTabBadgeText}>{item.badge}</Text>
                  </View>
                )}
                {item.cartBadge && cartCount > 0 && (
                  <View
                    style={[
                      styles.bottomTabCartBadge,
                      { backgroundColor: c.primary },
                    ]}
                  >
                    <Text style={styles.bottomTabCartBadgeText}>
                      {cartCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.bottomTabLabel,
                  { color: active ? c.primary : c.grayLight },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomTabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  bottomTabIconWrapper: { position: 'relative' },
  bottomTabBadge: {
    position: 'absolute',
    top: -6,
    end: -20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  bottomTabBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  bottomTabCartBadge: {
    position: 'absolute',
    top: -8,
    end: -10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabCartBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  bottomTabLabel: { fontSize: 11, fontWeight: '600' },
});