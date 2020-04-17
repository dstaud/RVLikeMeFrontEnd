import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { FocusMonitor } from '@angular/cdk/a11y';
import { SwUpdate, SwPush } from '@angular/service-worker';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';
import { SubscribeNotificationsService } from '@services/data-services/subscribe-notifications.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { SharedComponent } from '@shared/shared.component';

import { environment } from '@environments/environment';


@Component({
  selector: 'app-rvlm-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {

  @Input('notificationPermission') notificationPermission: string;
  @Output() sideNavClosed = new EventEmitter();

  backPath: string = '';
  showInstallLink:boolean = false;
  event: any;
  deviceMode: boolean = false;
  showSpinner: boolean = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private windowWidth: any;
  private profileID: string;


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
              private profileSvc: ProfileService,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private subscribeNotifiationsSvc: SubscribeNotificationsService,
              private swUpdate: SwUpdate,
              private swPush: SwPush) { }

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

    this.userProfile = this.profileSvc.profile;
    this.userProfile
    // .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      this.profile = profile;
      this.profileID = profile._id;
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

  onInstallApp() {

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

  onSubscribeNotifications() {
    this.showSpinner = true;
    console.log('onSubscribeNotifications: swUpdate enabled=', this.swUpdate.isEnabled);
    if (this.swUpdate.isEnabled) {
      console.log('onSubscribeNotifications: swUpdate is enabled. requesting sub with key=', environment.vapidPublicKey);
      this.swPush.requestSubscription({
        serverPublicKey: environment.vapidPublicKey
      })
      .then(subscription => {
        console.log('onSubscribeNotifications: calling server with subscription ', subscription);
        this.subscribeNotifiationsSvc.subscribeToNotifications(this.profileID, subscription)
        .subscribe(subscribeResults => {
          console.log('onSubscribeNotifications: received server response=', subscribeResults);
          this.showSpinner = false;
          this.closeSideNav();
        }, error => {
          console.error('onSubscribeNotifications: throw error ', error);
          throw new Error(error);
        })
      })
      .catch(err => console.error("Could not subscribe to notifications", err));
    }
  }

  onUnsubscribeNotifications() {
    this.showSpinner = true;
    this.subscribeNotifiationsSvc.unsubscribeFromNotifications(this.profileID)
    .subscribe(unsubscribeResults => {
      console.log('onSubscribeNotifications: received server response=', unsubscribeResults);
      this.showSpinner = false;
      this.closeSideNav();
    }, error => {
      console.error('onSubscribeNotifications: throw error ', error);
      throw new Error(error);
    });
  }

  onNotify() {
    this.showSpinner = true;
    console.log('SideNavComponent:onNotify: in onNotify');
    console.log('SideNavComponent:onNotify: notify=', this.profile.notifySubscription);
    this.subscribeNotifiationsSvc.sendNotificationTest(this.profile.notifySubscription)
    .subscribe(notifyResult => {
      console.log('onNotify: message should be on the way', notifyResult);
      this.showSpinner = false;
      this.closeSideNav();
    }, error => {
      console.error('onNotify: throw error ', error);
      throw new Error(error);
    })
  }
}
