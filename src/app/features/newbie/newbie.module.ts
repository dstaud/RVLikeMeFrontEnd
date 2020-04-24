import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewbieRoutingModule } from './newbie-routing.module';
import { NewbieComponent } from './newbie.component';

import { SharedModule } from '@shared/shared.module';
import { NewbieTopicsComponent } from './newbie-topics/newbie-topics.component';
import { InternetComponent } from './newbie-topics/internet/internet.component';


@NgModule({
  declarations: [
    NewbieComponent,
    NewbieTopicsComponent,
    InternetComponent
  ],
  imports: [
    CommonModule,
    NewbieRoutingModule,
    SharedModule
  ]
})
export class NewbieModule { }
