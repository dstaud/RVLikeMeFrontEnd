import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { environment } from '@environments/environment';
import { Observable} from 'rxjs';
import { take } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { AuthenticationService, ItokenPayload } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

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
              private router: Router) {
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

  onDaveStory() {
    if (this.daveID) {
      let userParams = this.packageParamsForMessaging();
      console.log('AboutComponent:onDaveStory: userParams=', userParams);
      let params = '{"userID":"' + this.daveID + '",' +
                        '"userIdViewer":"' + this.profile.userID + '",' +
                        '"params":' + userParams + '}';
      this.activateBackArrowSvc.setBackRoute('about', 'forward');
      this.shareDataSvc.setData(params);
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
      console.log('AboutComponent:getDaveInfo: dave=', dave);
    }, error => {
      if (error.status !== 404) {
        console.error('AboutComponent:getDaveCredentials: error getting user credentials ', error);
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
      console.error('AboutComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }


  private packageParamsForMessaging(): string {
    let params: string;
    params = '{"fromUserID":"' + this.profile.userID + '",' +
              '"fromDisplayName":"' + this.profile.displayName + '",' +
              '"fromProfileImageUrl":"' + this.profile.profileImageUrl + '",' +
              '"toUserID":"' + this.daveID + '",' +
              '"toDisplayName":"' + this.daveDisplayName + '",' +
              '"toProfileImageUrl":"' + this.daveProfileImageUrl + '"}';

    return params;
  }
}
