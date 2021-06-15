import { AfterViewInit, ChangeDetectorRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, CacheService, StartupService } from '@core';
import { STChange, STColumn, STColumnFilter, STComponent } from '@delon/abc/st';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  Entities,
  Entity,
  FilterParam,
  ICurrency,
  IEndpoint,
  IndexedType,
  IResponse,
  IResponseMeta,
  QueryParam,
  SortParam,
} from '@shared';
import { Ability } from '@src/app/shared/utils/classes/ability';
import { EMPTY, merge, Observable, of } from 'rxjs';
import { catchError, filter, finalize, map, startWith, switchMap, take, tap } from 'rxjs/operators';

/**
 * Extend this class for quick list page setup with set of available functions
 * - This class provide some basic table methods such as
 * - @method fetchList - fetch list of items
 * - @method sort - sort items
 * - @method filter - filter items
 * - @method pi - page index change
 * - @method ps - page size change
 */
@UntilDestroy()
export abstract class BaseList<T extends IndexedType> extends Ability<T> implements OnInit, AfterViewInit {
  @ViewChild('st') protected readonly st!: STComponent;
  columns: STColumn[] = [];

  data: T[] = [];
  meta: IResponseMeta = {
    page: 1, // page index
    per_page: 10, // page size
    total: 0,
  };
  params: QueryParam<T> = {
    'page[size]': this.meta.per_page,
    'page[number]': this.meta.page,
    sort: '-id' as SortParam<T>,
  };
  sortCols: (keyof T)[] = [];

  cache = false;
  loading = false;

  ngZone: NgZone = new NgZone({});

  protected constructor(
    protected urlEndpoint: IEndpoint<Entity>,
    protected router: Router,
    protected http: ApiService,
    protected cdRef: ChangeDetectorRef,
    protected startupSrv: StartupService,
    protected cacheSrv?: CacheService<T>,
  ) {
    super(startupSrv);
  }

  /**
   * Function return api endpoint such as 'user', 'admin',...
   * - Entity is used in addNew() and fetchList() functions
   * @protected
   */
  protected abstract get entity(): Entity;

  public get entities(): Entities {
    return `${ this.entity }s` as Entities;
  }

  /**
   * Return class model for object transformation
   * @protected
   */
  protected abstract get modelInstance(): new (...args: any[]) => any | undefined;

  /**
   * Function invoked when any error(s) occurred during fetching records process
   * @protected
   */
  protected abstract onError(...args: any[]): void;

  /**
   * Function invoked after fetching records successfully
   * @param args: any[]
   * @return void
   */
  protected abstract onSuccess(...args: any[]): void;

  /**
   * Redirect function for creating new item
   * @param page
   */
  addNew(page: string = `/${ this.entity }/new`): void {
    this.router.navigateByUrl(page).then();
  }

  /**
   * Enable/Disable sort on specific column(s)
   * @param cols: string[]
   * @param enable: boolean
   */
  sortOn(cols: (keyof T)[] = [...this.sortCols], enable: boolean = true): void {
    this.ngZone.runOutsideAngular((_) => {
      for (const col of cols) {
        const idx = this.columns.findIndex(({ index = '' }) => index === col);
        if (idx > -1 && enable) {
          this.ngZone.run((__) => (this.columns[idx] = { ...this.columns[idx], sort: true }));
        } else {
          this.ngZone.run((__) => delete this.columns[idx]?.sort);
        }
      }
    });
  }

  ngOnInit(): void {
    this.sortOn();
  }

