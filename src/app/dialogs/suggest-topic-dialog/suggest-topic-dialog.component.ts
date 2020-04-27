import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-suggest-topic-dialog',
  templateUrl: './suggest-topic-dialog.component.html',
  styleUrls: ['./suggest-topic-dialog.component.scss']
})
export class SuggestTopicDialogComponent implements OnInit {
  form: FormGroup;

  constructor(public dialogRef: MatDialogRef<SuggestTopicDialogComponent>,
    fb: FormBuilder) {
      this.form = fb.group({
        topic: new FormControl('', Validators.required)
      });
}

  ngOnInit(): void {
  }

  onOK() {
    this.dialogRef.close(this.form.controls.topic.value);
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }

}
