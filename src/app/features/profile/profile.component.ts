import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit{
  form: FormGroup;
  isDarkTheme: Observable<boolean>;

  language = new FormControl('', Validators.required);

  constructor(fb: FormBuilder,
              public translate: TranslateService,
              private themeService: ThemeService) {
    this.form = fb.group({
          language: ['en']
      });
  }

  ngOnInit() {
    this.isDarkTheme = this.themeService.isDarkTheme;
  }

  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
  }

  onSubmit() {
      console.log('Language= ', this.form.get('language').value)
      this.translate.setDefaultLang(this.form.get('language').value);
  }
}
