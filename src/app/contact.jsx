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
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import { sendMessage } from '@/store/slices/contactSlice';

export default function ContactScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { theme } = useTheme();
  const c = theme.colors;

  const currentUser = useSelector((state) => state.users?.currentUser);
  const { t } = useTranslation();

  const canView = ['superadmin', 'admin', 'sales', 'store'].includes(
    currentUser?.role
  );

  // ============ States ============
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    message: '',
  });

  const [isSending, setIsSending] = useState(false);

  const [successDialog, setSuccessDialog] = useState({
    isOpen: false,
    message: '',
  });

  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    message: '',
  });

  // ============ Submit ============
  const handleSubmit = async () => {
    if (isSending) return;

    if (!form.full_name.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال اسمك') });
      return;
    }
    if (!form.phone.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال رقم هاتفك') });
      return;
    }
    if (!form.message.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال رسالتك') });
      return;
    }

    setIsSending(true);

    const result = await dispatch(
      sendMessage({
        full_name: form.full_name,
        phone: form.phone,
        message: form.message,
      })
    );

    setIsSending(false);

    if (sendMessage.fulfilled.match(result)) {
      setForm({ full_name: '', phone: '', message: '' });
      setSuccessDialog({
        isOpen: true,
        message: t('تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.'),
      });
    } else {
      setErrorDialog({
        isOpen: true,
        message:
          typeof result.payload === 'string'
            ? result.payload
            : t('فشل إرسال الرسالة. تحقق من البيانات.'),
      });
    }
  };

  // ============ Open External Links ============
  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/963900000000').catch(() => {});
  };

  const openFacebook = () => {
    Linking.openURL('https://facebook.com').catch(() => {});
  };

  const openInstagram = () => {
    Linking.openURL('https://instagram.com').catch(() => {});
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ============ Page Header ============ */}
        <View style={styles.pageHeader}>
          <View style={styles.headerTitleRow}>
            <View
              style={[styles.headerTitleDot, { backgroundColor: c.primary }]}
            />
            <Text style={[styles.title, { color: c.text }]}>
              {t('تواصل معنا')}
            </Text>
          </View>
          <View
            style={[styles.headerLine, { backgroundColor: c.primary }]}
          />
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            {t('نحن هنا لمساعدتك. تواصل معنا عبر القنوات التالية أو أرسل رسالة مباشرة.')}
          </Text>

          {canView && (
            <Pressable
              style={({ pressed }) => [
                styles.viewMessagesBtn,
                { backgroundColor: c.primary, borderColor: c.primary },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/messages')}
            >
              <Text style={styles.viewMessagesBtnText}>
                📬 {t('عرض الرسائل')} ←
              </Text>
            </Pressable>
          )}
        </View>

        {/* ============ Contact Info ============ */}
        <View
          style={[
            styles.section,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View style={styles.sectionTitleRow}>
            <View
              style={[styles.sectionTitleBar, { backgroundColor: c.primary }]}
            />
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              {t('قنوات التواصل')}
            </Text>
          </View>

          {/* WhatsApp */}
          <Pressable
            style={({ pressed }) => [
              styles.channel,
              { backgroundColor: c.surface2, borderColor: c.border },
              pressed && styles.pressed,
            ]}
            onPress={openWhatsApp}
          >
            <View
              style={[
                styles.channelIcon,
                {
                  backgroundColor: 'rgba(37, 211, 102, 0.12)',
                  borderColor: 'rgba(37, 211, 102, 0.4)',
                },
              ]}
            >
              <Text style={styles.channelIconText}>💬</Text>
            </View>
            <View style={styles.channelText}>
              <Text style={[styles.channelLabel, { color: c.text }]}>
                WhatsApp
              </Text>
              <Text style={[styles.channelValue, { color: c.textMuted }]}>
                📞 +963 900 000 000
              </Text>
            </View>
            <Text style={[styles.channelArrow, { color: c.textMuted }]}>
              ←
            </Text>
          </Pressable>

          {/* Facebook */}
          <Pressable
            style={({ pressed }) => [
              styles.channel,
              { backgroundColor: c.surface2, borderColor: c.border },
              pressed && styles.pressed,
            ]}
            onPress={openFacebook}
          >
            <View
              style={[
                styles.channelIcon,
                {
                  backgroundColor: 'rgba(24, 119, 242, 0.12)',
                  borderColor: 'rgba(24, 119, 242, 0.4)',
                },
              ]}
            >
              <Text style={styles.channelIconText}>📘</Text>
            </View>
            <View style={styles.channelText}>
              <Text style={[styles.channelLabel, { color: c.text }]}>
                Facebook
              </Text>
              <Text style={[styles.channelValue, { color: c.textMuted }]}>
                @marketapp
              </Text>
            </View>
            <Text style={[styles.channelArrow, { color: c.textMuted }]}>
              ←
            </Text>
          </Pressable>

          {/* Instagram */}
          <Pressable
            style={({ pressed }) => [
              styles.channel,
              { backgroundColor: c.surface2, borderColor: c.border },
              pressed && styles.pressed,
            ]}
            onPress={openInstagram}
          >
            <View
              style={[
                styles.channelIcon,
                {
                  backgroundColor: 'rgba(228, 64, 95, 0.12)',
                  borderColor: 'rgba(228, 64, 95, 0.4)',
                },
              ]}
            >
              <Text style={styles.channelIconText}>📷</Text>
            </View>
            <View style={styles.channelText}>
              <Text style={[styles.channelLabel, { color: c.text }]}>
                Instagram
              </Text>
              <Text style={[styles.channelValue, { color: c.textMuted }]}>
                @marketapp
              </Text>
            </View>
            <Text style={[styles.channelArrow, { color: c.textMuted }]}>
              ←
            </Text>
          </Pressable>

          {/* Note */}
          <View
            style={[
              styles.note,
              { backgroundColor: c.primaryBg, borderColor: c.primary },
            ]}
          >
            <Text style={styles.noteIcon}>ℹ️</Text>
            <Text style={[styles.noteText, { color: c.text }]}>
              {t('نستقبل رسائلكم على مدار الساعة وسنقوم بالرد في أقرب وقت ممكن.')}
            </Text>
          </View>
        </View>

        {/* ============ Contact Form ============ */}
        <View
          style={[
            styles.section,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View style={styles.sectionTitleRow}>
            <View
              style={[styles.sectionTitleBar, { backgroundColor: c.primary }]}
            />
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              {t('أرسل رسالة')}
            </Text>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.formContainer}
          >
            {/* Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: c.grayDark }]}>
                {t('الاسم الكامل')} *
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: c.surface2,
                    borderColor: c.border,
                    color: c.text,
                  },
                ]}
                placeholder={t('أدخل اسمك')}
                placeholderTextColor={c.textMuted}
                value={form.full_name}
                onChangeText={(text) =>
                  setForm({ ...form, full_name: text })
                }
                editable={!isSending}
              />
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: c.grayDark }]}>
                {t('رقم الهاتف')} *
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: c.surface2,
                    borderColor: c.border,
                    color: c.text,
                  },
                ]}
                placeholder="09XXXXXXXX"
                placeholderTextColor={c.textMuted}
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                keyboardType="phone-pad"
                editable={!isSending}
              />
            </View>

            {/* Message */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: c.grayDark }]}>
                {t('الرسالة')} *
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  styles.formTextarea,
                  {
                    backgroundColor: c.surface2,
                    borderColor: c.border,
                    color: c.text,
                  },
                ]}
                placeholder={t('اكتب رسالتك هنا...')}
                placeholderTextColor={c.textMuted}
                value={form.message}
                onChangeText={(text) => setForm({ ...form, message: text })}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                editable={!isSending}
              />
            </View>

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: c.primary, borderColor: c.primary },
                (pressed || isSending) && styles.pressed,
              ]}
              onPress={handleSubmit}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  📩 {t('إرسال الرسالة')}
                </Text>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>

      <BottomTabs />

      {/* Success Dialog */}
      <Modal
        visible={successDialog.isOpen}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setSuccessDialog({ isOpen: false, message: '' })
        }
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
              {t('تم الإرسال')}
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
                onPress={() =>
                  setSuccessDialog({ isOpen: false, message: '' })
                }
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
  scrollContent: { padding: 20, paddingBottom: 40, gap: 16 },

  // Page Header
  pageHeader: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  headerLine: {
    width: 60,
    height: 2,
    borderRadius: 1,
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  viewMessagesBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
  },
  viewMessagesBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.7 },

  // Section
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitleBar: { width: 4, height: 20, borderRadius: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Channels
  channel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  channelIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelIconText: { fontSize: 22 },
  channelText: { flex: 1, gap: 2 },
  channelLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  channelValue: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  channelArrow: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Note
  note: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginTop: 4,
  },
  noteIcon: { fontSize: 20 },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },

  // Form
  formContainer: { gap: 12 },
  formGroup: { gap: 6 },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  formInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'auto',
  },
  formTextarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 50,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
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