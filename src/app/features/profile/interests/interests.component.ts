import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-interests',
  templateUrl: './interests.component.html',
  styleUrls: ['./interests.component.scss']
})
export class InterestsComponent implements OnInit {
  form: FormGroup;
  httpError = false;
  httpErrorText = '';
  backPath: string;


  atv: boolean = false;
  motorcycle: boolean = false;
  travel: boolean = false;
  quilting: boolean = false;
  cooking: boolean = false;
  painting: boolean = false;
  blogging: boolean = false;
  livingFrugally: boolean = false;
  gaming: boolean = false;
  musicalInstrument: boolean = false;
  programming: boolean = false;

  // Spinner is for initial load from the database only.
  // The SaveIcon us shown whenever the user clicks on an interest.
  showSpinner = false;
  showSaveIcon = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(private profileSvc: ProfileService,
              private translate: TranslateService,
              private location: Location,
              private router: Router,
              private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              fb: FormBuilder) {
              this.form = fb.group({
                atv: new FormControl(''),
                motorcycle: new FormControl(''),
                travel: new FormControl(''),
                quilting: new FormControl(''),
                cooking: new FormControl(''),
                painting: new FormControl(''),
                blogging: new FormControl(''),
                livingFrugally: new FormControl(''),
                gaming: new FormControl(''),
                musicalInstrument: new FormControl(''),
                programming: new FormControl('')
              });
}

ngOnInit() {
  this.form.disable();

  // If user got to this page without logging in (i.e. a bookmark or attack), send
  // them to the signin page and set the back path to the page they wanted to go
  this.showSpinner = true;
  if (!this.authSvc.isLoggedIn()) {
    this.backPath = this.location.path().substring(1, this.location.path().length);
    this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
    this.router.navigateByUrl('/signin');
  }

  this.userProfile = this.profileSvc.profile;

  this.userProfile
  .pipe(untilComponentDestroyed(this))
  .subscribe(data => {
    this.profile = data;
    console.log('in interests component=', this.profile);

    this.form.patchValue ({
      atv: this.profile.atv,
      motorcycle: this.profile.motorcycle,
      travel: this.profile.travel,
      quilting: this.profile.quilting,
      cooking: this.profile.cooking,
      painting: this.profile.painting,
      blogging: this.profile.blogging,
      livingFrugally: this.profile.livingFrugally,
      gaming: this.profile.gaming,
      musicalInstrument: this.profile.musicalInstrument,
      programming: this.profile.programming
    });

    this.showSpinner = false;
    this.form.enable();
  }, (error) => {
    this.showSpinner = false;
    console.error(error);
  });
}

  ngOnDestroy() {};


  updateLifestyle(control: string, event: any) {
    this.showSaveIcon = true;
    this.httpError = false;
    this.httpErrorText = '';
    this.profile[control] = event.checked;
    console.log('control=', this.profile[control]);
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.showSaveIcon = false;
      console.log('update response = ', responseData);
      // this.profileSvc.distributeProfileUpdate(this.profile);
    }, error => {
      this.showSaveIcon = false;
      this.httpError = true;
      this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
    });
  }


  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
