import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Typography } from 'antd';
import React, { useState } from 'react';

const { Paragraph } = Typography;

type AdminRecord = {
  username: string;
  nickname: string;
};

const dataSource: AdminRecord[] = [
  { username: 'super_admin_01', nickname: '总控' },
  { username: 'super_admin_02', nickname: '审计' },
  { username: 'super_admin_03', nickname: '安全' },
  { username: 'super_admin_04', nickname: '平台' },
  { username: 'super_admin_05', nickname: '运维' },
  { username: 'super_admin_06', nickname: '监控' },
  { username: 'super_admin_07', nickname: '数据' },
  { username: 'super_admin_08', nickname: '权限' },
  { username: 'super_admin_09', nickname: '备援' },
  { username: 'super_admin_10', nickname: '应急' },
];

const areaOptions = ['华北', '华东', '华南', '华中', '西南', '西北'];
const featureOptions = ['查看', '编辑', '导出', '审批', '审计', '配置'];

const SuperAdminListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

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
    <PageContainer
      title="超级管理员"
      extra={[
        <Button key="add" type="primary" onClick={() => setIsModalOpen(true)}>
          添加用户
        </Button>,
      ]}
    >
      <Card>
        <Paragraph type="secondary">列表字段与操作待配置。</Paragraph>
        <Table<AdminRecord>
          rowKey="username"
          dataSource={dataSource}
          pagination={false}
          columns={[
            {
              title: '用户名',
              dataIndex: 'username',
            },
            {
              title: '昵称',
              dataIndex: 'nickname',
            },
            {
              title: '管理区域',
              key: 'manage-area',
              render: () => (
                <Space size="small">
                  <Button type="link">管理区域</Button>
                </Space>
              ),
            },
            {
              title: '功能授权',
              key: 'feature-auth',
              render: () => (
                <Space size="small">
                  <Button type="link">功能授权</Button>
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
              title: '账号移除',
              key: 'account-remove',
              render: () => (
                <Space size="small">
                  <Button type="link" danger>
                    账号移除
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title="添加用户"
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
