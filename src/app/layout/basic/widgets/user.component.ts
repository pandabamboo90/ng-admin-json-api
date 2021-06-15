import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Environment, SettingsService, User } from '@delon/theme';
import { environment } from '@env/environment';

@Component({
  selector: 'header-user',
  template: `
      <div class="alain-default__nav-item d-flex align-items-center px-sm"
           nz-dropdown
           nzPlacement="bottomRight"
           nzTrigger="click"
           [nzDropdownMenu]="userMenu"
      >
          <nz-avatar [nzSrc]="user.avatar" nzSize="small" class="mr-sm"></nz-avatar>
          {{ user?.name }}
      </div>

      <nz-dropdown-menu #userMenu="nzDropdownMenu">
          <ul nz-menu class="w-180 py0">
              <!--        <div nz-menu-item routerLink="/pro/account/center">-->
              <!--          <i nz-icon nzType="user" class="mr-sm"></i>-->
              <!--          Account Center-->
              <!--        </div>-->
              <li nz-menu-group nzTitle="User">
                  <ul>
                      <li nz-menu-item routerLink="/setting/account">
                          <i nz-icon nzType="user" class="mr-sm"></i>
                          My Profile
                      </li>
                  </ul>
              </li>

              <li nz-menu-divider></li>

              <li nz-menu-group nzTitle="Version info">
                <ul>
                  <li nz-menu-item>
                    Admin app: <strong>{{ appVersion }}</strong>
                  </li>
                  <li nz-menu-divider></li>
                  <li nz-menu-item>
                    API: <strong>{{ apiVersion }}</strong>
                  </li>
                </ul>
              </li>
              <!--        <div nz-menu-item routerLink="/exception/trigger">-->
              <!--          <i nz-icon nzType="close-circle" class="mr-sm"></i>-->
              <!--          Trigger Error-->
              <!--        </div>-->
              <li nz-menu-divider></li>

              <li nz-menu-group>
                  <ul>
                      <li nz-menu-item class="pb-sm" (click)="logout()">
                          <i nz-icon nzType="logout" class="mr-sm"></i>
                          Logout
                      </li>
                  </ul>
              </li>
          </ul>
      </nz-dropdown-menu>
  `,
  styles: [`
      .w-180 {
          width: 180px !important;
      }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderUserComponent {
  get user(): User {
    return this.settings.user;
  }

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private settings: SettingsService,
    private router: Router,
  ) {}

  get apiVersion(): string {
    return 'Unknown';
  }

  get appVersion(): string {
    return (environment as Environment & { appVersion: string })?.appVersion;
  }

  logout(): void {
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url!).then();
  }
}
