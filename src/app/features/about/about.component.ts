import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from './../../core/services/data.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor(public translate$: TranslateService,
              private dataSvc: DataService,
              private router: Router) {
              }

  ngOnInit() {
    if (!this.dataSvc.isLoggedIn()) {
      this.router.navigateByUrl('/');
    }
  }
}
