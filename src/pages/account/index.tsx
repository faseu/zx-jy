import {PageContainer} from '@ant-design/pro-components';
import {history} from '@umijs/max';
import {Button, Col, Row} from 'antd';
import React from 'react';
import gb from '@/assets/gb.png';
import styles from './index.less';

type AccountCard = {
  key: string;
  title: string;
  colorClass: string;
};

const cards: AccountCard[] = [
  {
    key: 'super-admin',
    title: '超级管理员',
    colorClass: styles.superAdmin,
  },
  {
    key: 'province-admin',
    title: '省级管理员',
    colorClass: styles.provinceAdmin,
  },
  {
    key: 'prison-admin',
    title: '监狱管理员',
    colorClass: styles.prisonAdmin,
  },
];

const AccountPage: React.FC = () => {
  return (
    <PageContainer title={false}>
      <div style={{background: '#fff', margin: '-8px -8px 0', minHeight: 'calc(100vh - 128px)'}}>
        <Row gutter={0}>
          <Col xs={24} xl={6} style={{overflow: 'hidden'}}>
            <div
              style={{
                position: 'relative',
                height: 'calc(100vh - 128px)',
                backgroundImage: `url(${gb})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button style={{position: 'absolute', top: 12, right: 12}}>编辑</Button>
            </div>
          </Col>

          <Col xs={24} xl={18} className={styles.rightPane}>
            <div className={styles.cards}>
              {cards.map((item) => (
                <div
                  key={item.key}
                  className={`${styles.card} ${item.colorClass}`}
                  onClick={() => history.push(`/account/${item.key}`)}
                >
                  <span className={styles.cardTitle}>{item.title}</span>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default AccountPage;
