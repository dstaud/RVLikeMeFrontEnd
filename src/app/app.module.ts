import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, Injectable } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Injector, APP_INITIALIZER } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LOCATION_INITIALIZED } from '@angular/common';

import { DeviceDetectorModule } from 'ngx-device-detector';
import * as Sentry from '@sentry/browser';
import { NgxImageCompressService } from 'ngx-image-compress';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '@environments/environment';
import { SigninComponent } from './landing-page/signin/signin.component';
import { LearnMoreComponent } from './landing-page/learn-more/learn-more.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { HeaderComponent } from '@navigation/header/header.component';
import { SidenavListComponent } from '@navigation/sidenav-list/sidenav-list.component';
import { FooterComponent } from '@navigation/footer/footer.component';
import { PageNotFoundComponent } from '@navigation/page-not-found/page-not-found.component';
import { ForumsListComponent } from './features/forums/forums-list/forums-list.component';

import { HeaderMobileComponent } from '@navigation/header-mobile/header-mobile.component';
import { RegisterUserComponent } from './landing-page/register-user/register-user.component';

import { ThemeService } from '@services/theme.service';
import { HttpInterceptorService } from '@services/data-services/http-interceptor.service';
import { ProfileService } from '@services/data-services/profile.service';
import { WindowService } from '@services/window.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';
import { InstallDialogComponent } from '@dialogs/install-dialog/install-dialog.component';

import { SharedModule } from '@shared/shared.module';
import { SuggestTopicDialogComponent } from './dialogs/suggest-topic-dialog/suggest-topic-dialog.component';
import { AdminComponent } from './features/admin/admin.component';
import { EmailComponent } from './features/admin/email/email.component';
import { RegisterConfirmComponent } from './landing-page/register-user/register-confirm/register-confirm.component';
import { SystemDataComponent } from './features/admin/system-data/system-data.component';
import { ForgotPasswordComponent } from './landing-page/forgot-password/forgot-password.component';
import { PasswordResetComponent } from './landing-page/password-reset/password-reset.component';
import { RegisterDesktopDialogComponent } from './dialogs/register-desktop-dialog/register-desktop-dialog.component';
import { SigninDesktopDialogComponent } from './dialogs/signin-desktop-dialog/signin-desktop-dialog.component';
import { FooterDesktopComponent } from './core/navigation/footer-desktop/footer-desktop.component';
import { PrivacyPolicyComponent } from './documents/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './documents/terms-of-service/terms-of-service.component';
import { PrivacyPolicyDialogComponent } from './dialogs/privacy-policy-dialog/privacy-policy-dialog.component';
import { TermsDialogComponent } from './dialogs/terms-dialog/terms-dialog.component';
import { GraphicComponent } from './landing-page/cards/graphic/graphic.component';
import { LikemeComponent } from './landing-page/cards/likeme/likeme.component';
import { NewbieComponent } from './landing-page/cards/newbie/newbie.component';
import { StoryComponent } from './landing-page/cards/story/story.component';


Sentry.init({
  dsn: 'https://b52e12ec94554f4b8639c0766d53ef9c@sentry.io/2071107',
  environment: environment.name
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    const eventId = Sentry.captureException(error.originalError || error);
    Sentry.showReportDialog({ eventId });
  }
}

export function getErrorHandler(): ErrorHandler {
  if (environment.production) {
    return new SentryErrorHandler();
  }
  return new ErrorHandler();
}

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    HeaderComponent,
    SidenavListComponent,
    FooterComponent,
    PageNotFoundComponent,
    HeaderMobileComponent,
    SigninComponent,
    RegisterUserComponent,
    LearnMoreComponent,
    OtherDialogComponent,
    InstallDialogComponent,
    ForumsListComponent,
    SuggestTopicDialogComponent,
    AdminComponent,
    EmailComponent,
    RegisterConfirmComponent,
    SystemDataComponent,
    ForgotPasswordComponent,
    PasswordResetComponent,
    RegisterDesktopDialogComponent,
    SigninDesktopDialogComponent,
    FooterDesktopComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent,
    PrivacyPolicyDialogComponent,
    TermsDialogComponent,
    GraphicComponent,
    LikemeComponent,
    NewbieComponent,
    StoryComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    DeviceDetectorModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule
  ],
  providers: [
    WindowService,
    HttpClient,
    ProfileService,
    ThemeService,
    {
      provide: ErrorHandler,
      useFactory: getErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    NgxImageCompressService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// Make sure i18n language translation json files are loaded before proceeding.  This defaults to en so that won't
// get strange behaviors where it just shows the i18n tag (i.e. home.component.profileBar5) for SOME items until translation kicks in
// BUT, now can't change dynamically?
// Do we need to use async/await here?
export function appInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
      locationInitialized.then(() => {
      const langToSet = 'en'
      translate.setDefaultLang('en');
      translate.use(langToSet).subscribe(() => {
        console.info(`Successfully initialized '${langToSet}' language.'`);
      }, err => {
        console.error(`Problem with '${langToSet}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
