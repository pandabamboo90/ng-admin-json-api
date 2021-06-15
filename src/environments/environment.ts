// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Environment } from '@delon/theme';
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
import 'zone.js/dist/zone-error'; // Included with Angular CLI.
import { version } from '../../package.json';

export const environment = {
  appVersion: version,
  production: false,
  useHash: true,
  api: {
    baseUrl: '//localhost:3000/api/v1',
    refreshTokenEnabled: false,
    refreshTokenType: 'auth-refresh',
  },
  // modules: [DelonMockModule.forRoot({ data: MOCKDATA })],
} as Environment;
