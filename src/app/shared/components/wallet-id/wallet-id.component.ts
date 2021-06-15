import { NgIfContext } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';
import { ICash, IUser, IWallet } from '@shared';

type Template = 'available' | 'custom' | 'both';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'wallet-id',
  templateUrl: './wallet-id.component.html',
  styles: [],
})
export class WalletIdComponent {
  private _user!: IUser;

  private _useAvailableTpl = true;

  private _template!: TemplateRef<NgIfContext<boolean>>;

  @Input()
  set user(user: IUser) {
    this._user = { ...user };
  }

  get user(): IUser {
    return this._user;
  }

  @Input()
  set template(value: TemplateRef<NgIfContext<boolean>>) {
    this.useAvailableTpl = !value;
    this._template = value;
  }

  get template(): TemplateRef<NgIfContext<boolean>> {
    return this._template;
  }

  @Input()
  set useAvailableTpl(use: boolean) {
    this._useAvailableTpl = use;
  }

  get useAvailableTpl(): boolean {
    return this._useAvailableTpl;
  }

  get wallets(): IWallet[] {
    return this.user?.wallets || [];
  }

  get use(): Template {
    const result = {
      [`${ !this.template && this.useAvailableTpl }`]: 'available',
      [`${ this.template && !this.useAvailableTpl }`]: 'custom',
      [`${ this.template && this.useAvailableTpl }`]: 'both',
    };

    return result?.true as Template;
  }

  trackByFn(index: number, item: IWallet | ICash): number {
    return item?.id;
  }
}
