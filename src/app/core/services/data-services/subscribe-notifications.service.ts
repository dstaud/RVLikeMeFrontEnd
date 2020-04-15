import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscribeNotificationsService {

  constructor(private http: HttpClient) { }

  subscribeToNotifications(subscription: PushSubscription): Observable<any> {
    console.log('subscribeToNotifications: calling server with subscription ', subscription);
    return this.http.post('/api/subscribe', subscription);
  }
}
