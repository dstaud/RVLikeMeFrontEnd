import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { IDeactivate } from './../guards/can-deactivate';

@Injectable()
export class DeactivateGuardService implements CanDeactivate<IDeactivate>
{
    // component: Object;
    route: ActivatedRouteSnapshot;

   constructor() {
   }

   canDeactivate(component: IDeactivate,
                 route: ActivatedRouteSnapshot,
                 state: RouterStateSnapshot,
                 nextState: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      return component.canExit ? component.canExit() : true;
  }
}
