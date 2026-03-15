import { PageContainer } from '@ant-design/pro-components';
import { history, useParams, useRequest } from '@umijs/max';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Radio,
  Row,
  Spin,
  message,
} from 'antd';
import React, { useMemo, useState } from 'react';
import type { PrisonFormVO, PrisonVO, ProvinceDetailVO } from '../data.d';
import {
  createPrison,
  queryPrisonForm,
  queryProvinceDetail,
  queryProvincePrisons,
  updatePrison,
} from '../service';
import gb from '@/assets/gb.png';

type PrisonListItem = PrisonVO & { __isNew?: boolean; id?: number | string };

const cardColors = ['#e8c0c9', '#e8c0c9', '#f0dd93', '#f0dd93', '#cae9f8'];

const ProvinceDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const provinceId = params.id ?? '';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingPrisonId, setEditingPrisonId] = useState<number | undefined>(undefined);
  const [editingPrisonForm, setEditingPrisonForm] = useState<PrisonFormVO | undefined>(undefined);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  const { data: detailData, loading: detailLoading } = useRequest(
    () => queryProvinceDetail(provinceId),
    {
      ready: Boolean(provinceId),
      refreshDeps: [provinceId],
    }
  );

  const {
    data: prisonsData,
    loading: prisonsLoading,
    refresh: refreshPrisons,
  } = useRequest(() => queryProvincePrisons(provinceId), {
    ready: Boolean(provinceId),
    refreshDeps: [provinceId],
  });

  const detail: ProvinceDetailVO | undefined = detailData;
  const prisons: PrisonVO[] = prisonsData ?? [];

  const listData = useMemo<PrisonListItem[]>(
    () => [...prisons, { id: 'new', __isNew: true }],
    [prisons]
  );

  const handleOpenModal = () => {
    setModalMode('create');
    setEditingPrisonId(undefined);
    setEditingPrisonForm(undefined);
    form.resetFields();
    form.setFieldsValue({ deptId: provinceId ? Number(provinceId) : undefined });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (prisonId?: number) => {
    if (!prisonId) {
      return;
    }
    try {
      const { data: prisonForm } = await queryPrisonForm(prisonId);
      setModalMode('edit');
      setEditingPrisonId(prisonId);
      setEditingPrisonForm(prisonForm);
      form.setFieldsValue(prisonForm);
      setIsModalOpen(true);
    } catch (error) {
      message.error('获取监狱表单失败，请重试');
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      setSubmitLoading(true);
      if (modalMode === 'edit' && editingPrisonId) {
        const payload: PrisonFormVO = {
          ...(editingPrisonForm || {}),
          ...values,
          id: editingPrisonForm?.id ?? editingPrisonId,
        };
        await updatePrison(editingPrisonId, payload);
        message.success('监狱信息已更新');
      } else {
        await createPrison(values);
        message.success('已提交新增监狱信息');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingPrisonId(undefined);
      setEditingPrisonForm(undefined);
      refreshPrisons();
    } catch (error) {
      message.error('提交失败，请重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  const stats = [
    { label: '监狱', value: detail?.totalPrisons ?? 0 },
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
                backgroundImage: 'url(' + gb + ')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/*<Button style={{ position: 'absolute', top: 12, right: 12 }}>编辑</Button>*/}
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
                {detail?.provinceName || ''}
              </div>
            </div>
          </Col>
          <Col xs={24} xl={18}>
            <Spin spinning={detailLoading || prisonsLoading}>
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
                          onClick={handleOpenModal}
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
                              history.push(`/region/prison/${item.id}`);
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
                                handleOpenEditModal(item.id as number | undefined);
                              }}
                            >
                              编辑
                            </Button>
                          </div>
                          <div style={{ marginTop: 28, textAlign: 'center', color: '#111' }}>
                            <div style={{ fontSize: '38px', lineHeight: 1.2 }}>
                              {item.name || '未命名监狱'}
                            </div>
                            <div style={{ fontSize: '28px', marginTop: 14 }}>
                              楼数: {item.buildingNum ?? 0}
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

      <Modal
        title={modalMode === 'edit' ? '编辑监狱' : '新增监狱'}
        open={isModalOpen}
        confirmLoading={submitLoading}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingPrisonId(undefined);
          setEditingPrisonForm(undefined);
          form.resetFields();
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="监狱等级" name="level">
            <Radio.Group buttonStyle="solid" optionType="button">
              <Radio.Button style={{ background: '#cae9f8' }} value={1}>
                宽管监狱
              </Radio.Button>
              <Radio.Button style={{ background: '#f0dd93' }} value={2}>
                普管监狱
              </Radio.Button>
              <Radio.Button style={{ background: '#e8c0c9' }} value={3}>
                严管监狱
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="监狱名称"
            name="name"
            rules={[{ required: true, message: '请输入监狱名称' }]}
          >
            <Input placeholder="请输入监狱名称" />
          </Form.Item>
          <Form.Item label="授权人员列表" name="authUsers">
            <Input placeholder="以逗号分隔" />
          </Form.Item>
          <Form.Item
            label="监舍数量"
            name="roomNumber"
            rules={[{ required: true, message: '请输入监舍数量' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入监舍数量" />
          </Form.Item>
          <Form.Item name="deptId" hidden>
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ProvinceDetailPage;
