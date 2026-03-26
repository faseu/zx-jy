import { request } from '@umijs/max';
import type {
  DataTProvinceAdminVO,
  PageResultTProvinceAdminVO,
  ProvinceAdminPageParams,
  ResultData,
} from './data.d';

const wrapResult = <T>(result: T | ResultData<T>): ResultData<T> => {
  if (result && typeof result === 'object' && 'data' in result) {
    return result as ResultData<T>;
  }

  return { data: result as T };
};

export async function queryProvinceAdminPage(
  params: ProvinceAdminPageParams,
  options?: { [key: string]: any },
): Promise<ResultData<DataTProvinceAdminVO>> {
  const result = await request<PageResultTProvinceAdminVO | DataTProvinceAdminVO>(
    '/api/v1/users/page/province',
    {
      method: 'GET',
      params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...(options || {}),
    },
  );

  return wrapResult<DataTProvinceAdminVO>(result as PageResultTProvinceAdminVO | DataTProvinceAdminVO);
}
