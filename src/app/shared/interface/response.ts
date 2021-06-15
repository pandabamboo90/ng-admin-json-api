import { IResponseMeta } from '@shared';

export interface IResponse<T> {
  data: T[];
  meta: IResponseMeta;
}

export interface IResponseNoMeta<T> {
  data: T | T[];
}
