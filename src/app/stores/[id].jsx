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
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import { addToCart } from '@/store/slices/cartSlice';
import axiosInstance from '@/store/api/axiosInstance';

const API_URL = 'https://abdurrazzaq.pythonanywhere.com';

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id: storeId } = useLocalSearchParams();
  const dispatch = useDispatch();

  const { theme } = useTheme();
  const c = theme.colors;

  const currentUser = useSelector((state) => state.users?.currentUser);
  const { t } = useTranslation();

  const canViewPhone = ['superadmin', 'admin', 'store'].includes(
    currentUser?.role
  );

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storeRes = await axiosInstance.get(`/get_store/${storeId}/`);
        setStore(storeRes.data);

        const productsRes = await axiosInstance.get(
          `/get_products_by_store/${storeId}/`
        );
        setProducts(productsRes.data);
      } catch (err) {
        setError(err.response?.data?.error || t('فشل جلب البيانات'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeId, t]);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (p.name || '').toLowerCase().includes(q);
  });

  if (isLoading) {
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

  if (error || !store) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg }]}>
        <Header />
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>🏪</Text>
          <Text style={[styles.errorTitle, { color: c.text }]}>
            {t('المتجر غير موجود')}
          </Text>
          <Text style={[styles.errorText, { color: c.textMuted }]}>{error}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.errorBtn,
              { backgroundColor: c.primary, borderColor: c.primary },
              pressed && styles.pressed,
            ]}
            onPress={() => router.push('/stores')}
          >
            <Text style={styles.errorBtnText}>{t('العودة للمتاجر')}</Text>
          </Pressable>
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
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            { borderColor: c.border },
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backBtnText, { color: c.textMuted }]}>
            ← {t('عودة')}
          </Text>
        </Pressable>

        {/* Store Card */}
        <View
          style={[
            styles.storeCard,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View
            style={[
              styles.storeCover,
              { backgroundColor: c.primary },
            ]}
          >
            {store.image ? (
              <Image
                source={{
                  uri: store.image?.startsWith('http')
                    ? store.image
                    : `${API_URL}${store.image}`,
                }}
                style={styles.storeCoverImg}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.storeCoverPlaceholder}>🏪</Text>
            )}
          </View>

          <View style={styles.storeInfo}>
            <View style={styles.storeHeader}>
              <View
                style={[
                  styles.storeAvatar,
                  { backgroundColor: c.primary },
                ]}
              >
                <Text style={styles.storeAvatarText}>
                  {store.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.storeName, { color: c.text }]}>
                {store.name}
              </Text>
            </View>

            {store.description && (
              <View
                style={[
                  styles.storeDescBlock,
                  {
                    backgroundColor: c.surface2,
                    borderColor: c.border,
                    borderLeftColor: c.primary,
                  },
                ]}
              >
                <Text style={[styles.storeDesc, { color: c.grayDark }]}>
                  {store.description}
                </Text>
              </View>
            )}

            {/* Contact */}
            <View style={styles.contactGrid}>
              {store.region && (
                <View
                  style={[
                    styles.contactItem,
                    { backgroundColor: c.surface2, borderColor: c.border },
                  ]}
                >
                  <Text style={styles.contactIcon}>📍</Text>
                  <View style={styles.contactTextWrap}>
                    <Text style={[styles.contactLabel, { color: c.textMuted }]}>
                      {t('المنطقة')}
                    </Text>
                    <Text style={[styles.contactValue, { color: c.text }]}>
                      {store.region}
                    </Text>
                  </View>
                </View>
              )}

              {canViewPhone && store.phone && (
                <Pressable
                  style={({ pressed }) => [
                    styles.contactItem,
                    {
                      backgroundColor: c.primaryBg,
                      borderColor: c.primary,
                    },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => Linking.openURL(`tel:${store.phone}`)}
                >
                  <Text style={styles.contactIcon}>📞</Text>
                  <View style={styles.contactTextWrap}>
                    <Text
                      style={[styles.contactLabel, { color: c.primary }]}
                    >
                      {t('رقم الهاتف')}
                    </Text>
                    <Text
                      style={[styles.contactValue, { color: c.primary }]}
                    >
                      {store.phone}
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statItem,
                  { backgroundColor: c.surface2, borderColor: c.border },
                ]}
              >
                <Text style={styles.statIcon}>📦</Text>
                <View style={styles.statTextWrap}>
                  <Text style={[styles.statLabel, { color: c.textMuted }]}>
                    {t('المنتجات')}
                  </Text>
                  <Text style={[styles.statValue, { color: c.text }]}>
                    {products.length}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statItem,
                  { backgroundColor: c.surface2, borderColor: c.border },
                ]}
              >
                <Text style={styles.statIcon}>📅</Text>
                <View style={styles.statTextWrap}>
                  <Text style={[styles.statLabel, { color: c.textMuted }]}>
                    {t('تاريخ الإضافة')}
                  </Text>
                  <Text style={[styles.statValue, { color: c.text }]}>
                    {new Date(store.created_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.contactBtn,
                { backgroundColor: c.primary, borderColor: c.primary },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/contact')}
            >
              <Text style={styles.contactBtnText}>
                📩 {t('تواصل معنا لعرض منتجاتك')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsHeader}>
          <View style={styles.productsTitleRow}>
            <Text style={[styles.productsTitle, { color: c.text }]}>
              📦 {t('منتجات المتجر')}
            </Text>
            <View
              style={[styles.productsBadge, { backgroundColor: c.primary }]}
            >
              <Text style={styles.productsBadgeText}>{products.length}</Text>
            </View>
          </View>
        </View>

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
            placeholder={t('ابحث في منتجات هذا المتجر...')}
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

        {/* Grid */}
        {filtered.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              {search
                ? t('لا توجد نتائج مطابقة')
                : t('لا توجد منتجات في هذا المتجر')}
            </Text>
            {search && (
              <Pressable
                style={({ pressed }) => [
                  styles.emptyBtn,
                  { backgroundColor: c.danger, borderColor: c.danger },
                  pressed && styles.pressed,
                ]}
                onPress={() => setSearch('')}
              >
                <Text style={styles.emptyBtnText}>{t('مسح البحث')}</Text>
              </Pressable>
            )}
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
                              style={[
                                styles.priceFinal,
                                { color: c.primary },
                              ]}
                            >
                              ${product.final_price}
                            </Text>
                            <Text
                              style={[
                                styles.priceOld,
                                { color: c.textMuted },
                              ]}
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

                      <Text
                        style={[styles.stockText, { color: c.textMuted }]}
                      >
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
                        🛒 {t('أضف للسلة')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40, paddingTop: 16 },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  errorIcon: { fontSize: 80, opacity: 0.4 },
  errorTitle: { fontSize: 22, fontWeight: '900' },
  errorText: { fontSize: 13, textAlign: 'center' },
  errorBtn: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderRadius: 6,
  },
  errorBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.7 },

  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  storeCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  storeCover: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeCoverImg: {
    width: '100%',
    height: '100%',
  },
  storeCoverPlaceholder: {
    fontSize: 100,
    opacity: 0.4,
  },
  storeInfo: {
    padding: 20,
    gap: 14,
    marginTop: -50,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  storeAvatar: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeAvatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  storeName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
    flex: 1,
  },

  storeDescBlock: {
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  storeDesc: {
    fontSize: 13,
    lineHeight: 20,
  },

  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  contactIcon: { fontSize: 22 },
  contactTextWrap: { flex: 1, gap: 2 },
  contactLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  statIcon: { fontSize: 24 },
  statTextWrap: { gap: 2 },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  contactBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  productsHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productsTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  productsBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
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
    marginHorizontal: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  emptyIcon: { fontSize: 64, opacity: 0.4 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 6,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: '48%',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productCardLink: { flex: 1 },
  productImage: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  productImageInner: { width: '100%', height: '100%' },
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
  productInfo: { padding: 12, gap: 6 },
  productName: { fontSize: 14, fontWeight: '700' },
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
  cardFooter: { paddingHorizontal: 12, paddingBottom: 12 },
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
});