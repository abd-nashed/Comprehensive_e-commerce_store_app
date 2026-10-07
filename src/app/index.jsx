import { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import BottomTabs from '@/components/BottomTabs'
import Header from '@/components/Header';
import { useTheme } from '@/context/ThemeContext';
import { fetchCategories } from '@/store/slices/categorySlice';

// ⚠️ TODO: استبدل بـ process.env لاحقاً
const API_URL = 'https://abdurrazzaq.pythonanywhere.com';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { theme } = useTheme();
  const c = theme.colors;

  const lang = useSelector((state) => state.lang?.lang || 'ar');
  const { categories, isLoading } = useSelector((state) => state.category);

  // ⚠️ TODO: استبدلها بـ i18n
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // ⭐ آخر 6 أقسام فقط
  const latestCategories = categories.slice(0, 6);

  // ⭐ ألوان ديناميكية
  const dynamicStyles = {
    bg: { backgroundColor: c.bg },
    surface: { backgroundColor: c.surface },
    surface2: { backgroundColor: c.surface2 },
    border: { borderColor: c.border },
    text: { color: c.text },
    textMuted: { color: c.textMuted },
    primary: { color: c.primary },
    primaryBg: { backgroundColor: c.primary },
    primaryBorder: { borderColor: c.primary },
  };

  return (
    <View style={[styles.root, dynamicStyles.bg]}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================
            Hero Section
            ============================================ */}
        <View style={[styles.hero, dynamicStyles.bg]}>
          <View style={styles.heroContainer}>
            {/* Badge */}
            <View
              style={[
                styles.heroBadge,
                dynamicStyles.surface2,
                dynamicStyles.primaryBorder,
              ]}
            >
              <View
                style={[styles.heroBadgeDot, dynamicStyles.primaryBg]}
              />
              <Text style={[styles.heroBadgeText, dynamicStyles.primary]}>
                {t('عروض حصرية هذا الأسبوع')}
              </Text>
            </View>

            {/* Title */}
            <Text style={[styles.heroTitle, dynamicStyles.text]}>
              {t('تسوّق بذكاء')}
            </Text>
            <Text style={[styles.heroTitle, dynamicStyles.text]}>
              {t('واستلم في')}{' '}
              <Text style={dynamicStyles.primary}>{t('أسرع وقت')}</Text>
            </Text>

            {/* Description */}
            <Text style={[styles.heroDescription, dynamicStyles.textMuted]}>
              {t(
                'آلاف المنتجات من أفضل المتاجر، بأسعار تنافسية وتوصيل سريع'
              )}
            </Text>

            {/* Actions */}
            <View style={styles.heroActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.heroBtnPrimary,
                  dynamicStyles.primaryBg,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/stores')}
              >
                <Text style={styles.heroBtnPrimaryText}>
                  {t('ابدأ التسوق الآن')}
                </Text>
                <Text style={styles.heroBtnArrow}>→</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.heroBtnSecondary,
                  dynamicStyles.border,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/categories')}
              >
                <Text style={[styles.heroBtnSecondaryText, dynamicStyles.text]}>
                  {t('تصفّح الأقسام')}
                </Text>
              </Pressable>
            </View>

            {/* Stats */}
            <View style={[styles.heroStats, dynamicStyles.border]}>
              <View style={styles.heroStat}>
                <Text style={[styles.heroStatValue, dynamicStyles.text]}>
                  10K+
                </Text>
                <Text style={[styles.heroStatLabel, dynamicStyles.textMuted]}>
                  {t('منتج')}
                </Text>
              </View>
              <View style={[styles.heroStatDivider, dynamicStyles.border]} />
              <View style={styles.heroStat}>
                <Text style={[styles.heroStatValue, dynamicStyles.text]}>
                  500+
                </Text>
                <Text style={[styles.heroStatLabel, dynamicStyles.textMuted]}>
                  {t('متجر')}
                </Text>
              </View>
              <View style={[styles.heroStatDivider, dynamicStyles.border]} />
              <View style={styles.heroStat}>
                <Text style={[styles.heroStatValue, dynamicStyles.text]}>
                  50K+
                </Text>
                <Text style={[styles.heroStatLabel, dynamicStyles.textMuted]}>
                  {t('زبون سعيد')}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Glow Line */}
          <View style={[styles.heroBottomLine, dynamicStyles.primaryBg]} />
        </View>

        {/* ============================================
            Categories Section
            ============================================ */}
        <View style={[styles.categories, dynamicStyles.bg]}>
          <View style={styles.categoriesContainer}>
            {/* Header */}
            <View style={styles.categoriesHeader}>
              <View style={styles.categoriesHeaderLeft}>
                <View style={styles.categoriesEyebrowRow}>
                  <View
                    style={[styles.categoriesEyebrowLine, dynamicStyles.primaryBg]}
                  />
                  <Text
                    style={[
                      styles.categoriesEyebrow,
                      dynamicStyles.primary,
                    ]}
                  >
                    {t('تصفّح الأقسام')}
                  </Text>
                </View>
                <Text style={[styles.categoriesTitle, dynamicStyles.text]}>
                  {t('اختر من بين مجموعة واسعة من الفئات')}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.categoriesViewAll,
                  dynamicStyles.border,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/categories')}
              >
                <Text style={[styles.categoriesViewAllText, dynamicStyles.text]}>
                  {t('عرض الكل')}
                </Text>
                <Text style={[styles.categoriesViewAllArrow, dynamicStyles.text]}>
                  →
                </Text>
              </Pressable>
            </View>

            {/* Content */}
            {isLoading && categories.length === 0 ? (
              <View style={styles.homeLoading}>
                <ActivityIndicator size="large" color={c.primary} />
                <Text style={[styles.homeLoadingText, dynamicStyles.textMuted]}>
                  {t('جاري التحميل')}...
                </Text>
              </View>
            ) : latestCategories.length === 0 ? (
              <View style={styles.homeEmpty}>
                <Text style={styles.homeEmptyIcon}>📭</Text>
                <Text style={[styles.homeEmptyText, dynamicStyles.textMuted]}>
                  {t('لا توجد أقسام حالياً')}
                </Text>
              </View>
            ) : (
              <View style={styles.categoriesGrid}>
                {latestCategories.map((category) => (
                  <Pressable
                    key={category.id}
                    style={({ pressed }) => [
                      styles.categoryCard,
                      dynamicStyles.surface,
                      dynamicStyles.border,
                      pressed && styles.pressed,
                    ]}
                    onPress={() =>
                      router.push(`/products/${category.id}`)
                    }
                  >
                    <View
                      style={[
                        styles.categoryImage,
                        dynamicStyles.surface2,
                      ]}
                    >
                      {category.image && (
                        <Image
                          source={{
                            uri: category.image?.startsWith('http')
                              ? category.image
                              : `${API_URL}${category.image}`,
                          }}
                          style={styles.categoryImageInner}
                          resizeMode="cover"
                        />
                      )}
                    </View>

                    <View style={styles.categoryInfo}>
                      <Text
                        style={[styles.categoryName, dynamicStyles.text]}
                        numberOfLines={1}
                      >
                        {category.name}
                      </Text>
                      <Text
                        style={[
                          styles.categoryCount,
                          dynamicStyles.textMuted,
                        ]}
                      >
                        <Text style={dynamicStyles.primary}>
                          {category.products_count || 0}
                        </Text>
                        {' '}
                        {t('منتج')}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.categoryHoverLine,
                        dynamicStyles.primaryBg,
                      ]}
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ============================================
            CTA Section
            ============================================ */}
        <View style={[styles.homeCta, dynamicStyles.bg]}>
          <View
            style={[
              styles.homeCtaContainer,
              dynamicStyles.surface,
              dynamicStyles.border,
            ]}
          >
            <Text style={[styles.homeCtaEyebrow, dynamicStyles.primary]}>
              {t('لا تفوت الفرصة')}
            </Text>
            <Text style={[styles.homeCtaTitle, dynamicStyles.text]}>
              {t('عروض حصرية')}{' '}
              <Text style={dynamicStyles.primary}>
                {t('بخصم 30%')}
              </Text>
            </Text>
            <Text style={[styles.homeCtaDescription, dynamicStyles.textMuted]}>
              {t('سارع بالشراء قبل انتهاء العرض')}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.homeCtaBtn,
                dynamicStyles.primaryBg,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/offers')}
            >
              <Text style={styles.homeCtaBtnText}>{t('تسوّق الآن')}</Text>
              <Text style={styles.homeCtaBtnArrow}>→</Text>
            </Pressable>

            <View style={styles.homeCtaVisual}>
              <Text style={styles.homeCtaEmoji}>🎁</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomTabs/>
    </View>
  );
}

// ============================================
// Styles (ثابتة — الألوان ديناميكية داخل المكون)
// ============================================

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 ,},

  // ============ Hero ============
  hero: {
    position: 'relative',
    paddingVertical: 48,
    paddingHorizontal: 20,


  },
  heroContainer: {
    gap: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  heroBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 40,
    letterSpacing: -1,
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 26,
    marginTop: 4,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  heroBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  heroBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroBtnArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  heroBtnSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 6,
    borderWidth: 1,
  },
  heroBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.7 },

  // ============ Stats ============
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
  },
  heroStat: { gap: 2 },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    borderLeftWidth: 1,
  },
  heroBottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },

  // ============ Categories ============
  categories: {
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  categoriesContainer: { gap: 24 },
  categoriesHeader: {
    gap: 12,
  },
  categoriesHeaderLeft: { gap: 8 },
  categoriesEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoriesEyebrowLine: {
    width: 24,
    height: 2,
  },
  categoriesEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  categoriesTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  categoriesViewAll: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 6,
  },
  categoriesViewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesViewAllArrow: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ============ Category Grid ============
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%', // بديل grid-template-columns: repeat(2, 1fr)
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 120,
  },
  categoryImageInner: {
    width: '100%',
    height: '100%',
  },
  categoryInfo: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  categoryHoverLine: {
    height: 3,
    width: '100%',
  },

  // ============ Loading / Empty ============
  homeLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  homeLoadingText: {
    fontSize: 14,
  },
  homeEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  homeEmptyIcon: { fontSize: 56, opacity: 0.5 },
  homeEmptyText: { fontSize: 14 },

  // ============ CTA ============
  homeCta: {
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  homeCtaContainer: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    overflow: 'hidden',
  },
  homeCtaEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  homeCtaTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 36,
  },
  homeCtaDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  homeCtaBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 6,
    marginTop: 8,
  },
  homeCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  homeCtaBtnArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  homeCtaVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    marginTop: 8,
  },
  homeCtaEmoji: {
    fontSize: 100,
  },
});