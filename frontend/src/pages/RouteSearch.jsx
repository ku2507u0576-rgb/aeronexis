import React, { useState, useCallback, useEffect } from 'react';
import { Select, Skeleton, Tag, Typography, Tabs, Tooltip, Slider, Checkbox, Row, Col, Badge, DatePicker } from 'antd';
import {
  SearchOutlined, ThunderboltOutlined, ReloadOutlined,
  ExclamationCircleOutlined, HistoryOutlined, FilterOutlined
} from '@ant-design/icons';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip as CTooltip, Legend, Filler
} from 'chart.js';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import BookingModal from '../components/BookingModal';

dayjs.extend(relativeTime);
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, CTooltip, Legend, Filler);

const { Option } = Select;
const { Text } = Typography;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C = { primary: '#185FA5', accent: '#D97B4F', success: '#3B6D11', warning: '#BA7517', bg: '#F0F4FA', border: 'rgba(24,95,165,0.10)', text: '#1a1a2e', muted: '#64748b' };

const AIRPORTS = [
  { code: 'DEL', city: 'New Delhi',  name: 'Indira Gandhi Intl',      state: 'Delhi',        emoji: '🏛️' },
  { code: 'BOM', city: 'Mumbai',     name: 'Chhatrapati Shivaji Intl', state: 'Maharashtra',  emoji: '🌊' },
  { code: 'BLR', city: 'Bengaluru',  name: 'Kempegowda Intl',          state: 'Karnataka',    emoji: '💻' },
  { code: 'HYD', city: 'Hyderabad',  name: 'Rajiv Gandhi Intl',        state: 'Telangana',    emoji: '🕌' },
  { code: 'MAA', city: 'Chennai',    name: 'Chennai Intl',             state: 'Tamil Nadu',   emoji: '🌴' },
  { code: 'CCU', city: 'Kolkata',    name: 'Netaji Subhas Intl',       state: 'West Bengal',  emoji: '🎭' },
];

const POPULAR = [
  { o: 'DEL', d: 'BOM' }, { o: 'DEL', d: 'BLR' }, { o: 'BOM', d: 'BLR' },
  { o: 'DEL', d: 'HYD' }, { o: 'MAA', d: 'DEL' }, { o: 'BOM', d: 'DEL' },
];

const AIRLINE_COLORS = { '6E': '#0A2472', 'AI': '#C0392B', 'IX': '#E67E22', 'SG': '#27AE60', 'QP': '#8E44AD' };

const fmt = (v) => `₹${Math.round(v || 0).toLocaleString('en-IN')}`;

const API = axios.create({
  baseURL: 'http://localhost:8000/v1',
  headers: { 'X-API-Key': 'apix-demo-key-2026' },
  timeout: 15000,
});

const fetchWithRetry = async (fn, n = 3) => {
  for (let i = 0; i < n; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === n - 1) throw e;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 800 + Math.random() * 200));
    }
  }
};

