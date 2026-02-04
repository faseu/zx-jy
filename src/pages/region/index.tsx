import { PageContainer } from '@ant-design/pro-components';
import { history, useRequest } from '@umijs/max';
import { Table, message } from 'antd';
import React from 'react';
import type { ProvinceVO } from './data.d';
import { queryProvinceList } from './service';
import SaudiMap from '@/components/SaudiMap';
const RegionPage: React.FC = () => {
  const { data, loading } = useRequest(queryProvinceList);

  const handleProvinceClick = (provinceName: string) => {
    if (!data || data.length === 0) {
      message.warning('省份数据加载中，请稍后再试');
      return;
    }

    const matched = data.find((item) => item.provinceName === provinceName);
    if (matched?.provinceId === undefined || matched?.provinceId === null) {
      message.warning(`未找到 ${provinceName} 的省份信息`);
      return;
    }

    history.push(`/region/province/${matched.provinceId}`);
  };

  return (
    <PageContainer title={false}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Table<ProvinceVO>
            rowKey={(record) => record.provinceId ?? record.provinceName ?? ''}
            loading={loading}
            dataSource={data ?? []}
            columns={[
              {
                title: '省份',
                dataIndex: 'provinceName',
                align: 'center'
              },
              {
                title: '总监狱',
                dataIndex: 'totalPrisons',
                align: 'center'
              },
              {
                title: '总干扰机',
                dataIndex: 'totalDevices',
                align: 'center'
              },
            ]}
            pagination={false}
            onRow={(record) => ({
              onClick: () => {
                if (
                  record.provinceId !== undefined &&
                  record.provinceId !== null
                ) {
                  history.push(`/region/province/${record.provinceId}`);
                }
              },
              style: {
                cursor:
                  record.provinceId !== undefined && record.provinceId !== null
                    ? 'pointer'
                    : 'default',
              },
            })}
          />
        </div>
        <div style={{ width: '60%', maxWidth: '60%', minWidth: 240 }}>
          <SaudiMap height={700} onProvinceClick={handleProvinceClick} />
        </div>
      </div>
    </PageContainer>
  );
};

export default RegionPage;
