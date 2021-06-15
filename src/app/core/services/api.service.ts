import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient, _HttpHeaders } from '@delon/theme';
import { AlainConfigService } from '@delon/util/config';
import { environment } from '@env/environment';
import { QueryParam } from '@shared';
import { Service } from '@src/typings';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface HttpOptions {
  headers?: _HttpHeaders;
  observe?: 'body' | 'events' | 'response';
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
  service?: Service;
  castTo?: ClassConstructor<any>;
}

const { services } = environment;

const URL_SERVICE = {
  auth: services?.authServiceUrl,
  user: services?.userServiceUrl,
  super_admin: services?.superAdminServiceUrl,
};

const URL = (url: string, service: Service | undefined): string => {
  return service ? `${ URL_SERVICE[service] }${ url }` : url;
};

@Injectable({ providedIn: 'root' })
export class ApiService extends _HttpClient {
  constructor(http: HttpClient, cogSrv: AlainConfigService) {
    super(http, cogSrv);
  }

  // GET
  get(url: string, params?: QueryParam<any>, options?: HttpOptions): Observable<any>;
  get<T>(url: string, params?: QueryParam<any>, options?: HttpOptions): Observable<T>;
  get<T>(url: string, params: QueryParam<any>, options: HttpOptions): Observable<HttpEvent<T>>;
  get(url: string, params: QueryParam<any>, options: HttpOptions): Observable<HttpResponse<any>>;
  get(url: string, params: QueryParam<any>, options: HttpOptions): Observable<string>;
  get<T>(url: string, params: QueryParam<any>, options: HttpOptions): Observable<HttpResponse<T>>;
  get<T>(url: string, params?: QueryParam<any>, options?: HttpOptions): Observable<any> {
    return super.get(URL(url, options?.service), params, options).pipe(
      map(res => {
        if (options?.castTo) {
          res.data = plainToClass(options?.castTo as ClassConstructor<any>, res.data);
        }
        return res;
      }),
    );
  }

  // POST
  post(url: string, body: any, params: any, options: HttpOptions): Observable<string>;
  post<T>(url: string, body: any, params: any, options: HttpOptions): Observable<HttpEvent<T>>;
  post(url: string, body: any, params: any, options: HttpOptions): Observable<HttpResponse<any>>;
  post(url: string, body?: any, params?: any, options?: HttpOptions): Observable<any>;
  post<T>(url: string, body?: any, params?: any, options?: HttpOptions): Observable<T>;
  post<T>(url: string, body?: any, params?: any, options?: HttpOptions): Observable<T> {
    return super.post(URL(url, options?.service), body, params, options).pipe(
      map(res => {
        if (options?.castTo) {
          res.data = plainToClass(options?.castTo as ClassConstructor<any>, res.data);
        }
        return res;
      }),
    );
  }

  // PUT
  put(url: string, body: any, params: any, options: HttpOptions): Observable<string>;
  put(url: string, body: any, params: any, options: HttpOptions): Observable<HttpResponse<{}>>;
  put(url: string, body?: any, params?: any, options?: HttpOptions): Observable<any>;
  put<T>(url: string, body?: any, params?: any, options?: HttpOptions): Observable<T>;
  put<T>(url: string, body?: any, params?: any, options?: HttpOptions): Observable<any> {
    return super.put(URL(url, options?.service), body, params, options).pipe(
      map(res => {
        if (options?.castTo) {
          res.data = plainToClass(options?.castTo as ClassConstructor<any>, res.data);
        }
        return res;
      }),
    );
  }
}
