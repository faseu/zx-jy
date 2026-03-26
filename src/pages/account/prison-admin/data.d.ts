export type ResultData<T> = {
  code?: string;
  data?: T;
  msg?: string;
};

export type PrisonAdminPageParams = {
  pageNum: number;
  pageSize: number;
  provinceId?: number | string;
  prisonId?: number | string;
  username?: string;
  nickname?: string;
};

export type PrisonAdminVO = {
  id?: number | string;
  username?: string;
  nickname?: string;
  area?: string;
  manageArea?: string;
  manageAreas?: string[];
};

export type DataTPrisonAdminVO = {
  list?: PrisonAdminVO[];
  total?: number;
};

export type PageResultTPrisonAdminVO = {
  code?: string;
  data?: DataTPrisonAdminVO;
  msg?: string;
};
