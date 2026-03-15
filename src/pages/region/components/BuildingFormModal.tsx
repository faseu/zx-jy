import { Form, Input, InputNumber, Modal } from 'antd';
import type { FormInstance } from 'antd';
import React from 'react';
import type { BuildingFormVO } from '../data.d';

type BuildingFormModalProps = {
  modalMode: 'create' | 'edit';
  open: boolean;
  confirmLoading: boolean;
  form: FormInstance<BuildingFormVO>;
  onOk: () => void;
  onCancel: () => void;
};

const BuildingFormModal: React.FC<BuildingFormModalProps> = ({
  modalMode,
  open,
  confirmLoading,
  form,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title={modalMode === 'edit' ? '编辑楼栋' : '新增楼栋'}
      open={open}
      confirmLoading={confirmLoading}
      onOk={onOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="楼栋名称"
          name="name"
          rules={[{ required: true, message: '请输入楼栋名称' }]}
        >
          <Input placeholder="请输入楼栋名称" />
        </Form.Item>
        <Form.Item
          label="地上楼层数"
          name="groundFloorNum"
          rules={[{ required: true, message: '请输入地上楼层数' }]}
        >
          <InputNumber placeholder="请输入地上楼层数" style={{ width: '100%' }} min={0} precision={0} />
        </Form.Item>
        <Form.Item
          label="地下楼层数"
          name="undergroundFloorNum"
          rules={[{ required: true, message: '请输入地下楼层数' }]}
        >
          <InputNumber placeholder="请输入地下楼层数" style={{ width: '100%' }} min={0} precision={0} />
        </Form.Item>
        <Form.Item name="prisonId" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BuildingFormModal;
