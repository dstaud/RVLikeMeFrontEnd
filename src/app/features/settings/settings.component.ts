import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { ActivateBackArrowService } from './../../core/services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  form: FormGroup;
  selectedLanguage: string;
  backPath = '';

  language = new FormControl('', Validators.required);

  constructor(private translate: TranslateService,
              private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private location: Location,
              private router: Router,
              fb: FormBuilder) {
          this.form = fb.group({
          language: ['en', Validators.required]
      });
  }

  ngOnInit() {
    console.log(this.authSvc.userAuth$.valueOf(), this.authSvc.isLoggedIn());
    if (!this.authSvc.isLoggedIn()) {
      console.log('routing to signin');
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }
  }

  setLanguage(entry: string) {
    this.translate.setDefaultLang(entry);
  }
}
