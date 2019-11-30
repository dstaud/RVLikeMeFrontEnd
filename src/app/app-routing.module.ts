import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'connections',
    loadChildren: () =>
    import('./connections/connections.module')
    .then(m => m.ConnectionsModule)
  },
  { path: 'forums',
    loadChildren: () =>
    import('./forums/forums.module')
    .then(m => m.ForumsModule)
  },
  { path: 'messages',
    loadChildren: () =>
    import('./messages/messages.module')
    .then(m => m.MessagesModule)
  },
  { path: 'profile',
    loadChildren: () =>
    import('./profile/profile.module')
    .then(m => m.ProfileModule)
  },
  {
    path: '',
    component: HomeComponent
  }
  // {
  //   path: '',
  //   redirectTo: '',
  //   pathMatch: 'full'
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
