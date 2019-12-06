import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultFont = new Subject<string>();
  defaultGlobalFontTheme = this.defaultFont.asObservable();

  private defaultTheme = new Subject<string>();
  defaultGlobalColorTheme = this.defaultTheme.asObservable();

  setGlobalColorTheme(colorScheme: string): void {
    this.defaultTheme.next(colorScheme);
  }

  setGlobalFontTheme(font: string): void {
    this.defaultFont.next(font);
  }

  constructor() { }
}
