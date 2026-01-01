import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/card';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DashboardColors } from '@/constants/theme';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  const colorScheme = useColorScheme();
  const colors = DashboardColors[colorScheme ?? 'light'];

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#D1D5DB' : '#6B7280' }]}>
        {title}
      </Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
          {value}
        </Text>
        {icon && <View style={styles.icon}>{icon}</View>}
      </View>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>
          {subtitle}
        </Text>
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
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  icon: {
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
});
