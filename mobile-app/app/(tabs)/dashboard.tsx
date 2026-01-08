import React from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { DashboardColors } from '@/constants/theme';
import { MOCK_DASHBOARD_DATA } from '@/constants/mock-data';
import { PortfolioHealthRing } from '@/components/dashboard/portfolio-health-ring';
import { DistributionBar } from '@/components/dashboard/distribution-bar';
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
        {/* Portfolio Health Ring - Hero Section */}
        <PortfolioHealthRing
          score={MOCK_DASHBOARD_DATA.portfolioHealth.overallScore}
          weeklyChange={MOCK_DASHBOARD_DATA.portfolioHealth.weeklyChange}
          trend={MOCK_DASHBOARD_DATA.portfolioHealth.trend}
          totalOutlets={MOCK_DASHBOARD_DATA.myRetailScores.totalOutlets}
          highScores={MOCK_DASHBOARD_DATA.myRetailScores.highScores}
          lowScores={MOCK_DASHBOARD_DATA.myRetailScores.lowScores}
        />

        {/* Distribution Bar */}
        <DistributionBar
          highScores={MOCK_DASHBOARD_DATA.myRetailScores.highScores}
          moderateScores={MOCK_DASHBOARD_DATA.myRetailScores.moderateScores}
          lowScores={MOCK_DASHBOARD_DATA.myRetailScores.lowScores}
        />

        {/* SAM Traders Performance Card with Sparkline */}
        <View style={styles.metricsRow}>
          <MetricCard
            title="SAM Traders Performance"
            value={`${MOCK_DASHBOARD_DATA.samTraders.score}/100`}
            subtitle={`📍 ${MOCK_DASHBOARD_DATA.samTraders.totalOutlets} Outlets`}
            trendData={MOCK_DASHBOARD_DATA.samTraders.trendData}
            showProgress
            progress={MOCK_DASHBOARD_DATA.samTraders.score}
            insight="Above average performance"
          />
        </View>

        {/* Featured Retail Score */}
        <RetailScoreCard
          storeName={MOCK_DASHBOARD_DATA.featuredStore.name}
          score={MOCK_DASHBOARD_DATA.featuredStore.score}
          maxScore={MOCK_DASHBOARD_DATA.featuredStore.maxScore}
          rating={MOCK_DASHBOARD_DATA.featuredStore.rating}
          badge={MOCK_DASHBOARD_DATA.featuredStore.badge}
          trending={MOCK_DASHBOARD_DATA.featuredStore.trending}
        />

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <ActionButton
              label="Scan GSTIN"
              icon="barcode"
              color={colors.primary}
              gradientEnd={colors.secondary}
              onPress={() => handleAction('Scan GSTIN')}
            />
            <View style={styles.spacing} />
            <ActionButton
              label="Store Locator"
              icon="location.pin"
              color={colors.accent}
              gradientEnd={colors.accentGradientEnd}
              onPress={() => handleAction('Store Locator')}
            />
            <View style={styles.spacing} />
            <ActionButton
              label="New Evaluation"
              icon="checklist"
              color={colors.warning}
              onPress={() => handleAction('Evaluate')}
            />
          </View>
        </View>

        {/* Recent Assessments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Recent Assessments
            </Text>
            <Text style={[styles.viewAllLink, { color: colors.primary }]}>View All →</Text>
          </View>
          {MOCK_DASHBOARD_DATA.recentAssessments.map((assessment) => (
            <AssessmentItem
              key={assessment.id}
              storeName={assessment.storeName}
              score={assessment.score}
              maxScore={assessment.maxScore}
              rating={assessment.rating}
              badge={assessment.badge}
              status={assessment.status}
              daysAgo={assessment.daysAgo}
            />
          ))}
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
    paddingTop: 8,
    paddingBottom: 32,
  },
  metricsRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  spacing: {
    width: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
