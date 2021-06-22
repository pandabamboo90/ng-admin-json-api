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
  };

  relationships: any = {
    roles: new DocumentCollection<Role>(),
  };
}

@Injectable()
export class UserApi extends Service<User> {
  public resource = User;
  public type = 'user';
  protected path = '/users';
}
