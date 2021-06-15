import { Currency, ICurrency, IUser, User } from '@shared';
import { Expose, Type } from 'class-transformer';

export interface ITenant {
  id: number;
  display_name: string;
  allow_to_update: boolean;
  allow_to_destroy: boolean;
  deleted_at: string;
  created_at: string;
  updated_at: string;
  admins: IUser[];
  currency: ICurrency;
}

export class Tenant {
  @Expose()
  id!: number;
  @Expose()
  display_name!: string;
  @Expose()
  allow_to_update!: boolean;
  @Expose()
  allow_to_destroy!: boolean;
  @Expose()
  deleted_at!: string;
  @Expose()
  created_at!: string;
  @Expose()
  updated_at!: string;
  @Expose()
  @Type(() => User)
  admins!: User[];
  @Expose()
  @Type(() => Currency)
  currency!: Currency;
}
