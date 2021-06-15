import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeviseTokenAuthInterceptor implements HttpInterceptor {

  constructor(private injector: Injector,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.get()?.token;

    if (token) {
      const credentials: any = JSON.parse(token);

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Accept', 'application/vnd.api+json');
      headers = headers.append('Content-Type', 'application/vnd.api+json');
      headers = headers.append('access-token', credentials.accessToken);
      headers = headers.append('token-type', credentials.tokenType);
      headers = headers.append('client', credentials.client);
      headers = headers.append('expiry', credentials.expiry);
      headers = headers.append('uid', credentials.uid);
      req = req.clone({ headers });
    }
    return next.handle(req);
  }
}
