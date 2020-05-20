import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { fadeAnimation } from '@shared/animations';

@Component({
  selector: 'app-rvlm-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
  animations: [fadeAnimation]
})
export class ConnectionsComponent implements OnInit {

  constructor(private location: Location,
              private router: Router) {}

  ngOnInit() {
    if(this.location.path() === '/connections') {
      this.router.navigateByUrl('/connections/main');
    }
  }

}