// ─── FARE CARD ────────────────────────────────────────────────────────────────
const FareCard = ({ airline, index, onBook, result, selectedClass, setSelectedClass, passengers = 1, travelDate }) => {
  const [expanded, setExpanded] = useState(false);
  const isCheapest = index === 0;
  const cp = airline.class_prices?.[selectedClass] || { price: airline.avg_fare, taxes: Math.round(airline.avg_fare * 0.09), total: Math.round(airline.avg_fare * 1.09), seats_left: 6 };
  const COLOR = AIRLINE_COLORS[airline.airline_code] || C.primary;

  // Departure times per airline
  const DEPS = { '6E': '07:15', 'AI': '10:30', 'IX': '13:45', 'SG': '16:00', 'QP': '20:20' };
  const DURS = { '6E': 140, 'AI': 145, 'IX': 155, 'SG': 150, 'QP': 165 };
  const dep = DEPS[airline.airline_code] || '09:00';
  const dur = DURS[airline.airline_code] || 150;
  const arrMin = parseInt(dep.split(':')[0]) * 60 + parseInt(dep.split(':')[1]) + dur;
  const arr = `${String(Math.floor(arrMin / 60) % 24).padStart(2, '0')}:${String(arrMin % 60).padStart(2, '0')}`;

  return (
    <div className={`fare-card glass-card${isCheapest ? ' cheapest' : ''}`}
      style={{ borderLeft: `4px solid ${COLOR}`, marginBottom: 10 }}>
      {isCheapest && (
        <div style={{ background: C.success, color: 'white', fontSize: 9, fontWeight: 800, letterSpacing: 2, padding: '3px 16px', textAlign: 'center' }}>
          ✓ BEST PRICE
        </div>
      )}
      <div style={{ padding: '14px 20px' }}>
        <Row align="middle" gutter={[12, 8]}>

          {/* Airline + Flight */}
          <Col xs={24} sm={6}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: `${COLOR}18`, border: `1.5px solid ${COLOR}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: COLOR }}>
                {airline.airline_code}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.text, lineHeight: 1.2 }}>{airline.airline_name}</div>
                <div style={{ fontSize: 10, color: C.muted }}>Non-stop · {Math.floor(dur / 60)}h {dur % 60}m</div>
              </div>
            </div>
          </Col>

          {/* Times */}
          <Col xs={24} sm={7}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.text, lineHeight: 1 }}>{dep}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{result?.origin}</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 1, background: `${COLOR}50`, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', color: COLOR, fontSize: 14 }}>✈</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.text, lineHeight: 1 }}>{arr}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{result?.destination}</div>
              </div>
            </div>
          </Col>

          {/* Class tabs inline */}
          <Col xs={24} sm={6}>
            <div style={{ display: 'flex', gap: 5 }}>
              {[
                { k: 'Economy', label: 'Eco' },
                { k: 'PremiumEconomy', label: 'Prem' },
                { k: 'Business', label: 'Biz' },
              ].map(cls => {
                const price = airline.class_prices?.[cls.k]?.total || 0;
                const sel = selectedClass === cls.k;
                return (
                  <button key={cls.k} onClick={() => setSelectedClass(cls.k)}
                    style={{ flex: 1, padding: '4px 4px', borderRadius: 7, border: `1.5px solid ${sel ? COLOR : '#e2e8f0'}`, background: sel ? `${COLOR}12` : 'transparent', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: sel ? COLOR : C.muted }}>{cls.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: sel ? COLOR : C.text }}>{fmt(price)}</div>
                  </button>
                );
              })}
            </div>
          </Col>

          {/* Price + Book */}
          <Col xs={24} sm={5} style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: COLOR, lineHeight: 1 }}>{fmt(cp.total * passengers)}</div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
              {passengers > 1 ? `${fmt(cp.total)} × ${passengers} passengers` : 'per passenger'}
            </div>
            {cp.seats_left <= 5 && (
              <div style={{ fontSize: 10, color: '#e53e3e', fontWeight: 700, marginBottom: 6 }}>🔥 {cp.seats_left} left</div>
            )}
            <button className="btn-book-now" onClick={() => onBook(airline)}>
              Book →
            </button>
          </Col>
        </Row>

        {/* Expandable breakdown */}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setExpanded(!expanded)}
            style={{ fontSize: 11, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {expanded ? '▲ Hide details' : '▼ Fare breakdown'}
          </button>
        </div>

        {expanded && (
          <div className="fare-expand-in" style={{ marginTop: 10, background: C.bg, borderRadius: 10, padding: '12px 16px' }}>
            <Row gutter={16}>
              {[
                { l: 'Base Fare', v: cp.price * passengers },
                { l: 'Taxes', v: cp.taxes * passengers },
                { l: 'Conv. Fee', v: Math.round(cp.total * 0.02 * passengers) },
                { l: `Total (${passengers} pax)`, v: (cp.total + Math.round(cp.total * 0.02)) * passengers, bold: true },
              ].map(r => (
                <Col span={6} key={r.l}>
                  <div style={{ fontSize: 10, color: C.muted }}>{r.l}</div>
                  <div style={{ fontWeight: r.bold ? 800 : 600, color: r.bold ? C.primary : C.text, fontSize: r.bold ? 15 : 13 }}>{fmt(r.v)}</div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const RouteSearch = () => {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedClass, setSelectedClass] = useState('Economy');
  const [travelDate, setTravelDate] = useState(dayjs().add(1, 'day'));
  const [passengers, setPassengers] = useState(1);
  const [priceRange, setPriceRange] = useState([2000, 15000]);
  const [filterAirlines, setFilterAirlines] = useState([]);
  const [source, setSource] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('apixHistory') || '[]'); } catch { return []; }
  });

  const doSearch = useCallback(async (org, dst) => {
    if (!org || !dst || org === dst) return;
    setLoading(true); setError(null);
    try {
      const res = await fetchWithRetry(() => API.get('/route-search', { params: { origin: org, destination: dst } }));
      setResult(res.data.data);
      setSource(res.data._source || 'live');
      setLastUpdated(new Date());
      const entry = { o: org, d: dst, ts: dayjs().format('DD MMM HH:mm') };
      const h = [entry, ...history.filter(x => !(x.o === org && x.d === dst))].slice(0, 5);
      setHistory(h);
      localStorage.setItem('apixHistory', JSON.stringify(h));
    } catch (e) {
      setError(e.response?.status === 404 ? 'No data for this route yet.' : 'API unavailable — please ensure backend is running on port 8000.');
    } finally { setLoading(false); }
  }, [history]);

  useEffect(() => { doSearch('DEL', 'BOM'); }, []);

  const swap = () => { setOrigin(destination); setDestination(origin); };
  const quickSearch = (o, d) => { setOrigin(o); setDestination(d); doSearch(o, d); };

  const allAirlines = result?.airlines || [];
  const filtered = allAirlines
    .filter(a => filterAirlines.length === 0 || filterAirlines.includes(a.airline_code))
    .filter(a => {
      const p = a.class_prices?.[selectedClass]?.total || a.avg_fare;
      return p >= priceRange[0] && p <= priceRange[1];
    });

  const display = {
    all: filtered,
    lowest: [...filtered].sort((a, b) => (a.class_prices?.[selectedClass]?.total || a.avg_fare) - (b.class_prices?.[selectedClass]?.total || b.avg_fare)).slice(0, 3),
    value: filtered.filter(a => a.savings_vs_avg >= 0),
  }[activeTab] || filtered;

  return (
    <div style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* ── Search Card ── */}
      <div style={{ background: `linear-gradient(135deg, #0f1c3f 0%, ${C.primary} 100%)`, borderRadius: 20, padding: '24px 28px', marginBottom: 16, boxShadow: `0 20px 60px rgba(24,95,165,0.28)`, position: 'relative', overflow: 'hidden' }}>
        {/* bg bubbles */}
        {[0,1,2].map(i => (
          <div key={i} style={{ position: 'absolute', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', width: [100,80,60][i], height: [100,80,60][i], top: [`10%`,`60%`,`20%`][i], left: [`5%`,`70%`,`85%`][i], animation: `floatBubble ${[10,8,12][i]}s ease-in-out infinite`, animationDelay: `${i*2}s`, pointerEvents: 'none' }} />
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,153,51,0.9)', letterSpacing: 4, fontWeight: 700 }}>✈ REAL-TIME FARE SEARCH</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {history.length > 0 && (
              <Select size="small" placeholder="Recent" style={{ width: 150 }} bordered={false}
                suffixIcon={<HistoryOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
                dropdownStyle={{ borderRadius: 10 }}
                onChange={v => { const [o, d] = v.split('-'); setOrigin(o); setDestination(d); }}>
                {history.map((h, i) => <Option key={i} value={`${h.o}-${h.d}`}>{h.o} → {h.d}</Option>)}
              </Select>
            )}
          </div>
        </div>

        <Row gutter={[10, 10]} align="middle">
          <Col xs={24} sm={5}>
            <div style={{ fontSize: 9, color: 'rgba(255,153,51,0.85)', letterSpacing: 3, fontWeight: 700, marginBottom: 5 }}>FROM</div>
            <Select value={origin} onChange={setOrigin} size="large" style={{ width: '100%' }} showSearch
              optionLabelProp="label" filterOption={(i, o) => o.label?.toLowerCase().includes(i.toLowerCase())}
              dropdownStyle={{ borderRadius: 12 }}>
              {AIRPORTS.map(a => (
                <Option key={a.code} value={a.code} label={`${a.code} · ${a.city}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                    <span style={{ fontSize: 18 }}>{a.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{a.code} <span style={{ fontWeight: 500 }}>{a.city}</span></div>
                      <div style={{ fontSize: 10, color: '#aaa' }}>{a.name}</div>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={1} style={{ textAlign: 'center', paddingTop: 18 }}>
            <button className="swap-btn" onClick={swap} title="Swap">⇄</button>
          </Col>

          <Col xs={24} sm={5}>
            <div style={{ fontSize: 9, color: 'rgba(255,153,51,0.85)', letterSpacing: 3, fontWeight: 700, marginBottom: 5 }}>TO</div>
            <Select value={destination} onChange={setDestination} size="large" style={{ width: '100%' }} showSearch
              optionLabelProp="label" filterOption={(i, o) => o.label?.toLowerCase().includes(i.toLowerCase())}
              dropdownStyle={{ borderRadius: 12 }}>
              {AIRPORTS.map(a => (
                <Option key={a.code} value={a.code} label={`${a.code} · ${a.city}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                    <span style={{ fontSize: 18 }}>{a.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{a.code} <span style={{ fontWeight: 500 }}>{a.city}</span></div>
                      <div style={{ fontSize: 10, color: '#aaa' }}>{a.name}</div>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={4}>
            <div style={{ fontSize: 9, color: 'rgba(255,153,51,0.85)', letterSpacing: 3, fontWeight: 700, marginBottom: 5 }}>DATE</div>
            <DatePicker
              value={travelDate}
              onChange={d => setTravelDate(d || dayjs().add(1, 'day'))}
              format="DD MMM YYYY"
              disabledDate={c => c && c < dayjs().startOf('day')}
              size="large"
              style={{ width: '100%', borderRadius: 10 }}
              allowClear={false}
            />
          </Col>

          <Col xs={24} sm={3}>
            <div style={{ fontSize: 9, color: 'rgba(255,153,51,0.85)', letterSpacing: 3, fontWeight: 700, marginBottom: 5 }}>PASSENGERS</div>
            <Select value={passengers} onChange={setPassengers} size="large" style={{ width: '100%' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <Option key={n} value={n}>{n} {n === 1 ? 'Person' : 'Persons'}</Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={3}>
            <div style={{ fontSize: 9, color: 'rgba(255,153,51,0.85)', letterSpacing: 3, fontWeight: 700, marginBottom: 5 }}>CLASS</div>
            <Select value={selectedClass} onChange={setSelectedClass} size="large" style={{ width: '100%' }}>
              <Option value="Economy">Economy</Option>
              <Option value="PremiumEconomy">Prem Eco</Option>
              <Option value="Business">Business</Option>
            </Select>
          </Col>

          <Col xs={24} sm={3} style={{ paddingTop: 18 }}>
            <button className={`search-btn${loading ? ' loading' : ''}`} onClick={() => doSearch(origin, destination)} disabled={loading} style={{ width: '100%', height: 40 }}>
              {loading
                ? <span className="search-btn-inner"><span className="plane-fly">✈</span> Searching…</span>
                : <span className="search-btn-inner"><SearchOutlined /> Search</span>}
            </button>
          </Col>
        </Row>
      </div>

      {/* ── Popular Routes ── */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Popular:</span>
        {POPULAR.map(r => (
          <button key={r.o + r.d} onClick={() => quickSearch(r.o, r.d)} className="route-chip"
            style={{ background: origin === r.o && destination === r.d ? C.accent : 'white', color: origin === r.o && destination === r.d ? 'white' : C.text, borderColor: origin === r.o && destination === r.d ? C.accent : '#e2e8f0' }}>
            {r.o} → {r.d}
          </button>
        ))}
        {lastUpdated && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: source === 'cache' ? C.warning : C.success }}>
            ● {source === 'cache' ? 'Cached' : 'Live'} · {dayjs(lastUpdated).fromNow()}
          </span>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', border: `1px solid ${C.border}` }}>
          <ExclamationCircleOutlined style={{ fontSize: 40, color: C.warning }} />
          <div style={{ fontWeight: 700, marginTop: 12, marginBottom: 6, color: C.text }}>{error}</div>
          <button onClick={() => doSearch(origin, destination)} style={{ marginTop: 8, background: C.primary, color: 'white', border: 'none', padding: '10px 24px', borderRadius: 20, fontWeight: 700, cursor: 'pointer' }}>
            <ReloadOutlined /> Retry
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && !error && result && (
        <Row gutter={[16, 16]}>
          {/* Filters sidebar */}
          <Col xs={0} md={5}>
            <div className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span><FilterOutlined /> Filters</span>
                <button onClick={() => { setFilterAirlines([]); setPriceRange([2000, 15000]); }} style={{ fontSize: 11, color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Reset</button>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>PRICE RANGE</div>
              <Slider range min={2000} max={15000} step={500} value={priceRange} onChange={setPriceRange}
                tooltip={{ formatter: v => fmt(v) }} trackStyle={{ background: C.primary }} handleStyle={{ borderColor: C.primary }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted, marginBottom: 14 }}>
                <span>{fmt(priceRange[0])}</span><span>{fmt(priceRange[1])}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>AIRLINES</div>
              {allAirlines.map(a => (
                <div key={a.airline_code} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                  <Checkbox checked={filterAirlines.length === 0 || filterAirlines.includes(a.airline_code)}
                    onChange={e => {
                      if (filterAirlines.length === 0) {
                        setFilterAirlines(allAirlines.map(x => x.airline_code).filter(c => c !== a.airline_code));
                      } else if (e.target.checked) {
                        const n = [...filterAirlines, a.airline_code];
                        setFilterAirlines(n.length === allAirlines.length ? [] : n);
                      } else {
                        setFilterAirlines(filterAirlines.filter(c => c !== a.airline_code));
                      }
                    }}>
                    <span style={{ fontSize: 12 }}>{a.airline_name.split(' ')[0]}</span>
                  </Checkbox>
                  <span style={{ fontSize: 11, color: C.muted }}>{fmt(a.class_prices?.[selectedClass]?.total || a.avg_fare)}</span>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>ROUTE STATS</div>
              {[
                { l: 'Avg Fare', v: fmt(result.overall_avg_fare), c: C.primary },
                { l: 'Lowest', v: fmt(result.overall_min_fare), c: C.success },
                { l: 'Highest', v: fmt(result.overall_max_fare), c: C.warning },
                { l: 'Quotes', v: result.total_quotes?.toLocaleString(), c: C.text },
              ].map(s => (
                <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{s.l}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</span>
                </div>
              ))}
              {result.potential_savings_pct > 0 && (
                <div style={{ marginTop: 8, padding: '8px 10px', background: `${C.success}12`, borderRadius: 8, fontSize: 11, color: C.success }}>
                  <ThunderboltOutlined /> Book {result.best_booking_window?.label} ahead — save {result.potential_savings_pct?.toFixed(1)}%
                </div>
              )}
            </div>
          </Col>

          {/* Main results */}
          <Col xs={24} md={19}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {[
                { k: 'all', l: `All (${filtered.length})` },
                { k: 'lowest', l: '↓ Cheapest 3' },
                { k: 'value', l: '💚 Best Value' },
              ].map(t => (
                <button key={t.k} onClick={() => setActiveTab(t.k)}
                  style={{ padding: '6px 16px', borderRadius: 18, border: `1.5px solid ${activeTab === t.k ? C.primary : '#e2e8f0'}`, background: activeTab === t.k ? C.primary : 'white', color: activeTab === t.k ? 'white' : C.text, fontWeight: activeTab === t.k ? 700 : 400, cursor: 'pointer', fontSize: 13, transition: 'all 0.2s' }}>
                  {t.l}
                </button>
              ))}
              {/* Class quick switch */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {['Economy', 'PremiumEconomy', 'Business'].map(cls => (
                  <button key={cls} onClick={() => setSelectedClass(cls)}
                    style={{ padding: '5px 12px', borderRadius: 16, border: `1.5px solid ${selectedClass === cls ? C.accent : '#e2e8f0'}`, background: selectedClass === cls ? `${C.accent}15` : 'white', color: selectedClass === cls ? C.accent : C.text, fontWeight: selectedClass === cls ? 700 : 400, cursor: 'pointer', fontSize: 12, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                    {cls === 'PremiumEconomy' ? 'Prem. Eco' : cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Fare Cards */}
            <div className="fare-cards-container">
              {display.length === 0 ? (
                <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✈️</div>
                  <div style={{ fontWeight: 700 }}>No flights match the selected filters</div>
                  <button onClick={() => setFilterAirlines([])} style={{ marginTop: 10, color: C.primary, background: 'none', border: `1px solid ${C.primary}`, padding: '6px 18px', borderRadius: 16, cursor: 'pointer' }}>Clear Filters</button>
                </div>
              ) : display.map((a, i) => (
                <FareCard key={a.airline_code} airline={a} index={i}
                  onBook={a => { setSelectedAirline(a); setBookingOpen(true); }}
                  result={result} selectedClass={selectedClass} setSelectedClass={setSelectedClass}
                  passengers={passengers} travelDate={travelDate} />
              ))}
            </div>

            {/* Price chart */}
            {result.price_history?.length > 0 && (
              <div className="glass-card" style={{ padding: 20, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, color: C.text }}>📈 32-Day Price Trend</div>
                <div style={{ height: 160 }}>
                  <Line
                    data={{ labels: result.price_history.map(h => dayjs(h.date).format('DD MMM')), datasets: [{ data: result.price_history.map(h => h.avg_fare), borderColor: C.primary, backgroundColor: `${C.primary}10`, tension: 0.4, fill: true, pointRadius: 2, borderWidth: 2 }] }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => `₹${(v/1000).toFixed(0)}k`, font: { size: 10 } }, grid: { color: '#f0f0f0' } }, x: { ticks: { maxTicksLimit: 8, font: { size: 10 } }, grid: { display: false } } } }}
                  />
                </div>
              </div>
            )}
          </Col>
        </Row>
      )}

      {/* Booking Modal */}
      <BookingModal
        visible={bookingOpen}
        onClose={() => setBookingOpen(false)}
        routeData={result}
        selectedAirline={selectedAirline}
        travelDate={travelDate}
        passengers={passengers}
      />

      {/* ── Inline styles ── */}
      <style>{`
        .glass-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 14px;
          box-shadow: 0 4px 24px rgba(24,95,165,0.07);
          transition: all 0.25s ease;
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.95);
          box-shadow: 0 8px 32px rgba(24,95,165,0.13);
          transform: translateY(-2px);
        }
        .fare-card.cheapest {
          border-top: 2px solid ${C.success} !important;
        }
        .fare-card {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default RouteSearch;
