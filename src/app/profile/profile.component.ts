import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent {
  form: FormGroup;

  language = new FormControl('', Validators.required);

  constructor(fb: FormBuilder, public translate: TranslateService) {
    this.form = fb.group({
          language: ['en']
      });
  }

  onSubmit() {
      console.log('Language= ', this.form.get('language').value)
      this.translate.setDefaultLang(this.form.get('language').value);
  }
}
