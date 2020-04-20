import { Component, OnInit, ViewChild, Input, Output, ElementRef, EventEmitter } from '@angular/core';

import Cropper from 'cropperjs';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements OnInit {

  // Inject a reference to the original source image in the HTML (#image) for use as imageElement in the Typescript.
  @ViewChild('image', {static: false }) imageElement: ElementRef;

  // Original image passed from the dialog through this component's selector in the dialog compoment template
  @Input('originalImage') imageSource: string;

  // Image may be a profile image or other image like a pic of their rig or any image they want to upload for apost.
  @Input('imageType') imageType: string;

  // Send updated image back to the dialog through the reference obtained through the selector
  @Output() updatedImage = new EventEmitter()

  imageDestination: string = '';
  showImageDestination: boolean = false;

  private cropper: Cropper;

  // TODO: don't show destination image until original image is ready, but turning this to true in ngAfterViewInit() doesn't work
  private showDestination = false;


  constructor() {
   }

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log('ImageCropperComponent:ngAfterViewInit: imagetype=', this.imageType);
    if (this.imageType === 'profile') {
      this.showImageDestination = true;
      this.createImageCropperObjectForProfile();
    } else {
      this.showImageDestination = false;
      this.createImageCropperObject();
    }
  }

  onRotateImage(degrees: number) {
    this.cropper.rotate(degrees);
  }

  // Called from dialog container when user clicks OK on the dialog, so updated image can be sent back up the chain
  notifyDone() {
    this.updatedImage.emit(this.imageDestination);
  }


  // Use third-party image cropper
  private createImageCropperObjectForProfile() {
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
        console.log('in profile version');
      }
    });
  }

  // Use third-party image cropper
  private createImageCropperObject() {
    this.cropper = new Cropper(this.imageElement.nativeElement, {
      zoomable: false,
      scalable: false,
      aspectRatio: 1,
      viewMode: 1,
      rotatable: true,
      autoCrop: true,
       crop: () => {
        const canvas = this.cropper.getCroppedCanvas();
        this.imageDestination = canvas.toDataURL("image/png");
        console.log('in crop, destination=', this.imageDestination);
      },
      ready: function(event) {
        console.log('in ready');
      }
    });
  }
}
