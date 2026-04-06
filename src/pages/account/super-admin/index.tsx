import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, message } from 'antd';
import React, { useState } from 'react';
import gb from '@/assets/gb.png';
import { queryProvinceList } from '@/pages/region/service';
import type { ProvinceVO } from '@/pages/region/data.d';
import type { SuperAdminVO } from './data.d';
import { createSuperAdmin, queryAdminPage } from './service';
import styles from './index.less';

const featureOptionIds = [
  { labelId: 'pages.account.feature.province', defaultLabel: 'Province', value: 1 },
  { labelId: 'pages.account.feature.userManagement', defaultLabel: 'User Management', value: 2 },
  {
    labelId: 'pages.account.feature.deviceManagement',
    defaultLabel: 'Device Management',
    value: 3,
  },
  { labelId: 'pages.account.feature.alarm', defaultLabel: 'Alarm', value: 4 },
  { labelId: 'pages.account.feature.statistics', defaultLabel: 'Statistics', value: 5 },
  { labelId: 'pages.account.feature.log', defaultLabel: 'Log', value: 6 },
];

const getAreaText = (record: SuperAdminVO): string => {
  if (record.area && record.area.trim()) {
    return record.area;
  }
  if (record.manageArea && record.manageArea.trim()) {
    return record.manageArea;
  }
  if (Array.isArray(record.manageAreas) && record.manageAreas.length > 0) {
    return record.manageAreas.filter(Boolean).join(', ');
  }

  return '-';
};

const getErrorMessage = (error: unknown): string | undefined =>
  (error as { response?: { data?: { msg?: string } } })?.response?.data?.msg ||
  (error as { info?: { errorMessage?: string } })?.info?.errorMessage;

const SuperAdminListPage: React.FC = () => {
  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage });
  const featureOptions = featureOptionIds.map((item) => ({
    label: t(item.labelId, item.defaultLabel),
    value: item.value,
  }));
  const { data, loading, refresh } = useRequest(
    () =>
      queryAdminPage({
        pageNum: 1,
        pageSize: 10,
      }),
    {
      onError: () => {
        message.error(
          t(
            'pages.account.message.superAdminLoadFailed',
            'Failed to load super admin list. Please try again later.'
          )
        );
      },
    }
  );
  const { data: provinceData, loading: provinceLoading } = useRequest(queryProvinceList);
  const adminList = data?.list ?? [];
  const provinceOptions = ((provinceData ?? []) as ProvinceVO[])
    .filter((item) => item.provinceId !== undefined && item.provinceName)
    .map((item) => ({
      label: item.provinceName as string,
      value: item.provinceId as number | string,
    }));

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await createSuperAdmin({
        username: values.username,
        nickname: values.nickname,
        password: values.password,
        roleId: 1,
        areaIds: values.areaIds,
        menuIds: values.features,
      });
      message.success(t('pages.account.message.createSuccess', 'Created successfully.'));
      setIsModalOpen(false);
      form.resetFields();
      refresh();
    } catch (error) {
      if ((error as { errorFields?: unknown })?.errorFields) {
        return;
      }
      message.error(
        getErrorMessage(error) ||
          t('pages.account.message.createFailed', 'Create failed. Please try again later.')
      );
    }
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
              <h2 className={styles.pageTitle}>
                {t('pages.account.role.superAdmin', 'Super Admin')}
              </h2>
              <Button className={styles.backButton}>
                {t('pages.account.action.back', 'Back')}
              </Button>
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
                    title: t('pages.account.field.username', 'Username'),
                    dataIndex: 'username',
                  },
                  {
                    title: t('pages.account.field.nickname', 'Nickname'),
                    dataIndex: 'nickname',
                  },
                  {
                    title: t('pages.account.field.manageArea', 'Managed Area'),
                    dataIndex: 'area',
                    render: (_, record) => <Button type="link">{getAreaText(record)}</Button>,
                  },
                  {
                    title: t('pages.account.field.featureAuth', 'Feature Authorization'),
                    key: 'feature-auth',
                    render: () => (
                      <Space size="small">
                        <Button type="link">
                          {t('pages.account.action.allPermissions', 'All Permissions')}
                        </Button>
                      </Space>
                    ),
                  },
                  {
                    title: t('pages.account.field.passwordChange', 'Password Change'),
                    key: 'password-reset',
                    render: () => (
                      <Space size="small">
                        <Button type="link">
                          {t('pages.account.action.passwordChange', 'Password Change')}
                        </Button>
                      </Space>
                    ),
                  },
                  {
                    title: t('pages.account.field.accountDelete', 'Account Delete'),
                    key: 'account-remove',
                    render: () => (
                      <Space size="small">
                        <Button type="link" danger>
                          {t('pages.account.action.delete', 'Delete')}
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
                {t('pages.account.action.create', 'Create')}
              </Button>
            </div>
          </Col>
        </Row>
      </div>
      <Modal
        title={t('pages.account.modal.createUser', 'Create User')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={t('pages.account.action.save', 'Save')}
        cancelText={t('pages.account.action.cancel', 'Cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t('pages.account.field.username', 'Username')}
            name="username"
            rules={[
              {
                required: true,
                message: t('pages.account.validation.usernameRequired', 'Please enter username.'),
              },
            ]}
          >
            <Input
              placeholder={t('pages.account.validation.usernameRequired', 'Please enter username.')}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.account.field.nickname', 'Nickname')}
            name="nickname"
            rules={[
              {
                required: true,
                message: t('pages.account.validation.nicknameRequired', 'Please enter nickname.'),
              },
            ]}
          >
            <Input
              placeholder={t('pages.account.validation.nicknameRequired', 'Please enter nickname.')}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.account.field.password', 'Password')}
            name="password"
            rules={[
              {
                required: true,
                message: t('pages.account.validation.passwordRequired', 'Please enter password.'),
              },
            ]}
          >
            <Input.Password
              placeholder={t('pages.account.validation.passwordRequired', 'Please enter password.')}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.account.field.manageArea', 'Managed Area')}
            name="areaIds"
            rules={[
              {
                required: true,
                message: t(
                  'pages.account.validation.manageAreaRequired',
                  'Please select managed area.'
                ),
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder={t(
                'pages.account.validation.manageAreaRequired',
                'Please select managed area.'
              )}
              loading={provinceLoading}
              options={provinceOptions}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.account.field.featureAuth', 'Feature Authorization')}
            name="features"
            rules={[
              {
                required: true,
                message: t(
                  'pages.account.validation.featureAuthRequired',
                  'Please select feature authorization.'
                ),
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder={t(
                'pages.account.validation.featureAuthRequired',
                'Please select feature authorization.'
              )}
              options={featureOptions}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SuperAdminListPage;
