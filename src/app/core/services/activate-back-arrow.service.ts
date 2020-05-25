import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivateBackArrowService {
  private routeStack: Array<string> = [];
  private route = new BehaviorSubject<Array<string>>(this.routeStack);

  public readonly route$: Observable<Array<string>> = this.route.asObservable();

  constructor() { }

  public setBackRoute(route: string, direction?: string): void {
    console.log('activateBackArrowSvc: direction=', direction, ' route=', route)
    if (direction === 'forward') {
      this.routeStack.push(route);
      this.route.next(this.routeStack);
    } else if (direction === 'backward') {
      this.routeStack.pop();
      this.route.next(this.routeStack);
    } else if (direction !== 'nostack') {
      this.routeStack = [];
      this.route.next(this.routeStack);
    }
  }
}
