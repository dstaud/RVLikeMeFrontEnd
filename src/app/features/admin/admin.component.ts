import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AdminService } from '@services/data-services/admin.service';
import { ProfileService } from '@services/data-services/profile.service';
import { EmailSmtpService } from '@services/data-services/email-smtp.service';
import { DeviceService } from '@services/device.service';

import { SharedComponent } from '@shared/shared.component';

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
              private profileSvc: ProfileService,
              private EmailSmtpSvc: EmailSmtpService,
              private device: DeviceService,
              fb: FormBuilder) {
                this.form = fb.group({
                  rvFileName: new FormControl('', Validators.required)
                });
     }

  ngOnInit(): void {
    let backPath: string;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.authSvc.userAdmin
      .pipe(untilComponentDestroyed(this))
      .subscribe(admin => {
        if (!admin) {
          this.router.navigateByUrl('/signin');
        }
      });
    }
  }

  ngOnDestroy() {}


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }
    containerClass = 'container ' + bottomSpacing;

    return containerClass;
  }

  onBrandsByManufacturer() {
    this.showSpinner = true;
    this.adminSvc.loadRvData(this.form.controls.rvFileName.value)
    .pipe(untilComponentDestroyed(this))
    .subscribe(rvData => {
      this.shared.openSnackBar('RV Data in file ' + this.form.controls.rvFileName.value + ' loaded to collection', 'message', 3000);
      this.form.controls.rvFileName = null;
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }

  onNewBrands() {
    this.profileSvc.getNewBrands()
    .pipe(untilComponentDestroyed(this))
    .subscribe(brands => {
    }, error => {
      if (error) {
        }
    });
  }
}
