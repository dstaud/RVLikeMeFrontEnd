import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewbieComponent } from './newbie.component';
import { NewbieTopicsComponent } from './newbie-topics/newbie-topics.component';
import { HelpNewbieComponent } from './help-newbie/help-newbie.component';
import { NeedHelpNewbieComponent } from './need-help-newbie/need-help-newbie.component';
import { TopicComponent } from './newbie-topics/topic/topic.component';

const routes: Routes = [
  { path: '', component: NewbieComponent,
    children: [
      { path: 'newbie-topics', component: NewbieTopicsComponent },
      { path: 'help-newbie', component: HelpNewbieComponent },
      { path: 'need-help-newbie', component: NeedHelpNewbieComponent },
      { path: 'topic', component: TopicComponent }
    ]}
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewbieRoutingModule { }
