import { history, useRequest } from '@umijs/max';
import { Table, message } from 'antd';
import React from 'react';
import SaudiMap from '@/components/SaudiMap';
import type { ProvinceVO } from './data.d';
import { queryProvinceList } from './service';
import './index.less';

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
    <div className="regionPage">
      <div className="regionMain">
        <div className="regionTableWrap">
          <Table<ProvinceVO>
            className="regionDataTable"
            rowKey={(record) => record.provinceId ?? record.provinceName ?? ''}
            loading={loading}
            dataSource={data ?? []}
            columns={[
              { title: '省', dataIndex: 'provinceName', align: 'center' },
              { title: '总监狱', dataIndex: 'totalPrisons', align: 'center' },
              { title: '总干扰机', dataIndex: 'totalDevices', align: 'center' },
            ]}
            pagination={false}
            scroll={{ y: 620 }}
            onRow={(record) => ({
              onClick: () => {
                if (record.provinceId !== undefined && record.provinceId !== null) {
                  history.push(`/region/province/${record.provinceId}`);
                }
              },
              className:
                record.provinceId !== undefined && record.provinceId !== null
                  ? 'regionTableRowClickable'
                  : '',
            })}
          />
        </div>

        <div className="regionMapWrap">
          <SaudiMap height={720} onProvinceClick={handleProvinceClick} />
        </div>
      </div>
    </div>
  );
};

export default RegionPage;
