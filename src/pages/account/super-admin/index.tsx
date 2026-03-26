import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, message } from 'antd';
import React, { useState } from 'react';
import type { SuperAdminVO } from './data.d';
import { queryAdminPage } from './service';
import styles from './index.less';
import gb from '@/assets/gb.png';

const areaOptions = ['华北', '华东', '华南', '华中', '西南', '西北'];
const featureOptions = ['查看', '编辑', '导出', '审批', '审计', '配置'];

const getAreaText = (record: SuperAdminVO): string => {
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

const SuperAdminListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { data, loading } = useRequest(
    () =>
      queryAdminPage({
        pageNum: 1,
        pageSize: 10,
      }),
    {
      onError: () => {
        message.error('超级管理员列表加载失败，请稍后重试');
      },
    },
  );
  const adminList = data?.list ?? [];

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
            ></div>
          </Col>
          <Col xs={24} xl={18} className={styles.rightPane}>
            <div className={styles.headerRow}>
              <h2 className={styles.pageTitle}>超级管理员</h2>
              <Button className={styles.backButton}>返回</Button>
            </div>
            <div className={styles.tableWrap}>
              <Table<SuperAdminVO>
                className={styles.adminTable}
                loading={loading}
                rowKey={(record) => String(record.id ?? record.username ?? '')}
                dataSource={adminList}
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

export default SuperAdminListPage;
