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
    console.log('ActivateBackArrowService: Current stack=', this.routeStack);
    if (direction === 'forward') {
      this.routeStack.push(route);
      console.log('ActivateBackArrowService: moving forward. new stack =', this.routeStack);
      this.route.next(this.routeStack);
    } else if (direction === 'backward') {
      this.routeStack.pop();
      console.log('ActivateBackArrowService: moving backward. new stack =', this.routeStack);
      this.route.next(this.routeStack);
    } else if (direction !== 'nostack') {
      this.routeStack = [];
      console.log('ActivateBackArrowService: unknown direction. clearing stack =', this.routeStack);
      this.route.next(this.routeStack);
    }
  }
}
