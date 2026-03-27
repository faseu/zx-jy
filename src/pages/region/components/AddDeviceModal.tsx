import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Slider, Steps, Switch, TimePicker } from 'antd';
import type { FormInstance } from 'antd';
import React from 'react';
import shielder from '@/assets/shielder.png';

type OptionItem = {
  label: React.ReactNode;
  value: number;
};

type AddDeviceModalProps = {
  open: boolean;
  step: number;
  form: FormInstance;
  powerChannelKeys: string[];
  powerChannelValues: Record<string, number>;
  prisonOptions: OptionItem[];
  buildingOptions: OptionItem[];
  floorOptions: OptionItem[];
  deviceBuildingsLoading: boolean;
  prisonDisabled?: boolean;
  buildingDisabled?: boolean;
  floorDisabled?: boolean;
  onCancel: () => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  onPrisonChange: (value: number | null) => void;
  onBuildingChange: (value: number | null) => void;
  onPowerChannelChange: (key: string, value: number) => void;
};

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  open,
  step,
  form,
  powerChannelKeys,
  powerChannelValues,
  prisonOptions,
  buildingOptions,
  floorOptions,
  deviceBuildingsLoading,
  prisonDisabled = true,
  buildingDisabled = true,
  floorDisabled = true,
  onCancel,
  onNext,
  onPrev,
  onFinish,
  onPrisonChange,
  onBuildingChange,
  onPowerChannelChange,
}) => {
  return (
    <Modal
      title="添加设备"
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={
        step === 0
          ? [
              <Button key="cancel" onClick={onCancel}>
                取消
              </Button>,
              <Button key="next" type="primary" onClick={onNext}>
                下一步
              </Button>,
            ]
          : [
              <Button key="prev" onClick={onPrev}>
                上一步
              </Button>,
              <Button key="finish" type="primary" onClick={onFinish}>
                完成
              </Button>,
            ]
      }
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 3 }} initialValues={{ powerOff: true }}>
        <Row gutter={16}>
          <Col
            flex="180px"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                height: 160,
                border: '1px dashed #d9d9d9',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(0,0,0,0.45)',
                marginBottom: 12,
                overflow: 'hidden',
              }}
            >
              <img src={shielder} alt="" width={164} height={164} />
            </div>
            <Form.Item name="powerOff" valuePropName="checked">
              <Switch checkedChildren="开" unCheckedChildren="关" />
            </Form.Item>
          </Col>

          <Col flex="1">
            <Steps
              size="small"
              current={step}
              items={[{ title: '基础信息' }, { title: '其他信息' }]}
              style={{ marginBottom: 16 }}
            />

            {step === 0 ? (
              <>
                <Form.Item label="监狱" name="prisonId" rules={[{ required: true, message: '请选择监狱' }]}>
                  <Select
                    options={prisonOptions}
                    disabled={prisonDisabled}
                    onChange={(value) => onPrisonChange(value ?? null)}
                    placeholder="请选择监狱"
                  />
                </Form.Item>
                <Form.Item label="楼栋" name="buildingId" rules={[{ required: true, message: '请选择楼栋' }]}>
                  <Select
                    options={buildingOptions}
                    onChange={(value) => onBuildingChange(value ?? null)}
                    placeholder="请选择楼栋"
                    loading={deviceBuildingsLoading}
                    disabled={buildingDisabled}
                    notFoundContent={deviceBuildingsLoading ? '加载中...' : '暂无楼栋'}
                  />
                </Form.Item>
                <Form.Item label="楼层" name="floorId" rules={[{ required: true, message: '请选择楼层' }]}>
                  <Select options={floorOptions} placeholder="请选择楼层" disabled={floorDisabled} />
                </Form.Item>
                <Form.Item label="设备编号" name="deviceCode" rules={[{ required: true, message: '请输入设备编号' }]}>
                  <InputNumber min={1} placeholder="请输入设备编号" style={{ width: '100%' }} />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item label="全网编号" name="networkCode" rules={[{ required: true, message: '请输入全网编号' }]}>
                  <Input placeholder="请输入全网编号" />
                </Form.Item>
                <Form.Item label="IP" name="ip" rules={[{ required: true, message: '请输入 IP' }]}>
                  <Input placeholder="请输入 IP" />
                </Form.Item>
                <Form.Item label="端口" name="port" rules={[{ required: true, message: '请输入端口' }]}>
                  <InputNumber min={0} max={65535} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="功率调节">
                  <Row gutter={[12, 8]}>
                    {powerChannelKeys.map((key, index) => (
                      <Col span={8} key={key}>
                        <Form.Item name={key} label={`CH${index + 1}`} style={{ marginBottom: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ minWidth: 24, textAlign: 'right' }}>{powerChannelValues[key] ?? 0}</span>
                            <Slider
                              min={0}
                              max={100}
                              style={{ flex: 1, margin: 0 }}
                              tooltip={{ open: false }}
                              onChange={(value) => {
                                const nextValue = Array.isArray(value) ? value[0] : value;
                                onPowerChannelChange(key, nextValue);
                              }}
                            />
                          </div>
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                </Form.Item>
                <Form.Item label="开始时间" name="startTime" rules={[{ required: true, message: '请选择开始时间' }]}>
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="停止时间" name="stopTime" rules={[{ required: true, message: '请选择停止时间' }]}>
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
              </>
            )}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddDeviceModal;
