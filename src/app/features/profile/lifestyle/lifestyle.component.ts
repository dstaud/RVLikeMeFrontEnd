import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { UploadImageService } from '@services/data-services/upload-image.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { ShareDataService, IviewImage } from '@services/share-data.service';
import { AdminService } from '@services/data-services/admin.service';
import { DeviceService } from '@services/device.service';

import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';
import { SharedComponent } from '@shared/shared.component';
import { ThemeService } from '@services/theme.service';


/**** Interfaces for data for form selects ****/
export interface AboutMe {
  value: string;
  viewValue: string;
}

export interface RvLifestyle {
  value: string;
  viewValue: string;
}

export interface Worklife {
  value: string;
  viewValue: string;
}

export interface CampsWithMe {
  value: string;
  viewValue: string;
}

export interface Boondocking {
  value: string;
  viewValue: string;
}

export interface Traveling {
  value: string;
  viewValue: string;
}

/* This component allows users to enter information about their lifestyle.
I decided to implement auto-save in all large forms where changes are saved as user leaves the field.
It's possible this will be too noisy with internet traffic.  If that's the case, can move to save locally and submit at once,
but don't want to go to a Submit button model because that isn't very app-like and because I populate the form from the database
on-load, it's always dirty and marking pristine doesn't help.  This means route-guards won't work so user might leave form
and I can't notify them. */

