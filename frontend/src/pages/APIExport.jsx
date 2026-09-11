import React, { useState } from 'react';
import { Card, Typography, Collapse, Form, DatePicker, Select, Button, message, Divider } from 'antd';
import { DownloadOutlined, ApiOutlined } from '@ant-design/icons';
import { exportData } from '../services/api';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

const APIExport = () => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (values) => {
    setExporting(true);
    try {
      await exportData({
        format: values.format,
        date_from: values.dates[0].format('YYYY-MM-DD'),
        date_to: values.dates[1].format('YYYY-MM-DD')
      });
      message.success(`Data exported successfully in ${values.format.toUpperCase()} format.`);
    } catch (err) {
      message.error('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">API Documentation & Data Export</h2>
      </div>

      <Card title={<><DownloadOutlined /> Data Export Tool</>} style={{ marginBottom: 24 }}>
        <Form layout="inline" onFinish={handleExport} initialValues={{ format: 'csv', dates: [dayjs().subtract(7, 'day'), dayjs()] }}>
          <Form.Item name="dates" label="Date Range" rules={[{ required: true }]}>
            <RangePicker />
          </Form.Item>
          <Form.Item name="format" label="Format">
            <Select style={{ width: 100 }}>
              <Select.Option value="csv">CSV</Select.Option>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="xlsx">Excel</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={exporting}>Generate Export</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title={<><ApiOutlined /> Developer API Documentation</>}>
        <Paragraph>
          The APIx platform provides programmatic access to airfare indices and raw quotes via a RESTful API.
        </Paragraph>
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginBottom: 16 }}>
          <Text strong>Base URL: </Text> <Text code>http://localhost:8000/v1</Text><br />
          <Text strong>Authentication: </Text> Pass API key in the <Text code>X-API-Key</Text> header.
        </div>

        <Collapse accordion>
          <Panel header={<Text strong>GET /dashboard-summary</Text>} key="1">
            <Paragraph>Returns high-level KPI metrics and recent alerts.</Paragraph>
          </Panel>
          <Panel header={<Text strong>GET /airfare-index</Text>} key="2">
            <Paragraph>Returns the core airfare index. Params: <Text code>frequency</Text> (daily/weekly), <Text code>route</Text>.</Paragraph>
          </Panel>
          <Panel header={<Text strong>GET /routes</Text>} key="3">
            <Paragraph>Returns list of monitored routes and their current average fares/indices.</Paragraph>
          </Panel>
          <Panel header={<Text strong>GET /fares</Text>} key="4">
            <Paragraph>Query raw fare data. Params: <Text code>route</Text>, <Text code>airline</Text>, <Text code>advance</Text>, <Text code>limit</Text>.</Paragraph>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
};

export default APIExport;
