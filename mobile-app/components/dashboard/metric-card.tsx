import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/card';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DashboardColors, Shadows } from '@/constants/theme';
import { SparklineChart } from './sparkline-chart';
import { AnimatedProgressBar } from '@/components/ui/animated-progress-bar';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trendData?: number[];
  showProgress?: boolean;
  progress?: number;
  insight?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trendData,
  showProgress = false,
  progress = 0,
  insight,
}: MetricCardProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  return (
    <Card style={[styles.card, Shadows.medium]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
        {trendData && trendData.length > 0 && (
          <View style={styles.sparklineContainer}>
            <SparklineChart data={trendData} width={60} height={24} showGradient />
          </View>
        )}
        {icon && <View style={styles.icon}>{icon}</View>}
      </View>

      {showProgress && (
        <View style={styles.progressContainer}>
          <AnimatedProgressBar progress={progress} height={6} />
        </View>
      )}

      {subtitle && (
        <View style={styles.subtitleRow}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
      )}

      {insight && (
        <View style={[styles.insightContainer, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.insightText, { color: colors.primary }]}>📊 {insight}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  sparklineContainer: {
    marginLeft: 'auto',
  },
  icon: {
    marginLeft: 8,
  },
  progressContainer: {
    marginVertical: 8,
  },
  subtitleRow: {
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  insightContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  insightText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
