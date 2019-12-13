import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowFooterService {
  private showFooter = new Subject<boolean>();
  showFooter$ = this.showFooter.asObservable();

  activateFooter(show: boolean): void {
    console.log('settings showFooter to ', show);
    this.showFooter.next(show);
  }

  constructor() { }
}
