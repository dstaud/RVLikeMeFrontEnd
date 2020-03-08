import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ThemeService } from './theme.service';

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
    alert(this.device + ', ' + iPhone + ', ' + aspect.toFixed(3));
    if (iPhone && aspect.toFixed(3) === "0.462") {
        this.iPhoneModelXPlus = true;
    }
  }

  // Determine appropriate font theme for user device
  determineGlobalFontTheme() {
    // Based on type of device, determine the appropriate custom typography class to use (see styles.scss)
    if (this.deviceInfo.isDesktop || this.deviceInfo.isTablet) {
      console.log('Desktop or Tablet device.  Using default fonts');
      this.themeService.setGlobalFontTheme('global-font');
    } else {
      if (this.deviceInfo.isMobile) {
        if (this.device === 'iPhone') {
          console.log('iPhone device.  Resetting fonts');
          this.themeService.setGlobalFontTheme('iPhone-font');
        } else {
          if (this.device === 'Android') {
            console.log('Android device.  Resetting fonts');
            this.themeService.setGlobalFontTheme('android-font');
          } else {
            console.log('Other mobile device.  Using default fonts');
            this.themeService.setGlobalFontTheme('global-font');
          }
        }
      } else {
        console.log('Unknown device.  Using default fonts');
        this.themeService.setGlobalFontTheme('global-font');
      }
    }
  }
}
