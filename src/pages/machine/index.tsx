import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Checkbox, Col, Input, Row, message } from 'antd';
import React from 'react';
import OrgTree from '@/components/OrgTree';
import type { OrgTreeSelectionParams } from '@/components/OrgTree';
import type { ProvinceTreeVO } from './data.d';
import type { ProvinceVO } from '../region/data.d';
import { queryProvinceList } from '../region/service';
import { queryProvinceDevicePage } from './service';
import styles from './index.less';

const countryToolbarButtons = ['添加设备', '批量添加', '修改', '删除', '管理', '查找'];
const provinceToolbarButtons = ['添加设备', '批量添加', '修改', '删除', '管理'];

type ProvinceCard = {
  id: number | string;
  name: string;
};

type DeviceRow = {
  id: string | number;
  prisonKey: string;
  buildingKey: string;
  hasDevice: boolean;
  floor?: string;
  prisonName: string;
  buildingName: string;
  deviceNo: string;
  networkNo: string;
  on: string;
  power: string;
  band: string;
  workTime: string;
  color: 'pink' | 'blue';
};

const MachinePage: React.FC = () => {
  const { data, loading } = useRequest(queryProvinceList);
  const { run: runQueryProvinceDevicePage, loading: provinceDeviceLoading } = useRequest(
    queryProvinceDevicePage,
    {
      manual: true,
      onSuccess: (result) => {
        const resolved = (result as { data?: ProvinceTreeVO })?.data ?? (result as ProvinceTreeVO);
        setProvinceTreeData(resolved);
      },
      onError: () => {
        message.error('加载省份设备数据失败，请重试');
      },
    },
  );
  const provinceList = (data ?? []) as ProvinceVO[];
  const [selectedNode, setSelectedNode] = React.useState<OrgTreeSelectionParams>({
    nodeType: 'country',
  });
  const [provinceTreeData, setProvinceTreeData] = React.useState<ProvinceTreeVO>();

  const loadProvinceDevicePage = React.useCallback(
    (provinceId: number | string) => {
      runQueryProvinceDevicePage({
        provinceId,
        pageNum: 1,
        pageSize: 1000,
      });
    },
    [runQueryProvinceDevicePage],
  );

  const handleProvinceSelect = React.useCallback(
    (provinceId: number | string) => {
      setSelectedNode({
        nodeType: 'province',
        provinceId,
      });
      loadProvinceDevicePage(provinceId);
    },
    [loadProvinceDevicePage],
  );

  const tableRows = React.useMemo<DeviceRow[]>(() => {
    if (!provinceTreeData?.prisonList?.length) {
      return [];
    }

    const rows: DeviceRow[] = [];
    provinceTreeData.prisonList.forEach((prison, prisonIndex) => {
      const prisonKey = `prison-${prison.prisonId ?? prisonIndex}`;
      const prisonName = prison.prisonName || '-';
      const buildingList =
        prison.buildingList && prison.buildingList.length > 0
          ? prison.buildingList
          : [{ buildingId: `${prisonKey}-empty`, buildingName: '-', floorList: [] }];

      buildingList.forEach((building, buildingIndex) => {
        const buildingKey = `${prisonKey}-building-${building.buildingId ?? buildingIndex}`;
        const buildingName = building.buildingName || '-';
        const floorList =
          building.floorList && building.floorList.length > 0
            ? building.floorList
            : [{ floorId: `${buildingKey}-empty`, floorName: '-', deviceList: [] }];

        floorList.forEach((floor, floorIndex) => {
          const floorName = floor.floorName || '-';
          const deviceList = floor.deviceList ?? [];

          if (deviceList.length === 0) {
            rows.push({
              id: `${buildingKey}-floor-${floor.floorId ?? floorIndex}-empty`,
              prisonKey,
              buildingKey,
              hasDevice: false,
              prisonName,
              buildingName,
              floor: floorName,
              deviceNo: '-',
              networkNo: '-',
              on: '-',
              power: '-',
              band: '-',
              workTime: '-',
              color: rows.length % 2 === 0 ? 'pink' : 'blue',
            });
            return;
          }

          deviceList.forEach((device, deviceIndex) => {
            const workTime =
              device.startTime && device.endTime ? `${device.startTime}-${device.endTime}` : '-';
            rows.push({
              id: String(device.id ?? `${buildingKey}-floor-${floor.floorId ?? floorIndex}-${deviceIndex}`),
              prisonKey,
              buildingKey,
              hasDevice: true,
              prisonName,
              buildingName,
              floor: floorName,
              deviceNo: device.deviceNo || '-',
              networkNo: device.entireNo || '-',
              on: device.powerOff === 0 ? 'On' : device.powerOff === 1 ? 'Off' : '-',
              power: device.powerConfig || '-',
              band: device.radio_frequency || '-',
              workTime,
              color: rows.length % 2 === 0 ? 'pink' : 'blue',
            });
          });
        });
      });
    });

    return rows;
  }, [provinceTreeData]);

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
    if (provinceTreeData?.provinceName) {
      return provinceTreeData.provinceName;
    }

    if (!isProvinceView) {
      return '-';
    }

    const currentProvince = provinceList.find(
      (item) => String(item.provinceId) === String(selectedNode.provinceId),
    );

    return currentProvince?.provinceName || `省份-${selectedNode.provinceId}`;
  }, [isProvinceView, provinceList, provinceTreeData?.provinceName, selectedNode.provinceId]);

  const renderRows = () => {
    if (tableRows.length === 0) {
      return (
        <tr>
          <td className={`${styles.leftMergedCell} ${styles.provinceCell}`}>{provinceTitle}</td>
          <td colSpan={10} style={{ textAlign: 'center' }}>
            {provinceDeviceLoading ? '加载中...' : '暂无数据'}
          </td>
        </tr>
      );
    }

    const totalRows = tableRows.length;
    const prisonRowSpanMap = tableRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.prisonKey] = (acc[row.prisonKey] || 0) + 1;
      return acc;
    }, {});
    const buildingRowSpanMap = tableRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.buildingKey] = (acc[row.buildingKey] || 0) + 1;
      return acc;
    }, {});
    const prisonRendered = new Set<string>();
    const buildingRendered = new Set<string>();
    const rows: React.ReactNode[] = [];
    let provinceRendered = false;

    tableRows.forEach((row) => {
      const shouldRenderPrison = !prisonRendered.has(row.prisonKey);
      const shouldRenderBuilding = !buildingRendered.has(row.buildingKey);

      rows.push(
        <tr key={String(row.id)} className={row.color === 'pink' ? styles.rowPink : styles.rowBlue}>
          {!provinceRendered && (
            <td rowSpan={totalRows} className={`${styles.leftMergedCell} ${styles.provinceCell}`}>
              {provinceTitle}
            </td>
          )}
          {shouldRenderPrison && (
            <td rowSpan={prisonRowSpanMap[row.prisonKey]} className={styles.leftMergedCell}>
              {row.prisonName}
              <div className={styles.switchGroup}>
                <Checkbox>全开</Checkbox>
                <Checkbox>全关</Checkbox>
              </div>
            </td>
          )}
          {shouldRenderBuilding && (
            <td rowSpan={buildingRowSpanMap[row.buildingKey]} className={styles.leftMergedCell}>
              {row.buildingName}
              <div className={styles.switchGroup}>
                <Checkbox>全开</Checkbox>
                <Checkbox>全关</Checkbox>
              </div>
            </td>
          )}
          <td className={styles.floorCell}>
            {row.floor || ''}
            {row.floor && row.floor !== '-' && (
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
            <Checkbox disabled={!row.hasDevice} />
          </td>
        </tr>,
      );

      provinceRendered = true;
      if (shouldRenderPrison) {
        prisonRendered.add(row.prisonKey);
      }
      if (shouldRenderBuilding) {
        buildingRendered.add(row.buildingKey);
      }
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
                if (
                  params.nodeType === 'province' &&
                  params.provinceId !== undefined &&
                  params.provinceId !== null
                ) {
                  loadProvinceDevicePage(params.provinceId);
                }
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
                      onClick={() => handleProvinceSelect(item.id)}
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
                      setProvinceTreeData(undefined);
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
