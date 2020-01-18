import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterBtnVisibleService {
  private registerButtonVisible = new Subject<boolean>();
  registerButtonVisible$ = this.registerButtonVisible.asObservable();

  constructor() { }

  public toggleRegisterButtonVisible(show: boolean): void {
    this.registerButtonVisible.next(show);
  }
}
