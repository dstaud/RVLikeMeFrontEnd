import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ThemeService } from '@services/theme.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input('newMessageCount') newMessageCount: number;

  lightTheme = true;
  profile: IuserProfile;
  userAuthorized: boolean;
  profileImage = false;
  profileImageUrl = null;

  userProfile: Observable<IuserProfile>;

  @Output() public sidenavToggle = new EventEmitter();

  constructor(private router: Router,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private headerVisibleSvc: HeaderVisibleService,
              private themeSvc: ThemeService) { }

  ngOnInit() {
    this.router.events
    .pipe(untilComponentDestroyed(this))
    .subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          // this.setTitleOnRouteChange();
        }
      }
    });

    this.userProfile = this.profileSvc.profile;

    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
      if (this.profile.colorThemePreference === 'light-theme') {
        this.lightTheme = true;
      } else {
        this.lightTheme = false;
      }
      if (this.profile.profileImageUrl) {
        this.profileImageUrl = this.profile.profileImageUrl;
        this.profileImage = true;
      }
    }, (error) => {
      console.error(error);
    });

    // Listen for changes in user authorization state
    this.authSvc.userAuth$
      .pipe(untilComponentDestroyed(this))
      .subscribe(authData => {
        this.userAuthorized = authData.valueOf();
      });


    // If user leaves the page but returns (back on browser, bookmark), and auth token is still valid, return to state
    if (this.authSvc.isLoggedIn()) {
      this.authSvc.setUserToAuthorized(true);
    }
  }

  ngOnDestroy() {}

  changeProfileImage() {
    this.router.navigateByUrl('/profile/personal');
    this.activateBackArrowSvc.setBackRoute('/profile/main');
  }


  updateProfile() {
    this.router.navigateByUrl('/profile/main');
    this.activateBackArrowSvc.setBackRoute('home/dashboard');
  }


  changePassword() {
    this.router.navigateByUrl('/credentials/change-password');
    this.activateBackArrowSvc.setBackRoute('/home/dashboard');
  }


  changeUsername() {
    this.router.navigateByUrl('/credentials/change-username');
    this.activateBackArrowSvc.setBackRoute('/home/dashboard');
  }


  logout() {
    this.authSvc.logout();
    this.profileSvc.dispose();
    this.authSvc.setUserToAuthorized(false);
    this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
    this.router.navigateByUrl('/');
  }


  selectTheme(theme: string) {
    this.lightTheme = !this.lightTheme;

    this.themeSvc.setGlobalColorTheme(theme);
    this.profile.colorThemePreference = theme;
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      console.log('update color theme response = ', responseData);
      // this.profileSvc.distributeProfileUpdate(this.profile);
    }, error => {
      console.log('HeaderComponent:selectTheme: throw error ', error);
      throw new Error(error);
    });
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
