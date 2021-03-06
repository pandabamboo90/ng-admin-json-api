import { Injectable } from '@angular/core';
import { Role } from '@src/app/core';
import { DocumentCollection, Resource, Service } from 'ngx-jsonapi';

export class User extends Resource {
  status = {
    type: 'success',
    text: 'Active',
  };

  attributes = {
    name: '',
    email: '',
    mobile_phone: '',
    image: {
      data: null,
      url: null,
      thumbnail: null,
    } as any,
    locked: false,
    locked_at: null,
    deleted_at: null as string | null,
  };

  relationships: any = {
    roles: new DocumentCollection<Role>(),
  };

  get isActive() {
    return !this.attributes.deleted_at
  }
}

@Injectable()
export class UserApi extends Service<User> {
  public resource = User;
  public type = 'user';
  protected path = '/users';
}
