import { IAccessLevel } from '@src/app/shared';

export type Entry = [key: keyof IAccessLevel | string, value: boolean];
