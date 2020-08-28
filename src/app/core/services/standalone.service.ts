import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StandaloneService {
  private standalone = new BehaviorSubject<boolean>(false);
  standalone$ = this.standalone.asObservable();

  constructor() { }

  setStandalone(standalone: boolean): void {
    this.standalone.next(standalone);
  }
}
