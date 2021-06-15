import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone, OnInit } from '@angular/core';
import { ApiService } from '@core';
import { STColumn } from '@delon/abc/st';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ADMIN_URL_TOKEN,
  catchError,
  DATA,
  Entities,
  Entity,
  Entry,
  FormError,
  IEndpoint,
  IMsgObject,
  IPermission,
  IResponse,
  IRole,
  IRolePermission,
  IUser,
  parseError,
  PermissionData,
  Roles,
  TitleCasePermissionWithCan,
} from '@shared';
import { NamePipe } from '@src/app/shared/pipes';
import { groupBy as _groupBy, mapValues as _mapValues } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, zip } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

interface RequestPayload {
  role_id: number;
  permission_ids: number[];
}

@UntilDestroy()
@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionComponent implements OnInit {
  title = 'Permission';

  cols: STColumn[] = [
    { title: '', index: 'title', render: 'permissionTpl', width: 300 },
    { title: 'Wallet Admin', render: 'walletCheckboxTpl' },
    { title: 'Tenant Admin', render: 'tenantCheckboxTpl' },
    { title: 'Client', render: 'clientCheckboxTpl' },
  ];
  data: PermissionData[] = [];
  data$!: Observable<PermissionData[]>;

  roles: IRole[] = [];
  permissions: IPermission[] = [];

  loading = false;

  msgObj: IMsgObject = {
    msgSrv: this.messageSrv,
    notificationSrv: this.notificationSrv,
    show: (error: FormError<IUser>) => parseError(error),
  };

  constructor(
    @Inject(ADMIN_URL_TOKEN) private urlEndpoint: IEndpoint<Entity>,
    private ngZone: NgZone,
    private http: ApiService,
    private namePipe: NamePipe,
    private cdRef: ChangeDetectorRef,
    private messageSrv: NzMessageService,
    private notificationSrv: NzNotificationService,
  ) {}

  ngOnInit(): void {
    this.data$ = this.fetchData();
  }

  fetchData(): Observable<PermissionData[]> {
    this.loading = true;

    return zip(
      this.http.get<IResponse<IRole>>(`${ this.urlEndpoint?.roles }`),
      this.http.get<IResponse<IPermission>>(`${ this.urlEndpoint?.permissions }`),
    )
      .pipe(
        catchError(this.msgObj, () => (this.loading = false)),
        map(([{ data: roles }, { data: permissions }]) => {
          this.ngZone.runOutsideAngular(_ => {
            this.roles = [...roles];
            this.permissions = [
              ...permissions.map(({ name, ...fields }) => ({
                ...fields,
                name: `Can ${ name }` as keyof TitleCasePermissionWithCan,
              }))];
          });

          return this.mapData();
        }),
        finalize(() => this.loading = false),
      );
  }

  // Return mapped data for rendering
  mapData(): PermissionData[] {
    this.cdRef.markForCheck();
    this.loading = false;

    // This block of code will generate data for rendering
    // such as: [{
    //   id: 1,
    //   title: 'Admin',
    //   permissions: [{
    //     action: "update"
    //     controller: "api/v1/admin/admins"
    //     group_name: "Admins"
    //     id: 1
    //     name: "Can Admins Update"
    //   },
    //   ...
    //   ],
    //   permissionsByRole: {
    //   tenant_admin: { data: [
    //      ["can_admins_update?", true]
    //      ["can_admins_show?", true]
    //      ["can_admins_index?", true]
    //      ["can_admins_create?", true]
    //      ["can_admins_destroy?", true]
    //   ], all: true, id: 2  },
    //  ...
    // },
    // ...
    // }]
    for (const record of DATA) {
      record.permissions =
        this.permissionsByKey(`${ record.title }s` as Capitalize<Entities>, this.permissions, 'group_name')
          .sort((a, b) => (a.name > b.name) ? 1 : (a.name < b.name) ? -1 : 0);
      Object.keys(record.permissionsByRole).forEach(key => this.setDataFor(record, key));
    }

    this.data = [...DATA];

    return DATA;
  }

  // Assign data by role
  setDataFor(record: PermissionData, role: Roles): void {
    // Assign role id
    record.permissionsByRole[role].id = this.roles.find(({ name }) => name === role)?.id;

    // Assign role data
    record.permissionsByRole[role].data = this.permissionsByKey(
      record.title.toLowerCase() as Entity, // Key
      this.roles.find(({ name }) => name === role)?.role_permissions, // Data
      'permission_name', // Field to check
    )
      .sort((a, b) => (a.permission_name > b.permission_name) ? 1 : (a.permission_name < b.permission_name) ? -1 : 0)
      .map(item => [`can_${ item.permission_name }?`, item.status === 'active']);

    // Assign check all key
    record.permissionsByRole[role].all = this.isCheckedAll(record.permissionsByRole[role].data);
  }

  // Return data by entity
  permissionsByKey<T extends (IPermission | IRolePermission)>(
    key: Capitalize<Entities> | Entity,
    data: T[] = [],
    field: keyof T,
  ): T[] {
    return [...data.filter(item => {
      const str = item[field] as unknown as string;
      return str.includes(key) && (str.indexOf(key) === 0);
    })];
  }

  isCheckedAll(entries: Entry[] = []): boolean {
    return entries.every(([, checked]) => checked);
  }

  isNoneChecked(entries: Entry[] = []): boolean {
    return entries.every(([, checked]) => !checked);
  }

  updateIndeterminate({ permissionsByRole }: PermissionData, role: Roles): boolean {
    return !(this.isCheckedAll(permissionsByRole[role]?.data) || this.isNoneChecked(permissionsByRole[role]?.data));
  }

  updateSingleChecked(item: PermissionData, role: Roles): void {
    item.permissionsByRole[role].all = this.isCheckedAll(item?.permissionsByRole[role]?.data);
    // Update submit data
    this.updateData(item);
  }

  updateAllChecked(item: PermissionData, role: Roles): void {
    // Update every single checkbox
    item.permissionsByRole[role].data = [...(item.permissionsByRole[role].data as Entry[])
      .map(([key]) => [key, item.permissionsByRole[role]?.all])];
    // Update check all checkbox
    item.permissionsByRole[role].all = this.isCheckedAll(item?.permissionsByRole[role]?.data);
    // Update submit data
    this.updateData(item);
  }

  updateData(item: PermissionData): void {
    const index = this.data.findIndex(({ id }) => id === item?.id);
    if (index > -1) {
      this.data[index] = { ...item };
    }
  }

  getPermissionId(permission: string): number {
    return this.permissions.find(({ name }) => name === this.namePipe.transform(permission))?.id || 0;
  }

  generateRequestObj(): RequestPayload[] {
    const result: RequestPayload[] = [];
    let temp: RequestPayload[] = [];

    // This block of code will generate array of data
    // with duplicate key such as: [{
    //  role_id: 1, permission_ids: [1, 2, 3],
    //  role_id: 2, permission_ids: [1, 2, 3],
    //  role_id: 3, permission_ids: [1, 2, 3],
    //  role_id: 1, permission_ids: [4, 5, 6],
    // ...
    // }]
    for (const { permissionsByRole } of this.data) {
      const chunk = Object.entries<IRole>(permissionsByRole).map(([, { data, id: role_id }]) => {
        const permission_ids: number[] = [];

        data?.filter(([, can]) => !!can).forEach(([permission]) => permission_ids.push(this.getPermissionId(permission)));

        return { role_id, permission_ids };
      });

      temp = [...temp, ...chunk];
    }

    // This block of code will generate final request data
    // such as: [{
    //  role_id: 1, permission_ids: [1, 2, 3, 4, 5, 6],
    //  role_id: 2, permission_ids: [1, 2, 3],
    //  role_id: 3, permission_ids: [1, 2, 3],
    // }]
    _mapValues(_groupBy(temp, 'role_id'), (data: RequestPayload[]) => {
      const groupedData = data.reduce((acc, curr) => {
        return {
          role_id: curr?.role_id,
          permission_ids: [...acc?.permission_ids, ...curr.permission_ids],
        };
      }, { role_id: 1, permission_ids: [] });

      result.push(groupedData);
    });

    return result;
  }

  submit(): void {
    this.http.post(`${ this.urlEndpoint.roles }/manage_permissions`, { data: this.generateRequestObj() })
      .pipe(
        catchError(this.msgObj),
        untilDestroyed(this)
      )
      .subscribe(res => this.messageSrv.success('Updated successfully !'));
  }

  trackByFn(index: number, item: any): any {
    return item;
  }
}
