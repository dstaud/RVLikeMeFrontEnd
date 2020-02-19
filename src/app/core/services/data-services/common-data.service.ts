import { Injectable } from '@angular/core';
import { WindowService } from './../window.service';
import { environment } from '../../../../environments/environment';


// For use by other data services, not by components
@Injectable({
  providedIn: 'root'
})
export class CommonDataService {
  private token: string;

  constructor(private WindowRef: WindowService) { }

  public getLocation() {
    // Get back-end URL
    const hostLocation = this.WindowRef.nativeWindow.location.host;
    // let dataSvcURL = environment.dataServiceURL + 'api/posts';
    let dataSvcURL = environment.dataServiceURL + 'api';

    if (environment.production && hostLocation.includes('localhost')) {
      // Override back-end URL with localhost if testing Service Worker with production /dist files
      // dataSvcURL = 'http://localhost:3000/' + 'api/posts';
      dataSvcURL = 'http://localhost:3000/' + 'api';
    }

    return dataSvcURL;
  }

  public getToken(): string {
    // Get from local storage everytime in cae different people register on same machine and this.token is from previous
    this.token = localStorage.getItem('rvlikeme-token');
    return this.token;
  }

}
