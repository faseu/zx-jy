import { request } from '@umijs/max';
import type { AdminPageParams, DataTSuperAdminVO, PageResultTSuperAdminVO, ResultData } from './data.d';

const wrapResult = <T>(result: T | ResultData<T>): ResultData<T> => {
  if (result && typeof result === 'object' && 'data' in result) {
    return result as ResultData<T>;
  }

  return { data: result as T };
};

export async function queryAdminPage(
  params: AdminPageParams,
  options?: { [key: string]: any },
): Promise<ResultData<DataTSuperAdminVO>> {
  const result = await request<PageResultTSuperAdminVO | DataTSuperAdminVO>(
    '/api/v1/users/page/admin',
    {
      method: 'GET',
      params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...(options || {}),
    },
  );

  return wrapResult<DataTSuperAdminVO>(result as PageResultTSuperAdminVO | DataTSuperAdminVO);
}
