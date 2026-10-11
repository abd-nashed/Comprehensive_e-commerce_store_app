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
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from '@/store/slices/cartSlice';
import { createOrder, clearOrdersError } from '@/store/slices/ordersSlice';

const API_URL = 'https://abdurrazzaq.pythonanywhere.com';

export default function CartScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { theme } = useTheme();
  const c = theme.colors;

  const { items } = useSelector((state) => state.cart);
  const { isCreating } = useSelector((state) => state.orders);
  const currentUser = useSelector((state) => state.users?.currentUser);

  const { t } = useTranslation();

  const canViewOrders = ['superadmin', 'admin', 'sales', 'store'].includes(
    currentUser?.role
  );

  const [checkoutDialog, setCheckoutDialog] = useState({
    isOpen: false,
    full_name: '',
    phone: '',
    address: '',
  });

  const [successDialog, setSuccessDialog] = useState({
    isOpen: false,
    tracking_code: '',
    order_id: null,
  });

  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    message: '',
  });

  const [copyDialog, setCopyDialog] = useState({
    isOpen: false,
    message: '',
  });

  const [clearCartDialog, setClearCartDialog] = useState({
    isOpen: false,
  });

  //   Calculations
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  //   Handlers
  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleQuantityChange = (id, newQuantity) => {
    dispatch(updateQuantity({ id, quantity: newQuantity }));
  };

  const openClearCartDialog = () => {
    setClearCartDialog({ isOpen: true });
  };

  const confirmClearCart = () => {
    dispatch(clearCart());
    setClearCartDialog({ isOpen: false });
  };

  const openCheckoutDialog = () => {
    dispatch(clearOrdersError());
    setCheckoutDialog({
      isOpen: true,
      full_name: '',
      phone: '',
      address: '',
    });
  };

  const closeCheckoutDialog = () => {
    setCheckoutDialog({
      isOpen: false,
      full_name: '',
      phone: '',
      address: '',
    });
  };

  const handleCheckout = async () => {
    if (!checkoutDialog.full_name.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال اسمك') });
      return;
    }
    if (!checkoutDialog.phone.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال رقم هاتفك') });
      return;
    }
    if (!checkoutDialog.address.trim()) {
      setErrorDialog({ isOpen: true, message: t('يرجى إدخال عنوانك') });
      return;
    }

    const orderItems = items.map((item) => ({
      product_id: item.id,
      product_name: item.name,
      product_price: Number(item.price),
      store_name: item.store_name || '',
      quantity: item.quantity,
    }));

    const result = await dispatch(
      createOrder({
        full_name: checkoutDialog.full_name,
        phone: checkoutDialog.phone,
        address: checkoutDialog.address,
        items: orderItems,
      })
    );

    if (createOrder.fulfilled.match(result)) {
      closeCheckoutDialog();
      setSuccessDialog({
        isOpen: true,
        tracking_code: result.payload.tracking_code,
        order_id: result.payload.id,
      });
    } else {
      setErrorDialog({
        isOpen: true,
        message:
          typeof result.payload === 'string'
            ? result.payload
            : t('فشل إنشاء الطلب. تحقق من البيانات.'),
      });
    }
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(successDialog.tracking_code);
      setCopyDialog({ isOpen: true, message: t('تم نسخ الكود بنجاح') });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleSuccessClose = () => {
    dispatch(clearCart());
    setSuccessDialog({ isOpen: false, tracking_code: '', order_id: null });
    router.push('/');
  };

  //   Empty Cart
  if (items.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg }]}>
        <Header />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {canViewOrders && (
            <View style={styles.pageHeader}>
              <Text style={[styles.title, { color: c.text }]}>
                🛒 {t('السلة')}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.ordersBtn,
                  { borderColor: c.primary },
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/admin/orders')}
              >
                <Text style={[styles.ordersBtnText, { color: c.primary }]}>
                  📋 {t('رؤية الطلبات')}
                </Text>
              </Pressable>
            </View>
          )}

          <View
            style={[
              styles.empty,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              {t('السلة فارغة')}
            </Text>
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              {t('ابدأ بإضافة منتجات للسلة')}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.emptyBtn,
                { backgroundColor: c.primary, borderColor: c.primary },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/categories')}
            >
              <Text style={styles.emptyBtnText}>🛍️ {t('تصفّح الأقسام')}</Text>
            </Pressable>
          </View>
        </ScrollView>

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
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: c.text }]}>
              🛒 {t('السلة')}
            </Text>
            <View style={[styles.badge, { backgroundColor: c.primary }]}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          </View>
          <View style={styles.subtitleRow}>
            <View style={[styles.subtitleLine, { backgroundColor: c.primary }]} />
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              {t('راجع منتجاتك قبل إتمام الشراء')}
            </Text>
          </View>

          {canViewOrders && (
            <Pressable
              style={({ pressed }) => [
                styles.ordersBtn,
                { borderColor: c.primary },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/admin/orders')}
            >
              <Text style={[styles.ordersBtnText, { color: c.primary }]}>
                📋 {t('رؤية الطلبات')}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Cart Items */}
        <View style={styles.itemsList}>
          {items.map((item) => {
            const imageSrc = item.image?.startsWith('http')
              ? item.image
              : `${API_URL}${item.image}`;

            return (
              <View
                key={item.id}
                style={[
                  styles.cartItem,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <View style={styles.itemRow}>
                  <Pressable
                    onPress={() => router.push(`/product/${item.id}`)}
                    style={[
                      styles.itemImage,
                      {
                        backgroundColor: c.surface2,
                        borderColor: c.border,
                      },
                    ]}
                  >
                    {item.image && (
                      <Image
                        source={{ uri: imageSrc }}
                        style={styles.itemImageInner}
                        resizeMode="cover"
                      />
                    )}
                  </Pressable>

                  <View style={styles.itemInfo}>
                    <Pressable
                      onPress={() => router.push(`/product/${item.id}`)}
                    >
                      <Text
                        style={[styles.itemName, { color: c.text }]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                    <Text style={[styles.itemPrice, { color: c.textMuted }]}>
                      ${item.price}
                    </Text>
                    {item.stock <= 5 && item.stock > 0 && (
                      <View
                        style={[
                          styles.warningBadge,
                          {
                            backgroundColor: c.warningBg,
                            borderColor: c.warning,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.warningText,
                            { color: c.warning },
                          ]}
                        >
                          ⚠️ {t('متبقي فقط')} {item.stock}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.removeBtn,
                      {
                        backgroundColor: c.surface2,
                        borderColor: c.border,
                      },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleRemove(item.id)}
                  >
                    <Text style={[styles.removeBtnText, { color: c.textMuted }]}>
                      ✕
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.itemBottomRow}>
                  <View
                    style={[
                      styles.qtyContainer,
                      {
                        backgroundColor: c.surface2,
                        borderColor: c.border,
                      },
                    ]}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.qtyBtn,
                        pressed && styles.pressed,
                      ]}
                      onPress={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Text
                        style={[
                          styles.qtyBtnText,
                          {
                            color:
                              item.quantity <= 1 ? c.textMuted : c.text,
                          },
                        ]}
                      >
                        −
                      </Text>
                    </Pressable>
                    <Text style={[styles.qtyValue, { color: c.text }]}>
                      {item.quantity}
                    </Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.qtyBtn,
                        pressed && styles.pressed,
                      ]}
                      onPress={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock}
                    >
                      <Text
                        style={[
                          styles.qtyBtnText,
                          {
                            color:
                              item.quantity >= item.stock
                                ? c.textMuted
                                : c.text,
                          },
                        ]}
                      >
                        +
                      </Text>
                    </Pressable>
                  </View>

                  <Text style={[styles.subtotal, { color: c.primary }]}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View
          style={[
            styles.summary,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View style={styles.summaryTitleRow}>
            <View
              style={[styles.summaryTitleBar, { backgroundColor: c.primary }]}
            />
            <Text style={[styles.summaryTitle, { color: c.text }]}>
              {t('ملخص السلة')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: c.grayDark }]}>
              {t('عدد المنتجات')}
            </Text>
            <Text style={[styles.summaryValue, { color: c.text }]}>
              {totalItems}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: c.grayDark }]}>
              {t('المجموع الفرعي')}
            </Text>
            <Text style={[styles.summaryValue, { color: c.text }]}>
              ${total.toFixed(2)}
            </Text>
          </View>

          <View
            style={[styles.divider, { backgroundColor: c.border }]}
          />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: c.text }]}>
              {t('الإجمالي')}
            </Text>
            <Text style={[styles.totalValue, { color: c.primary }]}>
              ${total.toFixed(2)}
            </Text>
          </View>

          <View style={styles.actionsCol}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: 'transparent',
                  borderColor: c.danger,
                },
                pressed && styles.pressed,
              ]}
              onPress={openClearCartDialog}
            >
              <Text style={[styles.btnText, { color: c.danger }]}>
                ❌ {t('إلغاء الكل')}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: c.primary,
                  borderColor: c.primary,
                },
                pressed && styles.pressed,
              ]}
              onPress={openCheckoutDialog}
            >
              <Text style={[styles.btnText, { color: '#FFFFFF' }]}>
                ✅ {t('إتمام الشراء')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomTabs />

      {/*   Checkout Dialog   */}
      <Modal
        visible={checkoutDialog.isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeCheckoutDialog}
      >
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView
            style={styles.flex1}
            behavior="padding"
          >
            <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
              {renderCheckoutContent()}
            </View>
          </KeyboardAvoidingView>
        ) : (
          <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
            {renderCheckoutContent()}
          </View>
        )}
      </Modal>

      {/*   Success Dialog   */}
      <Modal
        visible={successDialog.isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleSuccessClose}
      >
        <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
          <View
            style={[
              styles.dialog,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.dialogIcon}>🎉</Text>
            <Text style={[styles.dialogTitle, { color: c.text }]}>
              {t('تم الشراء بنجاح')}
            </Text>

            <Text style={[styles.dialogMessage, { color: c.textMuted }]}>
              {t('سوف يصلك إشعار أو اتصال لتأكيد الاستلام في أقرب وقت.')}
            </Text>

            <View
              style={[
                styles.trackingBox,
                { backgroundColor: c.primaryBg, borderColor: c.primary },
              ]}
            >
              <Text style={[styles.trackingLabel, { color: c.primary }]}>
                🔍 {t('كود تتبع طلبك')}
              </Text>
              <View style={styles.trackingCodeRow}>
                <Text style={[styles.trackingCode, { color: c.primary }]}>
                  {successDialog.tracking_code}
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.copyBtn,
                    {
                      backgroundColor: c.surface,
                      borderColor: c.primary,
                    },
                    pressed && styles.pressed,
                  ]}
                  onPress={handleCopyCode}
                >
                  <Text style={styles.copyBtnText}>📋</Text>
                </Pressable>
              </View>
              <Text style={[styles.trackingHint, { color: c.textMuted }]}>
                💡 {t('احتفظ بهذا الكود لتتبع طلبك')}
              </Text>
            </View>

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
                  {t('العودة للرئيسية')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/*   Copy Dialog   */}
      <Modal
        visible={copyDialog.isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setCopyDialog({ isOpen: false, message: '' })}
      >
        <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
          <View
            style={[
              styles.dialog,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.dialogIcon}>📋</Text>
            <Text style={[styles.dialogTitle, { color: c.text }]}>
              {t('تم النسخ')}
            </Text>
            <Text style={[styles.dialogMessage, { color: c.textMuted }]}>
              {copyDialog.message}
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: c.primary, borderColor: c.primary },
                  pressed && styles.pressed,
                ]}
                onPress={() => setCopyDialog({ isOpen: false, message: '' })}
              >
                <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>
                  {t('حسناً')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/*   Clear Cart Dialog   */}
      <Modal
        visible={clearCartDialog.isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setClearCartDialog({ isOpen: false })}
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
              {t('تأكيد إلغاء الكل')}
            </Text>
            <Text style={[styles.dialogMessage, { color: c.textMuted }]}>
              {t('هل أنت متأكد من إلغاء كل المنتجات؟')}
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
                onPress={() => setClearCartDialog({ isOpen: false })}
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
                onPress={confirmClearCart}
              >
                <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>
                  {t('نعم، احذف الكل')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/*   Error Dialog   */}
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

  //   Checkout Content Renderer
  function renderCheckoutContent() {
    return (
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
            📝 {t('معلومات الطلب')}
          </Text>
          <Pressable
            style={[styles.dialogClose, { borderColor: c.border }]}
            onPress={closeCheckoutDialog}
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
              ℹ️ {t('أدخل بياناتك وسنتواصل معك لتأكيد الطلب')}
            </Text>
          </View>

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
              placeholder={t('أدخل اسمك الكامل')}
              placeholderTextColor={c.textMuted}
              value={checkoutDialog.full_name}
              onChangeText={(text) =>
                setCheckoutDialog({
                  ...checkoutDialog,
                  full_name: text,
                })
              }
              editable={!isCreating}
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
              value={checkoutDialog.phone}
              onChangeText={(text) =>
                setCheckoutDialog({
                  ...checkoutDialog,
                  phone: text,
                })
              }
              keyboardType="phone-pad"
              editable={!isCreating}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: c.grayDark }]}>
              {t('العنوان / الموقع')} *
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
              placeholder={t('المدينة، الحي، الشارع، ...')}
              placeholderTextColor={c.textMuted}
              value={checkoutDialog.address}
              onChangeText={(text) =>
                setCheckoutDialog({
                  ...checkoutDialog,
                  address: text,
                })
              }
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isCreating}
            />
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
              onPress={closeCheckoutDialog}
              disabled={isCreating}
            >
              <Text style={[styles.dialogBtnText, { color: c.grayDark }]}>
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
                (pressed || isCreating) && styles.pressed,
              ]}
              onPress={handleCheckout}
              disabled={isCreating}
            >
              <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>
                {isCreating
                  ? t('جاري الإرسال...')
                  : `✅ ${t('تأكيد الطلب')}`}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex1: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
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
  subtitle: { fontSize: 12, fontWeight: '500' },

  ordersBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 8,
  },
  ordersBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
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
  emptyIcon: { fontSize: 80, opacity: 0.4 },
  emptyTitle: { fontSize: 20, fontWeight: '900' },
  emptyText: { fontSize: 13, textAlign: 'center' },
  emptyBtn: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderRadius: 6,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  //   Cart Items 
  itemsList: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  cartItem: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemImageInner: { width: '100%', height: '100%' },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemPrice: { fontSize: 12, fontWeight: '500' },
  warningBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 999,
    marginTop: 2,
  },
  warningText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 14, fontWeight: '700' },

  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 18, fontWeight: '700' },
  qtyValue: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
  subtotal: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  //   Summary
  summary: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  summaryTitleBar: { width: 4, height: 20, borderRadius: 2 },
  summaryTitle: { fontSize: 16, fontWeight: '700' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 13, fontWeight: '500' },
  summaryValue: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, marginVertical: 4 },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },

  actionsCol: { gap: 8, marginTop: 8 },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  //   Tracking Box
  trackingBox: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 10,
    marginVertical: 12,
    alignItems: 'center',
  },
  trackingLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  trackingCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trackingCode: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtnText: { fontSize: 16 },
  trackingHint: { fontSize: 11, textAlign: 'center' },

  //   Dialogs
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
  dialogBody: { padding: 0 },
  dialogBodyContent: { padding: 20, paddingBottom: 40 },
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
    marginBottom: 16,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
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
    textAlign: 'auto',
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoBox: {
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 6,
    marginBottom: 16,
  },
  infoBoxText: { fontSize: 12, lineHeight: 18 },
});