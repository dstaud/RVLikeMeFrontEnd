import { browser } from 'protractor';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ThemeService } from '../../core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
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
  bodyClass = document.querySelector('body');
  isLightTheme: Observable<boolean>;
  isGlobalFontsTheme: Observable<boolean>;

  constructor(public translate: TranslateService,
              private themeService: ThemeService,
              private deviceService: DeviceDetectorService) {
              this.getDeviceInfo();
              console.log('launched messages component'); }

  ngOnInit() {
    this.isLightTheme = this.themeService.isLightTheme;
    this.isGlobalFontsTheme = this.themeService.isGlobalFontsTheme;
  }

  getDeviceInfo() {
    console.log('hello `Home` component');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktop = this.deviceService.isDesktop();
    this.browser = this. deviceInfo.browser;
    this.browserVersion = this.deviceInfo.broswer_version;
    this.device = this.deviceInfo.device;
    this.os = this.deviceInfo.os;
    this.osVersion = this.deviceInfo.os_version;
    this.userAgent = this.deviceInfo.userAgent;
  }

  changeFontFamily() {
    console.log('Global fonts found?', this.bodyClass.classList.contains('global-fonts'));
    this.bodyClass.classList.remove('global-fonts');
    console.log('Removed Font Set:', this.bodyClass.classList);
    this.bodyClass.classList.add('android-fonts');
    console.log('Added Font Set:', this.bodyClass.classList);
  }

  toggleLightTheme(checked: boolean) {
    this.themeService.setLightTheme(checked);
  }

  toggleAndroidFontsTheme(checked: boolean) {
    this.themeService.setAndroidFontsTheme(checked);
  }
}
