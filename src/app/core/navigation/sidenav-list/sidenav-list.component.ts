import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FocusMonitor } from '@angular/cdk/a11y';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';


@Component({
  selector: 'app-rvlm-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {

  @Output() sideNavClosed = new EventEmitter();

  private backPath: string = '';

  constructor(private location: Location,
              private focusMonitor: FocusMonitor,
              private shareDataSvc: ShareDataService,
              private router: Router,
              private activateBackArrowSvc: ActivateBackArrowService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.focusMonitor.stopMonitoring(document.getElementById('routeNewbieCorner'));
    this.focusMonitor.stopMonitoring(document.getElementById('routeProfile'));
    this.focusMonitor.stopMonitoring(document.getElementById('routeAbout'));
    this.focusMonitor.stopMonitoring(document.getElementById('routeSettings'));
  }

  ngOnDestroy() {}

  closeSideNav = () => {
    this.backPath = this.location.path().substring(1, this.location.path().length);
    this.activateBackArrowSvc.setBackRoute(this.backPath);
    this.sideNavClosed.emit();
  }


  onAbout() {
    this.router.navigateByUrl('/about');
    this.closeSideNav();
  }


  onNewbieCorner() {
    let params = '{"displayName":"Dave","profileImageUrl":""}'
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/newbie/newbie-topics');
    this.closeSideNav();
  }


  onProfile() {
    this.router.navigateByUrl('/profile');
    this.closeSideNav();
  }


  onSettings() {
    this.router.navigateByUrl('/settings');
    this.closeSideNav();
  }
}
