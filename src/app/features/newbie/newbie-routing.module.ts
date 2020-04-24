import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewbieComponent } from './newbie.component';
import { NewbieTopicsComponent } from './newbie-topics/newbie-topics.component';
import { InternetComponent } from './newbie-topics/internet/internet.component';

const routes: Routes = [
  { path: '', component: NewbieComponent,
    children: [
      { path: 'newbie-topics', component: NewbieTopicsComponent },
      { path: 'internet', component: InternetComponent }
    ]}
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewbieRoutingModule { }
