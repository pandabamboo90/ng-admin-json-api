import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
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
  ) {
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: ['admin@example.com', [Validators.required]],
      password: ['password@', [Validators.required]],
      remember: [true],
    });
  }

  submit(): void {
    this.http
      .post('/auth_admin/sign_in?_allow_anonymous=true', this.validateForm.value, { observe: 'response' })
      .pipe(untilDestroyed(this))
      .subscribe((res: HttpResponse<any>) => {
        this.passportService.handleAuthSuccess(res);
      });
  }
}
