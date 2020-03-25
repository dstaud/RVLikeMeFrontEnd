import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForumsRoutingModule } from './forums-routing.module';
import { ForumsComponent } from './forums.component';
import { SharedModule } from '../../shared/shared.module';
import { PostsComponent } from './posts/posts.component';
import { AddPostComponent } from './posts/add-post/add-post.component';


@NgModule({
  declarations: [ForumsComponent, PostsComponent, AddPostComponent],
  imports: [
    CommonModule,
    ForumsRoutingModule,
    SharedModule
  ]
})
export class ForumsModule { }
