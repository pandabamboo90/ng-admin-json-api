import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SettingsService } from '@delon/theme';
import { IUser } from '@shared';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DetailGuard implements CanActivate {
  constructor(private router: Router, private settingSrv: SettingsService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.forward(route.params?.id) || this.denyAndGoBack();
  }

  get user(): IUser {
    return this.settingSrv.user as IUser;
  }

  forward(id: string): boolean {
    const {
      access_level: {
        'can_admins_create?': can_admins_create = true,
        'can_admins_update?': can_admins_update = true,
        'can_admins_index?': can_admins_index = true,
      } = {},
    } = this.user;
    const result = {
      [this.user.id]: can_admins_update,
      [id]: can_admins_index,
      new: can_admins_create,
    };

    return result[id];
  }

  denyAndGoBack(): boolean {
    this.router.navigateByUrl('/admin/list').then();
    return false;
  }
}
