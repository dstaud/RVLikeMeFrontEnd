import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ShareDataService, Isignin } from '@services/share-data.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ActivateBackArrowService } from '@core/services/activate-back-arrow.service';
import { EmailSmtpService } from '@services/data-services/email-smtp.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';

import { SharedComponent } from '@shared/shared.component';

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

  private windowWidth: number;
  private routeSubscription: any;
  private token: string;
  private beforeInstallEvent: any;

  // Get window size to determine how to present register, signon and learn more
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setImageBasedOnScreenWidth();
  }

  constructor(private route: ActivatedRoute,
              private authSvc: AuthenticationService,
              private shareDataSvc: ShareDataService,
              private headerVisibleSvc: HeaderVisibleService,
              private dialog: MatDialog,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private emailSmtpSvc: EmailSmtpService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private shared: SharedComponent,
              private router: Router) {

      this.route.queryParams
      .subscribe(params => {
        this.token = params['e'];
      });
  }

  ngOnInit(): void {
    this.onBeforeInstallEventOfferInstallApp();

    this.setImageBasedOnScreenWidth();

    this.listenForParameters();
  }

  ngOnDestroy() {}


  // When user selects signin, if mobile, go to signin component.
  // If desktop, present signin component in dialog and take action when signin complete.
  onSignIn() {
    let param: Isignin = {
      fromLandingPage: true
    }
    this.shareDataSvc.setData('signin', param) // To indicate to signin page coming from landing page
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/?e=signin'); // go directly to login page.  Will pop up as dialog if desktop
      this.activateBackArrowSvc.setBackRoute('', 'forward');
  }


  private activateUser(tokenID: string) {
    console.log('RegisterConfirmComponent:activateUser: confirm code =', this.token);
    this.authSvc.activateUser(this.token, tokenID)
    .subscribe(activateResult => {
      console.log('RegisterConfirmComponent:activateUser: result=', activateResult);
      this.showSpinner = false;
      // Since token was deleted by activate user, using this agreed-upon hard-coded token just for sending welcome email.
      this.sendWelcomeEmail(activateResult.email, '8805-1335-8153-3116')
    }, error => {
      console.log('RegisterConfirmComponent:activateUser: error=', error);
      this.showSpinner = false;
      this.httpError = true;
      this.httpErrorText = 'The activation token is invalid';
    });
  }


    // Get the event handle when beforeInstallEvent fired that allows for app installation.
  // When fired, offer user option to install app from menu
  private onBeforeInstallEventOfferInstallApp() {
    this.beforeInstallEvent = this.beforeInstallEventSvc.beforeInstallEvent$
    this.beforeInstallEvent
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      if (data !== null) {
        this.presentInstallOption = true;
        this.beforeInstallEvent = data.valueOf();
      }
    });
  }


  private listenForParameters() {
    console.log('PasswordReset:listenForParameters:');
    this.routeSubscription = this.route
    .queryParams
    .subscribe(params => {
      if (params.e) {
        this.token = params.e;
        console.log('PasswordReset:listenForParameters: token=', this.token);
        this.validateToken();
      }
    }, error => {
      console.error('PasswordReset:listenForParameters: could not read parameters.  error=', error);
      this.showSpinner = false;
      this.httpError = true;
      this.httpErrorText = 'The activation token is invalid';
    });
  }


  // // App Install Option
  // private openInstallDialog(): void {
  //   const dialogRef = this.dialog.open(InstallDialogComponent, {
  //     width: '250px',
  //     disableClose: true
  //   });

  //   dialogRef.afterClosed()
  //   .pipe(untilComponentDestroyed(this))
  //   .subscribe(result => {
  //     if (result !== 'canceled') {
  //       this.event.prompt();

  //       // Wait for the user to respond to the prompt
  //       this.event.userChoice.then((choiceResult) => {
  //         if (choiceResult.outcome === 'accepted') {
  //           console.log('RegisterUserComponent:openInstallDialog: User accepted the install prompt');
  //           this.beforeInstallEventSvc.saveBeforeInstallEvent(null);
  //         } else {
  //           console.log('RegisterUserComponent:openInstallDialog: User dismissed the install prompt');
  //         }
  //       });
  //     }
  //   });
  // }

  private sendWelcomeEmail(email: string, token: string) {
    let sendTo = email;
    let toFirstName = null;
    console.log('RegisterConfirmComponent:sendWelcomeEmail: sending email to ', sendTo);
    this.emailSmtpSvc.sendWelcomeEmail(sendTo, toFirstName, token)
    .subscribe(emailResult => {
      console.log('welcome email sent!  result=', emailResult);
    }, error => {
      console.log('RegisterConfirmComponent:sendWelcomeEmail: error sending email: ', error);
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


  private validateToken() {
    this.authSvc.validatePasswordResetToken(this.token)
    .subscribe(tokenResult => {
      console.log('PasswordReset:validateToken: tokenResult=', tokenResult);
      this.activateUser(tokenResult.tokenID);
    }, error => {
      console.error('PasswordReset:validateToken: error validating token.  error=', error);
      this.httpError = true;
      this.httpErrorText = 'The activation token is invalid';
      this.showSpinner = false;
    })
  }
}
