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
    console.log('subscribeToNotifications: calling server with subscription ', subscription);
    let update = '{"profileID":"' + profileID + '",' +
                '"subscription":' + JSON.stringify(subscription) + '}';
    console.log('subscribeToNotifications: params=', update);
    console.log('subscribeToNotifications: JSON params=', JSON.parse(update));
    return this.http.post('/api/subscribe', JSON.parse(update));
  }
}
