import {
  FileTextOutlined,
  GlobalOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import {
  getLocale,
  history,
  setLocale,
} from '@umijs/max';
import {
  Button,
  Dropdown,
} from 'antd';
import React from 'react';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

const isDev = process.env.NODE_ENV === 'development' || process.env.CI;

const NAV_TABS = [
  { path: '/region', label: '省份' },
  { path: '/account', label: '用户管理' },
  { path: '/machine', label: '设备管理' },
  { path: '/alarm', label: '告警' },
  { path: '/data', label: '数据统计' },
  { path: '/log', label: '日志' },
];

const LANGUAGE_MAP: Record<string, string> = {
  'zh-CN': '中文',
  'en-US': 'English',
  'ar-SA': 'العربية',
};

const getActiveNavPath = (pathname: string) => {
  return (
    NAV_TABS.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))?.path ?? '/region'
  );
};

const CustomTopNav: React.FC = () => {
  const activePath = getActiveNavPath(history.location.pathname);

  return (
    <div className="custom-top-nav">
      <div className="custom-top-nav__header">
        <button className="custom-top-nav__brand" onClick={() => history.push('/region')} type="button">
          <img alt="logo" src="/logo.png" style={{ width: '40px', height: '40px' }} />
          <span>Srill Jamming Management System</span>
        </button>
        <div className="custom-top-nav__actions">
          <Dropdown
            menu={{
              items: [
                { key: 'zh-CN', label: '中文' },
                { key: 'en-US', label: 'English' },
                { key: 'ar-SA', label: 'العربية' },
              ],
              onClick: ({ key }) => setLocale(key),
            }}
            trigger={['click']}
          >
            <Button icon={<GlobalOutlined />}>
              {LANGUAGE_MAP[getLocale()] ?? 'Language'}
            </Button>
          </Dropdown>
          <Button type="primary" icon={<FileTextOutlined />} onClick={() => history.push('/data')}>
            Report
          </Button>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={() => {
              localStorage.removeItem('accessToken');
              history.replace('/login');
            }}
          >
            log out
          </Button>
        </div>
      </div>
      <div className="custom-top-nav__tabs">
        {NAV_TABS.map((item) => (
          <button
            key={item.path}
            className={item.path === activePath ? 'is-active' : undefined}
            onClick={() => history.push(item.path)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
}> {
  return {
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的 api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: false,
    avatarProps: undefined,
    onPageChange: () => {
      const { location } = history;
      if (location.pathname === '/') {
        history.replace('/region');
      }
    },
    fixedHeader: false,
    contentWidth: 'Fluid',
    bgLayoutImgList: [],
    links: [],
    menuRender: false,
    menuHeaderRender: false,
    headerTitleRender: false,
    headerRender: () => <CustomTopNav />,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  baseURL: 'http://8.136.16.12:7680',
  ...errorConfig,
};
