export type ResultData<T> = {
  code?: string;
  data?: T;
  msg?: string;
};

export type ProvinceDevicePageParams = {
  provinceId: number | string;
  pageNum: number;
  pageSize: number;
  name?: string;
};

export type DeviceVO = {
  id?: number;
  deviceNo?: string;
  deviceName?: string;
  entireNo?: string;
};

export type FloorTreeVO = {
  floorId?: number;
  floorName?: string;
  deviceList?: DeviceVO[];
};

export type BuildingTreeVO = {
  buildingId?: number;
  buildingName?: string;
  floorList?: FloorTreeVO[];
};

export type PrisonTreeVO = {
  prisonId?: number;
  prisonName?: string;
  buildingList?: BuildingTreeVO[];
};

export type ProvinceTreeVO = {
  provinceId?: number;
  provinceName?: string;
  prisonList?: PrisonTreeVO[];
};
