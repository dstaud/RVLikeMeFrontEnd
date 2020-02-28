import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';

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

  @Output() sideNavClosed = new EventEmitter();

  constructor(private location: Location,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private activateBackArrowSvc: ActivateBackArrowService,) { }

  ngOnInit() {
    this.beforeInstallEventSvc.beforeInstallEvent$
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.event = data.valueOf();
      this.showInstallLink = true;
    });
  }

  ngOnDestroy() {}

  closeSideNav = () => {
    this.backPath = this.location.path().substring(1, this.location.path().length);
    this.activateBackArrowSvc.setBackRoute(this.backPath);
    this.sideNavClosed.emit();
  }

  installApp() {

    // Hide the app provided install promotion
    // hideMyInstallPromotion();

    // Show the install prompt
    this.event.prompt();

    // Wait for the user to respond to the prompt
    this.event.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    });
    this.closeSideNav();
  }
}
