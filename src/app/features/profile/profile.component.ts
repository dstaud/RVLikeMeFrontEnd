import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { Iuser } from './../../interfaces/user';
import { Ilifestyle } from './../../interfaces/lifestyle';
import { ActivateBackArrowService } from './../../core/services/activate-back-arrow.service';
import { DataService } from './../../core/services/data-services/data.service';
import { SharedComponent } from './../../shared/shared.component';
import { LanguageService } from './../../core/services/language.service';
import { OtherDialogComponent } from './../../dialogs/other-dialog.component';

export interface AboutMe {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-rvlm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: Iuser = {
    firstName: null,
    lastName: null,
    displayName: null,
    yearOfBirth: null,
    homeCountry: null,
    homeState: null,
    language: null
  };

  lifestyle: Ilifestyle = {
    aboutMe: null,
    rvUse: null,
    worklife: null,
    campsWithMe: null
  };

  showSpinner = false;
  showAboutMeSaveIcon = false;
  showLanguageSaveIcon = false;
  backPath = '';
  totalPersonalFieldsWithData = 0;
  totalPersonalNbrOfFields = 6;
  percentPersonal: number;
  totalLifestyleFieldsWithData = 0;
  totalLifestyleNbrOfFields = 3;
  percentLifestyle: number;
  percentRig: number;
  other: string;
  form: FormGroup;

  AboutMes: AboutMe[] = [
    {value: '', viewValue: ''},
    {value: 'dreamer', viewValue: 'profile.component.list.aboutMe.dreamer'},
    {value: 'newbie', viewValue: 'profile.component.list.aboutMe.newbie'},
    {value: 'experienced', viewValue: 'profile.component.list.aboutMe.experienced'},
    {value: 'other', viewValue: 'profile.component.list.aboutMe.other'}
  ];

  constructor(private authSvc: AuthenticationService,
              private dataSvc: DataService,
              private translate: TranslateService,
              private location: Location,
              private language: LanguageService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private shared: SharedComponent,
              private dialog: MatDialog,
              private router: Router,
              fb: FormBuilder) {
                this.form = fb.group({
                  language: ['en', Validators.required],
                  aboutMe: ['']
                });
            }

  ngOnInit() {
    this.showSpinner = true;
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

      console.log('count before=', this.totalPersonalFieldsWithData);
      if (user.firstName) { this.totalPersonalFieldsWithData++; }
      if (user.lastName) { this.totalPersonalFieldsWithData++; }
      if (user.displayName) { this.totalPersonalFieldsWithData++; }
      if (user.yearOfBirth) { this.totalPersonalFieldsWithData++; }
      if (user.homeCountry) { this.totalPersonalFieldsWithData++; }
      if (user.homeState) { this.totalPersonalFieldsWithData++; }
      console.log('count after=', this.totalPersonalFieldsWithData);
      this.percentPersonal = (this.totalPersonalFieldsWithData / this.totalPersonalNbrOfFields) * 100;
      console.log('% complete=', this.percentPersonal);
    }, (error) => {
      this.showSpinner = false;
      console.error(error);
    });

    this.dataSvc.getProfileLifestyle()
    .subscribe(lifestyle => {
      console.log('lifestyle back from server ', lifestyle);
      this.lifestyle = lifestyle;
      if (this.lifestyle.aboutMe) {
        if (this.lifestyle.aboutMe.substring(0, 1) === '@') {
          this.other = this.lifestyle.aboutMe.substring(1, this.lifestyle.aboutMe.length);
          this.lifestyle.aboutMe = 'other';
          console.log('other read=', this.other);
        }
      }
      this.form.patchValue({
        aboutMe: this.lifestyle.aboutMe
      });
      this.showSpinner = false;
      console.log('count before=', this.totalLifestyleFieldsWithData);
      if (lifestyle.rvUse) { this.totalLifestyleFieldsWithData++; }
      if (lifestyle.worklife) { this.totalLifestyleFieldsWithData++; }
      if (lifestyle.campsWithMe) { this.totalLifestyleFieldsWithData++; }
      console.log('count after=', this.totalLifestyleFieldsWithData);
      this.percentLifestyle = (this.totalLifestyleFieldsWithData / this.totalLifestyleNbrOfFields) * 100;
      console.log('% complete=', this.percentLifestyle);
    }, (error) => {
        this.showSpinner = false;
        console.error(error);
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
    this.showLanguageSaveIcon = true;
    console.log('user before', this.user);
    this.user.language = this.form.controls.language.value;
    console.log('user after', this.user);
    this.dataSvc.updateProfilePersonal(this.user)
    .subscribe ((responseData) => {
      this.showLanguageSaveIcon = false;
      console.log('Updated ', responseData);
      this.language.setLanguage(entry);
    }, error => {
      this.showLanguageSaveIcon = false;
      console.log('in error!', error);
    });
  }

  selectedAboutMe(event: string) {
    console.log('selectedSelect', event);
    if (event === 'other') {
      this.openDialog(event);
    } else {
      this.other = '';
      this.updateAboutMe(event);
    }
  }

  activatedAboutMe() {
    console.log('activatedSelect', this.other);
    if (this.other) {
      this.openDialog('other');
    }
  }

  updateAboutMe(event: string) {
    console.log('in update About me');
    console.log('lifestyle before', this.lifestyle);
    if (this.form.controls.aboutMe.value === '') {
      this.lifestyle.aboutMe = null;
      this.form.patchValue({
        aboutMe: null
      });
      console.log('auto-selected no other. aboutMe=', this.lifestyle.aboutMe);
    } else {
      if (this.form.controls.aboutMe.value !== 'other') {
        this.lifestyle.aboutMe = this.form.controls.aboutMe.value;
      }
    }
    console.log('lifestyle after', this.lifestyle);
    this.showAboutMeSaveIcon = true;
    this.dataSvc.updateProfileLifestyle(this.lifestyle)
    .subscribe ((responseData) => {
      this.showAboutMeSaveIcon = false;
      console.log('Updated ', responseData);
    }, error => {
      this.showAboutMeSaveIcon = false;
      console.log('in error!', error);
    });
  }

  openDialog(event: string): void {
    let other = '';
    let selection = null;
    if (this.other) {
      other = this.other;
    }
    console.log ('other=', other);
    const dialogRef = this.dialog.open(OtherDialogComponent, {
      width: '250px',
      disableClose: true,
      data: {name: 'profile.component.aboutMe', other: other }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed ', result);
      if (result) {
        if (this.other !== result && result !== 'canceled') {
          this.other = result;
          this.lifestyle.aboutMe = '@' + result;
          console.log('lifestyle=', this.lifestyle);
          this.updateAboutMe(event);
        }
      } else {
        if (this.other) {
          console.log('other exists but no value', this.other);
          this.lifestyle.aboutMe = null;
          this.updateAboutMe('');
          this.other = '';
          this.form.patchValue({
            aboutMe: null
          });
        } else {
          if (this.lifestyle.aboutMe) {
            selection = this.lifestyle.aboutMe;
          }
          this.form.patchValue({
            aboutMe: selection
          });
        }
      }
    });
  }
}
