import { PageContainer } from '@ant-design/pro-components';
import { CaretDownOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Button, Col, DatePicker, Input, Pagination, Row, Select, Space, Spin, Table, Tree } from 'antd';
import type { Dayjs } from 'dayjs';
import type { DataNode } from 'antd/es/tree';
import React from 'react';
import type { AlarmPageParams, AlarmVO } from './data.d';
import { queryAlarmPage } from './service';
import type { BuildingDetailVO, PrisonVO, ProvinceVO } from '../region/data.d';
import {
  queryBuildingFloors,
  queryPrisonBuildings,
  queryProvinceList,
  queryProvincePrisons,
} from '../region/service';
import styles from './index.less';

type AlarmTreeNode = Omit<DataNode, 'children'> & {
  nodeType: 'country' | 'province' | 'prison' | 'building' | 'floor';
  provinceId?: number | string;
  prisonId?: number | string;
  buildingId?: number | string;
  floorId?: number | string;
  children?: AlarmTreeNode[];
};

type FloorVO = {
  id?: number | string;
  floorName?: string;
  floorNo?: number | string;
};

const buildBuildingNodes = (buildingList: BuildingDetailVO[]): AlarmTreeNode[] =>
  buildingList.map((building, index) => ({
    title: building.name ?? '-',
    key: `building-${building.id ?? index}`,
    nodeType: 'building',
    buildingId: building.id,
    isLeaf: false,
    children: [],
  }));

const buildFloorNodes = (floorList: FloorVO[]): AlarmTreeNode[] =>
  floorList.map((floor, index) => ({
    title: floor.floorName ?? '-',
    key: `floor-${floor.id ?? floor.floorNo ?? index}`,
    nodeType: 'floor',
    floorId: floor.id,
    isLeaf: true,
  }));

const buildPrisonNodes = (prisonList: PrisonVO[]): AlarmTreeNode[] =>
  prisonList.map((prison, index) => ({
    title: prison.name ?? '-',
    key: `prison-${prison.id ?? index}`,
    nodeType: 'prison',
    prisonId: prison.id,
    isLeaf: !(prison.buildingNum && prison.buildingNum > 0),
    children: prison.buildingNum && prison.buildingNum > 0 ? [] : undefined,
  }));

const buildProvinceNodes = (provinceList: ProvinceVO[]): AlarmTreeNode[] => [
  {
    title: '全国',
    key: 'country',
    nodeType: 'country',
    children: provinceList.map((province, index) => ({
      title: province.provinceName ?? '-',
      key: `province-${province.provinceId ?? province.provinceName ?? index}`,
      nodeType: 'province',
      provinceId: province.provinceId,
      isLeaf: !(province.totalPrisons && province.totalPrisons > 0),
      children: province.totalPrisons && province.totalPrisons > 0 ? [] : undefined,
    })),
  },
];

const AlarmPage: React.FC = () => {
  const [pageNum, setPageNum] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [deviceName, setDeviceName] = React.useState('');
  const [alarmType, setAlarmType] = React.useState<string>('');

  const { data, loading: provinceLoading } = useRequest(queryProvinceList);
  const {
    data: alarmPageData,
    loading: alarmLoading,
    run: runQueryAlarmPage,
  } = useRequest(queryAlarmPage, { manual: true });
  const provinceList = (data ?? []) as ProvinceVO[];
  const [provincePrisons, setProvincePrisons] = React.useState<Record<string, PrisonVO[]>>({});
  const [prisonBuildings, setPrisonBuildings] = React.useState<Record<string, BuildingDetailVO[]>>({});
  const [buildingFloors, setBuildingFloors] = React.useState<Record<string, FloorVO[]>>({});

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

      runQueryAlarmPage(params);
    },
    [alarmType, deviceName, endDate, runQueryAlarmPage, startDate],
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

  const orgTreeData = React.useMemo<AlarmTreeNode[]>(
    () =>
      buildProvinceNodes(provinceList).map((rootNode) => ({
        ...rootNode,
        children: rootNode.children?.map((provinceNode) => {
          const provinceKey = String(provinceNode.provinceId ?? provinceNode.key);
          const prisonList = provincePrisons[provinceKey];

          if (!prisonList) {
            return provinceNode;
          }

          return {
            ...provinceNode,
            children: buildPrisonNodes(prisonList).map((prisonNode) => {
              const prisonKey = String(prisonNode.prisonId ?? prisonNode.key);
              const buildingList = prisonBuildings[prisonKey];

              if (!buildingList) {
                return prisonNode;
              }

              return {
                ...prisonNode,
                children: buildBuildingNodes(buildingList).map((buildingNode) => {
                  const buildingKey = String(buildingNode.buildingId ?? buildingNode.key);
                  const floorList = buildingFloors[buildingKey];

                  if (!floorList) {
                    return buildingNode;
                  }

                  return {
                    ...buildingNode,
                    children: buildFloorNodes(floorList),
                  };
                }),
              };
            }),
          };
        }),
      })),
    [buildingFloors, provinceList, provincePrisons, prisonBuildings],
  );

  const handleLoadData = async (treeNode: AlarmTreeNode): Promise<void> => {
    const currentNode = treeNode;

    if (currentNode.nodeType === 'province') {
      const provinceKey = String(currentNode.provinceId ?? currentNode.key);

      if (provincePrisons[provinceKey] || !currentNode.provinceId) {
        return;
      }

      const prisonList = await queryProvincePrisons(currentNode.provinceId);

      setProvincePrisons((prev) => ({
        ...prev,
        [provinceKey]: (prisonList.data ?? []) as PrisonVO[],
      }));

      return;
    }

    if (currentNode.nodeType === 'prison') {
      const prisonKey = String(currentNode.prisonId ?? currentNode.key);

      if (prisonBuildings[prisonKey] || !currentNode.prisonId) {
        return;
      }

      const buildingList = await queryPrisonBuildings(currentNode.prisonId);

      setPrisonBuildings((prev) => ({
        ...prev,
        [prisonKey]: (buildingList.data ?? []) as BuildingDetailVO[],
      }));

      return;
    }

    if (currentNode.nodeType === 'building') {
      const buildingKey = String(currentNode.buildingId ?? currentNode.key);

      if (buildingFloors[buildingKey] || !currentNode.buildingId) {
        return;
      }

      const floorList = await queryBuildingFloors(currentNode.buildingId);

      setBuildingFloors((prev) => ({
        ...prev,
        [buildingKey]: (floorList.data ?? []) as FloorVO[],
      }));
    }
  };

  return (
    <PageContainer title={false}>
      <div className={styles.pageShell}>
        <Row gutter={0} className={styles.contentRow}>
          <Col xs={24} xl={6} className={styles.leftPane}>
            <Spin spinning={provinceLoading} className={styles.treeSpin}>
              <Tree<AlarmTreeNode>
                className={styles.orgTree}
                treeData={orgTreeData}
                defaultExpandedKeys={['country']}
                loadData={handleLoadData}
                selectable={false}
                switcherIcon={({ expanded }) => (
                  <CaretDownOutlined
                    className={styles.treeSwitcherIcon}
                    rotate={expanded ? 0 : -90}
                  />
                )}
              />
            </Spin>
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
