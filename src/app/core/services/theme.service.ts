import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private lightTheme = new Subject<boolean>();
  isLightTheme = this.lightTheme.asObservable();

  private globalFontsTheme = new Subject<boolean>();
  isGlobalFontsTheme = this.globalFontsTheme.asObservable();

  setLightTheme(isLightTheme: boolean): void {
    this.lightTheme.next(isLightTheme);
  }

  setAndroidFontsTheme(isGlobalFontsTheme: boolean): void {
    this.globalFontsTheme.next(isGlobalFontsTheme);
  }

  constructor() { }
}
