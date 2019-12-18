import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterTriggeredService {
  private registerTriggered = new Subject<boolean>();
  registerTriggered$ = this.registerTriggered.asObservable();

  constructor() { }

  public showRegisterDialog(show: boolean): void {
    console.log('in register visibility');
    this.registerTriggered.next(show);
  }
}
