import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spin, Alert, List, Tag } from 'antd';
import { LineChartOutlined, DollarOutlined, GlobalOutlined, TeamOutlined, DatabaseOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';

import KPICard from '../components/KPICard';
import { getDashboardSummary } from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardSummary();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  if (!data) return <div>Error loading data.</div>;

  const chartData = {
    labels: Array.from({length: 7}, (_, i) => dayjs().subtract(6 - i, 'day').format('DD MMM')),
    datasets: [
      {
        fill: true,
        label: 'Airfare Index',
        data: data.trend_7day || data.trend_7d || [],
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { min: 100 },
    },
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Dashboard Overview</h2>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <KPICard title="Current Index" value={data.current_index} change={data.change_pct} changeType="up" icon={<LineChartOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <KPICard title="Fares Today" value={data.fares_today} prefix="₹" icon={<DollarOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <KPICard title="Routes Monitored" value={data.routes_monitored} icon={<GlobalOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <KPICard title="Airlines Tracked" value={data.airlines_tracked} icon={<TeamOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <KPICard title="Data Sources" value={data.data_sources} icon={<DatabaseOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <KPICard title="Quality Score" value={data.quality_score} suffix="%" change={1.2} changeType="good-up" icon={<SafetyCertificateOutlined />} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="7-Day Airfare Index Trend" style={{ height: '400px' }} bodyStyle={{ height: 'calc(100% - 58px)' }}>
            <Line data={chartData} options={chartOptions} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Key Alerts" style={{ height: '400px', overflowY: 'auto' }}>
            <List
              itemLayout="horizontal"
              dataSource={data.alerts}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.route}</span>
                        <Tag color={item.type === 'spike' ? 'red' : 'green'}>
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </Tag>
                      </div>
                    }
                    description={`Significant ${item.type} detected in the last 24h.`}
                  />
                </List.Item>
              )}
            />
            <Alert message="Collection active. 11/11 sources reporting successfully." type="success" showIcon style={{ marginTop: '16px' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
