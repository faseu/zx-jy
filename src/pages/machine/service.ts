import { request } from '@umijs/max';
import type {
  BuildingDevicePageParams,
  BuildingTreeVO,
  PrisonDevicePageParams,
  PrisonTreeVO,
  ProvinceDevicePageParams,
  ProvinceTreeVO,
  ResultData,
} from './data.d';

const wrapResult = <T>(result: T | ResultData<T>): ResultData<T> => {
  if (result && typeof result === 'object' && 'data' in result) {
    return result as ResultData<T>;
  }

  return { data: result as T };
};

export async function queryProvinceDevicePage(
  params: ProvinceDevicePageParams,
  options?: { [key: string]: any },
): Promise<ResultData<ProvinceTreeVO>> {
  const result = await request<ProvinceTreeVO | ResultData<ProvinceTreeVO>>(
    '/api/v1/device/page/province',
    {
      method: 'GET',
      params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...(options || {}),
    },
  );

  return wrapResult<ProvinceTreeVO>(result);
}

export async function queryPrisonDevicePage(
  params: PrisonDevicePageParams,
  options?: { [key: string]: any },
): Promise<ResultData<PrisonTreeVO>> {
  const result = await request<PrisonTreeVO | ResultData<PrisonTreeVO>>(
    '/api/v1/device/page/prison',
    {
      method: 'GET',
      params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...(options || {}),
    },
  );

  return wrapResult<PrisonTreeVO>(result);
}

export async function queryBuildingDevicePage(
  params: BuildingDevicePageParams,
  options?: { [key: string]: any },
): Promise<ResultData<BuildingTreeVO>> {
  const result = await request<BuildingTreeVO | ResultData<BuildingTreeVO>>(
    '/api/v1/device/page/building',
    {
      method: 'GET',
      params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...(options || {}),
    },
  );

  return wrapResult<BuildingTreeVO>(result);
}
