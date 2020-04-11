import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

import { SharedComponent } from '@shared/shared.component';

@Injectable({
  providedIn: 'root'
})
export class SvcWorkerUpdateService {

  constructor(private swUpdate: SwUpdate,
              private shared: SharedComponent) {

    this.swUpdate.available.subscribe(evt => {
      let message;

      message = 'service worker update available';

      if (!this.swUpdate.isEnabled) {
        console.log('SERVICE WORKER NOT ENABLED!');
      }

      this.shared.openSnackBar(message, 'message', 5000);

      // checkForUpdate(): Allows to check for updates periodically.
      // activateUpdate(): Allows us to force a service worker update.

      // const snack = this.snackbar.open('Update Available', 'Reload');

/*       snack
        .onAction()
        .subscribe(() => {
          window.location.reload();
        });

      snack.setTimeout(() => {
        snack.dismiss();
      }, 6000); */
    });

   }



}
