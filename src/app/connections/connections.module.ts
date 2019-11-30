import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConnectionsRoutingModule } from './connections-routing.module';
import { ConnectionsComponent } from './connections.component';
import { SharedModule } from '../translate/translate.module';


@NgModule({
  declarations: [ConnectionsComponent],
  imports: [
    CommonModule,
    ConnectionsRoutingModule,
    SharedModule
  ]
})
export class ConnectionsModule { }
