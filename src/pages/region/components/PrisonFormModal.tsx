import { useIntl } from '@umijs/max';
import { Form, Input, InputNumber, Modal, Radio } from 'antd';
import type { FormInstance } from 'antd';
import React from 'react';
import type { PrisonFormVO } from '../data.d';

type PrisonFormModalProps = {
  modalMode: 'create' | 'edit';
  open: boolean;
  confirmLoading: boolean;
  form: FormInstance<PrisonFormVO>;
  onOk: () => void;
  onCancel: () => void;
};

const PrisonFormModal: React.FC<PrisonFormModalProps> = ({
  modalMode,
  open,
  confirmLoading,
  form,
  onOk,
  onCancel,
}) => {
  const intl = useIntl();

  return (
    <Modal
      title={intl.formatMessage({
        id: modalMode === 'edit' ? 'pages.region.modal.editPrison' : 'pages.region.modal.addPrison',
      })}
      open={open}
      confirmLoading={confirmLoading}
      onOk={onOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={intl.formatMessage({ id: 'pages.region.field.prisonLevel' })}
          name="level"
        >
          <Radio.Group buttonStyle="solid" optionType="button">
            <Radio.Button style={{ background: '#cae9f8' }} value={1}>
              {intl.formatMessage({ id: 'pages.region.prisonLevel.loose' })}
            </Radio.Button>
            <Radio.Button style={{ background: '#f0dd93' }} value={2}>
              {intl.formatMessage({ id: 'pages.region.prisonLevel.normal' })}
            </Radio.Button>
            <Radio.Button style={{ background: '#e8c0c9' }} value={3}>
              {intl.formatMessage({ id: 'pages.region.prisonLevel.strict' })}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({ id: 'pages.region.field.prisonName' })}
          name="name"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.region.validation.prisonName' }),
            },
          ]}
        >
          <Input placeholder={intl.formatMessage({ id: 'pages.region.validation.prisonName' })} />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({ id: 'pages.region.field.authUsers' })}
          name="authUsers"
        >
          <Input
            placeholder={intl.formatMessage({ id: 'pages.region.placeholder.commaSeparated' })}
          />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({ id: 'pages.region.field.roomNumber' })}
          name="roomNumber"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.region.validation.roomNumber' }),
            },
          ]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder={intl.formatMessage({ id: 'pages.region.validation.roomNumber' })}
          />
        </Form.Item>
        <Form.Item name="deptId" hidden>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PrisonFormModal;
