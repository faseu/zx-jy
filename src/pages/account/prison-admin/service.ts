import { request } from '@umijs/max';
import type {
  DataTPrisonAdminVO,
  PageResultTPrisonAdminVO,
  PrisonAdminPageParams,
  ResultData,
} from './data.d';

const wrapResult = <T>(result: T | ResultData<T>): ResultData<T> => {
  if (result && typeof result === 'object' && 'data' in result) {
    return result as ResultData<T>;
  }

  return { data: result as T };
};

export async function queryPrisonAdminPage(
  params: PrisonAdminPageParams,
  options?: { [key: string]: any },
): Promise<ResultData<DataTPrisonAdminVO>> {
  const result = await request<PageResultTPrisonAdminVO | DataTPrisonAdminVO>(
    '/api/v1/users/page/Prison',
    {
      method: 'GET',
      params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...(options || {}),
    },
  );

  return wrapResult<DataTPrisonAdminVO>(result as PageResultTPrisonAdminVO | DataTPrisonAdminVO);
}
