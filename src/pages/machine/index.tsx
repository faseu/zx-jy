import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Checkbox, Col, Form, Input, Row, message } from 'antd';
import React from 'react';
import OrgTree from '@/components/OrgTree';
import type { OrgTreeSelectionParams } from '@/components/OrgTree';
import type { BuildingTreeVO, PrisonTreeVO, ProvinceTreeVO } from './data.d';
import AddDeviceModal from '../region/components/AddDeviceModal';
import type { ProvinceVO } from '../region/data.d';
import { createDevice, queryProvinceList } from '../region/service';
import { queryBuildingDevicePage, queryPrisonDevicePage, queryProvinceDevicePage } from './service';
import styles from './index.less';

const countryToolbarButtons = ['添加设备', '批量添加', '修改', '删除', '管理', '查找'];
const provinceToolbarButtons = ['添加设备', '批量添加', '修改', '删除', '管理'];

type ProvinceCard = {
  id: number | string;
  name: string;
};

type DeviceRow = {
  id: string | number;
  prisonId?: number | string;
  buildingId?: number | string;
  floorId?: number | string;
  prisonKey: string;
  buildingKey: string;
  floorKey: string;
  rowType: 'device' | 'add';
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

type AddDeviceContext = {
  prisonId: number;
  prisonName: string;
  buildingId: number;
  buildingName: string;
  floorId: number;
  floorName: string;
};

const POWER_CHANNEL_KEYS = Array.from({ length: 18 }, (_, index) => `ch${index + 1}`);
const INITIAL_POWER_CHANNEL_VALUES = Object.fromEntries(
  POWER_CHANNEL_KEYS.map((key) => [key, 0]),
) as Record<string, number>;

const normalizeBuildingTreeToPrisonTree = (
  buildingTree: BuildingTreeVO | undefined,
  params: OrgTreeSelectionParams,
): PrisonTreeVO => ({
  prisonId: params.prisonId,
  prisonName: params.prisonId ? `监狱-${params.prisonId}` : '-',
  buildingList: buildingTree
    ? [
        {
          ...buildingTree,
          buildingId: buildingTree.buildingId ?? params.buildingId,
        },
      ]
    : [],
});

const MachinePage: React.FC = () => {
  const [deviceForm] = Form.useForm();
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
  const { run: runQueryPrisonDevicePage, loading: prisonDeviceLoading } = useRequest(
    queryPrisonDevicePage,
    {
      manual: true,
      onSuccess: (result) => {
        const resolved = (result as { data?: PrisonTreeVO })?.data ?? (result as PrisonTreeVO);
        setPrisonTreeData(resolved);
      },
      onError: () => {
        message.error('加载监狱设备数据失败，请重试');
      },
    },
  );
  const { run: runQueryBuildingDevicePage, loading: buildingDeviceLoading } = useRequest(
    queryBuildingDevicePage,
    {
      manual: true,
      onSuccess: (result) => {
        const resolved = (result as { data?: BuildingTreeVO })?.data ?? (result as BuildingTreeVO);
        setPrisonTreeData(
          normalizeBuildingTreeToPrisonTree(resolved, buildingRequestSelectionRef.current),
        );
      },
      onError: () => {
        message.error('加载楼宇设备数据失败，请重试');
      },
    },
  );
  const provinceList = (data ?? []) as ProvinceVO[];
  const [deviceModalOpen, setDeviceModalOpen] = React.useState(false);
  const [deviceStep, setDeviceStep] = React.useState(0);
  const [powerChannelValues, setPowerChannelValues] = React.useState<Record<string, number>>({
    ...INITIAL_POWER_CHANNEL_VALUES,
  });
  const [addDeviceContext, setAddDeviceContext] = React.useState<AddDeviceContext | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<OrgTreeSelectionParams>({
    nodeType: 'country',
  });
  const [provinceTreeData, setProvinceTreeData] = React.useState<ProvinceTreeVO>();
  const [prisonTreeData, setPrisonTreeData] = React.useState<PrisonTreeVO>();
  const buildingRequestSelectionRef = React.useRef<OrgTreeSelectionParams>({
    nodeType: 'building',
  });

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

  const loadPrisonDevicePage = React.useCallback(
    (prisonId: number | string) => {
      runQueryPrisonDevicePage({
        prisonId,
        pageNum: 1,
        pageSize: 1000,
      });
    },
    [runQueryPrisonDevicePage],
  );

  const loadBuildingDevicePage = React.useCallback(
    (params: OrgTreeSelectionParams) => {
      if (params.buildingId === undefined || params.buildingId === null) {
        return;
      }

      buildingRequestSelectionRef.current = params;
      runQueryBuildingDevicePage({
        buildingId: params.buildingId,
        pageNum: 1,
        pageSize: 1000,
      });
    },
    [runQueryBuildingDevicePage],
  );

  const handleProvinceSelect = React.useCallback(
    (provinceId: number | string) => {
      setSelectedNode({
        nodeType: 'province',
        provinceId,
      });
      setProvinceTreeData(undefined);
      setPrisonTreeData(undefined);
      loadProvinceDevicePage(provinceId);
    },
    [loadProvinceDevicePage],
  );

  const tableRows = React.useMemo<DeviceRow[]>(() => {
    const prisonList =
      selectedNode.nodeType === 'province'
        ? provinceTreeData?.prisonList ?? []
        : prisonTreeData
          ? [prisonTreeData]
          : [];

    if (!prisonList.length) {
      return [];
    }

    const rows: DeviceRow[] = [];
    prisonList.forEach((prison, prisonIndex) => {
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
          const floorKey = `${buildingKey}-floor-${floor.floorId ?? floorIndex}`;
          const deviceList = floor.deviceList ?? [];

          if (deviceList.length === 0) {
            rows.push({
              id: `${floorKey}-empty`,
              prisonId: prison.prisonId,
              buildingId: building.buildingId,
              floorId: floor.floorId,
              prisonKey,
              buildingKey,
              floorKey,
              rowType: 'device',
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

            if (floorName !== '-') {
              rows.push({
                id: `${floorKey}-add`,
                prisonId: prison.prisonId,
                buildingId: building.buildingId,
                floorId: floor.floorId,
                prisonKey,
                buildingKey,
                floorKey,
                rowType: 'add',
                hasDevice: false,
                prisonName,
                buildingName,
                floor: floorName,
                deviceNo: '',
                networkNo: '',
                on: '',
                power: '',
                band: '',
                workTime: '',
                color: rows.length % 2 === 0 ? 'pink' : 'blue',
              });
            }
            return;
          }

          deviceList.forEach((device, deviceIndex) => {
            const workTime =
              device.startTime && device.endTime ? `${device.startTime}-${device.endTime}` : '-';
            rows.push({
              id: String(device.id ?? `${floorKey}-${deviceIndex}`),
              prisonId: prison.prisonId,
              buildingId: building.buildingId,
              floorId: floor.floorId,
              prisonKey,
              buildingKey,
              floorKey,
              rowType: 'device',
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

          if (floorName !== '-') {
            rows.push({
              id: `${floorKey}-add`,
              prisonId: prison.prisonId,
              buildingId: building.buildingId,
              floorId: floor.floorId,
              prisonKey,
              buildingKey,
              floorKey,
              rowType: 'add',
              hasDevice: false,
              prisonName,
              buildingName,
              floor: floorName,
              deviceNo: '',
              networkNo: '',
              on: '',
              power: '',
              band: '',
              workTime: '',
              color: rows.length % 2 === 0 ? 'pink' : 'blue',
            });
          }
        });
      });
    });

    return rows;
  }, [provinceTreeData?.prisonList, prisonTreeData, selectedNode.nodeType]);

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
  const isPrisonView =
    selectedNode.nodeType === 'prison' &&
    selectedNode.prisonId !== undefined &&
    selectedNode.prisonId !== null;
  const isBuildingView =
    selectedNode.nodeType === 'building' &&
    selectedNode.buildingId !== undefined &&
    selectedNode.buildingId !== null;
  const isDetailView = isProvinceView || isPrisonView || isBuildingView;

  const prisonOptions = React.useMemo(
    () =>
      addDeviceContext
        ? [{ label: addDeviceContext.prisonName, value: addDeviceContext.prisonId }]
        : [],
    [addDeviceContext],
  );

  const buildingOptions = React.useMemo(
    () =>
      addDeviceContext
        ? [{ label: addDeviceContext.buildingName, value: addDeviceContext.buildingId }]
        : [],
    [addDeviceContext],
  );

  const floorOptions = React.useMemo(
    () =>
      addDeviceContext ? [{ label: addDeviceContext.floorName, value: addDeviceContext.floorId }] : [],
    [addDeviceContext],
  );

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

  const prisonTitle = React.useMemo(() => {
    if (prisonTreeData?.prisonName) {
      return prisonTreeData.prisonName;
    }

    if (isPrisonView) {
      return `监狱-${selectedNode.prisonId}`;
    }

    if (isBuildingView && selectedNode.prisonId !== undefined && selectedNode.prisonId !== null) {
      return `监狱-${selectedNode.prisonId}`;
    }

    return '-';
  }, [isBuildingView, isPrisonView, prisonTreeData?.prisonName, selectedNode.prisonId]);

  const handleOpenAddDeviceModal = React.useCallback(
    (row: DeviceRow) => {
      const prisonId = Number(row.prisonId);
      const buildingId = Number(row.buildingId);
      const floorId = Number(row.floorId);

      if (!prisonId || !buildingId || !floorId) {
        message.warning('当前楼层信息不完整，无法添加设备');
        return;
      }

      setAddDeviceContext({
        prisonId,
        prisonName: row.prisonName,
        buildingId,
        buildingName: row.buildingName,
        floorId,
        floorName: row.floor || `楼层-${floorId}`,
      });
      setDeviceStep(0);
      setPowerChannelValues({ ...INITIAL_POWER_CHANNEL_VALUES });
      deviceForm.setFieldsValue({
        prisonId,
        buildingId,
        floorId,
        deviceCode: undefined,
        networkCode: undefined,
        ip: undefined,
        port: undefined,
        startTime: undefined,
        stopTime: undefined,
        powerOff: true,
        ...Object.fromEntries(POWER_CHANNEL_KEYS.map((key) => [key, undefined])),
      });
      setDeviceModalOpen(true);
    },
    [deviceForm],
  );

  const handleDeviceCancel = React.useCallback(() => {
    setDeviceModalOpen(false);
    setDeviceStep(0);
    setAddDeviceContext(null);
    deviceForm.resetFields();
  }, [deviceForm]);

  const handleDeviceNext = React.useCallback(async () => {
    try {
      await deviceForm.validateFields(['prisonId', 'buildingId', 'floorId', 'deviceCode']);
      setDeviceStep(1);
    } catch {
      return;
    }
  }, [deviceForm]);

  const handleDevicePrev = React.useCallback(() => {
    setDeviceStep(0);
  }, []);

  const handleDeviceFinish = React.useCallback(async () => {
    try {
      await deviceForm.validateFields(['networkCode', 'ip', 'port', 'startTime', 'stopTime']);
      const values = deviceForm.getFieldsValue(true);
      const formatTime = (value: any) =>
        value && typeof value.format === 'function' ? value.format('HH:mm') : value;
      const channelPayload = POWER_CHANNEL_KEYS.reduce(
        (acc, key) => {
          acc[key] = powerChannelValues[key] ?? 0;
          return acc;
        },
        {} as Record<string, any>,
      );

      await createDevice({
        deviceNo: values.deviceCode,
        deviceName: values.deviceCode,
        entireNo: values.networkCode,
        floorId: values.floorId,
        buildingId: values.buildingId,
        prisonId: values.prisonId,
        powerOff: values.powerOff ? 0 : 1,
        ipAddress: values.ip,
        port: values.port,
        startTime: formatTime(values.startTime),
        endTime: formatTime(values.stopTime),
        ...channelPayload,
      });

      message.success('添加成功');
      setDeviceModalOpen(false);
      setDeviceStep(0);
      setAddDeviceContext(null);
      deviceForm.resetFields();

      if (selectedNode.nodeType === 'province' && selectedNode.provinceId !== undefined && selectedNode.provinceId !== null) {
        loadProvinceDevicePage(selectedNode.provinceId);
      }
      if (selectedNode.nodeType === 'prison' && selectedNode.prisonId !== undefined && selectedNode.prisonId !== null) {
        loadPrisonDevicePage(selectedNode.prisonId);
      }
      if (
        selectedNode.nodeType === 'building' &&
        selectedNode.buildingId !== undefined &&
        selectedNode.buildingId !== null
      ) {
        loadBuildingDevicePage(selectedNode);
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error('添加失败');
    }
  }, [
    deviceForm,
    loadBuildingDevicePage,
    loadPrisonDevicePage,
    loadProvinceDevicePage,
    powerChannelValues,
    selectedNode,
  ]);

  const renderRows = () => {
    const detailLoading = provinceDeviceLoading || prisonDeviceLoading || buildingDeviceLoading;

    if (tableRows.length === 0) {
      return (
        <tr>
          {isProvinceView && (
            <td className={`${styles.leftMergedCell} ${styles.provinceCell}`}>{provinceTitle}</td>
          )}
          <td className={styles.leftMergedCell}>{isPrisonView ? prisonTitle : '-'}</td>
          <td colSpan={isProvinceView ? 9 : 8} style={{ textAlign: 'center' }}>
            {detailLoading ? '加载中...' : '暂无数据'}
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
    const floorRowSpanMap = tableRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.floorKey] = (acc[row.floorKey] || 0) + 1;
      return acc;
    }, {});
    const prisonRendered = new Set<string>();
    const buildingRendered = new Set<string>();
    const floorRendered = new Set<string>();
    const rows: React.ReactNode[] = [];
    let provinceRendered = false;

    tableRows.forEach((row) => {
      const shouldRenderPrison = !prisonRendered.has(row.prisonKey);
      const shouldRenderBuilding = !buildingRendered.has(row.buildingKey);
      const shouldRenderFloor = !floorRendered.has(row.floorKey);

      rows.push(
        <tr key={String(row.id)} className={row.color === 'pink' ? styles.rowPink : styles.rowBlue}>
          {isProvinceView && !provinceRendered && (
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
          {shouldRenderFloor && (
            <td rowSpan={floorRowSpanMap[row.floorKey]} className={styles.floorCell}>
              {row.floor || ''}
              {row.floor && row.floor !== '-' && (
                <div className={styles.switchGroup}>
                  <Checkbox>全开</Checkbox>
                  <Checkbox>全关</Checkbox>
                </div>
              )}
            </td>
          )}
          {row.rowType === 'add' ? (
            <td colSpan={7} className={styles.addDeviceRow}>
              <Button
                type="link"
                className={styles.floorAddButton}
                onClick={() => handleOpenAddDeviceModal(row)}
              >
                添加设备
              </Button>
            </td>
          ) : (
            <>
              <td>{row.deviceNo}</td>
              <td>{row.networkNo}</td>
              <td>{row.on}</td>
              <td>{row.power}</td>
              <td>{row.band}</td>
              <td>{row.workTime}</td>
              <td className={styles.checkCell}>
                <Checkbox disabled={!row.hasDevice} />
              </td>
            </>
          )}
        </tr>,
      );

      provinceRendered = true;
      if (shouldRenderPrison) {
        prisonRendered.add(row.prisonKey);
      }
      if (shouldRenderBuilding) {
        buildingRendered.add(row.buildingKey);
      }
      if (shouldRenderFloor) {
        floorRendered.add(row.floorKey);
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
              maxLevel={3}
              onSelectionChange={(params) => {
                setSelectedNode(params);
                if (
                  params.nodeType === 'province' &&
                  params.provinceId !== undefined &&
                  params.provinceId !== null
                ) {
                  setProvinceTreeData(undefined);
                  setPrisonTreeData(undefined);
                  loadProvinceDevicePage(params.provinceId);
                  return;
                }
                if (
                  params.nodeType === 'prison' &&
                  params.prisonId !== undefined &&
                  params.prisonId !== null
                ) {
                  setProvinceTreeData(undefined);
                  setPrisonTreeData(undefined);
                  loadPrisonDevicePage(params.prisonId);
                  return;
                }
                if (
                  params.nodeType === 'building' &&
                  params.buildingId !== undefined &&
                  params.buildingId !== null
                ) {
                  setProvinceTreeData(undefined);
                  setPrisonTreeData(undefined);
                  loadBuildingDevicePage(params);
                  return;
                }
                setProvinceTreeData(undefined);
                setPrisonTreeData(undefined);
              }}
            />
          </Col>
          <Col xs={24} xl={18} className={styles.rightPane}>
            {!isDetailView ? (
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
                        {isProvinceView && <th>省份</th>}
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
                      setPrisonTreeData(undefined);
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
      <AddDeviceModal
        open={deviceModalOpen}
        step={deviceStep}
        form={deviceForm}
        powerChannelKeys={POWER_CHANNEL_KEYS}
        powerChannelValues={powerChannelValues}
        prisonOptions={prisonOptions}
        buildingOptions={buildingOptions}
        floorOptions={floorOptions}
        deviceBuildingsLoading={false}
        onCancel={handleDeviceCancel}
        onNext={handleDeviceNext}
        onPrev={handleDevicePrev}
        onFinish={handleDeviceFinish}
        onPrisonChange={() => {}}
        onBuildingChange={() => {}}
        onPowerChannelChange={(key, value) =>
          setPowerChannelValues((prev) => ({ ...prev, [key]: value }))
        }
      />
    </PageContainer>
  );
};

export default MachinePage;
