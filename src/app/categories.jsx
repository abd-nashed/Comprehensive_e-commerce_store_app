import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  clearError,
} from '@/store/slices/categorySlice';

const API_URL = 'https://abdurrazzaq.pythonanywhere.com';

export default function CategoriesScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { theme } = useTheme();
  const c = theme.colors;

  const { categories, isLoading, error } = useSelector(
    (state) => state.category
  );

  const currentUser = useSelector((state) => state.users?.currentUser);
  const canManage =
    currentUser?.role === 'superadmin' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'store';

  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formDialog, setFormDialog] = useState({
    isOpen: false,
    mode: 'add',
    id: null,
    name: '',
    details: '',
    image: null,
    imagePreview: '',
  });

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

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filtered = categories.filter((cat) => {
    const searchLower = search.toLowerCase();
    const name = (cat.name || '').toLowerCase();
    const details = (cat.details || '').toLowerCase();
    return name.includes(searchLower) || details.includes(searchLower);
  });

  // ⭐ دالة إظهار خيارات الصورة
  const showImageOptions = () => {
    Alert.alert(
      t('اختر صورة'),
      t('من أين تريد اختيار الصورة؟'),
      [
        {
          text: `📷 ${t('الكاميرا')}`,
          onPress: openCamera,
        },
        {
          text: `🖼️ ${t('المعرض')}`,
          onPress: openGallery,
        },
        {
          text: t('إلغاء'),
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // ⭐ فتح الكاميرا
  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(t('تنبيه'), t('يجب السماح بالوصول إلى الكاميرا'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setFormDialog({
          ...formDialog,
          image: {
            uri: asset.uri,
            type: 'image/jpeg',
            name: asset.fileName || `camera_${Date.now()}.jpg`,
          },
          imagePreview: asset.uri,
        });
      }
    } catch (err) {
      Alert.alert(t('خطأ'), t('فشل فتح الكاميرا'));
    }
  };

  // ⭐ فتح المعرض
  const openGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(t('تنبيه'), t('يجب السماح بالوصول إلى معرض الصور'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setFormDialog({
          ...formDialog,
          image: {
            uri: asset.uri,
            type: 'image/jpeg',
            name: asset.fileName || `gallery_${Date.now()}.jpg`,
          },
          imagePreview: asset.uri,
        });
      }
    } catch (err) {
      Alert.alert(t('خطأ'), t('فشل فتح معرض الصور'));
    }
  };

  const openAddDialog = () => {
    if (clearError) dispatch(clearError());
    setFormDialog({
      isOpen: true,
      mode: 'add',
      id: null,
      name: '',
      details: '',
      image: null,
      imagePreview: '',
    });
  };

  const openEditDialog = (category) => {
    if (clearError) dispatch(clearError());
    setFormDialog({
      isOpen: true,
      mode: 'edit',
      id: category.id,
      name: category.name,
      details: category.details || '',
      image: null,
      imagePreview: category.image?.startsWith('http')
        ? category.image
        : `${API_URL}${category.image}`,
    });
  };

  const closeFormDialog = () => {
    setFormDialog({
      isOpen: false,
      mode: 'add',
      id: null,
      name: '',
      details: '',
      image: null,
      imagePreview: '',
    });
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!formDialog.name.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال اسم القسم') });
      return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.append('name', formDialog.name);
    formData.append('details', formDialog.details);

    if (formDialog.image) {
      formData.append('image', {
        uri: formDialog.image.uri,
        type: formDialog.image.type || 'image/jpeg',
        name: formDialog.image.name || 'image.jpg',
      });
    }

    let result;
    if (formDialog.mode === 'add') {
      result = await dispatch(addCategory(formData));
    } else {
      result = await dispatch(updateCategory({ id: formDialog.id, formData }));
    }

    setIsSaving(false);

    if (
      addCategory.fulfilled.match(result) ||
      updateCategory.fulfilled.match(result)
    ) {
      closeFormDialog();
      setSuccessDialog({
        isOpen: true,
        message:
          formDialog.mode === 'add'
            ? t('تمت إضافة القسم بنجاح')
            : t('تم تعديل القسم بنجاح'),
      });
    } else {
      setErrorDialog({
        isOpen: true,
        message:
          typeof result.payload === 'string'
            ? result.payload
            : t('فشلت العملية. تحقق من البيانات.'),
      });
    }
  };

  const openDeleteDialog = (category) => {
    setDeleteDialog({
      isOpen: true,
      id: category.id,
      name: category.name,
    });
  };

  const confirmDelete = async () => {
    const result = await dispatch(deleteCategory(deleteDialog.id));
    setDeleteDialog({ isOpen: false, id: null, name: '' });

    if (deleteCategory.fulfilled.match(result)) {
      setSuccessDialog({
        isOpen: true,
        message: t('تم حذف القسم بنجاح'),
      });
    } else {
      setErrorDialog({
        isOpen: true,
        message:
          result.payload ||
          t('فشل حذف القسم. قد يكون القسم يحتوي على منتجات.'),
      });
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg }]}>
        <Header />
        <View style={styles.loadingContainer}>
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderLeft}>
            <View style={styles.pageHeaderTitleRow}>
              <View
                style={[styles.pageHeaderDot, { backgroundColor: c.primary }]}
              />
              <Text style={[styles.pageTitle, { color: c.text }]}>
                {t('الأقسام')}
              </Text>
            </View>
            <View style={styles.pageHeaderCountRow}>
              <View
                style={[
                  styles.pageHeaderCountLine,
                  { backgroundColor: c.primary },
                ]}
              />
              <Text style={[styles.pageCount, { color: c.textMuted }]}>
                 {categories.length} {t('اقسام')}
              </Text>
            </View>
          </View>

          {canManage && (
            <Pressable
              style={({ pressed }) => [
                styles.addBtn,
                { backgroundColor: c.primary, borderColor: c.primary },
                pressed && styles.pressed,
              ]}
              onPress={openAddDialog}
            >
              <Text style={styles.addBtnIcon}>➕</Text>
              <Text style={styles.addBtnText}>{t('إضافة قسم')}</Text>
            </Pressable>
          )}
        </View>

        {error && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: c.dangerBg,
                borderColor: c.danger,
              },
            ]}
          >
            <Text style={[styles.errorBannerText, { color: c.danger }]}>
              ⚠️ {typeof error === 'string' ? error : JSON.stringify(error)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <Text style={[styles.searchIcon, { color: c.textMuted }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder={t('ابحث عن قسم...')}
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

        {filtered.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              {t('لا توجد نتائج مطابقة للبحث')}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((category) => (
              <Pressable
                key={category.id}
                style={({ pressed }) => [
                  styles.categoryCard,
                  { backgroundColor: c.surface, borderColor: c.border },
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push(`/products/${category.id}`)}
              >
                {canManage && (
                  <View style={styles.cardActions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.cardAction,
                        styles.cardActionEdit,
                        {
                          backgroundColor: c.surface2,
                          borderColor: c.border,
                        },
                        pressed && styles.pressed,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        openEditDialog(category);
                      }}
                    >
                      <Text style={styles.cardActionText}>✏️</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.cardAction,
                        styles.cardActionDelete,
                        {
                          backgroundColor: c.surface2,
                          borderColor: c.border,
                        },
                        pressed && styles.pressed,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        openDeleteDialog(category);
                      }}
                    >
                      <Text style={styles.cardActionText}>🗑️</Text>
                    </Pressable>
                  </View>
                )}

                <View
                  style={[styles.cardImage, { backgroundColor: c.surface2 }]}
                >
                  {category.image && (
                    <Image
                      source={{
                        uri: category.image?.startsWith('http')
                          ? category.image
                          : `${API_URL}${category.image}`,
                      }}
                      style={styles.cardImageInner}
                      resizeMode="cover"
                    />
                  )}
                </View>

                <View style={styles.cardInfo}>
                  <View
                    style={[
                      styles.cardInfoLine,
                      { backgroundColor: c.primary },
                    ]}
                  />
                  <Text
                    style={[styles.cardName, { color: c.text }]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                  <Text
                    style={[styles.cardDescription, { color: c.textMuted }]}
                    numberOfLines={2}
                  >
                    {category.details || ' '}
                  </Text>
                  <View
                    style={[
                      styles.cardProductsBadge,
                      {
                        backgroundColor: c.primaryBg,
                        borderColor: c.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.cardProductsText, { color: c.primary }]}
                    >
                      📦 {category.products_count || 0} {t('منتج')}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomTabs />

      {/* Form Dialog */}
      <Modal
        visible={formDialog.isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeFormDialog}
      >
        <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.dialogContainer}
          >
            <View
              style={[
                styles.dialog,
                styles.formDialog,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <View
                style={[
                  styles.dialogHeader,
                  {
                    backgroundColor: c.surface2,
                    borderBottomColor: c.border,
                  },
                ]}
              >
                <Text style={[styles.dialogTitle, { color: c.text }]}>
                  {formDialog.mode === 'add'
                    ? t('➕ إضافة قسم جديد')
                    : t('✏️ تعديل القسم')}
                </Text>
                <Pressable
                  style={[styles.dialogClose, { borderColor: c.border }]}
                  onPress={closeFormDialog}
                >
                  <Text style={[styles.dialogCloseText, { color: c.textMuted }]}>
                    ✕
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                style={[styles.dialogBody, { flex: 1 }]}
                contentContainerStyle={styles.dialogBodyContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: c.grayDark }]}>
                    {t('اسم القسم')}
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
                    placeholder={t('مثال: إلكترونيات')}
                    placeholderTextColor={c.textMuted}
                    value={formDialog.name}
                    onChangeText={(text) =>
                      setFormDialog({ ...formDialog, name: text })
                    }
                    autoFocus
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: c.grayDark }]}>
                    {t('الوصف')}
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
                    placeholder={t('اكتب وصفاً قصيراً للقسم...')}
                    placeholderTextColor={c.textMuted}
                    value={formDialog.details}
                    onChangeText={(text) =>
                      setFormDialog({ ...formDialog, details: text })
                    }
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: c.grayDark }]}>
                    {t('الصورة')}
                  </Text>

                  {formDialog.imagePreview ? (
                    <View style={styles.imagePreviewWrapper}>
                      <Image
                        source={{ uri: formDialog.imagePreview }}
                        style={styles.formImagePreview}
                        resizeMode="cover"
                      />
                      <Pressable
                        style={[
                          styles.removeImageBtn,
                          { backgroundColor: c.danger },
                        ]}
                        onPress={() =>
                          setFormDialog({
                            ...formDialog,
                            image: null,
                            imagePreview: '',
                          })
                        }
                      >
                        <Text style={styles.removeImageBtnText}>✕</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  <Pressable
                    style={({ pressed }) => [
                      styles.imagePickerBtn,
                      {
                        backgroundColor: c.surface2,
                        borderColor: c.primary,
                      },
                      pressed && styles.pressed,
                    ]}
                    onPress={showImageOptions}
                  >
                    <Text
                      style={[styles.imagePickerBtnText, { color: c.primary }]}
                    >
                      📷{' '}
                      {formDialog.imagePreview
                        ? t('تغيير الصورة')
                        : t('اختر صورة')}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.dialogActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.dialogBtn,
                      {
                        backgroundColor: c.surface2,
                        borderColor: c.border,
                      },
                      pressed && styles.pressed,
                    ]}
                    onPress={closeFormDialog}
                    disabled={isSaving}
                  >
                    <Text
                      style={[styles.dialogBtnText, { color: c.grayDark }]}
                    >
                      {t('إلغاء')}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.dialogBtn,
                      {
                        backgroundColor: c.primary,
                        borderColor: c.primary,
                      },
                      (pressed || isSaving) && styles.pressed,
                    ]}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>
                      {isSaving
                        ? t('جاري الحفظ...')
                        : formDialog.mode === 'add'
                        ? t('إضافة')
                        : t('تعديل')}
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

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
              {t('هل أنت متأكد من حذف القسم')}{' '}
              <Text style={{ color: c.primary, fontWeight: '700' }}>
                "{deleteDialog.name}"
              </Text>
              ؟{'\n'}
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
  scrollContent: { paddingBottom: 20 },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14 },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  pageHeaderLeft: { flex: 1, gap: 6 },
  pageHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageHeaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  pageHeaderCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageHeaderCountLine: { width: 20, height: 1 },
  pageCount: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 6,
  },
  addBtnIcon: { fontSize: 14, color: '#FFFFFF' },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.7 },

  errorBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    borderLeftWidth: 4,
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '500',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
  },
  searchClear: {
    width: 26,
    height: 26,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchClearText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  empty: {
    marginHorizontal: 20,
    padding: 40,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  emptyIcon: { fontSize: 56, opacity: 0.4 },
  emptyText: { fontSize: 14, fontWeight: '500' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  cardActions: {
    position: 'absolute',
    top: 8,
    end: 8,
    flexDirection: 'row',
    gap: 6,
    zIndex: 3,
  },
  cardAction: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionEdit: {},
  cardActionDelete: {},
  cardActionText: { fontSize: 12 },

  cardImage: {
    width: '100%',
    height: 120,
  },
  cardImageInner: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    padding: 12,
    gap: 6,
    position: 'relative',
  },
  cardInfoLine: {
    position: 'absolute',
    top: 0,
    start: 12,
    width: 30,
    height: 2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  cardDescription: {
    fontSize: 11,
    lineHeight: 16,
    minHeight: 32,
  },
  cardProductsBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 4,
  },
  cardProductsText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  dialogOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 480,
    height: '85%',
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  formDialog: {
    maxWidth: 480,
    padding: 0,
    alignItems: 'stretch',
    height: '100%',
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dialogBody: {
    padding: 0,
  },
  dialogBodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  dialogClose: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCloseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dialogIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
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
    marginTop: 16,
    paddingBottom: 8,
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

  formGroup: {
    marginBottom: 16,
    gap: 6,
  },
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
    borderRadius: 6,
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formImagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    end: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  imagePickerBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});