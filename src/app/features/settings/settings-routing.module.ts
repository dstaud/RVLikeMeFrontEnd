import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsComponent } from './settings.component';
import { NotificationSettingsComponent } from './notification-settings/notification-settings.component';
import { PageNotFoundComponent } from '@pageNotFound/page-not-found.component';

const routes: Routes = [
  { path: '', component: SettingsComponent,
    children: [
      { path: 'notification-settings', component: NotificationSettingsComponent }
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
