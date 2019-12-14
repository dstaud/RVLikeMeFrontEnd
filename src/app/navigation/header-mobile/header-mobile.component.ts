import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router, NavigationEnd} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserAuthService } from './../../core/services/user-auth.service';
import { SigninDialogComponent } from './../../features/signin-dialog/signin-dialog.component';


@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.scss']
})
export class HeaderMobileComponent implements OnInit {
  pageTitle: string;
  // userAuthorized: boolean;
  userAuthorized = false;

  constructor(private userAuth: UserAuthService,
              public translate$: TranslateService,
              private router: Router,
              private signInDialog: MatDialog) {
    router.events
      .subscribe({
        next: (event) => {
          if (event instanceof NavigationEnd) {
            this.setTitleOnRouteChange();
          }
        }
    });
    // router.events.subscribe( (event) => {
      // ( event instanceof NavigationEnd ) && this.setTitleOnRouteChange());
  }

  ngOnInit() {
  }

  setTitleOnRouteChange = () => {
    if (this.router.url.includes('home')) {
     this.pageTitle = this.translate$.instant('home.component.header');
    } else {
      if (this.router.url.includes('forums')) {
        this.pageTitle = this.translate$.instant('forums.component.header');
      } else {
        if (this.router.url.includes('messages')) {
          this.pageTitle = this.translate$.instant('messages.component.header');
        } else {
          if (this.router.url.includes('connections')) {
            this.pageTitle = this.translate$.instant('connections.component.header');
          } else {
            if (this.router.url.includes('settings')) {
              this.pageTitle = this.translate$.instant('settings.component.header');
            } else {
              if (this.router.url.includes('about')) {
                this.pageTitle = this.translate$.instant('about.component.header');
              } else {
                if (this.router.url.includes('profile')) {
                  this.pageTitle = this.translate$.instant('profile.component.header');
                } else {
                  if (this.router.url.includes('')) {
                    this.pageTitle = this.translate$.instant('Home');
                  }
                }
              }
            }
          }
        }
      }
    }
  }

/*   signIn() {
    console.log('sign in');
    this.userAuth.userAuthorized(true);
    this.userAuthorized = true;
    this.router.navigateByUrl('/home');
  } */
  signIn() {

    const signinConfig = new MatDialogConfig();

    signinConfig.autoFocus = true;
    signinConfig.hasBackdrop = false;
    signinConfig.position = {
      top: '60px'
    };
    signinConfig.ariaLabel = 'Sign In Dialog';

    const dialogRef = this.signInDialog.open(SigninDialogComponent, signinConfig);

    dialogRef.afterClosed()
      .subscribe({
        next: (val) => {
          console.log('dialog closed', val);
          if (val) {
            this.userAuth.userAuthorized(true);
            this.userAuthorized = true;
            this.router.navigateByUrl('/home');
          }
        }
      });
    }
}
