import { request } from '@umijs/max';
import type { AlarmPageParams, DataTAlarmVO, PageResultTAlarmVO, ResultData } from './data.d';

const wrapResult = <T>(result: T | ResultData<T>): ResultData<T> => {
  if (result && typeof result === 'object' && 'data' in result) {
    return result as ResultData<T>;
  }

  return { data: result as T };
};

export async function queryAlarmPage(
  params: AlarmPageParams,
  options?: { [key: string]: any },
): Promise<ResultData<DataTAlarmVO>> {
  const result = await request<PageResultTAlarmVO | DataTAlarmVO>('/api/v1/alarm/page', {
    method: 'GET',
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...(options || {}),
  });

  return wrapResult<DataTAlarmVO>(result as PageResultTAlarmVO | DataTAlarmVO);
}
