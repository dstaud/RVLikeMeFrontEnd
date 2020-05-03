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
}
