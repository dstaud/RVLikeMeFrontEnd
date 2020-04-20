import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import * as exifr from 'exifr/dist/mini.legacy.umd';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { UploadImageService } from '@services/data-services/upload-image.service';
import { OrientImageService } from '@services/orient-image.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';
import { ImageDialogComponent } from '@dialogs/image-dialog/image-dialog.component';

// TODO: Add rig database and hook to this component

export interface RigType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-rvlm-rv-rig',
  templateUrl: './rv-rig.component.html',
  styleUrls: ['./rv-rig.component.scss']
})
export class RvRigComponent implements OnInit {

  @ViewChild('canvas', {static: false}) canvas: ElementRef;
  public context: CanvasRenderingContext2D;

  form: FormGroup;
  rigType:string = '';
  rigImageUrl: string = '';

  // Spinner is for initial load from the database only.
  // SaveIcons are shown next to each field as users leave the field, while doing the update
  showSpinner = false;
  showrigTypeSaveIcon = false;
  showrigManufacturerSaveIcon = false;
  showrigBrandSaveIcon = false;
  showrigModelSaveIcon = false;
  showrigYearSaveIcon = false;

  /**** Select form select field option data. ****/
  RigTypes: RigType[] = [
    {value: '', viewValue: ''},
    {value: 'A', viewValue: 'profile.component.list.rigtype.a'},
    {value: 'B', viewValue: 'profile.component.list.rigtype.b'},
    {value: 'C', viewValue: 'profile.component.list.rigtype.c'},
    {value: 'SC', viewValue: 'profile.component.list.rigtype.sc'},
    {value: 'FW', viewValue: 'profile.component.list.rigtype.fw'},
    {value: 'TT', viewValue: 'profile.component.list.rigtype.tt'},
    {value: 'TC', viewValue: 'profile.component.list.rigtype.tc'},
    {value: 'FT', viewValue: 'profile.component.list.rigtype.ft'},
    {value: 'V', viewValue: 'profile.component.list.rigtype.v'},
    {value: 'CB', viewValue: 'profile.component.list.rigtype.cb'},
    {value: 'other', viewValue: 'profile.component.list.rigtype.other'}
  ];

