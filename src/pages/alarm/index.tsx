import {
  AimOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, DatePicker, Form, Input, Select, Space, Table, Tabs, Tree } from 'antd';
import React, { useMemo, useState } from 'react';

type DeviceStatus = 'online' | 'offline' | 'alarm';

type DeviceRecord = {
  id: string;
  code: string;
  name: string;
  type: string;
  model: string;
  status: DeviceStatus;
  location: string;
  ip: string;
  lastActive: string;
};

type RawTreeNode = {
  key: string;
  title: string;
  children?: RawTreeNode[];
  devices?: DeviceRecord[];
};

type TreeNode = {
  key: string;
  title: string;
  children?: TreeNode[];
};

type AlarmRecord = {
  id: string;
  prisonName: string;
  deviceId: string;
  deviceName: string;
  content: string;
  alarmTime: string;
  resolveTime: string;
};

const createDevices = (
  prefix: string,
  count: number,
  location: string,
  ipBase: number,
): DeviceRecord[] =>
  Array.from({ length: count }, (_, index) => {
    const seq = index + 1;
    const status: DeviceStatus =
      seq % 5 === 0 ? 'alarm' : seq % 3 === 0 ? 'offline' : 'online';
    return {
      id: `${prefix}-${seq}`,
      code: `${prefix}-${String(seq).padStart(3, '0')}`,
      name: `${location} 设备${seq}`,
      type: seq % 2 === 0 ? '门禁' : '摄像头',
      model: seq % 2 === 0 ? 'AC-200' : 'DS-2CD3T47',
      status,
      location,
      ip: `10.${ipBase}.0.${100 + seq}`,
      lastActive: status === 'online' ? '2026-01-30 21:40' : '2026-01-30 19:15',
    };
  });

