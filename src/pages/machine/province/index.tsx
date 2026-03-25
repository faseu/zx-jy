import { CaretDownOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button, Checkbox, Col, Input, Row, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React from 'react';
import styles from './index.less';

const orgTreeData: DataNode[] = [
  {
    title: '全国',
    key: '0',
    children: [
      {
        title: 'Riyadh',
        key: '0-1',
        children: [
          {
            title: 'AAAA监狱',
            key: '0-1-1',
            children: [
              {
                title: 'AABB楼',
                key: '0-1-1-1',
                children: [
                  { title: '1楼', key: '0-1-1-1-1' },
                  { title: '2楼', key: '0-1-1-1-2' },
                ],
              },
              { title: 'BBCC楼', key: '0-1-1-2' },
              { title: 'BBBB楼', key: '0-1-1-3' },
            ],
          },
        ],
      },
      { title: 'Mecca', key: '0-2' },
      { title: 'Riyadh', key: '0-3' },
      { title: 'Buraydah', key: '0-4' },
      { title: 'Medina', key: '0-5' },
      { title: 'Mecca', key: '0-6' },
      { title: 'Riyadh', key: '0-7' },
      { title: 'Buraydah', key: '0-8' },
      { title: 'Medina', key: '0-9' },
    ],
  },
];

type DeviceRow = {
  id: string;
  floor?: string;
  deviceNo: string;
  networkNo: string;
  on: string;
  power: string;
  band: string;
  workTime: string;
  color: 'pink' | 'blue';
};

type BuildingGroup = {
  prisonName: string;
  buildingName: string;
  rows: DeviceRow[];
};

const tableData: BuildingGroup[] = [
  {
    prisonName: 'AAAA监狱',
    buildingName: 'AABB楼',
    rows: [
      {
        id: 'a-1',
        floor: '1楼',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
      {
        id: 'a-2',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
      {
        id: 'a-3',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
      {
        id: 'a-4',
        floor: '2楼',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
    ],
  },
  {
    prisonName: 'AAAA监狱',
    buildingName: 'BBCC楼',
    rows: [
      {
        id: 'b-1',
        floor: '1楼',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
      {
        id: 'b-2',
        floor: '2楼',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'pink',
      },
    ],
  },
  {
    prisonName: 'BBBB监狱',
    buildingName: 'AABB楼',
    rows: [
      {
        id: 'c-1',
        floor: '1楼',
        deviceNo: '1',
        networkNo: 'S11001',
        on: 'On',
        power: '20W',
        band: '全频段',
        workTime: '8:00-20:00',
        color: 'blue',
      },
    ],
  },
];

const toolbarButtons = ['添加设备', '批量添加', '修改', '删除', '管理'];

const ProvinceMachinePage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const provinceId = decodeURIComponent(params.id || '');

  const renderRows = () => {
    const totalRows = tableData.reduce((sum, group) => sum + group.rows.length, 0);
    const rows: React.ReactNode[] = [];
    let provinceRendered = false;

    tableData.forEach((group) => {
      group.rows.forEach((row, index) => {
        rows.push(
          <tr key={row.id} className={row.color === 'pink' ? styles.rowPink : styles.rowBlue}>
            {!provinceRendered && (
              <td rowSpan={totalRows} className={`${styles.leftMergedCell} ${styles.provinceCell}`}>
                {provinceId || '-'}
              </td>
            )}

            {index === 0 && (
              <td rowSpan={group.rows.length} className={styles.leftMergedCell}>
                {group.prisonName}
                <div className={styles.switchGroup}>
                  <Checkbox>全开</Checkbox>
                  <Checkbox>全关</Checkbox>
                </div>
              </td>
            )}

            {index === 0 && (
              <td rowSpan={group.rows.length} className={styles.leftMergedCell}>
                {group.buildingName}
                <div className={styles.switchGroup}>
                  <Checkbox>全开</Checkbox>
                  <Checkbox>全关</Checkbox>
                </div>
              </td>
            )}

            <td className={styles.floorCell}>
              {row.floor || ''}
              {row.floor && (
                <div className={styles.switchGroup}>
                  <Checkbox>全开</Checkbox>
                  <Checkbox>全关</Checkbox>
                </div>
              )}
            </td>
            <td>{row.deviceNo}</td>
            <td>{row.networkNo}</td>
            <td>{row.on}</td>
            <td>{row.power}</td>
            <td>{row.band}</td>
            <td>{row.workTime}</td>
            <td className={styles.checkCell}>
              <Checkbox />
            </td>
          </tr>
        );
        provinceRendered = true;
      });
    });

    return rows;
  };

  return (
    <PageContainer title={false}>
      <div className={styles.pageShell}>
        <Row gutter={0} className={styles.contentRow}>
          <Col xs={24} xl={6} className={styles.leftPane}>
            <Tree
              className={styles.orgTree}
              treeData={orgTreeData}
              defaultExpandAll
              selectable={false}
              switcherIcon={({ expanded }) => <CaretDownOutlined rotate={expanded ? 0 : -90} />}
            />
          </Col>
          <Col xs={24} xl={18} className={styles.rightPane}>
            <div className={styles.toolbar}>
              <Button type="primary">所有设备</Button>
              {toolbarButtons.map((item) => (
                <Button key={item}>{item}</Button>
              ))}
              <div className={styles.searchArea}>
                <Input placeholder="请输入" />
                <Button>查找</Button>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.deviceTable}>
                <thead>
                  <tr>
                    <th>省份</th>
                    <th>监狱</th>
                    <th>楼栋</th>
                    <th>楼层</th>
                    <th>设备编号</th>
                    <th>全网编号</th>
                    <th>开关</th>
                    <th>功率配置</th>
                    <th>频段配置</th>
                    <th>工作时间配置</th>
                    <th />
                  </tr>
                </thead>
                <tbody>{renderRows()}</tbody>
              </table>
            </div>
            <div className={styles.backBar}>
              <Button onClick={() => history.back()}>返回</Button>
            </div>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default ProvinceMachinePage;
