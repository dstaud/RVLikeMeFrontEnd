import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MessagesComponent } from './messages.component';
import { SendMessageComponent } from './send-message/send-message.component';
import { MessageListComponent } from './message-list/message-list.component';
import { PageNotFoundComponent } from '@pageNotFound/page-not-found.component';

const routes: Routes = [
  { path: '', component: MessagesComponent,
    children: [
      { path: 'send-message', component: SendMessageComponent },
      { path: 'message-list', component: MessageListComponent }
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesRoutingModule { }
