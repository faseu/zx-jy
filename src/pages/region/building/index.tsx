import { PageContainer } from '@ant-design/pro-components';
import { useParams, useRequest } from '@umijs/max';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import React from 'react';
import type { BuildingInfoVO } from '../data.d';
import { queryBuildingInfo } from '../service';

const { Paragraph, Title } = Typography;

const BuildingDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const buildingId = params.id ?? '';
  const { data: detailData, loading: detailLoading } = useRequest(
    () => queryBuildingInfo(buildingId),
    {
      ready: Boolean(buildingId),
      refreshDeps: [buildingId],
    },
  );
  const detail: BuildingInfoVO | undefined = detailData;

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={7}>
          <Card
            loading={detailLoading}
            bodyStyle={{
              padding: 0,
              height: 420,
              display: 'flex',
              alignItems: 'flex-end',
              backgroundImage:
                "linear-gradient(160deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55)), url('/logo.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                padding: '18px 20px',
                color: '#fff',
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.55))',
              }}
            >
              <Title level={3} style={{ color: '#fff', marginBottom: 4 }}>
                {detail?.name || '楼宇'}
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                楼宇概览
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={17}>
          <Card loading={detailLoading}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Statistic title="楼层" value={detail?.floorNum ?? 0} />
              <Statistic title="设备" value={detail?.totalDevices ?? 0} />
              <Statistic title="在线" value={detail?.onlineDevices ?? 0} />
              <Statistic title="离线" value={detail?.offlineDevices ?? 0} />
              <Statistic title="告警" value={detail?.totalAlarms ?? 0} />
            </div>
          </Card>
          <Card style={{ marginTop: 16, minHeight: 260 }} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default BuildingDetailPage;
