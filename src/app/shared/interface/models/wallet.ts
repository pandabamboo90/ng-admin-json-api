import { Expose, Type } from 'class-transformer';

export interface IWallet {
  id: number;
  seed: number;
  title: string;
  token: number;
  cashes: ICash[];
}

export interface ICash {
  id: number;
  amount: number;
  cash_type: string;
  cash_status: string;
  binary_cash: string;
}

export interface ICurrency {
  id: number;
  type_number: number;
  type_title: string;
  currency_code: string;
}

export class Wallet {
  @Expose()
  id!: number;

  @Expose()
  seed!: number;

  @Expose()
  title!: string;

  @Expose()
  token!: number;

  @Expose()
  @Type(() => Cash)
  cashes!: Cash[];
}

export class Cash {
  @Expose()
  id!: number;

  @Expose()
  amount!: number;

  @Expose()
  cash_type!: string;

  @Expose()
  cash_status!: string;

  @Expose()
  binary_cash!: string;
}

export class Currency {
  @Expose()
  id!: number;

  @Expose()
  type_number!: number;

  @Expose()
  type_title!: string;

  @Expose()
  currency_code!: string;
}
