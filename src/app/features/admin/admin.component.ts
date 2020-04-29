
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AdminService } from '@services/data-services/admin.service';
import { IrigData } from '@services/data-services/rig.service';

import { SharedComponent } from './../../shared/shared.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  form: FormGroup;

  brands: Array<string> = [];

  showSpinner: boolean = false;

  constructor(private authSvc: AuthenticationService,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private shared: SharedComponent,
              private adminSvc: AdminService,
              fb: FormBuilder) {
                this.form = fb.group({
                  rvFileName: new FormControl('', Validators.required)
                });
     }

  ngOnInit(): void {
    let backPath: string;

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath);
      this.router.navigateByUrl('/signin');
    }

    this.authSvc.userAdmin
    .subscribe(admin => {
      if (!admin) {
        this.router.navigateByUrl('/signin');
      }
    });
  }

  onBrandsByManufacturer() {
    this.showSpinner = true;
    this.adminSvc.loadRvData(this.form.controls.rvFileName.value)
    .subscribe(rvData => {
      console.log('AdminComponent:onBrandsByManufacturer: rvData=', rvData);
      this.shared.openSnackBar('RV Data in file ' + this.form.controls.rvFileName.value + ' loaded to collection', 'message', 3000);
      this.form.controls.rvFileName = null;
      this.showSpinner = false;
    }, error => {
      console.log('AdminComponent:onBrandsByManufacturer: error loading RV data file=', error);
      this.showSpinner = false;
      throw new Error(error);
    })
  }
}