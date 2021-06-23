import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { assetHost } from '@env/environment';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';

@UntilDestroy()
@Component({
  selector: 'user-profile-image',
  template: `
    <nz-avatar [nzSize]=size [nzSrc]=src></nz-avatar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileImageComponent implements OnInit {

  @Input() src!: string;
  @Input() size!: NzSizeLDSType | number;

  constructor() {
  }

  ngOnInit() {
    if (!this.src) {
      this.src = `/assets/img/avatar.svg`;
    } else {
      this.src = `${assetHost.baseUrl}${this.src}`;
    }
  }
}
