import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DeviceService } from './core/services/device.service';
import { ThemeService } from './core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DeviceService]
})

export class AppComponent implements OnInit {
  pageTitle: Observable<string>;
  globalFontTheme: Observable<string>;
  globalColorTheme: Observable<string>;

  constructor(public translate: TranslateService,
              private deviceService: DeviceService,
              private themeService: ThemeService) {
    translate.setDefaultLang('en'); // Default to US English
    this.deviceService.determineGlobalFontTheme(); // Determine font based on device type for more natural app-like experience
  }

  ngOnInit() {
    this.globalFontTheme = this.themeService.defaultGlobalFontTheme;
    this.globalColorTheme = this.themeService.defaultGlobalColorTheme;
  }
}
