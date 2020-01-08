import { DataService } from './../../core/services/data-services/data.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { Iuser } from './../../interfaces/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: Iuser;
  firstName: string;
  email: string;

  constructor(private auth: AuthenticationService,
              private dataSvc: DataService,
              public translate: TranslateService,
              private router: Router) {
              }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.dataSvc.getUserProfile().subscribe(user => {
        this.user = user;
        this.firstName = this.user.firstName;
        this.email = this.user.email;
      }, (err) => {
        console.error(err);
      });
    } else {
      this.router.navigateByUrl('/');
    }
  }

}
