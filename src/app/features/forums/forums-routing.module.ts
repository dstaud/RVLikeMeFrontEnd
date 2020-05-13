import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForumsComponent } from './forums.component';
import { MainComponent } from './main/main.component';
import { ForumsListComponent } from './forums-list/forums-list.component';
import { PostsComponent } from './posts/posts.component';
import { PageNotFoundComponent } from '@pageNotFound/page-not-found.component';

const routes: Routes = [
  { path: '', component: ForumsComponent,
    children: [
      { path: 'main', component: MainComponent},
      { path: 'forums-list', component: ForumsListComponent },
      { path: 'posts', component: PostsComponent },
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForumsRoutingModule { }
