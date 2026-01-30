import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import React from 'react';
import {
  Footer,
  Question,
  SelectLang,
} from '@/components';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

const isDev =
  process.env.NODE_ENV === 'development' || process.env.CI;

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

// ProLayout 鏀寔鐨刟pi https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    actionsRender: () => [
      <Question key="doc" />,
      <SelectLang key="SelectLang" />,
    ],
    avatarProps: undefined,
    onPageChange: () => {
      const { location } = history;
      if (location.pathname === '/') {
        history.replace('/region');
      }
    },
    bgLayoutImgList: [

    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 鑷畾涔?403 椤甸潰
    // unAccessible: <div>unAccessible</div>,
    // 澧炲姞涓€涓?loading 鐨勭姸鎬?
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
 * @name request 閰嶇疆锛屽彲浠ラ厤缃敊璇鐞?
 * 瀹冨熀浜?axios 鍜?ahooks 鐨?useRequest 鎻愪緵浜嗕竴濂楃粺涓€鐨勭綉缁滆姹傚拰閿欒澶勭悊鏂规銆?
 * @doc https://umijs.org/docs/max/request#閰嶇疆
 */
export const request: RequestConfig = {
  baseURL: 'http://47.84.22.103:8990',
  ...errorConfig,
};



