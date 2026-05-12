import { FileTextOutlined, GlobalOutlined, LogoutOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { getLocale, history, setLocale, useIntl } from '@umijs/max';
import { Button, Dropdown } from 'antd';
import React from 'react';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

const isDev = process.env.NODE_ENV === 'development' || process.env.CI;

const NAV_TABS = [
  { path: '/region', labelId: 'app.topNav.region' },
  { path: '/account', labelId: 'app.topNav.account' },
  { path: '/machine', labelId: 'app.topNav.machine' },
  { path: '/alarm', labelId: 'app.topNav.alarm' },
  { path: '/data', labelId: 'app.topNav.data' },
  { path: '/log', labelId: 'app.topNav.log' },
];

const LANGUAGE_LABEL_IDS: Record<string, string> = {
  'zh-CN': 'app.language.zhCN',
  'en-US': 'app.language.enUS',
  'ar-SA': 'app.language.arSA',
};

const getActiveNavPath = (pathname: string) => {
  return (
    NAV_TABS.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))?.path ??
    '/region'
  );
};

const CustomTopNav: React.FC = () => {
  const intl = useIntl();
  const activePath = getActiveNavPath(history.location.pathname);
  const currentLanguageLabelId = LANGUAGE_LABEL_IDS[getLocale()];

  return (
    <div className="custom-top-nav">
      <div className="custom-top-nav__header">
        <button
          className="custom-top-nav__brand"
          onClick={() => history.push('/region')}
          type="button"
        >
          <img alt="logo" src="/logo.png" style={{ width: '40px', height: '40px' }} />
          <span>{intl.formatMessage({ id: 'app.brand' })}</span>
        </button>
        <div className="custom-top-nav__actions">
          <Dropdown
            menu={{
              items: [
                { key: 'zh-CN', label: intl.formatMessage({ id: 'app.language.zhCN' }) },
                { key: 'en-US', label: intl.formatMessage({ id: 'app.language.enUS' }) },
                { key: 'ar-SA', label: intl.formatMessage({ id: 'app.language.arSA' }) },
              ],
              onClick: ({ key }) => setLocale(key),
            }}
            trigger={['click']}
          >
            <Button icon={<GlobalOutlined />}>
              {currentLanguageLabelId
                ? intl.formatMessage({ id: currentLanguageLabelId })
                : intl.formatMessage({ id: 'app.language.default' })}
            </Button>
          </Dropdown>
          <Button type="primary" icon={<FileTextOutlined />} onClick={() => history.push('/data')}>
            {intl.formatMessage({ id: 'app.action.report' })}
          </Button>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={() => {
              localStorage.removeItem('accessToken');
              history.replace('/login');
            }}
          >
            {intl.formatMessage({ id: 'app.action.logout' })}
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
            {intl.formatMessage({ id: item.labelId })}
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

// ProLayout APIs: https://procomponents.ant.design/components/layout
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
    // Custom 403 page
    // unAccessible: <div>unAccessible</div>,
    // Add a loading state
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
 * @name request config, including error handling.
 * It provides unified network request and error handling based on axios and ahooks useRequest.
 * @doc https://umijs.org/docs/max/request#config
 */
export const request: RequestConfig = {
  ...errorConfig,
};
