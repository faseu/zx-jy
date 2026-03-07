export type GlobalNavTab = {
  key: string;
  label: string;
  path: string;
  match: (pathname: string) => boolean;
};

export type GlobalShellConfig = {
  brand: {
    logoText: string;
    title: string;
  };
  actions: {
    reportText: string;
    logoutText: string;
  };
  tabs: GlobalNavTab[];
};

export const globalShellConfig: GlobalShellConfig = {
  brand: {
    logoText: 'S',
    title: 'Srill Jamming Management System',
  },
  actions: {
    reportText: 'Report',
    logoutText: 'log out',
  },
  tabs: [
    {
      key: 'region',
      label: '省份',
      path: '/region',
      match: (pathname) => pathname.startsWith('/region'),
    },
    {
      key: 'account',
      label: '用户管理',
      path: '/account',
      match: (pathname) => pathname.startsWith('/account'),
    },
    {
      key: 'machine',
      label: '设备管理',
      path: '/machine',
      match: (pathname) => pathname.startsWith('/machine'),
    },
    {
      key: 'alarm',
      label: '告警',
      path: '/alarm',
      match: (pathname) => pathname.startsWith('/alarm'),
    },
    {
      key: 'data',
      label: '数据统计',
      path: '/data',
      match: (pathname) => pathname.startsWith('/data'),
    },
    {
      key: 'log',
      label: '日志',
      path: '/log',
      match: (pathname) => pathname.startsWith('/log'),
    },
  ],
};