@Component({
  selector: 'app-rvlm-lifestyle',
  templateUrl: './lifestyle.component.html',
  styleUrls: ['./lifestyle.component.scss'],
  animations: [
    trigger('helpNewbieSlideInOut', [
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
    ]),
    trigger('newbieSlideInOut', [
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
    ]),
    trigger('aboutMeOtherSlideInOut', [
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
    ]),
    trigger('rvUseOtherSlideInOut', [
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
    ]),
    trigger('worklifeOtherSlideInOut', [
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
    ]),
    trigger('campsWithMeOtherSlideInOut', [
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
    ]),
    trigger('boondockingOtherSlideInOut', [
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
    ]),
    trigger('travelingOtherSlideInOut', [
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
    ]),
    trigger('suggestLifestyleSlideInOut', [
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

export class LifestyleComponent implements OnInit {
  form: FormGroup;
  lifestyleImageUrls: Array<string> = [];
  aboutMeExperienced: boolean = false;
  desktopUser: boolean = false;
  placeholderPhotoUrl: string = './../../../../assets/images/photo-placeholder.png';
  nbrLifestyleImagePics: number = 0;
  profile: IuserProfile;
  suggestLifestyleOpen: string = 'out';
  readyToSuggest: boolean = false;
  iPhoneModelxPlus: boolean = false;
  theme: string;
  placeholderPhotos: boolean = false;

  aboutMeOtherOpen: string = 'out';
  rvUseOtherOpen: string = 'out';
  campsWithMeOtherOpen: string = 'out';
  worklifeOtherOpen: string = 'out';
  boondockingOtherOpen: string = 'out';
  travelingOtherOpen: string = 'out';
  helpNewbieOpen: string = 'out';
  newbieOpen: string = 'out';

  // Spinner is for initial load from the database only.
  // SaveIcons are shown next to each field as users leave the field, while doing the update
  showSpinner = false;
  showaboutMeSaveIcon = false;
  showhelpNewbiesSaveIcon = false;
  showrvUseSaveIcon = false;
  showworklifeSaveIcon = false;
  showcampsWithMeSaveIcon = false;
  showboondockingSaveIcon = false;
  showtravelingSaveIcon = false;

  aboutMeFormValue = '';
  rvUseFormValue = '';
  worklifeFormValue = '';
  campsWithMeFormValue = '';
  boondockingFormValue = '';
  travelingFormValue = '';


  AboutMes: AboutMe[] = [
    {value: '', viewValue: ''},
    {value: 'dreamer', viewValue: 'profile.component.list.aboutme.dreamer'},
    {value: 'newbie', viewValue: 'profile.component.list.aboutme.newbie'},
    {value: 'experienced', viewValue: 'profile.component.list.aboutme.experienced'},
    {value: 'other', viewValue: 'profile.component.list.aboutme.other'}
  ];

  /**** Select form select field option data. ****/
  RvLifestyles: RvLifestyle[] = [
    {value: '', viewValue: ''},
    {value: 'FTH', viewValue: 'profile.component.list.rvuse.fth'},
    {value: 'FTN', viewValue: 'profile.component.list.rvuse.ftn'},
    {value: 'FS', viewValue: 'profile.component.list.rvuse.fs'},
    {value: 'FP', viewValue: 'profile.component.list.rvuse.fp'},
    {value: 'TFW', viewValue: 'profile.component.list.rvuse.tfw'},
    {value: 'PS', viewValue: 'profile.component.list.rvuse.ps'},
    // {value: 'NY', viewValue: 'profile.component.list.rvuse.ny'},
    {value: 'other', viewValue: 'profile.component.list.rvuse.other'}
  ];

  Worklives: Worklife[] = [
    {value: '', viewValue: ''},
    {value: 'retired', viewValue: 'profile.component.list.worklife.retired'},
    {value: 'military', viewValue: 'profile.component.list.worklife.military'},
    {value: 'work-full-time', viewValue: 'profile.component.list.worklife.work-full-time'},
    {value: 'work-part-time', viewValue: 'profile.component.list.worklife.work-part-time'},
    {value: 'onleave', viewValue: 'profile.component.list.worklife.onleave'},
    {value: 'other', viewValue: 'profile.component.list.worklife.other'}
  ];

  CampsWithMes: CampsWithMe[] = [
    {value: '', viewValue: ''},
    {value: 'single', viewValue: 'profile.component.list.campswithme.single'},
    {value: 'partner', viewValue: 'profile.component.list.campswithme.partner'},
    {value: 'children', viewValue: 'profile.component.list.campswithme.children'},
    {value: 'children2', viewValue: 'profile.component.list.campswithme.children2'},
    {value: 'family', viewValue: 'profile.component.list.campswithme.family'},
    {value: 'friend', viewValue: 'profile.component.list.campswithme.friend'},
    {value: 'other', viewValue: 'profile.component.list.campswithme.other'}
  ];

  Boondockings: Boondocking[] = [
    {value: '', viewValue: ''},
    {value: 'most', viewValue: 'profile.component.list.boondocking.most'},
    {value: 'alot', viewValue: 'profile.component.list.boondocking.alot'},
    {value: 'some', viewValue: 'profile.component.list.boondocking.some'},
    {value: 'while', viewValue: 'profile.component.list.boondocking.while'},
    {value: 'haveto', viewValue: 'profile.component.list.boondocking.haveto'},
    {value: 'rarely', viewValue: 'profile.component.list.boondocking.rarely'},
    {value: 'want', viewValue: 'profile.component.list.boondocking.want'}
  ];

  Travelings: Traveling[] = [
    {value: '', viewValue: ''},
    {value: 'countries', viewValue: 'profile.component.list.traveling.countries'},
    {value: 'country', viewValue: 'profile.component.list.traveling.country'},
    {value: 'regional', viewValue: 'profile.component.list.traveling.regional'},
    {value: 'none', viewValue: 'profile.component.list.traveling.none'},
    {value: 'other', viewValue: 'profile.component.list.traveling.other'},
  ];

  private userProfile: Observable<IuserProfile>;
  private returnRoute: string;


  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }

  constructor(private profileSvc: ProfileService,
              private dialog: MatDialog,
              private location: Location,
              private router: Router,
              private authSvc: AuthenticationService,
              private uploadImageSvc: UploadImageService,
              private sentry: SentryMonitorService,
              private adminSvc: AdminService,
              private themeSvc: ThemeService,
              private shared: SharedComponent,
              private activateBackArrowSvc: ActivateBackArrowService,
              private shareDataSvc: ShareDataService,
              private device: DeviceService,
              fb: FormBuilder) {
              this.form = fb.group({
                aboutMe: new FormControl(''),
                aboutMeOther: new FormControl(''),
                helpNewbies: new FormControl(false),
                rvUse: new FormControl(''),
                rvUseOther: new FormControl(''),
                worklife: new FormControl(''),
                worklifeOther: new FormControl(''),
                campsWithMe: new FormControl(''),
                campsWithMeOther: new FormControl(''),
                boondocking: new FormControl(''),
                boondockingOther: new FormControl(''),
                traveling: new FormControl(''),
                travelingOther: new FormControl(''),
                suggestLifestyle: new FormControl('')
                });
              this.iPhoneModelxPlus = this.device.iPhoneModelXPlus;
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

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.showSpinner = true;

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


  // Offer chance for experienced RVer to help out newbies
  onHelpNewbies() {
    let callHelpNewbiesUpdateWhenDone: boolean = false;

    this.showhelpNewbiesSaveIcon = true;
    this.profile.helpNewbies = this.form.controls.helpNewbies.value
    this.updateLifestyle('helpNewbies', this.profile.helpNewbies, callHelpNewbiesUpdateWhenDone);
  }


  // When user opts to upload an image compress and upload to server and update the profile with new URL
  onLifestyleImageSelected(event: any) {
    let fileType: string = 'lifestyle';

    if (event.target.files[0]) {
      this.showSpinner = true;
      this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
        this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
          if (uploadedFileUrl === 'error') {
            this.shared.openSnackBar('There was a problem uploading your photo.  It is likely too large.','error',5000);
            this.showSpinner = false;
          } else {
            this.updateProfileLifestyleImageUrls(uploadedFileUrl);
            this.showSpinner = false;
          }
        });
      });
    }
  }


  onOther(control: string) {
    let callHelpNewbiesUpdateWhenDone = false;
    let otherControl = control + 'Other';
    let value = '@' + this.form.controls[otherControl].value;
    this.updateDataPoint(value, control, callHelpNewbiesUpdateWhenDone);
  }


  // Form Select option processing
  onSelectedSelectItem(control: string, controlDesc: string, value: string) {
    let otherControl: string = control + 'OtherOpen';
    let callHelpNewbiesUpdateWhenDone: boolean = false;

    // Open up slideout for helping newbies if they are experienced.
    if (control === 'aboutMe') {
      if (value === 'experienced') {
        this.helpNewbieOpen = 'in';
        this.newbieOpen = 'out';
      } else {
        this.helpNewbieOpen = 'out';
        this.profile.helpNewbies = false;
        this.form.patchValue({ helpNewbies: 'false'});
        callHelpNewbiesUpdateWhenDone = true;
        if (value === 'dreamer' || value === 'newbie') {
          this.newbieOpen = 'in';
        }
      }
    }

    if (value === 'other') {
      this[otherControl] = 'in';
    } else {
      this[otherControl] = 'out';
      this.updateDataPoint(value, control, callHelpNewbiesUpdateWhenDone);
    }
  }


  onSuggestLifestyle() {
    let suggestionType = 'lifestyle';

    this.showSpinner = true;

    if (this.form.controls.suggestLifestyle.value) {
      this.adminSvc.addSuggestion(this.form.controls.suggestLifestyle.value, suggestionType,
                                  this.profile.displayName, this.profile.profileImageUrl)
      .pipe(untilComponentDestroyed(this))
      .subscribe(suggestResult => {
        this.showSpinner = false;
        this.form.patchValue({
          suggestLifestyle: ''
        });
        this.readyToSuggest = false;
        this.suggestLifestyleOpen = 'out';
        this.shared.openSnackBar('Your suggestion has been forwarded to the administrator.  Thank you!', "message", 3000);
      }, error => {
        this.showSpinner = false;
        this.suggestLifestyleOpen = 'out';
        this.form.patchValue({
          suggestLifestyle: ''
        });
        this.readyToSuggest = false;
        this.sentry.logError('LifestyleComponent:onSuggestLifestyle: error saving suggestion=' + JSON.stringify(error));
        this.shared.openSnackBar('Your suggestion has been forwarded to the administrator.  Thank you!', "message", 3000);
      });
    }
  }

  onSuggestLifestyleOpen() {
    this.suggestLifestyleOpen = this.suggestLifestyleOpen === 'out' ? 'in' : 'out';
  }


  onViewImage(row: number) {
    if (row < this.nbrLifestyleImagePics) { // Don't do anything if placeholder image
      let imageData: IviewImage = {
        profileID: this.profile._id,
        imageType: 'lifestyle',
        imageOwner: true,
        imageSource: this.lifestyleImageUrls[row]
      }
      this.shareDataSvc.setData('viewImage', imageData);

      if (this.desktopUser) {
        this.openImageViewDialog(row);
      } else {
        this.activateBackArrowSvc.setBackRoute('profile/lifestyle', 'forward');
        this.router.navigateByUrl('/profile/image-viewer');
      }
    }
  }


  // View lifestyle image larger
  openImageViewDialog(row: number): void {
    let imageUrl = this.lifestyleImageUrls[row];

    const dialogRef = this.dialog.open(ImageViewDialogComponent, {
      width: '600px',
      // height: '550px',
      disableClose: true,
      hasBackdrop: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {

    }, error => {
      this.sentry.logError(JSON.stringify({"message":"error closing dialog","error":error}));
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


  private listenForUserProfile() {
    let helpNewbies: string;

    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      if (profileResult._id) {

        this.profile = profileResult;

        // For controls where user can select 'other', do some special processing
        this.otherData('aboutMe');
        this.otherData('rvUse');
        this.otherData('worklife');
        this.otherData('campsWithMe');
        this.otherData('boondocking');
        this.otherData('traveling');

        if (profileResult.helpNewbies) {
          helpNewbies = profileResult.helpNewbies.toString();
        } else {
          helpNewbies = 'false';
        }

        this.form.patchValue ({
          aboutMe: this.aboutMeFormValue,
          helpNewbies: helpNewbies,
          rvUse: this.rvUseFormValue,
          worklife: this.worklifeFormValue,
          campsWithMe: this.campsWithMeFormValue,
          boondocking: this.boondockingFormValue,
          traveling: this.travelingFormValue
        });

        this.lifestyleImageUrls = this.profile.lifestyleImageUrls;

        // Put this hack in.  Getting strange behavior where it is coming back into this subscription without any place
        // nexting a new one and it has the placeholder in the profile...somehow.  This makes sure we ignore that.
        this.nbrLifestyleImagePics = this.lifestyleImageUrls.length;
        for (let i=0; i < this.lifestyleImageUrls.length; i++) {
          if (this.lifestyleImageUrls[i] === this.placeholderPhotoUrl) {
            this.nbrLifestyleImagePics = i;
          }
        }

        this.placeholderPhotos = false;
        for (let i=this.lifestyleImageUrls.length; i < 3; i++) {
          this.placeholderPhotos = true;

          this.lifestyleImageUrls.push(this.placeholderPhotoUrl);
        }

        if (this.profile.aboutMe === 'experienced') {
          this.aboutMeExperienced = true;
          this.helpNewbieOpen = 'in';
        } else if (this.profile.aboutMe === 'dreamer' || this.profile.aboutMe === 'newbie') {
          this.newbieOpen = 'in';
        } else {
          this.helpNewbieOpen = 'out';
          this.newbieOpen = 'out';
        }

        this.showSpinner = false;
        this.form.enable();
      }

    }, (error) => {
      this.showSpinner = false;
      this.sentry.logError('LifestyleComponent:listenForUserProfile: error getting profile=' + JSON.stringify(error));
    });
  }


  // @ indicates user selected 'other' and this is what they entered.  Stored with '@' in database.
  private otherData(control: string) {
    let otherControl = control + 'Other';
    let otherOpen = control + 'OtherOpen';
    let formValue = control + 'FormValue';
    let result = false;
    if (this.profile[control]) {
      if (this.profile[control].substring(0, 1) === '@') {
        this[formValue] = 'other';
        this.form.patchValue({
          [otherControl]: this.profile[control].substring(1, this.profile[control].length)
        })
        this[otherOpen] = 'in';
      } else {
        this[formValue] = this.profile[control];
      }
    }
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
      this.sentry.logError('LifestyleComponent:setReturnRoute: error setting return route ' + error);
    });
  }


  /**** Field auto-update processing ****/
  private updateDataPoint(value: string, control: string, callHelpNewbiesUpdateWhenDone: boolean) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (value === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.profile[control] = value;
    }
    this.updateLifestyle(control, this.profile[control], callHelpNewbiesUpdateWhenDone);
  }


  private updateLifestyle(control: string, value: any, callHelpNewbiesUpdateWhenDone: boolean) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this.profileSvc.updateProfileAttribute(this.profile._id, control, value)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
      this.profileSvc.distributeProfileUpdate(this.profile);

      if (callHelpNewbiesUpdateWhenDone) {
        this.onHelpNewbies();
      }
     }, error => {
      this[SaveIcon] = false;
      this.shared.notifyUserMajorError();
      throw new Error(error);
    });
  }


  // Update lifestyle image url array in user's profile with new uploaded lifestyle image.
  private updateProfileLifestyleImageUrls(lifestyleImageUrl: string) {
    this.profileSvc.addLifestyleImageUrlToProfile(this.profile._id, lifestyleImageUrl)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.profileSvc.distributeProfileUpdate(responseData);
      this.showSpinner = false;

    }, error => {
      this.showSpinner = false;
      this.shared.notifyUserMajorError();
      throw new Error(error);
    });
  }
}
