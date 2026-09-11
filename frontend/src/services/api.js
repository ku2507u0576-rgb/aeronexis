import axios from 'axios';

export const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000/v1';
    }
    if (window.location.hostname.includes('surge.sh') || window.location.hostname.includes('github.io')) {
      return 'https://aeronexis.onrender.com/v1';
    }
    return '/v1';
  }
  return 'http://localhost:8000/v1';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'X-API-Key': 'apix-demo-key-2026'
  }
});

const withMockFallback = async (requestPromise, mockData) => {
  try {
    const response = await requestPromise;
    const body = response.data;
    if (body && typeof body === 'object' && body.status) {
      // If the response has additional metadata like aggregates or total, keep the whole wrapper
      if (body.aggregates !== undefined || (body.total !== undefined && Array.isArray(body.data))) {
        return body;
      }
      // Otherwise unwrap the inner data
      if (body.data !== undefined) {
        return body.data;
      }
    }
    return body;
  } catch (error) {
    console.warn('API call failed, using mock data:', error?.message || error);
    return mockData;
  }
};

export const getDashboardSummary = () => {
  return withMockFallback(api.get('/dashboard-summary'), {
    current_index: 108.4,
    change_pct: 3.2,
    fares_today: 12540,
    routes_monitored: 10,
    airlines_tracked: 5,
    data_sources: 11,
    quality_score: 92.0,
    trend_7d: [105.2, 105.8, 106.4, 107.1, 107.5, 108.0, 108.4],
    alerts: [
      { route: 'DEL-BOM', change: 12.4, type: 'spike' },
      { route: 'BLR-HYD', change: -8.2, type: 'drop' }
    ]
  });
};

export const getAirfareIndex = (params) => {
  return withMockFallback(api.get('/airfare-index', { params }), {
    current_value: 108.4,
    baseline: 100.0,
    change: 8.4,
    comparisons: { d_minus_1: 0.5, wow: 2.1, mom: 5.4, yoy: 8.4 },
    history: Array.from({length: 30}, (_, i) => ({ date: `2026-09-${(i+1).toString().padStart(2, '0')}`, index: 100 + Math.random() * 10 }))
  });
};

export const getRoutes = (params) => {
  return withMockFallback(api.get('/routes', { params }), [
    { code: 'DEL-BOM', name: 'Delhi - Mumbai', index: 110.2, avg_fare: 6200, change_7d: 4.2 },
    { code: 'DEL-BLR', name: 'Delhi - Bangalore', index: 105.1, avg_fare: 7500, change_7d: 1.2 },
    { code: 'BOM-BLR', name: 'Mumbai - Bangalore', index: 102.4, avg_fare: 5100, change_7d: -0.5 },
    { code: 'DEL-HYD', name: 'Delhi - Hyderabad', index: 108.5, avg_fare: 6800, change_7d: 2.5 },
    { code: 'BLR-HYD', name: 'Bangalore - Hyderabad', index: 98.2, avg_fare: 3200, change_7d: -2.1 },
    { code: 'MAA-DEL', name: 'Chennai - Delhi', index: 112.4, avg_fare: 8100, change_7d: 5.4 },
    { code: 'DEL-CCU', name: 'Delhi - Kolkata', index: 104.2, avg_fare: 6500, change_7d: 0.8 },
    { code: 'BOM-DEL', name: 'Mumbai - Delhi', index: 109.8, avg_fare: 6100, change_7d: 3.9 },
    { code: 'MAA-BOM', name: 'Chennai - Mumbai', index: 106.5, avg_fare: 5800, change_7d: 1.5 },
    { code: 'BLR-DEL', name: 'Bangalore - Delhi', index: 106.1, avg_fare: 7600, change_7d: 1.8 }
  ]);
};

