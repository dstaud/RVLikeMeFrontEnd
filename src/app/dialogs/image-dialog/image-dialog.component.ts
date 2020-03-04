import { ImageCropperComponent } from './../../features/profile/image-cropper/image-cropper.component';
import { Component, OnInit, Inject, Input, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FocusMonitor } from '@angular/cdk/a11y';

import { SharedComponent } from '@shared/shared.component';

export interface DialogData {
  image: string;
  updatedImage: string;
}

@Component({
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.scss']
})
export class ImageDialogComponent implements OnInit {

  @ViewChild('imageCropper', {static: false })
  private imageCropper: ImageCropperComponent;

  constructor(private shared: SharedComponent,
              private focusMonitor: FocusMonitor,
              public dialogRef: MatDialogRef<ImageDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.focusMonitor.stopMonitoring(document.getElementById('btnOK'));
  }

  onOK() {
    console.log('setting up notifyDone');
    this.imageCropper.notifyDone();
    this.dialogRef.close(this.data.updatedImage);
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }

  updatedImage(event: string) {
    this.data.updatedImage = event;
  }
}
