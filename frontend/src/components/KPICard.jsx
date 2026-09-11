import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const KPICard = ({ title, value, prefix = '', suffix = '', change, changeType, icon }) => {
  let valueColor = '#1f1f1f';
  let bgColor = '#ffffff';

  if (changeType === 'up' && change > 0) {
    valueColor = '#cf1322'; // Bad (higher fare)
    bgColor = '#fff1f0';
  } else if (changeType === 'down' && change < 0) {
    valueColor = '#3f8600'; // Good (lower fare)
    bgColor = '#f6ffed';
  }

  // Reverse logic for some metrics (like quality score where up is good)
  if (changeType === 'good-up' && change > 0) {
    valueColor = '#3f8600';
    bgColor = '#f6ffed';
  }

  return (
    <Card bordered={false} style={{ background: bgColor, height: '100%' }} bodyStyle={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: '#595959', fontSize: '14px', fontWeight: 500 }}>{title}</span>
        <span style={{ color: '#8c8c8c', fontSize: '18px' }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        <Statistic
          value={value}
          precision={typeof value === 'number' && value % 1 !== 0 ? 1 : 0}
          valueStyle={{ color: '#1f1f1f', fontWeight: 600, fontSize: '28px', lineHeight: 1 }}
          prefix={prefix}
          suffix={suffix}
        />
        {change !== undefined && (
          <span style={{ 
            color: valueColor, 
            fontSize: '14px', 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            {change > 0 ? <ArrowUpOutlined style={{ fontSize: '12px', marginRight: '2px' }}/> : <ArrowDownOutlined style={{ fontSize: '12px', marginRight: '2px' }}/>}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </Card>
  );
};

export default KPICard;
