import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UUID } from 'angular2-uuid';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ShareDataService } from '@services/share-data.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ActivateBackArrowService } from '@core/services/activate-back-arrow.service';
import { EmailSmtpService } from '@services/data-services/email-smtp.service';

import { DesktopDialogComponent } from '@dialogs/desktop-dialog/desktop-dialog.component';

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

  private windowWidth: number;
  private routeSubscription: any;
  private token: string;

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
    this.setImageBasedOnScreenWidth();

    this.listenForParameters();
  }

  ngOnDestroy() {}


  // When user selects signin, if mobile, go to signin component.
  // If desktop, present signin component in dialog and take action when signin complete.
  onSignIn() {
    this.shareDataSvc.setData(true) // To indicate to signin page coming from landing page
    if (this.windowWidth > 600) {
      this.openDialog('signin', (result: string) => {
        if (result === 'complete') {
          this.activateBackArrowSvc.setBackRoute('landing-page');
          this.headerVisibleSvc.toggleHeaderDesktopVisible(true);
          this.router.navigateByUrl('/home/dashboard');
        }
      });
    } else {
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/signin');
      this.activateBackArrowSvc.setBackRoute('landing-page');
    }
  }


  private activateUser() {
    console.log('RegisterConfirmComponent:activateUser: confirm code =', this.token);
    this.authSvc.activateUser(this.token)
    .subscribe(activateResult => {
      console.log('RegisterConfirmComponent:activateUser: result=', activateResult);
      this.showSpinner = false;
      this.sendWelcomeEmail(activateResult.email, this.token)
    }, error => {
      console.log('RegisterConfirmComponent:activateUser: error=', error);
      this.showSpinner = false;
      this.httpError = true;
      this.httpErrorText = 'The activation token is invalid';
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


  // For Desktop users, present register / signin as a dialog
  private openDialog(component: string, cb: CallableFunction): void {
    const dialogRef = this.dialog.open(DesktopDialogComponent, {
      width: '340px',
      height: '525px',
      disableClose: true,
      data: { component: component }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
        cb(result);
    });
  }

  sendWelcomeEmail(email: string, token: string) {
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
      this.activateUser();
    }, error => {
      console.error('PasswordReset:validateToken: error validating token.  error=', error);
      this.httpError = true;
      this.httpErrorText = 'The activation token is invalid';
      this.showSpinner = false;
    })
  }
}
