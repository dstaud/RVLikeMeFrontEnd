import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { fadeAnimation } from '@shared/animations';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss'],
  animations: [fadeAnimation]
})
export class CredentialsComponent implements OnInit {

  constructor(private router: Router,
              private location: Location) {}

  ngOnInit() {
    if (this.location.path() === '/credentials') {
      this.router.navigateByUrl('/credentials/change-password');
    }
  }

}
