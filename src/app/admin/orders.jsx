import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import {
  fetchOrders,
  updateOrderStatus,
  deleteOrder,
  deleteAllOrders,
  fetchDailySales,
  clearOrdersError,
} from '@/store/slices/ordersSlice';

export default function AdminOrdersScreen() {
  const dispatch = useDispatch();

  const { theme } = useTheme();
  const c = theme.colors;

  const { orders, isLoading, error, dailySales } = useSelector(
    (state) => state.orders
  );
  const currentUser = useSelector((state) => state.users?.currentUser);

  const { t } = useTranslation();

  const canManage = ['superadmin', 'admin', 'sales'].includes(
    currentUser?.role
  );
  const canViewSales = ['superadmin', 'admin'].includes(currentUser?.role);
  const canDeleteAll = ['superadmin', 'admin'].includes(currentUser?.role);

  const [search, setSearch] = useState('');

  const [productsDialog, setProductsDialog] = useState({
    isOpen: false,
    order: null,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    id: null,
    name: '',
  });

  const [deleteAllDialog, setDeleteAllDialog] = useState({
    isOpen: false,
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
    if (canManage) dispatch(fetchOrders());
  }, [dispatch, canManage]);

  useEffect(() => {
    if (canViewSales) dispatch(fetchDailySales());
  }, [dispatch, canViewSales]);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      (o.full_name || '').toLowerCase().includes(q) ||
      (o.phone || '').toLowerCase().includes(q) ||
      (o.tracking_code || '').toLowerCase().includes(q)
    );
  });

  const handleUpdateStatus = async (id, status) => {
    const result = await dispatch(updateOrderStatus({ id, status }));

    if (updateOrderStatus.fulfilled.match(result)) {
      setSuccessDialog({
        isOpen: true,
        message: t('تم تحديث حالة الطلب'),
      });
      if (canViewSales) dispatch(fetchDailySales());
    } else {
      setErrorDialog({ isOpen: true, message: t('فشل التحديث') });
    }
  };

  const openDeleteDialog = (order) => {
    setDeleteDialog({
      isOpen: true,
      id: order.id,
      name: order.full_name,
    });
  };

  const confirmDelete = async () => {
    const id = deleteDialog.id;
    setDeleteDialog({ isOpen: false, id: null, name: '' });

    const result = await dispatch(deleteOrder(id));
    if (deleteOrder.fulfilled.match(result)) {
      setSuccessDialog({ isOpen: true, message: t('تم حذف الطلب') });
    } else {
      setErrorDialog({ isOpen: true, message: t('فشل الحذف') });
    }
  };

  const openDeleteAllDialog = () => setDeleteAllDialog({ isOpen: true });

  const confirmDeleteAll = async () => {
    setDeleteAllDialog({ isOpen: false });
    const result = await dispatch(deleteAllOrders());
    if (deleteAllOrders.fulfilled.match(result)) {
      setSuccessDialog({
        isOpen: true,
        message: `${t('تم حذف')} ${result.payload.deleted_count} ${t(
          'طلب بنجاح'
        )}`,
      });
    } else {
      setErrorDialog({ isOpen: true, message: t('فشل حذف الطلبات') });
    }
  };

  const totalSevenDays = dailySales.reduce(
    (sum, day) => sum + (day.total || 0),
    0
  );

  // No Access
  if (!canManage) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg }]}>
        <Header />
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>🚫</Text>
          <Text style={[styles.errorTitle, { color: c.text }]}>
            {t('غير مصرح لك بالوصول')}
          </Text>
        </View>
        <BottomTabs />
      </View>
    );
  }

  // Loading
  if (isLoading && orders.length === 0) {
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
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: c.text }]}>
              📋 {t('الطلبات')}
            </Text>
            <View style={[styles.badge, { backgroundColor: c.primary }]}>
              <Text style={styles.badgeText}>{orders.length}</Text>
            </View>
          </View>
          <View style={styles.subtitleRow}>
            <View style={[styles.subtitleLine, { backgroundColor: c.primary }]} />
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              {t('إدارة طلبات الزبائن وتتبع حالتها')}
            </Text>
          </View>

          {canDeleteAll && orders.length > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.deleteAllBtn,
                { borderColor: c.danger },
                pressed && styles.pressed,
              ]}
              onPress={openDeleteAllDialog}
            >
              <Text style={[styles.deleteAllBtnText, { color: c.danger }]}>
                🗑️ {t('حذف كل الطلبات')}
              </Text>
            </Pressable>
          )}
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
            placeholder={t('ابحث بالاسم أو الرقم أو كود التتبع...')}
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

        {/* Empty */}
        {filtered.length === 0 ? (
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
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              {search
                ? t('لا توجد نتائج مطابقة للبحث')
                : t('لم يستقبل الموقع طلبات بعد')}
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {filtered.map((order) => {
              const isPending = order.status === 'pending';
              const isShipped = order.status === 'shipped';
              const isDelivered = order.status === 'delivered';

              const statusColors = {
                pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' },
                shipped: { bg: c.infoBg, color: c.info },
                delivered: { bg: c.successBg, color: c.success },
                cancelled: { bg: c.dangerBg, color: c.danger },
              };
              const statusStyle =
                statusColors[order.status] || statusColors.pending;

              return (
                <View
                  key={order.id}
                  style={[
                    styles.orderCard,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.orderUserRow}>
                      <View
                        style={[
                          styles.orderAvatar,
                          { backgroundColor: c.primary },
                        ]}
                      >
                        <Text style={styles.orderAvatarText}>
                          {order.full_name?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.orderUserInfo}>
                        <Text style={[styles.orderName, { color: c.text }]}>
                          {order.full_name}
                        </Text>
                        <Text style={[styles.orderMeta, { color: c.textMuted }]}>
                          📞 {order.phone}
                        </Text>
                        <Text style={[styles.orderMeta, { color: c.textMuted }]}>
                          🔍 {order.tracking_code}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusStyle.bg,
                          borderColor: statusStyle.color,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: statusStyle.color }]}
                      >
                        {order.status_display}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.addressBox,
                      {
                        backgroundColor: c.surface2,
                        borderLeftColor: c.primary,
                      },
                    ]}
                  >
                    <Text style={[styles.addressText, { color: c.grayDark }]}>
                      📍 {order.address}
                    </Text>
                  </View>

                  <View style={styles.orderFooter}>
                    <View style={styles.orderDateTotal}>
                      <Text style={[styles.orderDate, { color: c.textMuted }]}>
                        📅{' '}
                        {new Date(order.created_at).toLocaleDateString(
                          'ar-EG',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </Text>
                      <Text style={[styles.orderTotal, { color: c.primary }]}>
                        ${order.total}
                      </Text>
                    </View>

                    <View style={styles.orderActions}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.actionBtn,
                          { borderColor: c.border },
                          pressed && styles.pressed,
                        ]}
                        onPress={() =>
                          setProductsDialog({ isOpen: true, order })
                        }
                      >
                        <Text
                          style={[
                            styles.actionBtnText,
                            { color: c.textMuted },
                          ]}
                        >
                          📦 {t('عرض المنتجات')}
                        </Text>
                      </Pressable>

                      {isPending && (
                        <Pressable
                          style={({ pressed }) => [
                            styles.actionBtn,
                            {
                              backgroundColor: c.info,
                              borderColor: c.info,
                            },
                            pressed && styles.pressed,
                          ]}
                          onPress={() =>
                            handleUpdateStatus(order.id, 'shipped')
                          }
                        >
                          <Text
                            style={[
                              styles.actionBtnText,
                              { color: '#FFFFFF' },
                            ]}
                          >
                            🚚 {t('تم الإرسال')}
                          </Text>
                        </Pressable>
                      )}

                      {isShipped && (
                        <Pressable
                          style={({ pressed }) => [
                            styles.actionBtn,
                            {
                              backgroundColor: c.success,
                              borderColor: c.success,
                            },
                            pressed && styles.pressed,
                          ]}
                          onPress={() =>
                            handleUpdateStatus(order.id, 'delivered')
                          }
                        >
                          <Text
                            style={[
                              styles.actionBtnText,
                              { color: '#FFFFFF' },
                            ]}
                          >
                            ✅ {t('تم البيع')}
                          </Text>
                        </Pressable>
                      )}

                      {isDelivered && (
                        <View
                          style={[
                            styles.doneLabel,
                            {
                              backgroundColor: c.successBg,
                              borderColor: c.success,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.doneText,
                              { color: c.success },
                            ]}
                          >
                            ✅ {t('تم البيع')}
                          </Text>
                        </View>
                      )}

                      <Pressable
                        style={({ pressed }) => [
                          styles.deleteBtn,
                          { borderColor: c.danger },
                          pressed && styles.pressed,
                        ]}
                        onPress={() => openDeleteDialog(order)}
                      >
                        <Text style={[styles.deleteBtnText, { color: c.danger }]}>
                          🗑️
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Daily Sales */}
        {canViewSales && (
          <View
            style={[
              styles.salesSection,
              { backgroundColor: c.surface, borderColor: c.success },
            ]}
          >
            <View style={styles.salesHeader}>
              <View style={styles.salesTitleRow}>
                <View
                  style={[styles.salesTitleBar, { backgroundColor: c.success }]}
                />
                <Text style={[styles.salesTitle, { color: c.text }]}>
                  💰 {t('مبيعات آخر 7 أيام')}
                </Text>
              </View>
              <View
                style={[
                  styles.salesHint,
                  { backgroundColor: c.surface2, borderColor: c.border },
                ]}
              >
                <Text style={[styles.salesHintText, { color: c.textMuted }]}>
                  {t('تُحذف تلقائيًا بعد 7 أيام')}
                </Text>
              </View>
            </View>

            {dailySales.length === 0 ? (
              <View
                style={[
                  styles.salesEmpty,
                  { backgroundColor: c.surface2, borderColor: c.border },
                ]}
              >
                <Text style={[styles.salesEmptyText, { color: c.textMuted }]}>
                  {t('لا توجد مبيعات مسجّلة')}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.salesGrid}>
                  {dailySales.map((day, index) => {
                    const isToday =
                      new Date(day.date).toDateString() ===
                      new Date().toDateString();

                    return (
                      <View
                        key={index}
                        style={[
                          styles.salesCard,
                          {
                            backgroundColor: isToday
                              ? c.successBg
                              : c.surface2,
                            borderColor: isToday ? c.success : c.border,
                            borderLeftColor: c.success,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.salesDate,
                            { color: c.textMuted },
                          ]}
                        >
                          {isToday && '🔴 '}
                          {new Date(day.date).toLocaleDateString('ar-EG', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </Text>
                        <Text
                          style={[
                            styles.salesTotal,
                            { color: c.success },
                          ]}
                        >
                          ${day.total.toFixed(2)}
                        </Text>
                        <Text
                          style={[
                            styles.salesCount,
                            { color: c.textMuted },
                          ]}
                        >
                          📦 {day.orders_count} {t('طلب')}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View
                  style={[
                    styles.grandTotal,
                    { backgroundColor: c.success },
                  ]}
                >
                  <Text style={styles.grandTotalLabel}>
                    {t('إجمالي 7 أيام')}
                  </Text>
                  <Text style={styles.grandTotalValue}>
                    ${totalSevenDays.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <BottomTabs />

      {/* Products Dialog */}
      <Modal
        visible={productsDialog.isOpen && !!productsDialog.order}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setProductsDialog({ isOpen: false, order: null })
        }
      >
        <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
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
                📦 {t('منتجات الطلب')} #{productsDialog.order?.id}
              </Text>
              <Pressable
                style={[styles.dialogClose, { borderColor: c.border }]}
                onPress={() =>
                  setProductsDialog({ isOpen: false, order: null })
                }
              >
                <Text style={[styles.dialogCloseText, { color: c.textMuted }]}>
                  ✕
                </Text>
              </Pressable>
            </View>

            <ScrollView style={styles.dialogBodyContent}>
              {productsDialog.order?.items?.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.productItem,
                    {
                      backgroundColor: c.surface2,
                      borderColor: c.border,
                    },
                  ]}
                >
                  <View style={styles.productInfo}>
                    <Text
                      style={[styles.productName, { color: c.text }]}
                      numberOfLines={1}
                    >
                      {item.product_name}
                    </Text>
                    {item.store_name && (
                      <Text
                        style={[
                          styles.productStore,
                          { color: c.textMuted },
                        ]}
                      >
                        🏪 {item.store_name}
                      </Text>
                    )}
                  </View>
                  <View style={styles.productDetails}>
                    <View
                      style={[
                        styles.qtyBadge,
                        {
                          backgroundColor: c.surface,
                          borderColor: c.border,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.qtyBadgeText, { color: c.textMuted }]}
                      >
                        × {item.quantity}
                      </Text>
                    </View>
                    <Text style={[styles.productPrice, { color: c.primary }]}>
                      ${item.subtotal}
                    </Text>
                  </View>
                </View>
              ))}

              <View
                style={[
                  styles.productsTotal,
                  { backgroundColor: c.primaryBg, borderColor: c.primary },
                ]}
              >
                <Text style={[styles.productsTotalLabel, { color: c.primary }]}>
                  {t('الإجمالي')}
                </Text>
                <Text style={[styles.productsTotalValue, { color: c.primary }]}>
                  ${productsDialog.order?.total}
                </Text>
              </View>
            </ScrollView>
          </View>
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
              {t('هل أنت متأكد من حذف طلب')}{' '}
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

      {/* Delete All Dialog */}
      <Modal
        visible={deleteAllDialog.isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteAllDialog({ isOpen: false })}
      >
        <View style={[styles.dialogOverlay, { backgroundColor: c.overlay }]}>
          <View
            style={[
              styles.dialog,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.dialogIcon}>🚨</Text>
            <Text style={[styles.dialogTitle, { color: c.text }]}>
              {t('تأكيد حذف كل الطلبات')}
            </Text>
            <Text style={[styles.dialogMessage, { color: c.textMuted }]}>
              {t('هل أنت متأكد من حذف كل الطلبات')} ({orders.length})؟
              {'\n'}
              <Text style={{ color: c.danger, fontWeight: '700' }}>
                {t('لا يمكن التراجع عن هذا الإجراء')}!
              </Text>
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: c.surface2, borderColor: c.border },
                  pressed && styles.pressed,
                ]}
                onPress={() => setDeleteAllDialog({ isOpen: false })}
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
                onPress={confirmDeleteAll}
              >
                <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>
                  🗑️ {t('حذف الكل')}
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
  pressed: { opacity: 0.7 },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  errorIcon: { fontSize: 80, opacity: 0.4 },
  errorTitle: { fontSize: 22, fontWeight: '900' },

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

  deleteAllBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 8,
  },
  deleteAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center' },

  ordersList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  orderCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
    gap: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  orderUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  orderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  orderUserInfo: { flex: 1, gap: 2 },
  orderName: { fontSize: 15, fontWeight: '700' },
  orderMeta: { fontSize: 11, fontWeight: '500' },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  addressBox: {
    padding: 10,
    borderLeftWidth: 3,
    borderRadius: 6,
  },
  addressText: { fontSize: 12, lineHeight: 18 },

  orderFooter: { gap: 10 },
  orderDateTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  orderDate: { fontSize: 11, fontWeight: '500' },
  orderTotal: { fontSize: 20, fontWeight: '900' },

  orderActions: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 14 },
  doneLabel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Daily Sales
  salesSection: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  salesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  salesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  salesTitleBar: { width: 4, height: 22, borderRadius: 2 },
  salesTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  salesHint: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 999,
  },
  salesHintText: { fontSize: 10, fontWeight: '500' },

  salesEmpty: {
    padding: 30,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
  },
  salesEmptyText: { fontSize: 13 },

  salesGrid: { gap: 10 },
  salesCard: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
    gap: 4,
  },
  salesDate: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  salesTotal: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
    marginVertical: 4,
  },
  salesCount: { fontSize: 11, fontWeight: '500' },

  grandTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10,
    gap: 10,
  },
  grandTotalLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  grandTotalValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
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
    maxHeight: '85%',
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
  dialogBodyContent: { padding: 20 },
  dialogActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
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

  // Products in Order
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 8,
  },
  productInfo: { flex: 1, gap: 4 },
  productName: { fontSize: 13, fontWeight: '700' },
  productStore: { fontSize: 11 },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  qtyBadgeText: { fontSize: 11, fontWeight: '700' },
  productPrice: { fontSize: 14, fontWeight: '900' },

  productsTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 10,
  },
  productsTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  productsTotalValue: { fontSize: 20, fontWeight: '900' },
});