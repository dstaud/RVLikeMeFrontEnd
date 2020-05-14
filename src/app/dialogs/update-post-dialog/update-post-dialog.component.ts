import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  post: string;
}

@Component({
  selector: 'app-update-post-dialog',
  templateUrl: './update-post-dialog.component.html',
  styleUrls: ['./update-post-dialog.component.scss']
})
export class UpdatePostDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<UpdatePostDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {

}

  ngOnInit(): void {
  }

  formComplete(event: string) {
    console.log('UpdatePostDialog:formComplete: event=', event);
    this.dialogRef.close(event);
  }
}
