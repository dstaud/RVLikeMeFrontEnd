import { Component, OnInit, OnDestroy, ViewChild, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import Cropper from 'cropperjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ShareDataService, IprofileImage } from '@services/share-data.service';
import { UploadImageService } from '@services/data-services/upload-image.service';
import { ProfileService } from '@services/data-services/profile.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { DeviceService } from '@services/device.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements OnInit {

  // Inject a reference to the original source image in the HTML (#image) for use as imageElement in the Typescript.
  @ViewChild('image', {static: false }) imageElement: ElementRef;

  @Output() formComplete = new EventEmitter()
  public formCompleted: string;

  imageDestination: string = '';
  showImageDestination: boolean = false;
  showSpinner: boolean = false;
  imageSource: string;
  containerDialog: boolean = false;
  iPhoneModelXPlus: boolean = false;

  private cropper: Cropper;
  private profileID: string;
  private newImageUrl: string;

  private showDestination = false;


  constructor(private shareDataSvc: ShareDataService,
              private router: Router,
              private Shared: SharedComponent,
              private sentry: SentryMonitorService,
              private uploadImageSvc: UploadImageService,
              private device: DeviceService,
              private profileSvc: ProfileService) {
          this.showSpinner = true;
          this.iPhoneModelXPlus = this.device.iPhoneModelXPlus}

  ngOnInit() {
    if (window.innerWidth > 600) {
      this.containerDialog = true;
    }

    if (!this.shareDataSvc.getData('profileImage').imageSource) {
      if (this.containerDialog) {
        this.formComplete.emit('canceled');
      } else {
        this.router.navigateByUrl('/profile/main');
      }
    } else {
      let data = this.shareDataSvc.getData('profileImage');
      this.imageSource = data.imageSource;
      this.profileID = data.profileID;
    }
  }

  ngOnDestroy() {}

  ngAfterViewInit() {
    this.createImageCropperObject();
  }

  // onRotateImage(degrees: number) {
  //   this.cropper.rotate(degrees);
  // }


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.containerDialog) {
      containerClass = 'container-desktop';
    } else {
      if (this.device.iPhoneModelXPlus) {
        bottomSpacing = 'bottom-bar-spacing-xplus';
      } else {
        bottomSpacing = 'bottom-bar-spacing';
      }
      containerClass = 'container ' + bottomSpacing;
    }

    console.log('ImageCropperComponent:getClass: class=', containerClass)
    return containerClass;
  }


  onCancel() {
    let imageData: IprofileImage = {
      profileID: null,
      imageSource: null,
      newImageUrl: null
    }
    if (this.containerDialog) {
      this.formComplete.emit('canceled');
    } else {
      this.shareDataSvc.setData('profileImage', imageData);
      this.router.navigateByUrl('/profile/personal');
    }
  }


  onSubmit() {
    this.showSpinner = true;
    let croppedImageBase64 = this.imageDestination;
    this.uploadImageSvc.uploadImageBase64(croppedImageBase64, (uploadedFileUrl: string) => {
      this.newImageUrl = uploadedFileUrl
      this.updateImageUrlInProfile(uploadedFileUrl);
    });
  }


  // Use third-party image cropper
  private createImageCropperObject() {
    let self = this;

    this.cropper = new Cropper(this.imageElement.nativeElement, {
      zoomable: false,
      scalable: false,
      aspectRatio: 1,
      viewMode: 1,
      rotatable: true,
      crop: () => {
        const canvas = this.cropper.getCroppedCanvas();
        this.imageDestination = canvas.toDataURL("image/png");
      },
      ready: function(event) {
        self.showImageDestination = true;
        self.showSpinner = false;
      }
    });
  }


  // Update data in profile document on database
  private updateImageUrlInProfile(profileImageUrl: string) {
    this.profileSvc.updateProfileAttribute(this.profileID, 'profileImageUrl', profileImageUrl)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((profileData) => {
      this.profileSvc.distributeProfileUpdate(profileData);
      this.profileSvc.deleteTempProfileImage(this.imageSource)
      .subscribe(responseData => {
        this.showSpinner = false;
        // this.Shared.openSnackBar("New profile image saved. Going back to profile in a few seconds","message", 3000);
        this.routeBackToProfile();
      }, error => {
        this.sentry.logError({"message":"error deleting temp profile image","error":error});
        this.showSpinner = false;
        // this.Shared.openSnackBar("New profile image saved. Going back to profile in a few seconds","message", 3000);
        this.routeBackToProfile();
      });
    }, error => {
      this.showSpinner = false;
      console.error('ImageCropperComponent:updateImageUrlInProfile: throw error ', error);
      throw new Error(error);
    });
  }


  private routeBackToProfile() {
    let imageData: IprofileImage = {
      profileID: null,
      imageSource: null,
      newImageUrl: null
    }
    // let self = this;

    if (this.containerDialog) {
      this.formComplete.emit(this.newImageUrl);
    } else {
      this.shareDataSvc.setData('profileImage', imageData);
      this.router.navigateByUrl('/profile/personal');
    }
    // setTimeout(function () {
    //   self.router.navigateByUrl('/profile/personal');
    // }, 2000);
  }
}
