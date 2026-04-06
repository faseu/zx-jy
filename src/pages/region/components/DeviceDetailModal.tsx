import { useRequest } from '@umijs/max';
import { Button, message, Modal, Slider, Spin, Switch } from 'antd';
import React from 'react';
import { disableDevices, enableDevices } from '../../machine/service';
import type { DeviceFormVO } from '../data.d';
import { queryDeviceForm, updateDeviceChannels } from '../service';

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
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return String(value);
};

const parseChannelValue = (value?: string | number | null) => {
  const resolved = Number(value);

  if (!Number.isFinite(resolved)) {
    return 0;
  }

  return Math.max(0, Math.min(100, resolved));
};

const FieldRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
    <div style={{ width: 88, textAlign: 'right', fontSize: 16, fontWeight: 400, color: '#000' }}>
      {label}:
    </div>
    <div style={{ marginLeft: 18, fontSize: 22, fontWeight: 400, color: '#000' }}>{value}</div>
  </div>
);

const ChannelRow: React.FC<{
  label: string;
  value: number;
  onChange: (nextValue: number) => void;
}> = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
    <div style={{ width: 88, textAlign: 'right', fontSize: 16, fontWeight: 400, color: '#000' }}>
      {label}:
    </div>
    <div style={{ marginLeft: 18, flex: 1, paddingRight: 18 }}>
      <Slider value={value} min={0} max={100} tooltip={{ open: false }} onChange={onChange} />
    </div>
  </div>
);

const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ open, deviceId, onCancel }) => {
  const [channelValues, setChannelValues] = React.useState<Record<string, number>>({});
  const [powerSubmitting, setPowerSubmitting] = React.useState(false);
  const [channelSubmitting, setChannelSubmitting] = React.useState(false);
  const { data, loading, run } = useRequest((id: number) => queryDeviceForm(id), {
    manual: true,
  });

  React.useEffect(() => {
    if (!open || !deviceId) {
      return;
    }

    run(deviceId);
  }, [deviceId, open, run]);

  const detail = ((data as { data?: DeviceFormVO } | undefined)?.data ?? data ?? {}) as DeviceFormVO;

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setChannelValues(
      Object.fromEntries(
        CHANNEL_KEYS.map((key) => [key, parseChannelValue(detail[key] as string | number | null)])
      )
    );
  }, [detail, open]);

  const handlePowerChange = React.useCallback(
    async (checked: boolean) => {
      if (!deviceId || powerSubmitting) {
        return;
      }

      try {
        setPowerSubmitting(true);

        if (checked) {
          await enableDevices([deviceId]);
          message.success('电源已开启');
        } else {
          await disableDevices([deviceId]);
          message.success('电源已关闭');
        }

        await run(deviceId);
      } catch {
        message.error('电源状态更新失败');
      } finally {
        setPowerSubmitting(false);
      }
    },
    [deviceId, powerSubmitting, run]
  );

  const handleChannelChange = React.useCallback((key: string, value: number) => {
    setChannelValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleChannelSave = React.useCallback(async () => {
    if (!deviceId || channelSubmitting) {
      return;
    }

    try {
      setChannelSubmitting(true);

      await updateDeviceChannels(
        deviceId,
        CHANNEL_KEYS.reduce(
          (acc, key) => {
            acc[key] = channelValues[key] ?? 0;
            return acc;
          },
          {} as Record<string, number>
        )
      );

      message.success('通道配置已保存');
      await run(deviceId);
    } catch {
      message.error('通道配置保存失败');
    } finally {
      setChannelSubmitting(false);
    }
  }, [channelSubmitting, channelValues, deviceId, run]);

  return (
    <Modal
      title={<div style={{ textAlign: 'center', fontSize: 24, fontWeight: 600 }}>设备详情</div>}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          关闭
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={channelSubmitting}
          onClick={handleChannelSave}
        >
          保存通道配置
        </Button>,
      ]}
      width={1200}
      destroyOnClose
      centered
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <div style={{ padding: '36px' }}>
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
                value={
                  <Switch
                    size="small"
                    checked={Number(detail.powerOff) === 0}
                    loading={powerSubmitting}
                    onChange={handlePowerChange}
                  />
                }
              />
              <FieldRow label="射频" value={valueOrDash(detail.radio_frequency)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 64 }}>
            <div>
              <ChannelRow
                label="CH1"
                value={channelValues.ch1 ?? 0}
                onChange={(value) => handleChannelChange('ch1', value)}
              />
              <ChannelRow
                label="CH4"
                value={channelValues.ch4 ?? 0}
                onChange={(value) => handleChannelChange('ch4', value)}
              />
              <ChannelRow
                label="CH7"
                value={channelValues.ch7 ?? 0}
                onChange={(value) => handleChannelChange('ch7', value)}
              />
              <ChannelRow
                label="CH10"
                value={channelValues.ch10 ?? 0}
                onChange={(value) => handleChannelChange('ch10', value)}
              />
              <ChannelRow
                label="CH13"
                value={channelValues.ch13 ?? 0}
                onChange={(value) => handleChannelChange('ch13', value)}
              />
              <ChannelRow
                label="CH16"
                value={channelValues.ch16 ?? 0}
                onChange={(value) => handleChannelChange('ch16', value)}
              />
            </div>
            <div>
              <ChannelRow
                label="CH2"
                value={channelValues.ch2 ?? 0}
                onChange={(value) => handleChannelChange('ch2', value)}
              />
              <ChannelRow
                label="CH5"
                value={channelValues.ch5 ?? 0}
                onChange={(value) => handleChannelChange('ch5', value)}
              />
              <ChannelRow
                label="CH8"
                value={channelValues.ch8 ?? 0}
                onChange={(value) => handleChannelChange('ch8', value)}
              />
              <ChannelRow
                label="CH11"
                value={channelValues.ch11 ?? 0}
                onChange={(value) => handleChannelChange('ch11', value)}
              />
              <ChannelRow
                label="CH14"
                value={channelValues.ch14 ?? 0}
                onChange={(value) => handleChannelChange('ch14', value)}
              />
              <ChannelRow
                label="CH17"
                value={channelValues.ch17 ?? 0}
                onChange={(value) => handleChannelChange('ch17', value)}
              />
            </div>
            <div>
              <ChannelRow
                label="CH3"
                value={channelValues.ch3 ?? 0}
                onChange={(value) => handleChannelChange('ch3', value)}
              />
              <ChannelRow
                label="CH6"
                value={channelValues.ch6 ?? 0}
                onChange={(value) => handleChannelChange('ch6', value)}
              />
              <ChannelRow
                label="CH9"
                value={channelValues.ch9 ?? 0}
                onChange={(value) => handleChannelChange('ch9', value)}
              />
              <ChannelRow
                label="CH12"
                value={channelValues.ch12 ?? 0}
                onChange={(value) => handleChannelChange('ch12', value)}
              />
              <ChannelRow
                label="CH15"
                value={channelValues.ch15 ?? 0}
                onChange={(value) => handleChannelChange('ch15', value)}
              />
              <ChannelRow
                label="CH18"
                value={channelValues.ch18 ?? 0}
                onChange={(value) => handleChannelChange('ch18', value)}
              />
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default DeviceDetailModal;
