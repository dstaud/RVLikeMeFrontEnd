import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule} from '@angular/cdk/scrolling';
import { ReactiveFormsModule } from '@angular/forms';

import { ForumsRoutingModule } from './forums-routing.module';
import { ForumsComponent } from './forums.component';
import { SharedModule } from '../../shared/shared.module';
import { PostsComponent } from './posts/posts.component';
import { AddPostComponent } from './posts/add-post/add-post.component';
import { CommentsComponent } from './posts/comments/comments.component';
import { AddCommentComponent } from './posts/comments/add-comment/add-comment.component';
import { UpdatePostComponent } from './posts/update-post/update-post.component';


@NgModule({
  declarations: [
    ForumsComponent,
    PostsComponent,
    AddPostComponent,
    CommentsComponent,
    AddCommentComponent,
    UpdatePostComponent],
  imports: [
    CommonModule,
    ForumsRoutingModule,
    SharedModule,
    ScrollingModule,
    ReactiveFormsModule
  ],
  exports: [
    AddPostComponent,
    AddCommentComponent,
    UpdatePostComponent
  ]
})
export class ForumsModule { }
