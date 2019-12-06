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
  title = 'RV Like Me';
  globalFontTheme: Observable<string>;
  globalTheme: Observable<string>;

  constructor(public translate: TranslateService,
              private deviceService: DeviceService,
              private themeService: ThemeService) {
    translate.setDefaultLang('en');
    this.deviceService.determineGlobalFont();
  }

  ngOnInit() {
    this.globalFontTheme = this.themeService.defaultGlobalFont;
    this.globalTheme = this.themeService.defaultGlobalTheme;
  }
}
