import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DashboardColors, Shadows } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GaugeChart } from './gauge-chart';

interface RetailScoreCardProps {
  storeName: string;
  score: number;
  maxScore: number;
  rating: number;
  badge: string;
  trending?: 'up' | 'down';
}

export function RetailScoreCard({
  storeName,
  score,
  maxScore,
  rating,
  badge,
  trending,
}: RetailScoreCardProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return (
              <IconSymbol key={star} name="star.fill" size={18} color={colors.warning} />
            );
          } else if (star === fullStars + 1 && hasHalfStar) {
            return (
              <IconSymbol key={star} name="star.leadinghalf.filled" size={18} color={colors.warning} />
            );
          } else {
            return (
              <IconSymbol key={star} name="star" size={18} color={colors.textMuted} />
            );
          }
        })}
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const getBadgeIcon = () => {
    if (badge.toLowerCase().includes('credit')) return '🎯';
    if (badge.toLowerCase().includes('risky')) return '⚠️';
    return '✓';
  };

  return (
    <Animatable.View animation="fadeInUp" duration={800} delay={500}>
      <View style={[styles.card, Shadows.large]}>
        {/* Gradient Border Effect */}
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={[styles.innerCard, { backgroundColor: colors.cardBackground }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>⭐ Featured Store</Text>
              </View>
            </View>

            {/* Store Name and Icon */}
            <View style={styles.storeInfo}>
              <View style={[styles.storeIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Text style={styles.storeIcon}>🏪</Text>
              </View>
              <Text style={[styles.storeName, { color: colors.textPrimary }]}>{storeName}</Text>
            </View>

            {/* Gauge and Score */}
            <View style={styles.gaugeSection}>
              <GaugeChart score={score} maxScore={maxScore} size={160} />
            </View>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>{renderStars()}</View>

            {/* Badge and Trending */}
            <View style={styles.badgesRow}>
              <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
                <Text style={styles.badgeIcon}>{getBadgeIcon()}</Text>
                <Text style={[styles.badgeText, { color: colors.accent }]}>{badge}</Text>
              </View>

              {trending && (
                <View style={[styles.trendBadge, { backgroundColor: colors.scoreHigh + '20' }]}>
                  <IconSymbol
                    name={trending === 'up' ? 'arrow.up.right' : 'arrow.down.right'}
                    size={14}
                    color={trending === 'up' ? colors.scoreHigh : colors.scoreLow}
                  />
                  <Text style={[styles.trendText, { color: colors.scoreHigh }]}>
                    Trending {trending === 'up' ? 'Up' : 'Down'}
                  </Text>
                </View>
              )}
            </View>

            {/* CTA */}
            <TouchableOpacity style={[styles.ctaButton, { borderColor: colors.primary }]}>
              <Text style={[styles.ctaText, { color: colors.primary }]}>
                View Full Analysis
              </Text>
              <IconSymbol name="arrow.right" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
    padding: 0,
  },
  gradientBorder: {
    borderRadius: 16,
    padding: 2,
  },
  innerCard: {
    borderRadius: 14,
    padding: 20,
  },
  header: {
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  storeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeIcon: {
    fontSize: 28,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  gaugeSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    flex: 1,
  },
  badgeIcon: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
    flex: 1,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
