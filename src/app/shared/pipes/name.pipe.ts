import { Pipe, PipeTransform } from '@angular/core';

/**
 * This pipe is to strip '?' and '_' from permission name
 */
@Pipe({ name: 'capitalize' })
export class NamePipe implements PipeTransform {
  transform(value: string = '', ...args: unknown[]): unknown {
    value = this.capitalize(value);
    return value
      .replace(/(?<=_)(\w)/g, (c) => ' ' + c.toUpperCase())
      .replace(/[?_]/g, '');
  }

  capitalize(value: string = ''): string {
    return value.replace(value[0], value[0].toUpperCase());
  }
}
