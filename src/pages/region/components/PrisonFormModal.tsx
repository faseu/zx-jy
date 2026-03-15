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
  return (
    <Modal
      title={modalMode === 'edit' ? '编辑监狱' : '新增监狱'}
      open={open}
      confirmLoading={confirmLoading}
      onOk={onOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item label="监狱等级" name="level">
          <Radio.Group buttonStyle="solid" optionType="button">
            <Radio.Button style={{ background: '#cae9f8' }} value={1}>
              宽管监狱
            </Radio.Button>
            <Radio.Button style={{ background: '#f0dd93' }} value={2}>
              普管监狱
            </Radio.Button>
            <Radio.Button style={{ background: '#e8c0c9' }} value={3}>
              严管监狱
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="监狱名称"
          name="name"
          rules={[{ required: true, message: '请输入监狱名称' }]}
        >
          <Input placeholder="请输入监狱名称" />
        </Form.Item>
        <Form.Item label="授权人员列表" name="authUsers">
          <Input placeholder="以逗号分隔" />
        </Form.Item>
        <Form.Item
          label="监舍数量"
          name="roomNumber"
          rules={[{ required: true, message: '请输入监舍数量' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入监舍数量" />
        </Form.Item>
        <Form.Item name="deptId" hidden>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PrisonFormModal;
