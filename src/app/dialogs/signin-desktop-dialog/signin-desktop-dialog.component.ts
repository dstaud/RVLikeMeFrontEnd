import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  name: string;
  other: string;
}

@Component({
  selector: 'app-signin-desktop-dialog',
  templateUrl: './signin-desktop-dialog.component.html',
  styleUrls: ['./signin-desktop-dialog.component.scss']
})
export class SigninDesktopDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SigninDesktopDialogComponent>,
                        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
  }

  formComplete(event: string) {
    this.dialogRef.close(event);
  }
}
