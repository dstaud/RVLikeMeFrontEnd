import { browser } from 'protractor';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ThemeService } from '../../core/services/theme.service';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

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
   form: FormGroup;
  fontTheme = new FormControl('', Validators.required);
  theme = new FormControl('', Validators.required);

  constructor(public translate: TranslateService,
              private themeService: ThemeService,
              private deviceService: DeviceDetectorService,
              fb: FormBuilder) {
              this.getDeviceInfo();
              console.log('launched messages component');
              this.form = fb.group({
                fontTheme: ['global-font', Validators.required],
                theme: ['dark-theme', Validators.required]
              });
            }

  ngOnInit() {
  }

  getDeviceInfo() {
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

  setThemeColorScheme(colorSceheme: string) {
    this.themeService.setGlobalTheme(colorSceheme);
  }
  setThemeFont(font: string) {
    this.themeService.setGlobalFont(font);
  }
}
