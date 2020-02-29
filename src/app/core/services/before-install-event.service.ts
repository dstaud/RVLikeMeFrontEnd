import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

// Publish the beforeInstallEvent for app installation
@Injectable({
  providedIn: 'root'
})
export class BeforeInstallEventService {
  installEvent: any = null;

  private _beforeInstallEvent = new BehaviorSubject<any>(null);
  private dataStore: { event: any } = { event: this.installEvent }
  readonly beforeInstallEvent$ = this._beforeInstallEvent.asObservable();

  constructor() { }

  public saveBeforeInstallEvent(event: any): void {
    this.dataStore.event = event;
    this._beforeInstallEvent.next(Object.assign({}, this.dataStore).event);
  }
}
