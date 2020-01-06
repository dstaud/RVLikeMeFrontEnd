import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from './../../core/services/data.service';
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

  constructor(private dataSvc: DataService,
              public translate: TranslateService,
              private router: Router) {
              }

  ngOnInit() {
    if (this.dataSvc.isLoggedIn()) {
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
