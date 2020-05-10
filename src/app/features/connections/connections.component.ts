import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rvlm-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss']
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
