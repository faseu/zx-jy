import {PageContainer} from '@ant-design/pro-components';
import {history, useParams, useRequest} from '@umijs/max';
import {
  Button,
  Col,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Spin,
  Steps,
  Switch,
  TimePicker,
  Upload,
  message,
} from 'antd';
import React, {useEffect, useState} from 'react';
import gb from '@/assets/gb.png';
import type {BuildingInfoVO} from '../data.d';
import {
  createDevice,
  createFloor,
  queryBuildingFloorForm,
  queryBuildingFloors,
  queryBuildingInfo,
  queryPrisonBuildings,
  queryPrisonInfo,
} from '../service';

const BuildingDetailPage: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [deviceStep, setDeviceStep] = useState(0);
  const [devicePrisonId, setDevicePrisonId] = useState<number | null>(null);
  const [deviceBuildingId, setDeviceBuildingId] = useState<number | null>(null);
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

  const {data: floorFormData, loading: floorFormLoading} = useRequest(() => queryBuildingFloorForm(selectedFloorId as number), {
    ready: Boolean(selectedFloorId),
    refreshDeps: [selectedFloorId],
  });

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

  const {data: deviceFloorsData, loading: deviceFloorsLoading} = useRequest(
    () => queryBuildingFloors(deviceBuildingId as number),
    {
      ready: Boolean(deviceBuildingId),
      refreshDeps: [deviceBuildingId],
    },
  );

  const detail: BuildingInfoVO | undefined = detailData;

  const floorOptions =
    floorData?.map((item: any) => ({
      label: item.floorName,
      value: item.floorNo,
      id: item.id,
    })) ?? [];

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
      value: item.id,
    })) ?? [];

  const deviceFloorOptions =
    deviceFloorsData?.map((item: any) => ({
      label: item.floorName,
      value: item.id,
    })) ?? [];

  const planFloorOptions = Array.from({length: 106}, (_, index) => {
    const value = index - 5;
    if (value === 0) return null;
    return {label: `${value}层`, value};
  }).filter(Boolean) as {label: string; value: number}[];

  useEffect(() => {
    if (!floorData?.length || selectedFloorId) return;
    setSelectedFloorId(floorData[0].id);
    setSelectedFloor(floorData[0].floorNo);
  }, [floorData, selectedFloorId]);

  const normalizeUpload = (event: any) => {
    if (Array.isArray(event)) return event;
    return event?.fileList ?? [];
  };

  const handleFloorChange = (value: number, option: any) => {
    setSelectedFloor(value);
    setSelectedFloorId(option?.id ?? null);
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
    });
    setDeviceModalOpen(true);
  };

  const handlePlanOk = async () => {
    try {
      const values = await planForm.validateFields();
      const fileList = values.image ?? [];
      const file = fileList[0];
      const floorDrawing = file?.response?.data?.url ?? '';
      setPlanSubmitting(true);
      const floorNo = Number(values.floor);
      const floorName = floorNo < 0 ? `B${Math.abs(floorNo)}` : `F${floorNo}`;
      await createFloor({
        floorNo,
        floorName,
        buildingId: Number(buildingId),
        deviceNumber: values.deviceCount ?? 0,
        floorDrawing,
      });
      refreshFloors();
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
      const values = await deviceForm.validateFields();
      const floorName =
        deviceFloorsData?.find((item: any) => item.id === values.floorId)?.floorName ??
        deviceFloorOptions.find((item) => item.value === values.floorId)?.label;
      if (!floorName) {
        message.error('未找到楼层名称');
        return;
      }
      const formatTime = (value: any) => (value && typeof value.format === 'function' ? value.format('HH:mm') : value);
      await createDevice({
        deviceNo: values.deviceCode,
        deviceName: values.deviceCode,
        entireNo: values.networkCode,
        floorName: String(floorName),
        floorId: values.floorId,
        buildingId: values.buildingId,
        prisonId: values.prisonId,
        powerOff: values.powerOff ? 0 : 1,
        ipAddress: values.ip,
        port: values.port,
        powerConfig: values.power,
        startTime: formatTime(values.startTime),
        endTime: formatTime(values.stopTime),
      });
      message.success('添加成功');
      setDeviceModalOpen(false);
      setDeviceStep(0);
      deviceForm.resetFields();
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
            <Spin spinning={detailLoading}>
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
                    <Select value={selectedFloor} onChange={handleFloorChange} options={floorOptions} style={{width: 160}} />
                  </div>
                  <div style={{display: 'flex', gap: 8}}>
                    <Button type="primary" onClick={() => setPlanModalOpen(true)}>
                      添加楼层图纸
                    </Button>
                    <Button onClick={handleOpenDeviceModal}>添加设备</Button>
                  </div>
                </div>

                <Spin spinning={floorFormLoading}>
                  <div
                    style={{
                      minHeight: 420,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 0 24px',
                    }}
                  >
                    {floorFormData ? (
                      <Image
                        style={{width: '72%', maxWidth: 820, minWidth: 280}}
                        src={floorFormData.floorDrawing || '/logo.png'}
                        alt={floorFormData.floorName || '楼层图纸'}
                      />
                    ) : (
                      <div style={{color: 'rgba(0,0,0,0.45)'}}>暂无楼层信息</div>
                    )}
                  </div>
                </Spin>
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
        <Form form={planForm} layout="vertical" initialValues={{floor: null, deviceCount: null}}>
          <Form.Item label="选择楼层" name="floor" rules={[{required: true, message: '请选择楼层'}]}>
            <Select options={planFloorOptions} />
          </Form.Item>
          <Form.Item label="设备数量" name="deviceCount">
            <InputNumber min={0} style={{width: '100%'}} />
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
        width={600}
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
        <Form form={deviceForm} layout="vertical" initialValues={{powerOff: true}}>
          <Row gutter={16}>
            <Col
              flex="180px"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
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
                }}
              >
                设备图片
              </div>
              <Form.Item label="电源开关" name="powerOff" valuePropName="checked">
                <Switch checkedChildren="开" unCheckedChildren="关" />
              </Form.Item>
            </Col>

            <Col flex="auto">
              <Steps
                size="small"
                current={deviceStep}
                items={[{title: '基础信息'}, {title: '其他信息'}]}
                style={{marginBottom: 16}}
              />

              {deviceStep === 0 ? (
                <>
                  <Form.Item label="监狱" name="prisonId" rules={[{required: true, message: '请选择监狱'}]}>
                    <Select options={prisonOptions} onChange={handleDevicePrisonChange} placeholder="请选择监狱" />
                  </Form.Item>
                  <Form.Item label="楼栋" name="buildingId" rules={[{required: true, message: '请选择楼栋'}]}>
                    <Select
                      options={deviceBuildingOptions}
                      onChange={handleDeviceBuildingChange}
                      placeholder="请选择楼栋"
                      loading={deviceBuildingsLoading}
                      disabled={deviceBuildingsLoading}
                      notFoundContent={deviceBuildingsLoading ? '加载中...' : '暂无楼栋'}
                    />
                  </Form.Item>
                  <Form.Item label="楼层" name="floorId" rules={[{required: true, message: '请选择楼层'}]}>
                    <Select
                      options={deviceFloorOptions}
                      placeholder="请选择楼层"
                      loading={deviceFloorsLoading}
                      disabled={deviceFloorsLoading}
                      notFoundContent={deviceFloorsLoading ? '加载中...' : '暂无楼层'}
                    />
                  </Form.Item>
                  <Form.Item label="设备编号" name="deviceCode" rules={[{required: true, message: '请输入设备编号'}]}>
                    <Input placeholder="请输入设备编号" />
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
                  <Form.Item label="功率调节" name="power" rules={[{required: true, message: '请输入功率调节'}]}>
                    <InputNumber min={0} style={{width: '100%'}} />
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
