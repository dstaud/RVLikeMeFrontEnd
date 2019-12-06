import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';
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
  colorTheme = new FormControl('', Validators.required);

  constructor(public translate: TranslateService,
              private themeService: ThemeService,
              fb: FormBuilder) {
              console.log('launched messages component');
              this.form = fb.group({
                fontTheme: ['global-font', Validators.required],
                colorTheme: ['dark-theme', Validators.required]
              });
            }

  ngOnInit() {
  }

  setThemeColorScheme(colorSceheme: string) {
    this.themeService.setGlobalColorTheme(colorSceheme);
  }
  setThemeFont(font: string) {
    this.themeService.setGlobalFontTheme(font);
  }
}
