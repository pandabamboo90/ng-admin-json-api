import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CacheService as AlainCache, ICacheStore } from '@delon/cache';
import { AlainConfigService } from '@delon/util';
import { CACHE_TOKEN, Entities, IResponse } from '@shared';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable } from 'rxjs';

type CacheOptions = { expire?: number };

type OptionalType = CacheOptions & { type?: 's' };

type WithType = CacheOptions & { type: 'm' | 's' };

/**
 * Extended from Delon CacheService with type defined for set functions
 */
@Injectable()
export class CacheService<T> extends AlainCache {
  constructor(@Inject(CACHE_TOKEN) store: ICacheStore, http: HttpClient, cogSrv: AlainConfigService) {
    super(cogSrv, store, http);
  }

  getNone<K>(key: Entities): K {
    return super.getNone(key);
  }

  set(key: Entities, data: IResponse<T>, options: WithType): void;

  set(key: Entities, data: IResponse<T>, options?: OptionalType): void;

  set(key: Entities, data: Observable<NzSafeAny>, options?: OptionalType): Observable<NzSafeAny>;

  set<K>(key: Entities, data: Observable<K>, options?: OptionalType): Observable<K>;

  set(key: Entities, data: IResponse<T> | Observable<NzSafeAny>, options: OptionalType & WithType): void | Observable<NzSafeAny> {
    super.set(key, data, options);
    return super.set(key, data, options);
  }
}
