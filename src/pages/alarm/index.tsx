import { PageContainer } from '@ant-design/pro-components';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Button, Col, DatePicker, Input, Pagination, Row, Select, Space, Table } from 'antd';
import type { Dayjs } from 'dayjs';
import React from 'react';
import OrgTree from '@/components/OrgTree';
import type { AlarmPageParams, AlarmVO } from './data.d';
import { queryAlarmPage } from './service';
import type { ProvinceVO } from '../region/data.d';
import { queryProvinceList } from '../region/service';
import type { OrgTreeSelectionParams } from '@/components/OrgTree';
import styles from './index.less';

const AlarmPage: React.FC = () => {
  const [pageNum, setPageNum] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [deviceName, setDeviceName] = React.useState('');
  const [alarmType, setAlarmType] = React.useState<string>('');
  const [orgSelection, setOrgSelection] = React.useState<OrgTreeSelectionParams>({
    nodeType: 'country',
  });

  const { data, loading: provinceLoading } = useRequest(queryProvinceList);
  const {
    data: alarmPageData,
    loading: alarmLoading,
    run: runQueryAlarmPage,
  } = useRequest(queryAlarmPage, { manual: true });
  const provinceList = (data ?? []) as ProvinceVO[];

  const alarmList = (alarmPageData?.list ?? []) as AlarmVO[];
  const alarmTotal = alarmPageData?.total ?? 0;

  const runAlarmSearch = React.useCallback(
    (nextPageNum: number, nextPageSize: number) => {
      const params: AlarmPageParams = {
        pageNum: nextPageNum,
        pageSize: nextPageSize,
      };

      if (startDate) {
        params.startDate = startDate.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      }
      if (endDate) {
        params.endDate = endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      }
      if (deviceName.trim()) {
        params.deviceName = deviceName.trim();
      }
      if (alarmType) {
        params.type = alarmType;
      }
      if (orgSelection.provinceId) {
        params.provinceId = orgSelection.provinceId;
      }
      if (orgSelection.prisonId) {
        params.prisonId = orgSelection.prisonId;
      }
      if (orgSelection.buildingId) {
        params.buildingId = orgSelection.buildingId;
      }
      if (orgSelection.floorId) {
        params.floorId = orgSelection.floorId;
      }

      runQueryAlarmPage(params);
    },
    [alarmType, deviceName, endDate, orgSelection, runQueryAlarmPage, startDate],
  );

  React.useEffect(() => {
    runAlarmSearch(pageNum, pageSize);
  }, [pageNum, pageSize, runAlarmSearch]);

  const handleSearch = () => {
    if (pageNum !== 1) {
      setPageNum(1);
      return;
    }
    runAlarmSearch(1, pageSize);
  };

  return (
    <PageContainer title={false}>
      <div className={styles.pageShell}>
        <Row gutter={0} className={styles.contentRow}>
          <Col xs={24} xl={6} className={styles.leftPane}>
            <OrgTree
              provinceList={provinceList}
              loading={provinceLoading}
              maxLevel={4}
              onSelectionChange={(params) => {
                setOrgSelection(params);
                if (pageNum !== 1) {
                  setPageNum(1);
                  return;
                }
                runAlarmSearch(1, pageSize);
              }}
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
                <DatePicker
                  placeholder="开始日期"
                  value={startDate}
                  format="YYYY-MM-DD"
                  onChange={(value) => setStartDate(value)}
                />
                <span className={styles.middleLabel}>至</span>
                <DatePicker
                  placeholder="结束日期"
                  value={endDate}
                  format="YYYY-MM-DD"
                  onChange={(value) => setEndDate(value)}
                />
              </div>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>设备名称</span>
                <Input
                  value={deviceName}
                  placeholder="请输入"
                  onChange={(event) => setDeviceName(event.target.value)}
                  onPressEnter={handleSearch}
                />
              </div>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>告警类型</span>
                <Select
                  value={alarmType}
                  options={[{ label: '全部', value: '' }]}
                  onChange={(value) => setAlarmType(value)}
                />
              </div>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                className={styles.queryButton}
                onClick={handleSearch}
              >
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
            <Table<AlarmVO>
              className={styles.alarmTable}
              loading={alarmLoading}
              rowKey={(record) =>
                String(
                  record.id ??
                    record.entireNo ??
                    `${record.deviceId ?? ''}-${record.alarmTime ?? ''}-${record.createTime ?? ''}`,
                )
              }
              pagination={false}
              dataSource={alarmList}
              columns={[
                { title: '告警监狱', dataIndex: 'prisonName' },
                { title: '告警设备ID', dataIndex: 'deviceId' },
                { title: '告警设备名称', dataIndex: 'deviceName' },
                { title: '告警内容', dataIndex: 'content' },
                { title: '告警发生时间', dataIndex: 'alarmTime' },
                { title: '排查建议', dataIndex: 'suggestions' },
              ]}
            />
            <div className={styles.paginationRow}>
              <span className={styles.totalText}>共 {alarmTotal} 条</span>
              <Pagination
                simple
                current={pageNum}
                total={alarmTotal}
                pageSize={pageSize}
                showSizeChanger={false}
                onChange={(nextPageNum, nextPageSize) => {
                  setPageNum(nextPageNum);
                  setPageSize(nextPageSize);
                }}
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
