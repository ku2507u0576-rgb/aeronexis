import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  LineChartOutlined,
  TableOutlined,
  CalendarOutlined,
  GlobalOutlined,
  AreaChartOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  HeatMapOutlined,
  ApiOutlined,
  SearchOutlined,
  HomeOutlined,
  IdcardOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const items = [
  { key: '/', icon: <HomeOutlined />, label: 'Home' },
  { key: '/route-search', icon: <SearchOutlined />, label: '🔍 Route Search', style: { background: 'rgba(255,153,51,0.15)', fontWeight: 600 } },
  { key: '/my-bookings', icon: <IdcardOutlined />, label: '🎫 My Bookings', style: { background: 'rgba(82,196,26,0.12)', fontWeight: 600 } },
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/index', icon: <LineChartOutlined />, label: 'Airfare Index' },
  { key: '/fares', icon: <TableOutlined />, label: 'Flight Fares' },
  { key: '/advance-booking', icon: <CalendarOutlined />, label: 'Advance Booking' },
  { key: '/routes', icon: <GlobalOutlined />, label: 'Route Analysis' },
  { key: '/trends', icon: <AreaChartOutlined />, label: 'Price Trends' },
  { key: '/airlines', icon: <TeamOutlined />, label: 'Airline Analysis' },
  { key: '/data-quality', icon: <SafetyCertificateOutlined />, label: 'Data Quality' },
  { key: '/collection-status', icon: <SettingOutlined />, label: 'Collection Status' },
  { key: '/heatmap', icon: <HeatMapOutlined />, label: 'Sector Heatmap' },
  { key: '/api-export', icon: <ApiOutlined />, label: 'API & Export' }
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider breakpoint="lg" collapsedWidth="0" theme="dark" width={220}>
      <div style={{ height: '3px', width: '100%', background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #138808 100%)' }} />
      <div style={{ padding: '16px', color: 'white', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>
        ✈️ Aeronexis
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;
