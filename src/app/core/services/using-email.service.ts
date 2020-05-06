import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsingEmailService {
  private _useEmail = new BehaviorSubject<boolean>(true);
  useEmail = this._useEmail.asObservable();

  constructor() { }

  public setUseEmail(email: boolean): void {
    this._useEmail.next(email);
  }
}
