import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { HomeComponent } from './features/home/home.component';
import { PageNotFoundComponent } from './navigation/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'connections',
    loadChildren: () =>
    import('./features/connections/connections.module')
    .then(m => m.ConnectionsModule)
  },
  { path: 'forums',
    loadChildren: () =>
    import('./features/forums/forums.module')
    .then(m => m.ForumsModule)
  },
  { path: 'messages',
    loadChildren: () =>
    import('./features/messages/messages.module')
    .then(m => m.MessagesModule)
  },
  { path: 'settings',
    loadChildren: () =>
    import('./features/settings/settings.module')
    .then(m => m.SettingsModule)
  },
  { path: 'about',
  loadChildren: () =>
  import('./features/about/about.module')
  .then(m => m.AboutModule)
  },
  { path: 'profile',
  loadChildren: () =>
  import('./features/profile/profile.module')
  .then(m => m.ProfileModule)
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: '',
    component: LandingPageComponent
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
