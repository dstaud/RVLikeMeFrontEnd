import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailSmtpService {

  constructor(private http: HttpClient) { }

  sendEmail(sendTo: string, subject: string, body: string, toFirstName?: string): Observable<any> {
    let firstName: string = '';

    if (toFirstName) {
      firstName = toFirstName
    }
    let param = '{"sendTo":"' + sendTo + '",' +
                '"subject":"' + subject + '",' +
                '"body":"' + body + '",' +
                '"toFirstName":"' + firstName + '"}';

    return this.http.post(`/api/send-email`, param, {});
  }

  sendRegisterEmail(sendTo: string, toFirstName: string, token: string): Observable<any> {
    let param = '{"sendTo":"' + sendTo + '",' +
                '"token":"' + token + '"}';

    return this.http.post(`/api/send-register-email`, param, {});
  }

  sendWelcomeEmail(sendTo: string, toFirstName: string, token: string): Observable<any> {
    let firstName: string = '';

    let param = '{"sendTo":"' + sendTo + '",' +
                '"token":"' + token + '"}';

    return this.http.post(`/api/send-welcome-email`, param, {});
  }

  sendMessageAlertEmail(sendTo: string): Observable<any> {
    let param = '{"sendTo":"' + sendTo + '"}';

    return this.http.post(`/api/send-message-alert-email`, param, {});
  }

  sendPasswordResetEmail(sendTo: string, token: string): Observable<any> {
    let param = '{"sendTo":"' + sendTo + '","token":"' + token + '"}';

    return this.http.post(`/api/send-password-reset-email`, param, {});
  }
}
