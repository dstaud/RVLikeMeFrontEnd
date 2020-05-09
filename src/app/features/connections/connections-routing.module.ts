import { ConnectionsComponent } from './connections.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './main/main.component';
import { UserQueryComponent } from './user-query/user-query.component';


const routes: Routes = [
  { path: '', component: ConnectionsComponent,
  children: [
    { path: 'main', component: MainComponent},
    { path: 'user-query', component: UserQueryComponent },
  ]  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConnectionsRoutingModule { }
