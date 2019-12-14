import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-signin-dialog',
  templateUrl: './signin-dialog.component.html',
  styleUrls: ['./signin-dialog.component.scss']
})
export class SigninDialogComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;

  constructor(private dialogRef: MatDialogRef<SigninDialogComponent>,
              fb: FormBuilder) {
              this.form = fb.group({
                userID: new FormControl('', Validators.required),
                password: new FormControl('', Validators.required)
              });
  }

  ngOnInit() {
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

  close() {
    console.log('close dialog');
    this.dialogRef.close();
  }

  submit() {
    console.log('submit credentials');
    this.dialogRef.close(this.form.value);
  }
}
