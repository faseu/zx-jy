import { PageContainer } from '@ant-design/pro-components';
import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Col, Row, Tree } from 'antd';
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
            title: 'AAA监狱',
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

const toolbarButtons = ['添加设备', '批量添加', '修改', '删除', '管理', '查找'];

const machineCards = [
  'Riyadh',
  'Mecca',
  'Medina',
  'Buraydah',
  'Riyadh',
  'Mecca',
  'Medina',
  'Buraydah',
  'Riyadh',
  'Mecca',
  'Medina',
  'Buraydah',
  'Riyadh',
  'Mecca',
  'Medina',
];

const MachinePage: React.FC = () => {
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
            </div>
            <div className={styles.machineGrid}>
              {machineCards.map((name, index) => (
                <div key={`${name}-${index}`} className={styles.machineCard}>
                  {name}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default MachinePage;
