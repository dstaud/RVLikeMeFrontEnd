import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from './../../core/services/data.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  form: FormGroup;
  selectedLanguage: string;

  language = new FormControl('', Validators.required);

  constructor(private translate: TranslateService,
              private dataSvc: DataService,
              private router: Router,
              fb: FormBuilder) {
          this.form = fb.group({
          language: ['en', Validators.required]
      });
  }

  ngOnInit() {
    if (!this.dataSvc.isLoggedIn()) {
      this.router.navigateByUrl('/');
    }
  }

  setLanguage(entry: string) {
    this.translate.setDefaultLang(entry);
  }
}
