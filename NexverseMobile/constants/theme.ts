/**
 * Nexverse Design System Theme
 * Matching the web design with dark theme and gold accents
 */

import { Platform } from 'react-native';

// Nexverse Color Palette (matching CSS variables)
export const NexverseColors = {
  // Background colors
  bgMain: '#121418',          // --bg-main: main background
  bgSurface: '#1A1F25',       // --bg-surface: panels/containers
  bgReceived: '#1E2430',      // --bg-received: received messages
  inputBg: '#181C22',         // --input-bg: input bar
  glass: 'rgba(255,255,255,0.02)', // --glass

  // Gold accent colors
  goldPrimary: '#D4AF37',     // --gold-primary: primary gold
  goldAccent: '#CBA135',      // --gold-accent: warmer accent
  goldGradFrom: '#E1C16E',    // --gold-grad-from: gradient start
  goldGradTo: '#B8860B',      // --gold-grad-to: gradient end

  // Text colors
  textPrimary: '#E4E6EB',     // --text-primary: main text
  textSecondary: '#9DA3A8',   // --text-secondary: secondary text
  muted: '#60646B',           // --muted: muted UI

  // Message bubbles
  incomingBubble: '#1E2430',  // Dark received bubble
  outgoingBubble: '#2A2515',  // Gold-tinted sent bubble

  // Status indicators
  checkmarkSingle: '#60646B',
  checkmarkDouble: '#53BDEB',
  checkmarkRead: '#53BDEB',

  // UI elements
  border: 'rgba(255,255,255,0.03)',
  divider: 'rgba(255,255,255,0.05)',
  unreadBadge: '#D4AF37',
  timestamp: '#9DA3A8',

  // Radius
  radius: 14,
};

// Keep WhatsAppColors for backward compatibility
export const WhatsAppColors = {
  // Primary colors (mapped to gold)
  teal: NexverseColors.goldPrimary,
  tealDark: NexverseColors.goldAccent,
  green: NexverseColors.goldPrimary,
  blue: '#34B7F1',

  // Message bubbles
  incomingBubble: '#FFFFFF',
  outgoingBubble: '#F5E8C4',

  // Backgrounds
  chatBackground: '#ECE5DD',
  screenBackground: '#FFFFFF',
  settingsBackground: '#F2F2F7',

  // Text colors
  textPrimary: '#000000',
  textSecondary: '#667781',
  textTertiary: '#8696A0',

  // UI elements
  border: '#E9EDEF',
  divider: '#E9EDEF',
  unreadBadge: NexverseColors.goldPrimary,
  timestamp: '#667781',

  // Status indicators
  checkmarkSingle: '#8696A0',
  checkmarkDouble: '#53BDEB',
  checkmarkRead: '#53BDEB',

  // Input
  inputBackground: '#F0F2F5',
  inputBorder: '#D1D7DB',

  // Icons
  iconActive: NexverseColors.goldPrimary,
  iconInactive: '#8696A0',
};

const LightColors = {
  text: '#000000',
  background: '#FFFFFF',
  tint: NexverseColors.goldPrimary,
  icon: WhatsAppColors.textSecondary,
  tabIconDefault: WhatsAppColors.iconInactive,
  tabIconSelected: NexverseColors.goldPrimary,
  border: WhatsAppColors.border,

  // Chat specific
  chatBackground: WhatsAppColors.chatBackground,
  incomingMessage: WhatsAppColors.incomingBubble,
  outgoingMessage: '#F5E8C4',
  messageText: WhatsAppColors.textPrimary,
  timestamp: WhatsAppColors.timestamp,

  // UI elements
  unreadBadge: NexverseColors.goldPrimary,
  checkmark: WhatsAppColors.checkmarkDouble,
  inputBackground: WhatsAppColors.inputBackground,
  divider: WhatsAppColors.divider,
  error: '#EF4444',
};

const DarkColors = {
  // Main colors (Nexverse Design System)
  text: NexverseColors.textPrimary,           // #E4E6EB
  background: NexverseColors.bgMain,          // #121418
  tint: NexverseColors.goldPrimary,           // #D4AF37
  icon: NexverseColors.textSecondary,         // #9DA3A8
  tabIconDefault: NexverseColors.muted,       // #60646B
  tabIconSelected: NexverseColors.goldPrimary, // #D4AF37
  border: NexverseColors.border,

  // Chat specific
  chatBackground: NexverseColors.bgMain,      // #121418
  incomingMessage: NexverseColors.bgReceived, // #1E2430
  outgoingMessage: NexverseColors.outgoingBubble, // Gold-tinted
  messageText: NexverseColors.textPrimary,    // #E4E6EB
  timestamp: NexverseColors.textSecondary,    // #9DA3A8

  // UI elements
  unreadBadge: NexverseColors.goldPrimary,    // #D4AF37
  checkmark: '#53BDEB',
  inputBackground: NexverseColors.inputBg,    // #181C22
  divider: NexverseColors.divider,
  error: '#EF4444',

  // Surface colors (for cards, panels, etc.)
  surface: NexverseColors.bgSurface,          // #1A1F25
  surfaceElevated: NexverseColors.bgReceived, // #1E2430

  // Gold gradient colors
  gradientStart: NexverseColors.goldGradFrom, // #E1C16E
  gradientEnd: NexverseColors.goldGradTo,     // #B8860B
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