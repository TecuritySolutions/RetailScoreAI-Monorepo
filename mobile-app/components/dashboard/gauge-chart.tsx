import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { DashboardColors } from '@/constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface GaugeChartProps {
  score: number;
  maxScore: number;
  size?: number;
}

export function GaugeChart({ score, maxScore, size = 140 }: GaugeChartProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  const progress = useSharedValue(0);
  const percentage = (score / maxScore) * 100;

  useEffect(() => {
    progress.value = withTiming(percentage / 100, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage]);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  // Create semi-circular arc (180 degrees)
  const startAngle = -180;
  const endAngle = 0;

  const polarToCartesian = (angle: number) => {
    const angleInRadians = ((angle - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const createArc = (start: number, end: number) => {
    const startPoint = polarToCartesian(start);
    const endPoint = polarToCartesian(end);
    const largeArcFlag = end - start <= 180 ? 0 : 1;

    return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
  };

  const backgroundPath = createArc(startAngle, endAngle);

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const currentAngle = startAngle + (endAngle - startAngle) * progress.value;
    const angleInRadiansStart = ((startAngle - 90) * Math.PI) / 180;
    const angleInRadiansEnd = ((currentAngle - 90) * Math.PI) / 180;

    const startPoint = {
      x: centerX + radius * Math.cos(angleInRadiansStart),
      y: centerY + radius * Math.sin(angleInRadiansStart),
    };
    const endPoint = {
      x: centerX + radius * Math.cos(angleInRadiansEnd),
      y: centerY + radius * Math.sin(angleInRadiansEnd),
    };

    const largeArcFlag = currentAngle - startAngle <= 180 ? 0 : 1;
    const path = `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;

    return {
      d: path,
    };
  });

  // Determine color zones
  const getScoreColor = () => {
    if (percentage >= 70) return colors.scoreHigh;
    if (percentage >= 40) return colors.scoreModerate;
    return colors.scoreLow;
  };

  return (
    <View style={[styles.container, { width: size, height: size / 1.5 }]}>
      <Svg width={size} height={size / 1.5 + 10}>
        {/* Background Arc */}
        <Path
          d={backgroundPath}
          stroke={colors.ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Progress Arc */}
        <AnimatedPath
          animatedProps={animatedProps}
          stroke={getScoreColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Center Indicator */}
        <Circle cx={centerX} cy={centerY} r={4} fill={colors.textMuted} />
      </Svg>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <Text style={[styles.score, { color: getScoreColor() }]}>{score}</Text>
        <Text style={[styles.maxScore, { color: colors.textMuted }]}>/ {maxScore}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scoreContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  maxScore: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: -4,
  },
});
