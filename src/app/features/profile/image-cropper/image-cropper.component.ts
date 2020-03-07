import { Component, OnInit, ViewChild, Input, Output, ElementRef, EventEmitter } from '@angular/core';

import Cropper from 'cropperjs';
import { FakeMissingTranslationHandler } from '@ngx-translate/core';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements OnInit {

  // Inject a reference to the original source image in the HTML (#image) for use as imageElement in the Typescript.
  @ViewChild('image', {static: false })
  public imageElement: ElementRef;

  // Original image passed from the dialog through this component's selector in the dialog compoment template
  @Input('originalImage')
  public imageSource: string;

  // Send updated image back to the dialog through the reference obtained through the selector
  @Output() updatedImage = new EventEmitter()
  public imageDestination: string;

  private cropper: Cropper;

  // TODO: don't show destination image until originl image is ready, but turning this to true in ngAfterViewInit() doesn't work
  private showDestination = false;


  constructor() {
    this.imageDestination = '';
   }

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log('STARTING', this.showDestination)
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
        this.showDestination = true;
        console.log('READY!', this.showDestination);
      }
    });
  }

  rotateImage(degrees: number) {
    this.cropper.rotate(degrees);
  }

  // Called from dialog container when user clicks OK on the dialog, so updated image can be sent back up the chain
  notifyDone() {
    this.updatedImage.emit(this.imageDestination);
  }
}
