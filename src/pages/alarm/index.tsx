import { PageContainer } from '@ant-design/pro-components';
import { CaretDownOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Input, Pagination, Row, Select, Space, Table, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React from 'react';
import styles from './index.less';

type AlarmRow = {
  key: string;
  prison: string;
  deviceId: string;
  deviceName: string;
  content: string;
  alarmTime: string;
  advice: string;
};

const orgTreeData: DataNode[] = [
  {
    title: '全国',
    key: '0',
    children: [
      {
        title: 'Riyadh',
        key: '0-1',
        children: [
          {
            title: 'AAA监狱',
            key: '0-1-1',
            children: [
              {
                title: 'AABB楼',
                key: '0-1-1-1',
                children: [
                  { title: '1楼', key: '0-1-1-1-1' },
                  { title: '2楼', key: '0-1-1-1-2' },
                ],
              },
              { title: 'BBCC楼', key: '0-1-1-2' },
              { title: 'BBBB楼', key: '0-1-1-3' },
            ],
          },
        ],
      },
      { title: 'Mecca', key: '0-2' },
      { title: 'Riyadh', key: '0-3' },
      { title: 'Buraydah', key: '0-4' },
      { title: 'Medina', key: '0-5' },
      { title: 'Mecca', key: '0-6' },
      { title: 'Riyadh', key: '0-7' },
      { title: 'Buraydah', key: '0-8' },
      { title: 'Medina', key: '0-9' },
    ],
  },
];

const alarmRows: AlarmRow[] = Array.from({ length: 10 }, (_, index) => ({
  key: `${index}`,
  prison: 'AAA监狱',
  deviceId: 'S11001',
  deviceName: '屏蔽仪',
  content: '温度过高',
  alarmTime: '2025-12-12 12:00:00',
  advice: '重启',
}));

const AlarmPage: React.FC = () => {
  return (
    <PageContainer title={false}>
      <div className={styles.pageShell}>
        <Row gutter={0} className={styles.contentRow}>
          <Col xs={24} xl={6} className={styles.leftPane}>
            <Tree
              className={styles.orgTree}
              treeData={orgTreeData}
              defaultExpandAll
              selectable={false}
              switcherIcon={({ expanded }) => <CaretDownOutlined rotate={expanded ? 0 : -90} />}
            />
          </Col>
          <Col xs={24} xl={18} className={styles.rightPane}>
            <div className={styles.alarmTabRow}>
              <Button type="primary">当前告警</Button>
              <Button>历史告警</Button>
              <Button>屏蔽告警</Button>
            </div>
            <div className={styles.queryTitle}>查询表格</div>
            <div className={styles.queryRow}>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>时间</span>
                <DatePicker placeholder="开始日期" />
                <span className={styles.middleLabel}>至</span>
                <DatePicker placeholder="结束日期" />
              </div>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>设备名称</span>
                <Input placeholder="请输入" />
              </div>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>告警类型</span>
                <Select defaultValue="全部" options={[{ label: '全部', value: '全部' }]} />
              </div>
              <Button type="primary" icon={<SearchOutlined />} className={styles.queryButton}>
                查询
              </Button>
            </div>
            <div className={styles.actionRow}>
              <Space size={10}>
                <Button>告警清除</Button>
                <Button>告警屏蔽</Button>
                <Button>跳转到设备监控位置</Button>
              </Space>
              <Button icon={<DownloadOutlined />}>导出</Button>
            </div>
            <Table<AlarmRow>
              className={styles.alarmTable}
              rowKey="key"
              pagination={false}
              dataSource={alarmRows}
              columns={[
                { title: '告警监狱', dataIndex: 'prison' },
                { title: '告警设备ID', dataIndex: 'deviceId' },
                { title: '告警设备名称', dataIndex: 'deviceName' },
                { title: '告警内容', dataIndex: 'content' },
                { title: '告警发生时间', dataIndex: 'alarmTime' },
                { title: '排查建议', dataIndex: 'advice' },
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

export default AlarmPage;
