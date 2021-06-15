import { IUser, User } from '@shared';
import { Expose, Type } from 'class-transformer';

export interface ITicket {
  id: number;
  creator: IUser;
  amount: number;
  status: string;
  message: string;
  cash_type: string;
  tenant_name: string;
  requested_by: string;
  allow_to_reject: boolean;
  allow_to_approve: boolean;
}

export class Ticket {
  @Expose()
  id!: number;
  @Expose()
  @Type(() => User)
  creator!: User;
  @Expose()
  amount!: number;
  @Expose()
  status!: string;
  @Expose()
  message!: string;
  @Expose()
  cash_type!: string;
  @Expose()
  tenant_name!: string;
  @Expose()
  requested_by!: string;
  @Expose()
  allow_to_reject!: boolean;
  @Expose()
  allow_to_approve!: boolean;
}
