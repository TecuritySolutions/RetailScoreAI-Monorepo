import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/card';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DashboardColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface RetailScoreCardProps {
  storeName: string;
  score: number;
  rating: number;
  badge: string;
  trending?: 'up' | 'down';
}

export function RetailScoreCard({ storeName, score, rating, badge, trending }: RetailScoreCardProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconSymbol
            key={star}
            name="star.fill"
            size={16}
            color={star <= rating ? '#F59E0B' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#D1D5DB' : '#6B7280' }]}>
          Retail Score
        </Text>
        <Text style={[styles.storeName, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>{storeName}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.storeIconContainer}>
            <Text style={styles.storeIcon}>🏪</Text>
          </View>
          <View>
            <Text style={[styles.badgeText, { color: colors.accent }]}>{badge}</Text>
            {renderStars()}
          </View>
        </View>

        <View style={[styles.scoreContainer, { backgroundColor: colors.scoreHigh }]}>
          <Text style={styles.scoreValue}>{score}</Text>
          <View style={styles.scoreStars}>
            {[1, 2, 3, 4].map((star) => (
              <IconSymbol key={star} name="star.fill" size={12} color="#FFFFFF" />
            ))}
          </View>
          {trending && (
            <IconSymbol
              name="arrow.up.right"
              size={20}
              color="#FFFFFF"
              style={styles.trendingIcon}
            />
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
  },
  header: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeIcon: {
    fontSize: 32,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  scoreContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scoreStars: {
    flexDirection: 'row',
    gap: 2,
  },
  trendingIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
