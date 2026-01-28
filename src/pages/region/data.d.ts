export type ProvinceVO = {
  provinceId?: number;
  provinceName?: string;
  totalPrisons?: number;
  totalDevices?: number;
};

export type ProvinceDetailVO = {
  provinceId?: number;
  provinceName?: string;
  totalPrisons?: number;
  totalDevices?: number;
  onlineDevices?: number;
  offlineDevices?: number;
  totalAlarms?: number;
};

export type PrisonVO = {
  id?: number;
  name?: string;
  buildingNum?: number;
  totalDevices?: number;
};

export type ResultListProvinceVO = {
  code?: string;
  data?: ProvinceVO[];
  msg?: string;
};

export type ResultProvinceDetailVO = {
  code?: string;
  data?: ProvinceDetailVO;
  msg?: string;
};

export type ResultListPrisonVO = {
  code?: string;
  data?: PrisonVO[];
  msg?: string;
};

export type ResultObject = {
  code?: string;
  msg?: string;
};
