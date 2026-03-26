export type ResultData<T> = {
  code?: string;
  data?: T;
  msg?: string;
};

export type ProvinceAdminPageParams = {
  pageNum: number;
  pageSize: number;
  provinceId?: number | string;
  username?: string;
  nickname?: string;
};

export type ProvinceAdminVO = {
  id?: number | string;
  username?: string;
  nickname?: string;
  area?: string;
  manageArea?: string;
  manageAreas?: string[];
};

export type DataTProvinceAdminVO = {
  list?: ProvinceAdminVO[];
  total?: number;
};

export type PageResultTProvinceAdminVO = {
  code?: string;
  data?: DataTProvinceAdminVO;
  msg?: string;
};
