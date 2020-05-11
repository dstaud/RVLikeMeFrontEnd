import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

// If changing the default max desktop width, also need to change in styles/_variables
@Injectable({
  providedIn: 'root'
})
export class DesktopMaxWidthService {
  private _maxWidth = new BehaviorSubject<number>(900);
  desktopMaxWidth = this._maxWidth.asObservable();

  constructor() { }
}
