import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from './../../core/services/data.service';
import { ThemeService } from '../../core/services/theme.service';

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
              private dataSvc: DataService,
              private router: Router,
              private themeService: ThemeService,
              fb: FormBuilder) {
              this.form = fb.group({
                fontTheme: ['global-font', Validators.required],
                colorTheme: ['dark-theme', Validators.required]
              });
            }

  ngOnInit() {
    if (!this.dataSvc.isLoggedIn()) {
      this.router.navigateByUrl('/');
    }
  }

  setThemeColorScheme(colorSceheme: string) {
    this.themeService.setGlobalColorTheme(colorSceheme);
  }
  setThemeFont(font: string) {
    this.themeService.setGlobalFontTheme(font);
  }
}
