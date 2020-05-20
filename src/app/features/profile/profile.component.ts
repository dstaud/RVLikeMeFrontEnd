import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { fadeAnimation } from '@shared/animations';

@Component({
  selector: 'app-rvlm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [fadeAnimation]
})
export class ProfileComponent implements OnInit {

  constructor(private router: Router,
              private location: Location) {}

  ngOnInit() {
    if (this.location.path() === '/profile') {
      this.router.navigateByUrl('/profile/main');
    }
  }

}
