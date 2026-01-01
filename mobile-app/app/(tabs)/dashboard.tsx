import React from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { DashboardColors } from '@/constants/theme';
import { MOCK_DASHBOARD_DATA } from '@/constants/mock-data';
import { MetricCard } from '@/components/dashboard/metric-card';
import { RetailScoreCard } from '@/components/dashboard/retail-score-card';
import { ActionButton } from '@/components/dashboard/action-button';
import { AssessmentItem } from '@/components/dashboard/assessment-item';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const colors = DashboardColors[colorScheme ?? 'light'];
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAction = (action: string) => {
    Alert.alert('Coming Soon', `${action} feature will be available soon!`);
  };

  const displayName = user?.full_name || 'User';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#111827' : '#F9FAFB' }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Tecurity</Text>
        </View>
        <Text style={styles.greeting}>Hello, {displayName}! 👋</Text>
        <Text style={styles.tagline}>Empowering Retail Credit</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <MetricCard
            title="My Retail Scores"
            value={`${MOCK_DASHBOARD_DATA.myRetailScores.totalOutlets}`}
            subtitle="Outlets"
          />
          <View style={styles.spacing} />
          <MetricCard
            title="SAM Traders"
            value={`${MOCK_DASHBOARD_DATA.samTraders.score}/100`}
            subtitle="Outlets"
          />
        </View>

        {/* Additional Metrics */}
        <View style={styles.additionalMetrics}>
          <View style={styles.metricBadge}>
            <Text style={[styles.badgeIcon, { color: colors.scoreHigh }]}>✓</Text>
            <Text style={[styles.badgeText, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
              {MOCK_DASHBOARD_DATA.myRetailScores.highScores} High
            </Text>
          </View>
          <View style={styles.metricBadge}>
            <Text style={[styles.badgeIcon, { color: colors.scoreLow }]}>✕</Text>
            <Text style={[styles.badgeText, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
              {MOCK_DASHBOARD_DATA.myRetailScores.lowScores} Low
            </Text>
          </View>
          <View style={styles.metricBadge}>
            <Text style={[styles.badgeIcon, { color: colors.scoreHigh }]}>↑</Text>
            <Text style={[styles.badgeText, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
              {MOCK_DASHBOARD_DATA.samTraders.weeklyChange}% This Week
            </Text>
          </View>
        </View>

        {/* Featured Retail Score */}
        <RetailScoreCard
          storeName={MOCK_DASHBOARD_DATA.featuredStore.name}
          score={MOCK_DASHBOARD_DATA.featuredStore.score}
          rating={MOCK_DASHBOARD_DATA.featuredStore.rating}
          badge={MOCK_DASHBOARD_DATA.featuredStore.badge}
          trending={MOCK_DASHBOARD_DATA.featuredStore.trending}
        />

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <ActionButton
            label="Scan GSTIN"
            icon="barcode"
            color={colors.primary}
            onPress={() => handleAction('Scan GSTIN')}
          />
          <View style={styles.spacing} />
          <ActionButton
            label="Store Locator"
            icon="location.pin"
            color={colors.accent}
            onPress={() => handleAction('Store Locator')}
          />
          <View style={styles.spacing} />
          <ActionButton
            label="Evaluate"
            icon="checklist"
            color={colors.warning}
            onPress={() => handleAction('Evaluate')}
          />
        </View>

        {/* Recent Assessments */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
            Recent Assessments
          </Text>
          <View style={[styles.assessmentsList, { backgroundColor: colors.cardBackground }]}>
            {MOCK_DASHBOARD_DATA.recentAssessments.map((assessment) => (
              <AssessmentItem
                key={assessment.id}
                storeName={assessment.storeName}
                score={assessment.score}
                rating={assessment.rating}
                badge={assessment.badge}
                status={assessment.status}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  spacing: {
    width: 12,
  },
  additionalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  assessmentsList: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
