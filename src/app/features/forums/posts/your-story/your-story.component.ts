import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import { ProfileService } from '@services/data-services/profile.service';
import { ShareDataService } from '@services/share-data.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

@Component({
  selector: 'app-your-story',
  templateUrl: './your-story.component.html',
  styleUrls: ['./your-story.component.scss']
})
export class YourStoryComponent implements OnInit {
  userID : string;
  userMyStory: string;
  userProfileImage: string;
  userAboutMe: string;
  userRigType: string;
  userRvUse: string;
  userDisplayName: string;
  userIdViewer: string;
  paramsForMessaging: string;

  constructor(private profileSvc: ProfileService,
              private translate: TranslateService,
              private shareDataSvc: ShareDataService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit(): void {
    let paramData: any;

    if (!this.shareDataSvc.getData()) {
      console.log('YourStoryComponent:ngOnInit: no parameters');
      this.router.navigateByUrl('/forums');
    } else {
      paramData = JSON.parse(this.shareDataSvc.getData());
      console.log('YourStoryComponent:ngOnInit: params=', paramData);
      this.userID = paramData.userID;
      this.userIdViewer = paramData.userIdViewer;
      this.paramsForMessaging = paramData.params;

      console.log('YourStoryComponent:ngOnInit: params', paramData);
      this.profileSvc.getUserProfile(this.userID)
      .subscribe(profileResult => {
        console.log('YourStoryComponent:ngOnInit: profile=', profileResult);
        this.getProfileInfo(profileResult);
      }, error => {
        console.log('YourStoryDialog:ngOnInit: throw error ', error);
        throw new Error(error);
      });
    }
  }


  onMessage() {
    this.activateBackArrowSvc.setBackRoute('forums-list');
    console.log('YourStoryComponent:onMessage: params for messaging=', this.paramsForMessaging);
    this.shareDataSvc.setData(this.paramsForMessaging);
    this.router.navigateByUrl('/messages/send-message');
  }

  private getProfileInfo(profileResult) {
    if (profileResult.myStory) {
      this.userMyStory = profileResult.myStory;
    } else {
      this.userMyStory = profileResult.displayName + ' has not yet published a story';
    }
    if (profileResult.profileImageUrl) {
      this.userProfileImage = profileResult.profileImageUrl;
    } else {
      this.userProfileImage = './../../../assets/images/no-profile-pic.jpg';
    }
    this.userDisplayName = profileResult.displayName
    if (profileResult.aboutMe) {
      if (profileResult.aboutMe.substring(0,1) === '@') {
        this.userAboutMe = profileResult.aboutMe.substring(1,profileResult.aboutMe.length);
      } else {
        this.userAboutMe = 'profile.component.list.aboutme.' + profileResult.aboutMe.toLowerCase();
      }
    } else {
      this.userAboutMe = 'not entered yet';
    }

    if (profileResult.rvUse) {
      if (profileResult.rvUse.substring(0,1) === '@') {
        this.userRvUse =  profileResult.rvUse.substring(1,profileResult.rvUse.length);
      } else {
        this.userRvUse = 'profile.component.list.rvuse.' + profileResult.rvUse.toLowerCase();
      }
    } else {
      this.userRvUse = 'not entered yet';
    }

    if (profileResult.rigType) {
      if (profileResult.rigType.substring(0,1) === '@') {
        this.userRigType =  profileResult.rigType.substring(1,profileResult.rigType.length);
      } else {
        this.userRigType = 'profile.component.list.rigtype.' + profileResult.rigType.toLowerCase();
      }
    } else {
      this.userRigType = 'not entered yet';
    }
  }
}
