import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { EmailSmtpService } from '@services/data-services/email-smtp.service';

@Component({
  selector: 'app-rvlm-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {
  form: FormGroup;
  showSpinner: boolean = false;

  constructor(private emailSmtpSvc: EmailSmtpService,
              fb: FormBuilder) {
                this.form = fb.group({
                  sendTo: new FormControl('', [Validators.required, Validators.email]),
                  toFirstName: new FormControl(''),
                  subject: new FormControl(''),
                  body: new FormControl('')
                });
     }

  ngOnInit(): void {
  }

  ngOnDestroy() {}


  onSendEmail() {
    this.showSpinner = true;

    let sendTo = this.form.controls.sendTo.value;
    let toFirstName = this.form.controls.toFirstName.value;
    let subject = this.form.controls.subject.value;
    let body = this.form.controls.body.value;

    this.emailSmtpSvc.sendEmail(sendTo, subject, body, toFirstName)
    .pipe(untilComponentDestroyed(this))
    .subscribe(emailResult => {
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
    })
  }
}
