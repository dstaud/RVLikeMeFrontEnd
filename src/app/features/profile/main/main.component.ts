import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { LanguageService } from '@services/language.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ShareDataService, ImessageShareData, ImyStory } from '@services/share-data.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { DeviceService } from '@services/device.service';
import { ThemeService } from './../../../core/services/theme.service';

export interface AboutMe {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-rvlm-profile-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  percentPersonal: number;
  personalProgressBarColor: string;
  personalEnteredMostInfo: boolean = false;
  percentLifestyle: number;
  lifestyleProgressBarColor: string;
  lifestyleEnteredMostInfo: boolean = false;
  percentRig: number;
  rigProgressBarColor: string;
  rigEnteredMostInfo: boolean = false;
  interestsIndicator: string;
  interestsIndClass: string;
  desktopUser: boolean = false;
  profileImageUrl = './../../../../assets/images/no-profile-pic.jpg';
  theme: string;
  linkOnOff: string = 'link_off';

  showSpinner = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private location: Location,
              private language: LanguageService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private dialog: MatDialog,
              private themeSvc: ThemeService,
              private sentry: SentryMonitorService,
              private shareDataSvc: ShareDataService,
              private device: DeviceService,
              private router: Router) {
            }

  ngOnInit() {
    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (window.innerWidth > 600) {
      this.desktopUser = true;
    }

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.showSpinner = true;

      this.listenForUserProfile();

      this.listenForColorTheme();
    }
   }

   ngOnDestroy() { }


   getClass() {
    let containerClass: string;
    let bottomSpacing: string;
    let topSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }

    if (this.desktopUser) {
      topSpacing = 'desktop-spacing';
    } else {
      topSpacing = 'device-spacing';
    }

    containerClass = 'container ' + bottomSpacing + ' ' + topSpacing;

    return containerClass;
  }


  /**** Route to sub-profile pages as user selects ****/
  onBlogLinks() {
    this.activateBackArrowSvc.setBackRoute('profile/main', 'forward');
    this.router.navigateByUrl('/profile/blog-link');
  }

  onInterests() {
    this.activateBackArrowSvc.setBackRoute('profile/main', 'forward');
    this.router.navigateByUrl('/profile/interests');
  }

  onLifestyle() {
    this.activateBackArrowSvc.setBackRoute('profile/main', 'forward');
    this.router.navigateByUrl('/profile/lifestyle');
  }

  onLikeMe() {
    this.activateBackArrowSvc.setBackRoute('profile/main', 'forward');
    this.router.navigateByUrl('/connections/main');
  }

  onPersonal() {
    this.activateBackArrowSvc.setBackRoute('profile/main', 'forward');
    this.router.navigateByUrl('/profile/personal');
  }

  onRig() {
    this.activateBackArrowSvc.setBackRoute('profile/main', 'forward');
    this.router.navigateByUrl('/profile/rig');
  }

  // View your story as other users will see it
  onYourStory() {
    let userParams:ImessageShareData = this.packageParamsForMessaging();
    let params:ImyStory = {
      userID: this.profile.userID,
      userIdViewer: this.profile.userID,
      params: userParams
    }

    this.activateBackArrowSvc.setBackRoute('profile/main', 'forward');
    this.shareDataSvc.setData('myStory', params);
    this.router.navigateByUrl('/profile/mystory');
  }


  // Determine the percent complete for each type of data in the form and display appropriate data
  private determinePercentComplete(profile: IuserProfile) {
    let totalPersonalFieldsWithData = 0;
    let totalPersonalNbrOfFields = 7;

    let totalRigFieldsWithData = 0;
    let totalRigNbrOfFields = 6;

    let totalLifestyleFieldsWithData = 0;
    let totalLifestyleNbrOfFields = 5;

    // Personal data
    if (profile.firstName) { totalPersonalFieldsWithData++; };
    if (profile.lastName) { totalPersonalFieldsWithData++; };
    if (profile.displayName) { totalPersonalFieldsWithData++; };
    if (profile.yearOfBirth) { totalPersonalFieldsWithData++; };
    if (profile.homeCountry) { totalPersonalFieldsWithData++; };
    if (profile.homeState) { totalPersonalFieldsWithData++; };
    if (profile.gender) { totalPersonalFieldsWithData++; };
    if (profile.myStory) { totalPersonalFieldsWithData++; };
    this.percentPersonal = (totalPersonalFieldsWithData / totalPersonalNbrOfFields) * 100;
    if (this.percentPersonal < 13) {
      this.personalProgressBarColor = 'warn'
    } else {
      this.personalProgressBarColor = 'primary'
    }
    if (this.percentPersonal > 74) {
      this.personalEnteredMostInfo = true;
    }

    // Lifestyle data
    if (profile.aboutMe) { totalLifestyleFieldsWithData++; };
    if (profile.rvUse) { totalLifestyleFieldsWithData++; };
    if (profile.worklife) { totalLifestyleFieldsWithData++; };
    if (profile.campsWithMe) { totalLifestyleFieldsWithData++; };
    if (profile.boondocking) { totalLifestyleFieldsWithData++; };
    if (profile.traveling) { totalLifestyleFieldsWithData++; };
    this.percentLifestyle = (totalLifestyleFieldsWithData / totalLifestyleNbrOfFields) * 100;
    if (this.percentLifestyle < 5) {
      this.lifestyleProgressBarColor = 'warn'
    } else {
      this.lifestyleProgressBarColor = 'primary'
    }
    if (this.percentLifestyle> 65) {
      this.lifestyleEnteredMostInfo = true;
    }

    // Rig data
    if (profile.rigType) { totalRigFieldsWithData++; };
    if (profile.rigYear) { totalRigFieldsWithData++; };
    if (profile.rigBrand) { totalRigFieldsWithData++; };
    if (profile.rigModel) { totalRigFieldsWithData++; };
    if (profile.rigTow) { totalRigFieldsWithData++; };
    this.percentRig = (totalRigFieldsWithData / totalRigNbrOfFields) * 100;
    if (this.percentRig < 13) {
      this.rigProgressBarColor = 'warn'
    } else {
      this.rigProgressBarColor = 'primary'
    }
    if (this.percentRig > 49) {
      this.rigEnteredMostInfo = true;
    }

    // Interests Data
    if (profile.atv || profile.motorcycle || profile.travel || profile.quilting || profile.cooking || profile.painting ||
        profile.blogging || profile.livingFrugally || profile.gaming || profile.musicalInstrument || profile.programming ||
        profile.mobileInternet || profile.offGridLiving || profile.boondock || profile.solarPower || profile.hiking ||
        profile.fishing || profile.hunting || profile.kayaking || profile.yoga || profile.knitting || profile.crocheting) {
      this.interestsIndicator = 'sentiment_very_satisfied';
      this.interestsIndClass = 'has-interests';
    } else {
      this.interestsIndicator = 'sentiment_dissatisfied';
      this.interestsIndClass = 'no-interests';
    }
    // Blog link Data
    if (profile.blogLinks) {
      if (profile.blogLinks.length === 0) {
        this.linkOnOff = 'link_off';
      } else {
        this.linkOnOff = 'link';
      }
    } else {
      this.linkOnOff = 'link_off';
    }
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


  // Listen for profile data and then take actions based on that data
  private listenForUserProfile() {
    let helpNewbies: string

    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.profile = profileResult;

      if (profileResult.helpNewbies) {
        helpNewbies = profileResult.helpNewbies.toString();
      } else {
        helpNewbies = 'false';
      }

      this.determinePercentComplete(profileResult);

      // Make sure embedded story has data it needs
      if (this.desktopUser) {
        let userParams:ImessageShareData = this.packageParamsForMessaging();
        let params:ImyStory = {
          userID: this.profile.userID,
          userIdViewer: this.profile.userID,
          params: userParams
        }
        this.shareDataSvc.setData('myStory', params);
      }

      if (profileResult.profileImageUrl) {
        this.profileImageUrl = profileResult.profileImageUrl;
      }

      this.showSpinner = false;
    }, (error) => {
      this.showSpinner = false;
      this.sentry.logError('ProfileComponent:listenForUserProfile: error saving new profile=' + JSON.stringify(error));
    });
  }


  private packageParamsForMessaging(): ImessageShareData {
    let params:ImessageShareData = {
      fromUserID: this.profile.userID,
      fromDisplayName: this.profile.displayName,
      fromProfileImageUrl: this.profile.profileImageUrl,
      toUserID: '',
      toDisplayName: '',
      toProfileImageUrl: ''
    }

    return params;
  }
}
