import { Injectable} from '@angular/core';
import * as Sentry from '@sentry/browser';
import { ItokenPayload } from '@services/data-services/authentication.service';
import { environment } from '@environments/environment';

// After user authorized, save the user context to be used by Sentry if error in production
@Injectable({providedIn: 'root'})
export class SentryMonitorService {

  constructor() { }

  logError(error: any) {
    Sentry.captureException(error);
  }

  monitorUser(user: ItokenPayload): void {
    Sentry.configureScope(scope => {
      scope.setUser({
        email: user.email
      });
    });
  }
}
