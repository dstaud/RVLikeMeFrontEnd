import { Component, OnInit, ViewChild, Input, Output, ElementRef, EventEmitter } from '@angular/core';

import Cropper from 'cropperjs';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements OnInit {
  showDestination = false;

  @ViewChild("image", {static: false })
  public imageElement: ElementRef;

  @Input("src")
  public imageSource: string;

  @Output() updatedImage= new EventEmitter()
  public imageDestination: string;
  private cropper: Cropper;


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

  notifyDone() {
    console.log('In NotifyDone=', this.imageDestination);
    this.updatedImage.emit(this.imageDestination);
  }
}
