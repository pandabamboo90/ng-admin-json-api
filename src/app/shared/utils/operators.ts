import { ApiService, StartupService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, from, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { catchError as rxCatchError, switchMap as rxSwitchMap, tap } from 'rxjs/operators';

type Callback = (...args: any[]) => string | void | any;

export interface IMsgObject {
  msgSrv: NzMessageService;
  notificationSrv: NzNotificationService;
  show: Callback; // return error string message
}

export interface IProfileObject {
  http: ApiService;
  startupSrv: StartupService;
  msgObj?: IMsgObject;
}

/**
 * Hide default notification by interceptor
 * - @param msgObj: MsgObject
 * - @return MonoTypeOperatorFunction<T>
 */
export const catchError = <T>(
  { notificationSrv, msgSrv, show }: IMsgObject,
  callback?: Callback,
): MonoTypeOperatorFunction<T> => (
  source$ => source$.pipe(
    rxCatchError(({ error = {} }) => {
      notificationSrv?.remove();

      if (callback) {
        callback();
      }

      if (show) {
        msgSrv?.error(show(error));
      }

      return EMPTY;
    }),
  )
);

/**
 * Use this operator to update user profile automatically
 * by using switchMap operator to fetch '/me/profile' api
 * - @param http: ApiService
 * - @param startupSrv: StartupService
 * - @param msgObj: MsgObject
 * - @param callback: (...args: any[]) => any
 */
export const updateProfile = <T>(
  { http, startupSrv, msgObj }: IProfileObject,
  updateCurrency: boolean = false,
  onReady?: Callback,
) => {
  return (source$: Observable<T>) => source$.pipe(
    rxSwitchMap(_ => {
        if (onReady) {
          onReady();
        }

        return http.get('/me/profile', {}, { service: 'user' })
          .pipe(
            (msgObj ? catchError(msgObj) : rxCatchError(err => EMPTY)),
            tap(({ data: userData }) => startupSrv.setUserData(userData)),
          );
      },
    ),
    (updateCurrency ? updateCurrencies({ startupSrv, msgObj }) : from),
  );
};

export const updateCurrencies = <T>(
  { startupSrv, msgObj }: Partial<IProfileObject>,
  callback?: Callback,
) => {
  return (source$: Observable<T>) => source$.pipe(
    rxSwitchMap(_ => {
        if (callback) {
          callback();
        }

        return startupSrv!.fetchCurrencies()
          .pipe(
            (msgObj ? catchError(msgObj) : rxCatchError(err => EMPTY)),
            tap(({ data }) => startupSrv!.setData('currency', data)),
          );
      },
    ),
  );
};
