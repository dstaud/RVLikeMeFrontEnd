import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FocusMonitor } from '@angular/cdk/a11y';

import { SharedComponent } from '@shared/shared.component';
import { ImageCropperComponent } from './../../features/profile/image-cropper/image-cropper.component';

/* Dialog component specifically for hosting the image cropper component */
export interface DialogData {
  image: string;
  imageType: string;
}

@Component({
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.scss']
})
export class ImageDialogComponent implements OnInit {

  // Inject reference to the image cropper component
  @ViewChild('imageCropper', {static: false })
  private imageCropper: ImageCropperComponent;
  private updatedImage: string;

  constructor(private focusMonitor: FocusMonitor,
              public dialogRef: MatDialogRef<ImageDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }


  // Prevent OK buton from getting focus.   Make user click on OK and don't show browser highligh on button.
  ngAfterViewInit() {
    this.focusMonitor.stopMonitoring(document.getElementById('btnOK'));
  }


  // Call notifyDone() function on the image cropper compoment when user clicks the OK button on this dialog and then close the dialog
  // sending back the updated image obtained from the image cropper compoment
  onOK() {
    this.imageCropper.notifyDone();
    this.dialogRef.close(this.updatedImage);
  }


  // Send back 'canceled' to originating component to indicate user clicked the Cancel button
  onNoClick(): void {
    this.dialogRef.close('canceled');
  }


  // Update data object when image component sends updated image, so can send back up to originating component
  updatedImageResult(event: string): void {
    this.updatedImage = event;
  }
}
