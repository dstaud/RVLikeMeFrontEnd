import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SigninTriggeredService {
  private launchSigninDialog = new Subject<boolean>();
  launchSigninDialog$ = this.launchSigninDialog.asObservable();

  constructor() { }

  public toggleLaunchSigninDialog(show: boolean): void {
    this.launchSigninDialog.next(show);
  }
}
