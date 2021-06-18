import { Injectable } from '@angular/core';
import { User } from '@core';
import { Service, Resource, DocumentResource } from 'ngx-jsonapi';

export class Role extends Resource {
  attributes = {
    display_name: '',
    name: '',
    resource_id: null,
    resource_type: null,
  };

  relationships: any = {
    user: new DocumentResource<User>()
  };
}

@Injectable()
export class RoleApi extends Service<Role> {
  public resource = Role;
  public type = 'role';
  protected path = '/roles';
}
