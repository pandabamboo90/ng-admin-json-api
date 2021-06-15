import { STData } from '@delon/abc/st';
import { IndexedType, IPermission, IRole } from '@shared';

export interface PermissionByRole extends IndexedType {
  tenant_admin: Partial<IRole>;
  wallet_admin: Partial<IRole>;
  client: Partial<IRole>;
}

export interface PermissionData extends STData {
  id: number;
  title: string;
  permissions: IPermission[];
  permissionsByRole: PermissionByRole;
}

/************************************** Data skeleton ***************************************************/
export const DATA: PermissionData[] = [
  {
    id: 1,
    title: 'Admin',
    permissions: [],
    permissionsByRole: {
      tenant_admin: { data: [], all: false },
      wallet_admin: { data: [], all: false },
      client: { data: [], all: false },
    },
  },
  {
    id: 2,
    title: 'User',
    permissions: [],
    permissionsByRole: {
      tenant_admin: { data: [], all: false },
      wallet_admin: { data: [], all: false },
      client: { data: [], all: false },
    },
  },
  {
    id: 3,
    title: 'Ticket',
    permissions: [],
    permissionsByRole: {
      tenant_admin: { data: [], all: false },
      wallet_admin: { data: [], all: false },
      client: { data: [], all: false },
    },
  },
  {
    id: 4,
    title: 'Tenant',
    permissions: [],
    permissionsByRole: {
      tenant_admin: { data: [], all: false },
      wallet_admin: { data: [], all: false },
      client: { data: [], all: false },
    },
  },
  {
    id: 5,
    title: 'Transaction',
    permissions: [],
    permissionsByRole: {
      tenant_admin: { data: [], all: false },
      wallet_admin: { data: [], all: false },
      client: { data: [], all: false },
    },
  },
  {
    id: 6,
    title: 'Role',
    permissions: [],
    permissionsByRole: {
      tenant_admin: { data: [], all: false },
      wallet_admin: { data: [], all: false },
      client: { data: [], all: false },
    },
  },
  {
    id: 7,
    title: 'Permission',
    permissions: [],
    permissionsByRole: {
      tenant_admin: { data: [], all: false },
      wallet_admin: { data: [], all: false },
      client: { data: [], all: false },
    },
  },

];
/************************************** Data skeleton ***************************************************/
