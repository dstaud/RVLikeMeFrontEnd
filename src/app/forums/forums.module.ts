import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForumsRoutingModule } from './forums-routing.module';
import { ForumsComponent } from './forums.component';
import { SharedModule } from '../translate/translate.module';


@NgModule({
  declarations: [ForumsComponent],
  imports: [
    CommonModule,
    ForumsRoutingModule,
    SharedModule
  ]
})
export class ForumsModule { }
