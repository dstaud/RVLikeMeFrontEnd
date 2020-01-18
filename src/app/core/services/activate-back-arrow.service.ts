import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivateBackArrowService {
  private route = new BehaviorSubject<string>('');

  public readonly route$: Observable<string> = this.route.asObservable();

  constructor() { }

  public setBackRoute(route: string): void {
    this.route.next(route);
  }
}
