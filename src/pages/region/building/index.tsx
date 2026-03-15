import {PageContainer} from '@ant-design/pro-components';
import {history, useParams, useRequest} from '@umijs/max';
import {
  Button,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Slider,
  Spin,
  Steps,
  Switch,
  TimePicker,
  Upload,
  message,
} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import gb from '@/assets/gb.png';
import 'ol/ol.css';
import OlMap from 'ol/Map';
import View from 'ol/View';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import ImageLayer from 'ol/layer/Image';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {defaults as defaultInteractions, Select as OlSelect, Translate} from 'ol/interaction';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style';
import {getCenter} from 'ol/extent';
import shielder from '@/assets/shielder.png';
import type {BuildingInfoVO} from '../data.d';
import {
  createDevice,
  queryBuildingFloorForm,
  queryBuildingFloors,
  queryBuildingInfo,
  queryFloorDevicePage,
  queryPrisonBuildings,
  queryPrisonInfo,
  updateFloorDrawing,
} from '../service';

type DevicePosition = [number, number];

type DeviceItem = {
  id: number;
  label: string;
  position: DevicePosition | null;
};

const INITIAL_DEVICES: DeviceItem[] = [];
const POWER_CHANNEL_KEYS = Array.from({length: 18}, (_, index) => `ch${index + 1}`);
const INITIAL_POWER_CHANNEL_VALUES = Object.fromEntries(POWER_CHANNEL_KEYS.map((key) => [key, 0])) as Record<string, number>;

