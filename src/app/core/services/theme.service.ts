import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultFont = new Subject<string>();
  defaultGlobalFont = this.defaultFont.asObservable();

  private defaultTheme = new Subject<string>();
  defaultGlobalTheme = this.defaultTheme.asObservable();

  setGlobalTheme(colorScheme: string): void {
    this.defaultTheme.next(colorScheme);
  }

  setGlobalFont(font: string): void {
    this.defaultFont.next(font);
  }

  constructor() { }
}
