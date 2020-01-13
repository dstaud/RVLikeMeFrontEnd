import { DataService } from './../../core/services/data-services/data.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { Iuser } from './../../interfaces/user';

@Component({
  selector: 'app-rvlm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: Iuser;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  cellPhoneNbr: number;
  yearOfBirth: number;
  homeState: string;

  constructor(private authSvc: AuthenticationService,
              private dataSvc: DataService,
              public translateSvc: TranslateService,
              private router: Router) {
              }

  ngOnInit() {
    if (this.authSvc.isLoggedIn()) {
      this.dataSvc.getUserProfile().subscribe(user => {
        this.user = user;
        this.displayName = this.user.displayName;
        this.firstName = this.user.firstName;
        this.lastName = this.user.lastName;
        this.cellPhoneNbr = this.user.cell;
        this.email = this.user.email;
        this.yearOfBirth = this.user.yearOfBirth;
        this.homeState = this.user.homeState;
      }, (err) => {
        console.error(err);
      });
    } else {
      this.router.navigateByUrl('/');
    }
  }

}
