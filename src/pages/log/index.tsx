import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Col, Pagination, Row, Select, Table } from 'antd';
import React from 'react';
import gb from '@/assets/gb.png';
import styles from './index.less';

type LogRecord = {
  id: string;
  username: string;
  loginTime: string;
  action: string;
  operationTime: string;
};

const LogPage: React.FC = () => {
  const intl = useIntl();
  const t = (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id, defaultMessage }, values);
  const allOption = t('pages.log.option.all', 'All');

  const logData: LogRecord[] = [
    {
      id: 'log-1',
      username: 'Ahmed',
      loginTime: '2025-12-12 12:00:00',
      action: t('pages.log.demo.clickProvince', 'Clicked Riyadh province'),
      operationTime: '2025-12-12 12:00:00',
    },
    {
      id: 'log-2',
      username: 'Ahmed',
      loginTime: '2025-12-12 12:00:00',
      action: t('pages.log.demo.clickPrison', 'Clicked AAAA prison'),
      operationTime: '2025-12-12 12:01:00',
    },
    {
      id: 'log-3',
      username: 'Ahmed',
      loginTime: '2025-12-12 12:00:00',
      action: t('pages.log.demo.clickFloor', 'Clicked floor {floor}', { floor: 6 }),
      operationTime: '2025-12-12 12:01:10',
    },
    {
      id: 'log-4',
      username: 'Ahmed',
      loginTime: '2025-12-12 12:00:00',
      action: t('pages.log.demo.clickDevice', 'Clicked device'),
      operationTime: '2025-12-12 12:02:00',
    },
    {
      id: 'log-5',
      username: 'Ahmed',
      loginTime: '2025-12-12 12:00:00',
      action: t('pages.log.demo.clickProvinceBranch', 'Clicked Riyadh province branch'),
      operationTime: '2025-12-12 12:02:30',
    },
    {
      id: 'log-6',
      username: 'Ahmed',
      loginTime: '2025-12-12 12:00:00',
      action: t('pages.log.demo.clickPrisonBranch', 'Clicked AAAA prison branch'),
      operationTime: '2025-12-12 12:03:00',
    },
    {
      id: 'log-7',
      username: 'Ahmed',
      loginTime: '2025-12-12 12:00:00',
      action: t('pages.log.demo.clickBlockAll', 'Clicked block all devices'),
      operationTime: '2025-12-12 12:03:49',
    },
    {
      id: 'log-8',
      username: 'Ahmed',
      loginTime: '2025-12-12 12:00:00',
      action: t('pages.log.demo.clickConfirm', 'Clicked confirm'),
      operationTime: '2025-12-12 12:04:00',
    },
    {
      id: 'log-9',
      username: 'Ahmed',
      loginTime: '2025-12-12 12:00:00',
      action: t('pages.log.demo.logout', 'Logged out'),
      operationTime: '2025-12-12 12:05:00',
    },
    {
      id: 'log-10',
      username: 'CHOKJ',
      loginTime: '2025-12-11 12:00:00',
      action: t('pages.log.demo.clickProvince', 'Clicked Riyadh province'),
      operationTime: '2025-12-11 12:00:00',
    },
  ];

  return (
    <PageContainer title={false}>
      <div style={{ background: '#fff', margin: '-8px -8px 0', minHeight: 'calc(100vh - 128px)' }}>
        <Row gutter={0}>
          <Col xs={24} xl={6} style={{ overflow: 'hidden' }}>
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
            />
          </Col>

          <Col xs={24} xl={18} className={styles.rightPane}>
            <div className={styles.queryTitle}>{t('pages.log.query.title', 'Query Table')}</div>
            <div className={styles.queryRow}>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>
                  {t('pages.log.field.province', 'Province')}
                </span>
                <Select defaultValue="all" options={[{ label: allOption, value: 'all' }]} />
              </div>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>
                  {t('pages.log.field.prisonLevel', 'Prison Level')}
                </span>
                <Select defaultValue="all" options={[{ label: allOption, value: 'all' }]} />
              </div>
              <Button type="primary" icon={<SearchOutlined />} className={styles.queryButton}>
                {t('pages.log.action.search', 'Search')}
              </Button>
            </div>
            <div className={styles.actionRow}>
              <div />
              <Button icon={<DownloadOutlined />}>{t('pages.log.action.export', 'Export')}</Button>
            </div>
            <Table<LogRecord>
              className={styles.alarmTable}
              rowKey="id"
              pagination={false}
              dataSource={logData}
              columns={[
                {
                  title: t('pages.log.column.username', 'Username'),
                  dataIndex: 'username',
                },
                {
                  title: t('pages.log.column.loginTime', 'Login Time'),
                  dataIndex: 'loginTime',
                },
                {
                  title: t('pages.log.column.action', 'Action'),
                  dataIndex: 'action',
                },
                {
                  title: t('pages.log.column.operationTime', 'Operation Time'),
                  dataIndex: 'operationTime',
                },
              ]}
            />
            <div className={styles.paginationRow}>
              <span className={styles.totalText}>
                {t('pages.log.pagination.totalPrefix', 'Total')} 658{' '}
                {t('pages.log.pagination.totalSuffix', 'items')}
              </span>
              <Pagination
                simple
                current={48}
                total={658}
                pageSize={10}
                showSizeChanger={false}
                itemRender={(_, type, element) => {
                  if (type === 'prev') {
                    return <span className={styles.pageArrow}>{'<'}</span>;
                  }
                  if (type === 'next') {
                    return <span className={styles.pageArrow}>{'>'}</span>;
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
