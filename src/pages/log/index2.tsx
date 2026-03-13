import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Divider, Form, Select, Space, Table } from 'antd';
import React from 'react';

type LogRecord = {
  id: string;
  username: string;
  loginTime: string;
  action: string;
  operationTime: string;
};

const logData: LogRecord[] = [
  {
    id: 'log-1',
    username: 'Ahmed',
    loginTime: '2025-12-12 12:00:00',
    action: '点击Riyadh省份',
    operationTime: '2025-12-12 12:00:00',
  },
  {
    id: 'log-2',
    username: 'Ahmed',
    loginTime: '2025-12-12 12:00:00',
    action: '点击AAAA监狱',
    operationTime: '2025-12-12 12:01:00',
  },
  {
    id: 'log-3',
    username: 'Ahmed',
    loginTime: '2025-12-12 12:00:00',
    action: '点击楼层6',
    operationTime: '2025-12-12 12:01:10',
  },
  {
    id: 'log-4',
    username: 'Ahmed',
    loginTime: '2025-12-12 12:00:00',
    action: '点击设备',
    operationTime: '2025-12-12 12:02:00',
  },
  {
    id: 'log-5',
    username: 'Ahmed',
    loginTime: '2025-12-12 12:00:00',
    action: '点击Riyadh省份分支',
    operationTime: '2025-12-12 12:02:30',
  },
  {
    id: 'log-6',
    username: 'Ahmed',
    loginTime: '2025-12-12 12:00:00',
    action: '点击AAAA监狱分支',
    operationTime: '2025-12-12 12:03:00',
  },
  {
    id: 'log-7',
    username: 'Ahmed',
    loginTime: '2025-12-12 12:00:00',
    action: '点击屏蔽仪全关',
    operationTime: '2025-12-12 12:03:49',
  },
  {
    id: 'log-8',
    username: 'Ahmed',
    loginTime: '2025-12-12 12:00:00',
    action: '点击确认',
    operationTime: '2025-12-12 12:04:00',
  },
  {
    id: 'log-9',
    username: 'Ahmed',
    loginTime: '2025-12-12 12:00:00',
    action: '退出',
    operationTime: '2025-12-12 12:05:00',
  },
  {
    id: 'log-10',
    username: 'CHOKJ',
    loginTime: '2025-12-11 12:00:00',
    action: '点击Riyadh省份',
    operationTime: '2025-12-11 12:00:00',
  },
];

const LogPage: React.FC = () => (
  <PageContainer title={false}>
    <Card title="查询表格" size="small">
      <Form layout="inline">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', width: '100%' }}>
          <Form.Item label="省份" name="province">
            <Select
              style={{ width: 180 }}
              placeholder="全部"
              options={[
                { label: '全部', value: 'all' },
                { label: 'Riyadh', value: 'riyadh' },
                { label: 'Jeddah', value: 'jeddah' },
              ]}
            />
          </Form.Item>
          <Form.Item label="监狱级别" name="level">
            <Select
              style={{ width: 180 }}
              placeholder="全部"
              options={[
                { label: '全部', value: 'all' },
                { label: 'AAA', value: 'aaa' },
                { label: 'AA', value: 'aa' },
                { label: 'A', value: 'a' },
              ]}
            />
          </Form.Item>
          <div style={{ marginLeft: 'auto' }}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />}>
                查询
              </Button>
            </Space>
          </div>
        </div>
      </Form>
    </Card>

    <Divider />

    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <Button icon={<DownloadOutlined />}>导出</Button>
    </div>

    <Card>
      <Table<LogRecord>
        rowKey="id"
        dataSource={logData}
        pagination={{ pageSize: 10, total: 658, showSizeChanger: false }}
        columns={[
          {
            title: '用户名',
            dataIndex: 'username',
          },
          {
            title: '登录时间',
            dataIndex: 'loginTime',
          },
          {
            title: '操作内容',
            dataIndex: 'action',
          },
          {
            title: '操作时间',
            dataIndex: 'operationTime',
          },
        ]}
      />
    </Card>
  </PageContainer>
);

export default LogPage;
