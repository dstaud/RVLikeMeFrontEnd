import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { AdminService } from '@services/data-services/admin.service';

@Component({
  selector: 'app-rvlm-system-data',
  templateUrl: './system-data.component.html',
  styleUrls: ['./system-data.component.scss']
})
export class SystemDataComponent implements OnInit {
  form: FormGroup;
  systemID: string = '';
  systemDataFound: boolean = false;
  showSpinner: boolean = false;

  constructor(private adminSvc: AdminService,
              fb: FormBuilder) {
                this.form = fb.group({
                  useEmail: new FormControl('', Validators.required)
                });
     }

  ngOnInit(): void {
    this.showSpinner = true;

    this.adminSvc.getSystemData()
    .subscribe(systemResult => {
      console.log('SystemDataComponent:ngOnInit: result=', systemResult);

      if (systemResult.length > 0) {
        this.systemDataFound = true;
        this.systemID = systemResult[0]._id;
        this.form.patchValue({
          useEmail: systemResult[0].useEmail
        });
      } else {
        this.form.patchValue({
          useEmail: false
        });
      }
      this.showSpinner = false;
    }, error => {
      console.log('SystemDataComponent:ngOnInit: error=', error);
    })
  }

  onSubmit() {
    this.showSpinner = true;

    let useEmail = this.form.controls.useEmail.value;

    console.log('SystemDataComponent:onSubmit: useEmail=', useEmail);

    if (!this.systemDataFound) {
      this.adminSvc.setSystemData(useEmail)
      .subscribe(systemResult => {
        console.log('SystemDataComponent:onSubmit  result=', systemResult);
        this.showSpinner = false;
      }, error => {
        alert('SystemDataComponent:onSubmit error');
        console.log('SystemDataComponent:onSubmit error: ', error);
        this.showSpinner = false;
      });
    } else {
      this.adminSvc.updateSystemData(useEmail, this.systemID)
      .subscribe(systemResult => {
        console.log('SystemDataComponent:onSubmit  result=', systemResult);
        this.showSpinner = false;
      }, error => {
        console.log('SystemDataComponent:onSubmit error: ', error);
        alert('SystemDataComponent:onSubmit error');
        this.showSpinner = false;
      });
    }
  }
}
