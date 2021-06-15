import { PermissionWithCan } from '@shared';
import { Expose } from 'class-transformer';

export interface IAccessLevel extends Partial<PermissionWithCan> {}

export class AccessLevel {
  @Expose()
  'can_admins_index?'!: boolean;
  @Expose()
  'can_admins_show?'!: boolean;
  @Expose()
  'can_admins_create?'!: boolean;
  @Expose()
  'can_admins_update?'!: boolean;
  @Expose()
  'can_admins_destroy?'!: boolean;

  @Expose()
  'can_tenants_index?'!: boolean;
  @Expose()
  'can_tenants_show?'!: boolean;
  @Expose()
  'can_tenants_create?'!: boolean;
  @Expose()
  'can_tenants_update?'!: boolean;
  @Expose()
  'can_tenants_destroy?'!: boolean;

  @Expose()
  'can_tickets_index?'!: boolean;
  @Expose()
  'can_tickets_show?'!: boolean;
  @Expose()
  'can_tickets_create?'!: boolean;
  @Expose()
  'can_tickets_update?'!: boolean;
  @Expose()
  'can_tickets_destroy?'!: boolean;

  @Expose()
  'can_users_index?'!: boolean;
  @Expose()
  'can_users_show?'!: boolean;
  @Expose()
  'can_users_create?'!: boolean;
  @Expose()
  'can_users_update?'!: boolean;
  @Expose()
  'can_users_destroy?'!: boolean;

  @Expose()
  'can_roles_index?'!: boolean;
  @Expose()
  'can_roles_show?'!: boolean;
  @Expose()
  'can_roles_create?'!: boolean;
  @Expose()
  'can_roles_update?'!: boolean;
  @Expose()
  'can_roles_destroy?'!: boolean;
  @Expose()
  'can_roles_manage_permissions?'!: boolean;

  @Expose()
  'can_permissions_index?'!: boolean;
  @Expose()
  'can_permissions_show?'!: boolean;
  @Expose()
  'can_permissions_create?'!: boolean;
  @Expose()
  'can_permissions_update?'!: boolean;
  @Expose()
  'can_permissions_destroy?'!: boolean;

  @Expose()
  'can_transactions_index?'!: boolean;
  @Expose()
  'can_transactions_show?'!: boolean;
  @Expose()
  'can_transactions_receive_money?'!: boolean;
  @Expose()
  'can_transactions_send_money?'!: boolean;
}
