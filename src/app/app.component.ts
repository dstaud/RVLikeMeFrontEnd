import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ThemeService } from './core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'RV Like Me';
  deviceInfo = null;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  browser: string;
  browserVersion: string;
  device: string;
  os: string;
  osVersion: string;
  userAgent: string;
  selectorResult = document.querySelector('.global-fonts');
  isLightTheme: Observable<boolean>;
  isGlobalFontsTheme: Observable<boolean>;

  constructor(public translate: TranslateService,
              private themeService: ThemeService) {
    translate.setDefaultLang('en');
    console.log('Initial Font Set:', this.selectorResult.classList);
    if (this.isMobile) {
      if (this.device === 'iPhone') {

      } else {
        if (this.device === 'Android') {
          console.log("Android device.  Resetting fonts");

        }
      }
    }
  }

  ngOnInit() {
    this.isLightTheme = this.themeService.isLightTheme;
    this.isGlobalFontsTheme = this.themeService.isGlobalFontsTheme;
  }
}
