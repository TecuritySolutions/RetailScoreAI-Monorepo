import React, { useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { DashboardColors } from '@/constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  lineWidth?: number;
  showGradient?: boolean;
}

export function SparklineChart({
  data,
  width = 80,
  height = 30,
  color,
  lineWidth = 2,
  showGradient = false,
}: SparklineChartProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [data]);

  // Calculate min and max for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Generate path
  const generatePath = () => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    return path;
  };

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    return {
      strokeDashoffset: (1 - progress.value) * width * 2,
    };
  });

  const lineColor = color || colors.primary;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {showGradient && (
          <Defs>
            <LinearGradient id="sparklineGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
              <Stop offset="1" stopColor={lineColor} stopOpacity="1" />
            </LinearGradient>
          </Defs>
        )}
        <AnimatedPath
          d={generatePath()}
          stroke={showGradient ? 'url(#sparklineGradient)' : lineColor}
          strokeWidth={lineWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={width * 2}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
