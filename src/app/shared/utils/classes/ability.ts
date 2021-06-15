import { Component } from '@angular/core';
import { StartupService } from '@core';
import { AllowAction, AllowTo, IndexedType, IUser, User } from '@shared';
import { ClassTransformer } from 'class-transformer';

@Component({ template: '' })
// tslint:disable-next-line:component-class-suffix
export abstract class Ability<T extends IndexedType> extends ClassTransformer {
  protected constructor(protected startupSrv: StartupService) {
    super();
  }

  get user(): User {
    return this.startupSrv?.user as unknown as User;
  }

  protected get hasWallet(): boolean {
    return this.user?.wallets.length > 0 || false;
  }

  protected isNotLogInUser(item: Partial<IUser>): boolean {
    return !this.startupSrv?.isYou(item?.id) || false;
  }

  protected can(item: Partial<T>, permission: AllowAction, addCheck: () => boolean = () => true): boolean {
    if (!item) {
      return false;
    }

    const ability = `allow_to_${ permission }` as keyof AllowTo;

    const kycPassed = permission === 'send_money' ? this.hasWallet && this.isNotLogInUser(item) && item?.kyc_passed : true;

    return (kycPassed && item[ability] && (addCheck())) || false;
  }
}
