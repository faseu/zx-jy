import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import OrgTree from '@/components/OrgTree';
import type { ProvinceVO } from '@/pages/region/data.d';
import type { OrgTreeSelectionParams } from '@/components/OrgTree';
import { queryProvinceList } from '@/pages/region/service';
import type { PrisonAdminPageParams, PrisonAdminVO } from './data.d';
import { queryPrisonAdminPage } from './service';
import styles from './index.less';

const areaOptions = ['华北', '华东', '华南', '华中', '西南', '西北'];
const featureOptions = ['查看', '编辑', '导出', '审批', '审计', '配置'];

const getAreaText = (record: PrisonAdminVO): string => {
  if (record.area && record.area.trim()) {
    return record.area;
  }
  if (record.manageArea && record.manageArea.trim()) {
    return record.manageArea;
  }
  if (Array.isArray(record.manageAreas) && record.manageAreas.length > 0) {
    return record.manageAreas.filter(Boolean).join('、');
  }

  return '-';
};

const PrisonAdminListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | string>();
  const [selectedPrisonId, setSelectedPrisonId] = useState<number | string>();
  const [form] = Form.useForm();
  const { data: provinceData, loading: provinceLoading } = useRequest(queryProvinceList);
  const {
    data: prisonAdminPageData,
    loading: prisonAdminLoading,
    run: runQueryPrisonAdminPage,
  } = useRequest(queryPrisonAdminPage, {
    manual: true,
    onError: () => {
      message.error('监狱管理员列表加载失败，请稍后重试');
    },
  });

  const provinceList = (provinceData ?? []) as ProvinceVO[];
  const prisonAdminList = prisonAdminPageData?.list ?? [];

  const runSearch = useCallback(
    (provinceId?: number | string, prisonId?: number | string) => {
      const params: PrisonAdminPageParams = {
        pageNum: 1,
        pageSize: 10,
      };

      if (provinceId !== undefined && provinceId !== null) {
        params.provinceId = provinceId;
      }
      if (prisonId !== undefined && prisonId !== null) {
        params.prisonId = prisonId;
      }

      runQueryPrisonAdminPage(params);
    },
    [runQueryPrisonAdminPage],
  );

  useEffect(() => {
    runSearch(selectedProvinceId, selectedPrisonId);
  }, [runSearch, selectedProvinceId, selectedPrisonId]);

  const handleOk = async () => {
    await form.validateFields();
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <PageContainer title={false}>
      <div className={styles.pageShell}>
        <Row gutter={0} className={styles.contentRow}>
          <Col xs={24} xl={6} className={styles.leftPane}>
            <OrgTree
              provinceList={provinceList}
              loading={provinceLoading}
              maxLevel={2}
              onSelectionChange={(params: OrgTreeSelectionParams) => {
                if (params.nodeType === 'prison') {
                  setSelectedProvinceId(undefined);
                  setSelectedPrisonId(params.prisonId);
                  return;
                }
                if (params.nodeType === 'province') {
                  setSelectedProvinceId(params.provinceId);
                  setSelectedPrisonId(undefined);
                  return;
                }
                if (params.nodeType === 'country') {
                  setSelectedProvinceId(undefined);
                  setSelectedPrisonId(undefined);
                }
              }}
            />
          </Col>
          <Col xs={24} xl={18} className={styles.rightPane}>
            <div className={styles.headerRow}>
              <h2 className={styles.pageTitle}>监狱管理员</h2>
              <Button className={styles.backButton}>返回</Button>
            </div>
            <div className={styles.tableWrap}>
              <Table<PrisonAdminVO>
                className={styles.adminTable}
                loading={prisonAdminLoading}
                rowKey={(record) => String(record.id ?? record.username ?? '')}
                dataSource={prisonAdminList}
                pagination={false}
                columns={[
                  {
                    title: '账户名',
                    dataIndex: 'username',
                  },
                  {
                    title: '昵称',
                    dataIndex: 'nickname',
                  },
                  {
                    title: '管理区域',
                    dataIndex: 'area',
                    render: (_, record) => <Button type="link">{getAreaText(record)}</Button>,
                  },
                  {
                    title: '功能授权',
                    key: 'feature-auth',
                    render: () => (
                      <Space size="small">
                        <Button type="link">全部权限</Button>
                      </Space>
                    ),
                  },
                  {
                    title: '密码修改',
                    key: 'password-reset',
                    render: () => (
                      <Space size="small">
                        <Button type="link">密码修改</Button>
                      </Space>
                    ),
                  },
                  {
                    title: '账号删除',
                    key: 'account-remove',
                    render: () => (
                      <Space size="small">
                        <Button type="link" danger>
                          删除
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
              <Button
                type="primary"
                onClick={() => setIsModalOpen(true)}
                className={styles.createButton}
              >
                新建
              </Button>
            </div>
          </Col>
        </Row>
      </div>
      <Modal
        title="新建用户"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="账号名"
            name="username"
            rules={[{ required: true, message: '请输入账号名' }]}
          >
            <Input placeholder="请输入账号名" />
          </Form.Item>
          <Form.Item
            label="昵称"
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            label="管理区域"
            name="areas"
            rules={[{ required: true, message: '请选择管理区域' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择管理区域"
              options={areaOptions.map((value) => ({ label: value, value }))}
            />
          </Form.Item>
          <Form.Item
            label="功能授权"
            name="features"
            rules={[{ required: true, message: '请选择功能授权' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择功能授权"
              options={featureOptions.map((value) => ({ label: value, value }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PrisonAdminListPage;
