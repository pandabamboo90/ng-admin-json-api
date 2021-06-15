import { InjectionToken } from '@angular/core';
import { ICacheStore } from '@delon/cache';
import { Entity, IEndpoint } from '@shared';

export const CACHE_TOKEN = new InjectionToken<ICacheStore>('CacheToken');

export const ADMIN_URL_TOKEN = new InjectionToken<IEndpoint<Entity>>('AdminUrl');
