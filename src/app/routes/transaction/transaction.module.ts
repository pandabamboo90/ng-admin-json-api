import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { TransactionTransactionListComponent } from './transaction-list/transaction-list.component';
import { TransactionRoutingModule } from './transaction-routing.module';

const COMPONENTS: Type<void>[] = [TransactionTransactionListComponent];

const MODULES: Type<any>[] = [SharedModule, TransactionRoutingModule];

@NgModule({
  imports: [...MODULES],
  declarations: COMPONENTS,
})
export class TransactionModule {}
