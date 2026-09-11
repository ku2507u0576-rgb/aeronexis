import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Statistic, Descriptions, Drawer } from 'antd';
import { getRoutes } from '../services/api';
import { formatCurrency, getStatusColor, getStatusEmoji } from '../utils/formatters';
import IndiaRouteMap from '../components/IndiaRouteMap/IndiaRouteMap';

const CITIES = {
  DEL: { name: 'Delhi', x: 280, y: 120, state: 'NCR' },
  BOM: { name: 'Mumbai', x: 160, y: 320, state: 'Maharashtra' },
  BLR: { name: 'Bangalore', x: 230, y: 460, state: 'Karnataka' },
  HYD: { name: 'Hyderabad', x: 270, y: 360, state: 'Telangana' },
  MAA: { name: 'Chennai', x: 310, y: 450, state: 'Tamil Nadu' },
  CCU: { name: 'Kolkata', x: 420, y: 220, state: 'West Bengal' },
};

export default function RouteAnalysis() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    getRoutes().then(res => {
      const arr = Array.isArray(res) ? res : (res?.data || []);
      setRoutes(arr);
    }).catch(console.error);
  }, []);

  const getRouteColor = (index) => {
    if (index < 105) return '#52c41a';
    if (index <= 110) return '#faad14';
    return '#ff4d4f';
  };

  const handleRouteClick = (route) => {
    setSelectedRoute(route);
    setDrawerOpen(true);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>🗺️ Route Analysis — India Network Map</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>Interactive route network. Click any route for detailed analysis.</p>

      <Row gutter={16}>
        <Col span={14}>
          <IndiaRouteMap
            origin={selectedRoute?.origin || 'DEL'}
            destination={selectedRoute?.destination || 'BOM'}
            distanceKm={selectedRoute?.distance_km}
            avgFare={selectedRoute?.current_avg_fare}
            onSelectAirport={(code) => {
              // Find matching route or set as destination
              const match = routes.find(r => r.origin === (selectedRoute?.origin || 'DEL') && r.destination === code);
              if (match) {
                handleRouteClick(match);
              } else {
                const anyMatch = routes.find(r => r.destination === code || r.origin === code);
                if (anyMatch) handleRouteClick(anyMatch);
              }
            }}
          />
        </Col>

        <Col span={10}>
          <Card title="📊 Route Network Summary" size="small" style={{ maxHeight: 620, overflowY: 'auto' }}>
            {routes.map((route, i) => (
              <div key={i} onClick={() => handleRouteClick(route)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                <Tag color="blue">{route.origin} → {route.destination}</Tag>
                <span>{getStatusEmoji(route.current_index || 105)} {(route.current_index || 105).toFixed(1)}</span>
                <Tag color={getStatusColor(route.current_index || 105)}>{route.change_pct > 0 ? '+' : ''}{(route.change_pct || 0).toFixed(1)}%</Tag>
                <span style={{ color: '#666' }}>{formatCurrency(route.current_avg_fare || 5000)}</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Drawer title={`Route: ${selectedRoute?.origin} → ${selectedRoute?.destination}`} placement="right" onClose={() => setDrawerOpen(false)} open={drawerOpen} width={400}>
        {selectedRoute && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Route">{selectedRoute.origin} ↔ {selectedRoute.destination}</Descriptions.Item>
              <Descriptions.Item label="Distance">{selectedRoute.distance_km?.toLocaleString()} km</Descriptions.Item>
              <Descriptions.Item label="Current Index">{(selectedRoute.current_index || 108).toFixed(1)}</Descriptions.Item>
              <Descriptions.Item label="Avg Fare">{formatCurrency(selectedRoute.current_avg_fare || 5200)}</Descriptions.Item>
              <Descriptions.Item label="Change">{selectedRoute.change_pct > 0 ? '+' : ''}{(selectedRoute.change_pct || 3.2).toFixed(1)}%</Descriptions.Item>
              <Descriptions.Item label="Annual Passengers">{(selectedRoute.annual_passengers || 45000000).toLocaleString('en-IN')}</Descriptions.Item>
              <Descriptions.Item label="Airlines Tracked">{selectedRoute.airlines_tracked || 5}</Descriptions.Item>
              <Descriptions.Item label="Demand Tier"><Tag color="gold">{selectedRoute.demand_tier || 'Tier-1'}</Tag></Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
}
