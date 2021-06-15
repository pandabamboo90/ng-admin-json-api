import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IUser } from '@shared';
import { PassportService } from 'src/app/routes/passport/passport.service';

@UntilDestroy()
@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [PassportService],
})
export class UserLoginComponent implements OnInit {

  validateForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public http: HttpClient,
    private passportService: PassportService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember: [true],
    });
  }

  submit(): void {
    this.http
      .post<IUser & { authy_token: string }>(environment.api.baseUrl + '/verify?_allow_anonymous=true', this.validateForm.value, { observe: 'response' })
      // .post(environment.api.baseUrl + '/sign_in?_allow_anonymous=true', this.validateForm.value, { observe: 'response' })
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        if (res.body?.must_kyc && !res.body.kyc_passed) {
          // 2FA
          sessionStorage.setItem('kyc_info', JSON.stringify({
            email: res.body.email,
            authy_token: res.body.authy_token,
          }));
          this.router.navigateByUrl(`/passport/input-2fa-token`).then();
        } else {
          this.passportService.handleAuthSuccess(res);
        }
      });
  }
}
