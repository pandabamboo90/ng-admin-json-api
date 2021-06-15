import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'header-permission-setting',
  template: `
      <i nz-icon nzType="apartment" nzTheme="outline" class="mr-sm"></i>
      Permission setting
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderPermissionSettingComponent {
  constructor(private router: Router) {}

  @HostListener('click')
  async _click(): Promise<void> {
    await this.router.navigateByUrl('/setting/permission');
  }
}
