import {
  CanAction,
  Entities,
  Entry,
  PermissionWithoutCan,
  TitleCasePermissionWithCan,
  TitleCasePermissionWithoutCan,
} from '@src/app/shared';
import { Expose } from 'class-transformer';

export interface IRolePermission {
  id: number;
  permission_id: number;
  permission_name: keyof PermissionWithoutCan;
  role_id: number;
  role_name: string;
  status: string;
}

export interface IPermission {
  id: number;
  name: keyof TitleCasePermissionWithCan | keyof TitleCasePermissionWithoutCan;
  action: CanAction;
  controller: string;
  group_name: Capitalize<Entities>;
}

export interface IRole {
  id: number;
  name: string;
  permissions?: IPermission[];
  role_permissions: IRolePermission[];
  // these 2 fields are for rendering purpose
  data?: Entry[];
  all?: boolean;
}

export class Role {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  permissions!: IPermission[];

  @Expose()
  role_permissions!: IRolePermission[];

  // these 2 fields are for rendering purpose
  @Expose()
  data!: Entry[];

  @Expose()
  all!: boolean;
}
