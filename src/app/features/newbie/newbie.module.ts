import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NewbieRoutingModule } from './newbie-routing.module';
import { NewbieComponent } from './newbie.component';

import { SharedModule } from '@shared/shared.module';
import { NewbieTopicsComponent } from './newbie-topics/newbie-topics.component';
import { TopicComponent } from './newbie-topics/topic/topic.component';
import { HelpNewbieComponent } from './help-newbie/help-newbie.component';
import { NeedHelpNewbieComponent } from './need-help-newbie/need-help-newbie.component';
import { NewbieLinksComponent } from './newbie-topics/newbie-links/newbie-links.component';


@NgModule({
  declarations: [
    NewbieComponent,
    NewbieTopicsComponent,
    TopicComponent,
    HelpNewbieComponent,
    NeedHelpNewbieComponent,
    NewbieLinksComponent
  ],
  imports: [
    CommonModule,
    NewbieRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class NewbieModule { }