const rawTreeData: RawTreeNode[] = [
  {
    key: 'province-hebei',
    title: '河北省',
    children: [
      {
        key: 'prison-sjz',
        title: '石家庄监狱',
        children: [
          {
            key: 'building-sjz-1',
            title: '1号楼',
            children: [
              {
                key: 'floor-sjz-1-1',
                title: '1层',
                devices: createDevices(
                  'HB-SJZ-1F',
                  6,
                  '河北省 / 石家庄监狱 / 1号楼 / 1层',
                  12,
                ),
              },
              {
                key: 'floor-sjz-1-2',
                title: '2层',
                devices: createDevices(
                  'HB-SJZ-2F',
                  5,
                  '河北省 / 石家庄监狱 / 1号楼 / 2层',
                  13,
                ),
              },
            ],
          },
          {
            key: 'building-sjz-2',
            title: '2号楼',
            children: [
              {
                key: 'floor-sjz-2-1',
                title: '1层',
                devices: createDevices(
                  'HB-SJZ-2B1F',
                  4,
                  '河北省 / 石家庄监狱 / 2号楼 / 1层',
                  14,
                ),
              },
              {
                key: 'floor-sjz-2-2',
                title: '2层',
                devices: createDevices(
                  'HB-SJZ-2B2F',
                  4,
                  '河北省 / 石家庄监狱 / 2号楼 / 2层',
                  15,
                ),
              },
            ],
          },
        ],
      },
      {
        key: 'prison-hd',
        title: '邯郸监狱',
        children: [
          {
            key: 'building-hd-1',
            title: '主楼',
            children: [
              {
                key: 'floor-hd-1',
                title: '1层',
                devices: createDevices(
                  'HB-HD-1F',
                  5,
                  '河北省 / 邯郸监狱 / 主楼 / 1层',
                  16,
                ),
              },
              {
                key: 'floor-hd-2',
                title: '2层',
                devices: createDevices(
                  'HB-HD-2F',
                  6,
                  '河北省 / 邯郸监狱 / 主楼 / 2层',
                  17,
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'province-shandong',
    title: '山东省',
    children: [
      {
        key: 'prison-jn',
        title: '济南监狱',
        children: [
          {
            key: 'building-jn-1',
            title: 'A栋',
            children: [
              {
                key: 'floor-jn-a1',
                title: '1层',
                devices: createDevices(
                  'SD-JN-A1F',
                  6,
                  '山东省 / 济南监狱 / A栋 / 1层',
                  21,
                ),
              },
              {
                key: 'floor-jn-a2',
                title: '2层',
                devices: createDevices(
                  'SD-JN-A2F',
                  5,
                  '山东省 / 济南监狱 / A栋 / 2层',
                  22,
                ),
              },
            ],
          },
          {
            key: 'building-jn-2',
            title: 'B栋',
            children: [
              {
                key: 'floor-jn-b1',
                title: '1层',
                devices: createDevices(
                  'SD-JN-B1F',
                  5,
                  '山东省 / 济南监狱 / B栋 / 1层',
                  23,
                ),
              },
            ],
          },
        ],
      },
      {
        key: 'prison-yt',
        title: '烟台监狱',
        children: [
          {
            key: 'building-yt-1',
            title: '综合楼',
            children: [
              {
                key: 'floor-yt-1',
                title: '1层',
                devices: createDevices(
                  'SD-YT-1F',
                  4,
                  '山东省 / 烟台监狱 / 综合楼 / 1层',
                  24,
                ),
              },
              {
                key: 'floor-yt-2',
                title: '2层',
                devices: createDevices(
                  'SD-YT-2F',
                  4,
                  '山东省 / 烟台监狱 / 综合楼 / 2层',
                  25,
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];

const buildTreeMaps = (nodes: RawTreeNode[]) => {
  const nodeDeviceMap = new Map<string, string[]>();
  const nodeTitleMap = new Map<string, string>();
  const deviceMap = new Map<string, DeviceRecord>();

  const walk = (node: RawTreeNode): TreeNode => {
    nodeTitleMap.set(node.key, node.title);
    let collectedIds: string[] = [];
    const children =
      node.children?.map((child) => {
        const childNode = walk(child);
        const childIds = nodeDeviceMap.get(child.key) ?? [];
        collectedIds = collectedIds.concat(childIds);
        return childNode;
      }) ?? [];
    const ownIds =
      node.devices?.map((device) => {
        deviceMap.set(device.id, device);
        return device.id;
      }) ?? [];
    const allIds = [...ownIds, ...collectedIds];
    nodeDeviceMap.set(node.key, allIds);
    return children.length ? { key: node.key, title: node.title, children } : { key: node.key, title: node.title };
  };

  const treeData = nodes.map((node) => walk(node));
  return { treeData, nodeDeviceMap, nodeTitleMap, deviceMap };
};

const { treeData } = buildTreeMaps(rawTreeData);


const MachinePage: React.FC = () => {
  const defaultSelectedKey = treeData[0]?.key ?? '';
  const [selectedKey, setSelectedKey] = useState<string>(defaultSelectedKey);
  const alarmData = useMemo<AlarmRecord[]>(
    () =>
      Array.from({ length: 10 }, (_, index) => {
        const seq = index + 1;
        return {
          id: `alarm-${seq}`,
          prisonName: 'AAAA监狱',
          deviceId: 'S11001',
          deviceName: '屏蔽仪',
          content: '温度过高',
          alarmTime: '2025-12-12 12:00:00',
          resolveTime: '2025-12-12 12:00:00',
        };
      }),
    [],
  );

  return (
    <div style={{padding: '24px'}}>
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 56,
          bottom: 0,
          width: '300px',
          padding: '16px 12px',
          borderRadius: '0 4px 4px 0',
          background: 'rgba(255, 255, 255, 0.68)',
          backdropFilter: 'blur(12px) saturate(160%)',
          WebkitBackdropFilter: 'blur(12px) saturate(160%)',
          boxShadow: '4px 0 28px rgba(15, 23, 42, 0.14)',
          zIndex: 10,
          overflow: 'auto',
        }}
      >
        <Tree
          blockNode
          defaultExpandAll
          treeData={treeData}
          selectedKeys={selectedKey ? [selectedKey] : []}
          onSelect={(keys) => {
            const nextKey = (keys[0] as string) ?? '';
            if (nextKey) {
              setSelectedKey(nextKey);
            }
          }}
        />
      </div>
      <div style={{marginLeft: 80}}>
        <PageContainer title={false}>
          <Tabs
            defaultActiveKey="current"
            items={[
              { key: 'current', label: '当前告警' },
              { key: 'history', label: '历史告警' },
              { key: 'muted', label: '屏蔽告警' },
            ]}
            style={{marginBottom: 16}}
          />
          <Card title="查询表格" size="small" style={{marginBottom: 16}}>
            <Form layout="inline">
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'}}>
                <Form.Item label="时间" name="range">
                  <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} separator="至" />
                </Form.Item>
                <Form.Item label="设备名称" name="deviceName">
                  <Input placeholder="请输入" style={{width: 180}} />
                </Form.Item>
                <Form.Item label="告警类型" name="alarmType">
                  <Select
                    placeholder="全部"
                    style={{width: 160}}
                    options={[
                      { label: '全部', value: 'all' },
                      { label: '温度告警', value: 'temp' },
                      { label: '离线告警', value: 'offline' },
                      { label: '设备故障', value: 'fault' },
                    ]}
                  />
                </Form.Item>
                <Button type="primary" icon={<SearchOutlined />}>
                  查询
                </Button>
              </div>
            </Form>
          </Card>
          <Card>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Space>
                <Button icon={<DeleteOutlined />}>告警清除</Button>
                <Button icon={<StopOutlined />}>告警屏蔽</Button>
                <Button icon={<AimOutlined />}>跳转到设备监控位置</Button>
              </Space>
              <Button icon={<DownloadOutlined />}>导出</Button>
            </div>
            <Table<AlarmRecord>
              rowKey="id"
              dataSource={alarmData}
              pagination={{ pageSize: 10, total: 658, showSizeChanger: false }}
              columns={[
                {
                  title: '告警监狱',
                  dataIndex: 'prisonName',
                },
                {
                  title: '告警设备ID',
                  dataIndex: 'deviceId',
                },
                {
                  title: '告警设备名称',
                  dataIndex: 'deviceName',
                },
                {
                  title: '告警内容',
                  dataIndex: 'content',
                },
                {
                  title: '告警发生时间',
                  dataIndex: 'alarmTime',
                },
                {
                  title: '解决时间',
                  dataIndex: 'resolveTime',
                },
              ]}
            />
          </Card>
        </PageContainer>
      </div>
    </div>
  );
};

export default MachinePage;


