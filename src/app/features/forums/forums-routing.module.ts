import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForumsComponent } from './forums.component';


const routes: Routes = [
  { path: '', component: ForumsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForumsRoutingModule { }
