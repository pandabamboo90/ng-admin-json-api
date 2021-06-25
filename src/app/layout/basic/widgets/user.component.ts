import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService, User } from '@delon/theme';

@Component({
  selector: 'header-user',
  template: `
    <div class="alain-default__nav-item d-flex align-items-center px-sm" nz-dropdown nzPlacement="bottomRight"
         [nzDropdownMenu]="userMenu">
      <user-profile-image [src]="user.attributes.image?.thumbnail" class="mr-sm"></user-profile-image>
      {{ user.attributes.name }}
    </div>
    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div nz-menu class="width-sm">
        <div nz-menu-item routerLink="/account/settings">
          <i nz-icon nzType="setting" class="mr-sm"></i>
          Account Settings
        </div>
        <li nz-menu-divider></li>
        <div nz-menu-item (click)="logout()">
          <i nz-icon nzType="logout" class="mr-sm"></i>
          Logout
        </div>
      </div>
    </nz-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderUserComponent {
  get user(): User {
    return this.settings.user;
  }

  constructor(private settings: SettingsService,
              private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  logout(): void {
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url!);
  }
}
