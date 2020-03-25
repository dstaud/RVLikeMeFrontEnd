import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForumsRoutingModule } from './forums-routing.module';
import { ForumsComponent } from './forums.component';
import { SharedModule } from '../../shared/shared.module';
import { PostsComponent } from './posts/posts.component';


@NgModule({
  declarations: [ForumsComponent, PostsComponent],
  imports: [
    CommonModule,
    ForumsRoutingModule,
    SharedModule
  ]
})
export class ForumsModule { }