  ngAfterViewInit(): void {
    this.setCurrencyTags();

    merge(...this.events)
      .pipe(
        tap((_) => (this.loading = true)),
        switchMap((_) => this.fetchList()),
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe((res) => {
        this.loading = false;
        this.setData(res);
      });
  }

  protected setCurrencyTags(): void {
    const currencies: ICurrency[] = this.startupSrv.getData('currency') || [];
    const tag = currencies.reduce((acc, { currency_code }) =>
      ({
        ...acc,
        [currency_code]: {
          text: currency_code.toUpperCase(),
          color: 'blue',
        },
      }), {});
    const index = this.columns.findIndex(col => col.index === 'cash_type');

    this.columns[index] = { ...this.columns[index], tag };
    this.st.resetColumns().then();
  }

  /******************** CACHE ************************/
  protected get hasCache(): boolean {
    return !!this?.cacheSrv?.getNone<IResponse<T>>(this.entities);
  }

  protected get useCache(): boolean {
    return this.cache && this.hasCache;
  }

  /******************** CACHE ************************/

  protected fetchList(): Observable<IResponse<T>> {
    const { data, meta } = this.cacheSrv?.getNone<IResponse<T>>(this.entities) || {
      data: [], meta: {
        per_page: 10,
        page: 1,
        total: 0,
      },
    };
    const observable = {
      true: of<IResponse<T>>({ data, meta }).pipe(
        tap(_ => {
          this.cache = false;
          this.cacheSrv?.remove(this.entities);
        }),
      ),
      false: this.http.get<IResponse<T>>(`${ this.urlEndpoint.base }/${ this.entity }s`, this.params),
    };

    return observable[`${ this.useCache }` as 'true' | 'false']
      .pipe(
        map((res) => {
          if (this.modelInstance) {
            res.data = [...this.plainToClass(this.modelInstance, res.data, { excludeExtraneousValues: true })];
          }
          return res;
        }),
        catchError((err) => {
          this.loading = false;
          this.onError(err);
          return EMPTY;
        }),
        untilDestroyed(this),
      );

    // return this.http.get<IResponse<T>>(`${ this.urlEndpoint.base }/${ this.entity }s`, this.params)
    //   .pipe(
    //     catchError((err) => {
    //       this.loading = false;
    //       this.onError(err);
    //       return EMPTY;
    //     }),
    //     map((res) => {
    //       if (this.modelInstance) {
    //         res.data = [...this.plainToClass(this.modelInstance, res.data, { excludeExtraneousValues: true })];
    //       }
    //       return res;
    //     }),
    //     untilDestroyed(this),
    //   );
  }

  protected get noData(): boolean {
    return this.data.length === 0;
  }

  /**
   * Set new data after fetch records success
   * @protected
   */
  protected setData(res: IResponse<T>): void {
    this.data = [...res.data] || [];
    this.meta = { ...res.meta };
    if (this.noData) {
      this.sortOn(this.sortCols, false);
      this.table.resetColumns().then();
    }
    this.onSuccess(res);
    this.cdRef.detectChanges();
  }

  /******************** TABLE ************************/
  /**
   * Table instance
   * @protected
   */
  protected get table(): STComponent {
    if (!this?.st) {
      throw new Error('Table reference does not exist!!!');
    }

    return this!.st;
  }

  /**
   * Sort event
   * @protected
   */
  protected get sort(): Observable<STChange> {
    return this.table.change.pipe(
      filter((ev: STChange) => ev?.type === 'sort'),
      tap(({ sort }) => {
        this.params = { ...this.params, ...this.parse(sort?.map, 'sort') };
      }),
    );
  }

  /**
   * Filter event
   * @protected
   */
  protected get filter(): Observable<STChange> {
    return this.table.change.pipe(
      filter((ev: STChange) => ev?.type === 'filter'),
      tap(({ filter: filterVal }) => {
        this.params = { ...this.params, ...this.parse(filterVal?.filter, 'filter') };
      }),
    );
  }

  /**
   * Page index event
   * @protected
   */
  protected get pi(): Observable<STChange> {
    return this.table.change.pipe(
      filter((ev: STChange) => ev?.type === 'pi'),
      tap(({ pi }: STChange) => {
        this.meta.page = pi;
        this.params['page[number]'] = pi;
      }),
      startWith({
        type: 'pi',
        pi: 1,
        ps: 10,
        total: 0,
      }),
    );
  }

  /**
   * Page size event
   * @protected
   */
  protected get ps(): Observable<STChange> {
    return this.table.change.pipe(
      filter((ev: STChange) => ev?.type === 'ps'),
      tap(({ ps }: STChange) => {
        this.meta.per_page = ps;
        this.params['page[size]'] = ps;
      }),
    );
  }

  /**
   * Item loaded event
   * @protected
   */
  protected get load(): Observable<STChange> {
    return this.table.change.pipe(
      filter((ev: STChange) => ev?.type === 'loaded'),
      take(1),
    );
  }

  /**
   * Use this function to add more event(s) for watching changes
   * @protected
   */
  protected get addEvents(): Observable<any>[] {
    return [];
  }

  /**
   * Return all watching events
   * @protected
   */
  protected get events(): Observable<STChange | IndexedType>[] {
    return [
      this.sort,
      this.filter,
      this.pi,
      this.ps,
      // this.load,
      ...this.addEvents,
    ];
  }

  /**
   * Parse query params for sorting and filtering items
   * @protected
   */
  protected parse(obj: IndexedType = {}, act: 'sort' | 'filter'): IndexedType {
    const result: IndexedType = {
      sort: () => {
        let sortCols: string[] = (Object.values(obj).filter(Boolean)[0] as string)?.split('-') || [];
        sortCols = sortCols.map((col) => {
          if (col.indexOf('descend') > -1) {
            col = `-${col}`;
          }
          return col.replace(/\.ascend|\.descend/, '');
        });
        return sortCols?.length > 0 ? { sort: sortCols.join() as SortParam<T> } : { sort: 'id' };
        /* Use 2 below lines of code in case of single sort */
        // const [field, direction] = Object.entries(obj)[0] || [];
        // return field ? { sort: direction === 'ascend' ? field : `-${ field }` } : { sort: '' };
      },
      filter: () => {
        const { key, menus = [] } = obj as STColumnFilter;
        return menus
          .filter(({ checked = false }) => checked)
          .reduce((acc, { value }) => ({ ...acc, ...{ [`filter[${ key }]`]: value } }), {}) as FilterParam<T>;
      },
    };

    return result[act]();
  }

  trackByFn(index: number, item: T): any {
    return item || index;
  }
  /******************** TABLE ************************/
}
