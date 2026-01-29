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

export type PrisonInfoVO = {
  id?: number;
  name?: string;
  buildingNum?: number;
  totalDevices?: number;
  onlineDevices?: number;
  offlineDevices?: number;
  totalAlarms?: number;
};

export type BuildingDetailVO = {
  id?: number;
  name?: string;
  floorNum?: number;
  totalDevices?: number;
};

export type BuildingInfoVO = {
  id?: number;
  name?: string;
  floorNum?: number;
  totalDevices?: number;
  onlineDevices?: number;
  offlineDevices?: number;
  totalAlarms?: number;
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

export type ResultPrisonInfoVO = {
  code?: string;
  data?: PrisonInfoVO;
  msg?: string;
};

export type ResultListBuildingDetailVO = {
  code?: string;
  data?: BuildingDetailVO[];
  msg?: string;
};

export type ResultObject = {
  code?: string;
  msg?: string;
};
