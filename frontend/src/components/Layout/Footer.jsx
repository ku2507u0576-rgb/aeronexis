import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter style={{ textAlign: 'center', color: '#8c8c8c', padding: '12px 24px' }}>
      <div>© 2026 Aeronexis | Real-Time Airfare Price Index Platform</div>
      <div style={{ fontSize: '12px', marginTop: '4px' }}>Built for MoSPI | Data Sources: 5 Airlines + 6 OTAs | Version: v1.0.0</div>
    </AntFooter>
  );
};

export default Footer;
