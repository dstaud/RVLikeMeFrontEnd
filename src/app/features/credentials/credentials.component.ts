import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss']
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
