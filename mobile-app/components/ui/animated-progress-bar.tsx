import React, { useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { DashboardColors } from '@/constants/theme';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showGradient?: boolean;
}

export function AnimatedProgressBar({
  progress,
  height = 8,
  color,
  backgroundColor,
  showGradient = false,
}: AnimatedProgressBarProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  // Determine color based on progress if not provided
  const getProgressColor = () => {
    if (color) return color;
    if (progress >= 70) return colors.scoreHigh;
    if (progress >= 40) return colors.scoreModerate;
    return colors.scoreLow;
  };

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: backgroundColor || colors.ringTrack,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.progress,
          {
            backgroundColor: getProgressColor(),
            height,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 100,
  },
});
