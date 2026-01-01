export const MOCK_DASHBOARD_DATA = {
  myRetailScores: {
    totalOutlets: 21,
    highScores: 12,
    lowScores: 9,
  },
  samTraders: {
    score: 81,
    totalOutlets: 100,
    weeklyChange: 81,
  },
  featuredStore: {
    name: 'Vrundalaya Traders',
    score: 750,
    rating: 4,
    badge: 'Creditworthy',
    trending: 'up' as const,
  },
  recentAssessments: [
    {
      id: '1',
      storeName: 'Vaibhav Mart',
      score: 620,
      rating: 4,
      badge: 'Moderate',
      status: 'Completed',
    },
    {
      id: '2',
      storeName: 'Darshan Sales',
      score: 340,
      rating: 2,
      badge: 'Risky',
      status: 'Completed',
    },
  ],
};
