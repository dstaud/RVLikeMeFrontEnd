import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ShareDataService, Isignin } from '@services/share-data.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

import { SigninDesktopDialogComponent } from '@dialogs/signin-desktop-dialog/signin-desktop-dialog.component';
import { RegisterDesktopDialogComponent } from '@dialogs/register-desktop-dialog/register-desktop-dialog.component';

export declare class FacebookParams {
  u: string;
}

@Component({
  selector: 'app-rvlm-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  landingImage: string;
  cardNbr: number;
  logoClass: string;
  logoDesktopLeft: string;
  showLearnMoreDesktop: boolean = false;
  maxRvImageHeight = 'auto';
  maxRvImageWidth = '100%';
  desktopUser: boolean = false;

  private windowWidth: number;
  private landingImageNbr: number;
  private routeSubscription: any;
  private install: boolean;
  private installDevice: string;

  // Get window size to determine how to present register, signon and learn more
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setImageBasedOnScreenWidth();
  }

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private headerVisibleSvc: HeaderVisibleService,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private sentry: SentryMonitorService,
              private location: Location,
              private shareDataSvc: ShareDataService,
              private router: Router) {
        if (window.innerWidth > 600) {
          this.desktopUser = true;
        }
  }

  ngOnInit() {
    let params: Isignin;

    // Randomly pick one of 3 landing page RV images
    // this.landingImageNbr = Math.floor(Math.random() * 3) + 1;
    this.landingImageNbr = 1;
    this.cardNbr = Math.floor(Math.random() * 4) + 1;

    params = this.shareDataSvc.getData('signin');
    this.install = params.install;
    this.installDevice = params.installDevice;

    this.setImageBasedOnScreenWidth();

    this.listenForParameters();
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }


  onLearnMore() {
    this.headerVisibleSvc.toggleHeaderVisible(true);
    this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
    this.activateBackArrowSvc.setBackRoute('', 'forward');
    this.router.navigateByUrl('/learn-more');
  }


  // When user selects register, if mobile, go to register component.
  // If desktop, present register component in dialog and take action when registration complete.
  onRegisterUser() {
    if (this.windowWidth > 600) {
      this.openRegisterDialog((result: string) => {
        if (result === 'complete') {
          this.onSignIn();
        }
      });
    } else {
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/register');
      this.activateBackArrowSvc.setBackRoute('', 'forward');
    }
  }


  // When user selects signin, if mobile, go to signin component.
  // If desktop, present signin component in dialog and take action when signin complete.
  onSignIn() {
    let param: Isignin = {
      fromLandingPage: true,
      install: this.install,
      installDevice: this.installDevice
    }
    this.shareDataSvc.setData('signin', param) // To indicate to signin page coming from landing page
    if (this.windowWidth > 600) {
      this.openSigninDialog((result: string) => {

        if (result === 'complete') {
          this.activateBackArrowSvc.setBackRoute('', 'forward');
          this.headerVisibleSvc.toggleHeaderDesktopVisible(true);
          this.router.navigateByUrl('/home/dashboard');
        }
      });
    } else {
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/signin');
      this.activateBackArrowSvc.setBackRoute('', 'forward');
    }
  }


  private listenForParameters() {
    this.routeSubscription = this.route
    .queryParams
    .pipe(untilComponentDestroyed(this))
    .subscribe(params => {
      if (params.e === 'signin') {
        if (this.windowWidth > 600) {
          this.openSigninDialog((result: string) => {
            if (result === 'complete') {
              // this.activateBackArrowSvc.setBackRoute('', 'forward');
              this.headerVisibleSvc.toggleHeaderDesktopVisible(true);

              if (!this.location.path()) {
                this.router.navigateByUrl('/home/dashboard');
              }
            }
          });
        } else {
          this.activateBackArrowSvc.setBackRoute('', 'forward');
          this.router.navigateByUrl('/signin');
        }
      } else if (params.e === 'register') {
        if (this.windowWidth > 600) {
          this.openRegisterDialog((result: string) => {
            if (result === 'complete') {
              this.onSignIn();
            }
          });
        } else {
          this.activateBackArrowSvc.setBackRoute('', 'forward');
          this.router.navigateByUrl('/register');
        }
      }
    }, error => {
      this.sentry.logError('Landing-page:listenForParameters: could not read parameters.  error=' + error);
    });
  }


  // For Desktop users, present register / signin as a dialog
  private openRegisterDialog(cb: CallableFunction): void {
    const dialogRef = this.dialog.open(RegisterDesktopDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: true,
      hasBackdrop: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
        cb(result);
    });
  }

  private openSigninDialog(cb: CallableFunction): void {
    const dialogRef = this.dialog.open(SigninDesktopDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: true,
      hasBackdrop: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
        cb(result);
    });
  }

  private setImageBasedOnScreenWidth() {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth > 600) {
      this.landingImage = 'landing-image' + this.landingImageNbr + '.jpeg';
    } else {
      this.landingImage = 'landing-imageM' + this.landingImageNbr + '.jpeg';
    }
  }
}
