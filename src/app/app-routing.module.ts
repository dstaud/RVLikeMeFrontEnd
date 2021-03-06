import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { CommonModule } from '@angular/common';

import { LandingPageComponent } from './landing-page/landing-page.component';
import { PageNotFoundComponent } from './core/navigation/page-not-found/page-not-found.component';
import { SigninComponent } from './features/credentials/signin/signin.component';
import { RegisterUserComponent } from './features/credentials/register-user/register-user.component';
import { AdminComponent } from './features/admin/admin.component';
import { RegisterConfirmComponent } from './features/credentials/register-user/register-confirm/register-confirm.component';
import { ForgotPasswordComponent } from './features/credentials/forgot-password/forgot-password.component';
import { PasswordResetComponent } from './features/credentials/password-reset/password-reset.component';
import { TermsOfServiceComponent } from './documents/terms-of-service/terms-of-service.component';
import { PrivacyPolicyComponent } from './documents/privacy-policy/privacy-policy.component';
import { ChangeUsernameComponent } from './features/credentials/change-username/change-username.component';
import { ChangePasswordComponent } from './features/credentials/change-password/change-password.component';

const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
  scrollOffset: [0, 50],
};

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
  // { path: 'credentials',
  //   loadChildren: () =>
  //   import('./features/credentials/credentials.module')
  //   .then(m => m.CredentialsModule)
  // },
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
  { path: 'change-username', component: ChangeUsernameComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'register', component: RegisterUserComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'password-reset', component: PasswordResetComponent },
  { path: 'register-confirm', component: RegisterConfirmComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms-of-service', component: TermsOfServiceComponent },
  { path: '', component: LandingPageComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
