import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

// Publish color and font themes
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultFont = new Subject<string>();
  defaultGlobalFontTheme = this.defaultFont.asObservable();

  constructor() { }

  private defaultTheme = new BehaviorSubject<string>('light-theme');
  defaultGlobalColorTheme = this.defaultTheme.asObservable();

  public setGlobalColorTheme(colorScheme: string): void {
    this.defaultTheme.next(colorScheme);
  }

  public setGlobalFontTheme(font: string): void {
    this.defaultFont.next(font);
  }
}
