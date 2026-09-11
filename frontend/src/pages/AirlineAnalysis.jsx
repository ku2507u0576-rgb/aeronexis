import React, { useEffect, useState } from 'react';
import { Card, Table, Row, Col } from 'antd';
import { Bar } from 'react-chartjs-2';
import { getAirlines } from '../services/api';
import { formatCurrency } from '../utils/formatters';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AirlineAnalysis = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAirlines();
      // Ensure we have an array, normalize field names between API and mock shapes
      const arr = Array.isArray(res) ? res : [];
      setData(arr.map(a => ({
        code: a.code || a.airline_code || '',
        name: a.name || a.airline_name || '',
        avg_fare: a.avg_fare || 0,
        index: a.index || a.current_index || 0,
        market_share: a.market_share || a.market_share_pct || 0,
        mom_change: a.mom_change || a.change_yoy || 0,
      })));
    };
    fetchData();
  }, []);

  const columns = [
    { title: 'Airline', dataIndex: 'name', key: 'name', fontWeight: 'bold' },
    { title: 'Avg Fare', dataIndex: 'avg_fare', key: 'avg_fare', render: val => formatCurrency(val) },
    { title: 'Index', dataIndex: 'index', key: 'index' },
    { title: 'Market Share', dataIndex: 'market_share', key: 'market_share', render: val => `${val}%` },
    { title: 'MoM Change', dataIndex: 'mom_change', key: 'mom_change', render: val => <span style={{ color: val > 0 ? '#cf1322' : '#3f8600' }}>{val > 0 ? '+' : ''}{val}%</span> }
  ];

  const barData = {
    labels: data.map(d => d.name),
    datasets: [{
      label: 'Average Fare (₹)',
      data: data.map(d => d.avg_fare),
      backgroundColor: '#1890ff'
    }]
  };

  const pieData = {
    labels: data.map(d => d.name),
    datasets: [{
      data: data.map(d => d.market_share),
      backgroundColor: ['#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600']
    }]
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Airline Competitive Analysis</h2>
      </div>

      <Table columns={columns} dataSource={data} rowKey="code" pagination={false} style={{ marginBottom: 24 }} />

      <Row gutter={24}>
        <Col span={12}>
          <Card title="Average Fare by Airline" style={{ height: 400 }} bodyStyle={{ height: 'calc(100% - 58px)' }}>
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Market Share (Quotes)" style={{ height: 400 }} bodyStyle={{ height: 'calc(100% - 58px)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '80%' }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AirlineAnalysis;
