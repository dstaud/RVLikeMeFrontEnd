import { Component, OnInit, Inject } from '@angular/core';
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
  constructor(public dialogRef: MatDialogRef<MyStoryDialogComponent>,
                      @Inject(MAT_DIALOG_DATA) public data: DialogData,
                      fb: FormBuilder) {
                        this.form = fb.group({
                          myStory: new FormControl('')
                        });
                       }

  ngOnInit() {
  }

  onOK() {
    this.dialogRef.close(this.data.myStory);
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }
}
