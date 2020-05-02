
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-rvlm-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  daveID: string = environment.daveProfileID;
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
    if (!this.authSvc.isLoggedIn()) {
      let backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath);
      this.router.navigateByUrl('/signin');
    }

    this.listenForUserProfile();
  }

  ngOnDestroy() {}

  onDaveStory() {
    let userParams = this.packageParamsForMessaging();
    let params = '{"userID":"' + this.daveID + '",' +
                      '"userIdViewer":"' + this.profile.userID + '",' +
                      '"params":' + userParams + '}';
    this.activateBackArrowSvc.setBackRoute('about');
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/mystory');
  }


  // Listen for Profile changes
  private getDaveProfile() {
    console.log('AboutComponent:getDaveProfile: Userid =', this.daveID);
    this.profileSvc.getUserProfile(this.daveID)
    .subscribe(profileResult => {
      this.daveDisplayName = profileResult.displayName;
      this.daveProfileImageUrl = profileResult.profileImageUrl;
    }, error => {
      console.error('AboutComponent:getDaveProfile: error getting dave profile ', error);
      throw new Error(error);
    });
  }


  // Listen for Profile changes
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.profile = profileResult;
      this.getDaveProfile();
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
