import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private language = new BehaviorSubject<string>('en');
  language$ = this.language.asObservable();

  constructor(private translate: TranslateService) { }

  public setLanguage(preferredLanguage: string): void {
    this.translate.setDefaultLang(preferredLanguage);
    this.translate.use(preferredLanguage)
    this.translate.instant(preferredLanguage);
    this.language.next(preferredLanguage);
  }
}
