import { Injectable } from '@angular/core';
import { AdminApi, RoleApi, UserApi } from '@core';

@Injectable({ providedIn: 'root' })
export class NgxJsonapiRegisterService {
  constructor(private userApi: UserApi,
              private roleApi: RoleApi,
              private adminApi: AdminApi) {
  }

  call(): void {
    this.userApi.register();
    this.roleApi.register();
    this.adminApi.register();
  }
}
