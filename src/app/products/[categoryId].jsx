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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import { fetchCategories } from '@/store/slices/categorySlice';
import { fetchStores } from '@/store/slices/storesSlice';
import { addToCart } from '@/store/slices/cartSlice';
import {
  fetchProductsByCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  clearProductsError,
} from '@/store/slices/productsSlice';

const API_URL = 'https://abdurrazzaq.pythonanywhere.com';
const EXTRA_IMAGE_FIELDS = [
  'image_1',
  'image_2',
  'image_3',
  'image_4',
  'image_5',
];

const getImageUrl = (image) => {
  if (!image || typeof image !== 'string') return '';
  return image.startsWith('http') ? image : `${API_URL}${image}`;
};

const getRelationId = (relation) =>
  relation && typeof relation === 'object' ? relation.id || '' : relation || '';

export default function ProductsByCategoryScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams();
  const dispatch = useDispatch();

  const { theme } = useTheme();
  const c = theme.colors;

  const { products, isLoading, error } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.category);
  const { stores } = useSelector((state) => state.stores);
  const currentUser = useSelector((state) => state.users?.currentUser);

  const canManage =
    currentUser?.role === 'superadmin' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'store';

  const currentCategory = categories.find(
    (cat) => String(cat.id) === String(categoryId)
  );

  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formDialog, setFormDialog] = useState({
    isOpen: false,
    mode: 'add',
    id: null,
    name: '',
    description: '',
    price: '',
    stock: '',
    category: categoryId || '',
    store: '',
    has_discount: false,
    discount_percent: '',
    is_active: true,
    main_image: null,
    main_imagePreview: '',
    image_1: null,
    image_1Preview: '',
    image_2: null,
    image_2Preview: '',
    image_3: null,
    image_3Preview: '',
    image_4: null,
    image_4Preview: '',
    image_5: null,
    image_5Preview: '',
  });
  const [activePicker, setActivePicker] = useState(null);

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
    dispatch(fetchProductsByCategory(categoryId));
    if (categories.length === 0) dispatch(fetchCategories());
    if (stores.length === 0) dispatch(fetchStores());
  }, [dispatch, categoryId, categories.length, stores.length]);

  const filtered = products
    .filter((p) => {
      const searchLower = search.toLowerCase();
      return (p.name || '').toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      if (a.is_active === b.is_active) return 0;
      return a.is_active ? -1 : 1;
    });

  const showImageOptions = (field) => {
    Alert.alert(
      t('اختر صورة'),
      t('من أين تريد اختيار الصورة؟'),
      [
        { text: `📷 ${t('الكاميرا')}`, onPress: () => openCamera(field) },
        { text: `🖼️ ${t('المعرض')}`, onPress: () => openGallery(field) },
        { text: t('إلغاء'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

 const setSelectedImage = (field, asset, source) => {
  if (!asset?.uri) return;

  const uriParts = asset.uri.split('.');
  const extension = uriParts[uriParts.length - 1]?.split('?')[0] || 'jpg';

  const file = {
    uri: asset.uri,
    type: 'image/jpeg',
    name: asset.fileName || `${source}_${field}_${Date.now()}.${extension}`,
  };

  setFormDialog((current) => ({
    ...current,
    [field]: file,
    [`${field}Preview`]: asset.uri,
  }));
};

  const openCamera = async (field) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('تنبيه'), t('يجب السماح بالوصول إلى الكاميرا'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(field, result.assets[0], 'camera');
      }
    } catch (err) {
      Alert.alert(t('خطأ'), t('فشل فتح الكاميرا'));
    }
  };

  const openGallery = async (field) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('تنبيه'), t('يجب السماح بالوصول إلى معرض الصور'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(field, result.assets[0], 'gallery');
      }
    } catch (err) {
      Alert.alert(t('خطأ'), t('فشل فتح معرض الصور'));
    }
  };

  const openAddDialog = () => {
    dispatch(clearProductsError());
    setFormDialog({
      isOpen: true,
      mode: 'add',
      id: null,
      name: '',
      description: '',
      price: '',
      stock: '',
      category: categoryId || '',
      store: '',
      has_discount: false,
      discount_percent: '',
      is_active: true,
      main_image: null,
      main_imagePreview: '',
      image_1: null,
      image_1Preview: '',
      image_2: null,
      image_2Preview: '',
      image_3: null,
      image_3Preview: '',
      image_4: null,
      image_4Preview: '',
      image_5: null,
      image_5Preview: '',
    });
    setActivePicker(null);
  };

  const openEditDialog = (product) => {
    dispatch(clearProductsError());
    setFormDialog({
      isOpen: true,
      mode: 'edit',
      id: product.id,
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      category: getRelationId(product.category) || categoryId || '',
      store: getRelationId(product.store),
      has_discount: product.has_discount || false,
      discount_percent: product.discount_percent || '',
      is_active: product.is_active ?? true,
      main_image: null,
      main_imagePreview: getImageUrl(product.main_image),
      image_1: null,
      image_1Preview: getImageUrl(product.image_1),
      image_2: null,
      image_2Preview: getImageUrl(product.image_2),
      image_3: null,
      image_3Preview: getImageUrl(product.image_3),
      image_4: null,
      image_4Preview: getImageUrl(product.image_4),
      image_5: null,
      image_5Preview: getImageUrl(product.image_5),
    });
    setActivePicker(null);
  };

  const closeFormDialog = () => {
    setFormDialog({
      isOpen: false,
      mode: 'add',
      id: null,
      name: '',
      description: '',
      price: '',
      stock: '',
      category: categoryId || '',
      store: '',
      has_discount: false,
      discount_percent: '',
      is_active: true,
      main_image: null,
      main_imagePreview: '',
      image_1: null,
      image_1Preview: '',
      image_2: null,
      image_2Preview: '',
      image_3: null,
      image_3Preview: '',
      image_4: null,
      image_4Preview: '',
      image_5: null,
      image_5Preview: '',
    });
    setActivePicker(null);
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!formDialog.name.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال اسم المنتج') });
      return;
    }
    if (!formDialog.category) {
      setErrorDialog({ isOpen: true, message: t('يرجى اختيار القسم') });
      return;
    }
    if (formDialog.mode === 'add' && !formDialog.main_image) {
      setErrorDialog({ isOpen: true, message: t('الصورة الرئيسية مطلوبة') });
      return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.append('name', formDialog.name);
    formData.append('description', formDialog.description || '');
    formData.append('price', String(formDialog.price));
    formData.append('stock', String(formDialog.stock));
    formData.append('category', String(formDialog.category));
    formData.append('has_discount', formDialog.has_discount ? 'true' : 'false');
    formData.append('is_active', formDialog.is_active ? 'true' : 'false');

    if (formDialog.store) formData.append('store', String(formDialog.store));

    if (formDialog.has_discount && formDialog.discount_percent) {
      formData.append('discount_percent', String(formDialog.discount_percent));
    }

    if (formDialog.main_image) {
      formData.append('main_image', {
        uri: formDialog.main_image.uri,
        type: formDialog.main_image.type || 'image/jpeg',
        name: formDialog.main_image.name || 'image.jpg',
      });
    }
    EXTRA_IMAGE_FIELDS.forEach((field) => {
      const image = formDialog[field];
      if (image) {
        formData.append(field, {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `${field}.jpg`,
        });
      }
    });

    let result;
    if (formDialog.mode === 'add') {
      result = await dispatch(addProduct(formData));
    } else {
      result = await dispatch(updateProduct({ id: formDialog.id, formData }));
    }

    setIsSaving(false);

    if (
      addProduct.fulfilled.match(result) ||
      updateProduct.fulfilled.match(result)
    ) {
      dispatch(fetchProductsByCategory(categoryId));
      closeFormDialog();
      setSuccessDialog({
        isOpen: true,
        message:
          formDialog.mode === 'add'
            ? t('تمت إضافة المنتج بنجاح')
            : t('تم تعديل المنتج بنجاح'),
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

  const openDeleteDialog = (product) => {
    setDeleteDialog({ isOpen: true, id: product.id, name: product.name });
  };

  const confirmDelete = async () => {
    const result = await dispatch(deleteProduct(deleteDialog.id));
    setDeleteDialog({ isOpen: false, id: null, name: '' });

    if (deleteProduct.fulfilled.match(result)) {
      setSuccessDialog({ isOpen: true, message: t('تم حذف المنتج بنجاح') });
    } else {
      setErrorDialog({ isOpen: true, message: t('فشل حذف المنتج') });
    }
  };

  if (isLoading && products.length === 0) {
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
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              { borderColor: c.border },
              pressed && styles.pressed,
            ]}
            onPress={() => router.push('/categories')}
          >
            <Text style={[styles.backBtnText, { color: c.textMuted }]}>
              ← {t('العودة للأقسام')}
            </Text>
          </Pressable>

          <View style={styles.pageHeaderTitleRow}>
            <View style={[styles.pageHeaderDot, { backgroundColor: c.primary }]} />
            <Text style={[styles.pageTitle, { color: c.text }]}>
              {currentCategory?.name || t('منتجات القسم')}
            </Text>
          </View>

          <View style={styles.pageHeaderCountRow}>
            <View style={[styles.pageHeaderCountLine, { backgroundColor: c.primary }]} />
            <Text style={[styles.pageCount, { color: c.textMuted }]}>
             {products.length} {t('منتج')}
            </Text>
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
              <Text style={styles.addBtnText}>{t('إضافة منتج')}</Text>
            </Pressable>
          )}
        </View>

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

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <Text style={[styles.searchIcon, { color: c.textMuted }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder={t('ابحث عن منتج...')}
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
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              {t('لا توجد منتجات في هذا القسم')}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((product) => {
              const hasDiscount =
                product.has_discount && product.discount_percent;
              const imageSrc = product.main_image?.startsWith('http')
                ? product.main_image
                : `${API_URL}${product.main_image}`;

              return (
                <View
                  key={product.id}
                  style={[
                    styles.productCard,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.productCardLink,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => router.push(`/product/${product.id}`)}
                  >
                    {canManage && (
                      <View style={styles.cardActions}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.cardAction,
                            {
                              backgroundColor: c.surface2,
                              borderColor: c.border,
                            },
                            pressed && styles.pressed,
                          ]}
                          onPress={() => openEditDialog(product)}
                        >
                          <Text style={styles.cardActionText}>✏️</Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            styles.cardAction,
                            {
                              backgroundColor: c.surface2,
                              borderColor: c.border,
                            },
                            pressed && styles.pressed,
                          ]}
                          onPress={() => openDeleteDialog(product)}
                        >
                          <Text style={styles.cardActionText}>🗑️</Text>
                        </Pressable>
                      </View>
                    )}

                    <View
                      style={[
                        styles.productImage,
                        { backgroundColor: c.surface2 },
                      ]}
                    >
                      {product.main_image && (
                        <Image
                          source={{ uri: imageSrc }}
                          style={styles.productImageInner}
                          resizeMode="cover"
                        />
                      )}

                      {hasDiscount && (
                        <View
                          style={[
                            styles.discountBadge,
                            { backgroundColor: c.danger },
                          ]}
                        >
                          <Text style={styles.discountBadgeText}>
                            -{product.discount_percent}%
                          </Text>
                        </View>
                      )}

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: product.is_active
                              ? c.success
                              : c.grayLight,
                          },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {product.is_active ? t('متاح') : t('غير متاح')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.productInfo}>
                      <Text
                        style={[styles.productName, { color: c.text }]}
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>

                      <View
                        style={[
                          styles.categoryBadge,
                          {
                            backgroundColor: c.primaryBg,
                            borderColor: c.primary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryBadgeText,
                            { color: c.primary },
                          ]}
                        >
                          {product.category_name}
                        </Text>
                      </View>

                      <View style={styles.priceRow}>
                        {hasDiscount ? (
                          <>
                            <Text
                              style={[styles.priceFinal, { color: c.primary }]}
                            >
                              ${product.final_price}
                            </Text>
                            <Text
                              style={[styles.priceOld, { color: c.textMuted }]}
                            >
                              ${product.price}
                            </Text>
                          </>
                        ) : (
                          <Text
                            style={[styles.priceFinal, { color: c.primary }]}
                          >
                            ${product.price}
                          </Text>
                        )}
                      </View>

                      <Text style={[styles.stockText, { color: c.textMuted }]}>
                        📦 {product.stock} {t('في المخزون')}
                      </Text>
                    </View>
                  </Pressable>

                  <View style={styles.cardFooter}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.addCartBtn,
                        {
                          backgroundColor:
                            product.is_active && product.stock > 0
                              ? c.primary
                              : c.surface3,
                          borderColor:
                            product.is_active && product.stock > 0
                              ? c.primary
                              : c.border,
                        },
                        pressed &&
                          product.is_active &&
                          product.stock > 0 &&
                          styles.pressed,
                      ]}
                      disabled={!product.is_active || product.stock <= 0}
                      onPress={() => {
                        if (!product.is_active || product.stock <= 0) return;
                        dispatch(addToCart(product));
                      }}
                    >
                      <Text
                        style={[
                          styles.addCartBtnText,
                          {
                            color:
                              product.is_active && product.stock > 0
                                ? '#FFFFFF'
                                : c.textMuted,
                          },
                        ]}
                      >
                        {product.is_active && product.stock > 0
                          ? `🛒 ${t('أضف للسلة')}`
                          : `❌ ${t('غير متاح')}`}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
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
                    ? t('➕ إضافة منتج جديد')
                    : t('✏️ تعديل المنتج')}
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
                    {t('اسم المنتج')}
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
                    placeholder={t('مثال: لابتوب Dell')}
                    placeholderTextColor={c.textMuted}
                    value={formDialog.name}
                    onChangeText={(text) =>
                      setFormDialog({ ...formDialog, name: text })
                    }
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
                    placeholder={t('وصف المنتج...')}
                    placeholderTextColor={c.textMuted}
                    value={formDialog.description}
                    onChangeText={(text) =>
                      setFormDialog({ ...formDialog, description: text })
                    }
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: c.grayDark }]}>
                    {t('القسم')}
                  </Text>
                  <Pressable
                    style={[
                      styles.relationSelector,
                      {
                        backgroundColor: c.surface2,
                        borderColor: c.border,
                      },
                    ]}
                    onPress={() =>
                      setActivePicker(activePicker === 'category' ? null : 'category')
                    }
                  >
                    <Text style={[styles.relationSelectorText, { color: c.text }]}>
                      {categories.find(
                        (category) =>
                          String(category.id) === String(formDialog.category)
                      )?.name || t('اختر القسم')}
                    </Text>
                    <Text style={{ color: c.textMuted }}>
                      {activePicker === 'category' ? '▲' : '▼'}
                    </Text>
                  </Pressable>
                  {activePicker === 'category' && (
                    <View
                      style={[
                        styles.relationOptions,
                        {
                          backgroundColor: c.surface2,
                          borderColor: c.border,
                        },
                      ]}
                    >
                      <ScrollView nestedScrollEnabled>
                        {categories.map((category) => (
                          <Pressable
                            key={category.id}
                            style={[
                              styles.relationOption,
                              String(category.id) ===
                                String(formDialog.category) && {
                                backgroundColor: c.primary,
                              },
                            ]}
                            onPress={() => {
                              setFormDialog({
                                ...formDialog,
                                category: String(category.id),
                              });
                              setActivePicker(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.relationOptionText,
                                {
                                  color:
                                    String(category.id) ===
                                    String(formDialog.category)
                                      ? '#FFFFFF'
                                      : c.text,
                                },
                              ]}
                            >
                              {category.name}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: c.grayDark }]}>
                    {t('المتجر')} ({t('اختياري')})
                  </Text>
                  <Pressable
                    style={[
                      styles.relationSelector,
                      {
                        backgroundColor: c.surface2,
                        borderColor: c.border,
                      },
                    ]}
                    onPress={() =>
                      setActivePicker(activePicker === 'store' ? null : 'store')
                    }
                  >
                    <Text style={[styles.relationSelectorText, { color: c.text }]}>
                      {stores.find(
                        (store) =>
                          String(store.id) === String(formDialog.store)
                      )?.name || t('بدون متجر')}
                    </Text>
                    <Text style={{ color: c.textMuted }}>
                      {activePicker === 'store' ? '▲' : '▼'}
                    </Text>
                  </Pressable>
                  {activePicker === 'store' && (
                    <View
                      style={[
                        styles.relationOptions,
                        {
                          backgroundColor: c.surface2,
                          borderColor: c.border,
                        },
                      ]}
                    >
                      <ScrollView nestedScrollEnabled>
                        <Pressable
                          style={styles.relationOption}
                          onPress={() => {
                            setFormDialog({ ...formDialog, store: '' });
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.relationOptionText,
                              { color: c.textMuted },
                            ]}
                          >
                            {t('بدون متجر')}
                          </Text>
                        </Pressable>
                        {stores.map((store) => (
                          <Pressable
                            key={store.id}
                            style={[
                              styles.relationOption,
                              String(store.id) === String(formDialog.store) && {
                                backgroundColor: c.primary,
                              },
                            ]}
                            onPress={() => {
                              setFormDialog({
                                ...formDialog,
                                store: String(store.id),
                              });
                              setActivePicker(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.relationOptionText,
                                {
                                  color:
                                    String(store.id) ===
                                    String(formDialog.store)
                                      ? '#FFFFFF'
                                      : c.text,
                                },
                              ]}
                            >
                              {store.name}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, styles.formGroupHalf]}>
                    <Text style={[styles.formLabel, { color: c.grayDark }]}>
                      {t('السعر')} ($)
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
                      placeholder="0.00"
                      placeholderTextColor={c.textMuted}
                      value={String(formDialog.price)}
                      onChangeText={(text) =>
                        setFormDialog({ ...formDialog, price: text })
                      }
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formGroup, styles.formGroupHalf]}>
                    <Text style={[styles.formLabel, { color: c.grayDark }]}>
                      {t('الكمية')}
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
                      placeholder="0"
                      placeholderTextColor={c.textMuted}
                      value={String(formDialog.stock)}
                      onChangeText={(text) =>
                        setFormDialog({ ...formDialog, stock: text })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.toggleLabel,
                    {
                      backgroundColor: c.surface2,
                      borderColor: c.border,
                    },
                  ]}
                  onPress={() =>
                    setFormDialog({
                      ...formDialog,
                      has_discount: !formDialog.has_discount,
                    })
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: c.primary,
                        backgroundColor: formDialog.has_discount
                          ? c.primary
                          : 'transparent',
                      },
                    ]}
                  >
                    {formDialog.has_discount && (
                      <Text style={styles.checkboxTick}>✓</Text>
                    )}
                  </View>
                  <Text style={[styles.toggleText, { color: c.text }]}>
                    {t('هل عليه خصم؟')}
                  </Text>
                </Pressable>

                {formDialog.has_discount && (
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: c.grayDark }]}>
                      {t('نسبة الخصم')} (%)
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
                      placeholder="20"
                      placeholderTextColor={c.textMuted}
                      value={String(formDialog.discount_percent)}
                      onChangeText={(text) =>
                        setFormDialog({
                          ...formDialog,
                          discount_percent: text,
                        })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                )}

                <Pressable
                  style={[
                    styles.toggleLabel,
                    {
                      backgroundColor: c.surface2,
                      borderColor: c.border,
                    },
                  ]}
                  onPress={() =>
                    setFormDialog({
                      ...formDialog,
                      is_active: !formDialog.is_active,
                    })
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: c.primary,
                        backgroundColor: formDialog.is_active
                          ? c.primary
                          : 'transparent',
                      },
                    ]}
                  >
                    {formDialog.is_active && (
                      <Text style={styles.checkboxTick}>✓</Text>
                    )}
                  </View>
                  <Text style={[styles.toggleText, { color: c.text }]}>
                    {t('متاح للبيع')}
                  </Text>
                </Pressable>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: c.grayDark }]}>
                    {t('الصورة الرئيسية')}
                  </Text>

                  {formDialog.main_imagePreview ? (
                    <View style={styles.imagePreviewWrapper}>
                      <Image
                        source={{ uri: formDialog.main_imagePreview }}
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
                            main_image: null,
                            main_imagePreview: '',
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
                    onPress={() => showImageOptions('main_image')}
                  >
                    <Text
                      style={[styles.imagePickerBtnText, { color: c.primary }]}
                    >
                      📷{' '}
                      {formDialog.main_imagePreview
                        ? t('تغيير الصورة')
                        : t('اختر صورة')} {formDialog.mode === 'add' ? '*' : ''}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: c.grayDark }]}>
                    {t('صور إضافية')} ({t('حتى 5 صور')})
                  </Text>
                  <View style={styles.extraImagesGrid}>
                    {EXTRA_IMAGE_FIELDS.map((field, index) => {
                      const preview = formDialog[`${field}Preview`];
                      return (
                        <Pressable
                          key={field}
                          style={[
                            styles.extraImageOption,
                            {
                              backgroundColor: c.surface2,
                              borderColor: c.border,
                            },
                          ]}
                          onPress={() => showImageOptions(field)}
                          accessibilityRole="button"
                          accessibilityLabel={`${t('صورة إضافية')} ${index + 1}`}
                        >
                          {preview ? (
                            <Image
                              source={{ uri: preview }}
                              style={styles.extraImagePreview}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text
                              style={[
                                styles.extraImageAddIcon,
                                {
                                  color: c.primary,
                                  borderColor: c.primary,
                                },
                              ]}
                            >
                              +
                            </Text>
                          )}
                          <Text
                            style={[
                              styles.extraImageLabel,
                              { color: c.textMuted },
                            ]}
                          >
                            {preview
                              ? t('تغيير')
                              : `${t('صورة')} ${index + 1}`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
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
                        ? t('إضافة منتج')
                        : t('تعديل منتج')}
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
              {t('هل أنت متأكد من حذف المنتج')}{' '}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 10,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
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
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
    flex: 1,
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
    alignSelf: 'flex-start',
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
    marginTop: 8,
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
    marginTop: 12,
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
  emptyIcon: { fontSize: 64, opacity: 0.4 },
  emptyText: { fontSize: 14, fontWeight: '500' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  productCard: {
    width: '48%',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  productCardLink: {
    flex: 1,
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
  cardActionText: { fontSize: 12 },

  productImage: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  productImageInner: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    end: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    start: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  productInfo: {
    padding: 12,
    gap: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  priceFinal: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  priceOld: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  cardFooter: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  addCartBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCartBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
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
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formGroupHalf: {
    flex: 1,
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
  relationSelector: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  relationSelectorText: {
    fontSize: 14,
    flex: 1,
  },
  relationOptions: {
    maxHeight: 180,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 4,
  },
  relationOption: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  relationOptionText: {
    fontSize: 14,
  },
  extraImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  extraImageOption: {
    width: '30%',
    minHeight: 104,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  extraImagePreview: {
    width: 64,
    height: 64,
    borderRadius: 6,
  },
  extraImageAddIcon: {
    width: 64,
    height: 64,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 36,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  extraImageLabel: {
    fontSize: 11,
    textAlign: 'center',
  },

  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
});