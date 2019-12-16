import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

  constructor() {console.log( 'launched landing component'); }

  ngOnInit() {
  }

  signUp() {
    console.log('sign up');
  }

  learnMore() {
    console.log('learn more');
  }
}
