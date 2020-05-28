import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewbieComponent } from './newbie.component';
import { NewbieTopicsComponent } from './newbie-topics/newbie-topics.component';
// import { HelpNewbieComponent } from './help-newbie/help-newbie.component';
// import { NeedHelpNewbieComponent } from './need-help-newbie/need-help-newbie.component';
import { TopicComponent } from './newbie-topics/topic/topic.component';
import { MainComponent } from './main/main.component';
import { PageNotFoundComponent } from '@pageNotFound/page-not-found.component';
import { NewbieCornerComponent } from './newbie-corner/newbie-corner.component';

const routes: Routes = [
  { path: '', component: NewbieComponent,
    children: [
      { path: 'newbie-topics', component: NewbieTopicsComponent },
      { path: 'newbie-corner', component: NewbieCornerComponent },
      // { path: 'help-newbie', component: HelpNewbieComponent },
      // { path: 'need-help-newbie', component: NeedHelpNewbieComponent },
      { path: 'topic', component: TopicComponent },
      { path: 'main', component: MainComponent },
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewbieRoutingModule { }
