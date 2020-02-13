import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, Injectable } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import * as Sentry from '@sentry/browser';
import { SharedModule } from './shared/shared.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { WindowService } from './core/services/window.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './navigation/header/header.component';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { FooterComponent } from './navigation/footer/footer.component';
import { PageNotFoundComponent } from './navigation/page-not-found/page-not-found.component';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { ThemeService } from './core/services/theme.service';
import { HeaderMobileComponent } from './navigation/header-mobile/header-mobile.component';
import { RegisterUserComponent } from './landing-page/register-user/register-user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SigninComponent } from './landing-page/signin/signin.component';
import { LearnMoreComponent } from './landing-page/learn-more/learn-more.component';
import { HttpInterceptorService } from './core/services/data-services/http-interceptor.service';
import { DeactivateGuardService } from './core/guards/deactivate-guard.service';

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
    LearnMoreComponent
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
    FlexLayoutModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule
  ],
  providers: [
    WindowService,
    HttpClient,
    DeactivateGuardService,
    ThemeService,
    {
      provide: ErrorHandler,
      useFactory: getErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
