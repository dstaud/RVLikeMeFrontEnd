import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';

import { take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

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
    campsWithMe: null,
    boondocking: null,
    traveling: null
  };

  showSpinner = false;
  showAboutMeSaveIcon = false;
  showLanguageSaveIcon = false;
  backPath = '';
  totalPersonalFieldsWithData = 0;
  totalPersonalNbrOfFields = 6;
  percentPersonal: number;
  totalLifestyleFieldsWithData = 0;
  totalLifestyleNbrOfFields = 5;
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
    .pipe(take(1)) // Auto-unsubscribe after first execution
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
    .pipe(take(1)) // Auto-unsubscribe after first execution
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
      if (lifestyle.boondocking) { this.totalLifestyleFieldsWithData++; }
      if (lifestyle.traveling) { this.totalLifestyleFieldsWithData++; }
      console.log('count after=', this.totalLifestyleFieldsWithData);
      this.percentLifestyle = (this.totalLifestyleFieldsWithData / this.totalLifestyleNbrOfFields) * 100;
      console.log('% complete=', this.percentLifestyle);
    }, (error) => {
        this.showSpinner = false;
        console.error(error);
    });
   }

  // If use touches aboutMe control and had previously selected 'other' then open the dialog to show what they had entered.
  activatedAboutMe() {
    if (this.other) {
      this.openDialog('other');
    }
  }


  /**** Route to sub-profile pages as user selects ****/
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


  // Wen user selects 'other' open dialog to collect data
  openDialog(event: string): void {
    let other = '';
    let selection = null;
    if (this.other) {
      other = this.other;
    }
    const dialogRef = this.dialog.open(OtherDialogComponent, {
      width: '250px',
      disableClose: true,
      data: {name: 'profile.component.aboutMe', other: other }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.other !== result && result !== 'canceled') {
          this.other = result;
          this.lifestyle.aboutMe = '@' + result;
          this.updateAboutMe(event);
        }
      } else {
        if (this.other) {
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


  // On user selection of Other from aboutMe control, open dialog to collection information. If not other, update database.
  selectedAboutMe(event: string) {
    if (event === 'other') {
      this.openDialog(event);
    } else {
      this.other = '';
      this.updateAboutMe(event);
    }
  }


  // Set language based on user selection, stored in database
  setLanguage(entry: string) {
    this.showLanguageSaveIcon = true;
    this.user.language = this.form.controls.language.value;
    this.dataSvc.updateProfilePersonal(this.user)
    .subscribe ((responseData) => {
      this.showLanguageSaveIcon = false;
      this.language.setLanguage(entry);
    }, error => {
      this.showLanguageSaveIcon = false;
    });
  }

  
  // Auto-update aboutMe selection to server
  updateAboutMe(event: string) {
    if (this.form.controls.aboutMe.value === '') {
      this.lifestyle.aboutMe = null;
      this.form.patchValue({
        aboutMe: null
      });
    } else {
      if (this.form.controls.aboutMe.value !== 'other') {
        this.lifestyle.aboutMe = this.form.controls.aboutMe.value;
      }
    }
    this.showAboutMeSaveIcon = true;
    this.dataSvc.updateProfileLifestyle(this.lifestyle)
    .subscribe ((responseData) => {
      this.showAboutMeSaveIcon = false;
    }, error => {
      this.showAboutMeSaveIcon = false;
    });
  }
}
