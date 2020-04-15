import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { WindowService } from './../window.service';
import { environment } from '@environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private token: string;
  private dataSvcURL = this.getLocation();

  constructor(private http: HttpClient,
              private WindowRef: WindowService) { }


  uploadProfileImage(fd: FormData) {
    return this.http.post(`${this.dataSvcURL}/upload-image`, fd,
    { headers: { Authorization: `Bearer ${this.getToken()}` },
    reportProgress: true,
    observe: 'events'
    });
  }

  uploadProfileImageBase64(image: string) {
    let imagePackage = {'image': image}
    return this.http.post(`${this.dataSvcURL}/upload-image`, imagePackage,
    { headers: { Authorization: `Bearer ${this.getToken()}` },
    reportProgress: true,
    observe: 'events'
    });
  }

  private getLocation() {
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

  private getToken(): string {
    // Get from local storage everytime in cae different people register on same machine and this.token is from previous
    this.token = localStorage.getItem('rvlikeme-token');
    return this.token;
  }
}

