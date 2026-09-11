import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import AirplaneIntro from './components/AirplaneIntro/AirplaneIntro';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AirfareIndex from './pages/AirfareIndex';
import FlightFares from './pages/FlightFares';
import AdvanceBooking from './pages/AdvanceBooking';
import RouteAnalysis from './pages/RouteAnalysis';
import PriceTrends from './pages/PriceTrends';
import AirlineAnalysis from './pages/AirlineAnalysis';
import DataQuality from './pages/DataQuality';
import CollectionStatus from './pages/CollectionStatus';
import SectorHeatmap from './pages/SectorHeatmap';
import APIExport from './pages/APIExport';
import RouteSearch from './pages/RouteSearch';
import MyBookings from './pages/MyBookings';

const { Content } = Layout;

function App() {
  const [showIntro, setShowIntro] = useState(true); // Always show video intro on load

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <AirplaneIntro onComplete={handleIntroComplete} />}
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Navbar />
          <Content style={{ margin: '24px 16px 0', padding: 24, minHeight: 280, background: '#f0f2f5' }}>
            <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/index" element={<AirfareIndex />} />
              <Route path="/fares" element={<FlightFares />} />
              <Route path="/advance-booking" element={<AdvanceBooking />} />
              <Route path="/routes" element={<RouteAnalysis />} />
              <Route path="/trends" element={<PriceTrends />} />
              <Route path="/airlines" element={<AirlineAnalysis />} />
              <Route path="/data-quality" element={<DataQuality />} />
              <Route path="/collection-status" element={<CollectionStatus />} />
              <Route path="/heatmap" element={<SectorHeatmap />} />
              <Route path="/api-export" element={<APIExport />} />
              <Route path="/route-search" element={<RouteSearch />} />
              <Route path="/my-bookings" element={<MyBookings />} />
            </Routes>
            </ErrorBoundary>
          </Content>
          <Footer />
        </Layout>
      </Layout>
    </>
  );
}

export default App;
