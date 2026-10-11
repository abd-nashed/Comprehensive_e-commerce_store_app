import { useState, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import {
  verifySuperAdmin,
  fetchUsers,
  addUser,
  deleteUser,
} from '@/store/slices/usersSlice';

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { theme } = useTheme();
  const c = theme.colors;

  const { users, isLoading, error } = useSelector((state) => state.users);
  const { t } = useTranslation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'sales',
  });

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    userId: null,
    username: '',
  });

  const [successDialog, setSuccessDialog] = useState({
    isOpen: false,
    message: '',
  });

  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    message: '',
  });

  const [showRolePicker, setShowRolePicker] = useState(false);

  // Fetch users after login
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchUsers());
  }, [isAuthenticated, dispatch]);

  // Login
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorDialog({
        isOpen: true,
        message: 'يرجى إدخال الاسم وكلمة المرور',
      });
      return;
    }

    const result = await dispatch(verifySuperAdmin({ username, password }));

    if (verifySuperAdmin.fulfilled.match(result)) {
      setOwnerName(result.payload.username);
      setIsAuthenticated(true);
    } else {
      setErrorDialog({
        isOpen: true,
        message: result.payload || '❌ لا يمكنك الدخول إلى لوحة التحكم',
      });
    }
  };

  // Add User
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) {
      setErrorDialog({
        isOpen: true,
        message: t('يرجى تعبئة جميع الحقول'),
      });
      return;
    }

    const result = await dispatch(addUser(newUser));

    if (addUser.fulfilled.match(result)) {
      setNewUser({ username: '', password: '', role: 'sales' });
      setSuccessDialog({
        isOpen: true,
        message: `${t('تمت إضافة المستخدم')} "${result.payload.username}" ${t(
          'بنجاح'
        )}`,
      });
    } else {
      setErrorDialog({
        isOpen: true,
        message: `❌ ${t(
          'فشل إضافة المستخدم. قد يكون الاسم مستخدماً مسبقاً'
        )}.`,
      });
    }
  };

  // Delete
  const openDeleteDialog = (user) => {
    setDeleteDialog({
      isOpen: true,
      userId: user.id,
      username: user.username,
    });
  };

  const confirmDelete = async () => {
    const id = deleteDialog.userId;
    setDeleteDialog({ isOpen: false, userId: null, username: '' });

    const result = await dispatch(deleteUser(id));
    if (deleteUser.fulfilled.match(result)) {
      setSuccessDialog({
        isOpen: true,
        message: t('تم حذف المستخدم بنجاح'),
      });
    } else {
      setErrorDialog({
        isOpen: true,
        message: `❌ ${t('فشل حذف المستخدم')}`,
      });
    }
  };

  const roleLabel = (role) => {
    if (role === 'superadmin') return t('مدير عام');
    if (role === 'admin') return t('مسؤول كامل');
    if (role === 'store') return t('مسؤول المتاجر');
    if (role === 'sales') return t('مسؤول المبيعات');
    return role;
  };

  //   Auth Screen
  if (!isAuthenticated) {
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
                {t('الدخول للوحة التحكم')}
              </Text>
              <Text style={[styles.subtitle, { color: c.textMuted }]}>
                {t('أدخل بيانات حساب المدير العام')}
              </Text>

              <View style={styles.formGroup}>
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
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
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
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  { backgroundColor: c.primary },
                  (pressed || isLoading) && styles.pressed,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>{t('دخول')}</Text>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
        <BottomTabs />
      </View>
    );
  }

  //   Dashboard
  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.dashboardContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Bar */}
        <View
          style={[
            styles.topbar,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View style={styles.topbarUser}>
            <View style={[styles.avatarCircle, { backgroundColor: c.primaryBg }]}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <View>
              <Text style={[styles.topbarLabel, { color: c.textMuted }]}>
                {t('مرحبًا بك')}
              </Text>
              <Text style={[styles.topbarName, { color: c.text }]}>
                {ownerName}
              </Text>
            </View>
          </View>
        </View>

        {/* Add User Card */}
        <View
          style={[
            styles.card2,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View
            style={[
              styles.cardHeader,
              { backgroundColor: c.surface2, borderBottomColor: c.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: c.text }]}>
              ➕ {t('إضافة مستخدم جديد')}
            </Text>
          </View>

          <View style={styles.formBody}>
            <View style={styles.formGroupFull}>
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
                value={newUser.username}
                onChangeText={(text) =>
                  setNewUser({ ...newUser, username: text })
                }
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroupFull}>
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
                value={newUser.password}
                onChangeText={(text) =>
                  setNewUser({ ...newUser, password: text })
                }
                secureTextEntry
              />
            </View>

            <View style={styles.formGroupFull}>
              <Text style={[styles.label, { color: c.grayDark }]}>
                {t('الصلاحية')}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.selectBtn,
                  {
                    backgroundColor: c.surface2,
                    borderColor: c.border,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={() => setShowRolePicker(true)}
              >
                <Text style={[styles.selectBtnText, { color: c.text }]}>
                  {roleLabel(newUser.role)}
                </Text>
                <Text style={[styles.selectArrow, { color: c.textMuted }]}>
                  ▼
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: c.primary },
                pressed && styles.pressed,
              ]}
              onPress={handleAddUser}
            >
              <Text style={styles.submitBtnText}>
                {t('إضافة المستخدم')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Users List Card */}
        <View
          style={[
            styles.card2,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View
            style={[
              styles.cardHeader,
              { backgroundColor: c.surface2, borderBottomColor: c.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: c.text }]}>
              👥 {t('المستخدمون')} ({users.length})
            </Text>
          </View>

          {isLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={c.primary} />
              <Text style={[styles.loadingText, { color: c.textMuted }]}>
                {t('جاري التحميل')}...
              </Text>
            </View>
          )}

          {users.map((user) => (
            <View
              key={user.id}
              style={[
                styles.userRow,
                { borderBottomColor: c.border },
              ]}
            >
              <View style={styles.userRowInfo}>
                <View
                  style={[
                    styles.userRowAvatar,
                    { backgroundColor: c.primaryBg },
                  ]}
                >
                  <Text style={[styles.userRowAvatarText, { color: c.primary }]}>
                    {user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userRowText}>
                  <Text style={[styles.userRowName, { color: c.text }]}>
                    {user.username}
                  </Text>
                  <Text style={[styles.userRowId, { color: c.textMuted }]}>
                    #{user.id}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor:
                      user.role === 'superadmin'
                        ? 'rgba(251, 191, 36, 0.15)'
                        : user.role === 'admin'
                        ? c.primaryBg
                        : user.role === 'store'
                        ? c.successBg
                        : c.dangerBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleBadgeText,
                    {
                      color:
                        user.role === 'superadmin'
                          ? '#F59E0B'
                          : user.role === 'admin'
                          ? c.primary
                          : user.role === 'store'
                          ? c.success
                          : c.danger,
                    },
                  ]}
                >
                  {roleLabel(user.role)}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.deleteUserBtn,
                  { borderColor: c.border },
                  pressed && styles.pressed,
                ]}
                onPress={() => openDeleteDialog(user)}
              >
                <Text style={styles.deleteUserBtnText}>🗑️</Text>
              </Pressable>
            </View>
          ))}

          {!isLoading && users.length === 0 && (
            <View style={styles.loadingBox}>
              <Text style={[styles.loadingText, { color: c.textMuted }]}>
                لا يوجد مستخدمون
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomTabs />

      {/* Role Picker Modal */}
      <Modal
        visible={showRolePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRolePicker(false)}
      >
        <Pressable
          style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}
          onPress={() => setShowRolePicker(false)}
        >
          <View
            style={[
              styles.rolePickerDialog,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={[styles.dialogTitle, { color: c.text }]}>
              {t('اختر الصلاحية')}
            </Text>
            {['superadmin', 'admin', 'store', 'sales'].map((role) => (
              <Pressable
                key={role}
                style={({ pressed }) => [
                  styles.roleOption,
                  {
                    backgroundColor:
                      newUser.role === role ? c.primaryBg : c.surface2,
                    borderColor:
                      newUser.role === role ? c.primary : c.border,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  setNewUser({ ...newUser, role });
                  setShowRolePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    {
                      color: newUser.role === role ? c.primary : c.text,
                    },
                  ]}
                >
                  {roleLabel(role)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Delete Dialog */}
      <Modal
        visible={deleteDialog.isOpen}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setDeleteDialog({ isOpen: false, userId: null, username: '' })
        }
      >
        <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
          <View
            style={[
              styles.dialog,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.dialogIcon}>⚠️</Text>
            <Text style={[styles.dialogTitle, { color: c.text }]}>
              {t('تأكيد الحذف')}
            </Text>
            <Text style={[styles.dialogMessage, { color: c.textMuted }]}>
              {t('هل أنت متأكد من حذف المستخدم')}{' '}
              <Text style={{ color: c.primary, fontWeight: '700' }}>
                "{deleteDialog.username}"
              </Text>
              ؟
              {'\n'}
              {t('لا يمكن التراجع عن هذا الإجراء')}.
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: c.surface2, borderColor: c.border },
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  setDeleteDialog({
                    isOpen: false,
                    userId: null,
                    username: '',
                  })
                }
              >
                <Text style={[styles.dialogBtnText, { color: c.grayDark }]}>
                  {t('إلغاء')}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: c.danger, borderColor: c.danger },
                  pressed && styles.pressed,
                ]}
                onPress={confirmDelete}
              >
                <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>
                  {t('حذف')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Dialog */}
      <Modal
        visible={successDialog.isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessDialog({ isOpen: false, message: '' })}
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
              {t('نجحت العملية')}
            </Text>
            <Text style={[styles.dialogMessage, { color: c.textMuted }]}>
              {successDialog.message}
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: c.primary, borderColor: c.primary },
                  pressed && styles.pressed,
                ]}
                onPress={() => setSuccessDialog({ isOpen: false, message: '' })}
              >
                <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>
                  {t('حسناً')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Dialog */}
      <Modal
        visible={errorDialog.isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorDialog({ isOpen: false, message: '' })}
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
              {t('حدث خطأ')}
            </Text>
            <Text style={[styles.dialogMessage, { color: c.textMuted }]}>
              {errorDialog.message}
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: c.primary, borderColor: c.primary },
                  pressed && styles.pressed,
                ]}
                onPress={() => setErrorDialog({ isOpen: false, message: '' })}
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
  dashboardContent: {
    padding: 16,
    paddingBottom: 30,
    gap: 16,
  },

  formContainer: { width: '100%' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 12,
    alignItems: 'center',
  },
  icon: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  formGroup: { width: '100%', gap: 6 },
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
  submitBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 48,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pressed: { opacity: 0.7 },

  // Dashboard
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  topbarUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },
  topbarLabel: { fontSize: 11, fontWeight: '500' },
  topbarName: { fontSize: 16, fontWeight: '700' },

  card2: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  formBody: { padding: 16, gap: 12 },
  formGroupFull: { gap: 6 },

  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 8,
  },
  selectBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectArrow: {
    fontSize: 10,
  },

  // Users List
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: { fontSize: 13 },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  userRowInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userRowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRowAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userRowText: { flex: 1, gap: 2 },
  userRowName: { fontSize: 13, fontWeight: '600' },
  userRowId: { fontSize: 11, fontWeight: '500' },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  deleteUserBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteUserBtnText: { fontSize: 14 },

  // Role Picker
  rolePickerDialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  roleOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },

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