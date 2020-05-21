import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsComponent } from './settings.component';
import { IphoneInstallComponent } from './iphone-install/iphone-install.component';
import { PageNotFoundComponent } from '@navigation/page-not-found/page-not-found.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: '', component:SettingsComponent,
    children: [
      { path: 'main', component: MainComponent},
      { path: 'install', component: IphoneInstallComponent}
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
