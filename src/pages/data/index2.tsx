import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Column, Line, Pie } from '@ant-design/plots';
import { Button, Card, Col, DatePicker, Divider, Form, Row, Select } from 'antd';
import React from 'react';

const timeStatsData = [
  { type: '在线总时长', value: 16 },
  { type: '不在线总时长', value: 48 },
  { type: '故障总时长', value: 36 },
];

const runningTimeData = [
  { type: '平均在线时长', value: 800 },
  { type: '平均不在线时长', value: 300 },
  { type: '平均故障时长', value: 100 },
];

const faultTypeData = [
  { type: '温度告警', value: 100 },
  { type: 'VSWR', value: 130 },
  { type: '告警频段', value: 70 },
  { type: '电源故障', value: 40 },
  { type: '连接断开', value: 95 },
  { type: '放大器故障', value: 35 },
  { type: '主板故障', value: 10 },
];

const faultTypeRatio = [
  { type: '温度告警', ratio: 0.22 },
  { type: 'VSWR', ratio: 0.26 },
  { type: '告警频段', ratio: 0.15 },
  { type: '电源故障', ratio: 0.08 },
  { type: '连接断开', ratio: 0.21 },
  { type: '放大器故障', ratio: 0.07 },
  { type: '主板故障', ratio: 0.03 },
];

const faultTypeLineData = [
  ...faultTypeData.map((item) => ({
    type: item.type,
    metric: '总时长',
    value: item.value,
  })),
  ...faultTypeRatio.map((item) => ({
    type: item.type,
    metric: '占比',
    value: Math.round(item.ratio * 100),
  })),
];

const DataPage: React.FC = () => (
  <PageContainer title={false}>
    <Card title="搜索条件" size="small">
      <Form layout="inline">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <Form.Item label="时间" name="range">
            <DatePicker.RangePicker placeholder={['开始年月日', '结束年月日']} separator="至" />
          </Form.Item>
          <Form.Item label="省份" name="province">
            <Select
              style={{ width: 160 }}
              placeholder="全部"
              options={[
                { label: '全部', value: 'all' },
                { label: '河北省', value: 'hebei' },
                { label: '山东省', value: 'shandong' },
              ]}
            />
          </Form.Item>
          <Form.Item label="监狱" name="prison">
            <Select
              style={{ width: 160 }}
              placeholder="全部"
              options={[
                { label: '全部', value: 'all' },
                { label: '石家庄监狱', value: 'sjz' },
                { label: '济南监狱', value: 'jn' },
              ]}
            />
          </Form.Item>
          <Form.Item label="楼层" name="floor">
            <Select
              style={{ width: 160 }}
              placeholder="全部"
              options={[
                { label: '全部', value: 'all' },
                { label: '1层', value: '1' },
                { label: '2层', value: '2' },
              ]}
            />
          </Form.Item>
          <Button type="primary" icon={<SearchOutlined />}>
            查询
          </Button>
        </div>
      </Form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Button icon={<DownloadOutlined />}>导出</Button>
      </div>
    </Card>

    <Divider />

    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="时长统计">
          <Pie
            height={260}
            data={timeStatsData}
            angleField="value"
            colorField="type"
            radius={1}
            innerRadius={0.62}
            label={{
              type: 'outer',
              content: (datum) => `${datum.type} ${Math.round(datum.percent * 100)}%`,
            }}
            legend={false}
            color={['#1f9eff', '#19c1ff', '#2b3aa9']}
          />
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="运行时长">
          <Column
            height={260}
            data={runningTimeData}
            xField="type"
            yField="value"
            color="#4b78f2"
            label={{ position: 'top', style: { fill: '#4b78f2', fontWeight: 600 } }}
            xAxis={{ label: { autoHide: false, autoRotate: false } }}
          />
        </Card>
      </Col>
    </Row>

    <Card title="故障类型统计" style={{ marginTop: 16 }}>
      <Line
        height={260}
        data={faultTypeLineData}
        xField="type"
        yField="value"
        seriesField="metric"
        smooth
        point={{ size: 4 }}
        yAxis={{ title: { text: '总时长 / 占比(%)' } }}
        legend={{ position: 'bottom' }}
      />
    </Card>
  </PageContainer>
);

export default DataPage;
