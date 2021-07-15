import { Injectable } from '@angular/core';
import { Resource, Service } from 'ngx-jsonapi';

export class RolePermission extends Resource {
  attributes = {
    role_id: '',
    permission_id: '',
  };
}

@Injectable()
export class RolePermissionApi extends Service<RolePermission> {
  public resource = RolePermission;
  public type = 'role_permission';
  protected path = '/roles_permissions';
}
