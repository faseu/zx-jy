import { PageContainer } from '@ant-design/pro-components';
import { history, useRequest } from '@umijs/max';
import { Button, Col, Row } from 'antd';
import React from 'react';
import OrgTree from '@/components/OrgTree';
import type { OrgTreeSelectionParams } from '@/components/OrgTree';
import type { ProvinceVO } from '../region/data.d';
import { queryProvinceList } from '../region/service';
import styles from './index.less';

const toolbarButtons = ['添加设备', '批量添加', '修改', '删除', '管理', '查找'];

type ProvinceCard = {
  id: number | string;
  name: string;
};

const MachinePage: React.FC = () => {
  const { data, loading } = useRequest(queryProvinceList);
  const provinceList = (data ?? []) as ProvinceVO[];
  const [selectedNode, setSelectedNode] = React.useState<OrgTreeSelectionParams>({
    nodeType: 'country',
  });

  const machineCards = React.useMemo<ProvinceCard[]>(() => {
    if (selectedNode.nodeType === 'province' && selectedNode.provinceId !== undefined) {
      const currentProvince = provinceList.find(
        (item) => String(item.provinceId) === String(selectedNode.provinceId)
      );

      if (
        currentProvince?.provinceId === undefined ||
        currentProvince?.provinceId === null ||
        !currentProvince.provinceName
      ) {
        return [];
      }

      return [{ id: currentProvince.provinceId, name: currentProvince.provinceName }];
    }

    return provinceList
      .filter((item) => item.provinceId !== undefined && item.provinceName)
      .map((item) => ({
        id: item.provinceId as number | string,
        name: item.provinceName as string,
      }));
  }, [provinceList, selectedNode]);

  return (
    <PageContainer title={false}>
      <div className={styles.pageShell}>
        <Row gutter={0} className={styles.contentRow}>
          <Col xs={24} xl={6} className={styles.leftPane}>
            <OrgTree
              provinceList={provinceList}
              loading={loading}
              maxLevel={4}
              onSelectionChange={(params) => {
                setSelectedNode(params);
              }}
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
              {machineCards.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={styles.machineCard}
                  onClick={() =>
                    history.push(`/machine/province/${encodeURIComponent(String(item.id))}`)
                  }
                >
                  {item.name}
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
