import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Animatable from 'react-native-animatable';
import { DashboardColors, Shadows } from '@/constants/theme';

interface DistributionBarProps {
  highScores: number;
  moderateScores: number;
  lowScores: number;
}

export function DistributionBar({ highScores, moderateScores, lowScores }: DistributionBarProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  const total = highScores + moderateScores + lowScores;
  const highPercent = total > 0 ? (highScores / total) * 100 : 0;
  const moderatePercent = total > 0 ? (moderateScores / total) * 100 : 0;
  const lowPercent = total > 0 ? (lowScores / total) * 100 : 0;

  const highWidth = useSharedValue(0);
  const moderateWidth = useSharedValue(0);
  const lowWidth = useSharedValue(0);

  useEffect(() => {
    highWidth.value = withTiming(highPercent, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
    moderateWidth.value = withDelay(
      200,
      withTiming(moderatePercent, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      })
    );
    lowWidth.value = withDelay(
      400,
      withTiming(lowPercent, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [highPercent, moderatePercent, lowPercent]);

  const highAnimatedStyle = useAnimatedStyle(() => ({
    width: `${highWidth.value}%`,
  }));

  const moderateAnimatedStyle = useAnimatedStyle(() => ({
    width: `${moderateWidth.value}%`,
  }));

  const lowAnimatedStyle = useAnimatedStyle(() => ({
    width: `${lowWidth.value}%`,
  }));

  const needsAttention = lowScores > 0;
  const attentionPercent = ((lowScores / total) * 100).toFixed(0);

  return (
    <Animatable.View animation="fadeInUp" duration={800} delay={300} style={[styles.container, Shadows.medium]}>
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Portfolio Distribution</Text>

        {/* Distribution Categories */}
        <View style={styles.categoriesContainer}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryLabel}>
              <View style={[styles.colorDot, { backgroundColor: colors.scoreHigh }]} />
              <Text style={[styles.categoryText, { color: colors.textSecondary }]}>High</Text>
            </View>
            <View style={styles.categoryStats}>
              <Animated.View
                style={[
                  styles.bar,
                  { backgroundColor: colors.scoreHigh + '30' },
                  highAnimatedStyle,
                ]}
              >
                <View style={[styles.barFill, { backgroundColor: colors.scoreHigh }]} />
              </Animated.View>
              <Text style={[styles.statsText, { color: colors.textPrimary }]}>
                {highScores} ({highPercent.toFixed(0)}%)
              </Text>
            </View>
          </View>

          <View style={styles.categoryRow}>
            <View style={styles.categoryLabel}>
              <View style={[styles.colorDot, { backgroundColor: colors.scoreModerate }]} />
              <Text style={[styles.categoryText, { color: colors.textSecondary }]}>Moderate</Text>
            </View>
            <View style={styles.categoryStats}>
              <Animated.View
                style={[
                  styles.bar,
                  { backgroundColor: colors.scoreModerate + '30' },
                  moderateAnimatedStyle,
                ]}
              >
                <View style={[styles.barFill, { backgroundColor: colors.scoreModerate }]} />
              </Animated.View>
              <Text style={[styles.statsText, { color: colors.textPrimary }]}>
                {moderateScores} ({moderatePercent.toFixed(0)}%)
              </Text>
            </View>
          </View>

          <View style={styles.categoryRow}>
            <View style={styles.categoryLabel}>
              <View style={[styles.colorDot, { backgroundColor: colors.scoreLow }]} />
              <Text style={[styles.categoryText, { color: colors.textSecondary }]}>Low</Text>
            </View>
            <View style={styles.categoryStats}>
              <Animated.View
                style={[
                  styles.bar,
                  { backgroundColor: colors.scoreLow + '30' },
                  lowAnimatedStyle,
                ]}
              >
                <View style={[styles.barFill, { backgroundColor: colors.scoreLow }]} />
              </Animated.View>
              <Text style={[styles.statsText, { color: colors.textPrimary }]}>
                {lowScores} ({lowPercent.toFixed(0)}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Alert Message */}
        {needsAttention && (
          <View style={[styles.alertContainer, { backgroundColor: colors.warning + '15' }]}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={[styles.alertText, { color: colors.warning }]}>
              {lowScores} {lowScores === 1 ? 'store needs' : 'stores need'} attention ({attentionPercent}%)
            </Text>
          </View>
        )}
      </View>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryStats: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    justifyContent: 'center',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    borderRadius: 12,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '600',
    width: 70,
    textAlign: 'right',
  },
  alertContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertIcon: {
    fontSize: 16,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
