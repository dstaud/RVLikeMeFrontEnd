import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-rvlm-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  hidePassword: boolean = true;
  showSpinner: boolean = false;

  private regPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

  constructor(fb: FormBuilder) {
              this.form = fb.group({
                password: new FormControl('', [Validators.required, Validators.pattern(this.regPassword)])
              });
}

  ngOnInit(): void {
  }

  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }


  onSubmit() {

  }
}
