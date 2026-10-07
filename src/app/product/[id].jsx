import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import { useTheme } from '@/context/ThemeContext';
import { addToCart } from '@/store/slices/cartSlice';
import axiosInstance from '@/store/api/axiosInstance';

const API_URL = 'https://abdurrazzaq.pythonanywhere.com';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id: productId } = useLocalSearchParams();
  const dispatch = useDispatch();

  const { theme } = useTheme();
  const c = theme.colors;

  const { t } = useTranslation();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `/get_product/${productId}/`
        );
        setProduct(response.data);

        const main = response.data.main_image?.startsWith('http')
          ? response.data.main_image
          : `${API_URL}${response.data.main_image}`;
        setActiveImage(main);
      } catch (err) {
        setError(err.response?.data?.error || t('فشل جلب المنتج'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, t]);

  const getAllImages = () => {
    if (!product) return [];
    const images = [];

    if (product.main_image) {
      images.push(
        product.main_image.startsWith('http')
          ? product.main_image
          : `${API_URL}${product.main_image}`
      );
    }

    ['image_1', 'image_2', 'image_3', 'image_4', 'image_5'].forEach((key) => {
      if (product[key]) {
        images.push(
          product[key].startsWith('http')
            ? product[key]
            : `${API_URL}${product[key]}`
        );
      }
    });

    return images;
  };

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

  if (error || !product) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg }]}>
        <Header />
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>🔍</Text>
          <Text style={[styles.errorTitle, { color: c.text }]}>
            {t('المنتج غير موجود')}
          </Text>
          <Text style={[styles.errorText, { color: c.textMuted }]}>{error}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.errorBtn,
              { backgroundColor: c.primary, borderColor: c.primary },
              pressed && styles.pressed,
            ]}
            onPress={() => router.push('/categories')}
          >
            <Text style={styles.errorBtnText}>{t('العودة للأقسام')}</Text>
          </Pressable>
        </View>
        <BottomTabs />
      </View>
    );
  }

  const hasDiscount = product.has_discount && product.discount_percent;
  const allImages = getAllImages();
  const publishedDate = new Date(product.created_at).toLocaleDateString(
    'ar-EG',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const isAvailable = product.is_active && product.stock > 0;

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
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

        {/* Container */}
        <View
          style={[
            styles.container,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          {/* Main Image */}
          <View
            style={[
              styles.mainImageWrapper,
              { backgroundColor: c.surface2, borderColor: c.border },
            ]}
          >
            {activeImage && (
              <Image
                source={{ uri: activeImage }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            )}

            {hasDiscount && (
              <View
                style={[styles.discountBadge, { backgroundColor: c.danger }]}
              >
                <Text style={styles.discountBadgeText}>
                  -{product.discount_percent}%
                </Text>
              </View>
            )}
          </View>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsContainer}
            >
              {allImages.map((img, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.thumbnail,
                    {
                      backgroundColor: c.surface2,
                      borderColor:
                        activeImage === img ? c.primary : c.border,
                    },
                    activeImage === img && styles.thumbnailActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setActiveImage(img)}
                >
                  <Image
                    source={{ uri: img }}
                    style={[
                      styles.thumbnailImg,
                      { opacity: activeImage === img ? 1 : 0.6 },
                    ]}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Name */}
          <View style={[styles.nameBlock, { borderBottomColor: c.border }]}>
            <Text style={[styles.name, { color: c.text }]}>
              {product.name}
            </Text>
            <View
              style={[styles.nameUnderline, { backgroundColor: c.primary }]}
            />
          </View>

          {/* Description */}
          <View
            style={[
              styles.descriptionBlock,
              {
                backgroundColor: c.surface2,
                borderColor: c.border,
                borderLeftColor: c.primary,
              },
            ]}
          >
            <Text style={[styles.blockTitle, { color: c.primary }]}>
              📝 {t('الوصف')}
            </Text>
            <Text style={[styles.description, { color: c.grayDark }]}>
              {product.description || t('لا يوجد وصف لهذا المنتج')}
            </Text>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View
              style={[
                styles.infoItem,
                { backgroundColor: c.surface2, borderColor: c.border },
              ]}
            >
              <Text style={styles.infoIcon}>💰</Text>
              <View style={styles.infoTextWrap}>
                <Text style={[styles.infoLabel, { color: c.textMuted }]}>
                  {t('السعر')}
                </Text>
                {hasDiscount ? (
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceFinal, { color: c.primary }]}>
                      ${product.final_price}
                    </Text>
                    <Text style={[styles.priceOld, { color: c.textMuted }]}>
                      ${product.price}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.priceFinal, { color: c.primary }]}>
                    ${product.price}
                  </Text>
                )}
              </View>
            </View>

            {hasDiscount && (
              <View
                style={[
                  styles.infoItem,
                  { backgroundColor: c.dangerBg, borderColor: c.danger },
                ]}
              >
                <Text style={styles.infoIcon}>💸</Text>
                <View style={styles.infoTextWrap}>
                  <Text style={[styles.infoLabel, { color: c.danger }]}>
                    {t('الخصم')}
                  </Text>
                  <Text
                    style={[styles.infoValueDiscount, { color: c.danger }]}
                  >
                    {product.discount_percent}%
                  </Text>
                </View>
              </View>
            )}

            <View
              style={[
                styles.infoItem,
                { backgroundColor: c.surface2, borderColor: c.border },
              ]}
            >
              <Text style={styles.infoIcon}>📦</Text>
              <View style={styles.infoTextWrap}>
                <Text style={[styles.infoLabel, { color: c.textMuted }]}>
                  {t('المخزون')}
                </Text>
                <Text style={[styles.infoValue, { color: c.text }]}>
                  {product.stock} {t('قطعة')}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.infoItem,
                { backgroundColor: c.surface2, borderColor: c.border },
              ]}
            >
              <Text style={styles.infoIcon}>🏷️</Text>
              <View style={styles.infoTextWrap}>
                <Text style={[styles.infoLabel, { color: c.textMuted }]}>
                  {t('القسم')}
                </Text>
                <Text style={[styles.infoValue, { color: c.text }]}>
                  {product.category_name}
                </Text>
              </View>
            </View>

            {product.store_name && (
              <View
                style={[
                  styles.infoItem,
                  { backgroundColor: c.successBg, borderColor: c.success },
                ]}
              >
                <Text style={styles.infoIcon}>🏪</Text>
                <View style={styles.infoTextWrap}>
                  <Text style={[styles.infoLabel, { color: c.success }]}>
                    {t('المتجر')}
                  </Text>
                  <Text style={[styles.infoValue, { color: c.success }]}>
                    {product.store_name}
                  </Text>
                </View>
              </View>
            )}

            <View
              style={[
                styles.infoItem,
                styles.infoItemDate,
                { backgroundColor: c.surface2, borderColor: c.border },
              ]}
            >
              <Text style={styles.infoIcon}>📅</Text>
              <View style={styles.infoTextWrap}>
                <Text style={[styles.infoLabel, { color: c.textMuted }]}>
                  {t('تاريخ النشر')}
                </Text>
                <Text style={[styles.infoValue, { color: c.text }]}>
                  {publishedDate}
                </Text>
              </View>
            </View>
          </View>

          {/* Add to Cart */}
          <Pressable
            style={({ pressed }) => [
              styles.addCartBtn,
              {
                backgroundColor: isAvailable ? c.primary : c.surface3,
                borderColor: isAvailable ? c.primary : c.border,
              },
              pressed && isAvailable && styles.pressed,
            ]}
            disabled={!isAvailable}
            onPress={() => {
              if (!isAvailable) return;
              dispatch(addToCart(product));
            }}
          >
            <Text
              style={[
                styles.addCartBtnText,
                { color: isAvailable ? '#FFFFFF' : c.textMuted },
              ]}
            >
              {isAvailable ? `🛒 ${t('أضف للسلة')}` : `❌ ${t('غير متاح')}`}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  loadingText: { fontSize: 14 },
  errorIcon: { fontSize: 80, opacity: 0.4 },
  errorTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
  },
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
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },

  mainImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    end: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  thumbnailsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 2,
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderWidth: 3,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },

  nameBlock: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    position: 'relative',
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 32,
  },
  nameUnderline: {
    position: 'absolute',
    bottom: -1,
    start: 0,
    width: 80,
    height: 2,
  },

  descriptionBlock: {
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
    gap: 8,
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 13,
    lineHeight: 22,
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  infoItemDate: {
    width: '100%',
  },
  infoIcon: { fontSize: 24 },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoValueDiscount: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
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

  addCartBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addCartBtnText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});