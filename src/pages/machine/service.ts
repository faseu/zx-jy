import { request } from '@umijs/max';
import type { ProvinceDevicePageParams, ProvinceTreeVO, ResultData } from './data.d';

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
