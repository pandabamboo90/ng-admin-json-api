import { Injectable } from '@angular/core';
import { RoleApi, UserApi } from '@core';

@Injectable({providedIn: 'root'})
export class NgxJsonapiServicesRegisterService {
  constructor(private userApi: UserApi,
              private roleApi: RoleApi) {
  }

  call(): void {
    this.userApi.register()
    this.roleApi.register()
  }
}
