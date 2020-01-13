import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RegisterDialogComponent } from './../../features/register-signin/register-dialog/register-dialog.component';
import { SigninButtonVisibleService } from './../../core/services/signin-btn-visibility.service';
import { RegisterTriggeredService } from './../../core/services/register-dialog-triggered.service';

@Component({
  selector: 'app-rvlm-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  showLanding = true;

  constructor(private registerUserDialog: MatDialog,
              private signinBtnVisibleSvc: SigninButtonVisibleService,
              private registerTriggeredSvc: RegisterTriggeredService) {
    }

  ngOnInit() {
    this.registerTriggeredSvc.registerTriggered$
      .subscribe(data => {
        this.registerUser();
      });
  }

  registerUser() {
    const registerConfig = new MatDialogConfig();

    registerConfig.autoFocus = true;
    registerConfig.position = {top: '20px'};
    registerConfig.ariaLabel = 'Register Dialog';
    registerConfig.hasBackdrop = false;
    // registerConfig.backdropClass = 'backdropBackground';
    registerConfig.disableClose = true;

    const dialogRef = this.registerUserDialog.open(RegisterDialogComponent, registerConfig);

    dialogRef.afterClosed()
      .subscribe({
        next: (val) => {
          if (val) {
            // trigger signin dialog?
          }
        }
      });
  }

  learnMore() {
    this.showLanding = false;  // activate learn more page
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(false);
  }

  toggleLanding(show: boolean) {
    this.showLanding = show;
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(true);
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
}
