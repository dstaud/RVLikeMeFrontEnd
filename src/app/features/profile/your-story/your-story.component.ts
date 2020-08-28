import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, Iblog } from '@services/data-services/profile.service';
import { ShareDataService, ImessageShareData, IviewImage } from '@services/share-data.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { DeviceService } from '@services/device.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';
import { SharedComponent } from '@shared/shared.component';

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
  userRigTow: string;
  towing: string;
  userDisplayName: string;
  userIdViewer: string;
  showRigBrand: boolean = false;
  showRigTow: boolean = false;
  rigImageUrls: Array<string> = [];
  lifestyleImageUrls: Array<string> = [];
  desktopUser: boolean = false;
  blogLinks: Array<Iblog> = [];

  private paramsForMessaging: string;
  private returnRoute: string

  constructor(private profileSvc: ProfileService,
              private dialog: MatDialog,
              private translate: TranslateService,
              private authSvc: AuthenticationService,
              private location: Location,
              private shared: SharedComponent,
              private shareDataSvc: ShareDataService,
              private sentry: SentryMonitorService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private device: DeviceService,
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


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;
    let topSpacing: string;

    if (this.desktopUser && this.comingFromProfile) {
      containerClass = 'container-desktop';
    } else {
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
    }

    return containerClass;
  }


  onBack() {
    let route = '/' + this.returnRoute
    this.activateBackArrowSvc.setBackRoute('', 'backward');
    this.router.navigateByUrl(route);
  }

  // Navigate to send messages for the user whose story viewing
  onMessageUser() {
    this.activateBackArrowSvc.setBackRoute('profile/mystory', 'forward');
    this.shareDataSvc.setData('message', this.paramsForMessaging);
    if (this.desktopUser) {
      this.router.navigateByUrl('/messages/main');
    } else {
      this.router.navigateByUrl('/messages/send-message');
    }

  }


  onProfileImageSelect() {
    if (this.userProfileImage === './../../../../assets/images/no-profile-pic.jpg') {
      this.router.navigateByUrl('/profile/personal');
    }
  }


  onViewImage(imageUrl: string) {
    let imageData: IviewImage = {
      imageType: 'mystory',
      imageOwner: false,
      imageSource: imageUrl
    }
    this.shareDataSvc.setData('viewImage', imageData);

    if (this.desktopUser) {
      this.openImageViewDialog(imageUrl);
    } else {
      this.activateBackArrowSvc.setBackRoute('profile/mystory', 'forward');
      this.router.navigateByUrl('/profile/image-viewer');
    }
  }

  // View rig image larger
  openImageViewDialog(imageUrl: string): void {

    const dialogRef = this.dialog.open(ImageViewDialogComponent, {
      width: '600px',
      // height: '550px',
      disableClose: true,
      hasBackdrop: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {

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
      this.listenForUserProfile();
    } else {
      this.router.navigateByUrl('/home/main');
    }
  }


  // Listen for user profile and then take action
  private listenForUserProfile() {
    this.profileSvc.getUserProfile(this.userID)
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      if (profileResult.myStory) {
        this.userMyStory = profileResult.myStory;
      } else {
        this.userMyStory = profileResult.displayName + ' has not yet published a story';
      }
      if (profileResult.profileImageUrl) {
        this.userProfileImage = profileResult.profileImageUrl;
      }

      this.userDisplayName = profileResult.displayName
      if (profileResult.aboutMe) {
        if (profileResult.aboutMe.startsWith('@')) {
          this.userAboutMe = profileResult.aboutMe.substring(1,profileResult.aboutMe.length);
        } else {
          this.userAboutMe = 'profile.component.list.aboutme.' + profileResult.aboutMe.toLowerCase();
        }
      } else {
        this.userAboutMe = this.translate.instant('not entered yet');
      }

      if (profileResult.rvUse) {
        if (profileResult.rvUse.startsWith('@')) {
          this.userRvUse =  profileResult.rvUse.substring(1,profileResult.rvUse.length);
        } else {
          this.userRvUse = 'profile.component.list.rvuse.' + profileResult.rvUse.toLowerCase();
        }
      } else {
        this.userRvUse = this.translate.instant('not entered yet');
      }

      if (profileResult.rigType) {
        if (profileResult.rigType.startsWith('@')) {
          this.userRigType =  profileResult.rigType.substring(1,profileResult.rigType.length);
        } else {
          this.userRigType = 'profile.component.list.rigtype.' + profileResult.rigType.toLowerCase();
        }
      } else {
        this.userRigType = this.translate.instant('not entered yet');
      }
      this.userRigBrand = profileResult.rigBrand;
      this.userRigYear = profileResult.rigYear;
      this.userRigTow = profileResult.rigTow;

      if (profileResult.rigTow !== null && profileResult.rigTow !== 'null' && profileResult.rigTow !== '') {
        this.userRigTow = profileResult.rigTow;
        this.showRigTow = true;

        if (profileResult.rigType === 'A' || profileResult.rigType === 'B' ||
            profileResult.rigType === 'C' || profileResult.rigType === 'SC' ||
            profileResult.rigType === 'V' || profileResult.rigType === 'CB') {
              this.towing = 'Towing a ';
            } else {
              this.towing = 'Towed with ';
            }
      } else {
        this.showRigTow = false;
        this.towing = '';
        this.userRigTow = '';
      }

      if (profileResult.rigModel !== null && profileResult.rigModel !== 'null' && profileResult.rigModel !== '') {
        this.userRigModel = ' - ' + profileResult.rigModel;
      } else {
        this.userRigModel = '';
      }

      this.rigImageUrls = profileResult.rigImageUrls;
      this.lifestyleImageUrls = profileResult.lifestyleImageUrls;

      this.blogLinks = profileResult.blogLinks;

      if (this.userRigBrand) {
        this.showRigBrand = true;
      }
    }, error => {
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
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
