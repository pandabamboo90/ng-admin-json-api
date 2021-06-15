import { Inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenModel, ITokenService } from '@delon/auth';
import { App, Menu, SettingsService, TitleService } from '@delon/theme';
import {
  Entities,
  Entity,
  IAccessLevel,
  ICurrency,
  IResponse,
  IResponseNoMeta,
  ITicket,
  ITransaction,
  IUser,
  QueryParam,
  User,
} from '@shared';
import { CacheService, MenuService } from '@src/app/core';

import { ICONS } from '@src/style-icons';
import { ICONS_AUTO } from '@src/style-icons-auto';
import { plainToClass } from 'class-transformer';
import { each as _each } from 'lodash-es';
import { NzIconService } from 'ng-zorro-antd/icon';
import { Observable, zip } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  params: QueryParam<ITransaction> = {
    'page[size]': 10,
    'page[number]': 1,
    sort: '-id',
  };

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    injector: Injector,
    private router: Router,
    private http: ApiService,
    private iconSrv: NzIconService,
    private aclService: ACLService,
    private menuService: MenuService,
    private titleService: TitleService,
    private settingService: SettingsService,
    private cacheService: CacheService<ITicket | ITransaction>,
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  get user(): User {
    return this.settingService?.user as User;
  }

  setData<T>(key: Entity | 'currency', data: T): void {
    this.settingService.setData(key, data);
  }

  getData<T>(key: Entity | 'currency'): T {
    return this.settingService.getData(key);
  }

  private viaHttp(resolve: any, reject: any): void {
    const source$ = [
      this.http.get<App>('assets/app-data.json', { skip_interceptor: true }),
      this.http.get<IResponseNoMeta<User>>(`/me/profile`, {}, { service: 'user' }),
    ];

    zip(...source$)
      .pipe(
        // switchMap(([appData, currentUserData]) => {
        //   const data$: (Observable<IResponse<ITicket>> | Observable<IResponse<ITransaction>>)[] = [];
        //   const { access_level } = plainToClass(User, currentUserData?.data);
        //
        //   if (!access_level['can_tickets_index?'] && !access_level['can_transactions_index?']) {
        //     return of<(App | { data: User })[]>([appData, currentUserData]);
        //   }
        //
        //   if (access_level['can_tickets_index?']) {
        //     data$.push(this.http.get<IResponse<ITicket>>(`/admin/tickets`, this.params, { service: 'super_admin' }));
        //   }
        //
        //   if (access_level['can_transactions_index?']) {
        //     data$.push(this.http.get<IResponse<ITransaction>>(`/admin/transactions`, this.params, { service: 'super_admin' }));
        //   }
        //
        //   return forkJoin(...data$).pipe(
        //     map(res => [appData, currentUserData, ...res]),
        //     catchError(err => EMPTY),
        //   );
        // }),
        catchError((res) => {
          console.warn(`StartupService.load: Network request failed`, res);
          resolve(null);
          return [];
        }),
      )
      .subscribe((
        [
          appData,
          currentUserData,
          // ticketData,
          // transactionData,
        ],
        ) => {
          // User information: including name, avatar, email address
          this.setUserData(currentUserData?.data);
          // Application data
          const res: any = appData;
          // Application information: including site name, description, year
          this.settingService.setApp(res.app);
          // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
          for (const { role_permissions } of this.user?.roles || []) {
            this.aclService.setAbility([
              ...(role_permissions
                .filter(({ status }) => status === 'active')
                .map(({ permission_name }) => permission_name)),
            ]);
          }
          // Access level data
          const { access_level = {} }: { access_level: Partial<IAccessLevel> } = this.user;
          // Menu data, https://ng-alain.com/theme/menu
          _each(res.menu, (m: Menu) => {
            _each(m.children, (mc: Menu) => this.setViewByAccessLevel(mc, access_level, currentUserData.data));
          });
          // Set menu view base on user's access level and KYC passed ?
          this.menuService.add(res.menu);
          // Can be set page suffix title, https://ng-alain.com/theme/title
          this.titleService.suffix = res.app.name;
          // Add notifier badge
          // this.checkPendingTicket(ticketData, currentUserData?.data);
          // this.checkPendingTransaction(transactionData, currentUserData?.data);
        },
        () => {
        },
        () => {
          resolve('complete');
        });
  }

  private viaMock(resolve: any, reject: any): void {
    // const tokenData = this.tokenService.get();
    // if (!tokenData.token) {
    //   this.injector.get(Router).navigateByUrl('/passport/login');
    //   resolve({});
    //   return;
    // }
    // mock
    const app: any = {
      name: `ng-alain`,
      description: `Ng-zorro admin panel front-end framework`,
    };
    const user: any = {
      name: 'Admin',
      avatar: './assets/img/avatar.svg',
      email: 'cipchk@qq.com',
      token: '123456789',
    };
    // Application information: including site name, description, year
    this.settingService.setApp(app);
    // User information: including name, avatar, email address
    this.settingService.setUser(user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    this.menuService.add([
      {
        text: 'Main',
        group: true,
        children: [
          {
            text: 'Admins',
            link: '/admin/list',
            icon: { type: 'icon', value: 'appstore' },
          },
        ],
      },
    ]);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = app.name;

    resolve({});
  }

  load(): Promise<any> {
    // only works with promises
    // https://github.com/angular/angular/issues/15088
    const token: ITokenModel | {} = this.tokenService.get() || {};
    const hasToken = (Object.keys(token).length > 0) && token.constructor === Object;

    return hasToken ? this.bootstrap() : this.router.navigateByUrl('/passport/login');
  }

  bootstrap(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.viaHttp(resolve, reject);
      // mock：Please do not use it in a production environment, viaMock is just to simulate some data so that the scaffolding can run normally at first
      // this.viaMock(resolve, reject);
    })
      .then(res => (res && this.cacheCurrencies()));
  }

  // Check if one user (by id) is current user
  isYou(checkId: number = 0, userId: number = this.user?.id): boolean {
    return checkId === userId || false;
  }

  setUserData<T extends User>(data: T): void {
    data.name = [data.first_name, data.last_name].join(' ');
    data.avatar = './assets/img/avatar.svg';
    this.settingService.setUser(plainToClass(User, data));
  }

  setViewByAccessLevel(
    menu: Menu, {
      'can_admins_index?': can_admins_index = true,
      'can_tenants_index?': can_tenants_index = true,
      'can_users_index?': can_users_index = true,
      'can_tickets_index?': can_tickets_index = true,
      'can_transactions_index?': can_transactions_index = true,
    }: Partial<IAccessLevel>,
    user: IUser,
  ): void {
    const obj = {
      '/admin/list': () => menu.hide = !can_admins_index,
      '/tenant/list': () => menu.hide = !can_tenants_index,
      '/user/list': () => menu.hide = !can_users_index,
      '/ticket/list': () => menu.hide = !(user.kyc_passed && can_tickets_index),
      '/transaction/list': () => menu.hide = !(user.kyc_passed && can_transactions_index),
    };
    obj[menu.link as keyof typeof obj]();
  }

  cacheIt(data: IResponse<ITicket | ITransaction>, key: Entities = 'transactions', ttl: number = 3600): void {
    this.cacheService.set(key, { ...data }, { type: 'm', expire: ttl });
  }

  checkPendingTicket({ data, meta }: IResponse<ITicket>, user: User): void {
    const notReceiveMoney = (
      {
        status,
        creator,
      }: ITicket,
    ) => status === 'pending' && this.isYou(creator?.id, user.id);
    // Pending only true transaction status is 'pending' and current user is a receiver
    const isPending = data.findIndex(notReceiveMoney) > -1 || false;
    // Notification count
    const count = data.filter(notReceiveMoney)?.length || 0;

    // Cache transaction data for updating notification badge
    this.cacheIt({ data, meta }, 'tickets');
    this.setNoticeBadge(isPending, count, 'ticket');
  }

  checkPendingTransaction({ data, meta }: IResponse<ITransaction>, user: User): void {
    const notReceiveMoney = (
      {
        status,
        receiver_user: { id: receiverId },
      }: ITransaction,
    ) => status === 'pending' && this.isYou(receiverId, user.id);
    // Pending only true transaction status is 'pending' and current user is a receiver
    const isPending = data.findIndex(notReceiveMoney) > -1 || false;
    // Notification count
    const count = data.filter(notReceiveMoney)?.length || 0;

    // Cache transaction data for updating notification badge
    this.cacheIt({ data, meta });
    this.setNoticeBadge(isPending, count);
  }

  setNoticeBadge(isPending: boolean = false, count: number = 0, key: Entity = 'transaction'): void {
    isPending
      ? this.menuService.setItem(key, {
        ...this.menuService.getItem(key),
        badge: count,
        badgeDot: true,
      })
      : this.removeNoticeBadge();
  }

  removeNoticeBadge(): void {
    this.menuService.resume((item: Menu, parentMenu: Menu | null, depth?: number) => {
      if (item.key === 'transaction') {
        item.badge = undefined;
        // item.badgeDot = false;
      }
    });
  }

  fetchCurrencies(): Observable<IResponseNoMeta<ICurrency>> {
    return this.http.get<IResponseNoMeta<ICurrency>>(`/currencies`, {}, { service: 'user' });
  }

  cacheCurrencies(): void {
    this.fetchCurrencies()
      .subscribe(({ data }) => this.setData('currency', data));
  }
}
