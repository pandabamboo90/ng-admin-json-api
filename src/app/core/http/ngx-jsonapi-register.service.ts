import { Injectable } from '@angular/core';
import { AdminApi, RoleApi, RolePermissionApi, UserApi, PermissionApi } from '@core';

@Injectable({ providedIn: 'root' })
export class NgxJsonapiRegisterService {
  constructor(private userApi: UserApi,
              private adminApi: AdminApi,
              private roleApi: RoleApi,
              private permissionApi: PermissionApi,
              private rolePermissionApi: RolePermissionApi) {
  }

  call(): void {
    this.userApi.register();
    this.adminApi.register();
    this.permissionApi.register();
    this.roleApi.register();
    this.rolePermissionApi.register();
  }
}
