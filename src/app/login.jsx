import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import { verifySuperAdmin, clearError } from '@/store/slices/usersSlice';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { theme } = useTheme();
  const c = theme.colors;

  const { isLoading, error } = useSelector((state) => state.users);
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // ============ Handle Login ============
  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setShowError(true);
      return;
    }

    dispatch(clearError());

    const result = await dispatch(
      verifySuperAdmin({ username, password })
    );

    if (verifySuperAdmin.fulfilled.match(result)) {
      setShowSuccess(true);
    } else {
      setShowError(true);
    }
  };

  // ============ Success Close ============
  const handleSuccessClose = async () => {
    const userStr = await AsyncStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;

    setShowSuccess(false);
    setUsername('');
    setPassword('');

    if (user?.role === 'superadmin') {
      router.replace('/dashboard');
    } else {
      router.replace('/');
    }
  };

  // ============ Error Close ============
  const handleErrorClose = () => {
    setShowError(false);
    dispatch(clearError());
  };

  // ============ Cancel ============
  const handleCancel = () => {
    setUsername('');
    setPassword('');
    dispatch(clearError());
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.formContainer}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.icon}>🔐</Text>

            <Text style={[styles.title, { color: c.text }]}>
              {t('تسجيل الدخول')}
            </Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              {t('أدخل بياناتك للوصول إلى لوحة التحكم')}
            </Text>

            {/* Username */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: c.grayDark }]}>
                {t('اسم المستخدم')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.surface2,
                    borderColor: c.border,
                    color: c.text,
                  },
                ]}
                placeholder={t('اسم المستخدم')}
                placeholderTextColor={c.textMuted}
                value={username}
                onChangeText={setUsername}
                autoFocus
                editable={!isLoading}
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: c.grayDark }]}>
                {t('كلمة المرور')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.surface2,
                    borderColor: c.border,
                    color: c.text,
                  },
                ]}
                placeholder={t('كلمة المرور')}
                placeholderTextColor={c.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  {
                    backgroundColor: c.surface2,
                    borderColor: c.border,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={[styles.btnText, { color: c.grayDark }]}>
                  {t('إلغاء')}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  {
                    backgroundColor: c.primary,
                    borderColor: c.primary,
                  },
                  (pressed || isLoading) && styles.pressed,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.btnText, { color: '#FFFFFF' }]}>
                    {t('تسجيل الدخول')}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>

      <BottomTabs />

      {/* Success Dialog */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
          <View
            style={[
              styles.dialog,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.dialogIcon}>✅</Text>
            <Text style={[styles.dialogTitle, { color: c.text }]}>
              {t('نجح تسجيل الدخول')}
            </Text>
            <Text style={[styles.dialogMessage, { color: c.textMuted }]}>
              {t('مرحبًا بك')}{' '}
              <Text style={{ color: c.primary, fontWeight: '700' }}>
                {username}
              </Text>
              {'\n'}
              {t('جاري توجيهك')}...
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: c.primary, borderColor: c.primary },
                  pressed && styles.pressed,
                ]}
                onPress={handleSuccessClose}
              >
                <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>
                  {t('متابعة')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Dialog */}
      <Modal
        visible={showError}
        transparent
        animationType="fade"
        onRequestClose={handleErrorClose}
      >
        <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
          <View
            style={[
              styles.dialog,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.dialogIcon}>❌</Text>
            <Text style={[styles.dialogTitle, { color: c.text }]}>
              {t('فشل تسجيل الدخول')}
            </Text>
            <Text style={[styles.dialogMessage, { color: c.textMuted }]}>
              {error || t('بيانات الدخول غير صحيحة')}
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: c.primary, borderColor: c.primary },
                  pressed && styles.pressed,
                ]}
                onPress={handleErrorClose}
              >
                <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>
                  {t('حسناً')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: { width: '100%' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 12,
    alignItems: 'center',
  },
  icon: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  formGroup: {
    width: '100%',
    gap: 6,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 2,
    borderRadius: 8,
    textAlign: 'auto',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pressed: { opacity: 0.7 },

  // Dialogs
  dialogOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  dialogIcon: { fontSize: 52, marginBottom: 12 },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  dialogBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});