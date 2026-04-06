import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import OrgTree from '@/components/OrgTree';
import type { BuildingDetailVO, PrisonVO, ProvinceVO } from '@/pages/region/data.d';
import type { OrgTreeSelectionParams } from '@/components/OrgTree';
import {
  queryPrisonBuildings,
  queryProvinceList,
  queryProvincePrisons,
} from '@/pages/region/service';
import type { PrisonAdminPageParams, PrisonAdminVO } from './data.d';
import { createPrisonAdmin, queryPrisonAdminPage } from './service';
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

const getAreaText = (record: PrisonAdminVO): string => {
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

const PrisonAdminListPage: React.FC = () => {
  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | string>();
  const [selectedPrisonId, setSelectedPrisonId] = useState<number | string>();
  const [selectedFormProvinceId, setSelectedFormProvinceId] = useState<number | string>();
  const [form] = Form.useForm();
  const selectedModalProvinceId = Form.useWatch('provinceId', form);
  const selectedDeptId = Form.useWatch('deptId', form);
  const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage });
  const featureOptions = featureOptionIds.map((item) => ({
    label: t(item.labelId, item.defaultLabel),
    value: item.value,
  }));
  const { data: provinceData, loading: provinceLoading } = useRequest(queryProvinceList);
  const {
    data: prisonAdminPageData,
    loading: prisonAdminLoading,
    run: runQueryPrisonAdminPage,
  } = useRequest(queryPrisonAdminPage, {
    manual: true,
    onError: () => {
      message.error(
        t(
          'pages.account.message.prisonAdminLoadFailed',
          'Failed to load prison admin list. Please try again later.'
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
  const {
    data: buildingData,
    loading: buildingLoading,
    run: runQueryPrisonBuildings,
  } = useRequest(queryPrisonBuildings, {
    manual: true,
    onError: () => {
      message.error(
        t(
          'pages.account.message.buildingListLoadFailed',
          'Failed to load building list. Please try again later.'
        )
      );
    },
  });

  const provinceList = (provinceData ?? []) as ProvinceVO[];
  const prisonAdminList = prisonAdminPageData?.list ?? [];
  const prisonList = (prisonData ?? []) as PrisonVO[];
  const buildingList = (buildingData ?? []) as BuildingDetailVO[];
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
  const buildingOptions = buildingList
    .filter((item) => item.id !== undefined && item.name)
    .map((item) => ({
      label: item.name as string,
      value: item.id as number | string,
    }));

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
    [runQueryPrisonAdminPage]
  );

  useEffect(() => {
    runSearch(selectedProvinceId, selectedPrisonId);
  }, [runSearch, selectedProvinceId, selectedPrisonId]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    form.setFieldsValue({
      provinceId: selectedFormProvinceId ?? undefined,
      deptId: selectedPrisonId ?? undefined,
      areaIds: undefined,
    });
  }, [form, isModalOpen, selectedFormProvinceId, selectedPrisonId]);

  useEffect(() => {
    if (!isModalOpen || selectedModalProvinceId === undefined || selectedModalProvinceId === null) {
      return;
    }

    runQueryProvincePrisons(selectedModalProvinceId);
  }, [isModalOpen, runQueryProvincePrisons, selectedModalProvinceId]);

  useEffect(() => {
    if (!isModalOpen || selectedDeptId === undefined || selectedDeptId === null) {
      return;
    }

    runQueryPrisonBuildings(selectedDeptId);
  }, [isModalOpen, runQueryPrisonBuildings, selectedDeptId]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await createPrisonAdmin({
        username: values.username,
        nickname: values.nickname,
        password: values.password,
        roleId: 3,
        deptId: values.deptId,
        areaIds: values.areaIds,
        menuIds: values.features,
      });
      message.success(t('pages.account.message.createSuccess', 'Created successfully.'));
      setIsModalOpen(false);
      form.resetFields();
      runSearch(selectedProvinceId, selectedPrisonId);
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
              maxLevel={2}
              onSelectionChange={(params: OrgTreeSelectionParams) => {
                if (params.nodeType === 'prison') {
                  setSelectedProvinceId(undefined);
                  setSelectedPrisonId(params.prisonId);
                  setSelectedFormProvinceId(params.provinceId);
                  return;
                }
                if (params.nodeType === 'province') {
                  setSelectedProvinceId(params.provinceId);
                  setSelectedPrisonId(undefined);
                  setSelectedFormProvinceId(params.provinceId);
                  return;
                }
                if (params.nodeType === 'country') {
                  setSelectedProvinceId(undefined);
                  setSelectedPrisonId(undefined);
                  setSelectedFormProvinceId(undefined);
                }
              }}
            />
          </Col>
          <Col xs={24} xl={18} className={styles.rightPane}>
            <div className={styles.headerRow}>
              <h2 className={styles.pageTitle}>
                {t('pages.account.role.prisonAdmin', 'Prison Admin')}
              </h2>
              <Button className={styles.backButton}>
                {t('pages.account.action.back', 'Back')}
              </Button>
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
                    provinceId: selectedFormProvinceId ?? undefined,
                    deptId: selectedPrisonId ?? undefined,
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
            label={t('pages.account.field.belongProvince', 'Province')}
            name="provinceId"
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
                form.setFieldsValue({ deptId: undefined, areaIds: undefined });
              }}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.account.field.belongPrison', 'Prison')}
            name="deptId"
            rules={[
              {
                required: true,
                message: t(
                  'pages.account.validation.belongPrisonRequired',
                  'Please select prison.'
                ),
              },
            ]}
          >
            <Select
              placeholder={t(
                'pages.account.validation.belongPrisonRequired',
                'Please select prison.'
              )}
              loading={prisonLoading}
              disabled={!selectedModalProvinceId}
              options={prisonOptions}
              onChange={() => {
                form.setFieldsValue({ areaIds: undefined });
              }}
            />
          </Form.Item>
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
            label={t('pages.account.field.manageBuilding', 'Managed Building')}
            name="areaIds"
            rules={[
              {
                required: true,
                message: t(
                  'pages.account.validation.manageBuildingRequired',
                  'Please select managed building.'
                ),
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder={t(
                'pages.account.validation.manageBuildingRequired',
                'Please select managed building.'
              )}
              loading={buildingLoading}
              disabled={!selectedDeptId}
              options={buildingOptions}
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

export default PrisonAdminListPage;
