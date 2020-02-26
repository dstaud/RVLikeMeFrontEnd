import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Publish current state of whether to show signin on toolbar
@Injectable({
  providedIn: 'root'
})
export class HeaderVisibleService {
  private headerVisible = new Subject<boolean>();
  headerVisible$ = this.headerVisible.asObservable();

  constructor() { }

  public toggleSigninButtonVisible(show: boolean): void {
    this.headerVisible.next(show);
  }
}

