import {
  ApartmentOutlined,
  CrownOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Card, Typography } from 'antd';
import React from 'react';
import styles from './index.less';

const { Paragraph, Title } = Typography;

const cards = [
  {
    key: 'super-admin',
    title: '超级管理员',
    description: '系统级用户与权限管理',
    icon: <CrownOutlined />,
  },
  {
    key: 'province-admin',
    title: '省级管理员',
    description: '省级范围内用户与权限管理',
    icon: <ApartmentOutlined />,
  },
  {
    key: 'prison-admin',
    title: '监狱管理员',
    description: '监狱范围内用户与权限管理',
    icon: <HomeOutlined />,
  },
];

const AccountPage: React.FC = () => {
  return (
    <PageContainer title="用户管理">
      <div className={styles.layout}>
        <div className={styles.media}>
          <img
            className={styles.image}
            src="/logo.png"
            alt="用户管理"
            loading="lazy"
          />
        </div>
        <div className={styles.cards}>
          {cards.map((item) => (
            <Card
              key={item.key}
              hoverable
              className={styles.card}
              onClick={() => history.push(`/account/${item.key}`)}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardIcon}>{item.icon}</div>
                <div className={styles.cardText}>
                  <Title level={4} className={styles.cardTitle}>
                    {item.title}
                  </Title>
                  <Paragraph type="secondary" className={styles.cardDesc}>
                    {item.description}
                  </Paragraph>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

export default AccountPage;
