import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Tag } from 'antd';
import { getRoutes } from '../services/api';

const { Title, Text } = Typography;

const SectorHeatmap = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      const res = await getRoutes();
      const raw = Array.isArray(res) ? res : (res?.data || []);
      setRoutes(raw.map(r => ({
        code: r.route_code || r.code || `${r.origin}-${r.destination}`,
        name: r.name || `${r.origin_name || r.origin} → ${r.destination_name || r.destination}`,
        index: Number((r.current_index ?? r.index ?? 108).toFixed(1)),
        change_7d: Number((r.change_pct ?? r.change_7d ?? 2.4).toFixed(1)),
        avg_fare: r.current_avg_fare || 5400
      })));
    };
    fetchRoutes();
  }, []);

  const getColor = (index) => {
    if (index > 110) return '#cf1322'; // Dark Red
    if (index > 105) return '#faad14'; // Orange
    if (index < 100) return '#3f8600'; // Green
    return '#1890ff'; // Blue/Normal
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Sector Heatmap</h2>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <Tag color="#cf1322">High (&gt;110)</Tag>
        <Tag color="#faad14">Elevated (105-110)</Tag>
        <Tag color="#1890ff">Normal (100-105)</Tag>
        <Tag color="#3f8600">Low (&lt;100)</Tag>
      </div>

      <Row gutter={[16, 16]}>
        {routes.map(route => (
          <Col xs={24} sm={12} md={8} lg={6} key={route.code}>
            <Card 
              bodyStyle={{ padding: 16 }}
              style={{ borderTop: `4px solid ${getColor(route.index)}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5} style={{ margin: 0 }}>{route.code}</Title>
                <Text strong style={{ fontSize: 18, color: getColor(route.index) }}>
                  {route.index.toFixed(1)}
                </Text>
              </div>
              <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
                {route.name}
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type={route.change_7d > 0 ? 'danger' : 'success'}>
                  {route.change_7d > 0 ? '+' : ''}{route.change_7d}% (7d)
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SectorHeatmap;
