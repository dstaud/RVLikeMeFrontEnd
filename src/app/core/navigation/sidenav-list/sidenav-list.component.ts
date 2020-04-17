import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { FocusMonitor } from '@angular/cdk/a11y';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';


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
              private activateBackArrowSvc: ActivateBackArrowService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.focusMonitor.stopMonitoring(document.getElementById('routeProfile'));
    this.focusMonitor.stopMonitoring(document.getElementById('routeMessages'));
    this.focusMonitor.stopMonitoring(document.getElementById('routeAbout'));
    this.focusMonitor.stopMonitoring(document.getElementById('installApp'));
  }

  ngOnDestroy() {}

  closeSideNav = () => {
    this.backPath = this.location.path().substring(1, this.location.path().length);
    this.activateBackArrowSvc.setBackRoute(this.backPath);
    this.sideNavClosed.emit();
  }
}
