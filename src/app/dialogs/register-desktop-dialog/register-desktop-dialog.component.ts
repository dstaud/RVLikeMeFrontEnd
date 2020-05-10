import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  name: string;
  other: string;
}

@Component({
  selector: 'app-register-desktop-dialog',
  templateUrl: './register-desktop-dialog.component.html',
  styleUrls: ['./register-desktop-dialog.component.scss']
})
export class RegisterDesktopDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RegisterDesktopDialogComponent>,
                    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
  }

  formComplete(event: string) {
    this.dialogRef.close(event);
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }
}
