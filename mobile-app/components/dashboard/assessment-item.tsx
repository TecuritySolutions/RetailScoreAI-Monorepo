import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DashboardColors, Shadows } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AnimatedProgressBar } from '@/components/ui/animated-progress-bar';

interface AssessmentItemProps {
  storeName: string;
  score: number;
  maxScore: number;
  rating: number;
  badge: string;
  status: string;
  daysAgo: number;
}

export function AssessmentItem({
  storeName,
  score,
  maxScore,
  rating,
  badge,
  status,
  daysAgo,
}: AssessmentItemProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  const getBadgeColor = () => {
    if (badge === 'Moderate') return colors.scoreModerate;
    if (badge === 'Risky') return colors.scoreLow;
    return colors.scoreHigh;
  };

  const getBadgeEmoji = () => {
    if (badge === 'Moderate') return '🟡';
    if (badge === 'Risky') return '🔴';
    return '🟢';
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconSymbol
            key={star}
            name="star.fill"
            size={14}
            color={star <= rating ? colors.warning : colors.textMuted}
          />
        ))}
      </View>
    );
  };

  const percentage = (score / maxScore) * 100;

  return (
    <Animatable.View animation="fadeInUp" duration={600}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBackground }, Shadows.small]}
        activeOpacity={0.7}
      >
        {/* Risk Indicator Dot */}
        <View style={[styles.riskDot, { backgroundColor: getBadgeColor() }]} />

        {/* Content */}
        <View style={styles.content}>
          {/* Header Row */}
          <View style={styles.header}>
            <Text style={[styles.storeName, { color: colors.textPrimary }]}>{storeName}</Text>
            <IconSymbol name="chevron.right" size={18} color={colors.textMuted} />
          </View>

          {/* Score and Rating Row */}
          <View style={styles.scoreRow}>
            <Text style={[styles.score, { color: getBadgeColor() }]}>{score}</Text>
            {renderStars()}
            <View style={[styles.badgePill, { backgroundColor: getBadgeColor() + '20' }]}>
              <Text style={styles.badgeEmoji}>{getBadgeEmoji()}</Text>
              <Text style={[styles.badgeText, { color: getBadgeColor() }]}>{badge}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <AnimatedProgressBar progress={percentage} height={6} />
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              {percentage.toFixed(0)}%
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {status} {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  riskDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    flex: 1,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
  },
});
