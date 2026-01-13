/**
 * WhatsApp-style color theme for Nexverse
 */

import { Platform } from 'react-native';

// WhatsApp Color Palette
export const WhatsAppColors = {
  // Primary colors
  teal: '#D4AF37',
  tealDark: '#AA8C2C',
  green: '#D4AF37',
  blue: '#34B7F1',

  // Message bubbles
  incomingBubble: '#FFFFFF',
  outgoingBubble: '#F5E8C4', // Gold bubble

  // Backgrounds
  chatBackground: '#ECE5DD', // WhatsApp chat pattern background
  screenBackground: '#FFFFFF',
  settingsBackground: '#F2F2F7', // iOS style

  // Text colors
  textPrimary: '#000000',
  textSecondary: '#667781',
  textTertiary: '#8696A0',

  // UI elements
  border: '#E9EDEF',
  divider: '#E9EDEF',
  unreadBadge: '#D4AF37',
  timestamp: '#667781',

  // Status indicators
  checkmarkSingle: '#8696A0',
  checkmarkDouble: '#53BDEB',
  checkmarkRead: '#53BDEB',

  // Input
  inputBackground: '#F0F2F5',
  inputBorder: '#D1D7DB',

  // Icons
  iconActive: '#D4AF37',
  iconInactive: '#8696A0',
};

const LightColors = {
  text: '#000000',
  background: '#FFFFFF',
  tint: WhatsAppColors.teal,
  icon: WhatsAppColors.textSecondary,
  tabIconDefault: WhatsAppColors.iconInactive,
  tabIconSelected: WhatsAppColors.teal,
  border: WhatsAppColors.border,

  // Chat specific
  chatBackground: WhatsAppColors.chatBackground,
  incomingMessage: WhatsAppColors.incomingBubble,
  outgoingMessage: WhatsAppColors.outgoingBubble,
  messageText: WhatsAppColors.textPrimary,
  timestamp: WhatsAppColors.timestamp,

  // UI elements
  unreadBadge: WhatsAppColors.unreadBadge,
  checkmark: WhatsAppColors.checkmarkDouble,
  inputBackground: WhatsAppColors.inputBackground,
  divider: WhatsAppColors.divider,
  error: '#EF4444',
};

const DarkColors = {
  text: '#E9EDEF',
  background: '#080f14ff',
  tint: WhatsAppColors.green,
  icon: '#8696A0',
  tabIconDefault: '#8696A0',
  tabIconSelected: WhatsAppColors.green,
  border: '#2A3942',

  // Chat specific
  chatBackground: '#0B141A',
  incomingMessage: '#1F2C34',
  outgoingMessage: '#423611',
  messageText: '#E9EDEF',
  timestamp: '#8696A0',

  // UI elements
  unreadBadge: WhatsAppColors.green,
  checkmark: '#53BDEB',
  inputBackground: '#1F2C34',
  divider: '#2A3942',
  error: '#EF4444',
};

// Define types for Colors
type ColorTheme = typeof LightColors;

// Proxy handler to map any theme name to light or dark
const ColorsProxy = new Proxy({
  light: LightColors,
  dark: DarkColors,
}, {
  get: (target, prop: string) => {
    if (prop === 'light') return LightColors;
    if (prop === 'dark') return DarkColors;

    // Map other themes
    const darkThemes = ['coffee', 'business', 'night', 'dark', 'black', 'luxury', 'dracula', 'halloween', 'forest', 'synthwave'];
    if (darkThemes.includes(prop)) {
      return DarkColors;
    }

    return LightColors; // Default to light
  }
});

export const Colors = ColorsProxy as { [key: string]: ColorTheme };

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Spacing scale (consistent with design systems)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius scale
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

// Typography scale
export const Typography = {
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};