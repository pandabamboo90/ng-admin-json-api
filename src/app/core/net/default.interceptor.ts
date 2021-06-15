import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponseBase,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, mergeMap, switchMap, take } from 'rxjs/operators';

const CODEMESSAGE: { [key: number]: string } = {
  200: 'Success',
  201: 'Created',
  202: 'A request has entered the background queue (asynchronous task).',
  204: 'Operation succeed',
  400: 'Bad request',
  401: 'Unauthenticated',
  403: 'Permission denied',
  404: 'Not found',
  406: 'The requested format is not available',
  410: 'The requested resource is permanently deleted and will no longer be available',
  422: 'Validation error',
  500: 'Internal server error',
  502: 'Bad gateway',
  503: 'The service is unavailable, and the server is temporarily overloaded or maintained',
  504: 'Gateway timeout。',
};

/**
 * The default HTTP interceptor, please refer to `app.module.ts` for registration details
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  private refreshTokenEnabled = environment.api.refreshTokenEnabled;
  private refreshTokenType: 're-request' | 'auth-refresh' = environment.api.refreshTokenType;
  private refreshToking = false;
  private refreshToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private injector: Injector) {
    if (this.refreshTokenType === 'auth-refresh') {
      this.buildAuthRefresh();
    }
  }

  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  private get tokenSrv(): ITokenService {
    return this.injector.get(DA_SERVICE_TOKEN);
  }

  private get http(): _HttpClient {
    return this.injector.get(_HttpClient);
  }

  private goTo(url: string): void {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
  }

  private checkStatus(ev: HttpResponseBase): void {
    if ((ev.status >= 200 && ev.status < 300) || ev.status === 401) {
      return;
    }

    const errortext = CODEMESSAGE[ev.status] || ev.statusText;
    this.notification.error(`Request error ${ev.status}: ${ev.url}`, errortext);
  }

  /**
   * Refresh token request
   */
  private refreshTokenRequest(): Observable<any> {
    const model = this.tokenSrv.get();
    return this.http.post(`/api/auth/refresh`, null, null, { headers: { refresh_token: model?.refresh_token || '' } });
  }

  // #region Refresh Token Method 1: Use 401 to refresh Token

  private tryRefreshToken(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // 1、If the request is a refresh token request, it means that the refresh token can directly jump to the login page
    if ([`/api/auth/refresh`].some((url) => req.url.includes(url))) {
      this.toLogin();
      return throwError(ev);
    }
    // 2、If `refreshToking` is `true`, it means that it has been requested to refresh the Token, and all subsequent requests will enter the waiting state until the result is returned before re-initiating the request
    if (this.refreshToking) {
      return this.refreshToken$.pipe(
        filter((v) => !!v),
        take(1),
        switchMap(() => next.handle(this.reAttachToken(req))),
      );
    }
    // 3、Try to call refresh token
    this.refreshToking = true;
    this.refreshToken$.next(null);

    return this.refreshTokenRequest().pipe(
      switchMap((res) => {
        // Notify subsequent requests to continue execution
        this.refreshToking = false;
        this.refreshToken$.next(res);
        // Resave the new token
        this.tokenSrv.set(res);
        // Re-initiate request
        return next.handle(this.reAttachToken(req));
      }),
      catchError((err) => {
        this.refreshToking = false;
        this.toLogin();
        return throwError(err);
      }),
    );
  }

  /**
   * Re-attach new token information
   *
   * > Because of the request that has already been initiated, we will not go through `@delon/auth` again, so we need to reattach a new Token based on the business situation
   */
  private reAttachToken(req: HttpRequest<any>): HttpRequest<any> {
    // The following example is based on NG-ALAIN using `SimpleInterceptor` by default
    const token = this.tokenSrv.get()?.token;
    return req.clone({
      setHeaders: {
        token: `Bearer ${token}`,
      },
    });
  }

  // #endregion

  // #region Token refresh method 2: Use the `refresh` interface of `@delon/auth`

  private buildAuthRefresh(): void {
    if (!this.refreshTokenEnabled) {
      return;
    }
    this.tokenSrv.refresh
      .pipe(
        filter(() => !this.refreshToking),
        switchMap((res) => {
          console.log(res);
          this.refreshToking = true;
          return this.refreshTokenRequest();
        }),
      )
      .subscribe(
        (res) => {
          // TODO: Mock expired value
          res.expired = +new Date() + 1000 * 60 * 5;
          this.refreshToking = false;
          this.tokenSrv.set(res);
        },
        () => this.toLogin(),
      );
  }

  // #endregion

  private toLogin(): void {
    this.notification.error(`Unauthenticated`, `Unauthenticated or session expired, please log in again.`);
    this.goTo('/passport/login');
  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    this.checkStatus(ev);
    // Business processing: some common operations
    switch (ev.status) {
      case 200:
        // 业务层级错误处理，以下是假定restful有一套统一输出格式（指不管成功与否都有相应的数据格式）情况下进行处理
        // 例如响应内容：
        //  错误内容：{ status: 1, msg: '非法参数' }
        //  正确内容：{ status: 0, response: {  } }
        // 则以下代码片断可直接适用
        // if (ev instanceof HttpResponse) {
        //   const body = ev.body;
        //   if (body && body.status !== 0) {
        //     this.injector.get(NzMessageService).error(body.msg);
        //     // 继续抛出错误中断后续所有 Pipe、subscribe 操作，因此：
        //     // this.http.get('/').subscribe() 并不会触发
        //     return throwError({});
        //   } else {
        //     // 重新修改 `body` 内容为 `response` 内容，对于绝大多数场景已经无须再关心业务状态码
        //     return of(new HttpResponse(Object.assign(ev, { body: body.response })));
        //     // 或者依然保持完整的格式
        //     return of(ev);
        //   }
        // }
        break;
      case 401:
        if (this.refreshTokenEnabled && this.refreshTokenType === 're-request') {
          return this.tryRefreshToken(ev, req, next);
        }
        this.toLogin();
        break;
      case 403:
      // case 404:
      case 500:
        this.goTo(`/exception/${ev.status}`);
        break;
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn(
            'Unknown errors, mostly caused by the backend does not support cross-domain CORS or invalid configuration, please refer to https://ng-alain.com/docs/server to solve cross-domain issues',
            ev,
          );
        }
        break;
    }
    if (ev instanceof HttpErrorResponse) {
      return throwError(ev);
    } else {
      return of(ev);
    }
  }

  private getAdditionalHeaders(headers?: HttpHeaders): { [name: string]: string } {
    const res: { [name: string]: string } = {};
    const lang = this.injector.get(ALAIN_I18N_TOKEN).currentLang;
    if (!headers?.has('Accept-Language') && lang) {
      res['Accept-Language'] = lang;
    }

    return res;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Uniformly add server prefix
    let url = req.url;
    if (!url.startsWith('https://') && !url.startsWith('http://') && !req.params.has('skip_interceptor')) {
      url = environment.api.baseUrl + url;
    }

    const newReq = req.clone({ url, setHeaders: this.getAdditionalHeaders(req.headers) });
    return next.handle(newReq).pipe(
      mergeMap((ev) => {
        // Allow unified handling of request errors
        if (ev instanceof HttpResponseBase) {
          return this.handleData(ev, newReq, next);
        }
        // If everything is normal, follow up operations
        return of(ev);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err, newReq, next)),
    );
  }
}
