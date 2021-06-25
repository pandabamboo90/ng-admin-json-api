import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { User } from '@core';
import { SFComponent, SFSchema, SFStringWidgetSchema, SFUploadWidgetSchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { assetHost } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ErrorResponse, JsonApiError } from '@shared';
import { assign as _assign, each as _each, get as _get, omit as _omit } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

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
  user!: User;

  schema: SFSchema = {
    type: 'object',
    properties: {
      attributes: {
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
                const password = this.sf.getValue('/attributes/password');
                const confirmPasswordProp = this.sf.getProperty('/attributes/password_confirmation');
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
      },
    },
  };

  constructor(private http: _HttpClient,
              private cdr: ChangeDetectorRef,
              private msgSrv: NzMessageService) {
  }

  ngOnInit(): void {
  }

  submit(formData: any): void {
    this.user.attributes = _assign({}, this.user.attributes, _omit(formData.attributes, ['image']));

    this.user
      .save()
      .pipe(
        untilDestroyed(this),
        tap(() => {
          this.loading = true;
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }), // Success or not, turn off loading
      )
      .subscribe(res => {
        this.msgSrv.success('Updated successfully !');
      }, (errRes: ErrorResponse) => {
        _each(errRes.errors, (errorObj: JsonApiError) => {
          const formProp = this.sf.getProperty('/attributes/' + errorObj.field);

          if (formProp) {
            formProp.setParentAndPlatErrors([{ keyword: 'server', message: errorObj.detail }], '');
          }
        });
      });
  }
}
