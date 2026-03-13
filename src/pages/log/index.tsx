import {PageContainer} from '@ant-design/pro-components';
import {Column, Line, Pie} from '@ant-design/plots';
import {Button, Col, DatePicker, Input, Pagination, Row, Select, Space, Table, Tabs, Typography} from 'antd';
import React from 'react';
import gb from '@/assets/gb.png';
import styles from './index.less';
import {DownloadOutlined, SearchOutlined} from "@ant-design/icons";

const LogPage: React.FC = () => {

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
            <div className={styles.queryTitle}>查询表格</div>
            <div className={styles.queryRow}>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>省份</span>
                <Select defaultValue="全部" options={[{ label: '全部', value: '全部' }]} />
              </div>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>监狱级别</span>
                <Select defaultValue="全部" options={[{ label: '全部', value: '全部' }]} />
              </div>
              <Button type="primary" icon={<SearchOutlined />} className={styles.queryButton}>
                查询
              </Button>
            </div>
            <div className={styles.actionRow}>
              <div></div>
              <Button icon={<DownloadOutlined />}>导出</Button>
            </div>
            <Table<LogRecord>
              className={styles.alarmTable}
              rowKey="key"
              pagination={false}
              dataSource={logData}
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
            <div className={styles.paginationRow}>
              <span className={styles.totalText}>共 658 条</span>
              <Pagination
                simple
                current={48}
                total={658}
                pageSize={10}
                showSizeChanger={false}
                itemRender={(_, type, element) => {
                  if (type === 'prev') {
                    return <span className={styles.pageArrow}>‹</span>;
                  }
                  if (type === 'next') {
                    return <span className={styles.pageArrow}>›</span>;
                  }
                  return element;
                }}
              />
            </div>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default LogPage;
