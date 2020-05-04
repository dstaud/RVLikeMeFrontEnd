import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { UUID } from 'angular2-uuid';

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
                '"toFirstName":"' + firstName + '"}';

    return this.http.post(`/api/send-email`, param, {});
  }

  sendRegisterEmail(sendTo: string, toFirstName: string, activateID: UUID): Observable<any> {
    let firstName: string = '';

    if (toFirstName) {
      firstName = toFirstName
    }

    let param = '{"sendTo":"' + sendTo + '",' +
                '"activateID":"' + activateID + '",' +
                '"toFirstName":"' + firstName + '"}';

    console.log('EmailSMTPService:sendRegisterEmail: UUID=', activateID, ' param=', param);
    return this.http.post(`/api/send-register-email`, param, {});
  }

  sendWelcomeEmail(sendTo: string, toFirstName: string, activateID: UUID): Observable<any> {
    let firstName: string = '';

    if (toFirstName) {
      firstName = toFirstName
    }

    let param = '{"sendTo":"' + sendTo + '",' +
                '"activateID":"' + activateID + '",' +
                '"toFirstName":"' + firstName + '"}';

                console.log('EmailSMTPService:sendRegisterEmail: UUID=', activateID, ' param=', param);
    return this.http.post(`/api/send-welcome-email`, param, {});
  }
}
