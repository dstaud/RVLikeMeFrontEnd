import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from './../../core/services/data.service';

@Component({
  selector: 'app-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})
export class ForumsComponent implements OnInit {

  constructor(public translate: TranslateService,
              private dataSvc: DataService,
              private router: Router) {
              }

  ngOnInit() {
    if (!this.dataSvc.isLoggedIn()) {
      this.router.navigateByUrl('/');
    }
  }

}
