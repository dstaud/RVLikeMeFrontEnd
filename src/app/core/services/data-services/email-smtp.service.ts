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

    let params = {
      sendTo: sendTo,
      subject: subject,
      body: body,
      toFirstName: firstName
    }

    return this.http.post(`/api/send-email`, params, {});
  }

  sendRegisterEmail(sendTo: string, toFirstName: string, token: string): Observable<any> {
    let params = {
      sendTo: sendTo,
      token: token
    }

    return this.http.post(`/api/send-register-email`, params, {});
  }

  sendWelcomeEmail(sendTo: string, toFirstName: string, token: string): Observable<any> {
    let params = {
      sendTo: sendTo,
      token: token
    }

    return this.http.post(`/api/send-welcome-email`, params, {});
  }

  sendMessageAlertEmail(sendTo: string): Observable<any> {
    let params = {
      sendTo: sendTo
    }

    return this.http.post(`/api/send-message-alert-email`, params, {});
  }

  sendPasswordResetEmail(sendTo: string, token: string): Observable<any> {
    let params = {
      sendTo: sendTo,
      token: token
    }

    return this.http.post(`/api/send-password-reset-email`, params, {});
  }
}
