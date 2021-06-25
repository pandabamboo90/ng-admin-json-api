import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Admin, User } from '@core';
import { SFComponent, SFSchema, SFStringWidgetSchema } from '@delon/form';
import { _HttpClient, SettingsService } from '@delon/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ErrorResponse, JsonApiError } from '@shared';
import { each as _each } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-account-settings-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsPasswordComponent implements OnInit {

  @ViewChild('sf', { static: false }) sf!: SFComponent;

  loading = false;
  me!: User | Admin;
  updatePasswordUrl!: string;

  schema: SFSchema = {
    type: 'object',
    properties: {
      current_password: {
        type: 'string',
        title: 'Password',
        minLength: 8,
        ui: {
          type: 'password',
        },
      },
      password: {
        type: 'string',
        title: 'Password',
        minLength: 8,
        ui: {
          type: 'password',
        },
      },
      password_confirmation: {
        type: 'string',
        title: 'Confirm password',
        minLength: 8,
        ui: {
          type: 'password',
          change: (val) => {
            const password = this.sf.getValue('/password');
            const confirmPasswordProp = this.sf.getProperty('/password_confirmation');
            if (val && val !== password) {
              confirmPasswordProp!.setParentAndPlatErrors([{
                keyword: 'not_match',
                message: 'Not match with password',
              }], '');
            }
          },
        } as SFStringWidgetSchema,
      },
    },
    required: ['current_password', 'password', 'password_confirmation'],
  };

  constructor(private http: _HttpClient,
              private cdr: ChangeDetectorRef,
              private msgSrv: NzMessageService,
              private settingService: SettingsService,
  ) {
  }

  ngOnInit() {
    this.me = <Admin | User>this.settingService.user;
    if (this.me.type === 'admin') {
      this.updatePasswordUrl = '/auth_admin/password';
    } else if (this.me.type === 'user') {
      this.updatePasswordUrl = '/auth_user/password';
    }
  }

  submit(formData: any): void {

    this.http.put(this.updatePasswordUrl, formData)
      .pipe(
        untilDestroyed(this),
        tap(() => {
          this.loading = true;
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }), // Success or not, turn off loading
        catchError((res: HttpErrorResponse) => {
          return throwError(res.error);
        }),
      )
      .subscribe(() => {
        this.sf.refreshSchema();
        this.msgSrv.success('Updated successfully !');
      }, (errRes: ErrorResponse) => {
        _each(errRes.errors, (errorObj: JsonApiError) => {
          const formProp = this.sf.getProperty('/' + errorObj.field);
          if (formProp) {
            formProp.setParentAndPlatErrors([{ keyword: 'server', message: errorObj.detail }], '');
          }
        });
      });
  }
}
