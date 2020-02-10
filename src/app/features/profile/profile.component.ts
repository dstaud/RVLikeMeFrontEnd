import { DataService } from './../../core/services/data-services/data.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { Iuser } from './../../interfaces/user';
import { ActivateBackArrowService } from './../../core/services/activate-back-arrow.service';

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
  backPath = '';
  totalFieldsWithData = 0;
  totalNbrOfFields = 6;
  percentPersonal: number;
  percentLifestyle: number;
  percentRig: number;

  constructor(private authSvc: AuthenticationService,
              private dataSvc: DataService,
              private translate: TranslateService,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) {
              }

  ngOnInit() {
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }
    this.dataSvc.getProfilePersonal()
    .subscribe(user => {
      console.log('count before=', this.totalFieldsWithData);
      if (user.firstName) { this.totalFieldsWithData++; }
      if (user.lastName) { this.totalFieldsWithData++; }
      if (user.displayName) { this.totalFieldsWithData++; }
      if (user.yearOfBirth) { this.totalFieldsWithData++; }
      if (user.homeCountry) { this.totalFieldsWithData++; }
      if (user.homeState) { this.totalFieldsWithData++; }
      console.log('count after=', this.totalFieldsWithData);
      this.percentPersonal = (this.totalFieldsWithData / this.totalNbrOfFields) * 100;
      console.log('% complete=', this.percentPersonal);
    });
   }

  onPersonal() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-personal');
  }

  onLifestyle() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-lifestyle');
  }

  onRig() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-rig');
  }
}
