import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {
  private pageTitle = new Subject<string>();
  pageTitle$ = this.pageTitle.asObservable();

  setPageTitle(title: string): void {
    this.pageTitle.next(title);
  }

  constructor() { }
}
