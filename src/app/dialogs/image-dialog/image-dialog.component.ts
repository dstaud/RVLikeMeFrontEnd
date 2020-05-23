import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.scss']
})
export class ImageDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ImageDialogComponent>) { }

  ngOnInit() {
  }

  formComplete(event: string) {
    this.dialogRef.close(event);
  }
}
