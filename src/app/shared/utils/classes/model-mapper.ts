export type Constructor<T> = new (...args: any[]) => T;

export default class ModelMapper<T> {
  private readonly _propertyMapping: any;
  private readonly _target: any;

  constructor(type: Constructor<T>) {
    this._target = new type();
    this._propertyMapping = this._target.constructor?._propertyMap;
  }

  map(source: any): any {
    Object
      .keys(this._target)
      .forEach((key = '') => {
        const mappedKey = this._propertyMapping[key];
        this._target[key] = mappedKey ? source[mappedKey] : source[key];
      });

    Object
      .keys(source)
      .forEach((key = '') =>
        this.notIn(key) && (this._target[key] = source[key]));

    return this._target;
  }

  notIn(key: string = ''): boolean {
    return !Object.keys(this._target).includes(key);
  }
}
