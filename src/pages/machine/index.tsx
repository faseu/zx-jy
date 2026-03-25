import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Checkbox, Col, Input, Row } from 'antd';
import React from 'react';
import OrgTree from '@/components/OrgTree';
import type { OrgTreeSelectionParams } from '@/components/OrgTree';
import type { ProvinceVO } from '../region/data.d';
import { queryProvinceList } from '../region/service';
import styles from './index.less';

const countryToolbarButtons = ['添加设备', '批量添加', '修改', '删除', '管理', '查找'];
const provinceToolbarButtons = ['添加设备', '批量添加', '修改', '删除', '管理'];

type ProvinceCard = {
  id: number | string;
  name: string;
};

type DeviceRow = {
  id: string;
  floor?: string;
  deviceNo: string;
  networkNo: string;
  on: string;
  power: string;
  band: string;
  workTime: string;
  color: 'pink' | 'blue';
};

type BuildingGroup = {
  prisonName: string;
  buildingName: string;
  rows: DeviceRow[];
};

const tableData: BuildingGroup[] = [
  {
    prisonName: 'AAAA监狱',
    buildingName: 'AABB楼',
    rows: [
      {
        id: 'a-1',
        floor: '1楼',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
      {
        id: 'a-2',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
      {
        id: 'a-3',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
      {
        id: 'a-4',
        floor: '2楼',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
    ],
  },
  {
    prisonName: 'AAAA监狱',
    buildingName: 'BBCC楼',
    rows: [
      {
        id: 'b-1',
        floor: '1楼',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
      {
        id: 'b-2',
        floor: '2楼',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
    ],
  },
  {
    prisonName: 'BBBB监狱',
    buildingName: 'AABB楼',
    rows: [
      {
        id: 'c-1',
        floor: '1楼',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'blue',
      },
    ],
  },
];

const MachinePage: React.FC = () => {
  const { data, loading } = useRequest(queryProvinceList);
  const provinceList = (data ?? []) as ProvinceVO[];
  const [selectedNode, setSelectedNode] = React.useState<OrgTreeSelectionParams>({
    nodeType: 'country',
  });

  const machineCards = React.useMemo<ProvinceCard[]>(
    () =>
      provinceList
        .filter((item) => item.provinceId !== undefined && item.provinceId !== null && item.provinceName)
        .map((item) => ({
          id: item.provinceId as number | string,
          name: item.provinceName as string,
        })),
    [provinceList],
  );

  const isProvinceView =
    selectedNode.nodeType === 'province' &&
    selectedNode.provinceId !== undefined &&
    selectedNode.provinceId !== null;

  const provinceTitle = React.useMemo(() => {
    if (!isProvinceView) {
      return '-';
    }

    const currentProvince = provinceList.find(
      (item) => String(item.provinceId) === String(selectedNode.provinceId),
    );

    return currentProvince?.provinceName || `省份-${selectedNode.provinceId}`;
  }, [isProvinceView, provinceList, selectedNode.provinceId]);

  const renderRows = () => {
    const totalRows = tableData.reduce((sum, group) => sum + group.rows.length, 0);
    const rows: React.ReactNode[] = [];
    let provinceRendered = false;

    tableData.forEach((group) => {
      group.rows.forEach((row, index) => {
        rows.push(
          <tr key={row.id} className={row.color === 'pink' ? styles.rowPink : styles.rowBlue}>
            {!provinceRendered && (
              <td rowSpan={totalRows} className={`${styles.leftMergedCell} ${styles.provinceCell}`}>
                {provinceTitle}
              </td>
            )}

            {index === 0 && (
              <td rowSpan={group.rows.length} className={styles.leftMergedCell}>
                {group.prisonName}
                <div className={styles.switchGroup}>
                  <Checkbox>全开</Checkbox>
                  <Checkbox>全关</Checkbox>
                </div>
              </td>
            )}

            {index === 0 && (
              <td rowSpan={group.rows.length} className={styles.leftMergedCell}>
                {group.buildingName}
                <div className={styles.switchGroup}>
                  <Checkbox>全开</Checkbox>
                  <Checkbox>全关</Checkbox>
                </div>
              </td>
            )}

            <td className={styles.floorCell}>
              {row.floor || ''}
              {row.floor && (
                <div className={styles.switchGroup}>
                  <Checkbox>全开</Checkbox>
                  <Checkbox>全关</Checkbox>
                </div>
              )}
            </td>
            <td>{row.deviceNo}</td>
            <td>{row.networkNo}</td>
            <td>{row.on}</td>
            <td>{row.power}</td>
            <td>{row.band}</td>
            <td>{row.workTime}</td>
            <td className={styles.checkCell}>
              <Checkbox />
            </td>
          </tr>,
        );
        provinceRendered = true;
      });
    });

    return rows;
  };

  return (
    <PageContainer title={false}>
      <div className={styles.pageShell}>
        <Row gutter={0} className={styles.contentRow}>
          <Col xs={24} xl={6} className={styles.leftPane}>
            <OrgTree
              provinceList={provinceList}
              loading={loading}
              maxLevel={1}
              onSelectionChange={(params) => {
                setSelectedNode(params);
              }}
            />
          </Col>
          <Col xs={24} xl={18} className={styles.rightPane}>
            {!isProvinceView ? (
              <>
                <div className={styles.toolbar}>
                  <Button type="primary">所有设备</Button>
                  {countryToolbarButtons.map((item) => (
                    <Button key={item}>{item}</Button>
                  ))}
                </div>
                <div className={styles.machineGrid}>
                  {machineCards.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className={styles.machineCard}
                      onClick={() =>
                        setSelectedNode({
                          nodeType: 'province',
                          provinceId: item.id,
                        })
                      }
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className={styles.toolbar}>
                  <Button type="primary">所有设备</Button>
                  {provinceToolbarButtons.map((item) => (
                    <Button key={item}>{item}</Button>
                  ))}
                  <div className={styles.searchArea}>
                    <Input placeholder="请输入" />
                    <Button>查找</Button>
                  </div>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.deviceTable}>
                    <thead>
                      <tr>
                        <th>省份</th>
                        <th>监狱</th>
                        <th>楼栋</th>
                        <th>楼层</th>
                        <th>设备编号</th>
                        <th>全网编号</th>
                        <th>开关</th>
                        <th>功率配置</th>
                        <th>频段配置</th>
                        <th>工作时间配置</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>{renderRows()}</tbody>
                  </table>
                </div>
                <div className={styles.backBar}>
                  <Button
                    onClick={() => {
                      setSelectedNode({ nodeType: 'country' });
                    }}
                  >
                    返回
                  </Button>
                </div>
              </>
            )}
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default MachinePage;
