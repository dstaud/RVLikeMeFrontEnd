import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { EmailSmtpService } from '@services/data-services/email-smtp.service';

@Component({
  selector: 'app-rvlm-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {
  form: FormGroup;


  constructor(private emailSmtpSvc: EmailSmtpService,
              fb: FormBuilder) {
                this.form = fb.group({
                  sendTo: new FormControl('', [Validators.required, Validators.email]),
                  subject: new FormControl('', Validators.required),
                  body: new FormControl('', Validators.required)
                });
     }

  ngOnInit(): void {
  }

  onSendEmail() {
    let sendTo = this.form.controls.sendTo.value;
    let subject = this.form.controls.subject.value;
    let body = this.form.controls.body.value;

    this.emailSmtpSvc.sendEmail(sendTo, subject, body)
    .subscribe(emailResult => {
      console.log('email sent!  result=', emailResult);
    }, error => {
      console.log('EmailComponent:onSendEmail: error sending email: ', error);
    })
  }
}
