import { PageContainer } from '@ant-design/pro-components';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { history, useRequest } from '@umijs/max';
import {
  Button,
  Col,
  DatePicker,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  message,
} from 'antd';
import type { Dayjs } from 'dayjs';
import React from 'react';
import OrgTree from '@/components/OrgTree';
import type { OrgTreeSelectionParams } from '@/components/OrgTree';
import type { ProvinceVO } from '../region/data.d';
import { queryProvinceList } from '../region/service';
import type { AlarmPageParams, AlarmVO, DataTAlarmVO } from './data.d';
import { queryAlarmPage, updateAlarm } from './service';
import styles from './index.less';

const alarmTypeOptions = [
  { label: '全部', value: '' },
  { label: '低温告警', value: 'Bit0' },
  { label: '过温告警', value: 'Bit1' },
  { label: '过压告警', value: 'Bit2' },
  { label: '欠压告警', value: 'Bit3' },
  { label: '过流告警', value: 'Bit4' },
  { label: '欠流告警', value: 'Bit5' },
];

const processingStatusOptions = [
  { label: '全部', value: -1 },
  { label: '未处理', value: 0 },
  { label: '已处理', value: 1 },
];

const blockedOptions = [
  { label: '全部', value: -1 },
  { label: '否', value: 0 },
  { label: '是', value: 1 },
];

const EMPTY_ALARM_PAGE: DataTAlarmVO = {
  list: [],
  total: 0,
};

const getErrorMessage = (error: unknown): string | undefined =>
  (error as { response?: { data?: { msg?: string } } })?.response?.data?.msg ||
  (error as { info?: { errorMessage?: string } })?.info?.errorMessage;

const normalizeAlarmPage = (data?: DataTAlarmVO): DataTAlarmVO => ({
  list: Array.isArray(data?.list) ? data.list : [],
  total: typeof data?.total === 'number' ? data.total : Number(data?.total ?? 0),
});

