import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ShareDataService } from './../core/services/share-data.service';

import { SigninDesktopDialogComponent } from '@dialogs/signin-desktop-dialog/signin-desktop-dialog.component';
import { RegisterDesktopDialogComponent } from '@dialogs/register-desktop-dialog/register-desktop-dialog.component';

@Component({
  selector: 'app-rvlm-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  landingImage: string;
  logoClass: string;
  logoDesktopLeft: string;
  showLearnMoreDesktop: boolean = false;
  maxRvImageHeight = 'auto';
  maxRvImageWidth = '100%';

  private windowWidth: number;
  private landingImageNbr: number;
  private routeSubscription: any;

  // Get window size to determine how to present register, signon and learn more
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setImageBasedOnScreenWidth();
  }

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private headerVisibleSvc: HeaderVisibleService,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private shareDataSvc: ShareDataService,
              private router: Router) {
  }

  ngOnInit() {
    // Randomly pick one of 3 landing page RV images
    this.landingImageNbr = Math.floor(Math.random() * 3) + 1;

    this.setImageBasedOnScreenWidth();

    this.listenForParameters();
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }


  onLearnMore() {
    let params: string;

    let desktop: boolean = false;

    if (this.windowWidth > 600) {
      desktop = true;
    }

    this.headerVisibleSvc.toggleHeaderVisible(true);
    this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
    this.activateBackArrowSvc.setBackRoute('', 'forward');

    params = '{"desktop":' + desktop + '}'
    console.log('LandingPageComponent:onLearnMore: params=', params);
    this.shareDataSvc.setData(params);
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
    this.shareDataSvc.setData(true) // To indicate to signin page coming from landing page
    if (this.windowWidth > 600) {
      this.openSigninDialog((result: string) => {
        console.log('LandingPageComponent:onSignIn: back from dialog. result=', result);
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
    console.log('PasswordReset:listenForParameters:');
    this.routeSubscription = this.route
    .queryParams
    .subscribe(params => {
      if (params.e === 'signin') {
        if (this.windowWidth > 600) {
          this.openSigninDialog((result: string) => {
            console.log('LandingPageComponent:listenForParameters: back from dialog. result=', result);
            if (result === 'complete') {
              this.activateBackArrowSvc.setBackRoute('', 'forward');
              this.headerVisibleSvc.toggleHeaderDesktopVisible(true);
              this.router.navigateByUrl('/home/dashboard');
            }
          });
        } else {
          this.activateBackArrowSvc.setBackRoute('', 'forward');
          this.router.navigateByUrl('/signin');
        }
      }
    }, error => {
      console.error('PasswordReset:listenForParameters: could not read parameters.  error=', error);
      throw new Error(error);
    });
  }


  // For Desktop users, present register / signin as a dialog
  private openRegisterDialog(cb: CallableFunction): void {
    const dialogRef = this.dialog.open(RegisterDesktopDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: true
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
      disableClose: true
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
