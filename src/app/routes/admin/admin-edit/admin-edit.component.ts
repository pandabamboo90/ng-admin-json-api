import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Admin, AdminApi } from '@core';
import { SFComponent, SFSchema, SFStringWidgetSchema, SFUploadWidgetSchema } from '@delon/form';
import { assetHost } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ErrorResponse, JsonApiError } from '@shared';
import { assign as _assign, each as _each, get as _get, omit as _omit } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable } from 'rxjs';
import { filter, finalize, tap } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-admin-edit',
  templateUrl: './admin-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEditComponent implements OnInit {

  @ViewChild('sf', { static: false }) sf!: SFComponent;

  id!: string;
  title!: string;
  subTitle!: string;
  admin!: Admin;
  loading = false;
  requiredAttrs: string[] = ['name', 'email', 'mobile_phone', 'password', 'password_confirmation'];
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
          },
          mobile_phone: {
            type: 'string',
            title: 'Mobile',
            minLength: 9,
            maxLength: 20,
            pattern: '[0-9]+',
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
        required: this.requiredAttrs,
      },
    },
  };

  constructor(
    private msgSrv: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
    private adminApi: AdminApi,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id.toString();

    if (this.id === 'new') {
      this.title = this.subTitle = 'Add Admin';
      this.admin = this.adminApi.new();
      this.admin.attributes = new Admin().attributes;
    } else {
      this.title = `Edit Admin`;
      this.subTitle = `ID: ${this.id}`;

      this.fetchAdminById(this.id)
        .subscribe(() => {
          this.setAttrValues();
          this.updateUIForEditForm();
        });
    }
  }

  submit(formData: any): void {
    this.admin.attributes = _assign({}, this.admin.attributes, _omit(formData.attributes, ['image']));

    this.admin
      .save()
      .pipe(
        untilDestroyed(this),
        tap(() => {
          this.loading = true;
          this.cdr.detectChanges();
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }), // Success or not, turn off loading
      )
      .subscribe(res => {
        this.msgSrv.success('Updated successfully !');
        this.router.navigateByUrl(`/admin/list`);
      }, (errRes: ErrorResponse) => {
        _each(errRes.errors, (errorObj: JsonApiError) => {
          const formProp = this.sf.getProperty('/attributes/' + errorObj.field);

          if (formProp) {
            formProp.setParentAndPlatErrors([{ keyword: 'server', message: errorObj.detail }], '');
          }
        });
      });
  }

  fetchAdminById(id: string): Observable<Admin> {
    return this.adminApi.get(id)
      .pipe(
        untilDestroyed(this),
        filter(res => res.loaded),
        tap((res) => this.admin = res),
      );
  }

  private updateUIForEditForm(): void {
    // Set email as readonly field
    this.sf.getProperty('/attributes/email')!.schema.readOnly = true;

    // Remove the password fields as we dont' want admin to accidentally update password
    this.sf.getProperty('/attributes')!.schema.required = _omit(this.requiredAttrs, ['password', 'password_confirmation']) as string[];
    this.sf.getProperty('/attributes/password')?.setVisible(false);
    this.sf.getProperty('/attributes/password_confirmation')?.setVisible(false);
  }

  private setAttrValues() {
    _each(this.admin.attributes, (attrValue: any, attrKey) => {
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
      if (this.admin.attributes.image) {
        this.admin.attributes.image.data = base64String;
      } else {
        this.admin.attributes.image = { data: base64String };
      }

      imageUploaderProp!.schema.enum = [{ url: base64String }];
      imageUploaderProp?.widget.reset(null);
    };

    return false; // Cancel automatic upload
  }
}
