import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { AdminService } from '@services/data-services/admin.service';
import { DeviceService } from '@services/device.service';
import { ThemeService } from '@services/theme.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-interests',
  templateUrl: './interests.component.html',
  styleUrls: ['./interests.component.scss'],
  animations: [
    trigger('suggestInterestSlideInOut', [
      state('in', style({
        overflow: 'hidden',
        height: '*',
        width: '100%'
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
        width: '0px'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
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
  desktopUser: boolean = false;
  suggestInterestOpen: string = 'out';
  readyToSuggest: boolean = false;
  theme: string;

  // Spinner is for initial load from the database only.
  // The SaveIcon us shown whenever the user clicks on an interest.
  showSpinner = false;
  showSaveIcon = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private returnRoute: string;

  constructor(private profileSvc: ProfileService,
              private location: Location,
              private router: Router,
              private authSvc: AuthenticationService,
              private adminSvc: AdminService,
              private themeSvc: ThemeService,
              private shared: SharedComponent,
              private sentry: SentryMonitorService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private device: DeviceService,
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
                mobileInternet: new FormControl(''),
                boondock: new FormControl(''),
                offGridLiving: new FormControl(''),
                solarPower: new FormControl(''),
                suggestInterest: new FormControl('', Validators.required)
              });
}

ngOnInit() {
  let backPath;
  let self = this;
  window.onpopstate = function(event) {
    self.activateBackArrowSvc.setBackRoute('', 'backward');
  };
  if (window.innerWidth > 600) {
    this.desktopUser = true;
    this.setReturnRoute();
  }

  this.showSpinner = true;
  if (!this.authSvc.isLoggedIn()) {
    backPath = this.location.path().substring(1, this.location.path().length);
    this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
    this.router.navigateByUrl('/?e=signin');
  } else {
    this.form.disable();

    this.listenForUserProfile();

    this.listenForColorTheme();
  }
}

  ngOnDestroy() {};


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }
    containerClass = 'container ' + bottomSpacing;

    return containerClass;
  }


  onBack() {
    let route = '/' + this.returnRoute
    this.activateBackArrowSvc.setBackRoute('', 'backward');
    this.router.navigateByUrl(route);
  }


  onBottomBack() {
    this.activateBackArrowSvc.setBackRoute('', 'backward');
    this.router.navigateByUrl('/profile/main');
  }


  onSuggestInterest() {
    let suggestionType = 'interest';

    this.showSpinner = true;

    if (this.form.controls.suggestInterest.value) {

      this.adminSvc.addSuggestion(this.form.controls.suggestInterest.value, suggestionType,
                                  this.profile.displayName, this.profile.profileImageUrl)
      .pipe(untilComponentDestroyed(this))
      .subscribe(suggestResult => {
        this.showSpinner = false;
        this.form.patchValue({
          suggestInterest: ''
        });
        this.readyToSuggest = false;
        this.suggestInterestOpen = 'out';
        this.shared.openSnackBar('Your suggestion has been forwarded to the administrator.  Thank you!', "message", 3000);
      }, error => {
        this.showSpinner = false;
        this.suggestInterestOpen = 'out';
        this.form.patchValue({
          suggestInterest: ''
        });
        this.readyToSuggest = false;
        this.sentry.logError('InterestsComponent:onSuggestInterest: error saving suggestion=' + JSON.stringify(error));
        this.shared.openSnackBar('Your suggestion has been forwarded to the administrator.  Thank you!', "message", 3000);
      });
    }
  }


  onSuggestInterestOpen() {
    this.suggestInterestOpen = this.suggestInterestOpen === 'out' ? 'in' : 'out';
  }


  // Update profile on server when user checks an interest
  onUpdateInterest(control: string, event: any) {
    this.showSaveIcon = true;
    this.profile[control] = event.checked;
    this.profileSvc.updateProfileAttribute(this.profile._id, control, this.profile[control])
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.profileSvc.distributeProfileUpdate(responseData);
      this.showSaveIcon = false;
    }, error => {
      this.showSaveIcon = false;
      this.shared.notifyUserMajorError();
      throw new Error(error);
    });
  }


  // Listen for changes in color theme;
  private listenForColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    }, error => {
      this.sentry.logError(JSON.stringify({"message":"unable to listen for color theme","error":error}));
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
        mobileInternet: this.profile.mobileInternet,
        boondock: this.profile.boondock,
        offGridLiving: this.profile.offGridLiving,
        solarPower: this.profile.solarPower
      });

      this.showSpinner = false;
      this.form.enable();
    }, error => {
      this.showSpinner = false;
      this.sentry.logError('InterestsComponent:listenForUserProfile: error getting profile=' + JSON.stringify(error));
    });
  }


  private setReturnRoute() {
    let returnStack: Array<string> = [];
    let i: number;

    this.activateBackArrowSvc.route$
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      returnStack = data;
      i = returnStack.length - 1;
      if (returnStack.length > 0) {
        if (returnStack[i].substring(0, 1) === '*') {
            this.returnRoute = returnStack[i].substring(1, returnStack[i].length);
        } else {
          this.returnRoute = returnStack[i];
        }
      } else {
          this.returnRoute = '';
      }
    }, error => {
      this.sentry.logError('YourStoryComponent:setReturnRoute: error setting return route=' + error);
    });
  }
}
