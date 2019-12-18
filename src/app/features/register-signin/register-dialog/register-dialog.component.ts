import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss']
})
export class RegisterDialogComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;

  constructor(private dialogRef: MatDialogRef<RegisterDialogComponent>,
              fb: FormBuilder) {
              this.form = fb.group({
                firstName: new FormControl('', Validators.required),
                email: new FormControl('', Validators.required),
                password: new FormControl('', Validators.required)
              });
}

  ngOnInit() {
  }

  submit() {
    alert('calling server');
  }

  close() {
    console.log('close dialog');
    this.dialogRef.close();
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
