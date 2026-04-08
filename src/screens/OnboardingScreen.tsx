import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Fonts } from '../theme';
import { logOnboardingComplete } from '../services/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = '@sonata_onboarded';

interface Props {
  onDone: () => void;
}

interface Slide {
  icon: string;
  iconColor: string;
  titleKey: string;
  bodyKey: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'music-circle',
    iconColor: Colors.primary,
    titleKey: 'onboard_slide1_title',
    bodyKey: 'onboard_slide1_body',
  },
  {
    icon: 'library-music',
    iconColor: '#6B7ED5',
    titleKey: 'onboard_slide2_title',
    bodyKey: 'onboard_slide2_body',
  },
  {
    icon: 'heart-multiple',
    iconColor: Colors.heart,
    titleKey: 'onboard_slide3_title',
    bodyKey: 'onboard_slide3_body',
  },
];

export default function OnboardingScreen({ onDone }: Props) {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalPages = SLIDES.length + 1; // slides + permission page

  const goToPage = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < totalPages - 1) {
      goToPage(currentIndex + 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    logOnboardingComplete().catch(() => {});
    onDone();
  };

  const handleGrantPermission = async () => {
    if (Platform.OS === 'android') {
      const sdkInt = Platform.Version as number;
      const permission =
        sdkInt >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      await PermissionsAndroid.request(permission);
    }
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    logOnboardingComplete().catch(() => {});
    onDone();
  };

  const isLastPage = currentIndex === totalPages - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Scrollable slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {/* Info slides */}
        {SLIDES.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <View style={[styles.iconContainer, { backgroundColor: slide.iconColor + '18' }]}>
              <Icon name={slide.icon} size={80} color={slide.iconColor} />
            </View>
            <Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
            <Text style={styles.slideBody}>{t(slide.bodyKey)}</Text>
          </View>
        ))}

        {/* Permission slide */}
        <View style={styles.slide}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '18' }]}>
            <Icon name="shield-music" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.slideTitle}>{t('onboard_perm_title')}</Text>
          <Text style={styles.slideBody}>{t('onboard_perm_body')}</Text>
          <TouchableOpacity style={styles.permButton} onPress={handleGrantPermission}>
            <Icon name="check-circle-outline" size={20} color={Colors.white} style={styles.permIcon} />
            <Text style={styles.permButtonText}>{t('onboard_perm_btn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        {!isLastPage ? (
          <>
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('onboard_skip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
              <Text style={styles.nextText}>
                {currentIndex === totalPages - 2
                  ? t('onboard_start')
                  : t('onboard_next')}
              </Text>
              <Icon name="arrow-right" size={18} color={Colors.white} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>{t('onboard_skip')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  slideTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  slideBody: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  permButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    marginTop: Spacing.xxxl,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  permIcon: {
    marginRight: Spacing.sm,
  },
  permButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.white,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 22,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  skipBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  skipText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xs,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  nextText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
});
