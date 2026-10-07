import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { logout } from '../store/slices/usersSlice';
import { toggleLanguage } from '../store/slices/langugeSlice';

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const { theme, isDark, toggleTheme } = useTheme();
  const c = theme.colors;

  const lang = useSelector((state) => state.lang?.lang || 'ar');
  const direction = lang === 'ar' ? 'rtl' : 'ltr';
  const currentUser = useSelector((state) => state.users?.currentUser);
  const cartCount = useSelector((state) => state.cart?.items?.length || 0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const openLogoutDialog = () => setShowLogoutDialog(true);
  const cancelLogout = () => setShowLogoutDialog(false);

  const confirmLogout = () => {
    dispatch(logout());
    setShowLogoutDialog(false);
    setIsMenuOpen(false);
    router.replace('/');
  };

  const closeMobileMenu = () => setIsMenuOpen(false);
  const navigateTo = (path) => {
    closeMobileMenu();
    router.push(path);
  };

  return (
    <>
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: c.bg, direction }}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: c.bg,
              borderBottomColor: c.border,
              direction,
            },
          ]}
        >
          <View style={styles.headerContainer}>
            <Pressable onPress={() => navigateTo('/')} style={styles.headerLogo}>
              <LinearGradient
                colors={[c.primary, c.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerLogoIcon}
              >
                <Text style={styles.headerLogoIconGlow}>🛍️</Text>
              </LinearGradient>
              <View style={styles.headerLogoText}>
                <Text style={[styles.headerLogoTextValue, { color: c.text }]}>
                  {t('متجري')}
                  <Text style={{ color: c.primary }}>.</Text>
                </Text>
              </View>
            </Pressable>

            <View style={styles.headerActions}>
              <Pressable
                onPress={() => navigateTo('/cart')}
                style={[styles.headerCartBtn, { borderColor: c.border }]}
              >
                <Text style={styles.headerCartIcon}>🛒</Text>
                {cartCount > 0 && (
                  <View
                    style={[
                      styles.headerCartBadge,
                      { backgroundColor: c.primary },
                    ]}
                  >
                    <Text style={styles.headerCartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                style={styles.headerMenuBtn}
                onPress={() => setIsMenuOpen(!isMenuOpen)}
              >
                <View style={[styles.menuLine, { backgroundColor: c.text }]} />
                <View style={[styles.menuLine, { backgroundColor: c.text }]} />
                <View style={[styles.menuLine, { backgroundColor: c.text }]} />
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Drawer Modal */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMobileMenu}
      >
        <TouchableWithoutFeedback onPress={closeMobileMenu}>
          <View style={[styles.drawerOverlay, { backgroundColor: c.overlay }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.drawer,
                  {
                    backgroundColor: c.surface,
                    borderStartColor: c.border,
                    direction,
                  },
                ]}
              >
                {currentUser && (
                  <View
                    style={[
                      styles.drawerUserBox,
                      { backgroundColor: c.primaryBg },
                    ]}
                  >
                    <View
                      style={[
                        styles.drawerUserAvatar,
                        { backgroundColor: c.primary },
                      ]}
                    >
                      <Text style={styles.drawerUserAvatarText}>
                        {currentUser.username?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.drawerUserText}>
                      <Text style={[styles.drawerUserName, { color: c.text }]}>
                        {currentUser.username}
                      </Text>
                      <Text
                        style={[styles.drawerUserRole, { color: c.primary }]}
                      >
                        {currentUser.role === 'superadmin' && t('مدير عام')}
                        {currentUser.role === 'admin' && t('مسؤول كامل')}
                        {currentUser.role === 'store' && t('مسؤول المتاجر')}
                        {currentUser.role === 'sales' && t('مسؤول المبيعات')}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.drawerMenu}>
                  {currentUser ? (
                    <Pressable
                      style={styles.drawerItem}
                      onPress={() => navigateTo('/dashboard')}
                    >
                      <Text style={styles.drawerItemIcon}>⚙️</Text>
                      <Text style={[styles.drawerItemText, { color: c.text }]}>
                        {t('لوحة التحكم')}
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={styles.drawerItem}
                      onPress={() => navigateTo('/login')}
                    >
                      <Text style={styles.drawerItemIcon}>🔐</Text>
                      <Text style={[styles.drawerItemText, { color: c.text }]}>
                        {t('التسجيل كمسؤول')}
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.drawerItem}
                    onPress={() => navigateTo('/track')}
                  >
                    <Text style={styles.drawerItemIcon}>📍</Text>
                    <Text style={[styles.drawerItemText, { color: c.text }]}>
                      {t('تتبع طلبك')}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.drawerItem}
                    onPress={() => navigateTo('/contact')}
                  >
                    <Text style={styles.drawerItemIcon}>💬</Text>
                    <Text style={[styles.drawerItemText, { color: c.text }]}>
                      {t('تواصل معنا')}
                    </Text>
                  </Pressable>

                  <Pressable style={styles.drawerItem} onPress={toggleTheme}>
                    <Text style={styles.drawerItemIcon}>
                      {isDark ? '☀️' : '🌙'}
                    </Text>
                    <Text style={[styles.drawerItemText, { color: c.text }]}>
                      {isDark ? t('الوضع النهاري') : t('الوضع الليلي')}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.drawerItem}
                    onPress={() => dispatch(toggleLanguage())}
                    accessibilityRole="button"
                    accessibilityLabel={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                  >
                    <Text style={styles.drawerItemIcon}>🌐</Text>
                    <Text style={[styles.drawerItemText, { color: c.text }]}>
                      {lang === 'ar' ? 'English' : 'العربية'}
                    </Text>
                  </Pressable>

                  {currentUser && (
                    <Pressable
                      style={styles.drawerItem}
                      onPress={openLogoutDialog}
                    >
                      <Text style={styles.drawerItemIcon}>🚪</Text>
                      <Text style={[styles.drawerItemText, { color: c.text }]}>
                        {t('تسجيل الخروج')}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Logout Dialog */}
      <Modal
        visible={showLogoutDialog}
        transparent
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <TouchableWithoutFeedback onPress={cancelLogout}>
          <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.logoutDialog,
                  {
                    backgroundColor: c.surface,
                    borderColor: c.border,
                    direction,
                  },
                ]}
              >
                <Text style={styles.logoutDialogIcon}>🚪</Text>
                <Text style={[styles.logoutDialogTitle, { color: c.text }]}>
                  {t('تأكيد الخروج')}
                </Text>
                <Text
                  style={[styles.logoutDialogMessage, { color: c.textMuted }]}
                >
                  {t('هل أنت متأكد من تسجيل الخروج من الحساب')}
                </Text>
                <View style={styles.logoutDialogActions}>
                  <Pressable
                    style={[
                      styles.logoutDialogBtn,
                      { backgroundColor: c.surface2, borderColor: c.border },
                    ]}
                    onPress={cancelLogout}
                  >
                    <Text style={{ color: c.text, fontWeight: '600' }}>
                      {t('إلغاء')}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.logoutDialogBtn,
                      { backgroundColor: c.danger },
                    ]}
                    onPress={confirmLogout}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      {t('تسجيل الخروج')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    borderBottomWidth: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogoIcon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoIconGlow: { fontSize: 20 },
  headerLogoText: { flexDirection: 'row', alignItems: 'baseline' },
  headerLogoTextValue: {
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerCartBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 6,
  },
  headerCartIcon: { fontSize: 18 },
  headerCartBadge: {
    position: 'absolute',
    top: -6,
    end: -6,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0A0A0A',
  },
  headerCartBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  headerMenuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: 8,
  },
  menuLine: { width: 24, height: 2, borderRadius: 999 },
  drawerOverlay: { flex: 1 },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    end: 0,
    width: 300,
    borderStartWidth: 1,
    paddingTop: 60,
  },
  drawerUserBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  drawerUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerUserAvatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  drawerUserText: { flex: 1 },
  drawerUserName: { fontWeight: '600', fontSize: 15 },
  drawerUserRole: { fontSize: 12, marginTop: 2 },
  drawerMenu: { paddingHorizontal: 8 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  drawerItemIcon: { fontSize: 20 },
  drawerItemText: { fontSize: 15, fontWeight: '500' },
  dialogOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutDialog: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  logoutDialogIcon: { fontSize: 56, marginBottom: 16 },
  logoutDialogTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  logoutDialogMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  logoutDialogActions: { flexDirection: 'row', gap: 8, width: '100%' },
  logoutDialogBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});