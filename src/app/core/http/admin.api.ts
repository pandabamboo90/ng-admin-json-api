import { Injectable } from '@angular/core';
import { Role } from '@src/app/core';
import { DocumentCollection, Resource, Service } from 'ngx-jsonapi';

export class Admin extends Resource {
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

  get isActive() {
    return !this.attributes.deleted_at
  }
}

@Injectable()
export class AdminApi extends Service<Admin> {
  public resource = Admin;
  public type = 'admin';
  protected path = '/admins';
}
