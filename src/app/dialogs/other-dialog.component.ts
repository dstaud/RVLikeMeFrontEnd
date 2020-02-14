import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedComponent } from './../shared/shared.component';

export interface DialogData {
  other: string;
}

@Component({
  selector: 'app-other-dialog',
  templateUrl: './other-dialog.component.html',
  styleUrls: ['./other-dialog.component.scss']
})
export class OtherDialogComponent implements OnInit {

  constructor(private shared: SharedComponent,
              public dialogRef: MatDialogRef<OtherDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
