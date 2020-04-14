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
import { YourStoryComponent } from './posts/your-story/your-story.component';


@NgModule({
  declarations: [
    ForumsComponent,
    PostsComponent,
    AddPostComponent,
    CommentsComponent,
    AddCommentComponent,
    YourStoryComponent],
  imports: [
    CommonModule,
    ForumsRoutingModule,
    SharedModule,
    ScrollingModule,
    ReactiveFormsModule
  ],
  exports: [
    AddPostComponent,
    AddCommentComponent
  ]
})
export class ForumsModule { }
