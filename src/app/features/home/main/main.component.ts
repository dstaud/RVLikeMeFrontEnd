import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { DeviceService } from '@services/device.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { UserTypeService } from '@services/user-type.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { StandaloneService } from '@services/standalone.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  userType: string;
  desktopUser = false;

  constructor(private device: DeviceService,
              private router: Router,
              private sentry: SentryMonitorService,
              private userTypeSvc: UserTypeService,
              private standaloneSvc: StandaloneService,
              private activateBackArrowSvc: ActivateBackArrowService) {   }

  ngOnInit(): void {
    if (window.innerWidth >= 600) {
      this.desktopUser = true;
    }
    this.listenForUserType();
  }

  ngOnDestroy() { }

  getClass() {
    let containerClass: string;
    let bottomSpacing: string;
    let topSpacing: string;

    if (this.device.iPhoneModelXPlus && this.standaloneSvc.standalone) {
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

  onGroups() {
    this.activateBackArrowSvc.setBackRoute('/home/main', 'forward');
    if (this.desktopUser) {
      this.router.navigateByUrl('forums/main');
    } else {
      this.router.navigateByUrl('/forums/forums-list');
    }
  }

  onLikeMe() {
    this.activateBackArrowSvc.setBackRoute('/home/main', 'forward');
    this.router.navigateByUrl('/connections/main');
  }

  onNewbie() {
    this.activateBackArrowSvc.setBackRoute('home/main', 'forward');
    if (this.desktopUser) {
      this.router.navigateByUrl('/newbie/main');
    } else {
      this.router.navigateByUrl('/newbie/newbie-corner');
    }

  }

  private listenForUserType() {
    this.userTypeSvc.userType
    .pipe(untilComponentDestroyed(this))
    .subscribe(type => {
      this.userType = type;
    }, (error) => {
      this.sentry.logError('NewbieTopicsComponent:listenForUserType: error ' + JSON.stringify(error));
    });
  }

}
