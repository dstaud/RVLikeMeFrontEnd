import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  imageUrl: string;
  alter: boolean;
}

@Component({
  selector: 'app-rvlm-image-view-dialog',
  templateUrl: './image-view-dialog.component.html',
  styleUrls: ['./image-view-dialog.component.scss']
})
export class ImageViewDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ImageViewDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {
  }
}
