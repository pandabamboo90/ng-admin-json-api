import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, Input } from '@angular/core';
import { STData } from '@delon/abc/st';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'user-status',
  template: `
    <nz-badge [nzStatus]="statusType" [nzText]="statusText"></nz-badge>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserStatusComponent implements DoCheck {

  @Input() attributes!: STData;
  statusType!: string;
  statusText!: string;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngDoCheck() {
    if (this.attributes.deleted_at) {
      this.statusType = 'error';
      this.statusText = 'Inactive';
    } else {
      if (this.attributes.locked) {
        this.statusType = 'warning';
        this.statusText = 'Locked';
      } else {
        this.statusType = 'success';
        this.statusText = 'Active';
      }
    }

    this.cdr.markForCheck();
  }
}
