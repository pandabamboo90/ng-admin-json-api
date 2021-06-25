import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class UserProfileImageComponent implements OnChanges {

  @Input() src!: string;
  @Input() size!: NzSizeLDSType | number;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setSrc(changes.src.currentValue);
  }

  private setSrc(value: string) {
    if (!value) {
      this.src = `/assets/img/avatar.svg`;
    } else {
      this.src = `${assetHost.baseUrl}${value}`;
    }
  }
}
