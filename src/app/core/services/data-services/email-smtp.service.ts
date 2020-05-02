import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailSmtpService {

  constructor(private http: HttpClient) { }

  sendEmail(sendTo: string, subject: string, body: string): Observable<any> {
    let param = '{"sendTo":"' + sendTo + '",' +
                '"subject":"' + subject + '",' +
                '"body":"' + body + '"}';

    return this.http.post(`/api/send-email`, param, {});
  }
}
