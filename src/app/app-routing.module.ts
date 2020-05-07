import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LandingPageComponent } from './landing-page/landing-page.component';
import { PageNotFoundComponent } from './core/navigation/page-not-found/page-not-found.component';
import { SigninComponent } from './landing-page/signin/signin.component';
import { RegisterUserComponent } from './landing-page/register-user/register-user.component';
import { LearnMoreComponent } from './landing-page/learn-more/learn-more.component';
import { PersonalComponent } from './features/profile/personal/personal.component';
import { RvRigComponent } from './features/profile/rv-rig/rv-rig.component';
import { LifestyleComponent } from './features/profile/lifestyle/lifestyle.component';
import { InterestsComponent } from './features/profile/interests/interests.component';
import { UserQueryComponent } from './features/connections/user-query/user-query.component';
import { ForumsListComponent } from './features/forums/forums-list/forums-list.component';
import { YourStoryComponent } from './features/profile/your-story/your-story.component';
import { AdminComponent } from './features/admin/admin.component';
import { RegisterConfirmComponent } from './landing-page/register-user/register-confirm/register-confirm.component';
import { ForgotPasswordComponent } from './landing-page/forgot-password/forgot-password.component';
import { PasswordResetComponent } from './landing-page/password-reset/password-reset.component';

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
  { path: 'home',
    loadChildren: () =>
    import('./features/home/home.module')
    .then(m => m.HomeModule)
  },
  { path: 'credentials',
    loadChildren: () =>
    import('./features/credentials/credentials.module')
    .then(m => m.CredentialsModule)
  },
  { path: 'settings',
    loadChildren: () =>
    import('./features/settings/settings.module')
    .then(m => m.SettingsModule)
  },
  { path: 'newbie',
    loadChildren: () =>
    import('./features/newbie/newbie.module')
    .then(m => m.NewbieModule)
  },
  { path: 'settings', loadChildren: () =>
    import('./features/settings/settings.module')
    .then(m => m.SettingsModule)
  },
  { path: 'signin', component: SigninComponent },
  { path: 'register', component: RegisterUserComponent, data: { animationState: 'Two' } },
  { path: 'admin', component: AdminComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'password-reset', component: PasswordResetComponent },
  { path: 'learn-more', component: LearnMoreComponent },
  { path: 'profile-personal', component: PersonalComponent },
  { path: 'profile-lifestyle', component: LifestyleComponent },
  { path: 'profile-rig', component: RvRigComponent },
  { path: 'profile-interests', component: InterestsComponent },
  { path: 'user-query', component: UserQueryComponent },
  { path: 'forums-list', component: ForumsListComponent },
  { path: 'mystory', component: YourStoryComponent },
  { path: 'register-confirm', component: RegisterConfirmComponent },
  { path: '', component: LandingPageComponent, data: { animationState: 'One' } },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
