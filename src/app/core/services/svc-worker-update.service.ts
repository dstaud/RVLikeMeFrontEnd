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

      this.shared.openSnackBar(message, 'message', 5000);
    });

   }



}
