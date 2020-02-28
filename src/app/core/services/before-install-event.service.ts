import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Publish the beforeInstallEvent for app installation
@Injectable({
  providedIn: 'root'
})
export class BeforeInstallEventService {
  private beforeInstallEvent = new Subject<string>();
  beforeInstallEvent$ = this.beforeInstallEvent.asObservable();

  constructor() { }

  public saveBeforeInstallEvent(event: any): void {
    this.beforeInstallEvent.next(event);
  }
}
