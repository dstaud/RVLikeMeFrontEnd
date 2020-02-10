import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Publish color and font themes
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultFont = new Subject<string>();
  defaultGlobalFontTheme = this.defaultFont.asObservable();

  constructor() { }

  private defaultTheme = new Subject<string>();
  defaultGlobalColorTheme = this.defaultTheme.asObservable();

  public setGlobalColorTheme(colorScheme: string): void {
    this.defaultTheme.next(colorScheme);
  }

  public setGlobalFontTheme(font: string): void {
    this.defaultFont.next(font);
  }
}
