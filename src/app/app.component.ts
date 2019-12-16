import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DeviceService } from './core/services/device.service';
import { ThemeService } from './core/services/theme.service';
import { UserAuthService } from './core/services/user-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DeviceService]
})

export class AppComponent implements OnInit {
  globalFontTheme: Observable<string>;
  globalColorTheme: Observable<string>;
  userAuthorized$: Observable<boolean>;
  theme: string;
  font: string;
  userAuthorized = false;


  constructor(public translateService: TranslateService,
              private deviceService: DeviceService,
              private themeService: ThemeService,
              private userAuthService: UserAuthService) {
    translateService.setDefaultLang('en'); // Default to US English
    this.deviceService.determineGlobalFontTheme(); // Determine font based on device type for more natural app-like experience
  }

  ngOnInit() {
    // this.globalFontTheme = this.themeService.defaultGlobalFontTheme;
    this.themeService.defaultGlobalFontTheme
      .subscribe(fontData => {
        this.font = fontData.valueOf();
        console.log(this.font);
      });
    // this.globalColorTheme = this.themeService.defaultGlobalColorTheme;
    this.themeService.defaultGlobalColorTheme
      .subscribe(themeData => {
        this.theme = themeData.valueOf();
        console.log(this.theme);
      });
    this.userAuthService.userAuth$
      .subscribe(authData => {
        this.userAuthorized = authData.valueOf();
      });
  }
}
