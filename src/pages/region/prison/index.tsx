import { PageContainer } from '@ant-design/pro-components';
import { history, useParams, useRequest } from '@umijs/max';
import {
  Card,
  Col,
  Form,
  Input,
  List,
  Modal,
  Row,
  Statistic,
  Typography,
  message,
} from 'antd';
import React, { useState } from 'react';
import type { BuildingDetailVO, PrisonInfoVO } from '../data.d';
import {
  createBuilding,
  queryPrisonBuildings,
  queryPrisonInfo,
} from '../service';

const { Paragraph, Title } = Typography;

const PrisonDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const prisonId = params.id ?? '';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { data: detailData, loading: detailLoading } = useRequest(
    () => queryPrisonInfo(prisonId),
    {
      ready: Boolean(prisonId),
      refreshDeps: [prisonId],
    },
  );
  const {
    data: buildingsData,
    loading: buildingsLoading,
    refresh: refreshBuildings,
  } = useRequest(
    () => queryPrisonBuildings(prisonId),
    {
      ready: Boolean(prisonId),
      refreshDeps: [prisonId],
    },
  );
  const detail: PrisonInfoVO | undefined = detailData;
  const buildings: BuildingDetailVO[] = buildingsData ?? [];
  type BuildingListItem = BuildingDetailVO & {
    __isNew?: boolean;
    id?: number | string;
  };
  const listData: BuildingListItem[] = [
    ...buildings,
    { id: 'new', __isNew: true },
  ];

  const handleOpenModal = () => {
    form.setFieldsValue({
      prisonId: prisonId ? Number(prisonId) : undefined,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      await createBuilding(values);
      message.success('已提交新增楼宇信息');
      setIsModalOpen(false);
      form.resetFields();
      refreshBuildings();
    } catch (error) {
      message.error('提交失败，请重试');
    }
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
                {detail?.name || '监狱'}
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                监狱概览
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={17}>
          <Card loading={detailLoading}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Statistic title="楼栋" value={detail?.buildingNum ?? 0} />
              <Statistic title="设备" value={detail?.totalDevices ?? 0} />
              <Statistic title="在线" value={detail?.onlineDevices ?? 0} />
              <Statistic title="离线" value={detail?.offlineDevices ?? 0} />
              <Statistic title="告警" value={detail?.totalAlarms ?? 0} />
            </div>
          </Card>
          <Card
            title="楼栋列表"
            loading={buildingsLoading}
            style={{ marginTop: 16 }}
          >
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}
              dataSource={listData}
              renderItem={(item) => (
                <List.Item>
                  {item.__isNew ? (
                    <Card
                      hoverable
                      onClick={handleOpenModal}
                      style={{
                        minHeight: '132px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#007bff',
                      }}
                    >
                      新增楼宇 +
                    </Card>
                  ) : (
                    <Card
                      onClick={() => {
                        if (item.id !== undefined && item.id !== null) {
                          history.push(`/region/building/${prisonId}/${item.id}`);
                        }
                      }}
                      style={{
                        marginBottom: 12,
                        minHeight: '132px',
                        boxSizing: 'border-box',
                      }}
                      hoverable
                    >
                      <Title level={5}>{item.name || '未命名楼栋'}</Title>
                      <Paragraph style={{ marginBottom: 4 }}>
                        层数：{item.floorNum ?? 0}
                      </Paragraph>
                      <Paragraph style={{ marginBottom: 0 }}>
                        设备数：{item.totalDevices ?? 0}
                      </Paragraph>
                    </Card>
                  )}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Modal
        title="新增楼宇"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="楼宇名称"
            name="name"
            rules={[{ required: true, message: '请输入楼宇名称' }]}
          >
            <Input placeholder="请输入楼宇名称" />
          </Form.Item>
          <Form.Item name="prisonId" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PrisonDetailPage;
