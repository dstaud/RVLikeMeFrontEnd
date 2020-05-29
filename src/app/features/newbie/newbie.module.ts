import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NewbieRoutingModule } from './newbie-routing.module';
import { NewbieComponent } from './newbie.component';

import { SharedModule } from '@shared/shared.module';
import { TopicComponent } from './newbie-topics/topic/topic.component';
import { NewbieLinksComponent } from './newbie-topics/newbie-links/newbie-links.component';
import { MainComponent } from './main/main.component';
import { NewbieCornerComponent } from './newbie-corner/newbie-corner.component';


@NgModule({
  declarations: [
    NewbieComponent,
    TopicComponent,
    NewbieLinksComponent,
    MainComponent,
    NewbieCornerComponent
  ],
  imports: [
    CommonModule,
    NewbieRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class NewbieModule { }