const BuildingDetailPage: React.FC = () => {
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [deviceStep, setDeviceStep] = useState(0);
  const [devicePrisonId, setDevicePrisonId] = useState<number | null>(null);
  const [deviceBuildingId, setDeviceBuildingId] = useState<number | null>(null);
  const [devices, setDevices] = useState<DeviceItem[]>(INITIAL_DEVICES);
  const [powerChannelValues, setPowerChannelValues] = useState<Record<string, number>>({
    ...INITIAL_POWER_CHANNEL_VALUES,
  });
  const [placingDeviceId, setPlacingDeviceId] = useState<number | null>(null);
  const [drawingLoading, setDrawingLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<OlMap | null>(null);
  const markerSourceRef = useRef<VectorSource | null>(null);
  const placingDeviceIdRef = useRef<number | null>(null);
  const [planForm] = Form.useForm();
  const [deviceForm] = Form.useForm();

  const params = useParams<{id: string; prisonId: string}>();
  const buildingId = params.id ?? '';
  const prisonId = params.prisonId ?? '';

  const {data: detailData, loading: detailLoading} = useRequest(() => queryBuildingInfo(buildingId), {
    ready: Boolean(buildingId),
    refreshDeps: [buildingId],
  });

  const {data: floorData, refresh: refreshFloors} = useRequest(() => queryBuildingFloors(buildingId), {
    ready: Boolean(buildingId),
    refreshDeps: [buildingId],
  });
  const {data: floorFormData, loading: floorFormLoading, refresh: refreshFloorForm} = useRequest(
    () => queryBuildingFloorForm(selectedFloorId as number),
    {
      ready: Boolean(selectedFloorId),
      refreshDeps: [selectedFloorId],
    },
  );

  const {data: prisonDetail} = useRequest(() => queryPrisonInfo(prisonId), {
    ready: Boolean(prisonId),
    refreshDeps: [prisonId],
  });

  const {data: deviceBuildingsData, loading: deviceBuildingsLoading} = useRequest(
    () => queryPrisonBuildings(devicePrisonId as number),
    {
      ready: Boolean(devicePrisonId),
      refreshDeps: [devicePrisonId],
    },
  );

  const {data: floorDevicePageData, loading: floorDevicesLoading, refresh: refreshFloorDevices} = useRequest(
    () =>
      queryFloorDevicePage({
        floorId: selectedFloorId as number,
        pageNum: 1,
        pageSize: 200,
      }),
    {
      ready: Boolean(selectedFloorId),
      refreshDeps: [selectedFloorId],
    },
  );

  const detail: BuildingInfoVO | undefined = detailData;

  const prisonOptions = prisonId
    ? [
        {
          label: prisonDetail?.name || `监狱${prisonId}`,
          value: Number(prisonId),
        },
      ]
    : [];

  const deviceBuildingOptions =
    deviceBuildingsData?.map((item: any) => ({
      label: item.name || `楼栋${item.id}`,
      value: Number(item.id),
    })) ?? [];

  const floorOptions =
    floorData?.map((item: any) => ({
      label: item.floorName,
      value: Number(item.id),
    })) ?? [];

  const currentFloorFromList = floorData?.find((item: any) => Number(item.id) === Number(selectedFloorId));
  const currentFloorDrawing = floorFormData?.floorDrawing ?? currentFloorFromList?.floorDrawing;
  const currentFloorName = floorFormData?.floorName;
  const currentFloorDeviceNumber = floorFormData?.deviceNumber ?? 0;
  const isImageDrawing = /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(currentFloorDrawing ?? '');
  const floorDeviceRows: any[] = (() => {
    const raw: any = floorDevicePageData;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.records)) return raw.records;
    if (Array.isArray(raw?.list)) return raw.list;
    if (Array.isArray(raw?.rows)) return raw.rows;
    if (Array.isArray(raw?.data?.records)) return raw.data.records;
    if (Array.isArray(raw?.data?.list)) return raw.data.list;
    if (Array.isArray(raw?.data?.rows)) return raw.data.rows;
    return [];
  })();

  useEffect(() => {
    if (!floorData?.length || selectedFloorId) return;
    setSelectedFloorId(floorData[0].id);
  }, [floorData, selectedFloorId]);

  const clampCoordinate = (coord: DevicePosition): DevicePosition => {
    const map = mapRef.current;
    if (!map) return coord;
    const extent = map.getView().getProjection().getExtent();
    if (!extent) return coord;
    return [
      Math.min(Math.max(coord[0], extent[0]), extent[2]),
      Math.min(Math.max(coord[1], extent[1]), extent[3]),
    ];
  };

  const placeDevice = (deviceId: number, coord: DevicePosition) => {
    const targetCoord = clampCoordinate(coord);
    setDevices((prev) =>
      prev.map((item) => {
        if (item.id !== deviceId) return item;
        return {...item, position: targetCoord};
      }),
    );
    setPlacingDeviceId(null);
  };

  const handleDeviceDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const map = mapRef.current;
    const mapContainer = mapContainerRef.current;
    if (!map || !mapContainer) return;
    const deviceId = Number(event.dataTransfer.getData('text/plain'));
    if (!deviceId) return;
    const rect = mapContainer.getBoundingClientRect();
    const pixel: [number, number] = [event.clientX - rect.left, event.clientY - rect.top];
    const coord = map.getCoordinateFromPixel(pixel);
    if (!coord) return;
    placeDevice(deviceId, coord as DevicePosition);
  };

  useEffect(() => {
    placingDeviceIdRef.current = placingDeviceId;
  }, [placingDeviceId]);

  useEffect(() => {
    let cancelled = false;
    if (!currentFloorDrawing || !isImageDrawing) {
      setDrawingLoading(false);
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
      }
      markerSourceRef.current = null;
      return;
    }
    setDrawingLoading(true);
    const image = new window.Image();
    image.src = currentFloorDrawing;
    image.onload = () => {
      if (cancelled || !mapContainerRef.current) return;
      const extent: [number, number, number, number] = [0, 0, image.width, image.height];
      const projection = new Projection({
        code: 'building-map-image',
        units: 'pixels',
        extent,
      });

      const imageLayer = new ImageLayer({
        source: new Static({
          url: currentFloorDrawing,
          projection,
          imageExtent: extent,
        }),
      });

      const markerSource = new VectorSource();
      markerSourceRef.current = markerSource;
      const markerLayer = new VectorLayer({
        source: markerSource,
        style: (feature: any) => {
          const label = String(feature.get('label') ?? '');
          return new Style({
            image: new CircleStyle({
              radius: 14,
              fill: new Fill({color: '#1677ff'}),
              stroke: new Stroke({color: '#ffffff', width: 2}),
            }),
            text: new Text({
              text: label,
              fill: new Fill({color: '#ffffff'}),
              font: 'bold 14px sans-serif',
            }),
          });
        },
      });

      const map = new OlMap({
        target: mapContainerRef.current,
        layers: [imageLayer, markerLayer],
        interactions: defaultInteractions({doubleClickZoom: false}),
        view: new View({
          projection,
          center: getCenter(extent),
          zoom: 2,
          minZoom: 1,
          maxZoom: 8,
          extent,
        }),
      });
      map.getView().fit(extent, {padding: [12, 12, 12, 12], nearest: true});

      const selectInteraction = new OlSelect({layers: [markerLayer], hitTolerance: 8});
      const translateInteraction = new Translate({
        features: selectInteraction.getFeatures(),
        hitTolerance: 8,
      });
      translateInteraction.on('translateend', (evt: any) => {
        const feature = evt.features.item(0);
        const geometry = feature?.getGeometry();
        if (!(geometry instanceof Point)) return;
        const deviceId = Number(feature.get('deviceId'));
        if (!deviceId) return;
        placeDevice(deviceId, geometry.getCoordinates() as DevicePosition);
      });
      map.addInteraction(selectInteraction);
      map.addInteraction(translateInteraction);

      map.on('click', (evt: any) => {
        if (!placingDeviceIdRef.current) return;
        placeDevice(placingDeviceIdRef.current, evt.coordinate as DevicePosition);
      });

      mapRef.current = map;
      setDrawingLoading(false);
    };
    image.onerror = () => {
      setDrawingLoading(false);
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
      }
      markerSourceRef.current = null;
    };
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
      }
      markerSourceRef.current = null;
    };
  }, [currentFloorDrawing, isImageDrawing]);

  useEffect(() => {
    const source = markerSourceRef.current;
    if (!source) return;
    const nextDeviceMap = new Map<number, DeviceItem>();
    devices.forEach((item) => {
      if (item.position) nextDeviceMap.set(item.id, item);
    });

    source.getFeatures().forEach((feature: any) => {
      const deviceId = Number(feature.get('deviceId'));
      const next = nextDeviceMap.get(deviceId);
      if (!next || !next.position) {
        source.removeFeature(feature);
        return;
      }
      const geometry = feature.getGeometry();
      if (geometry instanceof Point) {
        geometry.setCoordinates(next.position);
      } else {
        feature.setGeometry(new Point(next.position));
      }
      feature.set('label', next.label);
      nextDeviceMap.delete(deviceId);
    });

    nextDeviceMap.forEach((item) => {
      if (!item.position) return;
      const feature = new Feature({
        geometry: new Point(item.position),
      });
      feature.set('deviceId', item.id);
      feature.set('label', item.label);
      source.addFeature(feature);
    });
  }, [devices]);

  useEffect(() => {
    setDevices((prev) => {
      const previousPositionMap = new Map<number, DevicePosition | null>(prev.map((item) => [item.id, item.position]));
      const next = floorDeviceRows.map((item: any, index: number) => {
        const parsedId = Number(item?.id ?? item?.deviceId);
        const id = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : index + 1;
        const label = String(item?.name ?? item?.deviceName ?? item?.deviceNo ?? id);
        return {
          id,
          label,
          position: previousPositionMap.get(id) ?? null,
        };
      });
      return next;
    });
  }, [floorDevicePageData]);

  useEffect(() => {
    if (placingDeviceId === null) return;
    if (devices.some((item) => item.id === placingDeviceId)) return;
    setPlacingDeviceId(null);
  }, [devices, placingDeviceId]);

  const normalizeUpload = (event: any) => {
    if (Array.isArray(event)) return event;
    return event?.fileList ?? [];
  };

  const handleFloorChange = (value: number) => {
    setSelectedFloorId(value ? Number(value) : null);
  };

  const handleOpenDeviceModal = () => {
    const nextPrisonId = prisonId ? Number(prisonId) : null;
    const nextBuildingId = buildingId ? Number(buildingId) : null;
    setDevicePrisonId(nextPrisonId);
    setDeviceBuildingId(nextBuildingId);
    setDeviceStep(0);
    deviceForm.setFieldsValue({
      prisonId: nextPrisonId ?? undefined,
      buildingId: nextBuildingId ?? undefined,
      floorId: selectedFloorId ?? undefined,
      deviceCode: undefined,
      powerOff: true,
      ...Object.fromEntries(POWER_CHANNEL_KEYS.map((key) => [key, undefined])),
    });
    setPowerChannelValues({...INITIAL_POWER_CHANNEL_VALUES});
    setDeviceModalOpen(true);
  };

  const handleOpenPlanModal = () => {
    planForm.setFieldsValue({
      floor: selectedFloorId ? Number(selectedFloorId) : undefined,
      image: [],
    });
    setPlanModalOpen(true);
  };

  const handlePlanOk = async () => {
    try {
      const values = await planForm.validateFields();
      const fileList = values.image ?? [];
      const file = fileList[0];
      const floorDrawing = file?.response?.data?.url ?? '';
      const floorId = Number(values.floor);
      if (!floorId || !floorDrawing) {
        message.error('请先选择楼层并上传图纸');
        return;
      }
      setPlanSubmitting(true);
      await updateFloorDrawing(floorId, floorDrawing);
      await refreshFloors();
      await refreshFloorForm();
      message.success('添加成功');
      setPlanModalOpen(false);
      planForm.resetFields();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error('添加失败');
    } finally {
      setPlanSubmitting(false);
    }
  };

  const handleDeviceCancel = () => {
    setDeviceModalOpen(false);
    setDeviceStep(0);
    deviceForm.resetFields();
  };

  const handleDeviceNext = async () => {
    try {
      await deviceForm.validateFields(['prisonId', 'buildingId', 'floorId', 'deviceCode']);
      setDeviceStep(1);
    } catch {
      return;
    }
  };

  const handleDevicePrev = () => {
    setDeviceStep(0);
  };

  const handleDeviceFinish = async () => {
    try {
      await deviceForm.validateFields(['networkCode', 'ip', 'port', 'startTime', 'stopTime']);
      const values = deviceForm.getFieldsValue(true);
      const formatTime = (value: any) => (value && typeof value.format === 'function' ? value.format('HH:mm') : value);
      const channelPayload = POWER_CHANNEL_KEYS.reduce((acc, key) => {
        acc[key] = values[key];
        return acc;
      }, {} as Record<string, any>);
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
        powerConfig: values.ch1,
        startTime: formatTime(values.startTime),
        endTime: formatTime(values.stopTime),
        ...channelPayload,
      });
      message.success('添加成功');
      setDeviceModalOpen(false);
      setDeviceStep(0);
      deviceForm.resetFields();
      if (Number(values.floorId) === Number(selectedFloorId)) {
        refreshFloorDevices();
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error('添加失败');
    }
  };

  const handleDevicePrisonChange = (value: number | null) => {
    setDevicePrisonId(value ?? null);
    setDeviceBuildingId(null);
    deviceForm.setFieldsValue({buildingId: undefined, floorId: undefined});
  };

  const handleDeviceBuildingChange = (value: number | null) => {
    setDeviceBuildingId(value ?? null);
    deviceForm.setFieldsValue({floorId: undefined});
  };

  const handleResetMapDevices = () => {
    setDevices((prev) => prev.map((item) => ({...item, position: null})));
    setPlacingDeviceId(null);
  };

  const stats = [
    {label: '建筑层数', value: detail?.floorNum ?? 0},
    {label: '设备', value: detail?.totalDevices ?? 0},
    {label: '在线', value: detail?.onlineDevices ?? 0},
    {label: '离线', value: detail?.offlineDevices ?? 0},
    {label: '告警', value: detail?.totalAlarms ?? 0},
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
                backgroundImage: 'url(' + gb + ')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button style={{position: 'absolute', top: 12, right: 12}}>编辑</Button>
              <div style={{fontSize: 48, color: '#111', textAlign: 'center'}}>{detail?.name || 'AABB楼'}</div>
            </div>
          </Col>

          <Col xs={24} xl={18}>
            <Spin spinning={detailLoading || floorFormLoading}>
              <div style={{minHeight: 680, padding: '18px 26px'}}>
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                  <Button onClick={() => history.back()}>返回</Button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 16,
                    marginTop: 20,
                  }}
                >
                  {stats.map((item) => (
                    <div key={item.label} style={{textAlign: 'center'}}>
                      <div style={{fontSize: '42px', lineHeight: 1.1}}>{item.value}</div>
                      <div style={{marginTop: 4, fontSize: 'clamp(18px, 2.2vw, 30px)', color: '#111'}}>{item.label}</div>
                    </div>
                  ))}
                </div>

                <Divider style={{margin: '18px 0 22px'}} />

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <span style={{fontSize: 30, color: '#111'}}>当前楼层:</span>
                    <Select value={Number(selectedFloorId)} onChange={handleFloorChange} options={floorOptions} style={{width: 160}} />
                    <span style={{fontSize: 16, color: 'rgba(0,0,0,0.65)'}}>
                      {currentFloorName ? `${currentFloorName} / 设备数 ${currentFloorDeviceNumber}` : ''}
                    </span>
                  </div>
                  <div style={{display: 'flex', gap: 8}}>
                    <Button type="primary" onClick={handleOpenPlanModal}>
                      添加楼层图纸
                    </Button>
                    <Button onClick={handleOpenDeviceModal}>添加设备</Button>
                  </div>
                </div>

                <div
                  style={{
                    minHeight: 520,
                    padding: '8px 0 24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      flex: 1,
                      minWidth: 280,
                      minHeight: 520,
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#fafafa',
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleDeviceDrop}
                  >
                    {currentFloorDrawing && isImageDrawing ? (
                      <div ref={mapContainerRef} style={{width: '100%', height: '100%'}} />
                    ) : (
                      <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Empty description={currentFloorDrawing ? '当前图纸格式不支持地图渲染' : '当前楼层暂无图纸'} />
                      </div>
                    )}
                    {drawingLoading ? (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255,255,255,0.72)',
                          zIndex: 2,
                        }}
                      >
                        <Spin tip="图纸加载中..." />
                      </div>
                    ) : null}
                    {placingDeviceId ? (
                      <div
                        style={{
                          position: 'absolute',
                          left: 12,
                          top: 12,
                          padding: '4px 10px',
                          borderRadius: 14,
                          background: 'rgba(22,119,255,0.12)',
                          color: '#1677ff',
                          fontSize: 12,
                        }}
                      >
                        当前选择设备 {placingDeviceId}：点击地图或拖拽放置
                      </div>
                    ) : null}
                  </div>
                  <div
                    style={{
                      width: 200,
                      minWidth: 180,
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                      padding: 12,
                      background: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                      <div style={{fontWeight: 600}}>设备列表</div>
                      <Button type="link" size="small" onClick={handleResetMapDevices}>
                        复位
                      </Button>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                      <Spin spinning={floorDevicesLoading}>
                        {devices.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无设备" /> : null}
                      </Spin>
                      {devices.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData('text/plain', String(item.id));
                            setPlacingDeviceId(item.id);
                          }}
                          onClick={() => setPlacingDeviceId(item.id)}
                          style={{
                            border: placingDeviceId === item.id ? '1px solid #1677ff' : '1px solid #d9d9d9',
                            borderRadius: 8,
                            padding: '8px 10px',
                            cursor: 'grab',
                            userSelect: 'none',
                            background: '#fff',
                          }}
                        >
                          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <span
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: '#1677ff',
                                color: '#fff',
                                fontSize: 12,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {item.label}
                            </span>
                            <span style={{fontSize: 13}}>设备 {item.label}</span>
                          </div>
                          <div style={{marginTop: 6, fontSize: 12, color: 'rgba(0,0,0,0.45)'}}>
                            {item.position ? '已放置，可再次拖动' : '未放置，拖到地图'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Spin>
          </Col>
        </Row>
      </div>

      <Modal
        title="添加图纸"
        open={planModalOpen}
        onCancel={() => setPlanModalOpen(false)}
        onOk={handlePlanOk}
        okButtonProps={{loading: planSubmitting}}
      >
        <Form form={planForm} layout="vertical" initialValues={{floor: null}}>
          <Form.Item label="选择楼层" name="floor" rules={[{required: true, message: '请选择楼层'}]}>
            <Select options={floorOptions} />
          </Form.Item>
          <Form.Item
            label="上传图片"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={normalizeUpload}
            rules={[{required: true, message: '请上传楼层图纸'}]}
          >
            <Upload
              action="/api/v1/files"
              name="file"
              listType="picture-card"
              maxCount={1}
              headers={{
                authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
              }}
            >
              <div>上传</div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加设备"
        open={deviceModalOpen}
        onCancel={handleDeviceCancel}
        width={1000}
        footer={
          deviceStep === 0
            ? [
                <Button key="cancel" onClick={handleDeviceCancel}>
                  取消
                </Button>,
                <Button key="next" type="primary" onClick={handleDeviceNext}>
                  下一步
                </Button>,
              ]
            : [
                <Button key="prev" onClick={handleDevicePrev}>
                  上一步
                </Button>,
                <Button key="finish" type="primary" onClick={handleDeviceFinish}>
                  完成
                </Button>,
              ]
        }
      >
        <Form form={deviceForm} layout="horizontal" labelCol={{span: 3}} initialValues={{powerOff: true}}>
          <Row gutter={16}>
            <Col
              flex="180px"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  height: 160,
                  border: '1px dashed #d9d9d9',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(0,0,0,0.45)',
                  marginBottom: 12,
                  overflow: 'hidden',
                }}
              >
                <img src={shielder} alt="" width={164} height={164}/>
              </div>
              <Form.Item  name="powerOff" valuePropName="checked">
                <Switch checkedChildren="开" unCheckedChildren="关" />
              </Form.Item>
            </Col>

            <Col flex="1">
              <Steps
                size="small"
                current={deviceStep}
                items={[{title: '基础信息'}, {title: '其他信息'}]}
                style={{marginBottom: 16}}
              />

              {deviceStep === 0 ? (
                <>
                  <Form.Item label="监狱" name="prisonId" rules={[{required: true, message: '请选择监狱'}]}>
                    <Select options={prisonOptions} disabled onChange={handleDevicePrisonChange} placeholder="请选择监狱" />
                  </Form.Item>
                  <Form.Item label="楼栋" name="buildingId" rules={[{required: true, message: '请选择楼栋'}]}>
                    <Select
                      options={deviceBuildingOptions}
                      onChange={handleDeviceBuildingChange}
                      placeholder="请选择楼栋"
                      loading={deviceBuildingsLoading}
                      disabled
                      notFoundContent={deviceBuildingsLoading ? '加载中...' : '暂无楼栋'}
                    />
                  </Form.Item>
                  <Form.Item label="楼层" name="floorId" rules={[{required: true, message: '请选择楼层'}]}>
                    <Select
                      options={floorOptions}
                      placeholder="请选择楼层"
                      disabled
                    />
                  </Form.Item>
                  <Form.Item label="设备编号" name="deviceCode" rules={[{required: true, message: '请输入设备编号'}]}>
                    <InputNumber min={1} placeholder="请输入设备编号" style={{width: '100%'}} />
                  </Form.Item>
                </>
              ) : (
                <>
                  <Form.Item label="全网编号" name="networkCode" rules={[{required: true, message: '请输入全网编号'}]}>
                    <Input placeholder="请输入全网编号" />
                  </Form.Item>
                  <Form.Item label="IP" name="ip" rules={[{required: true, message: '请输入 IP'}]}>
                    <Input placeholder="请输入 IP" />
                  </Form.Item>
                  <Form.Item label="端口" name="port" rules={[{required: true, message: '请输入端口'}]}>
                    <InputNumber min={0} max={65535} style={{width: '100%'}} />
                  </Form.Item>
                  <Form.Item label="功率调节">
                    <Row gutter={[12, 8]}>
                      {POWER_CHANNEL_KEYS.map((key, index) => (
                        <Col span={8} key={key}>
                          <Form.Item name={key} label={`CH${index + 1}`} style={{marginBottom: 0}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                              <span style={{minWidth: 24, textAlign: 'right'}}>{powerChannelValues[key] ?? 0}</span>
                              <Slider
                                min={0}
                                max={100}
                                style={{flex: 1, margin: 0}}
                                tooltip={{open: false}}
                                onChange={(value) => {
                                  const nextValue = Array.isArray(value) ? value[0] : value;
                                  setPowerChannelValues((prev) => ({...prev, [key]: nextValue}));
                                }}
                              />
                            </div>
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>
                  </Form.Item>
                  <Form.Item label="开始时间" name="startTime" rules={[{required: true, message: '请选择开始时间'}]}>
                    <TimePicker format="HH:mm" style={{width: '100%'}} />
                  </Form.Item>
                  <Form.Item label="停止时间" name="stopTime" rules={[{required: true, message: '请选择停止时间'}]}>
                    <TimePicker format="HH:mm" style={{width: '100%'}} />
                  </Form.Item>
                </>
              )}
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BuildingDetailPage;
