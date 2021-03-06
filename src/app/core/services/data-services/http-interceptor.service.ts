import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, retryWhen, concatMap, delay } from 'rxjs/operators';
import { WindowService } from './../window.service';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {
  private token: string;

  private httpError = {
    status: 0,
    message: ''
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let authReq
    const dataSvcURL = this.getHostLocation();
    let part = request.url.substring(0,4);
    if (part === '/api') { // anything other than an api call, such as language translation, should be passed through
      authReq = request.clone({
        url: `${dataSvcURL}${request.url}`,
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        })
      });
    } else {
        authReq = request;
    }

    // If timeout, retry up to 3 times with delay
    return next.handle(authReq).pipe(
      retryWhen(errors => errors
        .pipe(
          concatMap((error, count) => {
            if (count < 3 && error.status == 504 && !this.getHostLocation().includes('send-register-email')) {
              return of(error);
            }
            return throwError(error.error);
          }),
          delay(500)
        )
      ),
      catchError((error: HttpErrorResponse) => {
        if (error instanceof HttpErrorResponse) {
          // server-side error
          this.httpError.status = error.status;
          this.httpError.message = error.message;
          return throwError(this.httpError);
        } else {
          // client-side error
          return throwError(error);
        }
      })
    );
  }

  constructor(private WindowRef: WindowService) { }

  private getHostLocation() {
    // Get back-end URL
    const hostLocation = this.WindowRef.nativeWindow.location.host;
    // let dataSvcURL = environment.dataServiceURL + 'api/posts';
    let dataSvcURL = environment.dataServiceURL;

    if (environment.production && hostLocation.includes('localhost')) {
      // Override back-end URL with localhost if testing Service Worker
      dataSvcURL = 'http://localhost:3000';
    }
    if (dataSvcURL.substring(dataSvcURL.length - 1, dataSvcURL.length) === '/') {
      dataSvcURL = dataSvcURL.substring(0, dataSvcURL.length - 1);
    }
    return dataSvcURL;
  }

  private getToken(): string {
    // Get from local storage everytime in cae different people register on same machine and this.token is from previous
    this.token = localStorage.getItem('rvlikeme-token');
    return this.token;
  }
}
