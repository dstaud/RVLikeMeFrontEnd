import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ThemeService } from './theme.service';

// TODO: Add page to explain how to 'install' web app for iPhone users

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private deviceInfo = null;
  public isMobile: boolean;
  public isTablet: boolean;
  public isDesktop: boolean;
  public browser: string;
  public browserVersion: string;
  public device: string;
  public os: string;
  public osVersion: string;
  public userAgent: string;
  public iPhoneModelXPlus: boolean = false;

  constructor(private deviceService: DeviceDetectorService,
              private themeService: ThemeService) {
              this.getDeviceInfo();
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
    let iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream
    let aspect = window.screen.width / window.screen.height
    if (iPhone && aspect.toFixed(3) === "0.462") {
        this.iPhoneModelXPlus = true;
    }
  }

  // Determine appropriate font theme for user device
  determineGlobalFontTheme() {
    // Based on type of device, determine the appropriate custom typography class to use (see styles.scss)
    if (this.deviceInfo.isDesktop || this.deviceInfo.isTablet) {
      this.themeService.setGlobalFontTheme('global-font');
    } else {
      if (this.deviceInfo.isMobile) {
        if (this.device === 'iPhone') {
          this.themeService.setGlobalFontTheme('iPhone-font');
        } else {
          if (this.device === 'Android') {
            this.themeService.setGlobalFontTheme('android-font');
          } else {
            this.themeService.setGlobalFontTheme('global-font');
          }
        }
      } else {
        this.themeService.setGlobalFontTheme('global-font');
      }
    }
  }
}
