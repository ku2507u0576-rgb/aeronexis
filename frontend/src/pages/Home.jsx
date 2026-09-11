import React, { useState, useEffect } from 'react';
import { Typography, Button, Row, Col, Statistic, Card } from 'antd';
import {
  ArrowRightOutlined, GlobalOutlined, LineChartOutlined,
  SearchOutlined, SafetyCertificateOutlined, RocketOutlined,
  TeamOutlined, BarChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

import { api as API } from '../services/api';


const Home = () => {
  const navigate = useNavigate();
  const [tickerData, setTickerData] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchLiveFlow = async () => {
      try {
        const dashRes = await API.get('/dashboard-summary');
        setStats(dashRes.data.data);
        const routes = ['DEL-BOM', 'BLR-DEL', 'BOM-BLR', 'DEL-HYD', 'MAA-BOM', 'DEL-CCU', 'MAA-DEL', 'BLR-HYD', 'BOM-DEL', 'DEL-BLR'];
        const flow = [];
        for (const r of routes) {
          const [org, dst] = r.split('-');
          try {
            const res = await API.get('/route-search', { params: { origin: org, destination: dst } });
            if (res.data?.data) {
              const d = res.data.data;
              flow.push(`${org} ✈ ${dst}  ₹${Math.round(d.overall_avg_fare).toLocaleString('en-IN')}  (${d.cheapest_airline} from ₹${Math.round(d.cheapest_price).toLocaleString('en-IN')})`);
            }
          } catch {}
        }
        setTickerData(flow);
      } catch (err) { console.error(err); }
    };
    fetchLiveFlow();
    const interval = setInterval(fetchLiveFlow, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ margin: '-24px', minHeight: 'calc(100vh - 64px)', background: '#0a0e1a', color: 'white', overflow: 'hidden' }}>

      {/* ===== LIVE TICKER ===== */}
      <div style={{ background: 'linear-gradient(90deg, #FF9933, #f5a623, #FF9933)', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative', zIndex: 10 }}>
        <div className="ticker-wrap">
          <div className="ticker-move">
            {tickerData.length > 0 ? (
              <>
                {[...tickerData, ...tickerData, ...tickerData].map((text, i) => (
                  <span key={i} className="ticker-item">🟢 {text}</span>
                ))}
              </>
            ) : (
              <span className="ticker-item">⏳ Fetching live market data from 5 airlines & 6 OTAs...</span>
            )}
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <div style={{ position: 'relative', minHeight: '540px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/airplane-sky.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.25)',
        }} />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,26,0.3) 0%, rgba(10,14,26,0.95) 100%)' }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '60px 24px', maxWidth: 900 }}>
          <div style={{ fontSize: 13, color: '#FF9933', letterSpacing: 6, fontWeight: 700, marginBottom: 16 }}>
            ✈ REAL-TIME AIRFARE PRICE INDEX
          </div>
          <h1 style={{ fontSize: '3.4rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, color: 'white' }}>
            Navigate the Skies.<br/>
            <span style={{ color: '#FF9933' }}>Master the Fares.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', maxWidth: 650, margin: '0 auto 36px', lineHeight: 1.7 }}>
            India's authoritative aviation market intelligence platform. Monitoring fares across
            <strong style={{ color: 'white' }}> 5 airlines</strong>,
            <strong style={{ color: 'white' }}> 10 routes</strong>, and
            <strong style={{ color: 'white' }}> 6 OTAs</strong> with government-grade precision.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button type="primary" size="large" icon={<SearchOutlined />} onClick={() => navigate('/route-search')}
              style={{ height: 54, padding: '0 40px', fontSize: 17, fontWeight: 700, borderRadius: 27, background: '#FF9933', border: 'none', boxShadow: '0 8px 32px rgba(255,153,51,0.45)' }}>
              Search Routes Live
            </Button>
            <Button size="large" icon={<BarChartOutlined />} onClick={() => navigate('/dashboard')}
              style={{ height: 54, padding: '0 36px', fontSize: 17, fontWeight: 600, borderRadius: 27, color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}>
              View Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* ===== LIVE STATS ===== */}
      {stats && (
        <div style={{ padding: '48px 40px', background: 'linear-gradient(180deg, #0a0e1a, #111827)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 11, color: '#FF9933', letterSpacing: 4, fontWeight: 700 }}>📊 LIVE PLATFORM METRICS</span>
          </div>
          <Row gutter={[20, 20]} justify="center">
            <Col xs={12} sm={6}>
              <div className="stat-glass">
                <div className="stat-icon" style={{ background: 'rgba(82,196,26,0.15)', color: '#52c41a' }}><LineChartOutlined /></div>
                <div className="stat-value">{stats.current_index}</div>
                <div className="stat-label">APIx Index</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="stat-glass">
                <div className="stat-icon" style={{ background: 'rgba(24,144,255,0.15)', color: '#1890ff' }}>🗃️</div>
                <div className="stat-value">{stats.fares_today?.toLocaleString()}</div>
                <div className="stat-label">Quotes Processed</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="stat-glass">
                <div className="stat-icon" style={{ background: 'rgba(255,153,51,0.15)', color: '#FF9933' }}><GlobalOutlined /></div>
                <div className="stat-value">{stats.routes_monitored}</div>
                <div className="stat-label">Routes Tracked</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="stat-glass">
                <div className="stat-icon" style={{ background: 'rgba(235,47,150,0.15)', color: '#eb2f96' }}><SafetyCertificateOutlined /></div>
                <div className="stat-value">{stats.quality_score?.toFixed(1)}%</div>
                <div className="stat-label">Data Quality</div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* ===== FEATURE IMAGE CARDS ===== */}
      <div style={{ padding: '48px 40px', background: '#111827' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ fontSize: 11, color: '#FF9933', letterSpacing: 4, fontWeight: 700 }}>🛫 PLATFORM FEATURES</span>
          <h2 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginTop: 12 }}>
            Intelligence at Every Altitude
          </h2>
        </div>
        <Row gutter={[24, 24]} justify="center">
          {/* Card 1 */}
          <Col xs={24} sm={12} lg={8}>
            <div className="feature-card">
              <div className="feature-img" style={{ backgroundImage: 'url(/images/cockpit-view.jpg)' }} />
              <div className="feature-body">
                <h3>🔍 Route Price Search</h3>
                <p>Compare fares across 5 airlines for any route. See min, max, avg prices with live data from 25,000+ quotes.</p>
                <Button type="link" style={{ color: '#FF9933', padding: 0, fontWeight: 600 }} onClick={() => navigate('/route-search')}>
                  Search now <ArrowRightOutlined />
                </Button>
              </div>
            </div>
          </Col>
          {/* Card 2 */}
          <Col xs={24} sm={12} lg={8}>
            <div className="feature-card">
              <div className="feature-img" style={{ backgroundImage: 'url(/images/wing-sunset.jpg)' }} />
              <div className="feature-body">
                <h3>📈 Airfare Price Index</h3>
                <p>Track India's aviation market pulse with APIx — a Laspeyres price index calibrated to base year 2023 = 100.</p>
                <Button type="link" style={{ color: '#FF9933', padding: 0, fontWeight: 600 }} onClick={() => navigate('/index')}>
                  View index <ArrowRightOutlined />
                </Button>
              </div>
            </div>
          </Col>
          {/* Card 3 */}
          <Col xs={24} sm={12} lg={8}>
            <div className="feature-card">
              <div className="feature-img" style={{ backgroundImage: 'url(/images/airport-terminal.jpg)' }} />
              <div className="feature-body">
                <h3>💡 Smart Booking Insights</h3>
                <p>Know the best time to book. Our advance booking analysis shows savings of up to 15% when booked 45 days early.</p>
                <Button type="link" style={{ color: '#FF9933', padding: 0, fontWeight: 600 }} onClick={() => navigate('/advance-booking')}>
                  Explore <ArrowRightOutlined />
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* ===== SECOND IMAGE SECTION — Full width ===== */}
      <div style={{ position: 'relative', padding: '80px 40px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/airplane-overhead.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.2)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,21,41,0.95), rgba(0,21,41,0.6))' }} />
        <Row align="middle" gutter={[40, 40]} style={{ position: 'relative', zIndex: 5, maxWidth: 1100, margin: '0 auto' }}>
          <Col xs={24} md={14}>
            <div style={{ fontSize: 11, color: '#FF9933', letterSpacing: 4, fontWeight: 700, marginBottom: 12 }}>
              🇮🇳 INDIA FOCUSED
            </div>
            <h2 style={{ color: 'white', fontSize: 32, fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>
              Covering Every Major<br/>Indian Aviation Corridor
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              From Delhi to Mumbai, Bengaluru to Kolkata — we monitor the top 10 domestic routes
              that carry over 60% of India's domestic air traffic. Data sourced from IndiGo, Air India,
              SpiceJet, Akasa Air, Air India Express, and 6 leading OTAs.
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#FF9933' }}>6</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Metro Airports</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#52c41a' }}>10</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Routes Monitored</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1890ff' }}>5</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Airlines Tracked</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#eb2f96' }}>11</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Data Sources</div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={10}>
            <img src="/images/india-aerial.jpg" alt="India"
              style={{ width: '100%', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.1)' }}
            />
          </Col>
        </Row>
      </div>

      {/* ===== ROUTE QUICK ACCESS ===== */}
      <div style={{ padding: '48px 40px', background: '#111827', textAlign: 'center' }}>
        <span style={{ fontSize: 11, color: '#FF9933', letterSpacing: 4, fontWeight: 700 }}>⚡ POPULAR ROUTES</span>
        <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginTop: 12, marginBottom: 28 }}>
          Check Live Fares Instantly
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
          {[
            { o: 'DEL', d: 'BOM', l: '🏙️ Delhi → Mumbai' },
            { o: 'DEL', d: 'BLR', l: '🌆 Delhi → Bengaluru' },
            { o: 'BOM', d: 'BLR', l: '💻 Mumbai → Bengaluru' },
            { o: 'DEL', d: 'HYD', l: '🕌 Delhi → Hyderabad' },
            { o: 'MAA', d: 'DEL', l: '🌴 Chennai → Delhi' },
            { o: 'DEL', d: 'CCU', l: '🎭 Delhi → Kolkata' },
          ].map(r => (
            <button key={r.o+r.d} className="route-chip" onClick={() => navigate('/route-search')}>
              {r.l}
            </button>
          ))}
        </div>
      </div>

      {/* ===== FOOTER CTA ===== */}
      <div style={{ padding: '48px 40px', background: 'linear-gradient(135deg, #001529, #003a8c)', textAlign: 'center' }}>
        <div style={{ height: 3, width: 80, margin: '0 auto 24px', background: 'linear-gradient(90deg, #FF9933, #fff, #138808)', borderRadius: 2 }} />
        <h2 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Ready to Explore India's Aviation Data?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>
          Government-grade analytics. Real-time intelligence. All prices in ₹ INR.
        </p>
        <Button type="primary" size="large" icon={<RocketOutlined />} onClick={() => navigate('/route-search')}
          style={{ height: 54, padding: '0 44px', fontSize: 17, fontWeight: 700, borderRadius: 27, background: '#FF9933', border: 'none', boxShadow: '0 8px 32px rgba(255,153,51,0.4)' }}>
          Get Started — Search Routes
        </Button>
      </div>

      {/* ===== STYLES ===== */}
      <style>{`
        .ticker-wrap { width: 100%; overflow: hidden; }
        .ticker-move { display: inline-block; white-space: nowrap; animation: ticker 35s linear infinite; }
        .ticker-item { display: inline-block; padding: 0 36px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; color: #001529; }
        @keyframes ticker { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-33.33%,0,0); } }

        .stat-glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .stat-glass:hover { transform: translateY(-4px); border-color: rgba(255,153,51,0.3); box-shadow: 0 12px 32px rgba(255,153,51,0.15); }
        .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 12px; }
        .stat-value { font-size: 28px; font-weight: 800; color: white; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 4px; letter-spacing: 1px; }

        .feature-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          height: 100%;
        }
        .feature-card:hover { transform: translateY(-6px); border-color: rgba(255,153,51,0.3); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
        .feature-img { height: 180px; background-size: cover; background-position: center; transition: transform 0.5s ease; }
        .feature-card:hover .feature-img { transform: scale(1.05); }
        .feature-body { padding: 20px; }
        .feature-body h3 { color: white; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .feature-body p { color: rgba(255,255,255,0.55); font-size: 13px; line-height: 1.7; margin-bottom: 12px; }

        .route-chip {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8);
          padding: 10px 20px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          outline: none;
        }
        .route-chip:hover { background: #FF9933; color: #001529; border-color: #FF9933; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,153,51,0.35); }
      `}</style>
    </div>
  );
};

export default Home;
