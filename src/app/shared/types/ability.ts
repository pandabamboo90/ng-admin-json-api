type Admin = 'admins';
type Tenant = 'tenants';
type Ticket = 'tickets';
type User = 'users';
type Transaction = 'transactions';
type Role = 'roles';
type Permission = 'permissions';
type Target = Admin | Tenant | Ticket | User | Transaction | Role | Permission;

export type CanAction =
  'create'
  | 'index'
  | 'show'
  | 'update'
  | 'destroy'
  | 'manage_permissions'
  | 'receive_money'
  | 'send_money';

export type PermissionWithoutCan = {
  [key in `${ Target }_${ CanAction }`]: boolean;
};

export type PermissionWithCan = {
  [key in `can_${ keyof PermissionWithoutCan }?`]: boolean;
};

export type TitleCasePermissionWithoutCan = {
  [key in `${ Capitalize<Target> } ${ Capitalize<CanAction> }`]: boolean;
};

export type TitleCasePermissionWithCan = {
  [key in `Can ${ keyof TitleCasePermissionWithoutCan }`]: boolean;
};
