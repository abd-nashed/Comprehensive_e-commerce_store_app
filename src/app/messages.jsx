import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import {
  fetchMessages,
  deleteMessage,
} from '@/store/slices/contactSlice';

export default function MessagesScreen() {
  const dispatch = useDispatch();

  const { theme } = useTheme();
  const c = theme.colors;

  const { messages, isLoading, error } = useSelector((state) => state.contact);
  const currentUser = useSelector((state) => state.users?.currentUser);
  const { t } = useTranslation();

  const canView = ['superadmin', 'admin', 'sales', 'store'].includes(
    currentUser?.role
  );

  //     States
  const [search, setSearch] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    id: null,
    name: '',
  });

  const [successDialog, setSuccessDialog] = useState({
    isOpen: false,
    message: '',
  });

  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    message: '',
  });

  //     Fetch
  useEffect(() => {
    if (canView) dispatch(fetchMessages());
  }, [dispatch, canView]);

  //     Filter
  const filtered = messages.filter((m) => {
    const s = search.toLowerCase();
    return (
      (m.full_name || '').toLowerCase().includes(s) ||
      (m.phone || '').toLowerCase().includes(s) ||
      (m.message || '').toLowerCase().includes(s)
    );
  });

  //     Delete
  const openDeleteDialog = (message) => {
    setDeleteDialog({
      isOpen: true,
      id: message.id,
      name: message.full_name,
    });
  };

  const confirmDelete = async () => {
    const id = deleteDialog.id;
    setDeleteDialog({ isOpen: false, id: null, name: '' });

    const result = await dispatch(deleteMessage(id));

    if (deleteMessage.fulfilled.match(result)) {
      setSuccessDialog({
        isOpen: true,
        message: t('تم حذف الرسالة بنجاح'),
      });
    } else {
      setErrorDialog({
        isOpen: true,
        message: t('فشل حذف الرسالة'),
      });
    }
  };

  // No Access
  if (!canView) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg }]}>
        <Header />
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>🚫</Text>
          <Text style={[styles.errorTitle, { color: c.text }]}>
            {t('غير مصرح لك بالوصول')}
          </Text>
          <Text style={[styles.errorText, { color: c.textMuted }]}>
            {t('هذه الصفحة متاحة للمسؤولين فقط')}
          </Text>
        </View>
        <BottomTabs />
      </View>
    );
  }

  // Loading
  if (isLoading && messages.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg }]}>
        <Header />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[styles.loadingText, { color: c.textMuted }]}>
            {t('جاري التحميل')}...
          </Text>
        </View>
        <BottomTabs />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: c.text }]}>
              📬 {t('الرسائل')}
            </Text>
            <View style={[styles.badge, { backgroundColor: c.primary }]}>
              <Text style={styles.badgeText}>{messages.length}</Text>
            </View>
          </View>
          <Text style={[styles.count, { color: c.textMuted }]}>
            {filtered.length} {t('من')} {messages.length} {t('رسالة')}
          </Text>
        </View>

        {/* Error Banner */}
        {error && (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: c.dangerBg, borderColor: c.danger },
            ]}
          >
            <Text style={[styles.errorBannerText, { color: c.danger }]}>
              ⚠️ {typeof error === 'string' ? error : JSON.stringify(error)}
            </Text>
          </View>
        )}

        {/* Search */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <Text style={[styles.searchIcon, { color: c.textMuted }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder={t('ابحث بالاسم أو الرقم أو الرسالة...')}
            placeholderTextColor={c.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable
              style={[styles.searchClear, { backgroundColor: c.surface3 }]}
              onPress={() => setSearch('')}
            >
              <Text style={styles.searchClearText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* List */}
        {filtered.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              {t('لا توجد رسائل')}
            </Text>
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              {search
                ? t('لا توجد نتائج مطابقة للبحث')
                : t('لم يستقبل الموقع أي رسائل بعد')}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageCard,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                {/* Info */}
                <View
                  style={[
                    styles.messageInfo,
                    { borderBottomColor: c.border },
                  ]}
                >
                  <View
                    style={[
                      styles.messageAvatar,
                      { backgroundColor: c.primary },
                    ]}
                  >
                    <Text style={styles.messageAvatarText}>
                      {message.full_name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.messageDetails}>
                    <Text
                      style={[styles.messageName, { color: c.text }]}
                      numberOfLines={1}
                    >
                      {message.full_name}
                    </Text>
                    <View style={styles.messageMeta}>
                      <Text
                        style={[styles.messageMetaText, { color: c.primary }]}
                      >
                        📞 {message.phone}
                      </Text>
                      <Text
                        style={[styles.messageMetaText, { color: c.textMuted }]}
                      >
                        📅{' '}
                        {new Date(message.created_at).toLocaleDateString(
                          'ar-EG',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Body */}
                <View style={styles.messageBody}>
                  <Text style={[styles.messageText, { color: c.grayDark }]}>
                    {message.message}
                  </Text>
                </View>

                {/* Actions */}
                <View
                  style={[
                    styles.messageActions,
                    { borderTopColor: c.border },
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteBtn,
                      { borderColor: c.danger },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => openDeleteDialog(message)}
                  >
                    <Text style={[styles.deleteBtnText, { color: c.danger }]}>
                      🗑️ {t('حذف')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomTabs />

      {/* Delete Dialog */}
      <Modal
        visible={deleteDialog.isOpen}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setDeleteDialog({ isOpen: false, id: null, name: '' })
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
              {t('هل أنت متأكد من حذف رسالة')}{' '}
              <Text style={{ color: c.primary, fontWeight: '700' }}>
                "{deleteDialog.name}"
              </Text>
              ؟{'\n'}
              {t('لا يمكن التراجع عن هذا الإجراء.')}
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: c.surface2, borderColor: c.border },
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  setDeleteDialog({ isOpen: false, id: null, name: '' })
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  loadingText: { fontSize: 14 },
  errorIcon: { fontSize: 80, opacity: 0.5 },
  errorTitle: { fontSize: 22, fontWeight: '900' },
  errorText: { fontSize: 13, textAlign: 'center' },
  pressed: { opacity: 0.7 },

  // Page Header
  pageHeader: {
    marginBottom: 16,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  badge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  count: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Error Banner
  errorBanner: {
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorBannerText: { fontSize: 13, fontWeight: '500' },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    gap: 10,
    marginBottom: 16,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    textAlign: 'auto',
  },
  searchClear: {
    width: 26,
    height: 26,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchClearText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Empty
  empty: {
    padding: 40,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  emptyIcon: { fontSize: 64, opacity: 0.4 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center' },

  // List
  list: { gap: 12 },
  messageCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  messageAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  messageDetails: { flex: 1, gap: 4 },
  messageName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  messageMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  messageMetaText: {
    fontSize: 11,
    fontWeight: '500',
  },

  messageBody: { paddingVertical: 4 },
  messageText: {
    fontSize: 13,
    lineHeight: 22,
  },

  messageActions: {
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
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