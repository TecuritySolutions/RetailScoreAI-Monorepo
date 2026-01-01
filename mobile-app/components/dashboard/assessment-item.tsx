import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DashboardColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface AssessmentItemProps {
  storeName: string;
  score: number;
  rating: number;
  badge: string;
  status: string;
}

export function AssessmentItem({ storeName, score, rating, badge, status }: AssessmentItemProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  const getBadgeColor = () => {
    if (badge === 'Moderate') return colors.scoreModerate;
    if (badge === 'Risky') return colors.scoreLow;
    return colors.scoreHigh;
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconSymbol
            key={star}
            name="star.fill"
            size={14}
            color={star <= rating ? '#F59E0B' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.cardBorder }]}>
      <View style={styles.leftSection}>
        <Text style={[styles.storeName, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
          {storeName}
        </Text>
        <View style={styles.ratingRow}>
          <Text style={[styles.ratingLabel, { color: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>
            Retail Score:
          </Text>
          {renderStars()}
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={[styles.badge, { backgroundColor: `${getBadgeColor()}20` }]}>
          <Text style={[styles.badgeText, { color: getBadgeColor() }]}>{badge}</Text>
        </View>
        <Text style={[styles.score, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
          {score}
        </Text>
        <Text style={[styles.status, { color: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>
          {status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    fontSize: 13,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
  },
});
