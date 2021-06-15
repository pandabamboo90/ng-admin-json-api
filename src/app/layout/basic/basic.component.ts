import { Component } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { LayoutDefaultOptions } from '@delon/theme/layout-default';
import { environment } from '@env/environment';
import { IUser } from '@src/app/shared';

@Component({
  selector: 'layout-basic',
  template: `
      <layout-default [options]="options" [asideUser]="asideUserTpl" [content]="contentTpl">
          <!--      <layout-default-header-item direction="left">-->
          <!--        <a layout-default-header-item-trigger href="//github.com/ng-alain/ng-alain" target="_blank">-->
          <!--          <i nz-icon nzType="github"></i>-->
          <!--        </a>-->
          <!--      </layout-default-header-item>-->

          <!--      <layout-default-header-item direction="left" hidden="mobile">-->
          <!--        <a layout-default-header-item-trigger routerLink="/passport/lock">-->
          <!--          <i nz-icon nzType="lock"></i>-->
          <!--        </a>-->
          <!--      </layout-default-header-item>-->

          <!--      <layout-default-header-item direction="left" hidden="pc">-->
          <!--        <div layout-default-header-item-trigger (click)="searchToggleStatus = !searchToggleStatus">-->
          <!--          <i nz-icon nzType="search"></i>-->
          <!--        </div>-->
          <!--      </layout-default-header-item>-->

          <!--      <layout-default-header-item direction="middle">-->
          <!--        <header-search class="alain-default__search" [toggleChange]="searchToggleStatus"></header-search>-->
          <!--      </layout-default-header-item>-->

          <!-- Setting menu -->
          <layout-default-header-item direction="right" [hidden]="'mobile'">
              <div layout-default-header-item-trigger nz-dropdown [nzDropdownMenu]="settingsMenu" nzTrigger="click"
                   nzPlacement="bottomRight">
                  <i nz-icon nzType="setting"></i>
              </div>
              <nz-dropdown-menu #settingsMenu="nzDropdownMenu">
                  <div nz-menu style="width: 200px;">
                      <div nz-menu-item>
                          <header-fullscreen></header-fullscreen>
                      </div>
                      <div nz-menu-item>
                          <header-clear-storage></header-clear-storage>
                      </div>
                      <div nz-menu-item [acl]="{ ability: ['roles_index'] }">
                          <header-permission-setting></header-permission-setting>
                      </div>
                  </div>
              </nz-dropdown-menu>
          </layout-default-header-item>
          <!-- Setting menu -->

          <!-- Header user -->
          <layout-default-header-item direction="right">
              <header-user></header-user>
          </layout-default-header-item>
          <!-- Header user -->

          <!-- Side menu -->
          <ng-template #asideUserTpl>
              <div class="alain-default__aside-user" nz-dropdown [nzDropdownMenu]="userMenu" nzTrigger="click">
                  <nz-avatar class="alain-default__aside-user-avatar" [nzSrc]="user?.avatar"></nz-avatar>
                  <div class="alain-default__aside-user-info">
                      <strong>{{ user?.name }}</strong>
                      <p class="mb0">{{ user?.email }}</p>
                  </div>
              </div>

              <nz-dropdown-menu #userMenu="nzDropdownMenu">
                  <ul nz-menu>
                      <li nz-menu-item routerLink="/setting/account">My Profile</li>
                      <!--                      <li nz-menu-item routerLink="/pro/account/settings">Account Settings</li>-->
                  </ul>
              </nz-dropdown-menu>

              <!-- User balance -->
              <div class="d-flex flex-column">
                  <!-- Side bar collapsed -->
                  <ng-container *ngIf="collapsed; else fullBalance">
                      <i nz-icon
                         nzType="wallet"
                         nzTheme="outline"
                         class="mt-xl fs-24 cursor-pointer"
                         [nz-tooltip]="walletTpl"
                      ></i>
                  </ng-container>

                  <!-- Side bar expanded -->
                  <ng-template #fullBalance>
                      <strong *ngIf="hasWallet" class="ml-sm mb-sm">
                          Your balance: <i nz-icon nzType="dollar-circle" nzTheme="outline"></i>
                      </strong>
                      <ng-container *ngTemplateOutlet="walletTpl"></ng-container>
                  </ng-template>

                  <!-- User wallet -->
                  <ng-template #walletTpl>
                      <user-wallet [collapsed]="collapsed"></user-wallet>
                  </ng-template>
              </div>
              <!-- User balance -->
          </ng-template>
          <!-- Side menu -->

          <!-- Main content -->
          <ng-template #contentTpl>
              <router-outlet></router-outlet>
          </ng-template>
          <!-- Main content -->

      </layout-default>
      <!--    <setting-drawer *ngIf="showSettingDrawer"></setting-drawer>-->
      <!--    <theme-btn></theme-btn>-->
  `,
  styles: [`
      nz-tag {
          cursor: default;
      }

      .cursor-pointer {
          cursor: pointer;
      }

      .fs-24 {
          font-size: 24px !important;
      }
  `],
})
export class LayoutBasicComponent {
  options: LayoutDefaultOptions = {
    logoExpanded: `./assets/CCP-full.svg`,
    logoCollapsed: `./assets/CCP.svg`,
    logoLink: '/',
  };
  searchToggleStatus = false;
  showSettingDrawer = !environment.production;

  constructor(private settingsSrv: SettingsService) {}

  get user(): IUser {
    return this.settingsSrv.user as IUser;
  }

  get hasWallet(): boolean {
    return this.user?.wallets.length > 0;
  }

  get collapsed(): boolean {
    return this.settingsSrv.layout.collapsed;
  }

  toggleCollapse(): void {
    this.settingsSrv.setLayout('collapsed', !this.collapsed);
  }

  trackByFn(index: number, item: any): number {
    return item?.id;
  }
}
