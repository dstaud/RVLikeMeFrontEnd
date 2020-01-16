import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { DataService } from './../../../core/services/data-services/data.service';
import { Iuser } from './../../../interfaces/user';

@Component({
  selector: 'app-rvlm-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})
export class PersonalComponent implements OnInit {
  user: Iuser;
  form: FormGroup;

  constructor(private dataSvc: DataService,
              private translate: TranslateService,
              fb: FormBuilder) {
              this.form = fb.group({
                firstName: new FormControl({value: ''}, Validators.required),
                email: new FormControl({value: ''}, [Validators.required, Validators.email]),
                lastName: new FormControl({value: ''}),
                displayName: new FormControl({value: ''}, Validators.required),
                yearOfBirth: new FormControl({value: ''}),
                homeCountry: new FormControl({value: ''}),
                homeState: new FormControl({value: ''})
              });
    }

  ngOnInit() {
    this.dataSvc.getUserProfile().subscribe(user => {
      this.user = user;
      if (!this.user.displayName) { this.user.displayName = this.user.firstName; }
      this.form.patchValue({
        firstName: this.user.firstName,
        email: this.user.email,
        lastName: this.user.lastName,
        displayName: this.user.displayName,
        yearOfBirth: this.user.yearOfBirth,
        homeCountry: this.user.homeCountry,
        homeState: this.user.homeState
      });
    }, (err) => {
      console.error(err);
    });
  }

  public changeFirstName(val) {
    console.log('value=', val);
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