const AlarmPage: React.FC = () => {
  const [pageNum, setPageNum] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [deviceName, setDeviceName] = React.useState('');
  const [alarmType, setAlarmType] = React.useState<string>('');
  const [processingStatus, setProcessingStatus] = React.useState<number | undefined>(0);
  const [blocked, setBlocked] = React.useState<number | undefined>(0);
  const [orgSelection, setOrgSelection] = React.useState<OrgTreeSelectionParams>({
    nodeType: 'country',
  });
  const [alarmLoading, setAlarmLoading] = React.useState(false);
  const [alarmPage, setAlarmPage] = React.useState<DataTAlarmVO>(EMPTY_ALARM_PAGE);
  const latestRequestIdRef = React.useRef(0);

  const { data, loading: provinceLoading } = useRequest(queryProvinceList);

  const provinceList = (data ?? []) as ProvinceVO[];
  const alarmList = (alarmPage.list ?? []) as AlarmVO[];
  const alarmTotal = alarmPage.total ?? 0;

  const handleJumpToBuildingFloor = React.useCallback((record: AlarmVO) => {
    const fallbackPrisonId = '1';
    const fallbackBuildingId = '1';
    const nextPrisonId =
      record.prisonId !== undefined && record.prisonId !== null && record.prisonId !== ''
        ? String(record.prisonId)
        : fallbackPrisonId;
    const nextBuildingId =
      record.buildingId !== undefined && record.buildingId !== null && record.buildingId !== ''
        ? String(record.buildingId)
        : fallbackBuildingId;
    const searchParams = new URLSearchParams();

    if (record.floorId !== undefined && record.floorId !== null && record.floorId !== '') {
      searchParams.set('floorId', String(record.floorId));
    }

    history.push(
      `/region/building/${nextPrisonId}/${nextBuildingId}${
        searchParams.toString() ? `?${searchParams.toString()}` : ''
      }`
    );
  }, []);

  const runAlarmSearch = React.useCallback(
    async (nextPageNum: number, nextPageSize: number) => {
      const requestId = latestRequestIdRef.current + 1;
      latestRequestIdRef.current = requestId;

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
      if (processingStatus !== -1) {
        params.processingStatus = processingStatus;
      }
      if (blocked !== -1) {
        params.blocked = blocked;
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

      try {
        setAlarmLoading(true);
        const result = await queryAlarmPage(params);
        if (requestId !== latestRequestIdRef.current) {
          return;
        }

        setAlarmPage(normalizeAlarmPage(result));
      } catch (error) {
        if (requestId !== latestRequestIdRef.current) {
          return;
        }

        setAlarmPage(EMPTY_ALARM_PAGE);
        message.error(getErrorMessage(error) || '告警列表加载失败，请稍后重试');
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setAlarmLoading(false);
        }
      }
    },
    [alarmType, blocked, deviceName, endDate, orgSelection, processingStatus, startDate]
  );

  const handleUpdateAlarm = React.useCallback(
    async (
      record: AlarmVO,
      payload: { processingStatus?: number; blocked?: number },
      successText: string
    ) => {
      if (record.id === undefined || record.id === null || record.id === '') {
        message.error('缺少告警ID');
        return;
      }
      if (
        !record.entireNo ||
        record.deviceId === undefined ||
        record.deviceId === null ||
        !record.deviceName
      ) {
        message.error('缺少告警设备信息');
        return;
      }

      try {
        await updateAlarm(record.id, {
          id: record.id,
          entireNo: record.entireNo,
          deviceId: record.deviceId,
          deviceName: record.deviceName,
          ...payload,
        });
        message.success(successText);
        await runAlarmSearch(pageNum, pageSize);
      } catch (error) {
        message.error(getErrorMessage(error) || '操作失败，请稍后重试');
      }
    },
    [pageNum, pageSize, runAlarmSearch]
  );

  const columns = React.useMemo(
    () => [
      {
        title: '告警监狱',
        dataIndex: 'prisonName',
        render: (value?: string | null) => value || '-',
      },
      {
        title: '告警设备ID',
        dataIndex: 'deviceId',
        render: (value?: number | string) => value ?? '-',
      },
      {
        title: '告警设备名称',
        dataIndex: 'deviceName',
        render: (value?: string) => value || '-',
      },
      {
        title: '告警内容',
        dataIndex: 'content',
        render: (value?: string) => value || '-',
      },
      {
        title: '告警发生时间',
        dataIndex: 'alarmTime',
        render: (value?: string) => value || '-',
      },
      {
        title: '排查建议',
        dataIndex: 'suggestions',
        render: (value?: string) => value || '-',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (_: unknown, record: AlarmVO) => (
          <Space size="small">
            <Button type="link" onClick={() => handleJumpToBuildingFloor(record)}>
              跳转定位
            </Button>
            <Button
              type="link"
              onClick={() => handleUpdateAlarm(record, { processingStatus: 1 }, '告警已清除')}
            >
              清除
            </Button>
            <Button
              type="link"
              onClick={() => handleUpdateAlarm(record, { blocked: 1 }, '告警已屏蔽')}
            >
              屏蔽
            </Button>
          </Space>
        ),
      },
    ],
    [handleJumpToBuildingFloor, handleUpdateAlarm]
  );

  React.useEffect(() => {
    runAlarmSearch(pageNum, pageSize);
  }, [pageNum, pageSize, runAlarmSearch]);

  const handleSearch = () => {
    if (pageNum !== 1) {
      setPageNum(1);
      return;
    }

    void runAlarmSearch(1, pageSize);
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
                void runAlarmSearch(1, pageSize);
              }}
            />
          </Col>
          <Col xs={24} xl={18} className={styles.rightPane}>
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
                  options={alarmTypeOptions}
                  onChange={(value) => setAlarmType(value)}
                />
              </div>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>处理状态</span>
                <Select
                  value={processingStatus}
                  options={processingStatusOptions}
                  onChange={(value) => setProcessingStatus(value)}
                />
              </div>
              <div className={styles.queryItem}>
                <span className={styles.queryLabel}>是否屏蔽</span>
                <Select
                  value={blocked}
                  options={blockedOptions}
                  onChange={(value) => setBlocked(value)}
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
                  [
                    record.id ?? '',
                    record.prisonId ?? '',
                    record.buildingId ?? '',
                    record.floorId ?? '',
                    record.deviceId ?? '',
                    record.alarmTime ?? '',
                    record.createTime ?? '',
                  ].join('-')
                )
              }
              pagination={false}
              dataSource={alarmList}
              columns={columns}
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

export default AlarmPage;
