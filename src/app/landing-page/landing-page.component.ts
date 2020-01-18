import { Component, OnInit } from '@angular/core';
import { SigninButtonVisibleService } from './../core/services/signin-btn-visibility.service';
import { ActivateBackArrowService } from './../core/services/activate-back-arrow.service';
import { RegisterBtnVisibleService } from './../core/services/register-btn-visiblity.service';
import { Router } from '@angular/router';
// import { timingSafeEqual } from 'crypto';

@Component({
  selector: 'app-rvlm-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  showLanding = true;
  showLearnMore = false;
  showSignin = false;
  showRegisterUser = false;

  constructor(private signinBtnVisibleSvc: SigninButtonVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private registerBtnVisibleSvc: RegisterBtnVisibleService,
              private router: Router) {
    }

  ngOnInit() {
  }

  registerUser() {
    this.router.navigateByUrl('/register');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }

  learnMore() {
    this.showLanding = false;  // activate learn more page
    this.showLearnMore = true;
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(false);
    this.registerBtnVisibleSvc.toggleRegisterButtonVisible(true);
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

  toggleLanding(show: boolean) {
    this.showLanding = show;
    this.showLearnMore= false;
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