  // Interface for Profile data
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private backPath: string;
  private rigTypeFormValue: string = '';
  private windowWidth: any;
  private dialogWidth: number;
  private dialogWidthDisplay: string;
  image;

  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setDialogWindowDimensions();
  }

  constructor(private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private dialog: MatDialog,
              private router: Router,
              private location: Location,
              private uploadImageSvc: UploadImageService,
              private orientImageSvc: OrientImageService,
              private activateBackArrowSvc: ActivateBackArrowService,
              fb: FormBuilder) {
              this.form = fb.group({
                rigType: new FormControl('', Validators.required),
                rigManufacturer: new FormControl(''),
                rigBrand: new FormControl(''),
                rigModel: new FormControl(''),
                rigYear: new FormControl('',
                                [Validators.minLength(4),
                                Validators.maxLength(4)])
              },
                { updateOn: 'blur' }
              );
}

  ngOnInit() {
    // If user got to this page without logging in (i.e. a bookmark or attack), send
    // them to the signin page and set the back path to the page they wanted to go
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.setDialogWindowDimensions();

    this.form.disable();

    this.showSpinner = true;

    this.listenForUserProfile();
  }

  ngAfterViewInit() {
    this.context = (this.canvas.nativeElement as HTMLCanvasElement).getContext('2d');
  }

  ngOnDestroy() {}

  private draw() {
    this.context.font = "30px Arial";
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';

    const x = (this.canvas.nativeElement as HTMLCanvasElement).width / 2;
    const y = (this.canvas.nativeElement as HTMLCanvasElement).height / 2;
    this.context.fillText("@realappie", x, y);
  }

  // Automatically pop-up the 'other' dialog with the correct
  // control and name when use clicks on select if other
  onActivateSelectItem(control: string, controlDesc: string) {
    if (this[control]) {
      this.openOtherDialog(control, controlDesc, 'other');
    }
  }

  onRigImageSelected(event: any) {
    // let imageFromSource: File;
        // Extract image file from event
        // imageFromSource = <File>event.target.files[0];

        // Compress file before uploading to server
    var myReader:FileReader = new FileReader();
    this.showSpinner = true;
    myReader.readAsDataURL(event.target.files[0]);
    myReader.onloadend = (e) => {
      console.log('BASE64=', myReader.result);
      // this code took the uploaded file and displayed it on the canvas so drawImage worked!  Why won't it work in the orientation service?
      var img = new Image();   // Create new img element
      let self = this;
      img.onload = function(){
        // (self.canvas.nativeElement as HTMLCanvasElement).width = img.width;
        // (self.canvas.nativeElement as HTMLCanvasElement).height = img.height;
        // self.context.drawImage(img,0,0);
        exifr.orientation(event.target.files[0]).catch(err => undefined).then(orientation => {
          console.log('orientation=', orientation);
          let cw: number = img.width;
          let ch: number = img.height;
          let cx: number = 0;
          let cy: number = 0;
          let deg: number = 0;
          switch (orientation) {
              case 3:
              case 4:
                  cx = -img.width;
                  cy = -img.height;
                  deg = 180;
                  break;
              case 5:
              case 6:
                  cw = img.height;
                  ch = img.width;
                  cy = -img.height;
                  deg = 90;
                  break;
              case 7:
              case 8:
                  cw = img.height;
                  ch = img.width;
                  cx = -img.width;
                  deg = 270;
                  break;
              default:
                  break;
          }

          (self.canvas.nativeElement as HTMLCanvasElement).width = cw;
          (self.canvas.nativeElement as HTMLCanvasElement).height = ch;
          if ([2, 4, 5, 7].indexOf(orientation) > -1) {
              //flip image
               self.context.translate(cw, 0);
               self.context.scale(-1, 1);
          }
          self.context.rotate(deg * Math.PI / 180);
          self.context.drawImage(img, cx, cy);
          img = document.createElement("img");
          img.width = cw;
          img.height = ch;
          self.showSpinner = false;
        })
      }
      const csv: string | ArrayBuffer = myReader.result;
      if (typeof csv === 'string') {img.src = csv}
      else {img.src = csv.toString()};
      // this.getOrientedImage(img)
      // .then((image) => {
/*         this.uploadImageSvc.compressImageFile(img, (compressedFile: File) => {
          this.uploadImageSvc.uploadImage(compressedFile, (uploadedFileUrl: string) => {
            console.log('RigComponent:onRigImageSelected: URL=', uploadedFileUrl);
            // this.openImageCropperDialog(uploadedFileUrl, 'rig');
            this.showSpinner = false;
          });
        }); */
      // })
    }
  }

  public getOrientedImage(image:HTMLImageElement):Promise<HTMLImageElement> {
    let self=this;

    return new Promise<HTMLImageElement>(resolve => {
        let img:any;
        exifr.orientation(image).catch(err => undefined).then(orientation => {
          console.log('orientation=', orientation);
            if (orientation != 1) {
/*                 let canvas:HTMLCanvasElement = document.createElement("canvas"),
                    ctx:CanvasRenderingContext2D = <CanvasRenderingContext2D> canvas.getContext("2d"),
                    cw:number = image.width,
                    ch:number = image.height,
                    cx:number = 0,
                    cy:number = 0,
                    deg:number = 0; */
                let cw: number = image.width;
                let ch: number = image.height;
                let cx: number = 0;
                let cy: number = 0;
                let deg: number = 0;
                switch (orientation) {
                    case 3:
                    case 4:
                        cx = -image.width;
                        cy = -image.height;
                        deg = 180;
                        break;
                    case 5:
                    case 6:
                        cw = image.height;
                        ch = image.width;
                        cy = -image.height;
                        deg = 90;
                        break;
                    case 7:
                    case 8:
                        cw = image.height;
                        ch = image.width;
                        cx = -image.width;
                        deg = 270;
                        break;
                    default:
                        break;
                }

                (self.canvas.nativeElement as HTMLCanvasElement).width = cw;
                (self.canvas.nativeElement as HTMLCanvasElement).height = ch;
                if ([2, 4, 5, 7].indexOf(orientation) > -1) {
                    //flip image
                     self.context.translate(cw, 0);
                     self.context.scale(-1, 1);
                }
                self.context.rotate(deg * Math.PI / 180);
                self.context.drawImage(image, cx, cy);
                img = document.createElement("img");
                img.width = cw;
                img.height = ch;
                img.addEventListener('load', function () {
                    resolve(img);
                });
                img.src = (self.canvas.nativeElement as HTMLCanvasElement).toDataURL("image/png");
            } else {
                resolve(image);
            }
        });
    });
  }
