import {PageContainer} from '@ant-design/pro-components';
import {Column, Line, Pie} from '@ant-design/plots';
import {Button, Col, DatePicker, Row, Select, Space, Tabs, Typography} from 'antd';
import React from 'react';
import gb from '@/assets/gb.png';
import styles from './index.less';

const AccountPage: React.FC = () => {
  const onlineStatsData = [
    {type: '在线总时长', value: 16},
    {type: '不在线总时长', value: 48},
    {type: '故障离线时长', value: 36},
  ];

  const runTimeData = [
    {name: '平均在线时长', value: 800},
    {name: '平均不在线时长', value: 300},
    {name: '平均故障时长', value: 100},
  ];

  const faultCountData = [
    {type: '温度告警', total: 100, rate: 21},
    {type: 'VSWR', total: 120, rate: 25},
    {type: '告警频段', total: 70, rate: 14},
    {type: '电源故障', total: 32, rate: 8},
    {type: '连接断开', total: 100, rate: 20},
    {type: '放大器故障', total: 34, rate: 7},
    {type: '主板故障', total: 10, rate: 3},
  ];

  const pieConfig = {
    data: onlineStatsData,
    angleField: 'value',
    colorField: 'type',
    innerRadius: 0.62,
    legend: false,
    label: {
      text: (d: {type: string; value: number}) => `${d.type}\n${d.value}%`,
      position: 'spider',
      style: {
        fontSize: 12,
      },
    },
    color: ['#2F44AE', '#36B6E4', '#3990E2'],
    tooltip: {
      items: [{channel: 'y', valueFormatter: (v: number) => `${v}%`}],
    },
  };

  const columnConfig = {
    data: runTimeData,
    xField: 'name',
    yField: 'value',
    color: '#4F81D7',
    style: {maxWidth: 52},
    scale: {
      x: {paddingInner: 0.52, paddingOuter: 0.32},
    },
    axis: {
      y: {grid: true},
    },
    label: {
      text: 'value',
      position: 'top',
      style: {fill: '#4F81D7', fontSize: 12},
    },
    tooltip: {
      items: [{channel: 'y', valueFormatter: (v: number) => `${v}`}],
    },
  };

  const lineConfig = {
    data: faultCountData,
    xField: 'type',
    yField: 'rate',
    color: '#E8792B',
    style: {maxWidth: 52, lineWidth: 3},
    scale: {
      x: {paddingInner: 0.52, paddingOuter: 0.32},
    },
    axis: {
      y: {
        position: 'right',
        labelFormatter: (v: string) => `${v}%`,
      },
      x: {label: false, tick: false, line: false},
    },
    point: {shapeField: 'circle', sizeField: 4},
    tooltip: {
      items: [{channel: 'y', valueFormatter: (v: number) => `${v}%`}],
    },
  };

  const faultColumnConfig = {
    data: faultCountData,
    xField: 'type',
    yField: 'total',
    color: '#4F81D7',
    style: {maxWidth: 52},
    scale: {
      x: {paddingInner: 0.66, paddingOuter: 0.24},
    },
    tooltip: {
      items: [{channel: 'y', valueFormatter: (v: number) => `${v}`}],
    },
  };

  return (
    <PageContainer title={false}>
      <div style={{background: '#fff', margin: '-8px -8px 0', minHeight: 'calc(100vh - 128px)'}}>
        <Row gutter={0}>
          <Col xs={24} xl={6} style={{overflow: 'hidden'}}>
            <div
              style={{
                position: 'relative',
                height: 'calc(100vh - 128px)',
                backgroundImage: `url(${gb})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
            </div>
          </Col>

          <Col xs={24} xl={18} className={styles.rightPane}>
            <div className={styles.content}>
              <div className={styles.sectionTitle}>搜索条件</div>
              <div className={styles.filterRow}>
                <div className={styles.filterItemWide}>
                  <span className={styles.filterLabel}>时间</span>
                  <DatePicker.RangePicker style={{width: '100%'}} />
                </div>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>省份</span>
                  <Select
                    defaultValue="全部"
                    options={[{value: '全部', label: '全部'}]}
                    style={{width: '100%'}}
                  />
                </div>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>监狱</span>
                  <Select
                    defaultValue="全部"
                    options={[{value: '全部', label: '全部'}]}
                    style={{width: '100%'}}
                  />
                </div>
                <div className={styles.filterAction}>
                  <Button type="primary">查询</Button>
                </div>
              </div>

              <div className={styles.filterRowBottom}>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>楼层</span>
                  <Select
                    defaultValue="全部"
                    options={[{value: '全部', label: '全部'}]}
                    style={{width: '100%'}}
                  />
                </div>
                <Button className={styles.exportBtn}>导出</Button>
              </div>

              <div className={styles.chartGrid}>
                <div className={styles.chartCard}>
                  <Typography.Title level={5} className={styles.chartTitle}>
                    时长统计
                  </Typography.Title>
                  <Pie {...pieConfig} height={250} />
                </div>

                <div className={styles.chartCard}>
                  <Typography.Title level={5} className={styles.chartTitle}>
                    运行时长
                  </Typography.Title>
                  <Column {...columnConfig} height={250} />
                </div>
              </div>

              <div className={styles.chartCardLarge}>
                <Typography.Title level={5} className={styles.chartTitle}>
                  故障类型统计
                </Typography.Title>
                <div className={styles.combinedChart}>
                  <div className={styles.combinedColumn}>
                    <Column {...faultColumnConfig} height={240} />
                  </div>
                  <div className={styles.combinedLine}>
                    <Line {...lineConfig} height={240} />
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default AccountPage;
