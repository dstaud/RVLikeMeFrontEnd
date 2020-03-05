import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { FocusMonitor } from '@angular/cdk/a11y';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';


@Component({
  selector: 'app-rvlm-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  backPath = '';
  showInstallLink = false;
  event: any;
  deviceMode = false;
  private windowWidth: any;

  @Output() sideNavClosed = new EventEmitter();


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.windowWidth > 600) {
      this.deviceMode = false;
    } else {
      this.deviceMode = true;
    }
  }

  constructor(private location: Location,
              private focusMonitor: FocusMonitor,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private activateBackArrowSvc: ActivateBackArrowService,) { }

  ngOnInit() {

    // Get the event handle when beforeInstallEvent fired that allows for app installation.
    // When fired, offer user option to install app from menu
    this.event = this.beforeInstallEventSvc.beforeInstallEvent$

    this.event
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      if (data !== null) {
        this.event = data.valueOf();
        this.showInstallLink = true;
      }
    });

    // Get window size to determine what items presented in menu
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 600) {
      this.deviceMode = false;
    } else {
      this.deviceMode = true;
    }
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

  installApp() {

    // Show the install prompt
    this.event.prompt();

    // Wait for the user to respond to the prompt
    this.event.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.beforeInstallEventSvc.saveBeforeInstallEvent(null);
      } else {
        console.log('User dismissed the install prompt');
      }
    });
    this.closeSideNav();
  }
}
