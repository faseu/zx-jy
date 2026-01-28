import { PageContainer } from '@ant-design/pro-components';
import { useParams, useRequest } from '@umijs/max';
import {
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Radio,
  Row,
  Statistic,
  Typography,
  message,
} from 'antd';
import React, { useState } from 'react';
import type { PrisonVO, ProvinceDetailVO } from '../data.d';
import {
  createPrison,
  queryProvinceDetail,
  queryProvincePrisons,
} from '../service';

const { Paragraph, Title } = Typography;

const ProvinceDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const provinceId = params.id ?? '';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { data: detailData, loading: detailLoading } = useRequest(
    () => queryProvinceDetail(provinceId),
    {
      ready: Boolean(provinceId),
      refreshDeps: [provinceId],
    },
  );
  const {
    data: prisonsData,
    loading: prisonsLoading,
    refresh: refreshPrisons,
  } = useRequest(
    () => queryProvincePrisons(provinceId),
    {
      ready: Boolean(provinceId),
      refreshDeps: [provinceId],
    },
  );
  const detail: ProvinceDetailVO | undefined = detailData;
  const prisons: PrisonVO[] = prisonsData ?? [];
  type PrisonListItem = PrisonVO & { __isNew?: boolean; id?: number | string };
  const listData: PrisonListItem[] = [
    ...prisons,
    { id: 'new', __isNew: true },
  ];

  const handleOpenModal = () => {
    form.setFieldsValue({
      deptId: provinceId ? Number(provinceId) : undefined,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      await createPrison(values);
      message.success('已提交新增监狱信息');
      setIsModalOpen(false);
      form.resetFields();
      refreshPrisons();
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
                {detail?.provinceName || '省份'}
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                省份概览
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={17}>
          <Card loading={detailLoading}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Statistic title="监狱" value={detail?.totalPrisons ?? 0} />
              <Statistic title="设备" value={detail?.totalDevices ?? 0} />
              <Statistic title="在线" value={detail?.onlineDevices ?? 0} />
              <Statistic title="离线" value={detail?.offlineDevices ?? 0} />
              <Statistic title="告警" value={detail?.totalAlarms ?? 0} />
            </div>
          </Card>
          <Card
            title="监狱列表"
            loading={prisonsLoading}
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
                      style={{ minHeight: '132px', display: 'flex', alignItems: 'center', justifyContent:'center', color: '#007bff' }}
                    >
                      新增监狱 +
                    </Card>
                  ) : (
                    <Card style={{ marginBottom: 12, minHeight: '132px', boxSizing: 'border-box' }} hoverable>
                      <Title level={5}>
                        {item.name || '未命名监狱'}
                      </Title>
                      <Paragraph style={{ marginBottom: 4 }}>
                        楼数：{item.buildingNum ?? 0}
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
        title="新增监狱"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="监狱等级" name="level">
            <Radio.Group buttonStyle="solid" optionType="button">
              <Radio.Button value={1}>宽管监狱</Radio.Button>
              <Radio.Button value={2}>普管监狱</Radio.Button>
              <Radio.Button value={3}>严管监狱</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="监狱名称"
            name="name"
            rules={[{ required: true, message: '请输入监狱名称' }]}
          >
            <Input placeholder="请输入监狱名称" />
          </Form.Item>
          <Form.Item label="监室数量" name="roomNumber"  rules={[{ required: true, message: '请输入监室数量' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入监室数量" />
          </Form.Item>
          <Form.Item label="授权人员列表" name="authUsers">
            <Input placeholder="以逗号分隔" />
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
