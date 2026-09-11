import React, { useState, useEffect } from 'react';
import { Card, Select, Row, Col, Statistic, Tag, Typography } from 'antd';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { getAdvanceBooking } from '../services/api';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);
const { Option } = Select;
const { Text } = Typography;

const ROUTES = ['DEL-BOM','DEL-BLR','BOM-BLR','DEL-HYD','BLR-HYD','MAA-DEL','DEL-CCU','BOM-DEL','MAA-BOM','BLR-DEL'];

export default function AdvanceBooking() {
  const [route, setRoute] = useState('DEL-BOM');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [route]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdvanceBooking(route);
      setData(res.data || res);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const analysis = data?.analysis || [
    { advance_days: 1, avg_fare: 6200, median_fare: 6100, std_dev: 300 },
    { advance_days: 7, avg_fare: 5400, median_fare: 5350, std_dev: 250 },
    { advance_days: 15, avg_fare: 4900, median_fare: 4850, std_dev: 200 },
    { advance_days: 30, avg_fare: 4700, median_fare: 4650, std_dev: 180 },
    { advance_days: 45, avg_fare: 4600, median_fare: 4550, std_dev: 150 },
  ];

  const elasticity = data?.elasticity || { t1_to_t45_savings_pct: 25.8, t1_to_t30_savings_pct: 24.2, optimal_booking_window: 'T+30' };

  const chartData = {
    labels: analysis.map(a => `T+${a.advance_days}`),
    datasets: [
      {
        label: 'Average Fare (₹)',
        data: analysis.map(a => a.avg_fare),
        backgroundColor: 'rgba(255, 153, 51, 0.6)',
        borderColor: '#FF9933',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Median Fare (₹)',
        data: analysis.map(a => a.median_fare),
        backgroundColor: 'rgba(19, 136, 8, 0.6)',
        borderColor: '#138808',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: `Price Elasticity Curve — ${route}`, font: { size: 16 } },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}` } },
    },
    scales: {
      y: { title: { display: true, text: 'Fare (₹)' }, ticks: { callback: v => `₹${v.toLocaleString('en-IN')}` } },
      x: { title: { display: true, text: 'Booking Window (Days Before Travel)' } },
    },
  };

  const savings = [];
  for (let i = 0; i < analysis.length - 1; i++) {
    savings.push({
      from: `T+${analysis[i].advance_days}`,
      to: `T+${analysis[i + 1].advance_days}`,
      amount: analysis[i].avg_fare - analysis[i + 1].avg_fare,
      pct: ((analysis[i].avg_fare - analysis[i + 1].avg_fare) / analysis[i].avg_fare * 100).toFixed(1),
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>📅 Advance Booking Analysis</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>Lead-time price elasticity — how fares change with booking window.</p>

      <Card style={{ marginBottom: 16 }}>
        <Select value={route} onChange={setRoute} style={{ width: 200 }}>
          {ROUTES.map(r => <Option key={r} value={r}>{r}</Option>)}
        </Select>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card><Bar data={chartData} options={chartOptions} /></Card>
        </Col>
        <Col span={8}>
          <Card title="💡 Key Insight" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Statistic title="Savings (T+1 vs T+45)" value={elasticity.t1_to_t45_savings_pct} suffix="%" valueStyle={{ color: '#3f8600', fontSize: 32 }} />
            <p style={{ marginTop: 16, fontSize: 14 }}>
              Booking <strong>{elasticity.optimal_booking_window}</strong> days in advance on <strong>{route}</strong> saves up to <strong>{elasticity.t1_to_t30_savings_pct}%</strong> compared to last-minute booking.
            </p>
          </Card>
          <Card title="💰 Savings Breakdown" style={{ marginTop: 16 }}>
            {savings.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text>{s.from} → {s.to}</Text>
                <Text strong style={{ color: '#3f8600' }}>Save ₹{s.amount.toLocaleString('en-IN')} ({s.pct}%)</Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Card title="📊 Detailed Analysis">
        <Row gutter={16}>
          {analysis.map(a => (
            <Col span={4} key={a.advance_days}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Tag color={a.advance_days <= 1 ? 'red' : a.advance_days <= 7 ? 'orange' : 'green'} style={{ fontSize: 14, padding: '4px 12px' }}>T+{a.advance_days}</Tag>
                <Statistic value={a.avg_fare} prefix="₹" style={{ marginTop: 12 }} />
                <Text type="secondary">±₹{a.std_dev}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
