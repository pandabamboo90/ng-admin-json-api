import { Injectable } from '@angular/core';
import { DocumentCollection, Resource, Service } from 'ngx-jsonapi';

export class Permission extends Resource {

  checked: boolean = false;

  attributes = {
    display_name: '',
    description: '',
  };
}

@Injectable()
export class PermissionApi extends Service<Permission> {
  public resource = Permission;
  public type = 'permission';
  protected path = '/permissions';
}
