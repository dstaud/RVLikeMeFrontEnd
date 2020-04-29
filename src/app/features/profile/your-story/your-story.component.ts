import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService } from '@services/data-services/profile.service';
import { ShareDataService } from '@services/share-data.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';

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
  rigImageUrls: Array<string> = [];
  lifestyleImageUrls: Array<string> = [];

  private paramsForMessaging: string;

  constructor(private profileSvc: ProfileService,
              private dialog: MatDialog,
              private translate: TranslateService,
              private shareDataSvc: ShareDataService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit(): void {
    this.getParameters();
  }

  ngOnDestroy() {}

  // TODO: maintain data if user goes back to this component from Send Messages


  // Navigate to send messages for the user whose story viewing
  onMessageUser() {
    this.activateBackArrowSvc.setBackRoute('mystory');
    this.shareDataSvc.setData(this.paramsForMessaging);
    this.router.navigateByUrl('/messages/send-message');
  }


  // View rig image larger
  openImageViewDialog(imageUrl: string): void {

    const dialogRef = this.dialog.open(ImageViewDialogComponent, {
      width: '95%',
      maxWidth: 600,
      data: {imageUrl: imageUrl, Alter: false }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      console.log('closed dialog')
    });
  }


  // Get peramaters from shared data service and then begin listening for profile
  private getParameters() {
    let paramData: any;

    if (!this.shareDataSvc.getData()) {
      this.router.navigateByUrl('/forums');
    } else {
      paramData = JSON.parse(this.shareDataSvc.getData());
      this.userID = paramData.userID;
      this.userIdViewer = paramData.userIdViewer;
      this.paramsForMessaging = paramData.params;

      this.listenForUserProfile();
    }
  }


  // Listen for user profile and then take action
  private listenForUserProfile() {
    this.profileSvc.getUserProfile(this.userID)
    .subscribe(profileResult => {
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
        this.userAboutMe = this.translate.instant('not entered yet');
      }

      if (profileResult.rvUse) {
        if (profileResult.rvUse.substring(0,1) === '@') {
          this.userRvUse =  profileResult.rvUse.substring(1,profileResult.rvUse.length);
        } else {
          this.userRvUse = 'profile.component.list.rvuse.' + profileResult.rvUse.toLowerCase();
        }
      } else {
        this.userRvUse = this.translate.instant('not entered yet');
      }

      if (profileResult.rigType) {
        if (profileResult.rigType.substring(0,1) === '@') {
          this.userRigType =  profileResult.rigType.substring(1,profileResult.rigType.length);
        } else {
          this.userRigType = 'profile.component.list.rigtype.' + profileResult.rigType.toLowerCase();
        }
      } else {
        this.userRigType = this.translate.instant('not entered yet');
      }

      this.rigImageUrls = profileResult.rigImageUrls;
      this.lifestyleImageUrls = profileResult.lifestyleImageUrls;
    }, error => {
      console.error('YourStoryComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }
}