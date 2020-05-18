import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface IlinkPreview {
  description: string,
  image: string,
  title: string,
  url: string
}

@Injectable({
  providedIn: 'root'
})
export class LinkPreviewService {

  constructor(private http: HttpClient) { }

  getLinkPreview(link: string): Observable<any> {
    var api = 'http://api.linkpreview.net/?key=118f4880338eaa51b5d3db12ca05fbab&q=' + link;

    return this.http.get(api);
  }

}
