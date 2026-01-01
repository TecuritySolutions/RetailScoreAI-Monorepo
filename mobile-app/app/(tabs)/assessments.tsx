import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AssessmentsScreen() {
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#111827' : '#F9FAFB' }]}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
        Assessments
      </Text>
      <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>
        Assessment list and management features coming soon...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
