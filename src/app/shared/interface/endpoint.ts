import { Entity, IndexedType } from '@shared';

export type BaseUrl<T extends Entity> = `/${ T }`;
export type ListUrl<T extends Entity> = `/${ T }/list`;
export type UserUrl<T extends Entity> = `/${ T }/users`;
export type RoleUrl<T extends Entity> = `/${ T }/roles`;
export type DetailUrl<T extends Entity> = `/${ T }/${ T }s`;
export type TenantUrl<T extends Entity> = `/${ T }/tenants`;
export type TicketUrl<T extends Entity> = `/${ T }/tickets`;
export type CurrencyUrl<T extends Entity> = `/${ T }/currencies`;
export type PermissionUrl<T extends Entity> = `/${ T }/permissions`;
export type TransactionUrl<T extends Entity> = `/${ T }/transactions`;

export interface IEndpoint<T extends Entity> extends IndexedType {
  base: BaseUrl<T>;
  list?: ListUrl<T>;
  users?: UserUrl<T>;
  roles?: RoleUrl<T>;
  detail?: DetailUrl<T>;
  tickets?: TicketUrl<T>;
  tenants?: TenantUrl<T>;
  currencies?: CurrencyUrl<T>;
  permissions?: PermissionUrl<T>;
  transactions?: TransactionUrl<T>;
}
