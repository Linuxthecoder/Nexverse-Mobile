import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated, Image } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Colors } from '../../constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import LucideIcon from '@/components/LucideIcon';

// Constants
const GOLD = '#D4AF37';
const STAR_COUNT = 100;
const VERSION = 'v3.3';

// Feature data structure for easier maintenance
const FEATURES = [
  {
    icon: 'zap',
    iconColor: GOLD,
    title: 'Lightning Fast Performance',
    items: [
      'Instant message delivery and real-time updates.',
      'Blazing fast file transfers and media sharing.',
      'Smooth animations and seamless navigation.',
      'Zero lag, even with large conversations.',
    ],
  },
  {
    icon: 'message-circle',
    iconColor: GOLD,
    title: 'Enhanced Chat Experience',
    items: [
      'Improved typing indicators and read receipts.',
      'Better file sharing with preview support.',
      'Smarter notifications and message threading.',
    ],
  },
  {
    icon: 'shield',
    iconColor: GOLD,
    title: 'Enhanced Security & Privacy',
    items: [
      'Fixed critical security vulnerabilities.',
      'Stronger encryption for all your messages.',
      'Better session management and protection.',
      'Your privacy is our top priority.',
    ],
  },
  {
    icon: 'settings',
    iconColor: '#a855f7',
    title: 'Cleaner Interface',
    items: [
      'Streamlined settings for easier customization.',
      'More intuitive navigation and controls.',
      'Beautiful themes and smooth transitions.',
    ],
  },
] as const;

// Star generation helper
const generateStars = () =>
  Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: new Animated.Value(Math.random() * 0.6 + 0.4),
    blinkSpeed: Math.random() * 2000 + 1000,
  }));

// Separate star component for better performance
const Star = React.memo<{ star: ReturnType<typeof generateStars>[0]; isDark: boolean }>(
  ({ star, isDark }) => (
    <Animated.View
      style={[
        styles.star,
        {
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          opacity: star.opacity,
          backgroundColor: isDark ? '#fff' : '#ccc',
        },
      ]}
    />
  )
);

// Feature section component
const FeatureSection = React.memo<{
  feature: typeof FEATURES[number];
  textColor: string;
  subtextColor: string;
}>(({ feature, textColor, subtextColor }) => (
  <View style={styles.featureSection}>
    <View style={styles.featureHeader}>
      <LucideIcon name={feature.icon} color={feature.iconColor} size={20} />
      <Text style={[styles.featureTitle, { color: textColor }]}>{feature.title}</Text>
    </View>
    <View style={styles.featureList}>
      {feature.items.map((item, index) => (
        <Text key={index} style={[styles.featureItem, { color: subtextColor }]}>
          • {item}
        </Text>
      ))}
    </View>
  </View>
));

export default function NexverseScreen() {
  const { theme } = useThemeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [starPositions] = useState(generateStars);
  const animationsStarted = useRef(false);

  // Memoize theme colors
  const themeColors = Colors[theme];

  const colors = useMemo(() => ({
    background: themeColors.background,
    text: themeColors.text,
    subtext: themeColors.icon,
    border: themeColors.border,
    logoGlowBg: theme === 'dark' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.15)',
    logoGlowBorder: theme === 'dark' ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.4)',
    buttonBg: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    buttonBorder: themeColors.border,
    modalBg: themeColors.background,
  }), [theme, themeColors]);

  // Optimize star animation with cleanup
  useEffect(() => {
    if (animationsStarted.current) return;
    animationsStarted.current = true;

    const animations = starPositions.map((star) => {
      const blink = () => {
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.3 + 0.2,
            duration: star.blinkSpeed,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.6 + 0.7,
            duration: star.blinkSpeed,
            useNativeDriver: true,
          }),
        ]).start(() => blink());
      };
      blink();
      return star.opacity;
    });

    return () => {
      // Stop all animations on unmount
      animations.forEach(anim => anim.stopAnimation());
    };
  }, [starPositions]);

  // Memoized callbacks
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const isDark = theme === 'dark';

  return (
    <ScreenWrapper bg={colors.background}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Animated Starfield Background */}
        <View style={styles.starfield}>
          {starPositions.map((star, i) => (
            <Star key={i} star={star} isDark={isDark} />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo with Glassmorphic Effect */}
            <View style={styles.logoContainer}>
              <View
                style={[
                  styles.logoGlow,
                  {
                    backgroundColor: colors.logoGlowBg,
                    borderColor: colors.logoGlowBorder,
                  },
                ]}
              >
                <LucideIcon name="message-square" color={GOLD} size={48} />
              </View>
            </View>

            {/* Headline */}
            <View style={styles.headlineContainer}>
              <Text style={[styles.welcomeText, { color: colors.subtext }]}>
                Welcome to
              </Text>
              <Image
                source={
                  theme === 'dark'
                    ? require('../../assets/images/nexverse-white.png')
                    : require('../../assets/images/nexverse-black.png')
                }
                style={styles.headerImage}
                resizeMode="contain"
              />
              <Text style={[styles.subtitle, { color: colors.subtext }]}>
                Select a conversation to begin a private, encrypted journey.
              </Text>
            </View>

            {/* What's New Button */}
            <TouchableOpacity
              style={[
                styles.whatsNewButton,
                {
                  backgroundColor: colors.buttonBg,
                  borderColor: colors.buttonBorder,
                },
              ]}
              onPress={openModal}
              activeOpacity={0.8}
            >
              <LucideIcon name="sparkles" color="#fbbf24" size={20} />
              <Text style={[styles.whatsNewText, { color: colors.text }]}>
                What's New in {VERSION}
              </Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalOpen}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.modalTitleContainer}>
                <LucideIcon name="sparkles" color="#fbbf24" size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  What's New in {VERSION}
                </Text>
              </View>
              <TouchableOpacity onPress={closeModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <LucideIcon name="x" color={colors.subtext} size={24} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {FEATURES.map((feature, index) => (
                <FeatureSection
                  key={index}
                  feature={feature}
                  textColor={colors.text}
                  subtextColor={colors.subtext}
                />
              ))}

              <View style={[styles.noteContainer, { borderTopColor: colors.border }]}>
                <Text style={[styles.noteText, { color: colors.subtext }]}>
                  We're constantly improving your NexVerse experience. Stay tuned for more updates!
                </Text>
              </View>
            </ScrollView>

            {/* Got It Button */}
            <TouchableOpacity
              style={[styles.gotItButton, { backgroundColor: GOLD }]}
              onPress={closeModal}
              activeOpacity={0.8}
            >
              <Text style={styles.gotItButtonText}>Got it! 👍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    borderRadius: 50,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 500,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoGlow: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 16,
  },
  headerImage: {
    width: 200,
    height: 50,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  whatsNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  whatsNewText: {
    fontSize: 16,
    fontWeight: '600',
  },
  newBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  newBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 20,
  },
  featureSection: {
    marginBottom: 24,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  featureList: {
    paddingLeft: 32,
    gap: 6,
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  noteContainer: {
    paddingTop: 20,
    marginTop: 8,
    borderTopWidth: 1,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  gotItButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gotItButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});