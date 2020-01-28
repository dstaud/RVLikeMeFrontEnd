import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {
  private httpError = {
    status: 0,
    message: ''
  }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error instanceof HttpErrorResponse) {
          // server-side error
          console.log('Server Error', error);
          this.httpError.status = error.status;
          this.httpError.message = error.message;
          return throwError(this.httpError);
        } else {
          // client-side error
          console.log('Client Error ', error);
          return throwError(error);
        }
      })
    );
  }

  constructor() { }
}
