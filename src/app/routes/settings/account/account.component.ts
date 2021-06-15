import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@core';
import { SettingsService } from '@delon/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ADMIN_URL_TOKEN,
  catchError,
  Entity,
  FormError,
  IEndpoint,
  IMsgObject,
  IResponse,
  ITenant,
  IUser,
  parseError,
  User,
} from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

enum Tab {
  'Profile' = 1,
  'Account' = 2,
  'Transaction_Fee' = 3,
}

interface Slider {
  min: number;
  max: number;
  step: number;

  [key: string]: number;
}

@UntilDestroy()
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styles: [`
      nz-form-label i {
          font-size: 24px !important;
      }

      .btn-link:hover {
          text-decoration: underline;
      }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent implements OnInit {
  title = 'Profile';

  current = 1;
  Tab = Tab;

  tenants: ITenant[] = [];
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  slider: Slider = {
    min: 0,
    max: 999,
    step: 0.1,
  };

  msgObj: IMsgObject = {
    msgSrv: this.messageSrv,
    notificationSrv: this.notificationSrv,
    show: (error: FormError<IUser>) => parseError(error),
  };

  constructor(
    @Inject(ADMIN_URL_TOKEN) protected urlEndpoint: IEndpoint<Entity>,
    public msgSrv: NzMessageService,
    private fb: FormBuilder,
    private http: ApiService,
    private settingSrv: SettingsService,
    protected messageSrv: NzMessageService,
    protected notificationSrv: NzNotificationService,
  ) {}

  get user(): User {
    return this.settingSrv.user as unknown as User;
  }

  ngOnInit(): void {
    this.initForm();

    if (this.user.can('tenants_index')) {
      this.fetchTenantList();
    }
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: [{ value: '', disabled: true }],
      cellphone: [''],
      country_code: [''],
      authy_id: [{ value: '', disabled: true }],
      kyc_passed: [{ value: false, disabled: true }],
      avatar: [''],
    });

    this.profileForm.patchValue(this.user);

    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required]],
      new_password_confirm: ['', [Validators.required, this.confirmationValidator.bind(this)]],
    });
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.passwordForm.controls;
  }

  get name(): AbstractControl {
    return this.profileForm.get('name')!;
  }

  get roles(): string[] {
    return this.user.roles.map(role => role.name);
  }

  get avatar(): string {
    return this.profileForm.get('avatar')?.value;
  }

  get kycPassed(): boolean {
    return this.profileForm.get('kyc_passed')?.value;
  }

  get newPassword(): string {
    return this?.passwordForm?.get('new_password')!.value || '';
  }

  confirmationValidator(control: FormControl): { [key: string]: boolean } | null {
    if (!control?.value) {
      return { required: true };
    } else if (control?.value !== this.newPassword) {
      return { mismatched: true };
    }

    return null;
  }

  to(tab: number = 1): void {
    this.current = tab;
  }

  formatter(value: number): string {
    return `${ value }$`;
  }

  fetchTenantList(): void {
    this.http.get(`${ this.urlEndpoint.tenants }`)
      .pipe(
        catchError(this.msgObj),
        untilDestroyed(this),
      )
      .subscribe(({ data }) => {
        this.tenants = [...data];
        for (const tenant of this.tenants) {
          this.slider[tenant.display_name] = 0;
        }
      });
  }

  call<T, R extends IResponse<T>>(api: 'update_profile' | 'change_password', value: T): void {
    this.http.put<R>(`/me/${ api }`,
      { data: { ...value } },
      {},
      { service: 'user' },
    )
      .pipe(
        catchError(this.msgObj),
        untilDestroyed(this),
      )
      .subscribe(({ data }) => this.msgSrv.success('Updated successfully!'));
  }

  updatePwd(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.call('change_password', this.passwordForm.value);
  }

  updateTransFee(): void {
    this.msgSrv.info('New amount applied');
  }

  trackByFn(index: number, item: any): any {
    return item;
  }
}
