import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ShareDataService, IviewImage } from '@services/share-data.service';
import { UploadImageService } from '@services/data-services/upload-image.service';
import { ProfileService } from '@services/data-services/profile.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

@Component({
  selector: 'app-rvlm-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {
  @Output() formComplete = new EventEmitter()
  public formCompleted: string;

  containerDialog: boolean = false;
  originalImageSource: string;
  imageData: IviewImage;
  imageSource: string;
  imageOwner: boolean = false;
  deactivateButtons: boolean = false;

  showSpinner: boolean = false;

  constructor(private shareDataSvc: ShareDataService,
              private router: Router,
              private uploadImageSvc: UploadImageService,
              private sentry: SentryMonitorService,
              private profileSvc: ProfileService) { }

  ngOnInit(): void {
    if (window.innerWidth > 600) {
      this.containerDialog = true;
    }
    console.log('ImageViewerComponent:ngOnInit: data=',this.shareDataSvc.getData('viewImage') )
    if (!this.shareDataSvc.getData('viewImage').imageSource) {
      if (this.containerDialog) {
        this.formComplete.emit('ok');
      } else {
        this.router.navigateByUrl('/home/dashboard');
      }
    } else {
      this.imageData = this.shareDataSvc.getData('viewImage');
      this.imageSource = this.imageData.imageSource;
      this.originalImageSource = this.imageData.imageSource;
      this.imageOwner = this.imageData.imageOwner;
    }
  }

  ngOnDestroy() {}


  onChange(event: any) {
    this.showSpinner = true;
    this.deactivateButtons = true;
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.uploadImageSvc.uploadImage(compressedFile, this.imageData.imageType, (uploadedFileUrl: string) => {
        this.imageData.imageSource = uploadedFileUrl;
        if (this.imageData.imageType === 'lifestyle') {
          this.deleteLifestyleImageUrlFromProfile(this.originalImageSource, 'change', uploadedFileUrl);
        } else if (this.imageData.imageType === 'rig') {
          this.deleteRigImageUrlFromProfile(this.originalImageSource, 'change', uploadedFileUrl);
        } else {
          console.error('ImageViewerComponent:OnChange: invalid imageType = ', this.imageData.imageType);
        }
      });
    });
  }


  onDelete() {
    this.showSpinner = true;
    this.deactivateButtons = true;
    if (this.imageData.imageType === 'lifestyle') {
      this.deleteLifestyleImageUrlFromProfile(this.originalImageSource, 'delete');
    } else if (this.imageData.imageType === 'rig') {
      this.deleteRigImageUrlFromProfile(this.originalImageSource, 'delete');
    } else {
      console.error('ImageViewerComponent:OnChange: invalid imageType = ', this.imageData.imageType);
    }
  }


  onOK() {
    let url = 'profile/' + this.imageData.imageType;
    this.shareDataSvc.setData('viewImage', this.imageData);

    if (this.containerDialog) {
      this.formComplete.emit('ok');
    } else {
      this.router.navigateByUrl(url);
    }
  }

  private deleteLifestyleImageUrlFromProfile(lifestyleImageUrl: string, changeOrDelete: string, newImageFileUrl?: string) {
    let url = 'profile/' + this.imageData.imageType;
    console.log('ImageViewerComponent:deleteLifestyleImage: deleting on server, iD=', this.imageData.profileID, ' image=', lifestyleImageUrl, 'action=', changeOrDelete)
    this.profileSvc.deleteLifestyleImageUrlFromProfile(this.imageData.profileID, lifestyleImageUrl)
    .subscribe(imageResult => {
      if (newImageFileUrl) {
        this.updateProfileLifestyleImageUrls(newImageFileUrl);
      } else {
        this.profileSvc.getProfile();
        this.showSpinner = false;
        this.shareDataSvc.setData('viewImage', this.imageData);
        if (changeOrDelete === 'delete') {
          if (this.containerDialog) {
            this.formComplete.emit('ok');
          } else {
            this.router.navigateByUrl(url);
          }
        } else {
          this.deactivateButtons = false;
        }
      }
    }, error => {
      console.error('error deleting lifestyle image url from profile=', error);
      this.sentry.logError({"message":"error deleting lifestyle image url from profile","error":error});
      this.showSpinner = false;
    })
  }


  // Delete the image url from the user's profile
  private deleteRigImageUrlFromProfile(imageUrl: string, changeOrDelete: string, newImageFileUrl?: string) {
    let url = 'profile/' + this.imageData.imageType;

    this.profileSvc.deleteRigImageUrlFromProfile(this.imageData.profileID, imageUrl)
    .subscribe(imageResult => {
      if (newImageFileUrl) {
        this.updateProfileRigImageUrls(newImageFileUrl);
      } else {
        this.profileSvc.getProfile();
        this.showSpinner = false;
        this.shareDataSvc.setData('viewImage', this.imageData);
        if (changeOrDelete === 'delete') {
          if (this.containerDialog) {
            this.formComplete.emit('ok');
          } else {
            this.router.navigateByUrl(url);
          }
        } else {
          this.deactivateButtons = false;
        }
      }
    }, error => {
      console.error('error deleting lifestyle image url from profile=', error);
      this.sentry.logError({"message":"error uploading rig image","error":error});
      this.showSpinner = false;
    })
  }


  // Update lifestyle image url array in user's profile with new uploaded lifestyle image.
  private updateProfileLifestyleImageUrls(lifestyleImageUrl: string) {
    let url = 'profile/' + this.imageData.imageType;

    this.profileSvc.addLifestyleImageUrlToProfile(this.imageData.profileID, lifestyleImageUrl)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.profileSvc.getProfile();
      this.showSpinner = false;
      this.deactivateButtons = false;
      this.imageSource = lifestyleImageUrl;
    }, error => {
      this.showSpinner = false;
      console.error('LifestyleComponent:updateProfileLifestyleImageUrls: throw error ', error);
      throw new Error(error);
    });
  }


  // Update rig image url array in user's profile with new uploaded rig image.
  private updateProfileRigImageUrls(rigImageUrl: string) {
    let url = 'profile/' + this.imageData.imageType;

    this.profileSvc.addRigImageUrlToProfile(this.imageData.profileID, rigImageUrl)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.profileSvc.getProfile();
      this.showSpinner = false;
      this.deactivateButtons = false;
      this.imageSource = rigImageUrl;
    }, error => {
      this.showSpinner = false;
      console.error('RvRigComponent:updateProfileRigImageUrls: throw error ', error);
      throw new Error(error);
    });
  }
}
