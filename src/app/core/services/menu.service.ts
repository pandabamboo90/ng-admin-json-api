import { Inject, Injectable } from '@angular/core';
import { ACLService } from '@delon/acl';
import { ALAIN_I18N_TOKEN, Menu, MenuService as AlainMenu } from '@delon/theme';
import { AlainI18NService } from '@delon/theme/src/services/i18n/i18n';
import { Entity } from '@shared';

@Injectable()
export class MenuService extends AlainMenu {
  constructor(@Inject(ALAIN_I18N_TOKEN) private alainI18NSrv: AlainI18NService, private aclSrv: ACLService) {
    super(alainI18NSrv, aclSrv);
  }

  setItem(key: Entity, value: Menu): void { super.setItem(key, value); }

  getItem(key: Entity): Menu | null { return super.getItem(key); }
}
