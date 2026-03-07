import { FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import { history, useLocation } from '@umijs/max';
import { Button } from 'antd';
import React from 'react';
import { globalShellConfig } from '@/config/globalShell';
import './index.less';

const GlobalShell: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="globalShell">
      <div className="globalShellTopBar">
        <div className="globalShellBrand">
          <div className="globalShellLogo">{globalShellConfig.brand.logoText}</div>
          <h1>{globalShellConfig.brand.title}</h1>
        </div>
        <div className="globalShellActions">
          <Button type="primary" icon={<FileTextOutlined />}>
            {globalShellConfig.actions.reportText}
          </Button>
          <Button type="primary" icon={<LogoutOutlined />} onClick={() => history.push('/user/login')}>
            {globalShellConfig.actions.logoutText}
          </Button>
        </div>
      </div>

      <div className="globalShellTabs">
        {globalShellConfig.tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <button
              key={tab.key}
              type="button"
              className={active ? 'globalShellTab globalShellTabActive' : 'globalShellTab'}
              onClick={() => history.push(tab.path)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalShell;
