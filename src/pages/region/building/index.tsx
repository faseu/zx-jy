import { PageContainer } from '@ant-design/pro-components';
import { useParams, useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  InputNumber,
  Modal,
  Row,
  Select,
  Statistic,
  Typography,
  Upload,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import type { BuildingInfoVO } from '../data.d';
import { createFloor, queryBuildingFloorForm, queryBuildingFloors, queryBuildingInfo } from '../service';

const { Paragraph, Title } = Typography;

const BuildingDetailPage: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planForm] = Form.useForm();
  const params = useParams<{ id: string }>();
  const buildingId = params.id ?? '';
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
  const floorOptions =
    floorData?.map((item) => ({
      label: item.floorName,
      value: item.floorNo,
      id: item.id,
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
                <Button onClick={() => setDeviceModalOpen(true)}>添加设备</Button>
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
          initialValues={{ floor: selectedFloor, deviceCount: 0 }}
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
        onCancel={() => setDeviceModalOpen(false)}
        onOk={() => setDeviceModalOpen(false)}
      >
        <div>待补充</div>
      </Modal>
    </PageContainer>
  );
};

export default BuildingDetailPage;
