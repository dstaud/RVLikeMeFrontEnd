import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService } from '@services/data-services/profile.service';
import { ShareDataService, ImessageShareData, IviewImage } from '@services/share-data.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';

import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';

@Component({
  selector: 'app-rvlm-your-story',
  templateUrl: './your-story.component.html',
  styleUrls: ['./your-story.component.scss']
})
export class YourStoryComponent implements OnInit {
  @Input('comingFromProfile') comingFromProfile: boolean;

  userID : string;
  userMyStory: string;
  userProfileImage: string = './../../../../assets/images/no-profile-pic.jpg';
  userAboutMe: string;
  userRigType: string;
  userRigBrand: string;
  userRigYear: number;
  userRigModel: string;
  userRvUse: string;
  userDisplayName: string;
  userIdViewer: string;
  showRigBrand: boolean = false;
  rigImageUrls: Array<string> = [];
  lifestyleImageUrls: Array<string> = [];
  desktopUser: boolean = false;

  private paramsForMessaging: string;
  private returnRoute: string

  constructor(private profileSvc: ProfileService,
              private dialog: MatDialog,
              private translate: TranslateService,
              private authSvc: AuthenticationService,
              private location: Location,
              private shareDataSvc: ShareDataService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit(): void {
    if (window.innerWidth > 600) {
      this.desktopUser = true;
      this.setReturnRoute();
    }

    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.getParameters();
    }
  }

  ngOnDestroy() {}

  onBack() {
    let route = '/' + this.returnRoute
    this.activateBackArrowSvc.setBackRoute('', 'backward');
    this.router.navigateByUrl(route);
  }

  // Navigate to send messages for the user whose story viewing
  onMessageUser() {
    this.activateBackArrowSvc.setBackRoute('profile/mystory', 'forward');
    this.shareDataSvc.setData('message', this.paramsForMessaging);
    this.router.navigateByUrl('/messages/send-message');
  }


  onViewImage(imageUrl: string) {
    let imageData: IviewImage = {
      imageType: 'mystory',
      imageOwner: false,
      imageSource: imageUrl
    }
    this.shareDataSvc.setData('viewImage', imageData);

    this.activateBackArrowSvc.setBackRoute('profile/mystory', 'forward');
    this.router.navigateByUrl('/profile/image-viewer');
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

    if (this.shareDataSvc.getData('myStory').userID) {
      paramData = this.shareDataSvc.getData('myStory');
      this.userID = paramData.userID;
      this.userIdViewer = paramData.userIdViewer;
      this.paramsForMessaging = paramData.params;
      console.log('YourStoryComponent:getParameters: paramData=', paramData);
      this.listenForUserProfile();
    } else {
      this.router.navigateByUrl('/home/dashboard');
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
      console.log('YourStoryComponent:listenForUserProfile: my story=', this.userMyStory)
      if (profileResult.profileImageUrl) {
        this.userProfileImage = profileResult.profileImageUrl;
      }
      console.log('YourStoryComponent:listenForUserProfile: profile image=', this.userProfileImage);
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
      this.userRigBrand = profileResult.rigBrand;
      this.userRigYear = profileResult.rigYear;
      this.userRigModel = profileResult.rigModel;
      this.rigImageUrls = profileResult.rigImageUrls;
      this.lifestyleImageUrls = profileResult.lifestyleImageUrls;

      if (this.userRigBrand) {
        this.showRigBrand = true;
      }
    }, error => {
      console.error('YourStoryComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
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
      console.log('YourStoryComponent:ngOnInit: Return Route=', this.returnRoute);
    }, error => {
      console.error('YourStoryComponent:setReturnRoute: error setting return route ', error);
    });
  }
}
