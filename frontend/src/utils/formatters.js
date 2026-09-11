import dayjs from 'dayjs';

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return '-';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatPercent = (pct) => {
  if (pct === undefined || pct === null) return '-';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('DD MMM YYYY');
};

const AIRPORTS = {
  DEL: 'Delhi',
  BOM: 'Mumbai',
  BLR: 'Bangalore',
  HYD: 'Hyderabad',
  MAA: 'Chennai',
  CCU: 'Kolkata'
};

export const getRouteLabel = (code) => {
  if (!code) return '';
  const [orig, dest] = code.split('-');
  return `${AIRPORTS[orig] || orig} → ${AIRPORTS[dest] || dest}`;
};

const AIRLINES = {
  '6E': 'IndiGo',
  'AI': 'Air India',
  'IX': 'Air India Express',
  'SG': 'SpiceJet',
  'QP': 'Akasa Air'
};

export const getAirlineName = (code) => {
  return AIRLINES[code] || code;
};

export const getStatusColor = (value, baseline = 100, reverse = false) => {
  if (value === undefined || value === null) return 'gray';
  let diff = value - baseline;
  if (reverse) diff = -diff; // For things where lower is better

  if (diff > 5) return '#cf1322'; // Red
  if (diff < -5) return '#3f8600'; // Green
  return '#faad14'; // Yellow
};

export const getStatusEmoji = (value, baseline = 100, reverse = false) => {
  const color = getStatusColor(value, baseline, reverse);
  if (color === '#cf1322') return '🔴';
  if (color === '#3f8600') return '🟢';
  return '🟡';
};
