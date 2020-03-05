import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { RegisterUserComponent } from './../../landing-page/register-user/register-user.component';

export interface DialogData {
  name: string;
  other: string;
}

/* Dialog component for hosting various other components */
export interface DialogData {
  component: string;
}

@Component({
  selector: 'app-desktop-dialog',
  templateUrl: './desktop-dialog.component.html',
  styleUrls: ['./desktop-dialog.component.scss']
})
export class DesktopDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DesktopDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

  formComplete(event: string) {
    this.dialogRef.close(event);
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }
}
