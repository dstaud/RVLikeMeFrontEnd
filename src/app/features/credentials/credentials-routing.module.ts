import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CredentialsComponent } from './credentials.component';

import { ChangeUsernameComponent } from './change-username/change-username.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { PageNotFoundComponent } from '@pageNotFound/page-not-found.component';


const routes: Routes = [
  { path: '', component: CredentialsComponent,
    children: [
      { path: 'change-username', component: ChangeUsernameComponent},
      { path: 'change-password', component: ChangePasswordComponent },
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CredentialsRoutingModule { }
