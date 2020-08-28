import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { DeviceService } from '@services/device.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-iphone-install',
  templateUrl: './iphone-install.component.html',
  styleUrls: ['./iphone-install.component.scss']
})
export class IphoneInstallComponent implements OnInit {
  showSpinner: boolean = true;
  desktopUser: boolean = false;

  constructor(private device: DeviceService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService,
              private router: Router,
              private location: Location) {
                if (window.innerWidth >=600) {
                  this.desktopUser = true;
                }
               }

  ngOnInit(): void {
    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    }
  }

  getClass() {
    let containerClass: string;
    let bottomSpacing: string;
    let topSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }

    if (this.desktopUser) {
      topSpacing = 'desktop-spacing';
    } else {
      topSpacing = 'device-spacing';
    }

    containerClass = 'container ' + bottomSpacing + ' ' + topSpacing;

    return containerClass;
  }

}
