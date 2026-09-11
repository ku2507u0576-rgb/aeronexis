import React, { useState, useEffect } from 'react';
import { Modal, Steps, Form, Input, Select, Row, Col, Divider, Tag, message, Spin, Radio, Alert } from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, CreditCardOutlined,
  MobileOutlined, BankOutlined, CheckCircleOutlined, ArrowLeftOutlined,
  LockOutlined, SafetyOutlined, IdcardOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

import { api as API } from '../services/api';


// Indian name/phone validator
const VALIDATORS = {
  name: (v) => /^[a-zA-Z ]{2,50}$/.test(v?.trim()) ? null : 'Full name (letters only, 2–50 chars)',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Valid email required',
  phone: (v) => /^[6-9]\d{9}$/.test(v) ? null : 'Valid 10-digit Indian mobile number',
  dob: (v) => {
    if (!v) return 'Date of birth required';
    const age = Math.floor((new Date() - new Date(v)) / (1000 * 60 * 60 * 24 * 365));
    return age >= 2 && age <= 100 ? null : 'Passenger must be 2–100 years old';
  },
};

const PAYMENT_METHODS = [
  { id: 'upi', icon: <MobileOutlined />, label: 'UPI', desc: 'GPay, PhonePe, Paytm', color: '#138808' },
  { id: 'card', icon: <CreditCardOutlined />, label: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay', color: '#185FA5' },
  { id: 'netbanking', icon: <BankOutlined />, label: 'Net Banking', desc: 'All major Indian banks', color: '#D97B4F' },
];

const fmt = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`;

const BookingModal = ({ visible, onClose, routeData, selectedAirline, travelDate, passengers = 1 }) => {
  const [step, setStep] = useState(0);
  const [form] = Form.useForm();
  const [selectedClass, setSelectedClass] = useState('Economy');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [errors, setErrors] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0=idle, 1=processing, 2=done

  useEffect(() => {
    if (visible) { setStep(0); setBooking(null); setErrors({}); setPaymentStep(0); form.resetFields(); }
  }, [visible]);

  if (!routeData || !selectedAirline) return null;

  const classData = selectedAirline.class_prices?.[selectedClass] || {
    price: selectedAirline.avg_fare,
    taxes: Math.round(selectedAirline.avg_fare * 0.09),
    total: Math.round(selectedAirline.avg_fare * 1.09),
    seats_left: 7,
  };

  const CLASSES = [
    { key: 'Economy', label: 'Economy', badge: null, mult: 1.0 },
    { key: 'PremiumEconomy', label: 'Premium Economy', badge: 'POPULAR', mult: 1.38 },
    { key: 'Business', label: 'Business', badge: 'BEST', mult: 2.15 },
  ];

  // ── STEP 1: Class & Fare Review ─────────────────────────────────────────────
  const StepOne = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>FLIGHT</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>
          {routeData.origin} → {routeData.destination}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          {selectedAirline.airline_name} &nbsp;·&nbsp; {travelDate ? dayjs(travelDate).format('ddd, DD MMM YYYY') : 'Upcoming'} &nbsp;·&nbsp; {passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 2, marginBottom: 10 }}>SELECT CLASS</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {CLASSES.map(cls => {
            const priceData = selectedAirline.class_prices?.[cls.key];
            const total = priceData?.total || Math.round(selectedAirline.avg_fare * cls.mult * 1.09);
            const isSelected = selectedClass === cls.key;
            const urgentSeats = (priceData?.seats_left || 5) <= 3;
            return (
              <div key={cls.key} onClick={() => setSelectedClass(cls.key)}
                style={{
                  flex: 1, padding: 14, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                  border: isSelected ? '2px solid #185FA5' : '1px solid #e2e8f0',
                  background: isSelected ? '#f0f5ff' : '#fafafa',
                  position: 'relative',
                }}>
                {cls.badge && (
                  <div style={{ position: 'absolute', top: -8, right: 8, background: cls.badge === 'BEST' ? '#D97B4F' : '#185FA5', color: 'white', fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 6, letterSpacing: 1 }}>
                    {cls.badge}
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#185FA5' : '#1a1a2e', marginBottom: 4 }}>{cls.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: isSelected ? '#185FA5' : '#1a1a2e' }}>{fmt(total * passengers)}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{passengers > 1 ? `${fmt(total)} × ${passengers}` : 'incl. taxes'}</div>
                {urgentSeats && <div style={{ fontSize: 10, color: '#e53e3e', marginTop: 4, fontWeight: 700 }}>🔥 Only {priceData?.seats_left} left!</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fare Breakdown */}
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 2, marginBottom: 12 }}>FARE BREAKDOWN</div>
        {[
          { label: `Base Fare (${passengers} × ${fmt(classData.price)})`, val: classData.price * passengers },
          { label: `Taxes & Surcharges (${passengers} × ${fmt(classData.taxes)})`, val: classData.taxes * passengers },
          { label: 'Convenience Fee', val: Math.round(classData.total * 0.02 * passengers) },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>{r.label}</span>
            <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{fmt(r.val)}</span>
          </div>
        ))}
        <Divider style={{ margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
          <span style={{ color: '#1a1a2e' }}>Total Payable ({passengers} {passengers === 1 ? 'Person' : 'Persons'})</span>
          <span style={{ color: '#185FA5' }}>{fmt((classData.total + Math.round(classData.total * 0.02)) * passengers)}</span>
        </div>
      </div>

      {classData.seats_left <= 5 && (
        <Alert style={{ marginTop: 14, borderRadius: 10 }} type="warning"
          message={`⚡ Only ${classData.seats_left} seats left at this price — fares may change`}
          showIcon={false} banner />
      )}
    </div>
  );

  // ── STEP 2: Passenger Details ──────────────────────────────────────────────
  const StepTwo = () => (
    <Form form={form} layout="vertical" requiredMark={false}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 2, marginBottom: 16 }}>PASSENGER DETAILS</div>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'Required' }]}>
            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Rahul" size="large" style={{ borderRadius: 10 }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Sharma" size="large" style={{ borderRadius: 10 }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={14}>
          <Form.Item label="Email Address" name="email"
            rules={[{ required: true }, { type: 'email', message: 'Valid email required' }]}>
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="rahul@email.com" size="large" style={{ borderRadius: 10 }} />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="Mobile Number" name="phone"
            rules={[{ required: true }, { pattern: /^[6-9]\d{9}$/, message: '10-digit mobile' }]}>
            <Input prefix={<span style={{ color: '#94a3b8', fontSize: 12 }}>+91</span>} placeholder="9876543210" size="large" style={{ borderRadius: 10 }} maxLength={10} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={10}>
          <Form.Item label="Date of Birth" name="dob" rules={[{ required: true, message: 'Required' }]}>
            <Input type="date" size="large" style={{ borderRadius: 10 }} max={new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
            <Select size="large" style={{ borderRadius: 10 }} placeholder="Select">
              <Option value="M">Male</Option>
              <Option value="F">Female</Option>
              <Option value="O">Other</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="ID Type" name="idType">
            <Select size="large" defaultValue="AADHAAR" style={{ borderRadius: 10 }}>
              <Option value="AADHAAR">Aadhaar</Option>
              <Option value="PAN">PAN Card</Option>
              <Option value="PASSPORT">Passport</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <div style={{ marginTop: 4, padding: '10px 14px', background: '#f0f5ff', borderRadius: 10, border: '1px solid #bfdbfe', fontSize: 12, color: '#3b82f6' }}>
        <LockOutlined /> Your data is encrypted and handled per DPDP Act, 2023 (India).
      </div>
    </Form>
  );

  // ── STEP 3: Payment ────────────────────────────────────────────────────────
  const StepThree = () => {
    if (paymentStep === 1) return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <Spin size="large" />
        <div style={{ marginTop: 20, fontWeight: 700, color: '#185FA5', fontSize: 16 }}>Securing your payment…</div>
        <div style={{ color: '#64748b', marginTop: 6, fontSize: 13 }}>Do not close this window</div>
        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['256-bit SSL', 'RBI Compliant', 'PCI-DSS Secure'].map(b => (
            <Tag key={b} icon={<SafetyOutlined />} color="green" style={{ borderRadius: 20 }}>{b}</Tag>
          ))}
        </div>
      </div>
    );

    return (
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 2, marginBottom: 16 }}>SELECT PAYMENT METHOD</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {PAYMENT_METHODS.map(pm => (
            <div key={pm.id} onClick={() => setPaymentMethod(pm.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                border: paymentMethod === pm.id ? `2px solid ${pm.color}` : '1px solid #e2e8f0',
                background: paymentMethod === pm.id ? `${pm.color}08` : '#fafafa',
              }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: paymentMethod === pm.id ? `${pm.color}20` : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: pm.color }}>
                {pm.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{pm.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{pm.desc}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === pm.id ? pm.color : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paymentMethod === pm.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: pm.color }} />}
              </div>
            </div>
          ))}
        </div>

        {/* UPI input */}
        {paymentMethod === 'upi' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>UPI ID</div>
            <Input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="rahul@upi / 9876543210@ybl"
              size="large" style={{ borderRadius: 10 }} suffix={<span style={{ fontSize: 11, color: '#138808', fontWeight: 700 }}>VERIFY</span>} />
          </div>
        )}

        {/* Amount due */}
        <div style={{ background: 'linear-gradient(135deg, #185FA5, #1a73c8)', borderRadius: 14, padding: '16px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>
              AMOUNT DUE ({passengers} {passengers === 1 ? 'PASSENGER' : 'PASSENGERS'})
            </div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{fmt(classData.total * passengers)}</div>
          </div>
          <div style={{ textAlign: 'right', opacity: 0.8, fontSize: 12 }}>
            <div>{selectedAirline.airline_name}</div>
            <div>{routeData.origin} → {routeData.destination}</div>
            <div>{travelDate ? dayjs(travelDate).format('DD MMM YYYY') : ''} · {selectedClass}</div>
          </div>
        </div>
      </div>
    );
  };

  // ── STEP 4: Confirmation / E-Ticket ───────────────────────────────────────
  const StepConfirm = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #3B6D11, #4a8a16)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <CheckCircleOutlined style={{ fontSize: 36, color: 'white' }} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Booking Confirmed!</div>
      <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
        Your e-ticket has been sent to {form.getFieldValue('email')}
      </div>

      {/* Boarding Pass */}
      <div style={{ background: 'linear-gradient(135deg, #0f1c3f, #185FA5)', borderRadius: 18, padding: 24, color: 'white', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -10, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ fontSize: 9, letterSpacing: 4, opacity: 0.6, marginBottom: 16 }}>
          BOARDING PASS · AERO · {travelDate ? dayjs(travelDate).format('DD MMM YYYY').toUpperCase() : 'UPCOMING'} · {passengers} {passengers === 1 ? 'PASSENGER' : 'PASSENGERS'}
        </div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>FROM</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{routeData.origin}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{routeData.origin_city}</div>
          </Col>
          <Col span={8} style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={{ fontSize: 22 }}>✈</div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '4px 0' }} />
            <div style={{ fontSize: 10, opacity: 0.6 }}>Non-Stop</div>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>TO</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{routeData.destination}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{routeData.destination_city}</div>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '12px 0' }} />

        <Row gutter={16}>
          <Col span={12}>
            <div style={{ fontSize: 9, opacity: 0.6 }}>PASSENGER</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {form.getFieldValue('firstName')} {form.getFieldValue('lastName')}
              {passengers > 1 && <span style={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}> (+{passengers - 1} more)</span>}
            </div>
          </Col>
          <Col span={6}>
            <div style={{ fontSize: 9, opacity: 0.6 }}>CLASS</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedClass}</div>
          </Col>
          <Col span={6}>
            <div style={{ fontSize: 9, opacity: 0.6 }}>AIRLINE</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedAirline.airline_code}</div>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '12px 0' }} />

        <Row gutter={16}>
          <Col span={12}>
            <div style={{ fontSize: 9, opacity: 0.6 }}>PNR NUMBER</div>
            <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2, color: '#FF9933' }}>
              {booking?.pnr || '---'}
            </div>
          </Col>
          <Col span={6}>
            <div style={{ fontSize: 9, opacity: 0.6 }}>SEAT</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{booking?.seat_number || '--'}</div>
          </Col>
          <Col span={6}>
            <div style={{ fontSize: 9, opacity: 0.6 }}>AMOUNT PAID</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#4ade80' }}>{fmt(classData.total * passengers)}</div>
          </Col>
        </Row>

        {/* Barcode */}
        <div style={{ marginTop: 16, textAlign: 'center', background: 'white', borderRadius: 8, padding: '10px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 1, height: 32 }}>
            {Array.from({ length: 48 }, (_, i) => (
              <div key={i} style={{ width: i % 3 === 0 ? 3 : 1, height: '100%', background: '#1a1a2e', opacity: Math.random() > 0.4 ? 1 : 0.3 }} />
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 9, opacity: 0.5, marginTop: 4 }}>AERO-{booking?.pnr || 'XXXXXXXX'}</div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button onClick={() => window.print()} style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid #185FA5', color: '#185FA5', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          🖨️ Print / Download
        </button>
        <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 20, background: '#185FA5', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          ✓ Done
        </button>
      </div>
    </div>
  );

  // ── STEP ACTIONS ──────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (step === 0) { setStep(1); return; }

    if (step === 1) {
      try {
        await form.validateFields();
        setStep(2);
      } catch { message.error('Please fill all required fields correctly'); }
      return;
    }

    if (step === 2) {
      if (paymentMethod === 'upi' && !upiId.includes('@') && !/^[6-9]\d{9}$/.test(upiId)) {
        message.warning('Enter a valid UPI ID (e.g. name@upi) or linked mobile number'); return;
      }
      setPaymentStep(1);
      setLoading(true);
      // Simulate payment processing
      await new Promise(r => setTimeout(r, 2200));
      try {
        const vals = form.getFieldsValue();
        const departure = travelDate ? dayjs(travelDate).format('YYYY-MM-DD') : dayjs().add(1, 'day').format('YYYY-MM-DD');
        const res = await API.post('/bookings', {
          passenger_name: `${vals.firstName} ${vals.lastName}` + (passengers > 1 ? ` (+${passengers - 1})` : ''),
          passenger_email: vals.email,
          passenger_phone: `+91${vals.phone}`,
          origin: routeData.origin,
          destination: routeData.destination,
          airline_code: selectedAirline.airline_code,
          fare_class: selectedClass,
          fare_amount: classData.price * passengers,
          taxes: classData.taxes * passengers,
          total_amount: classData.total * passengers,
          departure_date: departure,
        });
        setBooking(res.data.data);
        setPaymentStep(2);
        setStep(3);
        message.success(`Booking confirmed! PNR: ${res.data.data.pnr}`);
      } catch (err) {
        setPaymentStep(0);
        message.error('Payment failed. Please try again or use a different method.');
      } finally {
        setLoading(false);
      }
    }
  };

  const steps = [
    { title: 'Choose Class' },
    { title: 'Passenger Info' },
    { title: 'Payment' },
    { title: 'Confirmed' },
  ];

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={560} centered
      closable={step < 3} maskClosable={false}
      styles={{ body: { padding: 0 }, content: { borderRadius: 20, overflow: 'hidden' } }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f1c3f, #185FA5)', padding: '20px 28px 16px', color: 'white' }}>
        <div style={{ fontSize: 10, letterSpacing: 3, opacity: 0.7, marginBottom: 4 }}>BOOK FLIGHT · APIX</div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          {routeData.origin} → {routeData.destination}
          <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.7, fontWeight: 400 }}>{selectedAirline.airline_name}</span>
        </div>
      </div>

      {/* Steps */}
      {step < 3 && (
        <div style={{ padding: '16px 28px 0', background: '#f8fafc' }}>
          <Steps current={step} size="small" items={steps} />
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '20px 28px' }}>
        {step === 0 && <StepOne />}
        {step === 1 && <StepTwo />}
        {step === 2 && <StepThree />}
        {step === 3 && <StepConfirm />}
      </div>

      {/* Footer */}
      {step < 3 && (
        <div style={{ padding: '0 28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} disabled={loading}
              style={{ padding: '10px 20px', borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#64748b' }}>
              ← Back
            </button>
          ) : <div />}

          <button onClick={handleNext} disabled={loading}
            style={{ padding: '12px 32px', borderRadius: 22, border: 'none', background: loading ? '#94a3b8' : 'linear-gradient(90deg, #D97B4F, #e8905f)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 15, boxShadow: loading ? 'none' : '0 6px 20px rgba(217,123,79,0.4)', transition: 'all 0.2s' }}>
            {loading ? '⏳ Processing…' : step === 2 ? `Pay ${fmt(classData.total)} →` : 'Continue →'}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default BookingModal;
