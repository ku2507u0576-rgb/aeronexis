import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Input, Button, Spin, Typography, Badge, Modal, Result, Divider, Space } from 'antd';
import { SearchOutlined, PrinterOutlined, IdcardOutlined, CheckCircleOutlined, UserOutlined, CalendarOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

import { api as API } from '../services/api';


const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pnrQuery, setPnrQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/bookings');
      if (res.data.status === 'success') {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePnrSearch = async () => {
    if (!pnrQuery.trim()) {
      fetchBookings();
      return;
    }
    setLoading(true);
    try {
      const res = await API.get(`/bookings/${pnrQuery.trim()}`);
      if (res.data.status === 'success') {
        setBookings([res.data.data]);
      }
    } catch (err) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'PNR Code',
      dataIndex: 'pnr',
      key: 'pnr',
      render: (pnr, row) => (
        <span style={{ fontWeight: 800, color: '#FF9933', fontFamily: 'monospace', fontSize: 16 }}>
          {pnr}
        </span>
      ),
    },
    {
      title: 'Passenger',
      dataIndex: 'passenger_name',
      key: 'passenger_name',
      render: (name, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{row.passenger_email}</div>
        </div>
      ),
    },
    {
      title: 'Route',
      key: 'route',
      render: (_, row) => (
        <span style={{ fontWeight: 700 }}>
          {row.origin} ({row.origin_city}) ✈ {row.destination} ({row.destination_city})
        </span>
      ),
    },
    {
      title: 'Airline & Flight',
      key: 'airline',
      render: (_, row) => (
        <div>
          <div>{row.airline_name}</div>
          <Tag color="blue">{row.flight_number}</Tag>
        </div>
      ),
    },
    {
      title: 'Departure',
      dataIndex: 'departure_date',
      key: 'departure_date',
      render: d => <span style={{ color: '#1890ff', fontWeight: 600 }}>{d}</span>,
    },
    {
      title: 'Seat',
      dataIndex: 'seat_number',
      key: 'seat_number',
      render: s => <Tag color="purple" style={{ fontWeight: 700 }}>{s}</Tag>,
    },
    {
      title: 'Total Paid',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: v => <span style={{ fontWeight: 800, color: '#52c41a' }}>{fmt(v)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: s => <Tag color="green">{s}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, row) => (
        <Button
          type="outline"
          size="small"
          icon={<IdcardOutlined />}
          style={{ borderColor: '#1890ff', color: '#1890ff', fontWeight: 600 }}
          onClick={() => setSelectedTicket(row)}
        >
          E-Ticket
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>🎫 My Flight Bookings</Title>
          <Text type="secondary">View and print all confirmed tickets stored directly in the database</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchBookings}>Refresh</Button>
      </div>

      {/* PNR Search Box */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={16} md={18}>
            <Input
              size="large"
              placeholder="Search by PNR Code (e.g. IX-Z3PA)..."
              prefix={<SearchOutlined />}
              value={pnrQuery}
              onChange={e => setPnrQuery(e.target.value)}
              onPressEnter={handlePnrSearch}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Button
              type="primary"
              size="large"
              block
              onClick={handlePnrSearch}
              style={{ background: '#FF9933', border: 'none', fontWeight: 700 }}
            >
              Lookup PNR
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table of Bookings */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={bookings}
          columns={columns}
          rowKey="pnr"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No flight bookings found.' }}
        />
      </Card>

      {/* Ticket Modal */}
      {selectedTicket && (
        <Modal
          open={!!selectedTicket}
          onCancel={() => setSelectedTicket(null)}
          footer={null}
          width={650}
          centered
        >
          <Card
            style={{
              borderRadius: 16,
              border: '2px dashed #1890ff',
              background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              marginTop: 16
            }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed #d9d9d9', paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 11, letterSpacing: 1 }}>OFFICIAL BOARDING PASS</Text>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#001529' }}>{selectedTicket.airline_name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>PNR NUMBER</Text>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FF9933', letterSpacing: 2 }}>{selectedTicket.pnr}</div>
              </div>
            </div>

            <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
              <Col span={9}>
                <div style={{ fontSize: 28, fontWeight: 900 }}>{selectedTicket.origin}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{selectedTicket.origin_city}</div>
              </Col>
              <Col span={6} style={{ textAlign: 'center' }}>
                <div style={{ color: '#1890ff', fontSize: 20 }}>✈</div>
                <Tag color="blue">{selectedTicket.flight_number}</Tag>
              </Col>
              <Col span={9} style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 900 }}>{selectedTicket.destination}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{selectedTicket.destination_city}</div>
              </Col>
            </Row>

            <Divider style={{ margin: '12px 0' }} />

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11 }}>PASSENGER</Text>
                <div style={{ fontWeight: 700 }}>{selectedTicket.passenger_name}</div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11 }}>DEPARTURE DATE</Text>
                <div style={{ fontWeight: 700 }}>{selectedTicket.departure_date}</div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11 }}>SEAT</Text>
                <div style={{ fontWeight: 900, color: '#722ed1', fontSize: 18 }}>{selectedTicket.seat_number}</div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11 }}>CLASS</Text>
                <div style={{ fontWeight: 600 }}>{selectedTicket.fare_class}</div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11 }}>STATUS</Text>
                <div><Tag color="green">{selectedTicket.status}</Tag></div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11 }}>TOTAL PAID</Text>
                <div style={{ fontWeight: 800, color: '#52c41a' }}>{fmt(selectedTicket.total_amount)}</div>
              </Col>
            </Row>

            <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid #eee', textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 6, color: '#555' }}>
                ||| | |||| || ||| |||| | || |||| |
              </div>
              <Text type="secondary" style={{ fontSize: 10 }}>CONFIRMED IN APIX DATABASE</Text>
            </div>
          </Card>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Button icon={<PrinterOutlined />} type="primary" onClick={() => window.print()}>
              Print Ticket
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyBookings;
