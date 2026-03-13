import { PageContainer } from '@ant-design/pro-components';
import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useState } from 'react';
import styles from './index.less';

type AdminRecord = {
  username: string;
  nickname: string;
  area: string;
};

const dataSource: AdminRecord[] = [
  { username: '101', nickname: 'mohammed', area: '全国' },
  { username: '102', nickname: 'Ahmed', area: 'Riyadh、Buraydah' },
  { username: '103', nickname: 'mohammed', area: '全国' },
  { username: '104', nickname: 'Ahmed', area: 'Riyadh、Buraydah' },
];

const areaOptions = ['华北', '华东', '华南', '华中', '西南', '西北'];
const featureOptions = ['查看', '编辑', '导出', '审批', '审计', '配置'];

const orgTreeData: DataNode[] = [
  {
    title: '一级组织 1',
    key: '1',
    children: [
      {
        title: '二级组织',
        key: '1-1',
        children: [
          {
            title: '三级组织',
            key: '1-1-1',
            children: [
              { title: '四级组织 1', key: '1-1-1-1' },
              { title: '四级组织 2', key: '1-1-1-2' },
            ],
          },
        ],
      },
    ],
  },
  {
    title: '一级组织 2',
    key: '2',
    children: [
      {
        title: '二级组织 1',
        key: '2-1',
        children: [{ title: '三级组织', key: '2-1-1' }],
      },
      {
        title: '二级组织 2',
        key: '2-2',
        children: [
          { title: '三级组织 1', key: '2-2-1' },
          { title: '三级组织 2', key: '2-2-2' },
        ],
      },
    ],
  },
  {
    title: '一级组织 3',
    key: '3',
    children: [
      {
        title: '二级组织',
        key: '3-1',
        children: [
          { title: '三级组织 1', key: '3-1-1' },
          { title: '三级组织 2', key: '3-1-2' },
        ],
      },
    ],
  },
];

const ProvinceAdminListPage: React.FC = () => {
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
    <PageContainer title={false}>
      <div className={styles.pageShell}>
        <Row gutter={0} className={styles.contentRow}>
          <Col xs={24} xl={6} className={styles.leftPane}>
            <Tree
              className={styles.orgTree}
              treeData={orgTreeData}
              defaultExpandAll
              selectable={false}
              switcherIcon={({ expanded }) => <CaretDownOutlined rotate={expanded ? 0 : -90} />}
            />
          </Col>
          <Col xs={24} xl={18} className={styles.rightPane}>
            <div className={styles.headerRow}>
              <h2 className={styles.pageTitle}>省级管理员</h2>
              <Button className={styles.backButton}>返回</Button>
            </div>
            <div className={styles.tableWrap}>
              <Table<AdminRecord>
                className={styles.adminTable}
                rowKey="username"
                dataSource={dataSource}
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
                    render: (value) => <Button type="link">{value}</Button>,
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
              <Button type="primary" onClick={() => setIsModalOpen(true)} className={styles.createButton}>
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
          <Form.Item label="账号名" name="username" rules={[{ required: true, message: '请输入账号名' }]}>
            <Input placeholder="请输入账号名" />
          </Form.Item>
          <Form.Item label="昵称" name="nickname" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item label="管理区域" name="areas" rules={[{ required: true, message: '请选择管理区域' }]}>
            <Select
              mode="multiple"
              placeholder="请选择管理区域"
              options={areaOptions.map((value) => ({ label: value, value }))}
            />
          </Form.Item>
          <Form.Item label="功能授权" name="features" rules={[{ required: true, message: '请选择功能授权' }]}>
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

export default ProvinceAdminListPage;
