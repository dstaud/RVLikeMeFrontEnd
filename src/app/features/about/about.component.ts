import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable} from 'rxjs';
import { take } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService, ImessageShareData, ImyStory } from '@services/share-data.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { DeviceService } from '@services/device.service';

@Component({
  selector: 'app-rvlm-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  daveID: string;
  daveDisplayName: string;
  daveProfileImageUrl: string;

  // Interface for profile data
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(private authSvc: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private shareDataSvc: ShareDataService,
              private sentry: SentryMonitorService,
              private router: Router,
              private device: DeviceService) {
              }

  ngOnInit() {
    let backPath: string;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.listenForUserProfile();
    }
  }

  ngOnDestroy() {}

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

  onDaveStory() {
    if (this.daveID) {
      let userParams:ImessageShareData = this.packageParamsForMessaging();

      let params:ImyStory = {
        userID: this.daveID,
        userIdViewer: this.profile.userID,
        params: userParams
      }

      // let params = '{"userID":"' + this.daveID + '",' +
      //                   '"userIdViewer":"' + this.profile.userID + '",' +
      //                   '"params":' + userParams + '}';
      this.activateBackArrowSvc.setBackRoute('about', 'forward');
      this.shareDataSvc.setData('myStory',params);
      this.router.navigateByUrl('/profile/mystory');
    }
  }

  // Get Dave credentials ID from database
  private getDaveInfo() {
    this.authSvc.getDaveInfo()
    .pipe(take(1))
    .subscribe(dave => {
      this.daveID = dave.id;
      this.daveDisplayName = dave.displayName;
      this.daveProfileImageUrl = dave.profileImageUrl;
    }, error => {
      if (error.status === 404) {
        this.sentry.logError({"status":404, "message":"Dave's credentials not found!"});
      }
    });
  }


  // Listen for Profile changes
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.profile = profileResult;
      this.getDaveInfo();
    }, error => {
      this.sentry.logError('AboutMainComponent:listenForUserProfile: error getting profile=' + error);
    });
  }


  private packageParamsForMessaging(): ImessageShareData {
    // let params: string;
    // params = '{"fromUserID":"' + this.profile.userID + '",' +
    //           '"fromDisplayName":"' + this.profile.displayName + '",' +
    //           '"fromProfileImageUrl":"' + this.profile.profileImageUrl + '",' +
    //           '"toUserID":"' + this.daveID + '",' +
    //           '"toDisplayName":"' + this.daveDisplayName + '",' +
    //           '"toProfileImageUrl":"' + this.daveProfileImageUrl + '"}';

    let params:ImessageShareData = {
      fromUserID: this.profile.userID,
      fromDisplayName: this.profile.displayName,
      fromProfileImageUrl: this.profile.profileImageUrl,
      toUserID: this.daveID,
      toDisplayName: this.daveDisplayName,
      toProfileImageUrl: this.daveProfileImageUrl
    }

    return params;
  }
}
