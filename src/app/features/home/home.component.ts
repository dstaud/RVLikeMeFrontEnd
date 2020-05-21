import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { fadeAnimation } from '@shared/animations';

@Component({
  selector: 'app-rvlm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimation]
})
export class HomeComponent implements OnInit {

  constructor(private router: Router,
              private location: Location) { }

  ngOnInit() {
    if (this.location.path() === '/home') {
      this.router.navigateByUrl('/home/dashboard');
    }
  }
}
