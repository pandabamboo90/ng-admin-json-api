import { Component, Input } from '@angular/core';
import { SettingsService, User } from '@delon/theme';
import { IUser, IWallet } from '@shared';
import { orderBy as _orderBy } from 'lodash-es';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'user-wallet',
  templateUrl: './user-wallet.component.html',
  styles: [],
})
export class UserWalletComponent {
  @Input()
  collapsed = false;

  constructor(private settingSrv: SettingsService) { }

  get user(): IUser | User {
    return this.settingSrv.user;
  }

  get hasWallet(): boolean {
    return this.user?.wallets?.length > 0 || false;
  }

  get wallets(): IWallet[] {
    this.user?.wallets.forEach((wallet: IWallet) => wallet.cashes = _orderBy(wallet.cashes, 'cash_type'));
    return this.user?.wallets;
  }

  trackByFn(index: number, item: any): number {
    return item?.id;
  }
}
