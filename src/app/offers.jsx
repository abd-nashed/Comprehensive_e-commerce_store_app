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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import { fetchProducts } from '@/store/slices/productsSlice';
import { addToCart } from '@/store/slices/cartSlice';

const API_URL = 'https://abdurrazzaq.pythonanywhere.com';

export default function OffersScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { theme } = useTheme();
  const c = theme.colors;

  const { products, isLoading, error } = useSelector((state) => state.products);

  const { t } = useTranslation();

  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  //   Filter: Only Discounted
  const discountedProducts = products.filter(
    (p) => p.has_discount && p.discount_percent
  );

  //   Search
  const filtered = discountedProducts.filter((p) => {
    const searchLower = search.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const category = (p.category_name || '').toLowerCase();
    return name.includes(searchLower) || category.includes(searchLower);
  });

  //   Loading
  if (isLoading && products.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg }]}>
        <Header />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={c.danger} />
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
        {/*   Header   */}
        <View style={styles.pageHeader}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: c.text }]}>
              💸 {t('العروض')}
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: c.danger },
              ]}
            >
              <Text style={styles.badgeText}>{discountedProducts.length}</Text>
            </View>
          </View>

          <View style={styles.subtitleRow}>
            <View
              style={[styles.subtitleLine, { backgroundColor: c.danger }]}
            />
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              {t('خصومات حصرية على مجموعة مختارة من المنتجات')}
            </Text>
          </View>
        </View>

        {/*   Error   */}
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

        {/*   Search   */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <Text style={[styles.searchIcon, { color: c.textMuted }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder={t('ابحث عن عرض...')}
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

        {/*   Count   */}
        <View style={styles.countRow}>
          <View
            style={[styles.countLine, { backgroundColor: c.danger }]}
          />
          <Text style={[styles.countText, { color: c.textMuted }]}>
            {filtered.length} {t('من')} {discountedProducts.length} {t('عرض')}
          </Text>
        </View>

        {/*   Grid   */}
        {filtered.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              {t('لا توجد عروض حالياً')}
            </Text>
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              {search
                ? t('لا توجد نتائج مطابقة للبحث')
                : t('تابعنا للحصول على أحدث العروض')}
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
              const imageSrc = product.main_image?.startsWith('http')
                ? product.main_image
                : `${API_URL}${product.main_image}`;

              const savings = (
                product.price - product.final_price
              ).toFixed(2);

              return (
                <View
                  key={product.id}
                  style={[
                    styles.offerCard,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.offerCardLink,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => router.push(`/product/${product.id}`)}
                  >
                    {/* Image */}
                    <View
                      style={[
                        styles.offerImage,
                        { backgroundColor: c.surface2 },
                      ]}
                    >
                      {product.main_image && (
                        <Image
                          source={{ uri: imageSrc }}
                          style={styles.offerImageInner}
                          resizeMode="cover"
                        />
                      )}

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

                    {/* Info */}
                    <View style={styles.offerInfo}>
                      <Text
                        style={[styles.offerName, { color: c.text }]}
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

                      {/* Price */}
                      <View style={styles.priceRow}>
                        <Text
                          style={[
                            styles.priceFinal,
                            { color: c.danger },
                          ]}
                        >
                          ${product.final_price}
                        </Text>
                        <Text
                          style={[styles.priceOld, { color: c.textMuted }]}
                        >
                          ${product.price}
                        </Text>
                      </View>

                      {/* Save */}
                      <View
                        style={[
                          styles.saveBadge,
                          {
                            backgroundColor: c.successBg,
                            borderColor: c.success,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.saveBadgeText,
                            { color: c.success },
                          ]}
                        >
                          💰 {t('توفير')} ${savings}
                        </Text>
                      </View>

                      {/* Stock */}
                      <Text
                        style={[styles.stockText, { color: c.textMuted }]}
                      >
                        📦 {product.stock} {t('في المخزون')}
                      </Text>
                    </View>
                  </Pressable>

                  {/* Footer */}
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
                        {product.stock <= 0
                          ? `🛒 ${t('نفد المخزون')}`
                          : `🛒 ${t('أضف للسلة')}`}
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
  scrollContent: { paddingBottom: 20 },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14 },

  //   Page Header
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 8,
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
    minWidth: 40,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitleLine: { width: 20, height: 1 },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    flex: 1,
  },

  //   Error Banner
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

  //   Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
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
  searchClearText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  //   Count
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  countLine: { width: 20, height: 1 },
  countText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  //   Empty
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
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
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
  pressed: { opacity: 0.7 },

  //   Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  offerCard: {
    width: '48%',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  offerCardLink: {
    flex: 1,
  },

  offerImage: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  offerImageInner: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    end: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
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

  offerInfo: {
    padding: 12,
    gap: 6,
  },
  offerName: {
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
  saveBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 2,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
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
});