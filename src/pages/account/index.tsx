import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import { Button, Col, Row } from 'antd';
import React from 'react';
import gb from '@/assets/gb.png';
import styles from './index.less';

type AccountCard = {
  key: string;
  titleId: string;
  defaultTitle: string;
  colorClass: string;
};

const cards: AccountCard[] = [
  {
    key: 'super-admin',
    titleId: 'pages.account.role.superAdmin',
    defaultTitle: 'Super Admin',
    colorClass: styles.superAdmin,
  },
  {
    key: 'province-admin',
    titleId: 'pages.account.role.provinceAdmin',
    defaultTitle: 'Province Admin',
    colorClass: styles.provinceAdmin,
  },
  {
    key: 'prison-admin',
    titleId: 'pages.account.role.prisonAdmin',
    defaultTitle: 'Prison Admin',
    colorClass: styles.prisonAdmin,
  },
];

const AccountPage: React.FC = () => {
  const intl = useIntl();

  return (
    <PageContainer title={false}>
      <div style={{ background: '#fff', margin: '-8px -8px 0', minHeight: 'calc(100vh - 128px)' }}>
        <Row gutter={0}>
          <Col xs={24} xl={6} style={{ overflow: 'hidden' }}>
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
              {/*<Button style={{ position: 'absolute', top: 12, right: 12 }}>*/}
              {/*  {intl.formatMessage({*/}
              {/*    id: 'pages.account.action.edit',*/}
              {/*    defaultMessage: 'Edit',*/}
              {/*  })}*/}
              {/*</Button>*/}
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
                  <span className={styles.cardTitle}>
                    {intl.formatMessage({
                      id: item.titleId,
                      defaultMessage: item.defaultTitle,
                    })}
                  </span>
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