export const getFares = (params) => {
  return withMockFallback(api.get('/fares', { params }), {
    summary: { total_quotes: 1250, avg_fare: 6450, min: 4200, max: 18500 },
    data: Array.from({length: 50}, (_, i) => ({
      id: i,
      route: ['DEL-BOM', 'DEL-BLR', 'BOM-BLR'][Math.floor(Math.random() * 3)],
      airline: ['6E', 'AI', 'IX', 'SG', 'QP'][Math.floor(Math.random() * 5)],
      advance: [1, 7, 15, 30][Math.floor(Math.random() * 4)],
      base_fare: 4000 + Math.floor(Math.random() * 4000),
      tax: 800 + Math.floor(Math.random() * 400),
      get total_fare() { return this.base_fare + this.tax; },
      source: ['OTA_1', 'Airline_Web', 'GDS_1'][Math.floor(Math.random() * 3)],
      date: '2026-09-10'
    }))
  });
};

export const getAirlines = () => {
  return withMockFallback(api.get('/airlines'), [
    { code: '6E', name: 'IndiGo', avg_fare: 5800, index: 104.2, market_share: 55.4, mom_change: 2.1 },
    { code: 'AI', name: 'Air India', avg_fare: 7200, index: 112.5, market_share: 22.1, mom_change: 4.5 },
    { code: 'IX', name: 'Air India Express', avg_fare: 5400, index: 101.2, market_share: 8.5, mom_change: 0.5 },
    { code: 'SG', name: 'SpiceJet', avg_fare: 5900, index: 105.8, market_share: 7.2, mom_change: -1.2 },
    { code: 'QP', name: 'Akasa Air', avg_fare: 5600, index: 102.4, market_share: 6.8, mom_change: 1.8 }
  ]);
};

export const getTrends = (params) => {
  return withMockFallback(api.get('/trends', { params }), {
    stats: { average: 105.4, std_dev: 2.1, min: 101.2, max: 112.4, volatility: 'Medium', trend: 'Upward' },
    data: Array.from({length: 30}, (_, i) => ({
      date: `2026-08-${(10+i).toString().padStart(2, '0')}`,
      value: 102 + (i * 0.2) + (Math.random() * 2)
    }))
  });
};

export const getAdvanceBooking = (route) => {
  return withMockFallback(api.get('/advance-booking', { params: { route } }), {
    insight: 'Booking 30 days in advance saves 42% compared to last-minute',
    curve: [
      { advance: 'T+1', avg_fare: 12500 },
      { advance: 'T+7', avg_fare: 8200 },
      { advance: 'T+15', avg_fare: 6500 },
      { advance: 'T+30', avg_fare: 5100 },
      { advance: 'T+45', avg_fare: 4800 }
    ],
    savings: {
      'T+7_vs_T+1': 34.4,
      'T+15_vs_T+7': 20.7,
      'T+30_vs_T+15': 21.5
    }
  });
};

export const getDataQuality = () => {
  return withMockFallback(api.get('/data-quality'), {
    summary: { total: 125000, valid_pct: 94.2, duplicates_pct: 2.1, outliers_pct: 3.2, missing_pct: 0.5, score: 92.0 },
    by_source: [
      { source: 'Airline_API_1', valid: 99.1, duplicates: 0.5, issues: 'None' },
      { source: 'OTA_Scraper_1', valid: 88.5, duplicates: 5.2, issues: 'High timeout rate' }
    ],
    trend: Array.from({length: 30}, (_, i) => ({ date: `Day ${i+1}`, score: 90 + Math.random() * 5 }))
  });
};

export const getCollectionStatus = () => {
  return withMockFallback(api.get('/collection-status'), {
    total_quotes_today: 45210,
    health: 'Good',
    sources: [
      { id: 1, name: '6E_Direct', status: 'green', last_run: '10 mins ago', count: 12500 },
      { id: 2, name: 'AI_Direct', status: 'green', last_run: '15 mins ago', count: 8200 },
      { id: 3, name: 'OTA_Primary', status: 'yellow', last_run: '45 mins ago', count: 15400 },
      { id: 4, name: 'OTA_Secondary', status: 'green', last_run: '5 mins ago', count: 9110 }
    ],
    alerts: [
      { id: 1, time: '10:15 AM', message: 'OTA_Primary latency increased' }
    ]
  });
};

export const exportData = (params) => {
  return withMockFallback(api.get('/export', { params }), {
    download_url: '#',
    message: 'Export generated successfully.'
  });
};
