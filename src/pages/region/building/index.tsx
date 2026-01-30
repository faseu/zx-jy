import { PageContainer } from '@ant-design/pro-components';
import { useParams, useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Statistic,
  Steps,
  Typography,
  Upload,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import type { BuildingInfoVO } from '../data.d';
import {
  createFloor,
  queryBuildingFloorForm,
  queryBuildingFloors,
  queryBuildingInfo,
  queryPrisonBuildings,
  queryPrisonInfo,
} from '../service';

const { Paragraph, Title } = Typography;

const BuildingDetailPage: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<number>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [deviceStep, setDeviceStep] = useState(0);
  const [devicePrisonId, setDevicePrisonId] = useState<number | null>(null);
  const [deviceBuildingId, setDeviceBuildingId] = useState<number | null>(null);
  const [planForm] = Form.useForm();
  const [deviceForm] = Form.useForm();
  const params = useParams<{ id: string; prisonId: string }>();
  const buildingId = params.id ?? '';
  const prisonId = params.prisonId ?? '';
  const { data: detailData, loading: detailLoading } = useRequest(
    () => queryBuildingInfo(buildingId),
    {
      ready: Boolean(buildingId),
      refreshDeps: [buildingId],
    },
  );
  const { data: floorData, refresh: refreshFloors } = useRequest(
    () => queryBuildingFloors(buildingId),
    {
      ready: Boolean(buildingId),
      refreshDeps: [buildingId],
    },
  );
  const { data: floorFormData, loading: floorFormLoading } = useRequest(
    () => queryBuildingFloorForm(selectedFloorId as number),
    {
      ready: Boolean(selectedFloorId),
      refreshDeps: [selectedFloorId],
    },
  );
  const { data: prisonDetail } = useRequest(() => queryPrisonInfo(prisonId), {
    ready: Boolean(prisonId),
    refreshDeps: [prisonId],
  });
  const { data: deviceBuildingsData, loading: deviceBuildingsLoading } = useRequest(
    () => queryPrisonBuildings(devicePrisonId as number),
    {
      ready: Boolean(devicePrisonId),
      refreshDeps: [devicePrisonId],
    },
  );
  const { data: deviceFloorsData, loading: deviceFloorsLoading } = useRequest(
    () => queryBuildingFloors(deviceBuildingId as number),
    {
      ready: Boolean(deviceBuildingId),
      refreshDeps: [deviceBuildingId],
    },
  );
  const floorOptions =
    floorData?.map((item) => ({
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
    deviceBuildingsData?.map((item) => ({
      label: item.name || `楼宇${item.id}`,
      value: item.id,
    })) ?? [];
  const deviceFloorOptions =
    deviceFloorsData?.map((item) => ({
      label: item.floorName,
      value: item.id,
    })) ?? [];
  const planFloorOptions = Array.from({ length: 106 }, (_, index) => {
    const value = index - 5;
    if (value === 0) {
      return null;
    }
    return { label: `${value}层`, value };
  }).filter(Boolean);
  const detail: BuildingInfoVO | undefined = detailData;
  useEffect(() => {
    if (!floorData?.length || selectedFloorId) {
      return;
    }
    setSelectedFloorId(floorData[0].id);
    setSelectedFloor(floorData[0].floorNo);
  }, [floorData, selectedFloorId]);
  const normalizeUpload = (event: any) => {
    if (Array.isArray(event)) {
      return event;
    }
    return event?.fileList ?? [];
  };
  const handleOpenDeviceModal = () => {
    const nextPrisonId = prisonId || null;
    const nextBuildingId = buildingId || null;
    setDevicePrisonId(nextPrisonId);
    setDeviceBuildingId(nextBuildingId);
    setDeviceStep(0);
    deviceForm.setFieldsValue({
      prisonId: nextPrisonId ?? undefined,
      buildingId: nextBuildingId ?? undefined,
      floorId: selectedFloorId ?? undefined,
      deviceCode: undefined,
    });
    setDeviceModalOpen(true);
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
    } catch (error) {
      return;
    }
  };
  const handleDevicePrev = () => {
    setDeviceStep(0);
  };
  const handleDeviceFinish = async () => {
    try {
      await deviceForm.validateFields();
      setDeviceModalOpen(false);
      setDeviceStep(0);
      deviceForm.resetFields();
    } catch (error) {
      return;
    }
  };
  const handlePlanOk = async () => {
    try {
      const values = await planForm.validateFields();
      console.log(values)
      const fileList = values.image ?? [];
      const file = fileList[0];
      const floorDrawing = file?.response?.data?.url ?? "";
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
      if (error?.errorFields) {
        return;
      }
      message.error('添加失败');
    } finally {
      setPlanSubmitting(false);
    }
  };
  const handleFloorChange = (value: number, option: any) => {
    setSelectedFloor(value);
    setSelectedFloorId(option?.id ?? null);
  };
  const handleDevicePrisonChange = (value: number | null) => {
    setDevicePrisonId(value ?? null);
    setDeviceBuildingId(null);
    deviceForm.setFieldsValue({ buildingId: undefined, floorId: undefined });
  };
  const handleDeviceBuildingChange = (value: number | null) => {
    setDeviceBuildingId(value ?? null);
    deviceForm.setFieldsValue({ floorId: undefined });
  };

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={7}>
          <Card
            loading={detailLoading}
            bodyStyle={{
              padding: 0,
              height: 420,
              display: 'flex',
              alignItems: 'flex-end',
              backgroundImage:
                "linear-gradient(160deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55)), url('/logo.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                padding: '18px 20px',
                color: '#fff',
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.55))',
              }}
            >
              <Title level={3} style={{ color: '#fff', marginBottom: 4 }}>
                {detail?.name || '楼宇'}
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                楼宇概览
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={17}>
          <Card loading={detailLoading}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Statistic title="楼层" value={detail?.floorNum ?? 0} />
              <Statistic title="设备" value={detail?.totalDevices ?? 0} />
              <Statistic title="在线" value={detail?.onlineDevices ?? 0} />
              <Statistic title="离线" value={detail?.offlineDevices ?? 0} />
              <Statistic title="告警" value={detail?.totalAlarms ?? 0} />
            </div>
          </Card>
          <Card style={{ marginTop: 16, minHeight: 260 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Select
                value={selectedFloor}
                onChange={handleFloorChange}
                options={floorOptions}
                style={{ width: 160 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="primary" onClick={() => setPlanModalOpen(true)}>
                  添加图纸
                </Button>
                <Button onClick={handleOpenDeviceModal}>添加设备</Button>
              </div>
            </div>
            <Card
              size="small"
              title="楼层信息"
              loading={floorFormLoading}
              style={{ marginTop: 16 }}
            >
              {floorFormData ? (
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                    <div>楼层名称：{floorFormData.floorName || '-'}</div>
                    <div>楼层编号：{floorFormData.floorNo ?? '-'}</div>
                    <div>设备数量：{floorFormData.deviceNumber ?? '-'}</div>
                  </div>
                  <Image
                    style={{ width: '100%', maxHeight: 300 }}
                    src={floorFormData.floorDrawing || '/logo.png'}
                    alt={floorFormData.floorName || '楼层图纸'}
                  />

                </div>
              ) : (
                <div>暂无楼层信息</div>
              )}
            </Card>
          </Card>
        </Col>
      </Row>
      <Modal
        title="添加图纸"
        open={planModalOpen}
        onCancel={() => setPlanModalOpen(false)}
        onOk={handlePlanOk}
        okButtonProps={{ loading: planSubmitting }}
      >
        <Form
          form={planForm}
          layout="vertical"
          initialValues={{ floor: selectedFloor, deviceCount: null }}
        >
          <Form.Item label="选择楼层" name="floor" rules={[{ required: true, message: '请选择楼层' }]}>
            <Select options={planFloorOptions} />
          </Form.Item>
          <Form.Item label="设备数量" name="deviceCount">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="上传图片"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={normalizeUpload}
            rules={[{ required: true, message: '请上传楼层图纸' }]}
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
        <Steps
          size="small"
          current={deviceStep}
          items={[{ title: '基础信息' }, { title: '其他信息' }]}
          style={{ marginBottom: 16 }}
        />
        {deviceStep === 0 ? (
          <Form form={deviceForm} layout="vertical">
            <Form.Item
              label="监狱"
              name="prisonId"
              rules={[{ required: true, message: '请选择监狱' }]}
            >
              <Select
                options={prisonOptions}
                onChange={handleDevicePrisonChange}
                placeholder="请选择监狱"
              />
            </Form.Item>
            <Form.Item
              label="楼宇"
              name="buildingId"
              rules={[{ required: true, message: '请选择楼宇' }]}
            >
              <Select
                options={deviceBuildingOptions}
                onChange={handleDeviceBuildingChange}
                placeholder="请选择楼宇"
                loading={deviceBuildingsLoading}
              />
            </Form.Item>
            <Form.Item
              label="楼层"
              name="floorId"
              rules={[{ required: true, message: '请选择楼层' }]}
            >
              <Select
                options={deviceFloorOptions}
                placeholder="请选择楼层"
                loading={deviceFloorsLoading}
              />
            </Form.Item>
            <Form.Item
              label="设备编号"
              name="deviceCode"
              rules={[{ required: true, message: '请输入设备编号' }]}
            >
              <Input placeholder="请输入设备编号" />
            </Form.Item>
          </Form>
        ) : (
          <div>待补充</div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default BuildingDetailPage;
