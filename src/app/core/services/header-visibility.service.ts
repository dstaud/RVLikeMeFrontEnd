import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Publish current state of whether to show top toolbar.  Will vary depending on screen size too.
@Injectable({
  providedIn: 'root'
})
export class HeaderVisibleService {
  private headerVisible = new BehaviorSubject<boolean>(false);
  headerVisible$ = this.headerVisible.asObservable();

  private headerDesktopVisible = new BehaviorSubject<boolean>(false);
  headerDesktopVisible$ = this.headerDesktopVisible.asObservable();

  constructor() { }

  public toggleHeaderVisible(show: boolean): void {
    this.headerVisible.next(show);
  }

  public toggleHeaderDesktopVisible(show: boolean): void {
    this.headerDesktopVisible.next(show);
  }
}

