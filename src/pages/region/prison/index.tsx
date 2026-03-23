import { PageContainer } from '@ant-design/pro-components';
import { history, useParams, useRequest } from '@umijs/max';
import { Button, Col, Divider, Form, List, Row, Spin, message } from 'antd';
import React, { useMemo, useState } from 'react';
import BuildingFormModal from '../components/BuildingFormModal';
import PrisonFormModal from '../components/PrisonFormModal';
import type { BuildingDetailVO, BuildingFormVO, PrisonFormVO, PrisonInfoVO } from '../data.d';
import {
  createBuilding,
  queryBuildingForm,
  queryPrisonBuildings,
  queryPrisonForm,
  queryPrisonInfo,
  updateBuilding,
  updatePrison,
} from '../service';
import gb from '@/assets/gb.png';

type BuildingListItem = Omit<BuildingDetailVO, 'id'> & { __isNew?: boolean; id?: number | string };

const cardColors = ['#fafef3'];

const PrisonDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const prisonId = params.id ?? '';

  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [buildingModalMode, setBuildingModalMode] = useState<'create' | 'edit'>('create');
  const [editingBuildingId, setEditingBuildingId] = useState<number | undefined>(undefined);
  const [editingBuildingForm, setEditingBuildingForm] = useState<BuildingFormVO | undefined>(
    undefined
  );
  const [buildingSubmitLoading, setBuildingSubmitLoading] = useState(false);

  const [isPrisonModalOpen, setIsPrisonModalOpen] = useState(false);
  const [editingPrisonForm, setEditingPrisonForm] = useState<PrisonFormVO | undefined>(undefined);
  const [prisonSubmitLoading, setPrisonSubmitLoading] = useState(false);

  const [buildingForm] = Form.useForm<BuildingFormVO>();
  const [prisonForm] = Form.useForm<PrisonFormVO>();

  const {
    data: detailData,
    loading: detailLoading,
    refresh: refreshDetail,
  } = useRequest(() => queryPrisonInfo(prisonId), {
    ready: Boolean(prisonId),
    refreshDeps: [prisonId],
  });

  const {
    data: buildingsData,
    loading: buildingsLoading,
    refresh: refreshBuildings,
  } = useRequest(() => queryPrisonBuildings(prisonId), {
    ready: Boolean(prisonId),
    refreshDeps: [prisonId],
  });

  const detail: PrisonInfoVO | undefined = detailData;
  const buildings: BuildingDetailVO[] = buildingsData ?? [];

  const listData = useMemo<BuildingListItem[]>(
    () => [...buildings, { id: 'new', __isNew: true }],
    [buildings]
  );

  const handleOpenBuildingModal = () => {
    setBuildingModalMode('create');
    setEditingBuildingId(undefined);
    setEditingBuildingForm(undefined);
    buildingForm.resetFields();
    buildingForm.setFieldsValue({ prisonId: prisonId ? Number(prisonId) : undefined });
    setIsBuildingModalOpen(true);
  };

  const handleOpenBuildingEditModal = async (buildingId?: number) => {
    if (!buildingId) {
      return;
    }
    try {
      const { data: buildingFormData } = await queryBuildingForm(buildingId);
      if (!buildingFormData) {
        message.error('获取楼栋表单失败，请重试');
        return;
      }
      setBuildingModalMode('edit');
      setEditingBuildingId(buildingId);
      setEditingBuildingForm(buildingFormData);
      buildingForm.setFieldsValue(buildingFormData);
      setIsBuildingModalOpen(true);
    } catch (error) {
      message.error('获取楼栋表单失败，请重试');
    }
  };

  const handleOpenPrisonEditModal = async () => {
    if (!prisonId) {
      return;
    }
    try {
      const { data: prisonFormData } = await queryPrisonForm(prisonId);
      if (!prisonFormData) {
        message.error('获取监狱表单失败，请重试');
        return;
      }
      setEditingPrisonForm(prisonFormData);
      prisonForm.setFieldsValue(prisonFormData);
      setIsPrisonModalOpen(true);
    } catch (error) {
      message.error('获取监狱表单失败，请重试');
    }
  };

  const handleBuildingSubmit = async () => {
    const values = await buildingForm.validateFields();

    try {
      setBuildingSubmitLoading(true);
      if (buildingModalMode === 'edit' && editingBuildingId) {
        const payload: BuildingFormVO = {
          ...(editingBuildingForm || {}),
          ...values,
          id: editingBuildingForm?.id ?? editingBuildingId,
        };
        await updateBuilding(editingBuildingId, payload);
        message.success('楼栋信息已更新');
      } else {
        if (!values.prisonId) {
          message.error('缺少监狱信息，请刷新页面后重试');
          return;
        }
        await createBuilding({
          name: values.name || '',
          prisonId: values.prisonId,
          groundFloorNum: values.groundFloorNum,
          undergroundFloorNum: values.undergroundFloorNum,
        });
        message.success('已提交新增楼栋信息');
      }

      setIsBuildingModalOpen(false);
      setEditingBuildingId(undefined);
      setEditingBuildingForm(undefined);
      buildingForm.resetFields();
      refreshBuildings();
    } catch (error) {
      message.error('提交失败，请重试');
    } finally {
      setBuildingSubmitLoading(false);
    }
  };

  const handlePrisonSubmit = async () => {
    const values = await prisonForm.validateFields();
    if (!prisonId) {
      return;
    }

    try {
      setPrisonSubmitLoading(true);
      const payload: PrisonFormVO = {
        ...(editingPrisonForm || {}),
        ...values,
        id: editingPrisonForm?.id ?? Number(prisonId),
      };
      await updatePrison(prisonId, payload);
      message.success('监狱信息已更新');
      setIsPrisonModalOpen(false);
      setEditingPrisonForm(undefined);
      prisonForm.resetFields();
      refreshDetail();
    } catch (error) {
      message.error('提交失败，请重试');
    } finally {
      setPrisonSubmitLoading(false);
    }
  };

  const stats = [
    { label: '楼栋', value: detail?.buildingNum ?? 0 },
    { label: '设备', value: detail?.totalDevices ?? 0 },
    { label: '在线', value: detail?.onlineDevices ?? 0 },
    { label: '离线', value: detail?.offlineDevices ?? 0 },
    { label: '告警', value: detail?.totalAlarms ?? 0 },
  ];

  return (
    <PageContainer title={false}>
      <div style={{ background: '#fff', margin: '-8px -8px 0', minHeight: 'calc(100vh - 128px)' }}>
        <Row gutter={0}>
          <Col xs={24} xl={6} style={{ overflow: 'hidden' }}>
            <div
              style={{
                position: 'relative',
                height: 'calc(100vh - 128px)',
                backgroundImage: `url(${gb})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button
                style={{ position: 'absolute', top: 12, right: 12 }}
                onClick={handleOpenPrisonEditModal}
              >
                编辑
              </Button>
              <div
                style={{
                  fontSize: 48,
                  color: '#111',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  WebkitTextStroke: '1px #fff',
                  textShadow: '0 0 1px #fff',
                }}
              >
                {detail?.name || ''}
              </div>
            </div>
          </Col>

          <Col xs={24} xl={18}>
            <Spin spinning={detailLoading || buildingsLoading}>
              <div style={{ minHeight: 680, padding: '18px 26px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '42px', lineHeight: 1.1 }}>{item.value}</div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 'clamp(18px, 2.2vw, 30px)',
                          color: '#111',
                        }}
                      >
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <Divider style={{ margin: '18px 0 22px' }} />

                <List
                  grid={{ gutter: 12, xs: 1, sm: 2, md: 4, lg: 4, xl: 4, xxl: 4 }}
                  dataSource={listData}
                  renderItem={(item, index) => (
                    <List.Item style={{ marginBottom: 0 }}>
                      {item.__isNew ? (
                        <div
                          onClick={handleOpenBuildingModal}
                          style={{
                            minHeight: 220,
                            border: '1px solid #cdcdcd',
                            background: '#f7f7f7',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            padding: '12px',
                            marginTop: '12px',
                            color: '#d7b8bd',
                          }}
                        >
                          <div style={{ fontSize: 58, lineHeight: 1, marginBottom: 8 }}>NEW</div>
                          <div style={{ fontSize: 92, lineHeight: 1, color: '#b9b9b9' }}>+</div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            if (item.id !== undefined && item.id !== null) {
                              history.push(`/region/building/${prisonId}/${item.id}`);
                            }
                          }}
                          style={{
                            minHeight: 220,
                            border: '1px solid #c5c5c5',
                            background: cardColors[index % cardColors.length],
                            padding: '12px',
                            boxSizing: 'border-box',
                            marginTop: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <div style={{ position: 'absolute', top: 12, left: 24 }}>
                            <Button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenBuildingEditModal(item.id as number | undefined);
                              }}
                            >
                              编辑
                            </Button>
                          </div>
                          <div style={{ marginTop: 28, textAlign: 'center', color: '#111' }}>
                            <div style={{ fontSize: '38px', lineHeight: 1.2 }}>
                              {item.name || '未命名楼栋'}
                            </div>
                            <div style={{ fontSize: '28px', marginTop: 14 }}>
                              楼数: {item.floorNum ?? 0}
                            </div>
                            <div style={{ fontSize: '28px', marginTop: 4 }}>
                              设备数: {item.totalDevices ?? 0}
                            </div>
                          </div>
                        </div>
                      )}
                    </List.Item>
                  )}
                />
              </div>
            </Spin>
          </Col>
        </Row>
      </div>

      <BuildingFormModal
        modalMode={buildingModalMode}
        open={isBuildingModalOpen}
        confirmLoading={buildingSubmitLoading}
        form={buildingForm}
        onOk={handleBuildingSubmit}
        onCancel={() => {
          setIsBuildingModalOpen(false);
          setEditingBuildingId(undefined);
          setEditingBuildingForm(undefined);
          buildingForm.resetFields();
        }}
      />

      <PrisonFormModal
        modalMode="edit"
        open={isPrisonModalOpen}
        confirmLoading={prisonSubmitLoading}
        form={prisonForm}
        onOk={handlePrisonSubmit}
        onCancel={() => {
          setIsPrisonModalOpen(false);
          setEditingPrisonForm(undefined);
          prisonForm.resetFields();
        }}
      />
    </PageContainer>
  );
};

export default PrisonDetailPage;
