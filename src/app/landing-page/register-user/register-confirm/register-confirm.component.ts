import { Component, OnInit, OnDestroy, HostListener, ElementRef, Directive } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ShareDataService, Isignin } from '@services/share-data.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ActivateBackArrowService } from '@core/services/activate-back-arrow.service';
import { EmailSmtpService } from '@services/data-services/email-smtp.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';
import { DeviceService } from '@services/device.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

@Component({
  selector: 'app-register-confirm',
  templateUrl: './register-confirm.component.html',
  styleUrls: ['./register-confirm.component.scss']
})

export class RegisterConfirmComponent implements OnInit {
  landingImage: string;
  maxRvImageHeight = 'auto';
  maxRvImageWidth = '100%';
  httpError: boolean = false;
  httpErrorText: string = 'No Error';
  showSpinner: boolean = true;
  presentInstallOption: boolean = false;
  readyToInstall: boolean = false;

  private windowWidth: number;
  private routeSubscription: any;
  private token: string;
  private event: any;
  private installPrompt: any;
  private device: string;
  private install: boolean = false;

  numberOfClicks = 0;

  // Get window size to determine how to present register, signon and learn more
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setImageBasedOnScreenWidth();
  }

  constructor(private route: ActivatedRoute,
              private authSvc: AuthenticationService,
              private shareDataSvc: ShareDataService,
              private headerVisibleSvc: HeaderVisibleService,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private emailSmtpSvc: EmailSmtpService,
              private deviceSvc: DeviceService,
              private sentry: SentryMonitorService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private elementRef: ElementRef,
              private router: Router) {

      this.route.queryParams
      .pipe(untilComponentDestroyed(this))
      .subscribe(params => {
        this.token = params['e'];
      });
  }

  ngOnInit(): void {
    this.listenBeforeInstall();

    this.device = this.deviceSvc.device;

    this.setImageBasedOnScreenWidth();

    this.listenForParameters();
  }

  ngOnDestroy() {}


  // When user selects signin, if mobile, go to signin component.
  // If desktop, present signin component in dialog and take action when signin complete.
  onSignIn() {

    if(this.readyToInstall) {
      // Show the install prompt
      this.event.prompt();

      // Wait for the user to respond to the prompt
      this.event.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          this.install = true;
          this.beforeInstallEventSvc.saveBeforeInstallEvent(null);
        } else {
          this.install = false;
        }
      });

      let param: Isignin = {
        fromLandingPage: true,
        install: this.install,
        installDevice: this.device
      }

      this.shareDataSvc.setData('signin', param) // To indicate to signin page coming from landing page
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/?e=signin'); // go directly to login page.  Will pop up as dialog if desktop
      this.activateBackArrowSvc.setBackRoute('', 'forward');
    } else {
      let param: Isignin = {
        fromLandingPage: true,
        install: this.install,
        installDevice: this.device
      }

      this.shareDataSvc.setData('signin', param) // To indicate to signin page coming from landing page
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/?e=signin'); // go directly to login page.  Will pop up as dialog if desktop
      this.activateBackArrowSvc.setBackRoute('', 'forward');
    }
  }


  private activateUser() {
    // Pass both the URL token and the embedded token to activate the user
    this.authSvc.activateUser(this.token)
    .pipe(untilComponentDestroyed(this))
    .subscribe(activateResult => {
      this.showSpinner = false;

      // Since token was deleted by activate user, using this agreed-upon hard-coded token just for sending welcome email.
      this.sendWelcomeEmail(activateResult.email, '8805-1335-8153-3116');

    }, error => {
      this.showSpinner = false;
      this.httpError = true;
      this.httpErrorText = 'The activation token is invalid';
    });
  }


  private listenForParameters() {
    this.routeSubscription = this.route
    .queryParams
    .pipe(untilComponentDestroyed(this))
    .subscribe(params => {
      if (params.e) {
        this.token = params.e;
        this.validateToken();
      }
    }, error => {
      this.showSpinner = false;
      this.httpError = true;
      this.httpErrorText = 'The activation token is invalid';
    });
  }


  // Get the event handle when beforeInstallEvent fired that allows for app installation.
  // When fired, offer user option to install app from menu
  private listenBeforeInstall() {
    this.event = this.beforeInstallEventSvc.beforeInstallEvent$
    this.event
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      if (data !== null) {
        this.event = data.valueOf();
        this.readyToInstall = true;
      }
    });
  }


  private sendWelcomeEmail(email: string, token: string) {
    let sendTo = email;
    let toFirstName = null;
    this.emailSmtpSvc.sendWelcomeEmail(sendTo, toFirstName, token)
    .pipe(untilComponentDestroyed(this))
    .subscribe(emailResult => {
    }, error => {
      this.sentry.logError('RegisterConfirmComponent:sendWelcomeEmail: error sending email: ' + error);
    });
}

  private setImageBasedOnScreenWidth() {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth > 600) {
      this.landingImage = 'landing-image1.jpeg';
    } else {
      this.landingImage = 'landing-imageM1.jpeg';
    }
  }


  // Validate token from URL
  private validateToken() {
    this.authSvc.validatePasswordResetToken(this.token)
    .pipe(untilComponentDestroyed(this))
    .subscribe(tokenResult => {
      this.activateUser();

    }, error => {
      this.httpError = true;
      this.httpErrorText = 'The activation token is invalid';
      this.showSpinner = false;
    })
  }
}
