// # 3rd Party Library
// If the library doesn't have typings available at `@types/`,
// you can still use it by manually adding typings for it
import { Environment } from '@delon/theme';

type Service = 'auth' | 'user' | 'super_admin' | '';

type ServicesKey = 'user' | 'superAdmin';

type ServicesValueV1 = 'user' | 'super_admin';

type ServiceAuth = { authServiceUrl: '/auth_service/auth' };

type ServiceV1 = { [key in `${ ServicesKey }ServiceUrl`]: `/${ ServicesValueV1 }_service/api/v1` };

type ServicesUrl = ServiceV1 & ServiceAuth;

declare module '@delon/theme' {
  interface EnvironmentServices extends Environment {
    services?: ServicesUrl;
  }
}
