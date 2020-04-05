import { Component, OnInit, HostListener ,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

export interface DialogData {
  post: string;
}

@Component({
  selector: 'app-update-post-dialog',
  templateUrl: './update-post-dialog.component.html',
  styleUrls: ['./update-post-dialog.component.scss']
})
export class UpdatePostDialogComponent implements OnInit {
  form: FormGroup;
  fieldHeight: string;

  private containerHeight: number
  private windowWidth: number;
  private windowHeight: number;
  private logoDesktopLeftPosition: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    this.containerHeight = Math.round((this.windowHeight *.8) * .8);
    this.fieldHeight = this.containerHeight.toString() + 'px';
  }

  constructor(public dialogRef: MatDialogRef<UpdatePostDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    fb: FormBuilder) {
      this.form = fb.group({
        post: new FormControl('')
      });
}

  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    let winH = this.windowHeight * .8;
    let fieldH = winH * .8;
    this.containerHeight = Math.round((this.windowHeight *.8) * .8) - 80;
    this.fieldHeight = this.containerHeight.toString() + 'px';
  }

  onOK() {
    this.dialogRef.close(this.data.post);
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }
}
