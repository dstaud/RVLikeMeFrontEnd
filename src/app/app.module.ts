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
import { YourStoryComponent } from './features/profile/your-story/your-story.component';

import { ThemeService } from '@services/theme.service';
import { HttpInterceptorService } from '@services/data-services/http-interceptor.service';
import { ProfileService } from '@services/data-services/profile.service';
import { WindowService } from '@services/window.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';
import { InstallDialogComponent } from '@dialogs/install-dialog/install-dialog.component';
import { MyStoryDialogComponent } from '@dialogs/my-story-dialog/my-story-dialog.component';
import { DesktopDialogComponent } from '@dialogs/desktop-dialog/desktop-dialog.component';
import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';
import { UpdatePostDialogComponent } from '@dialogs/update-post-dialog/update-post-dialog.component';

import { SharedModule } from '@shared/shared.module';
import { SuggestTopicDialogComponent } from './dialogs/suggest-topic-dialog/suggest-topic-dialog.component';
import { AdminComponent } from './features/admin/admin.component';
import { EmailComponent } from './features/admin/email/email.component';
import { RegisterConfirmComponent } from './landing-page/register-user/register-confirm/register-confirm.component';
import { SystemDataComponent } from './features/admin/system-data/system-data.component';


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
    MyStoryDialogComponent,
    DesktopDialogComponent,
    ImageViewDialogComponent,
    ForumsListComponent,
    UpdatePostDialogComponent,
    YourStoryComponent,
    SuggestTopicDialogComponent,
    AdminComponent,
    EmailComponent,
    RegisterConfirmComponent,
    SystemDataComponent
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
    NgxImageCompressService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
