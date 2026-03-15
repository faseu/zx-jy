import { request } from '@umijs/max';
import type {
  BuildingDetailVO,
  BuildingInfoVO,
  PrisonFormVO,
  PrisonVO,
  PrisonInfoVO,
  ProvinceDetailVO,
  ResultListProvinceVO,
} from './data.d';

export async function queryProvinceList(options?: { [key: string]: any }) {
  return request<ResultListProvinceVO>('/api/v1/province', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...(options || {}),
  });
}

export async function queryProvinceDetail(
  provinceId: number | string,
  options?: { [key: string]: any },
) {
  return request<ProvinceDetailVO>(`/api/v1/province/${provinceId}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function queryProvincePrisons(
  provinceId: number | string,
  options?: { [key: string]: any },
) {
  return request<PrisonVO[]>(`/api/v1/province/prisons/${provinceId}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createPrison(
  data: Record<string, any>,
  options?: { [key: string]: any },
) {
  return request('/api/v1/prison', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function queryPrisonForm(
  prisonId: number | string,
  options?: { [key: string]: any },
) {
  return request<PrisonFormVO>(`/api/v1/prison/${prisonId}/form`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updatePrison(
  prisonId: number | string,
  data: PrisonFormVO,
  options?: { [key: string]: any },
) {
  return request(`/api/v1/prison/${prisonId}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function queryPrisonInfo(
  prisonId: number | string,
  options?: { [key: string]: any },
) {
  return request<PrisonInfoVO>(`/api/v1/prison/info/${prisonId}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function queryPrisonBuildings(
  prisonId: number | string,
  options?: { [key: string]: any },
) {
  return request<BuildingDetailVO[]>(`/api/v1/prison/buidings/${prisonId}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function queryBuildingInfo(
  buildingId: number | string,
  options?: { [key: string]: any },
) {
  return request<BuildingInfoVO>(`/api/v1/building/info/${buildingId}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function queryBuildingFloors(
  buildingId: number | string,
  options?: { [key: string]: any },
) {
  return request<
    Array<{
      id: number;
      floorName: string;
      floorNo: number;
      floorDrawing?: string;
    }>
  >(`/api/v1/building/floor/${buildingId}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function queryBuildingFloorForm(
  floorId: number | string,
  options?: { [key: string]: any },
) {
  return request<{
    id: number;
    floorName: string;
    floorNo: number;
    buildingId: number;
    buildingName: string;
    deviceNumber: number;
    floorDrawing?: string;
  }>(`/api/v1/floor/${floorId}/form`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createBuilding(
  data: { name: string; prisonId: number },
  options?: { [key: string]: any },
) {
  return request('/api/v1/building', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function createFloor(
  data: {
    floorNo: number;
    floorName: string;
    buildingId: number;
    deviceNumber?: number;
    floorDrawing?: string;
  },
  options?: { [key: string]: any },
) {
  return request('/api/v1/floor', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function queryFloorDevicePage(
  params: {
    floorId: number | string;
    pageNum: number;
    pageSize: number;
    name?: string;
  },
  options?: { [key: string]: any },
) {
  return request('/api/v1/device/page/floor', {
    method: 'GET',
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...(options || {}),
  });
}

export async function updateFloorDrawing(
  id: number | string,
  filePath: string,
  options?: { [key: string]: any },
) {
  return request(`/api/v1/floor/updateTFloorDraw/${id}`, {
    method: 'PUT',
    params: { filePath },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...(options || {}),
  });
}

export async function updateDeviceXY(
  id: number | string,
  positionX: string,
  positionY: string,
  options?: { [key: string]: any },
) {
  return request(`/api/v1/device/updateTDeviceXY/${id}`, {
    method: 'PUT',
    params: {positionX, positionY},
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...(options || {}),
  });
}

export async function createDevice(
  data: {
    deviceNo: string;
    deviceName: string;
    entireNo: string;
    floorId?: number;
    buildingId?: number;
    prisonId?: number;
    powerOff?: number;
    ipAddress?: string;
    port?: number;
    startTime?: string;
    endTime?: string;
    ch1?: string;
    ch2?: string;
    ch3?: string;
    ch4?: string;
    ch5?: string;
    ch6?: string;
    ch7?: string;
    ch8?: string;
    ch9?: string;
    ch10?: string;
    ch11?: string;
    ch12?: string;
    ch13?: string;
    ch14?: string;
    ch15?: string;
    ch16?: string;
    ch17?: string;
    ch18?: string;
  },
  options?: { [key: string]: any },
) {
  return request('/api/v1/device', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}
