import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
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
import { HomeComponent } from './features/home/home.component';
import { RegisterDialogComponent } from './dialogs/register-dialog/register-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SigninDialogComponent } from './dialogs/signin-dialog/signin-dialog.component';
import { LearnMoreComponent } from './landing-page/learn-more/learn-more.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    HeaderComponent,
    SidenavListComponent,
    FooterComponent,
    PageNotFoundComponent,
    HeaderMobileComponent,
    HomeComponent,
    SigninDialogComponent,
    RegisterDialogComponent,
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
  entryComponents: [
    SigninDialogComponent
  ],
  providers: [
    WindowService,
    HttpClient,
    ThemeService],
  bootstrap: [AppComponent]
})
export class AppModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
