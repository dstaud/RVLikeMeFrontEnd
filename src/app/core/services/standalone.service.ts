import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StandaloneService {
  private standalone = new BehaviorSubject<string>('browser');
  standalone$ = this.standalone.asObservable();

  constructor() { }

  setStandalone(standalone: string): void {
    this.standalone.next(standalone);
  }
}
