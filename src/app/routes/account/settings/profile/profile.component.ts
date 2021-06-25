import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { User } from '@core';
import { SFComponent, SFSchema, SFUploadWidgetSchema } from '@delon/form';
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
  selector: 'app-account-settings-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsProfileComponent implements OnInit {

  @ViewChild('sf', { static: false }) sf!: SFComponent;

  loading = true;
  user!: User;

  schema: SFSchema = {
    type: 'object',
    properties: {
      attributes: {
        type: 'object',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
          },
          image: {
            type: 'object',
            properties: {
              uploader: {
                title: 'Profile Image',
                type: 'string',
                ui: {
                  widget: 'upload',
                  type: 'select',
                  urlReName: 'url',
                  text: ' ',
                  hint: '',
                  listType: 'picture-card',
                  fileType: 'image/png,image/jpeg,image/gif,image/bmp',
                  multiple: false,
                  beforeUpload: this.beforeUpload.bind(this),
                } as SFUploadWidgetSchema,
              },
            },
          },
          email: {
            type: 'string',
            title: 'Email',
            format: 'email',
            readOnly: true,
          },
          mobile_phone: {
            type: 'string',
            title: 'Mobile',
            minLength: 9,
            maxLength: 20,
            pattern: '[0-9]+',
          },
        },
        required: ['name', 'email', 'mobile_phone'],
      },
    },
  };

  constructor(private http: _HttpClient,
              private cdr: ChangeDetectorRef,
              private msgSrv: NzMessageService) {
  }

  ngOnInit(): void {
    this.fetchUserProfile()
      .subscribe((user) => {
        this.user = user;
        this.setAttrValues();
      });
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

  fetchUserProfile(): Observable<User> {
    return this.http.get('/me/profile')
      .pipe(
        untilDestroyed(this),
        map((res) => {
          const user = new User();
          user.attributes = res.data.attributes;

          return user;
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }), // Success or not, turn off loading
      );
  }

  private setAttrValues() {
    _each(this.user.attributes, (attrValue: any, attrKey) => {
      const formProp = this.sf.getProperty(`/attributes/${attrKey}`);

      if (formProp) {
        // Set default value, will be used when click on "Reset" button
        formProp.schema.default = attrValue;

        // Set value for the form fields, will use when "Submit" form
        formProp.resetValue(attrValue, true);
      }

      if (attrKey === 'image' && attrValue) {
        const imageUploaderProp = this.sf.getProperty('/attributes/image/uploader');
        imageUploaderProp!.schema.enum = [
          { url: `${assetHost.baseUrl}${_get(attrValue, 'url')}` },
        ];
        imageUploaderProp?.widget.reset(null);
      }
    });
  }

  private beforeUpload(file: NzUploadFile, fileList: NzUploadFile[]): boolean | Observable<boolean> {
    const imageUploaderProp = this.sf.getProperty('/attributes/image/uploader');

    const reader = new FileReader();
    reader.readAsDataURL(file as any);
    reader.onload = (e: any) => {
      const base64String = e.target.result;
      if (this.user.attributes.image) {
        this.user.attributes.image.data = base64String;
      } else {
        this.user.attributes.image = { data: base64String };
      }

      imageUploaderProp!.schema.enum = [{ url: base64String }];
      imageUploaderProp?.widget.reset(null);
    };

    return false; // Cancel automatic upload
  }
}
