export type ResultData<T> = {
  code?: string;
  data?: T;
  msg?: string;
};

export type AdminPageParams = {
  pageNum: number;
  pageSize: number;
  username?: string;
  nickname?: string;
};

export type SuperAdminVO = {
  id?: number | string;
  username?: string;
  nickname?: string;
  area?: string;
  manageArea?: string;
  manageAreas?: string[];
};

export type DataTSuperAdminVO = {
  list?: SuperAdminVO[];
  total?: number;
};

export type PageResultTSuperAdminVO = {
  code?: string;
  data?: DataTSuperAdminVO;
  msg?: string;
};
