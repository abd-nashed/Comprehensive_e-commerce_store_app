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
  fetchStores,
  fetchStoreRequests,
  addStore,
  updateStore,
  deleteStore,
  sendStoreRequest,
  approveStoreRequest,
  rejectStoreRequest,
  clearStoresError,
} from '@/store/slices/storesSlice';

const API_URL = 'https://abdurrazzaq.pythonanywhere.com';

export default function StoresScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { theme } = useTheme();
  const c = theme.colors;

  const { stores, requests, isLoading, isSending, error } = useSelector(
    (state) => state.stores
  );
  const currentUser = useSelector((state) => state.users?.currentUser);

  const { t } = useTranslation();

  const canManage = ['superadmin', 'admin', 'store'].includes(
    currentUser?.role
  );

  const [activeTab, setActiveTab] = useState('stores');
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formDialog, setFormDialog] = useState({
    isOpen: false,
    mode: 'add',
    id: null,
    name: '',
    phone: '',
    description: '',
    region: '',
    image: null,
    imagePreview: '',
  });

  const [requestDialog, setRequestDialog] = useState({
    isOpen: false,
    store_name: '',
    phone: '',
    description: '',
    region: '',
    image: null,
    imagePreview: '',
  });

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    id: null,
    name: '',
    type: 'store',
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
    dispatch(fetchStores());
  }, [dispatch]);

  useEffect(() => {
    if (canManage) {
      dispatch(fetchStoreRequests());
    }
  }, [dispatch, canManage]);

  const filteredStores = stores.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.region || '').toLowerCase().includes(q)
    );
  });

  const showFormImageOptions = () => {
    Alert.alert(
      t('اختر صورة'),
      t('من أين تريد اختيار الصورة؟'),
      [
        { text: `📷 ${t('الكاميرا')}`, onPress: openFormCamera },
        { text: `🖼️ ${t('المعرض')}`, onPress: openFormGallery },
        { text: t('إلغاء'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const openFormCamera = async () => {
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

  const openFormGallery = async () => {
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

  const showRequestImageOptions = () => {
    Alert.alert(
      t('اختر صورة'),
      t('من أين تريد اختيار الصورة؟'),
      [
        { text: `📷 ${t('الكاميرا')}`, onPress: openRequestCamera },
        { text: `🖼️ ${t('المعرض')}`, onPress: openRequestGallery },
        { text: t('إلغاء'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const openRequestCamera = async () => {
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
        const asset = result.assets[0];
        setRequestDialog({
          ...requestDialog,
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

  const openRequestGallery = async () => {
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
        const asset = result.assets[0];
        setRequestDialog({
          ...requestDialog,
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
    dispatch(clearStoresError());
    setFormDialog({
      isOpen: true,
      mode: 'add',
      id: null,
      name: '',
      phone: '',
      description: '',
      region: '',
      image: null,
      imagePreview: '',
    });
  };

  const openEditDialog = (store) => {
    dispatch(clearStoresError());
    setFormDialog({
      isOpen: true,
      mode: 'edit',
      id: store.id,
      name: store.name,
      phone: store.phone || '',
      description: store.description || '',
      region: store.region || '',
      image: null,
      imagePreview: store.image?.startsWith('http')
        ? store.image
        : `${API_URL}${store.image}`,
    });
  };

  const closeFormDialog = () => {
    setFormDialog({
      isOpen: false,
      mode: 'add',
      id: null,
      name: '',
      phone: '',
      description: '',
      region: '',
      image: null,
      imagePreview: '',
    });
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!formDialog.name.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال اسم المتجر') });
      return;
    }
    if (!formDialog.phone.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال رقم الهاتف') });
      return;
    }
    if (!formDialog.description.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال الوصف') });
      return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.append('name', formDialog.name);
    formData.append('phone', formDialog.phone);
    formData.append('description', formDialog.description);
    formData.append('region', formDialog.region || '');

    if (formDialog.image) {
      formData.append('image', {
        uri: formDialog.image.uri,
        type: formDialog.image.type || 'image/jpeg',
        name: formDialog.image.name || 'image.jpg',
      });
    }

    let result;
    if (formDialog.mode === 'add') {
      result = await dispatch(addStore(formData));
    } else {
      result = await dispatch(updateStore({ id: formDialog.id, formData }));
    }

    setIsSaving(false);

    if (
      addStore.fulfilled.match(result) ||
      updateStore.fulfilled.match(result)
    ) {
      closeFormDialog();
      setSuccessDialog({
        isOpen: true,
        message:
          formDialog.mode === 'add'
            ? t('تمت إضافة المتجر بنجاح')
            : t('تم تعديل المتجر بنجاح'),
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

  const openDeleteDialog = (item, type = 'store') => {
    setDeleteDialog({
      isOpen: true,
      id: item.id,
      name: type === 'store' ? item.name : item.store_name,
      type,
    });
  };

  const confirmDelete = async () => {
    const { id, type } = deleteDialog;
    setDeleteDialog({ isOpen: false, id: null, name: '', type: 'store' });

    let result;
    if (type === 'store') {
      result = await dispatch(deleteStore(id));
      if (deleteStore.fulfilled.match(result)) {
        setSuccessDialog({
          isOpen: true,
          message: t('تم حذف المتجر بنجاح'),
        });
      } else {
        setErrorDialog({ isOpen: true, message: t('فشل حذف المتجر') });
      }
    } else {
      result = await dispatch(rejectStoreRequest(id));
      if (rejectStoreRequest.fulfilled.match(result)) {
        setSuccessDialog({ isOpen: true, message: t('تم رفض الطلب') });
      } else {
        setErrorDialog({ isOpen: true, message: t('فشل رفض الطلب') });
      }
    }
  };

  const openRequestDialog = () => {
    dispatch(clearStoresError());
    setRequestDialog({
      isOpen: true,
      store_name: '',
      phone: '',
      description: '',
      region: '',
      image: null,
      imagePreview: '',
    });
  };

  const closeRequestDialog = () => {
    setRequestDialog({
      isOpen: false,
      store_name: '',
      phone: '',
      description: '',
      region: '',
      image: null,
      imagePreview: '',
    });
  };

  const handleSendRequest = async () => {
    if (isSending) return;

    if (!requestDialog.store_name.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال اسم المتجر') });
      return;
    }
    if (!requestDialog.phone.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال رقم الهاتف') });
      return;
    }
    if (!requestDialog.description.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال الوصف') });
      return;
    }

    const formData = new FormData();
    formData.append('store_name', requestDialog.store_name);
    formData.append('phone', requestDialog.phone);
    formData.append('description', requestDialog.description);
    formData.append('region', requestDialog.region || '');

    if (requestDialog.image) {
      formData.append('image', {
        uri: requestDialog.image.uri,
        type: requestDialog.image.type || 'image/jpeg',
        name: requestDialog.image.name || 'image.jpg',
      });
    }

    const result = await dispatch(sendStoreRequest(formData));

    if (sendStoreRequest.fulfilled.match(result)) {
      closeRequestDialog();
      setSuccessDialog({
        isOpen: true,
        message: t('تم إرسال طلبك بنجاح. سيتم مراجعته قريبًا.'),
      });
    } else {
      setErrorDialog({
        isOpen: true,
        message:
          typeof result.payload === 'string'
            ? result.payload
            : t('فشل إرسال الطلب. تحقق من البيانات.'),
      });
    }
  };

  const handleApprove = async (id) => {
    const result = await dispatch(approveStoreRequest(id));
    if (approveStoreRequest.fulfilled.match(result)) {
      setSuccessDialog({ isOpen: true, message: t('تمت الموافقة على الطلب') });
    } else {
      setErrorDialog({ isOpen: true, message: t('فشل الموافقة') });
    }
  };

  //   Form Dialog Content
  const renderFormContent = () => (
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
            ? t('➕ إضافة متجر جديد')
            : t('✏️ تعديل المتجر')}
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
        style={styles.dialogBody}
        contentContainerStyle={styles.dialogBodyContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.grayDark }]}>
            {t('اسم المتجر')} *
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
            placeholder={t('مثال: متجر الإلكترونيات')}
            placeholderTextColor={c.textMuted}
            value={formDialog.name}
            onChangeText={(text) =>
              setFormDialog({ ...formDialog, name: text })
            }
          />
        </View>

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
            value={formDialog.phone}
            onChangeText={(text) =>
              setFormDialog({ ...formDialog, phone: text })
            }
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.grayDark }]}>
            {t('المنطقة')}
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
            placeholder={t('مثال: دمشق')}
            placeholderTextColor={c.textMuted}
            value={formDialog.region}
            onChangeText={(text) =>
              setFormDialog({ ...formDialog, region: text })
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.grayDark }]}>
            {t('الوصف')} *
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
            placeholder={t('وصف قصير للمتجر...')}
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
            {t('صورة المتجر')}
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
            onPress={showFormImageOptions}
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
  );

  //   Request Dialog Content
  const renderRequestContent = () => (
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
          🏪 {t('افتح متجرك')}
        </Text>
        <Pressable
          style={[styles.dialogClose, { borderColor: c.border }]}
          onPress={closeRequestDialog}
        >
          <Text style={[styles.dialogCloseText, { color: c.textMuted }]}>
            ✕
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.dialogBody}
        contentContainerStyle={styles.dialogBodyContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={[
            styles.infoBox,
            { backgroundColor: c.primaryBg, borderColor: c.primary },
          ]}
        >
          <Text style={[styles.infoBoxText, { color: c.primary }]}>
            ℹ️ {t('سيتم مراجعة طلبك من قِبل المسؤولين قبل الموافقة.')}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.grayDark }]}>
            {t('اسم المتجر')} *
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
            placeholder={t('مثال: متجر الأزياء')}
            placeholderTextColor={c.textMuted}
            value={requestDialog.store_name}
            onChangeText={(text) =>
              setRequestDialog({ ...requestDialog, store_name: text })
            }
          />
        </View>

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
            value={requestDialog.phone}
            onChangeText={(text) =>
              setRequestDialog({ ...requestDialog, phone: text })
            }
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.grayDark }]}>
            {t('المنطقة')}
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
            placeholder={t('مثال: دمشق')}
            placeholderTextColor={c.textMuted}
            value={requestDialog.region}
            onChangeText={(text) =>
              setRequestDialog({ ...requestDialog, region: text })
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.grayDark }]}>
            {t('الوصف')} *
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
            placeholder={t('وصف قصير للمتجر...')}
            placeholderTextColor={c.textMuted}
            value={requestDialog.description}
            onChangeText={(text) =>
              setRequestDialog({ ...requestDialog, description: text })
            }
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: c.grayDark }]}>
            {t('صورة المتجر')}
          </Text>

          {requestDialog.imagePreview ? (
            <View style={styles.imagePreviewWrapper}>
              <Image
                source={{ uri: requestDialog.imagePreview }}
                style={styles.formImagePreview}
                resizeMode="cover"
              />
              <Pressable
                style={[
                  styles.removeImageBtn,
                  { backgroundColor: c.danger },
                ]}
                onPress={() =>
                  setRequestDialog({
                    ...requestDialog,
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
            onPress={showRequestImageOptions}
          >
            <Text
              style={[styles.imagePickerBtnText, { color: c.primary }]}
            >
              📷{' '}
              {requestDialog.imagePreview
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
            onPress={closeRequestDialog}
            disabled={isSending}
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
              (pressed || isSending) && styles.pressed,
            ]}
            onPress={handleSendRequest}
            disabled={isSending}
          >
            <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>
              {isSending ? t('جاري الإرسال...') : t('إرسال الطلب')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );

  if (isLoading && stores.length === 0) {
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: c.text }]}>
              🏪 {t('المتاجر')}
            </Text>
            <View style={[styles.badge, { backgroundColor: c.primary }]}>
              <Text style={styles.badgeText}>{stores.length}</Text>
            </View>
          </View>
          <View style={styles.subtitleRow}>
            <View style={[styles.subtitleLine, { backgroundColor: c.primary }]} />
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              {t('تصفح المتاجر أو افتح متجرك الخاص')}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            {canManage && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: c.primary, borderColor: c.primary },
                  pressed && styles.pressed,
                ]}
                onPress={openAddDialog}
              >
                <Text style={styles.actionBtnText}>➕ {t('إضافة متجر')}</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.actionBtnOutline,
                { borderColor: c.success },
                pressed && styles.pressed,
              ]}
              onPress={openRequestDialog}
            >
              <Text style={[styles.actionBtnOutlineText, { color: c.success }]}>
                🏪 {t('افتح متجرك')}
              </Text>
            </Pressable>
          </View>
        </View>

        {canManage && (
          <View
            style={[
              styles.tabsContainer,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.tab,
                activeTab === 'stores' && { backgroundColor: c.primary },
                pressed && styles.pressed,
              ]}
              onPress={() => setActiveTab('stores')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'stores' ? '#FFFFFF' : c.textMuted },
                ]}
              >
                🏪 {t('المتاجر')} ({stores.length})
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.tab,
                activeTab === 'requests' && { backgroundColor: c.primary },
                pressed && styles.pressed,
              ]}
              onPress={() => setActiveTab('requests')}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'requests' ? '#FFFFFF' : c.textMuted,
                  },
                ]}
              >
                📬 {t('طلبات المتاجر')} ({requests.length})
              </Text>
            </Pressable>
          </View>
        )}

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

        {activeTab === 'stores' && (
          <>
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <Text style={[styles.searchIcon, { color: c.textMuted }]}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: c.text }]}
                placeholder={t('ابحث عن متجر...')}
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

            {filteredStores.length === 0 ? (
              <View
                style={[
                  styles.empty,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <Text style={styles.emptyIcon}>🏪</Text>
                <Text style={[styles.emptyTitle, { color: c.text }]}>
                  {t('لا توجد متاجر')}
                </Text>
                <Text style={[styles.emptyText, { color: c.textMuted }]}>
                  {search
                    ? t('لا توجد نتائج مطابقة للبحث')
                    : t('كن أول من يفتح متجرًا')}
                </Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {filteredStores.map((store) => (
                  <View
                    key={store.id}
                    style={[
                      styles.storeCard,
                      { backgroundColor: c.surface, borderColor: c.border },
                    ]}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.storeCardLink,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => router.push(`/stores/${store.id}`)}
                    >
                      <View
                        style={[
                          styles.storeImage,
                          { backgroundColor: c.surface2 },
                        ]}
                      >
                        {store.image ? (
                          <Image
                            source={{
                              uri: store.image?.startsWith('http')
                                ? store.image
                                : `${API_URL}${store.image}`,
                            }}
                            style={styles.storeImageInner}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.storePlaceholder}>🏪</Text>
                        )}
                      </View>

                      <View style={styles.storeInfo}>
                        <View
                          style={[
                            styles.storeInfoLine,
                            { backgroundColor: c.primary },
                          ]}
                        />
                        <Text
                          style={[styles.storeName, { color: c.text }]}
                          numberOfLines={1}
                        >
                          {store.name}
                        </Text>

                        {canManage && store.phone && (
                          <Text
                            style={[styles.storePhone, { color: c.primary }]}
                          >
                            📞 {store.phone}
                          </Text>
                        )}

                        {store.region && (
                          <Text
                            style={[
                              styles.storeRegion,
                              { color: c.textMuted },
                            ]}
                          >
                            📍 {store.region}
                          </Text>
                        )}

                        {store.description && (
                          <Text
                            style={[
                              styles.storeDescription,
                              { color: c.textMuted },
                            ]}
                            numberOfLines={2}
                          >
                            {store.description}
                          </Text>
                        )}
                      </View>
                    </Pressable>

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
                          onPress={() => openEditDialog(store)}
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
                          onPress={() => openDeleteDialog(store, 'store')}
                        >
                          <Text style={styles.cardActionText}>🗑️</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === 'requests' && canManage && (
          <>
            {requests.length === 0 ? (
              <View
                style={[
                  styles.empty,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={[styles.emptyTitle, { color: c.text }]}>
                  {t('لا توجد طلبات')}
                </Text>
              </View>
            ) : (
              <View style={styles.requestsList}>
                {requests.map((req) => (
                  <View
                    key={req.id}
                    style={[
                      styles.requestCard,
                      { backgroundColor: c.surface, borderColor: c.border },
                    ]}
                  >
                    <Text style={[styles.requestName, { color: c.text }]}>
                      {req.store_name}
                    </Text>

                    {req.phone && (
                      <Text
                        style={[styles.requestPhone, { color: c.primary }]}
                      >
                        📞 {req.phone}
                      </Text>
                    )}

                    {req.region && (
                      <Text
                        style={[
                          styles.requestRegion,
                          { color: c.textMuted },
                        ]}
                      >
                        📍 {req.region}
                      </Text>
                    )}

                    {req.description && (
                      <Text
                        style={[
                          styles.requestDescription,
                          { color: c.textMuted },
                        ]}
                      >
                        {req.description}
                      </Text>
                    )}

                    <Text
                      style={[styles.requestDate, { color: c.textMuted }]}
                    >
                      📅{' '}
                      {new Date(req.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>

                    <View style={styles.requestActions}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.requestBtn,
                          { backgroundColor: c.success, borderColor: c.success },
                          pressed && styles.pressed,
                        ]}
                        onPress={() => handleApprove(req.id)}
                      >
                        <Text style={styles.requestBtnText}>
                          ✅ {t('موافقة')}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          styles.requestBtnOutline,
                          { borderColor: c.danger },
                          pressed && styles.pressed,
                        ]}
                        onPress={() => openDeleteDialog(req, 'request')}
                      >
                        <Text
                          style={[
                            styles.requestBtnOutlineText,
                            { color: c.danger },
                          ]}
                        >
                          ❌ {t('رفض')}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <BottomTabs />

      {/* Form Dialog */}
      <Modal
        visible={formDialog.isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeFormDialog}
      >
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView
            style={styles.flex1}
            behavior="padding"
          >
            <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
              {renderFormContent()}
            </View>
          </KeyboardAvoidingView>
        ) : (
          <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
            {renderFormContent()}
          </View>
        )}
      </Modal>

      {/* Request Dialog */}
      <Modal
        visible={requestDialog.isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeRequestDialog}
      >
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView
            style={styles.flex1}
            behavior="padding"
          >
            <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
              {renderRequestContent()}
            </View>
          </KeyboardAvoidingView>
        ) : (
          <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
            {renderRequestContent()}
          </View>
        )}
      </Modal>

      {/* Delete Dialog */}
      <Modal
        visible={deleteDialog.isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setDeleteDialog({ isOpen: false, id: null, name: '', type: 'store' })
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
              {deleteDialog.type === 'store'
                ? t('تأكيد حذف المتجر')
                : t('تأكيد رفض الطلب')}
            </Text>
            <Text style={[styles.dialogMessage, { color: c.textMuted }]}>
              {deleteDialog.type === 'store'
                ? t('هل أنت متأكد من حذف المتجر')
                : t('هل أنت متأكد من رفض الطلب')}{' '}
              <Text style={{ color: c.primary, fontWeight: '700' }}>
                "{deleteDialog.name}"
              </Text>
              ؟
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
                    id: null,
                    name: '',
                    type: 'store',
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
                  {deleteDialog.type === 'store' ? t('حذف') : t('رفض')}
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
        statusBarTranslucent
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
        statusBarTranslucent
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
  flex1: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  pressed: { opacity: 0.7 },

  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  badge: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitleLine: { width: 20, height: 1 },
  subtitle: { fontSize: 12, fontWeight: '500', flex: 1 },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionBtnOutline: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
  },
  actionBtnOutlineText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  tabsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 4,
    borderWidth: 1,
    borderRadius: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 6,
  },
  errorBannerText: { fontSize: 13, fontWeight: '500' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
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
  searchClearText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: { fontSize: 13, textAlign: 'center' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  storeCard: {
    width: '48%',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  storeCardLink: { flex: 1 },
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

  storeImage: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeImageInner: { width: '100%', height: '100%' },
  storePlaceholder: { fontSize: 56, opacity: 0.4 },

  storeInfo: { padding: 12, gap: 4, position: 'relative' },
  storeInfoLine: {
    position: 'absolute',
    top: 0,
    start: 12,
    width: 30,
    height: 2,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  storePhone: {
    fontSize: 11,
    fontWeight: '600',
  },
  storeRegion: {
    fontSize: 11,
    fontWeight: '500',
  },
  storeDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  requestsList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  requestCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 6,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '700',
  },
  requestPhone: { fontSize: 13, fontWeight: '600' },
  requestRegion: { fontSize: 13 },
  requestDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  requestDate: {
    fontSize: 11,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  requestBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  requestBtnOutline: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBtnOutlineText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  dialogOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
    maxHeight: '90%',
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
  dialogCloseText: { fontSize: 14, fontWeight: '700' },
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
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
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

  formGroup: { marginBottom: 16, gap: 6 },
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

  infoBox: {
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 6,
    marginBottom: 16,
  },
  infoBoxText: {
    fontSize: 12,
    lineHeight: 18,
  },
});