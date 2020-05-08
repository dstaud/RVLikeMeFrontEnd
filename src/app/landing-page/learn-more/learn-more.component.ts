import { Component, OnInit, HostListener } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

import { HeaderVisibleService } from '@services/header-visibility.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-rvlm-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.scss']
})
export class LearnMoreComponent implements OnInit {
  landingImage: string;
  maxRvImageHeight = 'auto';
  maxRvImageWidth = '100%';
  containerDesktop: boolean = false;

  private windowWidth: number;
  private landingImageNbr: number;

  // Get window size to determine how to present register, signon and learn more
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setImageBasedOnScreenWidth();
  }

  constructor(private headerVisibleSvc: HeaderVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private route: ActivatedRoute,
              private shareDataSvc: ShareDataService,
              private router: Router) {

              let params: any;

              if (this.shareDataSvc.getData()) {
                params = JSON.parse(this.shareDataSvc.getData());
                console.log('LearnMoreComponent:ngOnInit: params= ', params)
                this.containerDesktop = params.desktop;
                console.log('LearnMoreComponent:ngOnInit: set containerDesktop to ', this.containerDesktop)
              } else {
                if (window.innerWidth > 600) {
                  this.containerDesktop = true;
                } else {
                  this.headerVisibleSvc.toggleHeaderVisible(true);
                  this.activateBackArrowSvc.setBackRoute('landing-page');
                }
              }

  }

  ngOnInit() {

    // Randomly pick one of 3 landing page RV images
    this.landingImageNbr = Math.floor(Math.random() * 3) + 1;

    this.setImageBasedOnScreenWidth();
  }

  registerUser() {
    this.headerVisibleSvc.toggleHeaderVisible(true);
    this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
    this.router.navigateByUrl('/register');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }

  private setImageBasedOnScreenWidth() {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth > 600) {
      this.landingImage = 'landing-image' + this.landingImageNbr + '.jpeg';
    } else {
      this.landingImage = 'landing-imageM' + this.landingImageNbr + '.jpeg';
    }
  }
}
