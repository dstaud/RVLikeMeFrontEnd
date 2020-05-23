import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  containerDialog: boolean;
}

@Component({
  selector: 'app-privacy-policy-dialog',
  templateUrl: './privacy-policy-dialog.component.html',
  styleUrls: ['./privacy-policy-dialog.component.scss']
})
export class PrivacyPolicyDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PrivacyPolicyDialogComponent>,
                    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
  }

  formComplete(event: string) {
    this.dialogRef.close(event);
  }

}
