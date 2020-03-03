import { Component, OnInit, Inject, Input, AfterViewInit } from '@angular/core';
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
  imageSource = './../../../assets/images/landing-image1.jpeg';

  constructor(private shared: SharedComponent,
              private focusMonitor: FocusMonitor,
              public dialogRef: MatDialogRef<ImageDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.focusMonitor.stopMonitoring(document.getElementById('btnYes'));
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }

  updatedImage(event: string) {
    this.data.updatedImage = event;
    console.log(this.data.updatedImage);
  }
}
