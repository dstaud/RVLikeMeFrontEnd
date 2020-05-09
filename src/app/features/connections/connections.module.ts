import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ConnectionsRoutingModule } from './connections-routing.module';
import { ConnectionsComponent } from './connections.component';
import { SharedModule } from '../../shared/shared.module';
import { UserQueryComponent } from './user-query/user-query.component';
import { MainComponent } from './main/main.component';


@NgModule({
  declarations: [ConnectionsComponent, UserQueryComponent, MainComponent],
  imports: [
    CommonModule,
    ConnectionsRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class ConnectionsModule { }
