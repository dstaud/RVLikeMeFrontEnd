import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MessagesRoutingModule } from './messages-routing.module';
import { MessagesComponent } from './messages.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [MessagesComponent],
  imports: [
    CommonModule,
    MessagesRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class MessagesModule { }
