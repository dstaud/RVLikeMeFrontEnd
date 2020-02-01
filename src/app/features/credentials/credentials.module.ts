import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { CredentialsRoutingModule } from './credentials-routing.module';
import { CredentialsComponent } from './credentials.component';


@NgModule({
  declarations: [
    CredentialsComponent
  ],
  imports: [
    CommonModule,
    CredentialsRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class CredentialsModule { }
