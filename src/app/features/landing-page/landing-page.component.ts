import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RegisterDialogComponent } from './../../features/register-signin/register-dialog/register-dialog.component';
import { SigninVisibilityService } from './../../core/services/signin-visibility.service';
import { RegisterTriggeredService } from './../../core/services/register-triggered.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  showLanding = true;

  constructor(private registerDialog: MatDialog,
              private signinVisiblityService: SigninVisibilityService,
              private registerTriggeredService: RegisterTriggeredService,
              private router: Router) {
    }

  ngOnInit() {
    this.registerTriggeredService.registerTriggered$
      .subscribe(data => {
        this.signUp();
      })
  }

  signUp() {

    const registerConfig = new MatDialogConfig();

    registerConfig.autoFocus = true;
    registerConfig.position = {
      top: '20px'
    };
    registerConfig.ariaLabel = 'Register Dialog';
    registerConfig.hasBackdrop = false;
    // registerConfig.backdropClass = 'backdropBackground';
    registerConfig.disableClose = true;


    const dialogRef = this.registerDialog.open(RegisterDialogComponent, registerConfig);

    dialogRef.afterClosed()
      .subscribe({
        next: (val) => {
          if (val) {
          }
        }
      });
  }

  learnMore() {
    this.showLanding = false;  // activate learn more page
    this.signinVisiblityService.toggleSignin(false);
  }

  toggleLanding(show: boolean) {
    this.showLanding = show;
    this.signinVisiblityService.toggleSignin(true);
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
