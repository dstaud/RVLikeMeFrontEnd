import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { Iuser } from './../../interfaces/user';
import { ActivateBackArrowService } from './../../core/services/activate-back-arrow.service';
import { DataService } from './../../core/services/data-services/data.service';
import { SharedComponent } from './../../shared/shared.component';
import { LanguageService } from './../../core/services/language.service';

@Component({
  selector: 'app-rvlm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: Iuser = {
    firstName: '',
    lastName: '',
    displayName: '',
    yearOfBirth: 0,
    homeCountry: '',
    homeState: '',
    language: ''
  };
  showSpinner = false;
  backPath = '';
  totalFieldsWithData = 0;
  totalNbrOfFields = 6;
  percentPersonal: number;
  percentLifestyle: number;
  percentRig: number;
  form: FormGroup;

  constructor(private authSvc: AuthenticationService,
              private dataSvc: DataService,
              private translate: TranslateService,
              private location: Location,
              private language: LanguageService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private shared: SharedComponent,
              private router: Router,
              fb: FormBuilder) {
                this.form = fb.group({
                  language: ['en', Validators.required]
                });
            }

  ngOnInit() {
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }
    this.dataSvc.getProfilePersonal()
    .subscribe(user => {
      this.user = user;
      if (this.user.language) {
        this.form.patchValue ({
          language: this.user.language
        });
      }
      console.log('count before=', this.totalFieldsWithData);
      if (user.firstName) { this.totalFieldsWithData++; }
      if (user.lastName) { this.totalFieldsWithData++; }
      if (user.displayName) { this.totalFieldsWithData++; }
      if (user.yearOfBirth) { this.totalFieldsWithData++; }
      if (user.homeCountry) { this.totalFieldsWithData++; }
      if (user.homeState) { this.totalFieldsWithData++; }
      console.log('count after=', this.totalFieldsWithData);
      this.percentPersonal = (this.totalFieldsWithData / this.totalNbrOfFields) * 100;
      console.log('% complete=', this.percentPersonal);
    });
   }

  onPersonal() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-personal');
  }

  onLifestyle() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-lifestyle');
  }

  onRig() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-rig');
  }

  setLanguage(entry: string) {
    console.log('in set language');
    this.showSpinner = true;
    console.log('user before', this.user);
    this.user.language = this.form.controls.language.value;
    console.log('user after', this.user);
    this.dataSvc.updateProfilePersonal(this.user)
    .subscribe ((responseData) => {
      this.showSpinner = false;
      console.log('Updated ', responseData);
      this.language.setLanguage(entry);
    }, error => {
      this.showSpinner = false;
      console.log('in error!', error);
    });
  }
}
