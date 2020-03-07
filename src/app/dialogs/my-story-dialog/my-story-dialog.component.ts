import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

export interface DialogData {
  myStory: string;
}

@Component({
  selector: 'app-my-story-dialog',
  templateUrl: './my-story-dialog.component.html',
  styleUrls: ['./my-story-dialog.component.scss']
})
export class MyStoryDialogComponent implements OnInit {
  form: FormGroup;
  fieldHeight: string;

  private landingImageNbr: number;
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
    console.log('height=', this.fieldHeight);
  }

  constructor(public dialogRef: MatDialogRef<MyStoryDialogComponent>,
                      @Inject(MAT_DIALOG_DATA) public data: DialogData,
                      fb: FormBuilder) {
                        this.form = fb.group({
                          myStory: new FormControl('')
                        });
                       }

  ngOnInit() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    let winH = this.windowHeight * .8;
    console.log('80% of height=', winH);
    let fieldH = winH * .8;
    console.log('field=', fieldH);
    this.containerHeight = Math.round((this.windowHeight *.8) * .8) - 80;
    this.fieldHeight = this.containerHeight.toString() + 'px';
    console.log('height=', this.fieldHeight, this.containerHeight);
  }

  onOK() {
    this.dialogRef.close(this.data.myStory);
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }
}
