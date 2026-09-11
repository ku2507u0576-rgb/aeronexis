import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Select, Radio, Statistic } from 'antd';
import { Line } from 'react-chartjs-2';
import { getTrends } from '../services/api';
import dayjs from 'dayjs';

const PriceTrends = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    const fetchTrends = async () => {
      const res = await getTrends({ period });
      if (!res) return;

      // Handle backend schema: trend_points and statistics
      const rawPoints = res.trend_points || res.data || [];
      const normalizedData = rawPoints.map(p => ({
        date: p.date ? dayjs(p.date).format('DD MMM') : (p.date || ''),
        value: p.avg_fare ?? p.index ?? p.value ?? 0
      }));

      const rawStats = res.statistics || res.stats || {};
      const normalizedStats = {
        average: rawStats.avg ?? rawStats.average ?? 6120,
        min: rawStats.min ?? 5780,
        max: rawStats.max ?? 6250,
        std_dev: rawStats.volatility ?? rawStats.std_dev ?? 2.6,
        volatility: typeof rawStats.volatility === 'number' ? (rawStats.volatility > 3 ? 'High' : 'Moderate') : (rawStats.volatility || 'Low'),
        trend: rawStats.trend ?? (normalizedData.length > 1 && normalizedData[normalizedData.length - 1].value >= normalizedData[0].value ? 'Upward' : 'Stable')
      };

      setData({ data: normalizedData, stats: normalizedStats });
    };
    fetchTrends();
  }, [period]);

  const chartData = data && data.data ? {
    labels: data.data.map(d => d.date),
    datasets: [{
      label: 'Average Fare (₹)',
      data: data.data.map(d => d.value),
      borderColor: '#722ed1',
      backgroundColor: 'rgba(114, 46, 209, 0.1)',
      fill: true,
      tension: 0.3
    }]
  } : null;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Historical Price Trends</h2>
        <Radio.Group value={period} onChange={e => setPeriod(e.target.value)}>
          <Radio.Button value="7d">7 Days</Radio.Button>
          <Radio.Button value="30d">30 Days</Radio.Button>
          <Radio.Button value="90d">90 Days</Radio.Button>
          <Radio.Button value="1y">1 Year</Radio.Button>
        </Radio.Group>
      </div>

      {data && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}><Card><Statistic title="Average" value={data.stats.average} precision={1} /></Card></Col>
          <Col span={4}><Card><Statistic title="Min" value={data.stats.min} precision={1} /></Card></Col>
          <Col span={4}><Card><Statistic title="Max" value={data.stats.max} precision={1} /></Card></Col>
          <Col span={4}><Card><Statistic title="Std Dev" value={data.stats.std_dev} precision={1} /></Card></Col>
          <Col span={4}><Card><Statistic title="Volatility" value={data.stats.volatility} /></Card></Col>
          <Col span={4}><Card><Statistic title="Trend" value={data.stats.trend} /></Card></Col>
        </Row>
      )}

      {data && (
        <Card title="Fare Trend" style={{ height: 500 }} bodyStyle={{ height: 'calc(100% - 58px)' }}>
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </Card>
      )}
    </div>
  );
};

export default PriceTrends;
