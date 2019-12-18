import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RegisterDialogComponent } from './../../features/register-signin/register-dialog/register-dialog.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  showLanding = true;

  constructor(private registerDialog: MatDialog) {
    console.log( 'launched landing component');
  }

  ngOnInit() {
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
          console.log('dialog closed', val);
          if (val) {
          }
        }
      });
  }

  learnMore() {
    this.showLanding = false;  // activate learn more page
  }
}
