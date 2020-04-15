import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';

import { DesktopDialogComponent } from '@dialogs/desktop-dialog/desktop-dialog.component';

// import { timingSafeEqual } from 'crypto';

// TODO: more interesting thigns on landing page
// TODO: newbie corner to help newbies

@Component({
  selector: 'app-rvlm-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  landingImage: string;
  maxRvImageHeight = 'auto';
  maxRvImageWidth = '100%';
  logoClass: string;
  logoDesktopLeft: string;
  showLearnMoreDesktop = false;

  private landingImageNbr: number;
  private imageHeight: number
  private windowWidth: number;
  private windowHeight: number;
  private logoDesktopLeftPosition: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
  this.windowWidth = window.innerWidth;
  this.windowHeight = window.innerHeight;

/*   if (this.windowWidth > 600) {
    this.imageHeight = this.windowHeight *.6;
    this.maxRvImageHeight = this.imageHeight.toString() + 'px';
    this.maxRvImageWidth = 'auto';
  } else { */
    this.maxRvImageHeight = 'auto';
    this.maxRvImageWidth = '100%';
/*   } */
}

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private headerVisibleSvc: HeaderVisibleService,
              private dialog: MatDialog,
              private router: Router) {
}

  ngOnInit() {
    // Get window size to determine how to present register, signon and learn more
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    // Randomly pick one of 3 landing page RV images
    this.landingImageNbr = Math.floor(Math.random() * 3) + 1;

    if (this.windowWidth > 600) {
      this.landingImage = 'landing-image' + this.landingImageNbr + '.jpeg';
    } else {
      this.landingImage = 'landing-imageM' + this.landingImageNbr + '.jpeg';
    }

/*     if (this.windowWidth > 600) {
      this.imageHeight = this.windowHeight *.6;
      this.maxRvImageHeight = this.imageHeight.toString() + 'px';
      this.maxRvImageWidth = 'auto';
    } else { */
    this.maxRvImageHeight = 'auto';
    this.maxRvImageWidth = '100%';
/*     } */
  }

  ngOnDestroy() {}


  // For Desktop users, present register as a dialog
  openDialog(component: string, cb: CallableFunction): void {
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

  registerUser() {
    if (this.windowWidth > 600) {
      this.openDialog('register', (result: string) => {
        if (result === 'complete') {
          this.signIn();
        }
      });
    } else {
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/register');
      this.activateBackArrowSvc.setBackRoute('landing-page');
    }
  }

  learnMore() {
    this.headerVisibleSvc.toggleHeaderVisible(true);
    this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
    this.router.navigateByUrl('/learn-more');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }

  signIn() {
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
}
