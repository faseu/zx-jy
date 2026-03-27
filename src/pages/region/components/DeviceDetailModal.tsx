import { useRequest } from '@umijs/max';
import { Button, Modal, Slider, Spin, Switch } from 'antd';
import React, { useEffect } from 'react';
import type { DeviceFormVO } from '../data.d';
import { queryDeviceForm } from '../service';

type DeviceDetailModalProps = {
  open: boolean;
  deviceId: number | null;
  onCancel: () => void;
};

const CHANNEL_KEYS = Array.from(
  { length: 18 },
  (_, index) => `ch${index + 1}` as keyof DeviceFormVO
);

const valueOrDash = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
};

const parseChannelValue = (value?: string | number | null) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
};

const FieldRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
    <div style={{ width: 88, textAlign: 'right', fontSize: 16, fontWeight: 400, color: '#000' }}>
      {label}:
    </div>
    <div style={{ marginLeft: 18, fontSize: 22, fontWeight: 400, color: '#000' }}>{value}</div>
  </div>
);

const ChannelRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
    <div style={{ width: 88, textAlign: 'right', fontSize: 16, fontWeight: 400, color: '#000' }}>
      {label}:
    </div>
    <div style={{ marginLeft: 18, flex: 1, paddingRight: 18 }}>
      <Slider value={value} min={0} max={100} disabled tooltip={{ open: false }} />
    </div>
  </div>
);

const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ open, deviceId, onCancel }) => {
  const { data, loading, run } = useRequest((id: number) => queryDeviceForm(id), {
    manual: true,
  });

  useEffect(() => {
    if (!open || !deviceId) return;
    run(deviceId);
  }, [open, deviceId, run]);

  const detail = ((data as { data?: DeviceFormVO } | undefined)?.data ?? data ?? {}) as DeviceFormVO;
  const channelValues = CHANNEL_KEYS.map((key) => parseChannelValue(detail[key]));

  return (
    <Modal
      title={<div style={{ textAlign: 'center', fontSize: 24, fontWeight: 600 }}>设备情况</div>}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="ok" type="default" onClick={onCancel}>
          确定
        </Button>,
      ]}
      width={1200}
      destroyOnClose
      centered
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <div
          style={{
            padding: '36px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              columnGap: 64,
              marginBottom: 14,
            }}
          >
            <div>
              <FieldRow label="所在楼" value={valueOrDash(detail.buildingName)} />
              <FieldRow label="全网编号" value={valueOrDash(detail.entireNo)} />
              <FieldRow label="电压" value={valueOrDash(detail.voltage)} />
            </div>
            <div>
              <FieldRow label="所在楼层" value={valueOrDash(detail.floorName)} />
              <FieldRow label="设备名称" value={valueOrDash(detail.deviceName)} />
              <FieldRow label="电流" value={valueOrDash(detail.electric_current)} />
            </div>
            <div>
              <FieldRow label="设备编号" value={valueOrDash(detail.deviceNo)} />
              <FieldRow
                label="电源"
                value={<Switch size="small" checked={Number(detail.powerOff) === 0} disabled />}
              />
              <FieldRow label="射频" value={valueOrDash(detail.radio_frequency)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 64 }}>
            <div>
              <ChannelRow label="CH1" value={channelValues[0]} />
              <ChannelRow label="CH4" value={channelValues[3]} />
              <ChannelRow label="CH7" value={channelValues[6]} />
              <ChannelRow label="CH10" value={channelValues[9]} />
              <ChannelRow label="CH13" value={channelValues[12]} />
              <ChannelRow label="CH16" value={channelValues[15]} />
            </div>
            <div>
              <ChannelRow label="CH2" value={channelValues[1]} />
              <ChannelRow label="CH5" value={channelValues[4]} />
              <ChannelRow label="CH8" value={channelValues[7]} />
              <ChannelRow label="CH11" value={channelValues[10]} />
              <ChannelRow label="CH14" value={channelValues[13]} />
              <ChannelRow label="CH17" value={channelValues[16]} />
            </div>
            <div>
              <ChannelRow label="CH3" value={channelValues[2]} />
              <ChannelRow label="CH6" value={channelValues[5]} />
              <ChannelRow label="CH9" value={channelValues[8]} />
              <ChannelRow label="CH12" value={channelValues[11]} />
              <ChannelRow label="CH15" value={channelValues[14]} />
              <ChannelRow label="CH18" value={channelValues[17]} />
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default DeviceDetailModal;
