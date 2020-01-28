import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {

  // Because the ErrorHandler is created before the providers, we’ll have to use the Injector to get them.
  constructor() { }

  handleError(error: Error) {
    console.log('in catchall');
/*     if (error instanceof HttpErrorResponse) {
      console.log('http response error');
      if (!navigator.onLine) {
        console.log('No Internet Connection');
      } else {
        console.log('Http Error ', `${error.status} - ${error.message}`);
      }
      } else {
      } */
    // Log the error anyway
    console.error('It happens: ', error);
  }
}
