import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import axiosInstance from '@/store/api/axiosInstance';

export default function TrackOrderScreen() {
  const router = useRouter();

  const { theme } = useTheme();
  const c = theme.colors;

  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ============ Search Order ============
  const handleSearch = async () => {
    if (!code.trim()) {
      setError(t('يرجى إدخال كود التتبع'));
      setOrder(null);
      return;
    }

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await axiosInstance.get(
        `/track_order/${code.trim().toUpperCase()}/`
      );
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.error || t('كود التتبع غير صحيح'));
    } finally {
      setIsLoading(false);
    }
  };

  // ============ Status Index ============
  const getStatusIndex = (status) => {
    const steps = ['pending', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  // ============ Status Colors ============
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          color: '#F59E0B',
        };
      case 'shipped':
        return { bg: c.infoBg, color: c.info };
      case 'delivered':
        return { bg: c.successBg, color: c.success };
      case 'cancelled':
        return { bg: c.dangerBg, color: c.danger };
      default:
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          color: '#F59E0B',
        };
    }
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
          <View
            style={[
              styles.headerIconBox,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
              },
            ]}
          >
            <Text style={styles.headerIcon}>📦</Text>
          </View>
          <Text style={[styles.title, { color: c.text }]}>
            {t('تتبع طلبك')}
          </Text>
          <View style={[styles.titleLine, { backgroundColor: c.primary }]} />
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            {t('أدخل كود التتبع الذي حصلت عليه عند الشراء')}
          </Text>
        </View>

        {/* ============ Search Form ============ */}
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: c.surface2,
                color: c.text,
                borderColor: c.border,
              },
            ]}
            placeholder="A3F9B2C1"
            placeholderTextColor={c.textMuted}
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            maxLength={12}
            editable={!isLoading}
            autoCapitalize="characters"
            autoFocus
          />
          <Pressable
            style={({ pressed }) => [
              styles.searchBtn,
              { backgroundColor: c.primary, borderColor: c.primary },
              (pressed || isLoading) && styles.pressed,
            ]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.searchBtnText}>
                🔍 {t('تتبع')}
              </Text>
            )}
          </Pressable>
        </View>

        {/* ============ Error ============ */}
        {error ? (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: c.dangerBg, borderColor: c.danger },
            ]}
          >
            <Text style={[styles.errorText, { color: c.danger }]}>
              ❌ {error}
            </Text>
          </View>
        ) : null}

        {/* ============ Order Result ============ */}
        {order ? (
          <View style={styles.resultContainer}>
            {/* Order Card */}
            <View
              style={[
                styles.card,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              {/* Card Header */}
              <View
                style={[
                  styles.cardHeader,
                  { borderBottomColor: c.border },
                ]}
              >
                <Text style={[styles.cardTitle, { color: c.text }]}>
                  📋 {t('تفاصيل الطلب')} #{order.id}
                </Text>
                <View
                  style={[
                    styles.cardCodeBox,
                    { backgroundColor: c.primaryBg, borderColor: c.primary },
                  ]}
                >
                  <Text style={[styles.cardCodeText, { color: c.primary }]}>
                    🔍 {order.tracking_code}
                  </Text>
                </View>
              </View>

              {/* Status Badge */}
              <View style={styles.statusWrapper}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusStyle(order.status).bg,
                      borderColor: getStatusStyle(order.status).color,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: getStatusStyle(order.status).color,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusStyle(order.status).color },
                    ]}
                  >
                    {order.status_display}
                  </Text>
                </View>
              </View>

              {/* Tracking Steps */}
              <View
                style={[
                  styles.stepsContainer,
                  { backgroundColor: c.surface2, borderColor: c.border },
                ]}
              >
                {/* Step 1: Pending */}
                <View
                  style={[
                    styles.step,
                    getStatusIndex(order.status) >= 0 && styles.stepActive,
                  ]}
                >
                  <View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor:
                          getStatusIndex(order.status) > 0
                            ? c.success
                            : c.surface,
                        borderColor:
                          getStatusIndex(order.status) > 0
                            ? c.success
                            : getStatusIndex(order.status) >= 0
                            ? c.primary
                            : c.border,
                      },
                    ]}
                  >
                    <Text style={styles.stepIconText}>
                      {getStatusIndex(order.status) > 0 ? '✅' : '📝'}
                    </Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, { color: c.text }]}>
                      {t('لم يتم الإرسال بعد')}
                    </Text>
                    <Text style={[styles.stepDesc, { color: c.textMuted }]}>
                      {t('تم استلام طلبك وجاري معالجته')}
                    </Text>
                  </View>
                </View>

                {/* Line 1 */}
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor:
                        getStatusIndex(order.status) >= 1
                          ? c.success
                          : c.border,
                    },
                  ]}
                />

                {/* Step 2: Shipped */}
                <View
                  style={[
                    styles.step,
                    getStatusIndex(order.status) >= 1 && styles.stepActive,
                  ]}
                >
                  <View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor:
                          getStatusIndex(order.status) > 1
                            ? c.success
                            : c.surface,
                        borderColor:
                          getStatusIndex(order.status) > 1
                            ? c.success
                            : getStatusIndex(order.status) >= 1
                            ? c.primary
                            : c.border,
                      },
                    ]}
                  >
                    <Text style={styles.stepIconText}>
                      {getStatusIndex(order.status) > 1 ? '✅' : '🚚'}
                    </Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, { color: c.text }]}>
                      {t('في طريقه إليك')}
                    </Text>
                    <Text style={[styles.stepDesc, { color: c.textMuted }]}>
                      {t('طلبك في الطريق إلى عنوانك')}
                    </Text>
                  </View>
                </View>

                {/* Line 2 */}
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor:
                        getStatusIndex(order.status) >= 2
                          ? c.success
                          : c.border,
                    },
                  ]}
                />

                {/* Step 3: Delivered */}
                <View
                  style={[
                    styles.step,
                    getStatusIndex(order.status) >= 2 && styles.stepActive,
                  ]}
                >
                  <View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor:
                          getStatusIndex(order.status) >= 2
                            ? c.success
                            : c.surface,
                        borderColor:
                          getStatusIndex(order.status) >= 2
                            ? c.success
                            : c.border,
                      },
                    ]}
                  >
                    <Text style={styles.stepIconText}>
                      {getStatusIndex(order.status) >= 2 ? '🎉' : '📦'}
                    </Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, { color: c.text }]}>
                      {t('تم البيع')}
                    </Text>
                    <Text style={[styles.stepDesc, { color: c.textMuted }]}>
                      {t('تم تسليم الطلب بنجاح')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Details */}
              <View
                style={[styles.detailsContainer, { borderTopColor: c.border }]}
              >
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: c.textMuted }]}>
                    👤 {t('اسم الزبون')}
                  </Text>
                  <Text style={[styles.detailValue, { color: c.text }]}>
                    {order.full_name}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: c.textMuted }]}>
                    📞 {t('الهاتف')}
                  </Text>
                  <Text style={[styles.detailValue, { color: c.text }]}>
                    {order.phone}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: c.textMuted }]}>
                    📍 {t('العنوان')}
                  </Text>
                  <Text style={[styles.detailValue, { color: c.text }]}>
                    {order.address}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: c.textMuted }]}>
                    📅 {t('تاريخ الطلب')}
                  </Text>
                  <Text style={[styles.detailValue, { color: c.text }]}>
                    {new Date(order.created_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailRow,
                    styles.detailTotalRow,
                    { borderTopColor: c.border },
                  ]}
                >
                  <Text
                    style={[styles.detailTotalLabel, { color: c.text }]}
                  >
                    💰 {t('الإجمالي')}
                  </Text>
                  <Text
                    style={[styles.detailTotalValue, { color: c.primary }]}
                  >
                    ${order.total}
                  </Text>
                </View>
              </View>

              {/* Products */}
              {order.items && order.items.length > 0 && (
                <View
                  style={[
                    styles.productsContainer,
                    { borderTopColor: c.border },
                  ]}
                >
                  <View style={styles.productsTitleRow}>
                    <View
                      style={[
                        styles.productsTitleBar,
                        { backgroundColor: c.primary },
                      ]}
                    />
                    <Text style={[styles.productsTitle, { color: c.text }]}>
                      📦 {t('منتجات الطلب')}
                    </Text>
                  </View>

                  {order.items.map((item) => (
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
                            style={[styles.qtyText, { color: c.textMuted }]}
                          >
                            × {item.quantity}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.productPrice,
                            { color: c.primary },
                          ]}
                        >
                          ${item.subtotal}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  {
                    backgroundColor: 'transparent',
                    borderColor: c.border,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  setOrder(null);
                  setCode('');
                  setError('');
                }}
              >
                <Text style={[styles.btnText, { color: c.text }]}>
                  🔍 {t('تتبع طلب آخر')}
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
                onPress={() => router.push('/')}
              >
                <Text style={[styles.btnText, { color: '#FFFFFF' }]}>
                  🏠 {t('العودة للرئيسية')}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <BottomTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // ============ Page Header ============
  pageHeader: {
    alignItems: 'center',
    marginBottom: 30,
    gap: 12,
  },
  headerIconBox: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 44 },
  title: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  titleLine: {
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

  // ============ Search Form ============
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 8,
    gap: 8,
    marginBottom: 16,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 4,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
  },
  searchBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.7 },

  // ============ Error ============
  errorBox: {
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ============ Result Card ============
  resultContainer: { gap: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  cardHeader: {
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  cardCodeBox: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
  },
  cardCodeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // ============ Status ============
  statusWrapper: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ============ Steps ============
  stepsContainer: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    opacity: 0.4,
  },
  stepActive: {
    opacity: 1,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconText: { fontSize: 20 },
  stepContent: {
    flex: 1,
    paddingTop: 4,
    gap: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  stepLine: {
    width: 2,
    height: 28,
    marginStart: 23,
  },

  // ============ Details ============
  detailsContainer: {
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'auto',
  },
  detailTotalRow: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  detailTotalLabel: {
    fontSize: 15,
    fontWeight: '900',
  },
  detailTotalValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  // ============ Products ============
  productsContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  productsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  productsTitleBar: { width: 4, height: 18, borderRadius: 2 },
  productsTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  productInfo: { flex: 1, gap: 4 },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  productStore: {
    fontSize: 11,
    fontWeight: '500',
  },
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
  qtyText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  // ============ Actions ============
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});