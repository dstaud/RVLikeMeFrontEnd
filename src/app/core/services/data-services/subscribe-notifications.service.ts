import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscribeNotificationsService {

  constructor(private http: HttpClient) { }

  // Subscribe to push notifications for user
  subscribeToNotifications(profileID: string, subscription: PushSubscription): Observable<any> {
    let update = '{"profileID":"' + profileID + '",' +
                '"subscription":' + JSON.stringify(subscription) + '}';

    return this.http.post('/api/subscribe', JSON.parse(update));
  }


  // Subscribe to push notifications for user
  unsubscribeFromNotifications(profileID: string): Observable<any> {
    let update = '{"profileID":"' + profileID + '"}'

    return this.http.post('/api/unsubscribe', JSON.parse(update));
  }


  // Send notificaiton to a specific person
  sendNotificationTest(subscription: string) {
    return this.http.post('/api/notify', subscription);
  }
}
