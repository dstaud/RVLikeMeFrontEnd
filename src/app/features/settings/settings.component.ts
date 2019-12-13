import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

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
              public translate: TranslateService) {
          this.form = fb.group({
          language: ['en', Validators.required]
      });
  }

  ngOnInit() {
  }

  setLanguage(entry: string) {
    console.log('Language=', entry);
    this.translate.setDefaultLang(entry);
  }
}
