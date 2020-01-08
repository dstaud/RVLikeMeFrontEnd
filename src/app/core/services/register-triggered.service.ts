import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Publish current state of whether to show register dialog, which can be triggered from multiple locations
@Injectable({
  providedIn: 'root'
})
export class RegisterTriggeredService {
  private registerTriggered = new Subject<boolean>();
  registerTriggered$ = this.registerTriggered.asObservable();

  constructor() { }

  public showRegisterDialog(show: boolean): void {
    this.registerTriggered.next(show);
  }
}
