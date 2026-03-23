import { PageContainer } from '@ant-design/pro-components';
import { CaretDownOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Button, Col, DatePicker, Input, Pagination, Row, Select, Space, Spin, Table, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React from 'react';
import type { BuildingDetailVO, PrisonVO, ProvinceVO } from '../region/data.d';
import { queryPrisonBuildings, queryProvinceList, queryProvincePrisons } from '../region/service';
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

const alarmRows: AlarmRow[] = Array.from({ length: 10 }, (_, index) => ({
  key: `${index}`,
  prison: 'AAA监狱',
  deviceId: 'S11001',
  deviceName: '屏蔽仪',
  content: '温度过高',
  alarmTime: '2025-12-12 12:00:00',
  advice: '重启',
}));

type AlarmTreeNode = Omit<DataNode, 'children'> & {
  nodeType: 'country' | 'province' | 'prison' | 'building';
  provinceId?: number | string;
  prisonId?: number | string;
  buildingId?: number | string;
  children?: AlarmTreeNode[];
};

const buildBuildingNodes = (buildingList: BuildingDetailVO[]): AlarmTreeNode[] =>
  buildingList.map((building, index) => ({
    title: building.name ?? '-',
    key: `building-${building.id ?? index}`,
    nodeType: 'building',
    buildingId: building.id,
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
  const { data, loading: provinceLoading } = useRequest(queryProvinceList);
  const provinceList = (data ?? []) as ProvinceVO[];
  const [provincePrisons, setProvincePrisons] = React.useState<Record<string, PrisonVO[]>>({});
  const [prisonBuildings, setPrisonBuildings] = React.useState<Record<string, BuildingDetailVO[]>>({});

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
                children: buildBuildingNodes(buildingList),
              };
            }),
          };
        }),
      })),
    [provinceList, provincePrisons, prisonBuildings],
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
