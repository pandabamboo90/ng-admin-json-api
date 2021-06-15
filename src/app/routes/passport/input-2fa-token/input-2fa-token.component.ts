import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { PassportService } from 'src/app/routes/passport/passport.service';

@Component({
  selector: 'passport-input-2fa-token',
  templateUrl: './input-2fa-token.component.html',
  styleUrls: ['./input-2fa-token.component.less'],
  providers: [PassportService],
})
export class UserInput2FATokenComponent implements OnInit {

  validateForm!: FormGroup;
  kycInfo!: any;

  constructor(
    private fb: FormBuilder,
    public http: HttpClient,
    private passportService: PassportService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.kycInfo = JSON.parse(sessionStorage.getItem('kyc_info') || 'null');
    sessionStorage.removeItem('kyc_info');
    this.requestSMSToken();

    this.validateForm = this.fb.group({
      email: [this.kycInfo.email],
      token: ['', [Validators.required]],
    });
  }

  submit(): void {
    this.http
      .post(environment.api.baseUrl + '/sign_in?_allow_anonymous=true', this.validateForm.value, { observe: 'response' })
      .subscribe((res: HttpResponse<any>) => {
        this.passportService.handleAuthSuccess(res);
      });
  }

  requestSMSToken(): void {
    this.http
      .post(environment.api.baseUrl + '/send_sms_otp?_allow_anonymous=true', this.kycInfo, { observe: 'response' })
      .subscribe((res: HttpResponse<any>) => {
        console.log('SMS MESSAGE RECEIVED');
      });
  }
}
