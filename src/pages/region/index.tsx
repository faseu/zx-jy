import { PageContainer } from '@ant-design/pro-components';
import { history, useRequest } from '@umijs/max';
import { Table, Typography } from 'antd';
import React from 'react';
import saudiMap from '@/assets/saudi-map.png';
import type { ProvinceVO } from './data.d';
import { queryProvinceList } from './service';

const { Paragraph, Title } = Typography;

const RegionPage: React.FC = () => {
  const { data, loading } = useRequest(queryProvinceList);

  return (
    <PageContainer>
      <Title level={3}>地区列表</Title>
      <Paragraph type="secondary">点击省份查看详情。</Paragraph>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Table<ProvinceVO>
            rowKey={(record) => record.provinceId ?? record.provinceName ?? ''}
            loading={loading}
            dataSource={data ?? []}
            columns={[
              {
                title: '省份名称',
                dataIndex: 'provinceName',
              },
              {
                title: '总监狱数量',
                dataIndex: 'totalPrisons',
              },
              {
                title: '总干扰机数量',
                dataIndex: 'totalDevices',
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
        <div style={{ width: 400, maxWidth: '40%', minWidth: 240 }}>
          <img
            src={saudiMap}
            alt="Saudi Arabia map"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default RegionPage;
