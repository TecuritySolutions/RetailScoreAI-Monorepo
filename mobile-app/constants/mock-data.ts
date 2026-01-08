export const MOCK_DASHBOARD_DATA = {
  portfolioHealth: {
    overallScore: 85,
    weeklyChange: 5,
    trend: 'up' as const,
  },
  myRetailScores: {
    totalOutlets: 21,
    highScores: 12,
    lowScores: 9,
    moderateScores: 0,
  },
  samTraders: {
    score: 81,
    totalOutlets: 100,
    weeklyChange: 81,
    // 7-day trend data for sparkline
    trendData: [75, 76, 78, 79, 80, 80, 81],
  },
  featuredStore: {
    name: 'Vrundalaya Traders',
    score: 750,
    maxScore: 1000,
    rating: 4,
    badge: 'Creditworthy',
    trending: 'up' as const,
  },
  recentAssessments: [
    {
      id: '1',
      storeName: 'Vaibhav Mart',
      score: 620,
      maxScore: 1000,
      rating: 4,
      badge: 'Moderate',
      status: 'Completed',
      daysAgo: 2,
    },
    {
      id: '2',
      storeName: 'Darshan Sales',
      score: 340,
      maxScore: 1000,
      rating: 2,
      badge: 'Risky',
      status: 'Completed',
      daysAgo: 5,
    },
  ],
};
