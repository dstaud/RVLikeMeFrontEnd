import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private language = new Subject<string>();
  language$ = this.language.asObservable();

  constructor(private translate: TranslateService) { }

  public setLanguage(preferredLanguage: string): void {
    console.log('LANGUAGE - set default to ', preferredLanguage);
    this.translate.setDefaultLang(preferredLanguage);
    this.language.next(preferredLanguage);
  }
}
