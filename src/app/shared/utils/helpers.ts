import {
  BaseUrl,
  CurrencyUrl,
  DetailUrl,
  Entity,
  FormError,
  IEndpoint,
  IndexedType,
  ListUrl,
  PermissionUrl,
  RoleUrl,
  TenantUrl,
  TicketUrl,
  TransactionUrl,
  UserUrl,
} from '@shared';
import { entries as _entries } from 'lodash-es';

export const generateUrl = <T extends Entity>(endpoint: string): IEndpoint<T> => ({
  base: `${ endpoint }` as BaseUrl<T>,
  list: `${ endpoint }/list` as ListUrl<T>,
  users: `${ endpoint }/users` as UserUrl<T>,
  roles: `${ endpoint }/roles` as RoleUrl<T>,
  detail: `${ endpoint }/admins` as DetailUrl<T>,
  tenants: `${ endpoint }/tenants` as TenantUrl<T>,
  tickets: `${ endpoint }/tickets` as TicketUrl<T>,
  currencies: `${ endpoint }/currencies` as CurrencyUrl<T>,
  permissions: `${ endpoint }/permissions` as PermissionUrl<T>,
  transactions: `${ endpoint }/transactions` as TransactionUrl<T>,
});

export function parseError(errors: FormError = {}): string {
  let result = '';

  _entries(errors).forEach(
    ([key, value]: any) => result += `${ key }: ${ value[0]?.detail || value[0] } </br>`,
  );

  return result;
}

export const pickFrom = <T extends IndexedType, K extends keyof T>(obj: T, keys: K[]): Partial<T> => {
  if (!keys) {
    return obj;
  }

  return keys
    .filter(key => key in obj)
    .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
};
