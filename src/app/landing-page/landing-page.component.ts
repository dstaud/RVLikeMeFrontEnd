import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
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
  landingImage: string;
  imageNbr: number;

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private headerVisibleSvc: HeaderVisibleService,
              private router: Router) {
}

  ngOnInit() {
    this.imageNbr = Math.floor(Math.random() * 3) + 1;
    this.landingImage = 'landing-image' + this.imageNbr + '.jpeg';
    this.headerVisibleSvc.toggleSigninButtonVisible(false);
  }

  registerUser() {
    this.router.navigateByUrl('/register');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }

  learnMore() {
    this.router.navigateByUrl('/learn-more');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }

  signIn() {
    this.router.navigateByUrl('/signin');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }

/*   toggleRegisterUser(show: boolean) {
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
  } */
}
