import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { FocusMonitor } from '@angular/cdk/a11y';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  userAdmin: boolean = false;

  @Output() sideNavClosed = new EventEmitter();

  constructor(private location: Location,
              private focusMonitor: FocusMonitor,
              private router: Router,
              private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService) { }

  ngOnInit() {
    this.listenForUserAdmin();
  }

  ngAfterViewInit() {
    this.focusMonitor.stopMonitoring(document.getElementById('routeNewbieCorner'));
    this.focusMonitor.stopMonitoring(document.getElementById('routeProfile'));
    this.focusMonitor.stopMonitoring(document.getElementById('routeAbout'));
    this.focusMonitor.stopMonitoring(document.getElementById('routeSettings'));
  }

  ngOnDestroy() {}

  closeSideNav = () => {
    let backPath: string = '';
    backPath = this.location.path().substring(1, this.location.path().length);
    this.activateBackArrowSvc.setBackRoute(backPath);
    this.sideNavClosed.emit();
  }


  onAdmin() {
    this.activateBackArrowSvc.setBackRoute('');
    this.router.navigateByUrl('/admin');
    this.closeSideNav();
  }


  onAbout() {
    this.activateBackArrowSvc.setBackRoute('');
    this.router.navigateByUrl('/about');
    this.closeSideNav();
  }


  onNewbieCorner() {
    this.activateBackArrowSvc.setBackRoute('');
    this.router.navigateByUrl('/newbie/need-help-newbie');
    this.closeSideNav();
  }


  onProfile() {
    this.activateBackArrowSvc.setBackRoute('');
    this.router.navigateByUrl('/profile/main');
    this.closeSideNav();
  }


  // Check if user is marked as user Admin in the database as this offers additional access
  private listenForUserAdmin() {
    this.authSvc.userAdmin
    .pipe(untilComponentDestroyed(this))
    .subscribe(authData => {
      this.userAdmin = authData.valueOf();
    });
  }
}
