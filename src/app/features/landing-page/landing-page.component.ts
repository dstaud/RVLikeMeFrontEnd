import { Component, OnInit } from '@angular/core';
import { ShowFooterService } from './../../core/services/show-footer.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

  constructor(private showFooter: ShowFooterService) {
                console.log('launched landing component');
              }

  ngOnInit() {
    this.showFooter.activateFooter(false);
  }

  signUp() {
    console.log('sign up');
  }

  learnMore() {
    console.log('learn more');
  }
}
