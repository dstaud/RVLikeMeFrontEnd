import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MessagesComponent } from './messages.component';
import { SendMessageComponent } from './send-message/send-message.component';

const routes: Routes = [
  { path: '', component: MessagesComponent,
  children: [
    { path: 'send-message', component: SendMessageComponent }
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesRoutingModule { }
