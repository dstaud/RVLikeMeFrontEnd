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
  userAuthorized$: Observable<boolean>;
  userAuthorized = false;

  constructor(private userAuthService: UserAuthService,
              private translateService: TranslateService,
              private router: Router,
              private signInDialog: MatDialog) {
  }

  ngOnInit() {
    this.router.events
    .subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          this.setTitleOnRouteChange();
        }
      }
    });
    this.userAuthService.userAuth$
      .subscribe(authData => {
        this.userAuthorized = authData.valueOf();
      });
  }

  setTitleOnRouteChange(): void {
    if (this.router.url.includes('home')) {
     this.pageTitle = this.translateService.instant('home.component.header');
    } else {
      if (this.router.url.includes('forums')) {
        this.pageTitle = this.translateService.instant('forums.component.header');
      } else {
        if (this.router.url.includes('messages')) {
          this.pageTitle = this.translateService.instant('messages.component.header');
        } else {
          if (this.router.url.includes('connections')) {
            this.pageTitle = this.translateService.instant('connections.component.header');
          } else {
            if (this.router.url.includes('settings')) {
              this.pageTitle = this.translateService.instant('settings.component.header');
            } else {
              if (this.router.url.includes('about')) {
                this.pageTitle = this.translateService.instant('about.component.header');
              } else {
                if (this.router.url.includes('profile')) {
                  this.pageTitle = this.translateService.instant('profile.component.header');
                } else {
                  if (this.router.url.includes('')) {
                    this.pageTitle = this.translateService.instant('Home');
                  }
                }
              }
            }
          }
        }
      }
    }
  }

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
          console.log('user=', val.userID);
          console.log('password=', val.password);
          if (val) {
            this.userAuthService.userAuthorized(true);
            this.router.navigateByUrl('/home');
          }
        }
      });
    }
}
