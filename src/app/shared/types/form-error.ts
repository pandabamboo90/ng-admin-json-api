export type FormError<T = {}> = { [key in keyof T]: string[] };
