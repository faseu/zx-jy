export type ResultData<T> = {
  code?: string;
  data?: T;
  msg?: string;
};

export type AlarmPageParams = {
  pageNum: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  deviceName?: string;
  type?: string;
  processingStatus?: number;
  blocked?: number;
};

export type AlarmVO = {
  id?: number;
  entireNo?: string;
  deviceId?: number;
  deviceName?: string;
  prisonId?: number;
  prisonName?: string;
  content?: string;
  type?: string;
  alarmTime?: string;
  suggestions?: string;
  processingStatus?: number;
  resolutionTime?: string;
  blocked?: number;
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  isDeleted?: number;
};

export type DataTAlarmVO = {
  list?: AlarmVO[];
  total?: number;
};

export type PageResultTAlarmVO = {
  code?: string;
  data?: DataTAlarmVO;
  msg?: string;
};
