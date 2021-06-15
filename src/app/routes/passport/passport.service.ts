import { HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StartupService } from '@core';
import { DA_SERVICE_TOKEN, ITokenModel, ITokenService } from '@delon/auth';

@Injectable()
export class PassportService {
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    private router: Router,
  ) {}

  handleAuthSuccess(res: HttpResponse<any>): void {
    const credentials = JSON.stringify({
      accessToken: res.headers.get('access-token') || '',
      tokenType: res.headers.get('token-type') || '',
      expiry: res.headers.get('expiry') || '',
      client: res.headers.get('client') || '',
      uid: res.headers.get('uid') || '',
    });

    const token: ITokenModel = {
      token: credentials,
      // expired: +new Date() + 1000 * 60 * 5
      expired: parseInt(res.headers.get('expiry') || '0', 10) * 1000,
    };
    this.tokenService.set(token);

    // Get the StartupService content, we always believe that the application information
    // will generally be affected by the scope of authorization of the current user
    this.startupSrv.load().then(() => {
      let url = this.tokenService.referrer!.url || '/';
      if (url.includes('/passport')) {
        url = '/';
      }
      this.router.navigateByUrl(url).then();
    });
  }
}
