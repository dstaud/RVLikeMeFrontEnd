import { Injectable} from '@angular/core';
import * as Sentry from '@sentry/browser';
import { ItokenPayload } from './../../interfaces/tokenPayload';

// After user authorized, save the user context to be used by Sentry if error in production
@Injectable({providedIn: 'root'})
export class SentryMonitorService {

  monitorUser(user: ItokenPayload): void {
    Sentry.configureScope(scope => {
      scope.setUser({
        email: user.email
      });
    });
  }
}