/*     setImgOrientation(file, inputBase64String) {
      console.log('In setImageOrientation');
      return new Promise((resolve, reject) => {
        const that = this;
        EXIF.getData(file, function () {
          if (this && this.exifdata && this.exifdata.Orientation) {
            that.resetOrientation(inputBase64String, this.exifdata.Orientation, function
          (resetBase64Image) {
              inputBase64String = resetBase64Image;
              console.log('part 1 resolving image');
              resolve(inputBase64String);
            });
          } else {
            console.log('part 2 resolving image');
            resolve(inputBase64String);
          }
          });
        });
      } */

  // Form Select option processing
  onSelectedSelectItem(control: string, controlDesc: string, event: string) {

    // If user chose other, set description for dialog
    if (event === 'other') {
      this.openOtherDialog(control, controlDesc, event);
    } else {

      // If user did not choose other, call the correct update processor for the field selected
      this[control] = '';
      this.updateSelectItem(control, event);
    }
  }


  /**** Field auto-update processing ****/
  onUpdateDataPoint(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (this.form.controls[control].value === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.profile[control] = this.form.controls[control].value;
    }
    this.updateRig(control);
  }


  // @ indicates user selected 'other' and this is what they entered.  Stored with '@' in database.
  private handleOtherData(control: string): boolean {
    let result = false;
    if (this.profile[control]) {
      if (this.profile[control].substring(0, 1) === '@') {
        this[control] = this.profile[control].substring(1, this.profile[control].length);
        result = true;
      }
    }
    return result;
  }


  // Listen for user profile and when received, take action
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.profile = profileResult;

      // If user selected other on a form field, need to get the data they entered
      if (this.handleOtherData('rigType')) {
        this.rigTypeFormValue = 'other';
      } else {
        this.rigTypeFormValue = this.profile.rigType;
      }

      if (profileResult) {
        this.form.patchValue ({
          rigType: this.rigTypeFormValue,
          rigYear: this.profile.rigYear,
          rigManufacturer: this.profile.rigManufacturer,
          rigBrand: this.profile.rigBrand,
          rigModel: this.profile.rigModel
        });
      }

      this.rigImageUrl = this.profile.rigImageUrls[0];

      this.showSpinner = false;
      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      console.error('RigComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }


  // Present image for user to crop
  private openImageCropperDialog(imageSource: string, imageType: string): void {
    let croppedImageBase64: string;
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: this.dialogWidthDisplay,
      height: '90%',
      disableClose: true,
      data: { image: imageSource, imageType: imageType }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result) {
        if (result !== 'canceled') {
          console.log('RVRigComponent:openImageCropperDialog: returned from dialog');
          croppedImageBase64 = result;
          this.uploadImageSvc.uploadImageBase64(croppedImageBase64, (uploadedFileUrl: string) => {
            console.log('RvRigComponent:openIageCropperDialog: image url=', uploadedFileUrl);
            this.profile.rigImageUrls.push(uploadedFileUrl);
            this.showSpinner = false;
            // this.profileSvc.distributeProfileUpdate(this.profile); //TODO: it seems that this is causing jump to profile page?
          })
        } else {
          this.showSpinner = false;
        }
      } else {
        this.showSpinner = false;
      }
    });
  }


  // Select form 'Other' Dialog
  private openOtherDialog(control: string, name: string, event: string): void {
    let other = '';
    let selection = '';
    other = this[control];

    const dialogRef = this.dialog.open(OtherDialogComponent, {
      width: '250px',
      disableClose: true,
      data: {name: name, other: other }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result) {
        if (result !== 'canceled') {
          if (this[control] !== result ) {
            this[control] = result;
            this.profile[control] = '@' + result;
            this.updateRig(control);
          }
        }
      } else {
        if (this[control]) {
          this[control] = '';
          this.profile[control] = null;
          this.updateSelectItem(control, event);
          this.form.patchValue({[control]: null});
        } else {
          if (this.profile[control]) {
            selection = this.profile[control];
          }
          this.form.patchValue({[control]: selection});
        }
      }
    });
  }


  // Get window size to determine how to present dialog windows
  private setDialogWindowDimensions() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 600) {
      if (this.windowWidth > 1140) {
        this.dialogWidth = 1140 * .95;
      } else {
        this.dialogWidth = this.windowWidth * .95;
      }
      this.dialogWidthDisplay = this.dialogWidth.toString() + 'px';
    }
  }


  // Update rig image url array in user's profile with new uploaded rig image.
  private updateProfileRigImageUrls(rigImageUrl: string) {
    console.log('RvRigComponent:updateProfileRigImageUrls: calling server ', rigImageUrl, ' to profile for ', this.profile._id);
    this.profileSvc.addRigImageUrlToProfile(this.profile._id, rigImageUrl)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.profileSvc.getProfile();
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.error('RvRigComponent:updateProfileRigImageUrls: throw error ', error);
      throw new Error(error);
    });
  }


  // Update form field data on server
  private updateRig(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
    }, error => {
      this[SaveIcon] = false;
      console.log('PersonalComponent:updateRig: throw error ', error);
      throw new Error(error);
    });
  }


  // Pre-process form data and call update on server
  private updateSelectItem(control: string, event) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (event === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.profile[control] = event;
    }
    this.updateRig(control);
  }




  resetOrientation(srcBase64, srcOrientation, callback) {
     const img = new Image();

     img.onload = function () {
     const width = img.width,
       height = img.height,
       canvas = document.createElement('canvas'),
       ctx = canvas.getContext('2d');

     // set proper canvas dimensions before transform & export
     if (4 < srcOrientation && srcOrientation < 9) {
       canvas.width = height;
       canvas.height = width;
     } else {
       canvas.width = width;
       canvas.height = height;
     }

     // transform context before drawing image
     switch (srcOrientation) {
       case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
       case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
       case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
       case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
       case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
       case 7: ctx.transform(0, -1, -1, 0, height, width); break;
       case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
       default: break;
     }

     // draw image
     ctx.drawImage(img, 0, 0);

     // export base64
     callback(canvas.toDataURL());
   };

     img.src = srcBase64;
  }
}
