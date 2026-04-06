import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import OrgTree from '@/components/OrgTree';
import type { PrisonVO, ProvinceVO } from '@/pages/region/data.d';
import type { OrgTreeSelectionParams } from '@/components/OrgTree';
import { queryProvinceList, queryProvincePrisons } from '@/pages/region/service';
import type { ProvinceAdminPageParams, ProvinceAdminVO } from './data.d';
import { createProvinceAdmin, queryProvinceAdminPage } from './service';
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

const getAreaText = (record: ProvinceAdminVO): string => {
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

const ProvinceAdminListPage: React.FC = () => {
  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | string>();
  const [form] = Form.useForm();
  const selectedDeptId = Form.useWatch('deptId', form);
  const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage });
  const featureOptions = featureOptionIds.map((item) => ({
    label: t(item.labelId, item.defaultLabel),
    value: item.value,
  }));
  const { data: provinceData, loading: provinceLoading } = useRequest(queryProvinceList);
  const {
    data: provinceAdminPageData,
    loading: provinceAdminLoading,
    run: runQueryProvinceAdminPage,
  } = useRequest(queryProvinceAdminPage, {
    manual: true,
    onError: () => {
      message.error(
        t(
          'pages.account.message.provinceAdminLoadFailed',
          'Failed to load province admin list. Please try again later.'
        )
      );
    },
  });
  const {
    data: prisonData,
    loading: prisonLoading,
    run: runQueryProvincePrisons,
  } = useRequest(queryProvincePrisons, {
    manual: true,
    onError: () => {
      message.error(
        t(
          'pages.account.message.prisonListLoadFailed',
          'Failed to load prison list. Please try again later.'
        )
      );
    },
  });

  const provinceList = (provinceData ?? []) as ProvinceVO[];
  const provinceAdminList = provinceAdminPageData?.list ?? [];
  const prisonList = (prisonData ?? []) as PrisonVO[];
  const provinceOptions = provinceList
    .filter((item) => item.provinceId !== undefined && item.provinceName)
    .map((item) => ({
      label: item.provinceName as string,
      value: item.provinceId as number | string,
    }));
  const prisonOptions = prisonList
    .filter((item) => item.id !== undefined && item.name)
    .map((item) => ({
      label: item.name as string,
      value: item.id as number | string,
    }));

  const runSearch = useCallback(
    (provinceId?: number | string) => {
      const params: ProvinceAdminPageParams = {
        pageNum: 1,
        pageSize: 10,
      };

      if (provinceId !== undefined && provinceId !== null) {
        params.provinceId = provinceId;
      }

      runQueryProvinceAdminPage(params);
    },
    [runQueryProvinceAdminPage]
  );

  useEffect(() => {
    runSearch(selectedProvinceId);
  }, [runSearch, selectedProvinceId]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    form.setFieldsValue({
      deptId: selectedProvinceId ?? undefined,
      areaIds: undefined,
    });
  }, [form, isModalOpen, selectedProvinceId]);

  useEffect(() => {
    if (!isModalOpen || selectedDeptId === undefined || selectedDeptId === null) {
      return;
    }

    runQueryProvincePrisons(selectedDeptId);
  }, [isModalOpen, runQueryProvincePrisons, selectedDeptId]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await createProvinceAdmin({
        username: values.username,
        nickname: values.nickname,
        password: values.password,
        roleId: 2,
        deptId: values.deptId,
        areaIds: values.areaIds,
        menuIds: values.features,
      });
      message.success(t('pages.account.message.createSuccess', 'Created successfully.'));
      setIsModalOpen(false);
      form.resetFields();
      runSearch(selectedProvinceId);
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
          <Col xs={24} xl={6} className={styles.leftPane}>
            <OrgTree
              provinceList={provinceList}
              loading={provinceLoading}
              maxLevel={1}
              onSelectionChange={(params: OrgTreeSelectionParams) => {
                if (params.nodeType === 'province') {
                  setSelectedProvinceId(params.provinceId);
                  return;
                }
                if (params.nodeType === 'country') {
                  setSelectedProvinceId(undefined);
                }
              }}
            />
          </Col>
          <Col xs={24} xl={18} className={styles.rightPane}>
            <div className={styles.headerRow}>
              <h2 className={styles.pageTitle}>
                {t('pages.account.role.provinceAdmin', 'Province Admin')}
              </h2>
              <Button className={styles.backButton}>
                {t('pages.account.action.back', 'Back')}
              </Button>
            </div>
            <div className={styles.tableWrap}>
              <Table<ProvinceAdminVO>
                className={styles.adminTable}
                loading={provinceAdminLoading}
                rowKey={(record) => String(record.id ?? record.username ?? '')}
                dataSource={provinceAdminList}
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
                onClick={() => {
                  form.resetFields();
                  form.setFieldsValue({
                    deptId: selectedProvinceId ?? undefined,
                    areaIds: undefined,
                  });
                  setIsModalOpen(true);
                }}
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
            label={t('pages.account.field.belongProvince', 'Province')}
            name="deptId"
            rules={[
              {
                required: true,
                message: t(
                  'pages.account.validation.belongProvinceRequired',
                  'Please select province.'
                ),
              },
            ]}
          >
            <Select
              placeholder={t(
                'pages.account.validation.belongProvinceRequired',
                'Please select province.'
              )}
              loading={provinceLoading}
              options={provinceOptions}
              onChange={() => {
                form.setFieldsValue({ areaIds: undefined });
              }}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.account.field.managePrison', 'Managed Prison')}
            name="areaIds"
            rules={[
              {
                required: true,
                message: t(
                  'pages.account.validation.managePrisonRequired',
                  'Please select managed prison.'
                ),
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder={t(
                'pages.account.validation.managePrisonRequired',
                'Please select managed prison.'
              )}
              loading={prisonLoading}
              disabled={!selectedDeptId}
              options={prisonOptions}
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

export default ProvinceAdminListPage;
