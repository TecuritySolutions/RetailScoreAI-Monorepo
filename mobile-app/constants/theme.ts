/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const DashboardColors = {
  light: {
    primary: '#3B82F6',
    secondary: '#06B6D4',
    accent: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',

    gradientStart: '#DBEAFE',
    gradientEnd: '#E0F2FE',

    cardBackground: '#FFFFFF',
    cardBorder: '#E5E7EB',

    scoreHigh: '#10B981',
    scoreModerate: '#F59E0B',
    scoreLow: '#EF4444',

    // New gradients for enhanced components
    primaryGradientStart: '#3B82F6',
    primaryGradientEnd: '#06B6D4',
    accentGradientStart: '#10B981',
    accentGradientEnd: '#34D399',

    // Shadow and depth
    shadowColor: '#000000',
    shadowOpacity: 0.1,

    // Ring colors
    ringTrack: '#E5E7EB',
    ringProgress: '#3B82F6',

    // Text colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  dark: {
    primary: '#60A5FA',
    secondary: '#22D3EE',
    accent: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',

    gradientStart: '#1E3A8A',
    gradientEnd: '#0E7490',

    cardBackground: '#1F2937',
    cardBorder: '#374151',

    scoreHigh: '#34D399',
    scoreModerate: '#FBBF24',
    scoreLow: '#F87171',

    // New gradients for enhanced components
    primaryGradientStart: '#60A5FA',
    primaryGradientEnd: '#22D3EE',
    accentGradientStart: '#34D399',
    accentGradientEnd: '#10B981',

    // Shadow and depth
    shadowColor: '#000000',
    shadowOpacity: 0.3,

    // Ring colors
    ringTrack: '#374151',
    ringProgress: '#60A5FA',

    // Text colors
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
  },
};

// Shadow styles for iOS and Android
export const Shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
};

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
