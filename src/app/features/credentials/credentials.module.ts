import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { CredentialsRoutingModule } from './credentials-routing.module';
import { CredentialsComponent } from './credentials.component';
import { ChangeUsernameComponent } from './change-username/change-username.component';
import { ChangePasswordComponent } from './change-password/change-password.component';


@NgModule({
  declarations: [
    CredentialsComponent,
    ChangeUsernameComponent,
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    CredentialsRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class CredentialsModule { }
