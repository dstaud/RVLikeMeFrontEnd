import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { DataService } from './../../core/services/data-services/data.service';
import { ItokenPayload } from './../../interfaces/tokenPayload';
import { SharedComponent } from './../../shared/shared.component';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent implements OnInit {
  credentials: ItokenPayload;
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
    this.authSvc.getCredentials().subscribe(credentials => {
      this.credentials = credentials;
      this.form.patchValue({
        email: this.credentials.email
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
