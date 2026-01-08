import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Animatable from 'react-native-animatable';
import { DashboardColors, Shadows } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PortfolioHealthRingProps {
  score: number; // 0-100
  weeklyChange: number;
  trend: 'up' | 'down' | 'stable';
  totalOutlets: number;
  highScores: number;
  lowScores: number;
}

export function PortfolioHealthRing({
  score,
  weeklyChange,
  trend,
  totalOutlets,
  highScores,
  lowScores,
}: PortfolioHealthRingProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  const size = 220;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const strokeDashoffset = circumference - progress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return colors.scoreHigh;
    if (score >= 50) return colors.scoreModerate;
    return colors.scoreLow;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <Animatable.View animation="fadeInUp" duration={800} style={[styles.container, Shadows.medium]}>
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        {/* Circular Progress Ring */}
        <View style={styles.ringContainer}>
          <Svg width={size} height={size}>
            {/* Background Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.ringTrack}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Circle */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={getScoreColor()}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>

          {/* Center Content */}
          <View style={styles.centerContent}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Overall Health</Text>
            <Text style={[styles.score, { color: getScoreColor() }]}>{score}</Text>
            <Text style={[styles.maxScore, { color: colors.textMuted }]}>/100</Text>
            <View style={styles.trendContainer}>
              <Text style={[styles.trendIcon, { color: getScoreColor() }]}>
                {getTrendIcon()}
              </Text>
              <Text style={[styles.trendText, { color: colors.textSecondary }]}>
                {Math.abs(weeklyChange)}% this week
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Badges */}
        <View style={styles.badgesContainer}>
          <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.badgeValue, { color: colors.primary }]}>{totalOutlets}</Text>
            <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>Outlets</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: colors.scoreHigh + '15' }]}>
            <Text style={[styles.badgeValue, { color: colors.scoreHigh }]}>{highScores}</Text>
            <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>High ✓</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: colors.scoreLow + '15' }]}>
            <Text style={[styles.badgeValue, { color: colors.scoreLow }]}>{lowScores}</Text>
            <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>Low ✗</Text>
          </View>
        </View>
      </View>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  maxScore: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: -8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  trendIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgesContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  badge: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
  },
  badgeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
