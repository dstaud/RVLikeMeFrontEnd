import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';


@Component({
  selector: 'app-rvlm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public translate: TranslateService,
              private auth: AuthenticationService,
              private router: Router) { }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      console.log('navigating to root');
      this.router.navigateByUrl('/');
    }
  }

}
