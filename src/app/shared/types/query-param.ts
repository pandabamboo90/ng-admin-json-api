import { IndexedType } from '@shared';

export type SortParam<T> = (`${ string & keyof T }` | `-${ string & keyof T }`) | '';

export type FilterParam<T> = { [key in `filter[${ string & keyof T }]`]?: string } & IndexedType;

export type QueryParam<T> = {
  'page[size]'?: number | 'all';
  'page[number]'?: number;
  sort?: SortParam<T>;
} & Partial<FilterParam<T>>;
