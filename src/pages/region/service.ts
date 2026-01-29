import { request } from '@umijs/max';
import type {
  BuildingDetailVO,
  BuildingInfoVO,
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
