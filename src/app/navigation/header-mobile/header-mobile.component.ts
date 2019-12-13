import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, NavigationEnd} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserAuthService } from './../../core/services/user-auth.service';

@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.scss']
})
export class HeaderMobileComponent implements OnInit {
  pageTitle: string;
  userAuthorized: boolean;

  constructor(private userAuth: UserAuthService,
              public translate$: TranslateService,
              private router: Router) {
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

  signIn() {
    console.log('sign in');
    this.userAuth.userAuthorized(true);
    this.userAuthorized = true;
    this.router.navigateByUrl('/home');
  }
}
