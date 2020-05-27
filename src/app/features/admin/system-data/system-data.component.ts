import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

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
                  useEmail: new FormControl('', Validators.required),
                  textOnlyEmails: new FormControl('', Validators.required),
                });
     }

  ngOnInit(): void {
    this.showSpinner = true;

    this.adminSvc.getSystemData()
    .pipe(untilComponentDestroyed(this))
    .subscribe(systemResult => {

      if (systemResult.length > 0) {
        this.systemDataFound = true;
        this.systemID = systemResult[0]._id;
        this.form.patchValue({
          useEmail: systemResult[0].useEmail,
          textOnlyEmails: systemResult[0].textOnlyEmails
        });
      } else {
        this.form.patchValue({
          useEmail: false,
          textOnlyEmails: false
        });
      }
      this.showSpinner = false;
    }, error => {
    })
  }

  ngOnDestroy() {}


  onSubmit() {
    this.showSpinner = true;

    let useEmail = this.form.controls.useEmail.value;
    let textOnlyEmails = this.form.controls.textOnlyEmails.value;

    if (!this.systemDataFound) {
      this.adminSvc.setSystemData(useEmail, textOnlyEmails)
      .pipe(untilComponentDestroyed(this))
      .subscribe(systemResult => {
        this.showSpinner = false;
      }, error => {
        this.showSpinner = false;
      });
    } else {
      this.adminSvc.updateSystemData(useEmail, this.systemID, textOnlyEmails)
      .pipe(untilComponentDestroyed(this))
      .subscribe(systemResult => {
        this.showSpinner = false;
      }, error => {
        this.showSpinner = false;
      });
    }
  }
}
