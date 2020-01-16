import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { DataService } from './../../core/services/data-services/data.service';
import { Iuser } from './../../interfaces/user';

@Component({
  selector: 'app-rvlm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(private authSvc: AuthenticationService,
              private dataSvc: DataService,
              public translate: TranslateService,
              private router: Router) { }

  ngOnInit() {
    if (!this.authSvc.isLoggedIn()) {
      this.router.navigateByUrl('/');
    }
  }
}
