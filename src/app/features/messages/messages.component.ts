import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { ThemeService } from '../../core/services/theme.service';
import { ActivateBackArrowService } from './../../core/services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-messages',
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
  backPath = '';

  constructor(public translate: TranslateService,
              private authSvc: AuthenticationService,
              private router: Router,
              private themeService: ThemeService,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              fb: FormBuilder) {
              this.form = fb.group({
                fontTheme: ['global-font', Validators.required],
                colorTheme: ['dark-theme', Validators.required]
              });
            }

  ngOnInit() {
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }
  }

  setThemeColorScheme(colorSceheme: string) {
    this.themeService.setGlobalColorTheme(colorSceheme);
  }
  setThemeFont(font: string) {
    this.themeService.setGlobalFontTheme(font);
  }
}
