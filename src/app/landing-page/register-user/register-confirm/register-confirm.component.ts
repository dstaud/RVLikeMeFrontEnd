import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@services/data-services/authentication.service';

@Component({
  selector: 'app-register-confirm',
  templateUrl: './register-confirm.component.html',
  styleUrls: ['./register-confirm.component.scss']
})
export class RegisterConfirmComponent implements OnInit {
  registerConfirmUserCode: string;
  landingImage: string;
  maxRvImageHeight = 'auto';
  maxRvImageWidth = '100%';

  private windowWidth: number;

  // Get window size to determine how to present register, signon and learn more
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setImageBasedOnScreenWidth();
  }

  constructor(private route: ActivatedRoute,
              private authSvc: AuthenticationService) {

      this.route.queryParams
      .subscribe(params => {
        this.registerConfirmUserCode = params['e'];
      });
  }

  ngOnInit(): void {
    this.setImageBasedOnScreenWidth();

    this.activateUser();
  }


  private activateUser() {
    console.log('RegisterConfirmComponent:activateUser: confirm code =', this.registerConfirmUserCode);
    this.authSvc.activateUser(this.registerConfirmUserCode)
    .subscribe(activateResult => {
      console.log('RegisterConfirmComponent:activateUser: result=', activateResult);
    }, error => {
      console.log('RegisterConfirmComponent:activateUser: error=', error);
      throw new Error(error);
    });
  }


  private setImageBasedOnScreenWidth() {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth > 600) {
      this.landingImage = 'landing-image1.jpeg';
    } else {
      this.landingImage = 'landing-imageM1.jpeg';
    }
  }
}
