import { ACLType } from '@delon/acl';
import {
  AccessLevel,
  AllowTo,
  CanAction,
  Entities,
  IAccessLevel,
  IRole,
  ITenant,
  IWallet,
  PermissionWithoutCan,
  Role,
  Tenant,
  Wallet,
} from '@shared';
import { Expose, Type } from 'class-transformer';

interface IUserRole {
  id: number;
  role_id: number;
  role_name: string;
  user_id: number;
}

export interface IUser extends AllowTo {
  id: number;
  role: string;
  name: string;
  email: string;
  avatar: string;
  authy_id: number;
  tenant_id: number;
  must_kyc: boolean;
  cellphone: string;
  full_name: string;
  last_name: string;
  first_name: string;
  kyc_passed: boolean;
  country_code: string;
  access_level: IAccessLevel;
  permission_list: IAccessLevel;
  tenant: ITenant;
  wallets: IWallet[];
  wallet_pools: IWallet[];
  roles: IRole[];
  user_roles?: IUserRole[];
}

export class User {
  @Expose()
  tenant_id = 0;

  @Expose()
  email!: string;

  @Expose()
  cellphone!: string;

  @Expose()
  id!: number;

  @Expose()
  role!: string;

  @Expose()
  authy_id!: number;

  @Expose()
  must_kyc!: boolean;

  @Expose()
  name!: string;

  @Expose()
  last_name!: string;

  @Expose()
  first_name!: string;

  @Expose()
  full_name!: string;

  @Expose()
  avatar!: string;

  @Expose()
  kyc_passed!: boolean;

  @Expose()
  country_code!: string;

  @Expose()
  allow_to_update!: boolean;

  @Expose()
  allow_to_reject!: boolean;

  @Expose()
  allow_to_approve!: boolean;

  @Expose()
  allow_to_destroy!: boolean;

  @Expose()
  allow_to_send_money!: boolean;

  @Expose({ name: 'permission_list' })
  @Type(() => AccessLevel)
  access_level!: AccessLevel;

  @Expose()
  @Type(() => Tenant)
  tenant!: Tenant;

  @Expose({ name: 'wallet_pools' })
  wallets!: Wallet[];

  @Expose()
  @Type(() => Role)
  roles!: Role[];

  /**
   * Use this to check if user has specific permission
   * - @param action: CanAction
   */
  can(action: keyof PermissionWithoutCan): boolean {
    return this.access_level[`can_${ action }?` as keyof AccessLevel] || false;
  }

  /**
   * Use this with acl directive like: [acl]="user.ability('admin', 'create')"
   * - @param target: Entities
   * - @param action: CanAction
   */
  ability(target: Entities, action: CanAction): ACLType {
    return { ability: [`${ target }_${ action }`] };
  }
}
