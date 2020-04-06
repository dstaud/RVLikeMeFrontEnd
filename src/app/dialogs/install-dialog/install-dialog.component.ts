import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FocusMonitor } from '@angular/cdk/a11y';

export interface DialogData {
  name: string;
  other: string;
}

@Component({
  selector: 'app-install-dialog',
  templateUrl: './install-dialog.component.html',
  styleUrls: ['./install-dialog.component.scss']
})
export class InstallDialogComponent implements OnInit {

  constructor(private focusMonitor: FocusMonitor,
              public dialogRef: MatDialogRef<InstallDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.focusMonitor.stopMonitoring(document.getElementById('btnYes'));
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }
}
