import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from './../../core/services/page-title.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  form: FormGroup;
  selectedLanguage: string;

  language = new FormControl('', Validators.required);

  constructor(fb: FormBuilder,
              public translate: TranslateService,
              private pageTitle: PageTitleService) {
          this.form = fb.group({
          language: ['en', Validators.required]
      });
  }

  ngOnInit() {
    this.pageTitle.setPageTitle(this.translate.instant('settings.component.header'));
  }

  setLanguage(entry: string) {
    console.log('Language=', entry);
    this.translate.setDefaultLang(entry);
  }
}
