import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SettingsRoutingModule } from './settings-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { SettingsComponent } from './settings.component';
import { NotificationSettingsComponent } from './notification-settings/notification-settings.component';
import { IphoneInstallComponent } from './iphone-install/iphone-install.component';
import { MainComponent } from './main/main.component';


@NgModule({
  declarations: [
    SettingsComponent,
    NotificationSettingsComponent,
    IphoneInstallComponent,
    MainComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class SettingsModule { }
