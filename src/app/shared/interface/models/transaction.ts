import { AllowTo, IUser, User } from '@shared';
import { Expose, Type } from 'class-transformer';

export interface ITransaction extends Pick<AllowTo, 'allow_to_receive'>{
  id: number;
  amount: number;
  cash_type: string;
  sender_id: number;
  sender_user: IUser;
  receiver_id: number;
  receiver_user: IUser;
  transaction_type: string;
  status: 'pending' | 'done';
  created_at: string;
}

export class Transaction {
  @Expose()
  id!: number;
  @Expose()
  amount!: number;
  @Expose()
  cash_type!: string;
  @Expose()
  sender_id!: number;
  @Expose()
  @Type(() => User)
  sender_user!: User;
  @Expose()
  receiver_id!: number;
  @Expose()
  @Type(() => User)
  receiver_user!: User;
  @Expose()
  status!: 'pending' | 'done';
  @Expose()
  transaction_type!: string;
  @Expose()
  allow_to_receive!: boolean;
  @Expose()
  created_at!: string;
}
