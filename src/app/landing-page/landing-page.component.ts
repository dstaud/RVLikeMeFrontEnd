import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SigninButtonVisibleService } from './../core/services/signin-btn-visibility.service';
import { RegisterBtnVisibleService } from './../core/services/register-btn-visiblity.service';
import { ActivateBackArrowService } from './../core/services/activate-back-arrow.service';
// import { timingSafeEqual } from 'crypto';

@Component({
  selector: 'app-rvlm-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  showLanding = true;
  showSignin = false;
  showLearnMore = false;
  showRegisterUser = false;

  constructor(private signinBtnVisibleSvc: SigninButtonVisibleService,
              private registerBtnVisibleSvc: RegisterBtnVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) {
}

  ngOnInit() {
  }

  registerUser() {
    this.router.navigateByUrl('/register');
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(false);
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }

  learnMore() {
    this.router.navigateByUrl('/learn-more');
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(false);
    this.registerBtnVisibleSvc.toggleRegisterButtonVisible(true);
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }

  toggleRegisterUser(show: boolean) {
    this.showRegisterUser = show;
    this.showLanding = true;
    this.showLearnMore = false;
    this.showSignin = false;
  }

  toggleSignin(show: boolean) {
    this.showSignin = show;
    this.showLanding = true;
    this.showLearnMore = false;
    this.showRegisterUser = false;
  }

  toggleLearnMore(show: boolean) {
    this.showLearnMore = show;
    this.showLanding = true;
    this.showSignin = false;
    this.showRegisterUser = true;
  }

  toggleLanding(show: boolean) {
    this.showLanding = show;
    this.showLearnMore = false;
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(true);
/*     window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    }); */
  }
}
