import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';

@Component({
  selector: 'app-rvlm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  form: FormGroup;
  selectedLanguage: string;

  language = new FormControl('', Validators.required);

  constructor(private translate: TranslateService,
              private auth: AuthenticationService,
              private router: Router,
              fb: FormBuilder) {
          this.form = fb.group({
          language: ['en', Validators.required]
      });
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/');
    }
  }

  setLanguage(entry: string) {
    this.translate.setDefaultLang(entry);
  }
}
