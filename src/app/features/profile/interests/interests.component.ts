import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

@Component({
  selector: 'app-interests',
  templateUrl: './interests.component.html',
  styleUrls: ['./interests.component.scss']
})
export class InterestsComponent implements OnInit {
  form: FormGroup;

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
  mobileInternet: boolean = false;


  // Spinner is for initial load from the database only.
  // The SaveIcon us shown whenever the user clicks on an interest.
  showSpinner = false;
  showSaveIcon = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(private profileSvc: ProfileService,
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
                programming: new FormControl(''),
                mobileInternet: new FormControl('')
              });
}

ngOnInit() {
  let backPath;
  let self = this;
  window.onpopstate = function(event) {
    self.activateBackArrowSvc.setBackRoute('', 'backward');
  };

  this.showSpinner = true;
  if (!this.authSvc.isLoggedIn()) {
    backPath = this.location.path().substring(1, this.location.path().length);
    this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
    this.router.navigateByUrl('/signin');
  } else {
    this.form.disable();

    this.listenForUserProfile();
  }
}

  ngOnDestroy() {};


  // Update profile on server when user checks an interest
  onUpdateInterest(control: string, event: any) {
    this.showSaveIcon = true;
    this.profile[control] = event.checked;
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.showSaveIcon = false;
      // this.profileSvc.distributeProfileUpdate(this.profile);
    }, error => {
      this.showSaveIcon = false;
      console.error('InterestsComponent:updateLifestyle: throw error ', error);
      throw new Error(error);
    });
  }


  // Listen for user profile and take action when get results
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.profile = profileResult;

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
        programming: this.profile.programming,
        mobileInternet: this.profile.mobileInternet
      });

      this.showSpinner = false;
      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      console.error(error);
    });
  }
}
