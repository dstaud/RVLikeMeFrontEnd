import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';

import { DesktopDialogComponent } from '@dialogs/desktop-dialog/desktop-dialog.component';

// TODO: more interesting thigns on landing page
// TODO: newbie corner to help newbies

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

  // Get window size to determine how to present register, signon and learn more
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setImageBasedOnScreenWidth();
  }

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private headerVisibleSvc: HeaderVisibleService,
              private dialog: MatDialog,
              private router: Router) {
  }

  ngOnInit() {
    // Randomly pick one of 3 landing page RV images
    this.landingImageNbr = Math.floor(Math.random() * 3) + 1;

    this.setImageBasedOnScreenWidth();
  }

  ngOnDestroy() {}


  onLearnMore() {
    this.headerVisibleSvc.toggleHeaderVisible(true);
    this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
    this.router.navigateByUrl('/learn-more');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }


  // When user selects register, if mobile, go to register component.
  // If desktop, present register component in dialog and take action when registration complete.
  onRegisterUser() {
    if (this.windowWidth > 600) {
      this.openDialog('register', (result: string) => {
        if (result === 'complete') {
          this.onSignIn();
        }
      });
    } else {
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/register');
      this.activateBackArrowSvc.setBackRoute('landing-page');
    }
  }


  // When user selects signin, if mobile, go to signin component.
  // If desktop, present signin component in dialog and take action when signin complete.
  onSignIn() {
    if (this.windowWidth > 600) {
      this.openDialog('signin', (result: string) => {
        if (result === 'complete') {
          this.activateBackArrowSvc.setBackRoute('landing-page');
          this.headerVisibleSvc.toggleHeaderDesktopVisible(true);
          this.router.navigateByUrl('/home');
        }
      });
    } else {
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/signin');
      this.activateBackArrowSvc.setBackRoute('landing-page');
    }
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

  private setImageBasedOnScreenWidth() {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth > 600) {
      this.landingImage = 'landing-image' + this.landingImageNbr + '.jpeg';
    } else {
      this.landingImage = 'landing-imageM' + this.landingImageNbr + '.jpeg';
    }
  }
}
