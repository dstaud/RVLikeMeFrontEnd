import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { DataService } from './../../core/services/data-services/data.service';
import { Iuser } from './../../interfaces/user';
import { SharedComponent } from './../../shared/shared.component';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent implements OnInit {
  user: Iuser;
  form: FormGroup;
  showSpinner = false;

  constructor(private authSvc: AuthenticationService,
              private dataSvc: DataService,
              private translate: TranslateService,
              private shared: SharedComponent,
              private router: Router,
              fb: FormBuilder) {
              this.form = fb.group({
                email: new FormControl({value: ''}, [Validators.required, Validators.email])
              },
                { updateOn: 'blur' }
              );
}

  ngOnInit() {
/*     if (!this.authSvc.isLoggedIn()) {
      this.router.navigateByUrl('/signin');
    } */
    this.form.disable();
    this.showSpinner = true;
    this.dataSvc.getUserProfile().subscribe(user => {
      this.user = user;
      this.form.patchValue({
        email: this.user.email
      });
      this.showSpinner = false;
      this.form.enable();
    }, (err) => {
      this.showSpinner = false;
      console.error(err);
    });
  }

  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
